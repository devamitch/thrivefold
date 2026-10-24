/**
 * On-device insight engine. Pure functions over the person's own records: no model, no
 * network, no guessing. Every insight states how many entries it rests on, and nothing is
 * reported until there is enough data for the pattern to mean something.
 *
 * Not medical advice: insights describe the person's logs, never diagnose.
 */

export interface InsightCheckIn {
  date: string; // YYYY-MM-DD
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  sleepHours: number;
  symptoms: string[];
}

export interface InsightPeriod {
  startDate: string; // YYYY-MM-DD
}

export type InsightKind = 'trend' | 'link' | 'pattern' | 'symptom' | 'cycle' | 'consistency' | 'activity';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  /** Plain statement of the evidence, e.g. "Based on 18 check-in days". */
  evidence: string;
  sampleSize: number;
  strength: 'emerging' | 'clear';
  /** Gentle, optional next step. Never a prescription. */
  suggestion?: string;
  /** Short sentence the person may choose to keep in their memory vault. */
  memoryCandidate?: string;
}

export interface InsightInput {
  checkIns: InsightCheckIn[];
  periods?: InsightPeriod[];
  /** YYYY-MM-DD for "today"; injectable so results are reproducible in tests. */
  today: string;
  /** Dates with a workout or logged activity. */
  activeDates?: string[];
  /** Protein (g) per logged meal day. */
  proteinByDate?: Record<string, number>;
}

/** Thresholds are deliberately conservative: a quiet screen beats a false pattern. */
export const INSIGHT_THRESHOLDS = {
  trendMinDaysPerWindow: 3,
  trendMinDelta: 1,
  sleepTrendMinDelta: 0.75,
  linkMinDays: 7,
  linkMinCorrelation: 0.4,
  linkClearDays: 14,
  linkClearCorrelation: 0.55,
  groupMinDays: 3,
  weekdayMinDays: 14,
  weekdayMinSamples: 2,
  weekdayMinLift: 1.5,
  symptomWindowDays: 30,
  symptomMinCount: 4,
  symptomMinShare: 0.3,
  cycleMinPeriods: 2,
  cycleMinDays: 10,
  cycleMinDelta: 1,
} as const;

/** Tags that describe feeling good; they are not reported as recurring symptoms. */
const POSITIVE_TAGS = new Set(
  [
    'High Energy',
    'Clear Skin',
    'Calm Mood',
    'Social',
    'Peak Energy',
    'High Focus',
    'Mental Clarity',
    'Body Ease',
  ].map((t) => t.toLowerCase()),
);

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Metric = 'energy' | 'mood' | 'stress' | 'sleepHours';

interface DayRecord {
  date: string;
  energy: number;
  mood: number;
  stress: number;
  sleepHours: number;
  symptoms: Set<string>;
}

// ---------------------------------------------------------------- date helpers

/** Days since epoch for a YYYY-MM-DD string, independent of the device time zone. */
export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function weekdayOf(date: string): number {
  return new Date(dayNumber(date) * 86400000).getUTCDay();
}

const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// ---------------------------------------------------------------- statistics

export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Pearson correlation; NaN when either series has no variation. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return NaN;
  return num / Math.sqrt(dx * dy);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const fmtHours = (n: number) => `${round1(n)}h`;

// ---------------------------------------------------------------- aggregation

/** One record per day: several check-ins on the same date are averaged, symptoms merged. */
export function aggregateByDay(checkIns: InsightCheckIn[], today: string): DayRecord[] {
  const todayN = dayNumber(today);
  const byDate = new Map<string, InsightCheckIn[]>();
  for (const c of checkIns) {
    if (!isValidDate(c.date) || dayNumber(c.date) > todayN) continue;
    const list = byDate.get(c.date) ?? [];
    list.push(c);
    byDate.set(c.date, list);
  }
  return [...byDate.entries()]
    .map(([date, list]) => ({
      date,
      energy: mean(list.map((c) => c.energy)),
      mood: mean(list.map((c) => c.mood)),
      stress: mean(list.map((c) => c.stress)),
      sleepHours: mean(list.map((c) => c.sleepHours)),
      symptoms: new Set(list.flatMap((c) => c.symptoms)),
    }))
    .sort((a, b) => dayNumber(a.date) - dayNumber(b.date));
}

