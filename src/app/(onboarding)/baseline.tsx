import { SquircleSurface } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { BaselineQuestions } from '../../components/onboarding/BaselineQuestions';
import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Card } from '../../components/ui/Card';
import { fitFor } from '../../domain/game/setupProfile';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

/**
 * Where the person is today, in four taps. The answers only shape quest length, difficulty
 * and kind (setupProfile.fitFor); every question has "Prefer not to say", and the XP for
 * this step is the same whatever is chosen.
 */
export default function BaselineScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const onboarding = useRootStore((s) => s.onboarding);
  const claimSetupReward = useRootStore((s) => s.claimSetupReward);
  const setOnboardingAnswers = useRootStore((s) => s.setOnboardingAnswers);
  const fit = fitFor(onboarding);
  const next = () => router.push('/(onboarding)/activity-constraints');

  return (
    <OnboardingScaffold
      step="baseline"
      reward="body_baseline"
      title="Where are you today?"
      subtitle="Four quick taps so your quests start at the right size. Change them any time from You."
      primaryLabel="Continue"
      onPrimary={() => {
        const b = onboarding.baseline;
        setOnboardingAnswers({
          baseline: {
            activity: b.activity ?? 'prefer_not',
            energy: b.energy ?? 'prefer_not',
            sleep: b.sleep ?? 'prefer_not',
            stress: b.stress ?? 'prefer_not',
          },
        });
        // The body and mind halves are separate setup steps; the scaffold claims the first.
        claimSetupReward('mind_baseline');
        next();
      }}
      onSkip={next}
    >
      <BaselineQuestions />
      {fit.reasons.length > 0 ? (
        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          <SquircleSurface style={styles.row}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              How your quests will fit
            </Text>
          </SquircleSurface>
          {fit.reasons.map((r) => (
            <Text
              key={r}
              style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}
            >
              {r}
            </Text>
          ))}
        </Card>
      ) : null}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row' },
});
