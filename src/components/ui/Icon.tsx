import React from 'react';
import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';
import { ProductIcons, ProductIconName } from '../../constants/product-icons';
import { useTheme } from '../../theme/useTheme';

export type IconName = ProductIconName;

export interface IconProps {
  name: IconName;
  /** Edge length in dp. 24 matches standard list rows and toolbars. */
  size?: number;
  /** Defaults to current theme's secondary text ink */
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Flat monochrome icon component. Every icon is tinted from the active theme tokens.
 * Powered by expo-image hardware-accelerated GPU tinting and memory-disk caching.
 * Supports all 117 system icons from assets/icons.
 */
export function Icon({ name, size = 24, color, style }: IconProps) {
  const { colors } = useTheme();
  const iconSource = ProductIcons[name] || ProductIcons.back;

  return (
    <Image
      source={iconSource}
      style={[{ width: size, height: size }, style]}
      tintColor={color ?? colors.text.secondary}
      contentFit="contain"
      accessible={false}
      cachePolicy="memory-disk"
    />
  );
}

export default Icon;
