import { Canvas, DashPathEffect, Group, Path, Skia } from '@shopify/react-native-skia';
import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { LM, SKELETON } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';

const N = 33;
const STRIDE = 4; // incoming: x, y, z, visibility
const MIN_VIS = 0.5;

/** Which parts of the 33-point pose are drawn. All 33 are always tracked and smoothed. */
export interface PoseLayers {
  body?: boolean; // torso, arms, legs
  feet?: boolean; // ankle-heel-toe triangles
  hands?: boolean; // wrist-thumb/index/pinky from the pose model
  head?: boolean; // head ring + neck
  eyes?: boolean; // eye dots (off by default)
}
const DEFAULT_LAYERS: Required<PoseLayers> = {
  body: true,
  feet: true,
  hands: true,
  head: true,
  eyes: false,
};
const B_BODY = 1,
  B_FEET = 2,
  B_HANDS = 4,
  B_HEAD = 8,
  B_EYES = 16;
const bitsOf = (l: PoseLayers) => {
  const m = { ...DEFAULT_LAYERS, ...l };
  return (
    (m.body ? B_BODY : 0) |
    (m.feet ? B_FEET : 0) |
    (m.hands ? B_HANDS : 0) |
    (m.head ? B_HEAD : 0) |
    (m.eyes ? B_EYES : 0)
  );
};

const JOINTS = [
  LM.leftShoulder,
  LM.rightShoulder,
  LM.leftElbow,
  LM.rightElbow,
  LM.leftWrist,
  LM.rightWrist,
  LM.leftHip,
  LM.rightHip,
  LM.leftKnee,
  LM.rightKnee,
  LM.leftAnkle,
  LM.rightAnkle,
];
const FEET: [number, number][] = [
  [27, 29],
  [29, 31],
  [31, 27],
  [28, 30],
  [30, 32],
  [32, 28],
];
const HANDS: [number, number][] = [
  [15, 19],
  [15, 17],
  [15, 21],
  [16, 20],
  [16, 18],
  [16, 22],
];

const STALE_MS = 350;
const TAU_STILL_MS = 70;
const TAU_FAST_MS = 14;
const FAST_PX = 40;
const DOT_GAP = 9;

export interface PoseFeed {
  points: SharedValue<number[]>; // flat [x, y, z, visibility] * 33; empty = nobody
  frameW: SharedValue<number>;
  frameH: SharedValue<number>;
  seq: SharedValue<number>;
  face?: SharedValue<number[]>;
  hands?: SharedValue<number[]>;
  capturedAt?: SharedValue<number>;
}

interface Props {
  feed: PoseFeed;
  width: number;
  height: number;
  highlight: number[];
  angleJoints?: { left: [number, number, number]; right: [number, number, number] } | null;
  layers?: PoseLayers;
}

/**
 * Dotted, futuristic-but-quiet skeleton.
 *  - Bones are rows of round dots (one DashPathEffect, no extra geometry).
 *  - Joints: a dot with a thin ring. Head: a ring + neck. Torso: a faint panel.
 *  - ONE pass over all 33 landmarks per frame builds every path (see `geo`).
 *  - Speed-adaptive smoothing on the UI thread; stale data fades; hidden joints vanish.
 */
