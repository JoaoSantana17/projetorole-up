import { backendHttp } from '@/src/lib/http';

export type ProfileResponse = {
  id?: string;
  nome: string;
  email: string;
  telefone?: string | null;
  dataNascimento?: string | null;
  privacidade?: 'público' | 'amigos' | 'privado';
};

export type UpdateProfilePayload = {
  nome: string;
  email: string;
  telefone?: string | null;
  dataNascimento?: string | null;
  privacidade?: 'público' | 'amigos' | 'privado';
};

export const profileService = {
  async getMe(): Promise<ProfileResponse> {
    const { data } = await backendHttp.get('/users/me');

    return {
      id: data.id_usuario ? String(data.id_usuario) : undefined,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone ?? null,
      dataNascimento: data.data_nascimento ?? null,
      privacidade: data.privacidade ?? 'público',
    };
  },

  async updateMe(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    const { data } = await backendHttp.put('/users/me', {
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      data_nascimento: payload.dataNascimento,
      privacidade: payload.privacidade,
    });

    return {
      id: data.id_usuario ? String(data.id_usuario) : undefined,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone ?? null,
      dataNascimento: data.data_nascimento ?? null,
      privacidade: data.privacidade ?? 'público',
    };
  },
};