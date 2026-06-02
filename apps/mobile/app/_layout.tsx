// ============================================
// CanSat Mobile — Root Layout (Expo Router)
// ============================================

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#060a14' },
          headerTintColor: '#00d4ff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 14,
            letterSpacing: 1,
          },
          contentStyle: { backgroundColor: '#060a14' },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'ADMIN LOGIN',
            presentation: 'modal',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060a14',
  },
});
