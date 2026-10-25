import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Chip } from '../../components/ui/Chip';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { goalsFor } from '../../domain/onboarding/options';

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
  const next = () => {
    if (goals.length === 0) {
      setOnboardingAnswers({ goals: ['Steady daily habits'] });
    }
    router.push('/(onboarding)/baseline');
  };

  return (
    <OnboardingScaffold
      step="goals"
      reward="goals"
      title="What would you like help with?"
      subtitle="Pick any that fit. Your daily quests start with these; change them any time."
      primaryLabel={goals.length ? 'Continue' : 'Continue without choosing'}
      onPrimary={next}
      onSkip={next}
    >
      <View style={styles.chips}>
        {goalsFor(experience).map((goal) => (
          <Chip key={goal} label={goal} selected={goals.includes(goal)} onPress={() => toggle(goal)} />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
