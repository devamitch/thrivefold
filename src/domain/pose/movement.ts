/**
 * Registered movement checkpoints for MediaPipe pose landmarks (catalog
 * poseLandmarkVerification, criteria registered_movement_checkpoint_v1). Pure and
 * deterministic: joint angles from the 33 normalized landmarks, a rep counter with
 * hysteresis so jitter never double-counts, debounced form faults with plain fixes, and a
 * session summary that holds derived numbers only. It measures visible movement; it never
 * judges fitness, injury or body shape.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

/** MediaPipe Pose landmark indices used here. */
export const LM = {
  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  mouthLeft: 9,
  mouthRight: 10,
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
  leftHeel: 29,
  rightHeel: 30,
  leftFoot: 31,
  rightFoot: 32,
} as const;

/** Bones drawn on the camera overlay. */
export const SKELETON: [number, number][] = [
  [LM.leftShoulder, LM.rightShoulder],
  [LM.leftShoulder, LM.leftElbow],
  [LM.leftElbow, LM.leftWrist],
  [LM.rightShoulder, LM.rightElbow],
  [LM.rightElbow, LM.rightWrist],
  [LM.leftShoulder, LM.leftHip],
  [LM.rightShoulder, LM.rightHip],
  [LM.leftHip, LM.rightHip],
  [LM.leftHip, LM.leftKnee],
  [LM.leftKnee, LM.leftAnkle],
  [LM.rightHip, LM.rightKnee],
  [LM.rightKnee, LM.rightAnkle],
];

export const MIN_LANDMARK_CONFIDENCE = 0.65;
export const MIN_VALID_FRAMES = 12;
/** A fault must persist this many valid frames (~0.4 s) before it is shown. */
const FAULT_ON_FRAMES = 6;
/** ...and be absent this many before it clears. */
const FAULT_OFF_FRAMES = 8;

export type MovementId =
  | 'squat'
  | 'sit_to_stand'
  | 'arm_raise'
  | 'pushup'
  | 'glute_bridge'
  | 'lunge'
  | 'plank'
  | 'side_plank'
  | 'calf_raise'
  | 'jumping_jack'
  | 'knee_drive'
  | 'mountain_climber'
  | 'leg_extension'
  | 'bird_dog'
  | 'balance'
  | 'down_dog'
  | 'warrior'
  | 'eye_rest_blink'
  | 'neck_head_tilt';

type Triplet = [number, number, number];

export interface MovementDefinition {
  id: MovementId;
  title: string;
  cue: string;
  /** Reps are counted from an angle; holds count seconds in good form. */
  kind: 'reps' | 'hold';
  /** Joint triplets [a, vertex, c] for the left and right side. */
  joints: { left: Triplet; right: Triplet };
  /** Rep goes past `low` and counts on return past `high` (or the reverse). */
  low: number;
  high: number;
  /** 'flex' counts high -> low -> high (squat); 'extend' counts low -> high -> low (arm raise). */
  pattern: 'flex' | 'extend';
  targetReps: number;
  /** Form checks run on every valid frame. */
  checks: FormCheckId[];
  /** Which side's angle counts: the clearer side (default), or the smaller / larger of both. */
  sideRule?: 'best' | 'min' | 'max';
  /** Holds: time counts only while this posture is recognised. */
  holdWhen?: (landmarks: Landmark[]) => boolean;
  /** What to say while the posture is not recognised yet. */
  holdHint?: string;
}

export type FormCheckId = 'chest_up' | 'hip_line' | 'straight_arms' | 'depth';

export interface FormFault {
  id: string;
  /** What is wrong, in a few words. */
  title: string;
  /** How to fix it. */
  fix: string;
  /** Landmarks to highlight on the overlay. */
  joints: number[];
}

