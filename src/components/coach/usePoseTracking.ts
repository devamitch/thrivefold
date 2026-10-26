/**
 * usePoseTracking — camera pose events, overlay feed, gestures, framing cues, rep counting.
 *
 * Hot-path changes vs the old version:
 *  - the native flat points array goes to the overlay as-is (no per-frame n*3 copy);
 *  - 2 shared-value writes per frame instead of 7 (size only when it changes);
 *  - face/hands are no longer pushed (off this release);
 *  - framing cues evaluated at most every 100 ms.
 */

import * as Haptics from 'expo-haptics';
import { landmarksOf, type PoseFrame } from 'pose-landmarker';
import { useCallback, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { cuesEngine } from '@/domain/coach/cuesEngine';
import { IDLE_NUDGE_MS, idleLine, repLine, secondsLine } from '@/domain/pose/coachVoice';
import { initialGestureState, stepGesture, type Gesture } from '@/domain/pose/gestures';
import {
  framingCue,
  initialRepState,
  stepReps,
  type FramingCue,
  type MovementDefinition,
  type RepState,
} from '@/domain/pose/movement';

const FRAMING_ON_MS = 700;
const FRAMING_OFF_MS = 500;
const FRAMING_EVAL_MS = 100;

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

interface UsePoseTrackingOpts {
  checking: boolean;
  movement: MovementDefinition | undefined;
  item: { target: number; exerciseId: string } | undefined;
  timed: boolean;
  facing: 'front' | 'back';
  countdown: number;
  videoPlaying: boolean;
  rest: number;
  /** 'off' while positioning/countdown/tutorial; 'set' during a set; 'rest' between sets. */
  gestureMode?: 'off' | 'set' | 'rest';
  onGesture: (g: Gesture) => void;
  onCompleteSet: (value: number) => void;
  sayFn: (text: string) => void;
  progressOf: (s: RepState) => number;
}

export function usePoseTracking({
  checking,
  movement,
  item,
  timed,
  facing,
  countdown,
  videoPlaying,
  rest,
  gestureMode = 'off',
  onGesture,
  onCompleteSet,
  sayFn,
  progressOf,
}: UsePoseTrackingOpts) {
  const [hasPerson, setHasPerson] = useState(false);
  const [trackingReady, setTrackingReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [framing, setFraming] = useState<FramingCue | null>(null);
  const [rep, setRep] = useState<RepState>(initialRepState());
  const [gestureProgress, setGestureProgress] = useState<{ g: Gesture | null; p: number }>({
    g: null,
    p: 0,
  });
  const gestureProgressRef = useRef<{ g: Gesture | null; p: number }>({ g: null, p: 0 });

  const repRef = useRef<RepState>(initialRepState());
  const hasPersonRef = useRef(false);
  const lastUi = useRef(0);
  const idleSince = useRef(0);
  const idleNudged = useRef(false);
  const gestureRef = useRef(initialGestureState());
  const lastFramingAt = useRef(0);
  const personSince = useRef(0);
  const gestureCooldownUntil = useRef(0);
  const seqRef = useRef(0);
  const dimsRef = useRef({ w: 0, h: 0 });
  const framingRef = useRef<{
    shown: FramingCue | null;
    pending: string | null;
    since: number;
    clearSince: number;
    spokenAt: Record<string, number>;
  }>({ shown: null, pending: null, since: 0, clearSince: 0, spokenAt: {} });

  const feedPoints = useSharedValue<number[]>([]);
  const feedW = useSharedValue(0);
  const feedH = useSharedValue(0);
  const feedSeq = useSharedValue(0);
  const feed = useRef({
    points: feedPoints,
    frameW: feedW,
    frameH: feedH,
    seq: feedSeq,
  }).current;

  const counterPulse = useSharedValue(1);

  const resetReps = () => {
    repRef.current = initialRepState();
    setRep(repRef.current);
  };

  const handlePose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const { frameWidth, frameHeight, timestamp } = e.nativeEvent;
      const rawPts = e.nativeEvent.points;
      const n = (rawPts.length / 4) | 0;

      // ---- overlay feed: minimal, no copies ----
      const d = dimsRef.current;
      if (d.w !== frameWidth || d.h !== frameHeight) {
        d.w = frameWidth;
        d.h = frameHeight;
        feed.frameW.value = frameWidth;
        feed.frameH.value = frameHeight;
      }
      feed.points.value = rawPts;
      seqRef.current += 1;
      feed.seq.value = seqRef.current;

      const seen = n > 0;
      if (seen !== hasPersonRef.current) {
        hasPersonRef.current = seen;
        setHasPerson(seen);
      }
      if (!seen) {
        personSince.current = 0;
        return;
      }

      const landmarks = landmarksOf(rawPts);
      const now = Date.now();
      if (!personSince.current) personSince.current = now;

      // Gestures. Locked unless: a set or rest is running, the person has been in frame and
      // framed correctly for 1.5 s, the 3.5 s cooldown after the last gesture is over, and the
      // exercise does not use the arms. Mid-set only "both hands up" is accepted; the rest of
      // the gestures only work between sets. This stops positioning poses (hands on hips,
      // T-pose, crossed arms) from firing commands.
      const armsBusy = checking && movement && ARM_MOVES.has(movement.id);
      const steady = now - personSince.current > 1500 && !framingRef.current.shown;
      const gestureOn =
        gestureMode !== 'off' && steady && now >= gestureCooldownUntil.current && !armsBusy;
      if (gestureOn) {
        const g = stepGesture(gestureRef.current, landmarks, now);
        let st = g.state;
        let fired = g.fired;
        let prog = g.progress;
        const cur = st.current;
        if (cur && gestureMode === 'set' && cur !== 'both_hands') {
          st = initialGestureState();
          fired = null;
          prog = 0;
        }
        gestureRef.current = st;
        if (fired) {
          gestureCooldownUntil.current = now + 3500;
          onGesture(fired);
        }
        const nextG = st.latched ? null : st.current;
        const nextP = st.latched ? 0 : Math.round(prog * 4) / 4;
        const gp = gestureProgressRef.current;
        if (nextG !== gp.g || (nextG && Math.abs(nextP - gp.p) >= 0.25) || nextP === 1) {
          gestureProgressRef.current = { g: nextG, p: nextP };
          setGestureProgress({ g: nextG, p: nextP });
        }
      } else if (gestureRef.current.current || gestureProgressRef.current.g) {
        gestureRef.current = initialGestureState();
        gestureProgressRef.current = { g: null, p: 0 };
        setGestureProgress({ g: null, p: 0 });
      }

      // Framing cues — throttled + debounced
      if (movement && now - lastFramingAt.current >= FRAMING_EVAL_MS) {
        lastFramingAt.current = now;
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
            if (countdown === 0) {
              const decision = cuesEngine.proposeCue(
                {
                  id: f.id,
                  category: 'FRAMING',
                  bannerText: f.text,
                  tone: 'framing',
                },
                now,
              );
              if (decision.shouldSpeak && decision.spokenTextToSpeak) {
                fr.spokenAt[f.id] = now;
                sayFn(decision.spokenTextToSpeak);
              }
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

      if (!before.fault && next.fault) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
        const decision = cuesEngine.proposeCue(
          {
            id: next.fault.id,
            category: 'FORM_FAULT',
            bannerText: next.fault.fix,
            tone: 'fault',
          },
          now,
        );
        if (decision.shouldSpeak && decision.spokenTextToSpeak) sayFn(decision.spokenTextToSpeak);
      } else if (before.fault && !next.fault) {
        cuesEngine.resolveFault(before.fault.id, now);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }

      const inSeconds = movement.kind === 'hold' || timed;
      if (next.reps > before.reps) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        if (!inSeconds && !next.fault) {
          const line = repLine(next.reps, item.target, !before.repHadFault);
          if (line) {
            const decision = cuesEngine.proposeCue(
              {
                id: `rep_${next.reps}`,
                category: 'RHYTHM_COUNT',
                bannerText: line,
                tone: 'cue',
                durationMs: 1500,
              },
              now,
            );
            if (decision.shouldSpeak && decision.spokenTextToSpeak)
              sayFn(decision.spokenTextToSpeak);
          }
        }
      }

      const value = progressOf(next);
      const prevValue = progressOf(before);
      if (value !== prevValue) {
        idleSince.current = now;
        idleNudged.current = false;
      }
      if (inSeconds && value > 0 && value !== prevValue) {
        const line = secondsLine(value, item.target);
        if (line) {
          const decision = cuesEngine.proposeCue(
            {
              id: `sec_${value}`,
              category: 'TRANSITION',
              bannerText: line,
              tone: 'cue',
              durationMs: 1800,
            },
            now,
          );
          if (decision.shouldSpeak && decision.spokenTextToSpeak) sayFn(decision.spokenTextToSpeak);
        }
      }

      if (
        !idleNudged.current &&
        idleSince.current > 0 &&
        now - idleSince.current > IDLE_NUDGE_MS &&
        landmarks.length > 0 &&
        !next.fault
      ) {
        idleNudged.current = true;
        const decision = cuesEngine.proposeCue(
          {
            id: 'idle_nudge',
            category: 'ENCOURAGEMENT',
            bannerText: idleLine(movement.kind),
            tone: 'cue',
            durationMs: 3000,
          },
          now,
        );
        if (decision.shouldSpeak && decision.spokenTextToSpeak) sayFn(decision.spokenTextToSpeak);
      }

      const doneNow = value >= item.target;
      const faultChanged = next.fault?.title !== before.fault?.title;
      if (value !== prevValue || faultChanged || doneNow) {
        lastUi.current = now;
        setRep(next);
      }
      if (doneNow) onCompleteSet(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      checking,
      movement,
      item,
      videoPlaying,
      onCompleteSet,
      onGesture,
      feed,
      facing,
      countdown,
      timed,
      progressOf,
      sayFn,
      gestureMode,
    ],
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
