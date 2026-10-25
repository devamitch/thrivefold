/**
 * Round glass media controls, ported from Setu / BlinkQuest.
 *
 * A clear frosted disc drawn in Skia (faint body, sheen, bottom glow, rim and a
 * highlight that follows the finger); the mark carries a soft blurred halo.
 * Sits cleanly on top of live camera and media surfaces with high performance
 * and zero crash risk.
 */

import React, { memo, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  RoundedRect,
  Skia,
  vec,
  type SkPath,
} from '@shopify/react-native-skia';
import {
  Extrapolation,
  interpolate,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { PressableScale } from './PressableScale';
import { useTheme } from '../../theme/useTheme';

const MORPH = { damping: 20, stiffness: 240, mass: 0.7 } as const;
const PRESS = { damping: 20, stiffness: 420 } as const;
const MIN_TARGET = 48;
const STROKE_WIDTH = 2;
const ROUNDED_FILL_STROKE = 1.4;
const HALO_BLUR = 2.6;
const HALO_OPACITY = 0.75;
const BODY_DARK = '#000000';
const GLOSS = '#FFFFFF';

const PLAY_D = 'M9.4 6.4 18.2 12 9.4 17.6 Z';
const BAR = { width: 4.2, height: 14, radius: 1.7, top: 5 } as const;
const BAR_X = [6.9, 12.9] as const;

export type GlassOrbTone = 'neutral' | 'primary' | 'success' | 'danger' | 'default';

/** Helper to compute rgba color */
function channels(color: string): [number, number, number] | null {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const match = /^rgba?\(([^)]+)\)$/i.exec(color.trim());
  if (!match) return null;
  const parts = match[1].split(',').map((part) => parseFloat(part));
  if (parts.length < 3 || !parts.slice(0, 3).every(Number.isFinite)) return null;
  return [parts[0], parts[1], parts[2]];
}

export function withAlpha(color: string, alpha: number): string {
  const c = channels(color);
  return c ? `rgba(${c[0]},${c[1]},${c[2]},${alpha})` : color;
}

/** Marks in a 24-unit box: one round-capped 2-unit stroke family plus filled shapes. */
export const GlassMarks = {
  chevronDown: 'M6.5 9.5 12 15 17.5 9.5',
  close: 'M7 7 17 17 M17 7 7 17',
  stop: 'M7.4 7.4 h9.2 v9.2 h-9.2 Z',
  flip: 'M5 9.5 A7 7 0 0 1 18 8 M18 4.5 V8 H14.5 M19 14.5 A7 7 0 0 1 6 16 M6 19.5 V16 H9.5',
  pip: 'M4 6 H20 V18 H4 Z M12 11.5 H18 V16 H12 Z',
  chart: 'M4.5 17 9 11.5 12.5 14.5 19.5 6.5 M15.5 6.5 H19.5 V10.5',
  info: 'M12 11 V16.5 M12 7.6 V7.7 M12 3.5 A8.5 8.5 0 1 1 11.99 3.5',
  checkmark: 'M5 12.5 L9.5 17 L19 7.5',
  rewind: 'M11 6 L3 12 L11 18 V6 Z M20 6 L12 12 L20 18 V6 Z',
  forward: 'M13 6 L21 12 L13 18 V6 Z M4 6 L12 12 L4 18 V6 Z',
  volume: 'M4 9 H8 L13 5 V19 L8 15 H4 Z M16.5 9 A4.5 4.5 0 0 1 16.5 15 M19 6.5 A8 8 0 0 1 19 17.5',
  volumeMute: 'M4 9 H8 L13 5 V19 L8 15 H4 Z M16 9 L21 14 M21 9 L16 14',
  split: 'M4 4 H20 V11 H4 Z M4 13 H20 V20 H4 Z',
  flag: 'M5 4 V20 M5 4 H18 L15 9 L18 14 H5',
} as const;

