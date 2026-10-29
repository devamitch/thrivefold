import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getPracticeMinuteBars } from '../../domain/analytics/dashboardAnalytics';
import { betaInsights, betaTasksFor } from '../../domain/beta/betaTasks';
import { useBetaEnabled } from '../../hooks/useBetaEnabled';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { BetaBadge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

const GOLD = '#B8894A';

/**
 * Beta inside today's flow: three beta tasks next to the quests (each opens its exercise and is
 * ticked by a real finished session), and the week's beta numbers with a minutes chart.
 */
export function BetaTodayCard() {
  const enabled = useBetaEnabled();
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const sessions = useRootStore((s) => s.betaSessions);
  const { tasks, insights, bars } = useMemo(() => {
    const now = new Date();
    return { tasks: betaTasksFor(now, sessions), insights: betaInsights(now, sessions), bars: getPracticeMinuteBars(sessions, now) };
  }, [sessions]);
  if (!enabled) return null;
  const done = tasks.filter((t) => t.done).length;
  const maxBar = Math.max(1, ...bars.map((b) => b.value));

  return (
    <Card style={[styles.card, { marginTop: spacing.md, borderColor: 'rgba(201,164,106,0.55)' }]}>
      <View style={styles.head}>
        <BetaBadge />
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Beta tasks today</Text>
        <Text style={[typography.captionBold, { color: GOLD }]}>
          {done}/{tasks.length}
        </Text>
      </View>
      {tasks.map((t) => (
        <PressableScale
          key={t.id}
          onPress={() => router.push(t.route as Href)}
          accessibilityLabel={`${t.title}, ${t.minutes} minutes${t.done ? ', done' : ''}`}
          style={[styles.task, { borderTopColor: colors.surface1 }]}
        >
          <Ionicons name={t.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={t.done ? GOLD : colors.text.muted} />
          <View style={styles.flex}>
            <Text style={[typography.subbody, { color: colors.text.primary, textDecorationLine: t.done ? 'line-through' : 'none' }]}>{t.title}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {t.minutes} min · +10 XP and up
            </Text>
          </View>
          {!t.done ? (
            <View style={[styles.start, { backgroundColor: GOLD }]}>
              <Text style={[typography.captionBold, styles.light]}>Start</Text>
            </View>
          ) : null}
        </PressableScale>
      ))}

      <View style={[styles.stats, { backgroundColor: colors.surface1 }]}>
        <Stat label="sessions" value={`${insights.sessions}`} />
        <Stat label="minutes" value={`${insights.minutes}`} />
        <Stat label="eye score" value={insights.bestPursuit !== null ? `${insights.bestPursuit}` : '—'} />
        <Stat label="voice hold" value={insights.longestHoldS !== null ? `${insights.longestHoldS}s` : '—'} />
      </View>
      <View style={styles.chart} accessible accessibilityLabel={`Beta minutes, last 7 days: ${bars.map((b) => b.value).join(', ')}`}>
        {bars.map((b) => (
          <View key={b.date} style={styles.slot}>
            <View style={[styles.bar, { height: b.value > 0 ? Math.max(4, (b.value / maxBar) * 40) : 2, backgroundColor: b.isToday ? GOLD : 'rgba(201,164,106,0.45)' }]} />
            <Text style={[typography.caption, styles.day, { color: colors.text.muted }]}>{b.dayLabel.slice(0, 1)}</Text>
          </View>
        ))}
      </View>
      <Text style={[typography.caption, { color: colors.text.muted }]}>Last 7 days · {insights.activeDays} active day{insights.activeDays === 1 ? '' : 's'}</Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  light: { color: '#FFF8EC' },
  card: { borderWidth: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  start: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  stats: { flexDirection: 'row', borderRadius: 14, paddingVertical: 10, marginTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 58, gap: 6, marginTop: 12 },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  day: { fontSize: 10, marginTop: 2 },
});
