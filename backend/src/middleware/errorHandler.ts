import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/envelope';

export function notFoundHandler(req: Request, res: Response) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  const status = err.statusCode || 500;
  return fail(res, err.message || 'Internal server error', status);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
