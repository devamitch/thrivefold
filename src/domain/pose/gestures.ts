/**
 * Hands-free control from the same pose landmarks the coach already tracks, for people
 * working out away from the phone (and for anyone who cannot use voice):
 *   one hand held above the head  -> play / pause the tutorial
 *   both hands held above the head -> finish the set, or skip the rest
 * A gesture must be held for a moment and then released before it can fire again, so
 * normal movement does not trigger it. Movements that raise the arms turn gestures off.
 */
import { LM, type Landmark } from './movement';

export type Gesture = 'one_hand' | 'both_hands' | 'cross_arms' | 'hands_on_hips' | 't_pose';

const MIN_VIS = 0.6;
/** How long a gesture must be held, in ms. */
export const HOLD_MS: Record<Gesture, number> = {
  one_hand: 1000,
  both_hands: 1200,
  cross_arms: 1000,
  hands_on_hips: 1200,
  t_pose: 1200,
};

const seen = (l: Landmark | undefined) => Boolean(l && l.visibility >= MIN_VIS);

/** Which gesture the frame shows, if any: hands above head, crossed arms, hands on hips, or T-pose. */
export function gestureIn(lms: Landmark[]): Gesture | null {
  if (lms.length < 33) return null;
  const nose = lms[LM.nose];
  const lw = lms[LM.leftWrist];
  const rw = lms[LM.rightWrist];
  const ls = lms[LM.leftShoulder];
  const rs = lms[LM.rightShoulder];
  const lh = lms[LM.leftHip];
  const rh = lms[LM.rightHip];
  if (!seen(nose) || !seen(ls) || !seen(rs)) return null;

  // Margin scales with body size in the frame (shoulder width).
  const shoulderDist = Math.max(0.1, Math.hypot(ls.x - rs.x, ls.y - rs.y));
  const margin = Math.max(0.03, shoulderDist * 0.25);
  const up = (w: Landmark) => seen(w) && w.y < nose.y - margin;
  const l = up(lw);
  const r = up(rw);
  if (l && r) return 'both_hands';
  if (l || r) return 'one_hand';

  // Cross arms: both wrists crossed in front of torso (Pause command)
  if (seen(lw) && seen(rw)) {
    const wristDist = Math.hypot(lw.x - rw.x, lw.y - rw.y);
    const midShoulderY = (ls.y + rs.y) / 2;
    const midHipY = seen(lh) && seen(rh) ? (lh.y + rh.y) / 2 : midShoulderY + shoulderDist * 1.5;
    if (
      wristDist < shoulderDist * 0.45 &&
      lw.y > midShoulderY - margin &&
      lw.y < midHipY &&
      rw.y > midShoulderY - margin &&
      rw.y < midHipY
    ) {
      return 'cross_arms';
    }
  }

  // Hands on hips ("give me a minute" rest extension cue)
  if (seen(lh) && seen(rh) && seen(lw) && seen(rw)) {
    const lHipDist = Math.hypot(lw.x - lh.x, lw.y - lh.y);
    const rHipDist = Math.hypot(rw.x - rh.x, rw.y - rh.y);
    if (lHipDist < shoulderDist * 0.5 && rHipDist < shoulderDist * 0.5) {
      return 'hands_on_hips';
    }
  }

  // T-pose / wide arms ("go back" command)
  if (seen(lw) && seen(rw)) {
    const isLeftArmWide = lw.x < ls.x - shoulderDist * 0.5 && Math.abs(lw.y - ls.y) < shoulderDist * 0.45;
    const isRightArmWide = rw.x > rs.x + shoulderDist * 0.5 && Math.abs(rw.y - rs.y) < shoulderDist * 0.45;
    if (isLeftArmWide && isRightArmWide) {
      return 't_pose';
    }
  }

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
