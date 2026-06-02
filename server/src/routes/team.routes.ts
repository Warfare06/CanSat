// ============================================
// CanSat Astra Maven — Team Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createTeamMemberSchema, updateTeamMemberSchema } from '../utils/validation.js';

const router = Router();

// --- GET /team ---  (public)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

// --- GET /team/:id ---  (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!member) throw new AppError('Team member not found', 404);
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// --- POST /team ---  (admin only)
router.post('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTeamMemberSchema.parse(req.body);
    const member = await prisma.teamMember.create({ data });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

// --- PUT /team/:id ---  (admin only)
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTeamMemberSchema.parse(req.body);
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Team member not found', 404);

    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /team/:id ---  (admin only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Team member not found', 404);

    await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: 'Team member removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
