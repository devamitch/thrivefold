import {
  currentLevelProgress,
  getGameCatalog,
  getSpecialQuestParents,
  getTaskById,
  validateCatalogIntegrity,
} from '../../src/domain/game/gameCatalogService';
import { evaluateObjective, objectiveFormFor, type ObjectiveEvidence } from '../../src/domain/game/objectives';
import {
  appendLedger,
  dailyTargetFor,
  isAutoAssignable,
  ledgerTotals,
  levelProgress,
  purchaseUnlock,
  questFamily,
  replacementOptions,
  selectDailyTasks,
  settleMilestones,
  type AssignmentContext,
  type LedgerEntry,
} from '../../src/domain/game/progression';
import { migrateQuestState } from '../../src/stores/slices/questSlice';

const catalog = getGameCatalog();
const ctx = (over: Partial<AssignmentContext> = {}): AssignmentContext => ({
  experience: 'women_health',
  gameDate: '2026-10-23',
  level: 1,
  seed: 'user_a',
  completedTaskIds: new Set(),
  recentTaskIds: new Set(),
  ...over,
});
const xpEntry = (key: string, xp: number, date = '2026-10-23', points = 0): LedgerEntry => ({
  key,
  kind: 'task_reward',
  xp,
  diamonds: 0,
  taskPoints: points,
  gameDate: date,
  sourceId: key,
  policyVersion: 'test',
  createdAt: '2026-10-23T10:00:00Z',
});
const evidence = (over: Partial<ObjectiveEvidence> = {}): ObjectiveEvidence => ({
  answers: {},
  elapsedSeconds: 0,
  completedStepIds: [],
  attested: false,
  ...over,
});

describe('v3 catalog', () => {
  test('is the only source and validates: 1,000 levels, unique task ids', () => {
    const report = validateCatalogIntegrity();
    expect(report.errors).toEqual([]);
    expect(report.totalLevels).toBe(1000);
    expect(catalog.tasks.every((t) => t.catalogSource === 'v3')).toBe(true);
  });

  test('keeps catalog rewards exactly, including deliberate zero rewards', () => {
    expect(getTaskById('goal_define_one')?.points).toMatchObject({ taskPoints: 10, xp: 15 });
    expect(getTaskById('sleep_log')?.points).toMatchObject({ taskPoints: 0, xp: 0 });
  });

  test('levels use catalog thresholds and stop at an incomplete chapter checkpoint', () => {
    expect(currentLevelProgress(0).level).toBe(1);
    const l2 = catalog.levels[1].requiredCumulativeXp;
    expect(currentLevelProgress(l2).level).toBe(2);
    expect(currentLevelProgress(l2 - 1).level).toBe(1);
    const huge = currentLevelProgress(10_000_000);
    expect(huge.level).toBe(50);
    expect(huge.blockedByCheckpointId).toBe('capstone_01');
    expect(levelProgress(10_000_000, catalog.levels, new Set(['capstone_01'])).level).toBe(100);
  });
});

