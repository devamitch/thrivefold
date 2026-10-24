/**
 * Thrivefold progression: pure, deterministic and idempotent.
 *
 * - Every reward is an entry in an append-only ledger keyed by an idempotency key, so the same
 *   completion, level clear or daily goal can never pay twice, and balances are always the
 *   sum of the ledger.
 * - Levels come from the v3 catalog's 1,000 authored level records, including chapter
 *   checkpoints that must be completed before advancing past them.
 * - Daily quests are chosen per date from eligible, supported, released catalog tasks, and a
 *   skipped quest can only be replaced by an eligible task from the same family with a
 *   comparable reward.
 */
import economy from '../../content/game/progression_economy.v1.json';
import { ProductExperience } from '../../theme/tokens';
import { isObjectiveSupported } from './objectives';
import type { Capacity } from './setupProfile';
import type { LevelDefinition, SpecialQuestParent, TaskDefinition } from './types';

export const ECONOMY_VERSION = economy.version;

// ---------------------------------------------------------------- ledger

export type LedgerKind = 'task_reward' | 'setup_reward' | 'daily_goal' | 'level_clear' | 'unlock_spend' | 'legacy_import';

export interface LedgerEntry {
  /** Idempotency key: the same key is never applied twice. */
  key: string;
  kind: LedgerKind;
  xp: number;
  diamonds: number;
  /** Contribution toward the daily goal of `gameDate`. */
  taskPoints: number;
  skillXp?: Record<string, number>;
  gameDate: string;
  sourceId: string;
  policyVersion: string;
  createdAt: string;
}

export function hasLedgerKey(ledger: LedgerEntry[], key: string): boolean {
  return ledger.some((e) => e.key === key);
}

/** Appends unless the key already exists. Returns the same array when nothing changed. */
export function appendLedger(ledger: LedgerEntry[], entry: LedgerEntry): LedgerEntry[] {
  return hasLedgerKey(ledger, entry.key) ? ledger : [...ledger, entry];
}

export interface LedgerTotals {
  xp: number;
  diamonds: number;
  skillXp: Record<string, number>;
}

export function ledgerTotals(ledger: LedgerEntry[]): LedgerTotals {
  const skillXp: Record<string, number> = {};
  let xp = 0;
  let diamonds = 0;
  for (const e of ledger) {
    xp += e.xp;
    diamonds += e.diamonds;
    for (const [skill, v] of Object.entries(e.skillXp ?? {})) skillXp[skill] = (skillXp[skill] ?? 0) + v;
  }
  return { xp, diamonds, skillXp };
}

/** Daily-goal points actually earned on a game date. */
export function dailyPointsFor(ledger: LedgerEntry[], gameDate: string): number {
  return ledger
    .filter((e) => e.kind === 'task_reward' && e.gameDate === gameDate)
    .reduce((sum, e) => sum + e.taskPoints, 0);
}

// ---------------------------------------------------------------- levels

export interface LevelProgress {
  level: number;
  definition: LevelDefinition;
  next: LevelDefinition | null;
  xpIntoLevel: number;
  xpForNext: number;
  /** Set when enough XP has been earned but a chapter checkpoint blocks advancement. */
  blockedByCheckpointId: string | null;
}

export function levelProgress(
  totalXp: number,
  levels: LevelDefinition[],
  completedCheckpoints: ReadonlySet<string> = new Set(),
): LevelProgress {
  const sorted = levels.length ? levels : [fallbackLevel(1)];
  let index = 0;
  let blockedBy: string | null = null;
  for (let i = 1; i < sorted.length; i++) {
    if (totalXp < sorted[i].requiredCumulativeXp) break;
    const gate = sorted[i - 1].checkpointId;
    if (gate && !completedCheckpoints.has(gate)) {
      blockedBy = gate;
      break;
    }
    index = i;
  }
  const definition = sorted[index];
  const next = sorted[index + 1] ?? null;
  const xpForNext = next ? next.requiredCumulativeXp - definition.requiredCumulativeXp : 0;
  return {
    level: definition.level,
    definition,
    next,
    xpIntoLevel: Math.max(0, Math.min(xpForNext || Infinity, totalXp - definition.requiredCumulativeXp)),
    xpForNext,
    blockedByCheckpointId: blockedBy,
  };
}

