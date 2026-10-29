/**
 * Mr. Minute, Thrivefold's on-device AI: a calm, caring clock companion (an original character,
 * not a copy of any film character). Warm terracotta case, sage-leaf crown, the Thrivefold mark
 * glowing softly at the centre of the face, kind eyes under gentle brows and a neat moustache.
 * Previously described as a friendly little clock: a warm terracotta case with a sage-leaf
 * crown, a cream face whose hands show the real time, big eyes and a smile. It keeps time for
 * you, which is what the coach does (reminders, routines, breaks).
 *
 * One looping timeline drives the idle life (breathing, blinks, glances, the second hand); the
 * mood changes how it looks:
 *   listening  leans in, eyes wide, a soft ring pulses
 *   thinking   the second hand races, eyes glance up
 *   speaking   the mouth moves with the voice
 * Transparent background, so it sits on any surface. With Reduce Motion it rests and smiles.
 */
import React, { useEffect, useState } from 'react';
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
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// Brand artwork colours (fixed, like the app icon).
const CASE_TOP = '#E89572';
const CASE_BOTTOM = '#C25E42';
const FACE = '#FFF6EC';
const LEAF = '#8B9A7A';
const SUN = '#F2B86B';
const INK = '#2B1B14';
const HALO = '#7FD3E6'; // calm assistant glow while listening

export type ThriveMood = 'idle' | 'listening' | 'thinking' | 'speaking';

const LOOP_MS = 8000;
const clamp = Extrapolation.CLAMP;
const BLINK_K = [0.3, 0.32, 0.34, 0.76, 0.78, 0.8];
const BLINK_V = [0, 1, 0, 0, 1, 0];
const LOOK_K = [0.45, 0.49, 0.56, 0.6, 0.66, 0.7];
const LOOK_V = [0, -1, -1, 1, 1, 0];
const CX = 50;
const CY = 54;

const handEnd = (deg: number, len: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x2: CX + Math.cos(a) * len, y2: CY + Math.sin(a) * len };
};

