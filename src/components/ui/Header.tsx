import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import * as Haptics from 'expo-haptics';

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
 * At rest: shows uppercase eyebrow / mascot / back button.
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

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
          <PressableScale
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.surface1 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            scaleTo={0.92}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </PressableScale>
        ) : null}

        <View style={styles.centerSlot}>
          {eyebrow ? (
            <Animated.Text
              style={[
                typography.label,
                { color: colors.primary, letterSpacing: 0.9 },
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
              { color: colors.text.primary },
              animatedTitleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        </View>

        {rightAction ? <View style={styles.rightSlot}>{rightAction}</View> : <View style={styles.emptySlot} />}
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
  showBack = false,
  rightAction,
  style,
}) => {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }, style]}>
      <View style={styles.leftRow}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface1, marginRight: spacing.sm },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
        )}
        <View style={styles.titleCol}>
          <Text style={[typography.heading, { color: colors.text.primary }]}>{title}</Text>
          {subtitle && (
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
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
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  fixedBar: {
    width: '100%',
    zIndex: 10,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  centerSlot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  titleCol: {
    flex: 1,
  },
  rightSlot: {
    marginLeft: 12,
  },
  emptySlot: {
    width: 36,
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
