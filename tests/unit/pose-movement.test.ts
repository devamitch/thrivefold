import {
  initialRepState,
  liveCue,
  jointAngle,
  LM,
  movementById,
  movementForExercise,
  stepReps,
  summarize,
  type Landmark,
} from '../../src/domain/pose/movement';

const point = (x: number, y: number, visibility = 0.95): Landmark => ({ x, y, z: 0, visibility });

/** A side-on body whose left knee is bent to roughly `kneeDeg` degrees. */
function body(kneeDeg: number, visibility = 0.95): Landmark[] {
  const lms = Array.from({ length: 33 }, () => point(0.5, 0.5, 0.1));
  const knee = point(0.5, 0.6, visibility);
  const ankle = point(0.5, 0.8, visibility);
  const rad = ((180 - kneeDeg) * Math.PI) / 180;
  const hip = point(0.5 + 0.2 * Math.sin(rad), 0.6 - 0.2 * Math.cos(rad), visibility);
  lms[LM.leftHip] = hip;
  lms[LM.leftKnee] = knee;
  lms[LM.leftAnkle] = ankle;
  return lms;
}

const squat = movementById('squat')!;

test('joint angle of a straight and a right-angled limb', () => {
  expect(jointAngle(point(0, 0), point(0, 1), point(0, 2))).toBeCloseTo(180);
  expect(jointAngle(point(1, 1), point(0, 1), point(0, 2))).toBeCloseTo(90);
  expect(body(90)[LM.leftHip]).toBeDefined();
  const b = body(95);
  expect(jointAngle(b[LM.leftHip], b[LM.leftKnee], b[LM.leftAnkle])).toBeCloseTo(95, 0);
});

test('counts a rep only after a full trip down and back up', () => {
  let s = initialRepState();
  for (const deg of [175, 150, 120, 100, 95, 120, 150, 170, 172, 100, 168]) s = stepReps(squat, s, body(deg));
  expect(s.reps).toBe(2);
});

test('jitter around one threshold never counts', () => {
  let s = initialRepState();
  for (const deg of [170, 158, 162, 158, 163, 157, 165]) s = stepReps(squat, s, body(deg));
  expect(s.reps).toBe(0);
});

test('low-confidence frames are ignored and the checkpoint needs enough valid frames', () => {
  let s = initialRepState();
  for (let i = 0; i < 20; i++) s = stepReps(squat, s, body(i % 2 ? 95 : 170, 0.3));
  expect(s.validFrames).toBe(0);
  expect(summarize(squat, s).meetsCheckpoint).toBe(false);

  s = initialRepState();
  for (let i = 0; i < 21; i++) s = stepReps(squat, s, body(i % 2 ? 95 : 170));
  const summary = summarize(squat, s);
  expect(summary.reps).toBe(10);
  expect(summary.meetsCheckpoint).toBe(true);
  expect(summary.angleRange![0]).toBeLessThan(100);
});

/** Side-on body lying horizontally; `hipDrop` moves the hip below (+) or above (-) the line. */
function plankBody(hipDrop: number, elbowDeg = 170): Landmark[] {
  const lms = Array.from({ length: 33 }, () => point(0.5, 0.5, 0.1));
  lms[LM.leftShoulder] = point(0.3, 0.5);
  lms[LM.leftAnkle] = point(0.9, 0.5);
  lms[LM.leftHip] = point(0.6, 0.5 + hipDrop);
  lms[LM.leftKnee] = point(0.75, 0.5 + hipDrop / 2);
  const rad = ((180 - elbowDeg) * Math.PI) / 180;
  lms[LM.leftElbow] = point(0.3, 0.65);
  lms[LM.leftWrist] = point(0.3 + 0.15 * Math.sin(rad), 0.65 + 0.15 * Math.cos(rad));
  return lms;
}

describe('form faults', () => {
  const plank = movementById('plank')!;
  const pushup = movementById('pushup')!;

  test('sagging hips are flagged only after they persist, then clear', () => {
    let s = initialRepState();
    s = stepReps(plank, s, plankBody(0.12), 0);
    expect(s.fault).toBeNull();
    for (let i = 1; i <= 8; i++) s = stepReps(plank, s, plankBody(0.12), i * 66);
    expect(s.fault?.id).toBe('hips_sag');
    for (let i = 9; i <= 20; i++) s = stepReps(plank, s, plankBody(0), i * 66);
    expect(s.fault).toBeNull();
  });

  test('hips too high is told apart from sagging', () => {
    let s = initialRepState();
    for (let i = 0; i < 10; i++) s = stepReps(pushup, s, plankBody(-0.12), i * 66);
    expect(s.fault?.id).toBe('hips_high');
  });

  test('plank hold counts only time in good form', () => {
    let s = initialRepState();
    for (let i = 0; i <= 150; i++) s = stepReps(plank, s, plankBody(0), i * 66);
    const good = summarize(plank, s);
    expect(good.holdSeconds).toBeGreaterThanOrEqual(9);
    expect(good.formScore).toBe(1);
    let bad = initialRepState();
    for (let i = 0; i <= 150; i++) bad = stepReps(plank, bad, plankBody(0.12), i * 66);
    expect(summarize(plank, bad).holdSeconds).toBeLessThan(1);
  });

  test('a squat that turns back early is flagged as shallow and not counted', () => {
    const squat = movementById('squat')!;
    let s = initialRepState();
    for (const deg of [170, 150, 130, 125, 140, 165, 170]) s = stepReps(squat, s, body(deg));
    expect(s.reps).toBe(0);
    expect(s.fault?.id).toBe('shallow');
    for (const deg of [140, 100, 165]) s = stepReps(squat, s, body(deg));
    expect(s.reps).toBe(1);
    expect(s.fault).toBeNull();
  });

  test('exercises map to camera-checked movements', () => {
    expect(movementForExercise('pushup')?.id).toBe('pushup');
    expect(movementForExercise('burpee')?.id).toBe('knee_bend');
    expect(movementForExercise('not_an_exercise')).toBeUndefined();
  });
});

