/**
 * Thrivefold baby sprout, drawn with React Native Skia and driven by Reanimated shared values.
 * A chubby terracotta "T" (big soft head, small body), a sage leaf sprouting from the head,
 * and the golden sun glowing on the tummy. It beats with the user's heart rate when known.
 * Design grid is 1024; the canvas shows a 900-unit window and everything stays inside it.
 */
import React, { useEffect, useMemo } from 'react';
import { Pressable } from 'react-native';
import {
  BlurMask, Canvas, Circle, Group, Oval, Path, Rect, RoundedRect, Skia, useClock,
} from '@shopify/react-native-skia';
import {
  Easing, useDerivedValue, useReducedMotion, withDelay, withTiming, type SharedValue,
} from 'react-native-reanimated';
import type { Rig, ThriveRig } from './rig';

const T_COLOR = '#D9825F';
const T_SHADE = '#C46F4E';
const LIMB = '#CC7655';
const HAND = '#EBA588';
const LEAF_COLOR = '#8FA07E';
const SUN_COLOR = '#F6BE6E';
const WHITE = '#FFFBF5';
const INK = '#2B1B14';
const MOUTH = '#6A3322';
const CHEEK = '#FF9AAB';
const TEAR = '#7EC8F5';

const LEAF_PATH = Skia.Path.MakeFromSVGString(
  'M520 738 V650 C522 540 610 486 690 446 C728 410 752 368 762 328 C792 430 778 556 690 606 C628 640 584 646 570 690 V724 Q570 738 556 738 Z',
)!;
const VEIN_PATH = Skia.Path.MakeFromSVGString('M528 640 C560 556 640 506 716 452')!;
const HEART_SM = Skia.Path.MakeFromSVGString('M0 9 C-16 -2 -14 -16 -6 -15 C-2 -15 0 -12 0 -9 C0 -12 2 -15 6 -15 C14 -16 16 -2 0 9 Z')!;
const HEART_BIG = Skia.Path.MakeFromSVGString('M0 20 C-34 -4 -30 -34 -12 -34 C-4 -34 0 -28 0 -22 C0 -28 4 -34 12 -34 C30 -34 34 -4 0 20 Z')!;
const Z_PATH = Skia.Path.MakeFromSVGString('M0 0 H34 L2 42 H36')!;
const GLASS_BRIDGE = Skia.Path.MakeFromSVGString('M421 346 Q477 326 533 346')!;
const GLASS_ARMS = Skia.Path.MakeFromSVGString('M333 346 L246 334 M621 346 L708 334')!;
const ANGER_PATH = Skia.Path.MakeFromSVGString('M-14 -4 Q-4 -4 -4 -14 M14 -4 Q4 -4 4 -14 M-14 4 Q-4 4 -4 14 M14 4 Q4 4 4 14')!;

const EYE_L = { cx: 377, cy: 350 };
const EYE_R = { cx: 577, cy: 350 };
const L_SH = { x: 262, y: 448 };
const R_SH = { x: 692, y: 448 };
const L_HIP = { x: 447, y: 735 };
const R_HIP = { x: 507, y: 735 };
const SUN_AT = { x: 477, y: 610 };

type Sol = { ex: number; ey: number; hx: number; hy: number };

