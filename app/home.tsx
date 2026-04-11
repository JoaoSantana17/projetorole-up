import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRolesQuery } from '@/src/hooks/queries/useRoles';
import { Role } from '@/src/types';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type DemoNotification = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'chegada' | 'comentario' | 'amizade' | 'finalizado';
  tempo: string;
  destaque?: boolean;
};

const demoNotifications: DemoNotification[] = [
  {
    id: '1',
    titulo: 'João chegou no rolê',
    descricao: 'João confirmou presença e marcou chegada no evento “Happy hour da sexta”.',
    tipo: 'chegada',
    tempo: 'há 2 min',
    destaque: true,
  },
  {
    id: '2',
    titulo: 'Novo comentário no feed',
    descricao: 'Maria comentou em uma publicação do rolê “Esquenta do fim de semestre”.',
    tipo: 'comentario',
    tempo: 'há 8 min',
  },
  {
    id: '3',
    titulo: 'Novo pedido de amizade',
    descricao: 'Pedro Lima enviou um pedido de amizade para você.',
    tipo: 'amizade',
    tempo: 'há 15 min',
  },
  {
    id: '4',
    titulo: 'Rolê finalizado',
    descricao: 'O evento “Reunião do TCC” foi marcado como finalizado.',
    tipo: 'finalizado',
    tempo: 'há 1 h',
  },
];

function notificationLabel(tipo: DemoNotification['tipo']) {
  switch (tipo) {
    case 'chegada':
      return 'Movimentação';
    case 'comentario':
      return 'Feed';
    case 'amizade':
      return 'Social';
    case 'finalizado':
      return 'Evento';
    default:
      return 'Atualização';
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesQuery = useRolesQuery();

  const activeRolesCount = useMemo(() => {
    return (rolesQuery.data ?? []).filter((role: Role) => role.status?.toLowerCase() === 'ativo').length;
  }, [rolesQuery.data]);

  const highlightedNotifications = demoNotifications.filter((item) => item.destaque).length;

  function renderRole({ item }: { item: Role }) {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/detalhes/[id]' as any,
            params: { id: item.id },
          })
        }
        style={[
          styles.roleCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.roleTopRow}>
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {item.tipo}
            </Text>
          </View>
          <Text style={[styles.roleStatus, { color: colors.primary }]}>
            {item.status}
          </Text>
        </View>

        <Text style={[styles.roleTitle, { color: colors.text }]}>{item.nome}</Text>
        <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
          {item.descricao || 'Sem descrição informada.'}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.roleMeta, { color: colors.textMuted }]}>📍 {item.endereco}</Text>
        </View>

        {item.dataEvento ? (
          <Text style={[styles.roleMeta, { color: colors.textMuted }]}>🗓️ {item.dataEvento}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  if (rolesQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState label="Carregando rolês" />
      </AppContainer>
    );
  }

  if (rolesQuery.isError) {
    return (
      <AppContainer>
        <FeedbackState
          title="Não foi possível carregar seus rolês."
          actionLabel="Tentar novamente"
          onAction={() => rolesQuery.refetch()}
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader
        title="Início"
        rightSlot={
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={[
              styles.notificationButton,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.notificationIcon, { color: colors.primary }]}>🔔</Text>
            {demoNotifications.length > 0 ? (
              <View style={[styles.notificationCount, { backgroundColor: colors.primary }]}>
                <Text style={styles.notificationCountText}>{demoNotifications.length > 9 ? '9+' : demoNotifications.length} </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      <FlatList
        data={rolesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderRole}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }}
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
                Seus rolês em destaque
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Acompanhe eventos, interações sociais e movimentações da sua rede em um só lugar.
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
                <Text style={[styles.statValue, { color: colors.text }]}>{rolesQuery.data?.length ?? 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rolês totais</Text>
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
                <Text style={[styles.statValue, { color: colors.text }]}>{activeRolesCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ativos</Text>
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
                <Text style={[styles.statValue, { color: colors.text }]}>{highlightedNotifications}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Urgentes</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos recentes</Text>
              <TouchableOpacity
                onPress={() => router.push('/criar-role')}
                style={[styles.quickAction, { backgroundColor: colors.primarySoft }]}
              >
                <Text style={[styles.quickActionText, { color: colors.primary }]}>Novo rolê</Text>
              </TouchableOpacity>
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum rolê por enquanto</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              Crie seu primeiro evento para começar a organizar sua agenda social.
            </Text>
          </View>
        }
      />

      <Modal visible={showNotifications} animationType="fade" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowNotifications(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.notificationsModal,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Notificações</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Atualizações importantes da sua rede e dos seus rolês
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={demoNotifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12, paddingTop: 8 }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: item.destaque ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={styles.notificationTopRow}>
                    <View style={[styles.notificationTypeBadge, { backgroundColor: colors.primarySoft }]}>
                      <Text style={[styles.notificationTypeText, { color: colors.primary }]}>
                        {notificationLabel(item.tipo)}
                      </Text>
                    </View>
                    <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                      {item.tempo}
                    </Text>
                  </View>

                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {item.titulo}
                  </Text>

                  <Text style={[styles.notificationDescription, { color: colors.textMuted }]}>
                    {item.descricao}
                  </Text>
                </View>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  quickAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },

  quickActionText: {
    fontWeight: '900',
    fontSize: 13,
  },

  roleCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },

  roleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  roleStatus: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  roleTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },

  roleMeta: {
    fontSize: 13,
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

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 18,
  },

  notificationCount: {
    position: 'absolute',
    top: -4,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  notificationCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 16,
  },

  notificationsModal: {
    width: '100%',
    maxHeight: '75%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 240,
  },

  closeButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  closeButtonText: {
    fontWeight: '800',
    fontSize: 13,
  },

  notificationCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },

  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  notificationTypeText: {
    fontSize: 11,
    fontWeight: '900',
  },

  notificationTime: {
    fontSize: 11,
    fontWeight: '700',
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  notificationDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});