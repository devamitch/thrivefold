import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { SKELETON, LM, type Landmark } from '../../domain/pose/movement';
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
const FOLLOW = 0.3;
const BREATH_MS = 2400;
const DOT = 10;

/**
 * Skeleton over a centre-cropped camera preview, drawn with plain native views moved on
 * the UI thread. Detections arrive ~15 times a second; drawn points ease towards each one
 * every display frame, so the skeleton glides. Facial landmarks and eyes are drawn with
 * high-precision optical reticles and gentle breathing pulse.
 */
export function PoseOverlay({ landmarks, frameWidth, frameHeight, width, height, highlight }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const target = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = reduceMotion ? 0.5 : withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath, reduceMotion]);

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
    let moved = false;
    const out = s.slice();
    for (let i = 0; i < N * 3; i++) {
      const d = t[i] - s[i];
      if (Math.abs(d) > 0.5) {
        out[i] = s[i] + d * (reduceMotion ? 1 : FOLLOW);
        moved = true;
      } else out[i] = t[i];
    }
    if (moved) shown.value = out;
  });

  if (landmarks.length < N || !width || !height) return null;
  const hot = new Set(highlight);

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {SKELETON.map(([a, b]) => {
        const isFace = a <= 10 && b <= 10;
        return (
          <Bone
            key={`${a}-${b}`}
            a={a}
            b={b}
            shown={shown}
            color={hot.has(a) || hot.has(b) ? colors.error : isFace ? 'rgba(255, 255, 255, 0.65)' : colors.onPrimary}
            thick={hot.has(a) || hot.has(b)}
            isFace={isFace}
          />
        );
      })}
      {JOINTS.map((i) => {
        const isEye = i === LM.leftEye || i === LM.rightEye;
        return (
          <Joint
            key={i}
            i={i}
            shown={shown}
            breath={breath}
            color={hot.has(i) ? colors.error : isEye ? colors.accentText : colors.primary}
            ring={colors.onPrimary}
            big={hot.has(i)}
            isEye={isEye}
          />
        );
      })}
    </View>
  );
}

function Bone({
  a,
  b,
  shown,
  color,
  thick,
  isFace,
}: {
  a: number;
  b: number;
  shown: SharedValue<number[]>;
  color: string;
  thick: boolean;
  isFace?: boolean;
}) {
  const h = isFace ? 2 : thick ? 5 : 3;
  const style = useAnimatedStyle(() => {
    const s = shown.value;
    const x1 = s[a * 3];
    const y1 = s[a * 3 + 1];
    const x2 = s[b * 3];
    const y2 = s[b * 3 + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const visible = s[a * 3 + 2] >= 0.5 && s[b * 3 + 2] >= 0.5;
    return {
      opacity: visible ? (isFace ? 0.7 : 0.85) : 0,
      width: len,
      transform: [{ translateX: x1 }, { translateY: y1 - h / 2 }, { rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }],
    };
  });
  return <Animated.View style={[styles.bone, { height: h, borderRadius: h / 2, backgroundColor: color }, style]} />;
}

function Joint({
  i,
  shown,
  breath,
  color,
  ring,
  big,
  isEye,
}: {
  i: number;
  shown: SharedValue<number[]>;
  breath: SharedValue<number>;
  color: string;
  ring: string;
  big: boolean;
  isEye?: boolean;
}) {
  const baseSize = isEye ? 14 : big ? DOT * 1.6 : DOT;
  const dot = useAnimatedStyle(() => {
    const s = shown.value;
    return {
      opacity: s[i * 3 + 2] >= 0.5 ? 1 : 0,
      transform: [
        { translateX: s[i * 3] - baseSize / 2 },
        { translateY: s[i * 3 + 1] - baseSize / 2 },
        { scale: 1 + (isEye ? 0.35 : 0.22) * breath.value },
      ],
    };
  });
  const glow = useAnimatedStyle(() => {
    const s = shown.value;
    const g = baseSize * (isEye ? 2.8 : 2.4);
    return {
      opacity: s[i * 3 + 2] >= 0.5 ? (isEye ? 0.28 : 0.16) + 0.22 * breath.value : 0,
      transform: [
        { translateX: s[i * 3] - g / 2 },
        { translateY: s[i * 3 + 1] - g / 2 },
        { scale: 0.85 + 0.35 * breath.value },
      ],
    };
  });
  const g = baseSize * (isEye ? 2.8 : 2.4);
  return (
    <>
      <Animated.View style={[styles.abs, { width: g, height: g, borderRadius: g / 2, backgroundColor: color }, glow]} />
      <Animated.View
        style={[
          styles.abs,
          {
            width: baseSize,
            height: baseSize,
            borderRadius: baseSize / 2,
            backgroundColor: color,
            borderColor: ring,
            borderWidth: isEye ? 1.5 : 1,
          },
          dot,
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  abs: { left: 0, position: 'absolute', top: 0 },
  bone: { left: 0, position: 'absolute', top: 0, transformOrigin: '0% 50%' },
});
