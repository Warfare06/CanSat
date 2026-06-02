// ============================================
// CanSat Astra Maven — Prisma Client Setup
// ============================================

import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

// Prevent multiple Prisma Client instances in development (HMR)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDev ? ['query', 'warn', 'error'] : ['error'],
  });

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown helper — disconnect Prisma on process exit.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('[DB] Prisma client disconnected');
}
