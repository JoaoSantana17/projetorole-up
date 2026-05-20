import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import {
  useDeleteRoleMutation,
  useRoleDetailsQuery,
} from '@/src/hooks/queries/useRoles';
import { feedService } from '@/src/services/feed.service';
import { Post } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DetalhesRoleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  const roleQuery = useRoleDetailsQuery(id);
  const deleteMutation = useDeleteRoleMutation();
  const queryClient = useQueryClient();

  const [novoPost, setNovoPost] = useState('');

  const postsQuery = useQuery({
    queryKey: ['feed-posts', id],
    queryFn: () => feedService.listPostsByRole(id),
    enabled: !!id,
  });

  const createPostMutation = useMutation({
    mutationFn: () =>
      feedService.createPost({
        roleId: id,
        conteudo: novoPost,
      }),
    onSuccess: () => {
      setNovoPost('');
      queryClient.invalidateQueries({ queryKey: ['feed-posts', id] });
      Alert.alert('Sucesso', 'Atualização publicada no feed do rolê.');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error?.response?.data?.message ?? 'Não foi possível publicar.'
      );
    },
  });

  async function handleDelete() {
    Alert.alert(
      'Excluir rolê',
      'Tem certeza que deseja excluir este rolê?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              router.replace('/home');
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error?.response?.data?.message ??
                  'Não foi possível excluir este rolê.'
              );
            }
          },
        },
      ]
    );
  }

  function handleCreatePost() {
    if (!novoPost.trim()) {
      Alert.alert('Atenção', 'Digite uma mensagem para publicar.');
      return;
    }

    createPostMutation.mutate();
  }

  if (roleQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState label="Carregando detalhes" />
      </AppContainer>
    );
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <AppContainer>
        <FeedbackState
          title="Não foi possível carregar os detalhes do rolê."
          actionLabel="Tentar novamente"
          onAction={() => roleQuery.refetch()}
        />
      </AppContainer>
    );
  }

  const role = roleQuery.data;
  const isActive = role.status?.toLowerCase() === 'ativo';

  return (
    <AppContainer>
      <AppHeader
        title="Detalhes"
        back
        rightLabel="Editar"
        onRightPress={() =>
          router.push({
            pathname: '/editar-role/[id]' as any,
            params: { id: role.id },
          })
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>
                {role.tipo || 'Rolê'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isActive ? colors.primarySoft : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.status,
                  { color: isActive ? colors.primary : colors.textMuted },
                ]}
              >
                {role.status || 'Pendente'}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {role.nome}
          </Text>

          <Text style={[styles.description, { color: colors.textMuted }]}>
            {role.descricao ||
              'Confira abaixo as informações principais deste evento.'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/editar-role/[id]' as any,
                params: { id: role.id },
              })
            }
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/apex-presencas/[roleId]' as any,
                params: { roleId: role.id },
              })
            }
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>
              Presenças
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informações do evento
          </Text>

          <View style={styles.infoList}>
            <InfoRow icon="📍" label="Endereço" value={role.endereco} />
            <InfoRow icon="🚇" label="Transporte" value={role.transporte} />
            <InfoRow icon="⏱️" label="Tempo estimado" value={role.eta} />

            {role.dataEvento ? (
              <InfoRow icon="🗓️" label="Data" value={role.dataEvento} />
            ) : null}

            {typeof role.capacidadeMaxima === 'number' ? (
              <InfoRow
                icon="👥"
                label="Capacidade"
                value={`${role.capacidadeMaxima} pessoas`}
              />
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionTop}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Feed do rolê
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Publique atualizações para este evento
              </Text>
            </View>
          </View>

          <AppInput
            label="Nova atualização"
            value={novoPost}
            onChangeText={setNovoPost}
            placeholder="Ex.: Galera, chego em 15 minutos"
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={createPostMutation.isPending}
            style={[
              styles.primaryButton,
              {
                backgroundColor: createPostMutation.isPending
                  ? colors.textMuted
                  : colors.primary,
              },
            ]}
            onPress={handleCreatePost}
          >
            <Text style={styles.primaryButtonText}>
              {createPostMutation.isPending
                ? 'Publicando...'
                : 'Publicar atualização'}
            </Text>
          </TouchableOpacity>

          <View style={styles.postsList}>
            {postsQuery.isLoading ? (
              <LoadingState label="Carregando publicações" />
            ) : postsQuery.data && postsQuery.data.length > 0 ? (
              postsQuery.data.map((item: Post) => (
                <View
                  key={item.id}
                  style={[
                    styles.postCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.postTop}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: colors.primarySoft },
                      ]}
                    >
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {(item.autorNome || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postAuthor, { color: colors.text }]}>
                        {item.autorNome || `Usuário ${item.usuarioId}`}
                      </Text>

                      <Text style={[styles.postMeta, { color: colors.textMuted }]}>
                        {item.dataPostagem
                          ? new Date(item.dataPostagem).toLocaleString('pt-BR')
                          : `Publicação #${item.id}`}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.postContent, { color: colors.text }]}>
                    {item.conteudo}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhuma publicação ainda
                </Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Use o feed para avisos, combinações e atualizações do rolê.
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.primaryButtonText}>
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir rolê'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.infoRow, { borderColor: colors.border }]}>
      <Text style={styles.infoIcon}>{icon}</Text>

      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {value || 'Não informado'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 120,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  chipText: {
    fontWeight: '900',
    fontSize: 12,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  status: {
    fontWeight: '900',
    fontSize: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },

  description: {
    lineHeight: 22,
    fontSize: 15,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },

  actionIcon: {
    fontSize: 22,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '900',
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },

  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  infoList: {
    gap: 10,
  },

  infoRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 22,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '800',
  },

  primaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },

  postsList: {
    gap: 10,
  },

  postCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },

  postTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontWeight: '900',
  },

  postAuthor: {
    fontWeight: '900',
    fontSize: 14,
  },

  postContent: {
    fontSize: 14,
    lineHeight: 21,
  },

  postMeta: {
    fontSize: 12,
  },

  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },

  deleteButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
});