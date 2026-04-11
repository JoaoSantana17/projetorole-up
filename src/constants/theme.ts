import { ThemeMode } from '@/src/types';

export const palette = {
  dark: {
    background: '#11061B',
    surface: '#1D0F2D',
    surfaceAlt: '#2B1841',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.72)',
    primary: '#D90AA4',
    primarySoft: 'rgba(217,10,164,0.16)',
    border: 'rgba(255,255,255,0.10)',
    danger: '#FF5F6D',
    success: '#52D273',
    warning: '#FFCF5A',
    overlay: 'rgba(255,255,255,0.04)',
  },
  light: {
    background: '#F7F4FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F2EAFB',
    text: '#20132F',
    textMuted: '#6C5D7A',
    primary: '#B10C87',
    primarySoft: 'rgba(177,12,135,0.10)',
    border: 'rgba(32,19,47,0.10)',
    danger: '#D7263D',
    success: '#2F9E44',
    warning: '#C27C00',
    overlay: 'rgba(32,19,47,0.03)',
  },
} as const;

export function getTheme(mode: ThemeMode) {
  return palette[mode];
}
