/**
 * usePoseTracking — encapsulates camera pose detection, landmark shared values,
 * gesture detection, framing cues, and rep counting.
 */

import { useCallback, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { landmarksOf, type PoseFrame } from 'pose-landmarker';

import { initialGestureState, stepGesture, type Gesture } from '@/domain/pose/gestures';
import {
  framingCue,
  initialRepState,
  movementForExercise,
  setProgress,
  stepReps,
  type FramingCue,
  type MovementDefinition,
  type RepState,
} from '@/domain/pose/movement';
import { repLine, secondsLine, idleLine, IDLE_NUDGE_MS } from '@/domain/pose/coachVoice';

const FRAMING_ON_MS = 700;
const FRAMING_OFF_MS = 500;

/** Moves that raise arms — hand gestures are suppressed during these. */
const ARM_MOVES = new Set([
  'arm_raise', 'jumping_jack', 'bird_dog', 'warrior',
  'arms_out', 'reach', 'pull_apart', 'elbow_bend',
]);

interface UsePoseTrackingOpts {
  checking: boolean;
  movement: MovementDefinition | undefined;
  item: { target: number; exerciseId: string } | undefined;
  timed: boolean;
  facing: 'front' | 'back';
  countdown: number;
  videoPlaying: boolean;
  rest: number;
  onGesture: (g: Gesture) => void;
  onCompleteSet: (value: number) => void;
  sayFn: (text: string) => void;
  progressOf: (s: RepState) => number;
}

export function usePoseTracking({
  checking, movement, item, timed, facing, countdown,
  videoPlaying, rest, onGesture, onCompleteSet, sayFn, progressOf,
}: UsePoseTrackingOpts) {
  const [hasPerson, setHasPerson] = useState(false);
  const [trackingReady, setTrackingReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [framing, setFraming] = useState<FramingCue | null>(null);
  const [rep, setRep] = useState<RepState>(initialRepState());
  const [gestureProgress, setGestureProgress] = useState<{ g: Gesture | null; p: number }>({ g: null, p: 0 });
  const gestureProgressRef = useRef<{ g: Gesture | null; p: number }>({ g: null, p: 0 });

  const repRef = useRef<RepState>(initialRepState());
  const hasPersonRef = useRef(false);
  const lastUi = useRef(0);
  const idleSince = useRef(0);
  const idleNudged = useRef(false);
  const gestureRef = useRef(initialGestureState());
  const framingRef = useRef<{
    shown: FramingCue | null;
    pending: string | null;
    since: number;
    clearSince: number;
    spokenAt: Record<string, number>;
  }>({ shown: null, pending: null, since: 0, clearSince: 0, spokenAt: {} });

  // Shared values for PoseOverlay (worklet thread, no re-renders per frame)
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

  const counterPulse = useSharedValue(1);

  const resetReps = () => {
    repRef.current = initialRepState();
    setRep(repRef.current);
  };

  const handlePose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const { frameWidth, frameHeight, timestamp } = e.nativeEvent;
      const landmarks = landmarksOf(e.nativeEvent.points);
      const now = Date.now();

      // Push flat array to shared values — worklet reads them without JS
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

      // Gesture detection (suppressed during arm-raising exercises)
      const armsBusy = checking && movement && ARM_MOVES.has(movement.id);
      if (!armsBusy) {
        const g = stepGesture(gestureRef.current, landmarks, now);
        gestureRef.current = g.state;
        if (g.fired) onGesture(g.fired);
        const nextG = g.state.latched ? null : g.state.current;
        const nextP = g.state.latched ? 0 : Math.round(g.progress * 10) / 10;
        const gp = gestureProgressRef.current;
        if (nextP !== gp.p || nextG !== gp.g) {
          gestureProgressRef.current = { g: nextG, p: nextP };
          setGestureProgress({ g: nextG, p: nextP });
        }
      }

      // Framing cues — debounced so single bad frames don't flash
      if (movement) {
        const f = framingCue(movement, landmarks, facing === 'front');
        const fr = framingRef.current;
        if (f) {
          if (fr.pending !== f.id) { fr.pending = f.id; fr.since = now; }
          fr.clearSince = 0;
          if (fr.shown?.id !== f.id && now - fr.since >= FRAMING_ON_MS) {
            fr.shown = f;
            setFraming(f);
            if (countdown === 0 && now - (fr.spokenAt[f.id] ?? 0) > 6000) {
              fr.spokenAt[f.id] = now;
              sayFn(f.text);
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

      // Form fault feedback
      if (!before.fault && next.fault) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
        sayFn(next.fault.fix);
      } else if (before.fault && !next.fault) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }

      const inSeconds = movement.kind === 'hold' || timed;
      if (next.reps > before.reps) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        if (!inSeconds && !next.fault) {
          const line = repLine(next.reps, item.target, !before.repHadFault);
          if (line) sayFn(line);
        }
      }

      const value = progressOf(next);
      if (value !== progressOf(before)) {
        idleSince.current = now;
        idleNudged.current = false;
      }
      if (inSeconds && value > 0 && value !== progressOf(before)) {
        const line = secondsLine(value, item.target);
        if (line) sayFn(line);
      }

      // Idle nudge: person in view but nothing counting for a while
      if (
        !idleNudged.current &&
        idleSince.current > 0 &&
        now - idleSince.current > IDLE_NUDGE_MS &&
        landmarks.length > 0 &&
        !next.fault
      ) {
        idleNudged.current = true;
        sayFn(idleLine(movement.kind));
      }

      const doneNow = value >= item.target;
      const valueChanged = value !== progressOf(before);
      const faultChanged = next.fault?.title !== before.fault?.title;
      if (valueChanged || faultChanged || doneNow || now - lastUi.current > 200) {
        lastUi.current = now;
        setRep(next);
      }
      if (doneNow) onCompleteSet(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checking, movement, item, videoPlaying, onCompleteSet, onGesture,
     feed, facing, countdown, timed, progressOf, sayFn],
  );

  const poseHandler = useRef(handlePose);
  poseHandler.current = handlePose;
  const onPose = useCallback((e: { nativeEvent: PoseFrame }) => poseHandler.current(e), []);
  const onPoseReady = useCallback(() => setTrackingReady(true), []);
  const onPoseError = useCallback(
    (e: { nativeEvent: { message: string } }) =>
      setCameraError(e.nativeEvent.message || 'The camera stopped.'),
    [],
  );

  return {
    hasPerson,
    trackingReady,
    setTrackingReady,
    cameraError,
    framing,
    rep,
    repRef,
    resetReps,
    gestureProgress,
    feed,
    counterPulse,
    onPose,
    onPoseReady,
    onPoseError,
  };
}