/** Two-bone IK so hands and feet can simply be given a target point. */
function ik(sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: number): Sol {
  'worklet';
  const dx = tx - sx;
  const dy = ty - sy;
  const raw = Math.hypot(dx, dy) || 0.001;
  const d = Math.min(Math.max(raw, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const ang = a + bend * Math.acos(c);
  return { ex: sx + Math.cos(ang) * l1, ey: sy + Math.sin(ang) * l1, hx: sx + Math.cos(a) * d, hy: sy + Math.sin(a) * d };
}

const RAD = Math.PI / 180;

function Limb({ sx, sy, sol, foot = false }: { sx: number; sy: number; sol: SharedValue<Sol>; foot?: boolean }) {
  const path = useDerivedValue(() => {
    const s = sol.value;
    const p = Skia.PathBuilder.Make();
    p.moveTo(sx, sy);
    p.lineTo(s.ex, s.ey);
    p.lineTo(s.hx, s.hy);
    return p.build();
  });
  const end = useDerivedValue(() => [
    { translateX: sol.value.hx },
    { translateY: sol.value.hy + (foot ? 10 : 0) },
    { scaleX: foot ? 1.35 : 1 },
  ]);
  return (
    <>
      <Path path={path} style="stroke" strokeWidth={foot ? 34 : 32} strokeCap="round" strokeJoin="round" color={LIMB} />
      <Group transform={end}>
        <Circle cx={0} cy={0} r={foot ? 24 : 24} color={foot ? LIMB : HAND} />
      </Group>
    </>
  );
}

function RoundedRectLike({ rect }: { rect: SharedValue<ReturnType<typeof Skia.XYWHRect>> }) {
  return <Rect rect={rect} color={T_COLOR} />;
}

// Big round baby eyes. Everything is drawn inside the head (head spans y 236..486).
function Eye({ cx, cy, side, r }: { cx: number; cy: number; side: -1 | 1; r: Rig }) {
  const clip = useMemo(() => {
    const p = Skia.PathBuilder.Make();
    p.addOval(Skia.XYWHRect(cx - 21, cy - 24, 42, 48));
    return p.build();
  }, [cx, cy]);
  const open = useDerivedValue(() => Math.max(0, r.eyeOpen.value) * (1 - r.blink.value));
  const close = useDerivedValue(() => 1 - Math.min(1, open.value));
  const scaleTf = useDerivedValue(() => {
    const s = Math.min(1.25, Math.max(1, open.value)) * 1.45;
    return [{ translateX: cx }, { translateY: cy }, { scale: s }, { translateX: -cx }, { translateY: -cy }];
  });
  const pupilTf = useDerivedValue(() => {
    const px = Math.max(-9, Math.min(9, (r.lookX.value + r.gazeX.value) * 9));
    const py = Math.max(-8, Math.min(8, (r.lookY.value + r.gazeY.value) * 8));
    return [{ translateX: cx + px }, { translateY: cy + py }, { scale: r.pupil.value }];
  });
  const pupilOp = useDerivedValue(() => 1 - r.love.value);
  const topRect = useDerivedValue(() =>
    Skia.XYWHRect(cx - 45, cy - 94 + close.value * 24 + Math.abs(r.tilt.value) * 0.55, 90, 70));
  const topRot = useDerivedValue(() => [
    { translateX: cx }, { translateY: cy }, { rotate: -side * r.tilt.value * RAD }, { translateX: -cx }, { translateY: -cy },
  ]);
  const botRect = useDerivedValue(() => Skia.XYWHRect(cx - 45, cy + 24 - close.value * 24, 90, 60));
  const squintCy = useDerivedValue(() => cy + 60 - r.squint.value * 34);
  const squintOp = useDerivedValue(() => Math.min(1, r.squint.value * 1.4));
  const lash = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    p.moveTo(cx - 19, cy);
    p.quadTo(cx, cy + 2 + close.value * 12, cx + 19, cy);
    return p.build();
  });
  const lashOp = useDerivedValue(() => Math.max(0, close.value - 0.5) * 2);
  return (
    <Group transform={scaleTf}>
      <Group clip={clip}>
        <Oval x={cx - 21} y={cy - 24} width={42} height={48} color={WHITE} />
        <Group transform={pupilTf} opacity={pupilOp}>
          <Circle cx={0} cy={0} r={14.5} color={INK} />
          <Circle cx={-4.8} cy={-5.2} r={5} color="#FFFFFF" />
          <Circle cx={4.2} cy={5} r={2.2} color="#FFFFFF" opacity={0.85} />
        </Group>
        <Group transform={pupilTf} opacity={r.love}>
          <Path path={HEART_SM} color="#FF5D7A" />
        </Group>
        <Group transform={topRot}>
          <RoundedRectLike rect={topRect} />
        </Group>
        <RoundedRectLike rect={botRect} />
        <Group opacity={squintOp}>
          <Circle cx={cx} cy={squintCy} r={36} color={T_COLOR} />
          <Circle cx={cx} cy={squintCy} r={36} color={INK} style="stroke" strokeWidth={6} />
        </Group>
      </Group>
      <Path path={lash} style="stroke" strokeWidth={6} strokeCap="round" color={INK} opacity={lashOp} />
    </Group>
  );
}

