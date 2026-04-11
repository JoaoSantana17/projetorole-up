export type ThemeMode = 'light' | 'dark';

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  username?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  privacidade: 'público' | 'amigos' | 'privado';
};

export type Role = {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  descricao?: string;
  status: string;
  transporte: string;
  eta: string;
  dataEvento?: string;
  capacidadeMaxima?: number;
};

export type RolePayload = Omit<Role, 'id'>;

export type ProfilePayload = {
  nome: string;
  username: string;
};

export type Presence = {
  id: string;
  roleId: string;
  participanteNome: string;
  status: 'CONFIRMADO' | 'AGUARDANDO' | 'CANCELADO';
  observacao?: string;
};

export type PresencePayload = {
  participanteNome: string;
  status: 'CONFIRMADO' | 'AGUARDANDO' | 'CANCELADO';
  observacao?: string;
};

export type FriendshipStatus = 'pendente' | 'aceito' | 'bloqueado';

export type Friendship = {
  id: string;
  usuario1Id: string;
  usuario2Id: string;
  status: FriendshipStatus;
  dataCriacao?: string;
};

export type Post = {
  id: string;
  usuarioId: string;
  roleId: string;
  conteudo: string;
  imagem?: string;
  dataPostagem?: string;
  autorNome?: string;
};

export type Comment = {
  id: string;
  publicacaoId: string;
  usuarioId: string;
  conteudo: string;
  dataComentario?: string;
  autorNome?: string;
};