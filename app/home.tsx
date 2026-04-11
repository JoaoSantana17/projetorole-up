import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRolesQuery } from '@/src/hooks/queries/useRoles';
import { Role } from '@/src/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const { colors } = useAppTheme();
  const rolesQuery = useRolesQuery();

  function renderItem({ item }: { item: Role }) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push(`/detalhes/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeChip, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.typeChipText, { color: colors.primary }]}>{item.tipo}</Text>
          </View>
          <Text style={[styles.status, { color: colors.primary }]}>{item.status}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{item.nome}</Text>
        <Text style={[styles.address, { color: colors.textMuted }]} numberOfLines={2}>
          {item.endereco}
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: colors.text }]}>Transporte: {item.transporte}</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>{item.eta}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Início" rightLabel="Perfil" onRightPress={() => router.push('/perfil')} />

      <FlatList
        contentContainerStyle={styles.list}
        data={rolesQuery.data ?? []}
        keyExtractor={(item, index) => `${item.id ?? 'sem-id'}-${item.nome ?? 'sem-nome'}-${index}`}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={rolesQuery.isRefetching}
            onRefresh={rolesQuery.refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Olá, {auth?.user.nome ?? 'usuário'}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Tudo pronto para o próximo rolê?
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Visualize eventos, acompanhe confirmações e organize tudo com mais praticidade.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/criar-role')}
            >
              <Text style={styles.primaryActionText}>Criar novo rolê</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          rolesQuery.isLoading ? (
            <LoadingState label="Carregando eventos" />
          ) : rolesQuery.isError ? (
            <FeedbackState
              title="Não foi possível carregar seus rolês."
              actionLabel="Tentar novamente"
              onAction={() => rolesQuery.refetch()}
            />
          ) : (
            <FeedbackState title="Você ainda não criou nenhum rolê. Comece criando seu primeiro evento." />
          )
        }
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, 
          gap: 14 },
  hero: { borderWidth: 1, 
          borderRadius: 28, 
          padding: 22, 
          marginBottom: 16 },

  greeting: { fontSize: 14, 
              fontWeight: '700', 
              marginBottom: 6 },

  heroTitle: { fontSize: 28, 
               fontWeight: '900', 
              marginBottom: 8 },

  heroSubtitle: { lineHeight: 22, 
                  fontSize: 15 },

  primaryAction: { paddingVertical: 16, 
                   borderRadius: 18, 
                   alignItems: 'center', 
                   marginBottom: 16 },

  primaryActionText: { color: '#fff', 
                       fontWeight: '900', 
                       fontSize: 16 },

  card: { borderWidth: 1, 
          borderRadius: 22, 
          padding: 18, 
          gap: 10 },

  cardTop: { flexDirection: 'row', 
             justifyContent: 'space-between', 
             alignItems: 'center' },

  typeChip: { paddingHorizontal: 12, 
              paddingVertical: 8, 
              borderRadius: 999 },

  typeChipText: { fontWeight: '800', 
                  fontSize: 12, 
                  textTransform: 'capitalize' },

  status: { fontWeight: '800', 
            fontSize: 12, 
            textTransform: 'capitalize' },

  name: { fontWeight: '900', 
          fontSize: 20 },

  address: { fontSize: 14, 
             lineHeight: 20 },

  infoRow: { flexDirection: 'row', 
             justifyContent: 'space-between', 
             gap: 12 },
             
  infoText: { fontWeight: '600' },
});