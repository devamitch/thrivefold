/**
 * Readings imported from connected sources (Health Connect, a Bluetooth heart-rate strap),
 * normalised to one shape and reduced to daily values. Pure; no native code.
 */

export type ReadingSource = 'health_connect' | 'ble_heart_rate' | 'phone_sensor';
export type ReadingKind =
  | 'steps'
  | 'sleep_minutes'
  | 'heart_rate_avg'
  | 'weight_kg'
  | 'exercise_minutes'
  | VitalKind;

/** Spot measurements that only a dedicated device (watch, ring, oximeter, cuff, meter) provides. */
export type VitalKind =
  | 'spo2_pct'
  | 'resting_hr'
  | 'hrv_ms'
  | 'respiratory_rate'
  | 'bp_systolic'
  | 'bp_diastolic'
  | 'glucose_mmol';

export interface DeviceReading {
  /** Stable per source, kind and date so a re-sync replaces instead of duplicating. */
  key: string;
  source: ReadingSource;
  kind: ReadingKind;
  date: string; // YYYY-MM-DD (local)
  value: number;
  unit: 'count' | 'min' | 'bpm' | 'kg' | '%' | 'ms' | 'brpm' | 'mmHg' | 'mmol/L';
  /** For heart rate: lowest and highest sample of the day. */
  min?: number;
  max?: number;
  samples?: number;
  /** Phone steps: the part split across a long sampling gap (an estimate). */
  estimated?: number;
  /** Phone steps: tracking began partway through this day (ms since epoch). */
  since?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
export const localDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const minutesBetween = (start: string, end: string) => Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000));

const key = (source: ReadingSource, kind: ReadingKind, date: string) => `${source}:${kind}:${date}`;

export function dailySteps(records: { startTime: string; count: number }[]): DeviceReading[] {
  const by = new Map<string, number>();
  for (const r of records) by.set(localDate(r.startTime), (by.get(localDate(r.startTime)) ?? 0) + r.count);
  return [...by].map(([date, value]) => ({ key: key('health_connect', 'steps', date), source: 'health_connect', kind: 'steps', date, value, unit: 'count' }));
}

/** Sleep is attributed to the date the person woke up. */
export function nightlySleep(records: { startTime: string; endTime: string }[]): DeviceReading[] {
  const by = new Map<string, number>();
  for (const r of records) by.set(localDate(r.endTime), (by.get(localDate(r.endTime)) ?? 0) + minutesBetween(r.startTime, r.endTime));
  return [...by].map(([date, value]) => ({ key: key('health_connect', 'sleep_minutes', date), source: 'health_connect', kind: 'sleep_minutes', date, value, unit: 'min' }));
}

export function dailyHeartRate(
  samples: { time: string; beatsPerMinute: number }[],
  source: ReadingSource = 'health_connect',
): DeviceReading[] {
  const by = new Map<string, number[]>();
  for (const s of samples) {
    if (!(s.beatsPerMinute > 20 && s.beatsPerMinute < 250)) continue;
    const d = localDate(s.time);
    by.set(d, [...(by.get(d) ?? []), s.beatsPerMinute]);
  }
  return [...by].map(([date, v]) => ({
    key: key(source, 'heart_rate_avg', date),
    source,
    kind: 'heart_rate_avg',
    date,
    value: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
    unit: 'bpm',
    min: Math.min(...v),
    max: Math.max(...v),
    samples: v.length,
  }));
}

export function latestWeights(records: { time: string; weight: { inKilograms?: number } }[]): DeviceReading[] {
  const by = new Map<string, { t: number; kg: number }>();
  for (const r of records) {
    const kg = r.weight.inKilograms;
    if (!kg || kg <= 0) continue;
    const d = localDate(r.time);
    const t = Date.parse(r.time);
    if (!by.has(d) || by.get(d)!.t < t) by.set(d, { t, kg });
  }
  return [...by].map(([date, { kg }]) => ({
    key: key('health_connect', 'weight_kg', date),
    source: 'health_connect',
    kind: 'weight_kg',
    date,
    value: Math.round(kg * 10) / 10,
    unit: 'kg',
  }));
}

export function dailyExercise(records: { startTime: string; endTime: string }[]): DeviceReading[] {
  const by = new Map<string, number>();
  for (const r of records) by.set(localDate(r.startTime), (by.get(localDate(r.startTime)) ?? 0) + minutesBetween(r.startTime, r.endTime));
  return [...by].map(([date, value]) => ({
    key: key('health_connect', 'exercise_minutes', date),
    source: 'health_connect',
    kind: 'exercise_minutes',
    date,
    value,
    unit: 'min',
  }));
}

