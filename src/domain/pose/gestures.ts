/**
 * Hands-free control from the same pose landmarks the coach already tracks, for people
 * working out away from the phone (and for anyone who cannot use voice):
 *   one hand held above the head  -> play / pause the tutorial
 *   both hands held above the head -> finish the set, or skip the rest
 * A gesture must be held for a moment and then released before it can fire again, so
 * normal movement does not trigger it. Movements that raise the arms turn gestures off.
 */
import { LM, type Landmark } from './movement';

export type Gesture = 'one_hand' | 'both_hands';

const MIN_VIS = 0.6;
/** How long a gesture must be held, in ms. */
export const HOLD_MS: Record<Gesture, number> = { one_hand: 1000, both_hands: 1200 };

const seen = (l: Landmark | undefined) => Boolean(l && l.visibility >= MIN_VIS);

/** Which gesture the frame shows, if any: a wrist clearly above the nose. */
export function gestureIn(lms: Landmark[]): Gesture | null {
  if (lms.length < 33) return null;
  const nose = lms[LM.nose];
  const lw = lms[LM.leftWrist];
  const rw = lms[LM.rightWrist];
  const ls = lms[LM.leftShoulder];
  const rs = lms[LM.rightShoulder];
  if (!seen(nose) || !seen(ls) || !seen(rs)) return null;
  // Margin scales with body size in the frame (shoulder width).
  const margin = Math.max(0.03, Math.abs(ls.x - rs.x) * 0.25);
  const up = (w: Landmark) => seen(w) && w.y < nose.y - margin;
  const l = up(lw);
  const r = up(rw);
  if (l && r) return 'both_hands';
  if (l || r) return 'one_hand';
  return null;
}

export interface GestureState {
  current: Gesture | null;
  since: number | null;
  /** True once fired; must see no gesture before firing again. */
  latched: boolean;
}

export const initialGestureState = (): GestureState => ({ current: null, since: null, latched: false });

/**
 * Advances the tracker by one frame. Returns the new state, the gesture that fired on this
 * frame (if any) and how far the current hold is (0-1) for a progress ring.
 */
export function stepGesture(state: GestureState, lms: Landmark[], now: number): { state: GestureState; fired: Gesture | null; progress: number } {
  const g = gestureIn(lms);
  if (!g) return { state: initialGestureState(), fired: null, progress: 0 };
  if (state.latched) return { state: { ...state, current: g }, fired: null, progress: 1 };
  if (g !== state.current || state.since === null) return { state: { current: g, since: now, latched: false }, fired: null, progress: 0 };
  const progress = Math.min(1, (now - state.since) / HOLD_MS[g]);
  if (progress >= 1) return { state: { current: g, since: state.since, latched: true }, fired: g, progress: 1 };
  return { state, fired: null, progress };
}