const daysAgo = (date: string, today: string) => dayNumber(today) - dayNumber(date);

// ---------------------------------------------------------------- detectors

const METRIC_LABEL: Record<Metric, string> = {
  energy: 'energy',
  mood: 'mood',
  stress: 'stress',
  sleepHours: 'sleep',
};

function trendInsights(days: DayRecord[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const recent = days.filter((d) => daysAgo(d.date, today) < 7);
  const prior = days.filter((d) => daysAgo(d.date, today) >= 7 && daysAgo(d.date, today) < 14);
  if (recent.length < T.trendMinDaysPerWindow || prior.length < T.trendMinDaysPerWindow) return [];

  const out: Insight[] = [];
  const metrics: Metric[] = ['energy', 'mood', 'stress', 'sleepHours'];
  for (const metric of metrics) {
    const now = mean(recent.map((d) => d[metric]));
    const before = mean(prior.map((d) => d[metric]));
    const delta = now - before;
    const minDelta = metric === 'sleepHours' ? T.sleepTrendMinDelta : T.trendMinDelta;
    if (Math.abs(delta) < minDelta) continue;

    const up = delta > 0;
    // For stress, "up" is the harder direction; for everything else "down" is.
    const harder = metric === 'stress' ? up : !up;
    const label = METRIC_LABEL[metric];
    const fmt = (v: number) => (metric === 'sleepHours' ? fmtHours(v) : `${round1(v)}/10`);
    out.push({
      id: `trend_${metric}`,
      kind: 'trend',
      title: `Your ${label} is ${up ? 'up' : 'down'} this week`,
      detail: `Average ${label} over the last 7 days is ${fmt(now)}, compared with ${fmt(before)} the week before.`,
      evidence: `Based on ${recent.length} recent and ${prior.length} earlier check-in days`,
      sampleSize: recent.length + prior.length,
      strength: recent.length >= 5 && prior.length >= 5 ? 'clear' : 'emerging',
      suggestion: harder ? suggestionForHarderWeek(metric) : undefined,
    });
  }
  return out;
}

function suggestionForHarderWeek(metric: Metric): string {
  switch (metric) {
    case 'sleepHours':
      return 'A steady wind-down time for a few nights is often easier than catching up at weekends.';
    case 'stress':
      return 'Short breathing breaks during the day can help; choose a lighter routine if you need to.';
    case 'energy':
      return 'Lighter routines and rest days are a fine choice this week.';
    case 'mood':
      return 'A short reflection or talking to someone you trust may help. Support is always in Safety.';
  }
}

function linkInsights(days: DayRecord[]): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  if (days.length < T.linkMinDays) return [];
  const out: Insight[] = [];

  const pairs: { x: Metric; y: Metric }[] = [
    { x: 'sleepHours', y: 'energy' },
    { x: 'sleepHours', y: 'mood' },
    { x: 'stress', y: 'mood' },
  ];

  for (const { x, y } of pairs) {
    const r = pearson(
      days.map((d) => d[x]),
      days.map((d) => d[y]),
    );
    if (!Number.isFinite(r) || Math.abs(r) < T.linkMinCorrelation) continue;

    const strength: Insight['strength'] =
      days.length >= T.linkClearDays && Math.abs(r) >= T.linkClearCorrelation ? 'clear' : 'emerging';

    if (x === 'sleepHours') {
      // Compare well-rested days with short-sleep days in plain numbers.
      const rested = days.filter((d) => d.sleepHours >= 7);
      const short = days.filter((d) => d.sleepHours < 6);
      const yl = METRIC_LABEL[y];
      let detail: string;
      if (rested.length >= T.groupMinDays && short.length >= T.groupMinDays) {
        detail =
          `On days you logged 7+ hours of sleep your ${yl} averaged ${round1(mean(rested.map((d) => d[y])))}/10, ` +
          `against ${round1(mean(short.map((d) => d[y])))}/10 after under 6 hours.`;
      } else {
        detail = `In your check-ins, nights with more sleep tend to come with ${r > 0 ? 'higher' : 'lower'} ${yl} the same day.`;
      }
      out.push({
        id: `link_sleep_${y}`,
        kind: 'link',
        title: r > 0 ? `More sleep, better ${yl}` : `Sleep and ${yl} move in opposite directions`,
        detail,
        evidence: `Based on ${days.length} check-in days (correlation ${round1(r)})`,
        sampleSize: days.length,
        strength,
        suggestion: r > 0 ? 'Protecting your sleep may be one of the most useful things you can do.' : undefined,
        memoryCandidate: r > 0 ? `My ${yl} tends to be better after a full night of sleep.` : undefined,
      });
    } else {
      out.push({
        id: 'link_stress_mood',
        kind: 'link',
        title: r < 0 ? 'Stress weighs on your mood' : 'Stress and mood rise together for you',
        detail:
          r < 0
            ? 'On higher-stress days your mood tends to be lower.'
            : 'Unusually, your higher-stress days tend to come with higher mood. Busy can feel good.',
        evidence: `Based on ${days.length} check-in days (correlation ${round1(r)})`,
        sampleSize: days.length,
        strength,
        suggestion: r < 0 ? 'A two-minute breathing break on busy days may soften this.' : undefined,
        memoryCandidate: r < 0 ? 'Stressful days pull my mood down; short breaks help.' : undefined,
      });
    }
  }
  return out;
}