const side = (l: Triplet, r: Triplet) => ({ left: l, right: r });
const KNEE = side([LM.leftHip, LM.leftKnee, LM.leftAnkle], [LM.rightHip, LM.rightKnee, LM.rightAnkle]);
const ELBOW = side([LM.leftShoulder, LM.leftElbow, LM.leftWrist], [LM.rightShoulder, LM.rightElbow, LM.rightWrist]);
const SHOULDER = side([LM.leftHip, LM.leftShoulder, LM.leftWrist], [LM.rightHip, LM.rightShoulder, LM.rightWrist]);
const HIP = side([LM.leftShoulder, LM.leftHip, LM.leftKnee], [LM.rightShoulder, LM.rightHip, LM.rightKnee]);
const BODY_LINE = side([LM.leftShoulder, LM.leftHip, LM.leftAnkle], [LM.rightShoulder, LM.rightHip, LM.rightAnkle]);

const ANKLE = side([LM.leftKnee, LM.leftAnkle, LM.leftFoot], [LM.rightKnee, LM.rightAnkle, LM.rightFoot]);
const NECK = side([LM.leftEar, LM.leftShoulder, LM.leftHip], [LM.rightEar, LM.rightShoulder, LM.rightHip]);
const FACE = side([LM.leftEye, LM.nose, LM.leftEar], [LM.rightEye, LM.nose, LM.rightEar]);

const seen = (l: Landmark | undefined) => Boolean(l && l.visibility >= MIN_LANDMARK_CONFIDENCE);

/** Head upright and eyes relaxed with horizontal alignment for 20-20-20 pause. */
function eyesRelaxedLevel(l: Landmark[]): boolean {
  if (!seen(l[LM.nose]) || !seen(l[LM.leftEye]) || !seen(l[LM.rightEye])) return false;
  const dy = Math.abs(l[LM.leftEye].y - l[LM.rightEye].y);
  const dx = Math.abs(l[LM.leftEye].x - l[LM.rightEye].x);
  return dx > 0.02 && dy / dx < 0.35;
}

/** Shoulders-to-ankles line within 35 degrees of horizontal: lying or in a plank. */
function horizontal(l: Landmark[]): boolean {
  const sh = seen(l[LM.leftShoulder]) ? l[LM.leftShoulder] : l[LM.rightShoulder];
  const an = seen(l[LM.leftAnkle]) ? l[LM.leftAnkle] : l[LM.rightAnkle];
  if (!seen(sh) || !seen(an)) return false;
  const deg = (Math.atan2(Math.abs(an.y - sh.y), Math.abs(an.x - sh.x)) * 180) / Math.PI;
  return deg < 35;
}

/** One foot clearly off the floor while standing. */
function oneFootUp(l: Landmark[]): boolean {
  if (!seen(l[LM.leftAnkle]) || !seen(l[LM.rightAnkle]) || !seen(l[LM.leftHip])) return false;
  const leg = Math.abs(l[LM.leftAnkle].y - l[LM.leftHip].y) || 1;
  return Math.abs(l[LM.leftAnkle].y - l[LM.rightAnkle].y) / leg > 0.12;
}

/** Hips are the highest point between hands and feet: an inverted V. */
function invertedV(l: Landmark[]): boolean {
  if (![LM.leftShoulder, LM.leftHip, LM.leftAnkle].every((i) => seen(l[i]))) return false;
  return l[LM.leftHip].y < l[LM.leftShoulder].y - 0.05 && l[LM.leftHip].y < l[LM.leftAnkle].y - 0.05;
}

/** A bent front knee with both arms lifted out to the sides. */
function warriorShape(l: Landmark[]): boolean {
  const knees = [jointAngle(l[LM.leftHip], l[LM.leftKnee], l[LM.leftAnkle]), jointAngle(l[LM.rightHip], l[LM.rightKnee], l[LM.rightAnkle])];
  const arms = [jointAngle(l[LM.leftHip], l[LM.leftShoulder], l[LM.leftWrist]), jointAngle(l[LM.rightHip], l[LM.rightShoulder], l[LM.rightWrist])];
  if (![LM.leftKnee, LM.rightKnee, LM.leftWrist, LM.rightWrist].every((i) => seen(l[i]))) return false;
  return Math.min(...knees) < 140 && arms.every((a) => a > 65);
}