export function ThriveClock({ size = 64, mood = 'idle' }: { size?: number; mood?: ThriveMood }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  const sec = useSharedValue(0);
  const talk = useSharedValue(0);
  const lean = useSharedValue(0);
  const think = useSharedValue(0);
  const [now, setNow] = useState(() => new Date());

  // Hour and minute hands follow the real time.
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(iv);
  }, []);

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
    cancelAnimation(sec);
    sec.value = 0;
    sec.value = withRepeat(
      withTiming(1, { duration: mood === 'thinking' ? 900 : 60_000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [mood, reduce, talk, lean, think, sec]);

  const body = useAnimatedStyle(() => {
    const b = Math.sin(t.value * Math.PI * 2 * 3);
    return {
      transform: [
        { translateY: -b * size * 0.012 - lean.value * size * 0.03 },
        { rotate: `${interpolate(t.value, LOOK_K, LOOK_V, clamp) * 3}deg` },
        { scale: 1 + b * 0.012 + lean.value * 0.03 },
      ],
    };
  });

  const eyeProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const wide = 1 + lean.value * 0.14;
    return { cx, rx: 6.4 * wide, ry: 7.4 * wide * Math.max(0.08, 1 - blink) };
  };
  const look = () => {
    'worklet';
    return {
      x: interpolate(t.value, LOOK_K, LOOK_V, clamp) * (1 - think.value) * 1.8 - think.value * 1.4,
      y: -think.value * 2.4,
    };
  };
  const pupilProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const l = look();
    return { cx: cx + l.x, cy: 47 + l.y, opacity: blink > 0.6 ? 0 : 1 };
  };
  const glintProps = (cx: number) => {
    'worklet';
    const blink = interpolate(t.value, BLINK_K, BLINK_V, clamp);
    const l = look();
    return { cx: cx + l.x - 1.3, cy: 45.6 + l.y, opacity: blink > 0.6 ? 0 : 1 };
  };
  const lEye = useAnimatedProps(() => eyeProps(40));
  const rEye = useAnimatedProps(() => eyeProps(60));
  const lPupil = useAnimatedProps(() => pupilProps(40));
  const rPupil = useAnimatedProps(() => pupilProps(60));
  const lGlint = useAnimatedProps(() => glintProps(40));
  const rGlint = useAnimatedProps(() => glintProps(60));

  const mouth = useAnimatedProps(() => {
    const open = talk.value * 4;
    const curve = 3.6 * (1 - think.value);
    const w = 5.5 - think.value * 2.4;
    return {
      d: `M ${50 - w} 65 Q 50 ${65 + curve + open} ${50 + w} 65 Q 50 ${65 + open * 0.4 + think.value * 2.6} ${50 - w} 65 Z`,
    };
  });

  const secondHand = useAnimatedProps(() => {
    const deg = sec.value * 360;
    const a = ((deg - 90) * Math.PI) / 180;
    return { x2: CX + Math.cos(a) * 29, y2: CY + Math.sin(a) * 29 };
  });
  const ring = useAnimatedProps(() => ({ r: 41 + lean.value * 3, opacity: lean.value * 0.4 }));

  const hourDeg = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;
  const minDeg = now.getMinutes() * 6;

  return (
    <Animated.View
      style={[{ width: size, height: size }, body]}
      accessibilityRole="image"
      accessibilityLabel="Mr. Minute"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="tc-case" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={CASE_TOP} />
            <Stop offset="1" stopColor={CASE_BOTTOM} />
          </LinearGradient>
        </Defs>

        <AnimatedCircle cx={CX} cy={CY} animatedProps={ring} fill="none" stroke={HALO} strokeWidth={2.4} />

        {/* Crown: a little sage leaf, the Thrivefold sprout. */}
        <Path d="M50 18 V12" stroke={LEAF} strokeWidth={2.6} strokeLinecap="round" />
        <Path d="M50 13 C54 5 63 4 67 6 C64 12 57 15 50 13 Z" fill={LEAF} />
        <Path d="M50 13 C43 7 36 7 33 9 C36 14 43 15 50 13 Z" fill={LEAF} opacity={0.8} />

        {/* Case and face */}
        <Circle cx={CX} cy={CY} r={38} fill="url(#tc-case)" />
        <Ellipse cx={38} cy={34} rx={14} ry={7} fill="#FFFFFF" opacity={0.25} />
        <Circle cx={CX} cy={CY} r={31} fill={FACE} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 25.5 : 27;
          return (
            <Line
              key={i}
              x1={CX + Math.sin(a) * r1}
              y1={CY - Math.cos(a) * r1}
              x2={CX + Math.sin(a) * 29}
              y2={CY - Math.cos(a) * 29}
              stroke={CASE_BOTTOM}
              strokeWidth={i % 3 === 0 ? 2 : 1.1}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}

        {/* The Thrivefold mark glows softly at the centre of the face. */}
        <G opacity={0.16}>
          <Path d="M41 46 H59 M50 46 V66" stroke={CASE_BOTTOM} strokeWidth={5} strokeLinecap="round" />
          <Path d="M52 65 C52 57 57 53 62 51 C63 58 59 63 52 65 Z" fill={LEAF} />
          <Circle cx={57.5} cy={45} r={2.6} fill={SUN} />
        </G>

        {/* Real-time hands, behind the face features. */}
        <G opacity={0.55}>
          <Line x1={CX} y1={CY} {...handEnd(hourDeg, 13)} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={CX} y1={CY} {...handEnd(minDeg, 20)} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          <AnimatedLine x1={CX} y1={CY} animatedProps={secondHand} stroke={CASE_BOTTOM} strokeWidth={1} strokeLinecap="round" />
          <Circle cx={CX} cy={CY} r={2} fill={CASE_BOTTOM} />
        </G>

        {/* Face */}
        <AnimatedEllipse animatedProps={lEye} cy={47} fill="#FFFFFF" stroke={INK} strokeWidth={0.8} />
        <AnimatedEllipse animatedProps={rEye} cy={47} fill="#FFFFFF" stroke={INK} strokeWidth={0.8} />
        <AnimatedCircle animatedProps={lPupil} r={3.8} fill={INK} />
        <AnimatedCircle animatedProps={rPupil} r={3.8} fill={INK} />
        <AnimatedCircle animatedProps={lGlint} r={1.2} fill="#FFFFFF" />
        <AnimatedCircle animatedProps={rGlint} r={1.2} fill="#FFFFFF" />
        {/* Gentle, caring brows and a neat moustache. */}
        <Path d="M34 38.5 Q40 35.5 46 38" stroke={INK} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        <Path d="M54 38 Q60 35.5 66 38.5" stroke={INK} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        <Path
          d="M50 59.5 C47 57.5 42 58 39.5 61 C43 61.8 47 61.4 50 60.4 C53 61.4 57 61.8 60.5 61 C58 58 53 57.5 50 59.5 Z"
          fill={INK}
          opacity={0.85}
        />
        <AnimatedPath animatedProps={mouth} fill="#7A3524" stroke="#7A3524" strokeWidth={1.2} strokeLinejoin="round" />

        {/* Little feet */}
        <Ellipse cx={38} cy={93} rx={6} ry={3} fill={CASE_BOTTOM} />
        <Ellipse cx={62} cy={93} rx={6} ry={3} fill={CASE_BOTTOM} />
      </Svg>
    </Animated.View>
  );
}
