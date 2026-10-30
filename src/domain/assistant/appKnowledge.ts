/**
 * What the coach knows about the app and about this person's recent days, as plain text documents
 * for the local knowledge store (SQLite + vectors). Pure: built from the store snapshot only, so
 * nothing here is invented and it can be tested without a phone.
 */
import type { Article } from '../../content/learn';
import type { Destination } from '../search/destinations';
import type { ReadingKind } from '../interop/readings';

export interface KnowledgeDoc {
  /** Stable key: the same key is replaced, never duplicated. */
  key: string;
  title: string;
  text: string;
}

/** The slice of the store the summary reads (structural, so tests can pass plain objects). */
export interface RecentDaysInput {
  checkInHistory: { date: string; energy: number; mood: number; stress: number; sleepHours: number; symptoms: string[]; notes?: string }[];
  hydration: Record<string, number>;
  hydrationTargetGlasses: number;
  mealLogs: { date: string; type: string; items: unknown[]; note?: string }[];
  medications: { name: string; dose: string; time: string }[];
  journalEntries: { createdAt: string }[];
  deviceReadings: { date: string; kind: ReadingKind; value: number; unit: string; source: string }[];
  todayQuests: { title: string; isCompleted: boolean; status: string }[];
  level: number;
  xp: number;
  streak: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The last `days` local dates, newest first. */
export function lastDays(now: Date, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

/** Every screen, one line each, so "where do I log water" finds the right place. */
export function screensDoc(destinations: Destination[]): KnowledgeDoc {
  return {
    key: 'app:screens',
    title: 'Thrivefold screens',
    text: destinations.map((d) => `Screen ${d.title}: ${d.description}. Open with ${d.route}.`).join('\n'),
  };
}

/** One document per Learn article; the title is repeated per paragraph so every chunk keeps it. */
export function learnDocs(articles: Article[]): KnowledgeDoc[] {
  return articles.map((a) => ({
    key: `learn:${a.id}`,
    title: `Learn: ${a.title}`,
    text: [
      `Learn article "${a.title}" (${a.category}, ${a.minutes} min) in the Learn screen.`,
      ...a.body.map((p) => `${a.title}: ${p}`),
      a.seekHelp ? `${a.title}, when to get help: ${a.seekHelp}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }));
}

const READING_LABEL: Partial<Record<ReadingKind, string>> = {
  steps: 'steps',
  sleep_minutes: 'sleep minutes',
  heart_rate_avg: 'average heart rate',
};

/**
 * The person's last week from their own logs, newest day first. Days with nothing logged are
 * skipped; an empty week says so instead of guessing.
 */
export function recentDaysLines(s: RecentDaysInput, now: Date, days = 7): string[] {
  const lines: string[] = [];
  for (const date of lastDays(now, days)) {
    const parts: string[] = [];
    const c = s.checkInHistory.find((x) => x.date === date);
    if (c) {
      parts.push(`check-in mood ${c.mood}/10, energy ${c.energy}/10, stress ${c.stress}/10, slept ${c.sleepHours} h`);
      if (c.symptoms.length) parts.push(`symptoms ${c.symptoms.join(', ')}`);
    }
    const water = s.hydration[date];
    if (water) parts.push(`water ${water} of ${s.hydrationTargetGlasses} glasses`);
    const meals = s.mealLogs.filter((m) => m.date === date);
    if (meals.length) parts.push(`meals logged: ${meals.map((m) => m.type).join(', ')}`);
    for (const r of s.deviceReadings.filter((x) => x.date === date)) {
      const label = READING_LABEL[r.kind];
      if (label) parts.push(`${label} ${Math.round(r.value)} (${r.source})`);
    }
    const journals = s.journalEntries.filter((j) => dayKey(new Date(j.createdAt)) === date).length;
    if (journals) parts.push(`${journals} journal ${journals === 1 ? 'entry' : 'entries'}`);
    if (parts.length) lines.push(`${date}: ${parts.join('; ')}`);
  }
  return lines;
}

/** Medicines, today's quests and progress: things that do not belong to one day. */
export function standingLines(s: RecentDaysInput): string[] {
  const lines: string[] = [];
  if (s.medications.length) {
    lines.push(`Medicines: ${s.medications.map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''} at ${m.time}`).join(', ')}`);
  }
  const open = s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'skipped').map((q) => q.title);
  const done = s.todayQuests.filter((q) => q.isCompleted).map((q) => q.title);
  if (open.length) lines.push(`Today's open quests: ${open.join(', ')}`);
  if (done.length) lines.push(`Today's finished quests: ${done.join(', ')}`);
  lines.push(`Level ${s.level}, ${s.xp} XP, streak ${s.streak} days`);
  return lines;
}

export function recentDaysDoc(s: RecentDaysInput, now: Date): KnowledgeDoc {
  const days = recentDaysLines(s, now);
  return {
    key: 'me:recent',
    title: 'Your recent days',
    text: [
      'Your recent days in Thrivefold, from what you logged on this phone.',
      ...(days.length ? days : ['Nothing logged in the last 7 days.']),
      ...standingLines(s),
    ].join('\n'),
  };
}

/** Small, stable hash (FNV-1a) so unchanged documents are not re-embedded. */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** The coach conversation so far (newest last), so "what did you tell me about sleep" works. */
export function chatDoc(turns: { who: 'you' | 'coach'; text: string; at: number }[], max = 60): KnowledgeDoc {
  const lines = turns.slice(-max).map((t) => {
    const d = new Date(t.at);
    return `${dayKey(d)} ${t.who === 'you' ? 'You asked' : 'Coach said'}: ${t.text.replace(/\s+/g, ' ').trim()}`;
  });
  return {
    key: 'me:chat',
    title: 'Your conversations with the coach',
    text: lines.length ? lines.join('\n') : 'No conversations with the coach yet.',
  };
}
