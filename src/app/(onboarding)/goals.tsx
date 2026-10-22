import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';

export default function GoalsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Daily Stress Relief',
    'Gentle Mobility',
  ]);

  const availableGoals = [
    'Cycle & Reproductive Health',
    'Daily Stress Relief',
    'Gentle Mobility',
    'Posture & Spine Care',
    'Better Sleep & Wind-Down',
    'Mindful Breathing',
    'Emotional Reflection & Journaling',
    'Hydration & Daily Habits',
    'Quiet Pen-Pal Correspondence',
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Your Wellness Focus" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          What Matters Most Today?
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
          Select the focus areas you wish to prioritize. Thrivefold will adapt your daily quests and check-in prompts accordingly.
        </Text>

        <View style={styles.chipsContainer}>
          {availableGoals.map((goal) => {
            const isSelected = selectedGoals.includes(goal);
            return (
              <Chip
                key={goal}
                label={goal}
                selected={isSelected}
                onPress={() => toggleGoal(goal)}
              />
            );
          })}
        </View>

        <Button
          label="Next: Movement Constraints"
          disabled={selectedGoals.length === 0}
          onPress={() => router.push('/(onboarding)/activity-constraints')}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
