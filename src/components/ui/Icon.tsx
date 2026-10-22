import React from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { ProductIcons, ProductIconName } from '../../constants/product-icons';
import { useTheme } from '../../theme/useTheme';

export type IconName = ProductIconName | keyof typeof Ionicons.glyphMap;

export interface IconProps {
  name: IconName;
  /** Edge length in dp. 24 matches standard list rows and toolbars. */
  size?: number;
  /** Defaults to current theme's secondary text ink */
  color?: string;
  style?: StyleProp<ImageStyle | ViewStyle>;
}

/**
 * Flat monochrome icon component.
 * Supports crisp vector glyphs from Ionicons as well as high-res system icons from ProductIcons.
 * Always renders razor-sharp with hardware-accelerated GPU tinting, zero pixelation.
 */
export function Icon({ name, size = 24, color, style }: IconProps) {
  const { colors } = useTheme();
  const iconColor = color ?? colors.text.secondary;

  // If name exists in Ionicons, prefer crisp vector icon for zero pixelation
  if (name in Ionicons.glyphMap) {
    return (
      <Ionicons
        name={name as keyof typeof Ionicons.glyphMap}
        size={size}
        color={iconColor}
        style={style as any}
      />
    );
  }

  const iconSource = (ProductIcons as Record<string, any>)[name] || ProductIcons.back;

  return (
    <Image
      source={iconSource}
      style={[{ width: size, height: size }, style as ImageStyle]}
      tintColor={iconColor}
      contentFit="contain"
      priority="high"
      accessible={false}
      cachePolicy="memory-disk"
    />
  );
}

export default Icon;
