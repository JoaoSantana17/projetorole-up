import { backendHttp } from '@/src/lib/http';
import { Friendship } from '@/src/types';

type BackendFriendship = {
  id_amizade: number;
  id_usuario_1: number;
  id_usuario_2: number;
  status: 'pendente' | 'aceito' | 'bloqueado';
  data_criacao?: string;
};

function mapFriendship(item: BackendFriendship): Friendship {
  return {
    id: String(item.id_amizade),
    usuario1Id: String(item.id_usuario_1),
    usuario2Id: String(item.id_usuario_2),
    status: item.status,
    dataCriacao: item.data_criacao,
  };
}

export const friendshipsService = {
  async list() {
    const { data } = await backendHttp.get<BackendFriendship[]>('/social/amizades');
    return data.map(mapFriendship);
  },

  async create(targetUserId: string) {
    const { data } = await backendHttp.post<BackendFriendship>('/social/amizades', {
      id_usuario_2: Number(targetUserId),
      status: 'pendente',
    });
    return mapFriendship(data);
  },

  async update(id: string, status: 'aceito' | 'bloqueado') {
    const { data } = await backendHttp.put<BackendFriendship>(`/social/amizades/${id}`, {
      status,
    });
    return mapFriendship(data);
  },
};