import { BlurMask, Canvas, Circle, Group, Line, vec } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { SKELETON, type Landmark } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';

interface Props {
  landmarks: Landmark[];
  frameWidth: number;
  frameHeight: number;
  /** Size of the tile the camera preview fills (centre-cropped). */
  width: number;
  height: number;
  /** Joints to draw in the warning colour. */
  highlight: number[];
}

const JOINTS = [...new Set(SKELETON.flat())];
const N = 33;
/** Share of the remaining distance covered each display frame (~60 fps easing). */
const FOLLOW = 0.32;
const BREATH_MS = 2400;

/**
 * Skia skeleton over a centre-cropped camera preview. Detections arrive ~15 times a second;
 * the drawn points ease towards each new detection every display frame, so the skeleton
 * moves fluidly instead of jumping. Joints breathe with a slow pulse and soft glow; joints
 * that need fixing pulse in the warning colour.
 */
export function PoseOverlay({ landmarks, frameWidth, frameHeight, width, height, highlight }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  // Projected targets and smoothed display positions, as flat [x0, y0, v0, x1, ...] arrays.
  const target = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const breath = useSharedValue(0);
  const hot = useSharedValue<number[]>([]);

  useEffect(() => {
    breath.value = reduceMotion ? 0.5 : withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath, reduceMotion]);

  useEffect(() => {
    hot.value = highlight;
  }, [highlight, hot]);

  useEffect(() => {
    if (landmarks.length < N || !frameWidth || !frameHeight || !width || !height) return;
    // Same maths as the preview's FILL_CENTER: scale to cover, then centre.
    const scale = Math.max(width / frameWidth, height / frameHeight);
    const dx = (width - frameWidth * scale) / 2;
    const dy = (height - frameHeight * scale) / 2;
    const next = new Array(N * 3);
    for (let i = 0; i < N; i++) {
      next[i * 3] = landmarks[i].x * frameWidth * scale + dx;
      next[i * 3 + 1] = landmarks[i].y * frameHeight * scale + dy;
      next[i * 3 + 2] = landmarks[i].visibility;
    }
    const first = shown.value.every((v) => v === 0);
    target.value = next;
    if (first) shown.value = next;
  }, [landmarks, frameWidth, frameHeight, width, height, target, shown]);

  useFrameCallback(() => {
    const t = target.value;
    const s = shown.value;
    const out = s.slice();
    let moved = false;
    for (let i = 0; i < N * 3; i++) {
      const d = t[i] - s[i];
      if (Math.abs(d) > 0.05) {
        out[i] = s[i] + d * (reduceMotion ? 1 : FOLLOW);
        moved = true;
      } else out[i] = t[i];
    }
    if (moved) shown.value = out;
  });

  if (landmarks.length < N || !width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group>
        {SKELETON.map(([a, b]) => (
          <Bone key={`${a}-${b}`} a={a} b={b} shown={shown} hot={hot} color={colors.onPrimary} hotColor={colors.error} />
        ))}
        {JOINTS.map((i) => (
          <Joint key={i} i={i} shown={shown} hot={hot} breath={breath} color={colors.primary} ring={colors.onPrimary} hotColor={colors.error} />
        ))}
      </Group>
    </Canvas>
  );
}

const visible = (s: number[], i: number) => {
  'worklet';
  return s[i * 3 + 2] >= 0.5;
};

function Bone({ a, b, shown, hot, color, hotColor }: { a: number; b: number; shown: SharedValue<number[]>; hot: SharedValue<number[]>; color: string; hotColor: string }) {
  const p1 = useDerivedValue(() => vec(shown.value[a * 3], shown.value[a * 3 + 1]));
  const p2 = useDerivedValue(() => vec(shown.value[b * 3], shown.value[b * 3 + 1]));
  const opacity = useDerivedValue(() => (visible(shown.value, a) && visible(shown.value, b) ? 0.85 : 0));
  const isHot = useDerivedValue(() => hot.value.includes(a) || hot.value.includes(b));
  const stroke = useDerivedValue(() => (isHot.value ? hotColor : color));
  const width = useDerivedValue(() => (isHot.value ? 5 : 3));
  return <Line p1={p1} p2={p2} color={stroke} strokeWidth={width} opacity={opacity} strokeCap="round" />;
}

function Joint({
  i,
  shown,
  hot,
  breath,
  color,
  ring,
  hotColor,
}: {
  i: number;
  shown: SharedValue<number[]>;
  hot: SharedValue<number[]>;
  breath: SharedValue<number>;
  color: string;
  ring: string;
  hotColor: string;
}) {
  const cx = useDerivedValue(() => shown.value[i * 3]);
  const cy = useDerivedValue(() => shown.value[i * 3 + 1]);
  const on = useDerivedValue(() => (visible(shown.value, i) ? 1 : 0));
  const isHot = useDerivedValue(() => hot.value.includes(i));
  const r = useDerivedValue(() => (isHot.value ? 8 : 4.5) * (1 + 0.22 * breath.value));
  const glowR = useDerivedValue(() => r.value * (2.2 + 0.6 * breath.value));
  const glowOpacity = useDerivedValue(() => on.value * (0.18 + 0.22 * breath.value));
  const fill = useDerivedValue(() => (isHot.value ? hotColor : color));
  return (
    <Group opacity={on}>
      <Circle cx={cx} cy={cy} r={glowR} color={fill} opacity={glowOpacity}>
        <BlurMask blur={6} style="normal" />
      </Circle>
      <Circle cx={cx} cy={cy} r={r} color={fill} />
      <Circle cx={cx} cy={cy} r={r} color={ring} style="stroke" strokeWidth={1.5} />
    </Group>
  );
}
