import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { PATTERNS, breathAt, type BreathPattern, type BreathPhase } from '../../../domain/wellbeing/breathing';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticSelection } from '../../../services/haptics';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';
import { CoachGuide } from '../../../components/beta/CoachGuide';

const KINDS: BetaSessionKind[] = ['breathing'];
const LENGTHS = [1, 3, 5];
const SAY: Record<BreathPhase, string> = { inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out', rest: 'Rest' };

/** Paced breathing with the coach's voice and a breathing circle; sessions are saved on this phone. */
export default function BreathingScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const reduce = useReducedMotion();

  const [pattern, setPattern] = useState<BreathPattern>(PATTERNS[0]);
  const [minutes, setMinutes] = useState(3);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [voice, setVoice] = useState(() => useRootStore.getState().coachVoiceEnabled);
  const lastPhase = useRef<string>('');

  const elapsed = startedAt ? now - startedAt : 0;
  const done = !!startedAt && elapsed >= minutes * 60_000;
  const at = breathAt(pattern, elapsed);

  const scale = useSharedValue(0.6);
  const circle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (!startedAt || done) return;
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, [startedAt, done]);

  // Phase changes drive the circle, a tick, and the spoken cue.
  useEffect(() => {
    if (!startedAt || done) return;
    const key = `${at.cycle}-${at.phase}`;
    if (key === lastPhase.current) return;
    lastPhase.current = key;
    hapticSelection();
    if (voice) void coachVoice.speak(SAY[at.phase], { priority: 3 });
    const target = at.phase === 'inhale' ? 1 : at.phase === 'exhale' ? 0.6 : scale.value;
    scale.value = reduce ? target : withTiming(target, { duration: at.phaseLength * 1000, easing: Easing.inOut(Easing.sin) });
  }, [at.cycle, at.phase, at.phaseLength, startedAt, done, voice, reduce, scale]);

  // Save a finished session once.
  const saved = useRef(false);
  useEffect(() => {
    if (!done || !startedAt || saved.current) return;
    saved.current = true;
    if (voice) void coachVoice.speak('Well done. Notice how you feel.', { priority: 3 });
    recordBetaSession({
      kind: 'breathing',
      startedAt,
      endedAt: startedAt + minutes * 60_000,
      metrics: { minutes, cycles: breathAt(pattern, minutes * 60_000).cycle },
    });
  }, [done, startedAt, minutes, pattern, voice]);

  useEffect(() => () => coachVoice.stop(), []);

  const start = () => {
    saved.current = false;
    lastPhase.current = '';
    scale.value = 0.6;
    setNow(Date.now());
    setStartedAt(Date.now());
  };
  const stop = () => {
    coachVoice.stop();
    setStartedAt(null);
  };

  const running = !!startedAt && !done;
  const left = Math.max(0, minutes * 60 - Math.floor(elapsed / 1000));

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · GUIDED PRACTICE"
        title="Breathing Coach"
        subtitle="Paced breathing with spoken cues"
        showBack
        onBack={() => {
          coachVoice.stop();
          router.back();
        }}
        rightAction={<BetaBadge />}
      />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>

        {!startedAt ? <BetaHero source={getSanctuaryIllustration('breathing', experience)} label="Breathing coach" /> : null}
        <View style={styles.stage}>
          <Animated.View style={[styles.circle, { backgroundColor: colors.primaryAlpha, borderColor: colors.primary }, circle]} />
          <View style={styles.stageText} pointerEvents="none">
            <Text style={[typography.heading, { color: colors.text.primary }]}>
              {running ? SAY[at.phase] : done ? 'Done' : 'Ready'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
              {running ? `${at.secondsLeft}s · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left` : done ? `${breathAt(pattern, minutes * 60_000).cycle} breaths` : pattern.note}
            </Text>
          </View>
        </View>

        {!running ? (
          <>
            <Text style={[typography.label, { color: colors.text.muted, marginTop: spacing.md, marginBottom: 6 }]}>Pattern</Text>
            <View style={styles.chips}>
              {PATTERNS.map((p) => (
                <Chip key={p.id} label={p.name} selected={pattern.id === p.id} onPress={() => setPattern(p)} />
              ))}
            </View>
            <Text style={[typography.label, { color: colors.text.muted, marginTop: spacing.md, marginBottom: 6 }]}>Length</Text>
            <View style={styles.chips}>
              {LENGTHS.map((m) => (
                <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
              ))}
              <Chip label={voice ? 'Voice on' : 'Voice off'} selected={voice} onPress={() => setVoice((v) => !v)} />
            </View>
          </>
        ) : null}

        {!running ? (
          <CoachGuide
            steps={[
              'Sit comfortably with your back supported and shoulders relaxed.',
              'Breathe in through your nose as the circle grows, out slowly as it shrinks.',
              'On hold, pause gently. Never strain or force your breath.',
            ]}
            tip="Longer out-breaths calm the body. Stop and breathe normally if you feel dizzy."
          />
        ) : null}
        <PressableScale
          onPress={running ? stop : start}
          style={[styles.cta, { backgroundColor: running ? colors.surface2 : colors.primary }]}
          accessibilityLabel={running ? 'Stop' : 'Start breathing'}
        >
          <Ionicons name={running ? 'stop' : 'play'} size={18} color={running ? colors.text.primary : colors.text.inverse} />
          <Text style={[typography.bodyBold, { color: running ? colors.text.primary : colors.text.inverse, marginLeft: 8 }]}>
            {running ? 'Stop' : done ? 'Again' : 'Start'}
          </Text>
        </PressableScale>

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>
          If you feel dizzy, stop and breathe normally. This is a relaxation practice, not a treatment.
        </Text>

        <BetaSessionHistory
          kinds={KINDS}
          metric="minutes"
          unit="min"
          title="Breathing sessions"
          describe={(s) => `${s.metrics.minutes} min · ${s.metrics.cycles} breaths`}
        />
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stage: { height: 280, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  circle: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 2 },
  stageText: { alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 18, marginTop: 20 },
});
