import { useAppTheme } from '@/src/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AppHeader({ title, back = false, rightLabel, onRightPress }: { title: string; back?: boolean; rightLabel?: string; onRightPress?: () => void }) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border, backgroundColor: colors.background }]}> 
      <View style={styles.side}>
        {back ? (
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {rightLabel ? (
          <TouchableOpacity style={[styles.rightButton, { backgroundColor: colors.primarySoft }]} onPress={onRightPress}>
            <Text style={[styles.rightLabel, { color: colors.primary }]}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  side: { width: 86 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800' },
  rightButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightLabel: { fontWeight: '800', fontSize: 13 },
});
