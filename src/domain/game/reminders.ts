/**
 * Which quest reminders to schedule today. Pure: one reminder per part of the day that still
 * has an open quest, at a fixed hour, only in the future and never inside quiet hours.
 * Reminder text is deliberately generic (spec §10: lock screens never show health details).
 */
import { bestDayPart, type DayPart } from './timeOfDay';

export const REMINDER_HOUR: Record<Exclude<DayPart, 'night'>, number> = { morning: 8, midday: 13, evening: 19 };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function inQuietHours(minutes: number, start: string, end: string): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return s <= e ? minutes >= s && minutes < e : minutes >= s || minutes < e;
}

export interface PlannedReminder {
  part: DayPart;
  at: Date;
  title: string;
  body: string;
}

export function plannedReminders(
  openQuests: { category: string; title: string; description?: string }[],
  now: Date,
  quiet: { enabled: boolean; start: string; end: string },
): PlannedReminder[] {
  const parts = new Set(openQuests.map((q) => bestDayPart({ category: q.category, title: q.title, shortDescription: q.description })));
  const out: PlannedReminder[] = [];
  for (const [part, hour] of Object.entries(REMINDER_HOUR) as [Exclude<DayPart, 'night'>, number][]) {
    if (!parts.has(part)) continue;
    const at = new Date(now);
    at.setHours(hour, 0, 0, 0);
    if (at <= now) continue;
    if (quiet.enabled && inQuietHours(hour * 60, quiet.start, quiet.end)) continue;
    const count = openQuests.filter((q) => bestDayPart({ category: q.category, title: q.title, shortDescription: q.description }) === part).length;
    out.push({
      part,
      at,
      title: 'Thrivefold',
      body: count === 1 ? `One small step is ready for this ${part === 'midday' ? 'afternoon' : part}.` : `${count} small steps are ready for this ${part === 'midday' ? 'afternoon' : part}.`,
    });
  }
  return out;
}
