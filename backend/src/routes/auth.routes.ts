import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { signAccessToken, signRefreshToken, verifyRefreshToken, authenticate } from '../middleware/auth';
import { config } from '../config';

const router = Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MFA_TEMP_TOKEN_EXPIRES_IN = '5m';
const MFA_ISSUER = 'Fleet Management System';

const loginSchema = z.object({
  login_id: z.string().min(1),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const mfaVerifySetupSchema = z.object({
  code: z.string().min(1),
});

const mfaDisableSchema = z.object({
  currentPassword: z.string().min(1),
});

const mfaLoginVerifySchema = z.object({
  tempToken: z.string().min(1),
  code: z.string().min(1),
});

interface MfaTempTokenClaims {
  purpose: 'mfa';
  userId: string;
}

function signMfaTempToken(userId: string): string {
  const claims: MfaTempTokenClaims = { purpose: 'mfa', userId };
  return jwt.sign(claims, config.jwtSecret, { expiresIn: MFA_TEMP_TOKEN_EXPIRES_IN as any });
}

function verifyMfaTempToken(token: string): MfaTempTokenClaims {
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (decoded.purpose !== 'mfa' || !decoded.userId) throw new Error('Not a valid MFA temp token');
  return decoded;
}

/**
 * Finalizes a successful authentication: issues access + refresh tokens,
 * persists the refresh token hash, resets lockout counters, and records
 * last_login_at. Shared by both the direct password login flow and the
 * MFA login-verify flow so token issuance never has two implementations.
 */
async function issueLoginSuccess(user: {
  user_id: string;
  login_id: string;
  display_name: string;
  role_code: string;
  branch_id: string | null;
}) {
  const authUser = {
    user_id: user.user_id,
    login_id: user.login_id,
    role_code: user.role_code,
    branch_id: user.branch_id,
  };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  const refreshHash = await bcrypt.hash(refreshToken, 8);

  await pool.query(
    `UPDATE user_master
     SET refresh_token_hash = $1, last_login_at = now(), failed_login_attempts = 0, locked_until = NULL
     WHERE user_id = $2`,
    [refreshHash, user.user_id],
  );

  return {
    accessToken,
    refreshToken,
    user: {
      user_id: user.user_id,
      login_id: user.login_id,
      display_name: user.display_name,
      role_code: user.role_code,
      branch_id: user.branch_id,
    },
  };
}

/**
 * Records a failed authentication attempt (used for both wrong-password and
 * wrong-MFA-code failures - see design note on the login-verify route for why
 * these share the same counter). Locks the account once the threshold is hit.
 */
async function recordFailedAttempt(userId: string, currentAttempts: number): Promise<{ locked: boolean }> {
  const attempts = (currentAttempts || 0) + 1;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    await pool.query(
      `UPDATE user_master SET failed_login_attempts = $1, locked_until = now() + interval '${LOCKOUT_MINUTES} minutes' WHERE user_id = $2`,
      [attempts, userId],
    );
    return { locked: true };
  }
  await pool.query(`UPDATE user_master SET failed_login_attempts = $1 WHERE user_id = $2`, [attempts, userId]);
  return { locked: false };
}

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and receive JWT access + refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_id: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login success }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid request body', 400, parsed.error.issues);
  const { login_id, password } = parsed.data;
  try {
    const { rows } = await pool.query(
      `SELECT user_id, login_id, display_name, role_code, branch_id, status, password_hash,
              failed_login_attempts, locked_until, mfa_enabled
       FROM user_master WHERE login_id = $1 AND deleted_flag = false`,
      [login_id],
    );
    if (!rows.length) return fail(res, 'Invalid credentials', 401);
    const user = rows[0];
    if (user.status !== 'Active') return fail(res, 'User account is not active', 403);

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return fail(
        res,
        'Account is temporarily locked due to repeated failed login attempts. Please try again later.',
        423,
      );
    }

    if (!user.password_hash) return fail(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const { locked } = await recordFailedAttempt(user.user_id, user.failed_login_attempts);
      if (locked) {
        return fail(
          res,
          'Account locked due to repeated failed login attempts. Please try again in 15 minutes.',
          423,
        );
      }
      return fail(res, 'Invalid credentials', 401);
    }

    // MFA-enabled accounts must not receive final tokens yet: hand back a
    // short-lived temp token that only the /mfa/login-verify route accepts.
    if (user.mfa_enabled) {
      const tempToken = signMfaTempToken(user.user_id);
      return ok(res, { mfaRequired: true, tempToken });
    }

    const result = await issueLoginSuccess(user);
    return ok(res, result);
  } catch (err: any) {
    return fail(res, err.message || 'Login failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/mfa/setup:
 *   post:
 *     summary: Generate a new TOTP secret for the authenticated user (not yet enabled)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: TOTP secret and otpauth URI generated }
 */
router.post('/mfa/setup', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT user_id, login_id, email FROM user_master WHERE user_id = $1 AND deleted_flag = false`,
      [req.user!.user_id],
    );
    if (!rows.length) return fail(res, 'User not found', 404);
    const user = rows[0];

    const secret = authenticator.generateSecret();
    await pool.query(`UPDATE user_master SET mfa_secret = $1 WHERE user_id = $2`, [secret, user.user_id]);

    const accountName = user.email || user.login_id;
    const otpauthUri = authenticator.keyuri(accountName, MFA_ISSUER, secret);

    return ok(res, { secret, otpauthUri });
  } catch (err: any) {
    return fail(res, err.message || 'MFA setup failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/mfa/verify-setup:
 *   post:
 *     summary: Verify a 6-digit TOTP code and enable MFA for the authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *     responses:
 *       200: { description: MFA enabled }
 *       400: { description: Invalid code }
 */
router.post('/mfa/verify-setup', authenticate, async (req: Request, res: Response) => {
  const parsed = mfaVerifySetupSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid request body', 400, parsed.error.issues);
  try {
    const { rows } = await pool.query(`SELECT mfa_secret FROM user_master WHERE user_id = $1 AND deleted_flag = false`, [
      req.user!.user_id,
    ]);
    if (!rows.length || !rows[0].mfa_secret) {
      return fail(res, 'No MFA setup in progress. Call /mfa/setup first.', 400);
    }
    const isValid = authenticator.verify({ token: parsed.data.code, secret: rows[0].mfa_secret });
    if (!isValid) return fail(res, 'Invalid MFA code', 400);

    await pool.query(`UPDATE user_master SET mfa_enabled = true WHERE user_id = $1`, [req.user!.user_id]);
    return ok(res, null, 'MFA enabled');
  } catch (err: any) {
    return fail(res, err.message || 'MFA verification failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/mfa/disable:
 *   post:
 *     summary: Disable MFA for the authenticated user after re-confirming their password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *     responses:
 *       200: { description: MFA disabled }
 *       401: { description: Incorrect password }
 */
router.post('/mfa/disable', authenticate, async (req: Request, res: Response) => {
  const parsed = mfaDisableSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid request body', 400, parsed.error.issues);
  try {
    const { rows } = await pool.query(`SELECT password_hash FROM user_master WHERE user_id = $1 AND deleted_flag = false`, [
      req.user!.user_id,
    ]);
    if (!rows.length || !rows[0].password_hash) return fail(res, 'Incorrect password', 401);

    const valid = await bcrypt.compare(parsed.data.currentPassword, rows[0].password_hash);
    if (!valid) return fail(res, 'Incorrect password', 401);

    await pool.query(`UPDATE user_master SET mfa_enabled = false, mfa_secret = NULL WHERE user_id = $1`, [
      req.user!.user_id,
    ]);
    return ok(res, null, 'MFA disabled');
  } catch (err: any) {
    return fail(res, err.message || 'MFA disable failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/mfa/login-verify:
 *   post:
 *     summary: Complete login by verifying a TOTP code after password authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tempToken: { type: string }
 *               code: { type: string }
 *     responses:
 *       200: { description: Login success }
 *       400: { description: Invalid or expired temp token }
 *       401: { description: Invalid MFA code }
 *       423: { description: Account locked due to repeated failed MFA attempts }
 */
router.post('/mfa/login-verify', async (req: Request, res: Response) => {
  const parsed = mfaLoginVerifySchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid request body', 400, parsed.error.issues);
  try {
    let claims: MfaTempTokenClaims;
    try {
      claims = verifyMfaTempToken(parsed.data.tempToken);
    } catch {
      return fail(res, 'Invalid or expired MFA session. Please log in again.', 400);
    }

    const { rows } = await pool.query(
      `SELECT user_id, login_id, display_name, role_code, branch_id, status, mfa_secret, mfa_enabled,
              failed_login_attempts, locked_until
       FROM user_master WHERE user_id = $1 AND deleted_flag = false`,
      [claims.userId],
    );
    if (!rows.length) return fail(res, 'Invalid credentials', 401);
    const user = rows[0];
    if (user.status !== 'Active') return fail(res, 'User account is not active', 403);

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return fail(
        res,
        'Account is temporarily locked due to repeated failed login attempts. Please try again later.',
        423,
      );
    }

    if (!user.mfa_enabled || !user.mfa_secret) return fail(res, 'MFA is not enabled for this account', 400);

    const isValid = authenticator.verify({ token: parsed.data.code, secret: user.mfa_secret });
    if (!isValid) {
      // Design choice: wrong MFA codes share the same failed_login_attempts/
      // locked_until counter as wrong passwords. A wrong MFA code is just
      // another way to fail to authenticate as this account, and reusing the
      // existing counter keeps lockout semantics (5 attempts -> 15 min lock)
      // consistent everywhere instead of introducing a second, parallel
      // lockout mechanism that callers/tests would need to reason about.
      const { locked } = await recordFailedAttempt(user.user_id, user.failed_login_attempts);
      if (locked) {
        return fail(
          res,
          'Account locked due to repeated failed login attempts. Please try again in 15 minutes.',
          423,
        );
      }
      return fail(res, 'Invalid MFA code', 401);
    }

    const result = await issueLoginSuccess(user);
    return ok(res, result);
  } catch (err: any) {
    return fail(res, err.message || 'MFA login verification failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'refreshToken is required', 400, parsed.error.issues);
  try {
    const decoded = verifyRefreshToken(parsed.data.refreshToken);
    const { rows } = await pool.query(`SELECT * FROM user_master WHERE user_id = $1 AND deleted_flag = false`, [
      decoded.user_id,
    ]);
    if (!rows.length || !rows[0].refresh_token_hash) return fail(res, 'Invalid refresh token', 401);
    if (rows[0].status !== 'Active') return fail(res, 'User account is not active', 403);
    const matches = await bcrypt.compare(parsed.data.refreshToken, rows[0].refresh_token_hash);
    if (!matches) return fail(res, 'Invalid refresh token', 401);

    const accessToken = signAccessToken({
      user_id: rows[0].user_id,
      login_id: rows[0].login_id,
      role_code: rows[0].role_code,
      branch_id: rows[0].branch_id,
    });
    return ok(res, { accessToken });
  } catch {
    return fail(res, 'Invalid or expired refresh token', 401);
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Invalidate the current refresh token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    await pool.query(`UPDATE user_master SET refresh_token_hash = NULL WHERE user_id = $1`, [req.user!.user_id]);
    return ok(res, null, 'Logged out');
  } catch (err: any) {
    return fail(res, err.message || 'Logout failed', 500);
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user profile }
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT user_id, login_id, display_name, mobile_no, email, role_code, branch_id, status, mfa_enabled
       FROM user_master WHERE user_id = $1 AND deleted_flag = false`,
      [req.user!.user_id],
    );
    if (!rows.length) return fail(res, 'User not found', 404);
    return ok(res, rows[0]);
  } catch (err: any) {
    return fail(res, err.message || 'Failed', 500);
  }
});

export default router;
