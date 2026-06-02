// ============================================
// CanSat Mobile — Mission Status Screen
// ============================================

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/config';

const missionPhases = [
  { phase: 'PRE-LAUNCH', time: 'T-00:10:00', status: 'complete', detail: 'Systems check passed' },
  { phase: 'LAUNCH', time: 'T+00:00:00', status: 'complete', detail: 'Balloon release confirmed' },
  { phase: 'ASCENT', time: 'T+00:01:30', status: 'complete', detail: 'Rising at 8.9 m/s' },
  { phase: 'APOGEE', time: 'T+00:02:00', status: 'complete', detail: 'Max altitude: 1,000m' },
  { phase: 'DESCENT', time: 'T+00:02:30', status: 'active', detail: 'Parachute deployed, 2.5 m/s' },
  { phase: 'LANDING', time: 'T+00:09:00', status: 'pending', detail: 'Estimated landing zone' },
  { phase: 'RECOVERY', time: '—', status: 'pending', detail: 'GPS-guided recovery' },
];

export default function StatusScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mission Header */}
      <View style={styles.missionHeader}>
        <Text style={styles.missionName}>ASTRA MAVEN</Text>
        <Text style={styles.missionSubtitle}>CANSAT MISSION ALPHA</Text>
        <View style={styles.missionBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.missionStatus}>IN PROGRESS</Text>
        </View>
      </View>

      {/* Phase Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.cardTitle}>MISSION TIMELINE</Text>
        {missionPhases.map((phase, i) => (
          <View key={phase.phase} style={styles.phaseRow}>
            {/* Timeline dot & line */}
            <View style={styles.timelineDotContainer}>
              <View
                style={[
                  styles.timelineDot,
                  phase.status === 'complete' && styles.dotComplete,
                  phase.status === 'active' && styles.dotActive,
                  phase.status === 'pending' && styles.dotPending,
                ]}
              />
              {i < missionPhases.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    phase.status !== 'pending' && styles.lineActive,
                  ]}
                />
              )}
            </View>
            {/* Phase info */}
            <View style={styles.phaseInfo}>
              <View style={styles.phaseHeader}>
                <Text
                  style={[
                    styles.phaseName,
                    phase.status === 'active' && { color: COLORS.primary },
                  ]}
                >
                  {phase.phase}
                </Text>
                <Text style={styles.phaseTime}>{phase.time}</Text>
              </View>
              <Text style={styles.phaseDetail}>{phase.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={styles.statNumber}>04:23</Text>
          <Text style={styles.statLabel}>ELAPSED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📡</Text>
          <Text style={styles.statNumber}>12,847</Text>
          <Text style={styles.statLabel}>PACKETS RX</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💾</Text>
          <Text style={styles.statNumber}>2.4 MB</Text>
          <Text style={styles.statLabel}>DATA SIZE</Text>
        </View>
      </View>

      {/* Admin Login */}
      <Pressable
        style={styles.loginButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginText}>🔐 ADMIN LOGIN</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  // Mission Header
  missionHeader: { alignItems: 'center', paddingVertical: 16 },
  missionName: { fontSize: 22, fontWeight: '900', letterSpacing: 3, color: COLORS.primary },
  missionSubtitle: { fontSize: 9, fontWeight: '600', letterSpacing: 2, color: COLORS.textMuted, marginTop: 4 },
  missionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.25)',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  missionStatus: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: COLORS.success },
  // Timeline
  timelineCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: COLORS.textSecondary, marginBottom: 16 },
  phaseRow: { flexDirection: 'row', gap: 12, minHeight: 50 },
  timelineDotContainer: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  dotComplete: { backgroundColor: COLORS.success },
  dotActive: { backgroundColor: COLORS.primary, borderWidth: 2, borderColor: 'rgba(0, 212, 255, 0.4)' },
  dotPending: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.textMuted },
  timelineLine: { flex: 1, width: 1, backgroundColor: COLORS.textMuted, opacity: 0.2, marginVertical: 4 },
  lineActive: { backgroundColor: COLORS.success, opacity: 0.5 },
  phaseInfo: { flex: 1, paddingBottom: 8 },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseName: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.5 },
  phaseTime: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, fontVariant: ['tabular-nums'] },
  phaseDetail: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statNumber: { fontSize: 14, fontWeight: '800', color: COLORS.primary, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 1, color: COLORS.textMuted, marginTop: 4 },
  // Login
  loginButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)',
    backgroundColor: 'rgba(255, 140, 0, 0.05)',
    padding: 14,
    alignItems: 'center',
  },
  loginText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: COLORS.secondary },
});
