/**
 * Anvay, the on-device companion, built from the Thrivefold mark itself.
 *
 *   the terracotta T  = its body (steady, it only breathes and leans)
 *   the sage leaf     = its arm / posture (perks up, waves, droops)
 *   the amber sun     = its eye and spirit (all the emotion lives here)
 *
 * No mouth, no cartoon extras. The sun is an eye: it blinks, glances, squints into a happy arc,
 * goes heavy-lidded when it is late, and widens when it listens. Everything is drawn from one
 * pure "pose" (mood + time of day + topic) that is eased into shared values, so the UI thread
 * does the work and the component stays light on mid-range phones.
 *
 * Props
 *   mood   what the voice engine is doing (idle, listening, thinking, speaking, success, error)
 *   topic  what the person is talking about (workout, sleep, ...), optional
 *   tod    force a time of day, otherwise it follows the phone clock
 *
 * Transparent background. With Reduce Motion it rests in its pose, no loops.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type AnvayMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error';
export type AnvayTopic = 'workout' | 'sleep' | 'hydration' | 'food' | 'mind';
export type AnvayTimeOfDay = 'morning' | 'day' | 'evening' | 'night';

/* ── Brand geometry (the Thrivefold mark, 1024-unit artboard) ───────────────────────────── */

const T_PATH =
  'M 225 247 H 735 C 742 248 746 254 741 262 C 715 305 670 322 620 328 C 560 336 510 385 497 465 V 802 H 435 C 412 802 397 786 397 765 V 450 C 397 400 365 372 325 372 H 225 C 205 372 190 358 190 340 V 280 C 190 261 205 247 225 247 Z';
// One leaf with a thin slit, so it reads as two blades like the logo.
const LEAF_PATH =
  'M 815 298 C 842 392 838 505 780 590 C 742 645 690 650 640 662 C 595 674 572 712 572 750 V 790 Q 572 802 560 802 H 517 C 517 750 520 705 530 672 C 555 628 600 590 650 558 C 700 526 745 490 767 443 C 745 487 700 520 642 553 C 595 582 553 620 521 662 C 521 600 560 540 625 495 C 700 445 770 380 815 298 Z';
const LEAF_PIVOT = { x: 545, y: 795 };

// The sun sits in the nook between the T and the leaf.
const SUN_X = 608;
const SUN_Y = 422;
const SUN_R = 56;
// Wide enough that a drooping leaf never clips.
const VIEWBOX = '156 176 744 744';

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const r0 = SUN_R * 1.55;
  const r1 = r0 + (i % 2 ? 14 : 26);
  const p = (r: number) =>
    `${(SUN_X + Math.cos(a) * r).toFixed(1)} ${(SUN_Y + Math.sin(a) * r).toFixed(1)}`;
  return `M ${p(r0)} L ${p(r1)}`;
}).join(' ');

/* ── Palette per time of day (the sun warms through the day and goes moon-pale at night) ── */

const PALETTE: Record<AnvayTimeOfDay, { sun: string; iris: string; t: string; leaf: string }> = {
  morning: { sun: '#F8C46B', iris: '#EBA03C', t: '#D47F60', leaf: '#8FA07C' },
  day: { sun: '#F5BC66', iris: '#E8963E', t: '#D27A5C', leaf: '#8D9D7B' },
  evening: { sun: '#F2A15F', iris: '#DE7A3F', t: '#CF7253', leaf: '#889876' },
  night: { sun: '#F1DDB4', iris: '#D2B07A', t: '#BF6F58', leaf: '#7F8F70' },
};
const HIGHLIGHT = '#FFF6E6';
const SUCCESS = '#8FCB8A';
const SOFT_ERROR = '#D27A5C';

/* ── Time of day ────────────────────────────────────────────────────────────────────────── */

