import {
  dailySteps,
  mergeReadings,
  phoneStepReadings,
  stepsByDate,
} from '../../src/domain/interop/readings';
import { getEqualizerBars } from '../../src/domain/analytics/dashboardAnalytics';

describe('phone step readings', () => {
  it('maps device days to stable phone_sensor readings with provenance', () => {
    const [r] = phoneStepReadings([
      { date: '2026-10-28', steps: 4210.4, estimated: 300, since: 1_700_000_000_000 },
    ]);
    expect(r).toMatchObject({
      key: 'phone_sensor:steps:2026-10-28',
      source: 'phone_sensor',
      kind: 'steps',
      value: 4210,
      estimated: 300,
      since: 1_700_000_000_000,
    });
  });

  it('re-syncing a day replaces it instead of duplicating', () => {
    const a = phoneStepReadings([{ date: '2026-10-28', steps: 100, estimated: 0, since: null }]);
    const b = phoneStepReadings([{ date: '2026-10-28', steps: 250, estimated: 0, since: null }]);
    const merged = mergeReadings(a, b, 120, new Date('2026-10-28T12:00:00'));
    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe(250);
  });

  it('never adds Health Connect and phone steps for the same day; the larger wins', () => {
    const readings = [
      ...phoneStepReadings([{ date: '2026-10-28', steps: 5000, estimated: 0, since: null }]),
      ...dailySteps([{ startTime: '2026-10-28T09:00:00', count: 6200 }]),
      ...phoneStepReadings([{ date: '2026-10-27', steps: 3000, estimated: 0, since: null }]),
    ];
    const by = stepsByDate(readings);
    expect(by.get('2026-10-28')).toMatchObject({ value: 6200, source: 'health_connect' });
    expect(by.get('2026-10-27')).toMatchObject({ value: 3000, source: 'phone_sensor' });

    const bars = getEqualizerBars(readings, 'steps', new Date('2026-10-28T12:00:00'));
    expect(bars.find((b) => b.isToday)?.value).toBe(6200);
  });
});

import { dailyVitals } from '../../src/domain/interop/readings';

describe('device vitals', () => {
  it('keeps the latest reading per day with min/max, and drops implausible values', () => {
    const r = dailyVitals('spo2_pct', [
      { time: '2026-10-28T07:00:00', value: 95 },
      { time: '2026-10-28T22:00:00', value: 98 },
      { time: '2026-10-28T12:00:00', value: 140 },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ kind: 'spo2_pct', value: 98, min: 95, max: 98, samples: 2, unit: '%' });
  });
});
