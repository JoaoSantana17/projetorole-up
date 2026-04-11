import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useDeleteRoleMutation, useRoleDetailsQuery } from '@/src/hooks/queries/useRoles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DetalhesRoleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const roleQuery = useRoleDetailsQuery(id);
  const deleteMutation = useDeleteRoleMutation();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message ?? 'Não foi possível excluir este rolê.');
    }
  }

  if (roleQuery.isLoading) {
    return <AppContainer><LoadingState label="Carregando detalhes" /></AppContainer>;
  }

  if (roleQuery.isError || !roleQuery.data) {
    return <AppContainer><FeedbackState title="Não foi possível carregar os detalhes do rolê." actionLabel="Tentar novamente" onAction={() => roleQuery.refetch()} /></AppContainer>;
  }

  const role = roleQuery.data;

  return (
    <AppContainer>
      <AppHeader title="Detalhes do rolê" back rightLabel="Editar" onRightPress={() => router.push({ pathname: '/editar-role/[id]' as any, params: { id: role.id } })} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.topRow}>
            <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>{role.tipo}</Text>
            </View>
            <Text style={[styles.status, { color: colors.primary }]}>{role.status}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{role.nome}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{role.descricao || 'Confira abaixo as informações principais deste evento.'}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações do evento</Text>
          <Text style={[styles.row, { color: colors.text }]}>📍 {role.endereco}</Text>
          <Text style={[styles.row, { color: colors.text }]}>🚇 {role.transporte}</Text>
          <Text style={[styles.row, { color: colors.text }]}>⏱️ {role.eta}</Text>
          {role.dataEvento ? <Text style={[styles.row, { color: colors.text }]}>🗓️ {role.dataEvento}</Text> : null}
          {typeof role.capacidadeMaxima === 'number' ? <Text style={[styles.row, { color: colors.text }]}>👥 {role.capacidadeMaxima} vagas</Text> : null}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push({ pathname: '/apex-presencas/[roleId]' as any, params: { roleId: role.id } })}>
          <Text style={styles.buttonText}>Gerenciar confirmações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.danger }]} onPress={handleDelete}>
          <Text style={styles.buttonText}>{deleteMutation.isPending ? 'Excluindo...' : 'Excluir rolê'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, 
               gap: 14 },

  heroCard: { borderWidth: 1, 
              borderRadius: 26, 
              padding: 22, 
              gap: 10 },

  topRow: { flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center' },

  chip: { paddingHorizontal: 12, 
          paddingVertical: 8, 
          borderRadius: 999 },

  chipText: { fontWeight: '800', 
              fontSize: 12 },

  status: { fontWeight: '800', 
            fontSize: 12 },

  title: { fontSize: 28, 
           fontWeight: '900' },

  description: { lineHeight: 22, 
                 fontSize: 15 },

  infoCard: { borderWidth: 1, 
              borderRadius: 22, 
              padding: 18 },

  sectionTitle: { fontSize: 16, 
                  fontWeight: '800', 
                  marginBottom: 10 },

  row: { marginTop: 8, 
         fontSize: 15 },

  button: { borderRadius: 16, 
            paddingVertical: 16, 
            alignItems: 'center' },

  deleteButton: { borderRadius: 16, 
                  paddingVertical: 16, 
                  alignItems: 'center' },

  buttonText: { color: '#fff', 
                fontWeight: '900', 
                fontSize: 16 },
});