describe('objective verification', () => {
  const reflection = getTaskById('goal_define_one')!;
  const form = objectiveFormFor(reflection)!;

  test('structured reflection requires every field at its minimum length', () => {
    expect(form.fields.map((f) => f.id)).toEqual(['goalText', 'personalReason', 'nextAction']);
    expect(evaluateObjective(form, evidence(), reflection.instructions)).toContain('MISSING_goalText');
    const short = evaluateObjective(form, evidence({ answers: { goalText: 'walk', personalReason: 'feel better each day', nextAction: 'shoes by the door' } }), reflection.instructions);
    expect(short).toEqual(['TOO_SHORT_goalText']);
    const ok = evaluateObjective(form, evidence({ answers: { goalText: 'walk every evening', personalReason: 'feel better each day', nextAction: 'shoes by the door' } }), reflection.instructions);
    expect(ok).toEqual([]);
  });

  test('timed sessions need real elapsed time', () => {
    const timed = getTaskById('focus_session')!;
    const tf = objectiveFormFor(timed)!;
    const answers = { taskDescription: 'read a chapter', outcome: 'finished it calmly' };
    expect(evaluateObjective(tf, evidence({ answers, elapsedSeconds: 30 }), timed.instructions)).toContain('INSUFFICIENT_ELAPSED_TIME');
    expect(evaluateObjective(tf, evidence({ answers, elapsedSeconds: 300 }), timed.instructions)).toEqual([]);
  });

  test('guided sequences need every step or an explicit safe stop', () => {
    const seq = getTaskById('mobility_routine')!;
    const sf = objectiveFormFor(seq)!;
    expect(evaluateObjective(sf, evidence(), seq.instructions)).toEqual(['STEPS_INCOMPLETE']);
    expect(evaluateObjective(sf, evidence({ safeStop: true }), seq.instructions)).toEqual([]);
    expect(evaluateObjective(sf, evidence({ completedStepIds: seq.instructions.map((i) => i.id) }), seq.instructions)).toEqual([]);
  });

  test('assessments needing server keys are unsupported, never generically verified', () => {
    const quiz = catalog.tasks.find((t) => t.objective?.type === 'knowledge_assessment')!;
    expect(objectiveFormFor(quiz)).toBeNull();
    expect(isAutoAssignable(quiz, ctx())).toBe(false);
  });
});

describe('daily quests', () => {
  test('three stable, eligible quests from different families', () => {
    const a = selectDailyTasks(catalog.tasks, ctx(), 3);
    const b = selectDailyTasks(catalog.tasks, ctx(), 3);
    expect(a).toHaveLength(3);
    expect(a.map((t) => t.id)).toEqual(b.map((t) => t.id));
    expect(new Set(a.map((t) => questFamily(t.category))).size).toBe(3);
    a.forEach((t) => expect(isAutoAssignable(t, ctx())).toBe(true));
  });

  test('another day or person gets a different set; recent tasks are avoided', () => {
    const today = selectDailyTasks(catalog.tasks, ctx(), 3).map((t) => t.id);
    const tomorrow = selectDailyTasks(catalog.tasks, ctx({ gameDate: '2026-10-24', recentTaskIds: new Set(today) }), 3).map((t) => t.id);
    expect(tomorrow.some((id) => today.includes(id))).toBe(false);
  });

  test('sensitive, age-gated and unrewarded tasks are never auto-assigned', () => {
    const picked = selectDailyTasks(catalog.tasks, ctx(), 40);
    picked.forEach((t) => {
      expect(t.ageGate).toBeFalsy();
      expect(['ordinary', 'personal']).toContain(t.sensitivity);
      expect(t.points.taskPoints).toBeGreaterThan(0);
    });
  });

  test('the daily target is a catalog profile the assigned quests can reach', () => {
    expect(dailyTargetFor(45)).toBe(40);
    expect(dailyTargetFor(26)).toBe(20);
    expect(dailyTargetFor(12)).toBe(12);
  });
});

describe('skip and replacement', () => {
  test('replacements stay in the same family with a comparable reward', () => {
    const skipped = selectDailyTasks(catalog.tasks, ctx(), 3)[0];
    const options = replacementOptions(skipped, {
      tasks: catalog.tasks,
      legacySpecialQuests: [],
      parents: getSpecialQuestParents(),
      assignedTodayTaskIds: new Set([skipped.id]),
      ctx: ctx(),
    });
    expect(options.length).toBeGreaterThan(0);
    options.forEach((o) => {
      expect(questFamily(o.task.category)).toBe(questFamily(skipped.category));
      expect(o.task.id).not.toBe(skipped.id);
    });
  });

  test('no replacement is invented when the catalog has none', () => {
    const skipped = selectDailyTasks(catalog.tasks, ctx(), 3)[0];
    const options = replacementOptions(skipped, {
      tasks: [skipped],
      legacySpecialQuests: [],
      parents: [],
      assignedTodayTaskIds: new Set([skipped.id]),
      ctx: ctx(),
    });
    expect(options).toEqual([]);
  });
});

