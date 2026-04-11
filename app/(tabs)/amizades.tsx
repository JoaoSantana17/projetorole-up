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
      return 'Amizade confirmada';
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
        JSON.stringify(error?.response?.data || error?.message || 'Não foi possível enviar.')
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
        JSON.stringify(error?.response?.data || error?.message || 'Não foi possível aceitar.')
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
        JSON.stringify(error?.response?.data || error?.message || 'Não foi possível bloquear.')
      );
    },
  });

  const filteredData = useMemo(() => {
    const list = friendshipsQuery.data ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return list;

    return list.filter((item) => {
      const user = getUserDetails(item);
      return (
        user.nome.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.cidade.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [friendshipsQuery.data, search]);

  function renderItem({ item }: { item: Friendship }) {
    const user = getUserDetails(item);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.topRow}>
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
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{user.nome}</Text>
              <Text style={[styles.username, { color: colors.textMuted }]}>{user.username}</Text>
            </View>
          </View>

          <View
            style={[
              styles.onlineBadge,
              {
                backgroundColor: user.online ? colors.primarySoft : colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: user.online ? colors.primary : colors.textMuted },
              ]}
            />
            <Text
              style={[
                styles.onlineText,
                { color: user.online ? colors.primary : colors.textMuted },
              ]}
            >
              {user.online ? 'Online' : 'Offline'}
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
          <Text style={[styles.statusLabel, { color: colors.text }]}>
            {statusLabel(item.status)}
          </Text>
          <Text style={[styles.city, { color: colors.textMuted }]}>{user.cidade}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>{user.bio}</Text>

          <View style={styles.tagsRow}>
            {user.interesses.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.meta, { color: colors.textMuted }]}>
          Relação #{item.id} • Usuários {item.usuario1Id} e {item.usuario2Id}
        </Text>

        {item.status === 'pendente' ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => acceptMutation.mutate(item.id)}
            >
              <Text style={styles.primaryButtonText}>
                {acceptMutation.isPending ? 'Aceitando...' : 'Aceitar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
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
                backgroundColor: item.status === 'aceito' ? colors.primarySoft : colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.footerBadgeText,
                {
                  color: item.status === 'aceito' ? colors.primary : colors.textMuted,
                },
              ]}
            >
              {item.status === 'aceito'
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
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}
        renderItem={renderItem}
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
                Sua rede de rolês
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Gerencie amizades, acompanhe quem está ativo no app e fortaleça sua rede para
                organizar eventos com mais facilidade.
              </Text>
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

              <AppInput
                label="ID do usuário"
                value={targetUserId}
                onChangeText={setTargetUserId}
                keyboardType="numeric"
                placeholder="Ex.: 2"
              />

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (!targetUserId.trim()) {
                    Alert.alert('Atenção', 'Informe o ID do usuário.');
                    return;
                  }
                  createMutation.mutate();
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {createMutation.isPending ? 'Enviando...' : 'Enviar pedido'}
                </Text>
              </TouchableOpacity>
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
                Buscar amizade
              </Text>

              <AppInput
                label="Nome, username, cidade ou status"
                value={search}
                onChangeText={setSearch}
                placeholder="Ex.: Maria ou pendente"
              />
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Conexões
              </Text>
              <Text style={{ color: colors.textMuted }}>
                {filteredData.length} relacionamento(s) encontrado(s)
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
            {friendshipsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhuma amizade encontrada
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                  Envie um pedido de amizade para começar a montar sua rede dentro do app.
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

  actionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  listHeader: {
    gap: 4,
    marginTop: 4,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },

  topRow: {
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

  name: {
    fontSize: 17,
    fontWeight: '900',
  },

  username: {
    fontSize: 13,
    marginTop: 2,
  },

  onlineBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  onlineText: {
    fontSize: 12,
    fontWeight: '800',
  },

  infoBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },

  statusLabel: {
    fontSize: 15,
    fontWeight: '800',
  },

  city: {
    fontSize: 13,
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

  meta: {
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
    borderRadius: 14,
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