function Face({ r, t }: { r: Rig; t: SharedValue<number> }) {
  const mouth = useDerivedValue(() => {
    const talk = r.talk.value * Math.abs(Math.sin(t.value / 95)) * 0.8;
    const open = Math.min(1, r.mouthOpen.value + talk);
    const c = r.mouthCurve.value;
    const cx = 477, cy = 440, w = 22;
    const endY = cy - c * 10;
    const mid = cy + c * 14;
    const midLow = mid + open * 26;
    const p = Skia.PathBuilder.Make();
    p.moveTo(cx - w, endY);
    p.quadTo(cx, 2 * mid - endY, cx + w, endY);
    p.quadTo(cx, 2 * midLow - endY, cx - w, endY);
    p.close();
    return p.build();
  });
  const mouthFillOp = useDerivedValue(() => Math.min(1, (r.mouthOpen.value + r.talk.value * 0.3) * 6));
  const blushOp = useDerivedValue(() => 0.4 + r.blush.value * 0.4);
  return (
    <>
      <Circle cx={318} cy={432} r={26} color={CHEEK} opacity={blushOp} />
      <Circle cx={636} cy={432} r={26} color={CHEEK} opacity={blushOp} />
      <Eye cx={EYE_L.cx} cy={EYE_L.cy} side={-1} r={r} />
      <Eye cx={EYE_R.cx} cy={EYE_R.cy} side={1} r={r} />
      <Path path={mouth} color={MOUTH} opacity={mouthFillOp} />
      <Path path={mouth} style="stroke" strokeWidth={8} strokeCap="round" strokeJoin="round" color={MOUTH} />
    </>
  );
}

// ---------------- fx ----------------
function Drip({ cx, cy, phase, r, t, k, color }: { cx: number; cy: number; phase: number; r: Rig; t: SharedValue<number>; k: 'tear' | 'sweat'; color: string }) {
  const p = useDerivedValue(() => ((t.value / 1100) + phase) % 1);
  const y = useDerivedValue(() => cy + p.value * 90);
  const op = useDerivedValue(() => (1 - p.value * 0.8) * r[k].value);
  return <Circle cx={cx} cy={y} r={9} color={color} opacity={op} />;
}
function ZSym({ i, r, t }: { i: number; r: Rig; t: SharedValue<number> }) {
  const tf = useDerivedValue(() => {
    const p = ((t.value / 2800) + i / 3) % 1;
    return [{ translateX: 640 - r.lie.value * 360 + p * 70 }, { translateY: 240 + r.lie.value * 250 - p * 150 }, { scale: 0.5 + p * 0.9 }];
  });
  const op = useDerivedValue(() => Math.sin((((t.value / 2800) + i / 3) % 1) * Math.PI) * r.zzz.value);
  return (
    <Group transform={tf} opacity={op}>
      <Path path={Z_PATH} style="stroke" strokeWidth={9} strokeCap="round" strokeJoin="round" color="#8EA0E0" />
    </Group>
  );
}
function FloatHeart({ i, r, t }: { i: number; r: Rig; t: SharedValue<number> }) {
  const tf = useDerivedValue(() => {
    const p = ((t.value / 2400) + i / 3) % 1;
    return [{ translateX: 300 + i * 170 + Math.sin(p * 6 + i) * 18 }, { translateY: 430 - p * 280 }, { scale: 0.6 + 0.5 * Math.sin(p * Math.PI) }];
  });
  const op = useDerivedValue(() => Math.sin((((t.value / 2400) + i / 3) % 1) * Math.PI) * r.hearts.value);
  return (
    <Group transform={tf} opacity={op}>
      <Path path={HEART_BIG} color="#FF6B8B" />
    </Group>
  );
}
function Puff({ i, r, t }: { i: number; r: Rig; t: SharedValue<number> }) {
  const p = useDerivedValue(() => ((t.value / 1500) + i / 3) % 1);
  const cy = useDerivedValue(() => 220 - p.value * 120);
  const rad = useDerivedValue(() => 10 + p.value * 16);
  const op = useDerivedValue(() => (1 - p.value) * r.steam.value * 0.6);
  return <Circle cx={380 + i * 90} cy={cy} r={rad} color="#E8E2DC" opacity={op} />;
}
function Star({ i, r, t }: { i: number; r: Rig; t: SharedValue<number> }) {
  const cx = useDerivedValue(() => 477 + Math.cos(t.value / 220 + i * 2.09) * 90);
  const cy = useDerivedValue(() => 215 + Math.sin(t.value / 220 + i * 2.09) * 20);
  return <Circle cx={cx} cy={cy} r={9} color="#FFD76A" opacity={r.stars} />;
}
function Streak({ i, r, t }: { i: number; r: Rig; t: SharedValue<number> }) {
  const path = useDerivedValue(() => {
    const p = ((t.value / 900) + i / 6) % 1;
    const x = 860 - p * 760, y = 170 + i * 120; // stays inside the 900 window
    const q = Skia.PathBuilder.Make();
    q.moveTo(x, y);
    q.quadTo(x - 40, y - 14, x - 80, y);
    q.quadTo(x - 120, y + 14, x - 160, y);
    return q.build();
  });
  const op = useDerivedValue(() => r.wind.value * 0.5);
  return <Path path={path} style="stroke" strokeWidth={7} strokeCap="round" color="#B9C4CE" opacity={op} />;
}

