/**
 * useCoachSession — core state machine for the workout coach.
 *
 * Manages phase transitions (intro → live → done), exercise progression,
 * set/rep tracking, rest timers, and session completion/saving.
 */

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import { poseModelVersion } from 'pose-landmarker';
import { useCallback, useEffect, useRef, useState } from 'react';

import { speakCoach } from '@/services/ai/coachVoiceService';

import { formatLocalDate } from '@/domain/calendar/universalCalendarEngine';
import { exerciseById, planById, type LoggedSet } from '@/domain/fitness/workouts';
import {
  formQualifies,
  WORKOUT_FORM_MULTIPLIER,
  type WorkoutFormEvidence,
} from '@/domain/game/progression';
import { restTipLine, setDoneLine, setIntroLine } from '@/domain/pose/coachVoice';
import {
  movementForExercise,
  setProgress,
  type MovementDefinition,
  type PoseSessionSummary,
  type RepState,
} from '@/domain/pose/movement';
import { writeWorkoutToHealthConnect } from '@/services/integrations/healthConnect';
import { useRootStore } from '@/stores/useRootStore';

export type Phase = 'intro' | 'live' | 'done';

export interface ExerciseResult {
  sets: number[];
  summaries: PoseSessionSummary[];
}

export interface DoneSummary {
  xp: number;
  rewardNote: string;
  form: WorkoutFormEvidence | null;
  lines: { name: string; detail: string }[];
}

/** Short spoken cues; never queued behind each other, so the voice stays in time. */
export function say(text: string, voiceOn: boolean) {
  if (!voiceOn) return;
  void speakCoach(text, voiceOn);
}

export const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

interface UseCoachSessionOpts {
  planId: string;
  assignmentId?: string;
}

