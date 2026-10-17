import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const { colors, typography, spacing } = useTheme();

  const handlePress = () => {
    if (onPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onPress();
    }
  };

  let bg = colors.primary;
  let textColor = colors.onPrimary;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = colors.surface1;
    textColor = colors.text.primary;
    borderColor = colors.border;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = colors.primary;
    borderColor = colors.borderStrong;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = colors.text.secondary;
  } else if (variant === 'danger') {
    bg = colors.error;
    textColor = '#FFFFFF';
  }

  const paddingV = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.base : spacing.md;
  const paddingH = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;

  const buttonStyle: ViewStyle = {
    backgroundColor: disabled ? colors.surface2 : bg,
    borderColor,
    borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
    paddingVertical: paddingV,
    paddingHorizontal: paddingH,
    borderRadius: 16,
    opacity: disabled ? 0.6 : 1,
  };

  const textStyle: TextStyle = {
    color: disabled ? colors.text.muted : textColor,
    ...(size === 'sm' ? typography.subbodyBold : typography.bodyBold),
    textAlign: 'center',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        buttonStyle,
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[textStyle, icon ? { marginLeft: 8 } : null]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
