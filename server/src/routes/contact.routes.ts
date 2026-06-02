// ============================================
// CanSat Astra Maven — Contact Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';
import { contactSchema } from '../utils/validation.js';

const router = Router();

// --- POST /contact ---  (public — rate-limited)
router.post('/', contactLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = contactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({ data });
    res.status(201).json({ message: 'Message sent successfully', id: message.id });
  } catch (err) {
    next(err);
  }
});

// --- GET /contact ---  (admin only — list all messages)
router.get('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const unreadOnly = req.query.unread === 'true';

    const where = unreadOnly ? { read: false } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({
      messages,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// --- PUT /contact/:id/read ---  (admin only — mark as read)
router.put('/:id/read', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Message not found', 404);

    await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /contact/:id ---  (admin only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Message not found', 404);

    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
