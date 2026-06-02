// ============================================
// CanSat Astra Maven — Mock Telemetry Generator
// ============================================
// Simulates a realistic CanSat descent from ~1000 m altitude
// over approximately 10 minutes (600 seconds).
//
// Flight profile:
//   0–30 s    → Pre-launch (ground, ~200 m ASL)
//  30–120 s   → Ascent via weather balloon to ~1000 m
// 120–150 s   → Apogee / separation (parachute deploys)
// 150–540 s   → Parachute descent at ~2.5 m/s
// 540–600 s   → Landed / recovery
// ============================================

import type { TelemetryPacket } from '@cansat/shared';
import { telemetryService } from './telemetry.service.js';
import { socketService } from './socket.service.js';

// --- Physical constants & helpers ---

const SEA_LEVEL_PRESSURE = 1013.25;   // hPa
const LAPSE_RATE = 0.0065;            // °C/m (troposphere)
const GROUND_TEMP = 22.0;             // °C at launch site
const GROUND_ALT = 200;               // m ASL (launch site elevation)

/** ISA pressure at a given altitude (barometric formula). */
function pressureAtAltitude(altMeters: number): number {
  return SEA_LEVEL_PRESSURE * Math.pow(1 - (LAPSE_RATE * altMeters) / 288.15, 5.2561);
}

/** Temperature at altitude using standard lapse rate. */
function tempAtAltitude(altMeters: number): number {
  return GROUND_TEMP - LAPSE_RATE * (altMeters - GROUND_ALT);
}

/** Add Gaussian noise. */
function noise(value: number, stddev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return value + z * stddev;
}

