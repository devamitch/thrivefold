/**
 * Routines: things the person wants a nudge for at set times (water, check-in, wind-down, stretch,
 * journal, walk, or anything typed). Pure: building notification times and parsing "remind me…".
 */
export type RoutineKind = 'water' | 'checkin' | 'sleep' | 'stretch' | 'journal' | 'walk' | 'custom';

export interface Routine {
  id: string;
  kind: RoutineKind;
  title: string;
  /** "HH:mm" for a fixed time. */
  time: string;
  /** 1 = Monday … 7 = Sunday (Expo weekly trigger); empty = every day. */
  days: number[];
  /** Water-style repeats: every N hours from `time` until `until`. */
  everyHours?: number;
  until?: string;
  enabled: boolean;
  /** Screen opened from the notification. */
  route?: string;
}

export const ROUTINE_PRESETS: Omit<Routine, 'id' | 'enabled'>[] = [
  { kind: 'water', title: 'Drink a glass of water', time: '09:00', days: [], everyHours: 2, until: '21:00', route: '/(app)/health/nutrition' },
  { kind: 'checkin', title: 'Daily check-in', time: '09:30', days: [], route: '/(app)/check-in' },
  { kind: 'stretch', title: 'Stand up and stretch', time: '17:30', days: [1, 2, 3, 4, 5], route: '/(app)/beta-lab/breathing' },
  { kind: 'walk', title: 'Evening walk', time: '18:30', days: [], route: '/(app)/health/activity' },
  { kind: 'journal', title: 'Two lines in your journal', time: '21:00', days: [], route: '/(app)/journal' },
  { kind: 'sleep', title: 'Start winding down for sleep', time: '22:00', days: [], route: '/(app)/health/sleep' },
];

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const isHHMM = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

/** Every time of day this routine fires (one, or a series for "every N hours"). */
export function routineTimes(r: Pick<Routine, 'time' | 'everyHours' | 'until'>): string[] {
  if (!r.everyHours || !r.until) return [r.time];
  const out: string[] = [];
  for (let m = toMin(r.time); m <= toMin(r.until) && out.length < 12; m += r.everyHours * 60) out.push(fromMin(m));
  return out;
}

const DAY_WORDS: Record<string, number[]> = {
  weekday: [1, 2, 3, 4, 5],
  weekend: [6, 7],
  monday: [1], tuesday: [2], wednesday: [3], thursday: [4], friday: [5], saturday: [6], sunday: [7],
};

/** Parses a time like "7", "7:30", "7pm", "19:15", "7.30 am". */
export function parseTime(raw: string): string | null {
  const m = raw.trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3] === 'pm' && h < 12) h += 12;
  if (m[3] === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return fromMin(h * 60 + min);
}

/**
 * "remind me to stretch at 6pm every weekday", "remind me to drink water every 2 hours",
 * "every day at 7:30 remind me to meditate". Null when it isn't a reminder request.
 */
export function parseRoutineRequest(input: string): Omit<Routine, 'id' | 'enabled'> | null {
  const t = input.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!/\bremind me\b|\bset (?:a )?reminder\b|\bnotify me\b/.test(t)) return null;
  const every = t.match(/every (\d{1,2}) hours?/);
  const at = t.match(/\bat (\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/);
  const what = (t.match(/\b(?:to|about) (.+?)(?= at \d| every | on |$)/)?.[1] ?? '').replace(/\b(daily|every day|each day)\b/g, '').trim();
  if (!what) return null;
  let days: number[] = [];
  for (const [word, d] of Object.entries(DAY_WORDS)) if (t.includes(word)) days = [...new Set([...days, ...d])];
  const kind: RoutineKind = /water|drink/.test(what)
    ? 'water'
    : /check.?in/.test(what)
      ? 'checkin'
      : /sleep|bed|wind/.test(what)
        ? 'sleep'
        : /stretch/.test(what)
          ? 'stretch'
          : /journal|write/.test(what)
            ? 'journal'
            : /walk/.test(what)
              ? 'walk'
              : 'custom';
  const title = what.charAt(0).toUpperCase() + what.slice(1);
  if (every) {
    return { kind, title, time: (at && parseTime(at[1])) || '09:00', days, everyHours: Math.max(1, Math.min(6, Number(every[1]))), until: '21:00' };
  }
  const time = at ? parseTime(at[1]) : null;
  if (!time) return null;
  return { kind, title, time, days };
}
