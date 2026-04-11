import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useCreatePresenceMutation, useDeletePresenceMutation, usePresencesQuery, useUpdatePresenceMutation } from '@/src/hooks/queries/usePresences';
import { Presence } from '@/src/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ApexPresencasScreen() {
  const { roleId } = useLocalSearchParams<{ roleId: string }>();
  const { colors } = useAppTheme();
  const presencesQuery = usePresencesQuery(roleId);
  const createMutation = useCreatePresenceMutation(roleId);
  const deleteMutation = useDeletePresenceMutation(roleId);
  const [nome, setNome] = useState('');
  const [observacao, setObservacao] = useState('');
  const [editing, setEditing] = useState<Presence | null>(null);
  const updateMutation = useUpdatePresenceMutation(roleId, editing?.id ?? '');

  async function handleCreateOrUpdate() {
    if (!nome) {
      Alert.alert('Atenção', 'Informe o nome do participante.');
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ participanteNome: nome, observacao, status: 'CONFIRMADO' });
      } else {
        await createMutation.mutateAsync({ participanteNome: nome, observacao, status: 'CONFIRMADO' });
      }
      setNome('');
      setObservacao('');
      setEditing(null);
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message ?? 'Não foi possível processar a confirmação.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message ?? 'Não foi possível excluir a confirmação.');
    }
  }

  function renderPresence({ item }: { item: Presence }) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={styles.cardTop}>
          <Text style={[styles.name, { color: colors.text }]}>{item.participanteNome}</Text>
          <View style={[styles.statusChip, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>{item.status}</Text>
          </View>
        </View>
        {!!item.observacao && <Text style={[styles.note, { color: colors.textMuted }]}>{item.observacao}</Text>}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: colors.surfaceAlt }]} onPress={() => {
            setEditing(item);
            setNome(item.participanteNome);
            setObservacao(item.observacao ?? '');
          }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryAction, { backgroundColor: colors.danger }]} onPress={() => handleDelete(item.id)}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Confirmações" back />
      <View style={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Gerencie a lista de presença</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Adicione participantes, edite observações e mantenha as confirmações do evento sempre atualizadas.</Text>
        </View>

        <AppInput label="Nome do participante" value={nome} onChangeText={setNome} placeholder="Ex.: Maria" />
        <AppInput label="Observação" value={observacao} onChangeText={setObservacao} placeholder="Ex.: chega um pouco mais tarde" />

        <TouchableOpacity style={[styles.submit, { backgroundColor: colors.primary }]} onPress={handleCreateOrUpdate}>
          <Text style={styles.submitText}>
            {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : editing ? 'Salvar confirmação' : 'Adicionar confirmação'}
          </Text>
        </TouchableOpacity>

        {presencesQuery.isLoading ? (
          <LoadingState label="Carregando confirmações" />
        ) : presencesQuery.isError ? (
          <FeedbackState title="Não foi possível consultar as confirmações agora." actionLabel="Tentar novamente" onAction={() => presencesQuery.refetch()} />
        ) : (
          <FlatList
            data={presencesQuery.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderPresence}
            contentContainerStyle={{ paddingVertical: 16, gap: 12, paddingBottom: 40 }}
            ListEmptyComponent={<FeedbackState title="Nenhuma confirmação registrada até o momento." />}
          />
        )}
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
               padding: 24 },

  heroCard: { borderWidth: 1, 
              borderRadius: 24, 
              padding: 20, 
              gap: 8, 
              marginBottom: 16 },

  title: { fontSize: 23, 
           fontWeight: '900' },

  subtitle: { lineHeight: 22, 
              fontSize: 15 },

  submit: { borderRadius: 16, 
            paddingVertical: 16, 
            alignItems: 'center', 
            marginTop: 4 },

  submitText: { color: '#fff', 
                fontWeight: '900', 
                fontSize: 16 },

  card: { borderWidth: 1, 
          borderRadius: 18, 
          padding: 16 },

  cardTop: { flexDirection: 'row', 
             justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 8 },

  name: { fontWeight: '900', 
          fontSize: 17 },

  statusChip: { paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 999 },

  statusText: { fontWeight: '800', 
                fontSize: 12 },

  note: { lineHeight: 20 },

  row: { flexDirection: 'row', 
         gap: 10, 
         marginTop: 14 },

  secondaryAction: { borderRadius: 14, 
                     paddingHorizontal: 16, 
                     paddingVertical: 12 },

  primaryAction: { borderRadius: 14, 
                   paddingHorizontal: 16, 
                  paddingVertical: 12 },
});
