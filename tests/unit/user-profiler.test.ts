import {
  determineChronotype,
  evaluateMindset,
  profileUserBehavior,
  type CheckInRecord,
} from '../../src/domain/ai/userProfiler';

describe('userProfiler', () => {
  test('determines morning chronotype correctly', () => {
    const timestamps = [
      '2026-10-20T07:15:00.000Z',
      '2026-10-21T08:30:00.000Z',
      '2026-10-22T06:45:00.000Z',
      '2026-10-23T14:00:00.000Z',
    ];
    const chronotype = determineChronotype(timestamps);
    expect(chronotype).toBe('morning_riser');
  });

  test('determines evening chronotype when majority are after 6 PM', () => {
    const timestamps = [
      '2026-10-20T19:15:00.000Z',
      '2026-10-21T20:30:00.000Z',
      '2026-10-22T21:45:00.000Z',
    ];
    const chronotype = determineChronotype(timestamps);
    expect(chronotype).toBe('evening_unwinder');
  });

  test('evaluates mindset as restorative_recovery when stress is high', () => {
    const checkIns: CheckInRecord[] = [
      { date: '2026-10-22', timestamp: '2026-10-22T09:00:00Z', mood: 2, energy: 2, stress: 4 },
      { date: '2026-10-23', timestamp: '2026-10-23T09:00:00Z', mood: 3, energy: 2, stress: 4 },
    ];
    const result = evaluateMindset(checkIns);
    expect(result.mindset).toBe('restorative_recovery');
    expect(result.avgStress).toBe(4);
  });

  test('evaluates mindset as thriving_flow when energy and mood are high and stress is low', () => {
    const checkIns: CheckInRecord[] = [
      { date: '2026-10-22', timestamp: '2026-10-22T09:00:00Z', mood: 5, energy: 4, stress: 1 },
      { date: '2026-10-23', timestamp: '2026-10-23T09:00:00Z', mood: 4, energy: 4, stress: 2 },
    ];
    const result = evaluateMindset(checkIns);
    expect(result.mindset).toBe('thriving_flow');
  });

  test('profiles full user behavior with sensible defaults on empty input', () => {
    const profile = profileUserBehavior({});
    expect(profile.chronotype).toBe('balanced');
    expect(profile.mindset).toBe('fresh_baseline');
    expect(profile.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(profile.primeActivityWindow).toBeDefined();
    expect(profile.actionableNudge).toBeTruthy();
  });
});