describe('more exercises', () => {
  /** Front-facing standing body; `liftLeft`/`liftRight` raise that knee to roughly the given hip angle. */
  function standing(leftHipDeg = 175, rightHipDeg = 175, footUp = false): Landmark[] {
    const lms = Array.from({ length: 33 }, () => point(0.5, 0.5, 0.95));
    const leg = (hipX: number, deg: number, i: { sh: number; hip: number; knee: number; ankle: number }) => {
      lms[i.sh] = point(hipX, 0.3);
      lms[i.hip] = point(hipX, 0.55);
      const rad = ((180 - deg) * Math.PI) / 180;
      lms[i.knee] = point(hipX + 0.2 * Math.sin(rad), 0.55 + 0.2 * Math.cos(rad));
      lms[i.ankle] = point(hipX, footUp && i.hip === LM.leftHip ? 0.75 : 0.9);
    };
    leg(0.45, leftHipDeg, { sh: LM.leftShoulder, hip: LM.leftHip, knee: LM.leftKnee, ankle: LM.leftAnkle });
    leg(0.55, rightHipDeg, { sh: LM.rightShoulder, hip: LM.rightHip, knee: LM.rightKnee, ankle: LM.rightAnkle });
    return lms;
  }

  test('alternating knee lifts each count', () => {
    const def = movementById('knee_drive')!;
    let s = initialRepState();
    for (const [l, r] of [[175, 175], [100, 175], [175, 175], [175, 100], [175, 175]] as const) s = stepReps(def, s, standing(l, r));
    expect(s.reps).toBe(2);
  });

  test('a plank hold does not count while standing upright', () => {
    const def = movementById('plank')!;
    let s = initialRepState();
    for (let i = 0; i <= 60; i++) s = stepReps(def, s, standing(), i * 66);
    expect(s.holdMs).toBe(0);
    expect(liveCue(def, s, true)).toMatch(/plank/i);
  });

  test('single-leg balance counts only with a foot off the floor', () => {
    const def = movementById('balance')!;
    let down = initialRepState();
    for (let i = 0; i <= 40; i++) down = stepReps(def, down, standing(), i * 66);
    expect(down.holdMs).toBe(0);
    let up = initialRepState();
    for (let i = 0; i <= 40; i++) up = stepReps(def, up, standing(175, 175, true), i * 66);
    expect(up.holdMs).toBeGreaterThan(2000);
  });

  test('many plan exercises are camera-checked', () => {
    for (const id of ['jumping_jacks', 'high_knees', 'calf_raise', 'tree_pose', 'downward_dog', 'mountain_climber']) {
      expect(movementForExercise(id)).toBeDefined();
    }
  });
});

