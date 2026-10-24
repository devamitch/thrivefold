/**
 * When in the day a quest fits best. Movement suits the morning and midday, food the
 * middle of the day, wind-down and sleep the evening, reflection the evening; learning any
 * daytime. Quests are grouped into "now" and "later" so the list follows the person's day
 * instead of being one undifferentiated pile.
 */
import { questFamily } from './progression';

export type DayPart = 'morning' | 'midday' | 'evening' | 'night';

export const DAY_PART_LABEL: Record<DayPart, string> = {
  morning: 'Morning',
  midday: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export function dayPartAt(date: Date): DayPart {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'midday';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

const ORDER: DayPart[] = ['morning', 'midday', 'evening', 'night'];

const EVENING_WORDS = /sleep|wind[- ]?down|bed|night|evening|reflect|journal|gratitude|review|tomorrow/i;
const MORNING_WORDS = /morning|wake|sunlight|walk|stretch|mobility|energy/i;

/** Best part of the day for a quest, from its category and wording. */
export function bestDayPart(task: { category: string; title: string; shortDescription?: string }): DayPart {
  const text = `${task.title} ${task.shortDescription ?? ''}`;
  if (EVENING_WORDS.test(text)) return 'evening';
  if (MORNING_WORDS.test(text)) return 'morning';
  switch (questFamily(task.category)) {
    case 'movement':
      return 'morning';
    case 'nutrition':
      return 'midday';
    case 'rhythm':
      return 'evening';
    case 'mind':
      return 'evening';
    default:
      return 'midday';
  }
}

/**
 * Splits open quests into what fits now (this part of the day or an earlier one that was
 * missed) and what is for later. Night shows everything still open as "now", so nothing is
 * hidden at the end of the day.
 */
export function splitByTime<T extends { category: string; title: string; description?: string }>(
  quests: T[],
  now: Date,
): { now: T[]; later: { part: DayPart; quests: T[] }[] } {
  const current = ORDER.indexOf(dayPartAt(now));
  const nowList: T[] = [];
  const later = new Map<DayPart, T[]>();
  for (const q of quests) {
    const part = bestDayPart({ category: q.category, title: q.title, shortDescription: q.description });
    if (current === ORDER.length - 1 || ORDER.indexOf(part) <= current) nowList.push(q);
    else later.set(part, [...(later.get(part) ?? []), q]);
  }
  return {
    now: nowList,
    later: ORDER.filter((p) => later.has(p)).map((p) => ({ part: p, quests: later.get(p)! })),
  };
}
