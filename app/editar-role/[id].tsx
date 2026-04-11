import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRoleDetailsQuery, useUpdateRoleMutation } from '@/src/hooks/queries/useRoles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditarRoleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roleQuery = useRoleDetailsQuery(id);
  const updateMutation = useUpdateRoleMutation(id);
  const [form, setForm] = useState({ nome: '', tipo: '', endereco: '', descricao: '', status: '', transporte: '', eta: '', dataEvento: '', capacidadeMaxima: '0' });

  useEffect(() => {
    if (!roleQuery.data) return;
    setForm({
      nome: roleQuery.data.nome,
      tipo: roleQuery.data.tipo,
      endereco: roleQuery.data.endereco,
      descricao: roleQuery.data.descricao ?? '',
      status: roleQuery.data.status,
      transporte: roleQuery.data.transporte,
      eta: roleQuery.data.eta,
      dataEvento: roleQuery.data.dataEvento ?? '',
      capacidadeMaxima: String(roleQuery.data.capacidadeMaxima ?? 0),
    });
  }, [roleQuery.data]);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
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
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message ?? 'Não foi possível atualizar o rolê.');
    }
  }

  if (roleQuery.isLoading) return <AppContainer><LoadingState label="Carregando rolê" /></AppContainer>;

  return (
    <AppContainer>
      <AppHeader title="Editar rolê" back />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Atualize os detalhes do evento</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Edite as informações abaixo para manter o rolê sempre atualizado para todos.</Text>
        </View>
        <AppInput label="Nome do rolê" value={form.nome} onChangeText={(nome) => setForm((prev) => ({ ...prev, nome }))} />
        <AppInput label="Categoria" value={form.tipo} onChangeText={(tipo) => setForm((prev) => ({ ...prev, tipo }))} />
        <AppInput label="Endereço" value={form.endereco} onChangeText={(endereco) => setForm((prev) => ({ ...prev, endereco }))} />
        <AppInput label="Descrição" value={form.descricao} onChangeText={(descricao) => setForm((prev) => ({ ...prev, descricao }))} multiline />
        <AppInput label="Status" value={form.status} onChangeText={(status) => setForm((prev) => ({ ...prev, status }))} />
        <AppInput label="Transporte sugerido" value={form.transporte} onChangeText={(transporte) => setForm((prev) => ({ ...prev, transporte }))} />
        <AppInput label="Tempo estimado" value={form.eta} onChangeText={(eta) => setForm((prev) => ({ ...prev, eta }))} />
        <AppInput label="Data do evento" value={form.dataEvento} onChangeText={(dataEvento) => setForm((prev) => ({ ...prev, dataEvento }))} />
        <AppInput label="Capacidade máxima" value={form.capacidadeMaxima} onChangeText={(capacidadeMaxima) => setForm((prev) => ({ ...prev, capacidadeMaxima }))} keyboardType="numeric" />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.buttonText}>{updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}</Text>
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
