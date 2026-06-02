-- TimescaleDB initialization script
-- Run after Prisma migrations to convert tables to hypertables

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Note: Run this AFTER `prisma db push` to convert telemetry tables
-- These commands should be run manually or via a migration script:

-- SELECT create_hypertable('"Telemetry"', 'time');
-- SELECT create_hypertable('"GpsData"', 'time');

-- Compression policy (compress data older than 7 days)
-- ALTER TABLE "Telemetry" SET (
--   timescaledb.compress,
--   timescaledb.compress_segmentby = '"missionId"',
--   timescaledb.compress_orderby = 'time DESC'
-- );
-- SELECT add_compression_policy('"Telemetry"', INTERVAL '7 days');

-- Continuous aggregate for dashboard overview (1-minute buckets)
-- CREATE MATERIALIZED VIEW telemetry_1min
-- WITH (timescaledb.continuous) AS
-- SELECT
--   time_bucket('1 minute', time) AS bucket,
--   "missionId",
--   AVG(pressure) as avg_pressure,
--   AVG(temperature) as avg_temperature,
--   AVG(altitude) as avg_altitude,
--   MIN(altitude) as min_altitude,
--   MAX(altitude) as max_altitude,
--   COUNT(*) as sample_count
-- FROM "Telemetry"
-- GROUP BY bucket, "missionId";

-- Dashboard cache retention (30 days for aggregated view)
-- SELECT add_retention_policy('telemetry_1min', INTERVAL '30 days');

-- Raw data retained indefinitely (as per user requirement)
