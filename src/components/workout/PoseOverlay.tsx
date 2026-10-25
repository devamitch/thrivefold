import {
  Canvas,
  DashPathEffect,
  FillType,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
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
const MIN_VIS = 0.5;
/** Face and hands ease towards each detection (they are thin details, not predicted). */
const FOLLOW = 0.6;

/**
 * Tracking: a One Euro filter per coordinate (calm when still, quick when moving) on each
 * detection, then extrapolation along the filtered velocity to the frame actually on screen.
 * A detection describes a camera frame from ~100-250 ms ago; the preview on screen is itself
 * ~60 ms behind the sensor. So the skeleton is drawn where the body is in the visible frame.
 */
const MIN_CUTOFF_HZ = 1.4;
const BETA = 0.006;
const D_CUTOFF_HZ = 1.2;
const PREVIEW_LAG_MS = 60;
const MAX_LEAD_MS = 140;
/** Display frames ease this far towards the predicted point: hides the 10 Hz steps. */
const DISPLAY_FOLLOW = 0.55;

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
  /** Date.now() time the detected frame was captured by the camera. */
  capturedAt?: SharedValue<number>;
}

/** Eases `out` towards `target` (both in stage pixels) in place; snaps when sizes differ. */
function easeInto(out: number[], target: number[], follow: number): number[] {
  'worklet';
  if (out.length !== target.length) return target.slice();
  for (let i = 0; i < target.length; i++) out[i] = out[i] + (target[i] - out[i]) * follow;
  return out;
}

/** One Euro smoothing factor for a cutoff (Hz) at a sample interval (s). */
function alpha(cutoffHz: number, dtS: number): number {
  'worklet';
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / dtS);
}

interface Props {
  feed: PoseFeed;
  /** Size of the stage the camera preview fills (centre-cropped). */
  width: number;
  height: number;
  /** Joints to draw in the warning colour (changes only when a fault starts or ends). */
  highlight: number[];
  /**
   * The joint the exercise is measured at, as [a, vertex, c] for the left and right side: the
   * clearer side gets a live angle arc at the vertex.
   */
  angleJoints?: { left: [number, number, number]; right: [number, number, number] } | null;
  /**
   * The camera preview is a SurfaceView, which ignores rounded clipping; the overlay paints
   * the stage's corners in the page colour instead.
   */
  cornerRadius?: number;
  maskColor?: string;
}

/**
 * The live skeleton: one Skia canvas, everything computed on the UI thread, React never
 * re-renders for a frame. Luminous limbs in the brand colour with a white core, small joints,
 * and an arc at the joint being measured. When nobody is in view a dashed outline shows where
 * to stand.
 */
