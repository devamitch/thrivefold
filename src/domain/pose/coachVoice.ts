/**
 * What the virtual coach says, as a person would: short, varied, never more than one line at a
 * time. Pure and deterministic (phrases rotate by count, never random), so the same workout
 * always sounds the same and tests can pin it down.
 */

import type { Gesture } from './gestures';

const PRAISE = ['Nice.', 'Good one.', 'Strong.', 'Smooth.', 'Lovely control.', 'That’s it.'];
const PUSH = ['Keep it steady.', 'Breathe out as you move.', 'You’ve got this.', 'Stay with it.'];

/** Line for a rep that just counted; null when silence is better (the beep and haptic suffice). */
export function repLine(reps: number, target: number, clean: boolean): string | null {
  const left = target - reps;
  if (left <= 0) return null;
  if (left === 1) return 'Last one.';
  if (left <= 3) return `${left} to go.`;
  if (reps === Math.ceil(target / 2)) return 'Halfway there.';
  // Every third rep, a word of praise for clean form or a nudge otherwise; else just the count.
  if (reps % 3 === 0)
    return clean ? PRAISE[(reps / 3) % PRAISE.length] : PUSH[(reps / 3) % PUSH.length];
  return String(reps);
}

/** Line for a timed set at whole seconds; null for most seconds. */
export function secondsLine(seconds: number, target: number): string | null {
  const left = target - seconds;
  if (left === 10 && target >= 20) return '10 seconds left. Stay strong.';
  if (left === 5) return 'Five more seconds.';
  if (left > 10 && seconds === Math.ceil(target / 2)) return 'Halfway. Keep breathing.';
  return null;
}

/** Said when a set starts: the exercise, the target and the single most useful cue. */
export function setIntroLine(
  name: string,
  set: number,
  sets: number,
  target: number,
  unit: 'reps' | 's',
  cue?: string,
): string {
  const goal = unit === 's' ? `${target} seconds` : `${target} reps`;
  const which = sets > 1 ? `Set ${set} of ${sets}. ` : '';
  return `${which}${name}, ${goal}.${cue ? ` ${cue}` : ''}`;
}

/** After a set: honest, short, with the rest length. */
export function setDoneLine(
  counted: number,
  target: number,
  unit: 'reps' | 's',
  restSeconds: number,
  cleanShare: number | null,
): string {
  const hit = counted >= target;
  const form =
    cleanShare === null
      ? ''
      : cleanShare >= 0.8
        ? ' Great form.'
        : cleanShare >= 0.5
          ? ' Form held up mostly.'
          : ' Let’s tidy the form next set.';
  const head = hit ? 'Set done.' : `Set done, ${counted} ${unit === 's' ? 'seconds' : 'reps'}.`;
  return `${head}${form} Rest ${restSeconds} seconds.`;
}

/** Nudge when someone is in view but nothing has counted for a while. */
export const IDLE_NUDGE_MS = 12_000;
export function idleLine(kind: 'reps' | 'hold'): string {
  return kind === 'hold'
    ? 'Whenever you’re ready, get into position and hold it.'
    : 'Whenever you’re ready, start moving. I’ll count for you.';
}

/** Halfway through a rest, a tip for what comes next. */
export function restTipLine(nextName: string, cue?: string): string {
  return cue ? `Next up, ${nextName}. ${cue}` : `Next up, ${nextName}.`;
}

/** Spoken introduction explaining hands-free remote camera controls. */
export function gestureIntroSpeech(): string {
  return 'Hey! You can control this workout completely hands-free from six to ten feet back. Raise one hand to pause or play the demo video. Raise both hands to finish your set or skip rest. Cross your arms over your chest to pause anytime. Put your hands on your hips to add thirty seconds of rest, or spread your arms wide in a T-pose to step back. I am watching your form and counting every clean rep.';
}

/** Human conversational voice feedback when a camera gesture is triggered. */
export function gestureTriggerSpeech(
  g: Gesture,
  context: { videoPlaying?: boolean; rest?: boolean; itemIdx?: number } = {},
): string {
  switch (g) {
    case 'one_hand':
      return context.videoPlaying
        ? 'Pausing the video for you. Take your time.'
        : 'Resuming the demo video. Follow along with me!';
    case 'both_hands':
      return context.rest
        ? 'Skipping rest. Let’s jump right back into it!'
        : 'Set completed! Strong effort. Take a breather.';
    case 'cross_arms':
      return 'Workout paused. Catch your breath and shake out your arms. Uncross or tap to continue.';
    case 'hands_on_hips':
      return 'Got it! Added thirty seconds of extra rest. Breathe deep and reset.';
    case 't_pose':
      return (context.itemIdx ?? 0) > 0
        ? 'Going back to the previous exercise. Let’s reset your rhythm.'
        : 'You’re already at the first exercise. Let’s crush this one!';
  }
}

/** Encouragement phrases as a real personal trainer would give during challenging sets. */
export function humanCoachingEncouragement(reps: number, target: number): string | null {
  const left = target - reps;
  if (left === 2) return 'Two more, stay strong!';
  if (left === 1) return 'Final rep, finish with full control!';
  if (reps === Math.floor(target / 2)) return 'Halfway point! Looking solid, keep that rhythm.';
  return null;
}
