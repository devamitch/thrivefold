import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, PermissionsAndroid, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { PoseCameraView, poseLandmarkerAvailable, poseModelVersion, type PoseFrame } from 'pose-landmarker';

import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { CallStage } from '../../../../components/workout/CallStage';
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
  const [controls, setControls] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rep, setRep] = useState<RepState>(initialRepState());
  const [frame, setFrame] = useState<{ landmarks: Landmark[]; w: number; h: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneSummary | null>(null);
  /** 3-2-1 before each set; reps are not counted until it reaches 0. */
  const [countdown, setCountdown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
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
        counterPulse.value = withSequence(withTiming(1.25, { duration: 120 }), withSpring(1, { damping: 8 }));
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
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={[styles.round, { backgroundColor: colors.surface1 }]}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
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
          The tutorial plays full screen with your camera in the corner, like a video call. Tap the small window to swap,
          drag it to move it.
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
            <View key={l.name} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
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
      <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.surface1 }]}>
        <Ionicons name="videocam-off-outline" size={22} color={colors.text.muted} />
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4, textAlign: 'center' }]}>Camera off</Text>
      </View>
    );

  return (
    <View style={[styles.flex, { backgroundColor: colors.text.primary }]}>
      <StatusBar barStyle="light-content" />
      <CallStage
        primary={videoTile}
        secondary={cameraTile}
        insetTop={insets.top + 76}
        insetBottom={insets.bottom + 108}
        onStageTap={showControls}
        renderSecondaryOverlay={(size) => (
          <>
            {frame && cameraOn ? (
              <PoseOverlay landmarks={frame.landmarks} frameWidth={frame.w} frameHeight={frame.h} width={size.width} height={size.height} highlight={fault?.joints ?? []} />
            ) : null}
            {fault ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.faultBorder, { borderColor: colors.error }]} /> : null}
          </>
        )}
      />

      {/* Top bar: like a call header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.onPrimary }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={[typography.caption, { color: colors.onPrimary, opacity: 0.8 }]}>
            Set {setIdx + 1} of {item.sets} · {clock(elapsed)}
            {movement && cameraOn ? ' · form check on' : ''}
          </Text>
        </View>
        <View style={styles.counter} accessibilityLabel={`${counted} of ${item.target} ${unit}`}>
          <Animated.Text style={[styles.counterBig, typography.display, { color: fault ? colors.error : colors.onPrimary }, counterStyle]}>
            {counted}
          </Animated.Text>
          <Text style={[typography.captionBold, { color: colors.onPrimary, opacity: 0.8 }]}>
            {item.target - counted > 0 ? `${item.target - counted} to go` : 'done'}
          </Text>
        </View>
      </View>

      {/* Hands-free gesture in progress */}
      {gestureProgress.g && gestureProgress.p > 0 ? (
        <View pointerEvents="none" style={[styles.gesture, { top: insets.top + 84, backgroundColor: colors.primary }]}>
          <Ionicons name="hand-left-outline" size={18} color={colors.onPrimary} />
          <Text style={[typography.bodyBold, { color: colors.onPrimary, marginLeft: 8 }]}>
            {gestureProgress.g === 'one_hand' ? (videoPlaying ? 'Pausing video' : 'Playing video') : rest > 0 ? 'Skipping rest' : 'Finishing set'}
          </Text>
          <View style={[styles.gestureTrack, { backgroundColor: colors.primaryAlpha }]}>
            <View style={[styles.gestureFill, { width: `${Math.round(gestureProgress.p * 100)}%`, backgroundColor: colors.onPrimary }]} />
          </View>
        </View>
      ) : null}

      {/* 3-2-1 before each set */}
      {countdown > 0 ? (
        <Animated.View
          key={countdown}
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          pointerEvents="none"
          style={[styles.restWrap, { backgroundColor: colors.scrim }]}
        >
          <Text style={[styles.restNumber, typography.display, { color: colors.onPrimary }]}>{countdown}</Text>
          <Text style={[typography.body, { color: colors.onPrimary }]}>Get into position</Text>
        </Animated.View>
      ) : null}

      {/* Form fault: what is wrong and how to fix it */}
      {fault ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.springify().damping(16)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={[styles.faultCard, { top: insets.top + 84, backgroundColor: colors.errorSurface, borderColor: colors.error }]}
          accessibilityLiveRegion="assertive"
        >
          <Ionicons name="alert-circle" size={22} color={colors.error} />
          <View style={[styles.flex, { marginLeft: 10 }]}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{fault.title}</Text>
            <Text style={[typography.subbody, { color: colors.text.primary, marginTop: 2 }]}>{fault.fix}</Text>
            {autoPaused.current ? (
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>Video paused. It carries on when your form is back.</Text>
            ) : null}
          </View>
        </Animated.View>
      ) : checking && controls ? (
        <View pointerEvents="none" style={[styles.cue, { top: insets.top + 88, backgroundColor: colors.scrim }]}>
          <Text style={[typography.subbody, { color: colors.onPrimary }]}>{liveCue(movement!, rep, (frame?.landmarks.length ?? 0) > 0)}</Text>
        </View>
      ) : null}

      {/* Rest between sets */}
      {rest > 0 ? (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)} exiting={reduceMotion ? undefined : FadeOut.duration(200)} style={[styles.restWrap, { backgroundColor: colors.scrim }]}>
          <Text style={[typography.caption, { color: colors.onPrimary }]}>REST</Text>
          <Text style={[styles.restNumber, typography.display, { color: colors.onPrimary }]}>{rest}</Text>
          {nextItem ? (
            <Text style={[typography.body, { color: colors.onPrimary }]}>
              Next: {exerciseById(nextItem.exerciseId)?.name}, set {setIdx + 1}
            </Text>
          ) : null}
          <Button label="Skip rest" variant="outline" size="sm" onPress={() => setRest(0)} style={{ marginTop: spacing.md }} />
        </Animated.View>
      ) : null}

      {cameraError ? (
        <Text style={[typography.caption, styles.cameraError, { color: colors.onPrimary, backgroundColor: colors.error, bottom: insets.bottom + 120 }]}>{cameraError}</Text>
      ) : null}

      {/* Call controls */}
      {controls || rest > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(200)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={[styles.controls, { paddingBottom: insets.bottom + 14 }]}
        >
          <CallButton icon="camera-reverse-outline" label="Flip camera" disabled={!cameraOn} onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} />
          <CallButton
            icon={videoPlaying ? 'pause' : 'play'}
            label={videoPlaying ? 'Pause video' : 'Play video'}
            onPress={() => {
              autoPaused.current = false;
              if (videoPlaying) player.current?.pause();
              else player.current?.play();
            }}
          />
          <CallButton icon="checkmark" label="Set done" tone="success" size={64} onPress={manualSetDone} />
          <CallButton
            icon={voiceOn ? 'volume-high-outline' : 'volume-mute-outline'}
            label={voiceOn ? 'Mute voice coach' : 'Turn on voice coach'}
            onPress={() => {
              if (voiceOn) Speech.stop();
              setVoiceOn((v) => !v);
            }}
          />
          <CallButton icon="call" label="End workout" tone="danger" onPress={confirmEnd} rotate />
        </Animated.View>
      ) : null}
    </View>
  );
}