describe('every exercise and framing', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EXERCISES } = require('../../src/domain/fitness/workouts') as typeof import('../../src/domain/fitness/workouts');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { framingCue, setProgress } = require('../../src/domain/pose/movement') as typeof import('../../src/domain/pose/movement');

  const blank = () => Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 }));

  test('every catalogue exercise has a camera movement', () => {
    const missing = EXERCISES.filter((e) => !movementForExercise(e.id)).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  test('seated thoracic rotation counts a turn to each side', () => {
    const rot = movementForExercise('thoracic_rotation')!;
    const turned = (deg: number) => {
      const l = blank();
      const r = (deg * Math.PI) / 180;
      l[LM.leftShoulder] = { x: 0.5 - 0.1 * Math.cos(r), y: 0.4, z: -0.1 * Math.sin(r), visibility: 0.95 };
      l[LM.rightShoulder] = { x: 0.5 + 0.1 * Math.cos(r), y: 0.4, z: 0.1 * Math.sin(r), visibility: 0.95 };
      return l;
    };
    let s = initialRepState();
    for (const d of [0, 0, 10, 25, 40, 45, 40, 20, 5, 0, -10, -25, -40, -45, -30, -10, 0, 0]) s = stepReps(rot, s, turned(d));
    expect(s.reps).toBe(2);
  });

  test('small wobble in a rotation never counts', () => {
    const rot = movementForExercise('thoracic_rotation')!;
    let s = initialRepState();
    for (let i = 0; i < 30; i++) {
      const l = blank();
      l[LM.leftShoulder] = { x: 0.4, y: 0.4, z: i % 2 ? 0.01 : -0.01, visibility: 0.95 };
      l[LM.rightShoulder] = { x: 0.6, y: 0.4, z: 0, visibility: 0.95 };
      s = stepReps(rot, s, l);
    }
    expect(s.reps).toBe(0);
  });

  test('band pull-apart counts hands going wide and back', () => {
    const pa = movementForExercise('band_pull_apart')!;
    const spread = (w: number) => {
      const l = blank();
      l[LM.leftShoulder] = { x: 0.45, y: 0.4, z: 0, visibility: 0.95 };
      l[LM.rightShoulder] = { x: 0.55, y: 0.4, z: 0, visibility: 0.95 };
      l[LM.leftWrist] = { x: 0.5 - w / 2, y: 0.4, z: 0, visibility: 0.95 };
      l[LM.rightWrist] = { x: 0.5 + w / 2, y: 0.4, z: 0, visibility: 0.95 };
      return l;
    };
    let s = initialRepState();
    for (const w of [0.1, 0.1, 0.15, 0.22, 0.28, 0.3, 0.25, 0.15, 0.1, 0.1, 0.2, 0.3, 0.3, 0.15, 0.1]) s = stepReps(pa, s, spread(w));
    expect(s.reps).toBe(2);
  });

  test('timed exercises count seconds spent moving, not reps', () => {
    const jj = movementForExercise('jumping_jacks')!;
    let s = initialRepState();
    // One full jack every second for five seconds, ten frames a second.
    for (let f = 0; f < 50; f++) {
      const up = f % 10 < 5;
      const l = blank();
      l[LM.leftHip] = { x: 0.45, y: 0.6, z: 0, visibility: 0.95 };
      l[LM.rightHip] = { x: 0.55, y: 0.6, z: 0, visibility: 0.95 };
      l[LM.leftShoulder] = { x: 0.45, y: 0.3, z: 0, visibility: 0.95 };
      l[LM.rightShoulder] = { x: 0.55, y: 0.3, z: 0, visibility: 0.95 };
      l[LM.leftWrist] = { x: up ? 0.4 : 0.44, y: up ? 0.1 : 0.55, z: 0, visibility: 0.95 };
      l[LM.rightWrist] = { x: up ? 0.6 : 0.56, y: up ? 0.1 : 0.55, z: 0, visibility: 0.95 };
      s = stepReps(jj, s, l, f * 100);
    }
    expect(s.reps).toBeGreaterThanOrEqual(4);
    expect(setProgress(jj, s, true)).toBeGreaterThanOrEqual(3);
    expect(setProgress(jj, s, false)).toBe(s.reps);
  });

  test('framing: nobody, off to one side, feet cut off, too far, fine', () => {
    expect(framingCue(squat, [])?.id).toBe('step_in');
    const standing = (cx: number, top: number, bottom: number) => {
      const l = blank();
      const y = (t: number) => top + (bottom - top) * t;
      l[LM.nose] = { x: cx, y: y(0), z: 0, visibility: 0.95 };
      for (const [i, t] of [[LM.leftShoulder, 0.2], [LM.rightShoulder, 0.2], [LM.leftHip, 0.5], [LM.rightHip, 0.5], [LM.leftKnee, 0.75], [LM.rightKnee, 0.75], [LM.leftAnkle, 1], [LM.rightAnkle, 1]] as const) {
        l[i] = { x: cx + (i % 2 ? -0.05 : 0.05), y: y(t), z: 0, visibility: 0.95 };
      }
      return l;
    };
    expect(framingCue(squat, standing(0.5, 0.1, 0.9))).toBeNull();
    // Front camera (mirrored): on the left of the screen, step to your right.
    expect(framingCue(squat, standing(0.15, 0.1, 0.9))?.id).toBe('move_right');
    expect(framingCue(squat, standing(0.15, 0.1, 0.9), false)?.id).toBe('move_left');
    expect(framingCue(squat, standing(0.85, 0.1, 0.9))?.id).toBe('move_left');
    expect(framingCue(squat, standing(0.5, 0.1, 0.995))?.id).toBe('feet');
    expect(framingCue(squat, standing(0.5, 0.4, 0.7))?.id).toBe('closer');
    // Upper-body moves don't need feet.
    const upper = standing(0.5, 0.2, 1.4);
    upper[LM.leftAnkle].visibility = 0.1;
    upper[LM.rightAnkle].visibility = 0.1;
    expect(framingCue(movementForExercise('thoracic_rotation')!, upper)).toBeNull();
  });
});
