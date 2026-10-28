import React, { type ReactNode } from 'react';
import { Platform, StatusBar, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useLayout } from '../../theme/layout';
import { useTheme } from '../../theme/useTheme';
import { useTabBarInset } from '../navigation/CustomTabBar';
import { updateDockOnScroll, useShowChromeOnFocus } from '../navigation/useScrollAwareDock';

export const DASHBOARD_COLLAPSE_DISTANCE = 130;
/** How far the content surface overlaps the bottom of the hero. */
export const SURFACE_OVERLAP = 28;

export interface DashboardScrollContext {
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
  pageProgress: SharedValue<number>;
  scrollToTop: () => void;
}

export interface DashboardScreenContainerProps {
  children: ReactNode;
  header: (ctx: DashboardScrollContext) => ReactNode;
  hero: (ctx: DashboardScrollContext) => ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Pinned header + ONE vertical scroll (hero + content surface).
 *
 * Crash-safety rules this file follows:
 * - The scroll handler only writes one shared value and forwards to the dock. No React state,
 *   no runOnJS, no per-frame layout work.
 * - The content surface is a visual squircle container: no nested vertical scroll views.
 * - Parallax and header collapse run strictly on UI thread via Reanimated worklets.
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

  const scrollToTop = React.useCallback(() => {
    (scrollRef.current as unknown as { scrollTo?: (opts: { y: number; animated: boolean }) => void } | null)?.scrollTo?.({
      y: 0,
      animated: true,
    });
  }, [scrollRef]);

  const ctx: DashboardScrollContext = { scrollY, collapseProgress, pageProgress, scrollToTop };
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
        {/* Hero sits on a primary block that also extends above it, so pulling down on iOS
            keeps showing hero colour instead of the page. */}
        <View style={[styles.heroWrap, { backgroundColor: colors.primary }]}>
          <View pointerEvents="none" style={[styles.heroCap, { backgroundColor: colors.primary }]} />
          {hero(ctx)}
        </View>

        {/* Visual-only surface. Plain View, no clipping, no shadow. */}
        <View
          style={[
            styles.surface,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: dockInset + 24,
            },
          ]}
        >
          <View
            style={[
              styles.column,
              { maxWidth: layout.columnWidth, paddingHorizontal: layout.gutter },
            ]}
          >
            {children}
          </View>
        </View>
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
    paddingTop: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 2,
    elevation: 4,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  column: { alignSelf: 'center', width: '100%' },
});
