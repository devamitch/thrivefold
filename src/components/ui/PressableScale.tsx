/**
 * A press that answers with the surface itself.
 * Traced from Neev & BlinkQuest canonical touch feedback specifications.
 *
 * Touch feedback is physical: the thing you press gives under the finger and springs back,
 * rather than flashing an opacity. That motion is uniform everywhere — one spring, one scale,
 * one reduced-motion rule.
 *
 * It is a Pressable in every other respect. Accessibility props are forwarded rather than
 * re-declared, so screen readers and accessibility tools treat it as a native interactive control.
 *
 * `touch="touchable"` (default) uses Gesture Handler's native Pressable: the touch is recognised
 * on the UI thread and negotiates with scroll views, sheets and pan gestures, so a press inside a
 * draggable sheet or a list no longer fights the drag. `touch="pressable"` keeps React Native's
 * own Pressable for the rare place that needs the JS responder system. Inside a React Native
 * `Modal`, wrap the content in `GestureHandlerRootView` (Android needs a root per window).
 */
import React, { memo, useCallback, useEffect, useMemo, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';
import type { ViewInstance } from 'react-native';
import { Touchable as GHPressable } from 'react-native-gesture-handler';

import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTouchable = Animated.createAnimatedComponent(GHPressable);

/** Crisp and tactile timing curves: predictable and direct, never floaty or bouncy. */
const PRESS_IN_TIMING = { duration: 80, easing: Easing.out(Easing.cubic) } as const;
const PRESS_OUT_TIMING = { duration: 130, easing: Easing.out(Easing.cubic) } as const;

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /**
   * Plain style only. A `(state) => style` function hides the animated node from
   * Reanimated and breaks layout, so it is intentionally not supported.
   */
  style?: StyleProp<ViewStyle>;
  /** How far it gives. 0.97 for cards/rows; 0.95 or 0.92 for smaller buttons/icons. */
  scaleTo?: number;
  /** Opacity while `disabled`. Pass 1 when the caller styles the disabled look itself. */
  disabledOpacity?: number;
  /** Gesture Handler touchable (default) or React Native's Pressable. */
  touch?: 'touchable' | 'pressable';
  ref?: Ref<ViewInstance>;
}

export const PressableScale = memo(function PressableScale({
  style,
  scaleTo = 0.97,
  disabledOpacity = 0.45,
  touch = 'touchable',
  disabled,
  onPressIn,
  onPressOut,
  ref,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  // Scale only. Opacity is never animated, so it can't fight the disabled opacity below.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
  }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      pressed.value = reduceMotion ? 1 : withTiming(1, PRESS_IN_TIMING);
      onPressIn?.(e);
    },
    [onPressIn, pressed, reduceMotion],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      pressed.value = reduceMotion ? 0 : withTiming(0, PRESS_OUT_TIMING);
      onPressOut?.(e);
    },
    [onPressOut, pressed, reduceMotion],
  );

  // If it becomes disabled mid-press (e.g. onPress flips `loading`), onPressOut can be
  // skipped and the surface would stay shrunk. Always animate back.
  useEffect(() => {
    if (disabled) pressed.value = reduceMotion ? 0 : withTiming(0, PRESS_OUT_TIMING);
  }, [disabled, pressed, reduceMotion]);

  // Flatten once, keep the animated style directly in the array so Reanimated sees it.
  const composedStyle = useMemo(
    () => [
      StyleSheet.flatten(style),
      animatedStyle,
      disabled && disabledOpacity < 1 ? { opacity: disabledOpacity } : null,
    ],
    [style, animatedStyle, disabled, disabledOpacity],
  );

  const reset = () => {
    pressed.value = reduceMotion ? 0 : withTiming(0, PRESS_OUT_TIMING);
  };

  if (touch === 'pressable') {
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        {...rest}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onResponderTerminate={reset}
        style={composedStyle}
      />
    );
  }

  // Same props; Gesture Handler's event carries the same nativeEvent fields callers read.
  const touchableProps = rest as unknown as React.ComponentProps<typeof GHPressable>;
  return (
    <AnimatedTouchable
      ref={ref}
      accessibilityRole="button"
      {...touchableProps}
      disabled={disabled}
      onPressIn={handlePressIn as unknown as React.ComponentProps<typeof GHPressable>['onPressIn']}
      onPressOut={
        handlePressOut as unknown as React.ComponentProps<typeof GHPressable>['onPressOut']
      }
      style={composedStyle}
    />
  );
});

export default PressableScale;
