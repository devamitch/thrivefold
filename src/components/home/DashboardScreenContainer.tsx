import React, { type ReactNode } from 'react';
import { StatusBar, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '../navigation/CustomTabBar';
import {
  updateDockOnScroll,
  useShowChromeOnFocus,
} from '../navigation/useScrollAwareDock';
import { useLayout } from '../../theme/layout';
import { useTheme } from '../../theme/useTheme';

export const DASHBOARD_COLLAPSE_DISTANCE = 130;

export interface DashboardScrollContext {
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Purpose-Built Dashboard Screen Architecture:
 * - Single authoritative vertical scroll owner (Animated.ScrollView).
 * - Continuous Reanimated scroll progress driving header collapse and hero parallax.
 * - Scroll-aware bottom dock hide/show integration (preserves Thrivefold dock aware behavior).
 * - Safe area aware (transparent status bar, edge-to-edge hero, tab bar clearance).
 * - High-performance UI-thread transforms with zero per-frame React state updates.
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

  // Ensures bottom dock chrome is visible whenever the screen gains focus
  useShowChromeOnFocus();

  const scrollY = useSharedValue(0);
  const lastY = useSharedValue(0);

  const collapseProgress = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, DASHBOARD_COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!reduceMotion) {
        updateDockOnScroll(e.contentOffset.y, lastY);
      }
    },
  });

  const clearance = dockInset + 24;
  const scrollCtx: DashboardScrollContext = { scrollY, collapseProgress };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pinned Sticky Dashboard Header (fades in as hero collapses) */}
      {header(scrollCtx)}

      {/* Single Authoritative Vertical Scroll Surface */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
        ]}
      >
        {/* Full-width Vitality Hero with scroll-linked parallax */}
        {hero(scrollCtx)}

        {/* Layered Squircle Dashboard Surface (overlaps bottom of hero) */}
        <View
          style={[
            styles.squircleSurface,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: clearance,
            },
          ]}
        >
          {/* Subtle bottom-sheet style top handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.surface2 }]} />
          </View>

          {/* Dashboard Content Container */}
          <View
            style={[
              styles.contentColumn,
              {
                maxWidth: layout.columnWidth,
                paddingHorizontal: layout.gutter,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  squircleSurface: {
    width: '100%',
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  contentColumn: {
    alignSelf: 'center',
    width: '100%',
  },
});
