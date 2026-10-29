import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { PHRASES, VOICED, longestPhonation, steadiness, wordAccuracy, wordsPerMinute, type LevelSample } from '../../../domain/voice/practice';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { hapticSuccess } from '../../../services/haptics';
import { useVoiceInput } from '../../../services/voice/useVoiceInput';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

type Drill = 'sustain' | 'steady' | 'repeat';
const KINDS: BetaSessionKind[] = ['voice_practice'];
const DRILLS: Record<Drill, { title: string; how: string; seconds: number }> = {
  sustain: { title: 'Hold an "aah"', how: 'Take a comfortable breath and say "aah" for as long as is easy. Stop before it strains.', seconds: 25 },
  steady: { title: 'Steady voice', how: 'Count slowly from one upwards at an even, comfortable loudness. Keep the bar in the green band.', seconds: 15 },
  repeat: { title: 'Say it clearly', how: 'Read the phrase aloud clearly at a relaxed pace.', seconds: 12 },
};
const BAND: [number, number] = [4, 8];

/**
 * Voice practice with the coach: hold a sound (longest steady "aah"), keep an even loudness,
 * and say phrases clearly (word match and pace from speech-to-text). Audio is not recorded;
 * only the numbers below are kept. Practice, not speech therapy or a voice assessment.
 */
