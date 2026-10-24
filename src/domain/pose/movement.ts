/**
 * Registered movement checkpoints for MediaPipe pose landmarks (catalog
 * poseLandmarkVerification, criteria registered_movement_checkpoint_v1). Pure and
 * deterministic: joint angles from the 33 normalized landmarks, a rep counter with
 * hysteresis so jitter never double-counts, and a session summary that holds derived
 * numbers only. It measures visible movement; it never judges fitness, injury or body shape.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

/** MediaPipe Pose landmark indices used here. */
export const LM = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export const MIN_LANDMARK_CONFIDENCE = 0.65;
export const MIN_VALID_FRAMES = 12;

export type MovementId = 'squat' | 'sit_to_stand' | 'arm_raise';

export interface MovementDefinition {
  id: MovementId;
  title: string;
  cue: string;
  /** Joint triplets [a, vertex, c] for the left and right side. */
  joints: { left: [number, number, number]; right: [number, number, number] };
  /** Rep goes "down" below `low` and counts on return above `high` (or the reverse). */
  low: number;
  high: number;
  /** 'flex' counts high -> low -> high (squat); 'extend' counts low -> high -> low (arm raise). */
  pattern: 'flex' | 'extend';
  targetReps: number;
}

export const MOVEMENTS: MovementDefinition[] = [
  {
    id: 'squat',
    title: 'Bodyweight squat',
    cue: 'Stand side-on, about two metres from the phone, whole body in view.',
    joints: { left: [LM.leftHip, LM.leftKnee, LM.leftAnkle], right: [LM.rightHip, LM.rightKnee, LM.rightAnkle] },
    low: 110,
    high: 160,
    pattern: 'flex',
    targetReps: 10,
  },
  {
    id: 'sit_to_stand',
    title: 'Sit to stand',
    cue: 'Use a steady chair. Stand side-on so hips, knees and ankles are in view.',
    joints: { left: [LM.leftHip, LM.leftKnee, LM.leftAnkle], right: [LM.rightHip, LM.rightKnee, LM.rightAnkle] },
    low: 115,
    high: 155,
    pattern: 'flex',
    targetReps: 8,
  },
  {
    id: 'arm_raise',
    title: 'Overhead arm raise',
    cue: 'Face the phone with your upper body in view. Seated is fine.',
    joints: { left: [LM.leftHip, LM.leftShoulder, LM.leftWrist], right: [LM.rightHip, LM.rightShoulder, LM.rightWrist] },
    low: 45,
    high: 140,
    pattern: 'extend',
    targetReps: 10,
  },
];

export const movementById = (id: string) => MOVEMENTS.find((m) => m.id === id);

/** Angle at vertex b, in degrees (0-180), in the image plane. */
export function jointAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (n === 0) return NaN;
  const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** The movement angle from the better-visible side, or null when neither side is confident. */
export function readAngle(def: MovementDefinition, landmarks: Landmark[]): { angle: number; confidence: number } | null {
  if (landmarks.length < 33) return null;
  let best: { angle: number; confidence: number } | null = null;
  for (const side of [def.joints.left, def.joints.right]) {
    const pts = side.map((i) => landmarks[i]);
    const confidence = Math.min(...pts.map((p) => p.visibility));
    if (confidence < MIN_LANDMARK_CONFIDENCE) continue;
    const angle = jointAngle(pts[0], pts[1], pts[2]);
    if (Number.isFinite(angle) && (!best || confidence > best.confidence)) best = { angle, confidence };
  }
  return best;
}

export interface RepState {
  phase: 'start' | 'moving';
  reps: number;
  validFrames: number;
  totalFrames: number;
  confidenceSum: number;
  minAngle: number | null;
  maxAngle: number | null;
  lastAngle: number | null;
}

export const initialRepState = (): RepState => ({
  phase: 'start',
  reps: 0,
  validFrames: 0,
  totalFrames: 0,
  confidenceSum: 0,
  minAngle: null,
  maxAngle: null,
  lastAngle: null,
});

/** Advances the counter by one frame. A rep needs a full trip past both thresholds. */
export function stepReps(def: MovementDefinition, state: RepState, landmarks: Landmark[]): RepState {
  const reading = readAngle(def, landmarks);
  const next: RepState = { ...state, totalFrames: state.totalFrames + 1 };
  if (!reading) return next;
  const { angle, confidence } = reading;
  next.validFrames += 1;
  next.confidenceSum += confidence;
  next.lastAngle = angle;
  next.minAngle = state.minAngle === null ? angle : Math.min(state.minAngle, angle);
  next.maxAngle = state.maxAngle === null ? angle : Math.max(state.maxAngle, angle);
  const reachedTurn = def.pattern === 'flex' ? angle <= def.low : angle >= def.high;
  const backToStart = def.pattern === 'flex' ? angle >= def.high : angle <= def.low;
  if (state.phase === 'start' && reachedTurn) next.phase = 'moving';
  else if (state.phase === 'moving' && backToStart) {
    next.phase = 'start';
    next.reps += 1;
  }
  return next;
}

export interface PoseSessionSummary {
  movementId: MovementId;
  reps: number;
  targetReps: number;
  validFrameCount: number;
  totalFrameCount: number;
  meanLandmarkConfidence: number;
  /** Range of motion seen, in degrees; compared only with the person's own earlier sessions. */
  angleRange: [number, number] | null;
  /** True when the session met the catalog's minimum frames and confidence. */
  meetsCheckpoint: boolean;
}

export function summarize(def: MovementDefinition, s: RepState): PoseSessionSummary {
  const mean = s.validFrames ? s.confidenceSum / s.validFrames : 0;
  return {
    movementId: def.id,
    reps: s.reps,
    targetReps: def.targetReps,
    validFrameCount: s.validFrames,
    totalFrameCount: s.totalFrames,
    meanLandmarkConfidence: Math.round(mean * 100) / 100,
    angleRange: s.minAngle !== null && s.maxAngle !== null ? [Math.round(s.minAngle), Math.round(s.maxAngle)] : null,
    meetsCheckpoint: s.validFrames >= MIN_VALID_FRAMES && mean >= MIN_LANDMARK_CONFIDENCE && s.reps > 0,
  };
}

/** Plain coaching line for the live screen, from the latest frame only. */
export function liveCue(def: MovementDefinition, s: RepState, personInView: boolean): string {
  if (!personInView) return 'Step back until your whole body is in view.';
  if (s.lastAngle === null) return def.cue;
  if (def.pattern === 'flex') return s.phase === 'moving' ? 'Good depth. Now stand tall.' : 'Bend your knees and sit back.';
  return s.phase === 'moving' ? 'Arms up. Now lower slowly.' : 'Raise your arms overhead.';
}
