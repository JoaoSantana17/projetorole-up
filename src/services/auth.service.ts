import { backendHttp } from '@/src/lib/http';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/src/types';

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await backendHttp.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await backendHttp.post<AuthResponse>('/auth/register', payload);
    return data;
  },
};
