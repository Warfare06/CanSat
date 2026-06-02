// ============================================
// CanSat Astra Maven — Socket.IO Service
// ============================================

import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  TelemetryPacket,
  MissionStatus,
  GPSData,
} from '@cansat/shared';
import { config } from '../config/index.js';

type SocketServer = Server<ClientToServerEvents, ServerToClientEvents>;

let io: SocketServer | null = null;

class SocketService {
  /**
   * Initialize Socket.IO with the HTTP server.
   */
  init(httpServer: HttpServer): SocketServer {
    io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      transports: ['websocket', 'polling'],
    });

    // Optionally attach Redis adapter for horizontal scaling
    if (config.isProd && config.redisUrl) {
      this.attachRedisAdapter().catch((err) => {
        console.warn('[SOCKET] Redis adapter failed, falling back to in-memory:', err.message);
      });
    }

    this.registerEventHandlers();

    console.log('[SOCKET] Socket.IO server initialized');
    return io;
  }

  /**
   * Attach Redis adapter for multi-process scaling.
   */
  private async attachRedisAdapter(): Promise<void> {
    try {
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const { default: Redis } = await import('ioredis');

      const pubClient = new Redis(config.redisUrl);
      const subClient = pubClient.duplicate();

      io!.adapter(createAdapter(pubClient, subClient));
      console.log('[SOCKET] Redis adapter connected');
    } catch {
      console.warn('[SOCKET] Redis adapter not available, using in-memory adapter');
    }
  }

  /**
   * Register Socket.IO event handlers.
   */
  private registerEventHandlers(): void {
    if (!io) return;

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);

      // Join a mission room to receive telemetry
      socket.on('telemetry:subscribe', (missionId: string) => {
        void socket.join(`mission:${missionId}`);
        console.log(`[SOCKET] ${socket.id} subscribed to mission:${missionId}`);
      });

      // Leave a mission room
      socket.on('telemetry:unsubscribe', (missionId: string) => {
        void socket.leave(`mission:${missionId}`);
        console.log(`[SOCKET] ${socket.id} unsubscribed from mission:${missionId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[SOCKET] Client disconnected: ${socket.id} (${reason})`);
      });
    });
  }

  /**
   * Broadcast a telemetry packet to all subscribers of a mission.
   */
  broadcastTelemetry(missionId: string, packet: TelemetryPacket): void {
    if (!io) return;
    io.to(`mission:${missionId}`).emit('telemetry:live', packet);
  }

  /**
   * Broadcast GPS data to a mission room.
   */
  broadcastGPS(missionId: string, gps: GPSData): void {
    if (!io) return;
    io.to(`mission:${missionId}`).emit('telemetry:gps', gps);
  }

  /**
   * Broadcast a mission status change.
   */
  broadcastMissionStatus(missionId: string, status: MissionStatus): void {
    if (!io) return;
    io.emit('mission:status', { missionId, status });
  }

  /**
   * Broadcast device connection status.
   */
  broadcastConnectionStatus(deviceId: string, connected: boolean): void {
    if (!io) return;
    io.emit('connection:status', { deviceId, connected });
  }

  /**
   * Get the Socket.IO server instance.
   */
  getIO(): SocketServer | null {
    return io;
  }

  /**
   * Get the count of connected clients.
   */
  async getConnectionCount(): Promise<number> {
    if (!io) return 0;
    const sockets = await io.fetchSockets();
    return sockets.length;
  }
}

export const socketService = new SocketService();
