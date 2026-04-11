import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { feedService } from '@/src/services/feed.service';
import { rolesService } from '@/src/services/roles.service';
import { Comment, Post, Role } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FeedScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();

  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [conteudo, setConteudo] = useState('');
  const [comentariosAbertos, setComentariosAbertos] = useState<Record<string, boolean>>({});
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({});

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.list,
  });

  const filteredRoles = useMemo(() => {
    const roles = rolesQuery.data ?? [];
    const term = roleSearch.trim().toLowerCase();

    if (!term) {
      return roles.slice(0, 6);
    }

    return roles.filter((role: Role) => {
      const nome = role.nome?.toLowerCase() ?? '';
      const tipo = role.tipo?.toLowerCase() ?? '';
      const endereco = role.endereco?.toLowerCase() ?? '';
      return nome.includes(term) || tipo.includes(term) || endereco.includes(term);
    });
  }, [rolesQuery.data, roleSearch]);

  const selectedRole = useMemo(() => {
    return (rolesQuery.data ?? []).find((role: Role) => role.id === selectedRoleId);
  }, [rolesQuery.data, selectedRoleId]);

  const postsQuery = useQuery({
    queryKey: ['feed-posts', selectedRoleId],
    queryFn: () => feedService.listPostsByRole(selectedRoleId),
    enabled: !!selectedRoleId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      feedService.createPost({
        roleId: selectedRoleId,
        conteudo,
      }),
    onSuccess: () => {
      setConteudo('');
      queryClient.invalidateQueries({ queryKey: ['feed-posts', selectedRoleId] });
      Alert.alert('Sucesso', 'Publicação criada.');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        JSON.stringify(error?.response?.data || error?.message || 'Não foi possível publicar.')
      );
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ publicacaoId, conteudo }: { publicacaoId: string; conteudo: string }) =>
      feedService.createComment(publicacaoId, conteudo),
    onSuccess: (_, variables) => {
      setNovoComentario((prev) => ({ ...prev, [variables.publicacaoId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['feed-comments', variables.publicacaoId] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        JSON.stringify(error?.response?.data || error?.message || 'Não foi possível comentar.')
      );
    },
  });

  function formatDate(value?: string) {
    if (!value) return 'Agora há pouco';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pt-BR');
  }

  function CommentsBlock({ publicacaoId }: { publicacaoId: string }) {
    const { data: comments, isLoading: loadingComments } = useQuery({
      queryKey: ['feed-comments', publicacaoId],
      queryFn: () => feedService.listComments(publicacaoId),
      enabled: !!comentariosAbertos[publicacaoId],
    });

    return (
      <View style={styles.commentsWrapper}>
        {loadingComments ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            {(comments ?? []).length > 0 ? (
              (comments ?? []).map((comment: Comment) => (
                <View
                  key={comment.id}
                  style={[
                    styles.commentCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>
                      {comment.autorNome ?? `Usuário ${comment.usuarioId}`}
                    </Text>
                    <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                      {formatDate(comment.dataComentario)}
                    </Text>
                  </View>

                  <Text style={[styles.commentContent, { color: colors.textMuted }]}>
                    {comment.conteudo}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textMuted }}>
                Ainda não há comentários nesta publicação.
              </Text>
            )}

            <AppInput
              label="Novo comentário"
              value={novoComentario[publicacaoId] ?? ''}
              onChangeText={(text) =>
                setNovoComentario((prev) => ({ ...prev, [publicacaoId]: text }))
              }
              placeholder="Escreva um comentário"
            />

            <TouchableOpacity
              style={[styles.commentButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                const texto = (novoComentario[publicacaoId] ?? '').trim();
                if (!texto) {
                  Alert.alert('Atenção', 'Digite um comentário.');
                  return;
                }
                createCommentMutation.mutate({ publicacaoId, conteudo: texto });
              }}
            >
              <Text style={styles.buttonText}>
                {createCommentMutation.isPending ? 'Comentando...' : 'Comentar'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  function renderPost({ item }: { item: Post }) {
    const aberto = !!comentariosAbertos[item.id];
    const roleName = selectedRole?.nome ?? `Rolê #${item.roleId}`;

    return (
      <View
        style={[
          styles.postCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.postTopRow}>
          <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
              {selectedRole?.tipo ?? 'rolê'}
            </Text>
          </View>

          <Text style={[styles.postDate, { color: colors.textMuted }]}>
            {formatDate(item.dataPostagem)}
          </Text>
        </View>

        <Text style={[styles.postRoleName, { color: colors.text }]}>
          {roleName}
        </Text>

        <Text style={[styles.postAuthor, { color: colors.textMuted }]}>
          por {item.autorNome ?? `Usuário ${item.usuarioId}`}
        </Text>

        <Text style={[styles.postContent, { color: colors.text }]}>
          {item.conteudo}
        </Text>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          onPress={() =>
            setComentariosAbertos((prev) => ({
              ...prev,
              [item.id]: !prev[item.id],
            }))
          }
        >
          <Text style={[styles.toggleButtonText, { color: colors.text }]}>
            {aberto ? 'Ocultar comentários' : 'Ver comentários'}
          </Text>
        </TouchableOpacity>

        {aberto && <CommentsBlock publicacaoId={item.id} />}
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Feed" />

      <FlatList
        data={postsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Feed dos rolês
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Escolha um rolê pelo nome, acompanhe as atualizações e converse com os participantes.
              </Text>
            </View>

            <View
              style={[
                styles.selectorCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Escolher rolê
              </Text>

              <AppInput
                label="Buscar rolê pelo nome"
                value={roleSearch}
                onChangeText={setRoleSearch}
                placeholder="Ex.: Resenha de amigos"
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleList}>
                {rolesQuery.isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : filteredRoles.length > 0 ? (
                  filteredRoles.map((role: Role) => {
                    const selected = role.id === selectedRoleId;

                    return (
                      <TouchableOpacity
                        key={role.id}
                        style={[
                          styles.roleOption,
                          {
                            backgroundColor: selected ? colors.primarySoft : colors.background,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedRoleId(role.id);
                          setRoleSearch(role.nome);
                        }}
                      >
                        <Text
                          style={[
                            styles.roleOptionTitle,
                            { color: selected ? colors.primary : colors.text },
                          ]}
                        >
                          {role.nome}
                        </Text>
                        <Text style={[styles.roleOptionMeta, { color: colors.textMuted }]}>
                          {role.tipo} • {role.endereco}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: colors.textMuted }}>
                    Nenhum rolê encontrado.
                  </Text>
                )}
              </ScrollView>
            </View>

            <View
              style={[
                styles.composeCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Nova publicação
              </Text>

              <Text style={{ color: colors.textMuted }}>
                {selectedRole
                  ? `Publicando em: ${selectedRole.nome}`
                  : 'Selecione um rolê para publicar uma atualização.'}
              </Text>

              <AppInput
                label="Atualização do rolê"
                value={conteudo}
                onChangeText={setConteudo}
                placeholder="Compartilhe uma atualização do evento"
              />

              <TouchableOpacity
                style={[styles.publishButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (!selectedRoleId || !conteudo.trim()) {
                    Alert.alert('Atenção', 'Selecione um rolê e escreva uma publicação.');
                    return;
                  }
                  createMutation.mutate();
                }}
              >
                <Text style={styles.buttonText}>
                  {createMutation.isPending ? 'Publicando...' : 'Publicar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Atualizações
              </Text>
              {selectedRole ? (
                <Text style={{ color: colors.textMuted }}>
                  Exibindo posts de {selectedRole.nome}
                </Text>
              ) : (
                <Text style={{ color: colors.textMuted }}>
                  Selecione um rolê para ver o feed relacionado
                </Text>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {postsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhuma publicação ainda
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                  {selectedRole
                    ? `Ainda não há publicações para ${selectedRole.nome}.`
                    : 'Selecione um rolê acima para visualizar ou criar publicações.'}
                </Text>
              </>
            )}
          </View>
        }
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  selectorCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },

  composeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  roleList: {
    gap: 10,
    paddingRight: 8,
  },

  roleOption: {
    width: 220,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },

  roleOptionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  roleOptionMeta: {
    fontSize: 13,
    lineHeight: 18,
  },

  publishButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },

  listHeader: {
    gap: 4,
    marginTop: 4,
  },

  postCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },

  postTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  postDate: {
    fontSize: 12,
  },

  postRoleName: {
    fontSize: 17,
    fontWeight: '900',
  },

  postAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },

  postContent: {
    fontSize: 15,
    lineHeight: 22,
  },

  toggleButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  toggleButtonText: {
    fontWeight: '800',
  },

  commentsWrapper: {
    marginTop: 10,
    gap: 10,
  },

  commentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
  },

  commentAuthor: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },

  commentDate: {
    fontSize: 11,
  },

  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },

  commentButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
});