/** Newer readings replace older ones with the same key; everything else is kept. */
const VITAL_UNIT: Record<VitalKind, DeviceReading['unit']> = {
  spo2_pct: '%',
  resting_hr: 'bpm',
  hrv_ms: 'ms',
  respiratory_rate: 'brpm',
  bp_systolic: 'mmHg',
  bp_diastolic: 'mmHg',
  glucose_mmol: 'mmol/L',
};

/** Values outside these bounds are device or entry errors and are dropped, never clamped. */
const VITAL_RANGE: Record<VitalKind, [number, number]> = {
  spo2_pct: [50, 100],
  resting_hr: [25, 200],
  hrv_ms: [1, 400],
  respiratory_rate: [4, 60],
  bp_systolic: [60, 260],
  bp_diastolic: [30, 160],
  glucose_mmol: [1, 35],
};

/** Per day: the latest measurement, with the day's lowest, highest and sample count. */
export function dailyVitals(kind: VitalKind, samples: { time: string; value: number }[]): DeviceReading[] {
  const [lo, hi] = VITAL_RANGE[kind];
  const by = new Map<string, { t: number; v: number; min: number; max: number; n: number }>();
  for (const s of samples) {
    if (!(s.value >= lo && s.value <= hi)) continue;
    const d = localDate(s.time);
    const t = Date.parse(s.time);
    const cur = by.get(d);
    if (!cur) by.set(d, { t, v: s.value, min: s.value, max: s.value, n: 1 });
    else {
      cur.min = Math.min(cur.min, s.value);
      cur.max = Math.max(cur.max, s.value);
      cur.n += 1;
      if (t > cur.t) {
        cur.t = t;
        cur.v = s.value;
      }
    }
  }
  const round = (v: number) => (kind === 'glucose_mmol' ? Math.round(v * 10) / 10 : Math.round(v));
  return [...by].map(([date, r]) => ({
    key: key('health_connect', kind, date),
    source: 'health_connect',
    kind,
    date,
    value: round(r.v),
    unit: VITAL_UNIT[kind],
    min: round(r.min),
    max: round(r.max),
    samples: r.n,
  }));
}

/** Daily totals from the phone's own step counter. `estimated` carries the time-split share. */
export function phoneStepReadings(
  days: { date: string; steps: number; estimated: number; since: number | null }[],
): DeviceReading[] {
  return days
    .filter((d) => Number.isFinite(d.steps) && d.steps >= 0)
    .map((d) => ({
      key: key('phone_sensor', 'steps', d.date),
      source: 'phone_sensor' as const,
      kind: 'steps' as const,
      date: d.date,
      value: Math.round(d.steps),
      unit: 'count' as const,
      estimated: d.estimated > 0 ? Math.round(d.estimated) : undefined,
      since: d.since ?? undefined,
    }));
}

export interface DailySteps {
  date: string;
  value: number;
  source: ReadingSource;
  /** Part of the value that was split across a long sampling gap. */
  estimated?: number;
  /** Tracking started partway through this day (ms since epoch). */
  since?: number;
}

/**
 * One step total per day across sources. Health Connect and the phone counter often describe
 * the same walk, so they are never added: the larger total wins.
 */
export function stepsByDate(readings: DeviceReading[]): Map<string, DailySteps> {
  const out = new Map<string, DailySteps>();
  for (const r of readings) {
    if (r.kind !== 'steps') continue;
    const cur = out.get(r.date);
    if (!cur || r.value > cur.value) {
      out.set(r.date, { date: r.date, value: r.value, source: r.source, estimated: r.estimated, since: r.since });
    }
  }
  return out;
}

export function mergeReadings(existing: DeviceReading[], incoming: DeviceReading[], keepDays = 120, today = new Date()): DeviceReading[] {
  const map = new Map(existing.map((r) => [r.key, r]));
  for (const r of incoming) map.set(r.key, r);
  const cutoff = today.getTime() - keepDays * 86400000;
  return [...map.values()].filter((r) => Date.parse(`${r.date}T12:00:00`) >= cutoff).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Parses a Bluetooth GATT Heart Rate Measurement (characteristic 0x2A37). Byte 0 holds flags;
 * bit 0 selects an 8- or 16-bit little-endian heart rate value.
 */
export function parseHeartRateMeasurement(bytes: Uint8Array): number | null {
  if (bytes.length < 2) return null;
  const sixteenBit = (bytes[0] & 0x01) === 1;
  if (sixteenBit) {
    if (bytes.length < 3) return null;
    return bytes[1] | (bytes[2] << 8);
  }
  return bytes[1];
}

/** Base64 (as delivered by react-native-ble-plx) to bytes, without Node Buffer. */
export function base64ToBytes(b64: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const c of clean) {
    buffer = (buffer << 6) | alphabet.indexOf(c);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}
