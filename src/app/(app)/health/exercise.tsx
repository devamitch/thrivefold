import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function ExerciseScreen() {
  const { colors, typography, spacing } = useTheme();

  const routines = [
    {
      id: 'ex_01',
      title: 'Desk Worker Thoracic & Hip Relief',
      duration: '10 min',
      level: 'Equipment-Free',
      description: 'Seated spinal twists, chest openers, and deep hip flexor lunges to reverse sitting posture.',
    },
    {
      id: 'ex_02',
      title: 'Bodyweight Core & Posture Basics',
      duration: '15 min',
      level: 'Beginner-Friendly',
      description: 'Glute bridges, dead-bug core activation, and tempo bodyweight squats with proper knee alignment.',
    },
    {
      id: 'ex_03',
      title: 'Pelvic-Floor Awareness & Release',
      duration: '8 min',
      level: 'Gentle Recovery',
      description: 'Focusing on diaphragmatic breathing and relaxing hypertonic pelvic tension. Promotes healthy circulation.',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Movement & Mobility" subtitle="Functional Physical Health" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            Safe Exercise Policy
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Never train through sharp pain. These routines build sustainable mobility and recovery without aggressive overtraining.
          </Text>
        </Card>

        {routines.map((item) => (
          <Card key={item.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.rowBetween}>
              <Badge label={item.level} variant="neutral" />
              <Text style={[typography.captionBold, { color: colors.primary }]}>{item.duration}</Text>
            </View>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xs }]}>
              {item.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
              {item.description}
            </Text>
            <Button label="Begin Session" size="sm" onPress={() => {}} style={{ marginTop: spacing.md }} />
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
