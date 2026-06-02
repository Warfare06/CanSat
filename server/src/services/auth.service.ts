// ============================================
// CanSat Astra Maven — Auth Service (jose JWT)
// ============================================

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { JWTPayload } from '../middleware/auth.js';
import type { UserRole } from '@cansat/shared';

const SALT_ROUNDS = 12;

// Encode secrets as Uint8Array for jose
const accessSecretKey = new TextEncoder().encode(config.jwt.accessSecret);
const refreshSecretKey = new TextEncoder().encode(config.jwt.refreshSecret);

/**
 * Parse an expiry string like "15m" or "7d" into seconds.
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 min
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900;
  }
}

class AuthService {
  /**
   * Hash a plaintext password.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare a plaintext password against a hash.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a signed JWT access token (short-lived).
   */
  async generateAccessToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ email: payload.email, role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(config.jwt.accessExpiry)
      .setIssuer('cansat-astra-maven')
      .sign(accessSecretKey);
  }

  /**
   * Generate an opaque refresh token and store it in the database.
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + parseExpiry(config.jwt.refreshExpiry) * 1000,
    );

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Verify an access token and return its payload.
   */
  async verifyAccessToken(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, accessSecretKey, {
      issuer: 'cansat-astra-maven',
    });

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  }

  /**
   * Rotate a refresh token: validate the old one, revoke it, and issue a new pair.
   * This implements refresh token rotation for security.
   */
  async rotateRefreshToken(oldToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      // If a revoked token is reused, revoke ALL tokens for that user (potential theft)
      if (stored?.revoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: stored.userId },
          data: { revoked: true },
        });
      }
      throw new AppError('Invalid refresh token', 401);
    }

    // Revoke the old token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = stored.user;
    const jwtPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(jwtPayload),
      this.generateRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as UserRole,
      },
    };
  }

  /**
   * Revoke all refresh tokens for a user (logout everywhere).
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  /**
   * Clean up expired refresh tokens (call periodically).
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true, createdAt: { lt: new Date(Date.now() - 7 * 86400 * 1000) } },
        ],
      },
    });
    return result.count;
  }

  /**
   * Ensure a default admin user exists on first startup.
   */
  async ensureAdminUser(): Promise<void> {
    const existing = await prisma.user.findUnique({
      where: { email: config.admin.email },
    });

    if (!existing) {
      const hash = await this.hashPassword(config.admin.password);
      await prisma.user.create({
        data: {
          email: config.admin.email,
          username: 'admin',
          passwordHash: hash,
          role: 'ADMIN',
        },
      });
      console.log(`[AUTH] Default admin user created: ${config.admin.email}`);
    }
  }
}

export const authService = new AuthService();
