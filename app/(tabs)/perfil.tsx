import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useProfileQuery } from '@/src/hooks/queries/useProfile';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const profileQuery = useProfileQuery();

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

  return (
    <AppContainer>
      <AppHeader
        title="Perfil"
        rightLabel="Editar"
        onRightPress={() => router.push('/editar-perfil')}
      />

      <ScrollView contentContainerStyle={styles.container}>
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
              {profile.nome?.slice(0, 1)?.toUpperCase() ?? 'U'}
            </Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {profile.nome}
          </Text>

          <Text style={[styles.email, { color: colors.textMuted }]}>
            {profile.email}
          </Text>

          <View
            style={[
              styles.privacyBadge,
              {
                backgroundColor: colors.primarySoft,
              },
            ]}
          >
            <Text style={[styles.privacyText, { color: colors.primary }]}>
              Privacidade: {profile.privacidade ?? 'público'}
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

          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Nome</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {profile.nome || 'Não informado'}
          </Text>

          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>E-mail</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {profile.email || 'Não informado'}
          </Text>

          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Telefone</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {profile.telefone || 'Não informado'}
          </Text>

          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Data de nascimento</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {profile.dataNascimento || 'Não informada'}
          </Text>

          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Privacidade</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>
            {profile.privacidade || 'público'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/editar-perfil')}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    paddingBottom: 120,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '900',
  },

  name: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  email: {
    fontSize: 14,
    textAlign: 'center',
  },

  privacyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  privacyText: {
    fontSize: 12,
    fontWeight: '800',
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },

  rowValue: {
    fontSize: 15,
    marginTop: 4,
  },

  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});