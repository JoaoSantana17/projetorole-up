import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useProfileQuery } from '@/src/hooks/queries/useProfile';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function privacyLabel(value?: string) {
  switch (value) {
    case 'amigos':
      return 'Somente amigos';
    case 'privado':
      return 'Privado';
    default:
      return 'Público';
  }
}

export default function PerfilScreen() {
  const router = useRouter();
  const { colors, mode, toggleTheme } = useAppTheme();
  const { signOut } = useAuth();
  const profileQuery = useProfileQuery();

  async function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  }

  if (profileQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState label="Carregando perfil" />
      </AppContainer>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <AppContainer>
        <FeedbackState
          title="Não foi possível carregar seu perfil."
          actionLabel="Tentar novamente"
          onAction={() => profileQuery.refetch()}
        />
      </AppContainer>
    );
  }

  const profile = profileQuery.data;
  const initial = profile.nome?.slice(0, 1)?.toUpperCase() || 'U';

  return (
    <AppContainer>
      <AppHeader
        title="Perfil"
        rightLabel="Editar"
        onRightPress={() => router.push('/editar-perfil')}
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
              {initial}
            </Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {profile.nome || 'Usuário'}
          </Text>

          <Text style={[styles.email, { color: colors.textMuted }]}>
            {profile.email || 'E-mail não informado'}
          </Text>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {privacyLabel(profile.privacidade)}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {mode === 'dark' ? 'Modo escuro' : 'Modo claro'}
              </Text>
            </View>
          </View>
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
            <Text style={styles.statIcon}>🎉</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Ativo</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Status
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
            <Text style={styles.statIcon}>🔒</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {privacyLabel(profile.privacidade)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Privacidade
            </Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informações pessoais
          </Text>

          <InfoRow label="Nome" value={profile.nome} icon="👤" />
          <InfoRow label="E-mail" value={profile.email} icon="✉️" />
          <InfoRow label="Telefone" value={profile.telefone || undefined} icon="📱" />
          <InfoRow
            label="Data de nascimento"
            value={profile.dataNascimento || undefined}
            icon="🎂"
          />
          <InfoRow
            label="Privacidade"
            value={privacyLabel(profile.privacidade)}
            icon="🔐"
          />
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
            Preferências do app
          </Text>

          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Personalize sua experiência visual no Rolé App.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push('/sobre-app')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              ℹ️ Sobre o App
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              {mode === 'dark' ? '☀️ Ativar modo claro' : '🌙 Ativar modo escuro'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/editar-perfil')}
        >
          <Text style={styles.primaryButtonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={handleLogout}
        >
          <Text style={styles.primaryButtonText}>Sair da conta</Text>
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
    borderRadius: 30,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 38,
    fontWeight: '900',
  },

  name: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },

  email: {
    fontSize: 14,
    textAlign: 'center',
  },

  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
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
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },

  statIcon: {
    fontSize: 20,
  },

  statValue: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
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
    paddingVertical: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontWeight: '900',
    fontSize: 15,
  },

  logoutButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
});