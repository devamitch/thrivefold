import React, { type ReactNode } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tinted';
type SizeKey = 'sm' | 'md' | 'lg';
type SizeProp = SizeKey | 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<PressableScaleProps, 'style' | 'children'> {
  label?: string;
  title?: string;
  variant?: Variant;
  size?: SizeProp;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  icon?: ReactNode;
  accessibilityLabel?: string;
}

const SIZE_ALIAS: Record<SizeProp, SizeKey> = {
  sm: 'sm',
  small: 'sm',
  md: 'md',
  medium: 'md',
  lg: 'lg',
  large: 'lg',
};

/**
 * SIZES:
 * radius: squircle corner radius
 * scaleTo: smaller buttons compress slightly more for consistent tactile feedback
 * hitSlop: sm is 40pt tall, padded up to 48pt minimum touch target
 */
const SIZES = {
  sm: { radius: 12, scaleTo: 0.95, hitSlop: 4, minHeight: 40, paddingHorizontal: 16 },
  md: { radius: 14, scaleTo: 0.97, hitSlop: 0, minHeight: 48, paddingHorizontal: 20 },
  lg: { radius: 16, scaleTo: 0.98, hitSlop: 0, minHeight: 54, paddingHorizontal: 24 },
} as const;

type Colors = ReturnType<typeof useTheme>['colors'];
type Palette = { fill: string; text: string; stroke?: string };

function getPalette(variant: Variant, disabled: boolean, colors: Colors): Palette {
  if (disabled) {
    const solid = variant === 'primary' || variant === 'danger' || variant === 'secondary';
    return { fill: solid ? colors.surface2 : 'transparent', text: colors.text.muted };
  }
  switch (variant) {
    case 'primary':
      return { fill: colors.primary, text: colors.onPrimary };
    case 'danger':
      return { fill: colors.error, text: '#FFFFFF' };
    case 'outline':
      return { fill: colors.surface1, text: colors.text.primary };
    case 'ghost':
      return { fill: 'transparent', text: colors.primary };
    case 'tinted':
      return { fill: colors.primaryAlpha, text: colors.primary };
    case 'secondary':
    default:
      return { fill: colors.surface1, text: colors.text.primary };
  }
}

/**
 * Universal Button / AppButton.
 * Height is a minimum, never fixed, and label truncates instead of wrapping out of bounds.
 * Loading keeps the label in layout (hidden) and overlays the spinner, so the button
 * never changes size or causes subpixel jitter when toggling loading.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  onPress,
  icon,
  accessibilityLabel,
  ...rest
}) => {
  const { colors, typography } = useTheme();
  const displayLabel = label || title || '';

  const sizeKey = SIZE_ALIAS[size] || 'md';
  const metrics = SIZES[sizeKey];
  const palette = getPalette(variant, disabled, colors);
  const inactive = disabled || loading;

  const textStyle: TextStyle = {
    color: palette.text,
    ...(sizeKey === 'sm' ? typography.subbodyBold : typography.bodyBold),
    textAlign: 'center',
  };

  return (
    <PressableScale
      style={style}
      onPress={onPress}
      disabled={inactive}
      disabledOpacity={1}
      scaleTo={metrics.scaleTo}
      hitSlop={metrics.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      {...rest}
    >
      <SquircleSurface
        radius={metrics.radius}
        smoothing={1}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={palette.stroke ? 1 : 0}
        style={[
          styles.surface,
          {
            minHeight: metrics.minHeight,
            paddingHorizontal: metrics.paddingHorizontal,
          },
        ]}
      >
        <SquircleSurface style={styles.content}>
          <SquircleSurface style={[styles.row, loading && styles.hidden]}>
            {icon}
            {displayLabel ? (
              <Text numberOfLines={1} style={[textStyle, icon ? { marginLeft: 8 } : null]}>
                {displayLabel}
              </Text>
            ) : null}
          </SquircleSurface>
          {loading ? (
            <SquircleSurface style={styles.spinner} pointerEvents="none">
              <ActivityIndicator color={palette.text} size="small" />
            </SquircleSurface>
          ) : null}
        </SquircleSurface>
      </SquircleSurface>
    </PressableScale>
  );
};

export const AppButton = Button;

const styles = StyleSheet.create({
  surface: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexShrink: 1,
    justifyContent: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'center',
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
