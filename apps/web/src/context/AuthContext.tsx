import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo admin credentials (in production this calls /api/auth/login)
const DEMO_ADMIN: User = {
  id: 'admin-001',
  username: 'Abbisek S',
  email: 'warfareyt2@gmail.com',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cansat_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user) setUser(parsed.user);
      } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // In production, this calls: POST /api/auth/login
    // For demo, accept hardcoded credentials
    if (email === 'warfareyt2@gmail.com' && password === 'Abbi@123') {
      setUser(DEMO_ADMIN);
      localStorage.setItem('cansat_auth', JSON.stringify({ user: DEMO_ADMIN, token: 'demo-jwt-token' }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cansat_auth');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
