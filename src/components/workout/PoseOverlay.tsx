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
import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { HAND_BONES } from 'pose-landmarker';

import { LM, SKELETON } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';

const N = 33;
const JOINTS = [...new Set(SKELETON.flat())];
const MIN_VIS = 0.45;
const FOLLOW = 0.85;

/**
 * High-performance, snappy tracking:
 * - One Euro filter with higher cutoff for instantaneous, jitter-free responsiveness.
 * - Minimal lag extrapolation so the skeleton matches what the user is doing live.
 * - Frame callback runs continuously on UI thread — NO bridge hops (runOnJS).
 */
const MIN_CUTOFF_HZ = 2.8;
const BETA = 0.02;
const D_CUTOFF_HZ = 1.8;
const DISPLAY_FOLLOW = 0.94;

/** Latest detection, written straight from the camera event (no React state). */
export interface PoseFeed {
  /** Flat [x, y, visibility] * 33, normalised to the analysed frame; empty array = nobody. */
  points: SharedValue<number[]>;
  frameW: SharedValue<number>;
  frameH: SharedValue<number>;
  /** Flat [x, y] face points (optional). */
  face?: SharedValue<number[]>;
  /** Hands, concatenated: 42 numbers per hand. */
  hands?: SharedValue<number[]>;
  /** Increments with every detection, so the overlay can measure motion between them. */
  seq?: SharedValue<number>;
  /** Date.now() time the detected frame was captured by the camera. */
  capturedAt?: SharedValue<number>;
}

/** Eases `out` towards `target` in place. */
function easeInto(out: number[], target: number[], follow: number): number[] {
  'worklet';
  if (out.length !== target.length) return target.slice();
  for (let i = 0; i < target.length; i++) out[i] = out[i] + (target[i] - out[i]) * follow;
  return out;
}

