import { useEffect, useMemo, useRef } from 'react';
import {
  Easing,
  makeMutable,
  useReducedMotion,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { Activity, Mood } from './types';

/** Every animatable number of the character. Rest pose lives here. */
export const REST = {
  // face
  eyeOpen: 1, squint: 0, tilt: 0, pupil: 1, lookX: 0, lookY: 0, gazeX: 0, gazeY: 0, blink: 0,
  love: 0, blush: 0, mouthCurve: 0.45, mouthOpen: 0, talk: 0, tear: 0, sweat: 0,
  // body
  lean: 0, squash: 0, hop: 0, spin: 0, lie: 0, shake: 0, floatY: 0, pop: 0, enter: 1,
  // limbs (hand / foot targets in the 1024 design grid)
  lHx: 232, lHy: 700, rHx: 722, rHy: 700, lFx: 432, lFy: 868, rFx: 522, rFy: 868,
  // mark parts
  leaf: 0, sun: 1, sunY: 0, glow: 0.3,
  // props
  glasses: 0, cup: 0, cupFill: 1, cupTilt: 0, bar: 0,
  // fx
  zzz: 0, hearts: 0, steam: 0, wind: 0, stars: 0,
  // live heart rate (bpm) from a wearable; 0 = unknown. The tummy sun beats with it.
  bpm: 0,
} as const;

type K = keyof typeof REST;
export type Rig = { [P in K]: SharedValue<number> };

const MOOD_KEYS: K[] = [
  'eyeOpen', 'squint', 'tilt', 'pupil', 'lookX', 'lookY', 'love', 'blush', 'mouthCurve',
  'mouthOpen', 'tear', 'lean', 'shake', 'glow', 'sun', 'zzz', 'hearts', 'steam', 'stars', 'lie',
];
const LIMB_KEYS: K[] = [
  'lHx', 'lHy', 'rHx', 'rHy', 'lFx', 'lFy', 'rFx', 'rFy', 'hop', 'squash', 'leaf', 'sunY',
  'floatY', 'pop', 'cup', 'cupFill', 'cupTilt', 'bar', 'wind', 'sweat',
];

type Preset = Partial<Record<K, number>>;
const MOODS: Record<Mood, Preset> = {
  neutral: {},
  happy: { squint: 0.35, mouthCurve: 0.8, blush: 0.35, glow: 0.55 },
  joy: { squint: 0.85, mouthCurve: 1, mouthOpen: 0.55, blush: 0.6, glow: 0.95, sun: 1.15 },
  sad: { eyeOpen: 0.8, tilt: -14, mouthCurve: -0.8, glow: 0.1, sun: 0.8, lookY: 0.6 },
  crying: { eyeOpen: 0.65, squint: 0.2, tilt: -18, mouthCurve: -1, mouthOpen: 0.5, tear: 1, glow: 0.05, sun: 0.75, lookY: 0.4 },
  angry: { tilt: 26, eyeOpen: 0.85, mouthCurve: -0.7, mouthOpen: 0.15, blush: 0.5, glow: 0.8, steam: 1, pupil: 0.8 },
  sleepy: { eyeOpen: 0.35, mouthCurve: 0.1, glow: 0.15, lookY: 0.5, sun: 0.85 },
  asleep: { eyeOpen: 0, mouthCurve: 0.15, mouthOpen: 0.08, zzz: 1, glow: 0.08, sun: 0.7, lie: 1 },
  surprised: { eyeOpen: 1.25, pupil: 0.55, mouthCurve: 0, mouthOpen: 0.8, sun: 1.2, glow: 0.7 },
  love: { love: 1, squint: 0.4, mouthCurve: 0.9, blush: 1, hearts: 1, glow: 1 },
  thinking: { lookX: -0.7, lookY: -0.8, mouthCurve: -0.05, eyeOpen: 0.9, lean: 4 },
  listening: { eyeOpen: 1.15, pupil: 1.15, mouthCurve: 0.3, glow: 0.9 },
  speaking: { mouthCurve: 0.5, glow: 0.7 },
  scared: { eyeOpen: 1.2, pupil: 0.5, tilt: -22, mouthCurve: -0.4, mouthOpen: 0.4, shake: 1, glow: 0.1 },
  proud: { squint: 0.25, mouthCurve: 0.7, lookY: -0.3, glow: 0.8, sun: 1.15, lean: -3 },
  bored: { eyeOpen: 0.5, mouthCurve: -0.15, lookX: 0.6, glow: 0.1 },
  curious: { eyeOpen: 1.1, tilt: -6, mouthCurve: 0.1, lookX: 0.5, lookY: -0.2, lean: 6 },
  shy: { squint: 0.2, blush: 1, mouthCurve: 0.35, lookX: -0.8, lookY: 0.7, lean: -4 },
  dizzy: { stars: 1, mouthCurve: -0.1, mouthOpen: 0.2, pupil: 0.7 },
};

export const ACTIVITY_MOOD: Partial<Record<Activity, Mood>> = {
  wave: 'happy', greet: 'joy', drink: 'happy', exercise: 'joy', jacks: 'joy', sleep: 'asleep',
  yawn: 'sleepy', stretch: 'happy', roll: 'joy', dance: 'joy', sob: 'crying', tantrum: 'angry',
  wind: 'neutral', peek: 'curious', clap: 'proud', think: 'thinking', laugh: 'joy',
  meditate: 'neutral', hug: 'love', listen: 'listening',
};

// ---------- tiny animation helpers (all run on the UI thread) ----------
const E = Easing.inOut(Easing.cubic);
const T = (ms: number) => ({ duration: ms, easing: E });
const go = (sv: SharedValue<number>, to: number, ms = 400) => { sv.value = withTiming(to, T(ms)); };
type Step = [value: number, ms: number, delay?: number];
const seq = (sv: SharedValue<number>, steps: Step[]) => {
  const anims = steps.map(([v, d, dl]) => (dl ? withDelay(dl, withTiming(v, T(d))) : withTiming(v, T(d))));
  sv.value = (withSequence as any)(...anims);
};
const rep = (a: Step[], n: number): Step[] => Array.from({ length: n }).flatMap(() => a);

// ---------- activity scripts: each returns duration in ms (0 = until stopped) ----------
const ACT: Record<Activity, (r: Rig) => number> = {
  none: () => 0,

  wave: (r) => {
    seq(r.rHx, [[790, 380], ...rep([[835, 240], [745, 240]], 5), [722, 420]]);
    seq(r.rHy, [[220, 380], [220, 2400], [700, 420]]);
    seq(r.leaf, [[1, 300], [-1, 300], [1, 300], [-1, 300], [1, 300], [0, 400]]);
    return 3200;
  },

  greet: (r) => {
    const d = ACT.wave(r);
    seq(r.hop, [[0.5, 200], [0, 260], [0.5, 200], [0, 260]]);
    return d;
  },

  drink: (r) => {
    seq(r.lHx, [[440, 700], [440, 2400], [232, 700]]);
    seq(r.lHy, [[430, 700], [430, 2400], [700, 700]]);
    seq(r.cup, [[1, 300], [1, 3200], [0, 300]]);
    seq(r.cupTilt, [[0, 700], [-35, 500], [-35, 1400], [0, 400], [0, 800]]);
    seq(r.cupFill, [[1, 700], [1, 500], [0.15, 1600], [0.15, 1000]]);
    seq(r.mouthOpen, [[0.1, 700], [0.5, 250], [0.05, 250], [0.5, 250], [0.05, 250], [0.35, 250], [0.1, 300]]);
    return 4300;
  },

  exercise: (r) => {
    seq(r.bar, [[1, 400], [1, 5000], [0, 400]]);
    seq(r.lHy, [[430, 500], ...rep([[430, 480], [210, 480]], 5), [700, 500]]);
    seq(r.lHx, [[330, 500], ...rep([[305, 480], [330, 480]], 5), [232, 500]]);
    seq(r.rHy, [[430, 500], ...rep([[430, 480], [210, 480]], 5), [700, 500]]);
    seq(r.rHx, [[630, 500], ...rep([[655, 480], [630, 480]], 5), [722, 500]]);
    seq(r.squash, [[0, 500], ...rep([[0.7, 480], [0, 480]], 5), [0, 500]]);
    seq(r.lFx, [[410, 400], [410, 5000], [432, 400]]);
    seq(r.rFx, [[544, 400], [544, 5000], [522, 400]]);
    seq(r.sweat, [[1, 1500], [1, 3800], [0, 500]]);
    return 5800;
  },

  jacks: (r) => {
    const a = 420;
    seq(r.lHx, rep([[205, a], [232, a]], 6));
    seq(r.lHy, rep([[200, a], [700, a]], 6));
    seq(r.rHx, rep([[765, a], [722, a]], 6));
    seq(r.rHy, rep([[190, a], [700, a]], 6));
    seq(r.lFx, rep([[380, a], [432, a]], 6));
    seq(r.rFx, rep([[574, a], [522, a]], 6));
    seq(r.hop, rep([[0.45, a / 2], [0, a / 2], [0.45, a / 2], [0, a / 2]], 6));
    seq(r.sweat, [[1, 1200], [1, 3400], [0, 440]]);
    return 5040;
  },

  sleep: (r) => {
    go(r.lHx, 420, 900); go(r.lHy, 600, 900); go(r.rHx, 534, 900); go(r.rHy, 600, 900);
    return 0;
  },

  yawn: (r) => {
    seq(r.mouthOpen, [[1, 900], [1, 900], [0.1, 500]]);
    seq(r.squint, [[0.8, 700], [0.8, 1100], [0, 500]]);
    seq(r.lHx, [[220, 800], [220, 1000], [232, 600]]);
    seq(r.lHy, [[230, 800], [230, 1000], [700, 600]]);
    seq(r.rHx, [[710, 800], [710, 1000], [722, 600]]);
    seq(r.rHy, [[220, 800], [220, 1000], [700, 600]]);
    return 2600;
  },

  stretch: (r) => {
    seq(r.lHx, [[215, 700], [215, 2200], [232, 700]]);
    seq(r.lHy, [[170, 700], [170, 2200], [700, 700]]);
    seq(r.rHx, [[735, 700], [735, 2200], [722, 700]]);
    seq(r.rHy, [[160, 700], [160, 2200], [700, 700]]);
    seq(r.lean, [[0, 700], [9, 900], [-9, 1200], [0, 800]]);
    seq(r.squint, [[0.7, 700], [0.7, 2200], [0, 700]]);
    return 3600;
  },

  roll: (r) => {
    seq(r.spin, [[360, 1300]]);
    seq(r.hop, [[0.7, 500], [0, 800]]);
    go(r.lHx, 400, 250); go(r.lHy, 560, 250); go(r.rHx, 554, 250); go(r.rHy, 560, 250);
    go(r.lFy, 810, 250); go(r.rFy, 810, 250); go(r.lFx, 452, 250); go(r.rFx, 502, 250);
    return 1500;
  },

  dance: (r) => {
    const b = 300;
    seq(r.lean, rep([[9, b], [-9, b]], 8));
    seq(r.hop, rep([[0.35, b], [0, b]], 8));
    seq(r.lHy, rep([[200, b], [640, b]], 8));
    seq(r.rHy, rep([[640, b], [200, b]], 8));
    seq(r.lHx, rep([[200, b], [232, b]], 8));
    seq(r.rHx, rep([[722, b], [760, b]], 8));
    seq(r.leaf, rep([[1, b], [-1, b]], 8));
    seq(r.sun, rep([[1.2, b], [1, b]], 8));
    return 4800;
  },

  sob: (r) => {
    go(r.shake, 1, 200);
    seq(r.squash, rep([[0.25, 450], [0, 450]], 5));
    go(r.lHx, 350, 500); go(r.lHy, 420, 500); go(r.rHx, 604, 500); go(r.rHy, 420, 500);
    return 4600;
  },

  tantrum: (r) => {
    go(r.shake, 1, 150);
    seq(r.lHx, [[185, 300]]); seq(r.lHy, [[270, 300]]);
    seq(r.rHx, [[760, 300]]); seq(r.rHy, [[255, 300]]);
    seq(r.lFy, rep([[828, 140], [868, 140]], 13));
    seq(r.rFy, rep([[868, 140], [828, 140]], 13));
    seq(r.lean, rep([[-4, 140], [4, 140]], 13));
    seq(r.squash, rep([[0.12, 140], [0, 140]], 13));
    return 3640;
  },

  wind: (r) => {
    seq(r.wind, [[1, 500], [1, 3200], [0, 500]]);
    seq(r.lean, [[-16, 700], [-9, 500], [-18, 600], [-7, 700], [-13, 500], [0, 900]]);
    seq(r.leaf, rep([[1.6, 160], [-1.2, 160]], 12));
    go(r.squint, 0.6, 400); go(r.lFx, 415, 300); go(r.rFx, 535, 300);
    return 4200;
  },

  peek: (r) => {
    seq(r.pop, [[1, 450], [1, 1900], [0, 450]]);
    seq(r.rHx, [[610, 450], [610, 1900], [722, 450]]);
    seq(r.rHy, [[290, 450], [290, 1900], [700, 450]]);
    seq(r.lean, [[5, 450], [5, 1900], [0, 450]]);
    return 2800;
  },

  clap: (r) => {
    seq(r.lHx, [[400, 300], ...rep([[440, 100], [400, 100]], 4), [232, 500]]);
    seq(r.rHx, [[540, 300], ...rep([[500, 100], [540, 100]], 4), [722, 500]]);
    seq(r.lHy, [[580, 300], [580, 800], [700, 500]]);
    seq(r.rHy, [[580, 300], [580, 800], [700, 500]]);
    seq(r.hop, [[0.2, 200], [0, 250], [0.2, 200], [0, 250]]);
    return 1600;
  },

  think: (r) => {
    seq(r.rHx, [[530, 500], [530, 2400], [722, 500]]);
    seq(r.rHy, [[470, 500], [470, 2400], [700, 500]]);
    seq(r.lean, [[5, 500], [5, 2400], [0, 500]]);
    return 3400;
  },

  laugh: (r) => {
    seq(r.hop, rep([[0.25, 150], [0, 150]], 9));
    seq(r.mouthOpen, rep([[0.9, 150], [0.45, 150]], 9));
    go(r.squint, 1, 250);
    go(r.lHx, 410, 400); go(r.lHy, 600, 400); go(r.rHx, 544, 400); go(r.rHy, 600, 400);
    return 2800;
  },

  meditate: (r) => {
    seq(r.squash, [[0.18, 800], [0.18, 4400], [0, 800]]);
    seq(r.floatY, [[-18, 1500], [0, 1500], [-18, 1500], [0, 1500]]);
    go(r.lHx, 450, 800); go(r.lHy, 570, 800); go(r.rHx, 504, 800); go(r.rHy, 570, 800);
    go(r.lFy, 800, 800); go(r.rFy, 800, 800); go(r.lFx, 452, 800); go(r.rFx, 502, 800);
    go(r.eyeOpen, 0, 700); go(r.glow, 1, 900); go(r.sun, 1.2, 900);
    return 6000;
  },

  hug: (r) => {
    go(r.lHx, 520, 600); go(r.lHy, 580, 600); go(r.rHx, 434, 600); go(r.rHy, 580, 600);
    seq(r.pop, [[0.6, 500], [0.6, 2000], [0, 500]]);
    return 3000;
  },

  listen: (r) => {
    go(r.rHx, 750, 400); go(r.rHy, 380, 400); go(r.lean, 5, 400);
    return 0;
  },
};

// ---------- the hook ----------
export interface ThriveRig {
  v: Rig;
  mood: { current: Mood };
  setMood(m: Mood): void;
  /** Starts an activity (also sets its mood). Returns duration in ms, 0 = until settle(). */
  play(a: Activity): number;
  /** Limbs back to rest and re-apply current mood. */
  settle(): void;
  setGlasses(on: boolean): void;
  setTalking(on: boolean): void;
  /** Quick "I heard you" nod. */
  nod(): void;
  lean(deg: number): void;
  /** Look at a point (-1..1). null returns to idle wandering. */
  track(x: number | null, y?: number): void;
}

const make = (): Rig =>
  Object.fromEntries(Object.entries(REST).map(([k, val]) => [k, makeMutable(val as number)])) as unknown as Rig;

export function useThriveRig({ living = true }: { living?: boolean } = {}): ThriveRig {
  const reduce = useReducedMotion();
  const vRef = useRef<Rig | undefined>(undefined);
  if (!vRef.current) vRef.current = make();
  const v = vRef.current;
  const mood = useRef<Mood>('neutral');
  const tracking = useRef(false);

  const api = useMemo<ThriveRig>(() => {
    const applyMood = (m: Mood, ms = 420) => {
      const p = MOODS[m];
      for (const k of MOOD_KEYS) go(v[k], p[k] ?? (REST[k] as number), ms);
      mood.current = m;
    };
    const resetLimbs = (ms: number) => {
      for (const k of LIMB_KEYS) go(v[k], REST[k] as number, ms);
      const spin = v.spin;
      spin.value = withTiming(Math.round(spin.value / 360) * 360, T(ms), (done) => {
        'worklet';
        if (done) spin.value = 0;
      });
    };
    return {
      v,
      mood,
      setMood: (m) => applyMood(m),
      play: (a) => {
        resetLimbs(220);
        const m = ACTIVITY_MOOD[a];
        if (m) applyMood(m);
        return ACT[a](v);
      },
      settle: () => { resetLimbs(450); applyMood(mood.current, 450); },
      setGlasses: (on) => go(v.glasses, on ? 1 : 0, 500),
      setTalking: (on) => go(v.talk, on ? 1 : 0, 200),
      nod: () => seq(v.squash, [[0.14, 120], [0, 180]]),
      lean: (deg) => go(v.lean, deg, 250),
      track: (x, y = 0) => {
        if (x === null) { tracking.current = false; return; }
        tracking.current = true;
        go(v.gazeX, Math.max(-1, Math.min(1, x)), 160);
        go(v.gazeY, Math.max(-1, Math.min(1, y)), 160);
      },
    };
  }, [v]);

  // Idle life: blinking and wandering eyes.
  useEffect(() => {
    if (!living || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const blink = () => {
      if (!alive) return;
      v.blink.value = withSequence(withTiming(1, { duration: 70 }), withTiming(0, { duration: 120 }));
      timers[0] = setTimeout(blink, 1800 + Math.random() * 4200);
    };
    const wander = () => {
      if (!alive) return;
      if (!tracking.current) {
        go(v.gazeX, (Math.random() * 2 - 1) * 0.7, 450);
        go(v.gazeY, (Math.random() * 2 - 1) * 0.4, 450);
      }
      timers[1] = setTimeout(wander, 1500 + Math.random() * 3000);
    };
    blink();
    wander();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [living, reduce, v]);

  return api;
}
