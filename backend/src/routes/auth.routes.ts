import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { signAccessToken, signRefreshToken, verifyRefreshToken, authenticate } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  login_id: z.string().min(1),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

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
      `SELECT user_id, login_id, display_name, role_code, branch_id, status, password_hash
       FROM user_master WHERE login_id = $1 AND deleted_flag = false`,
      [login_id],
    );
    if (!rows.length) return fail(res, 'Invalid credentials', 401);
    const user = rows[0];
    if (user.status !== 'Active') return fail(res, 'User account is not active', 403);
    if (!user.password_hash) return fail(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return fail(res, 'Invalid credentials', 401);

    const authUser = {
      user_id: user.user_id,
      login_id: user.login_id,
      role_code: user.role_code,
      branch_id: user.branch_id,
    };
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);
    const refreshHash = await bcrypt.hash(refreshToken, 8);

    await pool.query(`UPDATE user_master SET refresh_token_hash = $1, last_login_at = now() WHERE user_id = $2`, [
      refreshHash,
      user.user_id,
    ]);

    return ok(res, {
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        login_id: user.login_id,
        display_name: user.display_name,
        role_code: user.role_code,
        branch_id: user.branch_id,
      },
    });
  } catch (err: any) {
    return fail(res, err.message || 'Login failed', 500);
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
      `SELECT user_id, login_id, display_name, mobile_no, email, role_code, branch_id, status
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