/** One Euro smoothing factor. */
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
 * Modern, cyber-kinetic Skia pose overlay:
 * - Real-time 60fps tracking on the UI thread without bridge lag.
 * - Crisp, elegant laser-kinetic skeleton with subtle ambient bloom.
 * - Minimalist head posture ring & horizon line (replaces cluttered, ugly face spiderwebs).
 * - High-contrast fault alerts & dynamic angle arc.
 * - Holographic dashed guide when stepping into frame.
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
  const primary = colors.primary;

  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const present = useSharedValue(0);
  const handsShown = useSharedValue<number[]>([]);

  // One Euro state: filtered position, velocity (px/ms), visibility
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

  // Continuously active worklet frame callback — zero JS-bridge hops for peak smoothness
  useFrameCallback(() => {
    const p = feed.points.value;
    const fw = feed.frameW.value;
    const fh = feed.frameH.value;
    if (!fw || !fh) return;

    // Fill-center transformation
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

    // Hands tracking
    const h = feed.hands?.value ?? [];
    if (h.length || handsShown.value.length) {
      handsShown.value = h.length
        ? easeInto(handsShown.value, toStage(h), reduceMotion ? 1 : FOLLOW)
        : [];
    }

    // No detection: smoothly fade out guide / skeleton
    if (p.length < N * 3) {
      if (present.value > 0) {
        present.value = Math.max(0, present.value - 0.12);
      }
      fx.value = [];
      return;
    }

    const now = Date.now();
    const seq = feed.seq?.value ?? 0;
    const captured = feed.capturedAt?.value ?? 0;
    const t = captured > 0 && now - captured < 1000 ? captured : now - 40;

    // New detection: update One Euro filter
    if (seq !== lastSeq.value) {
      lastSeq.value = seq;
      const fresh = fx.value.length !== N * 2 || reduceMotion;
      const dtMs = fresh ? 50 : Math.max(16, Math.min(250, t - detAt.value));
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

    // Responsive lead extrapolation
    const lead = reduceMotion ? 0 : Math.max(0, Math.min(50, now - detAt.value));
    const snap = reduceMotion || present.value === 0;

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

    if (present.value < 1) {
      present.value = Math.min(1, present.value + 0.15);
    }
  }, true);

  // Helper for bone paths
  const bonePath = (list: [number, number][], s: number[], on: number) => {
    'worklet';
    const path = Skia.Path.Make();
    if (on <= 0) return path;
    for (const [a, b] of list) {
      if (s[a * 3 + 2] < MIN_VIS || s[b * 3 + 2] < MIN_VIS) continue;
      path.moveTo(s[a * 3], s[a * 3 + 1]);
      path.lineTo(s[b * 3], s[b * 3 + 1]);
    }
    return path;
  };

  // Main kinetic skeleton lines
  const bones = useDerivedValue(() => {
    const path = bonePath(SKELETON, shown.value, present.value);
    const s = shown.value;
    const n = LM.nose * 3;
    const l = LM.leftShoulder * 3;
    const r = LM.rightShoulder * 3;
    if (present.value > 0 && s[n + 2] >= MIN_VIS && s[l + 2] >= MIN_VIS && s[r + 2] >= MIN_VIS) {
      path.moveTo((s[l] + s[r]) / 2, (s[l + 1] + s[r + 1]) / 2);
      path.lineTo(s[n], s[n + 1]);
    }
    return path;
  });

  // Fault bones (limbs needing correction)
  const faultBones = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (present.value <= 0 || hj.length === 0) return path;
    for (const [a, b] of SKELETON) {
      if (!(hj.includes(a) || hj.includes(b))) continue;
      if (s[a * 3 + 2] < MIN_VIS || s[b * 3 + 2] < MIN_VIS) continue;
      path.moveTo(s[a * 3], s[a * 3 + 1]);
      path.lineTo(s[b * 3], s[b * 3 + 1]);
    }
    return path;
  });

  // Modern clean head posture beacon (halo & eye horizon)
  const headBeacon = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    const n = LM.nose * 3;
    const le = LM.leftEye * 3;
    const re = LM.rightEye * 3;
    const ls = LM.leftShoulder * 3;
    const rs = LM.rightShoulder * 3;

    if (s[n + 2] >= MIN_VIS) {
      // Sleek head posture halo
      const shoulderSpan =
        s[ls + 2] >= MIN_VIS && s[rs + 2] >= MIN_VIS
          ? Math.hypot(s[ls] - s[rs], s[ls + 1] - s[rs + 1])
          : 90;
      const headRadius = Math.max(16, Math.min(32, shoulderSpan * 0.22));
      path.addCircle(s[n], s[n + 1] - headRadius * 0.45, headRadius);
    }

    // Eye horizon line
    if (s[le + 2] >= MIN_VIS && s[re + 2] >= MIN_VIS) {
      path.moveTo(s[le], s[le + 1]);
      path.lineTo(s[re], s[re + 1]);
    }

    return path;
  });

  // Inner solid laser joint pips
  const joints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 2.4);
    }
    const n = LM.nose * 3;
    if (s[n + 2] >= MIN_VIS) path.addCircle(s[n], s[n + 1], 3.0);
    return path;
  });

  // Outer glowing radar rings around joints
  const jointRings = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 5.5);
    }
    return path;
  });

  // High-contrast warning halos on fault joints
  const faultJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (present.value <= 0) return path;
    for (const i of hj) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 8.5);
    }
    return path;
  });

  // Dynamic live angle arc at measured joint
  const angleArc = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const aj = arcJoints.value;
    if (present.value <= 0 || aj.length !== 6) return path;
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
    const r = 28;
    path.addArc({ x: bx - r, y: by - r, width: r * 2, height: r * 2 }, start, sweep);
    return path;
  });

  // Elegant futuristic holographic silhouette guide when nobody is detected
  const guide = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (present.value >= 0.8) return path;
    const gh = height * 0.60;
    const cx = width / 2;
    const top = height * 0.22;
    const headR = gh * 0.075;
    path.addCircle(cx, top + headR, headR);
    const sh = top + headR * 2 + gh * 0.03;
    const shoulderW = gh * 0.24;
    path.addRRect(
      Skia.RRectXY(Skia.XYWHRect(cx - shoulderW / 2, sh, shoulderW, gh * 0.38), 24, 24),
    );
    path.moveTo(cx - shoulderW * 0.25, sh + gh * 0.38);
    path.lineTo(cx - shoulderW * 0.3, top + gh);
    path.moveTo(cx + shoulderW * 0.25, sh + gh * 0.38);
    path.lineTo(cx + shoulderW * 0.3, top + gh);
    return path;
  });

  const guideOpacity = useDerivedValue(() => (1 - present.value) * 0.45);

  // Rounded stage corners
  const cornerMask = React.useMemo(() => {
    if (!cornerRadius || !maskColor) return null;
    const path = Skia.Path.Make();
    path.addRect(Skia.XYWHRect(0, 0, width, height));
    path.addRRect(Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), cornerRadius, cornerRadius));
    path.setFillType(FillType.EvenOdd);
    return path;
  }, [cornerRadius, maskColor, width, height]);

  // Hands tracking lines
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
    for (let i = 0; i + 1 < hp.length; i += 2) path.addCircle(hp[i], hp[i + 1], 2.2);
    return path;
  });

  if (!width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {/* Holographic stand-in guide */}
      <Group opacity={guideOpacity}>
        <Path
          path={guide}
          style="stroke"
          strokeWidth={2.0}
          color={colors.callText}
          strokeCap="round"
          strokeJoin="round"
        >
          <DashPathEffect intervals={[8, 8]} />
        </Path>
      </Group>

      {/* Layer 1: Ambient kinetic bloom */}
      <Path
        path={bones}
        style="stroke"
        strokeWidth={5.5}
        strokeCap="round"
        strokeJoin="round"
        color={glow}
        opacity={0.22}
      />

      {/* Layer 2: Ultra-crisp laser core line with vertical cyber gradient */}
      <Path path={bones} style="stroke" strokeWidth={2.8} strokeCap="round" strokeJoin="round">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[colors.callText, glow, primary]}
        />
      </Path>

      {/* Layer 3: Warning fault bones (high-contrast alert) */}
      <Path
        path={faultBones}
        style="stroke"
        strokeWidth={3.8}
        strokeCap="round"
        color={colors.error}
      />

      {/* Layer 4: Head posture beacon (minimalist halo & horizon line) */}
      <Path
        path={headBeacon}
        style="stroke"
        strokeWidth={1.8}
        strokeCap="round"
        color={glow}
        opacity={0.85}
      />

      {/* Layer 5: Joint radar rings & inner solid laser pips */}
      <Path path={jointRings} style="stroke" strokeWidth={1.2} color={glow} opacity={0.8} />
      <Path path={joints} color={colors.callText} />

      {/* Layer 6: High-contrast fault joint alerts */}
      <Path path={faultJoints} style="stroke" strokeWidth={2.2} color={colors.error} />

      {/* Layer 7: Measured angle reticle & arc */}
      <Path
        path={angleArc}
        style="stroke"
        strokeWidth={2.6}
        strokeCap="round"
        color={colors.callText}
      />

      {/* Layer 8: Hands kinetic lines & pips */}
      <Path
        path={handLines}
        style="stroke"
        strokeWidth={1.4}
        strokeCap="round"
        color={glow}
        opacity={0.65}
      />
      <Path path={handJoints} color={colors.callText} />

      {/* Corner mask for rounded display */}
      {cornerMask && maskColor ? <Path path={cornerMask} color={maskColor} /> : null}
    </Canvas>
  );
});
