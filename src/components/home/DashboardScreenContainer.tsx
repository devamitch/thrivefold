import React, { useMemo, useState, type ReactNode } from 'react';
import {
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useLayout } from '../../theme/layout';
import { squirclePath } from '../../theme/squirclePath';
import { useTheme } from '../../theme/useTheme';
import { useTabBarInset } from '../navigation/CustomTabBar';
import { updateDockOnScroll, useShowChromeOnFocus } from '../navigation/useScrollAwareDock';
import { COMPACT_HEADER_CONTENT_HEIGHT } from './DashboardHeader';

/** How far the content surface overlaps the bottom of the hero. */
export const SURFACE_OVERLAP = 32;
const SURFACE_RADIUS = 32;
/** Breathing room between the hero's last control and the surface edge. */
const HERO_BOTTOM_GAP = 20;
const SURFACE_SMOOTHING = 0.6;
/** Height the smoothed corner needs: (1 + smoothing) * radius. */
const CAP_HEIGHT = Math.ceil((1 + SURFACE_SMOOTHING) * SURFACE_RADIUS) + 1;
/** Hero content drifts at this fraction of the scroll, so the surface reads as rising over it. */
const HERO_PARALLAX = 0.28;
/** The quiet background motif drifts faster than the content, for a second depth plane. */
const DECOR_PARALLAX = 0.5;
/** Scroll back this far above the reveal point before the header hides: no flicker at the edge. */
const HEADER_HYSTERESIS = 40;
const HEADER_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;

export interface DashboardScrollContext {
  scrollY: SharedValue<number>;
  /** 0 = compact header hidden, 1 = pinned. Animated, but only ever toggled at the threshold. */
  headerProgress: SharedValue<number>;
  /** Plain flag for accessibility: true while the compact header is pinned. */
  headerVisible: boolean;
  scrollToTop: () => void;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  /** Optional background motif drawn behind the hero content, on its own parallax plane. */
  heroDecor?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Home layout: ONE vertical scroll owner holding the hero and the content surface.
 *
 * - The status bar sits on a scrim in the hero colour, so hero text scrolling up never runs
 *   under the system icons. At rest it is indistinguishable from the hero.
 * - The compact header is absent at the top. It slides in once the surface's top edge reaches
 *   the header line, and hides again only after scrolling back past a hysteresis band. One
 *   reaction on the shared scroll value drives it; nothing re-renders per frame.
 * - The hero drifts slower than the scroll (transform only), so the squircle surface rises over
 *   it and meets the header. Reduced motion turns off the drift and the header slide.
 */
export function DashboardScreenContainer({
  children,
  header,
  hero,
  heroDecor,
  contentContainerStyle,
}: DashboardScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dockInset = useTabBarInset();
  const layout = useLayout();
  const reduceMotion = useReducedMotion();
  useShowChromeOnFocus();

  const headerBottom = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;
  const heroHeight = useSharedValue(0);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const lastY = useSharedValue(0);
  const headerShown = useSharedValue(0);
  const headerProgress = useSharedValue(0);
  const [headerVisible, setHeaderVisible] = useState(false);

  /** Scroll offset at which the surface's top edge meets the bottom of the compact header. */
  const revealAt = useDerivedValue(() =>
    heroHeight.value > 0 ? Math.max(48, heroHeight.value - SURFACE_OVERLAP - headerBottom) : 1e9,
  );

  useAnimatedReaction(
    () => {
      const y = scrollY.value;
      const t = revealAt.value;
      if (y >= t) return 1;
      if (y < t - HEADER_HYSTERESIS) return 0;
      return headerShown.value;
    },
    (next, prev) => {
      if (next === prev || next === headerShown.value) return;
      headerShown.value = next;
      headerProgress.value = reduceMotion ? next : withTiming(next, HEADER_TIMING);
      scheduleOnRN(setHeaderVisible, next === 1);
    },
    [reduceMotion],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!reduceMotion) updateDockOnScroll(e.contentOffset.y, lastY);
    },
  });

  const heroStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ translateY: 0 }] };
    const y = Math.min(Math.max(scrollY.value, 0), heroHeight.value);
    return { transform: [{ translateY: y * HERO_PARALLAX }] };
  });

  const decorStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ translateY: 0 }] };
    const y = Math.min(Math.max(scrollY.value, 0), heroHeight.value);
    return { transform: [{ translateY: y * DECOR_PARALLAX }] };
  });

  const scrollToTop = React.useCallback(() => {
    (
      scrollRef.current as unknown as {
        scrollTo?: (opts: { y: number; animated: boolean }) => void;
      } | null
    )?.scrollTo?.({ y: 0, animated: !reduceMotion });
  }, [scrollRef, reduceMotion]);

  const ctx: DashboardScrollContext = { scrollY, headerProgress, headerVisible, scrollToTop };

  // The squircle top edge: the upper half of a squircle twice the cap's height, clipped by the
  // cap box. Static, drawn once per width; it scrolls as an ordinary view.
  const capPath = useMemo(
    () =>
      squirclePath({
        width,
        height: CAP_HEIGHT * 2,
        radius: SURFACE_RADIUS,
        smoothing: SURFACE_SMOOTHING,
      }),
    [width],
  );

  // A hero in a dark primary takes light status icons, a light primary dark ones.
  const barStyle = colors.scheme === 'dark' ? 'dark-content' : 'light-content';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={barStyle} translucent backgroundColor="transparent" animated />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        <View
          style={[styles.heroWrap, { backgroundColor: colors.primary }]}
          onLayout={(e) => {
            heroHeight.value = e.nativeEvent.layout.height;
          }}
        >
          {/* Fills the overscroll gap above the hero on iOS bounce. */}
          <View pointerEvents="none" style={[styles.heroCap, { backgroundColor: colors.primary }]} />
          {heroDecor ? (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, decorStyle]}>
              {heroDecor}
            </Animated.View>
          ) : null}
          <Animated.View style={[{ paddingBottom: SURFACE_OVERLAP + HERO_BOTTOM_GAP }, heroStyle]}>
            {hero(ctx)}
          </Animated.View>
        </View>

        <View style={styles.surface}>
          <View
            pointerEvents="none"
            style={[styles.surfaceBody, { backgroundColor: colors.background }]}
          />
          <View pointerEvents="none" style={styles.surfaceCap}>
            <Svg width={width} height={CAP_HEIGHT * 2}>
              <Path d={capPath} fill={colors.background} />
            </Svg>
          </View>
          <View
            style={[
              styles.column,
              {
                maxWidth: layout.columnWidth,
                paddingHorizontal: layout.gutter,
                paddingBottom: dockInset + 32,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </Animated.ScrollView>

      {/* After the scroll view so Android dispatches touches to the header first. */}
      {header(ctx)}
      <View
        pointerEvents="none"
        style={[styles.statusScrim, { height: insets.top, backgroundColor: colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  heroWrap: { width: '100%', overflow: 'hidden' },
  heroCap: { position: 'absolute', left: 0, right: 0, top: -1000, height: 1000 },
  surface: { width: '100%', marginTop: -SURFACE_OVERLAP, paddingTop: 20 },
  surfaceBody: { position: 'absolute', left: 0, right: 0, top: CAP_HEIGHT, bottom: 0 },
  surfaceCap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CAP_HEIGHT,
    overflow: 'hidden',
  },
  column: { alignSelf: 'center', width: '100%' },
  statusScrim: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 110 },
});
