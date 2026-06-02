// ============================================
// CanSat Mobile — Admin Login Screen
// JWT authentication modal
// ============================================

import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/config';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // In production, this would call the API:
      // const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();
      // store.setAuth(data.accessToken, data.user);

      // Demo: simulate login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === 'warfareyt2@gmail.com' && password === 'Abbi@123') {
        router.back();
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Connection failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.title}>MISSION CONTROL</Text>
          <Text style={styles.subtitle}>Admin Authentication Required</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="warfareyt2@gmail.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.bgPrimary} />
            ) : (
              <Text style={styles.loginBtnText}>AUTHENTICATE →</Text>
            )}
          </Pressable>
        </View>

        {/* Demo hint */}
        <Text style={styles.hint}>
          Demo: warfareyt2@gmail.com / Abbi@123
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    padding: 24,
  },
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  lockIcon: { fontSize: 32, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: 3, color: COLORS.primary },
  subtitle: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: COLORS.textSecondary },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  errorText: { fontSize: 11, color: COLORS.danger, fontWeight: '600' },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: COLORS.bgPrimary },
  hint: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
