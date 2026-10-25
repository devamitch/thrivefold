import React, { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter, type Href , Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityRow } from '../../../components/game/ActivityRow';
import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';

import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
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
const TRAIN_TOOLS: { icon: keyof typeof Ionicons.glyphMap; label: string; route: Href }[] = [
  { icon: 'library-outline', label: 'Library', route: '/(app)/train/library' as Href },
  { icon: 'create-outline', label: 'Log reps', route: '/(app)/train/log' as Href },
  { icon: 'bicycle-outline', label: 'Run or sport', route: '/(app)/health/activity' as Href },
  { icon: 'scan-outline', label: 'Form check', route: '/(app)/health/pose-check' as Href },
];

export function WorkoutsHub({ asTab = false }: { asTab?: boolean }) {
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
      <Header title="Train" subtitle="Camera coach, plans and your progress" showBack={!asTab} />
      <SquircleSurface style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card variant="surface1" style={{ padding: spacing.base }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {minutes} active minutes in the last 7 days
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
            {week} plan workout{week === 1 ? '' : 's'} · {activitiesThisWeek(activities, today)} other activities.
            Many adults aim for about 150 minutes of moderate activity a week.
          </Text>
          <WeekStrip />
          <SquircleSurface style={[styles.tools, { marginTop: spacing.md }]}>
            {TRAIN_TOOLS.map((t) => (
              <Link key={t.label} href={t.route} asChild>
                <PressableScale style={styles.toolCell} accessibilityRole="button" accessibilityLabel={t.label}>
                  <SquircleSurface radius={16} fill={colors.surface} style={styles.tool}>
                    <Ionicons name={t.icon} size={20} color={colors.primary} />
                    <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 6 }]} numberOfLines={1}>
                      {t.label}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              </Link>
            ))}
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Never train through sharp pain, chest pain or dizziness. General fitness guidance, not medical advice.
          </Text>
        </Card>

        {movementQuest ? (
          <>
            <Text style={[typography.label, { color: colors.text.muted, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Today&apos;s movement quest</Text>
            <Link href={`/(app)/health/coach/${suggestions[0]?.plan.id ?? 'desk_reset'}?assignmentId=${movementQuest.id}` as Href} asChild>
              <ActivityRow
                icon="flag-outline"
                title={movementQuest.title}
                meta={`With the camera coach · finishing it completes the quest · +${movementQuest.xpReward} XP`}
                done={movementQuest.isCompleted}
                action="Start"
                highlight
              />
            </Link>
          </>
        ) : null}

        {suggestions.length > 0 ? (
          <>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Suggested for you today</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Tap to start with video, rep counting and form check. Saved to your history and calendar.
            </Text>
            <SquircleSurface style={{ marginTop: spacing.sm }}>
              {suggestions.map(({ plan, reason }) => (
                <Link key={plan.id} href={`/(app)/health/coach/${plan.id}` as Href} asChild>
                  <ActivityRow
                    icon="videocam-outline"
                    title={plan.title}
                    meta={`${plan.minutes} min · ${reason}`}
                    action="Start"
                  />
                </Link>
              ))}
            </SquircleSurface>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>All plans</Text>
          </>
        ) : null}

        <SquircleSurface style={[styles.chips, { marginTop: spacing.md }]}>
          {SETTINGS.map((s) => (
            <Chip key={s.id} label={s.label} selected={filter === s.id} onPress={() => setFilter(s.id)} />
          ))}
        </SquircleSurface>

        <SquircleSurface style={{ marginTop: spacing.sm }}>
          {plans.map((plan) => (
            <Link key={plan.id} href={`/(app)/health/workout/${plan.id}` as Href} asChild>
              <ActivityRow
                icon="barbell-outline"
                title={plan.title}
                meta={`${plan.level === 'beginner' ? 'Beginner' : 'Intermediate'} · ${plan.minutes} min · ${plan.items.map((i) => exerciseById(i.exerciseId)?.name).join(', ')}`}
              />
            </Link>
          ))}
        </SquircleSurface>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>History</Text>
        {sessions.length === 0 ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            No workouts logged yet. Start a plan above; every set you log shows up here.
          </Text>
        ) : (
          <SquircleSurface style={{ marginTop: spacing.sm }}>
            {sessions.slice(0, 20).map((s) => {
              const sets = s.entries.reduce((n, e) => n + e.sets.length, 0);
              const title =
                planById(s.planId)?.title ?? (s.entries.length === 1 ? exerciseById(s.entries[0].exerciseId)?.name ?? 'Workout' : 'Workout');
              const meta = [
                new Date(`${s.date}T12:00:00`).toLocaleDateString(),
                `${sets} sets`,
                s.verification === 'camera' ? 'camera-checked' : s.verification === 'manual' ? 'self-reported' : null,
                s.effort ? `effort ${s.effort}/10` : null,
                s.painReported ? 'discomfort noted' : null,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <Link key={s.id} href={`/(app)/train/session/${s.id}` as Href} asChild>
                  <ActivityRow
                    icon="checkmark"
                    title={title}
                    meta={meta}
                    trailing={
                      <PressableScale
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
                      </PressableScale>
                    }
                  />
                </Link>
              );
            })}
          </SquircleSurface>
        )}
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  week: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekDot: { alignItems: 'center', borderRadius: 13, height: 26, justifyContent: 'center', width: 26 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tools: { flexDirection: 'row', gap: 8 },
  toolCell: { flex: 1 },
  tool: { alignItems: 'center', paddingVertical: 12 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

export default function WorkoutsScreen() {
  return <WorkoutsHub />;
}

/** This week, Monday to Sunday: a filled day had a workout or logged activity. Opens the calendar. */
function WeekStrip() {
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
    <Link href={'/(app)/calendar' as Href} asChild>
      <PressableScale accessibilityRole="button" accessibilityLabel="Open calendar" style={[styles.week, { marginTop: spacing.md }]}>
        {days.map((d) => (
          <SquircleSurface key={d.key} style={styles.weekDay}>
            <Text style={[typography.caption, { color: d.today ? colors.primary : colors.text.muted }]}>{d.label}</Text>
            <SquircleSurface
              style={[
                styles.weekDot,
                {
                  backgroundColor: active.has(d.key) ? colors.primary : colors.surface2,
                  borderColor: d.today ? colors.primary : 'transparent',
                },
              ]}
            >
              {active.has(d.key) ? <Ionicons name="checkmark" size={12} color={colors.onPrimary} /> : null}
            </SquircleSurface>
          </SquircleSurface>
        ))}
        <Ionicons name="calendar-outline" size={18} color={colors.text.muted} style={{ marginLeft: 6 }} />
      </PressableScale>
    </Link>
  );
}