function todOf(d: Date = new Date()): AnvayTimeOfDay {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function useAnvayTimeOfDay(): AnvayTimeOfDay {
  const [tod, setTod] = useState<AnvayTimeOfDay>(todOf);
  useEffect(() => {
    const iv = setInterval(() => setTod((cur) => (todOf() === cur ? cur : todOf())), 60_000);
    return () => clearInterval(iv);
  }, []);
  return tod;
}

/* ── Topic: what the person is talking about ────────────────────────────────────────────── */

export function topicFromText(text: string): AnvayTopic | undefined {
  const s = text.toLowerCase();
  if (
    /\b(workout|exercise|training|squats?|push-?ups?|plank|run(ning)?|gym|reps?|stretch(ing)?|yoga|walk(ing)?)\b/.test(
      s,
    )
  )
    return 'workout';
  if (/\b(sleep|slept|nap|bed(time)?|insomnia|tired|rest)\b/.test(s)) return 'sleep';
  if (/\b(water|hydrat\w*|glass(es)?)\b/.test(s)) return 'hydration';
  if (/\b(eat|ate|meal|food|calories?|protein|breakfast|lunch|dinner|snack|diet)\b/.test(s))
    return 'food';
  if (/\b(stress(ed)?|anxious|anxiety|calm|breath(e|ing)?|meditat\w*|mood|focus|journal)\b/.test(s))
    return 'mind';
  return undefined;
}

/** Feed it what the person says; the topic holds for a while, then Anvay relaxes again. */
export function useAnvayTopic(holdMs = 25_000) {
  const [topic, setTopic] = useState<AnvayTopic | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hear = useCallback(
    (text: string) => {
      const next = topicFromText(text);
      if (!next) return;
      setTopic(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTopic(undefined), holdMs);
    },
    [holdMs],
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return [topic, hear] as const;
}

/* ── Pose: one pure description of how Anvay looks right now ────────────────────────────── */

interface Pose {
  up: number; //     upper lid openness 0..1
  dn: number; //     lower lid openness 0..1 (small + up ~0.6 = happy arc)
  sun: number; //    eye size multiplier
  leaf: number; //   leaf rest angle in degrees (negative perks up, positive droops)
  sway: number; //   leaf sway amplitude in degrees
  lean: number; //   0..1 leans toward you
  tilt: number; //   body tilt in degrees
  glow: number; //   soft glow behind the sun
  rays: number; //   sun rays opacity
  ripple: number; // rings that travel out of the sun
  think: number; //  0/1 gaze drifts up and around
  talk: number; //   0/1 the sun pulses with the voice
  breathMs: number; // one full breath
}

const TOD_BASE: Record<AnvayTimeOfDay, Pose> = {
  morning: {
    up: 0.95,
    dn: 0.85,
    sun: 1,
    leaf: -2,
    sway: 3,
    lean: 0,
    tilt: 0,
    glow: 0.5,
    rays: 0.35,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 3200,
  },
  day: {
    up: 0.92,
    dn: 0.95,
    sun: 1,
    leaf: 0,
    sway: 2.5,
    lean: 0,
    tilt: 0,
    glow: 0.4,
    rays: 0,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 3600,
  },
  evening: {
    up: 0.85,
    dn: 0.85,
    sun: 1,
    leaf: 2,
    sway: 2,
    lean: 0,
    tilt: 0,
    glow: 0.45,
    rays: 0.12,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 4200,
  },
  night: {
    up: 0.42,
    dn: 0.7,
    sun: 0.96,
    leaf: 6,
    sway: 1.2,
    lean: 0,
    tilt: 0,
    glow: 0.22,
    rays: 0,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 5200,
  },
};

function poseFor(mood: AnvayMood, tod: AnvayTimeOfDay, topic?: AnvayTopic): Pose {
  const pose = rawPose(mood, tod, topic);
  // Keep the leaf inside the artboard and off the sun.
  return { ...pose, leaf: Math.max(-7, Math.min(9, pose.leaf)) };
}

function rawPose(mood: AnvayMood, tod: AnvayTimeOfDay, topic?: AnvayTopic): Pose {
  const p: Pose = { ...TOD_BASE[tod] };

  // What we are talking about colours the mood a little.
  if (topic === 'workout') {
    p.rays = Math.max(p.rays, 0.5);
    p.sway *= 2.2;
    p.leaf -= 4;
    p.sun *= 1.05;
    p.up = Math.max(p.up, 0.95);
    p.breathMs *= 0.7;
  } else if (topic === 'sleep') {
    p.up *= 0.6;
    p.glow *= 0.6;
    p.rays = 0;
    p.sway *= 0.5;
    p.leaf += 4;
    p.breathMs *= 1.4;
  } else if (topic === 'hydration') {
    p.glow += 0.1;
    p.leaf -= 2;
    p.up = Math.max(p.up, 0.95);
  } else if (topic === 'food') {
    p.up = Math.max(p.up, 0.8);
    p.dn = Math.min(p.dn, 0.8);
    p.glow += 0.08;
  } else if (topic === 'mind') {
    p.breathMs *= 1.6;
    p.up *= 0.85;
    p.sway *= 0.6;
    p.ripple = 0.25;
  }

  const lateness = tod === 'night' ? 0.85 : 1;

  switch (mood) {
    case 'listening':
      return {
        ...p,
        up: 1 * lateness,
        dn: 1 * lateness,
        sun: 1.1,
        lean: 1,
        leaf: -3,
        glow: p.glow + 0.2,
        ripple: 1,
        rays: p.rays * 0.5,
        think: 0,
        talk: 0,
      };
    case 'thinking':
      return {
        ...p,
        up: 0.85 * lateness,
        dn: 0.8,
        sun: 0.98,
        leaf: -5,
        tilt: -4,
        think: 1,
        talk: 0,
      };
    case 'speaking':
      return {
        ...p,
        up: 1 * lateness,
        dn: 0.95,
        sun: 1.04,
        leaf: -1,
        sway: p.sway * 1.4,
        glow: p.glow + 0.15,
        ripple: 0.6,
        think: 0,
        talk: 1,
      };
    case 'success':
      return {
        ...p,
        up: 0.62,
        dn: 0.1,
        sun: 1.08,
        leaf: -6,
        sway: 6,
        glow: 0.7,
        rays: 1,
        ripple: 1,
        think: 0,
        talk: 0,
      };
    case 'error':
      return {
        ...p,
        up: 0.55,
        dn: 1,
        sun: 0.92,
        leaf: 9,
        sway: 0.8,
        tilt: 4,
        glow: 0.18,
        rays: 0,
        ripple: 0,
        think: 0,
        talk: 0,
      };
    default:
      return p;
  }
}

/* ── Animation helpers ──────────────────────────────────────────────────────────────────── */

const LOOP_MS = 10_000;
const clamp = Extrapolation.CLAMP;
// Blinks at 26%, 64% and a quick double at 71% of the loop; glances in between.
const BLINK_K = [0.26, 0.28, 0.3, 0.64, 0.66, 0.68, 0.71, 0.73, 0.75];
const BLINK_V = [0, 1, 0, 0, 1, 0, 0, 1, 0];
const LOOK_K = [0.4, 0.44, 0.52, 0.56, 0.62, 0.66];
const LOOK_X = [0, -1, -1, 1, 1, 0];
const LOOK_Y = [0, 0.2, 0.2, -0.3, -0.3, 0];
const EASE = { duration: 420, easing: Easing.inOut(Easing.quad) } as const;
const K = 0.5523;

/** An eye shape: a circle whose top and bottom lids can close independently. */
function eyePath(cx: number, cy: number, r: number, up: number, dn: number): string {
  'worklet';
  const u = Math.max(up, 0.04);
  const d = Math.max(dn, 0.04);
  const k = K * r;
  return (
    `M ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k * u} ${cx - k} ${cy - r * u} ${cx} ${cy - r * u} ` +
    `C ${cx + k} ${cy - r * u} ${cx + r} ${cy - k * u} ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k * d} ${cx + k} ${cy + r * d} ${cx} ${cy + r * d} ` +
    `C ${cx - k} ${cy + r * d} ${cx - r} ${cy + k * d} ${cx - r} ${cy} Z`
  );
}

export function AnvayCompanion({
  size = 64,
  mood = 'idle',
  topic,
  tod: todOverride,
}: {
  size?: number;
  mood?: AnvayMood;
  topic?: AnvayTopic;
  tod?: AnvayTimeOfDay;
}) {
  const reduce = useReducedMotion();
  const clockTod = useAnvayTimeOfDay();
  const tod = todOverride ?? clockTod;
  const pal = PALETTE[tod];
  const gid = `anvayGlow${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const pose = useMemo(() => poseFor(mood, tod, topic), [mood, tod, topic]);

  // Loops
  const t = useSharedValue(0); //       10 s master clock (blinks, glances, leaf sway)
  const breath = useSharedValue(0); //  0..1 breathing
  const rp = useSharedValue(0); //      ripple phase
  const vo = useSharedValue(0); //      voice clock
  // One-shots
  const hello = useSharedValue(reduce ? 0 : 1); // leaf waves hello when it appears
  const hop = useSharedValue(0);
  const shake = useSharedValue(0);
  // Pose, eased
  const lidUp = useSharedValue(pose.up);
  const lidDn = useSharedValue(pose.dn);
  const sunS = useSharedValue(pose.sun);
  const leafB = useSharedValue(pose.leaf);
  const sway = useSharedValue(pose.sway);
  const lean = useSharedValue(pose.lean);
  const tilt = useSharedValue(pose.tilt);
  const glow = useSharedValue(pose.glow);
  const rays = useSharedValue(pose.rays);
  const ripple = useSharedValue(pose.ripple);
  const think = useSharedValue(pose.think);
  const talk = useSharedValue(pose.talk);

  useEffect(() => {
    if (reduce) return;
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1, false);
    rp.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1, false);
    vo.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false);
    hello.value = 1;
    hello.value = withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) });
    return () => {
      cancelAnimation(t);
      cancelAnimation(rp);
      cancelAnimation(vo);
    };
  }, [reduce, t, rp, vo, hello]);

  useEffect(() => {
    if (reduce) return;
    breath.value = 0;
    breath.value = withRepeat(
      withTiming(1, { duration: pose.breathMs / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [reduce, pose.breathMs, breath]);

  useEffect(() => {
    const go = (v: { value: number }, to: number) => {
      v.value = reduce ? to : withTiming(to, EASE);
    };
    go(lidUp, pose.up);
    go(lidDn, pose.dn);
    go(sunS, pose.sun);
    go(leafB, pose.leaf);
    go(sway, pose.sway);
    go(lean, pose.lean);
    go(tilt, pose.tilt);
    go(glow, pose.glow);
    go(rays, pose.rays);
    go(ripple, pose.ripple);
    go(think, pose.think);
    go(talk, pose.talk);
  }, [pose, reduce, lidUp, lidDn, sunS, leafB, sway, lean, tilt, glow, rays, ripple, think, talk]);

  // Success hops, error gives a small, sorry shake. Both once, on the change.
  useEffect(() => {
    if (reduce) return;
    if (mood === 'success') {
      hop.value = withSequence(
        withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 7, stiffness: 180 }),
      );
    } else if (mood === 'error') {
      shake.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(-1, { duration: 120 }),
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 160 }),
      );
    }
  }, [mood, reduce, hop, shake]);

  // The body: breathes, leans in when listening, hops on success.
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          -breath.value * size * 0.012 - lean.value * size * 0.02 - hop.value * size * 0.08,
      },
      { scale: 1 + breath.value * 0.008 + lean.value * 0.035 },
      { rotate: `${tilt.value + shake.value * 3}deg` },
    ],
  }));

  // Everything about the eye in one place: lids, glance, size.
  const eye = () => {
    'worklet';
    const tt = t.value;
    const open = 1 - interpolate(tt, BLINK_K, BLINK_V, clamp);
    const th = think.value;
    const shy = 1 - lean.value * 0.8; // when listening it looks at you, not around
    const gx =
      interpolate(tt, LOOK_K, LOOK_X, clamp) * 13 * (1 - th) * shy +
      th * (Math.sin(tt * Math.PI * 2 * 5) * 8 - 7);
    const gy =
      interpolate(tt, LOOK_K, LOOK_Y, clamp) * 8 * (1 - th) * shy +
      th * (-11 + Math.cos(tt * Math.PI * 2 * 5) * 4);
    const va =
      talk.value *
      (0.5 + 0.5 * Math.sin(vo.value * Math.PI * 2 * 9) * Math.sin(vo.value * Math.PI * 2 * 4 + 1));
    const R = SUN_R * sunS.value * (1 + va * 0.09 + (breath.value - 0.5) * 0.025);
    const up = Math.max(0.04, lidUp.value * open);
    const dn = Math.max(0.04, lidDn.value * open);
    return { gx, gy, va, R, up, dn };
  };

  const sunProps = useAnimatedProps(() => {
    const e = eye();
    return { d: eyePath(SUN_X + e.gx * 0.25, SUN_Y + e.gy * 0.25, e.R, e.up, e.dn) };
  });
  const irisProps = useAnimatedProps(() => {
    const e = eye();
    const mid = (e.up + e.dn) / 2;
    return {
      cx: SUN_X + e.gx,
      cy: SUN_Y + e.gy + (e.R * (e.dn - e.up)) / 2,
      rx: e.R * 0.5,
      ry: e.R * 0.5 * mid,
      opacity: Math.min(1, mid * 1.4),
    };
  });
  const glintProps = useAnimatedProps(() => {
    const e = eye();
    const mid = (e.up + e.dn) / 2;
    const ry = e.R * 0.5 * mid;
    return {
      cx: SUN_X + e.gx - e.R * 0.2,
      cy: SUN_Y + e.gy + (e.R * (e.dn - e.up)) / 2 - ry * 0.45,
      r: e.R * 0.15,
      opacity: Math.min(1, Math.max(0, (mid - 0.45) * 2.2)),
    };
  });
  const glowProps = useAnimatedProps(() => {
    const e = eye();
    return { r: e.R * 2.3, opacity: Math.min(1, glow.value + e.va * 0.2 + lean.value * 0.1) };
  });
  const raysProps = useAnimatedProps(() => ({
    opacity: rays.value,
    rotation: t.value * 30,
    originX: SUN_X,
    originY: SUN_Y,
  }));
  const ring = (offset: number) => () => {
    'worklet';
    const e = eye();
    const p = (rp.value + offset) % 1;
    return { r: e.R * 1.25 + p * e.R * 2.2, opacity: (1 - p) * 0.55 * ripple.value };
  };
  const ring1 = useAnimatedProps(ring(0));
  const ring2 = useAnimatedProps(ring(0.5));

  const leafProps = useAnimatedProps(() => ({
    rotation:
      leafB.value +
      Math.sin(t.value * Math.PI * 2 * 2) * sway.value +
      hello.value * Math.sin(t.value * Math.PI * 2 * 10) * 9,
    originX: LEAF_PIVOT.x,
    originY: LEAF_PIVOT.y,
  }));

  const ringColor = mood === 'success' ? SUCCESS : mood === 'error' ? SOFT_ERROR : pal.sun;

  return (
    <Animated.View
      style={[{ width: size, height: size }, bodyStyle]}
      accessibilityRole="image"
      accessibilityLabel="Anvay"
    >
      <Svg width={size} height={size} viewBox={VIEWBOX}>
        <Defs>
          <RadialGradient id={gid} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={pal.sun} stopOpacity={0.9} />
            <Stop offset="1" stopColor={pal.sun} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Behind everything: glow, rays and the rings that travel out of the sun */}
        <AnimatedCircle cx={SUN_X} cy={SUN_Y} animatedProps={glowProps} fill={`url(#${gid})`} />
        <AnimatedG animatedProps={raysProps}>
          <Path d={RAYS} stroke={pal.sun} strokeWidth={7} strokeLinecap="round" fill="none" />
        </AnimatedG>
        <AnimatedCircle
          cx={SUN_X}
          cy={SUN_Y}
          animatedProps={ring1}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
        />
        <AnimatedCircle
          cx={SUN_X}
          cy={SUN_Y}
          animatedProps={ring2}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
        />

        {/* The leaf is behind the eye, the T is in front of it, so the sun tucks into the nook */}
        <AnimatedG animatedProps={leafProps}>
          <Path d={LEAF_PATH} fill={pal.leaf} />
        </AnimatedG>

        {/* The eye: sun, iris that glances, a small highlight */}
        <AnimatedPath animatedProps={sunProps} fill={pal.sun} />
        <AnimatedEllipse animatedProps={irisProps} fill={pal.iris} />
        <AnimatedCircle animatedProps={glintProps} fill={HIGHLIGHT} />

        <Path d={T_PATH} fill={pal.t} />
      </Svg>
    </Animated.View>
  );
}
