import { apexHttp } from '@/src/lib/http';
import { Presence, PresencePayload } from '@/src/types';

type BackendParticipacao = {
  id_participacao: number;
  id_usuario: number;
  id_role: number;
  meio_transporte?: string | null;
  status?: string | null;
  eta?: number | null;
  hora_entrada?: string | null;
};

function mapStatus(
  status?: string | null
): 'CONFIRMADO' | 'AGUARDANDO' | 'CANCELADO' {
  switch (status) {
    case 'presente':
      return 'CONFIRMADO';
    case 'ausente':
      return 'CANCELADO';
    default:
      return 'AGUARDANDO';
  }
}

function mapBackendParticipacaoToPresence(item: BackendParticipacao): Presence {
  return {
    id: String(item.id_participacao),
    roleId: String(item.id_role),
    participanteNome: `Usuário ${item.id_usuario}`,
    observacao: item.meio_transporte
      ? `Transporte: ${item.meio_transporte}`
      : '',
    status: mapStatus(item.status),
  };
}

function mapPresencePayloadToBackend(payload: PresencePayload) {
  return {
    id_usuario: 1,
    meio_transporte: payload.observacao || 'a pé',
    status:
      payload.status === 'CONFIRMADO'
        ? 'presente'
        : payload.status === 'CANCELADO'
          ? 'ausente'
          : 'em_deslocamento',
    eta: 0,
  };
}

export const apexPresenceService = {
  async list(roleId: string) {
    const { data } = await apexHttp.get<BackendParticipacao[]>(
      `/roles/${roleId}/participacoes`
    );
    return data.map(mapBackendParticipacaoToPresence);
  },

  async create(roleId: string, payload: PresencePayload) {
    const { data } = await apexHttp.post<BackendParticipacao>(
      `/roles/${roleId}/participacoes`,
      mapPresencePayloadToBackend(payload)
    );
    return mapBackendParticipacaoToPresence(data);
  },

  async update(roleId: string, presenceId: string, payload: PresencePayload) {
    const { data } = await apexHttp.put<BackendParticipacao>(
      `/roles/${roleId}/participacoes/${presenceId}`,
      mapPresencePayloadToBackend(payload)
    );
    return mapBackendParticipacaoToPresence(data);
  },

  async remove(roleId: string, presenceId: string) {
    await apexHttp.delete(`/roles/${roleId}/participacoes/${presenceId}`);
  },
};