import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const { colors, typography, spacing } = useTheme();

  let bg = colors.badgeBg;
  let textCol = colors.badgeText;

  if (variant === 'success') {
    bg = colors.successSurface;
    textCol = colors.success;
  } else if (variant === 'warning') {
    bg = colors.warningSurface;
    textCol = colors.warning;
  } else if (variant === 'info') {
    bg = colors.infoSurface;
    textCol = colors.info;
  } else if (variant === 'neutral') {
    bg = colors.surface1;
    textCol = colors.text.secondary;
  }

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  };

  const textStyle: TextStyle = {
    color: textCol,
    ...typography.label,
  };

  return (
    <View style={[styles.badge, containerStyle, style]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});
