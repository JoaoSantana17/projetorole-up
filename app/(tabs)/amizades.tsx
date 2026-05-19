import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { friendshipsService } from '@/src/services/friendships.service';
import { Friendship } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type DemoUserDetails = {
  nome: string;
  username: string;
  cidade: string;
  bio: string;
  online: boolean;
  interesses: string[];
};

const demoUserMap: Record<string, DemoUserDetails> = {
  '1': {
    nome: 'João Santana',
    username: '@joaosantana',
    cidade: 'São Paulo, SP',
    bio: 'Curte churrasco, bar com música boa e rolê de última hora.',
    online: true,
    interesses: ['Churrasco', 'Bar', 'Show'],
  },
  '2': {
    nome: 'Maria Clara',
    username: '@mariaclara',
    cidade: 'Osasco, SP',
    bio: 'Ama planejar saídas com a galera e registrar tudo no feed.',
    online: false,
    interesses: ['Café', 'Happy hour', 'Cinema'],
  },
  '3': {
    nome: 'Pedro Lima',
    username: '@pedrolima',
    cidade: 'Santo André, SP',
    bio: 'Sempre topa um show ou um rolê esportivo.',
    online: true,
    interesses: ['Show', 'Esporte', 'Metrô'],
  },
  '4': {
    nome: 'Ana Souza',
    username: '@anasouza',
    cidade: 'Guarulhos, SP',
    bio: 'Gosta de reunir a turma e organizar tudo com antecedência.',
    online: false,
    interesses: ['Reunião', 'TCC', 'Brunch'],
  },
  '5': {
    nome: 'Bruno Costa',
    username: '@brunocosta',
    cidade: 'São Bernardo, SP',
    bio: 'Mais na dele, mas aparece quando o rolê é bom.',
    online: false,
    interesses: ['Bar', 'Jogos', 'Amigos'],
  },
  '6': {
    nome: 'Julia Martins',
    username: '@juliamartins',
    cidade: 'São Paulo, SP',
    bio: 'Sempre ativa no app e nas confirmações.',
    online: true,
    interesses: ['Shows', 'Eventos', 'Planejamento'],
  },
};

function getUserDetails(friendship: Friendship): DemoUserDetails {
  const fallbackId = friendship.usuario2Id || friendship.usuario1Id;

  return (
    demoUserMap[fallbackId] ?? {
      nome: `Usuário ${fallbackId}`,
      username: `@usuario${fallbackId}`,
      cidade: 'Local não informado',
      bio: 'Perfil sem descrição no momento.',
      online: Number(fallbackId) % 2 === 0,
      interesses: ['Rolês', 'Amizades'],
    }
  );
}

function statusLabel(status: Friendship['status']) {
  switch (status) {
    case 'aceito':
      return 'Confirmado';
    case 'bloqueado':
      return 'Bloqueado';
    default:
      return 'Pendente';
  }
}

