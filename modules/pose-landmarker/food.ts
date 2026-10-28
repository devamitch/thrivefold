import { requireNativeModule, requireNativeView } from 'expo';
import type React from 'react';
import { Platform, type NativeSyntheticEvent, type ViewProps } from 'react-native';

export interface VisionLabel {
  label: string;
  score: number;
}

export interface FoodCameraHandle {
  /** Takes a photo; resolves with a file:// URI in the app cache. */
  capture(): Promise<string>;
}

export interface FoodCameraViewProps extends ViewProps {
  active: boolean;
  onLabels?: (event: NativeSyntheticEvent<{ labels: VisionLabel[] }>) => void;
  onFoodReady?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
  onFoodError?: (event: NativeSyntheticEvent<{ code: string; message: string }>) => void;
  ref?: React.Ref<FoodCameraHandle>;
}

interface FoodVisionNative {
  isAvailable(): boolean;
  classifyImage(uri: string): Promise<VisionLabel[]>;
}

const native: FoodVisionNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<FoodVisionNative>('FoodVision');
        } catch {
          return null;
        }
      })()
    : null;

/** Live back-camera preview that names what it sees, on the device. Null where unsupported. */
export const FoodCameraView: React.ComponentType<FoodCameraViewProps> | null = native
  ? requireNativeView<FoodCameraViewProps>('FoodVision')
  : null;

export const foodVisionAvailable = (): boolean => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
};

/** On-device labels for a saved photo; empty when unavailable or the photo can't be read. */
export async function classifyImage(uri: string): Promise<VisionLabel[]> {
  if (!native) return [];
  try {
    return await native.classifyImage(uri);
  } catch {
    return [];
  }
}
