import { buildFhirBundle, fhirGender } from '../../src/domain/interop/fhir';
import {
  base64ToBytes,
  dailyHeartRate,
  dailySteps,
  latestWeights,
  mergeReadings,
  nightlySleep,
  parseHeartRateMeasurement,
} from '../../src/domain/interop/readings';

describe('Health Connect normalisation', () => {
  test('steps are summed per local day and sleep counts on the wake-up day', () => {
    const steps = dailySteps([
      { startTime: '2026-10-23T08:00:00', count: 1200 },
      { startTime: '2026-10-23T18:00:00', count: 3000 },
    ]);
    expect(steps).toEqual([expect.objectContaining({ date: '2026-10-23', value: 4200, kind: 'steps' })]);
    const sleep = nightlySleep([{ startTime: '2026-10-22T23:00:00', endTime: '2026-10-23T06:30:00' }]);
    expect(sleep[0]).toMatchObject({ date: '2026-10-23', value: 450 });
  });

  test('heart rate drops implausible samples and keeps min/avg/max', () => {
    const hr = dailyHeartRate([
      { time: '2026-10-23T09:00:00', beatsPerMinute: 60 },
      { time: '2026-10-23T09:05:00', beatsPerMinute: 80 },
      { time: '2026-10-23T09:06:00', beatsPerMinute: 0 },
    ]);
    expect(hr[0]).toMatchObject({ value: 70, min: 60, max: 80, samples: 2 });
  });

  test('latest weight of the day wins, and re-syncing replaces instead of duplicating', () => {
    const w = latestWeights([
      { time: '2026-10-23T07:00:00', weight: { inKilograms: 70.04 } },
      { time: '2026-10-23T20:00:00', weight: { inKilograms: 70.6 } },
    ]);
    expect(w[0].value).toBe(70.6);
    const merged = mergeReadings(w, [{ ...w[0], value: 71 }], 120, new Date('2026-10-24T00:00:00'));
    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe(71);
  });
});

describe('Bluetooth heart rate (GATT 0x2A37)', () => {
  test('8-bit and 16-bit values', () => {
    expect(parseHeartRateMeasurement(new Uint8Array([0x00, 72]))).toBe(72);
    expect(parseHeartRateMeasurement(new Uint8Array([0x01, 0x2c, 0x01]))).toBe(300);
    expect(parseHeartRateMeasurement(new Uint8Array([0x00]))).toBeNull();
  });
  test('base64 decoding from the BLE library', () => {
    expect(Array.from(base64ToBytes('AEg='))).toEqual([0x00, 0x48]);
  });
});

describe('FHIR R4 export', () => {
  const bundle = buildFhirBundle({
    patientId: 'user_1',
    displayName: 'Amit',
    gender: fhirGender('Female'),
    checkIns: [{ date: '2026-10-23', energy: 6, mood: 7, stress: 4, sleepHours: 7.5, symptoms: ['Headache'] }],
    periods: [{ startDate: '2026-10-01' }],
    medications: [{ name: 'Vitamin D', dose: '1 tablet', time: '08:00' }],
    workouts: [{ date: '2026-10-22', startedAt: '2026-10-22T10:00:00Z', finishedAt: '2026-10-22T10:30:00Z', planId: 'home_beginner' }],
    activities: [{ date: '2026-10-23', type: 'Running', minutes: 25, distanceKm: 4 }],
    readings: [{ key: 'k', source: 'health_connect', kind: 'steps', date: '2026-10-23', value: 8000, unit: 'count' }],
    generatedAt: '2026-10-24T00:00:00Z',
  });

  test('is a collection bundle with a patient and typed resources', () => {
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    const types = bundle.entry.map((e) => e.resource.resourceType);
    expect(types[0]).toBe('Patient');
    expect(types).toContain('MedicationStatement');
    expect(bundle.entry[0].resource.gender).toBe('female');
  });

  test('uses LOINC for standard measures and a separate system for self-reports', () => {
    const codes = bundle.entry
      .map((e) => (e.resource.code as { coding: { system: string; code: string }[] } | undefined)?.coding[0])
      .filter(Boolean) as { system: string; code: string }[];
    expect(codes).toEqual(
      expect.arrayContaining([
        { system: 'http://loinc.org', code: '93832-4', display: 'Sleep duration' },
        expect.objectContaining({ system: 'http://loinc.org', code: '41950-7' }),
        expect.objectContaining({ system: 'http://loinc.org', code: '8665-2' }),
        expect.objectContaining({ system: 'https://thrivefold.app/fhir/CodeSystem/self-report', code: 'mood' }),
      ]),
    );
    const ids = bundle.entry.map((e) => `${e.resource.resourceType}/${e.resource.id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