export const PoseOverlay = memo(function PoseOverlay({
  feed,
  width,
  height,
  highlight,
  angleJoints,
  cornerRadius = 0,
  maskColor,
}: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const glow = colors.dockActive;
  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const present = useSharedValue(0);
  const faceShown = useSharedValue<number[]>([]);
  const handsShown = useSharedValue<number[]>([]);
  // One Euro state, in stage pixels: filtered position, filtered velocity (px/ms), visibility.
  const fx = useSharedValue<number[]>([]);
  const fdx = useSharedValue<number[]>([]);
  const vis = useSharedValue<number[]>([]);
  const detAt = useSharedValue(0);
  const lastSeq = useSharedValue(-1);
  const hot = useSharedValue<number[]>(highlight);
  const arcJoints = useSharedValue<number[]>([]);
  useEffect(() => {
    hot.value = highlight;
  }, [highlight, hot]);
  useEffect(() => {
    arcJoints.value = angleJoints ? [...angleJoints.left, ...angleJoints.right] : [];
  }, [angleJoints, arcJoints]);

  // The frame callback runs on the UI thread only while there is motion to show: a new
  // detection wakes it, and it sleeps once the drawing has settled.
  const awake = useSharedValue(false);
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
    // Same maths as the preview's FILL_CENTER.
    const scale = Math.max(width / fw, height / fh);
    const dx = (width - fw * scale) / 2;
    const dy = (height - fh * scale) / 2;
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
    if (f.length || faceShown.value.length)
      faceShown.value = f.length
        ? easeInto(faceShown.value, toStage(f), reduceMotion ? 1 : FOLLOW)
        : [];
    const h = feed.hands?.value ?? [];
    if (h.length || handsShown.value.length)
      handsShown.value = h.length
        ? easeInto(handsShown.value, toStage(h), reduceMotion ? 1 : FOLLOW)
        : [];

    if (p.length < N * 3) {
      if (present.value !== 0) present.value = 0;
      fx.value = [];
      if (awake.value) {
        awake.value = false;
        runOnJS(sleep)();
      }
      return;
    }

    const now = Date.now();
    const seq = feed.seq?.value ?? 0;
    const captured = feed.capturedAt?.value ?? 0;
    const t = captured > 0 && now - captured < 1000 ? captured : now - 120;

    // New detection: run the One Euro filter.
    if (seq !== lastSeq.value) {
      lastSeq.value = seq;
      const fresh = fx.value.length !== N * 2 || reduceMotion;
      const dtMs = fresh ? 100 : Math.max(16, Math.min(400, t - detAt.value));
      const dtS = dtMs / 1000;
      const X = fresh ? new Array(N * 2).fill(0) : fx.value;
      const DX = fresh ? new Array(N * 2).fill(0) : fdx.value;
      const V = new Array(N);
      const aD = alpha(D_CUTOFF_HZ, dtS);
      for (let i = 0; i < N; i++) {
        V[i] = p[i * 3 + 2];
        for (let k = 0; k < 2; k++) {
          const raw = k === 0 ? p[i * 3] * fw * scale + dx : p[i * 3 + 1] * fh * scale + dy;
          const j = i * 2 + k;
          if (fresh) {
            X[j] = raw;
            DX[j] = 0;
            continue;
          }
          const d = (raw - X[j]) / dtMs;
          DX[j] = DX[j] + aD * (d - DX[j]);
          const cutoff = MIN_CUTOFF_HZ + BETA * Math.abs(DX[j] * 1000);
          X[j] = X[j] + alpha(cutoff, dtS) * (raw - X[j]);
        }
      }
      fx.value = X;
      fdx.value = DX;
      vis.value = V;
      detAt.value = t;
    }

    const X = fx.value;
    const DX = fdx.value;
    const V = vis.value;
    if (X.length !== N * 2) return;
    const lead = reduceMotion
      ? 0
      : Math.max(0, Math.min(MAX_LEAD_MS, now - PREVIEW_LAG_MS - detAt.value));
    const snap = reduceMotion || present.value === 0;
    const cur = shown.value;
    let maxDelta = 0;
    for (let i = 0; i < N && maxDelta < 0.5; i++) {
      const tx = X[i * 2] + DX[i * 2] * lead;
      const ty = X[i * 2 + 1] + DX[i * 2 + 1] * lead;
      maxDelta = Math.max(maxDelta, Math.abs(tx - cur[i * 3]), Math.abs(ty - cur[i * 3 + 1]));
    }
    if (!snap && maxDelta < 0.5 && present.value === 1) {
      if (!faceShown.value.length && !handsShown.value.length && awake.value) {
        awake.value = false;
        runOnJS(sleep)();
      }
      return;
    }
    shown.modify((s) => {
      'worklet';
      for (let i = 0; i < N; i++) {
        const tx = X[i * 2] + DX[i * 2] * lead;
        const ty = X[i * 2 + 1] + DX[i * 2 + 1] * lead;
        s[i * 3] = snap ? tx : s[i * 3] + (tx - s[i * 3]) * DISPLAY_FOLLOW;
        s[i * 3 + 1] = snap ? ty : s[i * 3 + 1] + (ty - s[i * 3 + 1]) * DISPLAY_FOLLOW;
        s[i * 3 + 2] = V[i];
      }
      return s;
    });
    if (present.value !== 1) present.value = 1;
  }, false);

  // Each derived value reads `shown` and `present` itself: Reanimated only re-runs a derived
  // value for shared values it reads directly, not ones read inside a helper it calls.
  const bonePath = (list: [number, number][], s: number[], on: number) => {
    'worklet';
    const path = Skia.Path.Make();
    if (!on) return path;
    for (const [a, b] of list) {
      if (s[a * 3 + 2] < MIN_VIS || s[b * 3 + 2] < MIN_VIS) continue;
      path.moveTo(s[a * 3], s[a * 3 + 1]);
      path.lineTo(s[b * 3], s[b * 3 + 1]);
    }
    return path;
  };
  const bones = useDerivedValue(() => {
    const path = bonePath(SKELETON, shown.value, present.value);
    // Neck: shoulder midpoint to the nose.
    const s = shown.value;
    const n = LM.nose * 3;
    const l = LM.leftShoulder * 3;
    const r = LM.rightShoulder * 3;
    if (present.value && s[n + 2] >= MIN_VIS && s[l + 2] >= MIN_VIS && s[r + 2] >= MIN_VIS) {
      path.moveTo((s[l] + s[r]) / 2, (s[l + 1] + s[r + 1]) / 2);
      path.lineTo(s[n], s[n + 1]);
    }
    return path;
  });

  const faultBones = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (!present.value || hj.length === 0) return path;
    for (const [a, b] of SKELETON) {
      if (!(hj.includes(a) || hj.includes(b))) continue;
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
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 3.2);
    }
    const n = LM.nose * 3;
    if (s[n + 2] >= MIN_VIS) path.addCircle(s[n], s[n + 1], 4);
    return path;
  });

  const jointRings = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (!present.value) return path;
    for (const i of JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 7.5);
    }
    return path;
  });

  const faultJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (!present.value) return path;
    for (const i of hj) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 9);
    }
    return path;
  });

  // The measured joint: an arc between its two limbs at the clearer side's vertex.
  const angleArc = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const aj = arcJoints.value;
    if (!present.value || aj.length !== 6) return path;
    const conf = (k: number) =>
      Math.min(s[aj[k] * 3 + 2], s[aj[k + 1] * 3 + 2], s[aj[k + 2] * 3 + 2]);
    const k = conf(0) >= conf(3) ? 0 : 3;
    if (conf(k) < MIN_VIS) return path;
    const [a, b, c] = [aj[k], aj[k + 1], aj[k + 2]];
    const bx = s[b * 3];
    const by = s[b * 3 + 1];
    const start = (Math.atan2(s[a * 3 + 1] - by, s[a * 3] - bx) * 180) / Math.PI;
    const end = (Math.atan2(s[c * 3 + 1] - by, s[c * 3] - bx) * 180) / Math.PI;
    let sweep = end - start;
    while (sweep > 180) sweep -= 360;
    while (sweep < -180) sweep += 360;
    const r = 30;
    path.addArc({ x: bx - r, y: by - r, width: r * 2, height: r * 2 }, start, sweep);
    return path;
  });

  // Where to stand: a soft body outline, shown only while nobody is detected.
  const guide = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (present.value) return path;
    const gh = height * 0.62;
    const cx = width / 2;
    const top = height * 0.2;
    const headR = gh * 0.075;
    path.addCircle(cx, top + headR, headR);
    const sh = top + headR * 2 + gh * 0.03;
    const shoulderW = gh * 0.22;
    path.addRRect(
      Skia.RRectXY(Skia.XYWHRect(cx - shoulderW / 2, sh, shoulderW, gh * 0.38), 22, 22),
    );
    path.moveTo(cx - shoulderW * 0.25, sh + gh * 0.38);
    path.lineTo(cx - shoulderW * 0.3, top + gh);
    path.moveTo(cx + shoulderW * 0.25, sh + gh * 0.38);
    path.lineTo(cx + shoulderW * 0.3, top + gh);
    return path;
  });

  const guideOpacity = useDerivedValue(() => (present.value ? 0 : 0.5));

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
    const fp = faceShown.value;
    if (fp.length < 236) return path;
    const poly = (from: number, to: number, close: boolean) => {
      path.moveTo(fp[from * 2], fp[from * 2 + 1]);
      for (let i = from + 1; i < to; i++) path.lineTo(fp[i * 2], fp[i * 2 + 1]);
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
    const fp = faceShown.value;
    if (fp.length < 236) return path;
    for (const c of [FACE_GROUPS.irises[0], FACE_GROUPS.irises[0] + 5]) {
      const r = Math.max(
        2,
        Math.hypot(fp[(c + 1) * 2] - fp[(c + 3) * 2], fp[(c + 1) * 2 + 1] - fp[(c + 3) * 2 + 1]) /
          2,
      );
      path.addCircle(fp[c * 2], fp[c * 2 + 1], r);
    }
    return path;
  });

  const handLines = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const hp = handsShown.value;
    for (let base = 0; base + 42 <= hp.length; base += 42) {
      for (const [a, b] of HAND_BONES) {
        path.moveTo(hp[base + a * 2], hp[base + a * 2 + 1]);
        path.lineTo(hp[base + b * 2], hp[base + b * 2 + 1]);
      }
    }
    return path;
  });

  const handJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const hp = handsShown.value;
    for (let i = 0; i + 1 < hp.length; i += 2) path.addCircle(hp[i], hp[i + 1], 2.4);
    return path;
  });

  if (!width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group opacity={guideOpacity}>
        <Path
          path={guide}
          style="stroke"
          strokeWidth={2.5}
          color={colors.callText}
          strokeCap="round"
          strokeJoin="round"
        >
          <DashPathEffect intervals={[10, 8]} />
        </Path>
      </Group>
      {/* Two soft halos, then a crisp white core with a brand-to-white gradient */}
      <Path
        path={bones}
        style="stroke"
        strokeWidth={18}
        strokeCap="round"
        strokeJoin="round"
        color={glow}
        opacity={0.18}
      />
      <Path
        path={bones}
        style="stroke"
        strokeWidth={8}
        strokeCap="round"
        strokeJoin="round"
        color={glow}
        opacity={0.55}
      />
      <Path path={bones} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[colors.callText, glow, colors.callText]}
        />
      </Path>
      <Path
        path={faultBones}
        style="stroke"
        strokeWidth={6}
        strokeCap="round"
        color={colors.error}
      />
      <Path
        path={angleArc}
        style="stroke"
        strokeWidth={4}
        strokeCap="round"
        color={colors.callText}
      />
      <Path path={jointRings} style="stroke" strokeWidth={2} color={glow} opacity={0.8} />
      <Path path={joints} color={colors.callText} />
      <Path path={faultJoints} color={colors.error} />
      {/* Face and hands, thinner, so the body stays the main read */}
      <Path
        path={faceLines}
        style="stroke"
        strokeWidth={1.4}
        strokeJoin="round"
        color={colors.callText}
        opacity={0.75}
      />
      <Path path={irises} style="stroke" strokeWidth={1.6} color={glow} />
      <Path
        path={handLines}
        style="stroke"
        strokeWidth={6}
        strokeCap="round"
        color={glow}
        opacity={0.3}
      />
      <Path
        path={handLines}
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
        color={colors.callText}
      />
      <Path path={handJoints} color={glow} />
      {cornerMask && maskColor ? <Path path={cornerMask} color={maskColor} /> : null}
    </Canvas>
  );
});
