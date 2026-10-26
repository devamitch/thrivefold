import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, StyleSheet, TextInput, View } from 'react-native';
import { watchHref } from '../../../../content/exerciseVideos';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Header } from '../../../../components/ui/Header';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Chip } from '../../../../components/ui/Chip';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { formatLocalDate } from '../../../../domain/calendar/universalCalendarEngine';
import { writeWorkoutToHealthConnect } from '../../../../services/integrations/healthConnect';
import {
  exerciseById,
  planById,
  suggestNext,
  type LoggedSet,
} from '../../../../domain/fitness/workouts';
import { PressableScale } from '../../../../components/ui/PressableScale';

type Draft = Record<string, { value: string; weight: string; done: boolean }[]>;

/** Runs a workout plan: log each set, rest timer between sets, save to history. */
export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { planId, assignmentId } = useLocalSearchParams<{ planId: string; assignmentId?: string }>();
  const plan = planById(planId ?? '');
  const { colors, typography, spacing } = useTheme();
  const { sessions, saveWorkoutSession, showToast } = useRootStore(
    useShallow((s) => ({ sessions: s.workoutSessions, saveWorkoutSession: s.saveWorkoutSession, showToast: s.showToast })),
  );
  const startedAt = useRef(new Date().toISOString());
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(
      (plan?.items ?? []).map((i) => [i.exerciseId, Array.from({ length: i.sets }, () => ({ value: '', weight: '', done: false }))]),
    ),
  );
  const [effort, setEffort] = useState<number | null>(null);
  const [pain, setPain] = useState(false);
  const [rest, setRest] = useState(0);

  useEffect(() => {
    if (rest <= 0) return;
    const id = setTimeout(() => {
      setRest((r) => r - 1);
      if (rest === 1) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [rest]);

  const suggestions = useMemo(
    () => Object.fromEntries((plan?.items ?? []).map((i) => [i.exerciseId, suggestNext(i.exerciseId, i, sessions)])),
    [plan, sessions],
  );

  if (!plan) {
    return (
      <ScreenWrapper scrollable>
        <Header title="Workout" showBack />
        <Text style={[typography.subbody, { color: colors.text.secondary, padding: spacing.base }]}>
          This workout plan was not found.
        </Text>
      </ScreenWrapper>
    );
  }

  const update = (exerciseId: string, idx: number, patch: Partial<Draft[string][number]>) =>
    setDraft((d) => ({ ...d, [exerciseId]: d[exerciseId].map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));

  const completeSet = (exerciseId: string, idx: number, restSeconds: number, target: number) => {
    const current = draft[exerciseId][idx];
    update(exerciseId, idx, { done: !current.done, value: current.value || String(target) });
    if (!current.done && restSeconds > 0) setRest(restSeconds);
  };

  const loggedSets = Object.values(draft).reduce((n, sets) => n + sets.filter((s) => s.done).length, 0);

  const finish = () => {
    const entries = plan.items
      .map((i) => ({
        exerciseId: i.exerciseId,
        sets: draft[i.exerciseId]
          .filter((s) => s.done && Number(s.value) > 0)
          .map<LoggedSet>((s) => ({
            value: Number(s.value),
            ...(Number(s.weight) > 0 ? { weightKg: Number(s.weight) } : {}),
          })),
      }))
      .filter((e) => e.sets.length > 0);
    if (entries.length === 0) {
      showToast({ type: 'info', message: 'Tick at least one set as done before saving.' });
      return;
    }
    const finishedAt = new Date().toISOString();
    const sessionId = saveWorkoutSession({
      planId: plan.id,
      date: formatLocalDate(new Date()),
      startedAt: startedAt.current,
      finishedAt,
      entries,
      effort: effort ?? undefined,
      painReported: pain,
      verification: 'manual',
      assignmentId: assignmentId || undefined,
    });
    const reward = useRootStore.getState().claimWorkoutReward(sessionId, null);
    const quest = assignmentId
      ? useRootStore.getState().completeAssignmentWithWorkout(assignmentId, {
          title: plan.title,
          minutes: Math.max(1, Math.round((Date.parse(finishedAt) - Date.parse(startedAt.current)) / 60000)),
          date: formatLocalDate(new Date()),
          cameraChecked: false,
        })
      : null;
    showToast({
      type: 'success',
      title: 'Workout saved',
      message: `${loggedSets} sets logged.${reward.awarded ? ` +${reward.xp} XP.` : ''}${quest ? ` Quest done: ${quest.title}.` : ''} Use the camera coach next time for 10x XP.`,
    });
    // Shared with Health Connect only when the person allowed workout writing there.
    const { healthConnect, audit } = useRootStore.getState();
    if (healthConnect?.scopes.includes('write:ExerciseSession')) {
      writeWorkoutToHealthConnect({ title: plan.title, setting: plan.setting, startedAt: startedAt.current, finishedAt })
        .then(() => audit('sync_write', 'health_connect', `Workout "${plan.title}" written`))
        .catch(() => audit('sync_write', 'health_connect', `Workout "${plan.title}" could not be written`));
    }
    const xpEarned = (reward.awarded ? reward.xp : 0) + (quest ? quest.xp : 0);
    const store = useRootStore.getState();
    if (!store.achievementModal) {
      store.showAchievementModal({
        type: 'level_clear',
        title: 'Workout Completed',
        subtitle: `${loggedSets} sets logged${xpEarned > 0 ? ` · +${xpEarned} XP` : ''}`,
        details: `Great dedication! You completed ${plan.title}.${quest ? ` Quest done: ${quest.title}.` : ''} Use the camera coach next time for 10x XP.`,
        level: store.level,
        diamondsEarned: xpEarned > 0 ? 1 : 0,
        xpEarned,
      });
    }
    router.back();
  };

  return (
    <ScreenWrapper scrollable>
      <Header title={plan.title} subtitle={`${plan.minutes} min · ${plan.items.length} exercises`} showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        {rest > 0 ? (
          <Card variant="tinted" style={{ padding: spacing.base, marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Rest {rest}s</Text>
              <Button label="Skip rest" size="sm" variant="ghost" onPress={() => setRest(0)} />
            </View>
          </Card>
        ) : null}

        <Link href={`/(app)/health/coach/${plan.id}${assignmentId ? `?assignmentId=${assignmentId}` : ''}` as Href} asChild>
          <Card
            variant="tinted"
            style={{ padding: spacing.base, marginBottom: spacing.sm }}
          >
            <View style={styles.row}>
              <Ionicons name="videocam-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Train with the camera coach</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Tutorial video and live form check side by side. Good form earns 10x XP.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>

        {plan.items.map((item) => {
          const ex = exerciseById(item.exerciseId);
          if (!ex) return null;
          const unit = ex.timed ? 'sec' : 'reps';
          return (
            <Card key={item.exerciseId} style={{ marginTop: spacing.sm }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>{ex.name}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {item.sets} x {item.target} {unit}
                {item.restSeconds ? ` · rest ${item.restSeconds}s` : ''}
              </Text>
              <Text style={[typography.caption, { color: colors.primary, marginTop: 6 }]}>
                {suggestions[item.exerciseId]?.text}
              </Text>
              {ex.steps.map((step, i) => (
                <Text key={i} style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {i + 1}. {step}
                </Text>
              ))}
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
                Easier: {ex.easier} Harder: {ex.harder}
              </Text>
              <Text style={[typography.caption, { color: colors.warning, marginTop: 4 }]}>{ex.safety}</Text>
              <Link href={watchHref(ex.name, ex.id) as Href} asChild>
                <PressableScale
                  accessibilityRole="link"
                  style={styles.link}
                >
                  <Ionicons name="logo-youtube" size={16} color={colors.text.secondary} />
                  <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 6 }]}>
                    Watch how (video)
                  </Text>
                </PressableScale>
              </Link>

              {draft[item.exerciseId].map((set, idx) => (
                <View key={idx} style={[styles.setRow, { borderTopColor: colors.border }]}>
                  <Text style={[typography.captionBold, { color: colors.text.muted, width: 44 }]}>Set {idx + 1}</Text>
                  <TextInput
                    value={set.value}
                    onChangeText={(t) => update(item.exerciseId, idx, { value: t.replace(/[^0-9]/g, '') })}
                    placeholder={String(item.target)}
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                    accessibilityLabel={`${ex.name} set ${idx + 1} ${unit}`}
                    style={[styles.input, typography.body, { color: colors.text.primary, backgroundColor: colors.surface1 }]}
                  />
                  <Text style={[typography.caption, { color: colors.text.muted }]}>{unit}</Text>
                  {ex.weighted ? (
                    <>
                      <TextInput
                        value={set.weight}
                        onChangeText={(t) => update(item.exerciseId, idx, { weight: t.replace(/[^0-9.]/g, '') })}
                        placeholder="kg"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="decimal-pad"
                        accessibilityLabel={`${ex.name} set ${idx + 1} weight in kilograms`}
                        style={[styles.input, typography.body, { color: colors.text.primary, backgroundColor: colors.surface1 }]}
                      />
                      <Text style={[typography.caption, { color: colors.text.muted }]}>kg</Text>
                    </>
                  ) : null}
                  <PressableScale
                    onPress={() => completeSet(item.exerciseId, idx, item.restSeconds, item.target)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: set.done }}
                    accessibilityLabel={`Set ${idx + 1} done`}
                    style={styles.check}
                  >
                    <Ionicons
                      name={set.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={28}
                      color={set.done ? colors.success : colors.text.muted}
                    />
                  </PressableScale>
                </View>
              ))}
            </Card>
          );
        })}

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>How hard was it?</Text>
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          {[2, 4, 6, 8, 10].map((n) => (
            <Chip key={n} label={`${n}/10`} selected={effort === n} onPress={() => setEffort(n)} />
          ))}
        </View>
        <PressableScale
          onPress={() => setPain((p) => !p)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: pain }}
          style={[styles.painRow, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}
        >
          <Ionicons name={pain ? 'checkbox' : 'square-outline'} size={22} color={pain ? colors.primary : colors.text.muted} />
          <Text style={[typography.subbody, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
            I felt pain or discomfort
          </Text>
        </PressableScale>
        {pain ? (
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
            Next time this plan will suggest easier versions. If pain is sharp, persists or worries you, see a clinician.
          </Text>
        ) : null}

        <Button label={`Save workout (${loggedSets} sets)`} onPress={finish} style={{ marginTop: spacing.lg }} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginTop: 4 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  input: { width: 64, minHeight: 40, borderRadius: 10, paddingHorizontal: 10, textAlign: 'center' },
  check: { marginLeft: 'auto', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  painRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, minHeight: 48 },
});
