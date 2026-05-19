import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRolesQuery } from '@/src/hooks/queries/useRoles';
import {
  clearLocalAppNotifications,
  getLocalAppNotifications,
  LocalAppNotification,
  markAllNotificationsAsRead,
} from '@/src/services/local-app-notifications.service';
import { notificationsService } from '@/src/services/notifications.service';
import { AppNotification, Role } from '@/src/types';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NotificationItem = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'role_created' | 'info';
  dataHora: string;
  lida: boolean;
};

function notificationLabel(tipo: AppNotification['tipo']) {
  switch (tipo) {
    case 'chegou':
      return 'Chegada';
    case 'saiu':
      return 'Saída';
    case 'rolê finalizado':
      return 'Evento';
    default:
      return 'Atualização';
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<
    LocalAppNotification[]
  >([]);

  const rolesQuery = useRolesQuery();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
  });

  const notifications = notificationsQuery.data ?? [];

  const allNotifications: NotificationItem[] = [
    ...localNotifications,
    ...notifications.map((item) => ({
      id: item.id,
      titulo: notificationLabel(item.tipo),
      mensagem: item.mensagem,
      tipo: 'info' as const,
      dataHora: item.dataHora || new Date().toISOString(),
      lida: true,
    })),
  ];

  const unreadNotificationsCount = allNotifications.filter(
    (item) => !item.lida
  ).length;

  const activeRolesCount = useMemo(() => {
    return (rolesQuery.data ?? []).filter(
      (role: Role) => role.status?.toLowerCase() === 'ativo'
    ).length;
  }, [rolesQuery.data]);

  useFocusEffect(
    useCallback(() => {
      async function loadNotifications() {
        const stored = await getLocalAppNotifications();
        setLocalNotifications(stored);
      }

      loadNotifications();
    }, [])
  );

  async function handleOpenNotifications() {
    setShowNotifications(true);

    await markAllNotificationsAsRead();

    const updated = await getLocalAppNotifications();
    setLocalNotifications(updated);
  }

  async function handleClearNotifications() {
    await clearLocalAppNotifications();
    setLocalNotifications([]);
  }

  function renderRole({ item }: { item: Role }) {
    const isActive = item.status?.toLowerCase() === 'ativo';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
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
              {item.tipo || 'Rolê'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? colors.primarySoft : colors.border },
            ]}
          >
            <Text
              style={[
                styles.roleStatus,
                { color: isActive ? colors.primary : colors.textMuted },
              ]}
            >
              {item.status || 'Pendente'}
            </Text>
          </View>
        </View>

        <Text style={[styles.roleTitle, { color: colors.text }]}>
          {item.nome}
        </Text>

        <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
          {item.descricao || 'Sem descrição informada.'}
        </Text>

        <View style={styles.metaGroup}>
          <Text style={[styles.roleMeta, { color: colors.textMuted }]}>
            📍 {item.endereco || 'Endereço não informado'}
          </Text>

          {item.dataEvento && (
            <Text style={[styles.roleMeta, { color: colors.textMuted }]}>
              🗓️ {item.dataEvento}
            </Text>
          )}
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.openDetailsText, { color: colors.primary }]}>
            Ver detalhes →
          </Text>
        </View>
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
          title="Erro ao carregar rolês"
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenNotifications}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.headerIcon}>🔔</Text>

              {unreadNotificationsCount > 0 && (
                <View
                  style={[
                    styles.notificationCount,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.notificationCountText}>
                    {unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/criar-role')}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.createIcon}>＋</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={rolesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderRole}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
                <View>
                  <Text style={[styles.heroEyebrow, { color: colors.primary }]}>
                    Rolé App
                  </Text>

                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    Organize seus rolês com praticidade
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroIconBox,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text style={styles.heroIcon}>🎉</Text>
                </View>
              </View>

              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Crie eventos, acompanhe movimentações e receba notificações em
                tempo real.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/criar-role')}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.primaryButtonText}>Criar novo rolê</Text>
              </TouchableOpacity>
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
                <Text style={styles.statIcon}>📌</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {rolesQuery.data?.length ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Rolês
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
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {activeRolesCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Ativos
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
                <Text style={styles.statIcon}>🔔</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {allNotifications.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Alertas
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Próximos rolês
              </Text>

              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Toque em um card para ver detalhes
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
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum rolê criado ainda
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Crie seu primeiro rolê e comece a organizar seus eventos.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/criar-role')}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyButtonText}>Criar rolê</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showNotifications} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setShowNotifications(false)}
        >
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
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Notificações
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Atualizações recentes do app
                </Text>
              </View>

              {allNotifications.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleClearNotifications}
                  style={[
                    styles.clearButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.clearButtonText, { color: colors.textMuted }]}>
                    Limpar
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={allNotifications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: item.lida ? colors.border : colors.primary,
                    },
                  ]}
                >
                  <View style={styles.notificationTop}>
                    <Text
                      style={[styles.notificationTitle, { color: colors.text }]}
                    >
                      {item.titulo}
                    </Text>

                    {!item.lida && (
                      <View
                        style={[
                          styles.unreadDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>

                  <Text
                    style={[styles.notificationMessage, { color: colors.textMuted }]}
                  >
                    {item.mensagem}
                  </Text>

                  <Text style={[styles.notificationDate, { color: colors.textMuted }]}>
                    {item.dataHora
                      ? new Date(item.dataHora).toLocaleString('pt-BR')
                      : 'Agora'}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                notificationsQuery.isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <View style={styles.emptyNotifications}>
                    <Text style={styles.emptyIcon}>🔕</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                      Nenhuma notificação
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      Quando algo importante acontecer, vai aparecer aqui.
                    </Text>
                  </View>
                )
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIcon: {
    fontSize: 18,
  },

  createIcon: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: -2,
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
  },

  notificationCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  listContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 120,
  },

  headerContent: {
    gap: 16,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },

  heroEyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    maxWidth: 240,
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
    fontSize: 26,
  },

  primaryButton: {
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
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

  sectionHeader: {
    gap: 3,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 13,
  },

  roleCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  roleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  roleStatus: {
    fontSize: 12,
    fontWeight: '900',
  },

  roleTitle: {
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 26,
  },

  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  metaGroup: {
    gap: 4,
  },

  roleMeta: {
    fontSize: 13,
  },

  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 2,
  },

  openDetailsText: {
    fontSize: 13,
    fontWeight: '900',
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
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
    textAlign: 'center',
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 8,
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: '#fff',
    fontWeight: '900',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingHorizontal: 16,
  },

  notificationsModal: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 16,
    maxHeight: '72%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  clearButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },

  notificationCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 6,
    marginBottom: 10,
  },

  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationTitle: {
    fontWeight: '900',
    fontSize: 15,
    flex: 1,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginLeft: 8,
  },

  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },

  notificationDate: {
    fontSize: 12,
    marginTop: 2,
  },

  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
});