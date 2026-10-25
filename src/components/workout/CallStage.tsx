import React, { useState } from 'react';
import { StyleSheet, View, Text, type LayoutChangeEvent } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';

export type WorkoutStageMode = 'split' | 'pip';

const PIP_WIDTH_RATIO = 0.32;
const GUTTER = 10;
const MAIN_RADIUS = 20;
const PIP_ASPECT = 4 / 3;
const MARGIN = 12;
const SPRING = { damping: 22, stiffness: 240 };

interface Props {
  /** Tile shown full screen or top half (the tutorial video). */
  primary: React.ReactNode;
  /** Tile shown in corner or bottom half (the pose camera). */
  secondary: React.ReactNode;
  /** Space kept clear at the top and bottom for HUD and dock. */
  insetTop: number;
  insetBottom: number;
  /** Called when a main tile is tapped (show or hide controls). */
  onStageTap?: () => void;
  /** Reports which tile is main after a swap in PiP mode. */
  onSwap?: (secondaryIsMain: boolean) => void;
  /** Renders inside camera tile with its live size. */
  renderSecondaryOverlay?: (size: { width: number; height: number }) => React.ReactNode;
  /** Stage mode: 'split' for dual studio or 'pip' for focused tile with HUD PiP. */
  mode?: WorkoutStageMode;
  /** Primary tile label */
  primaryLabel?: string;
  /** Secondary tile label */
  secondaryLabel?: string;
}

/**
 * Modern AI Workout Studio Stage:
 * Supports Dual Studio Split View (stacked top/bottom with equal prominence)
 * and Focus Mode (full bleed with interactive floating PiP HUD).
 */
