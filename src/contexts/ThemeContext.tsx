import { getTheme } from '@/src/constants/theme';
import { ThemeMode } from '@/src/types';
import { storage } from '@/src/utils/storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ReturnType<typeof getTheme>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    (async () => {
      const saved = await storage.getTheme();
      if (saved) setMode(saved);
    })();
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    colors: getTheme(mode),
    toggleTheme: async () => {
      const next = mode === 'dark' ? 'light' : 'dark';
      setMode(next);
      await storage.saveTheme(next);
    },
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
