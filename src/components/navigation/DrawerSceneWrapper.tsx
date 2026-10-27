import { BlurTargetView } from 'expo-blur';
import { hapticLight } from '../../services/haptics';
import { useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect, useMemo, useState, type RefObject } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { SquircleSurface } from '../ui';
import {
  DRAWER_EDGE_WIDTH,
  DRAWER_SCENE_RADIUS,
  DRAWER_SCENE_SCALE,
  DRAWER_TIMING,
  drawerProgress,
  drawerTarget,
  drawerWidthFor,
} from './drawerProgress';

const CLAMP = Extrapolation.CLAMP;
const IS_IOS = Platform.OS === 'ios';
/** px/s. A flick faster than this decides open/close regardless of distance. */
const FLICK_VELOCITY = 500;

const tick = () => {
  hapticLight();
};

/**
 * The screens. Opening the drawer slides them aside; their content is also the blur target for
 * the frosted room behind (AppDrawer), so the drawer is lit by a blurred echo of the current page.
 */
export function DrawerSceneWrapper({
  children,
  blurTarget,
}: {
  children: ReactNode;
  blurTarget: RefObject<View | null>;
}) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const segments = useSegments();

  const drawerOpen = useRootStore((s) => s.drawerOpen);
  const setDrawerOpen = useRootStore((s) => s.setDrawerOpen);

  const progress = drawerProgress;
  const slide = drawerWidthFor(width);

  // Drawer gestures only activate on primary tab roots, so they never fight back-swipes in nested screens.
  const isTabRoot = Array.isArray(segments) && segments[1] === '(tabs)' && segments.length <= 3;

  // Store -> animation (hamburger button, back button, backdrop tap, nav item).
  // If a gesture release already sent the animation to this target, leave it alone.
  useEffect(() => {
    const target = drawerOpen ? 1 : 0;
    if (drawerTarget.value === target) return;
    drawerTarget.value = target;
    progress.value = reduceMotion ? target : withTiming(target, DRAWER_TIMING);
  }, [drawerOpen, reduceMotion, progress]);

  // Android back closes the drawer first.
  useEffect(() => {
    if (!drawerOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setDrawerOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [drawerOpen, setDrawerOpen]);

  // The drawer is dark, so the status bar flips to light as soon as it is visibly revealed
  // (mid-drag included), then returns to whatever the screen had set.
  const [barLight, setBarLight] = useState(false);
  useAnimatedReaction(
    () => progress.value > 0.3,
    (now, prev) => {
      if (now !== prev) runOnJS(setBarLight)(now);
    },
  );

  const pan = useMemo(() => {
    const base = Gesture.Pan()
      .enabled(drawerOpen || isTabRoot)
      .failOffsetY([-18, 18])
      .onStart(() => {
        'worklet';
        // Grab the scene wherever it is, even mid-spring.
        cancelAnimation(progress);
      })
      .onChange((event) => {
        'worklet';
        const next = progress.value + event.changeX / slide;
        progress.value = Math.min(Math.max(next, 0), 1);
      })
      .onEnd((event) => {
        'worklet';
        const vx = event.velocityX;
        // Flick wins; otherwise distance, with a little hysteresis so it feels sticky either way.
        const open =
          vx > FLICK_VELOCITY
            ? true
            : vx < -FLICK_VELOCITY
              ? false
              : progress.value > (drawerOpen ? 0.6 : 0.4);

        drawerTarget.value = open ? 1 : 0;
        progress.value = reduceMotion ? (open ? 1 : 0) : withTiming(open ? 1 : 0, DRAWER_TIMING);

        if (open !== drawerOpen) {
          runOnJS(tick)();
          runOnJS(setDrawerOpen)(open);
        }
      });

    // Open: swipe left anywhere to close. Closed: only a rightward swipe from the left edge opens.
    return drawerOpen
      ? base.activeOffsetX([-10, 10])
      : base.hitSlop({ left: 0, width: DRAWER_EDGE_WIDTH }).activeOffsetX(12).failOffsetX(-12);
  }, [drawerOpen, isTabRoot, progress, reduceMotion, setDrawerOpen, slide]);

  const sceneStyle = useAnimatedStyle(() => {
    const p = progress.value;
    let translateX = interpolate(p, [0, 1], [0, slide - 50], CLAMP);
    // Corners round off over the first 15% of travel: no pop when the screen starts to move,
    // and no per-frame re-clip for the rest of the drag.
    const borderRadius = interpolate(p, [0, 0.15], [0, DRAWER_SCENE_RADIUS], CLAMP);

    // if (reduceMotion) {
    //   return { borderRadius, transform: [{ translateX }] };
    // }

    const scale = interpolate(p, [0, 1], [1, DRAWER_SCENE_SCALE], CLAMP);
    if (!IS_IOS) {
      let rotateY = interpolate(p, [0, 1], [0, -28], CLAMP);

      // translateX = interpolate(progress.value, [0, 1], [0, DRAWER_SCENE_SCALE], CLAMP);

      // rotateY = interpolate(progress.value, [0, 1], [0, -25], CLAMP);
      return {
        borderRadius,
        transform: [{ perspective: 1000 }, { translateX }, { scale }, { rotateY: `${rotateY}deg` }],
      };
    }
    return { borderRadius, transform: [{ translateX }, { scale }] };
  });

  // The screen recedes: a soft ink veil over it as it slides away.
  const veilStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.14], CLAMP),
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.container,
          // { backgroundColor: colors.background },
          sceneStyle,
          // animatedStyled,
        ]}
      >
        <SquircleSurface
          style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: drawerOpen ? 40 : 20,
            backgroundColor: colors.background,
          }}
          radius={drawerOpen ? 40 : 20}
        >
          <BlurTargetView
            ref={blurTarget}
            style={styles.fill}
            importantForAccessibility={drawerOpen ? 'no-hide-descendants' : 'auto'}
            accessibilityElementsHidden={drawerOpen}
          >
            {children}
          </BlurTargetView>
        </SquircleSurface>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.text.primary }, veilStyle]}
        />

        {/* Tap anywhere on the receded screen to close */}
        {drawerOpen ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDrawerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close navigation drawer"
          />
        ) : null}

        {barLight ? <StatusBar style="light" animated /> : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  fill: {
    flex: 1,
  },
});
