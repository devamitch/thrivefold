import React, { type ReactNode } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { useDashboardScroll } from './DashboardScreenContainer';

interface Props {
  children: ReactNode;
  /** Position in the list; only used to stagger sections that appear together. */
  index?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reveals a section once, the first time it scrolls into view.
 * Must be a direct child of the dashboard content column (its layout y is relative to it).
 * UI-thread only; with reduced motion it renders fully visible and never animates.
 */
export function ScrollReveal({ children, index = 0, distance = 22, style }: Props) {
  const { scrollY, viewportHeight, contentTop, reduceMotion } = useDashboardScroll();
  const top = useSharedValue(-1);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useAnimatedReaction(
    () =>
      top.value >= 0 &&
      contentTop.value > 0 &&
      viewportHeight.value > 0 &&
      scrollY.value + viewportHeight.value > contentTop.value + top.value + 48,
    (visible, prev) => {
      if (visible && !prev && progress.value < 1) {
        progress.value = withDelay(
          Math.min(index, 4) * 55,
          withSpring(1, { damping: 22, stiffness: 150, mass: 0.9, overshootClamping: true }),
        );
      }
    },
  );

  const animated = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p,
      transform: [{ translateY: (1 - p) * distance }, { scale: 0.985 + 0.015 * p }],
    };
  });

  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) => {
        top.value = e.nativeEvent.layout.y;
      }}
      style={[style, reduceMotion ? undefined : animated]}
    >
      {children}
    </Animated.View>
  );
}
