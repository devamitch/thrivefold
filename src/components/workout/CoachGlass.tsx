import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';

/**
 * Frosted glass for controls over the live camera. The camera preview is a SurfaceView that no
 * blur can sample, so the frost is a dark translucent body, a soft top sheen and a hairline
 * edge: it reads as glass over any background and costs nothing per frame.
 */
export function CoachGlass({
  children,
  style,
  radius = 24,
  strong = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** A denser body for panels that carry a lot of text. */
  strong?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.callSurface,
          borderColor: colors.callSurfaceStrong,
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {strong ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.callSurface }]} />
      ) : null}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.callSurfaceStrong, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/**
 * A ring that fills once over `durationMs` (restarted by changing `cycle`), or shows a fixed
 * `progress` (0-1) when no duration is given. Drawn by Skia on the UI thread.
 */
export function ProgressRing({
  size,
  stroke = 6,
  color,
  track,
  durationMs,
  cycle,
  progress,
}: {
  size: number;
  stroke?: number;
  color: string;
  track: string;
  durationMs?: number;
  cycle?: number | string;
  progress?: number;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(progress ?? 0);
  useEffect(() => {
    if (durationMs) {
      t.value = 0;
      t.value = reduceMotion ? 1 : withTiming(1, { duration: durationMs, easing: Easing.linear });
    } else {
      t.value = reduceMotion ? (progress ?? 0) : withTiming(progress ?? 0, { duration: 350 });
    }
  }, [durationMs, cycle, progress, reduceMotion, t]);

  const r = (size - stroke) / 2;
  const circle = React.useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(size / 2, size / 2, r);
    return p;
  }, [size, r]);
  const arc = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const sweep = Math.max(0.001, Math.min(1, t.value)) * 360;
    p.addArc(
      { x: stroke / 2, y: stroke / 2, width: size - stroke, height: size - stroke },
      -90,
      sweep,
    );
    return p;
  });

  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Path path={circle} style="stroke" strokeWidth={stroke} color={track} />
      <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={color} />
    </Canvas>
  );
}
