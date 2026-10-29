import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HandGestureName, PoseFrame } from '../../../../modules/pose-landmarker';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaBadge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { HandTrackerSession } from '../../../domain/vision/handTracker';
import {
  HOLD_MS,
  ROUND_MS,
  ROUNDS,
  isFinished,
  startGame,
  stepGame,
  type FingerGameState,
} from '../../../domain/vision/fingerGame';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticSuccess, hapticWarning } from '../../../services/haptics';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { BetaHero } from '../../../components/beta/BetaHero';

const KINDS: BetaSessionKind[] = ['finger_game'];
type Mode = 'fingers' | 'gestures';
const WORDS: Record<Mode, string[]> = {
  fingers: ['', 'one finger', 'two fingers', 'three fingers', 'four fingers', 'five fingers'],
  gestures: ['', 'a thumbs up', 'a peace sign', 'an open palm', 'a closed fist', 'one finger pointing up'],
};
const TARGET_LABEL: Record<Mode, string[]> = {
  fingers: ['', '1', '2', '3', '4', '5'],
  gestures: ['', 'Thumbs up', 'Peace', 'Open palm', 'Fist', 'Point up'],
};
/** Gesture recognizer names in the same order as the targets 1–5. */
const GESTURES: HandGestureName[] = ['None', 'Thumb_Up', 'Victory', 'Open_Palm', 'Closed_Fist', 'Pointing_Up'];

/**
 * Finger Count Challenge: a full-screen, coach-voiced hand game. The coach calls a number, the
 * hand landmarker counts extended fingers, and holding the right count scores the round.
 */
