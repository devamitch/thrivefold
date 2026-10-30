/**
 * Anvay, the on-device AI companion, drawn from the AnvayKosh mark itself: the terracotta shackle
 * is its head (a cream face looks out through the opening), the arch and stem are its body and the
 * pista leaf is its arm. Calm and caring, no cartoon extras.
 *
 * One looping timeline drives the idle life (breathing, blinks, glances, the leaf waving gently);
 * the mood changes how it looks:
 *   listening  leans in and a soft halo pulses
 *   thinking   eyes glance up, the leaf lifts
 *   speaking   the mouth moves with the voice
 * Transparent background. With Reduce Motion it rests, still and smiling.
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
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// AnvayKosh brand colours (fixed, like the icon artwork).
const TERRACOTTA = '#D06543';
const PISTA = '#7A8A6D';
const FACE = '#FFF4EA';
const INK = '#2B1B14';
const HALO = '#7FD3E6';

// The AnvayKosh mark (assets/brand/anvaykosh-icon.svg), same paths and transform.
const SHACKLE =
  'M4995 8299 c-614 -35 -1168 -408 -1454 -978 -55 -108 -117 -300 -142 -434 -19 -101 -21 -162 -26 -637 -3 -289 -1 -535 4 -548 8 -22 11 -21 78 38 140 121 330 234 521 310 l82 32 4 331 c5 320 6 336 32 432 104 395 424 685 838 761 122 22 339 15 453 -15 387 -103 679 -431 740 -831 10 -66 15 -181 15 -376 l0 -282 73 -17 c177 -43 379 -133 520 -232 43 -30 81 -53 84 -50 3 3 6 226 6 494 0 417 -2 502 -17 583 -48 268 -157 524 -318 742 -82 112 -272 298 -388 381 -171 121 -383 214 -594 261 -99 23 -146 28 -331 40 -27 1 -108 -1 -180 -5z';
const BODY =
  'M4685 5979 c-353 -27 -711 -176 -1014 -422 -82 -67 -285 -266 -320 -315 -21 -30 -21 -30 796 -25 737 5 829 4 931 -11 452 -68 754 -257 899 -562 99 -209 103 -254 103 -1208 0 -877 -2 -846 68 -981 64 -121 167 -209 302 -256 61 -21 85 -23 368 -27 167 -2 328 -1 358 3 l55 7 -4 1306 c-3 1453 0 1375 -72 1584 -179 522 -702 849 -1449 908 -147 11 -870 11 -1021 -1z';
const LEAF =
  'M3096 4933 c-9 -60 -7 -574 4 -728 45 -624 260 -1125 650 -1516 269 -270 554 -424 895 -484 150 -26 365 -34 914 -35 l525 0 -80 73 c-319 291 -451 530 -558 1004 -90 396 -211 630 -450 868 -265 264 -619 441 -1101 550 -162 37 -282 70 -389 107 -89 32 -315 139 -372 177 -31 21 -31 21 -38 -16z';

export type AnvayMood = 'idle' | 'listening' | 'thinking' | 'speaking';

const LOOP_MS = 8000;
const clamp = Extrapolation.CLAMP;
const BLINK_K = [0.3, 0.32, 0.34, 0.76, 0.78, 0.8];
const BLINK_V = [0, 1, 0, 0, 1, 0];
const LOOK_K = [0.45, 0.49, 0.56, 0.6, 0.66, 0.7];
const LOOK_V = [0, -1, -1, 1, 1, 0];

// Face sits in the shackle's opening (viewBox units of the cropped mark: x 199..835, y 183..819).
const FX = 503;
const FY = 352;
const EYE_DX = 38;

export function AnvayCompanion({ size = 64, mood = 'idle' }: { size?: number; mood?: AnvayMood }) {
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
    talk.value = mood === 'speaking' ? loop(160) : withTiming(0, { duration: 180 });
    lean.value = mood === 'listening' ? loop(900) : withTiming(0, { duration: 250 });
    think.value = withTiming(mood === 'thinking' ? 1 : 0, { duration: 300 });
  }, [mood, reduce, talk, lean, think]);

  const body = useAnimatedStyle(() => {
    const b = Math.sin(t.value * Math.PI * 2 * 3);
    return {
      transform: [
        { translateY: -b * size * 0.012 - lean.value * size * 0.025 },
        { scale: 1 + b * 0.012 + lean.value * 0.03 },
      ],
    };
  });

  const look = () => {
    'worklet';
    return {
      x: interpolate(t.value, LOOK_K, LOOK_V, clamp) * (1 - think.value) * 9 - think.value * 7,
      y: -think.value * 11,
    };
  };
  const pupil = (cx: number) => {
    'worklet';
    const l = look();
    return { cx: cx + l.x, cy: FY + l.y };
  };
  const glint = (cx: number) => {
    'worklet';
    const l = look();
    return { cx: cx + l.x - 6, cy: FY - 7 + l.y };
  };
  const lPupil = useAnimatedProps(() => pupil(FX - EYE_DX));
  const rPupil = useAnimatedProps(() => pupil(FX + EYE_DX));
  const lGlint = useAnimatedProps(() => glint(FX - EYE_DX));
  const rGlint = useAnimatedProps(() => glint(FX + EYE_DX));
  // Blinks swap the open eyes for closed lids (opacity only: reliable on every device).
  const open = useAnimatedProps(() => ({
    opacity: interpolate(t.value, BLINK_K, BLINK_V, clamp) > 0.5 ? 0 : 1,
  }));
  const shut = useAnimatedProps(() => ({
    opacity: interpolate(t.value, BLINK_K, BLINK_V, clamp) > 0.5 ? 1 : 0,
  }));

  const mouth = useAnimatedProps(() => {
    const o = talk.value * 16;
    const curve = 14 * (1 - think.value);
    const w = 24 - think.value * 10;
    const y = FY + 46;
    return {
      d: `M ${FX - w} ${y} Q ${FX} ${y + curve + o} ${FX + w} ${y} Q ${FX} ${y + o * 0.4 + think.value * 10} ${FX - w} ${y} Z`,
    };
  });

  // The pista leaf (its arm) waves gently, lifts while thinking.
  const leaf = useAnimatedProps(() => ({
    rotation: Math.sin(t.value * Math.PI * 2 * 2) * 3 - think.value * 8,
    originX: 560,
    originY: 760,
  }));
  const halo = useAnimatedProps(() => ({ r: 300 + lean.value * 14, opacity: lean.value * 0.45 }));

  return (
    <Animated.View style={[{ width: size, height: size }, body]} accessibilityRole="image" accessibilityLabel="Anvay">
      <Svg width={size} height={size} viewBox="199 183 636 636">
        <AnimatedCircle cx={517} cy={501} animatedProps={halo} fill="none" stroke={HALO} strokeWidth={12} />

        {/* Face looking out through the shackle */}
        <Circle cx={FX} cy={FY + 4} r={112} fill={FACE} />

        <G transform="translate(0, 1024) scale(0.1, -0.1)">
          <Path fill={TERRACOTTA} d={SHACKLE} />
          <Path fill={TERRACOTTA} d={BODY} />
        </G>
        <AnimatedG animatedProps={leaf}>
          <G transform="translate(0, 1024) scale(0.1, -0.1)">
            <Path fill={PISTA} d={LEAF} />
          </G>
        </AnimatedG>

        <AnimatedG animatedProps={open}>
          <Circle cx={FX - EYE_DX} cy={FY} r={24} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
          <Circle cx={FX + EYE_DX} cy={FY} r={24} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
          <AnimatedCircle animatedProps={lPupil} r={13} fill={INK} />
          <AnimatedCircle animatedProps={rPupil} r={13} fill={INK} />
          <AnimatedCircle animatedProps={lGlint} r={4.5} fill="#FFFFFF" />
          <AnimatedCircle animatedProps={rGlint} r={4.5} fill="#FFFFFF" />
        </AnimatedG>
        <AnimatedG animatedProps={shut}>
          <Path
            d={`M ${FX - EYE_DX - 20} ${FY + 2} Q ${FX - EYE_DX} ${FY + 14} ${FX - EYE_DX + 20} ${FY + 2}`}
            stroke={INK}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${FX + EYE_DX - 20} ${FY + 2} Q ${FX + EYE_DX} ${FY + 14} ${FX + EYE_DX + 20} ${FY + 2}`}
            stroke={INK}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
        </AnimatedG>
        <AnimatedPath animatedProps={mouth} fill="#7A3524" stroke="#7A3524" strokeWidth={5} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}
