import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';

const COMMON = ['Headache', 'Fatigue', 'Cramps', 'Bloating', 'Back pain', 'Nausea', 'Muscle soreness', 'Joint stiffness', 'Tension', 'Restless', 'Acne', 'Dizziness'];

/** Today's symptoms (part of today's check-in) and how often each came up in 30 days. */
export default function SymptomsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { history, patchCheckIn } = useRootStore(useShallow((s) => ({ history: s.checkInHistory, patchCheckIn: s.patchCheckIn })));
  const date = formatLocalDate(new Date());
  const today = history.find((c) => c.date === date);

  const counts = useMemo(() => {
    const since = Date.now() - 30 * 86400000;
    const m = new Map<string, number>();
    for (const c of history) {
      if (Date.parse(`${c.date}T12:00:00`) < since) continue;
      for (const sym of c.symptoms) m.set(sym, (m.get(sym) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [history]);

  const options = [...new Set([...(today?.symptoms ?? []), ...COMMON])];
  const toggle = (sym: string) => {
    if (!today) return;
    patchCheckIn(date, {
      symptoms: today.symptoms.includes(sym) ? today.symptoms.filter((x) => x !== sym) : [...today.symptoms, sym],
    });
  };

  return (
    <ScreenContainer header={<AppHeader title="Symptoms" subtitle="What you noticed, and how often" showBack />} scrollMode="shell-scroll-view">
      <Card style={{ padding: spacing.base }}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>Today</Text>
        {today ? (
          <View style={[styles.chips, { marginTop: spacing.sm }]}>
            {options.map((sym) => (
              <Chip key={sym} label={sym} selected={today.symptoms.includes(sym)} onPress={() => toggle(sym)} />
            ))}
          </View>
        ) : (
          <>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              Symptoms are saved with your daily check-in.
            </Text>
            <Button label="Check in" size="sm" onPress={() => router.push('/(app)/check-in')} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
          </>
        )}
      </Card>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Last 30 days</Text>
      {counts.length === 0 ? (
        <Text style={[typography.subbody, { color: colors.text.secondary }]}>Nothing logged yet.</Text>
      ) : (
        counts.map(([sym, n]) => (
          <View key={sym} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[typography.body, { color: colors.text.primary }]}>{sym}</Text>
            <Text style={[typography.subbodyBold, { color: colors.text.secondary }]}>{n} day{n === 1 ? '' : 's'}</Text>
          </View>
        ))
      )}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        If a symptom is severe, new, or keeps coming back, please see a clinician. This is a record, not a diagnosis.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, minHeight: 48, alignItems: 'center' },
});
