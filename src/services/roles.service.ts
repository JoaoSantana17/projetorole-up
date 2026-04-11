import { backendHttp } from '@/src/lib/http';
import { Role, RolePayload } from '@/src/types';

type BackendRole = {
  id_role: number;
  id_criador: number;
  nome: string;
  descricao?: string | null;
  localizacao?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  tipo?: string | null;
  status: string;
};

function mapBackendRoleToApp(role: BackendRole): Role {
  return {
    id: String(role.id_role),
    nome: role.nome,
    tipo: role.tipo ?? 'outro',
    endereco: role.localizacao ?? 'Local não informado',
    descricao: role.descricao ?? '',
    status: role.status ?? 'ativo',
    transporte: 'Não informado',
    eta: 'Não informado',
    dataEvento: role.data_inicio ?? undefined,
    capacidadeMaxima: undefined,
  };
}

function mapAppRoleToBackend(payload: RolePayload) {
  return {
    nome: payload.nome,
    descricao: payload.descricao || null,
    localizacao: payload.endereco || null,
    data_inicio: payload.dataEvento || null,
    tipo: payload.tipo || 'outro',
    status: payload.status?.toLowerCase() === 'finalizado' ? 'finalizado' : 'ativo',
  };
}

export const rolesService = {
  async list() {
    const { data } = await backendHttp.get<BackendRole[]>('/roles');
    return data.map(mapBackendRoleToApp);
  },

  async getById(id: string) {
    const { data } = await backendHttp.get<BackendRole>(`/roles/${id}`);
    return mapBackendRoleToApp(data);
  },

  async create(payload: RolePayload) {
    const { data } = await backendHttp.post<BackendRole>('/roles', mapAppRoleToBackend(payload));
    return mapBackendRoleToApp(data);
  },

  async update(id: string, payload: RolePayload) {
    const { data } = await backendHttp.put<BackendRole>(`/roles/${id}`, mapAppRoleToBackend(payload));
    return mapBackendRoleToApp(data);
  },

  async remove(id: string) {
    await backendHttp.delete(`/roles/${id}`);
  },
};