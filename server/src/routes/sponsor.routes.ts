// ============================================
// CanSat Astra Maven — Sponsor Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createSponsorSchema, updateSponsorSchema } from '../utils/validation.js';

const router = Router();

// --- GET /sponsors ---  (public)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: [
        { tier: 'asc' },  // PLATINUM first
        { name: 'asc' },
      ],
    });
    res.json({ sponsors });
  } catch (err) {
    next(err);
  }
});

// --- GET /sponsors/:id ---  (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sponsor = await prisma.sponsor.findUnique({ where: { id: req.params.id } });
    if (!sponsor) throw new AppError('Sponsor not found', 404);
    res.json({ sponsor });
  } catch (err) {
    next(err);
  }
});

// --- POST /sponsors ---  (admin only)
router.post('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSponsorSchema.parse(req.body);
    const sponsor = await prisma.sponsor.create({ data });
    res.status(201).json({ sponsor });
  } catch (err) {
    next(err);
  }
});

// --- PUT /sponsors/:id ---  (admin only)
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSponsorSchema.parse(req.body);
    const existing = await prisma.sponsor.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Sponsor not found', 404);

    const sponsor = await prisma.sponsor.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ sponsor });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /sponsors/:id ---  (admin only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.sponsor.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Sponsor not found', 404);

    await prisma.sponsor.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: 'Sponsor removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
