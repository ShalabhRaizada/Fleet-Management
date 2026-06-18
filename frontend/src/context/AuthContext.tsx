import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { setSession, clearSession, getStoredUser, getAccessToken } from '../api/client';
import type { AuthUser, LoginResponse } from '../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  async function login(login_id: string, password: string) {
    const data = await api.post<LoginResponse>('/auth/login', { login_id, password });
    setSession(data);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort
    }
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!getAccessToken(), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
