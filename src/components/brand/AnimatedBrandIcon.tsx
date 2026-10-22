/**
 * Animated Thrivefold logo icon for the central dock orb.
 * Uses the transparent brand mark (generated from thrivefold-master-icon.svg) with a
 * single soft glow pulse on mount.
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
const BRAND_COLOR = '#B45309'; // Warm terracotta from women theme

export const AnimatedBrandIcon = memo(function AnimatedBrandIcon({
  size = 56,
  withBackground = false,
}: AnimatedBrandIconProps) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // One breath in and out on mount — a continuous loop on an always-visible
    // element costs frames and battery for no extra meaning.
    pulse.value = withRepeat(
      withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
      2,
      true,
    );
  }, [pulse, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.25,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  const iconSize = withBackground ? size * 0.62 : size;

  const icon = (
    <Image
      source={require('../../../assets/brand/icon.png')}
      style={{ width: iconSize, height: iconSize }}
      accessibilityIgnoresInvertColors
      contentFit="contain"
      cachePolicy="memory-disk"
    />
  );

  if (!withBackground) return icon;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: BRAND_COLOR,
          },
          glowStyle,
        ]}
      />
      <View style={[styles.bg, { width: size, height: size, borderRadius: size / 2 }]}>
        {icon}
      </View>
    </View>
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
    backgroundColor: '#1E1916',
    overflow: 'hidden',
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
  },
});
