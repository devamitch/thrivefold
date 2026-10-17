import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useHealthStore } from '../../../stores/useHealthStore';

export default function ProgressScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const currentStreak = useHealthStore((s) => s.currentStreak);
  const completedCheckInDaysCount = useHealthStore((s) => s.completedCheckInDaysCount);
  const checkInHistory = useHealthStore((s) => s.checkInHistory);

  return (
    <ScreenWrapper scrollable>
      <Header title="Progress & Insights" subtitle="Personal Consistency Analytics" />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <View style={styles.metricsRow}>
          <Card variant="tinted" style={styles.metricCard}>
            <Text style={[typography.label, { color: colors.primary }]}>Active Streak</Text>
            <Text style={[typography.display, { color: colors.primary, marginTop: 4 }]}>
              {currentStreak}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>consecutive days</Text>
          </Card>

          <Card variant="surface1" style={styles.metricCard}>
            <Text style={[typography.label, { color: colors.text.muted }]}>Total Check-ins</Text>
            <Text style={[typography.display, { color: colors.text.primary, marginTop: 4 }]}>
              {completedCheckInDaysCount}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>logs recorded</Text>
          </Card>
        </View>

        <Card style={{ marginVertical: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {experience === 'women_health' ? 'Hormone & Phase Rhythm' : 'Energy & Stress Pacing'}
            </Text>
            <Badge label="Local Vault" variant="neutral" />
          </View>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            {experience === 'women_health'
              ? 'Tracking cycle day 14. Follicular to ovulatory phase transition demonstrates stable energy and positive focus.'
              : 'Consistent posture and breathing logs show a 32% reduction in self-reported evening fatigue.'}
          </Text>
        </Card>

        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Recent Logs
        </Text>
        {checkInHistory.map((item) => (
          <Card key={item.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {item.date}
              </Text>
              <Badge label={`Energy ${item.energy}/10`} variant="primary" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              Mood: {item.mood}/10 · Stress: {item.stress}/10 · Sleep: {item.sleepHours} hrs
            </Text>
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
