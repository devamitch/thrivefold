import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import { BlurView, type BlurTint } from 'expo-blur';
import React, { useEffect, useMemo, useState, type ReactNode, type RefObject } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';

export type FrostTone = 'surface' | 'canvas' | 'dark';

export interface FrostedViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tone?: FrostTone;
  tintOpacity?: number;
  blurTarget?: RefObject<View | null>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  animated?: boolean;
  interactive?: boolean;
  radius?: number;
  shimmer?: boolean;
}

const IS_ANDROID = Platform.OS === 'android';
const ANDROID_SDK = IS_ANDROID ? Number(Platform.Version) : 0;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function alphaColor(color: string, alpha: number): string {
  const hex = color.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
}

export function FrostedView({
  children,
  style,
  intensity = 75,
  tone = 'surface',
  tintOpacity,
  blurTarget,
  pointerEvents = 'auto',
  animated = false,
  interactive = false,
  radius = 24,
  shimmer = false,
}: FrostedViewProps) {
  const { colors } = useTheme();

  const [measured, setMeasured] = useState({ width: 0, height: 0 });
  const [pressed, setPressed] = useState(false);

  const entrance = useSharedValue(animated ? 0 : 1);
  const pressScale = useSharedValue(1);
  const sheen = useSharedValue(-1);

  useEffect(() => {
    if (animated) {
      entrance.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      });
    } else {
      entrance.value = 1;
    }

    if (shimmer) {
      sheen.value = withRepeat(
        withTiming(1, {
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      );
    }

    return () => {
      entrance.value = 1;
      sheen.value = -1;
    };
  }, [animated, shimmer, entrance, sheen]);

  const entranceStyle = useAnimatedStyle(() => {
    if (!animated && !interactive) {
      return {};
    }
    return {
      opacity: entrance.value,
      transform: [
        { scale: pressScale.value },
      ],
    };
  });

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: shimmer ? 0.24 : 0,
    transform: [
      {
        translateX: measured.width > 0 ? sheen.value * measured.width : 0,
      },
    ],
  }));

  const dark = tone === 'dark';

  const base =
    tone === 'dark' ? colors.dock : tone === 'canvas' ? colors.background : colors.surface;

  const targetReady = Boolean(blurTarget?.current);

  // iOS uses its native backdrop material.
  // Android 12+ needs an explicit, mounted sibling BlurTargetView.
  const shouldBlur = Platform.OS === 'ios' || (IS_ANDROID && ANDROID_SDK >= 31 && targetReady);

  const tint: BlurTint = dark ? 'systemThinMaterialDark' : 'systemThinMaterialLight';

  const tintAlpha = clamp(
    tintOpacity ?? (shouldBlur ? (dark ? 0.13 : 0.12) : dark ? 0.76 : 0.82),
    0,
    1,
  );

  const highlightColors = useMemo(
    () => ['rgba(255,255,255,0.46)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.00)'],
    [],
  );

  const onPressIn = () => {
    setPressed(true);
    pressScale.value = withTiming(0.985, {
      duration: 120,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  };

  const onPressOut = () => {
    setPressed(false);
    pressScale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  };

  return (
    <Animated.View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setMeasured((previous) =>
          previous.width === width && previous.height === height ? previous : { width, height },
        );
      }}
      pointerEvents={pointerEvents}
      style={[styles.container, { borderRadius: radius }, entranceStyle, style]}
    >
      {shouldBlur && (
        <BlurView
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          intensity={clamp(intensity, 0, 100)}
          tint={tint}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={IS_ANDROID && targetReady ? blurTarget : undefined}
          blurReductionFactor={1}
        />
      )}

      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: alphaColor(base, tintAlpha) }]}
      />

      {/* Skia shader-backed glass highlight, clipped to the surface. */}
      {measured.width > 0 && measured.height > 0 && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius }]}>
          <Canvas style={StyleSheet.absoluteFill}>
            <RoundedRect
              x={0.5}
              y={0.5}
              width={Math.max(0, measured.width - 1)}
              height={Math.max(0, measured.height - 1)}
              r={radius}
              style="fill"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(measured.width, measured.height)}
                colors={highlightColors}
              />
            </RoundedRect>
          </Canvas>
        </View>
      )}

      {shimmer && measured.width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmer, { width: Math.max(36, measured.width * 0.24) }, sheenStyle]}
        >
          <Canvas style={StyleSheet.absoluteFill}>
            <RoundedRect
              x={0}
              y={0}
              width={Math.max(36, measured.width * 0.24)}
              height={Math.max(1, measured.height)}
              r={radius}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(Math.max(36, measured.width * 0.24), 0)}
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
              />
            </RoundedRect>
          </Canvas>
        </Animated.View>
      )}

      <View pointerEvents="box-none" style={styles.content}>
        {interactive ? (
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.content}>
            {children}
          </Pressable>
        ) : (
          children
        )}
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.border,
          {
            borderRadius: radius,
            borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.62)',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    zIndex: 2,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    zIndex: 1,
  },
});

export default FrostedView;
