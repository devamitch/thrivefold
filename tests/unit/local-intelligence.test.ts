import {
  aggregateByDay,
  checkInsUntilInsights,
  computeInsights,
  pearson,
  recentLoad,
  type InsightCheckIn,
} from '../../src/domain/ai/insights';
import { searchDocuments, tokenize, type RetrievalDocument } from '../../src/domain/ai/localRetrieval';
import { classifyLocalInput } from '../../src/domain/ai/localClassifier';
import { evaluateDeterministicRoutine } from '../../src/domain/ai/deterministicRules';
import { activeMemories, type MemoryItem } from '../../src/domain/ai/types';

const TODAY = '2026-10-23';

/** YYYY-MM-DD `n` days before TODAY, computed in UTC like the engine. */
function daysBefore(n: number): string {
  const d = new Date(Date.UTC(2026, 9, 23) - n * 86400000);
  return d.toISOString().split('T')[0];
}

function checkIn(n: number, over: Partial<InsightCheckIn> = {}): InsightCheckIn {
  return { date: daysBefore(n), energy: 6, mood: 6, stress: 5, sleepHours: 7, symptoms: [], ...over };
}

describe('Insight engine', () => {
  test('stays silent with too little data and says how many days are left', () => {
    const few = [checkIn(0), checkIn(1), checkIn(2)];
    expect(computeInsights({ checkIns: few, today: TODAY })).toEqual([]);
    expect(checkInsUntilInsights(few, TODAY)).toBe(4);
    expect(computeInsights({ checkIns: [], today: TODAY })).toEqual([]);
  });

  test('averages several check-ins on the same day and ignores future dates', () => {
    const days = aggregateByDay(
      [checkIn(0, { energy: 4 }), checkIn(0, { energy: 8 }), { ...checkIn(0), date: '2026-12-01' }],
      TODAY,
    );
    expect(days).toHaveLength(1);
    expect(days[0].energy).toBe(6);
  });

  test('detects a week-over-week drop in sleep with real numbers', () => {
    const records = [
      ...[0, 1, 2, 3, 4].map((n) => checkIn(n, { sleepHours: 5 })),
      ...[7, 8, 9, 10, 11].map((n) => checkIn(n, { sleepHours: 7.5 })),
    ];
    const insight = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.id === 'trend_sleepHours');
    expect(insight).toBeDefined();
    expect(insight!.title).toBe('Your sleep is down this week');
    expect(insight!.detail).toContain('5h');
    expect(insight!.detail).toContain('7.5h');
    expect(insight!.strength).toBe('clear');
    expect(insight!.suggestion).toBeDefined();
  });

  test('does not report a trend for small changes', () => {
    const records = [
      ...[0, 1, 2, 3].map((n) => checkIn(n, { energy: 6 })),
      ...[7, 8, 9, 10].map((n) => checkIn(n, { energy: 6.5 })),
    ];
    const ids = computeInsights({ checkIns: records, today: TODAY }).map((i) => i.id);
    expect(ids).not.toContain('trend_energy');
  });

  test('links sleep with energy and compares rested and short-sleep days', () => {
    const records = Array.from({ length: 12 }, (_, n) => {
      const sleep = n % 2 === 0 ? 8 : 5;
      return checkIn(n, { sleepHours: sleep, energy: sleep === 8 ? 8 : 4 });
    });
    const insight = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.id === 'link_sleep_energy');
    expect(insight).toBeDefined();
    expect(insight!.detail).toContain('8/10');
    expect(insight!.detail).toContain('4/10');
    expect(insight!.memoryCandidate).toBeDefined();
  });

  test('no correlation is reported when the numbers do not move together', () => {
    expect(Number.isNaN(pearson([5, 5, 5], [1, 2, 3]))).toBe(true);
    const flat = Array.from({ length: 10 }, (_, n) => checkIn(n));
    const kinds = computeInsights({ checkIns: flat, today: TODAY }).map((i) => i.kind);
    expect(kinds).not.toContain('link');
  });

  test('finds a recurring symptom but never reports positive tags', () => {
    const records = Array.from({ length: 8 }, (_, n) =>
      checkIn(n, { symptoms: n < 5 ? ['Headache', 'Calm Mood'] : ['Calm Mood'] }),
    );
    const insights = computeInsights({ checkIns: records, today: TODAY });
    const headache = insights.find((i) => i.id === 'symptom_headache');
    expect(headache?.detail).toBe('You logged headache on 5 of your last 8 check-in days.');
    expect(headache?.suggestion).toContain('not a diagnosis');
    expect(insights.find((i) => i.id === 'symptom_calm_mood')).toBeUndefined();
  });

  test('spots the most stressful weekday only with enough weeks of data', () => {
    // 21 consecutive days; every Monday is high stress.
    const records = Array.from({ length: 21 }, (_, n) => {
      const date = daysBefore(n);
      const isMonday = new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
      return checkIn(n, { stress: isMonday ? 9 : 4 });
    });
    const pattern = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.kind === 'pattern');
    expect(pattern?.title).toBe('Mondays tend to be your most stressful day');
  });

  test('links energy to early cycle days only with two or more logged periods', () => {
    const records = Array.from({ length: 30 }, (_, n) => {
      const cycleDay = n <= 27 ? 28 - n : 0; // TODAY is cycle day 28 of a period that began 27 days ago
      return checkIn(n, { energy: cycleDay >= 1 && cycleDay <= 5 ? 3 : 7 });
    });
    const periods = [{ startDate: daysBefore(27) }, { startDate: daysBefore(55) }];
    const withPeriods = computeInsights({ checkIns: records, periods, today: TODAY });
    expect(withPeriods.find((i) => i.id === 'cycle_energy_early')?.title).toBe('Energy dips early in your cycle');

    const onePeriod = computeInsights({ checkIns: records, periods: periods.slice(0, 1), today: TODAY });
    expect(onePeriod.find((i) => i.kind === 'cycle')).toBeUndefined();
  });

  test('recent load counts consecutive hard days ending today or yesterday', () => {
    const records = [checkIn(1, { sleepHours: 5 }), checkIn(2, { sleepHours: 5.5 }), checkIn(3, { sleepHours: 4 }), checkIn(4, { sleepHours: 8 })];
    expect(recentLoad(records, TODAY)).toEqual({ shortSleepStreak: 3, highStressStreak: 0 });
    // A gap breaks the run.
    expect(recentLoad([checkIn(0, { stress: 8 }), checkIn(2, { stress: 8 })], TODAY).highStressStreak).toBe(1);
  });
});

