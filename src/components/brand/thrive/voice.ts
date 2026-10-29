import { useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export interface VoiceHandlers {
  lang?: string;
  onStart: () => void;
  onEnd: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onVolume: (level: number) => void;
  onSpeaking: (speaking: boolean) => void;
  onError: (message: string) => void;
}

/**
 * Offline dictation (requiresOnDeviceRecognition) + system TTS.
 * The mic pauses while the character talks so it never hears itself.
 */
export function useVoice(h: VoiceHandlers) {
  const hRef = useRef(h);
  hRef.current = h;
  const lang = h.lang ?? 'en-IN';
  const want = useRef(false);
  const running = useRef(false);
  const speaking = useRef(false);

  const begin = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.start({
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

  useSpeechRecognitionEvent('start', () => { running.current = true; hRef.current.onStart(); });
  useSpeechRecognitionEvent('end', () => {
    running.current = false;
    if (want.current) { if (!speaking.current) setTimeout(begin, 300); }
    else hRef.current.onEnd();
  });
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results?.[0]?.transcript;
    if (t) hRef.current.onTranscript(t.trim(), !!e.isFinal);
  });
  useSpeechRecognitionEvent('volumechange', (e) => hRef.current.onVolume(e.value));
  useSpeechRecognitionEvent('error', (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    if (e.error === 'language-not-supported') {
      want.current = false;
      (ExpoSpeechRecognitionModule as any).androidTriggerOfflineModelDownload?.({ locale: lang })?.catch?.(() => {});
      hRef.current.onError('The offline speech model is missing. I am downloading it, try again in a minute.');
      return;
    }
    hRef.current.onError(e.message || 'Speech recognition error');
  });

  const start = useCallback(async () => {
    const p = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!p.granted) { hRef.current.onError('I need microphone permission to listen.'); return; }
    want.current = true;
    begin();
  }, [begin]);

  const stop = useCallback(() => {
    want.current = false;
    ExpoSpeechRecognitionModule.stop();
    if (!running.current) hRef.current.onEnd();
  }, []);

  const speak = useCallback((text: string, interrupt = false) => {
    if (want.current && running.current) ExpoSpeechRecognitionModule.abort();
    if (interrupt) Speech.stop();
    const finish = () => {
      Speech.isSpeakingAsync().then((still) => {
        if (still) return;
        speaking.current = false;
        hRef.current.onSpeaking(false);
        if (want.current && !running.current) setTimeout(begin, 250);
      });
    };
    Speech.speak(text, {
      language: lang,
      rate: 0.96,
      pitch: 1.08,
      onStart: () => { speaking.current = true; hRef.current.onSpeaking(true); },
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  }, [lang, begin]);

  return { start, stop, speak };
}
