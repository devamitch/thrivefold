import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { useTheme } from '../../theme/useTheme';

export default function DailyRoutineScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [routineLength, setRoutineLength] = useState('5 Minutes (Micro-Habit)');
  const [preferredTime, setPreferredTime] = useState('Morning (Upon Waking)');

  const lengthOptions = ['3 Minutes (Ultra Light)', '5 Minutes (Micro-Habit)', '10 Minutes (Balanced)', '15+ Minutes (Deep Practice)'];
  const timeOptions = ['Morning (Upon Waking)', 'Midday (Desk Reset)', 'Evening (Wind-Down)', 'Bedtime (Parasympathetic)'];

  return (
    <ScreenWrapper scrollable>
      <Header title="Daily Routine Architecture" subtitle="Step 9 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Designing Your Routine
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          Consistency beats intensity. Set your comfortable daily quest duration and preferred reflection time window.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Target Daily Engagement Length
          </Text>
          <View style={styles.chipRow}>
            {lengthOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={routineLength === opt}
                onPress={() => setRoutineLength(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Anchor Time
          </Text>
          <View style={styles.chipRow}>
            {timeOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={preferredTime === opt}
                onPress={() => setPreferredTime(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Button
          label="Complete & Enter Thrivefold"
          onPress={() => router.push('/(onboarding)/complete')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
