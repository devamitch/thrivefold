import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hapticLight } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';

export interface DashboardHeaderProps {
  title: string;
  userName?: string;
  badgeText?: string;
  onMenuPress: () => void;
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

export const COMPACT_HEADER_CONTENT_HEIGHT = 52;

/**
 * Pinned Dashboard Header:
 * - Conventional, full-width app header pinned at top behind transparent status bar.
 * - Solid primary background so content scrolling underneath never bleeds through.
 * - Brand title ("Thrivefold") at top -> transitions cleanly to compact user title ("Aria") as hero scrolls.
 * - Status badge and menu drawer toggle remain stably pinned throughout all dashboard sections.
 * - Glitch-free, zero unnecessary scaling or layout jumps for absolute visual stability.
 */
export function DashboardHeader({
  title,
  userName,
  badgeText,
  onMenuPress,
  scrollY,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;

  const compactTitle = userName && userName !== title ? userName : null;

  const headerBorderAnim = useAnimatedStyle(() => {
    const borderProgress = interpolate(scrollY.value, [0, 20], [0, 1], Extrapolation.CLAMP);
    return {
      borderBottomColor: borderProgress > 0.5 ? colors.onPrimarySurface : 'transparent',
    };
  });

  const brandAnimStyle = useAnimatedStyle(() => {
    if (!compactTitle) return { opacity: 1 };
    const opacity = interpolate(scrollY.value, [40, 85], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [40, 85], [0, -4], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const compactAnimStyle = useAnimatedStyle(() => {
    if (!compactTitle) return { opacity: 0 };
    const opacity = interpolate(scrollY.value, [55, 95], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [55, 95], [4, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          height: headerHeight,
          paddingTop: insets.top,
          backgroundColor: colors.primary,
        },
        headerBorderAnim,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleStack}>
            <Animated.Text
              style={[
                typography.bodyBold,
                styles.headerTitle,
                { color: colors.onPrimary },
                brandAnimStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
            {compactTitle ? (
              <Animated.Text
                style={[
                  typography.bodyBold,
                  styles.headerTitle,
                  styles.absoluteTitle,
                  { color: colors.onPrimary },
                  compactAnimStyle,
                ]}
                numberOfLines={1}
              >
                {compactTitle}
              </Animated.Text>
            ) : null}
          </View>
          {badgeText ? (
            <View style={[styles.badge, { backgroundColor: colors.onPrimarySurface }]}>
              <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: '700' }}>
                {badgeText}
              </Text>
            </View>
          ) : null}
        </View>

        <PressableScale
          onPress={() => {
            hapticLight();
            onMenuPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={[styles.menuBtn, { backgroundColor: colors.onPrimarySurface }]}
        >
          <Ionicons name="menu-outline" size={20} color={colors.onPrimary} />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  titleStack: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    letterSpacing: -0.3,
  },
  absoluteTitle: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
