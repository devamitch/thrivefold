import React, { type ReactNode } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLayout } from '../../theme/layout';
import { useTheme } from '../../theme/useTheme';
import { useTabBarInset } from '../navigation/CustomTabBar';
import { updateDockOnScroll, useShowChromeOnFocus } from '../navigation/useScrollAwareDock';
import { COMPACT_HEADER_CONTENT_HEIGHT } from './DashboardHeader';

export const DASHBOARD_COLLAPSE_DISTANCE = 140;
/** How far the content surface overlaps the bottom of the hero. */
export const SURFACE_OVERLAP = 28;

export interface DashboardScrollContext {
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
  pageProgress: SharedValue<number>;
  dockDistance: SharedValue<number>;
  scrollToTop: () => void;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Pinned header + ONE vertical scroll (hero + docked squircle surface with inner translateY).
 *
 * Silky Parallax & Docking Architecture:
 * - Single authoritative vertical scroll owner (Animated.ScrollView).
 * - As user scrolls down, hero moves with smooth parallax while squircle sheet slides up.
 * - When the top of the squircle sheet reaches the app header, the sheet frame STOPS and docks cleanly!
 * - Inner content continues scrolling with inner translateY at 1:1 speed, clipped by the squircle top corners.
 * - Flat, clean squircle styling with zero unnecessary shadows.
 */
export function DashboardScreenContainer({
  children,
  header,
  hero,
  contentContainerStyle,
}: DashboardScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dockInset = useTabBarInset();
  const layout = useLayout();
  const reduceMotion = useReducedMotion();
  useShowChromeOnFocus();

  const headerHeight = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;
  const heroHeight = useSharedValue(300);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const lastY = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const dockDistance = useDerivedValue(() => {
    return Math.max(10, heroHeight.value - SURFACE_OVERLAP - headerHeight);
  });

  const collapseProgress = useDerivedValue(() => {
    const d = dockDistance.value > 0 ? dockDistance.value : DASHBOARD_COLLAPSE_DISTANCE;
    return interpolate(scrollY.value, [0, d], [0, 1], Extrapolation.CLAMP);
  });

  const pageProgress = useDerivedValue(() => {
    const range = contentHeight.value - viewportHeight.value;
    return range > 0 ? Math.min(1, Math.max(0, scrollY.value / range)) : 0;
  });

  // Docking worklet: when scrollY reaches dockDistance, sheet container freezes visually at headerHeight
  const sheetContainerAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const d = dockDistance.value;
    const delta = Math.max(0, scrollY.value - d);
    return {
      transform: [{ translateY: delta }],
    };
  });

  // Inner content worklet: counters the container freeze so inner cards continue scrolling at 1:1 speed
  const innerContentAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const d = dockDistance.value;
    const delta = Math.max(0, scrollY.value - d);
    return {
      transform: [{ translateY: -delta }],
    };
  });

  // Handle bar smoothly fades out as inner cards scroll past the dock line
  const handleAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const d = dockDistance.value;
    return {
      opacity: interpolate(scrollY.value, [d, d + 36], [1, 0], Extrapolation.CLAMP),
    };
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!reduceMotion) updateDockOnScroll(e.contentOffset.y, lastY);
    },
  });

  const scrollToTop = React.useCallback(() => {
    (
      scrollRef.current as unknown as {
        scrollTo?: (opts: { y: number; animated: boolean }) => void;
      } | null
    )?.scrollTo?.({
      y: 0,
      animated: true,
    });
  }, [scrollRef]);

  const ctx: DashboardScrollContext = {
    scrollY,
    collapseProgress,
    pageProgress,
    dockDistance,
    scrollToTop,
  };
  const statusBarStyle = colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={statusBarStyle} translucent backgroundColor="transparent" />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={{ backgroundColor: colors.background }}
        onLayout={(e) => {
          viewportHeight.value = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, h) => {
          contentHeight.value = h;
        }}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        {/* Hero sits on a primary block extending above it for safe pulling */}
        <View
          style={[styles.heroWrap, { backgroundColor: colors.primary }]}
          onLayout={(e) => {
            heroHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <View
            pointerEvents="none"
            style={[styles.heroCap, { backgroundColor: colors.primary }]}
          />
          {hero(ctx)}
        </View>

        {/* Docked Squircle Content Surface */}
        <Animated.View
          style={[
            styles.surface,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
            sheetContainerAnimStyle,
          ]}
        >
          {/* Subtle bottom-sheet style top handle */}
          <Animated.View style={[styles.handleContainer, handleAnimStyle]}>
            <View style={[styles.handleBar, { backgroundColor: colors.surface2 }]} />
          </Animated.View>

          {/* Inner scrolling content driven by inner translateY */}
          <Animated.View
            style={[
              styles.column,
              {
                maxWidth: layout.columnWidth,
                paddingHorizontal: layout.gutter,
                paddingBottom: dockInset + 44,
              },
              innerContentAnimStyle,
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Render header after scrollview so Android touches reliably dispatch to header buttons */}
      {header(ctx)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  heroWrap: {
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  heroCap: { position: 'absolute', left: 0, right: 0, top: -1000, height: 1000 },
  surface: {
    width: '100%',
    marginTop: -SURFACE_OVERLAP,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    zIndex: 2,
    elevation: 0,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 0,
    borderRadius: 2,
  },
  column: { alignSelf: 'center', width: '100%' },
});
