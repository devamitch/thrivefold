/**
 * Face and eye exercises measured from MediaPipe face landmarks (the subset the native camera view
 * sends, see FACE_GROUPS in modules/pose-landmarker). Every measure is a ratio to the distance
 * between the outer eye corners, so it does not change with how far the phone is, and every rep is
 * judged against the person's own neutral face captured at the start (calibration).
 *
 * These are comfort and mobility exercises ("face yoga"), not therapy for facial palsy or any
 * condition, and nothing here diagnoses anything.
 */

export type FaceMetric = 'brow' | 'smile' | 'jaw' | 'squeeze' | 'gazeLeft' | 'gazeRight';

export interface FaceExercise {
  id: string;
  title: string;
  /** Spoken and shown instruction. */
  cue: string;
  metric: FaceMetric;
  reps: number;
  /** Relative change from neutral that counts as "in" the movement (e.g. 0.12 = 12 %). */
  enter: number;
  /** Hold time in the movement before the rep counts, ms. */
  holdMs: number;
}

export const FACE_ROUTINE: FaceExercise[] = [
  { id: 'brow', title: 'Brow lifts', cue: 'Lift your eyebrows high, then relax.', metric: 'brow', reps: 6, enter: 0.12, holdMs: 300 },
  { id: 'smile', title: 'Wide smile', cue: 'Smile as wide as you can, hold, then relax.', metric: 'smile', reps: 6, enter: 0.1, holdMs: 500 },
  { id: 'jaw', title: 'Jaw opener', cue: 'Open your mouth slowly into a big O, then close.', metric: 'jaw', reps: 6, enter: 0.6, holdMs: 400 },
  { id: 'squeeze', title: 'Eye squeeze', cue: 'Close your eyes gently but firmly, hold, then open.', metric: 'squeeze', reps: 5, enter: 0.45, holdMs: 800 },
  { id: 'look-left', title: 'Look left', cue: 'Keep your head still. Look to your left with your eyes only, then back to centre.', metric: 'gazeLeft', reps: 5, enter: 0.12, holdMs: 400 },
  { id: 'look-right', title: 'Look right', cue: 'Keep your head still. Look to your right with your eyes only, then back to centre.', metric: 'gazeRight', reps: 5, enter: 0.12, holdMs: 400 },
];

type P = { x: number; y: number };
const pt = (f: number[], k: number): P | null => (k * 2 + 1 < f.length ? { x: f[k * 2], y: f[k * 2 + 1] } : null);
const d = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

/** Point indices in the face array (see FACE_INDICES in PoseCameraView.kt). */
const K = {
  eyeOuterA: 0, eyeInnerA: 8, lidTopA: 12, lidBottomA: 4,
  eyeOuterB: 16, eyeInnerB: 24, lidTopB: 28, lidBottomB: 20,
  irisA: 32, irisB: 37,
  browA: 44, browB: 54,
  mouthCornerA: 62, mouthCornerB: 72, lipBottom: 67, lipTop: 77,
};

export interface FaceMeasures {
  brow: number;
  smile: number;
  jaw: number;
  /** Eye openness (lid gap / eye width); the squeeze exercise looks for a drop. */
  eyeOpen: number;
  /** Iris position across the eye, 0 = one corner, 1 = the other (averaged over both eyes). */
  gaze: number;
}

/** Ratios for one frame, or null when the face points are missing. */
export function measureFace(face: number[] | undefined): FaceMeasures | null {
  if (!face || face.length < 118 * 2) return null;
  const g = (k: number) => pt(face, k);
  const oa = g(K.eyeOuterA), ob = g(K.eyeOuterB), ia = g(K.eyeInnerA), ib = g(K.eyeInnerB);
  const ta = g(K.lidTopA), tb = g(K.lidTopB), ba = g(K.lidBottomA), bb = g(K.lidBottomB);
  const ra = g(K.irisA), rb = g(K.irisB), wa = g(K.browA), wb = g(K.browB);
  const ma = g(K.mouthCornerA), mb = g(K.mouthCornerB), lb = g(K.lipBottom), lt = g(K.lipTop);
  if (!oa || !ob || !ia || !ib || !ta || !tb || !ba || !bb || !ra || !rb || !wa || !wb || !ma || !mb || !lb || !lt) return null;
  const iod = d(oa, ob);
  if (iod < 0.02) return null;
  const across = (outer: P, inner: P, iris: P) => {
    const w = inner.x - outer.x;
    return Math.abs(w) < 1e-4 ? 0.5 : (iris.x - outer.x) / w;
  };
  return {
    brow: (Math.abs(ta.y - wa.y) + Math.abs(tb.y - wb.y)) / 2 / iod,
    smile: d(ma, mb) / iod,
    jaw: d(lt, lb) / iod,
    eyeOpen: (d(ta, ba) / d(oa, ia) + d(tb, bb) / d(ob, ib)) / 2,
    // Eye A's corners run outer→inner one way and eye B's the other; flip B so both share a direction.
    gaze: (across(oa, ia, ra) + (1 - across(ob, ib, rb))) / 2,
  };
}

/** How far into the movement this frame is, as a relative change from neutral (positive = moving). */
export function movement(metric: FaceMetric, m: FaceMeasures, neutral: FaceMeasures): number {
  switch (metric) {
    case 'brow':
      return m.brow / neutral.brow - 1;
    case 'smile':
      return m.smile / neutral.smile - 1;
    case 'jaw':
      return m.jaw / Math.max(0.02, neutral.jaw) - 1;
    case 'squeeze':
      return 1 - m.eyeOpen / neutral.eyeOpen;
    // The front-camera frame is mirrored, so looking to your left moves the irises toward smaller x.
    case 'gazeLeft':
      return neutral.gaze - m.gaze;
    case 'gazeRight':
      return m.gaze - neutral.gaze;
  }
}

/** Mean of calibration frames. */
export function averageMeasures(samples: FaceMeasures[]): FaceMeasures | null {
  if (samples.length === 0) return null;
  const sum = samples.reduce(
    (a, s) => ({ brow: a.brow + s.brow, smile: a.smile + s.smile, jaw: a.jaw + s.jaw, eyeOpen: a.eyeOpen + s.eyeOpen, gaze: a.gaze + s.gaze }),
    { brow: 0, smile: 0, jaw: 0, eyeOpen: 0, gaze: 0 },
  );
  const n = samples.length;
  return { brow: sum.brow / n, smile: sum.smile / n, jaw: sum.jaw / n, eyeOpen: sum.eyeOpen / n, gaze: sum.gaze / n };
}

export interface RepState {
  reps: number;
  inSince: number | null;
  /** True after the hold completed, until the face returns near neutral. */
  counted: boolean;
}

export const initialRep = (): RepState => ({ reps: 0, inSince: null, counted: false });

/**
 * One rep = move past `enter`, hold for `holdMs`, return below half of `enter`.
 * The rep is counted at the end of the hold so the coach can say the number promptly.
 */
export function stepRep(s: RepState, ex: FaceExercise, value: number, now: number): RepState {
  if (s.counted) return value < ex.enter / 2 ? { ...s, counted: false, inSince: null } : s;
  if (value >= ex.enter) {
    const inSince = s.inSince ?? now;
    if (now - inSince >= ex.holdMs) return { reps: s.reps + 1, inSince: null, counted: true };
    return s.inSince === null ? { ...s, inSince } : s;
  }
  return s.inSince === null ? s : { ...s, inSince: null };
}