const STROKE_MARKS: ReadonlySet<string> = new Set([
  GlassMarks.chevronDown,
  GlassMarks.close,
  GlassMarks.flip,
  GlassMarks.pip,
  GlassMarks.chart,
  GlassMarks.info,
  GlassMarks.checkmark,
  GlassMarks.volume,
  GlassMarks.volumeMute,
  GlassMarks.split,
  GlassMarks.flag,
]);

type MarkKind = 'fill' | 'stroke' | 'rounded';
const markKind = (path: string): MarkKind => (STROKE_MARKS.has(path) ? 'stroke' : 'rounded');

function MarkShape({ path, kind, color }: { path: SkPath; kind: MarkKind; color: string }) {
  if (kind === 'stroke') {
    return (
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeWidth={STROKE_WIDTH}
        strokeCap="round"
        strokeJoin="round"
      />
    );
  }
  return (
    <>
      <Path path={path} color={color} />
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeWidth={ROUNDED_FILL_STROKE}
        strokeJoin="round"
      />
    </>
  );
}

function Mark({ path, kind, color }: { path: SkPath; kind: MarkKind; color: string }) {
  return (
    <>
      <Group opacity={HALO_OPACITY}>
        <Group>
          <MarkShape path={path} kind={kind} color={color} />
          <Blur blur={HALO_BLUR} />
        </Group>
      </Group>
      <MarkShape path={path} kind={kind} color={color} />
    </>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function usePressPhysics(canvas: number, reduceMotion: boolean) {
  const press = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const onPressIn = (event: GestureResponderEvent) => {
    const half = canvas / 2;
    tx.value = clamp((event.nativeEvent.locationX - half) / half, -1, 1);
    ty.value = clamp((event.nativeEvent.locationY - half) / half, -1, 1);
    press.value = reduceMotion ? withTiming(1, { duration: 60 }) : withSpring(1, PRESS);
  };
  const onPressOut = () => {
    press.value = reduceMotion ? withTiming(0, { duration: 90 }) : withSpring(0, PRESS);
  };
  return { press, tx, ty, onPressIn, onPressOut };
}

function resolveToneColor(
  tone: GlassOrbTone,
  themeColors: { primary: string; success: string; error: string },
): string | null {
  if (tone === 'primary') return themeColors.primary;
  if (tone === 'success') return themeColors.success;
  if (tone === 'danger') return themeColors.error;
  return null;
}

function GlassBody({
  size,
  tone,
  themeColors,
  press,
  tx,
  ty,
}: {
  size: number;
  tone: GlassOrbTone;
  themeColors: { primary: string; success: string; error: string };
  press: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
}) {
  const solidColor = resolveToneColor(tone, themeColors);
  const isSolid = Boolean(solidColor);
  const r = size / 2;
  const centre = vec(r, r);
  const clip = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(r, r, r);
    return path;
  }, [r]);

  const highlightCentre = useDerivedValue(() =>
    vec(
      r * 0.74 + (r + tx.value * r * 0.55 - r * 0.74) * press.value,
      r * 0.46 + (r + ty.value * r * 0.55 - r * 0.46) * press.value,
    ),
  );
  const highlightOpacity = useDerivedValue(() => 0.55 + press.value * 0.45);
  const pressGlow = useDerivedValue(() => press.value * 0.16);

  return (
    <Group>
      <Circle c={vec(r, r + r * 0.12)} r={r * 0.92} color={withAlpha(BODY_DARK, 0.2)}>
        <Blur blur={r * 0.22} />
      </Circle>
      <Circle
        c={centre}
        r={r}
        color={isSolid ? withAlpha(solidColor!, 0.92) : withAlpha(BODY_DARK, 0.4)}
      />
      {!isSolid ? <Circle c={centre} r={r} color={withAlpha(GLOSS, 0.12)} /> : null}
      <Group clip={clip}>
        <Circle c={centre} r={r}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, size)}
            colors={[withAlpha(GLOSS, 0.3), withAlpha(GLOSS, 0.03)]}
          />
        </Circle>
        <Circle c={vec(r, r * 1.95)} r={r * 1.15}>
          <RadialGradient
            c={vec(r, r * 1.95)}
            r={r * 1.15}
            colors={[withAlpha(GLOSS, 0.22), withAlpha(GLOSS, 0)]}
          />
        </Circle>
        <Circle c={highlightCentre} r={r * 0.7} opacity={highlightOpacity}>
          <RadialGradient
            c={highlightCentre}
            r={r * 0.7}
            colors={[withAlpha(GLOSS, 0.35), withAlpha(GLOSS, 0)]}
          />
        </Circle>
        <Circle c={centre} r={r} color={GLOSS} opacity={pressGlow} />
      </Group>
      <Circle
        c={centre}
        r={r - 1.6}
        style="stroke"
        strokeWidth={0.8}
        color={withAlpha(BODY_DARK, 0.14)}
      />
      <Circle c={centre} r={r - 0.6} style="stroke" strokeWidth={1.2}>
        <LinearGradient
          start={vec(r * 0.3, 0)}
          end={vec(r * 1.7, size)}
          colors={[withAlpha(GLOSS, 0.75), withAlpha(GLOSS, 0.14), withAlpha(GLOSS, 0.45)]}
          positions={[0, 0.55, 1]}
        />
      </Circle>
    </Group>
  );
}