export function CallStage({
  primary,
  secondary,
  insetTop,
  insetBottom,
  onStageTap,
  onSwap,
  renderSecondaryOverlay,
  mode = 'split',
  primaryLabel = 'Tutorial',
  secondaryLabel = 'AI Pose Camera',
}: Props) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [secondaryIsMain, setSecondaryIsMain] = useState(false);
  const W = useSharedValue(0);
  const H = useSharedValue(0);

  /** 0: primary is full screen; 1: secondary is full screen. */
  const swap = useSharedValue(0);
  /** Floating tile corner position (top-left), in px. */
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const isSplit = mode === 'split';

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    W.value = width;
    H.value = height;
    const pw = width * PIP_WIDTH_RATIO;
    px.value = width - pw - GUTTER - MARGIN;
    py.value = height - pw * PIP_ASPECT - insetBottom - MARGIN;
    setSize({ width, height });
  };

  const toggleSwap = () => {
    const next = !secondaryIsMain;
    setSecondaryIsMain(next);
    onSwap?.(next);
  };

  const doSwap = () => {
    'worklet';
    swap.value = reduceMotion
      ? swap.value > 0.5
        ? 0
        : 1
      : withTiming(swap.value > 0.5 ? 0 : 1, { duration: 320 });
    runOnJS(toggleSwap)();
  };

  const snap = () => {
    'worklet';
    const pw = W.value * PIP_WIDTH_RATIO;
    const ph = pw * PIP_ASPECT;
    const x = px.value + dragX.value;
    const y = py.value + dragY.value;
    const cornerX = x + pw / 2 < W.value / 2 ? GUTTER + MARGIN : W.value - pw - GUTTER - MARGIN;
    const cornerY =
      y + ph / 2 < H.value / 2 ? insetTop + MARGIN : H.value - ph - insetBottom - MARGIN;
    px.value = cornerX;
    py.value = cornerY;
    dragX.value = x - cornerX;
    dragY.value = y - cornerY;
    dragX.value = withSpring(0, SPRING);
    dragY.value = withSpring(0, SPRING);
  };

  /** PiP frame calculations */
  const pipFrame = (t: number) => {
    'worklet';
    const pw = W.value * PIP_WIDTH_RATIO;
    const ph = pw * PIP_ASPECT;
    const mainH = H.value - insetTop - insetBottom + MARGIN;
    return {
      left: interpolate(t, [0, 1], [GUTTER, px.value + dragX.value]),
      top: interpolate(t, [0, 1], [insetTop - MARGIN / 2, py.value + dragY.value]),
      width: interpolate(t, [0, 1], [W.value - GUTTER * 2, pw]),
      height: interpolate(t, [0, 1], [mainH, ph]),
      borderRadius: interpolate(t, [0, 1], [MAIN_RADIUS, 16]),
      zIndex: t > 0.5 ? 2 : 1,
    };
  };

  const primaryPipStyle = useAnimatedStyle(() => pipFrame(swap.value));
  const secondaryPipStyle = useAnimatedStyle(() => pipFrame(1 - swap.value));

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

  // Dimensions for overlays
  const availableH = size.height - insetTop - insetBottom;
  const splitGap = 10;
  const splitH = Math.max(120, Math.floor((availableH - splitGap) / 2));
  const splitW = Math.max(100, size.width - GUTTER * 2);

  const floatingSize = {
    width: size.width * PIP_WIDTH_RATIO,
    height: size.width * PIP_WIDTH_RATIO * PIP_ASPECT,
  };
  const mainSize = {
    width: size.width - GUTTER * 2,
    height: size.height - insetTop - insetBottom + MARGIN,
  };

  if (size.width === 0) {
    return (
      <View style={StyleSheet.absoluteFill} onLayout={onLayout} collapsable={false} />
    );
  }

  // Dual Studio Split View
  if (isSplit) {
    return (
      <View style={StyleSheet.absoluteFill} onLayout={onLayout} collapsable={false}>
        {/* Top Half: Tutorial Video */}
        <View
          style={[
            styles.splitTile,
            {
              left: GUTTER,
              top: insetTop,
              width: splitW,
              height: splitH,
              borderRadius: MAIN_RADIUS,
            },
          ]}
        >
          {primary}
          <View style={styles.badge} pointerEvents="none">
            <Ionicons name="play-circle" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>{primaryLabel}</Text>
          </View>
        </View>

        {/* Bottom Half: Pose Camera */}
        <View
          style={[
            styles.splitTile,
            {
              left: GUTTER,
              top: insetTop + splitH + splitGap,
              width: splitW,
              height: splitH,
              borderRadius: MAIN_RADIUS,
            },
          ]}
        >
          {secondary}
          {renderSecondaryOverlay?.({ width: splitW, height: splitH })}
          <View style={[styles.badge, styles.cameraBadge]} pointerEvents="none">
            <View style={styles.liveDot} />
            <Text style={styles.badgeText}>{secondaryLabel}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Focus Mode (Main View + Floating PiP HUD)
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} collapsable={false}>
      <GestureDetector gesture={gestureFor(false)}>
        <Animated.View
          style={[styles.tile, primaryPipStyle]}
          accessibilityLabel={secondaryIsMain ? `${primaryLabel}, small. Tap to enlarge` : primaryLabel}
        >
          {primary}
        </Animated.View>
      </GestureDetector>
      <GestureDetector gesture={gestureFor(true)}>
        <Animated.View
          style={[styles.tile, secondaryPipStyle]}
          accessibilityLabel={secondaryIsMain ? secondaryLabel : `${secondaryLabel}, small. Tap to enlarge`}
        >
          {secondary}
          {renderSecondaryOverlay?.(secondaryIsMain ? mainSize : floatingSize)}
          {swap.value < 0.5 ? (
            <View style={styles.pipSwapIndicator} pointerEvents="none">
              <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginLeft: 5,
  },
  cameraBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  liveDot: {
    backgroundColor: '#34D399',
    borderRadius: 3.5,
    height: 7,
    width: 7,
  },
  pipSwapIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
    bottom: 6,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    width: 24,
    zIndex: 12,
  },
  splitTile: {
    backgroundColor: '#0F1115',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    elevation: 8,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  tile: {
    backgroundColor: '#0F1115',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
});
