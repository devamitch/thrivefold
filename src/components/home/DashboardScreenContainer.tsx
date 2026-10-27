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

import { useLayout } from '../../theme/layout';
import { useTheme } from '../../theme/useTheme';
import { useTabBarInset } from '../navigation/CustomTabBar';
import { updateDockOnScroll, useShowChromeOnFocus } from '../navigation/useScrollAwareDock';
import { SquircleSurface } from '../ui';

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

  const statusBarStyle = colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content';

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle={statusBarStyle} translucent backgroundColor="transparent" />

      {/* Pinned Conventional Dashboard Header */}
      {header(scrollCtx)}

      {/* Single Authoritative Vertical Scroll Surface */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        {/* Full-width Vitality Hero with natural document scrolling */}
        {hero(scrollCtx)}

        {/* Layered Squircle Dashboard Surface (overlaps bottom of hero) */}
        <SquircleSurface
          style={[
            styles.squircleSurface,
            {
              borderTopColor: colors.borderStrong,
              paddingBottom: clearance,
            },
          ]}
          fill={colors.background}
        >
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
        </SquircleSurface>
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
    marginTop: -28,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 18,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  contentColumn: {
    alignSelf: 'center',
    width: '100%',
  },
});
