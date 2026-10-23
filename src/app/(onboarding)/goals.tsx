import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Chip } from '../../components/ui/Chip';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { ProductExperience } from '../../theme/tokens';

// Plain goals; each one steers which kinds of quests come first (see GOAL_FAMILIES).
const SHARED_GOALS = [
  'More energy',
  'Better sleep',
  'Less stress',
  'Move more',
  'Mobility and posture',
  'Steady daily habits',
  'Emotional support',
  'Eat well',
  'Learn about my health',
];

const GOALS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: ['Understand my cycle', 'Period comfort', 'PMS and mood'],
  men_health: ['Strength training', 'Desk-work aches', 'Focus'],
  pride_wellbeing: ['Affirming self-care', 'Body ease'],
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
      subtitle="Pick any that fit. Your daily quests start with these; change them any time."
      primaryLabel={goals.length ? 'Continue' : 'Continue without choosing'}
      onPrimary={next}
      onSkip={next}
    >
      <View style={styles.chips}>
        {[...GOALS_BY_EXPERIENCE[experience], ...SHARED_GOALS].map((goal) => (
          <Chip key={goal} label={goal} selected={goals.includes(goal)} onPress={() => toggle(goal)} />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
