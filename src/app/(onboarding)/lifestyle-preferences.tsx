import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Header } from '../../components/ui/Header';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const DIETS = ['No preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Halal', 'Kosher', 'No onion or garlic'];
const REMINDERS = ['Fasting days', 'Weekly rest day', 'Meditation days', 'Festival dates I choose'];

/**
 * Optional preferences (master spec §3.3 step 7 and §23.7). Nothing is pre-selected,
 * nothing is inferred from these answers, and they only shape meal and reminder
 * suggestions. Reachable during onboarding and from Settings.
 */
export default function LifestylePreferencesScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { diet, observances, isOnboarded, setOnboardingAnswers } = useRootStore(
    useShallow((s) => ({
      diet: s.onboarding.diet,
      observances: s.onboarding.observances,
      isOnboarded: s.isOnboarded,
      setOnboardingAnswers: s.setOnboardingAnswers,
    })),
  );

  const toggleReminder = (item: string) =>
    setOnboardingAnswers({
      observances: observances.includes(item) ? observances.filter((i) => i !== item) : [...observances, item],
    });

  const next = () => {
    if (!isOnboarded) {
      router.push('/(onboarding)/complete');
    } else {
      router.back();
    }
  };

  const content = (
    <View>
      <Card style={{ padding: spacing.base, marginBottom: spacing.lg }}>
        <Text style={[typography.subbody, { color: colors.text.secondary }]}>
          Only used to tailor meal ideas and the reminders you pick. Never used to guess anything
          about you, and never shared. Clear or update any time.
        </Text>
      </Card>

      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
        Eating preference
      </Text>
      <View style={styles.chips}>
        {DIETS.map((d) => (
          <Chip
            key={d}
            label={d}
            selected={diet === d}
            onPress={() => setOnboardingAnswers({ diet: diet === d ? null : d })}
          />
        ))}
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        Reminders you'd like
      </Text>
      <View style={styles.chips}>
        {REMINDERS.map((r) => (
          <Chip key={r} label={r} selected={observances.includes(r)} onPress={() => toggleReminder(r)} />
        ))}
      </View>

      {isOnboarded && (
        <>
          <Button label="Done" onPress={next} style={{ marginTop: spacing.xl }} />
          <Button
            label="Clear these preferences"
            variant="ghost"
            onPress={() => setOnboardingAnswers({ diet: null, observances: [] })}
            style={{ marginTop: spacing.sm }}
          />
        </>
      )}
    </View>
  );

  if (!isOnboarded) {
    return (
      <OnboardingScaffold
        step="lifestyle-preferences"
        title="Food & lifestyle choices"
        subtitle="Shapes nutrition and reminder suggestions. Skip if you prefer flexible options."
        primaryLabel={diet || observances.length ? 'Continue' : 'Continue without choices'}
        onPrimary={next}
        onSkip={next}
      >
        {content}
      </OnboardingScaffold>
    );
  }

  return (
    <ScreenWrapper scrollable disableScrollAwareDock>
      <Header title="Food & reminders" subtitle="Optional" showBack />
      <View style={{ padding: spacing.base }}>{content}</View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