export const MOVEMENTS: MovementDefinition[] = [
  {
    id: 'squat',
    title: 'Bodyweight squat',
    cue: 'Stand side-on, about two metres from the phone, whole body in view.',
    kind: 'reps',
    joints: KNEE,
    low: 110,
    high: 160,
    pattern: 'flex',
    targetReps: 10,
    checks: ['chest_up', 'depth'],
  },
  {
    id: 'sit_to_stand',
    title: 'Sit to stand',
    cue: 'Use a steady chair. Stand side-on so hips, knees and ankles are in view.',
    kind: 'reps',
    joints: KNEE,
    low: 115,
    high: 155,
    pattern: 'flex',
    targetReps: 8,
    checks: ['chest_up'],
  },
  {
    id: 'arm_raise',
    title: 'Overhead arm raise',
    cue: 'Face the phone with your upper body in view. Seated is fine.',
    kind: 'reps',
    joints: SHOULDER,
    low: 45,
    high: 140,
    pattern: 'extend',
    targetReps: 10,
    checks: ['straight_arms'],
  },
  {
    id: 'pushup',
    title: 'Push-up',
    cue: 'Phone on the floor, side-on, about two metres away. Knees down is fine.',
    kind: 'reps',
    joints: ELBOW,
    low: 100,
    high: 150,
    pattern: 'flex',
    targetReps: 8,
    checks: ['hip_line', 'depth'],
  },
  {
    id: 'glute_bridge',
    title: 'Glute bridge',
    cue: 'Lie side-on to the phone with shoulders, hips and knees in view.',
    kind: 'reps',
    joints: HIP,
    low: 135,
    high: 160,
    pattern: 'extend',
    targetReps: 10,
    checks: ['depth'],
  },
  {
    id: 'lunge',
    title: 'Lunge',
    cue: 'Stand side-on with both legs in view.',
    kind: 'reps',
    joints: KNEE,
    low: 110,
    high: 160,
    pattern: 'flex',
    targetReps: 8,
    checks: ['chest_up', 'depth'],
  },
  {
    id: 'plank',
    title: 'Plank',
    cue: 'Phone on the floor, side-on, whole body in view.',
    kind: 'hold',
    joints: BODY_LINE,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 30,
    checks: ['hip_line'],
    holdWhen: horizontal,
    holdHint: 'Get into your plank, side-on to the phone.',
  },
  {
    id: 'side_plank',
    title: 'Side plank',
    cue: 'Face the phone with your whole body in view.',
    kind: 'hold',
    joints: BODY_LINE,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 20,
    checks: ['hip_line'],
    holdWhen: horizontal,
    holdHint: 'Lift onto your forearm and the side of your foot.',
  },
  {
    id: 'calf_raise',
    title: 'Calf raise',
    cue: 'Stand side-on with your feet in view. Hold a wall for balance.',
    kind: 'reps',
    joints: ANKLE,
    low: 118,
    high: 138,
    pattern: 'extend',
    targetReps: 12,
    checks: [],
  },
  {
    id: 'jumping_jack',
    title: 'Jumping jacks',
    cue: 'Face the phone, whole body in view.',
    kind: 'reps',
    joints: SHOULDER,
    low: 45,
    high: 140,
    pattern: 'extend',
    targetReps: 20,
    checks: [],
    sideRule: 'min',
  },
  {
    id: 'knee_drive',
    title: 'Knee lifts',
    cue: 'Face the phone with hips and knees in view. Each knee lift counts.',
    kind: 'reps',
    joints: HIP,
    low: 125,
    high: 160,
    pattern: 'flex',
    targetReps: 20,
    checks: [],
    sideRule: 'min',
  },
  {
    id: 'mountain_climber',
    title: 'Mountain climbers',
    cue: 'Plank side-on to the phone. Each knee drive counts.',
    kind: 'reps',
    joints: HIP,
    low: 110,
    high: 155,
    pattern: 'flex',
    targetReps: 20,
    checks: ['hip_line'],
    sideRule: 'min',
  },
  {
    id: 'leg_extension',
    title: 'Seated leg extension',
    cue: 'Sit side-on to the phone with hips, knees and ankles in view.',
    kind: 'reps',
    joints: KNEE,
    low: 110,
    high: 150,
    pattern: 'extend',
    targetReps: 10,
    checks: [],
    sideRule: 'max',
  },
  {
    id: 'bird_dog',
    title: 'Bird dog',
    cue: 'On hands and knees, side-on to the phone. Reach one arm forward.',
    kind: 'reps',
    joints: SHOULDER,
    low: 70,
    high: 150,
    pattern: 'extend',
    targetReps: 10,
    checks: [],
    sideRule: 'max',
  },
  {
    id: 'balance',
    title: 'Single-leg balance',
    cue: 'Face the phone near a wall or chair, whole body in view.',
    kind: 'hold',
    joints: KNEE,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 20,
    checks: [],
    holdWhen: oneFootUp,
    holdHint: 'Lift one foot off the floor.',
  },
  {
    id: 'down_dog',
    title: 'Downward dog',
    cue: 'Side-on to the phone, whole body in view.',
    kind: 'hold',
    joints: HIP,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 20,
    checks: [],
    holdWhen: invertedV,
    holdHint: 'Push your hips up and back into an upside-down V.',
  },
  {
    id: 'warrior',
    title: 'Warrior II',
    cue: 'Face the phone, whole body in view.',
    kind: 'hold',
    joints: KNEE,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 20,
    checks: [],
    sideRule: 'min',
    holdWhen: warriorShape,
    holdHint: 'Bend your front knee and reach both arms out wide.',
  },
  {
    id: 'eye_rest_blink',
    title: '20-20-20 Eye Rest & Mindful Blink',
    cue: 'Hold phone comfortably at eye level. Soften your gaze and relax facial muscles.',
    kind: 'hold',
    joints: FACE,
    low: 0,
    high: 180,
    pattern: 'extend',
    targetReps: 20,
    checks: [],
    holdWhen: eyesRelaxedLevel,
    holdHint: 'Hold head level and gaze softly straight ahead.',
  },
  {
    id: 'neck_head_tilt',
    title: 'Lateral Neck Stretch',
    cue: 'Face camera. Gently tilt one ear towards your shoulder.',
    kind: 'reps',
    joints: NECK,
    low: 75,
    high: 105,
    pattern: 'flex',
    targetReps: 8,
    checks: [],
  },
];

