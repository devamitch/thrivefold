import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'surface' | 'surface1' | 'surface2' | 'surface3' | 'glass' | 'tinted';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  radius?: number;
  padding?: number;
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
  nativeSurface = false,
}) => {
  const { colors, spacing } = useTheme();

  let bg = colors.surface;
  if (variant === 'surface1') bg = colors.surface1;
  if (variant === 'surface2') bg = colors.surface2;
  if (variant === 'surface3') bg = colors.surface3;
  if (variant === 'glass') bg = colors.surfaceGlass;
  if (variant === 'tinted') bg = colors.primaryAlpha;

  const defaultPadding = padding !== undefined ? padding : spacing.base;

  if (nativeSurface) {
    const content = (
      <View
        style={[
          styles.base,
          {
            backgroundColor: bg,
            borderRadius: radius,
            padding: defaultPadding,
          },
          style,
        ]}
      >
        {children}
      </View>
    );

    if (onPress) {
      return (
        <PressableScale onPress={onPress} scaleTo={0.985}>
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
      style={[styles.base, { padding: defaultPadding }, style]}
    >
      {children}
    </SquircleSurface>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.985}>
        {surface}
      </PressableScale>
    );
  }

  return surface;
};

const styles = StyleSheet.create({
  base: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
});

export default Card;
