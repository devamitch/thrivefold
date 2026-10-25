import React, { ReactNode, useEffect } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSegments } from 'expo-router';

import { useRootStore } from '../../stores/useRootStore';
import { drawerProgress, drawerWidthFor } from './drawerProgress';
import { useTheme } from '../../theme/useTheme';

export function DrawerSceneWrapper({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const segments = useSegments();

  const drawerOpen = useRootStore((s) => s.drawerOpen);
  const setDrawerOpen = useRootStore((s) => s.setDrawerOpen);

  const progress = drawerProgress;
  const slide = drawerWidthFor(width);

  // Drawer gestures only activate on primary tab roots, preventing conflict with back swipes in nested screens
  const isTabRoot = Array.isArray(segments) && segments[1] === '(tabs)' && segments.length <= 3;

  useEffect(() => {
    if (reduceMotion) {
      progress.value = drawerOpen ? 1 : 0;
    } else {
      progress.value = withTiming(drawerOpen ? 1 : 0, { duration: 280, easing: Easing.out(Easing.cubic) });
    }
  }, [drawerOpen, reduceMotion, progress]);

  // Handle Android back button to close drawer when open
  useEffect(() => {
    if (!drawerOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setDrawerOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [drawerOpen, setDrawerOpen]);

  // Smart swipe gesture:
  // When closed: ONLY starts from left edge (width 36) on root tabs
  // When open: allows swiping left anywhere on screen to close
  const panGesture = Gesture.Pan()
    .enabled(drawerOpen || isTabRoot)
    .hitSlop(drawerOpen ? {} : { left: 0, width: 36 })
    .activeOffsetX(drawerOpen ? [-12, 12] : [15, 99999])
    .failOffsetX(drawerOpen ? [-99999, 99999] : [-15, 0])
    .failOffsetY([-18, 18])
    .onChange((event) => {
      'worklet';
      const delta = event.changeX / slide;
      const next = progress.value + delta;
      progress.value = Math.min(Math.max(next, 0), 1);
    })
    .onEnd((event) => {
      'worklet';
      const shouldOpen = drawerOpen
        ? !(event.velocityX < -250 || progress.value < 0.65)
        : (event.velocityX > 300 || progress.value > 0.3);

      progress.value = withTiming(
        shouldOpen ? 1 : 0,
        { duration: 250, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setDrawerOpen)(shouldOpen);
          }
        }
      );
    });

  const animatedSceneStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [0, slide],
        Extrapolation.CLAMP,
      );
      return {
        transform: [{ translateX }],
      };
    }

    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, 0.86],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, slide],
      Extrapolation.CLAMP,
    );
    // Round the corners once the screen starts to move (animating the radius every frame
    // re-clips the whole screen and drops frames on Android).
    const borderRadius = progress.value > 0.01 ? 24 : 0;

    if (Platform.OS === 'ios') {
      const rotateY = interpolate(
        progress.value,
        [0, 1],
        [0, -10],
        Extrapolation.CLAMP,
      );
      return {
        borderRadius,
        transform: [
          { perspective: 1000 },
          { translateX },
          { scale },
          { rotateY: `${rotateY}deg` },
        ],
      };
    }

    return {
      borderRadius,
      transform: [
        { translateX },
        { scale },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
          animatedSceneStyle,
        ]}
      >
        {children}

        {/* Backdrop touch interceptor when drawer is open */}
        {drawerOpen ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDrawerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close navigation drawer"
          />
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
