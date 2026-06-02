// ============================================
// CanSat Mobile — GPS Map Screen
// Live GPS tracking on map
// ============================================

import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../src/config';

// Note: react-native-maps requires native setup.
// This is a placeholder that shows GPS coordinates.
// When building the APK, install react-native-maps and replace this.

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* GPS Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GPS POSITION</Text>
        <View style={styles.coordRow}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>LATITUDE</Text>
            <Text style={styles.coordValue}>13.0827°N</Text>
          </View>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>LONGITUDE</Text>
            <Text style={styles.coordValue}>80.2707°E</Text>
          </View>
        </View>
        <View style={styles.coordRow}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>ALTITUDE</Text>
            <Text style={[styles.coordValue, { color: COLORS.success }]}>856.3 m</Text>
          </View>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>SPEED</Text>
            <Text style={[styles.coordValue, { color: COLORS.secondary }]}>12.5 m/s</Text>
          </View>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid}>
          {/* Grid lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 11}%` }]} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 14}%` }]} />
          ))}
          {/* Center marker */}
          <View style={styles.marker}>
            <Text style={styles.markerDot}>◉</Text>
            <Text style={styles.markerLabel}>CanSat-001</Text>
          </View>
        </View>
        <Text style={styles.mapHint}>
          📍 Install react-native-maps for interactive mapping
        </Text>
      </View>

      {/* GPS Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GPS STATUS</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Satellites</Text>
          <Text style={styles.statValue}>8 locked</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fix Quality</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>3D Fix</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>HDOP</Text>
          <Text style={styles.statValue}>1.2 (Excellent)</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>2.3 km from launch</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, padding: 16, gap: 12 },
  card: {
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
  },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  coordItem: { flex: 1 },
  coordLabel: { fontSize: 8, fontWeight: '600', letterSpacing: 1.5, color: COLORS.textMuted, marginBottom: 2 },
  coordValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary, fontVariant: ['tabular-nums'] },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGrid: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  marker: { alignItems: 'center' },
  markerDot: { fontSize: 24, color: COLORS.primary },
  markerLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  mapHint: { position: 'absolute', bottom: 8, fontSize: 9, color: COLORS.textMuted },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  statValue: { fontSize: 12, fontWeight: '600', color: COLORS.primary, fontVariant: ['tabular-nums'] },
});
