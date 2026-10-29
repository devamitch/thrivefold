import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface PitchEvent {
  /** Loudness in dBFS (about −90 silence … 0 full scale). */
  db: number;
  /** Fundamental frequency in Hz from YIN; 0 when unvoiced. */
  hz: number;
  at: number;
}
export interface SoundEvent {
  categories: { label: string; score: number }[];
  at: number;
}

type Sub = { remove: () => void };
interface AudioSenseNative {
  isAvailable(): boolean;
  start(classify: boolean): boolean;
  stop(): void;
  addListener(event: 'onPitch', cb: (e: PitchEvent) => void): Sub;
  addListener(event: 'onSound', cb: (e: SoundEvent) => void): Sub;
  addListener(event: 'onAudioError', cb: (e: { message: string }) => void): Sub;
}

export const AudioSense: AudioSenseNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<AudioSenseNative>('AudioSense');
        } catch {
          return null;
        }
      })()
    : null;
