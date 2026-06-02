// ============================================
// CanSat Astra Maven — Rate Limiting
// ============================================

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per 15-minute window.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/**
 * Stricter limiter for auth endpoints — 10 requests per 15-minute window.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

/**
 * Contact form limiter — 5 submissions per hour.
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions, please try again later.' },
});