export function useCoachSession({ planId, assignmentId }: UseCoachSessionOpts) {
  useKeepAwake();
  const plan = planById(planId ?? '');

  const [phase, setPhase] = useState<Phase>('intro');
  const [itemIdx, setItemIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [rest, setRest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [done, setDone] = useState<DoneSummary | null>(null);

  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;
  const results = useRef<Record<string, ExerciseResult>>({});
  const startedAt = useRef('');
  const idleNudged = useRef(false);
  const introMs = useRef(0);
  const resting = useRef(false);
  const restTotal = useRef(0);

  const item = plan?.items[itemIdx];
  const exercise = item ? exerciseById(item.exerciseId) : undefined;
  const movement: MovementDefinition | undefined = item
    ? movementForExercise(item.exerciseId)
    : undefined;
  const unit = exercise?.timed || movement?.kind === 'hold' ? 's' : 'reps';
  const timed = Boolean(exercise?.timed);

  const progressOf = (s: RepState) => (movement ? setProgress(movement, s, timed) : 0);

  const linkedQuest = useRootStore((s) =>
    assignmentId ? s.todayQuests.find((q) => q.id === assignmentId) : undefined,
  );

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Rest countdown → auto count-in after rest
  useEffect(() => {
    if (rest > 0) {
      if (!resting.current) restTotal.current = rest;
      resting.current = true;
      if (restTotal.current >= 20 && rest === Math.floor(restTotal.current / 2) && item) {
        const nextMove = movementForExercise(item.exerciseId);
        say(
          restTipLine(exerciseById(item.exerciseId)?.name ?? 'the next set', nextMove?.cue),
          voiceRef.current,
        );
      }
      const t = setTimeout(() => setRest((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
    if (resting.current) {
      resting.current = false;
      setCountdown(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest]);

  // 3-2-1 countdown
  useEffect(() => {
    if (countdown <= 0) return;
    if (countdown === 3 && item && exercise) {
      const intro = setIntroLine(
        exercise.name,
        setIdx + 1,
        item.sets,
        item.target,
        unit,
        movement?.cue,
      );
      introMs.current = Math.min(7000, 900 + intro.length * 60);
      say(`${intro} 3`, voiceRef.current);
    } else {
      say(String(countdown), voiceRef.current);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const t = setTimeout(
      () => {
        setCountdown((c) => {
          if (c === 1) say('Go', voiceRef.current);
          return c - 1;
        });
      },
      countdown === 3 && introMs.current ? introMs.current : 900,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  // Finish workout and save session
  const finish = useCallback(() => {
    if (!plan) return;
    const entries = plan.items
      .map((i) => ({
        exerciseId: i.exerciseId,
        sets: (results.current[i.exerciseId]?.sets ?? [])
          .filter((v) => v > 0)
          .map<LoggedSet>((value) => ({ value })),
      }))
      .filter((e) => e.sets.length > 0);
    const summaries = Object.values(results.current).flatMap((r) => r.summaries);
    const tracked = summaries.reduce((n, s) => n + s.validFrameCount, 0);
    const form: WorkoutFormEvidence | null = tracked
      ? {
          validFrames: tracked,
          formScore:
            Math.round(
              (summaries.reduce((n, s) => n + (s.formScore ?? 0) * s.validFrameCount, 0) /
                tracked) *
                100,
            ) / 100,
        }
      : null;
    const lines = plan.items
      .map((i) => {
        const r = results.current[i.exerciseId];
        if (!r || r.sets.length === 0) return null;
        const ex = exerciseById(i.exerciseId);
        const checked = r.summaries.filter((s) => s.validFrameCount > 0);
        const score = checked.length
          ? Math.round((checked.reduce((n, s) => n + (s.formScore ?? 0), 0) / checked.length) * 100)
          : null;
        return {
          name: ex?.name ?? i.exerciseId,
          detail: `${r.sets.join(' · ')} ${
            ex?.timed || movementForExercise(i.exerciseId)?.kind === 'hold' ? 's' : 'reps'
          }${score !== null ? ` · form ${score}%` : ''}`,
        };
      })
      .filter((l): l is { name: string; detail: string } => l !== null);

    const store = useRootStore.getState();
    const finishedAt = new Date().toISOString();
    let xp = 0;
    let rewardNote = 'Nothing was logged, so nothing was saved.';
    let questNote: string | null = null;

    if (entries.length > 0) {
      const sessionId = store.saveWorkoutSession({
        planId: plan.id,
        date: formatLocalDate(new Date()),
        startedAt: startedAt.current,
        finishedAt,
        entries,
        painReported: false,
        verification: form ? 'camera' : 'manual',
        assignmentId: assignmentId || undefined,
      });
      for (const s of summaries.filter((x) => x.reps > 0)) {
        store.savePoseSession({
          ...s,
          date: formatLocalDate(new Date()),
          startedAt: startedAt.current,
          finishedAt,
          modelVersion: poseModelVersion() ?? 'unknown',
        });
      }
      const reward = store.claimWorkoutReward(sessionId, form);
      xp = reward.xp;
      const minutes = Math.max(
        1,
        Math.round((Date.parse(finishedAt) - Date.parse(startedAt.current)) / 60000),
      );

      try {
        const { smartAggregations } = require('@/services/telemetry/smartAggregations');
        const totalReps = entries.reduce(
          (acc, e) => acc + e.sets.reduce((sAcc, s) => sAcc + s.value, 0),
          0,
        );
        smartAggregations.trackCoachSession({
          exerciseId: plan.id,
          reps: totalReps,
          targetReps: plan.items.reduce((acc, i) => acc + i.target, 0),
          durationMs: Date.parse(finishedAt) - Date.parse(startedAt.current),
          cleanFormPct: form?.formScore ?? 1,
        });
      } catch {}

      const quest = assignmentId
        ? store.completeAssignmentWithWorkout(assignmentId, {
            title: plan.title,
            minutes,
            date: formatLocalDate(new Date()),
            cameraChecked: Boolean(form),
          })
        : null;
      if (quest) {
        xp += quest.xp;
        questNote = `Also completed today's quest: ${quest.title}.`;
      }
      rewardNote = reward.awarded
        ? formQualifies(form)
          ? `Form-checked: ${WORKOUT_FORM_MULTIPLIER}x XP.`
          : form
            ? `Form score ${Math.round(form.formScore * 100)}%. Reach 80% with the camera for ${WORKOUT_FORM_MULTIPLIER}x XP.`
            : `Turn the camera on next time for ${WORKOUT_FORM_MULTIPLIER}x XP.`
        : reward.reason === 'daily_limit'
          ? 'Saved. Workout XP is paid for two workouts a day.'
          : 'Saved.';
      if (store.healthConnect?.scopes.includes('write:ExerciseSession')) {
        writeWorkoutToHealthConnect({
          title: plan.title,
          setting: plan.setting,
          startedAt: startedAt.current,
          finishedAt,
        }).catch(() => undefined);
      }
      if (!useRootStore.getState().achievementModal && xp > 0) {
        store.showAchievementModal({
          type: 'level_clear',
          title: 'Movement Milestone',
          subtitle: `Earned +${xp} XP`,
          details: form && form.formScore >= 0.8
            ? `Form score ${Math.round(form.formScore * 100)}%! Clean movement and focused posture rewarded with high-precision XP.`
            : `Great consistency! You completed ${plan.title} with dedication.`,
          level: useRootStore.getState().level,
          diamondsEarned: 1,
          xpEarned: xp,
        });
      }
    }
    setDone({ xp, rewardNote: questNote ? `${rewardNote} ${questNote}` : rewardNote, form, lines });
    setPhase('done');
  }, [plan, assignmentId]);

  // Complete a set, move to next set/exercise/finish
  const completeSet = useCallback(
    (value: number) => {
      if (!plan || !item) return;
      const r = (results.current[item.exerciseId] ??= { sets: [], summaries: [] });
      r.sets.push(value);
      idleNudged.current = false;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      if (setIdx + 1 < item.sets) {
        say(setDoneLine(value, item.target, unit, item.restSeconds, null), voiceRef.current);
        setSetIdx(setIdx + 1);
        setRest(item.restSeconds);
      } else if (itemIdx + 1 < plan.items.length) {
        say(
          `Nice. Next, ${exerciseById(plan.items[itemIdx + 1].exerciseId)?.name ?? 'the next exercise'}.`,
          voiceRef.current,
        );
        setItemIdx(itemIdx + 1);
        setSetIdx(0);
        setRest(item.restSeconds || 20);
      } else {
        say('Workout done. Well done.', voiceRef.current);
        finish();
      }
    },
    [plan, item, setIdx, itemIdx, finish, unit],
  );

  return {
    plan,
    phase,
    setPhase,
    itemIdx,
    setItemIdx,
    setIdx,
    setSetIdx,
    rest,
    setRest,
    restTotal,
    elapsed,
    countdown,
    setCountdown,
    voiceOn,
    setVoiceOn,
    done,
    item,
    exercise,
    movement,
    unit,
    timed,
    progressOf,
    linkedQuest,
    results,
    startedAt,
    idleNudged,
    introMs,
    voiceRef,
    finish,
    completeSet,
    clock,
    say: (text: string) => say(text, voiceRef.current),
  };
}