export const movementById = (id: string) => MOVEMENTS.find((m) => m.id === id);

/** Workout exercises the camera can check, and the movement used for each. */
export const EXERCISE_MOVEMENT: Record<string, MovementId> = {
  eye_rest_20_20: 'eye_rest_blink',
  neck_desk_stretch: 'neck_head_tilt',
  desk_break_eyes: 'eye_rest_blink',
  squat_bw: 'squat',
  goblet_squat: 'squat',
  chair_squat: 'sit_to_stand',
  pushup: 'pushup',
  glute_bridge: 'glute_bridge',
  reverse_lunge: 'lunge',
  plank: 'plank',
  side_plank: 'side_plank',
  db_overhead_press: 'arm_raise',
  seated_arm_circles: 'arm_raise',
  squat_jump: 'squat',
  step_up: 'lunge',
  calf_raise: 'calf_raise',
  jumping_jacks: 'jumping_jack',
  high_knees: 'knee_drive',
  march_in_place: 'knee_drive',
  seated_march: 'knee_drive',
  mountain_climber: 'mountain_climber',
  seated_leg_extension: 'leg_extension',
  bird_dog: 'bird_dog',
  single_leg_stand: 'balance',
  tree_pose: 'balance',
  downward_dog: 'down_dog',
  warrior_two: 'warrior',
};

export const movementForExercise = (exerciseId: string) => {
  const id = EXERCISE_MOVEMENT[exerciseId];
  return id ? movementById(id) : undefined;
};

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

