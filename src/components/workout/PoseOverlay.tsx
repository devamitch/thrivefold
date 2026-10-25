import { Canvas, DashPathEffect, FillType, Group, Path, Skia } from '@shopify/react-native-skia';
import React, { memo, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { FACE_GROUPS, HAND_BONES } from 'pose-landmarker';

import { LM, SKELETON } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';

const N = 33;
const JOINTS = [...new Set(SKELETON.flat())];
/** Share of the remaining distance covered each display frame: glides between detections. */
const FOLLOW = 0.6;
const MIN_VIS = 0.5;

/** Latest detection, written straight from the camera event (no React state). */
export interface PoseFeed {
  /** Flat [x, y, visibility] * 33, normalised to the analysed frame; empty array = nobody. */
  points: SharedValue<number[]>;
  frameW: SharedValue<number>;
  frameH: SharedValue<number>;
  /** Flat [x, y] face points (FACE_GROUPS order); empty when off or not seen. */
  face?: SharedValue<number[]>;
  /** Hands, concatenated: 42 numbers per hand. */
  hands?: SharedValue<number[]>;
  /** Increments with every detection, so the overlay can measure motion between them. */
  seq?: SharedValue<number>;
}

/**
 * The camera preview is live but a detection describes a frame ~80-140 ms old. Joints are
 * drawn where their recent velocity says they are now (capped), which keeps the skeleton on
 * the body instead of trailing behind it.
 */
const LEAD_MS = 40;
const MAX_LEAD_MS = 80;

/** Eases `out` towards `target` (both in stage pixels) in place; snaps when sizes differ. */
function easeInto(out: number[], target: number[], follow: number): number[] {
  'worklet';
  if (out.length !== target.length) return target.slice();
  for (let i = 0; i < target.length; i++) out[i] = out[i] + (target[i] - out[i]) * follow;
  return out;
}

interface Props {
  feed: PoseFeed;
  /** Size of the stage the camera preview fills (centre-cropped). */
  width: number;
  height: number;
  /** Joints to draw in the warning colour (changes only when a fault starts or ends). */
  highlight: number[];
  /**
   * The camera preview is a SurfaceView, which ignores rounded clipping; the overlay paints
   * the stage's corners in the page colour instead.
   */
  cornerRadius?: number;
  maskColor?: string;
}

/**
 * The live skeleton: one Skia canvas, everything computed on the UI thread. Detections arrive
 * ~15 times a second; drawn points ease towards each one every frame, so the body glides
 * instead of jumping, and React never re-renders for a frame. When nobody is in view a dashed
 * body outline shows where to stand.
 */
export const PoseOverlay = memo(function PoseOverlay({ feed, width, height, highlight, cornerRadius = 0, maskColor }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const present = useSharedValue(0);
  const faceShown = useSharedValue<number[]>([]);
  // Motion prediction state: last detection (stage px), per-point velocity (px/ms), arrival time.
  const lastDet = useSharedValue<number[]>([]);
  const vel = useSharedValue<number[]>([]);
  const arrivedAt = useSharedValue(0);
  const lastSeq = useSharedValue(-1);
  const handsShown = useSharedValue<number[]>([]);
  const hot = useSharedValue<number[]>(highlight);
  useEffect(() => {
    hot.value = highlight;
  }, [highlight, hot]);

  // Map the newest detection into stage pixels (same maths as the preview's FILL_CENTER)
  // and ease the drawn points towards it. Mutates in place: no per-frame allocation.
  const awake = useSharedValue(false);
  // The frame callback runs on the main thread on Android: only while there is motion to show.
  // A new detection wakes it; it puts itself to sleep once the drawing has settled.
  // eslint-disable-next-line prefer-const
  let frame: ReturnType<typeof useFrameCallback>;
  const wake = useCallback(() => frame.setActive(true), []); // eslint-disable-line react-hooks/exhaustive-deps
  const sleep = useCallback(() => frame.setActive(false), []); // eslint-disable-line react-hooks/exhaustive-deps
  useAnimatedReaction(
    () => feed.seq?.value ?? 0,
    (cur, prev) => {
      if (cur !== prev && !awake.value) {
        awake.value = true;
        runOnJS(wake)();
      }
    },
  );
  frame = useFrameCallback(() => {
    const p = feed.points.value;
    const fw = feed.frameW.value;
    const fh = feed.frameH.value;
    if (!fw || !fh) return;
    const scale = Math.max(width / fw, height / fh);
    const dx = (width - fw * scale) / 2;
    const dy = (height - fh * scale) / 2;
    // Face and hands: map to stage pixels and ease, same as the body.
    const toStage = (src: number[]) => {
      'worklet';
      const out = new Array(src.length);
      for (let i = 0; i < src.length; i += 2) {
        out[i] = src[i] * fw * scale + dx;
        out[i + 1] = src[i + 1] * fh * scale + dy;
      }
      return out;
    };
    const f = feed.face?.value ?? [];
    if (f.length || faceShown.value.length) faceShown.value = f.length ? easeInto(faceShown.value, toStage(f), reduceMotion ? 1 : FOLLOW) : [];
    const h = feed.hands?.value ?? [];
    if (h.length || handsShown.value.length) handsShown.value = h.length ? easeInto(handsShown.value, toStage(h), reduceMotion ? 1 : FOLLOW) : [];
    if (p.length < N * 3) {
      if (present.value !== 0) present.value = 0;
      if (awake.value) {
        awake.value = false;
        runOnJS(sleep)();
      }
      return;
    }
    const snap = reduceMotion || present.value === 0;
    const now = Date.now();
    const seq = feed.seq?.value ?? 0;
    // A new detection: map it, and measure velocity against the previous one.
    if (seq !== lastSeq.value) {
      const det = new Array(N * 3);
      for (let i = 0; i < N; i++) {
        det[i * 3] = p[i * 3] * fw * scale + dx;
        det[i * 3 + 1] = p[i * 3 + 1] * fh * scale + dy;
        det[i * 3 + 2] = p[i * 3 + 2];
      }
      const prev = lastDet.value;
      const dt = Math.max(1, now - arrivedAt.value);
      const v = new Array(N * 2).fill(0);
      if (prev.length === N * 3 && !snap && dt < 400) {
        for (let i = 0; i < N; i++) {
          // Light smoothing of velocity so one noisy detection doesn't fling a joint.
          const old = vel.value.length === N * 2 ? vel.value : v;
          v[i * 2] = 0.5 * old[i * 2] + 0.5 * ((det[i * 3] - prev[i * 3]) / dt);
          v[i * 2 + 1] = 0.5 * old[i * 2 + 1] + 0.5 * ((det[i * 3 + 1] - prev[i * 3 + 1]) / dt);
        }
      }
      lastDet.value = det;
      vel.value = v;
      arrivedAt.value = now;
      lastSeq.value = seq;
    }
    const det = lastDet.value;
    const v = vel.value;
    if (det.length !== N * 3) return;
    const lead = reduceMotion ? 0 : Math.min(MAX_LEAD_MS, LEAD_MS + (now - arrivedAt.value));
    // Nothing left to move: skip the update so the canvas isn't redrawn every frame.
    const cur = shown.value;
    let maxDelta = 0;
    for (let i = 0; i < N && maxDelta < 0.5; i++) {
      const tx = det[i * 3] + (v.length ? v[i * 2] * lead : 0);
      const ty = det[i * 3 + 1] + (v.length ? v[i * 2 + 1] * lead : 0);
      maxDelta = Math.max(maxDelta, Math.abs(tx - cur[i * 3]), Math.abs(ty - cur[i * 3 + 1]));
    }
    if (!snap && maxDelta < 0.5 && present.value === 1) {
      // Settled, and no face or hands to animate: stop running every frame until new data.
      if (!faceShown.value.length && !handsShown.value.length && awake.value) {
        awake.value = false;
        runOnJS(sleep)();
      }
      return;
    }
    shown.modify((s) => {
      'worklet';
      for (let i = 0; i < N; i++) {
        const tx = det[i * 3] + (v.length ? v[i * 2] * lead : 0);
        const ty = det[i * 3 + 1] + (v.length ? v[i * 2 + 1] * lead : 0);
        s[i * 3] = snap ? tx : s[i * 3] + (tx - s[i * 3]) * FOLLOW;
        s[i * 3 + 1] = snap ? ty : s[i * 3 + 1] + (ty - s[i * 3 + 1]) * FOLLOW;
        s[i * 3 + 2] = det[i * 3 + 2];
      }
      return s;
    });
    if (present.value !== 1) present.value = 1;
  }, false);

  const bones = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (!present.value) return path;
    for (const [a, b] of SKELETON) {
      if (s[a * 3 + 2] < MIN_VIS || s[b * 3 + 2] < MIN_VIS) continue;
      path.moveTo(s[a * 3], s[a * 3 + 1]);
      path.lineTo(s[b * 3], s[b * 3 + 1]);
    }
    return path;
  });

  const faultBones = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const h = hot.value;
    if (!present.value || h.length === 0) return path;
    for (const [a, b] of SKELETON) {
      if (!(h.includes(a) || h.includes(b))) continue;
      if (s[a * 3 + 2] < MIN_VIS || s[b * 3 + 2] < MIN_VIS) continue;
      path.moveTo(s[a * 3], s[a * 3 + 1]);
      path.lineTo(s[b * 3], s[b * 3 + 1]);
    }
    return path;
  });

  const joints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (!present.value) return path;
    for (const i of JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 4.5);
    }
    return path;
  });

  const faultJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const h = hot.value;
    if (!present.value) return path;
    for (const i of h) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 7);
    }
    return path;
  });

  const head = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const n = LM.nose * 3;
    const l = LM.leftShoulder * 3;
    const r = LM.rightShoulder * 3;
    if (!present.value || s[n + 2] < MIN_VIS) return path;
    const d = Math.max(26, Math.min(130, Math.hypot(s[l] - s[r], s[l + 1] - s[r + 1]) * 0.55));
    path.addCircle(s[n], s[n + 1], d / 2);
    return path;
  });

  // Where to stand: a soft body outline, shown only while nobody is detected.
  const guide = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (present.value) return path;
    const h = height * 0.78;
    const cx = width / 2;
    const top = height * 0.11;
    const headR = h * 0.075;
    path.addCircle(cx, top + headR, headR);
    const sh = top + headR * 2 + h * 0.03;
    const shoulderW = h * 0.22;
    path.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - shoulderW / 2, sh, shoulderW, h * 0.38), 22, 22));
    path.moveTo(cx - shoulderW * 0.25, sh + h * 0.38);
    path.lineTo(cx - shoulderW * 0.3, top + h);
    path.moveTo(cx + shoulderW * 0.25, sh + h * 0.38);
    path.lineTo(cx + shoulderW * 0.3, top + h);
    return path;
  });

  const guideOpacity = useDerivedValue(() => (present.value ? 0 : 0.55));

  // Rounded stage corners over the SurfaceView preview: the rectangle minus a rounded rect.
  const cornerMask = React.useMemo(() => {
    if (!cornerRadius || !maskColor) return null;
    const path = Skia.Path.Make();
    path.addRect(Skia.XYWHRect(0, 0, width, height));
    path.addRRect(Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), cornerRadius, cornerRadius));
    path.setFillType(FillType.EvenOdd);
    return path;
  }, [cornerRadius, maskColor, width, height]);

  // Face: closed eye, lip and outline contours, open brows.
  const faceLines = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const f = faceShown.value;
    if (f.length < 236) return path;
    const poly = (from: number, to: number, close: boolean) => {
      path.moveTo(f[from * 2], f[from * 2 + 1]);
      for (let i = from + 1; i < to; i++) path.lineTo(f[i * 2], f[i * 2 + 1]);
      if (close) path.close();
    };
    poly(FACE_GROUPS.leftEye[0], FACE_GROUPS.leftEye[1], true);
    poly(FACE_GROUPS.rightEye[0], FACE_GROUPS.rightEye[1], true);
    poly(FACE_GROUPS.leftBrow[0], FACE_GROUPS.leftBrow[0] + 5, false);
    poly(FACE_GROUPS.rightBrow[0], FACE_GROUPS.rightBrow[0] + 5, false);
    poly(FACE_GROUPS.lips[0], FACE_GROUPS.lips[1], true);
    poly(FACE_GROUPS.outline[0], FACE_GROUPS.outline[1], true);
    return path;
  });

  // Irises: a ring around each pupil, sized from its four edge points.
  const irises = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const f = faceShown.value;
    if (f.length < 236) return path;
    for (const c of [FACE_GROUPS.irises[0], FACE_GROUPS.irises[0] + 5]) {
      const r = Math.max(2, Math.hypot(f[(c + 1) * 2] - f[(c + 3) * 2], f[(c + 1) * 2 + 1] - f[(c + 3) * 2 + 1]) / 2);
      path.addCircle(f[c * 2], f[c * 2 + 1], r);
    }
    return path;
  });

  const handLines = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const h = handsShown.value;
    for (let base = 0; base + 42 <= h.length; base += 42) {
      for (const [a, b] of HAND_BONES) {
        path.moveTo(h[base + a * 2], h[base + a * 2 + 1]);
        path.lineTo(h[base + b * 2], h[base + b * 2 + 1]);
      }
    }
    return path;
  });

  const handJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const h = handsShown.value;
    for (let i = 0; i + 1 < h.length; i += 2) path.addCircle(h[i], h[i + 1], 2.6);
    return path;
  });

  if (!width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group opacity={guideOpacity}>
        <Path path={guide} style="stroke" strokeWidth={2.5} color={colors.callText} strokeCap="round" strokeJoin="round">
          <DashPathEffect intervals={[10, 8]} />
        </Path>
      </Group>
      {/* Glow under the bones, then crisp bones, then joints with a ring */}
      <Path path={bones} style="stroke" strokeWidth={11} strokeCap="round" color={colors.primary} opacity={0.35} />
      <Path path={bones} style="stroke" strokeWidth={3.5} strokeCap="round" color={colors.callText} />
      <Path path={faultBones} style="stroke" strokeWidth={4.5} strokeCap="round" color={colors.error} />
      <Path path={head} style="stroke" strokeWidth={2.5} color={colors.callText} opacity={0.9} />
      <Path path={joints} color={colors.callText} />
      <Path path={joints} style="stroke" strokeWidth={2} color={colors.primary} />
      <Path path={faultJoints} color={colors.error} />
      {/* Face and hands, thinner, so the body stays the main read */}
      <Path path={faceLines} style="stroke" strokeWidth={1.6} strokeJoin="round" color={colors.callText} opacity={0.85} />
      <Path path={irises} style="stroke" strokeWidth={1.6} color={colors.primary} />
      <Path path={handLines} style="stroke" strokeWidth={6} strokeCap="round" color={colors.accent} opacity={0.3} />
      <Path path={handLines} style="stroke" strokeWidth={2.2} strokeCap="round" color={colors.callText} />
      <Path path={handJoints} color={colors.accent} />
      {cornerMask && maskColor ? <Path path={cornerMask} color={maskColor} /> : null}
    </Canvas>
  );
});
