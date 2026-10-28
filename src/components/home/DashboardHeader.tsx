import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../ui/Avatar';
import { PressableScale } from '../ui/PressableScale';

export const COMPACT_HEADER_CONTENT_HEIGHT = 52;

export interface DashboardHeaderProps {
  title?: string;
  /** One short line of today's status, e.g. "10 of 18 pts · Level 5". */
  subtitle?: string;
  userName?: string | null;
  userPhotoUrl?: string | null;
  onMenuPress: () => void;
  onTitlePress?: () => void;
  /** 0 → 1 as the sheet approaches its dock point; tied to the scroll, so it never lags. */
  titleProgress: SharedValue<number>;
  visible: boolean;
}

/**
 * The compact Home header's content. Its band and the sheet's docked corners are drawn by the
 * container; this only brings the title and avatar in, following the scroll position exactly.
 */
export function DashboardHeader({
  title = 'Today',
  subtitle,
  userName,
  userPhotoUrl,
  onMenuPress,
  onTitlePress,
  titleProgress,
  visible,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const reveal = useAnimatedStyle(() => ({
    opacity: titleProgress.value,
    transform: [{ translateY: (1 - titleProgress.value) * 8 }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[styles.container, { top: insets.top }, reveal]}
    >
      <PressableScale
        onPress={onTitlePress}
        scaleTo={0.98}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}. Scroll to top`}
        style={styles.titleBlock}
      >
        <Text numberOfLines={1} style={[typography.subheading, { color: colors.onPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[typography.caption, styles.subtitle, { color: colors.onPrimaryMuted }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </PressableScale>

      <PressableScale
        onPress={onMenuPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${userName || 'Your'} profile. Open menu`}
        style={styles.avatarHit}
      >
        <Avatar
          photoUrl={userPhotoUrl}
          name={userName}
          size={34}
          fill={colors.onPrimarySurface}
          ink={colors.onPrimary}
        />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleBlock: { flex: 1, flexDirection: 'row', alignItems: 'baseline', marginRight: 12 },
  subtitle: { marginLeft: 10, flexShrink: 1 },
  avatarHit: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
});
