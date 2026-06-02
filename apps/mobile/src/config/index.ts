// ============================================
// CanSat Mobile — API Configuration
// ============================================

export const API_CONFIG = {
  // Update these for your deployment
  BASE_URL: __DEV__ ? 'http://10.0.2.2:3001' : 'https://api.cansatorbital.com',
  WS_URL: __DEV__ ? 'http://10.0.2.2:3001' : 'https://api.cansatorbital.com',
};

// Colors matching web design system
export const COLORS = {
  bgPrimary: '#060a14',
  bgSecondary: '#0a0e1a',
  bgCard: 'rgba(15, 20, 35, 0.85)',
  primary: '#00d4ff',
  primaryDim: 'rgba(0, 212, 255, 0.15)',
  secondary: '#ff8c00',
  secondaryDim: 'rgba(255, 140, 0, 0.15)',
  success: '#00ff88',
  danger: '#ff3366',
  textPrimary: '#e0e6ed',
  textSecondary: '#7a8599',
  textMuted: '#4a5568',
  border: 'rgba(0, 212, 255, 0.15)',
};

export const FONTS = {
  heading: 'SpaceGrotesk-Bold',
  body: 'SpaceGrotesk-Regular',
  mono: 'JetBrainsMono-Regular',
};
