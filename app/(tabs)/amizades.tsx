import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { friendshipsService } from '@/src/services/friendships.service';
import { Friendship } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AmizadesScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['amizades'],
    queryFn: friendshipsService.list,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => friendshipsService.update(id, 'aceito'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amizades'] }),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => friendshipsService.update(id, 'bloqueado'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amizades'] }),
  });

  function renderItem({ item }: { item: Friendship }) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Amizade #{item.id}</Text>
        <Text style={{ color: colors.textMuted }}>Status: {item.status}</Text>

        {item.status === 'pendente' && (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => acceptMutation.mutate(item.id)}
            >
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, { borderColor: colors.border }]}
              onPress={() => blockMutation.mutate(item.id)}
            >
              <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>Bloquear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Amizades" />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ color: colors.textMuted }}>Nenhuma amizade encontrada.</Text>}
        />
      )}
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
  buttonText: { color: '#fff', fontWeight: '800' },
  buttonSecondary: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  buttonSecondaryText: { fontWeight: '800' },
});