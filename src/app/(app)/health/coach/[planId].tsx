import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, PermissionsAndroid, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
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
import * as Speech from 'expo-speech';
import { PoseCameraView, poseLandmarkerAvailable, poseModelVersion, type PoseFrame } from 'pose-landmarker';

import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { PoseOverlay } from '../../../../components/workout/PoseOverlay';
import { YouTubePlayer, type YouTubePlayerHandle } from '../../../../components/workout/YouTubePlayer';
import { videoFor } from '../../../../content/exerciseVideos';
import { formatLocalDate } from '../../../../domain/calendar/universalCalendarEngine';
import { exerciseById, planById, type LoggedSet } from '../../../../domain/fitness/workouts';
import { formQualifies, WORKOUT_FORM_MULTIPLIER, WORKOUT_XP_BASE, type WorkoutFormEvidence } from '../../../../domain/game/progression';
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
import { initialGestureState, stepGesture, type Gesture } from '../../../../domain/pose/gestures';
import { writeWorkoutToHealthConnect } from '../../../../services/integrations/healthConnect';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';
import { PressableScale } from '../../../../components/ui/PressableScale';

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

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * Camera coach: the tutorial video and the on-device pose camera side by side, laid out like
 * a video call. Reps are counted from landmarks; when form slips the video pauses, the
 * camera tile shows the joints to fix and a plain instruction, and the video resumes once
 * form is back. Only derived numbers are kept. Good camera-checked form earns 10x XP.
 */