export interface ThriveCharacterProps {
  rig: ThriveRig;
  size?: number;
  /** Soft ambient colour behind the character (time-of-day tint). */
  halo?: string;
  onPress?: () => void;
  entrance?: boolean;
  delay?: number;
}

export function ThriveCharacter({ rig, size = 280, halo, onPress, entrance = true, delay = 0 }: ThriveCharacterProps) {
  const r = rig.v;
  const reduce = useReducedMotion();
  const clock = useClock();
  const t = useDerivedValue(() => (reduce ? 0 : clock.value));

  useEffect(() => {
    if (reduce || !entrance) { r.enter.value = 1; return; }
    r.enter.value = 0;
    r.enter.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [reduce, entrance, delay, r]);

  const fit = useMemo(
    () => [{ translateX: size / 2 }, { translateY: size / 2 }, { scale: size / 900 }, { translateX: -480 }, { translateY: -500 }],
    [size],
  );

  const body = useDerivedValue(() => {
    const b = Math.sin(t.value / 540);
    const e = Math.min(1, r.enter.value);
    return [
      { translateX: Math.sin(t.value / 17) * 3.5 * r.shake.value },
      { translateY: -r.hop.value * 70 + r.floatY.value + r.lie.value * 130 + (1 - e) * 30 },
      { translateX: 477 }, { translateY: 540 },
      { rotate: (r.spin.value + r.lean.value - r.lie.value * 90) * RAD },
      { scale: (0.86 + 0.14 * e) * (1 + r.pop.value * 0.1) },
      { translateX: -477 }, { translateY: -540 },
      { translateY: 868 },
      { scaleX: 1 + r.squash.value * 0.1 - b * 0.006 },
      { scaleY: 1 - r.squash.value * 0.2 + b * 0.012 * (1 + r.lie.value) },
      { translateY: -868 },
    ];
  });
  const bodyOp = useDerivedValue(() => Math.min(1, r.enter.value * 2.2));
  const shadowTf = useDerivedValue(() => [
    { translateX: 480 }, { translateY: 892 }, { scaleX: 1 - r.hop.value * 0.2 }, { scaleY: 0.1 },
  ]);

  // Leaf sprouts from the top of the head.
  const leafTf = useDerivedValue(() => {
    const e = Math.min(1, r.enter.value);
    const deg = Math.sin(t.value / 830) * 4 + r.leaf.value * 20
      + r.wind.value * (Math.sin(t.value / 50) * 7 + 10) - (1 - e) * 24;
    const s = (0.2 + 0.8 * Math.min(1, Math.max(0, (e - 0.2) / 0.65))) * 0.45;
    return [{ translateX: 477 }, { translateY: 252 }, { rotate: deg * RAD }, { scale: s }, { translateX: -545 }, { translateY: -738 }];
  });

  // Tummy sun: breathes, and beats with the real heart rate when known.
  const sunTf = useDerivedValue(() => {
    const e = Math.min(1, r.enter.value);
    const bpm = r.bpm.value;
    const beat = bpm > 0 ? 0.16 * Math.pow(Math.max(0, Math.sin((t.value / 60000) * bpm * 2 * Math.PI)), 6) : 0;
    const s = r.sun.value * (0.85 + 0.05 * Math.sin(t.value / 400) + beat) * (0.4 + 0.6 * Math.min(1, Math.max(0, (e - 0.3) / 0.5)));
    return [{ translateX: SUN_AT.x }, { translateY: SUN_AT.y + r.sunY.value + (1 - e) * 40 }, { scale: s }];
  });
  const glowTf = useDerivedValue(() => [
    { translateX: SUN_AT.x }, { translateY: SUN_AT.y }, { scale: (1.8 + r.glow.value * 1.2) * r.sun.value },
  ]);
  const glowOp = useDerivedValue(() => (0.15 + 0.45 * r.glow.value) * (0.8 + 0.2 * Math.sin(t.value / 400)) * Math.min(1, r.enter.value));

  const LA = useDerivedValue(() => ik(L_SH.x, L_SH.y, r.lHx.value, r.lHy.value, 150, 150, 1));
  const RA = useDerivedValue(() => ik(R_SH.x, R_SH.y, r.rHx.value, r.rHy.value, 150, 150, -1));
  const LL = useDerivedValue(() => ik(L_HIP.x, L_HIP.y, r.lFx.value, r.lFy.value, 72, 72, 1));
  const RL = useDerivedValue(() => ik(R_HIP.x, R_HIP.y, r.rFx.value, r.rFy.value, 72, 72, -1));

  const cupTf = useDerivedValue(() => [
    { translateX: LA.value.hx + 6 }, { translateY: LA.value.hy - 14 }, { rotate: r.cupTilt.value * RAD },
  ]);
  const waterY = useDerivedValue(() => 28 - 54 * r.cupFill.value);
  const waterH = useDerivedValue(() => 54 * r.cupFill.value);
  const barPath = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    p.moveTo(LA.value.hx - 44, LA.value.hy);
    p.lineTo(RA.value.hx + 44, RA.value.hy);
    return p.build();
  });
  const platePath = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    p.moveTo(LA.value.hx - 44, LA.value.hy - 36); p.lineTo(LA.value.hx - 44, LA.value.hy + 36);
    p.moveTo(RA.value.hx + 44, RA.value.hy - 36); p.lineTo(RA.value.hx + 44, RA.value.hy + 36);
    return p.build();
  });
  const glassTf = useDerivedValue(() => [{ translateY: (1 - r.glasses.value) * -60 }]);
  const anger = useDerivedValue(() => [{ translateX: 700 }, { translateY: 270 }, { scale: 1 + 0.15 * Math.sin(t.value / 90) }]);

  return (
    <Pressable
      onPress={onPress}
      pointerEvents={onPress ? 'auto' : 'none'}
      accessibilityRole="image"
      accessibilityLabel="Thrivefold companion"
      style={{ width: size, height: size }}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group transform={fit}>
          {halo ? <Circle cx={480} cy={520} r={330} color={halo} opacity={0.16} /> : null}
          <Group transform={shadowTf} opacity={0.14}>
            <Circle cx={0} cy={0} r={170} color="#000000" />
          </Group>

          <Group transform={body} opacity={bodyOp}>
            <Limb sx={L_HIP.x} sy={L_HIP.y} sol={LL} foot />
            <Limb sx={R_HIP.x} sy={R_HIP.y} sol={RL} foot />

            {/* chubby body + big soft head = a baby T */}
            <RoundedRect x={410} y={430} width={134} height={314} r={62} color={T_COLOR} />
            <RoundedRect x={232} y={236} width={490} height={250} r={118} color={T_COLOR} />
            <Oval x={288} y={262} width={130} height={40} color="#FFFFFF" opacity={0.16} />
            <Oval x={440} y={650} width={74} height={70} color={T_SHADE} opacity={0.0} />

            <Group transform={leafTf}>
              <Path path={LEAF_PATH} color={LEAF_COLOR} />
              <Path path={VEIN_PATH} style="stroke" strokeWidth={14} strokeCap="round" color="#FFFFFF" opacity={0.9} />
            </Group>

            <Group transform={glowTf} opacity={glowOp}>
              <Circle cx={0} cy={0} r={40} color={SUN_COLOR}>
                <BlurMask blur={22} style="normal" />
              </Circle>
            </Group>
            <Group transform={sunTf}>
              <Circle cx={0} cy={0} r={40} color={SUN_COLOR} />
              <Circle cx={-12} cy={-14} r={9} color="#FFFFFF" opacity={0.45} />
            </Group>

            <Face r={r} t={t} />
            <Drip cx={EYE_L.cx - 8} cy={EYE_L.cy + 34} phase={0} r={r} t={t} k="tear" color={TEAR} />
            <Drip cx={EYE_R.cx + 8} cy={EYE_R.cy + 34} phase={0.5} r={r} t={t} k="tear" color={TEAR} />
            <Drip cx={290} cy={290} phase={0.2} r={r} t={t} k="sweat" color="#A8E0FF" />
            <Drip cx={664} cy={286} phase={0.7} r={r} t={t} k="sweat" color="#A8E0FF" />

            <Group transform={glassTf} opacity={r.glasses}>
              <Circle cx={EYE_L.cx} cy={EYE_L.cy} r={46} color="#8CBEFF" opacity={0.18} />
              <Circle cx={EYE_R.cx} cy={EYE_R.cy} r={46} color="#8CBEFF" opacity={0.18} />
              <Circle cx={EYE_L.cx} cy={EYE_L.cy} r={46} style="stroke" strokeWidth={8} color="#2B2B3A" />
              <Circle cx={EYE_R.cx} cy={EYE_R.cy} r={46} style="stroke" strokeWidth={8} color="#2B2B3A" />
              <Path path={GLASS_BRIDGE} style="stroke" strokeWidth={8} strokeCap="round" color="#2B2B3A" />
              <Path path={GLASS_ARMS} style="stroke" strokeWidth={7} strokeCap="round" color="#2B2B3A" />
            </Group>

            <Group opacity={r.bar}>
              <Path path={barPath} style="stroke" strokeWidth={9} strokeCap="round" color="#3C3C46" />
              <Path path={platePath} style="stroke" strokeWidth={16} strokeCap="round" color="#2A2A33" />
            </Group>

            <Limb sx={L_SH.x} sy={L_SH.y} sol={LA} />
            <Limb sx={R_SH.x} sy={R_SH.y} sol={RA} />

            <Group transform={cupTf} opacity={r.cup}>
              <RoundedRect x={-20} y={-34} width={40} height={62} r={7} color="#A0D7FF" opacity={0.5} />
              <RoundedRect x={-17} y={waterY} width={34} height={waterH} r={5} color="#5BB6F0" />
            </Group>
          </Group>

          {[0, 1, 2].map((i) => <ZSym key={`z${i}`} i={i} r={r} t={t} />)}
          {[0, 1, 2].map((i) => <FloatHeart key={`h${i}`} i={i} r={r} t={t} />)}
          {[0, 1, 2].map((i) => <Puff key={`p${i}`} i={i} r={r} t={t} />)}
          {[0, 1, 2].map((i) => <Star key={`s${i}`} i={i} r={r} t={t} />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <Streak key={`w${i}`} i={i} r={r} t={t} />)}
          <Group transform={anger} opacity={r.steam}>
            <Path path={ANGER_PATH} style="stroke" strokeWidth={7} strokeCap="round" color="#E5484D" />
          </Group>
        </Group>
      </Canvas>
    </Pressable>
  );
}
