import { SquircleSurface } from '../ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { hapticSuccess } from '../../services/haptics';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setupLedgerKey, setupReward, SETUP_XP_TOTAL, type SetupSection } from '../../domain/game/setupProfile';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';

/** The short, linear onboarding (master spec §3.3). Everything else is optional later. */
export const ONBOARDING_STEPS = [
  'choose-experience',
  'privacy-choices',
  'goals',
  'baseline',
  'activity-constraints',
  'lifestyle-preferences',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
const OPTIONAL_STEPS: OnboardingStep[] = ['goals', 'baseline', 'activity-constraints', 'lifestyle-preferences'];

interface OnboardingScaffoldProps {
  step: OnboardingStep;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Shown as a quiet "Skip" in the top bar when the step is optional. */
  onSkip?: () => void;
  /** Setup step whose fixed XP is awarded when the person continues having answered it. */
  reward?: SetupSection;
}

/**
 * One layout for every onboarding step: progress + back + skip on top, an editorial
 * title, scrollable content, and the primary action pinned above the safe area so it
 * never scrolls out of reach. Records the step so a closed app resumes here.
 */
export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onSkip,
  reward,
}: OnboardingScaffoldProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const setOnboardingStep = useRootStore((s) => s.setOnboardingStep);
  const index = ONBOARDING_STEPS.indexOf(step);
  const reduceMotion = useReducedMotion();
  const { setupXp, level, claimed, claimSetupReward } = useRootStore(
    useShallow((s) => ({
      setupXp: s.rewardLedger.filter((e) => e.kind === 'setup_reward').reduce((sum, e) => sum + e.xp, 0),
      level: s.level,
      claimed: reward ? s.rewardLedger.some((e) => e.key === setupLedgerKey(reward)) : false,
      claimSetupReward: s.claimSetupReward,
    })),
  );
  const stepReward = reward ? setupReward(reward) : null;

  const continueStep = () => {
    onPrimary();
    if (reward && claimSetupReward(reward).awarded) {
      hapticSuccess();
    }
  };

  useEffect(() => {
    setOnboardingStep(step);
  }, [setOnboardingStep, step]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
        {index > 0 ? (
          <PressableScale
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.topButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </PressableScale>
        ) : (
          <View style={styles.topButton} />
        )}
        <View
          style={styles.progress}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${ONBOARDING_STEPS.length}`}
        >
          {ONBOARDING_STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: i <= index ? colors.primary : colors.surface1 },
              ]}
            />
          ))}
        </View>
        {onSkip ? (
          <PressableScale
            onPress={onSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip this step"
            style={[styles.topButton, styles.skip]}
          >
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>Skip</Text>
          </PressableScale>
        ) : (
          <View style={styles.topButton} />
        )}
      </View>

      {setupXp > 0 || stepReward ? (
        <View style={[styles.xpRow, { paddingHorizontal: spacing.base }]}>
          <Animated.View
            key={setupXp}
            entering={reduceMotion ? undefined : FadeIn.duration(200)}
            style={[styles.xpPill, { backgroundColor: colors.primaryAlpha }]}
            accessibilityLabel={`Level ${level}, ${setupXp} of ${SETUP_XP_TOTAL} setup XP earned`}
          >
            <Ionicons name="trophy-outline" size={14} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
              Level {level} · {setupXp} XP
            </Text>
          </Animated.View>
          {stepReward ? (
            <Text style={[typography.caption, { color: claimed ? colors.text.muted : colors.text.secondary, marginLeft: 10 }]}>
              {claimed ? `Earned ${stepReward.xp} XP here` : `+${stepReward.xp} XP for answering`}
            </Text>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[typography.display, styles.title, { color: colors.text.primary }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.body, styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.base,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Button label={primaryLabel} onPress={continueStep} disabled={primaryDisabled} size="lg" />
        {/* The optional steps after the space can all be answered later; Home asks gradually. */}
        {OPTIONAL_STEPS.includes(step) ? (
          <Button label="Finish later" variant="ghost" onPress={() => router.replace('/(onboarding)/complete')} style={{ marginTop: 4 }} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { paddingTop: 14 },
  progress: { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' },
  progressDot: { borderRadius: 2, height: 4, maxWidth: 36, flex: 1 },
  root: { flex: 1 },
  skip: { alignItems: 'flex-end' },
  subtitle: { marginBottom: 24, marginTop: 8 },
  title: { marginTop: 12 },
  topBar: { alignItems: 'center', flexDirection: 'row', height: 52 },
  topButton: { justifyContent: 'center', minHeight: 44, width: 56 },
  xpPill: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5 },
  xpRow: { alignItems: 'center', flexDirection: 'row', marginTop: 4 },
});
