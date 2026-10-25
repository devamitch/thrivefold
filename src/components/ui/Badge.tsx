import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { SquircleSurface } from './SquircleSurface';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'error';
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style, icon }) => {
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
  } else if (variant === 'danger' || variant === 'error') {
    bg = colors.errorSurface ?? '#FEE2E2';
    textCol = colors.error;
  } else if (variant === 'neutral') {
    bg = colors.surface1;
    textCol = colors.text.secondary;
  } else {
    bg = colors.primaryAlpha;
    textCol = colors.primary;
  }

  const textStyle: TextStyle = {
    color: textCol,
    ...typography.label,
  };

  return (
    <SquircleSurface
      radius={8}
      smoothing={1}
      fill={bg}
      style={[
        styles.badge,
        {
          paddingVertical: spacing.xxs,
          paddingHorizontal: spacing.sm,
        },
        style,
      ]}
    >
      {icon ? <Text style={{ marginRight: 4 }}>{icon}</Text> : null}
      <Text style={textStyle}>{label}</Text>
    </SquircleSurface>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default Badge;