/** The better-visible side's triplet, or null when neither side is confident. */
function bestSide(pair: { left: Triplet; right: Triplet }, landmarks: Landmark[]): { pts: Landmark[]; idx: Triplet; confidence: number } | null {
  if (landmarks.length < 33) return null;
  let best: { pts: Landmark[]; idx: Triplet; confidence: number } | null = null;
  for (const idx of [pair.left, pair.right]) {
    const pts = idx.map((i) => landmarks[i]);
    const confidence = Math.min(...pts.map((p) => p.visibility));
    if (confidence >= MIN_LANDMARK_CONFIDENCE && (!best || confidence > best.confidence)) best = { pts, idx, confidence };
  }
  return best;
}

/** The movement angle from the better-visible side, or null when neither side is confident. */
export function readAngle(def: MovementDefinition, landmarks: Landmark[]): { angle: number; confidence: number } | null {
  if (landmarks.length < 33) return null;
  if (def.sideRule === 'min' || def.sideRule === 'max') {
    const reads = [def.joints.left, def.joints.right]
      .map((idx) => {
        const pts = idx.map((i) => landmarks[i]);
        const confidence = Math.min(...pts.map((p) => p.visibility));
        return { angle: jointAngle(pts[0], pts[1], pts[2]), confidence };
      })
      .filter((r) => r.confidence >= MIN_LANDMARK_CONFIDENCE && Number.isFinite(r.angle));
    if (reads.length === 0) return null;
    const pick = reads.reduce((a, b) => ((def.sideRule === 'min' ? b.angle < a.angle : b.angle > a.angle) ? b : a));
    return pick;
  }
  const s = bestSide(def.joints, landmarks);
  if (!s) return null;
  const angle = jointAngle(s.pts[0], s.pts[1], s.pts[2]);
  return Number.isFinite(angle) ? { angle, confidence: s.confidence } : null;
}

/** Faults visible in one frame. `phase` and `angle` let depth checks use the rep state. */
export function frameFaults(def: MovementDefinition, landmarks: Landmark[]): FormFault[] {
  const faults: FormFault[] = [];
  for (const check of def.checks) {
    if (check === 'chest_up') {
      const s = bestSide(side([LM.leftShoulder, LM.leftHip, LM.leftKnee], [LM.rightShoulder, LM.rightHip, LM.rightKnee]), landmarks);
      if (!s) continue;
      const [sh, hip] = s.pts;
      // Torso angle from vertical, in the image plane.
      const lean = (Math.atan2(Math.abs(sh.x - hip.x), Math.abs(hip.y - sh.y)) * 180) / Math.PI;
      if (lean > 55) {
        faults.push({ id: 'chest_up', title: 'Leaning too far forward', fix: 'Lift your chest and keep your weight in your heels.', joints: [s.idx[0], s.idx[1]] });
      }
    }
    if (check === 'hip_line') {
      const s = bestSide(BODY_LINE, landmarks);
      if (!s) continue;
      const [sh, hip, ankle] = s.pts;
      const angle = jointAngle(sh, hip, ankle);
      if (angle < 155) {
        // Above or below the straight shoulder-to-ankle line (image y grows downwards).
        const t = (hip.x - sh.x) / (ankle.x - sh.x || 1e-6);
        const lineY = sh.y + t * (ankle.y - sh.y);
        const sagging = hip.y > lineY;
        faults.push(
          sagging
            ? { id: 'hips_sag', title: 'Hips are sagging', fix: 'Squeeze your glutes and brace your stomach so you form one straight line.', joints: [s.idx[1]] }
            : { id: 'hips_high', title: 'Hips are too high', fix: 'Lower your hips until shoulders, hips and ankles line up.', joints: [s.idx[1]] },
        );
      }
    }
    if (check === 'straight_arms') {
      const s = bestSide(ELBOW, landmarks);
      const reach = readAngle(def, landmarks);
      if (!s || !reach || reach.angle < def.high - 10) continue;
      if (jointAngle(s.pts[0], s.pts[1], s.pts[2]) < 140) {
        faults.push({ id: 'bent_arms', title: 'Arms are bent at the top', fix: 'Reach all the way up with straight arms.', joints: [s.idx[1]] });
      }
    }
  }
  return faults;
}

