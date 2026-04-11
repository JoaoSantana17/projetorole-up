import { backendHttp } from '@/src/lib/http';
import { Role, RolePayload } from '@/src/types';

export const rolesService = {
  async list() {
    const { data } = await backendHttp.get<Role[]>('/roles');
    return data;
  },
  async getById(id: string) {
    const { data } = await backendHttp.get<Role>(`/roles/${id}`);
    return data;
  },
  async create(payload: RolePayload) {
    const { data } = await backendHttp.post<Role>('/roles', payload);
    return data;
  },
  async update(id: string, payload: RolePayload) {
    const { data } = await backendHttp.put<Role>(`/roles/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    await backendHttp.delete(`/roles/${id}`);
  },
};
