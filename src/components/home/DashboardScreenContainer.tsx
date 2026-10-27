import { Ionicons } from '@expo/vector-icons';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  ZoomIn,
  ZoomOut,
  type SharedValue,
} from 'react-native-reanimated';

import { useLayout } from '../../theme/layout';
import { useTheme } from '../../theme/useTheme';
import { useTabBarInset } from '../navigation/CustomTabBar';
import { updateDockOnScroll, useShowChromeOnFocus } from '../navigation/useScrollAwareDock';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui';

export const DASHBOARD_COLLAPSE_DISTANCE = 130;
/** Squircle overlaps the hero by this much; its inner top padding is SURFACE_PAD_TOP. */
export const SURFACE_OVERLAP = 28;
export const SURFACE_PAD_TOP = 18;
const BACK_TO_TOP_AFTER = 720;

export interface DashboardScrollContext {
  /** Raw vertical offset (negative while pulling down on iOS). */
  scrollY: SharedValue<number>;
  /** 0 → 1 across DASHBOARD_COLLAPSE_DISTANCE. The only collapse value; header + hero share it. */
  collapseProgress: SharedValue<number>;
  /** 0 → 1 across the whole page. */
  pageProgress: SharedValue<number>;
  viewportHeight: SharedValue<number>;
  /** Y (in scroll content) where the first child of the squircle column starts. */
  contentTop: SharedValue<number>;
  scrollToTop: () => void;
  reduceMotion: boolean;
}

const ScrollCtx = createContext<DashboardScrollContext | null>(null);

export function useDashboardScroll(): DashboardScrollContext {
  const ctx = useContext(ScrollCtx);
  if (!ctx) throw new Error('useDashboardScroll must be used inside DashboardScreenContainer');
  return ctx;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * One vertical scroll owner. Everything animated reads the same `scrollY`:
 * - header collapse (DashboardHeader)
 * - hero depth / pull-to-stretch (VitalityHero)
 * - section reveals (ScrollReveal)
 * - page progress hairline + back-to-top
 * All on the UI thread; React state only changes on rare threshold crossings.
 */
export function DashboardScreenContainer({
  children,
  header,
  hero,
  contentContainerStyle,
}: DashboardScreenContainerProps) {
  const { colors } = useTheme();
  const dockInset = useTabBarInset();
  const layout = useLayout();
  const reduceMotion = useReducedMotion();
  useShowChromeOnFocus();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const lastY = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const contentTop = useSharedValue(0);
  const [showTop, setShowTop] = useState(false);

  const collapseProgress = useDerivedValue(() =>
    interpolate(scrollY.value, [0, DASHBOARD_COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  );

  const pageProgress = useDerivedValue(() => {
    const range = contentHeight.value - viewportHeight.value;
    return range > 0 ? Math.min(1, Math.max(0, scrollY.value / range)) : 0;
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!reduceMotion) updateDockOnScroll(e.contentOffset.y, lastY);
    },
  });

  useAnimatedReaction(
    () => scrollY.value > BACK_TO_TOP_AFTER,
    (now, prev) => {
      if (now !== prev) runOnJS(setShowTop)(now);
    },
  );

  const scrollToTop = useCallback(() => {
    (scrollRef.current as unknown as ScrollView | null)?.scrollTo({ y: 0, animated: true });
  }, [scrollRef]);

  const onHeroLayout = useCallback(
    (e: LayoutChangeEvent) => {
      contentTop.value = e.nativeEvent.layout.height - SURFACE_OVERLAP + SURFACE_PAD_TOP;
    },
    [contentTop],
  );

  const ctx = useMemo<DashboardScrollContext>(
    () => ({
      scrollY,
      collapseProgress,
      pageProgress,
      viewportHeight,
      contentTop,
      scrollToTop,
      reduceMotion,
    }),
    [scrollY, collapseProgress, pageProgress, viewportHeight, contentTop, scrollToTop, reduceMotion],
  );

  const clearance = dockInset + 24;
  const statusBarStyle = colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content';

  return (
    <ScrollCtx.Provider value={ctx}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={statusBarStyle} translucent backgroundColor="transparent" />

        <Animated.ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          style={{ backgroundColor: colors.background }}
          onLayout={(e) => {
            viewportHeight.value = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(_, h) => {
            contentHeight.value = h;
          }}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {/* Hero + navy cap: pulling down past the top keeps showing hero colour, never the page. */}
          <View
            onLayout={onHeroLayout}
            style={[styles.heroWrap, { backgroundColor: colors.primary }]}
          >
            <View pointerEvents="none" style={[styles.heroCap, { backgroundColor: colors.primary }]} />
            {hero(ctx)}
          </View>

          {/* Visual-only squircle. No inner scroll. */}
          <SquircleSurface
            style={[
              styles.squircleSurface,
              { borderTopColor: colors.borderStrong, paddingBottom: clearance },
            ]}
            fill={colors.background}
          >
            <View
              style={[
                styles.contentColumn,
                { maxWidth: layout.columnWidth, paddingHorizontal: layout.gutter },
              ]}
            >
              {children}
            </View>
          </SquircleSurface>
        </Animated.ScrollView>

        {/* Pinned, full-width header (rendered after ScrollView so Android touches are dispatched on top) */}
        {header(ctx)}

        {showTop ? (
          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.springify().damping(16)}
            exiting={reduceMotion ? undefined : ZoomOut.duration(140)}
            style={[styles.topPill, { bottom: dockInset + 12 }]}
          >
            <PressableScale
              onPress={scrollToTop}
              accessibilityRole="button"
              accessibilityLabel="Back to top"
              style={[styles.topBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="arrow-up" size={18} color={colors.onPrimary} />
            </PressableScale>
          </Animated.View>
        ) : null}
      </View>
    </ScrollCtx.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  scrollContent: { flexGrow: 1 },
  heroWrap: { width: '100%', zIndex: 0 },
  heroCap: { position: 'absolute', left: 0, right: 0, top: -1200, height: 1200 },
  squircleSurface: {
    width: '100%',
    marginTop: -SURFACE_OVERLAP,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: SURFACE_PAD_TOP,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  contentColumn: { alignSelf: 'center', width: '100%' },
  topPill: { position: 'absolute', right: 16, zIndex: 50 },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});
