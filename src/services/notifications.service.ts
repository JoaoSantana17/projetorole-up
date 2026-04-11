import { backendHttp } from '@/src/lib/http';
import { AppNotification, NotificationType } from '@/src/types';

type BackendNotification = {
  id_notificacao: number;
  id_usuario: number;
  mensagem: string;
  tipo: NotificationType;
  data_hora?: string;
};

function mapNotification(item: BackendNotification): AppNotification {
  return {
    id: String(item.id_notificacao),
    mensagem: item.mensagem,
    tipo: item.tipo,
    dataHora: item.data_hora,
  };
}

export const notificationsService = {
  async list() {
    const { data } = await backendHttp.get<BackendNotification[]>('/social/notificacoes');
    return data.map(mapNotification);
  },

  async create(payload: { mensagem: string; tipo: NotificationType }) {
    const { data } = await backendHttp.post<BackendNotification>('/social/notificacoes', payload);
    return mapNotification(data);
  },
};