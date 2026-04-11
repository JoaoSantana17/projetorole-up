import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useDeleteRoleMutation, useRoleDetailsQuery } from '@/src/hooks/queries/useRoles';
import { feedService } from '@/src/services/feed.service';
import { Post } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DetalhesRoleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const roleQuery = useRoleDetailsQuery(id);
  const deleteMutation = useDeleteRoleMutation();
  const queryClient = useQueryClient();
  const [novoPost, setNovoPost] = useState('');
  const [comentariosAbertos, setComentariosAbertos] = useState<Record<string, boolean>>({});
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({});

const createCommentMutation = useMutation({
  mutationFn: ({ publicacaoId, conteudo }: { publicacaoId: string; conteudo: string }) =>
    feedService.createComment(publicacaoId, conteudo),
  onSuccess: (_, variables) => {
    setNovoComentario((prev) => ({ ...prev, [variables.publicacaoId]: '' }));
    queryClient.invalidateQueries({ queryKey: ['feed-comments', variables.publicacaoId] });
  },
  onError: (error: any) => {
    Alert.alert(
      'Erro',
      JSON.stringify(error?.response?.data || error?.message || 'Não foi possível comentar.')
    );
  },
});

const postsQuery = useQuery({
  queryKey: ['feed-posts', id],
  queryFn: () => feedService.listPostsByRole(id),
  enabled: !!id,
});

const createPostMutation = useMutation({
  mutationFn: () =>
    feedService.createPost({
      roleId: id,
      conteudo: novoPost,
    }),
  onSuccess: () => {
    setNovoPost('');
    queryClient.invalidateQueries({ queryKey: ['feed-posts', id] });
    Alert.alert('Sucesso', 'Atualização publicada no feed do rolê.');
  },
  onError: (error: any) => {
    Alert.alert(
      'Erro',
      JSON.stringify(error?.response?.data || error?.message || 'Não foi possível publicar.')
    );
  },
});

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      router.replace('/(tabs)/home');
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
        
    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>Feed do rolê</Text>

  <Text style={{ color: colors.textMuted, marginBottom: 8 }}>
    Aqui vão aparecer atualizações relacionadas a este rolê.
  </Text>

  <AppInput
    label="Nova atualização"
    value={novoPost}
    onChangeText={setNovoPost}
    placeholder="Ex.: Galera, chego em 15 minutos"
  />

  <TouchableOpacity
    style={[styles.button, { backgroundColor: colors.primary, marginTop: 12 }]}
    onPress={() => {
      if (!novoPost.trim()) {
        Alert.alert('Atenção', 'Digite uma mensagem para publicar.');
        return;
      }
      createPostMutation.mutate();
    }}
  >
    <Text style={styles.buttonText}>
      {createPostMutation.isPending ? 'Publicando...' : 'Publicar no feed'}
    </Text>
  </TouchableOpacity>

  <View style={{ marginTop: 16, gap: 10 }}>
    {postsQuery.isLoading ? (
      <LoadingState label="Carregando publicações" />
    ) : postsQuery.data && postsQuery.data.length > 0 ? (
      postsQuery.data.map((item: Post) => (
        <View
          key={item.id}
          style={[
            styles.postCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.postAuthor, { color: colors.text }]}>
            Usuário {item.usuarioId}
          </Text>
          <Text style={[styles.postContent, { color: colors.text }]}>
            {item.conteudo}
          </Text>
          <Text style={[styles.postMeta, { color: colors.textMuted }]}>
            Publicação #{item.id}
          </Text>
        </View>
      ))
    ) : (
      <Text style={{ color: colors.textMuted }}>
        Ainda não há publicações para este rolê.
      </Text>
    )}
  </View>
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

  postCard: { borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              gap: 4,
              marginTop: 4, },

postAuthor: { fontWeight: '800',
              fontSize: 14, },

postContent: { fontSize: 14,
               lineHeight: 20, },

postMeta: { fontSize: 12,},

commentCard: {
  borderWidth: 1,
  borderRadius: 14,
  padding: 12,
  gap: 4, },

commentAuthor: {
  fontWeight: '800',
  fontSize: 13, },

commentContent: {
  fontSize: 14,
  lineHeight: 20, },

commentMeta: {
  fontSize: 12, },

commentToggle: {
  borderWidth: 1,
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'center',
  marginTop: 8, },

commentToggleText: {
  fontWeight: '800', },

});
