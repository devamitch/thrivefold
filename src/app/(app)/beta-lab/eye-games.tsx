import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type NativeSyntheticEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { BetaHero } from '../../../components/beta/BetaHero';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaBadge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import {
  buildCalibration,
  directionOf,
  gazeFromFrame,
  headMoved,
  median,
  normalize,
  smoothGaze,
  type GazeCalibration,
  type GazeDirection,
  type GazeSample,
} from '../../../domain/vision/gaze';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';
import { CoachGuide } from '../../../components/beta/CoachGuide';

/**
 * Eye games, ported from BlinkQuest's EyeGame (Gaze Pop, Direction Trail, Slider Chase, Orbit
 * Follow) onto Thrivefold's camera module. Each run starts with BlinkQuest's five-point eye check
 * (centre, left, right, up, down), which sets the player's own range and proves the eyes drive the
 * game. Time only counts while the face is tracked, head turns never score, and the coach says
 * "Complete" on every target reached.
 */
type Mode = 'pop' | 'direction' | 'pursuitH' | 'pursuitO';
type Phase = 'intro' | 'calibrating' | 'calibration_failed' | 'playing' | 'paused' | 'complete';
type Dir = Exclude<GazeDirection, 'center'>;

const KINDS: BetaSessionKind[] = ['eye_game'];
const DURATION_SEC = 30;
const DWELL_MS = 250;
const PROMPT_TIMEOUT_MS = 3500;
const CAL_STEPS: {
  key: 'center' | 'left' | 'right' | 'up' | 'down';
  label: string;
}[] = [
  { key: 'center', label: 'Look at the centre dot' },
  { key: 'left', label: 'Now look left, eyes only' },
  { key: 'right', label: 'Now look right' },
  { key: 'up', label: 'Look up' },
  { key: 'down', label: 'Look down' },
];
const CAL_SETTLE_MS = 700;
const CAL_SAMPLE_MS = 900;
const DIRS: Dir[] = ['left', 'right', 'up', 'down'];
const ARROW: Record<Dir, keyof typeof Ionicons.glyphMap> = {
  left: 'arrow-back',
  right: 'arrow-forward',
  up: 'arrow-up',
  down: 'arrow-down',
};
const MODES: { id: Mode; title: string; how: string }[] = [
  {
    id: 'pop',
    title: 'Gaze Pop',
    how: 'Look at the orb, then back to the centre. Quick eye jumps.',
  },
  {
    id: 'direction',
    title: 'Direction Trail',
    how: 'Look where the arrow points, eyes only.',
  },
  {
    id: 'pursuitH',
    title: 'Slider Chase',
    how: 'Follow the orb as it glides left and right.',
  },
  {
    id: 'pursuitO',
    title: 'Orbit Follow',
    how: 'Follow the orb around a circle.',
  },
];

interface Stats {
  hits: number;
  misses: number;
  responses: number[];
  onTargetMs: number;
  trackedMs: number;
  headTurns: number;
}
const emptyStats = (): Stats => ({
  hits: 0,
  misses: 0,
  responses: [],
  onTargetMs: 0,
  trackedMs: 0,
  headTurns: 0,
});

