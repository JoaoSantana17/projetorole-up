import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { FeedbackState } from '@/components/FeedbackState';
import InputField from '@/components/InputField';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useProfileQuery, useUpdateProfileMutation } from '@/src/hooks/queries/useProfile';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [privacidade, setPrivacidade] = useState<'público' | 'amigos' | 'privado'>('público');

  useEffect(() => {
    if (profileQuery.data) {
      setNome(profileQuery.data.nome ?? '');
      setEmail(profileQuery.data.email ?? '');
      setTelefone(profileQuery.data.telefone ?? '');
      setDataNascimento(profileQuery.data.dataNascimento ?? '');
      setPrivacidade(
        (profileQuery.data.privacidade as 'público' | 'amigos' | 'privado') ?? 'público'
      );
    }
  }, [profileQuery.data]);

  async function handleSave() {
    if (!nome || !email) {
      Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        nome,
        email,
        telefone: telefone || null,
        dataNascimento: dataNascimento || null,
        privacidade,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
      router.replace('/(tabs)/perfil');
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.response?.data?.message ??
          JSON.stringify(error?.response?.data || error?.message || 'Não foi possível salvar o perfil.')
      );
    }
  }

  if (profileQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState label="Carregando perfil para edição" />
      </AppContainer>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <AppContainer>
        <FeedbackState
          title="Não foi possível carregar os dados do perfil."
          actionLabel="Tentar novamente"
          onAction={() => profileQuery.refetch()}
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Editar perfil" back />

      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Atualize seus dados
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            As alterações serão salvas no backend e permanecerão no app.
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
          <InputField
            label="Nome"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
          />

          <InputField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="voce@email.com"
          />

          <InputField
            label="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
          />

          <InputField
            label="Data de nascimento"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.privacySection}>
            <Text style={[styles.privacyLabel, { color: colors.text }]}>
              Privacidade
            </Text>

            <View style={styles.privacyOptions}>
              {(['público', 'amigos', 'privado'] as const).map((option) => {
                const selected = privacidade === option;

                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPrivacidade(option)}
                    style={[
                      styles.privacyButton,
                      {
                        backgroundColor: selected ? colors.primarySoft : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.privacyButtonText,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={updateProfileMutation.isPending}
        >
          <Text style={styles.saveButtonText}>
            {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    paddingBottom: 120,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },

  privacySection: {
    gap: 10,
    marginTop: 4,
  },

  privacyLabel: {
    fontSize: 15,
    fontWeight: '800',
  },

  privacyOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  privacyButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  privacyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});