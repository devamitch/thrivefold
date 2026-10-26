import {
  Canvas,
  FillType,
  Group,
  Path,
  Skia,
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
const LEFT_JOINTS = [
  LM.leftShoulder,
  LM.leftElbow,
  LM.leftWrist,
  LM.leftHip,
  LM.leftKnee,
  LM.leftAnkle,
];

const RIGHT_JOINTS = [
  LM.rightShoulder,
  LM.rightElbow,
  LM.rightWrist,
  LM.rightHip,
  LM.rightKnee,
  LM.rightAnkle,
];

const FEET_BONES: [number, number][] = [
  [LM.leftAnkle, LM.leftHeel],
  [LM.leftHeel, LM.leftFoot],
  [LM.leftFoot, LM.leftAnkle],
  [LM.rightAnkle, LM.rightHeel],
  [LM.rightHeel, LM.rightFoot],
  [LM.rightFoot, LM.rightAnkle],
];

const HEAD_BONES: [number, number][] = [
  [LM.leftEyeInner, LM.leftEye],
  [LM.leftEye, LM.leftEyeOuter],
  [LM.rightEyeInner, LM.rightEye],
  [LM.rightEye, LM.rightEyeOuter],
  [LM.mouthLeft, LM.mouthRight],
  [LM.nose, LM.leftEyeInner],
  [LM.nose, LM.rightEyeInner],
];

const MIN_VIS = 0.42;
const FOLLOW = 0.88;

/**
 * High-performance, snappy tracking:
 * - One Euro filter with higher cutoff for instantaneous, jitter-free responsiveness.
 * - Minimal lag extrapolation so the skeleton matches what the user is doing live.
 * - Frame callback runs continuously on UI thread — NO bridge hops (runOnJS).
 */
const MIN_CUTOFF_HZ = 1.6;
const BETA = 0.08;
const D_CUTOFF_HZ = 2.5;

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
  const faceShown = useSharedValue<number[]>([]);

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

    // Face mesh tracking
    const f = feed.face?.value ?? [];
    if (f.length || faceShown.value.length) {
      faceShown.value = f.length
        ? easeInto(faceShown.value, toStage(f), reduceMotion ? 1 : FOLLOW)
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
    shown.modify((s) => {
      'worklet';
      for (let i = 0; i < N; i++) {
        s[i * 3] = X[i * 2] + DX[i * 2] * lead;
        s[i * 3 + 1] = X[i * 2 + 1] + DX[i * 2 + 1] * lead;
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

  // Main kinetic skeleton lines (torso, arms, legs, feet support triangles, and facial features)
  const bones = useDerivedValue(() => {
    const s = shown.value;
    const path = bonePath(SKELETON, s, present.value);
    if (present.value <= 0) return path;

    // Feet support triangles (grounded base)
    for (const [a, b] of FEET_BONES) {
      if (s[a * 3 + 2] >= MIN_VIS && s[b * 3 + 2] >= MIN_VIS) {
        path.moveTo(s[a * 3], s[a * 3 + 1]);
        path.lineTo(s[b * 3], s[b * 3 + 1]);
      }
    }

    // Facial feature contours (eyes, nose bridge, mouth)
    for (const [a, b] of HEAD_BONES) {
      if (s[a * 3 + 2] >= MIN_VIS && s[b * 3 + 2] >= MIN_VIS) {
        path.moveTo(s[a * 3], s[a * 3 + 1]);
        path.lineTo(s[b * 3], s[b * 3 + 1]);
      }
    }

    // Cervical spine from shoulder midpoint to nose
    const n = LM.nose * 3;
    const l = LM.leftShoulder * 3;
    const r = LM.rightShoulder * 3;
    if (s[n + 2] >= MIN_VIS && s[l + 2] >= MIN_VIS && s[r + 2] >= MIN_VIS) {
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

  // Left articulation joints (electric cyan #00E5FF)
  const leftJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of LEFT_JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 2.8);
    }
    return path;
  });

  const leftJointRings = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of LEFT_JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 5.6);
    }
    return path;
  });

  // Right articulation joints (electric amber #FF9100)
  const rightJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of RIGHT_JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 2.8);
    }
    return path;
  });

  const rightJointRings = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    for (const i of RIGHT_JOINTS) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 5.6);
    }
    return path;
  });

  // Center alignment nose dot
  const nosePip = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    if (present.value <= 0) return path;
    const n = LM.nose * 3;
    if (s[n + 2] >= MIN_VIS) path.addCircle(s[n], s[n + 1], 3.2);
    return path;
  });

  // Dense face mesh pips
  const faceMesh = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const fp = faceShown.value;
    if (present.value <= 0 || fp.length === 0) return path;
    for (let i = 0; i + 1 < fp.length; i += 2) {
      path.addCircle(fp[i], fp[i + 1], 1.2);
    }
    return path;
  });

  // Warning beacon on fault joints
  const faultJoints = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (present.value <= 0 || hj.length === 0) return path;
    for (const i of hj) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 5.5);
    }
    return path;
  });

  const faultHalos = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const hj = hot.value;
    if (present.value <= 0 || hj.length === 0) return path;
    for (const i of hj) {
      if (s[i * 3 + 2] >= MIN_VIS) path.addCircle(s[i * 3], s[i * 3 + 1], 10.5);
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

  const angleVertex = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const s = shown.value;
    const aj = arcJoints.value;
    if (present.value <= 0 || aj.length !== 6) return path;
    const conf = (k: number) =>
      Math.min(s[aj[k] * 3 + 2], s[aj[k + 1] * 3 + 2], s[aj[k + 2] * 3 + 2]);
    const k = conf(0) >= conf(3) ? 0 : 3;
    if (conf(k) < MIN_VIS) return path;
    const b = aj[k + 1];
    path.addCircle(s[b * 3], s[b * 3 + 1], 3.2);
    return path;
  });

  // Sleek athletic viewfinder reticle when user is stepping into frame
  const guide = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (present.value >= 0.8) return path;
    const boxW = Math.min(width * 0.72, 340);
    const boxH = Math.min(height * 0.78, 580);
    const cx = width / 2;
    const cy = height / 2;
    const left = cx - boxW / 2;
    const right = cx + boxW / 2;
    const top = cy - boxH / 2;
    const bottom = cy + boxH / 2;
    const arm = Math.min(boxW, boxH) * 0.12;
    const r = 16;

    // Top-left bracket
    path.moveTo(left, top + arm);
    path.lineTo(left, top + r);
    path.quadTo(left, top, left + r, top);
    path.lineTo(left + arm, top);

    // Top-right bracket
    path.moveTo(right - arm, top);
    path.lineTo(right - r, top);
    path.quadTo(right, top, right, top + r);
    path.lineTo(right, top + arm);

    // Bottom-right bracket
    path.moveTo(right, bottom - arm);
    path.lineTo(right - r, bottom);
    path.quadTo(right, bottom, right - r, bottom);
    path.lineTo(right - arm, bottom);

    // Bottom-left bracket
    path.moveTo(left + arm, bottom);
    path.lineTo(left + r, bottom);
    path.quadTo(left, bottom, left, bottom - r);
    path.lineTo(left, bottom - arm);

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
    for (let i = 0; i + 1 < hp.length; i += 2) path.addCircle(hp[i], hp[i + 1], 1.6);
    return path;
  });

  if (!width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {/* Viewfinder stand-in guide */}
      <Group opacity={guideOpacity}>
        <Path
          path={guide}
          style="stroke"
          strokeWidth={2.0}
          color={colors.callText}
          strokeCap="round"
          strokeJoin="round"
        />
      </Group>

      {/* Layer 1: Ambient kinetic bloom */}
      <Path
        path={bones}
        style="stroke"
        strokeWidth={4.8}
        strokeCap="round"
        strokeJoin="round"
        color={glow}
        opacity={0.28}
      />

      {/* Layer 2: Ultra-crisp laser core line */}
      <Path
        path={bones}
        style="stroke"
        strokeWidth={2.2}
        strokeCap="round"
        strokeJoin="round"
        color={colors.callText}
      />

      {/* Layer 3: Warning fault bones (high-contrast alert) */}
      <Path
        path={faultBones}
        style="stroke"
        strokeWidth={3.8}
        strokeCap="round"
        strokeJoin="round"
        color={colors.error}
      />

      {/* Layer 4: Left articulation: cyan glowing aura + crisp core pip */}
      <Path path={leftJointRings} style="stroke" strokeWidth={1.2} color="#00E5FF" opacity={0.65} />
      <Path path={leftJoints} color="#FFFFFF" />

      {/* Layer 5: Right articulation: amber glowing aura + crisp core pip */}
      <Path path={rightJointRings} style="stroke" strokeWidth={1.2} color="#FF9100" opacity={0.65} />
      <Path path={rightJoints} color="#FFFFFF" />

      {/* Layer 6: Center alignment nose dot */}
      <Path path={nosePip} color="#FFFFFF" />

      {/* Layer 7: Face mesh dense pips */}
      <Path path={faceMesh} color="#00E5FF" opacity={0.35} />

      {/* Layer 8: High-contrast fault joint alerts */}
      <Path path={faultHalos} style="stroke" strokeWidth={2.0} color={colors.error} opacity={0.7} />
      <Path path={faultJoints} color={colors.error} />

      {/* Layer 9: Measured angle reticle & arc */}
      <Path
        path={angleArc}
        style="stroke"
        strokeWidth={2.6}
        strokeCap="round"
        color={colors.callText}
      />
      <Path path={angleVertex} color={glow} />

      {/* Layer 10: Hands kinetic lines & pips */}
      <Path
        path={handLines}
        style="stroke"
        strokeWidth={1.2}
        strokeCap="round"
        color="#00E5FF"
        opacity={0.45}
      />
      <Path path={handJoints} color={colors.callText} />

      {/* Corner mask for rounded display */}
      {cornerMask && maskColor ? <Path path={cornerMask} color={maskColor} /> : null}
    </Canvas>
  );
});
