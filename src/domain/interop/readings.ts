/**
 * Readings imported from connected sources (Health Connect, a Bluetooth heart-rate strap),
 * normalised to one shape and reduced to daily values. Pure; no native code.
 */

export type ReadingSource = 'health_connect' | 'ble_heart_rate';
export type ReadingKind = 'steps' | 'sleep_minutes' | 'heart_rate_avg' | 'weight_kg' | 'exercise_minutes';

export interface DeviceReading {
  /** Stable per source, kind and date so a re-sync replaces instead of duplicating. */
  key: string;
  source: ReadingSource;
  kind: ReadingKind;
  date: string; // YYYY-MM-DD (local)
  value: number;
  unit: 'count' | 'min' | 'bpm' | 'kg';
  /** For heart rate: lowest and highest sample of the day. */
  min?: number;
  max?: number;
  samples?: number;
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
