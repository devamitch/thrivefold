import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { InteractionManager, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { SPLASH_BACKGROUND } from '../../theme/tokens';
import { AnimatedThrivefoldMark } from './AnimatedThrivefoldMark';

/** Same width as expo-splash-screen's `imageWidth`, so the hand-over is seamless. */
const MARK_SIZE = 260;
const HOLD_MS = 900;
/** Never keep the splash longer than this, even if the app is still settling. */
const MAX_MS = 3000;
const EXIT_MS = 420;

/**
 * Picks up exactly where the native splash leaves off (same background, same mark, same
 * size), then lets the mark come alive, brings in the wordmark, and dissolves into the app.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const word = useSharedValue(0);
  const exit = useSharedValue(0);
  const hidden = useRef(false);

  const hideNative = () => {
    if (hidden.current) return;
    hidden.current = true;
    SplashScreen.hideAsync().catch(() => undefined);
  };

  useEffect(() => {
    const hold = reduceMotion ? 300 : HOLD_MS;
    word.value = withDelay(reduceMotion ? 0 : 200, withTiming(1, { duration: reduceMotion ? 1 : 500, easing: Easing.out(Easing.cubic) }));
    // Fade out only once the first screen has mounted (and the hold has passed), so the exit
    // animation never competes with the app's start-up work and stutters.
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      exit.value = withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    };
    let held = false;
    let settled = false;
    const holdTimer = setTimeout(() => {
      held = true;
      if (settled) begin();
    }, hold);
    const task = InteractionManager.runAfterInteractions(() => {
      settled = true;
      if (held) begin();
    });
    const cap = setTimeout(begin, MAX_MS);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(cap);
      task.cancel();
    };
  }, [reduceMotion, word, exit, onDone]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: 1 + exit.value * 0.06 }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ translateY: (1 - word.value) * 14 }],
  }));

  const wordWidth = Math.min(width * 0.5, 200);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: SPLASH_BACKGROUND }, rootStyle]} onLayout={hideNative} pointerEvents="none">
      <AnimatedThrivefoldMark size={MARK_SIZE} entrance={false} />
      <Animated.View style={[styles.word, wordStyle]}>
        <Image source={require('../../../assets/brand/thrivefold-wordmark.png')} style={{ width: wordWidth, height: wordWidth * (189 / 800) }} contentFit="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', zIndex: 100, elevation: 100 },
  word: { position: 'absolute', bottom: '22%' },
});
