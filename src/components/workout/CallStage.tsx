import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PIP_WIDTH_RATIO = 0.32;
const PIP_ASPECT = 4 / 3;
const MARGIN = 12;
const SPRING = { damping: 20, stiffness: 220 };

interface Props {
  /** Tile shown full screen first (the tutorial video). */
  primary: React.ReactNode;
  /** Tile shown in the corner first (the camera). */
  secondary: React.ReactNode;
  /** Space kept clear at the top and bottom for the call bars. */
  insetTop: number;
  insetBottom: number;
  /** Called when the full-screen tile is tapped (show or hide controls). */
  onStageTap?: () => void;
  /** Reports which tile is full screen after a swap. */
  onSwap?: (secondaryIsMain: boolean) => void;
  /** Renders inside each tile with its live size, e.g. overlays that need dimensions. */
  renderSecondaryOverlay?: (size: { width: number; height: number }) => React.ReactNode;
}

/**
 * Video-call layout: one tile fills the screen, the other floats in a corner. The floating
 * tile can be dragged and snaps to the nearest corner; tapping it swaps the two with a
 * shared-element style transition. Both tiles stay mounted, so neither reloads.
 */
export function CallStage({ primary, secondary, insetTop, insetBottom, onStageTap, onSwap, renderSecondaryOverlay }: Props) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [secondaryIsMain, setSecondaryIsMain] = useState(false);
  const W = useSharedValue(0);
  const H = useSharedValue(0);
  /** 0: primary is full screen; 1: secondary is. */
  const swap = useSharedValue(0);
  /** Floating tile corner position (top-left), in px. */
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

  const toggle = () => {
    const next = !secondaryIsMain;
    setSecondaryIsMain(next);
    onSwap?.(next);
  };

  const doSwap = () => {
    'worklet';
    swap.value = reduceMotion ? (swap.value > 0.5 ? 0 : 1) : withTiming(swap.value > 0.5 ? 0 : 1, { duration: 320 });
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
    // Move the anchor to the corner and spring the remaining offset away.
    px.value = cornerX;
    py.value = cornerY;
    dragX.value = x - cornerX;
    dragY.value = y - cornerY;
    dragX.value = withSpring(0, SPRING);
    dragY.value = withSpring(0, SPRING);
  };

  /** Frame of a tile: t = 0 full screen, t = 1 floating. */
  const frame = (t: number) => {
    'worklet';
    const pw = W.value * PIP_WIDTH_RATIO;
    const ph = pw * PIP_ASPECT;
    return {
      left: interpolate(t, [0, 1], [0, px.value + dragX.value]),
      top: interpolate(t, [0, 1], [0, py.value + dragY.value]),
      width: interpolate(t, [0, 1], [W.value, pw]),
      height: interpolate(t, [0, 1], [H.value, ph]),
      borderRadius: interpolate(t, [0, 1], [0, 16]),
      zIndex: t > 0.5 ? 2 : 1,
      elevation: t > 0.5 ? 8 : 0,
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

  const floatingSize = { width: size.width * PIP_WIDTH_RATIO, height: size.width * PIP_WIDTH_RATIO * PIP_ASPECT };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.width > 0 ? (
        <>
          <GestureDetector gesture={gestureFor(false)}>
            <Animated.View style={[styles.tile, primaryStyle]} accessibilityLabel={secondaryIsMain ? 'Tutorial video, small. Tap to enlarge' : 'Tutorial video'}>
              {primary}
            </Animated.View>
          </GestureDetector>
          <GestureDetector gesture={gestureFor(true)}>
            <Animated.View style={[styles.tile, secondaryStyle]} accessibilityLabel={secondaryIsMain ? 'Camera' : 'Camera, small. Tap to enlarge'}>
              {secondary}
              {renderSecondaryOverlay?.(secondaryIsMain ? size : floatingSize)}
            </Animated.View>
          </GestureDetector>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { overflow: 'hidden', position: 'absolute' },
});
