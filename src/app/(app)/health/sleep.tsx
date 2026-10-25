import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useMemo } from 'react';
import { Link, type Href } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { GuidedTimer } from '../../../components/ui/GuidedTimer';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import { TrendBars, lastDays } from '../../../components/ui/TrendBars';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';

export default function SleepScreen() {
  const { colors, typography, spacing } = useTheme();
  const history = useRootStore((st) => st.checkInHistory);
  const byDate = useMemo(() => new Map(history.map((c) => [c.date, c])), [history]);
  const today = byDate.get(formatLocalDate(new Date()));

  return (
    <ScreenWrapper scrollable>
      <Header title="Sleep" subtitle="From your daily check-ins" showBack />
      <View>
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>LAST NIGHT</Text>
          <Text style={[typography.hero, { color: colors.primary, marginVertical: 4 }]}>
            {today ? `${today.sleepHours}h` : 'Not logged'}
          </Text>
          <Link href={'/(app)/check-in' as Href} asChild>
            <Button
              label={today ? 'Update in check-in' : 'Log in check-in'}
              size="sm"
              variant="outline"
              style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
            />
          </Link>
          <View style={{ marginTop: spacing.md }}>
            <TrendBars label="Last 14 nights" unit="h" max={10} points={lastDays(14, (d) => byDate.get(d)?.sleepHours ?? null)} />
          </View>
        </Card>

        {/* Circadian Wind-Down */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            Habits that help sleep
          </Text>
          <View style={styles.tipRow}>
            <Ionicons name="sunny-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, flex: 1 }]}>
              Morning light: 10–15 minutes outdoors within an hour of waking helps set your body clock.
            </Text>
          </View>
          <View style={[styles.tipRow, { marginTop: 12 }]}>
            <Ionicons name="moon-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, flex: 1 }]}>
              Evening wind-down: dim screens about an hour before bed and try slow 4-7-8 breathing.
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
      </View>
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
