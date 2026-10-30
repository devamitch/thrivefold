import { useCallback, useRef } from 'react';

import { isCoachSpeechPlaying, speakCoachLine } from '../../../services/ai/coachVoiceService';

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
  const want = useRef(false);
  const running = useRef(false);
  const speaking = useRef(false);

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

  // One coach voice everywhere: the person's chosen voice and speed from the speech service.
  const speak = useCallback((text: string, interrupt = false) => {
    if (want.current && running.current) { try { Mod?.abort(); } catch { /* ignore */ } }
    const finish = () => {
      isCoachSpeechPlaying().then((still) => {
        if (still) return;
        speaking.current = false;
        hRef.current.onSpeaking(false);
        if (want.current && !running.current) setTimeout(begin, 250);
      }).catch(() => {});
    };
    void speakCoachLine(text, {
      language: lang,
      interrupt,
      onStart: () => { speaking.current = true; hRef.current.onSpeaking(true); },
      onEnd: finish,
    });
  }, [lang, begin]);

  return { start, stop, speak };
}
