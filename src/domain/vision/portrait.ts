/**
 * Body & Style Companion: turns on-device photo measurements into plain, practical guidance.
 *
 * What this does: face shape and frame ideas, an estimated pupillary distance, body proportions
 * for clothing fit, a front-view posture check, and how well the outfit's colours pair.
 * What it never does: rate attractiveness, compare faces to an "ideal", infer ethnicity, skin
 * tone, age or gender, or recognise who someone is. Every result is an estimate from one photo.
 */

type V = { x: number; y: number };

/** Mesh point i in pixels (MediaPipe x and y are normalised separately to width and height). */
const meshPoint = (face: number[], i: number, w: number, h: number): V | null =>
  i * 3 + 1 < face.length ? { x: face[i * 3] * w, y: face[i * 3 + 1] * h } : null;
const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';

export interface FaceResult {
  shape: FaceShape;
  /** Width ratios to the cheekbones, and length to cheekbone width. */
  ratios: { forehead: number; jaw: number; length: number };
  /** Estimated pupillary distance in mm (iris diameter assumed 11.7 mm), or null. */
  pdMm: number | null;
  frames: string[];
  avoid: string;
}

const FRAMES: Record<FaceShape, { frames: string[]; avoid: string }> = {
  oval: { frames: ['Most styles suit you: try wayfarer, square or aviator', 'Frames about as wide as your face'], avoid: 'Very oversized frames that hide your brow line' },
  round: { frames: ['Rectangular or square frames add angles', 'A clear bridge and slightly wider frames'], avoid: 'Small round frames' },
  square: { frames: ['Round or oval frames soften a strong jaw', 'Thin metal or rimless styles'], avoid: 'Boxy, angular frames' },
  heart: { frames: ['Bottom-heavy or rimless frames', 'Light colours and round or oval lenses'], avoid: 'Heavy top-rims and decorated brow lines' },
  oblong: { frames: ['Tall frames with depth, or oversized styles', 'Decorative temples that add width'], avoid: 'Narrow, small frames' },
  diamond: { frames: ['Oval or cat-eye frames', 'Rimless or browline frames'], avoid: 'Narrow frames as wide as your eyes only' },
};

/** Face shape from the full 478-point mesh, or null when the face is missing or too small. */
export function analyseFace(face: number[], w: number, h: number): FaceResult | null {
  const g = (i: number) => meshPoint(face, i, w, h);
  const top = g(10), chin = g(152), cheekL = g(234), cheekR = g(454), browL = g(54), browR = g(284), jawL = g(172), jawR = g(397);
  if (!top || !chin || !cheekL || !cheekR || !browL || !browR || !jawL || !jawR) return null;
  const cheek = dist(cheekL, cheekR);
  if (cheek < 60) return null; // face too small in the photo for a fair reading
  // The mesh top (10) sits at the hairline-ish forehead; the true face length is ~10 % longer.
  const length = (dist(top, chin) * 1.1) / cheek;
  const forehead = dist(browL, browR) / cheek;
  const jaw = dist(jawL, jawR) / cheek;

  let shape: FaceShape;
  if (length >= 1.55) shape = 'oblong';
  else if (forehead < 0.82 && jaw < 0.8) shape = 'diamond';
  else if (forehead >= 0.86 && jaw < 0.78) shape = 'heart';
  else if (length < 1.32 && jaw >= 0.86) shape = 'square';
  else if (length < 1.32) shape = 'round';
  else shape = 'oval';

  const irisA = g(468), irisB = g(473), ea = g(469), eb = g(471), ec = g(474), ed = g(476);
  let pdMm: number | null = null;
  if (irisA && irisB && ea && eb && ec && ed) {
    const irisPx = (dist(ea, eb) + dist(ec, ed)) / 2;
    if (irisPx > 4) {
      const pd = (dist(irisA, irisB) / irisPx) * 11.7;
      pdMm = pd >= 50 && pd <= 76 ? Math.round(pd) : null;
    }
  }
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { shape, ratios: { forehead: r2(forehead), jaw: r2(jaw), length: r2(length) }, pdMm, ...FRAMES[shape] };
}

