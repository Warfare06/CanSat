// ============================================
// CanSat Astra Maven — Main Server Entry Point
// ============================================
// Express + Socket.IO + MQTT — all wired together.

import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { config } from './config/index.js';
import { prisma, disconnectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Services
import { socketService } from './services/socket.service.js';
import { mqttService } from './services/mqtt.service.js';
import { telemetryService } from './services/telemetry.service.js';
import { authService } from './services/auth.service.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import missionRoutes from './routes/mission.routes.js';
import telemetryRoutes from './routes/telemetry.routes.js';
import teamRoutes from './routes/team.routes.js';
import sponsorRoutes from './routes/sponsor.routes.js';
import contactRoutes from './routes/contact.routes.js';

// ──────────────────────────────────────────
// Express App
// ──────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// --- Global Middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on all API routes
app.use('/api', apiLimiter);

// --- Health Check ---
app.get('/api/health', async (_req, res) => {
  const connectedClients = await socketService.getConnectionCount();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    services: {
      database: 'connected',
      mqtt: mqttService.isConnected() ? 'connected' : 'disconnected',
      socketio: `${connectedClients} clients`,
    },
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/contact', contactRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// ──────────────────────────────────────────
// Startup Sequence
// ──────────────────────────────────────────

async function bootstrap(): Promise<void> {
  try {
    // 1. Verify database connection
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected');

    // 2. Ensure default admin user exists
    await authService.ensureAdminUser();

    // 3. Initialize Socket.IO
    socketService.init(httpServer);

    // 4. Start telemetry batch insert service
    telemetryService.start();

    // 5. Connect to MQTT broker (non-blocking in dev)
    void mqttService.connect();

    // 6. Schedule periodic cleanup of expired refresh tokens
    setInterval(() => {
      void authService.cleanupExpiredTokens().then((count) => {
        if (count > 0) console.log(`[AUTH] Cleaned up ${count} expired refresh tokens`);
      });
    }, 60 * 60 * 1000); // Every hour

    // 7. Start HTTP server
    httpServer.listen(config.port, () => {
      console.log('');
      console.log('  ╔═══════════════════════════════════════════════════╗');
      console.log('  ║       🚀 CanSat Astra Maven — Server Ready       ║');
      console.log('  ╠═══════════════════════════════════════════════════╣');
      console.log(`  ║  HTTP API:   http://localhost:${config.port}/api          ║`);
      console.log(`  ║  Socket.IO:  ws://localhost:${config.port}               ║`);
      console.log(`  ║  Health:     http://localhost:${config.port}/api/health   ║`);
      console.log(`  ║  Environment: ${config.nodeEnv.padEnd(35)}║`);
      console.log('  ╚═══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err);
    process.exit(1);
  }
}

// ──────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);

  telemetryService.stop();
  await mqttService.disconnect();
  await disconnectDatabase();

  httpServer.close(() => {
    console.log('[SERVER] HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[SERVER] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  void shutdown('UNCAUGHT');
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

// Start the server
void bootstrap();
