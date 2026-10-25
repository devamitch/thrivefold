/**
 * The one frosted-glass surface. Use it for headers, docks, drawers and floating bars instead of
 * `expo-blur` directly.
 *
 * - iOS: the native material blur under a light theme tint.
 * - Android 12+ with a `blurTarget`: a RenderNode blur of that target. The target must be a
 *   SIBLING of this view (`<BlurTargetView ref={t}>content</BlurTargetView><FrostedView blurTarget={t} />`).
 *   A blur placed inside its own target recurses in the RenderThread and crashes the app.
 * - Everything else (no target, Android 11 and older, inside a Modal): a smooth translucent
 *   tint. A downsampled blur over text looks pixelated; a clean tint never does.
 */
import { BlurView } from 'expo-blur';
import React, { type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/useTheme';

const ANDROID_BLUR = Platform.OS === 'android' && Number(Platform.Version) >= 31;

export type FrostTone = 'surface' | 'canvas' | 'dark';

export interface FrostedViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 0-100. Default 40, a soft iOS "thin material". */
  intensity?: number;
  tone?: FrostTone;
  /** How much of the tint shows over the blur, 0-1. Higher is calmer and more legible. */
  tintOpacity?: number;
  /** Android only: a sibling `BlurTargetView` ref to blur. Never an ancestor of this view. */
  blurTarget?: RefObject<View | null>;
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
  blurTarget,
  pointerEvents,
}: FrostedViewProps) {
  const { colors } = useTheme();
  const base = tone === 'dark' ? colors.dock : tone === 'canvas' ? colors.background : colors.surface;

  const blurs = Platform.OS === 'ios' || (ANDROID_BLUR && Boolean(blurTarget));
  // With a real blur behind it the tint can be lighter; without one it carries the surface.
  const alpha = tintOpacity ?? (blurs ? (Platform.OS === 'ios' ? 0.55 : 0.7) : 0.96);

  return (
    <View style={[styles.clip, style]} pointerEvents={pointerEvents}>
      {blurs ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={intensity}
          tint={tone === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={blurTarget}
          blurReductionFactor={2.5}
        />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(base, alpha) }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});

export default FrostedView;
