import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface DetectedObject {
  label: string;
  score: number;
  /** [left, top, right, bottom], normalised to the photo. */
  box: [number, number, number, number];
}

interface ToolsNative {
  detectObjects(uri: string): Promise<DetectedObject[]>;
  cutout(uri: string, x: number, y: number): Promise<{ uri: string; coverage: number }>;
  embedImage(uri: string): Promise<number[]>;
  detectLanguage(text: string): Promise<{ code: string; score: number }[]>;
  embedText(texts: string[]): Promise<number[][]>;
  classifyText(text: string): Promise<{ label: string; score: number }[]>;
}

/** On-device MediaPipe tasks (object detection, cutout, embeddings, language, text). Null off Android. */
export const MediaPipeTools: ToolsNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<ToolsNative>('MediaPipeTools');
        } catch {
          return null;
        }
      })()
    : null;

/** Cosine similarity of two L2-normalised vectors. */
export const cosine = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