function fallbackLevel(level: number): LevelDefinition {
  return { level, chapterNumber: 1, title: `Level ${level}`, arc: '', requiredCumulativeXp: 0, unlockedFeatures: [] };
}

export function diamondsForLevelClear(level: LevelDefinition): number {
  const rule = economy.diamonds.levelClear;
  if (level.checkpointId) return rule.chapterCheckpointLevel;
  if (level.level % 10 === 0) return rule.everyTenthLevel;
  return rule.default;
}

/**
 * Issues every reward that current progress has earned but the ledger does not yet hold:
 * one diamond award per level cleared and one daily-goal award per game date. Idempotent.
 */
export function settleMilestones(
  ledger: LedgerEntry[],
  ctx: {
    levels: LevelDefinition[];
    completedCheckpoints?: ReadonlySet<string>;
    gameDate: string;
    dailyTarget: number;
    now: string;
  },
): LedgerEntry[] {
  let next = ledger;
  const { level } = levelProgress(ledgerTotals(next).xp, ctx.levels, ctx.completedCheckpoints);
  for (const def of ctx.levels) {
    if (def.level >= level) break;
    next = appendLedger(next, {
      key: `level_clear:${def.level}`,
      kind: 'level_clear',
      xp: 0,
      diamonds: diamondsForLevelClear(def),
      taskPoints: 0,
      gameDate: ctx.gameDate,
      sourceId: `level-${def.level}`,
      policyVersion: ECONOMY_VERSION,
      createdAt: ctx.now,
    });
  }
  if (ctx.dailyTarget > 0 && dailyPointsFor(next, ctx.gameDate) >= ctx.dailyTarget) {
    next = appendLedger(next, {
      key: `daily_goal:${ctx.gameDate}`,
      kind: 'daily_goal',
      xp: 0,
      diamonds: economy.diamonds.dailyGoal,
      taskPoints: 0,
      gameDate: ctx.gameDate,
      sourceId: `daily-goal-${ctx.gameDate}`,
      policyVersion: ECONOMY_VERSION,
      createdAt: ctx.now,
    });
  }
  return next;
}

// ---------------------------------------------------------------- daily target

const TARGET_PROFILES = [
  { id: 'light', points: 20 },
  { id: 'standard', points: 40 },
  { id: 'extended', points: 60 },
] as const;

/**
 * The day's target snapshot: the chosen catalog profile, lowered to the largest profile the
 * assigned quests can actually reach so the goal is never impossible.
 */
export function dailyTargetFor(assignedPoints: number, profile: 'light' | 'standard' | 'extended' = 'standard'): number {
  const wanted = TARGET_PROFILES.find((p) => p.id === profile)!.points;
  if (wanted <= assignedPoints) return wanted;
  const reachable = [...TARGET_PROFILES].reverse().find((p) => p.points <= assignedPoints);
  return reachable ? reachable.points : assignedPoints;
}

// ---------------------------------------------------------------- task families

export type QuestFamily = 'movement' | 'mind' | 'rhythm' | 'nutrition' | 'growth';

const FAMILY_BY_CATEGORY: Record<string, QuestFamily> = {
  movement: 'movement',
  mens_vitality: 'movement',
  cycle_care: 'movement',
  affirming_care: 'movement',
  bone_health: 'movement',
  mindfulness: 'mind',
  breathing: 'mind',
  mental_wellbeing: 'mind',
  self_awareness: 'mind',
  journaling: 'mind',
  sensory_wellbeing: 'mind',
  self_discovery: 'mind',
  sleep: 'rhythm',
  recovery: 'rhythm',
  routine: 'rhythm',
  habits: 'rhythm',
  workload: 'rhythm',
  daily_environment: 'rhythm',
  personal_care: 'rhythm',
  oral_health: 'rhythm',
  nutrition: 'nutrition',
};

/** Home and quest filters use these families: Movement, Mind, Rhythm, Nutrition (+ Growth). */
export function questFamily(category: string): QuestFamily {
  return FAMILY_BY_CATEGORY[category] ?? 'growth';
}