export interface PlayPauseButtonProps {
  playing: boolean;
  onPress: () => void;
  size?: number;
  variant?: 'primary' | 'glass';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const PlayPauseButton = memo(function PlayPauseButton({
  playing,
  onPress,
  size = 72,
  variant = 'glass',
  disabled = false,
  style,
  accessibilityLabel,
}: PlayPauseButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const r = size / 2;
  const canvasPad = Math.round(size * 0.12);
  const canvas = size + canvasPad * 2;
  const slop = Math.max(0, Math.ceil((MIN_TARGET - canvas) / 2));
  const c = canvasPad + r;
  const { press, tx, ty, onPressIn, onPressOut } = usePressPhysics(canvas, reduceMotion);

  const morph = useSharedValue(playing ? 1 : 0);
  useEffect(() => {
    const next = playing ? 1 : 0;
    morph.value = reduceMotion ? withTiming(next, { duration: 120 }) : withSpring(next, MORPH);
  }, [morph, playing, reduceMotion]);

  const tone: GlassOrbTone = variant === 'primary' ? 'primary' : 'neutral';
  const markColor = variant === 'primary' ? colors.onPrimary : GLOSS;
  const markSize = size * 0.42;
  const scale = markSize / 24;
  const offset = (size - markSize) / 2;
  const play = useMemo(() => Skia.Path.MakeFromSVGString(PLAY_D), []);

  const bodyTransform = useDerivedValue(() => [
    { translateX: c },
    { translateY: c + press.value },
    { scale: 1 - press.value * 0.04 },
    { translateX: -c },
    { translateY: -c },
  ]);
  const markShift = useDerivedValue(() => [
    { translateX: tx.value * press.value * 1.6 },
    { translateY: ty.value * press.value * 1.6 },
  ]);
  const playGroup = useDerivedValue(() => [
    { translateX: c - morph.value * 1.2 },
    { translateY: c },
    { scale: 1 - morph.value * 0.3 },
    { rotate: -0.28 * morph.value },
    { translateX: -c },
    { translateY: -c },
  ]);
  const pauseGroup = useDerivedValue(() => [
    { translateX: c + (1 - morph.value) * 1.2 },
    { translateY: c },
    { scale: 0.7 + morph.value * 0.3 },
    { rotate: 0.28 * (1 - morph.value) },
    { translateX: -c },
    { translateY: -c },
  ]);
  const playOpacity = useDerivedValue(() =>
    interpolate(morph.value, [0, 0.55], [1, 0], Extrapolation.CLAMP),
  );
  const pauseOpacity = useDerivedValue(() =>
    interpolate(morph.value, [0.35, 1], [0, 1], Extrapolation.CLAMP),
  );

  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPress();
  };

  if (!play) return null;
  const markPlacement = [
    { translateX: canvasPad + offset },
    { translateY: canvasPad + offset },
    { scale },
  ];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? (playing ? 'Pause' : 'Play')}
      disabled={disabled}
      hitSlop={slop}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      style={style}
    >
      <View style={[{ width: canvas, height: canvas }, disabled && styles.disabledPlay]}>
        <Canvas style={{ width: canvas, height: canvas }}>
          <Group transform={bodyTransform}>
            <Group transform={[{ translateX: canvasPad }, { translateY: canvasPad }]}>
              <GlassBody
                size={size}
                tone={tone}
                themeColors={colors}
                press={press}
                tx={tx}
                ty={ty}
              />
            </Group>
            <Group transform={markShift}>
              <Group transform={playGroup} opacity={playOpacity}>
                <Group transform={markPlacement}>
                  <Mark path={play} kind="rounded" color={markColor} />
                </Group>
              </Group>
              <Group transform={pauseGroup} opacity={pauseOpacity}>
                <Group transform={markPlacement}>
                  {BAR_X.map((x) => (
                    <Group key={x}>
                      <Group opacity={HALO_OPACITY}>
                        <Group>
                          <RoundedRect
                            x={x}
                            y={BAR.top}
                            width={BAR.width}
                            height={BAR.height}
                            r={BAR.radius}
                            color={markColor}
                          />
                          <Blur blur={HALO_BLUR} />
                        </Group>
                      </Group>
                      <RoundedRect
                        x={x}
                        y={BAR.top}
                        width={BAR.width}
                        height={BAR.height}
                        r={BAR.radius}
                        color={markColor}
                      />
                    </Group>
                  ))}
                </Group>
              </Group>
            </Group>
          </Group>
        </Canvas>
      </View>
    </PressableScale>
  );
});

