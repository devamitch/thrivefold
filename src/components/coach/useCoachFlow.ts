/**
 * useCoachFlow — decides WHEN things happen at the start of a workout, so camera, voice,
 * tutorial video and countdown never pile on top of each other.
 *
 *   tutorial     first-time fullscreen video. Camera OFF, voice silent, nothing counting.
 *   positioning  camera on, one spoken hint, waits until you are fully in frame and steady.
 *                No reps, no gestures, no timers. After 15 s a "Start anyway" button appears.
 *   running      "Get ready" beat -> 3-2-1 -> set (countdown 4 -> 3 -> 2 -> 1).
 *
 * The old code started the countdown from an 8 s timer even if you were still walking into
 * position, and kept counting reps / reading gestures during that time — that is what
 * fired commands by itself.
 *
 * Put at: src/components/coach/useCoachFlow.ts
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { FramingCue } from '@/domain/pose/movement';
import { coachVoice } from '@/services/ai/coachVoice';

import type { VideoDisplayMode } from './CoachVideoStage';

export type FlowStage = 'idle' | 'tutorial' | 'positioning' | 'running';

interface Opts {
  stage: FlowStage;
  setStage: (s: FlowStage) => void;
  hasWatched: boolean;
  videoMode: VideoDisplayMode;
  trackingReady: boolean;
  hasPerson: boolean;
  framing: FramingCue | null;
  /** Starts the "get ready" beat + 3-2-1 for the current set (setCountdown(4)). */
  beginSet: () => void;
}

const STEADY_MS = 1200;
const ANYWAY_MS = 15000;

export function useCoachFlow({
  stage,
  setStage,
  hasWatched,
  videoMode,
  trackingReady,
  hasPerson,
  framing,
  beginSet,
}: Opts) {
  const [canStartAnyway, setCanStartAnyway] = useState(false);
  const spoke = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  /** Call once when the person taps Start. */
  const begin = useCallback(
    (cameraAllowed: boolean) => {
      spoke.current = false;
      setCanStartAnyway(false);
      if (!cameraAllowed) {
        setStage('running');
        timer.current = setTimeout(beginSet, 800);
        return;
      }
      setStage(hasWatched ? 'positioning' : 'tutorial');
    },
    [hasWatched, beginSet, setStage],
  );

  const startNow = useCallback(() => {
    setStage('running');
    beginSet();
  }, [beginSet, setStage]);

  // Tutorial finished (closed / skipped / switched to PiP) -> positioning.
  useEffect(() => {
    if (stage === 'tutorial' && videoMode !== 'fullscreen') setStage('positioning');
  }, [stage, videoMode, setStage]);

  // Positioning: one hint, then silence; offer a manual start after a while.
  useEffect(() => {
    if (stage !== 'positioning') {
      setCanStartAnyway(false);
      return;
    }
    if (!spoke.current) {
      spoke.current = true;
      void coachVoice.speak(
        'Prop your phone about two metres back. I will start when I can see you.',
        { priority: 2 },
      );
    }
    const t = setTimeout(() => setCanStartAnyway(true), ANYWAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Auto-start only when tracking is live, a person is seen, framing is fine, and it stays so.
  useEffect(() => {
    if (stage !== 'positioning' || !trackingReady || !hasPerson || framing) return;
    const t = setTimeout(() => {
      setStage('running');
      beginSet();
    }, STEADY_MS);
    return () => clearTimeout(t);
  }, [stage, trackingReady, hasPerson, framing, beginSet, setStage]);

  return { begin, startNow, canStartAnyway };
}
