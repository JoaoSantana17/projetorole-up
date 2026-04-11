import { setAuthToken } from '@/src/lib/http';
import { AuthResponse } from '@/src/types';
import { storage } from '@/src/utils/storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  auth: AuthResponse | null;
  isBootstrapping: boolean;
  signIn: (data: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthResponse['user']) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await storage.getAuth();
      if (saved) {
        setAuth(saved);
        setAuthToken(saved.token);
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    isBootstrapping,
    signIn: async (data) => {
      setAuth(data);
      setAuthToken(data.token);
      await storage.saveAuth(data);
    },
    signOut: async () => {
      setAuth(null);
      setAuthToken(null);
      await storage.clearAuth();
    },
    updateUser: async (user) => {
      if (!auth) return;
      const next = { ...auth, user };
      setAuth(next);
      await storage.saveAuth(next);
    },
  }), [auth, isBootstrapping]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
