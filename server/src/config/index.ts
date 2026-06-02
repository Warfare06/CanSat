// ============================================
// CanSat Astra Maven — Environment Configuration
// ============================================

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
dotenv.config({ path: resolve(import.meta.dirname, '../../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://cansat_user:password@localhost:5432/cansat_db',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-key-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // MQTT (HiveMQ Cloud)
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    port: parseInt(process.env.MQTT_PORT || '8883', 10),
    wsPort: parseInt(process.env.MQTT_WS_PORT || '8884', 10),
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
  },

  // Admin defaults
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@cansatorbital.com',
    password: process.env.ADMIN_PASSWORD || 'changeme123',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
} as const;

export type Config = typeof config;