function weekdayInsights(days: DayRecord[]): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  if (days.length < T.weekdayMinDays) return [];
  const overall = mean(days.map((d) => d.stress));
  let best: { weekday: number; avg: number; n: number } | null = null;
  for (let w = 0; w < 7; w++) {
    const subset = days.filter((d) => weekdayOf(d.date) === w);
    if (subset.length < T.weekdayMinSamples) continue;
    const avg = mean(subset.map((d) => d.stress));
    if (avg - overall >= T.weekdayMinLift && (!best || avg > best.avg)) {
      best = { weekday: w, avg, n: subset.length };
    }
  }
  if (!best) return [];
  const name = WEEKDAYS[best.weekday];
  return [
    {
      id: `pattern_stress_${name.toLowerCase()}`,
      kind: 'pattern',
      title: `${name}s tend to be your most stressful day`,
      detail: `Stress averages ${round1(best.avg)}/10 on ${name}s, against ${round1(overall)}/10 across all your check-ins.`,
      evidence: `Based on ${best.n} ${name}s out of ${days.length} check-in days`,
      sampleSize: days.length,
      strength: best.n >= 4 ? 'clear' : 'emerging',
      suggestion: `Planning a lighter routine or a short break on ${name}s might help.`,
      memoryCandidate: `${name}s are usually my most stressful day.`,
    },
  ];
}

