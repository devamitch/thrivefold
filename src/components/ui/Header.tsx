import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { HeaderBackButton } from './AppHeader';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollY?: SharedValue<number>;
}

/**
 * SanctuaryHeader: Neev Apple Large Title fixed header bar.
 * Pinned at top under safe-area insets.
 * At rest: shows uppercase eyebrow / back button.
 * On scroll: eyebrow dissolves, compact title slides into view.
 * Zero borders, zero shadows.
 */
export const SanctuaryHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  rightAction,
  style,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();



  const animatedEyebrowStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const y = scrollY.value;
    const opacity = interpolate(y, [15, 65], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(y, [15, 65], [0, -8], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 1 };
    const y = scrollY.value;
    const opacity = interpolate(y, [35, 80], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(y, [35, 80], [8, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View
      style={[
        styles.fixedBar,
        {
          paddingTop: insets.top + spacing.xs,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.base,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <View style={styles.barRow}>
        {showBack ? (
          <HeaderBackButton />
        ) : null}

        <View style={[styles.centerSlot, showBack ? { paddingLeft: 8 } : { paddingLeft: 0 }]}>
          {eyebrow ? (
            <Animated.Text
              style={[
                typography.label,
                { color: colors.primary, letterSpacing: 0.9, textAlign: 'left' },
                animatedEyebrowStyle,
              ]}
              numberOfLines={1}
            >
              {eyebrow}
            </Animated.Text>
          ) : null}

          <Animated.Text
            style={[
              typography.subheading,
              { color: colors.text.primary, textAlign: 'left' },
              animatedTitleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        </View>

        {rightAction ? (
          <View style={styles.rightSlot}>{rightAction}</View>
        ) : showBack ? (
          <View style={styles.emptySlot} />
        ) : null}
      </View>
    </View>
  );
};

export interface SanctuaryLargeTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * SanctuaryLargeTitle: Rendered as the grand opening title inside the scroll view.
 * 32pt Fraunces / SpaceMono title with serene subtitle.
 */
export const SanctuaryLargeTitle: React.FC<SanctuaryLargeTitleProps> = ({
  title,
  subtitle,
  eyebrow,
  rightAction,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.largeTitleContainer, { paddingHorizontal: spacing.base, marginBottom: spacing.md }, style]}>
      <View style={styles.largeTitleRow}>
        <View style={styles.flex}>
          {eyebrow ? (
            <Text style={[typography.label, { color: colors.primary, marginBottom: spacing.xxs }]}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={[typography.display, { color: colors.text.primary }]} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View style={styles.largeRightAction}>{rightAction}</View> : null}
      </View>
    </View>
  );
};

/**
 * Standard Header component (backward compatible, now styled with Neev zero-shadow aesthetics).
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  rightAction,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.base,
          paddingTop: Math.max(insets.top, 8) + 4,
          paddingBottom: spacing.sm,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <HeaderBackButton />
        )}
        <View style={[styles.titleCol, showBack && { marginLeft: spacing.sm }]}>
          {eyebrow ? (
            <Text
              style={[
                typography.label,
                { color: colors.primary, fontSize: 10, letterSpacing: 0.8, marginBottom: 1 },
              ]}
              numberOfLines={1}
            >
              {eyebrow.toUpperCase()}
            </Text>
          ) : null}
          <Text style={[typography.heading, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightAction && <View style={styles.rightSlot}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  fixedBar: {
    width: '100%',
    zIndex: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  centerSlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleCol: {
    flex: 1,
  },
  rightSlot: {
    marginLeft: 12,
  },
  emptySlot: {
    minWidth: 40,
  },
  largeTitleContainer: {
    width: '100%',
    paddingTop: 8,
  },
  largeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  largeRightAction: {
    marginLeft: 12,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
});

export default Header;
