import { SquircleSurface } from '@/components/ui';
/**
 * Animated Thrivefold Minimalist Terracotta T and Leaf Emblem.
 * Zero gradients, clean organic lines, soft pulse on mount.
 */
import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedBrandIconProps {
  /** Edge size of the icon (default 56) */
  size?: number;
  /** Whether to render background circle (true for dock orb) */
  withBackground?: boolean;
}

const PULSE_DURATION = 3200;
const BRAND_COLOR = '#C86D51'; // Minimalist terracotta

export const AnimatedBrandIcon = memo(function AnimatedBrandIcon({
  size = 56,
  withBackground = false,
}: AnimatedBrandIconProps) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
      2,
      true,
    );
  }, [pulse, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.2,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  const iconRadius = withBackground ? Math.round(size * 0.44) : 0;

  const icon = (
    <Image
      source={require('../../../assets/brand/Minimalist-Terracotta-T-and-Leaf-Emblem.png')}
      style={{
        width: size,
        height: size,
        borderRadius: iconRadius,
      }}
      accessibilityIgnoresInvertColors
      contentFit="contain"
      cachePolicy="memory-disk"
    />
  );

  if (!withBackground) return icon;

  return (
    <SquircleSurface style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            backgroundColor: BRAND_COLOR,
          },
          glowStyle,
        ]}
      />
      <SquircleSurface
        style={[
          styles.bg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FDFBF7',
          },
        ]}
      >
        <Image
          source={require('../../../assets/brand/Minimalist-Terracotta-T-and-Leaf-Emblem.png')}
          style={{ width: size * 0.84, height: size * 0.84 }}
          accessibilityIgnoresInvertColors
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </SquircleSurface>
    </SquircleSurface>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
  },
});
