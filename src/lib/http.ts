import { env } from '@/src/config/env';
import axios from 'axios';

export const backendHttp = axios.create({
  baseURL: env.backendBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apexHttp = axios.create({
  baseURL: env.apexBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token?: string | null) {
  const value = token ? `Bearer ${token}` : undefined;
  backendHttp.defaults.headers.common.Authorization = value;
  apexHttp.defaults.headers.common.Authorization = value;
}
