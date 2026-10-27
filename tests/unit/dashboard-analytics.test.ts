import {
  computeVitalityScore,
  getWeeklyTrendPoints,
  getEqualizerBars,
  getWeeklyHydrationBars,
} from '../../src/domain/analytics/dashboardAnalytics';
import type { DailyCheckInRecord } from '../../src/stores/slices/healthSlice';
import type { DeviceReading } from '../../src/domain/interop/readings';

describe('dashboardAnalytics', () => {
  const mockCheckIn: DailyCheckInRecord = {
    id: 'c1',
    date: '2026-10-28',
    energy: 8,
    mood: 9,
    stress: 3,
    sleepHours: 7.5,
    symptoms: [],
  };

  it('computes vitality score accurately when full check-in exists', () => {
    const res = computeVitalityScore({
      todayCheckIn: mockCheckIn,
      recentCheckIns: [mockCheckIn],
      questsDone: 4,
      questsTotal: 4,
      lastSleepMinutes: 450,
    });

    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.tier).toBe('thriving');
    expect(res.hasCheckInToday).toBe(true);
    expect(res.components.energyScore).toBe(80);
    expect(res.components.moodScore).toBe(90);
    expect(res.components.stressBalance).toBe(80); // (11 - 3) * 10
    expect(res.components.questCompletionPct).toBe(100);
  });

  it('incorporates todayHydrationGlasses into vitality score when provided', () => {
    const res = computeVitalityScore({
      todayCheckIn: mockCheckIn,
      recentCheckIns: [mockCheckIn],
      questsDone: 4,
      questsTotal: 4,
      lastSleepMinutes: 450,
      todayHydrationGlasses: 8,
    });

    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.components.hydrationGlasses).toBe(8);
  });

  it('handles empty state gracefully without crashing', () => {
    const res = computeVitalityScore({
      todayCheckIn: null,
      recentCheckIns: [],
      questsDone: 0,
      questsTotal: 0,
      lastSleepMinutes: null,
    });

    expect(res.hasCheckInToday).toBe(false);
    expect(res.tier).toBe('starting_out');
    expect(res.label).toBe('Ready to Begin');
  });

  it('generates 7 trend points ending at reference date', () => {
    const ref = new Date('2026-10-28T12:00:00Z');
    const points = getWeeklyTrendPoints([mockCheckIn], [], ref);

    expect(points).toHaveLength(7);
    const todayPoint = points.find((p) => p.isToday);
    expect(todayPoint).toBeDefined();
    expect(todayPoint?.hasData).toBe(true);
    expect(todayPoint?.energy).toBe(8);
  });

  it('generates 7 equalizer distribution bars for steps', () => {
    const ref = new Date('2026-10-28T12:00:00Z');
    const readings: DeviceReading[] = [
      {
        key: 'health_connect:steps:2026-10-28',
        source: 'health_connect',
        kind: 'steps',
        date: '2026-10-28',
        value: 6500,
        unit: 'count',
      },
    ];

    const bars = getEqualizerBars(readings, 'steps', ref);
    expect(bars).toHaveLength(7);
    const todayBar = bars.find((b) => b.isToday);
    expect(todayBar?.value).toBe(6500);
    expect(todayBar?.displayValue).toBe('6.5k');
    expect(todayBar?.heightPct).toBeGreaterThan(0.5);
  });

  it('generates 7 weekly hydration equalizer bars correctly', () => {
    const ref = new Date('2026-10-28T12:00:00Z');
    const hydration: Record<string, number> = {
      '2026-10-28': 6,
      '2026-10-27': 8,
    };

    const bars = getWeeklyHydrationBars(hydration, ref, 8);
    expect(bars).toHaveLength(7);
    const todayBar = bars.find((b) => b.isToday);
    expect(todayBar?.value).toBe(6);
    expect(todayBar?.displayValue).toBe('6');
    expect(todayBar?.heightPct).toBe(0.75);
  });
});

