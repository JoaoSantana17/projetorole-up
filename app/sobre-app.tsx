import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import Constants from 'expo-constants';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SobreAppScreen() {
  const { colors } = useAppTheme();

  const appVersion =
    Constants.expoConfig?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    '1.0.0';

  const commitHash =
    Constants.expoConfig?.extra?.commitHash ||
    'ADICIONE_O_HASH_DO_COMMIT';

  return (
    <AppContainer>
      <AppHeader title="Sobre o App" back />

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
          <Text style={styles.icon}>🎉</Text>

          <Text style={[styles.title, { color: colors.text }]}>
            Rolé App
          </Text>

          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Aplicativo mobile desenvolvido em React Native com Expo Router.
          </Text>
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
          <InfoRow label="Nome do app" value="Rolé App" />
          <InfoRow label="Versão publicada" value={appVersion} />
          <InfoRow label="Hash do commit" value={String(commitHash)} />
          <InfoRow label="Tecnologia" value="React Native + Expo" />
          <InfoRow label="Distribuição" value="Firebase App Distribution" />
        </View>
      </ScrollView>
    </AppContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.infoRow, { borderColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
        {label}
      </Text>

      <Text style={[styles.infoValue, { color: colors.text }]}>
        {value}
      </Text>
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
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },

  icon: {
    fontSize: 42,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 10,
  },

  infoRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '900',
  },
});