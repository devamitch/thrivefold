import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export interface ButtonProps {
  label?: string;
  title?: string; // support Neev API
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  /** Defaults to the visible label; set it for symbol-only buttons. */
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  icon,
  accessibilityLabel,
}) => {
  const { colors, typography, spacing } = useTheme();
  const displayLabel = label || title || '';

  const normalizedSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : size === 'medium' ? 'md' : size;

  let bg = colors.primary;
  let textColor = colors.onPrimary;
  let stroke: string | undefined = undefined;

  if (variant === 'secondary') {
    bg = colors.surface1;
    textColor = colors.text.primary;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = colors.primary;
    stroke = colors.borderStrong;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = colors.text.secondary;
  } else if (variant === 'danger') {
    bg = colors.error;
    textColor = '#FFFFFF';
  }

  const radius = normalizedSize === 'sm' ? 12 : normalizedSize === 'lg' ? 16 : 14;
  const minHeight = normalizedSize === 'sm' ? 40 : normalizedSize === 'lg' ? 54 : 48;
  const paddingH = normalizedSize === 'sm' ? spacing.md : normalizedSize === 'lg' ? spacing.xl : spacing.lg;

  const textStyle: TextStyle = {
    color: disabled ? colors.text.muted : textColor,
    ...(normalizedSize === 'sm' ? typography.subbodyBold : typography.bodyBold),
    textAlign: 'center',
  };

  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      scaleTo={normalizedSize === 'sm' ? 0.96 : 0.98}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (label || title)}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      <SquircleSurface
        radius={radius}
        smoothing={1}
        fill={disabled ? colors.surface2 : bg}
        stroke={stroke}
        style={[
          styles.surface,
          {
            minHeight,
            paddingHorizontal: paddingH,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.row}>
            {icon}
            {displayLabel ? (
              <Text style={[textStyle, icon ? { marginLeft: 8 } : null]}>{displayLabel}</Text>
            ) : null}
          </View>
        )}
      </SquircleSurface>
    </PressableScale>
  );
};

export const AppButton = Button;

const styles = StyleSheet.create({
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
