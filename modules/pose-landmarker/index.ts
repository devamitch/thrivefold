import { requireNativeModule, requireNativeView } from 'expo';
import type React from 'react';
import { Platform, type NativeSyntheticEvent, type ViewProps } from 'react-native';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  timestamp: number;
  /** Wall-clock ms (Date.now() clock) when the camera captured the analysed frame. */
  capturedAt?: number;
  /** Flat [x, y, z, visibility] * 33, normalised to the frame; empty when nobody is in view. */
  points: number[];
  /** Size of the analysed (upright, mirrored for the front camera) frame, for overlay mapping. */
  frameWidth: number;
  frameHeight: number;
  /** Selected face points as flat [x, y, ...] in FACE_INDICES order; empty when off or no face. */
  face?: number[];
  /** Up to two hands, each flat [x, y] * 21 (MediaPipe hand order); empty when off. */
  hands?: number[][];
  /** Top canned gesture for each hand in `hands`, same order (MediaPipe gesture recognizer). */
  gestures?: { name: HandGestureName; score: number }[];
}

export type HandGestureName = 'None' | 'Closed_Fist' | 'Open_Palm' | 'Pointing_Up' | 'Thumb_Down' | 'Thumb_Up' | 'Victory' | 'ILoveYou';

/** The flat `points` array as landmark objects (for rep counting). */
export function landmarksOf(points: number[] | undefined): PoseLandmark[] {
  if (!points || points.length < 4) return [];
  const out: PoseLandmark[] = new Array(points.length / 4);
  for (let i = 0; i < out.length; i++) {
    out[i] = { x: points[i * 4], y: points[i * 4 + 1], z: points[i * 4 + 2], visibility: points[i * 4 + 3] };
  }
  return out;
}

/** Slices of `face`, by point count, in the order the native view sends them. */
export const FACE_GROUPS = {
  leftEye: [0, 16],
  rightEye: [16, 32],
  irises: [32, 42],
  leftBrow: [42, 52],
  rightBrow: [52, 62],
  lips: [62, 82],
  outline: [82, 118],
} as const;

/** MediaPipe hand bones (21 points). */
export const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export interface PoseCameraViewProps extends ViewProps {
  active: boolean;
  facing?: 'front' | 'back';
  /** Also track the face (eyes, irises, brows, lips, outline). */
  face?: boolean;
  /** Also track up to two hands. */
  hands?: boolean;
  /** Minimum ms between analysed frames (0 = as fast as the model runs). Raise it when idle. */
  minIntervalMs?: number;
  onPose?: (event: NativeSyntheticEvent<PoseFrame>) => void;
  onPoseError?: (event: NativeSyntheticEvent<{ code: string; message: string }>) => void;
  /** Models are loaded (in the background) and tracking is live. */
  onPoseReady?: (event: NativeSyntheticEvent<{ delegate: 'gpu' | 'cpu' }>) => void;
}

interface PoseLandmarkerNative {
  isAvailable(): boolean;
  modelVersion(): string;
}

const native: PoseLandmarkerNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<PoseLandmarkerNative>('PoseLandmarker');
        } catch {
          return null;
        }
      })()
    : null;

export const PoseCameraView: React.ComponentType<PoseCameraViewProps> | null = native
  ? requireNativeView<PoseCameraViewProps>('PoseLandmarker')
  : null;

/** True when this build has the native adapter and its model. */
export const poseLandmarkerAvailable = (): boolean => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
};

export const poseModelVersion = (): string | null => native?.modelVersion() ?? null;