describe('Recovery rule uses recent load', () => {
  test('three short-sleep days switch a high-energy day to recovery', () => {
    const rec = evaluateDeterministicRoutine({
      energy: 9,
      mood: 8,
      stress: 3,
      experience: 'men_health',
      recentLoad: { shortSleepStreak: 3, highStressStreak: 0 },
    });
    expect(rec.taskId).toBe('rec_recovery_reset');
    expect(rec.aiExplanation.text).toContain('3 days in a row with under 6 hours of sleep');
  });

  test('severe pain still takes priority over recovery', () => {
    const rec = evaluateDeterministicRoutine({
      energy: 5,
      mood: 5,
      stress: 5,
      physicalPainOrLimitation: 'severe back pain',
      experience: 'women_health',
      recentLoad: { shortSleepStreak: 4, highStressStreak: 4 },
    });
    expect(rec.taskId).toBe('rec_rest_and_care');
  });
});

describe('Local note search', () => {
  const docs: RetrievalDocument[] = [
    { id: 'j1', kind: 'journal', title: 'Rough night', text: 'Slept badly again, woke up at 3am. Sleeping is hard when work is busy.', date: '2026-10-20' },
    { id: 'j2', kind: 'journal', title: 'Good walk', text: 'Long walk by the river, felt calm afterwards.', date: '2026-10-21' },
    { id: 'm1', kind: 'memory', title: '', text: 'Mornings work best for my routines.', date: '2026-10-22' },
  ];

  test('ranks the relevant entry first and matches word forms', () => {
    const hits = searchDocuments(docs, 'sleep problems');
    expect(hits[0].doc.id).toBe('j1');
    expect(hits[0].matchedTerms).toContain('sleep');
  });

  test('returns nothing for stopword-only or unmatched queries', () => {
    expect(searchDocuments(docs, 'the and of')).toEqual([]);
    expect(searchDocuments(docs, 'xylophone')).toEqual([]);
    expect(searchDocuments([], 'sleep')).toEqual([]);
  });

  test('tokenizer drops stopwords and stems plurals', () => {
    expect(tokenize('The walks were calming')).toEqual(['walk', 'calm']);
  });
});

