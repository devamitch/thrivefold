jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItem: jest.fn(() => null),
  setItem: jest.fn(() => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn(() => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])),
}));

import { EyeTrackerSession } from '../../src/domain/vision/eyeTracker';
import {
  drainRate,
  DRAIN,
  RECHARGE,
  eyeBatteryManager,
} from '../../src/domain/vision/eyeBattery';
import {
  estimateDistanceCm,
  estimateDownwardGazeAngle,
  evaluateErgonomics,
  HARMON_MIN_CM,
  HARMON_MAX_CM,
} from '../../src/domain/vision/readingErgonomics';
import { EyeAlertEngine, type EyeAlert } from '../../src/domain/vision/eyeAlerts';

describe('BlinkQuest Eye Metrics & Ergonomics Engine', () => {
  describe('1. Eye Battery Drain & Recharge Heuristics', () => {
    it('applies base drain when staring without strain', () => {
      const { perMin, drivers } = drainRate({
        blinkRatePerMin: 16,
        distanceCm: 42,
        isClosed: false,
      });
      expect(perMin).toBeCloseTo(DRAIN.base);
      expect(drivers.length).toBe(1);
      expect(drivers[0].id).toBe('base');
    });

    it('amplifies drain rate for low blink frequency and close screen distance', () => {
      const { perMin, drivers } = drainRate({
        blinkRatePerMin: 6,
        distanceCm: 22,
        isClosed: false,
      });
      expect(perMin).toBeCloseTo(DRAIN.base + DRAIN.lowBlink + DRAIN.tooClose);
      expect(drivers.some((d) => d.id === 'lowBlink')).toBe(true);
      expect(drivers.some((d) => d.id === 'tooClose')).toBe(true);
    });

    it('recharges daily eye energy when completing guided routines', () => {
      const initial = eyeBatteryManager.getState();
      eyeBatteryManager.recharge('blink');
      const updated = eyeBatteryManager.getState();
      expect(updated.level).toBeGreaterThanOrEqual(initial.level);
    });
  });

  describe('2. Reading Ergonomics & Harmon Distance', () => {
    it('estimates optical screen distance from interpupillary span', () => {
      // Normal IPD span (~0.16) corresponds to ~40cm
      const dist40 = estimateDistanceCm(0.42, 0.5, 0.58, 0.5);
      expect(dist40).toBeGreaterThanOrEqual(35);
      expect(dist40).toBeLessThanOrEqual(45);

      // Wider normalized span indicates device held very close (<25cm)
      const distClose = estimateDistanceCm(0.35, 0.5, 0.65, 0.5);
      expect(distClose).toBeLessThan(25);
    });

    it('calculates downward gaze inclination angle to prevent dry eye', () => {
      // When pupil is slightly lower than eye center, reading angle is 15-25 deg
      const angle = estimateDownwardGazeAngle(0.5, 0.51, 0.05);
      expect(angle).toBeGreaterThanOrEqual(15);
      expect(angle).toBeLessThanOrEqual(30);
    });

    it('correctly classifies Harmon reading distance zones', () => {
      const tooClose = evaluateErgonomics(24, 18, 15);
      expect(tooClose.isTooClose).toBe(true);
      expect(tooClose.harmonZone).toBe('too_close');

      const optimal = evaluateErgonomics(40, 18, 15);
      expect(optimal.isTooClose).toBe(false);
      expect(optimal.harmonZone).toBe('optimal');
      expect(optimal.fatigueScore).toBeGreaterThanOrEqual(85);

      const far = evaluateErgonomics(55, 18, 15);
      expect(far.harmonZone).toBe('far');
    });
  });

  describe('3. Non-nagging Eye Alert Engine', () => {
    it('triggers too_close alert only after sustained threshold hold', () => {
      const alerts: EyeAlert[] = [];
      const engine = new EyeAlertEngine((a) => alerts.push(a));
      const t0 = 1_000_000;

      // Frame at t = 0
      engine.evaluate({
        now: t0,
        tracked: true,
        distanceCm: 22,
        blinksPerMin: 15,
        continuousMs: 0,
        batteryLevel: 90,
      });
      expect(alerts.length).toBe(0); // Not sustained yet

      // Frame at t = 16 seconds (threshold is 15s)
      engine.evaluate({
        now: t0 + 16_000,
        tracked: true,
        distanceCm: 22,
        blinksPerMin: 15,
        continuousMs: 16_000,
        batteryLevel: 90,
      });
      expect(alerts.length).toBe(1);
      expect(alerts[0].id).toBe('too_close');

      // Subsequent frame respects 3-minute cooldown
      engine.evaluate({
        now: t0 + 20_000,
        tracked: true,
        distanceCm: 22,
        blinksPerMin: 15,
        continuousMs: 20_000,
        batteryLevel: 90,
      });
      expect(alerts.length).toBe(1); // No duplicate alert
    });
  });

  describe('4. EyeTrackerSession Integration', () => {
    it('initializes with neutral baseline state', () => {
      const session = new EyeTrackerSession();
      const state = session.processFace(undefined);
      expect(state.isOpen).toBe(true);
      expect(state.blinkCount).toBe(0);
      expect(state.tracked).toBe(false);
      expect(state.distanceCm).toBe(0);
      expect(state.harmonZone).toBe('optimal');
      expect(state.batteryLevel).toBeGreaterThan(0);
    });
  });
});
