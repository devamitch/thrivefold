/**
 * Weekly summaries: the only health-related data that can leave the phone, and only when a
 * signed-in person turns on "Back up weekly summaries". Averages and counts per Monday-start
 * week; no notes, symptoms, cycle dates, journal text or individual entries.
 */

export interface WeeklySummary {
  weekStart: string; // YYYY-MM-DD (Monday)
  checkIns: number;
  avgEnergy: number | null;
  avgMood: number | null;
  avgStress: number | null;
  avgSleepHours: number | null;
  questsDone: number;
  workouts: number;
  activeMinutes: number;
  formCheckedSessions: number;
  xpEarned: number;
  /** Finished guided-practice sessions (breathing, eye, hand studios) and their minutes. */
  practiceSessions: number;
  practiceMinutes: number;
}

interface Inputs {
  checkIns: { date: string; energy: number; mood: number; stress: number; sleepHours: number }[];
  workouts: { date: string; startedAt: string; finishedAt: string }[];
  activities: { date: string; minutes: number }[];
  poseSessions: { date: string }[];
  ledger: { kind: string; xp: number; gameDate: string }[];
  practice?: { startedAt: number; endedAt: number }[];
}

const DAY = 86_400_000;
const utc = (d: string) => Date.parse(`${d}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Monday of the week containing `date`. */
export function weekStartOf(date: string): string {
  const ms = utc(date);
  const dow = (new Date(ms).getUTCDay() + 6) % 7; // Monday = 0
  return iso(ms - dow * DAY);
}

/** Local calendar date of a timestamp, matching how the app's other dates are recorded. */
const localDate = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

export function weeklySummary(weekStart: string, data: Inputs): WeeklySummary {
  const from = utc(weekStart);
  const inWeek = (d: string) => {
    const t = utc(d);
    return t >= from && t < from + 7 * DAY;
  };
  const checks = data.checkIns.filter((c) => inWeek(c.date));
  const workouts = data.workouts.filter((w) => inWeek(w.date));
  const workoutMinutes = workouts.reduce((n, w) => n + Math.max(1, Math.round((Date.parse(w.finishedAt) - Date.parse(w.startedAt)) / 60000)), 0);
  const ledger = data.ledger.filter((e) => inWeek(e.gameDate));
  const practice = (data.practice ?? []).filter((p) => inWeek(localDate(p.endedAt)));
  return {
    weekStart,
    checkIns: checks.length,
    avgEnergy: avg(checks.map((c) => c.energy)),
    avgMood: avg(checks.map((c) => c.mood)),
    avgStress: avg(checks.map((c) => c.stress)),
    avgSleepHours: avg(checks.map((c) => c.sleepHours)),
    questsDone: ledger.filter((e) => e.kind === 'task_reward').length,
    workouts: workouts.length,
    activeMinutes: workoutMinutes + data.activities.filter((a) => inWeek(a.date)).reduce((n, a) => n + a.minutes, 0),
    formCheckedSessions: data.poseSessions.filter((p) => inWeek(p.date)).length,
    xpEarned: ledger.reduce((n, e) => n + Math.max(0, e.xp), 0),
    practiceSessions: practice.length,
    practiceMinutes: practice.reduce((n, p) => n + Math.max(0, Math.round((p.endedAt - p.startedAt) / 60000)), 0),
  };
}

/** Finished weeks (before the current one) that have any activity, newest first, up to `limit`. */
export function finishedWeeks(today: string, data: Inputs, limit = 8): WeeklySummary[] {
  const current = utc(weekStartOf(today));
  const out: WeeklySummary[] = [];
  for (let i = 1; i <= limit; i++) {
    const s = weeklySummary(iso(current - i * 7 * DAY), data);
    if (s.checkIns + s.workouts + s.questsDone + s.activeMinutes + s.practiceSessions > 0) out.push(s);
  }
  return out;
}
