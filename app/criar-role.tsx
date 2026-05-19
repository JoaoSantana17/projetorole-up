import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useCreateRoleMutation } from '@/src/hooks/queries/useRoles';
import { notifyRoleCreated } from '@/src/services/local-notifications.service';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CriarRoleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const createMutation = useCreateRoleMutation();

  const [form, setForm] = useState({
    nome: '',
    tipo: '',
    endereco: '',
    descricao: '',
    status: 'ATIVO',
    transporte: 'METRÔ',
    eta: '15 min',
    dataEvento: '',
    capacidadeMaxima: '50',
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.tipo.trim() || !form.endereco.trim()) {
      Alert.alert('Atenção', 'Preencha nome, categoria e endereço.');
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

      await notifyRoleCreated(form.nome);

      router.replace(`/detalhes/${created.id}`);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.response?.data?.message ?? 'Não foi possível criar o rolê.'
      );
    }
  }

  return (
    <AppContainer>
      <AppHeader title="Novo rolê" back />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                CRIAÇÃO DE EVENTO
              </Text>

              <Text style={[styles.title, { color: colors.text }]}>
                Monte um rolê para compartilhar com a galera
              </Text>
            </View>

            <View
              style={[
                styles.heroIconBox,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={styles.heroIcon}>🎉</Text>
            </View>
          </View>

          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Preencha os dados principais. Depois de publicar, o rolê aparece na
            Home e gera uma notificação no app.
          </Text>
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informações principais
          </Text>

          <AppInput
            label="Nome do rolê"
            value={form.nome}
            onChangeText={(value) => updateField('nome', value)}
            placeholder="Ex.: Happy hour da firma"
          />

          <AppInput
            label="Categoria"
            value={form.tipo}
            onChangeText={(value) => updateField('tipo', value)}
            placeholder="Ex.: Bar, show, churrasco"
          />

          <AppInput
            label="Endereço"
            value={form.endereco}
            onChangeText={(value) => updateField('endereco', value)}
            placeholder="Onde vai acontecer?"
          />

          <AppInput
            label="Descrição"
            value={form.descricao}
            onChangeText={(value) => updateField('descricao', value)}
            placeholder="Conte mais detalhes sobre o evento"
            multiline
          />
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Detalhes do rolê
          </Text>

          <AppInput
            label="Status"
            value={form.status}
            onChangeText={(value) => updateField('status', value)}
            placeholder="Ex.: ATIVO"
          />

          <AppInput
            label="Transporte sugerido"
            value={form.transporte}
            onChangeText={(value) => updateField('transporte', value)}
            placeholder="Ex.: Metrô, Uber, ônibus"
          />

          <AppInput
            label="Tempo estimado"
            value={form.eta}
            onChangeText={(value) => updateField('eta', value)}
            placeholder="Ex.: 15 min"
          />

          <AppInput
            label="Data do evento"
            value={form.dataEvento}
            onChangeText={(value) => updateField('dataEvento', value)}
            placeholder="Ex.: 2026-05-25 20:00"
          />

          <AppInput
            label="Capacidade máxima"
            value={form.capacidadeMaxima}
            onChangeText={(value) => updateField('capacidadeMaxima', value)}
            keyboardType="numeric"
            placeholder="Ex.: 50"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={createMutation.isPending}
          style={[
            styles.button,
            {
              backgroundColor: createMutation.isPending
                ? colors.textMuted
                : colors.primary,
            },
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {createMutation.isPending ? 'Publicando...' : 'Publicar rolê'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footerHint, { color: colors.textMuted }]}>
          Depois de publicado, você poderá editar ou excluir o rolê na tela de
          detalhes.
        </Text>
      </ScrollView>
    </AppContainer>
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
    padding: 20,
    gap: 14,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIcon: {
    fontSize: 27,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },

  button: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },

  footerHint: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
});