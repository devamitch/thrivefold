import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'surface' | 'surface1' | 'surface2' | 'surface3' | 'glass' | 'tinted' | 'outline';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  radius?: number;
  padding?: number;
  stroke?: string;
  /** When true, avoids drawing SVG path on high-frequency virtualized lists */
  nativeSurface?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  style,
  onPress,
  radius = 20,
  padding,
  stroke,
  nativeSurface = false,
}) => {
  const { colors, spacing } = useTheme();

  let bg = colors.surface;
  // Surfaces are separated by fill, never by a border line.
  const resolvedStroke = stroke;

  if (variant === 'surface1') {
    bg = colors.surface1;
  } else if (variant === 'surface2') {
    bg = colors.surface2;
  } else if (variant === 'surface3') {
    bg = colors.surface3;
  } else if (variant === 'glass') {
    bg = colors.surfaceGlass;
  } else if (variant === 'tinted') {
    bg = colors.primaryAlpha;
  } else if (variant === 'outline') {
    bg = colors.surface1;
  }

  const defaultPadding = padding !== undefined ? padding : spacing.base;

  if (nativeSurface) {
    const content = (
      <SquircleSurface
        style={[
          styles.base,
          {
            backgroundColor: bg,
            borderColor: resolvedStroke,
            borderWidth: resolvedStroke ? 1 : 0,
            borderRadius: radius,
            padding: defaultPadding,
          },
          style,
        ]}
      >
        {children}
      </SquircleSurface>
    );

    if (onPress) {
      return (
        <PressableScale onPress={onPress} scaleTo={0.98}>
          {content}
        </PressableScale>
      );
    }
    return content;
  }

  const surface = (
    <SquircleSurface
      radius={radius}
      smoothing={1}
      fill={bg}
      stroke={resolvedStroke}
      strokeWidth={resolvedStroke ? 1 : 0}
      style={[styles.base, { padding: defaultPadding }, style]}
    >
      {children}
    </SquircleSurface>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.98}>
        {surface}
      </PressableScale>
    );
  }

  return surface;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default Card;
