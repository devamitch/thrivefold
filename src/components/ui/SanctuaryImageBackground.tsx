import { Image, type ImageSource } from 'expo-image';
import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { AssetIllustrations } from '../../constants/assets';
import { useTheme } from '../../theme/useTheme';

export interface SanctuaryImageBackgroundProps {
  /**
   * The background illustration source.
   * Defaults to `AssetIllustrations.sanctuaryAmbientBg` (soothing sage/cream wash).
   */
  source?: ImageSource | number | string;
  /**
   * Opacity of the theme background wash layer placed over the illustration.
   * Defaults to 0.92 so the artwork is gently atmospheric, soothing, and never attention-grabbing.
   */
  overlayOpacity?: number;
  /** Custom overlay color if overriding the theme background wash. */
  overlayColor?: string;
  /** Optional blur radius for ultra-soft, low-glare depth (e.g. 2..8). */
  blurRadius?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
}

/**
 * Modern non-deprecated ambient background wrapper.
 * Uses a View with an absolutely positioned, hardware-accelerated `expo-image`
 * and a theme-matched translucent wash to keep text contrast calm and fully accessible.
 */
export const SanctuaryImageBackground: React.FC<SanctuaryImageBackgroundProps> = ({
  source = AssetIllustrations.sanctuaryAmbientBg,
  overlayOpacity = 0.92,
  overlayColor,
  blurRadius = 0,
  style,
  imageStyle,
  children,
}) => {
  const { colors } = useTheme();
  const tint = overlayColor ?? colors.background;

  return (
    <View style={[styles.root, style]}>
      {Boolean(source) && (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, styles.image, imageStyle]}
          contentFit="cover"
          blurRadius={blurRadius}
          pointerEvents="none"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      )}
      <LinearGradient
        colors={['transparent', tint]}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: overlayOpacity,
          },
        ]}
      />
      {children}
    </View>
  );
};

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