// ---------------------------------------------------------------- eligibility

export interface AssignmentContext {
  experience: ProductExperience;
  gameDate: string;
  level: number;
  /** Stable per person (e.g. their local id), so two people don't get identical days. */
  seed: string;
  /** Task ids the person has already been rewarded for (prerequisites). */
  completedTaskIds: ReadonlySet<string>;
  /** Task ids assigned on recent days, avoided when there are alternatives. */
  recentTaskIds: ReadonlySet<string>;
  /** Families the person asked for help with in onboarding, most wanted first. */
  preferredFamilies?: QuestFamily[];
  /** From the person's own baseline answers (setupProfile.fitFor); orders difficulty. */
  capacity?: Capacity;
  /** Longest quest to offer when enough shorter ones exist. */
  maxMinutes?: number | null;
}

/** Onboarding goals and the quest family each one asks for. */
export const GOAL_FAMILIES: Record<string, QuestFamily> = {
  'More energy': 'movement',
  'Better sleep': 'rhythm',
  'Less stress': 'mind',
  'Move more': 'movement',
  'Mobility and posture': 'movement',
  'Steady daily habits': 'rhythm',
  'Emotional support': 'mind',
  'Eat well': 'nutrition',
  'Learn about my health': 'growth',
  'Understand my cycle': 'growth',
  'Period comfort': 'movement',
  'PMS and mood': 'mind',
  'Strength training': 'movement',
  'Desk-work aches': 'movement',
  'Focus': 'mind',
  'Affirming self-care': 'mind',
  'Body ease': 'movement',
};

export function familiesForGoals(goals: readonly string[]): QuestFamily[] {
  return [...new Set(goals.map((g) => GOAL_FAMILIES[g]).filter((f): f is QuestFamily => Boolean(f)))];
}

const AUTO_SENSITIVITY = new Set(['ordinary', 'personal']);

/**
 * True when a task may be put in front of this person automatically: in their experience,
 * released, rewarding, not sensitive or age-gated, level-appropriate, prerequisites met, and
 * its objective has a registered evaluator in this build.
 */
export function isAutoAssignable(task: TaskDefinition, ctx: AssignmentContext): boolean {
  const scopes = task.experienceScopes as string[];
  if (!scopes.includes('shared') && !scopes.includes(ctx.experience)) return false;
  if ((task.contentStatus ?? 'authored') !== 'authored') return false;
  if (task.ageGate) return false;
  if (!AUTO_SENSITIVITY.has(task.sensitivity ?? 'ordinary')) return false;
  if (task.points.taskPoints <= 0 || task.dailyGoalEligible === false) return false;
  // minimumLevel orders the curriculum (see selectDailyTasks) rather than blocking: the catalog
  // places basic movement, sleep and nutrition in later chapters, and a health app must offer
  // them from day one. maximumLevel still retires tasks. (DECISIONS: GAME-LEVEL-GATE)
  if (ctx.level > task.levelEligibility.maximumLevel) return false;
  if (!task.prerequisiteTaskIds.every((id) => ctx.completedTaskIds.has(id))) return false;
  return isObjectiveSupported(task);
}

/** FNV-1a: stable 32-bit hash for deterministic per-day ordering. */
export function stableHash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Picks the day's quests: the same result for the same person and date, different families
 * where possible, at least one experience-specific task when one exists, and recent tasks
 * only when nothing else is available.
 */