export interface RepState {
  phase: 'start' | 'moving';
  reps: number;
  /** Reps finished with no fault shown during them. */
  cleanReps: number;
  validFrames: number;
  totalFrames: number;
  /** Valid frames with no active fault. */
  goodFrames: number;
  confidenceSum: number;
  minAngle: number | null;
  maxAngle: number | null;
  lastAngle: number | null;
  /** Deepest point of the current rep, for the depth check. */
  repExtreme: number | null;
  repHadFault: boolean;
  /** Debounced fault currently shown, and its counters. */
  fault: FormFault | null;
  faultFrames: number;
  clearFrames: number;
  pendingFaultId: string | null;
  /** Fault ids seen this session, with counts. */
  faultCounts: Record<string, number>;
  /** Holds: milliseconds held in good form. */
  holdMs: number;
  lastTimestamp: number | null;
  /** Holds: whether the posture is recognised in the latest frame. */
  inPosture: boolean;
}

export const initialRepState = (): RepState => ({
  phase: 'start',
  reps: 0,
  cleanReps: 0,
  validFrames: 0,
  totalFrames: 0,
  goodFrames: 0,
  confidenceSum: 0,
  minAngle: null,
  maxAngle: null,
  lastAngle: null,
  repExtreme: null,
  repHadFault: false,
  fault: null,
  faultFrames: 0,
  clearFrames: 0,
  pendingFaultId: null,
  faultCounts: {},
  holdMs: 0,
  lastTimestamp: null,
  inPosture: false,
});

const SHALLOW: Record<string, FormFault> = {
  squat: { id: 'shallow', title: 'Not deep enough', fix: 'Sit back further, as if onto a low chair.', joints: [LM.leftKnee, LM.rightKnee] },
  lunge: { id: 'shallow', title: 'Not deep enough', fix: 'Lower your back knee closer to the floor.', joints: [LM.leftKnee, LM.rightKnee] },
  pushup: { id: 'shallow', title: 'Not low enough', fix: 'Bend your elbows more, bringing your chest towards the floor.', joints: [LM.leftElbow, LM.rightElbow] },
  glute_bridge: { id: 'shallow', title: 'Hips not high enough', fix: 'Push through your heels until knees, hips and shoulders line up.', joints: [LM.leftHip, LM.rightHip] },
};

/**
 * Advances the counter by one frame. A rep needs a full trip past both thresholds; a trip
 * that turns back before the threshold is flagged as too shallow when the movement checks
 * depth. `timestamp` (ms) is only needed for holds.
 */
