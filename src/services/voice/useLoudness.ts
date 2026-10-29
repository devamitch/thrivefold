/**
 * Live microphone loudness from the phone itself (expo-audio metering): no speech service, no
 * network. A temporary recording file is needed for metering on Android; it is deleted as soon
 * as the session stops, so no audio is kept.
 */
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useRef, useState } from 'react';

import { coachVoice } from '../ai/coachVoice';

/** Metering dB (about −60 silence … 0 loud) to the app's −2 … 10 level scale. */
export const levelFromDb = (db: number) => Math.max(-2, Math.min(10, (db + 45) / 3.5));

export function useLoudness(onLevel: (level: number, at: number) => void) {
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true });
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cb = useRef(onLevel);
  cb.current = onLevel;

  const stop = useCallback(async () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setListening(false);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // not recording
    }
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // ignore
    }
  }, [recorder]);

  const start = useCallback(async () => {
    setError(null);
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone access was not allowed. You can allow it in Android settings.');
      return false;
    }
    coachVoice.stop();
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setError('The microphone could not start. Close other apps using it and try again.');
      return false;
    }
    setListening(true);
    timer.current = setInterval(() => {
      const st = recorder.getStatus();
      if (typeof st.metering === 'number') cb.current(levelFromDb(st.metering), Date.now());
    }, 100);
    return true;
  }, [recorder]);

  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => () => void stopRef.current(), []);

  return { listening, error, start, stop };
}