export interface GlassIconButtonProps {
  path: string;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  tone?: GlassOrbTone;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GlassIconButton = memo(function GlassIconButton({
  path,
  accessibilityLabel,
  onPress,
  size = 48,
  tone = 'neutral',
  disabled = false,
  style,
}: GlassIconButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const r = size / 2;
  const canvasPad = Math.round(size * 0.12);
  const canvas = size + canvasPad * 2;
  const slop = Math.max(0, Math.ceil((MIN_TARGET - canvas) / 2));
  const c = canvasPad + r;
  const { press, tx, ty, onPressIn, onPressOut } = usePressPhysics(canvas, reduceMotion);
  const mark = useMemo(() => Skia.Path.MakeFromSVGString(path), [path]);
  const kind = markKind(path);
  const markSize = size * 0.5;
  const scale = markSize / 24;
  const offset = (size - markSize) / 2;
  const tint = tone === 'primary' ? colors.onPrimary : GLOSS;

  const bodyTransform = useDerivedValue(() => [
    { translateX: c },
    { translateY: c + press.value },
    { scale: 1 - press.value * 0.05 },
    { translateX: -c },
    { translateY: -c },
  ]);
  const markShift = useDerivedValue(() => [
    { translateX: tx.value * press.value * 1.6 },
    { translateY: ty.value * press.value * 1.6 },
  ]);

  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  if (!mark) return null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={slop}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      style={style}
    >
      <View style={[{ width: canvas, height: canvas }, disabled && styles.disabledIcon]}>
        <Canvas style={{ width: canvas, height: canvas }}>
          <Group transform={bodyTransform}>
            <Group transform={[{ translateX: canvasPad }, { translateY: canvasPad }]}>
              <GlassBody
                size={size}
                tone={tone}
                themeColors={colors}
                press={press}
                tx={tx}
                ty={ty}
              />
            </Group>
            <Group transform={markShift}>
              <Group
                transform={[
                  { translateX: canvasPad + offset },
                  { translateY: canvasPad + offset },
                  { scale },
                ]}
              >
                <Mark path={mark} kind={kind} color={tint} />
              </Group>
            </Group>
          </Group>
        </Canvas>
      </View>
    </PressableScale>
  );
});

export interface GlassOrbButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  path?: string;
  label?: string;
  accessibilityLabel?: string;
  onPress: () => void;
  size?: number;
  tone?: GlassOrbTone;
  disabled?: boolean;
  active?: boolean;
  rotate?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Universal Glass Orb Button:
 * Uses Skia canvas with specular lens physics and smooth halo icons.
 * If path is provided or icon matches a standard GlassMark, renders ultra-sharp SVG paths.
 * Also supports Ionicons fallback seamlessly.
 */