export function selectDailyTasks(tasks: TaskDefinition[], ctx: AssignmentContext, slots: number): TaskDefinition[] {
  const eligible = tasks
    .filter((t) => isAutoAssignable(t, ctx))
    .map((t) => ({ t, h: stableHash(`${ctx.seed}:${ctx.gameDate}:${t.id}`) }))
    .sort((a, b) => a.h - b.h)
    .map((x) => x.t);
  const fitted = fitToCapability(eligible, ctx, slots);
  const fresh = fitted.filter((t) => !ctx.recentTaskIds.has(t.id));
  const pool = fresh.length >= slots ? fresh : [...fresh, ...fitted.filter((t) => ctx.recentTaskIds.has(t.id))];

  const picked: TaskDefinition[] = [];
  // One quest from the person's current chapter, the rest spread across families.
  const inChapter = pool.find((t) => t.levelEligibility.minimumLevel <= ctx.level);
  if (inChapter) picked.push(inChapter);
  // Then the families the person asked for, one each, before filling the rest.
  for (const family of ctx.preferredFamilies ?? []) {
    if (picked.length >= slots) break;
    if (picked.some((p) => questFamily(p.category) === family)) continue;
    const match = pool.find((t) => !picked.includes(t) && questFamily(t.category) === family);
    if (match) picked.push(match);
  }
  for (const t of pool) {
    if (picked.length >= slots) break;
    if (picked.includes(t)) continue;
    if (picked.some((p) => questFamily(p.category) === questFamily(t.category))) continue;
    picked.push(t);
  }
  for (const t of pool) {
    if (picked.length >= slots) break;
    if (!picked.includes(t)) picked.push(t);
  }
  return picked.slice(0, slots);
}

/**
 * Applies the person's capability: drops quests longer than their routine allows (only while
 * enough shorter ones remain) and puts the difficulty that suits them first, keeping the
 * per-day hash order within each tier. Gentle starts with starter quests, strong with steady.
 */
export function fitToCapability(tasks: TaskDefinition[], ctx: AssignmentContext, slots: number): TaskDefinition[] {
  let fitted = tasks;
  if (ctx.maxMinutes) {
    const short = tasks.filter((t) => t.estimatedDurationMinutes <= ctx.maxMinutes!);
    if (short.length >= slots) fitted = short;
  }
  if (!ctx.capacity || ctx.capacity === 'steady') return fitted;
  const first = ctx.capacity === 'gentle' ? 'starter' : 'steady';
  return [...fitted.filter((t) => t.difficulty === first), ...fitted.filter((t) => t.difficulty !== first)];
}

// ---------------------------------------------------------------- replacement

export interface ReplacementOption {
  task: TaskDefinition;
  /** The v3 special quest that offered this task, when it came from one. */
  specialQuestId: string | null;
  specialQuestTitle: string | null;
}

/** Comparable reward: within 50% (and never less than 3 points apart is allowed). */
export function withinRewardBand(skippedPoints: number, candidatePoints: number): boolean {
  return Math.abs(candidatePoints - skippedPoints) <= Math.max(3, Math.round(skippedPoints * 0.5));
}

/**
 * Same-family replacements for a skipped quest: child tasks of catalog special quests that
 * replace the skipped category, v1 special quests and regular tasks of the same family, all
 * eligible, distinct from today's assignments and with a comparable reward. Empty when the
 * catalog has nothing suitable; the caller must say so rather than invent a task.
 */
export function replacementOptions(
  skipped: TaskDefinition,
  input: {
    tasks: TaskDefinition[];
    legacySpecialQuests: TaskDefinition[];
    parents: SpecialQuestParent[];
    assignedTodayTaskIds: ReadonlySet<string>;
    ctx: AssignmentContext;
    limit?: number;
  },
): ReplacementOption[] {
  const family = questFamily(skipped.category);
  const byId = new Map(input.tasks.map((t) => [t.id, t]));
  const options = new Map<string, ReplacementOption>();
  const consider = (task: TaskDefinition | undefined, parent: SpecialQuestParent | null) => {
    if (!task || task.id === skipped.id || input.assignedTodayTaskIds.has(task.id) || options.has(task.id)) return;
    if (!isAutoAssignable(task, input.ctx)) return;
    if (!withinRewardBand(skipped.points.taskPoints, task.points.taskPoints)) return;
    if (!parent && questFamily(task.category) !== family) return;
    options.set(task.id, { task, specialQuestId: parent?.id ?? null, specialQuestTitle: parent?.title ?? null });
  };

  for (const parent of input.parents) {
    const [lo, hi] = parent.eligibleLevelRange;
    if (input.ctx.level < lo || input.ctx.level > hi) continue;
    const coversSkipped = parent.replacesCategories.some((c) => c === skipped.category || questFamily(c) === family);
    if (!coversSkipped) continue;
    for (const id of parent.taskIds) {
      const child = byId.get(id);
      // The replacement must stay in the skipped quest's family.
      if (child && questFamily(child.category) === family) consider(child, parent);
    }
  }
  for (const t of input.legacySpecialQuests) consider(t, null);
  for (const t of input.tasks) consider(t, null);

  return [...options.values()]
    .sort(
      (a, b) =>
        Number(b.specialQuestId !== null) - Number(a.specialQuestId !== null) ||
        Number(b.task.category === skipped.category) - Number(a.task.category === skipped.category) ||
        Math.abs(a.task.points.taskPoints - skipped.points.taskPoints) -
          Math.abs(b.task.points.taskPoints - skipped.points.taskPoints) ||
        stableHash(`${input.ctx.seed}:${input.ctx.gameDate}:${a.task.id}`) -
          stableHash(`${input.ctx.seed}:${input.ctx.gameDate}:${b.task.id}`),
    )
    .slice(0, input.limit ?? 3);
}

