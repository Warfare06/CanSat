// ============================================
// CanSat Astra Maven — Mission Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createMissionSchema, updateMissionSchema } from '../utils/validation.js';
import { socketService } from '../services/socket.service.js';
import { mockDataService } from '../services/mockData.service.js';
import type { MissionStatus } from '@cansat/shared';

const router = Router();

// --- GET /missions ---  (public)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { telemetry: true } },
      },
    });

    res.json({ missions });
  } catch (err) {
    next(err);
  }
});

// --- GET /missions/:id ---  (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mission = await prisma.mission.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { telemetry: true } },
      },
    });

    if (!mission) throw new AppError('Mission not found', 404);
    res.json({ mission });
  } catch (err) {
    next(err);
  }
});

// --- POST /missions ---  (admin only)
router.post('/', requireAuth, requireRole('ADMIN', 'OPERATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createMissionSchema.parse(req.body);

    const mission = await prisma.mission.create({
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        createdBy: req.user!.sub,
      },
    });

    res.status(201).json({ mission });
  } catch (err) {
    next(err);
  }
});

// --- PUT /missions/:id ---  (admin only)
router.put('/:id', requireAuth, requireRole('ADMIN', 'OPERATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateMissionSchema.parse(req.body);

    const existing = await prisma.mission.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Mission not found', 404);

    const mission = await prisma.mission.update({
      where: { id: req.params.id },
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : undefined,
      },
    });

    // Broadcast status change if status was updated
    if (data.status) {
      socketService.broadcastMissionStatus(mission.id, data.status as MissionStatus);
    }

    res.json({ mission });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /missions/:id ---  (admin only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.mission.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Mission not found', 404);

    await prisma.mission.delete({ where: { id: req.params.id } });
    res.json({ message: 'Mission deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// --- POST /missions/:id/mock --- (admin — start mock data for a mission)
router.post('/:id/mock', requireAuth, requireRole('ADMIN', 'OPERATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mission = await prisma.mission.findUnique({ where: { id: req.params.id } });
    if (!mission) throw new AppError('Mission not found', 404);

    if (mockDataService.isRunning()) {
      throw new AppError('Mock generator is already running', 409);
    }

    const speedMultiplier = (req.body.speedMultiplier as number) || 1;
    const intervalMs = (req.body.intervalMs as number) || 1000;

    mockDataService.start(mission.id, intervalMs, speedMultiplier);
    res.json({ message: 'Mock telemetry generator started', status: mockDataService.getStatus() });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /missions/:id/mock --- (admin — stop mock data)
router.delete('/:id/mock', requireAuth, requireRole('ADMIN', 'OPERATOR'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    mockDataService.stop();
    res.json({ message: 'Mock telemetry generator stopped', status: mockDataService.getStatus() });
  } catch (err) {
    next(err);
  }
});

// --- GET /missions/:id/mock/status --- (admin)
router.get('/:id/mock/status', async (_req: Request, res: Response) => {
  res.json({ status: mockDataService.getStatus() });
});

export default router;
