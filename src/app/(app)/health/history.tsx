import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function HealthHistoryScreen() {
  const { colors, typography, spacing } = useTheme();
  const { checkInHistory, completedCheckInDaysCount, currentStreak, showToast } = useRootStore(
    useShallow((s) => ({
      checkInHistory: s.checkInHistory,
      completedCheckInDaysCount: s.completedCheckInDaysCount,
      currentStreak: s.currentStreak,
      showToast: s.showToast,
    })),
  );

  const handleExport = () => {
    showToast({
      type: 'success',
      title: 'Export Ready',
      message: 'Your health records are ready to share as a file.',
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Health history" subtitle="Your records, newest first" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Summary Stats */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>TOTAL PARTICIPATION</Text>
          <SquircleSurface style={styles.statsRow}>
            <SquircleSurface style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.primary }]}>{completedCheckInDaysCount}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Check-In Days</Text>
            </SquircleSurface>
            <SquircleSurface style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.success }]}>{currentStreak}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Day Streak</Text>
            </SquircleSurface>
            <SquircleSurface style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.text.primary }]}>100%</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Local Privacy</Text>
            </SquircleSurface>
          </SquircleSurface>
        </Card>

        <SquircleSurface style={styles.headerRow}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Daily Health Timeline</Text>
          <Button label="Export JSON" variant="outline" size="sm" onPress={handleExport} />
        </SquircleSurface>

        {checkInHistory.map((item) => (
          <Card key={item.id} style={{ marginTop: spacing.sm }}>
            <SquircleSurface style={styles.historyRow}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
              <Badge label={`Sleep: ${item.sleepHours}h`} variant="neutral" />
            </SquircleSurface>

            <SquircleSurface style={styles.metricsGrid}>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Energy: {item.energy}/10</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Mood: {item.mood}/10</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Stress: {item.stress}/10</Text>
            </SquircleSurface>

            {item.symptoms.length > 0 && (
              <Text style={[typography.caption, { color: colors.primary, marginTop: 6 }]}>
                Symptoms: {item.symptoms.join(', ')}
              </Text>
            )}
          </Card>
        ))}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});
