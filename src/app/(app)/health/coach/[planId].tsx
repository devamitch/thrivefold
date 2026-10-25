import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  PoseCameraView,
  poseLandmarkerAvailable,
  poseModelVersion,
  type PoseFrame,
} from 'pose-landmarker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import {
  GlassIconButton,
  GlassMarks,
  PlayPauseButton,
} from '../../../../components/ui/GlassOrbButton';
import { CallStage, type WorkoutStageMode } from '../../../../components/workout/CallStage';
import { PoseOverlay } from '../../../../components/workout/PoseOverlay';
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from '../../../../components/workout/YouTubePlayer';
import { videoFor } from '../../../../content/exerciseVideos';
import { formatLocalDate } from '../../../../domain/calendar/universalCalendarEngine';
import { exerciseById, planById, type LoggedSet } from '../../../../domain/fitness/workouts';
import {
  formQualifies,
  WORKOUT_FORM_MULTIPLIER,
  WORKOUT_XP_BASE,
  type WorkoutFormEvidence,
} from '../../../../domain/game/progression';
import { initialGestureState, stepGesture, type Gesture } from '../../../../domain/pose/gestures';
import {
  initialRepState,
  liveCue,
  movementForExercise,
  stepReps,
  summarize,
  type Landmark,
  type PoseSessionSummary,
  type RepState,
} from '../../../../domain/pose/movement';
import { writeWorkoutToHealthConnect } from '../../../../services/integrations/healthConnect';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

type Phase = 'intro' | 'live' | 'done';

interface ExerciseResult {
  sets: number[];
  summaries: PoseSessionSummary[];
}

interface DoneSummary {
  xp: number;
  rewardNote: string;
  form: WorkoutFormEvidence | null;
  lines: { name: string; detail: string }[];
}

/** Moves that raise the arms, during which hand gestures are ignored. */
const ARM_MOVES = new Set(['arm_raise', 'jumping_jack', 'bird_dog', 'warrior']);

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * AI Workout Studio Coach:
 * High-performance dual-monitoring fitness studio with video tutorial and live on-device
 * pose camera tracking. Features real-time rep counting, posture cues, dynamic Split / Focus
 * views, Skia glass media controls, and hands-free gesture interaction.
 */
