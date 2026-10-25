import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { formatLocalDate, parseLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { totals } from '../../domain/nutrition/foods';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

interface Tile {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** Live status from the person's own records, or the first action when there are none. */
  meta: string;
  route: Href;
}

const SPACE_TILE: Record<ProductExperience, Omit<Tile, 'meta'> & { meta: string }> = {
  women_health: { icon: 'pulse-outline', label: 'Symptoms', meta: 'Log how your body feels', route: '/(app)/health/symptoms' },
  men_health: { icon: 'body-outline', label: "Men's health", meta: 'Checks and health basics', route: '/(app)/health/men' },
  pride_wellbeing: { icon: 'heart-outline', label: 'Self-care', meta: 'Private care notes', route: '/(app)/health/pride' },
};

/**
 * Home tools: six places you go most, each showing where you stand today from your own
 * records (never placeholders), in a calm two-column grid.
 */
export function ToolsGrid({ todayCount }: { todayCount: number }) {
  const { colors, typography, spacing, experience } = useTheme();
  const today = formatLocalDate(new Date());
  const { sessions, meals, journal, checkIns } = useRootStore(
    useShallow((s) => ({
      sessions: s.workoutSessions,
      meals: s.mealLogs,
      journal: s.journalEntries,
      checkIns: s.checkInHistory,
    })),
  );

  const tiles = useMemo<Tile[]>(() => {
    const t = parseLocalDate(today);
    const monday = new Date(t);
    monday.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    const weekStart = formatLocalDate(monday);
    const workouts = sessions.filter((w) => w.date >= weekStart).length;
    const kcal = meals.filter((m) => m.date === today).reduce((sum, m) => sum + totals(m.items).kcal, 0);
    const lastSleep = [...checkIns].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return [
      {
        icon: 'barbell-outline',
        label: 'Train',
        meta: workouts ? `${workouts} workout${workouts === 1 ? '' : 's'} this week` : 'Start a guided plan',
        route: '/(app)/train',
      },
      {
        icon: 'restaurant-outline',
        label: 'Food',
        meta: kcal ? `${Math.round(kcal)} kcal today` : 'Log a meal',
        route: '/(app)/health/nutrition',
      },
      {
        icon: 'moon-outline',
        label: 'Sleep',
        meta: lastSleep ? `${lastSleep.sleepHours} h ${lastSleep.date === today ? 'last night' : 'last logged'}` : 'Log last night',
        route: '/(app)/health/sleep',
      },
      {
        icon: 'calendar-clear-outline',
        label: 'Calendar',
        meta: todayCount ? `${todayCount} on today` : 'Nothing planned today',
        route: '/(app)/calendar',
      },
      {
        icon: 'book-outline',
        label: 'Journal',
        meta: journal.length ? `${journal.length} entr${journal.length === 1 ? 'y' : 'ies'}` : 'Write a private note',
        route: '/(app)/journal',
      },
      SPACE_TILE[experience],
    ];
  }, [today, sessions, meals, checkIns, journal, todayCount, experience]);

  return (
    <SquircleSurface style={[styles.grid, { gap: spacing.sm }]}>
      {tiles.map((tile) => (
        <Link key={tile.label} href={tile.route} asChild>
          <PressableScale style={styles.cell} accessibilityRole="button" accessibilityLabel={`${tile.label}. ${tile.meta}`}>
            <SquircleSurface radius={20} fill={colors.surface} style={styles.tile}>
              <SquircleSurface radius={12} fill={colors.primaryAlpha} style={styles.icon}>
                <Ionicons name={tile.icon} size={18} color={colors.primary} />
              </SquircleSurface>
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.sm }]} numberOfLines={1}>
                {tile.label}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                {tile.meta}
              </Text>
            </SquircleSurface>
          </PressableScale>
        </Link>
      ))}
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  cell: { flexBasis: '47%', flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  icon: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  tile: { minHeight: 112, padding: 14 },
});
