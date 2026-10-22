import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Chip } from '../../components/ui/Chip';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { OnboardingAnswers } from '../../stores/slices/appSlice';
import { useTheme } from '../../theme/useTheme';
import { ProductExperience } from '../../theme/tokens';

const SHARED_CONSTRAINTS = [
  'Lower back',
  'Knees or joints',
  'Wrists or shoulders',
  'Recovering / low energy',
  'Mostly sitting all day',
  'Low impact only',
];

const CONSTRAINTS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: [
    ...SHARED_CONSTRAINTS,
    'Pelvic floor & sacrum',
    'Cramps / sensitive phase',
  ],
  men_health: [
    ...SHARED_CONSTRAINTS,
    'Tight hips / groin',
    'Hamstrings & calves',
    'Neck / upper spine',
  ],
  pride_wellbeing: [
    ...SHARED_CONSTRAINTS,
    'Chest / posture strain',
    'Neck / upper back tension',
  ],
};

const LENGTHS: { value: NonNullable<OnboardingAnswers['routineMinutes']>; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
];

export default function ActivityConstraintsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const experience = useRootStore((s) => s.experience);
  const { constraints, routineMinutes, setOnboardingAnswers } = useRootStore(
    useShallow((s) => ({
      constraints: s.onboarding.constraints,
      routineMinutes: s.onboarding.routineMinutes,
      setOnboardingAnswers: s.setOnboardingAnswers,
    })),
  );

  const activeConstraints = CONSTRAINTS_BY_EXPERIENCE[experience] ?? SHARED_CONSTRAINTS;

  const toggle = (c: string) =>
    setOnboardingAnswers({
      constraints: constraints.includes(c) ? constraints.filter((x) => x !== c) : [...constraints, c],
    });
  const next = () => router.push('/(onboarding)/lifestyle-preferences');

  return (
    <OnboardingScaffold
      step="activity-constraints"
      title="Anything we should go easy on?"
      subtitle="We'll leave out movements that don't suit you. Skip if nothing applies."
      primaryLabel="Continue"
      onPrimary={next}
      onSkip={next}
    >
      <View style={styles.chips}>
        {activeConstraints.map((c) => (
          <Chip key={c} label={c} selected={constraints.includes(c)} onPress={() => toggle(c)} />
        ))}
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl }]}>
        How long can a daily routine be?
      </Text>
      <View style={[styles.segment, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
        {LENGTHS.map((l) => {
          const selected = routineMinutes === l.value;
          return (
            <Pressable
              key={l.value}
              onPress={() => setOnboardingAnswers({ routineMinutes: selected ? null : l.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.segmentItem,
                selected && { backgroundColor: colors.surface, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  typography.subbodyBold,
                  { color: selected ? colors.primary : colors.text.secondary },
                ]}
              >
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
});
