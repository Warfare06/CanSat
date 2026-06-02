// ============================================
// CanSat Astra Maven — Global Error Handler
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/index.js';

/**
 * Custom application error with status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Express global error handling middleware.
 * Catches all errors thrown in route handlers and services.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Unknown / unexpected errors
  console.error('[ERROR] Unhandled error:', err);

  res.status(500).json({
    error: config.isDev ? err.message : 'Internal server error',
    ...(config.isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler — must be registered after all routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
}
