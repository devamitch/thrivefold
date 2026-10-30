import { Canvas, Path, Skia } from '@shopify/react-native-skia';
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
 * Modern frosted glass surface for controls overlaid on the camera preview.
 * Clean, high-legibility dark translucent surface with hairline contrast border
 * and continuous squircle corners. Zero artificial gradient streaks.
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
          backgroundColor: strong ? 'rgba(12, 16, 22, 0.92)' : 'rgba(16, 20, 26, 0.82)',
          borderColor: colors.callSurfaceStrong ?? 'rgba(255, 255, 255, 0.12)',
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          borderCurve: 'continuous',
          overflow: 'hidden',
        },
        style,
      ]}
    >
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
    const p = Skia.PathBuilder.Make();
    p.addCircle(size / 2, size / 2, r);
    return p.build();
  }, [size, r]);
  const arc = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const sweep = Math.max(0.001, Math.min(1, t.value)) * 360;
    p.addArc(
      { x: stroke / 2, y: stroke / 2, width: size - stroke, height: size - stroke },
      -90,
      sweep,
    );
    return p.build();
  });

  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Path path={circle} style="stroke" strokeWidth={stroke} color={track} />
      <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={color} />
    </Canvas>
  );
}