export type BodyShape = 'balanced' | 'shoulders_wider' | 'hips_wider' | 'defined_waist';

export interface BodyResult {
  shape: BodyShape;
  label: string;
  shoulderToHip: number;
  waistToHip: number;
  tips: string[];
}

const BODY: Record<BodyShape, { label: string; tips: string[] }> = {
  balanced: { label: 'Straight, balanced proportions', tips: ['Belts or wrap styles add shape at the waist', 'Layering and textured fabrics add dimension'] },
  shoulders_wider: { label: 'Shoulders wider than hips', tips: ['V-necks and raglan sleeves balance the shoulder line', 'Straight or wide-leg trousers add width below'] },
  hips_wider: { label: 'Hips wider than shoulders', tips: ['Structured shoulders or boat necks balance the top', 'A-line or straight cuts below the waist'] },
  defined_waist: { label: 'Similar shoulders and hips, narrower waist', tips: ['Fitted waists and wrap styles follow your outline', 'Avoid very boxy cuts that hide the waist if you like it shown'] },
};

/**
 * Proportions from the body width profile (64 bands top to bottom) and the pose (normalised
 * [x, y, visibility] * 33). Clothing and arms touching the body widen the outline, so this is a
 * fit guide only.
 */
export function analyseBody(widths: number[], pose: number[]): BodyResult | null {
  if (widths.length < 16 || pose.length < 33 * 3) return null;
  const y = (i: number) => pose[i * 3 + 1];
  const vis = (i: number) => pose[i * 3 + 2];
  if ([11, 12, 23, 24].some((i) => vis(i) < 0.5)) return null;
  const band = (ny: number) => Math.max(0, Math.min(widths.length - 1, Math.floor(ny * widths.length)));
  const at = (ny: number) => {
    const b = band(ny);
    return Math.max(widths[b], widths[Math.max(0, b - 1)], widths[Math.min(widths.length - 1, b + 1)]);
  };
  const shoulderY = (y(11) + y(12)) / 2 + 0.02; // just below the joints, where the shoulder outline is
  const hipY = (y(23) + y(24)) / 2;
  const shoulders = at(shoulderY);
  const hips = at(hipY);
  const waistY = shoulderY + (hipY - shoulderY) * 0.7;
  const waist = widths[band(waistY)];
  if (shoulders <= 0 || hips <= 0 || waist <= 0) return null;
  const sh = shoulders / hips;
  const wh = waist / hips;
  let shape: BodyShape;
  if (sh > 1.08) shape = 'shoulders_wider';
  else if (sh < 0.92) shape = 'hips_wider';
  else if (wh < 0.78) shape = 'defined_waist';
  else shape = 'balanced';
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { shape, shoulderToHip: r2(sh), waistToHip: r2(wh), ...BODY[shape] };
}

export interface PostureResult {
  score: number;
  shoulderTiltDeg: number;
  hipTiltDeg: number;
  headOffsetPct: number;
  notes: string[];
}

