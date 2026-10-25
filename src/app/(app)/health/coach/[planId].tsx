import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  landmarksOf,
  PoseCameraView,
  poseLandmarkerAvailable,
  poseModelVersion,
  type PoseFrame,
} from 'pose-landmarker';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  InteractionManager,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FrostedView } from '@/components/ui';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { PressableScale } from '../../../../components/ui/PressableScale';
import { CoachGlass, ProgressRing } from '../../../../components/workout/CoachGlass';
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
import {
  IDLE_NUDGE_MS,
  idleLine,
  repLine,
  restTipLine,
  secondsLine,
  setDoneLine,
  setIntroLine,
} from '../../../../domain/pose/coachVoice';
import { initialGestureState, stepGesture, type Gesture } from '../../../../domain/pose/gestures';
import {
  framingCue,
  initialRepState,
  liveCue,
  movementForExercise,
  setProgress,
  stepReps,
  summarize,
  type FramingCue,
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

/** The tutorial video only re-renders when its own props change, not on every count update. */
const TutorialVideo = memo(YouTubePlayer);
const NO_JOINTS: number[] = [];

/** Moves that raise the arms, during which hand gestures are ignored. */
const ARM_MOVES = new Set([
  'arm_raise',
  'jumping_jack',
  'bird_dog',
  'warrior',
  'arms_out',
  'reach',
  'pull_apart',
  'elbow_bend',
]);
/** A framing problem must last this long before it is shown, and be gone this long to clear. */
const FRAMING_ON_MS = 700;
const FRAMING_OFF_MS = 500;

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [itemIdx, setItemIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [rest, setRest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [, setControls] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rep, setRep] = useState<RepState>(initialRepState());
  // Landmarks go straight to the overlay through shared values; React only hears about
  // whether someone is in view, so the screen doesn't re-render for every camera frame.
  const [hasPerson, setHasPerson] = useState(false);
  /** Models finished loading in the background; until then the stage says "Starting camera". */
  const [trackingReady, setTrackingReady] = useState(false);
  /** The tutorial WebView mounts after the start-up work settles, not at the same moment. */
  const [videoMounted, setVideoMounted] = useState(false);
  const countdownArmed = useRef(false);
  const feedPoints = useSharedValue<number[]>([]);
  const feedW = useSharedValue(0);
  const feedH = useSharedValue(0);
  const feedFace = useSharedValue<number[]>([]);
  const feedHands = useSharedValue<number[]>([]);
  const feedSeq = useSharedValue(0);
  const feedCapturedAt = useSharedValue(0);
  const feed = useRef({
    points: feedPoints,
    frameW: feedW,
    frameH: feedH,
    face: feedFace,
    hands: feedHands,
    seq: feedSeq,
    capturedAt: feedCapturedAt,
  }).current;
  /** Where to move so the camera sees the move ("Move a step to your left"). */
  const [framing, setFraming] = useState<FramingCue | null>(null);
  const framingRef = useRef<{
    shown: FramingCue | null;
    pending: string | null;
    since: number;
    clearSince: number;
    spokenAt: Record<string, number>;
  }>({
    shown: null,
    pending: null,
    since: 0,
    clearSince: 0,
    spokenAt: {},
  });
  const [pipLarge, setPipLarge] = useState(false);
  /** Body only, or body plus face (eyes, irises, brows, lips) and hands. */
  const [fullTracking, setFullTracking] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneSummary | null>(null);
  /** 3-2-1 before each set; reps are not counted until it reaches 0. */
  const [countdown, setCountdown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [stage, setStage] = useState({ width: 0, height: 0 });
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
  const hasPersonRef = useRef(false);
  /** When the last rep or second counted, for the "whenever you're ready" nudge. */
  const idleSince = useRef(0);
  const idleNudged = useRef(false);
  /** How long the set intro takes to say, so "2" doesn't cut it off. */
  const introMs = useRef(0);

  const counterStyle = useAnimatedStyle(() => ({ transform: [{ scale: counterPulse.value }] }));
  const item = plan?.items[itemIdx];
  const exercise = item ? exerciseById(item.exerciseId) : undefined;
  const movement = item ? movementForExercise(item.exerciseId) : undefined;
  const video = item ? videoFor(item.exerciseId) : undefined;
  const checking =
    phase === 'live' && cameraOn && Boolean(movement) && rest === 0 && countdown === 0;
  const unit = exercise?.timed || movement?.kind === 'hold' ? 's' : 'reps';
  const timed = Boolean(exercise?.timed);
  /** The number the set counter shows: reps, seconds held, or seconds spent moving. */
  const progressOf = (s: RepState) => (movement ? setProgress(movement, s, timed) : 0);

  // Call timer.
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Rest countdown; when it ends, a 3-2-1 leads into the next set.
  const resting = useRef(false);
  const restTotal = useRef(0);
  useEffect(() => {
    if (rest > 0) {
      if (!resting.current) restTotal.current = rest;
      resting.current = true;
      // Halfway through a longer rest, say what's next and how to do it.
      if (restTotal.current >= 20 && rest === Math.floor(restTotal.current / 2) && item) {
        const nextMove = movementForExercise(item.exerciseId);
        say(restTipLine(exerciseById(item.exerciseId)?.name ?? 'the next set', nextMove?.cue));
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

  // 3-2-1 before a set, spoken and shown.
  useEffect(() => {
    if (countdown <= 0) return;
    if (countdown === 3 && item && exercise) {
      // A coach names the move and the one cue that matters before counting in.
      const intro = setIntroLine(
        exercise.name,
        setIdx + 1,
        item.sets,
        item.target,
        unit,
        movement?.cue,
      );
      introMs.current = Math.min(7000, 900 + intro.length * 60);
      say(`${intro} 3`);
      idleSince.current = Date.now() + 3000;
    } else say(String(countdown));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    // The first beat waits for the intro sentence to be spoken.
    const t = setTimeout(
      () => {
        setCountdown((c) => {
          if (c === 1) say('Go');
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
      const tracked = movement && repRef.current.validFrames > 0;
      const cleanShare = tracked
        ? repRef.current.goodFrames / Math.max(1, repRef.current.validFrames)
        : null;
      resetReps();
      idleNudged.current = false;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      if (autoPaused.current) {
        autoPaused.current = false;
      }
      if (setIdx + 1 < item.sets) {
        say(setDoneLine(value, item.target, unit, item.restSeconds, cleanShare));
        setSetIdx(setIdx + 1);
        setRest(item.restSeconds);
      } else if (itemIdx + 1 < plan.items.length) {
        say(
          `Nice. Next, ${exerciseById(plan.items[itemIdx + 1].exerciseId)?.name ?? 'the next exercise'}.`,
        );
        setItemIdx(itemIdx + 1);
        setSetIdx(0);
        setRest(item.restSeconds || 20);
      } else {
        say('Workout done. Well done.');
        finish();
      }
      showControls();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan, item, movement, setIdx, itemIdx, finish, showControls, unit],
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
        const counted = progressOf(repRef.current);
        completeSet(cameraOn && movement && repRef.current.validFrames > 0 ? counted : item.target);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video, videoPlaying, rest, countdown, item, movement, cameraOn, completeSet],
  );

  const handlePose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const { frameWidth, frameHeight, timestamp } = e.nativeEvent;
      const landmarks = landmarksOf(e.nativeEvent.points);
      const now = Date.now();
      const flat = new Array(landmarks.length * 3);
      for (let i = 0; i < landmarks.length; i++) {
        flat[i * 3] = landmarks[i].x;
        flat[i * 3 + 1] = landmarks[i].y;
        flat[i * 3 + 2] = landmarks[i].visibility;
      }
      feed.frameW.value = frameWidth;
      feed.frameH.value = frameHeight;
      feed.points.value = flat;
      feed.capturedAt.value = e.nativeEvent.capturedAt ?? 0;
      feed.seq.value = feed.seq.value + 1;
      feed.face.value = e.nativeEvent.face ?? [];
      feed.hands.value = (e.nativeEvent.hands ?? []).flat();
      const seen = landmarks.length > 0;
      if (seen !== hasPersonRef.current) {
        hasPersonRef.current = seen;
        setHasPerson(seen);
      }
      // Hands-free control, except while doing a move that raises the arms.
      const armsBusy = checking && movement && ARM_MOVES.has(movement.id);
      if (!armsBusy) {
        const g = stepGesture(gestureRef.current, landmarks, now);
        gestureRef.current = g.state;
        if (g.fired) onGesture(g.fired);
        // Progress bar moves in 10% steps: enough to read, far fewer re-renders.
        const nextG = g.state.latched ? null : g.state.current;
        const nextP = g.state.latched ? 0 : Math.round(g.progress * 10) / 10;
        if (nextP !== gestureProgress.p || nextG !== gestureProgress.g)
          setGestureProgress({ g: nextG, p: nextP });
      }
      // Framing: debounced so a single bad frame never flashes a message.
      if (movement) {
        const f = framingCue(movement, landmarks, facing === 'front');
        const fr = framingRef.current;
        if (f) {
          if (fr.pending !== f.id) {
            fr.pending = f.id;
            fr.since = now;
          }
          fr.clearSince = 0;
          if (fr.shown?.id !== f.id && now - fr.since >= FRAMING_ON_MS) {
            fr.shown = f;
            setFraming(f);
            // Spoken at most every 6 s per message, and never over the 3-2-1.
            if (countdown === 0 && now - (fr.spokenAt[f.id] ?? 0) > 6000) {
              fr.spokenAt[f.id] = now;
              say(f.text);
            }
          }
        } else {
          fr.pending = null;
          if (fr.shown) {
            if (!fr.clearSince) fr.clearSince = now;
            else if (now - fr.clearSince >= FRAMING_OFF_MS) {
              fr.shown = null;
              setFraming(null);
            }
          }
        }
      }
      if (!checking || !movement || !item) return;
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
      const inSeconds = movement.kind === 'hold' || timed;
      if (next.reps > before.reps) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        counterPulse.value = withSequence(
          withTiming(1.25, { duration: 120 }),
          withTiming(1, { duration: 180 }),
        );
        if (!inSeconds && !next.fault) {
          const line = repLine(next.reps, item.target, !before.repHadFault);
          if (line) say(line);
        }
      }
      const value = progressOf(next);
      if (value !== progressOf(before)) {
        idleSince.current = now;
        idleNudged.current = false;
      }
      if (inSeconds && value > 0 && value !== progressOf(before)) {
        const line = secondsLine(value, item.target);
        if (line) say(line);
      }
      // In view, nothing counting for a while: a gentle nudge, once.
      if (
        !idleNudged.current &&
        idleSince.current > 0 &&
        now - idleSince.current > IDLE_NUDGE_MS &&
        landmarks.length > 0 &&
        !next.fault
      ) {
        idleNudged.current = true;
        say(idleLine(movement.kind));
      }

      const doneNow = value >= item.target;
      if (now - lastUi.current > 100 || doneNow || next.fault !== before.fault) {
        lastUi.current = now;
        setRep(next);
      }
      if (doneNow) completeSet(value);
    },
    [
      checking,
      movement,
      item,
      videoPlaying,
      completeSet,
      gestureProgress,
      onGesture,
      counterPulse,
      feed,
      facing,
      countdown,
      timed,
      progressOf,
    ],
  );
  // The native view gets one callback for its lifetime; it always calls the latest handler.
  const poseHandler = useRef(handlePose);
  poseHandler.current = handlePose;
  const onPose = useCallback((e: { nativeEvent: PoseFrame }) => poseHandler.current(e), []);
  const onPoseReady = useCallback(() => setTrackingReady(true), []);
  const onPoseError = useCallback(
    (e: { nativeEvent: { message: string } }) =>
      setCameraError(e.nativeEvent.message || 'The camera stopped.'),
    [],
  );

  const manualSetDone = () => {
    if (!item) return;
    const counted = progressOf(repRef.current);
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
      s.audit(
        'device_connected',
        'pose_camera',
        `${plan?.title ?? 'Workout'}: camera on, processed on this phone`,
      );
    }
    setCameraOn(allowed);
    setTrackingReady(false);
    startedAt.current = new Date().toISOString();
    setPhase('live');
    showControls();
    say(allowed ? 'Hi. Prop the phone up and step back so I can see you.' : 'Let’s begin.');
    // Without the camera, count in after a moment. With it, the effect below counts in once
    // tracking is live and the person is in frame (or after 8 s regardless).
    countdownArmed.current = true;
    if (!allowed) {
      countdownArmed.current = false;
      setTimeout(() => setCountdown(3), 1600);
    } else {
      setTimeout(() => {
        if (countdownArmed.current) {
          countdownArmed.current = false;
          setCountdown(3);
        }
      }, 8000);
    }
    InteractionManager.runAfterInteractions(() => setTimeout(() => setVideoMounted(true), 400));
  };

  // Count in automatically as soon as the camera can see you.
  useEffect(() => {
    if (countdownArmed.current && trackingReady && hasPerson) {
      countdownArmed.current = false;
      setCountdown(3);
    }
  }, [trackingReady, hasPerson]);

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
      <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.base,
          }}
        >
          <PressableScale
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[styles.round, { backgroundColor: colors.surface1 }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </PressableScale>
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
              A standalone workout: saved to your history and calendar. Start from a quest to
              complete it too.
            </Text>
          )}
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            Your camera fills the stage with a live skeleton and rep count; the tutorial plays below
            it.
          </Text>
          <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
            {[
              [
                'videocam-outline',
                cameraBuilt
                  ? 'The camera counts reps and checks your form for the exercises it knows.'
                  : 'Form checking is not available in this build; the coach still runs videos, sets and rest.',
              ],
              [
                'pause-circle-outline',
                'If your form slips, the video pauses and shows exactly what to fix. It carries on when you have fixed it.',
              ],
              [
                'ribbon-outline',
                `Good camera-checked form (80% or more) earns ${WORKOUT_XP_BASE * WORKOUT_FORM_MULTIPLIER} XP instead of ${WORKOUT_XP_BASE}.`,
              ],
              [
                'hand-left-outline',
                'Hands-free: hold one hand above your head to play or pause the video, both hands to finish a set or skip a rest.',
              ],
              [
                'volume-high-outline',
                'A voice counts you in, counts your reps and tells you what to fix. You can mute it.',
              ],
              [
                'eye-off-outline',
                'Everything runs on this phone. No photos or video are saved or sent.',
              ],
              [
                'phone-portrait-outline',
                'Prop the phone up about two metres away, side-on, with your whole body in view.',
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
            In this workout
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
            Exercises marked with the scan icon are checked by the camera.
          </Text>
          <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.md }]}>
            {exercise.safety}
          </Text>
          <Button
            label={cameraBuilt ? 'Allow camera and start' : 'Start'}
            size="lg"
            onPress={start}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </View>
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
          <Text style={[typography.display, { color: colors.text.primary }]}>Workout done</Text>
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
            <View key={l.name} style={styles.summaryRow}>
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

  // ---------------------------------------------------------------- live (full screen)
  const fault = checking ? rep.fault : null;
  const counted = progressOf(rep);
  const nextItem = rest > 0 ? (setIdx === 0 ? plan.items[itemIdx] : item) : null;
  const cameraMain = cameraOn && Boolean(PoseCameraView);
  const starting = cameraMain && !trackingReady && !cameraError;

  // Every exercise has a tutorial in the app: the verified video, or YouTube search for it.
  const videoTile = !videoMounted ? (
    <View
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.callBackground }]}
    >
      <ActivityIndicator color={colors.callMuted} />
    </View>
  ) : (
    <TutorialVideo
      key={item.exerciseId}
      ref={player}
      videoId={video?.videoId}
      query={`${exercise.name} proper form tutorial`}
      style={StyleSheet.absoluteFill}
      onPlayingChange={setVideoPlaying}
    />
  );

  const remaining = Math.max(0, item.target - counted);
  const share = Math.min(1, counted / Math.max(1, item.target));
  const upNext =
    setIdx + 1 < item.sets
      ? { ex: exercise, set: setIdx + 2, of: item.sets }
      : plan.items[itemIdx + 1]
        ? {
            ex: exerciseById(plan.items[itemIdx + 1].exerciseId),
            set: 1,
            of: plan.items[itemIdx + 1].sets,
          }
        : null;
  const pipWidth = Math.round(Math.min(stage.width || 360, 520) * (pipLarge ? 0.72 : 0.42));

  // What the banner says, most urgent first: a gesture, a form fault, framing, the live cue.
  const banner: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    text?: string;
    tone: 'gesture' | 'fault' | 'framing' | 'cue';
  } | null =
    gestureProgress.g && gestureProgress.p > 0
      ? {
          icon: 'hand-left-outline',
          title:
            gestureProgress.g === 'one_hand'
              ? videoPlaying
                ? 'Pausing video'
                : 'Playing video'
              : rest > 0
                ? 'Skipping rest'
                : 'Finishing set',
          tone: 'gesture',
        }
      : fault
        ? { icon: 'alert', title: fault.title, text: fault.fix, tone: 'fault' }
        : cameraMain && framing && trackingReady
          ? {
              icon:
                framing.id === 'move_left'
                  ? 'arrow-back'
                  : framing.id === 'move_right'
                    ? 'arrow-forward'
                    : framing.id === 'closer'
                      ? 'enter-outline'
                      : framing.id === 'step_in'
                        ? 'body-outline'
                        : 'resize-outline',
              title: framing.text,
              tone: 'framing',
            }
          : checking && movement
            ? { icon: 'sparkles-outline', title: liveCue(movement, rep, hasPerson), tone: 'cue' }
            : null;

  return (
    <View
      style={[styles.flex, { backgroundColor: colors.callBackground }]}
      onLayout={(e) =>
        setStage({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
      }
    >
      <StatusBar barStyle="light-content" />

      {/* Full-screen stage: your camera with the live skeleton, or the tutorial when the camera is off */}
      {cameraMain && PoseCameraView ? (
        <PoseCameraView
          style={StyleSheet.absoluteFill}
          active={phase === 'live'}
          facing={facing}
          face={fullTracking}
          hands={fullTracking}
          // Resting: analyse ~4 frames a second (enough for the skip gesture), not ~10.
          minIntervalMs={rest > 0 ? 250 : 0}
          onPose={onPose}
          onPoseReady={onPoseReady}
          onPoseError={onPoseError}
        />
      ) : (
        videoTile
      )}
      {cameraMain && stage.width > 0 ? (
        <PoseOverlay
          feed={feed}
          width={stage.width}
          height={stage.height}
          highlight={fault?.joints ?? NO_JOINTS}
          angleJoints={
            movement && !movement.metric && movement.kind === 'reps' ? movement.joints : null
          }
        />
      ) : null}
      {/* Soft top and bottom shade so glass controls read over any background */}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.callSurface, 'transparent']}
        style={[styles.shadeTop, { height: insets.top + 150 }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', colors.callSurface]}
        style={[styles.shadeBottom, { height: insets.bottom + 220 }]}
      />
      {fault ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.faultEdge, { borderColor: colors.error }]}
        />
      ) : null}

      {starting ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          pointerEvents="none"
          style={styles.startingWrap}
        >
          <CoachGlass radius={999} style={styles.startingCam}>
            <ActivityIndicator color={colors.callText} />
            <Text style={[typography.bodyBold, { color: colors.callText, marginLeft: 10 }]}>
              Starting camera
            </Text>
          </CoachGlass>
        </Animated.View>
      ) : null}

      {/* Top bar: end, what you're doing and where you are, voice and camera controls */}
      <View style={[styles.topBar, { top: insets.top + 8, paddingHorizontal: spacing.base }]}>
        <GlassButton icon="close" label="End workout" onPress={confirmEnd} />
        <CoachGlass radius={22} style={[styles.flex, styles.titlePill]}>
          <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.setsInline} accessibilityLabel={`Set ${setIdx + 1} of ${item.sets}`}>
            {Array.from({ length: item.sets }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.setSeg,
                  {
                    backgroundColor:
                      i < setIdx
                        ? colors.primary
                        : i === setIdx
                          ? colors.callText
                          : colors.callSurfaceStrong,
                  },
                ]}
              />
            ))}
            <Text style={[typography.caption, { color: colors.callMuted, marginLeft: 8 }]}>
              {itemIdx + 1}/{plan.items.length} · {clock(elapsed)}
            </Text>
          </View>
        </CoachGlass>
        <GlassButton
          icon={voiceOn ? 'volume-high-outline' : 'volume-mute-outline'}
          label={voiceOn ? 'Mute voice coach' : 'Turn on voice coach'}
          onPress={() => {
            if (voiceOn) Speech.stop();
            setVoiceOn((v) => !v);
          }}
        />
      </View>

      {/* Right rail: camera tools */}
      {cameraMain ? (
        <View style={[styles.rail, { top: insets.top + 72, right: spacing.base }]}>
          <GlassButton
            icon="camera-reverse-outline"
            label="Flip camera"
            onPress={() => {
              setTrackingReady(false);
              setFacing((f) => (f === 'front' ? 'back' : 'front'));
            }}
          />
          <GlassButton
            icon={fullTracking ? 'scan' : 'scan-outline'}
            label="Track face and hands too"
            active={fullTracking}
            onPress={() => setFullTracking((v) => !v)}
          />
          <GlassButton
            icon={pipLarge ? 'contract' : 'film-outline'}
            label={pipLarge ? 'Make tutorial smaller' : 'Make tutorial bigger'}
            onPress={() => setPipLarge((v) => !v)}
          />
        </View>
      ) : null}

      {/* Tutorial picture-in-picture (camera on) */}
      {cameraMain ? (
        <CoachGlass
          radius={18}
          style={[styles.pip, { top: insets.top + 72, left: spacing.base, width: pipWidth }]}
        >
          {videoTile}
          <View style={styles.pipControls} pointerEvents="box-none">
            <PressableScale
              onPress={() => {
                autoPaused.current = false;
                if (videoPlaying) player.current?.pause();
                else player.current?.play();
              }}
              accessibilityRole="button"
              accessibilityLabel={videoPlaying ? 'Pause tutorial' : 'Play tutorial'}
              hitSlop={8}
              style={[styles.pipBtn, { backgroundColor: colors.callSurface }]}
            >
              <Ionicons name={videoPlaying ? 'pause' : 'play'} size={14} color={colors.callText} />
            </PressableScale>
          </View>
        </CoachGlass>
      ) : null}

      {/* Coaching banner: one message at a time, most urgent first */}
      {banner && rest === 0 && countdown === 0 ? (
        <Animated.View
          key={banner.tone + banner.title}
          entering={reduceMotion ? undefined : FadeInDown.duration(220)}
          exiting={reduceMotion ? undefined : FadeOut.duration(150)}
          pointerEvents="none"
          accessibilityLiveRegion={
            banner.tone === 'fault' || banner.tone === 'framing' ? 'assertive' : 'polite'
          }
          style={[
            styles.bannerWrap,
            { bottom: insets.bottom + 150, paddingHorizontal: spacing.base },
          ]}
        >
          <CoachGlass
            radius={22}
            style={[
              styles.banner,
              banner.tone === 'fault' ? { backgroundColor: colors.error } : null,
              banner.tone === 'gesture' ? { backgroundColor: colors.primary } : null,
            ]}
          >
            <View
              style={[
                styles.bannerIcon,
                {
                  backgroundColor:
                    banner.tone === 'framing'
                      ? colors.warning
                      : banner.tone === 'cue'
                        ? colors.primary
                        : colors.callSurfaceStrong,
                },
              ]}
            >
              <Ionicons name={banner.icon} size={18} color={colors.callText} />
            </View>
            <View style={[styles.flex, { marginLeft: 12 }]}>
              <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={2}>
                {banner.title}
              </Text>
              {banner.text ? (
                <Text
                  style={[
                    typography.subbody,
                    { color: colors.callText, opacity: 0.9, marginTop: 2 },
                  ]}
                  numberOfLines={2}
                >
                  {banner.text}
                </Text>
              ) : null}
            </View>
            {banner.tone === 'gesture' ? (
              <View style={[styles.gestureTrack, { backgroundColor: colors.callSurfaceStrong }]}>
                <View
                  style={[
                    styles.gestureFill,
                    {
                      width: `${Math.round(gestureProgress.p * 100)}%`,
                      backgroundColor: colors.callText,
                    },
                  ]}
                />
              </View>
            ) : null}
          </CoachGlass>
        </Animated.View>
      ) : null}

      {cameraError ? (
        <Text
          style={[
            typography.caption,
            styles.cameraError,
            { color: colors.callText, backgroundColor: colors.error, top: insets.top + 72 },
          ]}
        >
          {cameraError}
        </Text>
      ) : null}

      {/* Bottom: the count as a ring, what's next, set done */}
      {rest === 0 ? (
        <View
          style={[
            styles.bottomBar,
            { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + spacing.base },
          ]}
        >
          <CoachGlass radius={28} style={styles.hud}>
            <View
              style={styles.ringBox}
              accessibilityLabel={`${counted} of ${item.target} ${unit}. ${remaining} to go`}
              accessibilityLiveRegion="polite"
            >
              <ProgressRing
                size={88}
                stroke={7}
                progress={share}
                color={fault ? colors.error : colors.primary}
                track={colors.callSurfaceStrong}
              />
              <View style={[StyleSheet.absoluteFill, styles.center]}>
                <Animated.Text
                  style={[
                    typography.display,
                    styles.counterBig,
                    { color: colors.callText },
                    counterStyle,
                  ]}
                >
                  {counted}
                </Animated.Text>
              </View>
            </View>
            <View style={[styles.flex, { marginLeft: 14 }]}>
              <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={1}>
                {remaining > 0
                  ? `${remaining} ${unit === 's' ? 's' : remaining === 1 ? 'rep' : 'reps'} to go`
                  : 'Target reached'}
              </Text>
              <Text
                style={[typography.caption, { color: colors.callMuted, marginTop: 2 }]}
                numberOfLines={2}
              >
                {!movement && cameraMain
                  ? 'Not camera-checked: tap done when finished'
                  : upNext
                    ? `Next: ${upNext.ex?.name ?? 'Exercise'} · set ${upNext.set}/${upNext.of}`
                    : 'Last set of the workout'}
              </Text>
            </View>
            <PressableScale
              onPress={manualSetDone}
              accessibilityRole="button"
              accessibilityLabel={remaining > 0 ? 'Set done' : 'Next'}
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="checkmark" size={26} color={colors.onPrimary} />
            </PressableScale>
          </CoachGlass>
        </View>
      ) : null}

      {/* 3-2-1 before each set: the camera stays visible so you can get into position */}
      {countdown > 0 ? (
        <View pointerEvents="none" style={styles.countWrap}>
          <CoachGlass radius={110} style={styles.countDisc}>
            <View style={StyleSheet.absoluteFill}>
              <ProgressRing
                size={220}
                stroke={8}
                durationMs={countdown === 3 && introMs.current ? introMs.current : 900}
                cycle={countdown}
                color={colors.primary}
                track={colors.callSurfaceStrong}
              />
            </View>
            <Animated.Text
              key={countdown}
              entering={reduceMotion ? undefined : ZoomIn.duration(220)}
              style={[typography.display, styles.countNumber, { color: colors.callText }]}
            >
              {countdown}
            </Animated.Text>
          </CoachGlass>
          <CoachGlass radius={22} style={[styles.countInfo, { marginHorizontal: spacing.lg }]}>
            <Text style={[typography.bodyBold, { color: colors.callText, textAlign: 'center' }]}>
              {exercise.name} · {item.target} {unit === 's' ? 'seconds' : 'reps'}
            </Text>
            <Text
              style={[
                typography.subbody,
                { color: colors.callMuted, textAlign: 'center', marginTop: 4 },
              ]}
              numberOfLines={3}
            >
              {framing ? framing.text : (movement?.cue ?? 'Get into position')}
            </Text>
          </CoachGlass>
        </View>
      ) : null}

      {/* Rest between sets: a glass sheet; the camera stays live behind it */}
      {rest > 0 ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(240)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={[
            styles.restWrap,
            { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + spacing.base },
          ]}
        >
          <CoachGlass radius={30} strong style={styles.restCard}>
            <View style={styles.row}>
              <View style={styles.ringBox}>
                <ProgressRing
                  size={96}
                  stroke={7}
                  progress={restTotal.current ? rest / restTotal.current : 0}
                  color={colors.primary}
                  track={colors.callSurfaceStrong}
                />
                <View style={[StyleSheet.absoluteFill, styles.center]}>
                  <Text style={[typography.display, styles.counterBig, { color: colors.callText }]}>
                    {rest}
                  </Text>
                </View>
              </View>
              <View style={[styles.flex, { marginLeft: 16 }]}>
                <Text style={[typography.label, { color: colors.callMuted }]}>
                  Rest and breathe
                </Text>
                {nextItem ? (
                  <>
                    <Text
                      style={[typography.subheading, { color: colors.callText, marginTop: 2 }]}
                      numberOfLines={2}
                    >
                      {exerciseById(nextItem.exerciseId)?.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.callMuted }]}>
                      Set {setIdx + 1} of {nextItem.sets} · {nextItem.target}{' '}
                      {exerciseById(nextItem.exerciseId)?.timed ? 'seconds' : 'reps'}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
            {nextItem && movementForExercise(nextItem.exerciseId)?.cue ? (
              <Text
                style={[typography.subbody, { color: colors.callText, marginTop: 12 }]}
                numberOfLines={3}
              >
                {movementForExercise(nextItem.exerciseId)?.cue}
              </Text>
            ) : null}
            <View style={[styles.row, { gap: 10, marginTop: 14 }]}>
              <PressableScale
                onPress={() => {
                  restTotal.current += 15;
                  setRest((r) => r + 15);
                }}
                accessibilityRole="button"
                accessibilityLabel="Add 15 seconds of rest"
                style={[styles.restBtn, styles.flex, { backgroundColor: colors.callSurfaceStrong }]}
              >
                <Text style={[typography.bodyBold, { color: colors.callText }]}>+15 s</Text>
              </PressableScale>
              <PressableScale
                onPress={() => setRest(0)}
                accessibilityRole="button"
                style={[styles.restBtn, styles.flex, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>I’m ready</Text>
              </PressableScale>
            </View>
          </CoachGlass>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Round glass control over the camera. */
function GlassButton({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
    >
      <CoachGlass
        radius={22}
        style={[styles.glassBtn, active ? { backgroundColor: colors.primary } : null]}
      >
        <Ionicons name={icon} size={20} color={colors.callText} />
      </CoachGlass>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  bannerWrap: { left: 0, position: 'absolute', right: 0 },
  bottomBar: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  cameraError: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
  },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 8 },
  countDisc: { alignItems: 'center', height: 220, justifyContent: 'center', width: 220 },
  countInfo: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 14 },
  countNumber: { fontSize: 96, lineHeight: 104 },
  countWrap: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  counterBig: { fontSize: 34, lineHeight: 40 },
  doneBtn: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginLeft: 10,
    width: 56,
  },
  faultEdge: { borderWidth: 4 },
  flex: { flex: 1 },
  gestureFill: { height: 6 },
  gestureTrack: { borderRadius: 3, height: 6, marginLeft: 10, overflow: 'hidden', width: 60 },
  glassBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  hud: { alignItems: 'center', flexDirection: 'row', padding: 12 },
  pip: { aspectRatio: 16 / 9, position: 'absolute' },
  pipBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  pipControls: { bottom: 6, flexDirection: 'row', gap: 6, position: 'absolute', right: 6 },
  rail: { gap: 10, position: 'absolute' },
  restBtn: { alignItems: 'center', borderRadius: 22, height: 48, justifyContent: 'center' },
  restCard: { padding: 18 },
  restWrap: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  ringBox: { height: 88, minWidth: 88, justifyContent: 'center' },
  round: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  setSeg: { borderRadius: 2, height: 4, width: 18 },
  setsInline: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4 },
  shadeBottom: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  shadeTop: { left: 0, position: 'absolute', right: 0, top: 0 },
  startingCam: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  startingWrap: { alignItems: 'center', left: 0, position: 'absolute', right: 0, top: '45%' },
  summaryRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12 },
  titlePill: {
    justifyContent: 'center',
    marginHorizontal: 10,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  topBar: { alignItems: 'center', flexDirection: 'row', left: 0, position: 'absolute', right: 0 },
  xpBox: { alignItems: 'center', borderRadius: 20, marginBottom: 16, padding: 20 },
});
