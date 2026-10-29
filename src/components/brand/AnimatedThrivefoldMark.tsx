import { SquircleSurface } from '../ui/SquircleSurface';
/**
 * The living Thrivefold mark: terracotta T, sage leaf, golden sun (same geometry as the
 * app icon, on a 1024 grid). Three stacked layers so each part moves on its own:
 *   entrance  - the T settles in, the leaf grows from its stem, the sun rises;
 *   at rest   - the sun breathes with a soft glow, the leaf sways a few degrees.
 * Everything runs on the UI thread. With Reduce Motion the mark appears at rest and still.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

// Brand colours of the mark itself (fixed, like the icon artwork).
const T_COLOR = '#D17A5A';
const LEAF_COLOR = '#8B9A7A';
const SUN_COLOR = '#F2B86B';
const VEIN_COLOR = '#FFFFFF';

const T_PATH =
  'M282 285 H702 C686 328 650 344 606 350 C552 357 516 388 506 442 V712 Q506 738 480 738 H446 Q420 738 420 712 V442 Q416 388 364 388 H282 Q252 388 252 358 V315 Q252 285 282 285 Z';
const LEAF_PATH =
  'M520 738 V650 C522 540 610 486 690 446 C728 410 752 368 762 328 C792 430 778 556 690 606 C628 640 584 646 570 690 V724 Q570 738 556 738 Z';
const VEIN_PATH = 'M528 640 C560 556 640 506 716 452';

const BREATH_MS = 4200;
const SWAY_MS = 5200;

export interface AnimatedThrivefoldMarkProps {
  size?: number;
  /** Play the entrance (grow and rise) on mount. */
  entrance?: boolean;
  /** Keep breathing and swaying after the entrance. */
  living?: boolean;
  /** Delay before the entrance starts, in ms. */
  delay?: number;
  /**
   * What the coach is doing, so the mark can show it: listening (the whole mark leans in and
   * glows), thinking (the leaf turns over), speaking (the sun bobs with the voice).
   */
  mood?: 'idle' | 'listening' | 'thinking' | 'speaking';
  /** Now and then wave the leaf or hop, like a small character. Off by default. */
  personality?: boolean;
}

export function AnimatedThrivefoldMark({
  size = 96,
  entrance = true,
  living = true,
  delay = 0,
  mood = 'idle',
  personality = false,
}: AnimatedThrivefoldMarkProps) {
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(entrance && !reduceMotion ? 0 : 1);
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const lean = useSharedValue(0); // listening
  const turn = useSharedValue(0); // thinking
  const talk = useSharedValue(0); // speaking
  const hop = useSharedValue(0); // personality
  const wave = useSharedValue(0); // personality

  useEffect(() => {
    if (reduceMotion) return;
    cancelAnimation(lean);
    cancelAnimation(turn);
    cancelAnimation(talk);
    const loop = (ms: number) =>
      withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true);
    lean.value = mood === 'listening' ? loop(700) : withTiming(0, { duration: 250 });
    turn.value =
      mood === 'thinking'
        ? withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false)
        : withTiming(0, { duration: 250 });
    talk.value = mood === 'speaking' ? loop(220) : withTiming(0, { duration: 200 });
  }, [mood, reduceMotion, lean, turn, talk]);

  useEffect(() => {
    if (!personality || reduceMotion) return;
    let n = 0;
    const iv = setInterval(() => {
      n += 1;
      if (n % 2)
        wave.value = withSequence(
          withTiming(1, { duration: 260 }),
          withTiming(-0.6, { duration: 260 }),
          withTiming(0.4, { duration: 220 }),
          withTiming(0, { duration: 260 }),
        );
      else
        hop.value = withSequence(
          withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 320, easing: Easing.bounce }),
        );
    }, 7000);
    return () => clearInterval(iv);
  }, [personality, reduceMotion, wave, hop]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -size * 0.1 * hop.value }, { scale: 1 + 0.06 * lean.value }],
  }));

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      return;
    }
    if (entrance) enter.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    if (living) {
      breath.value = withDelay(
        delay + 700,
        withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
      sway.value = withDelay(
        delay + 900,
        withRepeat(withTiming(1, { duration: SWAY_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
    }
    return () => {
      cancelAnimation(enter);
      cancelAnimation(breath);
      cancelAnimation(sway);
    };
  }, [reduceMotion, entrance, living, delay, enter, breath, sway]);

  const tStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 0.35], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(enter.value, [0, 0.6], [0.88, 1], 'clamp') }],
  }));

  const leafStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.2, 0.5], [0, 1], 'clamp'),
    transform: [
      { scale: interpolate(enter.value, [0.2, 0.85], [0.2, 1], 'clamp') },
      {
        rotate: `${interpolate(enter.value, [0.2, 0.85], [-24, 0], 'clamp') + (sway.value - 0.5) * 7 + wave.value * 22 + Math.sin(turn.value * Math.PI * 2) * 14}deg`,
      },
    ],
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.45, 0.75], [0, 1], 'clamp'),
    transform: [
      { translateY: interpolate(enter.value, [0.45, 1], [size * 0.16, 0], 'clamp') - size * 0.04 * talk.value },
      { scale: 1 + 0.07 * breath.value + 0.12 * talk.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.7, 1], [0, 1], 'clamp') * (0.12 + 0.22 * breath.value + 0.3 * lean.value),
    transform: [{ scale: 1.15 + 0.45 * breath.value + 0.6 * lean.value }],
  }));

  const box = { width: size, height: size };
  const layer = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      {children}
    </Svg>
  );

  return (
    <Animated.View style={[box, bodyStyle]} accessibilityRole="image" accessibilityLabel="Thrivefold">
      <Animated.View style={[StyleSheet.absoluteFill, tStyle]}>
        {layer(<Path d={T_PATH} fill={T_COLOR} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.leafOrigin, leafStyle]}>
        {layer(
          <>
            <Path d={LEAF_PATH} fill={LEAF_COLOR} />
            <Path d={VEIN_PATH} stroke={VEIN_COLOR} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.9} />
          </>,
        )}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.sunOrigin, glowStyle]}>
        {layer(<Circle cx={585} cy={421} r={42} fill={SUN_COLOR} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.sunOrigin, sunStyle]}>
        {layer(<Circle cx={585} cy={421} r={42} fill={SUN_COLOR} />)}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Leaf pivots at its stem; sun breathes around its own centre.
  leafOrigin: { transformOrigin: '53.5% 72%' },
  sunOrigin: { transformOrigin: '57.1% 41.1%' },
});