export default function VoicePracticeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const [drill, setDrill] = useState<Drill>('sustain');
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [level, setLevel] = useState(-2);
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const samples = useRef<LevelSample[]>([]);
  const heard = useRef<string[]>([]);
  const startedAt = useRef(0);
  const firstVoiceAt = useRef<number | null>(null);
  const lastVoiceAt = useRef(0);

  const voice = useVoiceInput(
    (text) => heard.current.push(text),
    (lv, at) => {
      setLevel(lv);
      samples.current.push({ level: lv, at });
      if (lv > VOICED) {
        firstVoiceAt.current ??= at;
        lastVoiceAt.current = at;
      }
    },
  );
  const listening = voice.state === 'listening';

  const finish = useCallback(async () => {
    voice.stop();
    setLeft(0);
    // The recogniser delivers its final text just after stopping.
    if (drill === 'repeat') await new Promise((r) => setTimeout(r, 900));
    const s = samples.current;
    const metrics: Record<string, number> = { drill: drill === 'sustain' ? 1 : drill === 'steady' ? 2 : 3 };
    let line = '';
    if (drill === 'sustain') {
      const ms = longestPhonation(s);
      metrics.seconds = Math.round(ms / 100) / 10;
      line = ms > 0 ? `You held your voice for ${metrics.seconds} seconds.` : 'I did not hear a held sound. Try a little louder.';
    } else if (drill === 'steady') {
      const st = steadiness(s, BAND[0], BAND[1]);
      if (st !== null) metrics.steadiness = st;
      line = st === null ? 'I did not hear enough voice to judge. Try again a little louder.' : `${st} percent of your voice stayed in the even band.`;
    } else {
      // Give the recogniser a moment to deliver its final text.
      const text = heard.current.join(' ');
      const acc = wordAccuracy(phrase, text);
      const speakingMs = firstVoiceAt.current ? lastVoiceAt.current - firstVoiceAt.current : 0;
      const wpm = wordsPerMinute(text, speakingMs);
      metrics.wordMatch = acc.score;
      if (wpm) metrics.wpm = wpm;
      line = text
        ? `${acc.score} percent of the words matched${acc.missed.length ? `; listen for: ${acc.missed.slice(0, 3).join(', ')}` : ''}.${wpm ? ` About ${wpm} words a minute.` : ''}`
        : 'I could not make out the words. Try again closer to the phone.';
    }
    setResult(line);
    hapticSuccess();
    void coachVoice.speak(line, { priority: 3, maxMs: 10_000 });
    if (Object.keys(metrics).length > 1) {
      recordBetaSession({ kind: 'voice_practice', startedAt: startedAt.current, endedAt: Date.now(), metrics });
    }
  }, [drill, phrase, voice]);

  useEffect(() => {
    if (!listening || left <= 0) return;
    const t = setTimeout(() => {
      if (left <= 1) void finish();
      else setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [listening, left, finish]);

  const abortRef = useRef(voice.abort);
  abortRef.current = voice.abort;
  useEffect(() => () => abortRef.current(), []);

  const start = async () => {
    setResult(null);
    samples.current = [];
    heard.current = [];
    firstVoiceAt.current = null;
    // The coach explains first, then the microphone opens, so it does not hear itself.
    await coachVoice.speak(DRILLS[drill].how + (drill === 'repeat' ? ` The phrase is: ${phrase}.` : ''), { priority: 3, maxMs: 9000 });
    startedAt.current = Date.now();
    const ok = await voice.start({ continuous: true, volume: true });
    if (ok) setLeft(DRILLS[drill].seconds);
  };

  const meter = Math.max(0, Math.min(1, (level + 2) / 12));
  const inBand = level >= BAND[0] && level <= BAND[1];

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · VOICE"
        title="Voice practice"
        subtitle="Hold, steady and clear speech with the coach"
        showBack
        onBack={() => {
          voice.abort();
          router.back();
        }}
        rightAction={<BetaBadge />}
      />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <BetaHero source={getSanctuaryIllustration('voicePractice', experience)} label="Voice practice" />
        <View style={styles.chips}>
          {(Object.keys(DRILLS) as Drill[]).map((d) => (
            <Chip key={d} label={DRILLS[d].title} selected={drill === d} onPress={() => !listening && setDrill(d)} />
          ))}
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>{DRILLS[drill].title}</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{DRILLS[drill].how}</Text>
          {drill === 'repeat' ? (
            <>
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 12 }]}>{phrase}</Text>
              <Chip
                label="Another phrase"
                onPress={() => !listening && setPhrase(PHRASES[(PHRASES.indexOf(phrase) + 1) % PHRASES.length])}
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
              />
            </>
          ) : null}

          <View style={[styles.meter, { backgroundColor: colors.surface1 }]}>
            {drill === 'steady' ? (
              <View
                style={[
                  styles.band,
                  { left: `${((BAND[0] + 2) / 12) * 100}%`, width: `${((BAND[1] - BAND[0]) / 12) * 100}%`, backgroundColor: colors.successSurface },
                ]}
              />
            ) : null}
            <View style={[styles.fill, { width: `${meter * 100}%`, backgroundColor: drill === 'steady' && inBand ? colors.success : colors.primary }]} />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
            {listening ? `Listening · ${left}s` : voice.state === 'unavailable' ? 'Speech recognition is not available on this phone.' : 'Microphone off'}
            {voice.partial ? ` · "${voice.partial}"` : ''}
          </Text>
          {voice.error ? <Text style={[typography.caption, { color: colors.error, marginTop: 4 }]}>{voice.error}</Text> : null}

          <PressableScale
            onPress={() => void (listening ? finish() : start())}
            style={[styles.cta, { backgroundColor: listening ? colors.surface2 : colors.primary }]}
            accessibilityLabel={listening ? 'Stop' : 'Start'}
          >
            <Ionicons name={listening ? 'stop' : 'mic'} size={18} color={listening ? colors.text.primary : colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: listening ? colors.text.primary : colors.text.inverse, marginLeft: 8 }]}>
              {listening ? 'Stop' : 'Start'}
            </Text>
          </PressableScale>
          {result ? <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 12 }]}>{result}</Text> : null}
        </Card>

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>
          Audio is not recorded or saved; only the results are kept on this phone. This is voice practice, not speech therapy
          or a medical assessment. If your voice is hoarse for more than two weeks, see a doctor.
        </Text>

        <BetaSessionHistory
          kinds={KINDS}
          metric="seconds"
          unit="s held"
          title="Your practice"
          describe={(s) =>
            s.metrics.drill === 1
              ? `held ${s.metrics.seconds}s`
              : s.metrics.drill === 2
                ? `steady ${s.metrics.steadiness ?? 0}%`
                : `words ${s.metrics.wordMatch}%${s.metrics.wpm ? ` · ${s.metrics.wpm} wpm` : ''}`
          }
        />
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  meter: { height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 16, position: 'relative' },
  band: { position: 'absolute', top: 0, bottom: 0 },
  fill: { height: '100%', borderRadius: 7 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 18, marginTop: 16 },
});
