import { getGameCatalog } from '../../src/domain/game/gameCatalogService';
import { levelProgress, selectDailyTasks, type AssignmentContext } from '../../src/domain/game/progression';
import {
  EMPTY_BASELINE,
  fitFor,
  isSetupSectionAnswered,
  SETUP_REWARDS,
  SETUP_XP_TOTAL,
  type SetupAnswers,
} from '../../src/domain/game/setupProfile';

const catalog = getGameCatalog();
const answers = (over: Partial<SetupAnswers> = {}): SetupAnswers => ({
  goals: [],
  constraints: [],
  routineMinutes: null,
  diet: null,
  observances: [],
  baseline: EMPTY_BASELINE,
  ...over,
});
const ctx = (over: Partial<AssignmentContext> = {}): AssignmentContext => ({
  experience: 'men_health',
  gameDate: '2026-10-24',
  level: 1,
  seed: 'user_a',
  completedTaskIds: new Set(),
  recentTaskIds: new Set(),
  ...over,
});

describe('setup rewards', () => {
  test('finishing every setup step reaches level 5, the end of the orientation stage', () => {
    expect(SETUP_XP_TOTAL).toBe(165);
    expect(levelProgress(SETUP_XP_TOTAL, catalog.levels).level).toBe(5);
  });

  test('a skipped step earns nothing; any answer, including prefer not to say, counts', () => {
    expect(isSetupSectionAnswered('goals', answers())).toBe(false);
    expect(isSetupSectionAnswered('body_baseline', answers())).toBe(false);
    const preferNot = answers({ baseline: { activity: 'prefer_not', energy: 'prefer_not', sleep: 'prefer_not', stress: 'prefer_not' } });
    expect(isSetupSectionAnswered('body_baseline', preferNot)).toBe(true);
    expect(isSetupSectionAnswered('mind_baseline', preferNot)).toBe(true);
    expect(isSetupSectionAnswered('constraints', answers({ routineMinutes: 10 }))).toBe(true);
    expect(isSetupSectionAnswered('lifestyle', answers({ diet: 'No preference' }))).toBe(true);
    expect(isSetupSectionAnswered('lifestyle', answers())).toBe(false);
  });

  test('rewards are fixed per step and never depend on the answer', () => {
    expect(new Set(SETUP_REWARDS.map((r) => r.section)).size).toBe(SETUP_REWARDS.length);
    SETUP_REWARDS.forEach((r) => expect(r.xp).toBeGreaterThan(0));
  });
});

describe('capability fit', () => {
  test('low activity or energy starts gentle; active without limits starts strong', () => {
    expect(fitFor(answers({ baseline: { ...EMPTY_BASELINE, activity: 'rarely' } })).capacity).toBe('gentle');
    expect(fitFor(answers({ baseline: { ...EMPTY_BASELINE, energy: 'low' } })).capacity).toBe('gentle');
    expect(fitFor(answers({ constraints: ['Low impact only'] })).capacity).toBe('gentle');
    expect(fitFor(answers({ baseline: { ...EMPTY_BASELINE, activity: 'daily_training', energy: 'good' } })).capacity).toBe('strong');
    expect(fitFor(answers({ baseline: { ...EMPTY_BASELINE, activity: 'daily_training' }, constraints: ['Knees or joints'] })).capacity).toBe('steady');
  });

  test('high stress and poor sleep bring mind and rhythm quests forward', () => {
    const fit = fitFor(answers({ baseline: { ...EMPTY_BASELINE, stress: 'high', sleep: 'poor' } }));
    expect(fit.families).toEqual(expect.arrayContaining(['mind', 'rhythm']));
    expect(fit.reasons.length).toBeGreaterThan(0);
  });

  test('a short routine keeps quests short; gentle puts starter quests first', () => {
    const picked = selectDailyTasks(catalog.tasks, ctx({ maxMinutes: 8, capacity: 'gentle' }), 3);
    expect(picked).toHaveLength(3);
    picked.forEach((t) => expect(t.estimatedDurationMinutes).toBeLessThanOrEqual(8));
    expect(picked[0].difficulty).toBe('starter');
  });

  test('a changed baseline changes the day', () => {
    const gentle = selectDailyTasks(catalog.tasks, ctx({ capacity: 'gentle', preferredFamilies: ['rhythm'] }), 3).map((t) => t.id);
    const strong = selectDailyTasks(catalog.tasks, ctx({ capacity: 'strong' }), 3).map((t) => t.id);
    expect(gentle).not.toEqual(strong);
  });
});

describe('today signal', () => {
  test('a hard check-in makes the day gentle and says why; a normal one changes nothing', () => {
    const base = answers({ baseline: { ...EMPTY_BASELINE, activity: 'daily_training', energy: 'good' } });
    expect(fitFor(base, { energy: 7, stress: 4, sleepHours: 7 }).capacity).toBe('strong');
    const hard = fitFor(base, { energy: 2, stress: 9, sleepHours: 7 });
    expect(hard.capacity).toBe('gentle');
    expect(hard.families[0]).toBe('mind');
    expect(hard.reasons[0]).toMatch(/hard day/);
  });
});

test('a chosen rest day keeps quests short; choosing "my usual" overrides a rough score', () => {
  const base = answers({ routineMinutes: 20, baseline: { ...EMPTY_BASELINE, activity: 'most_days', energy: 'good' } });
  const rest = fitFor(base, { energy: 6, stress: 4, sleepHours: 7, intensity: 'rest' });
  expect(rest.capacity).toBe('gentle');
  expect(rest.maxMinutes).toBe(8);
  expect(fitFor(base, { energy: 2, stress: 9, sleepHours: 4, intensity: 'regular' }).capacity).toBe('strong');
});
