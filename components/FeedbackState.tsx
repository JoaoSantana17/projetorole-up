import { useAppTheme } from '@/src/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FeedbackState({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onAction}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24 },
  card: { borderWidth: 1, 
          borderRadius: 20, 
          padding: 22, 
          alignItems: 'center' },

  title: { textAlign: 'center', 
           fontWeight: '700', 
           fontSize: 15, 
           lineHeight: 22, 
           marginBottom: 14 },

  button: { paddingHorizontal: 18, 
            paddingVertical: 12, 
            borderRadius: 14 },

  buttonText: { color: '#fff', 
                fontWeight: '800' },
});
