import { backendHttp } from '@/src/lib/http';
import { Comment, Post } from '@/src/types';

type BackendPost = {
  id_publicacao: number;
  id_usuario: number;
  id_role: number;
  conteudo: string;
  imagem?: string | null;
  data_postagem?: string;
};

type BackendComment = {
  id_comentario: number;
  id_publicacao: number;
  id_usuario: number;
  conteudo: string;
  data_comentario?: string;
};

function mapPost(item: BackendPost): Post {
  return {
    id: String(item.id_publicacao),
    usuarioId: String(item.id_usuario),
    roleId: String(item.id_role),
    conteudo: item.conteudo,
    imagem: item.imagem ?? undefined,
    dataPostagem: item.data_postagem,
  };
}

function mapComment(item: BackendComment): Comment {
  return {
    id: String(item.id_comentario),
    publicacaoId: String(item.id_publicacao),
    usuarioId: String(item.id_usuario),
    conteudo: item.conteudo,
    dataComentario: item.data_comentario,
  };
}

export const feedService = {
  async listPostsByRole(roleId: string) {
    const { data } = await backendHttp.get<BackendPost[]>(`/feed/roles/${roleId}/publicacoes`);
    return data.map(mapPost);
  },

  async createPost(payload: { roleId: string; conteudo: string; imagem?: string }) {
    const { data } = await backendHttp.post<BackendPost>('/feed/publicacoes', {
      id_role: Number(payload.roleId),
      conteudo: payload.conteudo,
      imagem: payload.imagem ?? null,
    });
    return mapPost(data);
  },

  async listComments(publicacaoId: string) {
    const { data } = await backendHttp.get<BackendComment[]>(
      `/feed/publicacoes/${publicacaoId}/comentarios`
    );
    return data.map(mapComment);
  },

  async createComment(publicacaoId: string, conteudo: string) {
    const { data } = await backendHttp.post<BackendComment>(
      `/feed/publicacoes/${publicacaoId}/comentarios`,
      { conteudo }
    );
    return mapComment(data);
  },
};