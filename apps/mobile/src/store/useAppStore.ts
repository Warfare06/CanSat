// ============================================
// CanSat Mobile — Zustand Store
// Manages auth state, telemetry data, and connection status
// ============================================

import { create } from 'zustand';
import type { TelemetryPacket, MissionStatus } from '@cansat/shared';

interface AuthState {
  accessToken: string | null;
  user: { id: string; username: string; role: string } | null;
  isAuthenticated: boolean;
}

interface TelemetryState {
  latestPacket: TelemetryPacket | null;
  missionStatus: MissionStatus | null;
  isConnected: boolean;
  isLive: boolean;
}

interface AppStore extends AuthState, TelemetryState {
  // Auth actions
  setAuth: (token: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  // Telemetry actions
  updateTelemetry: (packet: TelemetryPacket) => void;
  setMissionStatus: (status: MissionStatus) => void;
  setConnected: (connected: boolean) => void;
  setLive: (live: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Auth state
  accessToken: null,
  user: null,
  isAuthenticated: false,

  // Telemetry state
  latestPacket: null,
  missionStatus: null,
  isConnected: false,
  isLive: false,

  // Auth actions
  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  // Telemetry actions
  updateTelemetry: (packet) => set({ latestPacket: packet }),
  setMissionStatus: (status) => set({ missionStatus: status }),
  setConnected: (connected) => set({ isConnected: connected }),
  setLive: (live) => set({ isLive: live }),
}));
