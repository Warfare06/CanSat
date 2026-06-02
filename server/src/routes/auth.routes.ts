// ============================================
// CanSat Astra Maven — Auth Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { authService } from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';
import { loginSchema, registerSchema, refreshTokenSchema } from '../utils/validation.js';
import type { UserRole } from '@cansat/shared';

const router = Router();

// --- POST /auth/login ---
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await authService.comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      authService.generateAccessToken(jwtPayload),
      authService.generateRefreshToken(user.id),
    ]);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /auth/register ---
router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new AppError(
        existing.email === email ? 'Email already registered' : 'Username already taken',
        409,
      );
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, role: 'VIEWER' },
    });

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      authService.generateAccessToken(jwtPayload),
      authService.generateRefreshToken(user.id),
    ]);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /auth/refresh ---
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.rotateRefreshToken(refreshToken);

    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /auth/logout ---
router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.revokeAllTokens(req.user!.sub);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// --- GET /auth/me ---
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    if (!user) throw new AppError('User not found', 404);

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
