jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (s: any) => s },
}));

jest.mock('react-native-reanimated', () => ({
  useReducedMotion: () => false,
}));

jest.mock('pose-landmarker', () => ({
  PoseCameraView: 'PoseCameraView',
  poseLandmarkerAvailable: () => true,
  landmarksOf: () => [],
}));

import { getBetaSettings, saveBetaSettings, resetBetaSettings } from '../../src/features/beta-lab/flags/betaFlags';
import { isMotionBlurSupported, MotionBlurAdapter } from '../../src/features/beta-lab/experiments/motion-blur/MotionBlurAdapter';
import { isPoseEngineAvailable } from '../../src/features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';

describe('Beta Lab & Flag Isolation', () => {
  beforeEach(() => {
    resetBetaSettings();
  });

  test('default beta settings has safe defaults and beta off', () => {
    const s = getBetaSettings();
    expect(s.poseEngine).toBe('default');
    expect(s.motionBlurEnabled).toBe(false);
    expect(s.motionBlurIntensity).toBe(0.5);
    expect(s.showDiagnostics).toBe(false);
  });

  test('saveBetaSettings updates and persists flags', () => {
    saveBetaSettings({ motionBlurEnabled: true, poseEngine: 'experimental' });
    const s = getBetaSettings();
    expect(s.motionBlurEnabled).toBe(true);
    expect(s.poseEngine).toBe('experimental');
  });

  test('resetBetaSettings restores initial defaults', () => {
    saveBetaSettings({ motionBlurEnabled: true, motionBlurIntensity: 0.9 });
    const reset = resetBetaSettings();
    expect(reset.motionBlurEnabled).toBe(false);
    expect(reset.motionBlurIntensity).toBe(0.5);
  });

  test('MotionBlurAdapter is defined and safely handles fallback', () => {
    expect(MotionBlurAdapter).toBeDefined();
    // In node/test environment without native module, it returns false
    expect(isMotionBlurSupported()).toBe(false);
  });

  test('Pose engine availability checks return valid booleans', () => {
    expect(typeof isPoseEngineAvailable('default')).toBe('boolean');
    expect(typeof isPoseEngineAvailable('experimental')).toBe('boolean');
  });
});