export const PoseOverlay = memo(function PoseOverlay({
  feed,
  width,
  height,
  highlight,
  angleJoints,
  layers,
}: Props) {
  const { colors } = useTheme();

  const stageW = useSharedValue(width);
  const stageH = useSharedValue(height);
  const shown = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const target = useSharedValue<number[]>(new Array(N * 3).fill(0));
  const present = useSharedValue(0);
  const hasBody = useSharedValue(0);
  const snapNext = useSharedValue(1);
  const arrivedAt = useSharedValue(0);
  const lastSeq = useSharedValue(-1);
  const hot = useSharedValue<number[]>(highlight);
  const arcJoints = useSharedValue<number[]>([]);
  const layerBits = useSharedValue(bitsOf(layers ?? {}));

  useEffect(() => {
    stageW.value = width;
    stageH.value = height;
  }, [width, height, stageW, stageH]);
  useEffect(() => {
    hot.value = highlight;
  }, [highlight, hot]);
  useEffect(() => {
    arcJoints.value = angleJoints ? [...angleJoints.left, ...angleJoints.right] : [];
  }, [angleJoints, arcJoints]);
  const layerKey = bitsOf(layers ?? {});
  useEffect(() => {
    layerBits.value = layerKey;
  }, [layerKey, layerBits]);

  useFrameCallback((info) => {
    'worklet';
    const now = info.timestamp;
    const dt = Math.min(64, info.timeSincePreviousFrame ?? 16);
    const W = stageW.value;
    const H = stageH.value;
    const fw = feed.frameW.value;
    const fh = feed.frameH.value;
    if (!W || !H || !fw || !fh) return;

    const seq = feed.seq.value;
    if (seq !== lastSeq.value) {
      lastSeq.value = seq;
      const p = feed.points.value;
      if (p.length >= N * STRIDE) {
        const scale = Math.max(W / fw, H / fh); // FILL_CENTER, same as the preview
        const dx = (W - fw * scale) / 2;
        const dy = (H - fh * scale) / 2;
        if (present.value < 0.05 || now - arrivedAt.value > 400) snapNext.value = 1;
        arrivedAt.value = now;
        hasBody.value = 1;
        target.modify((t) => {
          'worklet';
          for (let i = 0; i < N; i++) {
            t[i * 3] = p[i * STRIDE] * fw * scale + dx;
            t[i * 3 + 1] = p[i * STRIDE + 1] * fh * scale + dy;
            t[i * 3 + 2] = p[i * STRIDE + 3];
          }
          return t;
        });
      } else {
        hasBody.value = 0;
      }
    }

    const want = hasBody.value === 1 && now - arrivedAt.value < STALE_MS ? 1 : 0;
    present.value += (want - present.value) * Math.min(1, dt / 110);
    if (present.value < 0.01) {
      if (present.value !== 0) present.value = 0;
      return;
    }

    const snap = snapNext.value === 1;
    const t = target.value;
    shown.modify((s) => {
      'worklet';
      for (let i = 0; i < N; i++) {
        const k = i * 3;
        if (snap) {
          s[k] = t[k];
          s[k + 1] = t[k + 1];
        } else {
          const ex = t[k] - s[k];
          const ey = t[k + 1] - s[k + 1];
          const m = Math.min(1, Math.sqrt(ex * ex + ey * ey) / FAST_PX);
          const a = 1 - Math.exp(-dt / (TAU_STILL_MS + (TAU_FAST_MS - TAU_STILL_MS) * m));
          s[k] += ex * a;
          s[k + 1] += ey * a;
        }
        s[k + 2] = t[k + 2];
      }
      return s;
    });
    if (snap) snapNext.value = 0;
  }, true);

  /** Every path for this frame, built in a single pass over the landmarks. */
  const geo = useDerivedValue(() => {
    const bones = Skia.Path.Make();
    const joints = Skia.Path.Make();
    const rings = Skia.Path.Make();
    const torso = Skia.Path.Make();
    const fault = Skia.Path.Make();
    const arc = Skia.Path.Make();
    if (present.value <= 0.01) return { bones, joints, rings, torso, fault, arc };

    const s = shown.value;
    const m = layerBits.value;
    const ok = (i: number) => s[i * 3 + 2] >= MIN_VIS;
    const X = (i: number) => s[i * 3];
    const Y = (i: number) => s[i * 3 + 1];
    const seg = (a: number, b: number) => {
      if (ok(a) && ok(b)) {
        bones.moveTo(X(a), Y(a));
        bones.lineTo(X(b), Y(b));
      }
    };

    if (m & B_BODY) {
      for (const [a, b] of SKELETON) seg(a, b);
      for (const i of JOINTS) {
        if (ok(i)) {
          joints.addCircle(X(i), Y(i), 3.2);
          rings.addCircle(X(i), Y(i), 7.5);
        }
      }
      if (ok(11) && ok(12) && ok(23) && ok(24)) {
        torso.moveTo(X(11), Y(11));
        torso.lineTo(X(12), Y(12));
        torso.lineTo(X(24), Y(24));
        torso.lineTo(X(23), Y(23));
        torso.close();
      }
    }
    if (m & B_FEET) for (const [a, b] of FEET) seg(a, b);
    if (m & B_HANDS) for (const [a, b] of HANDS) seg(a, b);

    if (m & B_HEAD) {
      let cx = 0;
      let cy = 0;
      let r = 0;
      if (ok(7) && ok(8)) {
        cx = (X(7) + X(8)) / 2;
        cy = (Y(7) + Y(8)) / 2;
        r = Math.max(14, Math.hypot(X(7) - X(8), Y(7) - Y(8)) * 0.62);
      } else if (ok(0) && ok(11) && ok(12)) {
        cx = X(0);
        cy = Y(0);
        r = Math.max(14, Math.hypot(X(11) - X(12), Y(11) - Y(12)) * 0.3);
      }
      if (r > 0) {
        rings.addCircle(cx, cy, r);
        if (ok(11) && ok(12)) {
          const mx = (X(11) + X(12)) / 2;
          const my = (Y(11) + Y(12)) / 2;
          const vx = mx - cx;
          const vy = my - cy;
          const len = Math.hypot(vx, vy) || 1;
          bones.moveTo(cx + (vx / len) * r, cy + (vy / len) * r);
          bones.lineTo(mx, my);
        }
      }
    }
    if (m & B_EYES) {
      if (ok(2)) joints.addCircle(X(2), Y(2), 1.8);
      if (ok(5)) joints.addCircle(X(5), Y(5), 1.8);
    }

    const hj = hot.value;
    if (hj.length > 0) {
      for (const [a, b] of SKELETON) {
        if ((hj.includes(a) || hj.includes(b)) && ok(a) && ok(b)) {
          fault.moveTo(X(a), Y(a));
          fault.lineTo(X(b), Y(b));
        }
      }
      for (const i of hj) if (ok(i)) fault.addCircle(X(i), Y(i), 7);
    }

    const aj = arcJoints.value;
    if (aj.length === 6) {
      const conf = (k: number) =>
        Math.min(s[aj[k] * 3 + 2], s[aj[k + 1] * 3 + 2], s[aj[k + 2] * 3 + 2]);
      const k = conf(0) >= conf(3) ? 0 : 3;
      if (conf(k) >= MIN_VIS) {
        const a = aj[k];
        const b = aj[k + 1];
        const c = aj[k + 2];
        const start = (Math.atan2(Y(a) - Y(b), X(a) - X(b)) * 180) / Math.PI;
        const end = (Math.atan2(Y(c) - Y(b), X(c) - X(b)) * 180) / Math.PI;
        let sweep = end - start;
        while (sweep > 180) sweep -= 360;
        while (sweep < -180) sweep += 360;
        const r = 26;
        arc.addArc({ x: X(b) - r, y: Y(b) - r, width: r * 2, height: r * 2 }, start, sweep);
      }
    }
    return { bones, joints, rings, torso, fault, arc };
  });

  const bonesP = useDerivedValue(() => geo.value.bones);
  const jointsP = useDerivedValue(() => geo.value.joints);
  const ringsP = useDerivedValue(() => geo.value.rings);
  const torsoP = useDerivedValue(() => geo.value.torso);
  const faultP = useDerivedValue(() => geo.value.fault);
  const arcP = useDerivedValue(() => geo.value.arc);

  const guide = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (present.value >= 0.8) return path;
    const bw = Math.min(width * 0.7, 320);
    const bh = Math.min(height * 0.7, 560);
    const l = (width - bw) / 2;
    const r = l + bw;
    const t = (height - bh) / 2;
    const b = t + bh;
    const arm = 28;
    path.moveTo(l, t + arm);
    path.lineTo(l, t);
    path.lineTo(l + arm, t);
    path.moveTo(r - arm, t);
    path.lineTo(r, t);
    path.lineTo(r, t + arm);
    path.moveTo(r, b - arm);
    path.lineTo(r, b);
    path.lineTo(r - arm, b);
    path.moveTo(l + arm, b);
    path.lineTo(l, b);
    path.lineTo(l, b - arm);
    return path;
  });
  const guideOpacity = useDerivedValue(() => (1 - present.value) * 0.5);

  if (!width || !height) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group opacity={guideOpacity}>
        <Path
          path={guide}
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
          strokeJoin="round"
          color="#FFFFFF"
        />
      </Group>

      <Group opacity={present}>
        <Path path={torsoP} color="rgba(255,255,255,0.07)" />

        <Path
          path={bonesP}
          style="stroke"
          strokeWidth={6}
          strokeCap="round"
          color="rgba(0,0,0,0.22)"
        >
          <DashPathEffect intervals={[0.1, DOT_GAP]} />
        </Path>
        <Path path={bonesP} style="stroke" strokeWidth={3.2} strokeCap="round" color="#FFFFFF">
          <DashPathEffect intervals={[0.1, DOT_GAP]} />
        </Path>

        <Path path={faultP} style="stroke" strokeWidth={3.4} strokeCap="round" color={colors.error}>
          <DashPathEffect intervals={[0.1, 7]} />
        </Path>

        <Path path={ringsP} style="stroke" strokeWidth={1.3} color="rgba(255,255,255,0.7)" />
        <Path path={jointsP} color="#FFFFFF" />
        <Path path={arcP} style="stroke" strokeWidth={2.4} strokeCap="round" color="#FFFFFF" />
      </Group>
    </Canvas>
  );
});
