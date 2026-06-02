// ============================================
// CanSat Astra Maven — Telemetry Service
// ============================================

import { prisma } from '../config/database.js';
import type { TelemetryPacket } from '@cansat/shared';

// Buffer for batch inserts
let telemetryBuffer: Array<{
  missionId: string;
  packet: TelemetryPacket;
}> = [];

const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 5000;
let flushTimer: ReturnType<typeof setInterval> | null = null;

class TelemetryService {
  /**
   * Start the background flush timer for batch inserts.
   */
  start(): void {
    if (flushTimer) return;
    flushTimer = setInterval(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);
    console.log('[TELEMETRY] Batch insert service started');
  }

  /**
   * Stop the background flush timer.
   */
  stop(): void {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    // Final flush
    void this.flush();
    console.log('[TELEMETRY] Batch insert service stopped');
  }

  /**
   * Add a telemetry packet to the insert buffer.
   */
  enqueue(missionId: string, packet: TelemetryPacket): void {
    telemetryBuffer.push({ missionId, packet });

    if (telemetryBuffer.length >= BATCH_SIZE) {
      void this.flush();
    }
  }

  /**
   * Flush the buffer — batch-insert all pending telemetry rows.
   */
  async flush(): Promise<void> {
    if (telemetryBuffer.length === 0) return;

    const batch = telemetryBuffer.splice(0); // take all

    try {
      await prisma.telemetry.createMany({
        data: batch.map(({ missionId, packet }) => ({
          missionId,
          deviceId: packet.deviceId,
          seq: packet.seq,
          timestamp: new Date(packet.timestamp),

          // Sensors
          pressure: packet.sensors.pressure,
          temperature: packet.sensors.temperature,
          humidity: packet.sensors.humidity,
          altitude: packet.sensors.altitude,

          // IMU
          accelX: packet.imu.acceleration.x,
          accelY: packet.imu.acceleration.y,
          accelZ: packet.imu.acceleration.z,
          gyroX: packet.imu.gyroscope.x,
          gyroY: packet.imu.gyroscope.y,
          gyroZ: packet.imu.gyroscope.z,
          magX: packet.imu.magnetometer.x,
          magY: packet.imu.magnetometer.y,
          magZ: packet.imu.magnetometer.z,

          // GPS
          gpsLatitude: packet.gps.latitude,
          gpsLongitude: packet.gps.longitude,
          gpsAltitude: packet.gps.altitude,
          gpsSpeed: packet.gps.speed,
          gpsSatellites: packet.gps.satellites,
          gpsFix: packet.gps.fix,

          // Power & signal
          batteryVoltage: packet.battery.voltage,
          batteryPercentage: packet.battery.percentage,
          rssi: packet.rssi,
        })),
        skipDuplicates: true,
      });

      console.log(`[TELEMETRY] Flushed ${batch.length} records to database`);
    } catch (err) {
      console.error('[TELEMETRY] Batch insert failed:', err);
      // Re-add to the front of the buffer for retry
      telemetryBuffer.unshift(...batch);
    }
  }

  /**
   * Query telemetry data with filters.
   */
  async query(params: {
    missionId?: string;
    deviceId?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.missionId) where.missionId = params.missionId;
    if (params.deviceId) where.deviceId = params.deviceId;

    if (params.from || params.to) {
      const timestampFilter: Record<string, Date> = {};
      if (params.from) timestampFilter.gte = new Date(params.from);
      if (params.to) timestampFilter.lte = new Date(params.to);
      where.timestamp = timestampFilter;
    }

    const [data, total] = await Promise.all([
      prisma.telemetry.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: params.limit || 100,
        skip: params.offset || 0,
      }),
      prisma.telemetry.count({ where }),
    ]);

    return { data, total, limit: params.limit || 100, offset: params.offset || 0 };
  }

  /**
   * Get the latest telemetry packet for a mission.
   */
  async getLatest(missionId: string) {
    return prisma.telemetry.findFirst({
      where: { missionId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get aggregated stats for a mission.
   */
  async getStats(missionId: string) {
    const result = await prisma.telemetry.aggregate({
      where: { missionId },
      _count: true,
      _min: {
        altitude: true,
        temperature: true,
        pressure: true,
        timestamp: true,
      },
      _max: {
        altitude: true,
        temperature: true,
        pressure: true,
        gpsSpeed: true,
        timestamp: true,
      },
      _avg: {
        altitude: true,
        temperature: true,
        pressure: true,
        humidity: true,
        rssi: true,
      },
    });

    return {
      count: result._count,
      duration: result._min.timestamp && result._max.timestamp
        ? new Date(result._max.timestamp).getTime() - new Date(result._min.timestamp).getTime()
        : 0,
      altitude: { min: result._min.altitude, max: result._max.altitude, avg: result._avg.altitude },
      temperature: { min: result._min.temperature, max: result._max.temperature, avg: result._avg.temperature },
      pressure: { min: result._min.pressure, max: result._max.pressure, avg: result._avg.pressure },
      humidity: { avg: result._avg.humidity },
      maxSpeed: result._max.gpsSpeed,
      avgRssi: result._avg.rssi,
    };
  }
}

export const telemetryService = new TelemetryService();
