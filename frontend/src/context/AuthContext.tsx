import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { setSession, clearSession, getStoredUser, getAccessToken } from '../api/client';
import type { AuthUser, LoginResponse, LoginResult, MfaRequiredResponse } from '../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Performs password login. Resolves to a LoginResponse on success, or an
   *  {mfaRequired, tempToken} object if the account requires a second factor. */
  login: (loginId: string, password: string) => Promise<LoginResult>;
  /** Completes login for an MFA-enabled account using the tempToken returned by login(). */
  completeMfaLogin: (tempToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  async function login(login_id: string, password: string): Promise<LoginResult> {
    const data = await api.post<LoginResult>('/auth/login', { login_id, password });
    if ((data as MfaRequiredResponse).mfaRequired) {
      return data as MfaRequiredResponse;
    }
    const loginData = data as LoginResponse;
    setSession(loginData);
    setUser(loginData.user);
    return loginData;
  }

  async function completeMfaLogin(tempToken: string, code: string) {
    const data = await api.post<LoginResponse>('/auth/mfa/login-verify', { tempToken, code });
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!getAccessToken(), login, completeMfaLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
