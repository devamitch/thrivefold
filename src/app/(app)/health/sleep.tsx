import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { GuidedTimer } from '../../../components/ui/GuidedTimer';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function SleepScreen() {
  const { colors, typography, spacing } = useTheme();
  const { todaySleepHours, updateTodayMetrics, todayEnergy, todayMood, todayStress } = useRootStore(
    useShallow((s) => ({ todaySleepHours: s.todaySleepHours, updateTodayMetrics: s.updateTodayMetrics, todayEnergy: s.todayEnergy, todayMood: s.todayMood, todayStress: s.todayStress })),
  );

  const [hours, setHours] = useState(todaySleepHours ?? 7);

  const adjustHours = (delta: number) => {
    const next = Math.max(3, Math.min(12, Math.round((hours + delta) * 2) / 2));
    setHours(next);
    updateTodayMetrics(todayEnergy, todayMood, todayStress, next);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Sleep & Circadian Rhythm" subtitle="Rest, Recovery & Parasympathetic Tone" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, alignItems: 'center', padding: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>LAST NIGHT'S DURATION</Text>
          <Text style={[typography.hero, { color: colors.primary, marginVertical: 8 }]}>
            {hours.toFixed(1)} <Text style={[typography.subheading, { color: colors.text.secondary }]}>hrs</Text>
          </Text>
          <Badge
            label={hours >= 7.5 ? 'Restful & Optimal' : hours >= 6 ? 'Adequate Rest' : 'Sleep Debt Detected'}
            variant={hours >= 7.5 ? 'success' : hours >= 6 ? 'warning' : 'danger'}
          />

          <View style={styles.stepperRow}>
            <Button label="- 30 min" variant="outline" size="sm" onPress={() => adjustHours(-0.5)} />
            <Button label="+ 30 min" variant="outline" size="sm" onPress={() => adjustHours(0.5)} style={{ marginLeft: 12 }} />
          </View>
        </Card>

        {/* Circadian Wind-Down */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            Circadian Alignment Tips
          </Text>
          <View style={styles.tipRow}>
            <Ionicons name="sunny-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, flex: 1 }]}>
              Early Sunlight: Get 10–15 minutes of outdoor light exposure within 1 hour of waking to anchor cortisol.
            </Text>
          </View>
          <View style={[styles.tipRow, { marginTop: 12 }]}>
            <Ionicons name="moon-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, flex: 1 }]}>
              Night Wind-Down: Dim screens 60 minutes before bed; engage parasympathetic 4-7-8 box breathing.
            </Text>
          </View>
        </Card>

        {/* Wind-Down Practice */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1 }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>Tonight&apos;s wind-down</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            An 8-minute guided body scan. Lie down, dim the lights and follow the prompts.
          </Text>
          <GuidedTimer
            minutes={8}
            startLabel="Begin wind-down"
            cues={[
              'Breathe in for 4, out for 6. Let your body get heavy.',
              'Relax your forehead, jaw and tongue.',
              'Let your shoulders drop away from your ears.',
              'Soften your chest and stomach with each breath out.',
              'Release your hips, legs and feet.',
              'Notice the whole body resting. Keep breathing slowly.',
            ]}
          />
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
  stepperRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
