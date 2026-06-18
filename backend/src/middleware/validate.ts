import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { fail } from '../utils/envelope';

/** Validates req.body against a zod schema; on success replaces req.body with parsed data. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return fail(res, 'Validation failed', 422, result.error.issues);
    }
    req.body = result.data;
    return next();
  };
}
