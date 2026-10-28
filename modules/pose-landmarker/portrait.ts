import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

/** Numbers measured from one photo on the device (see PortraitVisionModule.kt). */
export interface PortraitAnalysis {
  width: number;
  height: number;
  /** Full face mesh, flat [x, y, z] * 478 normalised to the photo; empty when no face. */
  face: number[];
  /** Body pose, flat [x, y, visibility] * 33; empty when no person. */
  pose: number[];
  segmentation: {
    /** Share of the photo per class: background, hair, body skin, face skin, clothes, accessories. */
    shares?: number[];
    /** Body width (fraction of photo width) through the centre line at 64 evenly spaced heights. */
    widths?: number[];
    hair?: [number, number, number] | null;
    clothesTop?: [number, number, number] | null;
    clothesBottom?: [number, number, number] | null;
  };
}

interface PortraitVisionNative {
  isAvailable(): boolean;
  analyzePortrait(uri: string): Promise<PortraitAnalysis>;
}

const native: PortraitVisionNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<PortraitVisionNative>('PortraitVision');
        } catch {
          return null;
        }
      })()
    : null;

export const portraitVisionAvailable = (): boolean => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
};

export async function analyzePortrait(uri: string): Promise<PortraitAnalysis> {
  if (!native) throw new Error('Photo analysis is not available on this device');
  return native.analyzePortrait(uri);
}
