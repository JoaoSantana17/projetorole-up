import { apexHttp } from '@/src/lib/http';
import { Presence, PresencePayload } from '@/src/types';

export const apexPresenceService = {
  async list(roleId: string) {
    const { data } = await apexHttp.get<Presence[]>(`/roles/${roleId}/presences`);
    return data;
  },
  async create(roleId: string, payload: PresencePayload) {
    const { data } = await apexHttp.post<Presence>(`/roles/${roleId}/presences`, payload);
    return data;
  },
  async update(roleId: string, presenceId: string, payload: PresencePayload) {
    const { data } = await apexHttp.put<Presence>(`/roles/${roleId}/presences/${presenceId}`, payload);
    return data;
  },
  async remove(roleId: string, presenceId: string) {
    await apexHttp.delete(`/roles/${roleId}/presences/${presenceId}`);
  },
};
