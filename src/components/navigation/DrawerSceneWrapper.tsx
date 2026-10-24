import React, { ReactNode, useEffect } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

export function DrawerSceneWrapper({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

  const drawerOpen = useRootStore((s) => s.drawerOpen);
  const setDrawerOpen = useRootStore((s) => s.setDrawerOpen);

  const progress = useSharedValue(0);

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

  // Swipe gesture to open/close drawer
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onChange((event) => {
      const drawerWidth = width * 0.72;
      const delta = event.changeX / drawerWidth;
      const next = progress.value + delta;
      progress.value = Math.min(Math.max(next, 0), 1);
    })
    .onEnd((event) => {
      if (event.velocityX > 400 || progress.value > 0.35) {
        runOnJS(setDrawerOpen)(true);
      } else {
        runOnJS(setDrawerOpen)(false);
      }
    });

  const animatedSceneStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [0, width * 0.72],
        Extrapolation.CLAMP,
      );
      return {
        transform: [{ translateX }],
      };
    }

    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, 0.82],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, width * 0.72],
      Extrapolation.CLAMP,
    );
    const rotateY = interpolate(
      progress.value,
      [0, 1],
      [0, -14],
      Extrapolation.CLAMP,
    );
    const borderRadius = interpolate(
      progress.value,
      [0, 1],
      [0, 28],
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
