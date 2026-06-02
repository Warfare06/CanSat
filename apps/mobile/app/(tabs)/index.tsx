// ============================================
// CanSat Mobile — Dashboard Screen
// Simplified live telemetry overview
// ============================================

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { COLORS } from '../../src/config';

// Mock telemetry for demo
function useMockTelemetry() {
  const [data, setData] = useState({
    pressure: 1013.2,
    temperature: 21.5,
    altitude: 856.3,
    battery: 85,
    rssi: -45,
    status: 'DESCENDING',
    gpsLat: 13.0827,
    gpsLng: 80.2707,
    satellites: 8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        pressure: +(prev.pressure + (Math.random() - 0.5) * 1.5).toFixed(1),
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.3).toFixed(1),
        altitude: +(Math.max(0, prev.altitude + (Math.random() - 0.6) * 5)).toFixed(1),
        battery: Math.max(0, prev.battery - Math.random() * 0.1),
        rssi: -42 - Math.floor(Math.random() * 10),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

// Simple SVG gauge for mobile
function MiniGauge({
  value,
  max,
  label,
  unit,
  color,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}) {
  const progress = Math.min(value / max, 1);
  const radius = 38;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 degrees
  const strokeDash = circumference * progress;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        {/* Background arc */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference * 0.33}`}
          transform="rotate(135 50 50)"
        />
        {/* Value arc */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          transform="rotate(135 50 50)"
          opacity={0.9}
        />
      </Svg>
      <View style={styles.gaugeOverlay}>
        <Text style={[styles.gaugeValue, { color }]}>{value.toFixed(1)}</Text>
        <Text style={styles.gaugeUnit}>{unit}</Text>
      </View>
      <Text style={styles.gaugeLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const telemetry = useMockTelemetry();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection Status */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>LIVE</Text>
        </View>
        <Text style={styles.statusValue}>
          {telemetry.status}
        </Text>
        <Text style={[styles.statusText, { color: COLORS.secondary }]}>
          {telemetry.rssi} dBm
        </Text>
      </View>

      {/* Gauges Grid */}
      <View style={styles.gaugeGrid}>
        <MiniGauge
          value={telemetry.pressure}
          max={1100}
          label="Pressure"
          unit="hPa"
          color={COLORS.primary}
        />
        <MiniGauge
          value={telemetry.temperature}
          max={85}
          label="Temperature"
          unit="°C"
          color={COLORS.secondary}
        />
        <MiniGauge
          value={telemetry.altitude}
          max={2000}
          label="Altitude"
          unit="m"
          color={COLORS.success}
        />
        <MiniGauge
          value={telemetry.battery}
          max={100}
          label="Battery"
          unit="%"
          color="#ff3366"
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>MISSION DATA</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>GPS Position</Text>
          <Text style={styles.statValue}>
            {telemetry.gpsLat.toFixed(4)}°N, {telemetry.gpsLng.toFixed(4)}°E
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Satellites</Text>
          <Text style={styles.statValue}>{telemetry.satellites} locked</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Signal</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {telemetry.rssi} dBm (Strong)
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Battery</Text>
          <Text style={[styles.statValue, { color: COLORS.secondary }]}>
            {telemetry.battery.toFixed(0)}% (3.72V)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  // Gauges
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  gaugeContainer: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    paddingBottom: 8,
  },
  gaugeOverlay: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  gaugeUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  // Stats
  statsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
});
