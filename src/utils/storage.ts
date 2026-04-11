import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, ThemeMode } from '@/src/types';

const AUTH_KEY = 'roleapp.auth';
const THEME_KEY = 'roleapp.theme';

export const storage = {
  async saveAuth(data: AuthResponse) {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
  },
  async getAuth() {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  },
  async clearAuth() {
    await AsyncStorage.removeItem(AUTH_KEY);
  },
  async saveTheme(mode: ThemeMode) {
    await AsyncStorage.setItem(THEME_KEY, mode);
  },
  async getTheme() {
    return (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null;
  },
};