function CallButton({
  icon,
  label,
  onPress,
  tone,
  size = 52,
  disabled,
  rotate,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'success' | 'danger';
  size?: number;
  disabled?: boolean;
  rotate?: boolean;
}) {
  const { colors } = useTheme();
  const bg = tone === 'success' ? colors.success : tone === 'danger' ? colors.error : colors.surface;
  const fg = tone ? colors.onPrimary : colors.text.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        styles.callButton,
      ]}
    >
      <Ionicons name={icon} size={size * 0.42} color={fg} style={rotate ? styles.hangUp : undefined} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callButton: { alignItems: 'center', justifyContent: 'center' },
  cameraError: { alignSelf: 'center', borderRadius: 12, elevation: 20, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6, position: 'absolute', zIndex: 20 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 8 },
  controls: { alignItems: 'center', bottom: 0, elevation: 20, flexDirection: 'row', justifyContent: 'space-evenly', left: 0, paddingTop: 16, position: 'absolute', right: 0, zIndex: 20 },
  cue: { alignSelf: 'center', borderRadius: 14, elevation: 20, left: 16, paddingHorizontal: 14, paddingVertical: 8, position: 'absolute', right: 16, zIndex: 20 },
  faultBorder: { borderRadius: 16, borderWidth: 4 },
  faultCard: { alignItems: 'flex-start', borderRadius: 16, borderWidth: 1, elevation: 21, flexDirection: 'row', left: 12, padding: 14, position: 'absolute', right: 12, zIndex: 21 },
  flex: { flex: 1 },
  hangUp: { transform: [{ rotate: '135deg' }] },
  howTo: { justifyContent: 'flex-start' },
  pill: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 4 },
  counter: { alignItems: 'flex-end', marginLeft: 12 },
  gesture: { alignItems: 'center', alignSelf: 'center', borderRadius: 999, elevation: 22, flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, position: 'absolute', zIndex: 22 },
  gestureTrack: { borderRadius: 3, height: 6, marginLeft: 10, overflow: 'hidden', width: 60 },
  gestureFill: { height: 6 },
  counterBig: { fontSize: 40, lineHeight: 44 },
  restNumber: { fontSize: 72, lineHeight: 80 },
  restWrap: { alignItems: 'center', bottom: 0, elevation: 19, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 19 },
  round: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  row: { alignItems: 'center', flexDirection: 'row' },
  summaryRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 12 },
  topBar: { alignItems: 'center', elevation: 20, flexDirection: 'row', left: 0, paddingBottom: 10, paddingHorizontal: 16, position: 'absolute', right: 0, top: 0, zIndex: 20 },
  xpBox: { alignItems: 'center', borderRadius: 20, marginBottom: 16, padding: 20 },
});