export default function AmizadesScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();

  const [targetUserId, setTargetUserId] = useState('');
  const [search, setSearch] = useState('');

  const friendshipsQuery = useQuery({
    queryKey: ['amizades'],
    queryFn: friendshipsService.list,
  });

  const createMutation = useMutation({
    mutationFn: () => friendshipsService.create(targetUserId),
    onSuccess: () => {
      setTargetUserId('');
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
      Alert.alert('Sucesso', 'Pedido de amizade enviado.');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        JSON.stringify(
          error?.response?.data || error?.message || 'Não foi possível enviar.'
        )
      );
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => friendshipsService.update(id, 'aceito'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        JSON.stringify(
          error?.response?.data || error?.message || 'Não foi possível aceitar.'
        )
      );
    },
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => friendshipsService.update(id, 'bloqueado'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amizades'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        JSON.stringify(
          error?.response?.data || error?.message || 'Não foi possível bloquear.'
        )
      );
    },
  });

  const friendships = friendshipsQuery.data ?? [];

  const stats = useMemo(() => {
    return {
      total: friendships.length,
      aceitas: friendships.filter((item) => item.status === 'aceito').length,
      pendentes: friendships.filter((item) => item.status === 'pendente').length,
      bloqueadas: friendships.filter((item) => item.status === 'bloqueado').length,
    };
  }, [friendships]);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return friendships;

    return friendships.filter((item) => {
      const user = getUserDetails(item);

      return (
        user.nome.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.cidade.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [friendships, search]);

  function handleSendFriendRequest() {
    if (!targetUserId.trim()) {
      Alert.alert('Atenção', 'Informe o ID do usuário.');
      return;
    }

    createMutation.mutate();
  }

  function renderItem({ item }: { item: Friendship }) {
    const user = getUserDetails(item);
    const isAccepted = item.status === 'aceito';
    const isPending = item.status === 'pendente';
    const isBlocked = item.status === 'bloqueado';

    return (
      <View
        style={[
          styles.friendCard,
          {
            backgroundColor: colors.surface,
            borderColor: isAccepted
              ? colors.primary
              : isBlocked
                ? colors.danger
                : colors.border,
          },
        ]}
      >
        <View style={styles.friendTop}>
          <View style={styles.userRow}>
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
                {user.nome.slice(0, 1).toUpperCase()}
              </Text>

              <View
                style={[
                  styles.onlineDotFloating,
                  {
                    backgroundColor: user.online ? colors.primary : colors.textMuted,
                    borderColor: colors.surface,
                  },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {user.nome}
              </Text>

              <Text style={[styles.username, { color: colors.textMuted }]}>
                {user.username}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isAccepted
                  ? colors.primarySoft
                  : isBlocked
                    ? `${colors.danger}22`
                    : colors.background,
                borderColor: isAccepted
                  ? colors.primary
                  : isBlocked
                    ? colors.danger
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color: isAccepted
                    ? colors.primary
                    : isBlocked
                      ? colors.danger
                      : colors.textMuted,
                },
              ]}
            >
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.city, { color: colors.text }]}>
            📍 {user.cidade}
          </Text>

          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {user.bio}
          </Text>

          <View style={styles.tagsRow}>
            {user.interesses.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.primarySoft }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            Relação #{item.id}
          </Text>

          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            Usuários {item.usuario1Id} e {item.usuario2Id}
          </Text>
        </View>

        {isPending ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => acceptMutation.mutate(item.id)}
            >
              <Text style={styles.primaryButtonText}>
                {acceptMutation.isPending ? 'Aceitando...' : 'Aceitar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => blockMutation.mutate(item.id)}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Bloquear
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.footerBadge,
              {
                backgroundColor: isAccepted
                  ? colors.primarySoft
                  : colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.footerBadgeText,
                {
                  color: isAccepted ? colors.primary : colors.textMuted,
                },
              ]}
            >
              {isAccepted
                ? 'Vocês já podem interagir nos rolês'
                : 'Este usuário está bloqueado'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Amizades" />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
                    REDE SOCIAL
                  </Text>

                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    Monte sua rede para os próximos rolês
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroIconBox,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text style={styles.heroIcon}>🤝</Text>
                </View>
              </View>

              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Envie pedidos, acompanhe amizades pendentes e veja quem já está
                conectado com você.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.statIcon}>👥</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Total
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.statIcon}>✅</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.aceitas}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Aceitas
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.statIcon}>⏳</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.pendentes}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Pendentes
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.actionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Adicionar amizade
              </Text>

              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Digite o ID de um usuário para enviar um pedido de amizade.
              </Text>

              <AppInput
                label="ID do usuário"
                value={targetUserId}
                onChangeText={setTargetUserId}
                keyboardType="numeric"
                placeholder="Ex.: 2"
              />

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={createMutation.isPending}
                style={[
                  styles.fullButton,
                  {
                    backgroundColor: createMutation.isPending
                      ? colors.textMuted
                      : colors.primary,
                  },
                ]}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.primaryButtonText}>
                  {createMutation.isPending ? 'Enviando...' : 'Enviar pedido'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Buscar conexão
              </Text>

              <AppInput
                label="Nome, username, cidade ou status"
                value={search}
                onChangeText={setSearch}
                placeholder="Ex.: Maria, pendente ou São Paulo"
              />
            </View>

            <View style={styles.listHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Conexões
                </Text>

                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  {filteredData.length} relacionamento(s) encontrado(s)
                </Text>
              </View>

              {stats.bloqueadas > 0 && (
                <View
                  style={[
                    styles.blockedBadge,
                    {
                      backgroundColor: `${colors.danger}22`,
                      borderColor: colors.danger,
                    },
                  ]}
                >
                  <Text style={[styles.blockedBadgeText, { color: colors.danger }]}>
                    {stats.bloqueadas} bloqueado(s)
                  </Text>
                </View>
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
            {friendshipsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.emptyIcon}>🫂</Text>

                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhuma amizade encontrada
                </Text>

                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Envie um pedido de amizade para começar a montar sua rede
                  dentro do app.
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

  actionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  searchCard: {
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

  fullButton: {
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listHeader: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  blockedBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  blockedBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },

  friendCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  friendTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },

  userRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },

  onlineDotFloating: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 2,
  },

  name: {
    fontSize: 17,
    fontWeight: '900',
  },

  username: {
    fontSize: 13,
    marginTop: 2,
  },

  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
  },

  infoBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },

  city: {
    fontSize: 14,
    fontWeight: '800',
  },

  bio: {
    fontSize: 14,
    lineHeight: 20,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '800',
  },

  metaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  metaText: {
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontWeight: '900',
    fontSize: 15,
  },

  footerBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  footerBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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