// ---------------------------------------------------------------- unlocks

export interface FeatureUnlock {
  id: string;
  kind: 'quest_slot' | 'emblem_set';
  title: string;
  description: string;
  cost: number;
  minLevel: number;
  emblems?: string[];
}

export const FEATURE_UNLOCKS: FeatureUnlock[] = economy.unlocks as FeatureUnlock[];
export const FREE_EMBLEMS: string[] = economy.freeEmblems;
export const BASE_DAILY_SLOTS: number = economy.baseDailyQuestSlots;

export type UnlockBlock = 'OWNED' | 'LEVEL_TOO_LOW' | 'INSUFFICIENT_DIAMONDS' | 'UNKNOWN_FEATURE';

export function unlockStatus(
  unlock: FeatureUnlock | undefined,
  state: { level: number; diamonds: number; entitlements: readonly string[] },
): { canUnlock: boolean; block: UnlockBlock | null } {
  if (!unlock) return { canUnlock: false, block: 'UNKNOWN_FEATURE' };
  if (state.entitlements.includes(unlock.id)) return { canUnlock: false, block: 'OWNED' };
  if (state.level < unlock.minLevel) return { canUnlock: false, block: 'LEVEL_TOO_LOW' };
  if (state.diamonds < unlock.cost) return { canUnlock: false, block: 'INSUFFICIENT_DIAMONDS' };
  return { canUnlock: true, block: null };
}

/**
 * Spends diamonds and grants the entitlement together, or changes nothing. A repeated request
 * for an owned feature never spends again.
 */
export function purchaseUnlock(
  input: { ledger: LedgerEntry[]; entitlements: string[]; level: number; gameDate: string; now: string },
  featureId: string,
): { ok: true; ledger: LedgerEntry[]; entitlements: string[] } | { ok: false; block: UnlockBlock } {
  const unlock = FEATURE_UNLOCKS.find((u) => u.id === featureId);
  const { diamonds } = ledgerTotals(input.ledger);
  const status = unlockStatus(unlock, { level: input.level, diamonds, entitlements: input.entitlements });
  if (!status.canUnlock || !unlock) return { ok: false, block: status.block ?? 'UNKNOWN_FEATURE' };
  const ledger = appendLedger(input.ledger, {
    key: `unlock:${unlock.id}`,
    kind: 'unlock_spend',
    xp: 0,
    diamonds: -unlock.cost,
    taskPoints: 0,
    gameDate: input.gameDate,
    sourceId: unlock.id,
    policyVersion: ECONOMY_VERSION,
    createdAt: input.now,
  });
  if (ledger === input.ledger) return { ok: false, block: 'OWNED' };
  return { ok: true, ledger, entitlements: [...input.entitlements, unlock.id] };
}

export function ownedEmblems(entitlements: readonly string[]): string[] {
  return [
    ...FREE_EMBLEMS,
    ...FEATURE_UNLOCKS.filter((u) => u.kind === 'emblem_set' && entitlements.includes(u.id)).flatMap((u) => u.emblems ?? []),
  ];
}

export function dailySlotsFor(entitlements: readonly string[]): number {
  return BASE_DAILY_SLOTS + (entitlements.includes('extra_daily_quest') ? 1 : 0);
}
