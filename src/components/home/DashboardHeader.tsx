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

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { hapticLight } from '../../services/haptics';

export interface DashboardHeaderProps {
  title: string;
  badgeText?: string;
  onMenuPress: () => void;
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

export const COMPACT_HEADER_CONTENT_HEIGHT = 52;

/**
 * Pinned Compact Dashboard Header:
 * - Seamlessly pinned at the top behind transparent status bar.
 * - Progressively revealed as the Vitality Hero collapses on scroll.
 * - Solid primary background so content scrolling underneath never bleeds through.
 * - Houses compact title, level/points status badge, and menu drawer toggle.
 */
export function DashboardHeader({
  title,
  badgeText,
  onMenuPress,
  collapseProgress,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;

  const headerAnimStyle = useAnimatedStyle(() => {
    const progress = collapseProgress.value;
    const opacity = interpolate(progress, [0.35, 0.85], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(progress, [0.35, 0.85], [-8, 0], Extrapolation.CLAMP);

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
          borderBottomColor: colors.onPrimarySurface,
        },
        headerAnimStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[typography.bodyBold, { color: colors.onPrimary, fontSize: 16 }]}
            numberOfLines={1}
          >
            {title}
          </Text>
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
    borderBottomWidth: 1,
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