export default function EyeGamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { colors, typography, spacing, experience } = useTheme();
  const area = Math.min(width - 32, height - 360);
  const half = area / 2;

  const [mode, setMode] = useState<Mode>('pop');
  const [phase, setPhase] = useState<Phase>('intro');
  const [calStep, setCalStep] = useState(0);
  const [calError, setCalError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);
  const [target, setTarget] = useState<Dir | null>(null);
  const [needCenter, setNeedCenter] = useState(false);
  const [headWarning, setHeadWarning] = useState(false);
  const [onTarget, setOnTarget] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [, force] = useReducer((n: number) => n + 1, 0);

  const calibration = useRef<GazeCalibration | null>(null);
  const calSamples = useRef<GazeSample[]>([]);
  const calResult = useRef<Record<string, { x: number; y: number }>>({});
  const calHead = useRef<{ yaw: number | null; pitch: number | null }>({
    yaw: null,
    pitch: null,
  });
  const gaze = useRef<GazeSample | null>(null);
  const source = useRef<GazeSample['source']>('blendshapes');
  const stats = useRef<Stats>(emptyStats());
  const dwell = useRef<{ dir: GazeDirection; since: number } | null>(null);
  const promptAt = useRef(0);
  const playStart = useRef(0);
  const startedAt = useRef(0);
  const lastFrameAt = useRef(0);
  const lastSeen = useRef(0);
  const targetRef = useRef<Dir | null>(null);
  targetRef.current = target;
  const needCenterRef = useRef(false);
  const saidZone = useRef<string | null>(null);

  const marker = {
    x: useSharedValue(0),
    y: useSharedValue(0),
    on: useSharedValue(0),
  };
  const pursuit = { x: useSharedValue(0), y: useSharedValue(0) };

  /* Gaze stream from the camera module. */
  const onPose = useCallback(
    (e: NativeSyntheticEvent<PoseFrame>) => {
      const raw = gazeFromFrame(e.nativeEvent);
      if (!raw) {
        gaze.current = null;
        marker.on.value = 0;
        if (Date.now() - lastSeen.current > 600) setTracking(false);
        return;
      }
      lastSeen.current = Date.now();
      setTracking(true);
      const g = smoothGaze(gaze.current, raw);
      gaze.current = g;
      source.current = g.source;
      if (phase === 'calibrating') calSamples.current.push(g);
      const centre = calResult.current.center;
      const c =
        calibration.current ??
        (centre
          ? {
              cx: centre.x,
              cy: centre.y,
              left: 0.2,
              right: 0.2,
              up: 0.15,
              down: 0.15,
              yaw0: null,
              pitch0: null,
            }
          : null);
      if (c) {
        const { nx, ny } = normalize(g, c);
        marker.x.value = Math.max(-1.2, Math.min(1.2, nx));
        marker.y.value = Math.max(-1.2, Math.min(1.2, ny));
        marker.on.value = 1;
      }
    },
    [phase, marker.on, marker.x, marker.y],
  );

  const nextTarget = useCallback(() => {
    setTarget((prev) => {
      // Target choice only (not a measurement), so plain randomness is fine.
      const options = DIRS.filter((d) => d !== prev);
      const t = options[Math.floor(Math.random() * options.length)];
      void coachVoice.speak(`Look ${t}`, {
        priority: 2,
        minGapMs: 0,
        maxMs: 1200,
      });
      return t;
    });
    promptAt.current = Date.now();
    dwell.current = null;
  }, [mode]);

  const startPlaying = useCallback(() => {
    stats.current = emptyStats();
    setSecondsLeft(DURATION_SEC);
    setNeedCenter(false);
    needCenterRef.current = false;
    playStart.current = Date.now();
    setPhase('playing');
    void coachVoice.speak(
      mode === 'pop' ? 'Look at the orb' : mode === 'direction' ? 'Follow the arrows' : 'Follow the orb with your eyes',
      { priority: 3 },
    );
    if (mode === 'pop' || mode === 'direction') nextTarget();
  }, [mode, nextTarget]);

  const begin = async () => {
    setCalError(null);
    const ok = await ensureCameraPermission();
    if (!ok) {
      setCalError('Eye games need the front camera. Allow it in Android settings.');
      return;
    }
    calibration.current = null;
    calResult.current = {};
    startedAt.current = Date.now();
    setCalStep(0);
    setPhase('calibrating');
    void coachVoice.speak('A five second eye check. Keep your head still and follow the dot with your eyes.', {
      priority: 3,
    });
  };

  /* Calibration: each step waits for a tracked face, settles, then samples. */
  useEffect(() => {
    if (phase !== 'calibrating' || !tracking) return;
    calSamples.current = [];
    const t = setTimeout(() => {
      const step = CAL_STEPS[calStep];
      const cutoff = Date.now() - CAL_SAMPLE_MS;
      const s = calSamples.current.filter((g) => g.at >= cutoff);
      if (s.length < 5) {
        setCalError("We lost your face. Hold the phone where you'd normally read it, facing the screen.");
        setPhase('calibration_failed');
        return;
      }
      calResult.current[step.key] = {
        x: median(s.map((g) => g.x)),
        y: median(s.map((g) => g.y)),
      };
      if (step.key === 'center') {
        const last = s[s.length - 1];
        calHead.current = { yaw: last.headYawDeg, pitch: last.headPitchDeg };
      }
      if (calStep < CAL_STEPS.length - 1) {
        setCalStep(calStep + 1);
        hapticLight();
        return;
      }
      const res = buildCalibration(
        calResult.current as Parameters<typeof buildCalibration>[0],
        source.current,
        calHead.current,
      );
      if (!res.ok) {
        setCalError(
          `We couldn't see your eyes move ${res.weak.join(' and ')}. Keep your head still and move only your eyes, a bit further. With glasses, tilting the phone slightly helps avoid glare.`,
        );
        setPhase('calibration_failed');
        return;
      }
      calibration.current = res.calibration;
      startPlaying();
    }, CAL_SETTLE_MS + CAL_SAMPLE_MS);
    return () => clearTimeout(t);
  }, [phase, calStep, tracking, startPlaying]);

  /* Timer: only advances while the face is tracked. */
  useEffect(() => {
    if (phase !== 'playing' || !tracking) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, tracking]);

  const scoreHit = () => {
    hapticSuccess();
    void coachVoice.speak('Complete', { priority: 3, maxMs: 900 });
  };

  /* Game loop at ~20 Hz (BlinkQuest rules). */
  useEffect(() => {
    if (phase !== 'playing') return;
    lastFrameAt.current = Date.now();
    const tick = setInterval(() => {
      const now = Date.now();
      const dt = now - lastFrameAt.current;
      lastFrameAt.current = now;
      const g = gaze.current;
      const c = calibration.current;
      if (!g || !c) return;
      const st = stats.current;
      st.trackedMs += dt;
      const turned = headMoved(g, c);
      setHeadWarning(turned);
      if (turned) {
        st.headTurns += dt;
        return;
      }
      if (mode === 'pursuitH' || mode === 'pursuitO') {
        const t = (now - playStart.current) / 1000;
        const tx = mode === 'pursuitH' ? Math.sin((2 * Math.PI * t) / 4) : Math.cos((2 * Math.PI * t) / 6);
        const ty = mode === 'pursuitH' ? 0 : Math.sin((2 * Math.PI * t) / 6);
        pursuit.x.value = tx;
        pursuit.y.value = ty;
        // Say where the orb is heading as it reaches each side.
        const zone =
          Math.abs(tx) > 0.75 ? (tx > 0 ? 'right' : 'left') : Math.abs(ty) > 0.75 ? (ty > 0 ? 'down' : 'up') : null;
        if (zone && zone !== saidZone.current) {
          saidZone.current = zone;
          void coachVoice.speak(`Look ${zone}`, {
            priority: 2,
            minGapMs: 0,
            maxMs: 1100,
          });
        }
        const { nx, ny } = normalize(g, c);
        const err = mode === 'pursuitH' ? Math.abs(nx - tx) : Math.hypot(nx - tx, ny - ty);
        const hit = err < (mode === 'pursuitH' ? 0.5 : 0.65);
        if (hit) st.onTargetMs += dt;
        setOnTarget(hit);
        return;
      }
      const dir = directionOf(g, c);
      if (mode === 'pop' && needCenterRef.current) {
        if (dir === 'center') {
          needCenterRef.current = false;
          setNeedCenter(false);
          nextTarget();
        }
        return;
      }
      const tgt = targetRef.current;
      if (!tgt) return;
      if (!dwell.current || dwell.current.dir !== dir) dwell.current = { dir, since: now };
      const held = now - dwell.current.since;
      if (dir === tgt && held >= DWELL_MS) {
        st.hits += 1;
        st.responses.push(dwell.current.since - promptAt.current);
        scoreHit();
        if (mode === 'pop') {
          needCenterRef.current = true;
          setNeedCenter(true);
          setTarget(null);
        } else nextTarget();
        force();
      } else if (dir !== 'center' && dir !== tgt && held >= DWELL_MS * 1.5) {
        st.misses += 1;
        dwell.current = { dir, since: now };
        force();
      } else if (now - promptAt.current > PROMPT_TIMEOUT_MS) {
        st.misses += 1;
        if (mode === 'pop') {
          needCenterRef.current = true;
          setNeedCenter(true);
          setTarget(null);
        } else nextTarget();
        force();
      }
    }, 50);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode]);

  const pursuitMode = mode === 'pursuitH' || mode === 'pursuitO';
  const st = stats.current;
  const onPct = st.trackedMs > 0 ? Math.round((st.onTargetMs / st.trackedMs) * 100) : 0;

  /* Finish: save the run and pay points once. */
  useEffect(() => {
    if (phase !== 'playing' || secondsLeft > 0) return;
    setPhase('complete');
    const s = stats.current;
    const pct = s.trackedMs > 0 ? Math.round((s.onTargetMs / s.trackedMs) * 100) : 0;
    const score = pursuitMode ? pct : Math.min(100, s.hits * 10);
    void coachVoice.speak(
      pursuitMode ? `Done. On target ${pct} percent of the time.` : `Done. ${s.hits} targets reached.`,
      { priority: 3 },
    );
    recordBetaSession({
      kind: 'eye_game',
      startedAt: startedAt.current,
      endedAt: Date.now(),
      metrics: {
        score,
        hits: s.hits,
        misses: s.misses,
        mode: MODES.findIndex((m) => m.id === mode),
        reactionMs: s.responses.length ? Math.round(s.responses.reduce((a, b) => a + b, 0) / s.responses.length) : 0,
        headTurnS: Math.round(s.headTurns / 1000),
      },
    });
  }, [phase, secondsLeft, pursuitMode, mode]);

  useEffect(() => () => coachVoice.stop(), []);

  const markerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(marker.on.value ? 1 : 0, { duration: 150 }),
    transform: [
      {
        translateX: withTiming(marker.x.value * (half - 30), {
          duration: 60,
          easing: Easing.linear,
        }),
      },
      {
        translateY: withTiming(marker.y.value * (half - 30), {
          duration: 60,
          easing: Easing.linear,
        }),
      },
    ],
  }));
  const pursuitStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pursuit.x.value * (half - 34) }, { translateY: pursuit.y.value * (half - 34) }],
  }));
  const k = half - 34;
  const offset = (d: Dir) => ({ left: [-k, 0], right: [k, 0], up: [0, -k], down: [0, k] })[d];
  const calKey = CAL_STEPS[calStep]?.key ?? 'center';
  const calPos = {
    center: [0, 0],
    left: [-(half - 26), 0],
    right: [half - 26, 0],
    up: [0, -(half - 26)],
    down: [0, half - 26],
  }[calKey];

  if (phase === 'intro' || phase === 'calibration_failed' || phase === 'complete') {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
          <PressableScale onPress={() => router.back()} accessibilityLabel="Back" style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </PressableScale>
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Eye games</Text>
          <BetaBadge />
        </View>
        <View style={{ paddingHorizontal: spacing.base }}>
          <BetaHero source={getSanctuaryIllustration('eyePursuit', experience)} label="Eye games" />
          {phase === 'complete' ? (
            <View style={[styles.result, { backgroundColor: colors.surface }]}>
              <Text style={[styles.big, { color: colors.primary }]}>{pursuitMode ? `${onPct}%` : String(st.hits)}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {pursuitMode ? 'of the time on target' : `targets reached · ${st.misses} missed`}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                From your eye movements with head turns excluded. A practice score, not a vision test.
              </Text>
            </View>
          ) : null}
          <View style={styles.chips}>
            {MODES.map((m) => (
              <Chip key={m.id} label={m.title} selected={mode === m.id} onPress={() => setMode(m.id)} />
            ))}
          </View>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8 }]}>
            {MODES.find((m) => m.id === mode)?.how} {DURATION_SEC} seconds, after a 5-second eye check.
          </Text>
          <CoachGuide
            steps={[
              'Hold the phone at reading distance, about an arm bent at the elbow, in front of your face.',
              'Keep your head still. Only your eyes move; turning your head does not score.',
              'First a 5-second eye check: follow the dot to the centre, left, right, up and down.',
              'Then follow the coach: when you hear "look right", move your eyes right until you hear "Complete".',
            ]}
            tip="Good, even light on your face helps. With glasses, tilt the phone slightly to avoid glare."
          />
          {calError ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>{calError}</Text>
          ) : null}
          <PressableScale
            onPress={() => void begin()}
            style={[styles.cta, { backgroundColor: colors.primary }]}
            accessibilityLabel="Start eye game"
          >
            <Ionicons name="play" size={18} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>
              {phase === 'calibration_failed'
                ? 'Try the eye check again'
                : phase === 'complete'
                  ? 'Play again'
                  : 'Start with the camera'}
            </Text>
          </PressableScale>
          <BetaSessionHistory
            kinds={KINDS}
            metric="score"
            unit="score"
            title="Your games"
            describe={(s) => `${MODES[s.metrics.mode]?.title ?? 'Game'} · ${s.metrics.score}`}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.mirror,
          {
            top: insets.top + 10,
            borderColor: tracking ? colors.success : colors.surface2,
          },
        ]}
      >
        <PoseDetectionAdapter
          engine="default"
          active
          facing="front"
          face
          hands={false}
          onPose={onPose}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.hud, { paddingTop: insets.top + 16, paddingHorizontal: spacing.base }]}>
        <Text style={[typography.captionBold, { color: tracking ? colors.success : colors.text.muted }]}>
          {tracking ? 'Eyes tracked' : 'Looking for your face'}
        </Text>
        {phase === 'playing' || phase === 'paused' ? (
          <Text style={[typography.heading, { color: colors.text.primary }]}>{secondsLeft}s</Text>
        ) : null}
      </View>

      <View style={styles.center}>
        <View style={[styles.area, { width: area, height: area, backgroundColor: colors.surface1 }]}>
          {phase === 'calibrating' ? (
            <View
              style={[
                styles.calDot,
                {
                  backgroundColor: colors.primary,
                  transform: [{ translateX: calPos[0] }, { translateY: calPos[1] }],
                },
              ]}
            />
          ) : null}
          {phase === 'playing' && mode === 'direction' && target ? (
            <View style={[styles.arrow, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name={ARROW[target]} size={64} color={colors.primary} />
            </View>
          ) : null}
          {phase === 'playing' && mode === 'pop' && target ? (
            <View
              style={[
                styles.orb,
                {
                  backgroundColor: colors.primary,
                  transform: [{ translateX: offset(target)[0] }, { translateY: offset(target)[1] }],
                },
              ]}
            />
          ) : null}
          {phase === 'playing' && mode === 'pop' && needCenter ? (
            <View style={[styles.centerDot, { borderColor: colors.primary }]} />
          ) : null}
          {phase === 'playing' && pursuitMode ? (
            <Animated.View
              style={[styles.orb, { backgroundColor: onTarget ? colors.success : colors.primary }, pursuitStyle]}
            />
          ) : null}
          <Animated.View
            pointerEvents="none"
            style={[styles.marker, { borderColor: colors.text.primary }, markerStyle]}
          />
          {phase === 'paused' ? (
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Paused · {secondsLeft}s left</Text>
          ) : null}
        </View>
        <Text style={[typography.bodyBold, styles.prompt, { color: colors.text.primary }]}>
          {phase === 'calibrating'
            ? tracking
              ? CAL_STEPS[calStep].label
              : "Face the camera, where you'd normally hold the phone"
            : !tracking
              ? 'Looking for your face. The clock waits.'
              : headWarning
                ? 'Keep your head still, move only your eyes'
                : mode === 'pop'
                  ? needCenter
                    ? 'Back to the centre'
                    : 'Look at the orb'
                  : mode === 'direction'
                    ? 'Look where the arrow points'
                    : onTarget
                      ? 'On target, keep following'
                      : 'Follow the orb with your eyes'}
        </Text>
        {phase === 'playing' ? (
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {pursuitMode ? `On target ${onPct}%` : `Hits ${st.hits} · Missed ${st.misses}`}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: spacing.base,
          },
        ]}
      >
        {phase === 'playing' ? (
          <Chip label="Pause" onPress={() => setPhase('paused')} />
        ) : phase === 'paused' ? (
          <Chip label="Resume" selected onPress={() => setPhase('playing')} />
        ) : null}
        <Chip label={phase === 'calibrating' ? 'Cancel eye check' : 'Stop'} onPress={() => setPhase('intro')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 18,
    marginTop: 16,
  },
  result: {
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  big: { fontSize: 48, lineHeight: 54, fontWeight: '800' },
  mirror: {
    position: 'absolute',
    right: 16,
    width: 78,
    height: 104,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    zIndex: 3,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 110,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  area: {
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  calDot: { position: 'absolute', width: 28, height: 28, borderRadius: 14 },
  arrow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: { position: 'absolute', width: 52, height: 52, borderRadius: 26 },
  centerDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
  },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
  },
  prompt: { marginTop: 18, textAlign: 'center', paddingHorizontal: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
});
