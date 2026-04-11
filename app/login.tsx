import { AppContainer } from '@/components/AppContainer';
import { AppInput } from '@/components/AppInput';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useLoginMutation } from '@/src/hooks/queries/useAuthMutations';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ email, senha });
      await signIn(data);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Falha no login', error?.response?.data?.message ?? 'Não foi possível autenticar no backend.');
    }
  }

  return (
    <AppContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.badge, { color: colors.primary, backgroundColor: colors.primarySoft }]}>Bem-vindo de volta</Text>
          <Text style={[styles.title, { color: colors.text }]}>Entre na sua conta</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Acompanhe seus rolês, gerencie confirmações e mantenha tudo organizado em poucos toques.</Text>
        </View>

        <View style={styles.form}>
          <AppInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
          <AppInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Digite sua senha" />

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin} disabled={loginMutation.isPending}>
            <Text style={styles.buttonText}>{loginMutation.isPending ? 'Entrando...' : 'Acessar conta'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={[styles.link, { color: colors.text }]}>Ainda não tem conta? <Text style={{ color: colors.primary, fontWeight: '800' }}>Criar agora</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
               justifyContent: 'center', 
               padding: 24, 
               gap: 22 },

  heroCard: { borderWidth: 1, 
              borderRadius: 28, 
              padding: 24, 
              gap: 10 },

  badge: { alignSelf: 'flex-start', 
           paddingHorizontal: 12, 
           paddingVertical: 8, 
           borderRadius: 999, 
           overflow: 'hidden', 
           fontWeight: '800', 
           fontSize: 12 },

  title: { fontSize: 30, 
           fontWeight: '900' },

  subtitle: { lineHeight: 22, 
              fontSize: 15 },

  form: { gap: 2 },

  button: { borderRadius: 16, 
            paddingVertical: 16, 
            alignItems: 'center', 
            marginTop: 8 },

  buttonText: { color: '#fff', 
                fontWeight: '900', 
                fontSize: 16 },

  link: { marginTop: 18, 
          textAlign: 'center', 
          fontWeight: '600' },
});
