import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Chip } from '../../components/ui/Chip';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { ProductExperience } from '../../theme/tokens';

const SHARED_GOALS = [
  'More energy',
  'Better sleep',
  'Less stress',
  'Gentle movement',
  'Mobility & posture',
  'Daily habits',
  'Emotional support',
  'Learning about my body',
];

const GOALS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: ['Cycle & reproductive health', ...SHARED_GOALS],
  men_health: ['Strength without strain', ...SHARED_GOALS],
  pride_wellbeing: ['Affirming self-care', ...SHARED_GOALS],
};

export default function GoalsScreen() {
  const router = useRouter();
  const { experience, goals, setOnboardingAnswers } = useRootStore(
    useShallow((s) => ({
      experience: s.experience,
      goals: s.onboarding.goals,
      setOnboardingAnswers: s.setOnboardingAnswers,
    })),
  );

  const toggle = (goal: string) =>
    setOnboardingAnswers({
      goals: goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal],
    });
  const next = () => router.push('/(onboarding)/activity-constraints');

  return (
    <OnboardingScaffold
      step="goals"
      title="What would you like help with?"
      subtitle="Pick any that fit. This shapes your daily suggestions — change it any time."
      primaryLabel={goals.length ? 'Continue' : 'Continue without choosing'}
      onPrimary={next}
      onSkip={next}
    >
      <View style={styles.chips}>
        {GOALS_BY_EXPERIENCE[experience].map((goal) => (
          <Chip key={goal} label={goal} selected={goals.includes(goal)} onPress={() => toggle(goal)} />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
