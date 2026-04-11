import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { feedService } from '@/src/services/feed.service';
import { Post } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FeedScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const [conteudo, setConteudo] = useState('');
  const roleId = '1';

  const { data, isLoading } = useQuery({
    queryKey: ['feed-posts', roleId],
    queryFn: () => feedService.listPostsByRole(roleId),
  });

  const createMutation = useMutation({
    mutationFn: () => feedService.createPost({ roleId, conteudo }),
    onSuccess: () => {
      setConteudo('');
      queryClient.invalidateQueries({ queryKey: ['feed-posts', roleId] });
    },
  });

  function renderItem({ item }: { item: Post }) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Publicação #{item.id}</Text>
        <Text style={{ color: colors.text }}>{item.conteudo}</Text>
        <Text style={{ color: colors.textMuted }}>Role: {item.roleId}</Text>
      </View>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Feed" />
      <View style={{ padding: 20, gap: 16 }}>
        <AppInput
          label="Nova publicação"
          value={conteudo}
          onChangeText={setConteudo}
          placeholder="Compartilhe uma atualização do rolê"
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => createMutation.mutate()}
        >
          <Text style={styles.buttonText}>Publicar</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={{ color: colors.textMuted }}>Nenhuma publicação ainda.</Text>}
          />
        )}
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  button: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '900' },
});