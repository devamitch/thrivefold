import React, { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';

const PIP_WIDTH_RATIO = 0.3;
const PIP_ASPECT = 4 / 3;
const PIP_RADIUS = 18;
const MARGIN = 12;
const EASE = { duration: 260, easing: Easing.out(Easing.cubic) };

interface Props {
  /** The coach's tutorial video. */
  primary: React.ReactNode;
  /** The person's camera. */
  secondary: React.ReactNode;
  /** Start with the camera full screen (when it is checking form). */
  startWithSecondary?: boolean;
  /** Space the floating window keeps clear of at the top and bottom (call bars). */
  insetTop: number;
  insetBottom: number;
  /** Called when the full-screen tile is tapped (show or hide controls). */
  onStageTap?: () => void;
  /** Renders over the camera tile with its live size (the skeleton). */
  renderSecondaryOverlay?: (size: { width: number; height: number }) => React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
}

/**
 * Video-call layout: one tile fills the whole screen edge to edge, the other floats in a
 * corner like your own picture in a call. Drag the small window and it settles in the
 * nearest corner; tap it to swap. Both tiles stay mounted, so neither reloads.
 */
export function CallStage({
  primary,
  secondary,
  startWithSecondary = false,
  insetTop,
  insetBottom,
  onStageTap,
  renderSecondaryOverlay,
  primaryLabel = 'Coach',
  secondaryLabel = 'You',
}: Props) {
  const { colors, typography } = useTheme();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [secondaryIsMain, setSecondaryIsMain] = useState(startWithSecondary);
  const W = useSharedValue(0);
  const H = useSharedValue(0);
  /** 0: primary is full screen; 1: secondary is. */
  const swap = useSharedValue(startWithSecondary ? 1 : 0);
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    W.value = width;
    H.value = height;
    const pw = width * PIP_WIDTH_RATIO;
    px.value = width - pw - MARGIN;
    py.value = height - pw * PIP_ASPECT - insetBottom - MARGIN;
    setSize({ width, height });
  };

  const toggle = () => setSecondaryIsMain((v) => !v);

  const doSwap = () => {
    'worklet';
    const next = swap.value > 0.5 ? 0 : 1;
    swap.value = reduceMotion ? next : withTiming(next, EASE);
    runOnJS(toggle)();
  };

  const snap = () => {
    'worklet';
    const pw = W.value * PIP_WIDTH_RATIO;
    const ph = pw * PIP_ASPECT;
    const x = px.value + dragX.value;
    const y = py.value + dragY.value;
    const cornerX = x + pw / 2 < W.value / 2 ? MARGIN : W.value - pw - MARGIN;
    const cornerY = y + ph / 2 < H.value / 2 ? insetTop + MARGIN : H.value - ph - insetBottom - MARGIN;
    px.value = cornerX;
    py.value = cornerY;
    dragX.value = x - cornerX;
    dragY.value = y - cornerY;
    dragX.value = reduceMotion ? 0 : withTiming(0, EASE);
    dragY.value = reduceMotion ? 0 : withTiming(0, EASE);
  };

  /** Frame of a tile: t = 0 full screen, t = 1 floating. */
  const frame = (t: number) => {
    'worklet';
    const pw = W.value * PIP_WIDTH_RATIO;
    return {
      left: interpolate(t, [0, 1], [0, px.value + dragX.value]),
      top: interpolate(t, [0, 1], [0, py.value + dragY.value]),
      width: interpolate(t, [0, 1], [W.value, pw]),
      height: interpolate(t, [0, 1], [H.value, pw * PIP_ASPECT]),
      borderRadius: interpolate(t, [0, 1], [0, PIP_RADIUS]),
      zIndex: t > 0.5 ? 2 : 1,
    };
  };
  const primaryStyle = useAnimatedStyle(() => frame(swap.value));
  const secondaryStyle = useAnimatedStyle(() => frame(1 - swap.value));

  const gestureFor = (isSecondary: boolean) => {
    const isFloating = () => {
      'worklet';
      return isSecondary ? swap.value < 0.5 : swap.value > 0.5;
    };
    const pan = Gesture.Pan()
      .onUpdate((e) => {
        if (!isFloating()) return;
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd(() => {
        if (isFloating()) snap();
      });
    const tap = Gesture.Tap().onEnd(() => {
      if (isFloating()) doSwap();
      else if (onStageTap) runOnJS(onStageTap)();
    });
    return Gesture.Exclusive(pan, tap);
  };

  const floating = { width: size.width * PIP_WIDTH_RATIO, height: size.width * PIP_WIDTH_RATIO * PIP_ASPECT };
  const full = { width: size.width, height: size.height };

  const label = (text: string) => (
    <View pointerEvents="none" style={[styles.label, { backgroundColor: colors.callSurface }]}>
      <Text style={[typography.captionBold, { color: colors.callText }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.callBackground }]} onLayout={onLayout} collapsable={false}>
      {size.width > 0 ? (
        <>
          <GestureDetector gesture={gestureFor(false)}>
            <Animated.View
              style={[styles.tile, { backgroundColor: colors.callBackground }, primaryStyle]}
              accessibilityLabel={secondaryIsMain ? `${primaryLabel}, small window. Tap to make it full screen` : primaryLabel}
            >
              {primary}
              {secondaryIsMain ? label(primaryLabel) : null}
            </Animated.View>
          </GestureDetector>
          <GestureDetector gesture={gestureFor(true)}>
            <Animated.View
              style={[styles.tile, { backgroundColor: colors.callBackground }, secondaryStyle]}
              accessibilityLabel={secondaryIsMain ? secondaryLabel : `${secondaryLabel}, small window. Tap to make it full screen`}
            >
              {secondary}
              {renderSecondaryOverlay?.(secondaryIsMain ? full : floating)}
              {secondaryIsMain ? null : label(secondaryLabel)}
            </Animated.View>
          </GestureDetector>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { borderRadius: 8, bottom: 6, left: 6, paddingHorizontal: 7, paddingVertical: 2, position: 'absolute' },
  tile: { overflow: 'hidden', position: 'absolute' },
});