export default function CoachScreen() {
  useKeepAwake();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();
  const { planId, assignmentId } = useLocalSearchParams<{ planId: string; assignmentId?: string }>();
  const linkedQuest = useRootStore((s) => (assignmentId ? s.todayQuests.find((q) => q.id === assignmentId) : undefined));
  const plan = planById(planId ?? '');

  const cameraBuilt = Boolean(PoseCameraView) && poseLandmarkerAvailable();
  const [phase, setPhase] = useState<Phase>('intro');
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [itemIdx, setItemIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [rest, setRest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [, setControls] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rep, setRep] = useState<RepState>(initialRepState());
  const [frame, setFrame] = useState<{ landmarks: Landmark[]; w: number; h: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneSummary | null>(null);
  /** 3-2-1 before each set; reps are not counted until it reaches 0. */
  const [countdown, setCountdown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [gestureProgress, setGestureProgress] = useState<{ g: Gesture | null; p: number }>({ g: null, p: 0 });
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
  const checking = phase === 'live' && cameraOn && Boolean(movement) && rest === 0 && countdown === 0;
  const unit = exercise?.timed || movement?.kind === 'hold' ? 's' : 'reps';

  // Call timer.
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Rest countdown; when it ends, a 3-2-1 leads into the next set.
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

  // 3-2-1 before a set, spoken and shown.
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

  useEffect(() => () => {
    Speech.stop();
  }, []);

  // Controls stay on screen: taps on the video go to YouTube, so hidden controls could not
  // be brought back reliably.
  const showControls = useCallback(() => setControls(true), []);

  /** Short spoken cues; never queued behind each other, so the voice stays in time. */
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
      .map((i) => ({ exerciseId: i.exerciseId, sets: (results.current[i.exerciseId]?.sets ?? []).filter((v) => v > 0).map<LoggedSet>((value) => ({ value })) }))
      .filter((e) => e.sets.length > 0);
    const summaries = Object.values(results.current).flatMap((r) => r.summaries);
    const tracked = summaries.reduce((n, s) => n + s.validFrameCount, 0);
    const form: WorkoutFormEvidence | null = tracked
      ? { validFrames: tracked, formScore: Math.round((summaries.reduce((n, s) => n + (s.formScore ?? 0) * s.validFrameCount, 0) / tracked) * 100) / 100 }
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
        store.savePoseSession({ ...s, date: formatLocalDate(new Date()), startedAt: startedAt.current, finishedAt, modelVersion: poseModelVersion() ?? 'unknown' });
      }
      const reward = store.claimWorkoutReward(sessionId, form);
      xp = reward.xp;
      const minutes = Math.max(1, Math.round((Date.parse(finishedAt) - Date.parse(startedAt.current)) / 60000));
      // Only the quest this workout was started from can be completed by it.
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
        writeWorkoutToHealthConnect({ title: plan.title, setting: plan.setting, startedAt: startedAt.current, finishedAt })
          .then(() => store.audit('sync_write', 'health_connect', `Workout "${plan.title}" written`))
          .catch(() => store.audit('sync_write', 'health_connect', `Workout "${plan.title}" could not be written`));
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
      if (movement && repRef.current.validFrames > 0) r.summaries.push(summarize(movement, repRef.current));
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
        say(`Nice. Next, ${exerciseById(plan.items[itemIdx + 1].exerciseId)?.name ?? 'the next exercise'}.`);
        setItemIdx(itemIdx + 1);
        setSetIdx(0);
        setRest(item.restSeconds || 20);
      } else {
        say('Workout done. Well done.');
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
        const counted = movement?.kind === 'hold' ? Math.round(repRef.current.holdMs / 1000) : repRef.current.reps;
        completeSet(cameraOn && movement && repRef.current.validFrames > 0 ? counted : item.target);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video, videoPlaying, rest, countdown, item, movement, cameraOn, completeSet],
  );

  const onPose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const { landmarks, frameWidth, frameHeight, timestamp } = e.nativeEvent;
      const now = Date.now();
      // Hands-free control, except while doing a move that raises the arms.
      const armsBusy = checking && movement && ARM_MOVES.has(movement.id);
      if (!armsBusy) {
        const g = stepGesture(gestureRef.current, landmarks, now);
        gestureRef.current = g.state;
        if (g.fired) onGesture(g.fired);
        if (g.progress !== gestureProgress.p || g.state.current !== gestureProgress.g) {
          setGestureProgress({ g: g.state.latched ? null : g.state.current, p: g.state.latched ? 0 : g.progress });
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

      // Form slipped: pause the tutorial and say what to fix. Fixed: carry on.
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
        counterPulse.value = withSequence(withTiming(1.25, { duration: 120 }), withTiming(1, { duration: 180 }));
        const left = item.target - next.reps;
        if (!next.fault && left > 0) say(left === 1 ? 'Last one' : left <= 3 ? `${left} to go` : String(next.reps));
      }
      if (movement.kind === 'hold') {
        const sec = Math.floor(next.holdMs / 1000);
        if (sec > 0 && sec !== Math.floor(before.holdMs / 1000)) {
          const left = item.target - sec;
          if (left === 5) say('5 seconds left');
          else if (left > 5 && sec % 10 === 0) say(`${sec} seconds`);
        }
      }

      const doneNow = movement.kind === 'hold' ? next.holdMs / 1000 >= item.target : next.reps >= item.target;
      if (now - lastUi.current > 100 || doneNow || next.fault !== before.fault) {
        lastUi.current = now;
        setRep(next);
        setFrame({ landmarks, w: frameWidth, h: frameHeight });
      }
      if (doneNow) completeSet(movement.kind === 'hold' ? Math.round(next.holdMs / 1000) : next.reps);
    },
    [checking, movement, item, videoPlaying, completeSet, gestureProgress, onGesture, counterPulse],
  );

  const manualSetDone = () => {
    if (!item) return;
    const counted = movement?.kind === 'hold' ? Math.round(repRef.current.holdMs / 1000) : repRef.current.reps;
    // With the camera tracking, log what it counted; otherwise the planned target.
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
      s.audit('device_connected', 'pose_camera', `${plan?.title ?? 'Workout'}: camera on, processed on this phone`);
    }
    setCameraOn(allowed);
    startedAt.current = new Date().toISOString();
    setPhase('live');
    showControls();
    say(`${exercise?.name ?? 'Get ready'}. ${item?.target ?? ''} ${movementForExercise(item?.exerciseId ?? '')?.kind === 'hold' ? 'seconds' : 'reps'}.`);
    setTimeout(() => setCountdown(3), 1600);
  };

  const confirmEnd = useCallback(() => {
    useRootStore.getState().showAlert({
      title: 'End workout?',
      message: 'Sets you finished are saved and count toward your XP.',
      confirmText: 'End and save',
      cancelText: 'Keep going',
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
        <Text style={[typography.body, { color: colors.text.secondary }]}>This workout plan was not found.</Text>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  // ---------------------------------------------------------------- intro
  if (phase === 'intro') {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg, paddingHorizontal: spacing.base }}>
        <PressableScale onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={[styles.round, { backgroundColor: colors.surface1 }]}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </PressableScale>
        <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.lg }]}>{plan.title}</Text>
        {linkedQuest ? (
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons name="flag-outline" size={16} color={colors.primary} />
            <Text style={[typography.subbodyBold, styles.flex, { color: colors.primary, marginLeft: 6 }]}>
              For today's quest: {linkedQuest.title}. Finishing completes it.
            </Text>
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            A standalone workout: saved to your history and calendar. Start from a quest to complete it too.
          </Text>
        )}
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Your camera fills the stage with a live skeleton and rep count; the tutorial plays below it.
        </Text>
        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          {[
            ['videocam-outline', cameraBuilt ? 'The camera counts reps and checks your form for the exercises it knows.' : 'Form checking is not available in this build; the coach still runs videos, sets and rest.'],
            ['pause-circle-outline', 'If your form slips, the video pauses and shows exactly what to fix. It carries on when you have fixed it.'],
            ['ribbon-outline', `Good camera-checked form (80% or more) earns ${WORKOUT_XP_BASE * WORKOUT_FORM_MULTIPLIER} XP instead of ${WORKOUT_XP_BASE}.`],
            ['hand-left-outline', 'Hands-free: hold one hand above your head to play or pause the video, both hands to finish a set or skip a rest.'],
            ['volume-high-outline', 'A voice counts you in, counts your reps and tells you what to fix. You can mute it.'],
            ['eye-off-outline', 'Everything runs on this phone. No photos or video are saved or sent.'],
            ['phone-portrait-outline', 'Prop the phone up about two metres away, side-on, with your whole body in view.'],
          ].map(([icon, text]) => (
            <View key={text} style={[styles.row, { marginBottom: spacing.sm }]}>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 10 }]}>{text}</Text>
            </View>
          ))}
        </Card>
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>In this workout</Text>
        {plan.items.map((i) => {
          const ex = exerciseById(i.exerciseId);
          return (
            <View key={i.exerciseId} style={[styles.row, { marginTop: spacing.sm }]}>
              <Ionicons
                name={movementForExercise(i.exerciseId) ? 'scan-outline' : 'list-outline'}
                size={16}
                color={movementForExercise(i.exerciseId) ? colors.primary : colors.text.muted}
              />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>{ex?.name}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {i.sets} x {i.target} {ex?.timed ? 's' : 'reps'}
              </Text>
            </View>
          );
        })}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          Exercises marked with the scan icon are checked by the camera.
        </Text>
        <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.md }]}>{exercise.safety}</Text>
        <Button label={cameraBuilt ? 'Allow camera and start' : 'Start'} size="lg" onPress={start} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    );
  }

  // ---------------------------------------------------------------- done
  if (phase === 'done' && done) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.base, paddingBottom: insets.bottom + spacing.base }]}>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(300)} style={styles.flex}>
          <Text style={[typography.display, { color: colors.text.primary }]}>Workout done</Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>{clock(elapsed)} · {plan.title}</Text>
          <View style={[styles.xpBox, { backgroundColor: colors.primaryAlpha, marginTop: spacing.lg }]}>
            <Text style={[typography.display, { color: colors.primary }]}>+{done.xp} XP</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, textAlign: 'center' }]}>{done.rewardNote}</Text>
          </View>
          {done.lines.map((l) => (
            <View key={l.name} style={styles.summaryRow}>
              <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>{l.name}</Text>
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>{l.detail}</Text>
            </View>
          ))}
        </Animated.View>
        <Button label="Done" size="lg" onPress={() => router.replace('/(app)/health/exercise' as Href)} />
      </View>
    );
  }

  // ---------------------------------------------------------------- live call
  const fault = checking ? rep.fault : null;
  const counted = movement?.kind === 'hold' ? Math.floor(rep.holdMs / 1000) : rep.reps;
  const nextItem = rest > 0 ? (setIdx === 0 ? plan.items[itemIdx] : item) : null;

  // Every exercise has a tutorial in the app: the verified video, or YouTube search for it.
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
        onPoseError={(e) => setCameraError(e.nativeEvent.message || 'The camera stopped.')}
      />
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.callBackground }]}>
        <Ionicons name="videocam-off-outline" size={22} color={colors.callMuted} />
        <Text style={[typography.caption, { color: colors.callMuted, marginTop: 4, textAlign: 'center' }]}>Camera off</Text>
      </View>
    );

  const remaining = Math.max(0, item.target - counted);
  const share = Math.min(1, counted / Math.max(1, item.target));
  const upNext = setIdx + 1 < item.sets ? { ex: exercise, set: setIdx + 2, of: item.sets } : plan.items[itemIdx + 1]
    ? { ex: exerciseById(plan.items[itemIdx + 1].exerciseId), set: 1, of: plan.items[itemIdx + 1].sets }
    : null;
  const cameraMain = cameraOn && Boolean(PoseCameraView);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header: what you're doing and where you are in the plan */}
      <View style={[styles.header, { paddingHorizontal: spacing.base }]}>
        <RoundButton icon="close" label="End workout" onPress={confirmEnd} />
        <View style={[styles.flex, { marginHorizontal: 12 }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
            Exercise {itemIdx + 1} of {plan.items.length} · {clock(elapsed)}
          </Text>
        </View>
        <RoundButton
          icon={voiceOn ? 'volume-high-outline' : 'volume-mute-outline'}
          label={voiceOn ? 'Mute voice coach' : 'Turn on voice coach'}
          onPress={() => {
            if (voiceOn) Speech.stop();
            setVoiceOn((v) => !v);
          }}
        />
      </View>
      <View style={[styles.sets, { paddingHorizontal: spacing.base }]} accessibilityLabel={`Set ${setIdx + 1} of ${item.sets}`}>
        {Array.from({ length: item.sets }, (_, i) => (
          <View
            key={i}
            style={[styles.setSeg, { backgroundColor: i < setIdx ? colors.primary : i === setIdx ? colors.primaryAlpha : colors.surface1 }]}
          />
        ))}
      </View>

      {/* Stage: your camera with the skeleton, or the tutorial when the camera is off */}
      <View
        style={[styles.stage, { marginHorizontal: spacing.base, backgroundColor: colors.callBackground }]}
        onLayout={(e) => setStage({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        collapsable={false}
      >
        {cameraMain ? cameraTile : videoTile}
        {cameraMain && frame && stage.width > 0 ? (
          <PoseOverlay landmarks={frame.landmarks} frameWidth={frame.w} frameHeight={frame.h} width={stage.width} height={stage.height} highlight={fault?.joints ?? []} />
        ) : null}
        {fault ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.faultEdge, { borderColor: colors.error }]} /> : null}

        {cameraMain ? (
          <View style={styles.stageTop} pointerEvents="box-none">
            <View style={[styles.chip, { backgroundColor: colors.callSurface }]}>
              <View style={[styles.dot, { backgroundColor: movement ? colors.success : colors.callMuted }]} />
              <Text style={[typography.captionBold, { color: colors.callText }]}>{movement ? 'Checking form' : 'Camera on'}</Text>
            </View>
            <PressableScale
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
              hitSlop={8}
              style={[styles.stageBtn, { backgroundColor: colors.callSurface }]}
            >
              <Ionicons name="camera-reverse-outline" size={18} color={colors.callText} />
            </PressableScale>
          </View>
        ) : null}

        {/* What to fix, a gesture in progress, or the live cue */}
        {gestureProgress.g && gestureProgress.p > 0 ? (
          <View pointerEvents="none" style={[styles.stageBanner, { backgroundColor: colors.primary }]}>
            <Ionicons name="hand-left-outline" size={18} color={colors.onPrimary} />
            <Text style={[typography.bodyBold, styles.flex, { color: colors.onPrimary, marginLeft: 8 }]}>
              {gestureProgress.g === 'one_hand' ? (videoPlaying ? 'Pausing video' : 'Playing video') : rest > 0 ? 'Skipping rest' : 'Finishing set'}
            </Text>
            <View style={[styles.gestureTrack, { backgroundColor: colors.callSurfaceStrong }]}>
              <View style={[styles.gestureFill, { width: `${Math.round(gestureProgress.p * 100)}%`, backgroundColor: colors.onPrimary }]} />
            </View>
          </View>
        ) : fault ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(180)}
            exiting={reduceMotion ? undefined : FadeOut.duration(180)}
            style={[styles.stageBanner, { backgroundColor: colors.callSurface }]}
            accessibilityLiveRegion="assertive"
          >
            <View style={[styles.faultDot, { backgroundColor: colors.error }]}>
              <Ionicons name="alert" size={16} color={colors.callText} />
            </View>
            <View style={[styles.flex, { marginLeft: 10 }]}>
              <Text style={[typography.bodyBold, { color: colors.callText }]}>{fault.title}</Text>
              <Text style={[typography.subbody, { color: colors.callMuted, marginTop: 1 }]}>{fault.fix}</Text>
            </View>
          </Animated.View>
        ) : checking ? (
          <View pointerEvents="none" style={[styles.stageBanner, styles.cue, { backgroundColor: colors.callSurface }]}>
            <Text style={[typography.subbody, { color: colors.callText, textAlign: 'center' }]} numberOfLines={2}>
              {liveCue(movement!, rep, (frame?.landmarks.length ?? 0) > 0)}
            </Text>
          </View>
        ) : null}

        {/* The count */}
        <View
          style={[styles.counter, { backgroundColor: fault ? colors.error : colors.callSurface }]}
          accessibilityLabel={`${counted} of ${item.target} ${unit}. ${remaining} to go`}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.counterRow}>
            <Animated.Text style={[typography.display, styles.counterBig, { color: colors.callText }, counterStyle]}>{counted}</Animated.Text>
            <Text style={[typography.bodyBold, { color: colors.callMuted, marginLeft: 6 }]}>/ {item.target} {unit}</Text>
          </View>
          <View style={[styles.counterTrack, { backgroundColor: colors.callSurfaceStrong }]}>
            <View style={[styles.counterFill, { width: `${Math.round(share * 100)}%`, backgroundColor: colors.callText }]} />
          </View>
          <Text style={[typography.caption, { color: colors.callMuted, marginTop: 4 }]}>
            {remaining > 0 ? `${remaining} to go` : 'Target reached'}
          </Text>
        </View>
      </View>

      {/* Tutorial and what's next */}
      <View style={[styles.lower, { marginHorizontal: spacing.base }]}>
        <View style={[styles.tutorial, { backgroundColor: colors.callBackground }]}>
          {cameraMain ? videoTile : (
            <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="videocam-off-outline" size={20} color={colors.text.muted} />
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4, textAlign: 'center' }]}>
                {cameraBuilt ? 'Camera off' : 'No camera check in this build'}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.flex, styles.nextCol]}>
          <Text style={[typography.label, { color: colors.text.muted }]}>Up next</Text>
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]} numberOfLines={2}>
            {upNext ? `${upNext.ex?.name ?? 'Exercise'}` : 'Last set'}
          </Text>
          {upNext ? (
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Set {upNext.set} of {upNext.of}</Text>
          ) : null}
          <PressableScale
            onPress={() => {
              autoPaused.current = false;
              if (videoPlaying) player.current?.pause();
              else player.current?.play();
            }}
            accessibilityRole="button"
            style={[styles.playBtn, { backgroundColor: colors.surface1, opacity: 1 }]}
          >
            <Ionicons name={videoPlaying ? 'pause' : 'play'} size={16} color={colors.text.primary} />
            <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>{videoPlaying ? 'Pause tutorial' : 'Play tutorial'}</Text>
          </PressableScale>
        </View>
      </View>

      {cameraError ? (
        <Text style={[typography.caption, { color: colors.error, marginHorizontal: spacing.base, marginTop: 6 }]}>{cameraError}</Text>
      ) : null}

      <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.sm }}>
        <Button label={remaining > 0 ? 'Set done' : 'Next'} size="lg" onPress={manualSetDone} />
      </View>

      {/* 3-2-1 before each set */}
      {countdown > 0 ? (
        <Animated.View key={countdown} entering={reduceMotion ? undefined : FadeIn.duration(150)} pointerEvents="none" style={[styles.overlay, { backgroundColor: colors.scrim }]}>
          <Text style={[typography.display, styles.overlayNumber, { color: colors.callText }]}>{countdown}</Text>
          <Text style={[typography.body, { color: colors.callText }]}>Get into position</Text>
        </Animated.View>
      ) : null}

      {/* Rest between sets */}
      {rest > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={[styles.overlay, { backgroundColor: colors.scrim }]}
        >
          <Text style={[typography.label, { color: colors.callMuted }]}>Rest</Text>
          <Text style={[typography.display, styles.overlayNumber, { color: colors.callText }]}>{rest}</Text>
          {nextItem ? (
            <Text style={[typography.body, { color: colors.callText }]}>
              Next: {exerciseById(nextItem.exerciseId)?.name}, set {setIdx + 1}
            </Text>
          ) : null}
          <PressableScale
            onPress={() => setRest(0)}
            accessibilityRole="button"
            style={[styles.skip, { backgroundColor: colors.callSurfaceStrong, opacity: 1 }]}
          >
            <Text style={[typography.bodyBold, { color: colors.callText }]}>Skip rest</Text>
          </PressableScale>
        </Animated.View>
      ) : null}
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.round, { backgroundColor: colors.surface1, opacity: 1 }]}
    >
      <Ionicons name={icon} size={20} color={colors.text.primary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 8 },
  chip: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  counter: { borderRadius: 20, bottom: 12, left: 12, minWidth: 150, paddingHorizontal: 14, paddingVertical: 10, position: 'absolute' },
  counterBig: { fontSize: 48, lineHeight: 52 },
  counterFill: { borderRadius: 2, height: 4 },
  counterRow: { alignItems: 'baseline', flexDirection: 'row' },
  counterTrack: { borderRadius: 2, height: 4, marginTop: 4, overflow: 'hidden' },
  cue: { justifyContent: 'center' },
  dot: { borderRadius: 4, height: 8, width: 8 },
  faultDot: { alignItems: 'center', borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  faultEdge: { borderRadius: 28, borderWidth: 4 },
  flex: { flex: 1 },
  gestureFill: { height: 6 },
  gestureTrack: { borderRadius: 3, height: 6, marginLeft: 10, overflow: 'hidden', width: 60 },
  header: { alignItems: 'center', flexDirection: 'row', paddingVertical: 8 },
  lower: { flexDirection: 'row', gap: 12, height: 128, marginTop: 12 },
  nextCol: { justifyContent: 'center' },
  overlay: { alignItems: 'center', bottom: 0, elevation: 19, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 19 },
  overlayNumber: { fontSize: 80, lineHeight: 88 },
  playBtn: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 14, flexDirection: 'row', marginTop: 10, paddingHorizontal: 12, paddingVertical: 8 },
  round: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  row: { alignItems: 'center', flexDirection: 'row' },
  setSeg: { borderRadius: 3, flex: 1, height: 6 },
  sets: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  skip: { borderRadius: 22, marginTop: 16, paddingHorizontal: 22, paddingVertical: 12 },
  stage: { borderRadius: 28, flex: 1, overflow: 'hidden' },
  stageBanner: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', left: 12, paddingHorizontal: 14, paddingVertical: 12, position: 'absolute', right: 12, top: 56 },
  stageBtn: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  stageTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', left: 12, position: 'absolute', right: 12, top: 12 },
  summaryRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12 },
  tutorial: { aspectRatio: 16 / 9, borderRadius: 20, height: '100%', overflow: 'hidden' },
  xpBox: { alignItems: 'center', borderRadius: 20, marginBottom: 16, padding: 20 },
});
