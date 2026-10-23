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
  women_health: [
    'Sacred Cycle & Hormonal Rhythm',
    'Follicular Energy & Vitality',
    'Ovulatory Glow & Confidence',
    'Luteal PMS & Mood Harmony',
    'Gentle Menstrual Comfort',
    'Restful Deep Sleep',
    'Pelvic Core Balance',
    'Mindful Nourishment',
  ],
  men_health: [
    'Desk Worker Spine Decompression',
    'Hip Mobility & Longevity',
    'Functional Strength Without Strain',
    'Athletic Stamina & Endurance',
    'Deep Stress Decompression',
    'Daily Discipline & Consistency',
    'Restorative Sleep & Recovery',
    'Focus & Cognitive Clarity',
  ],
  pride_wellbeing: [
    'Affirming Self-Care',
    'Chest & Posture Tension Relief',
    'Safe Grounding & Body Respect',
    'Somatic Breathwork & Calm',
    'Emotional Resilience',
    'Consistent Daily Rituals',
  ],
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
