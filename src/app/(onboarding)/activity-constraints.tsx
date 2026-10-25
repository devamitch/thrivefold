import { SquircleSurface } from '../../components/ui/SquircleSurface';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '../../components/ui/PressableScale';
import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Chip } from '../../components/ui/Chip';
import { constraintsFor, ROUTINE_LENGTHS } from '../../domain/onboarding/options';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

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

  const activeConstraints = constraintsFor(experience);

  const toggle = (c: string) =>
    setOnboardingAnswers({
      constraints: constraints.includes(c)
        ? constraints.filter((x) => x !== c)
        : [...constraints, c],
    });
  const next = () => {
    if (routineMinutes === null) {
      setOnboardingAnswers({ routineMinutes: 10 });
    }
    router.push('/(onboarding)/lifestyle-preferences');
  };

  return (
    <OnboardingScaffold
      step="activity-constraints"
      reward="constraints"
      title="Anything we should go easy on?"
      subtitle="We'll leave out movements that don't suit you. Skip if nothing applies."
      primaryLabel="Continue"
      onPrimary={next}
      onSkip={next}
    >
      <SquircleSurface style={styles.chips}>
        {activeConstraints.map((c) => (
          <Chip key={c} label={c} selected={constraints.includes(c)} onPress={() => toggle(c)} />
        ))}
      </SquircleSurface>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl }]}>
        How long can a daily routine be?
      </Text>
      <SquircleSurface style={[styles.segment, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
        {ROUTINE_LENGTHS.map((l) => {
          const selected = routineMinutes === l.value;
          return (
            <PressableScale
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
            </PressableScale>
          );
        })}
      </SquircleSurface>
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
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
});
