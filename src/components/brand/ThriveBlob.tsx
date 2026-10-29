/**
 * Thrive, the on-device AI, as a small round companion: a soft terracotta blob with big baby eyes,
 * rosy cheeks, a sage sprout on top and the Thrivefold mark (T, leaf and sun) on its tummy.
 *
 * One looping timeline drives the idle life (breathing, blinks, glances, the sprout swaying), so
 * nothing drifts out of sync; the mood changes how it looks:
 *   listening  leans in, eyes wide, a soft ring pulses
 *   thinking   eyes glance up, the sprout curls
 *   speaking   the mouth moves with the voice
 * Everything runs on the UI thread. With Reduce Motion it rests, still and smiling.
 */
import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

// Brand artwork colours (fixed, like the app icon).
const BODY_TOP = '#E89572';
const BODY_BOTTOM = '#C8664A';
const SPROUT = '#8B9A7A';
const SUN = '#F2B86B';
const INK = '#2B1B14';
const CHEEK = '#FF8FA3';
const CREAM = '#FFF4EA';

export type ThriveMood = 'idle' | 'listening' | 'thinking' | 'speaking';

const LOOP_MS = 9000;
const clamp = Extrapolation.CLAMP;
// Idle timeline (fraction of the loop).
const BLINK_K = [0.28, 0.3, 0.32, 0.7, 0.72, 0.74];
const BLINK_V = [0, 1, 0, 0, 1, 0];
const LOOK_K = [0.4, 0.44, 0.52, 0.56, 0.62, 0.66];
const LOOK_V = [0, -1, -1, 1, 1, 0];

export function ThriveBlob({ size = 64, mood = 'idle' }: { size?: number; mood?: ThriveMood }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  const talk = useSharedValue(0);
  const lean = useSharedValue(0);
  const think = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(t);
  }, [reduce, t]);

  useEffect(() => {
    if (reduce) return;
    const loop = (ms: number) =>
      withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true);
    talk.value = mood === 'speaking' ? loop(170) : withTiming(0, { duration: 180 });
    lean.value = mood === 'listening' ? loop(900) : withTiming(0, { duration: 250 });
    think.value = withTiming(mood === 'thinking' ? 1 : 0, { duration: 300 });
  }, [mood, reduce, talk, lean, think]);

  // Whole body: breathing squash, a lean-in while listening.
  const body = useAnimatedStyle(() => {
    const b = Math.sin(t.value * Math.PI * 2 * 3);
    return {
      transform: [
        { translateY: -b * size * 0.012 - lean.value * size * 0.03 },
        { scaleX: 1 - b * 0.012 + lean.value * 0.03 },
        { scaleY: 1 + b * 0.02 + lean.value * 0.03 },
      ],
    };
  });

  const eyeProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const wide = 1 + lean.value * 0.12;
    return { cx, ry: 9 * wide * Math.max(0.08, 1 - blink), rx: 7.6 * wide };
  };
  const pupilProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const lx = interpolate(t.value, LOOK_K, LOOK_V, clamp) * (1 - think.value) * 2.2 - think.value * 1.8;
    const ly = -think.value * 3;
    return { cx: cx + lx, cy: 47 + ly, r: 4.6 * (1 + lean.value * 0.08), opacity: blink > 0.6 ? 0 : 1 };
  };
  const glintProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const lx = interpolate(t.value, LOOK_K, LOOK_V, clamp) * (1 - think.value) * 2.2 - think.value * 1.8;
    return { cx: cx + lx - 1.6, cy: 45.2 - think.value * 3, opacity: blink > 0.6 ? 0 : 1 };
  };
  const lEye = useAnimatedProps(() => eyeProps(37));
  const rEye = useAnimatedProps(() => eyeProps(63));
  const lPupil = useAnimatedProps(() => pupilProps(37));
  const rPupil = useAnimatedProps(() => pupilProps(63));
  const lGlint = useAnimatedProps(() => glintProps(37));
  const rGlint = useAnimatedProps(() => glintProps(63));

  // Smile when idle, an "o" while thinking, moving with the voice while speaking.
  const mouth = useAnimatedProps(() => {
    const open = talk.value * 4.5;
    const curve = 4 * (1 - think.value);
    const w = 6 - think.value * 2.5;
    return {
      d: `M ${50 - w} 58 Q 50 ${58 + curve + open} ${50 + w} 58 Q 50 ${58 + open * 0.4 + think.value * 3} ${50 - w} 58 Z`,
    };
  });

  // Sprout sways gently; curls while thinking.
  const sprout = useAnimatedProps(() => {
    const sway = Math.sin(t.value * Math.PI * 2 * 2) * 6 + think.value * 14;
    return { rotation: sway, originX: 50, originY: 22 };
  });

  const ring = useAnimatedProps(() => ({ r: 44 + lean.value * 4, opacity: lean.value * 0.35 }));

  return (
    <Animated.View style={[{ width: size, height: size }, body]} accessibilityRole="image" accessibilityLabel="Thrive">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="tb-body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={BODY_TOP} />
            <Stop offset="1" stopColor={BODY_BOTTOM} />
          </LinearGradient>
          <RadialGradient id="tb-shine" cx="0.35" cy="0.3" r="0.5">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <AnimatedCircle cx={50} cy={56} animatedProps={ring} fill="none" stroke={SUN} strokeWidth={2} />

        {/* Sprout on top: the Thrivefold leaf. */}
        <AnimatedG animatedProps={sprout}>
          <Path d="M50 22 C50 16 50 14 50 12" stroke={SPROUT} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M50 14 C54 6 63 5 67 7 C64 13 57 16 50 14 Z" fill={SPROUT} />
          <Path d="M50 14 C58 11 62 9 65 8" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={0.9} fill="none" />
        </AnimatedG>

        {/* Soft blob body */}
        <Path
          d="M50 20 C73 20 88 36 88 58 C88 78 72 90 50 90 C28 90 12 78 12 58 C12 36 27 20 50 20 Z"
          fill="url(#tb-body)"
        />
        <Ellipse cx={38} cy={36} rx={20} ry={13} fill="url(#tb-shine)" />

        {/* Face */}
        <Ellipse cx={26} cy={58} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
        <Ellipse cx={74} cy={58} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
        <AnimatedEllipse animatedProps={lEye} cy={47} fill={CREAM} />
        <AnimatedEllipse animatedProps={rEye} cy={47} fill={CREAM} />
        <AnimatedCircle animatedProps={lPupil} fill={INK} />
        <AnimatedCircle animatedProps={rPupil} fill={INK} />
        <AnimatedCircle animatedProps={lGlint} r={1.5} fill="#FFFFFF" />
        <AnimatedCircle animatedProps={rGlint} r={1.5} fill="#FFFFFF" />
        <AnimatedPath animatedProps={mouth} fill="#7A3524" stroke="#7A3524" strokeWidth={1.4} strokeLinejoin="round" />

        {/* Tummy badge: the Thrivefold mark (T, leaf, sun). */}
        <Circle cx={50} cy={75} r={9} fill={CREAM} opacity={0.92} />
        <Path d="M44.5 71 H55.5 M50 71 V80" stroke={BODY_BOTTOM} strokeWidth={2.4} strokeLinecap="round" />
        <Path d="M50.8 79.5 C51 76 53.5 74.2 56 73.2 C56.4 76.4 54.6 78.6 50.8 79.5 Z" fill={SPROUT} />
        <Circle cx={53.6} cy={72.4} r={1.3} fill={SUN} />
      </Svg>
    </Animated.View>
  );
}