describe('Local classifier', () => {
  test('ignores negated fatigue', () => {
    const out = classifyLocalInput({ text: 'Not tired at all today, feeling great' });
    expect(out.signals).not.toContain('fatigue');
    expect(out.intensitySuggestion).toBe('regular');
  });

  test('pain lowers intensity and signposts care without diagnosing', () => {
    const out = classifyLocalInput({ text: 'my knee is sore and my back aches' });
    expect(out.intent).toBe('exercise_adaptation');
    expect(out.result.limitationsDisclosed).toContain('Not a diagnosis');
  });

  test('crisis phrases are never suppressed by negation', () => {
    expect(classifyLocalInput({ text: "I don't know, I just want to die" }).isCrisisAlert).toBe(true);
    expect(classifyLocalInput({ text: 'thinking about self-harm' }).isCrisisAlert).toBe(true);
  });

  test('stress and low mood suggest a lighter day', () => {
    const out = classifyLocalInput({ text: 'overwhelmed by deadlines and feeling low' });
    expect(out.intensitySuggestion).toBe('rest');
    expect(out.signals).toEqual(expect.arrayContaining(['stress', 'low_mood']));
  });
});

describe('Memory vault', () => {
  const base: Omit<MemoryItem, 'id' | 'createdAt'> = { category: 'pattern', content: 'x', source: 'insight', isSensitive: false };

  test('expired memories are hidden and newest come first', () => {
    const now = new Date('2026-10-23T12:00:00Z');
    const items: MemoryItem[] = [
      { ...base, id: 'old', createdAt: '2026-07-01T00:00:00Z', expiresAt: '2026-09-29T00:00:00Z' },
      { ...base, id: 'a', createdAt: '2026-10-01T00:00:00Z', expiresAt: '2026-12-30T00:00:00Z' },
      { ...base, id: 'b', createdAt: '2026-10-20T00:00:00Z', source: 'user' },
    ];
    expect(activeMemories(items, now).map((m) => m.id)).toEqual(['b', 'a']);
  });
});

describe('activity and food insights', () => {
  const ci = (date: string, mood: number) => ({ date, energy: 5, mood, stress: 5, sleepHours: 7, symptoms: [] });
  test('mood on active vs rest days, weekly activity and protein', () => {
    const checkIns = [
      ci('2026-10-20', 8), ci('2026-10-21', 8), ci('2026-10-22', 8),
      ci('2026-10-17', 5), ci('2026-10-18', 5), ci('2026-10-19', 5),
    ];
    const out = computeInsights({
      checkIns,
      today: '2026-10-25',
      activeDates: ['2026-10-20', '2026-10-21', '2026-10-22'],
      proteinByDate: { '2026-10-22': 60, '2026-10-23': 70, '2026-10-24': 80 },
    });
    const ids = out.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['activity_weeks', 'activity_mood', 'protein_week']));
    expect(out.find((i) => i.id === 'protein_week')!.title).toMatch(/70 g/);
    expect(out.find((i) => i.id === 'activity_mood')!.title).toMatch(/higher/);
  });
  test('nothing without enough data', () => {
    expect(computeInsights({ checkIns: [], today: '2026-10-25', activeDates: ['2026-10-24'] }).filter((i) => i.kind === 'activity')).toEqual([]);
  });
});
