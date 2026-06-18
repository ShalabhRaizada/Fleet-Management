import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../utils/envelope';
import { config } from '../config';

export interface AuthUser {
  user_id: string;
  login_id: string;
  role_code: string;
  branch_id: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
}

export function signRefreshToken(user: Pick<AuthUser, 'user_id'>) {
  return jwt.sign({ user_id: user.user_id, type: 'refresh' }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn as any,
  });
}

/** @deprecated use signAccessToken */
export function signToken(user: AuthUser) {
  return signAccessToken(user);
}

export function verifyRefreshToken(token: string): { user_id: string } {
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (decoded.type !== 'refresh') throw new Error('Not a refresh token');
  return decoded;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Missing or invalid Authorization header', 401);
  }
  const token = header.substring('Bearer '.length);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    return next();
  } catch (err) {
    return fail(res, 'Invalid or expired token', 401);
  }
}

/** Role-based access guard. Pass role codes allowed to access the route. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, 'Not authenticated', 401);
    if (roles.length === 0) return next();
    if (!roles.includes(req.user.role_code)) {
      return fail(res, 'Forbidden: insufficient role privileges', 403);
    }
    return next();
  };
}
