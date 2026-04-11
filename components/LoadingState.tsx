import { useAppTheme } from '@/src/contexts/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
               alignItems: 'center', 
               justifyContent: 'center', 
               padding: 24 },

  bubble: { borderWidth: 1, 
            borderRadius: 20, 
            paddingHorizontal: 28, 
            paddingVertical: 22, 
            alignItems: 'center', 
            gap: 12 },
            
  label: { fontWeight: '700' },
});