function symptomInsights(days: DayRecord[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const window = days.filter((d) => daysAgo(d.date, today) < T.symptomWindowDays);
  if (window.length < T.symptomMinCount) return [];

  const counts = new Map<string, { label: string; n: number }>();
  for (const d of window) {
    for (const s of d.symptoms) {
      const key = s.toLowerCase();
      if (POSITIVE_TAGS.has(key)) continue;
      const entry = counts.get(key) ?? { label: s, n: 0 };
      entry.n += 1;
      counts.set(key, entry);
    }
  }

  return [...counts.values()]
    .filter((c) => c.n >= T.symptomMinCount && c.n / window.length >= T.symptomMinShare)
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .map((c) => ({
      id: `symptom_${c.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      kind: 'symptom' as const,
      title: `${c.label} keeps coming up`,
      detail: `You logged ${c.label.toLowerCase()} on ${c.n} of your last ${window.length} check-in days.`,
      evidence: `Based on check-ins from the last ${T.symptomWindowDays} days`,
      sampleSize: window.length,
      strength: (c.n >= 6 ? 'clear' : 'emerging') as Insight['strength'],
      suggestion:
        'If it persists, gets worse or worries you, a clinician can help. This is a pattern in your logs, not a diagnosis.',
    }));
}

function cycleInsights(days: DayRecord[], periods: InsightPeriod[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const starts = periods
    .map((p) => p.startDate)
    .filter((d) => isValidDate(d) && dayNumber(d) <= dayNumber(today))
    .map(dayNumber)
    .sort((a, b) => a - b);
  if (starts.length < T.cycleMinPeriods) return [];

  // Cycle day for each check-in, counted from the most recent logged start before it.
  // Only days within 45 days of a logged start are used, so long gaps don't distort it.
  const early: number[] = [];
  const rest: number[] = [];
  for (const d of days) {
    const n = dayNumber(d.date);
    let start: number | undefined;
    for (const s of starts) if (s <= n) start = s;
    if (start === undefined) continue;
    const cycleDay = n - start + 1;
    if (cycleDay > 45) continue;
    (cycleDay <= 5 ? early : rest).push(d.energy);
  }
  if (early.length + rest.length < T.cycleMinDays) return [];
  if (early.length < T.groupMinDays || rest.length < T.groupMinDays) return [];

  const delta = mean(early) - mean(rest);
  if (Math.abs(delta) < T.cycleMinDelta) return [];
  const lower = delta < 0;
  return [
    {
      id: 'cycle_energy_early',
      kind: 'cycle',
      title: lower ? 'Energy dips early in your cycle' : 'Energy is higher early in your cycle',
      detail:
        `In the first five days after a logged period start your energy averaged ${round1(mean(early))}/10, ` +
        `against ${round1(mean(rest))}/10 on other days.`,
      evidence: `Based on ${early.length + rest.length} check-in days across ${starts.length} logged periods`,
      sampleSize: early.length + rest.length,
      strength: early.length >= 6 && starts.length >= 3 ? 'clear' : 'emerging',
      suggestion: lower ? 'Gentler routines in those days are a reasonable choice. Not medical advice.' : undefined,
      memoryCandidate: lower ? 'My energy is usually lower in the first days of my period.' : undefined,
    },
  ];
}

function consistencyInsight(days: DayRecord[], today: string): Insight[] {
  const last14 = days.filter((d) => daysAgo(d.date, today) < 14).length;
  if (days.length < 5 || last14 === 0) return [];
  return [
    {
      id: 'consistency_14',
      kind: 'consistency',
      title: `${last14} of the last 14 days checked in`,
      detail:
        last14 >= 10
          ? 'That is a steady habit. Patterns above get more reliable with every check-in.'
          : 'Each check-in makes the patterns here more reliable. Missing days is fine.',
      evidence: `${days.length} check-in days recorded in total`,
      sampleSize: days.length,
      strength: 'clear',
    },
  ];
}

// ---------------------------------------------------------------- activity and food

/** Training this week vs last, mood on active vs rest days, and protein from logged meals. */
function activityInsights(days: { date: string; mood: number; energy: number }[], input: InsightInput): Insight[] {
  const out: Insight[] = [];
  const active = new Set(input.activeDates ?? []);
  const thisWeek = [...active].filter((d) => daysAgo(d, input.today) >= 0 && daysAgo(d, input.today) < 7).length;
  const lastWeek = [...active].filter((d) => daysAgo(d, input.today) >= 7 && daysAgo(d, input.today) < 14).length;
  if (thisWeek + lastWeek >= 2) {
    out.push({
      id: 'activity_weeks',
      kind: 'activity',
      title: `${thisWeek} active day${thisWeek === 1 ? '' : 's'} this week${lastWeek ? `, ${lastWeek} last week` : ''}`,
      detail:
        thisWeek > lastWeek
          ? 'More than last week. Steady beats heroic: keep the easy days easy.'
          : thisWeek === lastWeek
            ? 'Same as last week: a steady rhythm.'
            : 'Fewer than last week. A short session still counts; rest is not failure.',
      evidence: 'From your workouts and logged activities',
      sampleSize: thisWeek + lastWeek,
      strength: 'clear',
    });
  }
  const onActive = days.filter((d) => active.has(d.date));
  const onRest = days.filter((d) => !active.has(d.date));
  if (onActive.length >= INSIGHT_THRESHOLDS.groupMinDays && onRest.length >= INSIGHT_THRESHOLDS.groupMinDays) {
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const diff = mean(onActive.map((d) => d.mood)) - mean(onRest.map((d) => d.mood));
    if (Math.abs(diff) >= INSIGHT_THRESHOLDS.trendMinDelta) {
      out.push({
        id: 'activity_mood',
        kind: 'activity',
        title: diff > 0 ? 'Your mood is higher on days you move' : 'Your mood is lower on days you train',
        detail:
          diff > 0
            ? `Mood averages ${diff.toFixed(1)} points higher on active days in your check-ins.`
            : `Mood averages ${Math.abs(diff).toFixed(1)} points lower on training days. Lighter sessions may suit you better.`,
        evidence: `${onActive.length} active and ${onRest.length} rest check-in days`,
        sampleSize: onActive.length + onRest.length,
        strength: onActive.length + onRest.length >= INSIGHT_THRESHOLDS.linkClearDays ? 'clear' : 'emerging',
        suggestion: diff > 0 ? 'On a low day, a ten-minute walk may help.' : undefined,
      });
    }
  }
  const proteinDays = Object.entries(input.proteinByDate ?? {}).filter(([d]) => daysAgo(d, input.today) >= 0 && daysAgo(d, input.today) < 7);
  if (proteinDays.length >= 3) {
    const avg = Math.round(proteinDays.reduce((n, [, g]) => n + g, 0) / proteinDays.length);
    out.push({
      id: 'protein_week',
      kind: 'activity',
      title: `About ${avg} g of protein a day this week`,
      detail: 'From the meals you logged. Many adults need roughly 0.8 g per kg of body weight; more if training hard.',
      evidence: `${proteinDays.length} days of logged meals`,
      sampleSize: proteinDays.length,
      strength: proteinDays.length >= 5 ? 'clear' : 'emerging',
    });
  }
  return out;
}

// ---------------------------------------------------------------- entry point

const KIND_ORDER: Record<InsightKind, number> = {
  symptom: 0,
  trend: 1,
  link: 2,
  cycle: 3,
  pattern: 4,
  consistency: 5,
  activity: 2,
};

/** All insights the records support, most actionable first. Empty when data is thin. */
export function computeInsights(input: InsightInput): Insight[] {
  const days = aggregateByDay(input.checkIns, input.today);
  const all = [
    ...symptomInsights(days, input.today),
    ...trendInsights(days, input.today),
    ...linkInsights(days),
    ...cycleInsights(days, input.periods ?? [], input.today),
    ...weekdayInsights(days),
    ...consistencyInsight(days, input.today),
    ...activityInsights(days, input),
  ];
  return all.sort(
    (a, b) =>
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      (a.strength === b.strength ? 0 : a.strength === 'clear' ? -1 : 1),
  );
}

/** How many more check-in days until the first patterns can appear (0 when ready). */
export function checkInsUntilInsights(checkIns: InsightCheckIn[], today: string): number {
  const n = aggregateByDay(checkIns, today).length;
  return Math.max(0, INSIGHT_THRESHOLDS.linkMinDays - n);
}

export interface RecentLoad {
  /** Consecutive most-recent check-in days (ending today/yesterday) with under 6h sleep. */
  shortSleepStreak: number;
  /** Consecutive most-recent check-in days with stress >= 7. */
  highStressStreak: number;
}

/** Recent strain used to soften today's suggestion; derived only from logged days. */
export function recentLoad(checkIns: InsightCheckIn[], today: string): RecentLoad {
  const days = aggregateByDay(checkIns, today).reverse();
  const run = (pred: (d: DayRecord) => boolean) => {
    let count = 0;
    let expected = dayNumber(today);
    for (const d of days) {
      const n = dayNumber(d.date);
      // Allow the run to start yesterday if today has no check-in yet.
      if (count === 0 && n === expected - 1) expected -= 1;
      if (n !== expected || !pred(d)) break;
      count += 1;
      expected -= 1;
    }
    return count;
  };
  return {
    shortSleepStreak: run((d) => d.sleepHours < 6),
    highStressStreak: run((d) => d.stress >= 7),
  };
}