export default function CoachScreen() {
  useKeepAwake();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();
  const { planId, assignmentId } = useLocalSearchParams<{
    planId: string;
    assignmentId?: string;
  }>();
  const linkedQuest = useRootStore((s) =>
    assignmentId ? s.todayQuests.find((q) => q.id === assignmentId) : undefined,
  );
  const plan = planById(planId ?? '');

  const cameraBuilt = Boolean(PoseCameraView) && poseLandmarkerAvailable();
  const [phase, setPhase] = useState<Phase>('intro');
  const [stageMode, setStageMode] = useState<WorkoutStageMode>('split');
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [itemIdx, setItemIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [rest, setRest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [controls, setControls] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rep, setRep] = useState<RepState>(initialRepState());
  const [frame, setFrame] = useState<{ landmarks: Landmark[]; w: number; h: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneSummary | null>(null);
  /** 3-2-1 before each set; reps are not counted until it reaches 0. */
  const [countdown, setCountdown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [gestureProgress, setGestureProgress] = useState<{ g: Gesture | null; p: number }>({
    g: null,
    p: 0,
  });
  const gestureRef = useRef(initialGestureState());
  const counterPulse = useSharedValue(1);
  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;

  const repRef = useRef<RepState>(initialRepState());
  const results = useRef<Record<string, ExerciseResult>>({});
  const player = useRef<YouTubePlayerHandle>(null);
  const autoPaused = useRef(false);
  const startedAt = useRef('');
  const lastUi = useRef(0);

  const counterStyle = useAnimatedStyle(() => ({ transform: [{ scale: counterPulse.value }] }));
  const item = plan?.items[itemIdx];
  const exercise = item ? exerciseById(item.exerciseId) : undefined;
  const movement = item ? movementForExercise(item.exerciseId) : undefined;
  const video = item ? videoFor(item.exerciseId) : undefined;
  const checking =
    phase === 'live' && cameraOn && Boolean(movement) && rest === 0 && countdown === 0;
  const unit = exercise?.timed || movement?.kind === 'hold' ? 's' : 'reps';

  // Workout duration timer
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Rest countdown; leads into 3-2-1
  const resting = useRef(false);
  useEffect(() => {
    if (rest > 0) {
      resting.current = true;
      const t = setTimeout(() => setRest((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
    if (resting.current) {
      resting.current = false;
      setCountdown(3);
    }
  }, [rest]);

  // 3-2-1 set countdown
  useEffect(() => {
    if (countdown <= 0) return;
    say(String(countdown));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const t = setTimeout(() => {
      setCountdown((c) => {
        if (c === 1) say('Go');
        return c - 1;
      });
    }, 900);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  const showControls = useCallback(() => setControls(true), []);

  /** Spoken vocal coach feedback */
  function say(text: string) {
    if (!voiceRef.current) return;
    Speech.stop();
    Speech.speak(text, { rate: 1.05, pitch: 1.0 });
  }

  const resetReps = () => {
    repRef.current = initialRepState();
    setRep(repRef.current);
  };

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
          detail: `${r.sets.join(' · ')} ${ex?.timed || movementForExercise(i.exerciseId)?.kind === 'hold' ? 's' : 'reps'}${score !== null ? ` · form ${score}%` : ''}`,
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
        })
          .then(() =>
            store.audit('sync_write', 'health_connect', `Workout "${plan.title}" written`),
          )
          .catch(() =>
            store.audit(
              'sync_write',
              'health_connect',
              `Workout "${plan.title}" could not be written`,
            ),
          );
      }
    }
    if (cameraOn) store.audit('device_disconnected', 'pose_camera', `${plan.title}: camera off`);
    setCameraOn(false);
    setDone({ xp, rewardNote: questNote ? `${rewardNote} ${questNote}` : rewardNote, form, lines });
    setPhase('done');
  }, [plan, cameraOn, assignmentId]);

  const completeSet = useCallback(
    (value: number) => {
      if (!plan || !item) return;
      const r = (results.current[item.exerciseId] ??= { sets: [], summaries: [] });
      r.sets.push(value);
      if (movement && repRef.current.validFrames > 0)
        r.summaries.push(summarize(movement, repRef.current));
      resetReps();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      if (autoPaused.current) {
        autoPaused.current = false;
      }
      if (setIdx + 1 < item.sets) {
        say(`Set done. Rest ${item.restSeconds} seconds.`);
        setSetIdx(setIdx + 1);
        setRest(item.restSeconds);
      } else if (itemIdx + 1 < plan.items.length) {
        say(
          `Great work. Next, ${exerciseById(plan.items[itemIdx + 1].exerciseId)?.name ?? 'the next exercise'}.`,
        );
        setItemIdx(itemIdx + 1);
        setSetIdx(0);
        setRest(item.restSeconds || 20);
      } else {
        say('Workout complete! Well done.');
        finish();
      }
      showControls();
    },
    [plan, item, movement, setIdx, itemIdx, finish, showControls],
  );

  const onGesture = useCallback(
    (g: Gesture) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      if (g === 'one_hand') {
        autoPaused.current = false;
        if (videoPlaying) {
          player.current?.pause();
          say('Video paused');
        } else {
          player.current?.play();
          say('Playing');
        }
        return;
      }
      if (rest > 0) {
        say('Skipping rest');
        setRest(0);
      } else if (countdown === 0 && item) {
        const counted =
          movement?.kind === 'hold'
            ? Math.round(repRef.current.holdMs / 1000)
            : repRef.current.reps;
        completeSet(cameraOn && movement && repRef.current.validFrames > 0 ? counted : item.target);
      }
    },
    [videoPlaying, rest, countdown, item, movement, cameraOn, completeSet],
  );

  const onPose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const { landmarks, frameWidth, frameHeight, timestamp } = e.nativeEvent;
      const now = Date.now();
      const armsBusy = checking && movement && ARM_MOVES.has(movement.id);
      if (!armsBusy) {
        const g = stepGesture(gestureRef.current, landmarks, now);
        gestureRef.current = g.state;
        if (g.fired) onGesture(g.fired);
        if (g.progress !== gestureProgress.p || g.state.current !== gestureProgress.g) {
          setGestureProgress({
            g: g.state.latched ? null : g.state.current,
            p: g.state.latched ? 0 : g.progress,
          });
        }
      }
      if (!checking || !movement || !item) {
        if (now - lastUi.current > 100) {
          lastUi.current = now;
          setFrame({ landmarks, w: frameWidth, h: frameHeight });
        }
        return;
      }
      const before = repRef.current;
      const next = stepReps(movement, before, landmarks, timestamp);
      repRef.current = next;

      // Form alert
      if (!before.fault && next.fault) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
        say(next.fault.fix);
        if (videoPlaying) {
          player.current?.pause();
          autoPaused.current = true;
        }
      } else if (before.fault && !next.fault) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        if (autoPaused.current) {
          player.current?.play();
          autoPaused.current = false;
        }
      }
      if (next.reps > before.reps) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        counterPulse.value = withSequence(
          withTiming(1.28, { duration: 120 }),
          withTiming(1, { duration: 180 }),
        );
        const left = item.target - next.reps;
        if (!next.fault && left > 0)
          say(left === 1 ? 'Last one' : left <= 3 ? `${left} to go` : String(next.reps));
      }
      if (movement.kind === 'hold') {
        const sec = Math.floor(next.holdMs / 1000);
        if (sec > 0 && sec !== Math.floor(before.holdMs / 1000)) {
          const left = item.target - sec;
          if (left === 5) say('5 seconds left');
          else if (left > 5 && sec % 10 === 0) say(`${sec} seconds`);
        }
      }

      const doneNow =
        movement.kind === 'hold' ? next.holdMs / 1000 >= item.target : next.reps >= item.target;
      if (now - lastUi.current > 100 || doneNow || next.fault !== before.fault) {
        lastUi.current = now;
        setRep(next);
        setFrame({ landmarks, w: frameWidth, h: frameHeight });
      }
      if (doneNow)
        completeSet(movement.kind === 'hold' ? Math.round(next.holdMs / 1000) : next.reps);
    },
    [checking, movement, item, videoPlaying, completeSet, gestureProgress, onGesture, counterPulse],
  );

  const manualSetDone = () => {
    if (!item) return;
    const counted =
      movement?.kind === 'hold' ? Math.round(repRef.current.holdMs / 1000) : repRef.current.reps;
    completeSet(cameraOn && movement && repRef.current.validFrames > 0 ? counted : item.target);
  };

  const start = async () => {
    let allowed = false;
    if (cameraBuilt && Platform.OS === 'android') {
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      allowed = res === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (allowed) {
      const s = useRootStore.getState();
      s.recordConsent('pose_camera', ['camera:on-device-pose'], 'granted');
      s.audit(
        'device_connected',
        'pose_camera',
        `${plan?.title ?? 'Workout'}: camera on, processed on this phone`,
      );
    }
    setCameraOn(allowed);
    startedAt.current = new Date().toISOString();
    setPhase('live');
    showControls();
    say(
      `${exercise?.name ?? 'Get ready'}. ${item?.target ?? ''} ${movementForExercise(item?.exerciseId ?? '')?.kind === 'hold' ? 'seconds' : 'reps'}.`,
    );
    setTimeout(() => setCountdown(3), 1600);
  };

  const confirmEnd = useCallback(() => {
    useRootStore.getState().showAlert({
      title: 'Finish workout early?',
      message: 'Completed sets will be logged and counted towards your XP.',
      confirmText: 'Finish and Save',
      cancelText: 'Keep Going',
      onConfirm: finish,
    });
  }, [finish]);

  useEffect(() => {
    if (phase !== 'live') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmEnd();
      return true;
    });
    return () => sub.remove();
  }, [phase, confirmEnd]);

  if (!plan || !item || !exercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[typography.body, { color: colors.text.secondary }]}>
          This workout plan was not found.
        </Text>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  // ---------------------------------------------------------------- intro
  if (phase === 'intro') {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.base,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.round, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.lg }]}>
          {plan.title}
        </Text>
        {linkedQuest ? (
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons name="flag-outline" size={16} color={colors.primary} />
            <Text
              style={[
                typography.subbodyBold,
                styles.flex,
                { color: colors.primary, marginLeft: 6 },
              ]}
            >
              For today's quest: {linkedQuest.title}. Finishing completes it.
            </Text>
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            Workout studio with real-time pose tracking. Saved directly to your calendar and health history.
          </Text>
        )}
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Watch exercise form tutorials and track your alignment simultaneously in Dual Studio mode, or switch to Focus view anytime.
        </Text>
        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          {[
            [
              'videocam-outline',
              cameraBuilt
                ? 'On-device camera counts reps and checks your posture alignment with 33 joints.'
                : 'Form checking is not available on this build; the studio still runs tutorials, sets, and rest.',
            ],
            [
              'pause-circle-outline',
              'If your posture slips, the tutorial pauses and highlights what to correct. Resumes immediately when corrected.',
            ],
            [
              'ribbon-outline',
              `Good camera-checked form (80%+) earns ${WORKOUT_XP_BASE * WORKOUT_FORM_MULTIPLIER} XP instead of ${WORKOUT_XP_BASE}.`,
            ],
            [
              'hand-left-outline',
              'Hands-free: hold one hand up to play or pause the tutorial; hold both hands up to complete set or skip rest.',
            ],
            [
              'volume-high-outline',
              'Adaptive audio coach counts reps, provides vocal cues, and announces form guidance.',
            ],
            [
              'eye-off-outline',
              '100% Private: All computer vision models process on this device. No video or photos are ever saved or transmitted.',
            ],
            [
              'phone-portrait-outline',
              'Prop your device up about 2 metres away, with your full body in view.',
            ],
          ].map(([icon, text]) => (
            <View key={text} style={[styles.row, { marginBottom: spacing.sm }]}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.subbody,
                  styles.flex,
                  { color: colors.text.secondary, marginLeft: 10 },
                ]}
              >
                {text}
              </Text>
            </View>
          ))}
        </Card>
        <Text
          style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}
        >
          Exercise Breakdown
        </Text>
        {plan.items.map((i) => {
          const ex = exerciseById(i.exerciseId);
          return (
            <View key={i.exerciseId} style={[styles.row, { marginTop: spacing.sm }]}>
              <Ionicons
                name={movementForExercise(i.exerciseId) ? 'scan-outline' : 'list-outline'}
                size={16}
                color={movementForExercise(i.exerciseId) ? colors.primary : colors.text.muted}
              />
              <Text
                style={[
                  typography.subbody,
                  styles.flex,
                  { color: colors.text.primary, marginLeft: 8 },
                ]}
              >
                {ex?.name}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {i.sets} x {i.target} {ex?.timed ? 's' : 'reps'}
              </Text>
            </View>
          );
        })}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          Exercises marked with the scan icon are automatically checked with the on-device AI pose tracker.
        </Text>
        <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.md }]}>
          {exercise.safety}
        </Text>
        <Button
          label={cameraBuilt ? 'Enable Camera & Enter Studio' : 'Start Workout'}
          size="lg"
          onPress={start}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    );
  }

  // ---------------------------------------------------------------- done
  if (phase === 'done' && done) {
    return (
      <View
        style={[
          styles.flex,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: spacing.base,
            paddingBottom: insets.bottom + spacing.base,
          },
        ]}
      >
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(300)}
          style={styles.flex}
        >
          <Text style={[typography.display, { color: colors.text.primary }]}>Workout Complete</Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            {clock(elapsed)} · {plan.title}
          </Text>
          <View
            style={[styles.xpBox, { backgroundColor: colors.primaryAlpha, marginTop: spacing.lg }]}
          >
            <Text style={[typography.display, { color: colors.primary }]}>+{done.xp} XP</Text>
            <Text
              style={[
                typography.subbody,
                { color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
              ]}
            >
              {done.rewardNote}
            </Text>
          </View>
          {done.lines.map((l) => (
            <View key={l.name} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>
                {l.name}
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>{l.detail}</Text>
            </View>
          ))}
        </Animated.View>
        <Button
          label="Done"
          size="lg"
          onPress={() => router.replace('/(app)/health/exercise' as Href)}
        />
      </View>
    );
  }

  // ---------------------------------------------------------------- live workout studio
  const fault = checking ? rep.fault : null;
  const counted = movement?.kind === 'hold' ? Math.floor(rep.holdMs / 1000) : rep.reps;
  const nextItem = rest > 0 ? (setIdx === 0 ? plan.items[itemIdx] : item) : null;

  const videoTile = (
    <YouTubePlayer
      key={item.exerciseId}
      ref={player}
      videoId={video?.videoId}
      query={`${exercise.name} proper form tutorial`}
      style={StyleSheet.absoluteFill}
      onPlayingChange={setVideoPlaying}
    />
  );

  const cameraTile =
    cameraOn && PoseCameraView ? (
      <PoseCameraView
        style={StyleSheet.absoluteFill}
        active={phase === 'live'}
        facing={facing}
        onPose={onPose}
        onPoseError={(e) => setCameraError(e.nativeEvent.message || 'Camera stream interrupted.')}
      />
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: '#13151A' }]}>
        <Ionicons name="videocam-off-outline" size={26} color="rgba(255, 255, 255, 0.45)" />
        <Text style={styles.cameraOffText}>
          {cameraBuilt ? 'Camera is currently off' : 'Camera not available'}
        </Text>
      </View>
    );

  return (
    <View style={[styles.flex, { backgroundColor: '#0B0D11' }]}>
      <StatusBar barStyle="light-content" />

      {/* Main Studio Dual Stage */}
      <CallStage
        primary={videoTile}
        secondary={cameraTile}
        insetTop={insets.top + 78}
        insetBottom={insets.bottom + 94}
        onStageTap={showControls}
        mode={stageMode}
        primaryLabel={`${exercise.name}`}
        secondaryLabel={cameraOn ? 'AI Pose Analysis' : 'Camera Off'}
        renderSecondaryOverlay={(size) => (
          <>
            {frame && cameraOn ? (
              <PoseOverlay
                landmarks={frame.landmarks}
                frameWidth={frame.w}
                frameHeight={frame.h}
                width={size.width}
                height={size.height}
                highlight={fault?.joints ?? []}
              />
            ) : null}
            {fault ? (
              <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, styles.faultBorder, { borderColor: colors.error }]}
              />
            ) : null}
          </>
        )}
      />

      {/* Top HUD: Studio Header & Quick Actions */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        {/* Exit workout button */}
        <GlassIconButton
          path={GlassMarks.close}
          accessibilityLabel="End workout"
          size={42}
          tone="neutral"
          onPress={confirmEnd}
        />

        {/* Center: Workout info & Status badges */}
        <View style={styles.topCenter}>
          <Text style={[typography.bodyBold, styles.exerciseTitle]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.pillRow}>
            <View style={[styles.statusPill, { backgroundColor: 'rgba(255, 255, 255, 0.16)' }]}>
              <Text style={styles.statusPillText}>
                SET {setIdx + 1}/{item.sets}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: 'rgba(255, 255, 255, 0.16)' }]}>
              <Ionicons name="time-outline" size={11} color="#FFFFFF" />
              <Text style={[styles.statusPillText, { marginLeft: 3 }]}>{clock(elapsed)}</Text>
            </View>
            {cameraOn && movement ? (
              <View style={[styles.statusPill, styles.trackingPill]}>
                <View style={styles.pulseDot} />
                <Text style={[styles.statusPillText, { color: '#34D399' }]}>AI ACTIVE</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* View mode toggle (Split vs PiP) */}
        <GlassIconButton
          path={stageMode === 'split' ? GlassMarks.pip : GlassMarks.split}
          accessibilityLabel={
            stageMode === 'split' ? 'Switch to focus view' : 'Switch to dual studio view'
          }
          size={42}
          tone="neutral"
          onPress={() => setStageMode((m) => (m === 'split' ? 'pip' : 'split'))}
        />
      </View>

      {/* Dynamic Reps & Form HUD Capsule */}
      <View style={[styles.hudCapsuleWrap, { top: insets.top + 62 }]} pointerEvents="box-none">
        <View style={styles.hudCapsule}>
          <View style={styles.repRow}>
            <View style={styles.repNumbers}>
              <Animated.Text
                style={[
                  styles.repBigNumber,
                  { color: fault ? colors.error : '#FFFFFF' },
                  counterStyle,
                ]}
              >
                {counted}
              </Animated.Text>
              <Text style={styles.repTargetText}>
                / {item.target} {unit.toUpperCase()}
              </Text>
            </View>

            <View style={styles.repStatusBox}>
              <Text
                style={[
                  styles.repRemainingText,
                  { color: fault ? colors.error : 'rgba(255, 255, 255, 0.75)' },
                ]}
              >
                {item.target - counted > 0 ? `${item.target - counted} to go` : 'Target reached!'}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.round((counted / item.target) * 100))}%`,
                      backgroundColor: fault ? colors.error : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Form Coach Correction Banner */}
          {fault ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(180)}
              exiting={reduceMotion ? undefined : FadeOut.duration(180)}
              style={styles.faultNotice}
            >
              <Ionicons name="warning" size={16} color="#FFA07A" />
              <View style={styles.flex}>
                <Text style={styles.faultNoticeTitle}>{fault.title}</Text>
                <Text style={styles.faultNoticeDesc}>{fault.fix}</Text>
              </View>
            </Animated.View>
          ) : checking ? (
            <View style={styles.cueRow}>
              <Ionicons name="sparkles" size={13} color="#34D399" />
              <Text style={styles.cueText} numberOfLines={1}>
                {liveCue(movement!, rep, (frame?.landmarks.length ?? 0) > 0)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Hands-free gesture HUD */}
      {gestureProgress.g && gestureProgress.p > 0 ? (
        <View pointerEvents="none" style={[styles.gestureHud, { top: insets.top + 160 }]}>
          <Ionicons name="hand-left" size={16} color="#FFFFFF" />
          <Text style={styles.gestureHudText}>
            {gestureProgress.g === 'one_hand'
              ? videoPlaying
                ? 'Pausing tutorial...'
                : 'Resuming tutorial...'
              : rest > 0
                ? 'Skipping rest...'
                : 'Logging set complete...'}
          </Text>
          <View style={styles.gestureTrack}>
            <View
              style={[
                styles.gestureFill,
                { width: `${Math.round(gestureProgress.p * 100)}%` },
              ]}
            />
          </View>
        </View>
      ) : null}

      {/* 3-2-1 Countdown Overlay */}
      {countdown > 0 ? (
        <Animated.View
          key={countdown}
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          pointerEvents="none"
          style={styles.countdownWrap}
        >
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownSub}>Get into position</Text>
        </Animated.View>
      ) : null}

      {/* Rest Interval Studio Overlay */}
      {rest > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={styles.restOverlay}
        >
          <View style={styles.restCard}>
            <Text style={styles.restTag}>REST INTERVAL</Text>
            <Text style={styles.restCountNumber}>{rest}</Text>
            <Text style={styles.restSecondsLabel}>seconds remaining</Text>

            {nextItem ? (
              <View style={styles.nextItemPreview}>
                <Text style={styles.nextItemLabel}>UP NEXT</Text>
                <Text style={styles.nextItemTitle}>
                  {exerciseById(nextItem.exerciseId)?.name}
                </Text>
                <Text style={styles.nextItemSub}>
                  Set {setIdx + 1} of {nextItem.sets} · {nextItem.target} {unit}
                </Text>
              </View>
            ) : null}

            <View style={styles.restActions}>
              <GlassIconButton
                path={GlassMarks.checkmark}
                accessibilityLabel="Skip rest interval"
                size={52}
                tone="primary"
                onPress={() => setRest(0)}
              />
              <Text style={styles.skipRestCaption}>Tap to Skip Rest</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {cameraError ? (
        <Text
          style={[
            typography.caption,
            styles.cameraError,
            { bottom: insets.bottom + 100 },
          ]}
        >
          {cameraError}
        </Text>
      ) : null}

      {/* Studio Media & Workout Dock */}
      {controls || rest > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(220)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={[styles.dockContainer, { paddingBottom: insets.bottom + 12 }]}
        >
          <View style={styles.dockBar}>
            {/* 1. Camera Flip */}
            <GlassIconButton
              path={GlassMarks.flip}
              accessibilityLabel="Flip camera"
              disabled={!cameraOn}
              size={46}
              tone="neutral"
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            />

            {/* 2. Rewind 10s */}
            <GlassIconButton
              path={GlassMarks.rewind}
              accessibilityLabel="Rewind 10 seconds"
              size={46}
              tone="neutral"
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                player.current?.seek(-10);
              }}
            />

            {/* 3. Center Hero: Skia Play/Pause Orb */}
            <PlayPauseButton
              playing={videoPlaying}
              size={68}
              onPress={() => {
                autoPaused.current = false;
                if (videoPlaying) player.current?.pause();
                else player.current?.play();
              }}
            />

            {/* 4. Forward 10s */}
            <GlassIconButton
              path={GlassMarks.forward}
              accessibilityLabel="Forward 10 seconds"
              size={46}
              tone="neutral"
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                player.current?.seek(10);
              }}
            />

            {/* 5. Voice Coach Toggle */}
            <GlassIconButton
              path={voiceOn ? GlassMarks.volume : GlassMarks.volumeMute}
              accessibilityLabel={voiceOn ? 'Mute voice coach' : 'Enable voice coach'}
              size={46}
              tone="neutral"
              onPress={() => {
                if (voiceOn) Speech.stop();
                setVoiceOn((v) => !v);
              }}
            />

            {/* 6. Complete Set */}
            <GlassIconButton
              path={GlassMarks.checkmark}
              accessibilityLabel="Complete set"
              size={50}
              tone="success"
              onPress={manualSetDone}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraError: {
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    color: '#FFFFFF',
    elevation: 25,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: 'absolute',
    zIndex: 25,
  },
  cameraOffText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 8 },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 96,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 104,
  },
  countdownSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  countdownWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    bottom: 0,
    elevation: 22,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 22,
  },
  cueRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
  },
  cueText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  dockBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 44,
    borderWidth: 1.2,
    elevation: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    width: '92%',
  },
  dockContainer: {
    alignItems: 'center',
    bottom: 0,
    elevation: 20,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  faultBorder: { borderRadius: 16, borderWidth: 4 },
  faultNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  faultNoticeDesc: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
  },
  faultNoticeTitle: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  flex: { flex: 1 },
  gestureFill: {
    backgroundColor: '#34D399',
    height: 5,
  },
  gestureHud: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 24,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    zIndex: 24,
  },
  gestureHudText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  gestureTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    height: 5,
    marginLeft: 10,
    overflow: 'hidden',
    width: 60,
  },
  hudCapsule: {
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 18,
    borderWidth: 1.2,
    elevation: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    width: '92%',
  },
  hudCapsuleWrap: {
    alignItems: 'center',
    elevation: 16,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 16,
  },
  nextItemLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextItemPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    marginTop: 18,
    padding: 12,
    width: '100%',
  },
  nextItemSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  nextItemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  pillRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  progressBarBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    height: 5,
    marginTop: 4,
    overflow: 'hidden',
    width: 100,
  },
  progressBarFill: {
    height: 5,
  },
  pulseDot: {
    backgroundColor: '#34D399',
    borderRadius: 3,
    height: 6,
    marginRight: 4,
    width: 6,
  },
  repBigNumber: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 34,
  },
  repNumbers: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  repRemainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  repRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  repStatusBox: {
    alignItems: 'flex-end',
  },
  repTargetText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  restActions: {
    alignItems: 'center',
    marginTop: 20,
  },
  restCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    borderWidth: 1.5,
    elevation: 25,
    maxWidth: 320,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    width: '85%',
  },
  restCountNumber: {
    color: '#FFFFFF',
    fontSize: 68,
    fontWeight: '800',
    lineHeight: 72,
    marginTop: 4,
  },
  restOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    bottom: 0,
    elevation: 21,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 21,
  },
  restSecondsLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: '500',
  },
  restTag: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  round: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  skipRestCaption: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    marginHorizontal: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  summaryRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  topBar: {
    alignItems: 'center',
    elevation: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 18,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  trackingPill: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  xpBox: { alignItems: 'center', borderRadius: 20, marginBottom: 16, padding: 20 },
});
