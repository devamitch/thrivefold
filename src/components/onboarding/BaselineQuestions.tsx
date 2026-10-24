import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Baseline } from '../../domain/game/setupProfile';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Chip } from '../ui/Chip';

type Question<K extends keyof Baseline> = {
  key: K;
  title: string;
  options: { value: NonNullable<Baseline[K]>; label: string }[];
};

const PREFER_NOT = { value: 'prefer_not', label: 'Prefer not to say' } as const;

const QUESTIONS = [
  {
    key: 'activity',
    title: 'How often do you move on purpose?',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'some_days', label: 'Some days' },
      { value: 'most_days', label: 'Most days' },
      { value: 'daily_training', label: 'I train daily' },
      PREFER_NOT,
    ],
  } satisfies Question<'activity'>,
  {
    key: 'energy',
    title: 'Your energy lately',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'okay', label: 'Okay' },
      { value: 'good', label: 'Good' },
      PREFER_NOT,
    ],
  } satisfies Question<'energy'>,
  {
    key: 'sleep',
    title: 'How you have been sleeping',
    options: [
      { value: 'poor', label: 'Poorly' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'good', label: 'Well' },
      PREFER_NOT,
    ],
  } satisfies Question<'sleep'>,
  {
    key: 'stress',
    title: 'Stress lately',
    options: [
      { value: 'high', label: 'High' },
      { value: 'some', label: 'Some' },
      { value: 'calm', label: 'Calm' },
      PREFER_NOT,
    ],
  } satisfies Question<'stress'>,
];

/** The four baseline questions; used in onboarding and on the You > Personalize screen. */
export function BaselineQuestions() {
  const { colors, typography, spacing } = useTheme();
  const { baseline, setOnboardingAnswers } = useRootStore(
    useShallow((s) => ({ baseline: s.onboarding.baseline, setOnboardingAnswers: s.setOnboardingAnswers })),
  );

  return (
    <View>
      {QUESTIONS.map((q, i) => (
        <View key={q.key} style={{ marginTop: i === 0 ? 0 : spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>{q.title}</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={q.title}>
            {q.options.map((o) => {
              const selected = baseline[q.key] === o.value;
              return (
                <Chip
                  key={o.value}
                  label={o.label}
                  selected={selected}
                  onPress={() => setOnboardingAnswers({ baseline: { ...baseline, [q.key]: selected ? null : o.value } })}
                />
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
