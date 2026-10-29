/**
 * Live microphone loudness, pitch (YIN) and, optionally, sound classification (MediaPipe YAMNet)
 * from Thrivefold's native AudioSense module. Analysis runs on the phone in memory; nothing is
 * recorded or sent. Works offline.
 */
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { AudioSense, type PitchEvent, type SoundEvent } from '../../../modules/pose-landmarker/audio';
import { coachVoice } from '../ai/coachVoice';

async function micPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    if (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)) return true;
    return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)) === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export function useAudioSense(handlers: { onPitch?: (e: PitchEvent) => void; onSound?: (e: SoundEvent) => void }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    if (!AudioSense) return;
    const subs = [
      AudioSense.addListener('onPitch', (e) => h.current.onPitch?.(e)),
      AudioSense.addListener('onSound', (e) => h.current.onSound?.(e)),
      AudioSense.addListener('onAudioError', (e) => {
        setError(e.message);
        setListening(false);
      }),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  const start = useCallback(async (classify = false) => {
    setError(null);
    if (!AudioSense) {
      setError('Audio analysis is not available on this device.');
      return false;
    }
    if (!(await micPermission())) {
      setError('Microphone access was not allowed. You can allow it in Android settings.');
      return false;
    }
    coachVoice.stop();
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // the recogniser was not running
    }
    const ok = AudioSense.start(classify);
    setListening(ok);
    if (!ok) setError('The microphone could not start. Close other apps using it and try again.');
    return ok;
  }, []);

  const stop = useCallback(() => {
    AudioSense?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => AudioSense?.stop(), []);
  return { listening, error, start, stop, available: !!AudioSense };
}
