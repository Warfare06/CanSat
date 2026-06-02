// ============================================
// CanSat Astra Maven — Zod Validation Schemas
// ============================================

import { z } from 'zod';

// === Auth Schemas ===

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// === Mission Schemas ===

export const createMissionSchema = z.object({
  name: z.string().min(1, 'Mission name is required').max(100),
  description: z.string().max(1000).optional(),
  deviceId: z.string().min(1, 'Device ID is required'),
  launchDate: z.string().datetime().optional(),
});

export const updateMissionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum([
    'PLANNED', 'PRE_LAUNCH', 'ASCENDING', 'APOGEE',
    'DESCENDING', 'LANDED', 'RECOVERED', 'COMPLETED', 'ABORTED',
  ]).optional(),
  launchDate: z.string().datetime().optional(),
  deviceId: z.string().min(1).optional(),
});

// === Telemetry Query Schemas ===

export const telemetryQuerySchema = z.object({
  missionId: z.string().uuid().optional(),
  deviceId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(10000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

// === Team Member Schemas ===

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

// === Sponsor Schemas ===

export const createSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  tier: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']),
});

export const updateSponsorSchema = createSponsorSchema.partial();

// === Contact Schemas ===

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

// === Type Exports ===

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
export type TelemetryQueryInput = z.infer<typeof telemetryQuerySchema>;
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type CreateSponsorInput = z.infer<typeof createSponsorSchema>;
export type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
