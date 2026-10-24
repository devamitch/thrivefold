import {
  initialRepState,
  jointAngle,
  LM,
  movementById,
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
