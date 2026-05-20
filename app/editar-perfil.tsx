import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { FeedbackState } from '@/components/FeedbackState';
import { LoadingState } from '@/components/LoadingState';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/src/hooks/queries/useProfile';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type PrivacyOption = 'público' | 'amigos' | 'privado';

const privacyOptions: {
  value: PrivacyOption;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'público',
    title: 'Público',
    description: 'Todos podem ver seu perfil.',
    icon: '🌎',
  },
  {
    value: 'amigos',
    title: 'Amigos',
    description: 'Apenas amigos veem seus dados.',
    icon: '👥',
  },
  {
    value: 'privado',
    title: 'Privado',
    description: 'Seu perfil fica mais restrito.',
    icon: '🔒',
  },
];

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [privacidade, setPrivacidade] = useState<PrivacyOption>('público');

  useEffect(() => {
    if (profileQuery.data) {
      setNome(profileQuery.data.nome ?? '');
      setEmail(profileQuery.data.email ?? '');
      setTelefone(profileQuery.data.telefone ?? '');
      setDataNascimento(profileQuery.data.dataNascimento ?? '');
      setPrivacidade((profileQuery.data.privacidade as PrivacyOption) ?? 'público');
    }
  }, [profileQuery.data]);

  async function handleSave() {
    if (!nome.trim() || !email.trim()) {
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
          JSON.stringify(
            error?.response?.data ||
              error?.message ||
              'Não foi possível salvar o perfil.'
          )
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
                CONFIGURAÇÕES
              </Text>

              <Text style={[styles.title, { color: colors.text }]}>
                Atualize seu perfil no Rolé App
              </Text>
            </View>

            <View
              style={[
                styles.heroIconBox,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={styles.heroIcon}>👤</Text>
            </View>
          </View>

          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Essas informações ajudam a identificar sua conta dentro do app.
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
            Dados pessoais
          </Text>

          <AppInput
            label="Nome"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
          />

          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="voce@email.com"
          />

          <AppInput
            label="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
          />

          <AppInput
            label="Data de nascimento"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            placeholder="YYYY-MM-DD"
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
            Privacidade
          </Text>

          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Escolha como seu perfil aparece para outros usuários.
          </Text>

          <View style={styles.privacyOptions}>
            {privacyOptions.map((option) => {
              const selected = privacidade === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setPrivacidade(option.value)}
                  style={[
                    styles.privacyCard,
                    {
                      backgroundColor: selected
                        ? colors.primarySoft
                        : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.privacyIcon}>{option.icon}</Text>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.privacyTitle,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text
                      style={[
                        styles.privacyDescription,
                        { color: colors.textMuted },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.saveButton,
            {
              backgroundColor: updateProfileMutation.isPending
                ? colors.textMuted
                : colors.primary,
            },
          ]}
          onPress={handleSave}
          disabled={updateProfileMutation.isPending}
        >
          <Text style={styles.saveButtonText}>
            {updateProfileMutation.isPending
              ? 'Salvando...'
              : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>
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
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  privacyOptions: {
    gap: 10,
  },

  privacyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  privacyIcon: {
    fontSize: 24,
  },

  privacyTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  privacyDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },

  saveButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});