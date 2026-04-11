import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';

export default function EditarPerfil() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const nomeSalvo = (await AsyncStorage.getItem('userNome')) ?? '';
        const usernameSalvo = (await AsyncStorage.getItem('userUsername')) ?? '';
        setNome(nomeSalvo);
        setUsername(usernameSalvo || '@usuario.role');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const handleSalvar = async () => {
    const nomeOk = nome.trim();
    let usernameOk = username.trim();

    if (!nomeOk) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }

    if (usernameOk && !usernameOk.startsWith('@')) {
      usernameOk = `@${usernameOk}`;
    }
    if (!usernameOk) {
      const slug = nomeOk
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 18);
      usernameOk = `@${slug || 'usuario'}`;
    }

    try {
      setSalvando(true);
      await AsyncStorage.setItem('userNome', nomeOk);
      await AsyncStorage.setItem('userUsername', usernameOk);
      Alert.alert('Tudo certo', 'Seu perfil foi atualizado com sucesso.');
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.avatarContainer}>
          <Image source={require('../assets/profile-placeholder.png')} style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarButton} disabled>
            <Feather name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Editar perfil</Text>
        <Text style={styles.subtitle}>Atualize como você deseja aparecer para outras pessoas no app.</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <InputField label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
          <InputField label="Username" value={username} onChangeText={setUsername} placeholder="@usuario" />

          <TouchableOpacity style={[styles.saveButton, (salvando || !nome.trim()) && { opacity: 0.7 }]} onPress={handleSalvar} disabled={salvando || !nome.trim()}>
            {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
               backgroundColor: '#11061B' }
               ,
  content: { paddingTop: 40, 
             paddingHorizontal: 20, 
             paddingBottom: 40, 
             alignItems: 'center' },

  heroCard: { width: '100%', 
              backgroundColor: '#1D0F2D', 
              borderRadius: 28, 
              padding: 24, 
              alignItems: 'center', 
              marginBottom: 24, 
              borderWidth: 1, 
              borderColor: 'rgba(255,255,255,0.10)' },

  title: { color: '#fff', 
           fontSize: 26, 
           fontWeight: '900', 
           marginTop: 16, 
           marginBottom: 6 },

  subtitle: { color: 'rgba(255,255,255,0.72)', 
              textAlign: 'center', 
              lineHeight: 22 },

  avatarContainer: { position: 'relative' },

  avatar: { width: 120, 
            height: 120, 
            borderRadius: 60, 
            borderWidth: 3, 
            borderColor: '#d909a4' },

  editAvatarButton: { position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      backgroundColor: '#d909a4', 
                      padding: 10, 
                      borderRadius: 24 },

  saveButton: { marginTop: 24, 
                backgroundColor: '#d909a4', 
                paddingVertical: 16, 
                paddingHorizontal: 40, 
                borderRadius: 16, 
                alignItems: 'center', 
                width: '100%' },

  saveButtonText: { color: '#fff', 
                    fontWeight: '900', 
                    fontSize: 16 },
});
