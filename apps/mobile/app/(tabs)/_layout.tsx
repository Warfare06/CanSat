// ============================================
// CanSat Mobile — Tab Layout
// ============================================

import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Sensors: '🔬',
    Map: '🗺',
    Status: '🛰',
  };
  return (
    <Text style={[styles.icon, focused && styles.iconActive]}>
      {icons[label] || '●'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a0e1a',
          borderTopColor: 'rgba(0, 212, 255, 0.08)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#4a5568',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        headerStyle: { backgroundColor: '#060a14' },
        headerTintColor: '#e0e6ed',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
          headerTitle: 'ASTRA MAVEN',
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensors',
          tabBarIcon: ({ focused }) => <TabIcon label="Sensors" focused={focused} />,
          headerTitle: 'SENSOR DATA',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon label="Map" focused={focused} />,
          headerTitle: 'GPS TRACKER',
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ focused }) => <TabIcon label="Status" focused={focused} />,
          headerTitle: 'MISSION STATUS',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
});