/** Clamp a value between min and max. */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Round to N decimal places. */
function round(val: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

// --- Flight-phase logic ---

interface FlightState {
  altitude: number;
  verticalSpeed: number;  // m/s (positive = up)
  phase: 'prelaunch' | 'ascent' | 'apogee' | 'descent' | 'landed';
}

function getFlightState(elapsedSec: number): FlightState {
  if (elapsedSec < 30) {
    // Pre-launch – sitting on the ground
    return { altitude: GROUND_ALT, verticalSpeed: 0, phase: 'prelaunch' };
  }

  if (elapsedSec < 120) {
    // Ascent – balloon rises at ~8.9 m/s to reach ~1000 m in 90 s
    const ascentTime = elapsedSec - 30;
    const ascentRate = 8.89; // m/s
    const alt = GROUND_ALT + ascentRate * ascentTime;
    return { altitude: alt, verticalSpeed: ascentRate, phase: 'ascent' };
  }

  if (elapsedSec < 150) {
    // Apogee zone – separation & parachute deployment
    // Altitude dips slightly as parachute deploys, some oscillation
    const apoTime = elapsedSec - 120;
    const peakAlt = GROUND_ALT + 8.89 * 90; // ~1000 m
    const dip = 15 * Math.sin((apoTime / 30) * Math.PI); // gentle oscillation
    return { altitude: peakAlt - dip, verticalSpeed: -0.5, phase: 'apogee' };
  }

  if (elapsedSec < 540) {
    // Parachute descent — ~2.5 m/s descent rate
    const descentTime = elapsedSec - 150;
    const descentRate = 2.5;
    const startAlt = GROUND_ALT + 8.89 * 90 - 15; // post-apogee
    const alt = startAlt - descentRate * descentTime;

    if (alt <= GROUND_ALT) {
      return { altitude: GROUND_ALT, verticalSpeed: 0, phase: 'landed' };
    }

    // Add slight turbulence-induced oscillation
    const turbulence = 0.3 * Math.sin(descentTime * 0.15);
    return {
      altitude: alt,
      verticalSpeed: -(descentRate + turbulence),
      phase: 'descent',
    };
  }

  // Landed
  return { altitude: GROUND_ALT, verticalSpeed: 0, phase: 'landed' };
}

// --- Packet generation ---

/** Base GPS coordinates (Hyderabad, India — a plausible launch site). */
const BASE_LAT = 17.385;
const BASE_LNG = 78.4867;

let mockInterval: ReturnType<typeof setInterval> | null = null;
let seq = 0;

/**
 * Generate a single realistic telemetry packet for a given flight elapsed time.
 */
function generatePacket(deviceId: string, elapsedSec: number): TelemetryPacket {
  const flight = getFlightState(elapsedSec);
  seq++;

  const alt = noise(flight.altitude, 0.5);
  const temp = noise(tempAtAltitude(alt), 0.3);
  const pres = noise(pressureAtAltitude(alt), 0.2);
  const humid = noise(clamp(65 - 0.02 * (alt - GROUND_ALT), 20, 90), 1.0);

  // IMU — acceleration varies with flight phase
  const isMoving = flight.phase !== 'prelaunch' && flight.phase !== 'landed';
  const gForce = flight.phase === 'apogee' ? 0.1 : 1.0;

  // GPS drift during descent (wind effect)
  const windDriftLat = flight.phase === 'descent'
    ? (elapsedSec - 150) * 0.000002
    : 0;
  const windDriftLng = flight.phase === 'descent'
    ? (elapsedSec - 150) * 0.000003
    : 0;

  // Battery slowly drains (starts at 4.15V, ~95%)
  const battVoltage = clamp(4.15 - elapsedSec * 0.001, 3.3, 4.2);
  const battPct = clamp(((battVoltage - 3.3) / (4.2 - 3.3)) * 100, 0, 100);

  // RSSI degrades with altitude
  const baseRssi = -50;
  const rssi = baseRssi - 0.03 * (alt - GROUND_ALT) + noise(0, 2);

  return {
    deviceId,
    timestamp: Date.now(),
    seq,
    sensors: {
      pressure: round(pres, 2),
      temperature: round(temp, 2),
      humidity: round(humid, 1),
      altitude: round(alt, 2),
    },
    imu: {
      acceleration: {
        x: round(noise(0, isMoving ? 0.15 : 0.02), 4),
        y: round(noise(0, isMoving ? 0.15 : 0.02), 4),
        z: round(noise(gForce, isMoving ? 0.1 : 0.01), 4),
      },
      gyroscope: {
        x: round(noise(0, isMoving ? 5.0 : 0.5), 2),
        y: round(noise(0, isMoving ? 5.0 : 0.5), 2),
        z: round(noise(0, isMoving ? 3.0 : 0.3), 2),
      },
      magnetometer: {
        x: round(noise(25, 2), 2),
        y: round(noise(-5, 2), 2),
        z: round(noise(40, 2), 2),
      },
    },
    gps: {
      latitude: round(BASE_LAT + windDriftLat + noise(0, 0.000005), 7),
      longitude: round(BASE_LNG + windDriftLng + noise(0, 0.000005), 7),
      altitude: round(alt, 1),
      speed: round(Math.abs(flight.verticalSpeed) + noise(0, 0.2), 2),
      satellites: flight.phase === 'prelaunch' || flight.phase === 'landed' ? 12 : clamp(Math.floor(noise(9, 1)), 4, 14),
      fix: true,
    },
    battery: {
      voltage: round(battVoltage, 3),
      percentage: round(battPct, 1),
    },
    rssi: round(rssi, 1),
  };
}

// --- Public API ---

class MockDataService {
  private elapsedSec = 0;
  private missionId: string | null = null;
  private deviceId = 'CANSAT-SIM-001';

  /**
   * Start the mock telemetry generator.
   *
   * @param missionId  Mission ID to associate data with
   * @param intervalMs Interval between packets (default 1000 ms = 1 Hz)
   * @param speedMultiplier  Speed up time (e.g., 2 = twice real-time). Default 1.
   */
  start(missionId: string, intervalMs = 1000, speedMultiplier = 1): void {
    if (mockInterval) {
      console.warn('[MOCK] Generator already running — stop it first');
      return;
    }

    this.missionId = missionId;
    this.elapsedSec = 0;
    seq = 0;

    console.log(`[MOCK] Starting simulated descent for mission ${missionId}`);
    console.log(`[MOCK] Device: ${this.deviceId} | Interval: ${intervalMs}ms | Speed: ${speedMultiplier}x`);
    console.log('[MOCK] Flight profile: Pre-launch → Ascent → Apogee → Descent → Landed');

    mockInterval = setInterval(() => {
      const packet = generatePacket(this.deviceId, this.elapsedSec);

      // Feed into telemetry pipeline (same path as real MQTT data)
      telemetryService.enqueue(missionId, packet);
      socketService.broadcastTelemetry(missionId, packet);
      socketService.broadcastGPS(missionId, packet.gps);

      // Log phase transitions
      const state = getFlightState(this.elapsedSec);
      if (this.elapsedSec === 0) console.log(`[MOCK] T+${this.elapsedSec}s — PRE-LAUNCH (ground)`);
      if (this.elapsedSec === 30) console.log(`[MOCK] T+${this.elapsedSec}s — ASCENT begins`);
      if (this.elapsedSec === 120) console.log(`[MOCK] T+${this.elapsedSec}s — APOGEE reached (~1000 m)`);
      if (this.elapsedSec === 150) console.log(`[MOCK] T+${this.elapsedSec}s — DESCENT under parachute`);

      if (state.phase === 'landed' && this.elapsedSec >= 540) {
        console.log(`[MOCK] T+${this.elapsedSec}s — LANDED. Stopping generator.`);
        this.stop();
        return;
      }

      this.elapsedSec += speedMultiplier;
    }, intervalMs);
  }

  /**
   * Stop the mock telemetry generator.
   */
  stop(): void {
    if (mockInterval) {
      clearInterval(mockInterval);
      mockInterval = null;
      console.log(`[MOCK] Generator stopped at T+${this.elapsedSec}s (seq=${seq})`);
    }
  }

  /**
   * Check if the generator is currently running.
   */
  isRunning(): boolean {
    return mockInterval !== null;
  }

  /**
   * Generate a batch of packets for testing (synchronous).
   * Produces the full 10-minute flight in one call.
   */
  generateBatch(deviceId: string, count = 600): TelemetryPacket[] {
    const packets: TelemetryPacket[] = [];
    for (let t = 0; t < count; t++) {
      packets.push(generatePacket(deviceId, t));
    }
    return packets;
  }

  /**
   * Get current simulation state (for API).
   */
  getStatus() {
    return {
      running: this.isRunning(),
      elapsedSec: this.elapsedSec,
      missionId: this.missionId,
      deviceId: this.deviceId,
      phase: getFlightState(this.elapsedSec).phase,
      seq,
    };
  }
}

export const mockDataService = new MockDataService();