export const GlassOrbButton = memo(function GlassOrbButton({
  icon,
  path,
  label,
  accessibilityLabel,
  onPress,
  size = 52,
  tone = 'neutral',
  disabled = false,
  active = false,
  rotate = false,
  style,
}: GlassOrbButtonProps) {
  const accLabel = accessibilityLabel ?? label ?? (icon as string) ?? 'Button';

  // Map common Ionicons to GlassMarks
  const resolvedPath = useMemo(() => {
    if (path) return path;
    if (!icon) return null;
    if (icon === 'play' || icon === 'play-outline') return PLAY_D;
    if (icon === 'checkmark' || icon === 'checkmark-outline') return GlassMarks.checkmark;
    if (icon === 'close' || icon === 'close-outline') return GlassMarks.close;
    if (icon === 'stop' || icon === 'stop-outline') return GlassMarks.stop;
    if (icon === 'camera-reverse' || icon === 'camera-reverse-outline') return GlassMarks.flip;
    if (icon === 'play-back' || icon === 'play-back-outline') return GlassMarks.rewind;
    if (icon === 'play-forward' || icon === 'play-forward-outline') return GlassMarks.forward;
    if (icon === 'volume-high' || icon === 'volume-high-outline') return GlassMarks.volume;
    if (icon === 'volume-mute' || icon === 'volume-mute-outline') return GlassMarks.volumeMute;
    if (icon === 'information-circle' || icon === 'information-circle-outline') return GlassMarks.info;
    return null;
  }, [path, icon]);

  if (resolvedPath) {
    return (
      <GlassIconButton
        path={resolvedPath}
        accessibilityLabel={accLabel}
        onPress={onPress}
        size={size}
        tone={tone === 'default' ? 'neutral' : tone}
        disabled={disabled}
        style={style}
      />
    );
  }

  // Fallback rendering for any arbitrary Ionicons using Skia GlassBody
  return (
    <FallbackGlassButton
      icon={icon!}
      accessibilityLabel={accLabel}
      onPress={onPress}
      size={size}
      tone={tone === 'default' ? 'neutral' : tone}
      disabled={disabled}
      rotate={rotate}
      style={style}
    />
  );
});

function FallbackGlassButton({
  icon,
  accessibilityLabel,
  onPress,
  size,
  tone,
  disabled,
  rotate,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  size: number;
  tone: GlassOrbTone;
  disabled: boolean;
  rotate: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const canvasPad = Math.round(size * 0.12);
  const canvas = size + canvasPad * 2;
  const slop = Math.max(0, Math.ceil((MIN_TARGET - canvas) / 2));
  const c = canvasPad + size / 2;
  const { press, tx, ty, onPressIn, onPressOut } = usePressPhysics(canvas, reduceMotion);

  const bodyTransform = useDerivedValue(() => [
    { translateX: c },
    { translateY: c + press.value },
    { scale: 1 - press.value * 0.05 },
    { translateX: -c },
    { translateY: -c },
  ]);

  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const iconSize = Math.round(size * 0.46);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={slop}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      style={style}
    >
      <View style={[{ width: canvas, height: canvas }, disabled && styles.disabledIcon]}>
        <Canvas style={{ width: canvas, height: canvas }}>
          <Group transform={bodyTransform}>
            <Group transform={[{ translateX: canvasPad }, { translateY: canvasPad }]}>
              <GlassBody
                size={size}
                tone={tone}
                themeColors={colors}
                press={press}
                tx={tx}
                ty={ty}
              />
            </Group>
          </Group>
        </Canvas>
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.center,
            rotate && styles.rotated,
          ]}
        >
          <Ionicons name={icon} size={iconSize} color={GLOSS} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledIcon: { opacity: 0.4 },
  disabledPlay: { opacity: 0.45 },
  rotated: {
    transform: [{ rotate: '135deg' }],
  },
});