export function stepReps(def: MovementDefinition, state: RepState, landmarks: Landmark[], timestamp?: number): RepState {
  const reading = readAngle(def, landmarks);
  const next: RepState = { ...state, totalFrames: state.totalFrames + 1, lastTimestamp: timestamp ?? state.lastTimestamp };
  if (!reading) return next;
  const { angle, confidence } = reading;
  next.validFrames += 1;
  next.confidenceSum += confidence;
  next.lastAngle = angle;
  next.minAngle = state.minAngle === null ? angle : Math.min(state.minAngle, angle);
  next.maxAngle = state.maxAngle === null ? angle : Math.max(state.maxAngle, angle);

  // Debounced faults: shown only after they persist, cleared only after they stay away.
  const faults = frameFaults(def, landmarks);
  const current = faults[0] ?? null;
  if (current) {
    next.faultFrames = state.pendingFaultId === current.id ? state.faultFrames + 1 : 1;
    next.pendingFaultId = current.id;
    next.clearFrames = 0;
    if (!state.fault && next.faultFrames >= FAULT_ON_FRAMES) {
      next.fault = current;
      next.faultCounts = { ...state.faultCounts, [current.id]: (state.faultCounts[current.id] ?? 0) + 1 };
    }
  } else {
    next.clearFrames = state.clearFrames + 1;
    next.faultFrames = 0;
    next.pendingFaultId = null;
    if (state.fault && next.clearFrames >= FAULT_OFF_FRAMES && state.fault.id !== 'shallow') next.fault = null;
  }
  if (next.fault) next.repHadFault = true;
  else next.goodFrames += 1;

  if (def.kind === 'hold') {
    const dt = timestamp !== undefined && state.lastTimestamp !== null ? Math.min(500, Math.max(0, timestamp - state.lastTimestamp)) : 0;
    next.inPosture = def.holdWhen ? def.holdWhen(landmarks) : true;
    if (!next.fault && next.inPosture) next.holdMs += dt;
    return next;
  }

  const towardTurn = def.pattern === 'flex' ? angle < def.high - 15 : angle > def.low + 15;
  const reachedTurn = def.pattern === 'flex' ? angle <= def.low : angle >= def.high;
  const backToStart = def.pattern === 'flex' ? angle >= def.high : angle <= def.low;
  if (towardTurn) next.repExtreme = state.repExtreme === null ? angle : def.pattern === 'flex' ? Math.min(state.repExtreme, angle) : Math.max(state.repExtreme, angle);

  if (state.phase === 'start' && reachedTurn) {
    next.phase = 'moving';
    // A good-depth rep clears a "too shallow" message.
    if (next.fault?.id === 'shallow') next.fault = null;
  } else if (state.phase === 'moving' && backToStart) {
    next.phase = 'start';
    next.reps += 1;
    if (!next.repHadFault) next.cleanReps += 1;
    next.repHadFault = false;
    next.repExtreme = null;
  } else if (state.phase === 'start' && backToStart && state.repExtreme !== null) {
    // Turned back without reaching depth.
    next.repExtreme = null;
    const shallow = SHALLOW[def.id];
    if (shallow && def.checks.includes('depth')) {
      next.fault = shallow;
      next.faultCounts = { ...state.faultCounts, shallow: (state.faultCounts.shallow ?? 0) + 1 };
    }
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
  /** Share of tracked frames with no form fault shown (0-1). */
  formScore?: number;
  cleanReps?: number;
  holdSeconds?: number;
  faultCounts?: Record<string, number>;
}

export function summarize(def: MovementDefinition, s: RepState): PoseSessionSummary {
  const mean = s.validFrames ? s.confidenceSum / s.validFrames : 0;
  const did = def.kind === 'hold' ? s.holdMs >= 5000 : s.reps > 0;
  return {
    movementId: def.id,
    reps: def.kind === 'hold' ? Math.round(s.holdMs / 1000) : s.reps,
    targetReps: def.targetReps,
    validFrameCount: s.validFrames,
    totalFrameCount: s.totalFrames,
    meanLandmarkConfidence: Math.round(mean * 100) / 100,
    angleRange: s.minAngle !== null && s.maxAngle !== null ? [Math.round(s.minAngle), Math.round(s.maxAngle)] : null,
    meetsCheckpoint: s.validFrames >= MIN_VALID_FRAMES && mean >= MIN_LANDMARK_CONFIDENCE && did,
    formScore: s.validFrames ? Math.round((s.goodFrames / s.validFrames) * 100) / 100 : 0,
    cleanReps: s.cleanReps,
    holdSeconds: Math.round(s.holdMs / 1000),
    faultCounts: s.faultCounts,
  };
}

/** Plain coaching line for the live screen, from the latest frame only. */
export function liveCue(def: MovementDefinition, s: RepState, personInView: boolean): string {
  if (!personInView) return 'Step back until your whole body is in view.';
  if (s.fault) return s.fault.fix;
  if (s.lastAngle === null) return def.cue;
  if (def.kind === 'hold') return s.inPosture ? 'Good. Hold it and keep breathing.' : (def.holdHint ?? def.cue);
  if (def.pattern === 'flex') return s.phase === 'moving' ? 'Good depth. Now back up.' : 'Lower with control.';
  return s.phase === 'moving' ? 'Good. Now lower slowly.' : 'Lift with control.';
}
