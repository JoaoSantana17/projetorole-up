import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRolesQuery } from '@/src/hooks/queries/useRoles';
import { notificationsService } from '@/src/services/notifications.service';
import { AppNotification, Role } from '@/src/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

  const rolesQuery = useRolesQuery();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
  });

  const notifications = notificationsQuery.data ?? [];

  const activeRolesCount = useMemo(() => {
    return (rolesQuery.data ?? []).filter(
      (role: Role) => role.status?.toLowerCase() === 'ativo'
    ).length;
  }, [rolesQuery.data]);

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

        <Text style={[styles.roleMeta, { color: colors.textMuted }]}>
          📍 {item.endereco}
        </Text>

        {item.dataEvento && (
          <Text style={[styles.roleMeta, { color: colors.textMuted }]}>
            🗓️ {item.dataEvento}
          </Text>
        )}
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
          <TouchableOpacity
            onPress={() => router.push('/criar-role')} // Redireciona para a tela de criação do rolê
            style={[
              styles.notificationButton,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.notificationIcon, { color: colors.primary }]}>
              ✍️
            </Text>
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
                Seus rolês
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Acompanhe eventos e movimentações em tempo real.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {notifications.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Notificações
                </Text>
              </View>
            </View>
          </View>
        }
      />

      <Modal visible={showNotifications} transparent animationType="fade">
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Notificações
            </Text>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notificationLabel(item.tipo)}
                  </Text>

                  <Text style={{ color: colors.text }}>{item.mensagem}</Text>

                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
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
                  <Text style={{ color: colors.textMuted }}>Nenhuma notificação</Text>
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
  heroCard: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900' },
  heroSubtitle: { fontSize: 15 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 12 },

  roleCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 10 },
  roleTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  roleStatus: { fontSize: 12, fontWeight: '800' },
  roleTitle: { fontSize: 20, fontWeight: '900' },
  roleDescription: { fontSize: 14 },
  roleMeta: { fontSize: 13 },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: { fontSize: 18 },

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

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingHorizontal: 16,
  },

  notificationsModal: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },

  notificationCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
    marginBottom: 10,
  },

  notificationTitle: {
    fontWeight: '900',
  },
});