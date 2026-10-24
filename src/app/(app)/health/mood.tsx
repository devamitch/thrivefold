import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function MoodScreen() {
  const { colors, typography, spacing } = useTheme();
  const { todayEnergy, todayMood, todayStress, todaySleepHours, updateTodayMetrics } = useRootStore(
    useShallow((s) => ({ todayEnergy: s.todayEnergy, todayMood: s.todayMood, todayStress: s.todayStress, todaySleepHours: s.todaySleepHours, updateTodayMetrics: s.updateTodayMetrics })),
  );

  const [energy, setEnergy] = useState(todayEnergy ?? 5);
  const [mood, setMood] = useState(todayMood ?? 5);
  const [stress, setStress] = useState(todayStress ?? 5);

  const saveMetrics = (e: number, m: number, s: number) => {
    setEnergy(e);
    setMood(m);
    setStress(s);
    updateTodayMetrics(e, m, s, todaySleepHours);
  };

  const scaleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <ScreenWrapper scrollable>
      <Header title="Mood and energy" subtitle="Your daily trends" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Mood Slider/Pills */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.metricHeader}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Emotional Valence (Mood)</Text>
            <Badge label={`${mood}/10`} variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
            1 = Very low / distressed · 10 = Joyful / deeply fulfilled
          </Text>
          <View style={styles.pillsRow}>
            {scaleNumbers.map((num) => (
              <Chip
                key={num}
                label={`${num}`}
                selected={mood === num}
                onPress={() => saveMetrics(energy, num, stress)}
                style={{ width: 44, height: 38, marginRight: 6, marginBottom: 6, justifyContent: 'center', alignItems: 'center' }}
              />
            ))}
          </View>
        </Card>

        {/* Energy Slider/Pills */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.metricHeader}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Physical Energy</Text>
            <Badge label={`${energy}/10`} variant="success" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
            1 = Exhausted / depleted · 10 = Vibrant & alert
          </Text>
          <View style={styles.pillsRow}>
            {scaleNumbers.map((num) => (
              <Chip
                key={num}
                label={`${num}`}
                selected={energy === num}
                onPress={() => saveMetrics(num, mood, stress)}
                style={{ width: 44, height: 38, marginRight: 6, marginBottom: 6, justifyContent: 'center', alignItems: 'center' }}
              />
            ))}
          </View>
        </Card>

        {/* Stress Slider/Pills */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.metricHeader}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Perceived Stress</Text>
            <Badge label={`${stress}/10`} variant={stress <= 4 ? 'success' : stress <= 7 ? 'warning' : 'danger'} />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
            1 = Completely serene · 10 = Overwhelmed / acute tension
          </Text>
          <View style={styles.pillsRow}>
            {scaleNumbers.map((num) => (
              <Chip
                key={num}
                label={`${num}`}
                selected={stress === num}
                onPress={() => saveMetrics(energy, mood, num)}
                style={{ width: 44, height: 38, marginRight: 6, marginBottom: 6, justifyContent: 'center', alignItems: 'center' }}
              />
            ))}
          </View>
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>
            Local-Only Privacy Invariant
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Your daily mood, energy, and stress scores are stored only on this phone.
          </Text>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
