import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { AssetIllustrations } from '../../constants/assets';
import { useTheme } from '../../theme/useTheme';

export interface SanctuaryImageBackgroundProps {
  /**
   * The background illustration source.
   * Defaults to `AssetIllustrations.sanctuaryAmbientBg` (soothing sage/cream wash).
   */
  source?: ImageSource | number | string;
  /**
   * Maximum opacity of the bottom theme wash layer.
   * Defaults to 0.96 for grounded readability.
   */
  overlayOpacity?: number;
  /** Custom overlay tint color if overriding the theme background wash. */
  overlayColor?: string;
  /** Optional blur radius for ultra-soft, low-glare depth (e.g. 2..8). Defaults to 0. */
  blurRadius?: number;
  /** Custom gradient transition stops from top (transparent) to bottom (solid tint). */
  gradientLocations?: readonly [number, number, number, number];
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
}

function toRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const raw = hex.replace('#', '');
  const n = parseInt(raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw, 16);
  if (isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Performant, modern ambient background wrapper using `expo-image` and `expo-linear-gradient`.
 * The top remains translucent so the soothing sanctuary illustration shines through,
 * while the bottom transitions smoothly to the solid theme color for 100% readable text and cards.
 */
export const SanctuaryImageBackground = memo<SanctuaryImageBackgroundProps>(function SanctuaryImageBackground({
  source = AssetIllustrations.sanctuaryAmbientBg,
  overlayOpacity = 0.96,
  overlayColor,
  blurRadius = 0,
  gradientLocations = [0, 0.28, 0.65, 1.0] as const,
  style,
  imageStyle,
  children,
}) {
  const { colors } = useTheme();
  const tint = overlayColor ?? colors.background;

  const gradientColors = useMemo<readonly [string, string, string, string]>(() => {
    return [
      toRgba(tint, 0.0),
      toRgba(tint, 0.35 * overlayOpacity),
      toRgba(tint, 0.82 * overlayOpacity),
      toRgba(tint, overlayOpacity),
    ];
  }, [tint, overlayOpacity]);

  return (
    <View style={[styles.root, style]}>
      {Boolean(source) && (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, styles.image, imageStyle]}
          contentFit="cover"
          blurRadius={blurRadius}
          priority="low"
          pointerEvents="none"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      )}
      <LinearGradient
        colors={gradientColors}
        locations={gradientLocations}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    opacity: 0.95,
  },
  root: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
});
