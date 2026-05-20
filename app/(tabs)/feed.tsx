import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRolesQuery } from '@/src/hooks/queries/useRoles';
import { feedService } from '@/src/services/feed.service';
import { Post, Role } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const randomLikes = [12, 8, 21, 5, 34, 18, 27];
const randomComments = [2, 4, 1, 7, 3, 6];

export default function FeedScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const rolesQuery = useRolesQuery();
  const roles = rolesQuery.data ?? [];

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((role: Role) => role.id === selectedRoleId);

  const postsQuery = useQuery({
    queryKey: ['feed-by-role', selectedRoleId],
    queryFn: () => feedService.listPostsByRole(selectedRoleId),
    enabled: !!selectedRoleId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      feedService.createPost({
        roleId: selectedRoleId,
        conteudo: content,
      }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['feed-by-role', selectedRoleId] });
      Alert.alert('Sucesso', 'Post publicado no feed.');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error?.response?.data?.message ?? 'Não foi possível publicar.'
      );
    },
  });

  const posts: Post[] = postsQuery.data ?? [];

  const stats = useMemo(() => {
    return {
      totalPosts: posts.length,
      totalLikes: posts.length * 12,
      activeUsers: posts.length + 3,
    };
  }, [posts]);

  function handleCreatePost() {
    if (!selectedRoleId) {
      Alert.alert('Atenção', 'Selecione um rolê para publicar.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Atenção', 'Digite algo para publicar.');
      return;
    }

    createMutation.mutate();
  }

  function renderPost({ item, index }: { item: Post; index: number }) {
    const likes = randomLikes[index % randomLikes.length];
    const comments = randomComments[index % randomComments.length];

    const authorName = item.autorNome || `Usuário ${item.usuarioId || item.roleId}`;

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
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {authorName}
              </Text>

              <Text style={[styles.postMeta, { color: colors.textMuted }]}>
                {item.dataPostagem
                  ? new Date(item.dataPostagem).toLocaleString('pt-BR')
                  : `Post #${item.id}`}
              </Text>
            </View>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
              Rolê #{item.roleId}
            </Text>
          </View>
        </View>

        <Text style={[styles.postContent, { color: colors.text }]}>
          {item.conteudo}
        </Text>

        <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>❤️</Text>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {likes} curtidas
            </Text>
          </View>

          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>💬</Text>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {comments} comentários
            </Text>
          </View>

          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>📌</Text>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Evento ativo
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Feed" />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.heroTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eyebrow, { color: colors.primary }]}>
                    FEED SOCIAL
                  </Text>

                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    Compartilhe atualizações dos seus rolês
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroIconBox,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text style={styles.heroIcon}>🔥</Text>
                </View>
              </View>

              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Escolha um rolê, publique novidades e acompanhe as atualizações.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={styles.statIcon}>📝</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalPosts}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Posts
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalLikes}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Curtidas
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={styles.statIcon}>🎉</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {roles.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Rolês
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.selectCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Escolha o rolê
              </Text>

              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                A publicação será vinculada ao evento selecionado.
              </Text>

              {rolesQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : roles.length > 0 ? (
                <FlatList
                  data={roles}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rolesList}
                  renderItem={({ item }) => {
                    const selected = item.id === selectedRoleId;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setSelectedRoleId(item.id)}
                        style={[
                          styles.roleOption,
                          {
                            backgroundColor: selected
                              ? colors.primary
                              : colors.background,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleOptionTitle,
                            { color: selected ? '#fff' : colors.text },
                          ]}
                        >
                          {item.nome}
                        </Text>

                        <Text
                          style={[
                            styles.roleOptionSubtitle,
                            { color: selected ? '#fff' : colors.textMuted },
                          ]}
                        >
                          {item.tipo || 'Rolê'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Nenhum rolê encontrado. Crie um rolê antes de publicar no feed.
                </Text>
              )}

              {selectedRole && (
                <View
                  style={[
                    styles.selectedRoleBox,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.selectedRoleTitle, { color: colors.text }]}>
                    Publicando em: {selectedRole.nome}
                  </Text>

                  <Text style={[styles.selectedRoleText, { color: colors.textMuted }]}>
                    📍 {selectedRole.endereco || 'Endereço não informado'}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.createCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Nova publicação
              </Text>

              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Compartilhe uma atualização com a galera.
              </Text>

              <AppInput
                label="O que está acontecendo?"
                value={content}
                onChangeText={setContent}
                multiline
                placeholder="Ex.: Chego em 20 minutos no rolê"
              />

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={createMutation.isPending || !selectedRoleId}
                style={[
                  styles.publishButton,
                  {
                    backgroundColor:
                      createMutation.isPending || !selectedRoleId
                        ? colors.textMuted
                        : colors.primary,
                  },
                ]}
                onPress={handleCreatePost}
              >
                <Text style={styles.publishButtonText}>
                  {createMutation.isPending
                    ? 'Publicando...'
                    : 'Publicar no feed'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.feedHeader}>
              <Text style={[styles.feedTitle, { color: colors.text }]}>
                Últimas atualizações
              </Text>

              <Text style={[styles.feedSubtitle, { color: colors.textMuted }]}>
                {posts.length} publicação(ões)
              </Text>
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
                <Text style={styles.emptyIcon}>📭</Text>

                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhuma publicação neste rolê
                </Text>

                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Selecione um rolê e publique a primeira atualização.
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
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 120,
  },

  headerContent: {
    gap: 16,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIcon: {
    fontSize: 27,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },

  statIcon: {
    fontSize: 18,
  },

  statValue: {
    fontSize: 23,
    fontWeight: '900',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  selectCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  rolesList: {
    gap: 10,
    paddingRight: 4,
  },

  roleOption: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 150,
    gap: 4,
  },

  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },

  roleOptionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
  },

  selectedRoleBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },

  selectedRoleTitle: {
    fontSize: 14,
    fontWeight: '900',
  },

  selectedRoleText: {
    fontSize: 13,
  },

  createCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  publishButton: {
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  publishButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },

  feedHeader: {
    gap: 3,
  },

  feedTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  feedSubtitle: {
    fontSize: 13,
  },

  postCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },

  postHeader: {
    gap: 12,
  },

  authorRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },

  authorName: {
    fontSize: 16,
    fontWeight: '900',
  },

  postMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },

  postContent: {
    fontSize: 15,
    lineHeight: 23,
  },

  postFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },

  footerItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  footerIcon: {
    fontSize: 13,
  },

  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});