import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatLocalDate, generateDayAgenda, parseLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useAgendaSources } from '../../hooks/useAgendaSources';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** This week, Monday to Sunday: a dot marks days with something saved. Opens the calendar. */
export function WeekGlance({ onOpen }: { onOpen: () => void }) {
  const { colors, typography, spacing, experience } = useTheme();
  const cycleData = useRootStore((s) => s.cycleData);
  const sources = useAgendaSources();
  const today = formatLocalDate(new Date());

  const days = useMemo(() => {
    const t = parseLocalDate(today);
    const monday = new Date(t);
    monday.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const date = formatLocalDate(d);
      const ev = generateDayAgenda(date, { experience, cycleData, ...sources });
      return {
        date,
        day: d.getDate(),
        saved: ev.some((e) => e.kind !== 'cycle_phase' && e.kind !== 'holiday' && e.status !== 'predicted'),
        period: ev.some((e) => e.kind === 'period'),
      };
    });
  }, [today, experience, cycleData, sources]);

  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel="This week. Open calendar">
      <SquircleSurface radius={22} fill={colors.surface} style={[styles.card, { marginTop: spacing.md }]}>
        {days.map((d, i) => {
          const on = d.date === today;
          return (
            <View key={d.date} style={styles.cell}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{LETTERS[i]}</Text>
              <SquircleSurface
                radius={12}
                fill={on ? colors.primary : d.period ? colors.errorSurface : 'transparent'}
                style={styles.pill}
              >
                <Text style={[typography.subbodyBold, { color: on ? colors.onPrimary : d.date > today ? colors.text.muted : colors.text.primary }]}>
                  {d.day}
                </Text>
              </SquircleSurface>
              <View style={[styles.dot, { backgroundColor: d.saved ? colors.primary : 'transparent' }]} />
            </View>
          );
        })}
      </SquircleSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 12 },
  cell: { alignItems: 'center', flex: 1, gap: 4 },
  dot: { borderRadius: 3, height: 5, width: 5 },
  pill: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
});
