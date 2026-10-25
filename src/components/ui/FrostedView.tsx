/**
 * The one frosted-glass surface. Use it for the dock, headers, drawers and floating bars instead
 * of `expo-blur` directly.
 *
 * - iOS: the native material blur.
 * - Android 12+: a real RenderNode blur of the app content (`BlurRoot` marks what to blur),
 *   softened with a theme tint so it reads smooth instead of blocky.
 * - Android 11 and older, or anything without a `BlurRoot` above it (for example inside a
 *   `Modal`, which is a separate window): a translucent tint only. A downsampled blur over text
 *   looks pixelated, and a clean tint never does.
 */
import { BlurTargetView, BlurView } from 'expo-blur';
import React, { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/useTheme';

const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

const ANDROID_BLUR = Platform.OS === 'android' && Number(Platform.Version) >= 31;

/** Wrap the app's content once; every `FrostedView` inside it blurs what this contains. */
export function BlurRoot({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<View | null>(null);
  if (Platform.OS !== 'android') return <View style={style ?? styles.fill}>{children}</View>;
  return (
    <BlurTargetContext.Provider value={ref}>
      <BlurTargetView ref={ref} style={style ?? styles.fill}>
        {children}
      </BlurTargetView>
    </BlurTargetContext.Provider>
  );
}

export type FrostTone = 'surface' | 'canvas' | 'dark';

export interface FrostedViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 0-100. Default 40, a soft iOS "thin material". */
  intensity?: number;
  tone?: FrostTone;
  /** How much of the tint shows over the blur, 0-1. Higher is calmer and more legible. */
  tintOpacity?: number;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

const withAlpha = (color: string, a: number) => {
  if (color.startsWith('#') && color.length === 7) {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  return color;
};

export function FrostedView({
  children,
  style,
  intensity = 40,
  tone = 'surface',
  tintOpacity,
  pointerEvents,
}: FrostedViewProps) {
  const { colors } = useTheme();
  const target = useContext(BlurTargetContext);
  const base = tone === 'dark' ? colors.dock : tone === 'canvas' ? colors.background : colors.surface;

  const blurs = Platform.OS === 'ios' || (ANDROID_BLUR && target !== null);
  // With a real blur behind it the tint can be lighter; without one it must carry the surface.
  const alpha = tintOpacity ?? (blurs ? (Platform.OS === 'ios' ? 0.55 : 0.68) : 0.94);

  return (
    <View style={[styles.clip, style]} pointerEvents={pointerEvents}>
      {blurs ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={intensity}
          tint={tone === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={target ?? undefined}
          blurReductionFactor={2.5}
        />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(base, alpha) }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  clip: { overflow: 'hidden' },
});

export default FrostedView;