export default function GestureGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  const [game, setGame] = useState<FingerGameState | null>(null);
  const [mode, setMode] = useState<Mode>('fingers');
  const modeRef = useRef<Mode>('fingers');
  modeRef.current = mode;
  const [fingers, setFingers] = useState<number | null>(null);
  const [denied, setDenied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const tracker = useRef(new HandTrackerSession());
  const gameRef = useRef<FingerGameState | null>(null);
  const startedAt = useRef(0);
  gameRef.current = game;
  const playing = !!game && !isFinished(game);

  const announce = useCallback((g: FingerGameState) => {
    if (isFinished(g)) {
      void coachVoice.speak(`Game over. You scored ${g.score} out of ${ROUNDS}.`, { priority: 3 });
    } else {
      void coachVoice.speak(
        `${g.last === 'hit' ? 'Nice. ' : g.last === 'miss' ? 'Next one. ' : ''}Show ${WORDS[modeRef.current][g.target]}.`,
        {
          priority: 3,
        },
      );
    }
  }, []);

  const finish = useCallback((g: FingerGameState) => {
    recordBetaSession({
      kind: 'finger_game',
      startedAt: startedAt.current,
      endedAt: Date.now(),
      metrics: {
        gestureMode: modeRef.current === 'gestures' ? 1 : 0,
        score: g.score,
        rounds: ROUNDS,
        reactionMs: g.reactions.length ? Math.round(g.reactions.reduce((a, b) => a + b, 0) / g.reactions.length) : 0,
      },
    });
  }, []);

  const onPose = useCallback(
    (e: NativeSyntheticEvent<PoseFrame>) => {
      const hand = e.nativeEvent.hands?.[0];
      const st = tracker.current.processHand(hand);
      const gesture = e.nativeEvent.gestures?.[0];
      const count =
        modeRef.current === 'gestures'
          ? gesture && gesture.score >= 0.6 && GESTURES.indexOf(gesture.name) > 0
            ? GESTURES.indexOf(gesture.name)
            : hand
              ? 0
              : null
          : st.confidence > 0
            ? st.extendedFingers
            : null;
      setFingers(count);
      const g = gameRef.current;
      if (!g || isFinished(g)) return;
      const t = Date.now();
      const next = stepGame(g, count, t, Math.random());
      if (next === g) return;
      if (next.round !== g.round) {
        if (next.last === 'hit') hapticSuccess();
        else hapticWarning();
        announce(next);
        if (isFinished(next)) finish(next);
      }
      gameRef.current = next;
      setGame(next);
    },
    [announce, finish],
  );

  // A clock for the round timer, and the time-out when no hand is visible (no frames to step on).
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const g = gameRef.current;
      if (g && !isFinished(g) && t - g.roundStartedAt >= ROUND_MS) {
        const next = stepGame(g, null, t, Math.random());
        hapticWarning();
        announce(next);
        if (isFinished(next)) finish(next);
        gameRef.current = next;
        setGame(next);
      }
    }, 250);
    return () => clearInterval(iv);
  }, [playing, announce, finish]);

  useEffect(() => () => coachVoice.stop(), []);

  const start = async () => {
    const ok = await ensureCameraPermission();
    setDenied(!ok);
    if (!ok) return;
    tracker.current.reset();
    startedAt.current = Date.now();
    const g = startGame(startedAt.current, Math.random());
    gameRef.current = g;
    setGame(g);
    announce(g);
  };

  const stop = () => {
    coachVoice.stop();
    setGame(null);
  };

  const remaining = game && playing ? Math.max(0, Math.ceil((ROUND_MS - (now - game.roundStartedAt)) / 1000)) : 0;
  const holding = game?.holdSince ? Math.min(1, (now - game.holdSince) / HOLD_MS) : 0;

  if (!game) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
          <PressableScale onPress={() => router.back()} accessibilityLabel="Back" style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </PressableScale>
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Hand Games</Text>
          <BetaBadge />
        </View>
        <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.md }}>
          <BetaHero source={require('../../../../assets/illustrations/beta-hand-games.jpg')} label="Hand games" />
          <View style={styles.modes}>
            <Chip label="Finger count" selected={mode === 'fingers'} onPress={() => setMode('fingers')} />
            <Chip label="Gesture match" selected={mode === 'gestures'} onPress={() => setMode('gestures')} />
          </View>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 10 }]}>
            {mode === 'fingers'
              ? 'The coach calls a number from one to five. Hold up that many fingers to the front camera until the ring fills.'
              : 'The coach calls a hand sign: thumbs up, peace, open palm, fist or pointing up. Show it to the front camera until the ring fills.'}{' '}
            {ROUNDS} rounds, {ROUND_MS / 1000} seconds each. Good for finger dexterity and a quick break from the
            screen.
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            Hand landmarks are processed on this phone; no video is saved. Hold your palm toward the camera in good
            light.
          </Text>
          {denied ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>
              Camera access was not allowed. Allow it in Android settings to play.
            </Text>
          ) : null}
          <PressableScale
            onPress={start}
            style={[styles.cta, { backgroundColor: colors.primary }]}
            accessibilityLabel="Start game"
          >
            <Ionicons name="play" size={18} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>Start game</Text>
          </PressableScale>
          <BetaSessionHistory
            kinds={KINDS}
            metric="score"
            unit={`of ${ROUNDS}`}
            title="Your games"
            describe={(s) =>
              `${s.metrics.score}/${s.metrics.rounds}${s.metrics.reactionMs ? ` · ${(s.metrics.reactionMs / 1000).toFixed(1)} s` : ''}`
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, styles.dark]}>
      <PoseDetectionAdapter
        engine="default"
        active={playing}
        facing="front"
        face={false}
        hands
        onPose={onPose}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.overlayTop, { paddingTop: insets.top + 8, paddingHorizontal: spacing.base }]}>
        <PressableScale onPress={stop} accessibilityLabel="End game" style={[styles.iconBtn, styles.scrim]}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </PressableScale>
        <Text style={[typography.bodyBold, styles.light]}>
          {playing ? `Round ${game.round} of ${ROUNDS}` : 'Finished'}
        </Text>
        <View style={[styles.scorePill, styles.scrim]}>
          <Text style={[typography.bodyBold, styles.light]}>{game.score}</Text>
        </View>
      </View>

      {playing ? (
        <View style={styles.center} pointerEvents="none">
          <View
            style={[
              styles.targetRing,
              {
                borderColor: holding > 0 ? colors.success : 'rgba(255,255,255,0.5)',
              },
            ]}
          >
            <Text style={[mode === 'fingers' ? styles.target : styles.targetWord, styles.light]}>
              {TARGET_LABEL[mode][game.target]}
            </Text>
          </View>
          <Text style={[typography.bodyBold, styles.light, { marginTop: 12 }]}>Show {WORDS[mode][game.target]}</Text>
          <Text style={[typography.caption, styles.dim, { marginTop: 4 }]}>
            {fingers === null
              ? 'No hand in view'
              : mode === 'fingers'
                ? `I see ${fingers}`
                : `I see ${fingers ? TARGET_LABEL.gestures[fingers] : 'no sign yet'}`}{' '}
            · {remaining}s
          </Text>
        </View>
      ) : (
        <View style={[styles.center, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.target, styles.light]}>
            {game.score}/{ROUNDS}
          </Text>
          <Text style={[typography.body, styles.dim, { marginTop: 6, textAlign: 'center' }]}>
            {game.reactions.length
              ? `Average ${(game.reactions.reduce((a, b) => a + b, 0) / game.reactions.length / 1000).toFixed(1)} s to show the right count.`
              : 'No rounds scored this time.'}
          </Text>
          <View style={styles.endRow}>
            <PressableScale
              onPress={start}
              style={[styles.cta, styles.endBtn, { backgroundColor: colors.primary }]}
              accessibilityLabel="Play again"
            >
              <Text style={[typography.bodyBold, { color: colors.text.inverse }]}>Play again</Text>
            </PressableScale>
            <PressableScale onPress={stop} style={[styles.cta, styles.endBtn, styles.scrim]} accessibilityLabel="Done">
              <Text style={[typography.bodyBold, styles.light]}>Done</Text>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  dark: { backgroundColor: '#000000' },
  light: { color: '#FFFFFF' },
  dim: { color: 'rgba(255,255,255,0.75)' },
  scrim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 18,
    marginTop: 20,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scorePill: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  target: { fontSize: 72, lineHeight: 80, fontWeight: '800' },
  targetWord: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  modes: { flexDirection: 'row', gap: 8 },
  endRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  endBtn: { paddingHorizontal: 28 },
});
