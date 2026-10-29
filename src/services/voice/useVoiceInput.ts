/**
 * Microphone input for the coach and voice practice: speech to text (on-device when the phone
 * supports it) and a live loudness level. Listening only runs while the person holds a session
 * open; the app never records or saves audio.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

import { coachVoice } from '../ai/coachVoice';

export type VoiceState = 'idle' | 'listening' | 'denied' | 'unavailable' | 'error';

export interface VoiceOptions {
  /** Keep listening across pauses (practice drills, hands-free coach) instead of stopping after one sentence. */
  continuous?: boolean;
  /** Emit loudness levels (−2 … 10; below 0 is silence). */
  volume?: boolean;
  lang?: string;
  /** Force on-device offline recognition when supported. */
  preferOffline?: boolean;
}

const available = (): boolean => {
  try {
    return Boolean(ExpoSpeechRecognitionModule?.isRecognitionAvailable?.());
  } catch {
    return false;
  }
};

export function useVoiceInput(
  onFinal?: (text: string) => void,
  onVolume?: (level: number, at: number) => void,
) {
  const [state, setState] = useState<VoiceState>(available() ? 'idle' : 'unavailable');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const finals = useRef<string[]>([]);
  const activeRef = useRef(false);
  const optsRef = useRef<VoiceOptions>({});
  const lastTranscriptRef = useRef('');
  const lastTranscriptAtRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRestart = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const scheduleRestart = () => {
    if (!activeRef.current || !optsRef.current.continuous) return;
    clearRestart();
    restartTimerRef.current = setTimeout(() => {
      if (activeRef.current && optsRef.current.continuous) {
        void doStart(optsRef.current, true);
      }
    }, 350);
  };

  useSpeechRecognitionEvent('start', () => {
    clearRestart();
    setState('listening');
  });

  useSpeechRecognitionEvent('end', () => {
    if (activeRef.current && optsRef.current.continuous) {
      // In continuous hands-free mode, seamlessly cycle recognition across pauses
      scheduleRestart();
    } else {
      activeRef.current = false;
      setState((s) => (s === 'listening' ? 'idle' : s));
    }
  });

  useSpeechRecognitionEvent('result', (e) => {
    const text = (e.results[0]?.transcript ?? '').trim();
    if (e.isFinal) {
      setPartial('');
      if (!text) return;

      // Echo guard: Discard text if coach voice is currently speaking or just finished
      if (coachVoice.isSpeaking()) {
        return;
      }

      // Deduplication: Discard identical transcript received within 1200ms
      const now = Date.now();
      if (lastTranscriptRef.current === text && now - lastTranscriptAtRef.current < 1200) {
        return;
      }
      lastTranscriptRef.current = text;
      lastTranscriptAtRef.current = now;

      finals.current.push(text);
      onFinal?.(text);

      if (optsRef.current.continuous && activeRef.current) {
        scheduleRestart();
      }
    } else {
      // While coach is speaking, suppress partial text
      if (!coachVoice.isSpeaking()) {
        setPartial(text);
      }
    }
  });

  useSpeechRecognitionEvent('volumechange', (e) => onVolume?.(e.value, Date.now()));

  useSpeechRecognitionEvent('error', (e) => {
    if (e.error === 'aborted') {
      activeRef.current = false;
      setState('idle');
      return;
    }

    if (e.error === 'no-speech') {
      if (activeRef.current && optsRef.current.continuous) {
        // Expected pause during workout; stay ready in continuous mode
        scheduleRestart();
        return;
      }
      setState('idle');
      return;
    }

    // Locale fallback: if offline pack missing for regional locale, fallback gracefully
    if (
      (e.error === 'language-not-supported' || e.error === 'network') &&
      optsRef.current.lang &&
      optsRef.current.lang !== 'en-US'
    ) {
      optsRef.current = { ...optsRef.current, lang: 'en-US' };
      scheduleRestart();
      return;
    }

    activeRef.current = false;
    setError(
      e.error === 'not-allowed'
        ? 'Microphone access was not allowed.'
        : e.error === 'network' || /server|disconnect/i.test(e.message ?? '')
          ? 'The speech service could not be reached. Check your connection, or download the offline speech pack in Android settings (Speech → Offline).'
          : e.message || 'Listening stopped.',
    );
    setState(e.error === 'not-allowed' ? 'denied' : 'error');
  });

  const doStart = async (opts: VoiceOptions, isRestart = false): Promise<boolean> => {
    if (!available()) {
      setState('unavailable');
      return false;
    }

    if (!isRestart) {
      setError(null);
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync().catch(() => ({
        granted: false,
      }));
      if (!perm.granted) {
        setState('denied');
        setError('Microphone access was not allowed. You can allow it in Android settings.');
        activeRef.current = false;
        return false;
      }
    }

    // Stop active speech so coach doesn't speak into its own microphone
    coachVoice.stop();
    if (!isRestart) {
      finals.current = [];
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: opts.lang ?? 'en-IN',
        interimResults: true,
        continuous: opts.continuous ?? false,
        requiresOnDeviceRecognition: false,
        androidIntentOptions: {
          EXTRA_PREFER_OFFLINE: opts.preferOffline ?? true,
        },
        addsPunctuation: false,
        volumeChangeEventOptions: opts.volume ? { enabled: true, intervalMillis: 100 } : undefined,
      });
      activeRef.current = true;
      return true;
    } catch {
      setState('error');
      activeRef.current = false;
      return false;
    }
  };

  const start = useCallback(async (opts: VoiceOptions = {}) => {
    clearRestart();
    optsRef.current = opts;
    activeRef.current = true;
    return doStart(opts, false);
  }, []);

  const stop = useCallback(() => {
    clearRestart();
    activeRef.current = false;
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // not listening
    }
  }, []);

  const abort = useCallback(() => {
    clearRestart();
    activeRef.current = false;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // not listening
    }
    setState((s) => (s === 'listening' ? 'idle' : s));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRestart();
      activeRef.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { state, partial, error, start, stop, abort, finals };
}
