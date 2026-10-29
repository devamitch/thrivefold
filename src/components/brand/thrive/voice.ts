import { useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';

// The speech-recognition native module may be missing (Expo Go, or a build made before it was added).
// Loading it defensively means the character and TTS keep working instead of crashing the screen.
let SR: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SR = require('expo-speech-recognition');
} catch {
  SR = null;
}
const Mod = SR?.ExpoSpeechRecognitionModule;
const useSREvent: (name: string, cb: (e: any) => void) => void = SR?.useSpeechRecognitionEvent ?? (() => {});

export type Coach = 'male' | 'female';
/** Coach voice is the opposite gender of the user (female voice by default). */
export const coachFor = (g?: 'male' | 'female' | 'other'): Coach => (g === 'female' ? 'male' : 'female');

// Voice name hints for Indian English. Verify on your device; the first match wins.
const FEMALE = /veena|lekha|heera|neerja|swara|female|en-in-x-(ena|enc)\b|-x-hia/i;
const MALE = /rishi|ravi|prabhat|madhur|male|en-in-x-(end|ene)\b|-x-hic/i;

async function pickVoice(lang: string, coach: Coach): Promise<string | undefined> {
  try {
    const all = await Speech.getAvailableVoicesAsync();
    const norm = (l?: string) => (l ?? '').toLowerCase().replace('_', '-');
    const inLang = all.filter((v) => norm(v.language).startsWith(norm(lang)));
    const pool = inLang.length ? inLang : all.filter((v) => norm(v.language).startsWith('en'));
    const re = coach === 'female' ? FEMALE : MALE;
    const best = pool.filter((v) => re.test(`${v.name} ${v.identifier}`));
    const ranked = (best.length ? best : []).sort((a, b) => (b.quality === 'Enhanced' ? 1 : 0) - (a.quality === 'Enhanced' ? 1 : 0));
    return ranked[0]?.identifier;
  } catch {
    return undefined;
  }
}

export interface VoiceHandlers {
  lang?: string;
  coach?: Coach;
  onStart: () => void;
  onEnd: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onVolume: (level: number) => void;
  onSpeaking: (speaking: boolean) => void;
  onError: (message: string) => void;
}

/** Offline dictation + system TTS. The mic pauses while the coach talks so it never hears itself. */
export function useVoice(h: VoiceHandlers) {
  const hRef = useRef(h);
  hRef.current = h;
  const lang = h.lang ?? 'en-IN';
  const coach = h.coach ?? 'female';
  const want = useRef(false);
  const running = useRef(false);
  const speaking = useRef(false);
  const voiceId = useRef<string | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    pickVoice(lang, coach).then((id) => { if (alive) voiceId.current = id; });
    return () => { alive = false; };
  }, [lang, coach]);

  const begin = useCallback(() => {
    if (!Mod) return;
    try {
      Mod.start({
        lang,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: true,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 120 },
      });
    } catch (e: any) {
      hRef.current.onError(e?.message ?? 'Could not start the microphone');
    }
  }, [lang]);

  useSREvent('start', () => { running.current = true; hRef.current.onStart(); });
  useSREvent('end', () => {
    running.current = false;
    if (want.current) { if (!speaking.current) setTimeout(begin, 300); }
    else hRef.current.onEnd();
  });
  useSREvent('result', (e) => {
    const t = e?.results?.[0]?.transcript;
    if (t) hRef.current.onTranscript(String(t).trim(), !!e.isFinal);
  });
  useSREvent('volumechange', (e) => hRef.current.onVolume(e?.value ?? 0));
  useSREvent('error', (e) => {
    if (e?.error === 'no-speech' || e?.error === 'aborted') return;
    if (e?.error === 'language-not-supported') {
      want.current = false;
      Mod?.androidTriggerOfflineModelDownload?.({ locale: lang })?.catch?.(() => {});
      hRef.current.onError('Downloading the offline speech model. Try the mic again in a minute.');
      return;
    }
    hRef.current.onError(e?.message || 'Speech recognition error');
  });

  const start = useCallback(async () => {
    if (!Mod) { hRef.current.onError('Voice input needs a fresh native build of the app.'); return; }
    const p = await Mod.requestPermissionsAsync();
    if (!p.granted) { hRef.current.onError('I need microphone permission to listen.'); return; }
    want.current = true;
    begin();
  }, [begin]);

  const stop = useCallback(() => {
    want.current = false;
    try { Mod?.stop(); } catch { /* ignore */ }
    if (!running.current) hRef.current.onEnd();
  }, []);

  const speak = useCallback((text: string, interrupt = false) => {
    if (want.current && running.current) { try { Mod?.abort(); } catch { /* ignore */ } }
    if (interrupt) Speech.stop();
    const finish = () => {
      Speech.isSpeakingAsync().then((still) => {
        if (still) return;
        speaking.current = false;
        hRef.current.onSpeaking(false);
        if (want.current && !running.current) setTimeout(begin, 250);
      }).catch(() => {});
    };
    const id = voiceId.current;
    Speech.speak(text, {
      language: lang,
      ...(id ? { voice: id, rate: 0.96 } : { rate: 0.96, pitch: coach === 'female' ? 1.12 : 0.85 }),
      onStart: () => { speaking.current = true; hRef.current.onSpeaking(true); },
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  }, [lang, coach, begin]);

  return { start, stop, speak };
}
