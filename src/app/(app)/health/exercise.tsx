import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { PLANS, exerciseById, planById, sessionsThisWeek, type WorkoutPlan } from '../../../domain/fitness/workouts';

const SETTINGS: { id: 'all' | WorkoutPlan['setting']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'home', label: 'Home' },
  { id: 'gym', label: 'Gym' },
  { id: 'desk', label: 'Desk' },
  { id: 'recovery', label: 'Recovery' },
];

/** Workouts hub: plans to start, this week's count and logged history. */
export default function WorkoutsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { sessions, deleteWorkoutSession, showAlert } = useRootStore(
    useShallow((s) => ({ sessions: s.workoutSessions, deleteWorkoutSession: s.deleteWorkoutSession, showAlert: s.showAlert })),
  );
  const [filter, setFilter] = useState<(typeof SETTINGS)[number]['id']>('all');
  const plans = useMemo(() => PLANS.filter((p) => filter === 'all' || p.setting === filter), [filter]);
  const week = sessionsThisWeek(sessions, formatLocalDate(new Date()));

  return (
    <ScreenWrapper scrollable>
      <Header title="Workouts" subtitle="Plans, logged sets and your progress" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card variant="surface1" style={{ padding: spacing.base }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {week} workout{week === 1 ? '' : 's'} in the last 7 days
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Never train through sharp pain, chest pain or dizziness. General fitness guidance, not medical advice.
          </Text>
        </Card>

        <View style={[styles.chips, { marginTop: spacing.md }]}>
          {SETTINGS.map((s) => (
            <Chip key={s.id} label={s.label} selected={filter === s.id} onPress={() => setFilter(s.id)} />
          ))}
        </View>

        {plans.map((plan) => (
          <Card
            key={plan.id}
            // Typed routes regenerate on the next `expo start`; the route file exists.
            onPress={() => router.push(`/(app)/health/workout/${plan.id}` as Href)}
            style={{ marginTop: spacing.sm }}
          >
            <View style={styles.row}>
              <Badge label={plan.level === 'beginner' ? 'Beginner' : 'Intermediate'} variant="neutral" />
              <Text style={[typography.captionBold, { color: colors.primary }]}>{plan.minutes} min</Text>
            </View>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xs }]}>{plan.title}</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>{plan.summary}</Text>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
              {plan.items.map((i) => exerciseById(i.exerciseId)?.name).join(' · ')}
            </Text>
          </Card>
        ))}

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>History</Text>
        {sessions.length === 0 ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            No workouts logged yet. Start a plan above; every set you log shows up here.
          </Text>
        ) : (
          sessions.slice(0, 20).map((s) => {
            const sets = s.entries.reduce((n, e) => n + e.sets.length, 0);
            return (
              <View key={s.id} style={[styles.row, styles.historyRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                    {planById(s.planId)?.title ?? 'Workout'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {new Date(`${s.date}T12:00:00`).toLocaleDateString()} · {sets} sets
                    {s.effort ? ` · effort ${s.effort}/10` : ''}
                    {s.painReported ? ' · discomfort noted' : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    showAlert({
                      title: 'Delete this workout?',
                      message: 'It will be removed from this device.',
                      confirmText: 'Delete',
                      destructive: true,
                      onConfirm: () => deleteWorkoutSession(s.id),
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Delete workout"
                  hitSlop={8}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 52 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
