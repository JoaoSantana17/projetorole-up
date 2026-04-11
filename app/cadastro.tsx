import { AppContainer } from '@/components/AppContainer';
import { AppHeader } from '@/components/AppHeader';
import { AppInput } from '@/components/AppInput';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRegisterMutation } from '@/src/hooks/queries/useAuthMutations';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const registerMutation = useRegisterMutation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleRegister() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      const data = await registerMutation.mutateAsync({ nome, email, senha });
      await signIn(data);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Falha no cadastro', error?.response?.data?.message ?? 'Não foi possível concluir o cadastro.');
    }
  }

  return (
    <AppContainer>
      <AppHeader title="Criar conta" back />
      <View style={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Seu próximo rolê começa aqui</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Crie sua conta para organizar eventos, acompanhar presenças e manter sua turma conectada.</Text>
        </View>

        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Como você quer aparecer" />
        <AppInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
        <AppInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Crie uma senha segura" />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRegister} disabled={registerMutation.isPending}>
          <Text style={styles.buttonText}>{registerMutation.isPending ? 'Criando conta...' : 'Finalizar cadastro'}</Text>
        </TouchableOpacity>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
               padding: 24 },

  heroCard: { borderWidth: 1,
              borderRadius: 24,
              padding: 22,
              gap: 8,
              marginBottom: 20 },

  title: { fontSize: 24, 
           fontWeight: '900' },

  subtitle: { lineHeight: 22, 
              fontSize: 15 },

  button: { borderRadius: 16, 
            paddingVertical: 16, 
            alignItems: 'center', 
            marginTop: 8 },

  buttonText: { color: '#fff', 
                fontWeight: '900', 
                fontSize: 16 },
});
