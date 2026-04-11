import { useAppTheme } from '@/src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AppHeaderProps = {
  title: string;
  back?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
  rightSlot?: React.ReactNode;
};

export function AppHeader({
  title,
  back = false,
  rightLabel,
  onRightPress,
  rightSlot,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.side}>
        {back ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={[styles.side, styles.rightSide]}>
        {rightSlot ? (
          rightSlot
        ) : rightLabel && onRightPress ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.actionButton, { backgroundColor: colors.primarySoft }]}
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 74,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  side: {
    width: 90,
    justifyContent: 'center',
  },

  rightSide: {
    alignItems: 'flex-end',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  backButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },

  backText: {
    fontWeight: '800',
    fontSize: 13,
  },

  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  actionText: {
    fontWeight: '900',
    fontSize: 13,
  },
});