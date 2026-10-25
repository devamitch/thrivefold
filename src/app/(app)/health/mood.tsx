import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { Link, type Href } from 'expo-router';

import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TrendBars, lastDays } from '../../../components/ui/TrendBars';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';

/** Mood, energy and stress over the last two weeks, from the person's own check-ins. */
export default function MoodScreen() {
  const { colors, typography, spacing } = useTheme();
  const history = useRootStore((s) => s.checkInHistory);
  const byDate = useMemo(() => new Map(history.map((c) => [c.date, c])), [history]);
  const today = byDate.get(formatLocalDate(new Date()));

  return (
    <ScreenContainer header={<AppHeader title="Mood and energy" subtitle="Your last 14 days" showBack />} scrollMode="shell-scroll-view">
      <Card style={{ padding: spacing.base }}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>
          {today ? `Today: mood ${today.mood}, energy ${today.energy}, stress ${today.stress}` : 'No check-in today yet'}
        </Text>
        <Link href={'/(app)/check-in' as Href} asChild>
          <Button
            label={today ? 'Update today' : 'Check in'}
            size="sm"
            style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          />
        </Link>
      </Card>
      {(['mood', 'energy', 'stress'] as const).map((key) => (
        <Card key={key} style={{ padding: spacing.base, marginTop: spacing.sm }}>
          <TrendBars label={key[0].toUpperCase() + key.slice(1)} max={10} points={lastDays(14, (d) => byDate.get(d)?.[key] ?? null)} />
        </Card>
      ))}
      <Link href={'/(app)/ai' as Href} asChild>
        <Button label="See your patterns" variant="ghost" style={{ marginTop: spacing.sm }} />
      </Link>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Scores are stored only on this phone. Not medical advice; if low mood persists, talk to someone you trust or a clinician.
      </Text>
    </ScreenContainer>
  );
}
