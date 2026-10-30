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
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
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

/** How far the content sheet overlaps the bottom of the hero. */
export const SURFACE_OVERLAP = 32;
const SURFACE_RADIUS = 30;
const SURFACE_SMOOTHING = 0.6;
/** Breathing room between the hero's last control and the sheet edge. */
const HERO_BOTTOM_GAP = 20;
/** Height the smoothed corner needs: (1 + smoothing) * radius. */
const CAP_HEIGHT = Math.ceil((1 + SURFACE_SMOOTHING) * SURFACE_RADIUS) + 1;
/** Hero content drifts at this fraction of the scroll, so the sheet reads as rising over it. */
const HERO_PARALLAX = 0.25;
const DECOR_PARALLAX = 0.45;

export interface DashboardScrollContext {
  scrollY: SharedValue<number>;
  /** 0 → 1 over the last stretch before the sheet docks; drives the header title. */
  titleProgress: SharedValue<number>;
  /** Plain flag for touch and accessibility: true once the header title is showing. */
  headerVisible: boolean;
  scrollToTop: () => void;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  /** Optional background motif behind the hero content, on its own parallax plane. */
  heroDecor?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Home layout: ONE native vertical scroll holding the hero and the content sheet, with every
 * effect tied to the scroll position (no timers), so it follows the finger and momentum exactly
 * and reverses exactly.
 *
 * - The sheet rises over the hero (the hero drifts slower and fades as it nears the header).
 * - When the sheet's top edge reaches the header line it DOCKS: from there the header band and
 *   the sheet's rounded top corners are fixed chrome, and the cards scroll inside the sheet,
 *   clipped by those corners. The sheet never travels past the header.
 * - The handoff is invisible: at the dock point the band above the sheet is plain hero colour,
 *   so swapping in the fixed band and corner mask changes no pixel.
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
  const [headerVisible, setHeaderVisible] = useState(false);

  /** Scroll offset at which the sheet's top edge meets the header line. */
  const dockAt = useDerivedValue(() =>
    heroHeight.value > 0 ? Math.max(1, heroHeight.value - SURFACE_OVERLAP - headerBottom) : 1e9,
  );

  const titleProgress = useDerivedValue(() =>
    interpolate(
      scrollY.value,
      [dockAt.value * 0.85, dockAt.value],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  );

  useAnimatedReaction(
    () => titleProgress.value > 0.5,
    (shown, prev) => {
      if (shown !== prev) scheduleOnRN(setHeaderVisible, shown);
    },
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!reduceMotion) updateDockOnScroll(e.contentOffset.y, lastY);
    },
  });

  // Hero content fades out before it reaches the header band, so the band is plain colour at the
  // dock point. Drift is skipped under reduced motion; the fade is not motion and stays.
  const heroStyle = useAnimatedStyle(() => {
    const y = Math.max(scrollY.value, 0);
    const t = dockAt.value;
    return {
      opacity: interpolate(y, [t * 0.3, t * 0.85], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: reduceMotion ? 0 : Math.min(y, t) * HERO_PARALLAX }],
    };
  });

  const decorStyle = useAnimatedStyle(() => {
    const y = Math.max(scrollY.value, 0);
    const t = dockAt.value;
    return {
      opacity: interpolate(y, [0, t * 0.85], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: reduceMotion ? 0 : Math.min(y, t) * DECOR_PARALLAX }],
    };
  });

  // Fixed chrome appears exactly at the dock point (a step, not a fade: nothing changes visually).
  const dockedStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value >= dockAt.value ? 1 : 0,
  }));

  const scrollToTop = React.useCallback(() => {
    (
      scrollRef.current as unknown as {
        scrollTo?: (opts: { y: number; animated: boolean }) => void;
      } | null
    )?.scrollTo?.({ y: 0, animated: !reduceMotion });
  }, [scrollRef, reduceMotion]);

  const ctx: DashboardScrollContext = { scrollY, titleProgress, headerVisible, scrollToTop };

  const { capPath, maskPath } = useMemo(() => {
    const cap = squirclePath({
      width,
      height: CAP_HEIGHT * 2,
      radius: SURFACE_RADIUS,
      smoothing: SURFACE_SMOOTHING,
    });
    // The rectangle minus the squircle (even-odd): just the two outer corners.
    return { capPath: cap, maskPath: `M0 0 H${width} V${CAP_HEIGHT} H0 Z ${cap}` };
  }, [width]);

  const barStyle = colors.scheme === 'dark' ? 'dark-content' : 'light-content';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={barStyle} animated />

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
          <View pointerEvents="none" style={[styles.heroCap, { backgroundColor: colors.primary }]} />
          {heroDecor ? (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, decorStyle]}>
              {heroDecor}
            </Animated.View>
          ) : null}
          <Animated.View
            style={[{ paddingBottom: SURFACE_OVERLAP + HERO_BOTTOM_GAP }, heroStyle]}
          >
            {hero(ctx)}
          </Animated.View>
        </View>

        <View style={styles.sheet}>
          <View
            pointerEvents="none"
            style={[styles.sheetBody, { backgroundColor: colors.background }]}
          />
          <View pointerEvents="none" style={styles.sheetCap}>
            <Svg width={width} height={CAP_HEIGHT}>
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

      {/* Fixed chrome once docked: header band plus the sheet's top corners. */}
      <Animated.View pointerEvents="none" style={[styles.dockedChrome, dockedStyle]}>
        <View style={{ height: headerBottom, backgroundColor: colors.primary }} />
        <Svg width={width} height={CAP_HEIGHT}>
          <Path d={maskPath} fill={colors.primary} fillRule="evenodd" />
        </Svg>
      </Animated.View>

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
  sheet: { width: '100%', marginTop: -SURFACE_OVERLAP, paddingTop: 22 },
  sheetBody: { position: 'absolute', left: 0, right: 0, top: CAP_HEIGHT, bottom: 0 },
  sheetCap: { position: 'absolute', left: 0, right: 0, top: 0, height: CAP_HEIGHT },
  column: { alignSelf: 'center', width: '100%' },
  dockedChrome: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 90 },
  statusScrim: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 110 },
});
