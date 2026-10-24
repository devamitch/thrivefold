import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { fitFor } from '../../../domain/game/setupProfile';
import { questFamily } from '../../../domain/game/progression';
import { PLANS, suggestPlans, activeMinutesThisWeek, activitiesThisWeek, exerciseById, planById, sessionsThisWeek, type WorkoutPlan } from '../../../domain/fitness/workouts';

const SETTINGS: { id: 'all' | WorkoutPlan['setting']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'home', label: 'Home' },
  { id: 'gym', label: 'Gym' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'pilates', label: 'Pilates' },
  { id: 'balance', label: 'Balance' },
  { id: 'seated', label: 'Seated' },
  { id: 'desk', label: 'Desk' },
  { id: 'recovery', label: 'Stretch and recovery' },
];

/** Workouts hub: plans to start, this week's count and logged history. */
/** The Train tab and the Workouts screen share this hub. */
export function WorkoutsHub({ asTab = false }: { asTab?: boolean }) {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { sessions, activities, deleteWorkoutSession, showAlert, onboarding, checkIns, todayQuests } = useRootStore(
    useShallow((s) => ({
      sessions: s.workoutSessions,
      activities: s.activityLogs,
      deleteWorkoutSession: s.deleteWorkoutSession,
      showAlert: s.showAlert,
      onboarding: s.onboarding,
      checkIns: s.checkInHistory,
      todayQuests: s.todayQuests,
    })),
  );
  const [filter, setFilter] = useState<(typeof SETTINGS)[number]['id']>('all');
  const plans = useMemo(() => PLANS.filter((p) => filter === 'all' || p.setting === filter), [filter]);
  const today = formatLocalDate(new Date());
  const week = sessionsThisWeek(sessions, today);
  const minutes = activeMinutesThisWeek(sessions, activities, today);
  const movementQuest = todayQuests.find((q) => questFamily(q.category) === 'movement' && !q.isCompleted && q.status !== 'skipped' && q.status !== 'replaced');
  const suggestions = useMemo(() => {
    const todayCheckIn = checkIns.find((c) => c.date === today);
    const fit = fitFor(onboarding, todayCheckIn ?? null);
    return suggestPlans({
      capacity: fit.capacity,
      restDay: todayCheckIn?.intensity === 'rest',
      constraints: onboarding.constraints,
      sessions,
      today,
    });
  }, [checkIns, onboarding, sessions, today]);

  return (
    <ScreenWrapper scrollable>
      <Header title={asTab ? 'Train' : 'Workouts'} subtitle="Camera coach, plans and your progress" showBack={!asTab} />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card variant="surface1" style={{ padding: spacing.base }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {minutes} active minutes in the last 7 days
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
            {week} plan workout{week === 1 ? '' : 's'} · {activitiesThisWeek(activities, today)} other activities.
            Many adults aim for about 150 minutes of moderate activity a week.
          </Text>
          <WeekStrip />
          <Button
            label="Log a run, ride, class or sport"
            size="sm"
            variant="outline"
            onPress={() => router.push('/(app)/health/activity' as Href)}
            style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          />
          <Button
            label="Movement check with camera"
            size="sm"
            variant="ghost"
            onPress={() => router.push('/(app)/health/pose-check' as Href)}
            style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
          />
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Never train through sharp pain, chest pain or dizziness. General fitness guidance, not medical advice.
          </Text>
        </Card>

        {movementQuest ? (
          <Card
            variant="tinted"
            onPress={() => router.push(`/(app)/health/coach/${suggestions[0]?.plan.id ?? 'desk_reset'}?assignmentId=${movementQuest.id}` as Href)}
            style={{ marginTop: spacing.lg, padding: spacing.base }}
          >
            <Text style={[typography.captionBold, { color: colors.primary }]}>TODAY'S MOVEMENT QUEST</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>{movementQuest.title}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Do it with the camera coach. Finishing the workout completes this quest (+{movementQuest.xpReward} XP).
            </Text>
          </Card>
        ) : null}

        {suggestions.length > 0 ? (
          <>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Suggested for you today</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Tap to start with video, rep counting and form check. Saved to your history and calendar.
            </Text>
            {suggestions.map(({ plan, reason }, i) => (
              <Card
                key={plan.id}
                variant={i === 0 ? 'tinted' : 'surface'}
                onPress={() => router.push(`/(app)/health/coach/${plan.id}` as Href)}
                style={{ marginTop: spacing.sm }}
              >
                {i === 0 ? (
                  <View style={[styles.row, { marginBottom: 6 }]}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>START WITH THE CAMERA COACH</Text>
                    <Ionicons name="videocam" size={16} color={colors.primary} />
                  </View>
                ) : null}
                <View style={styles.row}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{plan.title}</Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{plan.minutes} min</Text>
                </View>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{reason}</Text>
              </Card>
            ))}
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>All plans</Text>
          </>
        ) : null}

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
  week: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekDot: { alignItems: 'center', borderRadius: 13, borderWidth: 2, height: 26, justifyContent: 'center', width: 26 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 52 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

export default function WorkoutsScreen() {
  return <WorkoutsHub />;
}

/** This week, Monday to Sunday: a filled day had a workout or logged activity. Opens the calendar. */
function WeekStrip() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { sessions, activities } = useRootStore(useShallow((s) => ({ sessions: s.workoutSessions, activities: s.activityLogs })));
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const active = new Set([...sessions.map((w) => w.date), ...activities.map((a) => a.date)]);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { key: formatLocalDate(d), label: 'MTWTFSS'[i], today: formatLocalDate(d) === formatLocalDate(now) };
  });
  return (
    <Pressable onPress={() => router.push('/(app)/calendar' as Href)} accessibilityRole="button" accessibilityLabel="Open calendar" style={[styles.week, { marginTop: spacing.md }]}>
      {days.map((d) => (
        <View key={d.key} style={styles.weekDay}>
          <Text style={[typography.caption, { color: d.today ? colors.primary : colors.text.muted }]}>{d.label}</Text>
          <View
            style={[
              styles.weekDot,
              {
                backgroundColor: active.has(d.key) ? colors.primary : colors.surface2,
                borderColor: d.today ? colors.primary : 'transparent',
              },
            ]}
          >
            {active.has(d.key) ? <Ionicons name="checkmark" size={12} color={colors.onPrimary} /> : null}
          </View>
        </View>
      ))}
      <Ionicons name="calendar-outline" size={18} color={colors.text.muted} style={{ marginLeft: 6 }} />
    </Pressable>
  );
}
