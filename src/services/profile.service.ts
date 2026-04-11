import { backendHttp } from '@/src/lib/http';
import { AuthUser, ProfilePayload } from '@/src/types';

export const profileService = {
  async me() {
    const { data } = await backendHttp.get<AuthUser>('/users/me');
    return data;
  },
  async update(payload: ProfilePayload) {
    const { data } = await backendHttp.put<AuthUser>('/users/me', payload);
    return data;
  },
};
