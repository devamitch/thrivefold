/**
 * Microphone input for the coach and voice practice: speech to text (on-device when the phone
 * supports it) and a live loudness level. Listening only runs while the person holds a session
 * open; the app never records or saves audio.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useRef, useState } from 'react';

import { coachVoice } from '../ai/coachVoice';

export type VoiceState = 'idle' | 'listening' | 'denied' | 'unavailable' | 'error';

export interface VoiceOptions {
  /** Keep listening across pauses (practice drills) instead of stopping after one sentence. */
  continuous?: boolean;
  /** Emit loudness levels (−2 … 10; below 0 is silence). */
  volume?: boolean;
  lang?: string;
}

const available = (): boolean => {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
};

export function useVoiceInput(onFinal?: (text: string) => void, onVolume?: (level: number, at: number) => void) {
  const [state, setState] = useState<VoiceState>(available() ? 'idle' : 'unavailable');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const finals = useRef<string[]>([]);

  useSpeechRecognitionEvent('start', () => setState('listening'));
  useSpeechRecognitionEvent('end', () => setState((s) => (s === 'listening' ? 'idle' : s)));
  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? '';
    if (e.isFinal) {
      setPartial('');
      if (text.trim()) {
        finals.current.push(text.trim());
        onFinal?.(text.trim());
      }
    } else {
      setPartial(text);
    }
  });
  useSpeechRecognitionEvent('volumechange', (e) => onVolume?.(e.value, Date.now()));
  useSpeechRecognitionEvent('error', (e) => {
    if (e.error === 'aborted' || e.error === 'no-speech') {
      setState('idle');
      return;
    }
    setError(e.error === 'not-allowed' ? 'Microphone access was not allowed.' : e.message || 'Listening stopped.');
    setState(e.error === 'not-allowed' ? 'denied' : 'error');
  });

  const start = useCallback(async (opts: VoiceOptions = {}) => {
    setError(null);
    if (!available()) {
      setState('unavailable');
      return false;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setState('denied');
      setError('Microphone access was not allowed. You can allow it in Android settings.');
      return false;
    }
    // The coach must not talk into its own microphone.
    coachVoice.stop();
    finals.current = [];
    let onDevice = false;
    try {
      onDevice = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
    } catch {
      onDevice = false;
    }
    ExpoSpeechRecognitionModule.start({
      lang: opts.lang ?? 'en-IN',
      interimResults: true,
      continuous: opts.continuous ?? false,
      requiresOnDeviceRecognition: onDevice,
      addsPunctuation: false,
      volumeChangeEventOptions: opts.volume ? { enabled: true, intervalMillis: 100 } : undefined,
    });
    return true;
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // not listening
    }
  }, []);

  const abort = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // not listening
    }
    setState((s) => (s === 'listening' ? 'idle' : s));
  }, []);

  return { state, partial, error, start, stop, abort, finals };
}
