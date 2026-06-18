import { Response } from 'express';

export interface Envelope<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown[] | null;
  timestamp: string;
}

export function ok<T>(res: Response, data: T, message = 'OK', status = 200) {
  const body: Envelope<T> = {
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(body);
}

export function fail(res: Response, message: string, status = 400, errors: unknown[] | null = null) {
  const body: Envelope<null> = {
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(body);
}
