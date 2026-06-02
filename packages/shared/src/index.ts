// ============================================
// CanSat Astra Maven — Shared TypeScript Types
// ============================================

// === Telemetry Data ===

export interface SensorData {
  pressure: number;      // hPa
  temperature: number;   // °C
  humidity: number;      // %
  altitude: number;      // meters
}

export interface IMUData {
  acceleration: { x: number; y: number; z: number }; // g
  gyroscope: { x: number; y: number; z: number };    // °/s
  magnetometer: { x: number; y: number; z: number }; // µT
}

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude: number;      // meters
  speed: number;         // m/s
  satellites: number;
  fix: boolean;
}

export interface BatteryData {
  voltage: number;       // V
  percentage: number;    // %
}

export interface TelemetryPacket {
  deviceId: string;
  timestamp: number;     // Unix ms
  seq: number;
  sensors: SensorData;
  imu: IMUData;
  gps: GPSData;
  battery: BatteryData;
  rssi: number;          // dBm
}

// === Mission ===

export enum MissionStatus {
  PLANNED = 'PLANNED',
  PRE_LAUNCH = 'PRE_LAUNCH',
  ASCENDING = 'ASCENDING',
  APOGEE = 'APOGEE',
  DESCENDING = 'DESCENDING',
  LANDED = 'LANDED',
  RECOVERED = 'RECOVERED',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: MissionStatus;
  launchDate?: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

// === User & Auth ===

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// === Team & Sponsors ===

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
}

export enum SponsorTier {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  tier: SponsorTier;
}

// === Socket.IO Events ===

export interface ServerToClientEvents {
  'telemetry:live': (data: TelemetryPacket) => void;
  'telemetry:gps': (data: GPSData) => void;
  'mission:status': (data: { missionId: string; status: MissionStatus }) => void;
  'mission:countdown': (data: { secondsRemaining: number }) => void;
  'connection:status': (data: { deviceId: string; connected: boolean }) => void;
}

export interface ClientToServerEvents {
  'telemetry:subscribe': (missionId: string) => void;
  'telemetry:unsubscribe': (missionId: string) => void;
}

// === MQTT Topics ===

export const MQTT_TOPICS = {
  TELEMETRY: 'cansat/{deviceId}/telemetry',
  GPS: 'cansat/{deviceId}/gps',
  STATUS: 'cansat/{deviceId}/status',
  COMMAND: 'cansat/{deviceId}/command',
} as const;

// === Sensor Ranges (for gauge visualization) ===

export const SENSOR_RANGES = {
  pressure: { min: 300, max: 1100, unit: 'hPa', label: 'Pressure' },
  temperature: { min: -40, max: 85, unit: '°C', label: 'Temperature' },
  humidity: { min: 0, max: 100, unit: '%', label: 'Humidity' },
  altitude: { min: 0, max: 5000, unit: 'm', label: 'Altitude' },
  batteryVoltage: { min: 3.0, max: 4.2, unit: 'V', label: 'Battery' },
} as const;
