// ============================================
// CanSat Mobile — Sensors Screen
// Real-time sensor readings list
// ============================================

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../src/config';

interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
}

function useSensorReadings(): SensorReading[] {
  const [readings, setReadings] = useState<SensorReading[]>([
    { id: 'pressure', name: 'Barometric Pressure', value: 1013.2, unit: 'hPa', color: COLORS.primary, icon: '🌡', trend: 'stable' },
    { id: 'temp', name: 'Temperature', value: 21.5, unit: '°C', color: COLORS.secondary, icon: '🔥', trend: 'up' },
    { id: 'altitude', name: 'Altitude (Barometric)', value: 856.3, unit: 'm', color: COLORS.success, icon: '📏', trend: 'down' },
    { id: 'accel_x', name: 'Acceleration X', value: 0.02, unit: 'g', color: '#aa66ff', icon: '↔', trend: 'stable' },
    { id: 'accel_y', name: 'Acceleration Y', value: -0.01, unit: 'g', color: '#aa66ff', icon: '↕', trend: 'stable' },
    { id: 'accel_z', name: 'Acceleration Z', value: 9.81, unit: 'g', color: '#aa66ff', icon: '⬆', trend: 'stable' },
    { id: 'gyro_x', name: 'Gyroscope X', value: 0.5, unit: '°/s', color: COLORS.danger, icon: '🔄', trend: 'up' },
    { id: 'gyro_y', name: 'Gyroscope Y', value: -0.3, unit: '°/s', color: COLORS.danger, icon: '🔄', trend: 'down' },
    { id: 'gyro_z', name: 'Gyroscope Z', value: 0.1, unit: '°/s', color: COLORS.danger, icon: '🔄', trend: 'stable' },
    { id: 'mag', name: 'Magnetometer', value: 45.2, unit: 'µT', color: '#ff69b4', icon: '🧲', trend: 'stable' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) =>
        prev.map((r) => ({
          ...r,
          value: +(r.value + (Math.random() - 0.5) * (r.unit === 'hPa' ? 1 : r.unit === 'm' ? 3 : 0.1)).toFixed(r.unit === 'g' || r.unit === '°/s' ? 3 : 1),
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
        }))
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return readings;
}

function SensorRow({ sensor }: { sensor: SensorReading }) {
  const trendArrow = sensor.trend === 'up' ? '↑' : sensor.trend === 'down' ? '↓' : '→';
  const trendColor = sensor.trend === 'up' ? COLORS.success : sensor.trend === 'down' ? COLORS.danger : COLORS.textMuted;

  return (
    <View style={styles.sensorRow}>
      <View style={styles.sensorLeft}>
        <Text style={styles.sensorIcon}>{sensor.icon}</Text>
        <View>
          <Text style={styles.sensorName}>{sensor.name}</Text>
          <Text style={styles.sensorId}>{sensor.id.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.sensorRight}>
        <Text style={[styles.sensorValue, { color: sensor.color }]}>
          {sensor.value}
        </Text>
        <Text style={styles.sensorUnit}>{sensor.unit}</Text>
        <Text style={[styles.sensorTrend, { color: trendColor }]}>{trendArrow}</Text>
      </View>
    </View>
  );
}

export default function SensorsScreen() {
  const readings = useSensorReadings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.statusItem, { flexDirection: 'row', gap: 6 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.headerSubtext}>10 Hz SAMPLING • ALL SENSORS NOMINAL</Text>
        </View>
      </View>
      {readings.map((sensor) => (
        <SensorRow key={sensor.id} sensor={sensor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 16, gap: 8 },
  header: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  statusItem: { alignItems: 'center' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  headerSubtext: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  sensorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sensorIcon: { fontSize: 18 },
  sensorName: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  sensorId: { fontSize: 8, fontWeight: '600', letterSpacing: 1, color: COLORS.textMuted, marginTop: 2, textTransform: 'uppercase' },
  sensorRight: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  sensorValue: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sensorUnit: { fontSize: 9, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 0.5 },
  sensorTrend: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
