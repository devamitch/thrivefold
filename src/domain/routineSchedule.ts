import { routineTimes, type Routine } from './routines';

type Schedulable = Pick<Routine, 'time' | 'days' | 'everyHours' | 'until'>;

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Next moment this routine fires after `from` (local time). Null if it never does. */
export function nextTrigger(r: Schedulable, from: Date = new Date()): Date | null {
  const times = routineTimes(r);
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    const iso = ((day.getDay() + 6) % 7) + 1; // 1 = Mon … 7 = Sun
    if (r.days.length && !r.days.includes(iso)) continue;
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      const candidate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
      if (candidate.getTime() > from.getTime()) return candidate;
    }
  }
  return null;
}

/** "in 12 min", "in 2h 10m", "in 3 days". */
export function formatCountdown(target: Date, from: Date = new Date()): string {
  const mins = Math.max(0, Math.round((target.getTime() - from.getTime()) / 60000));
  if (mins < 1) return 'in under a minute';
  if (mins < 60) return `in ${mins} min`;
  if (mins < 24 * 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `in ${h}h ${m}m` : `in ${h}h`;
  }
  const d = Math.round(mins / (24 * 60));
  return `in ${d} day${d === 1 ? '' : 's'}`;
}

/** Minutes from bedtime to wake time, crossing midnight (10:30 PM → 6:30 AM = 480). */
export function overnightMinutes(bed: string, wake: string): number {
  const diff = toMin(wake) - toMin(bed);
  return diff <= 0 ? diff + 24 * 60 : diff;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** True when two day lists can fire on the same weekday (empty = every day). */
export function daysOverlap(a: number[], b: number[]): boolean {
  if (!a.length || !b.length) return true;
  return a.some((d) => b.includes(d));
}

export const byTimeOfDay = <T extends { time: string }>(list: T[]): T[] =>
  [...list].sort((x, y) => toMin(x.time) - toMin(y.time));
