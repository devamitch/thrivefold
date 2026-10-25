import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
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
  /** @deprecated No effect; SquircleSurface picks the cheapest renderer itself. */
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
}) => {
  const { colors, spacing } = useTheme();

  // Surfaces are separated by fill, never by a border line.
  const bg =
    variant === 'surface1' || variant === 'outline'
      ? colors.surface1
      : variant === 'surface2'
        ? colors.surface2
        : variant === 'surface3'
          ? colors.surface3
          : variant === 'glass'
            ? colors.surfaceGlass
            : variant === 'tinted'
              ? colors.primaryAlpha
              : colors.surface;

  const surface = (
    <SquircleSurface
      radius={radius}
      fill={bg}
      stroke={stroke}
      style={[{ padding: padding ?? spacing.base }, style]}
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

export default Card;
