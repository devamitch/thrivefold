/**
 * Coarse eye-gaze direction for the eye games, ported from BlinkQuest (`core/vision/gaze.ts`).
 *
 * What it is: the direction the eyes point inside the head (left / right / up / down / centre),
 * from MediaPipe's eyeLook* blendshapes, falling back to the iris position between the eye
 * corners. What it is not: a calibrated on-screen gaze point, so games ask for directions.
 *
 * Coordinates are from the player's point of view: +x = player's right, +y = down. Each game
 * calibrates a personal centre and range first, which also proves the eyes (not a finger) drive it.
 */
import type { PoseFrame } from '../../../modules/pose-landmarker';

export interface GazeSample {
  x: number;
  y: number;
  source: 'blendshapes' | 'iris';
  /** Head yaw/pitch, to detect turning the head instead of moving the eyes. */
  headYawDeg: number | null;
  headPitchDeg: number | null;
  at: number;
}

export type GazeDirection = 'left' | 'right' | 'up' | 'down' | 'center';

const BLEND_KEYS = [
  'eyeLookInLeft',
  'eyeLookOutLeft',
  'eyeLookUpLeft',
  'eyeLookDownLeft',
  'eyeLookInRight',
  'eyeLookOutRight',
  'eyeLookUpRight',
  'eyeLookDownRight',
] as const;

export function fromBlendshapes(b: Record<string, number> | undefined): { x: number; y: number } | null {
  if (!b || !BLEND_KEYS.every((k) => typeof b[k] === 'number' && Number.isFinite(b[k]))) return null;
  // Looking to the player's right: right eye looks out, left eye looks in.
  const x = (b.eyeLookOutRight + b.eyeLookInLeft - b.eyeLookInRight - b.eyeLookOutLeft) / 2;
  const y = (b.eyeLookDownLeft + b.eyeLookDownRight - b.eyeLookUpLeft - b.eyeLookUpRight) / 2;
  return { x, y };
}

/**
 * Iris centre relative to the eye corners, both eyes averaged. Uses the face subset the camera
 * view sends (FACE_INDICES): 0 = mesh 33, 8 = 133, 32 = iris 468; 24 = 362, 16 = 263, 37 = iris 473.
 * The front-camera frame is mirrored, so the player's right is image-right.
 */
export function fromIris(face: number[] | undefined): { x: number; y: number } | null {
  if (!face || face.length < 76) return null;
  const p = (k: number) => ({ x: face[k * 2], y: face[k * 2 + 1] });
  const eye = (a: number, b: number, iris: number) => {
    const P = p(a);
    const Q = p(b);
    const C = p(iris);
    const w = Math.hypot(Q.x - P.x, Q.y - P.y);
    if (!(w > 0)) return null;
    return { h: (C.x - (P.x + Q.x) / 2) / w, v: (C.y - (P.y + Q.y) / 2) / w };
  };
  const l = eye(0, 8, 32);
  const r = eye(24, 16, 37);
  if (!l || !r) return null;
  return { x: ((l.h + r.h) / 2) * 4, y: ((l.v + r.v) / 2) * 6 };
}

export function gazeFromFrame(f: PoseFrame, at = Date.now()): GazeSample | null {
  const bs = fromBlendshapes(f.blendshapes);
  const g = bs ?? fromIris(f.face);
  if (!g) return null;
  return {
    x: g.x,
    y: g.y,
    source: bs ? 'blendshapes' : 'iris',
    headYawDeg: typeof f.head?.yaw === 'number' ? f.head.yaw : null,
    headPitchDeg: typeof f.head?.pitch === 'number' ? f.head.pitch : null,
    at,
  };
}

/** Exponential smoothing of successive samples (alpha 0.45, as in BlinkQuest). */
export function smoothGaze(prev: GazeSample | null, next: GazeSample, alpha = 0.45): GazeSample {
  if (!prev) return next;
  return { ...next, x: prev.x + alpha * (next.x - prev.x), y: prev.y + alpha * (next.y - prev.y) };
}

/** Personal centre and reach per direction, from the calibration steps. */
export interface GazeCalibration {
  cx: number;
  cy: number;
  left: number;
  right: number;
  up: number;
  down: number;
  yaw0: number | null;
  pitch0: number | null;
}

/** Minimum eye travel (raw units) a calibration step must show. */
export const MIN_REACH = { blendshapes: 0.08, iris: 0.05 } as const;

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Normalised gaze: 1 = the reach shown in calibration. */
export function normalize(g: { x: number; y: number }, c: GazeCalibration) {
  const dx = g.x - c.cx;
  const dy = g.y - c.cy;
  return { nx: dx >= 0 ? dx / c.right : dx / c.left, ny: dy >= 0 ? dy / c.down : dy / c.up };
}

export function directionOf(g: { x: number; y: number }, c: GazeCalibration, threshold = 0.45): GazeDirection {
  const { nx, ny } = normalize(g, c);
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  if (Math.max(ax, ay) < threshold) return 'center';
  if (ax >= ay) return nx > 0 ? 'right' : 'left';
  return ny > 0 ? 'down' : 'up';
}

/** True when the head turned noticeably instead of the eyes. */
export function headMoved(g: GazeSample, c: GazeCalibration, limitDeg = 12): boolean {
  if (g.headYawDeg === null || c.yaw0 === null) return false;
  const dyaw = Math.abs(g.headYawDeg - c.yaw0);
  const dpitch = g.headPitchDeg !== null && c.pitch0 !== null ? Math.abs(g.headPitchDeg - c.pitch0) : 0;
  return dyaw > limitDeg || dpitch > limitDeg;
}

/**
 * Builds the calibration from the five steps (median per step). Left/right must show real eye
 * movement; weak up/down borrows a share of the horizontal reach (eyelids hide vertical travel).
 * Returns the directions that were too weak when it fails.
 */
export function buildCalibration(
  r: Record<'center' | 'left' | 'right' | 'up' | 'down', { x: number; y: number }>,
  source: GazeSample['source'],
  head: { yaw: number | null; pitch: number | null },
): { ok: true; calibration: GazeCalibration } | { ok: false; weak: ('left' | 'right')[] } {
  const min = MIN_REACH[source];
  const reach = {
    left: r.center.x - r.left.x,
    right: r.right.x - r.center.x,
    up: r.center.y - r.up.y,
    down: r.down.y - r.center.y,
  };
  const weak = (['left', 'right'] as const).filter((k) => reach[k] < min);
  if (weak.length) return { ok: false, weak };
  const hFallback = ((reach.left + reach.right) / 2) * 0.6;
  if (reach.up < min * 0.5) reach.up = Math.max(reach.up, hFallback);
  if (reach.down < min * 0.5) reach.down = Math.max(reach.down, hFallback);
  return { ok: true, calibration: { cx: r.center.x, cy: r.center.y, ...reach, yaw0: head.yaw, pitch0: head.pitch } };
}
