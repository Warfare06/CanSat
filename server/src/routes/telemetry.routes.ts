// ============================================
// CanSat Astra Maven — Telemetry Routes
// ============================================

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { telemetryService } from '../services/telemetry.service.js';
import { telemetryQuerySchema } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// --- GET /telemetry ---  (public — query telemetry data)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = telemetryQuerySchema.parse(req.query);
    const result = await telemetryService.query(params);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- GET /telemetry/latest/:missionId ---  (public — latest packet)
router.get('/latest/:missionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const latest = await telemetryService.getLatest(req.params.missionId);
    if (!latest) throw new AppError('No telemetry data found for this mission', 404);
    res.json({ telemetry: latest });
  } catch (err) {
    next(err);
  }
});

// --- GET /telemetry/stats/:missionId ---  (public — aggregated stats)
router.get('/stats/:missionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await telemetryService.getStats(req.params.missionId);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

export default router;
