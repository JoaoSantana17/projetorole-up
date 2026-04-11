import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useCreateRoleMutation } from '@/src/hooks/queries/useRoles';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CriarRoleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const createMutation = useCreateRoleMutation();
  const [form, setForm] = useState({
    nome: '',
    tipo: '',
    endereco: '',
    descricao: '',
    status: 'EM DESLOCAMENTO',
    transporte: 'METRÔ',
    eta: '15 min',
    dataEvento: '',
    capacidadeMaxima: '50',
  });

  async function handleSubmit() {
    if (!form.nome || !form.tipo || !form.endereco) {
      Alert.alert('Atenção', 'Preencha nome, tipo e endereço.');
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        nome: form.nome,
        tipo: form.tipo,
        endereco: form.endereco,
        descricao: form.descricao,
        status: form.status,
        transporte: form.transporte,
        eta: form.eta,
        dataEvento: form.dataEvento,
        capacidadeMaxima: Number(form.capacidadeMaxima || 0),
      });
      router.replace(`/detalhes/${created.id}`);
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message ?? 'Não foi possível criar o rolê.');
    }
  }

  return (
    <AppContainer>
      <AppHeader title="Novo rolê" back />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Crie um evento do seu jeito</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Preencha as informações principais para compartilhar o rolê com a galera.</Text>
        </View>
        <AppInput label="Nome do rolê" value={form.nome} onChangeText={(nome) => setForm((prev) => ({ ...prev, nome }))} placeholder="Ex.: Happy hour da firma" />
        <AppInput label="Categoria" value={form.tipo} onChangeText={(tipo) => setForm((prev) => ({ ...prev, tipo }))} placeholder="Ex.: bar, show ou churrasco" />
        <AppInput label="Endereço" value={form.endereco} onChangeText={(endereco) => setForm((prev) => ({ ...prev, endereco }))} placeholder="Onde vai acontecer?" />
        <AppInput label="Descrição" value={form.descricao} onChangeText={(descricao) => setForm((prev) => ({ ...prev, descricao }))} multiline placeholder="Conte mais detalhes sobre o evento" />
        <AppInput label="Status" value={form.status} onChangeText={(status) => setForm((prev) => ({ ...prev, status }))} />
        <AppInput label="Transporte sugerido" value={form.transporte} onChangeText={(transporte) => setForm((prev) => ({ ...prev, transporte }))} />
        <AppInput label="Tempo estimado" value={form.eta} onChangeText={(eta) => setForm((prev) => ({ ...prev, eta }))} />
        <AppInput label="Data do evento" value={form.dataEvento} onChangeText={(dataEvento) => setForm((prev) => ({ ...prev, dataEvento }))} placeholder="2026-04-15 20:00" />
        <AppInput label="Capacidade máxima" value={form.capacidadeMaxima} onChangeText={(capacidadeMaxima) => setForm((prev) => ({ ...prev, capacidadeMaxima }))} keyboardType="numeric" />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{createMutation.isPending ? 'Publicando...' : 'Publicar rolê'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },

  heroCard: { borderWidth: 1, 
              borderRadius: 24, 
              padding: 22, 
              gap: 8, 
              marginBottom: 20 },

  title: { fontSize: 24, 
           fontWeight: '900' },

  subtitle: { lineHeight: 22, 
              fontSize: 15 },

  button: { marginTop: 10, 
            borderRadius: 16, 
            paddingVertical: 16, 
            alignItems: 'center', 
            marginBottom: 28 },

  buttonText: { color: '#fff', 
                fontWeight: '900', 
                fontSize: 16 },
});