describe('ledger, diamonds and unlocks', () => {
  const levels = catalog.levels;

  test('the same reward key never pays twice', () => {
    const once = appendLedger([], xpEntry('task:a', 15));
    expect(appendLedger(once, xpEntry('task:a', 15))).toBe(once);
    expect(ledgerTotals(once).xp).toBe(15);
  });

  test('level-clear diamonds are issued exactly once per level', () => {
    const xp = levels[3].requiredCumulativeXp; // reaches level 4
    let ledger = [xpEntry('task:big', xp)];
    ledger = settleMilestones(ledger, { levels, gameDate: '2026-10-23', dailyTarget: 0, now: 'now' });
    const again = settleMilestones(ledger, { levels, gameDate: '2026-10-23', dailyTarget: 0, now: 'now' });
    expect(again).toBe(ledger);
    expect(ledger.filter((e) => e.kind === 'level_clear').map((e) => e.key)).toEqual([
      'level_clear:1',
      'level_clear:2',
      'level_clear:3',
    ]);
    expect(ledgerTotals(ledger).diamonds).toBe(15);
  });

  test('daily goal pays once per date only when reached', () => {
    let ledger = [xpEntry('task:a', 10, '2026-10-23', 15)];
    ledger = settleMilestones(ledger, { levels, gameDate: '2026-10-23', dailyTarget: 20, now: 'now' });
    expect(ledger.some((e) => e.kind === 'daily_goal')).toBe(false);
    ledger = appendLedger(ledger, xpEntry('task:b', 10, '2026-10-23', 8));
    ledger = settleMilestones(ledger, { levels, gameDate: '2026-10-23', dailyTarget: 20, now: 'now' });
    ledger = settleMilestones(ledger, { levels, gameDate: '2026-10-23', dailyTarget: 20, now: 'now' });
    expect(ledger.filter((e) => e.kind === 'daily_goal')).toHaveLength(1);
  });

  test('unlocks: level gate, insufficient diamonds, atomic spend, no double spend', () => {
    const rich: LedgerEntry[] = [{ ...xpEntry('grant', 0), kind: 'level_clear', diamonds: 100 }];
    const base = { ledger: rich, entitlements: [] as string[], gameDate: '2026-10-23', now: 'now' };
    expect(purchaseUnlock({ ...base, level: 1 }, 'extra_daily_quest')).toEqual({ ok: false, block: 'LEVEL_TOO_LOW' });
    expect(purchaseUnlock({ ...base, ledger: [], level: 5 }, 'extra_daily_quest')).toEqual({ ok: false, block: 'INSUFFICIENT_DIAMONDS' });
    const bought = purchaseUnlock({ ...base, level: 5 }, 'extra_daily_quest');
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(ledgerTotals(bought.ledger).diamonds).toBe(70);
    expect(bought.entitlements).toEqual(['extra_daily_quest']);
    expect(purchaseUnlock({ ...base, ledger: bought.ledger, entitlements: bought.entitlements, level: 5 }, 'extra_daily_quest')).toEqual({ ok: false, block: 'OWNED' });
    expect(purchaseUnlock({ ...base, level: 5 }, 'not_a_feature')).toEqual({ ok: false, block: 'UNKNOWN_FEATURE' });
  });

  test('old saves import earned XP once and drop the old coin balance', () => {
    const migrated = migrateQuestState({ xp: 240, coins: 90 });
    expect(migrated.coins).toBeUndefined();
    expect(ledgerTotals(migrated.rewardLedger as LedgerEntry[]).xp).toBe(240);
    const twice = migrateQuestState(migrated);
    expect(ledgerTotals(twice.rewardLedger as LedgerEntry[]).xp).toBe(240);
  });
});
