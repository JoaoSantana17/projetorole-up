import { useAppTheme } from '@/src/contexts/ThemeContext';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export function AppContainer({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
      <View style={[styles.content, { backgroundColor: colors.background }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
});