/** Front-view posture from the pose: level shoulders and hips, head over the body's centre. */
export function analysePosture(pose: number[], w: number, h: number): PostureResult | null {
  if (pose.length < 33 * 3) return null;
  const P = (i: number): V => ({ x: pose[i * 3] * w, y: pose[i * 3 + 1] * h });
  if ([0, 11, 12, 23, 24].some((i) => pose[i * 3 + 2] < 0.5)) return null;
  const tilt = (a: V, b: V) => Math.abs((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI) % 180;
  const level = (deg: number) => Math.min(deg, 180 - deg);
  const shoulderTilt = level(tilt(P(11), P(12)));
  const hipTilt = level(tilt(P(23), P(24)));
  const shoulderW = Math.max(1, dist(P(11), P(12)));
  const midShoulder = (P(11).x + P(12).x) / 2;
  const midHip = (P(23).x + P(24).x) / 2;
  const headOffset = Math.abs(P(0).x - (midShoulder + midHip) / 2) / shoulderW;
  const notes: string[] = [];
  let score = 100;
  if (shoulderTilt > 2.5) {
    score -= Math.min(30, (shoulderTilt - 2.5) * 6);
    notes.push('One shoulder sits higher. Try rolling both shoulders back and down.');
  }
  if (hipTilt > 2.5) {
    score -= Math.min(25, (hipTilt - 2.5) * 5);
    notes.push('Your hips are not level. Stand with weight on both feet.');
  }
  if (headOffset > 0.08) {
    score -= Math.min(25, (headOffset - 0.08) * 150);
    notes.push('Your head leans to one side of your body.');
  }
  if (!notes.length) notes.push('Shoulders, hips and head line up well from the front.');
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return { score: Math.max(0, Math.round(score)), shoulderTiltDeg: r1(shoulderTilt), hipTiltDeg: r1(hipTilt), headOffsetPct: Math.round(headOffset * 100), notes };
}

type RGB = [number, number, number];

function hsl([r, g, b]: RGB): { h: number; s: number; l: number } {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d < 1e-6) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

export interface ColourResult {
  score: number;
  pairing: 'neutral' | 'tonal' | 'analogous' | 'complementary' | 'contrasting';
  note: string;
}

/** How the top and bottom colours pair, by colour-wheel relationships. About the outfit only. */
export function analyseColours(top: RGB | null | undefined, bottom: RGB | null | undefined): ColourResult | null {
  if (!top || !bottom) return null;
  const a = hsl(top), b = hsl(bottom);
  const neutral = (c: { s: number; l: number }) => c.s < 0.18 || c.l < 0.12 || c.l > 0.9;
  const hueGap = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
  const lightGap = Math.abs(a.l - b.l);
  if (neutral(a) || neutral(b)) {
    return { score: lightGap > 0.15 ? 90 : 80, pairing: 'neutral', note: 'A neutral piece goes with almost anything.' };
  }
  if (hueGap < 15) return { score: lightGap > 0.12 ? 88 : 75, pairing: 'tonal', note: lightGap > 0.12 ? 'Tonal outfit with light and dark shades: easy and polished.' : 'Very similar colours top and bottom; a lighter or darker piece adds depth.' };
  if (hueGap <= 45) return { score: 85, pairing: 'analogous', note: 'Neighbouring colours on the colour wheel: calm and coordinated.' };
  if (hueGap >= 150) return { score: 82, pairing: 'complementary', note: 'Opposite colours: bold. Keep one of them muted if you want it calmer.' };
  return { score: 62, pairing: 'contrasting', note: 'These colours compete a little; a neutral layer or accessory can tie them together.' };
}

export interface BodyNumbers {
  bmi: number;
  category: 'below' | 'healthy' | 'above' | 'well_above';
  /** Estimated daily energy for a lightly active day, kcal (range for unstated sex). */
  energy: { low: number; high: number } | null;
  proteinG: { low: number; high: number };
  waterL: number;
}

/**
 * BMI and simple daily targets. BMI is a rough population screen: it ignores muscle, frame and
 * where weight sits, and cut-offs differ by background, so it is shown with that caveat.
 */
export function bodyNumbers(heightCm: number, weightKg: number, age?: number | null, sex?: 'female' | 'male' | null): BodyNumbers | null {
  if (!(heightCm >= 120 && heightCm <= 230 && weightKg >= 30 && weightKg <= 300)) return null;
  const m = heightCm / 100;
  const bmi = Math.round((weightKg / (m * m)) * 10) / 10;
  const category = bmi < 18.5 ? 'below' : bmi < 25 ? 'healthy' : bmi < 30 ? 'above' : 'well_above';
  let energy: BodyNumbers['energy'] = null;
  if (age && age >= 16 && age <= 100) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age; // Mifflin-St Jeor
    const female = (base - 161) * 1.375, male = (base + 5) * 1.375;
    const round = (n: number) => Math.round(n / 10) * 10;
    energy = sex === 'female' ? { low: round(female * 0.95), high: round(female * 1.05) } : sex === 'male' ? { low: round(male * 0.95), high: round(male * 1.05) } : { low: round(female), high: round(male) };
  }
  return {
    bmi,
    category,
    energy,
    proteinG: { low: Math.round(weightKg * 0.8), high: Math.round(weightKg * 1.2) },
    waterL: Math.round(weightKg * 0.033 * 10) / 10,
  };
}
