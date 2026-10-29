import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatLocalDate, parseLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { totals } from '../../domain/nutrition/foods';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';
import { BetaBadge } from '../ui/Badge';
import { useBetaEnabled } from '../../hooks/useBetaEnabled';

interface Tile {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** Live status from the person's own records, or the first action when there are none. */
  meta: string;
  route: Href;
  hasActivity: boolean;
  isBeta?: boolean;
}

const SPACE_TILE: Record<ProductExperience, Omit<Tile, 'meta' | 'hasActivity'> & { meta: string }> = {
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
  const betaMode = useBetaEnabled();
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
    const spaceTile = SPACE_TILE[experience];

    return [
      {
        icon: 'barbell-outline',
        label: 'Train',
        meta: workouts ? `${workouts} workout${workouts === 1 ? '' : 's'} this week` : 'Start a guided plan',
        route: '/(app)/train',
        hasActivity: workouts > 0,
      },
      {
        icon: 'restaurant-outline',
        label: 'Food',
        meta: kcal ? `${Math.round(kcal)} kcal today` : 'Log a meal',
        route: '/(app)/health/nutrition',
        hasActivity: kcal > 0,
      },
      {
        icon: 'moon-outline',
        label: 'Sleep',
        meta: lastSleep ? `${lastSleep.sleepHours} h ${lastSleep.date === today ? 'last night' : 'last logged'}` : 'Log last night',
        route: '/(app)/health/sleep',
        hasActivity: Boolean(lastSleep && lastSleep.date === today),
      },
      {
        icon: 'calendar-clear-outline',
        label: 'Calendar',
        meta: todayCount ? `${todayCount} planned today` : 'Nothing planned today',
        route: '/(app)/calendar',
        hasActivity: todayCount > 0,
      },
      {
        icon: 'document-text-outline',
        label: 'Documents',
        meta: 'Prescriptions, diet and workout plans',
        route: '/(app)/health/documents' as Href,
        hasActivity: false,
      },
      {
        icon: 'partly-sunny-outline',
        label: 'Outdoors',
        meta: 'Weather, outings, trips',
        route: '/(app)/outdoors' as Href,
        hasActivity: false,
      },
      {
        icon: 'book-outline',
        label: 'Journal',
        meta: journal.length ? `${journal.length} entr${journal.length === 1 ? 'y' : 'ies'}` : 'Write a private note',
        route: '/(app)/journal',
        hasActivity: journal.some((j) => j.createdAt.startsWith(today)),
      },
      {
        ...spaceTile,
        hasActivity: false,
      },
      ...(betaMode
        ? [
            {
              icon: 'flask-outline' as const,
              label: 'Beta Lab',
              meta: 'Eye, hand & pose studios',
              route: '/(app)/beta-lab' as Href,
              hasActivity: true,
              isBeta: true,
            },
            {
              icon: 'chatbubble-ellipses-outline' as const,
              label: 'Thrive Coach',
              meta: 'Ask, log or open anything',
              route: '/(app)/beta-lab/assistant' as Href,
              hasActivity: false,
              isBeta: true,
            },
          ]
        : []),
    ];
  }, [today, sessions, meals, checkIns, journal, todayCount, experience, betaMode]);

  return (
    <View style={[styles.grid, { gap: spacing.sm }]}>
      {tiles.map((tile) => (
        <Link key={tile.label} href={tile.route} asChild>
          <PressableScale style={styles.cell} accessibilityRole="button" accessibilityLabel={`${tile.label}. ${tile.meta}`}>
            <SquircleSurface radius={20} fill={colors.surface} style={[styles.tile, { borderColor: colors.border, borderWidth: 1 }]}>
              <View style={styles.topRow}>
                <SquircleSurface radius={12} fill={tile.hasActivity ? colors.primaryAlpha : colors.surface2} style={styles.icon}>
                  <Ionicons name={tile.icon} size={18} color={tile.hasActivity ? colors.primary : colors.text.secondary} />
                </SquircleSurface>
                <View style={styles.badgeRow}>
                  {tile.isBeta ? (
                    <BetaBadge />
                  ) : tile.hasActivity ? (
                    <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                  ) : null}
                  <Ionicons name="chevron-forward" size={14} color={colors.text.muted} />
                </View>
              </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    borderRadius: 3,
    height: 6,
    marginRight: 4,
    width: 6,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cell: { flexBasis: '47%', flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  icon: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  tile: { minHeight: 116, padding: 14 },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
