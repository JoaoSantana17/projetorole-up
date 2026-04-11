import { AppContainer } from '@/components/AppContainer';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function IndexPage() {
  const router = useRouter();
  const { auth, isBootstrapping } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (isBootstrapping) return;
    router.replace(auth ? '/(tabs)/home' : '/login');
  }, [auth, isBootstrapping, router]);

  return (
    <AppContainer>
      <View style={styles.container}>
        <View style={[styles.brandCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badge, { color: colors.primary, backgroundColor: colors.primarySoft }]}>
            Sua agenda social em um só lugar
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Rolê App</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Organize, acompanhe confirmações e gerencie seus eventos com uma experiência simples e moderna.
          </Text>
        </View>
        <LoadingState label="Preparando sua experiência" />
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 18 },

  brandCard: { borderWidth: 1, borderRadius: 28, padding: 24, gap: 10 },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '800',
    fontSize: 12,
  },

  title: { fontSize: 34, fontWeight: '900' },

  subtitle: { lineHeight: 22, fontSize: 15 },
});