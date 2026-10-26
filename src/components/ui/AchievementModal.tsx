/**
 * Thrivefold Achievement Celebration Modal
 * Serene, calm modal celebrating milestones:
 * - Daily Required Points Achievement (daily goal completed)
 * - Level Cleared (advancing to new level)
 * - Double Milestone (clearing both in a single go)
 * - Milestone Unlock: Direct Letter Exchange Unlocked (Level 20)
 *
 * Grounded editorial styling: SquircleSurface, Geist typography, Ionicons (NO sparkle icons, NO AI slop).
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Badge } from './Badge';
import { Button } from './Button';
import FrostedView from './FrostedView';
import { SquircleSurface } from './SquircleSurface';

const IN_ANIMATION = { duration: 280, easing: Easing.bezier(0.18, 0.89, 0.32, 1) };

export function AchievementModal() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const modal = useRootStore((s) => s.achievementModal);
  const hideAchievementModal = useRootStore((s) => s.hideAchievementModal);
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(0);
  const backdropShown = useSharedValue(0);

  useEffect(() => {
    if (modal) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      shown.value = 0;
      shown.value = withTiming(1, reduceMotion ? { duration: 0 } : IN_ANIMATION);

      backdropShown.value = 0;
      backdropShown.value = withTiming(1, reduceMotion ? { duration: 0 } : IN_ANIMATION);
    }
  }, [modal, reduceMotion, shown, backdropShown]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropShown.value }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ scale: 0.92 + shown.value * 0.08 }],
  }));

  if (!modal) return null;

  const handleDismiss = () => {
    modal.onDismiss?.();
    hideAchievementModal();
  };

  const handleOpenLetters = () => {
    hideAchievementModal();
    router.push('/(app)/letters' as Href);
  };

  // Determine icon & badge
  let iconName: keyof typeof Ionicons.glyphMap = 'flag-outline';
  let badgeLabel = 'MILESTONE ACHIEVED';
  let badgeVariant: 'primary' | 'neutral' | 'accent' = 'primary';
  let iconBgColor = colors.primaryAlpha;
  let iconColor = colors.primary;

  switch (modal.type) {
    case 'workout_complete':
      iconName = 'flame-outline';
      badgeLabel = 'WORKOUT COMPLETED';
      badgeVariant = 'primary';
      iconBgColor = colors.primaryAlpha;
      iconColor = colors.primary;
      break;
    case 'double_milestone':
      iconName = 'medal-outline';
      badgeLabel = 'DOUBLE MILESTONE';
      badgeVariant = 'primary';
      iconBgColor = colors.primaryAlpha;
      iconColor = colors.accent;
      break;
    case 'level_clear':
      iconName = 'trophy-outline';
      badgeLabel = 'LEVEL CLEAR';
      badgeVariant = 'primary';
      iconBgColor = colors.primaryAlpha;
      iconColor = colors.primary;
      break;
    case 'daily_goal':
      iconName = 'flag-outline';
      badgeLabel = 'DAILY TARGET ACHIEVED';
      badgeVariant = 'neutral';
      iconBgColor = colors.surface1;
      iconColor = colors.text.primary;
      break;
    case 'slow_letters_unlocked':
      iconName = 'mail-open-outline';
      badgeLabel = 'FEATURE UNLOCKED';
      badgeVariant = 'primary';
      iconBgColor = colors.primaryAlpha;
      iconColor = colors.primary;
      break;
  }

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      visible
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(10, 10, 10, 0.48)' },
            backdropStyle,
          ]}
        >
          <FrostedView tone="dark" tintOpacity={0.45} intensity={30} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleDismiss}
            accessibilityLabel="Dismiss"
          />
        </Animated.View>

        <Animated.View
          style={[styles.dialog, dialogStyle]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <FrostedView
            tone="surface"
            intensity={95}
            tintOpacity={Platform.OS === 'android' ? 0.92 : 0.82}
            style={[
              styles.content,
              {
                borderRadius: 28,
                borderColor: colors.border,
                borderWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={styles.center}>
              <SquircleSurface shape="circle" fill={iconBgColor} style={styles.iconCircle}>
                <Ionicons name={iconName} size={32} color={iconColor} />
              </SquircleSurface>
              <View style={{ marginTop: spacing.sm }}>
                <Badge label={badgeLabel} variant={badgeVariant} />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text
              style={[
                typography.heading,
                styles.title,
                { color: colors.text.primary, marginTop: spacing.md },
              ]}
            >
              {modal.title}
            </Text>
            <Text
              style={[
                typography.bodyBold,
                styles.subtitle,
                { color: colors.primary, marginTop: 4 },
              ]}
            >
              {modal.subtitle}
            </Text>

            {/* Achievement Detail Cards */}
            <View style={[styles.detailContainer, { marginTop: spacing.md }]}>
              {modal.type === 'double_milestone' ? (
                <>
                  <SquircleSurface radius={18} fill={colors.surface1} style={styles.statCard}>
                    <View style={styles.row}>
                      <SquircleSurface
                        shape="circle"
                        fill={colors.primaryAlpha}
                        style={styles.smallIcon}
                      >
                        <Ionicons name="trophy-outline" size={18} color={colors.primary} />
                      </SquircleSurface>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Level {modal.level ?? 1} Cleared
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          New milestone unlocked · +1 Diamond
                        </Text>
                      </View>
                    </View>
                  </SquircleSurface>

                  <SquircleSurface
                    radius={18}
                    fill={colors.surface1}
                    style={[styles.statCard, { marginTop: 8 }]}
                  >
                    <View style={styles.row}>
                      <SquircleSurface
                        shape="circle"
                        fill={colors.primaryAlpha}
                        style={styles.smallIcon}
                      >
                        <Ionicons name="flag-outline" size={18} color={colors.accent} />
                      </SquircleSurface>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Daily Target Reached
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          {modal.dailyPoints ?? 0} of {modal.dailyPointsTarget ?? 0} points · +1
                          Diamond
                        </Text>
                      </View>
                    </View>
                  </SquircleSurface>
                </>
              ) : modal.type === 'workout_complete' ? (
                <>
                  <SquircleSurface radius={18} fill={colors.surface1} style={styles.statCard}>
                    <View style={styles.row}>
                      <SquircleSurface
                        shape="circle"
                        fill={colors.primaryAlpha}
                        style={styles.smallIcon}
                      >
                        <Ionicons name="flame-outline" size={18} color={colors.primary} />
                      </SquircleSurface>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {modal.workoutSummary?.planTitle ?? 'Workout Session'}
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          +{modal.xpEarned ?? 0} XP earned · {modal.workoutSummary?.minutes ?? 1} min
                        </Text>
                      </View>
                    </View>
                  </SquircleSurface>
                  {modal.workoutSummary?.formScore !== undefined ? (
                    <SquircleSurface
                      radius={18}
                      fill={colors.surface1}
                      style={[styles.statCard, { marginTop: 8 }]}
                    >
                      <View style={styles.row}>
                        <SquircleSurface
                          shape="circle"
                          fill={colors.primaryAlpha}
                          style={styles.smallIcon}
                        >
                          <Ionicons name="scan-outline" size={18} color={colors.accent} />
                        </SquircleSurface>
                        <View style={styles.flex}>
                          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                            {Math.round(modal.workoutSummary.formScore * 100)}% Clean Form
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary }]}>
                            Camera-verified movement · High-precision tracking
                          </Text>
                        </View>
                      </View>
                    </SquircleSurface>
                  ) : null}
                </>
              ) : modal.type === 'level_clear' ? (
                <SquircleSurface radius={18} fill={colors.surface1} style={styles.statCard}>
                  <View style={styles.row}>
                    <SquircleSurface
                      shape="circle"
                      fill={colors.primaryAlpha}
                      style={styles.smallIcon}
                    >
                      <Ionicons name="trophy-outline" size={18} color={colors.primary} />
                    </SquircleSurface>
                    <View style={styles.flex}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        Level {modal.level ?? 1} Cleared
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary }]}>
                        Awarded +1 Diamond · Cumulative progress builds
                      </Text>
                    </View>
                  </View>
                </SquircleSurface>
              ) : modal.type === 'daily_goal' ? (
                <SquircleSurface radius={18} fill={colors.surface1} style={styles.statCard}>
                  <View style={styles.row}>
                    <SquircleSurface shape="circle" fill={colors.surface} style={styles.smallIcon}>
                      <Ionicons name="flag-outline" size={18} color={colors.primary} />
                    </SquircleSurface>
                    <View style={styles.flex}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {modal.dailyPoints ?? 0} Points Logged Today
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary }]}>
                        Daily target met · Awarded +1 Diamond
                      </Text>
                    </View>
                  </View>
                </SquircleSurface>
              ) : modal.type === 'slow_letters_unlocked' ? (
                <SquircleSurface radius={18} fill={colors.surface1} style={styles.statCard}>
                  <View style={styles.row}>
                    <SquircleSurface
                      shape="circle"
                      fill={colors.primaryAlpha}
                      style={styles.smallIcon}
                    >
                      <Ionicons name="mail-open-outline" size={18} color={colors.primary} />
                    </SquircleSurface>
                    <View style={styles.flex}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        Direct Correspondence Open
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary }]}>
                        Unhurried card correspondence between verified adults
                      </Text>
                    </View>
                  </View>
                </SquircleSurface>
              ) : null}

              {modal.details ? (
                <Text
                  style={[
                    typography.subbody,
                    styles.details,
                    { color: colors.text.secondary, marginTop: 10 },
                  ]}
                >
                  {modal.details}
                </Text>
              ) : null}
            </View>

            {/* Actions */}
            <View style={[styles.actions, { marginTop: spacing.lg }]}>
              {modal.unlockedFeature === 'letters' ? (
                <>
                  <Button
                    label="View Letterbox"
                    variant="primary"
                    style={styles.btn}
                    onPress={handleOpenLetters}
                    icon={<Ionicons name="mail-outline" size={16} color={colors.onPrimary} />}
                  />
                  <Button
                    label="Done"
                    variant="secondary"
                    style={[styles.btn, { marginTop: 8 }]}
                    onPress={handleDismiss}
                  />
                </>
              ) : (
                <Button
                  label="Continue"
                  variant="primary"
                  style={styles.btn}
                  onPress={handleDismiss}
                />
              )}
            </View>
          </FrostedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(10, 10, 10, 0.51)',
  },
  dialog: {
    maxWidth: 420,
    width: '100%',
  },
  content: {
    padding: 24,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  detailContainer: {
    width: '100%',
  },
  statCard: {
    padding: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  smallIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  details: {
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  btn: {
    width: '100%',
  },
});
