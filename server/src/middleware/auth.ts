// ============================================
// CanSat Astra Maven — JWT Auth Middleware
// ============================================

import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@cansat/shared';
import { authService } from '../services/auth.service.js';

/**
 * Payload embedded in every verified JWT.
 */
export interface JWTPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
}

// Extend Express Request to carry authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware that requires a valid access token in the Authorization header.
 * Attaches the decoded payload to `req.user`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7); // strip "Bearer "

  authService
    .verifyAccessToken(token)
    .then((payload) => {
      req.user = payload as JWTPayload;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}

/**
 * Middleware factory that restricts access to specific roles.
 * Must be used AFTER `requireAuth`.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
