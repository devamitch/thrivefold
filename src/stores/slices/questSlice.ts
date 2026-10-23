import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import {
  getGameCatalog,
  getSpecialQuestParents,
  getTaskById,
} from '../../domain/game/gameCatalogService';
import { evaluateObjective, objectiveFormFor, type ObjectiveEvidence } from '../../domain/game/objectives';
import {
  appendLedger,
  dailyPointsFor,
  dailySlotsFor,
  dailyTargetFor,
  familiesForGoals,
  ECONOMY_VERSION,
  ledgerTotals,
  levelProgress,
  ownedEmblems,
  purchaseUnlock as purchaseUnlockPure,
  replacementOptions,
  selectDailyTasks,
  settleMilestones,
  type AssignmentContext,
  type LedgerEntry,
  type ReplacementOption,
  type UnlockBlock,
} from '../../domain/game/progression';
import type { TaskAssignment, TaskDefinition, VerificationResult } from '../../domain/game/types';

/** Reward events waiting to be confirmed by the server (only used with an account). */
export type SyncItem =
  | { kind: 'claim'; key: string; assignmentId: string; taskId: string; gameDate: string }
  | { kind: 'unlock'; key: string; featureId: string };

/** Screen-facing view of an assignment. */
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
  difficulty: string;
  status: TaskAssignment['status'];
  taskPoints: number;
  taskId: string;
  isReplacement: boolean;
}

export interface QuestSlice {
  /** Append-only reward ledger; every balance below is derived from it. */
  rewardLedger: LedgerEntry[];
  entitlements: string[];
  /** Chapter checkpoints completed (capstones); required to advance past chapter ends. */
  completedCheckpoints: string[];
  selectedEmblem: string;
  /** Task ids assigned per recent date, so tomorrow's set avoids repeats. */
  assignmentHistory: { date: string; taskIds: string[] }[];
  dailyAssignments: TaskAssignment[];
  /** Target snapshot for `dailyTargetDate`; stable for the day. */
  dailyPointsTarget: number;
  dailyTargetDate: string | null;
  pendingSync: SyncItem[];

  // Derived from the ledger and assignments, kept in state for cheap selectors.
  xp: number;
  level: number;
  diamonds: number;
  streak: number;
  questsCompleted: number;
  achievements: string[];
  todayQuests: Quest[];
  dailyPoints: number;
  dailyGoalReached: boolean;

  ensureDailyQuests: () => void;
  skipDailyTask: (assignmentId: string, reason?: string) => boolean;
  getReplacementOptions: (assignmentId: string) => ReplacementOption[];
  acceptReplacement: (skippedAssignmentId: string, taskId: string) => boolean;
  submitQuestEvidence: (assignmentId: string, evidence: ObjectiveEvidence) => VerificationResult;
  purchaseUnlock: (featureId: string) => { ok: boolean; block?: UnlockBlock };
  setEmblem: (emblem: string) => void;
  resolveSync: (key: string) => void;
  unlockAchievement: (achievementId: string) => void;
}

const today = () => formatLocalDate(new Date());

const ACTIVE_STATUSES: TaskAssignment['status'][] = ['assigned', 'in_progress', 'rejected'];
const DONE_STATUSES: TaskAssignment['status'][] = ['verified', 'self_reported'];

function projectQuest(asg: TaskAssignment): Quest {
  const def = getTaskById(asg.taskId);
  return {
    id: asg.assignmentId,
    title: def?.title ?? 'Quest',
    description: def?.shortDescription ?? '',
    category: def?.category ?? 'growth',
    durationMinutes: def?.estimatedDurationMinutes ?? 5,
    xpReward: def?.points.xp ?? 0,
    isCompleted: DONE_STATUSES.includes(asg.status),
    completedAt: asg.completedAt,
    difficulty: def?.difficulty ?? 'standard',
    status: asg.status,
    taskPoints: def?.points.taskPoints ?? 0,
    taskId: asg.taskId,
    isReplacement: asg.isSpecialQuestReplacement,
  };
}

/** Consecutive game dates (ending today or yesterday) on which the daily goal was reached. */
function goalStreak(ledger: LedgerEntry[], date: string): number {
  const days = new Set(ledger.filter((e) => e.kind === 'daily_goal').map((e) => e.gameDate));
  const cursor = new Date(`${date}T12:00:00`);
  if (!days.has(formatLocalDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(formatLocalDate(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** Recomputes every derived field from the ledger and today's assignments. */
function derive(
  state: Pick<QuestSlice, 'rewardLedger' | 'dailyAssignments' | 'dailyPointsTarget' | 'completedCheckpoints'>,
): Pick<
  QuestSlice,
  'xp' | 'level' | 'diamonds' | 'streak' | 'questsCompleted' | 'todayQuests' | 'dailyPoints' | 'dailyGoalReached'
> {
  const date = today();
  const totals = ledgerTotals(state.rewardLedger);
  const progress = levelProgress(totals.xp, getGameCatalog().levels, new Set(state.completedCheckpoints));
  const dailyPoints = dailyPointsFor(state.rewardLedger, date);
  return {
    xp: totals.xp,
    level: progress.level,
    diamonds: totals.diamonds,
    streak: goalStreak(state.rewardLedger, date),
    questsCompleted: state.rewardLedger.filter((e) => e.kind === 'task_reward').length,
    todayQuests: state.dailyAssignments.filter((a) => a.assignedDate === date).map(projectQuest),
    dailyPoints,
    dailyGoalReached: state.dailyPointsTarget > 0 && dailyPoints >= state.dailyPointsTarget,
  };
}

function assignmentContext(state: RootState, date: string): AssignmentContext {
  const recentDates = new Set<string>();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() - i);
    recentDates.add(formatLocalDate(d));
  }
  return {
    experience: state.experience,
    gameDate: date,
    level: state.level,
    seed: state.user?.id ?? 'local',
    completedTaskIds: new Set(state.rewardLedger.filter((e) => e.kind === 'task_reward').map((e) => e.sourceId)),
    recentTaskIds: new Set(
      state.assignmentHistory.filter((h) => recentDates.has(h.date)).flatMap((h) => h.taskIds),
    ),
    preferredFamilies: familiesForGoals(state.onboarding?.goals ?? []),
  };
}

function rejection(assignmentId: string, taskId: string, reasonCodes: string[]): VerificationResult {
  return {
    success: false,
    status: 'rejected',
    assignmentId,
    taskId,
    reasonCodes,
    earnedTaskPoints: 0,
    earnedXp: 0,
    earnedCoins: 0,
    verifiedAt: new Date().toISOString(),
  };
}

export const createQuestSlice: StateCreator<RootState, [['zustand/persist', unknown]], [], QuestSlice> = (
  set,
  get,
) => {
  /** Applies a ledger/assignment change, settles level and daily-goal rewards, re-derives. */
  const commit = (patch: Partial<QuestSlice>) => {
    const s = { ...get(), ...patch };
    const ledger = settleMilestones(s.rewardLedger, {
      levels: getGameCatalog().levels,
      completedCheckpoints: new Set(s.completedCheckpoints),
      gameDate: today(),
      dailyTarget: s.dailyTargetDate === today() ? s.dailyPointsTarget : 0,
      now: new Date().toISOString(),
    });
    set({ ...patch, rewardLedger: ledger, ...derive({ ...s, rewardLedger: ledger }) });
  };

  return {
    rewardLedger: [],
    entitlements: [],
    completedCheckpoints: [],
    selectedEmblem: 'leaf',
    assignmentHistory: [],
    dailyAssignments: [],
    dailyPointsTarget: 0,
    dailyTargetDate: null,
    pendingSync: [],
    xp: 0,
    level: 1,
    diamonds: 0,
    streak: 0,
    questsCompleted: 0,
    achievements: [],
    todayQuests: [],
    dailyPoints: 0,
    dailyGoalReached: false,

    ensureDailyQuests: () => {
      const state = get();
      const date = today();
      if (!state.isOnboarded) return;
      const todays = state.dailyAssignments.filter((a) => a.assignedDate === date);
      // A set saved by an older build can point at tasks that no longer exist in the catalog;
      // it is replaced when nothing in it has been completed yet.
      const stale =
        todays.length > 0 &&
        todays.some((a) => !getTaskById(a.taskId) || !objectiveFormFor(getTaskById(a.taskId)!)) &&
        !todays.some((a) => DONE_STATUSES.includes(a.status));
      if (todays.length > 0 && !stale) {
        // Same day: keep the saved set; only re-derive (e.g. after a restart).
        commit({});
        return;
      }
      const tasks = selectDailyTasks(getGameCatalog().tasks, assignmentContext(state, date), dailySlotsFor(state.entitlements));
      const assignments: TaskAssignment[] = tasks.map((task, idx) => ({
        assignmentId: `asg_${date}_${task.id}_${idx}`,
        taskId: task.id,
        assignedDate: date,
        status: 'assigned',
        isSpecialQuestReplacement: false,
        earnedTaskPoints: 0,
        earnedXp: 0,
        earnedCoins: 0,
      }));
      const assignedPoints = tasks.reduce((sum, t) => sum + t.points.taskPoints, 0);
      commit({
        dailyAssignments: assignments,
        dailyPointsTarget: dailyTargetFor(assignedPoints),
        dailyTargetDate: date,
        assignmentHistory: [{ date, taskIds: tasks.map((t) => t.id) }, ...state.assignmentHistory].slice(0, 14),
      });
    },

    skipDailyTask: (assignmentId, reason) => {
      const state = get();
      const asg = state.dailyAssignments.find((a) => a.assignmentId === assignmentId);
      if (!asg || asg.assignedDate !== today() || !ACTIVE_STATUSES.includes(asg.status)) return false;
      commit({
        dailyAssignments: state.dailyAssignments.map((a) =>
          a.assignmentId === assignmentId ? { ...a, status: 'skipped', skipReason: reason ?? 'Skipped' } : a,
        ),
      });
      return true;
    },

    getReplacementOptions: (assignmentId) => {
      const state = get();
      const asg = state.dailyAssignments.find((a) => a.assignmentId === assignmentId);
      if (!asg || asg.assignedDate !== today()) return [];
      if (state.dailyAssignments.some((a) => a.replacedAssignmentId === assignmentId)) return [];
      const skipped = getTaskById(asg.taskId);
      if (!skipped) return [];
      const catalog = getGameCatalog();
      return replacementOptions(skipped, {
        tasks: catalog.tasks,
        legacySpecialQuests: catalog.specialQuests as TaskDefinition[],
        parents: getSpecialQuestParents(),
        assignedTodayTaskIds: new Set(
          state.dailyAssignments.filter((a) => a.assignedDate === asg.assignedDate).map((a) => a.taskId),
        ),
        ctx: assignmentContext(state, asg.assignedDate),
      });
    },

    acceptReplacement: (skippedAssignmentId, taskId) => {
      const state = get();
      // Replacing implies skipping; skipping awards nothing and keeps earlier points.
      const original = state.dailyAssignments.find((a) => a.assignmentId === skippedAssignmentId);
      if (!original || original.assignedDate !== today()) return false;
      if (ACTIVE_STATUSES.includes(original.status)) get().skipDailyTask(skippedAssignmentId, 'Replaced');
      const option = get()
        .getReplacementOptions(skippedAssignmentId)
        .find((o) => o.task.id === taskId);
      const current = get();
      const skipped = current.dailyAssignments.find((a) => a.assignmentId === skippedAssignmentId);
      if (!option || !skipped || skipped.status !== 'skipped') return false;
      const replacement: TaskAssignment = {
        assignmentId: `asg_${skipped.assignedDate}_${option.task.id}_r${current.dailyAssignments.length}`,
        taskId: option.task.id,
        assignedDate: skipped.assignedDate,
        status: 'assigned',
        isSpecialQuestReplacement: true,
        replacedAssignmentId: skippedAssignmentId,
        specialQuestId: option.specialQuestId,
        earnedTaskPoints: 0,
        earnedXp: 0,
        earnedCoins: 0,
      };
      commit({
        dailyAssignments: [
          ...current.dailyAssignments.map((a) =>
            a.assignmentId === skippedAssignmentId ? { ...a, status: 'replaced' as const } : a,
          ),
          replacement,
        ],
      });
      return true;
    },

    submitQuestEvidence: (assignmentId, evidence) => {
      const state = get();
      const asg = state.dailyAssignments.find((a) => a.assignmentId === assignmentId);
      if (!asg) return rejection(assignmentId, '', ['UNKNOWN_ASSIGNMENT']);
      if (DONE_STATUSES.includes(asg.status)) return rejection(assignmentId, asg.taskId, ['ALREADY_COMPLETED']);
      if (!ACTIVE_STATUSES.includes(asg.status)) return rejection(assignmentId, asg.taskId, ['ASSIGNMENT_NOT_ACTIVE']);
      if (asg.assignedDate !== today()) return rejection(assignmentId, asg.taskId, ['STALE_ASSIGNMENT']);
      const task = getTaskById(asg.taskId);
      const form = task ? objectiveFormFor(task) : null;
      if (!task || !form) return rejection(assignmentId, asg.taskId, ['UNSUPPORTED_OBJECTIVE']);

      const reasons = evaluateObjective(form, evidence, task.instructions);
      if (reasons.length > 0) {
        commit({
          dailyAssignments: state.dailyAssignments.map((a) =>
            a.assignmentId === assignmentId ? { ...a, status: 'rejected', lastRejectionCodes: reasons } : a,
          ),
        });
        return rejection(assignmentId, task.id, reasons);
      }

      const now = new Date().toISOString();
      const status: TaskAssignment['status'] = task.verificationClass === 'self_reported' ? 'self_reported' : 'verified';
      const skillXp = Object.fromEntries(task.skillOutcomes.map((o) => [o.skillId, o.skillXp]));
      const ledger = appendLedger(state.rewardLedger, {
        key: `task:${assignmentId}`,
        kind: 'task_reward',
        xp: task.points.xp,
        diamonds: 0,
        taskPoints: task.dailyGoalEligible === false ? 0 : task.points.taskPoints,
        skillXp,
        gameDate: asg.assignedDate,
        sourceId: task.id,
        policyVersion: `${task.verificationPolicyId}@${ECONOMY_VERSION}`,
        createdAt: now,
      });
      commit({
        rewardLedger: ledger,
        pendingSync: [
          ...state.pendingSync,
          { kind: 'claim', key: `task:${assignmentId}`, assignmentId, taskId: task.id, gameDate: asg.assignedDate },
        ],
        dailyAssignments: state.dailyAssignments.map((a) =>
          a.assignmentId === assignmentId
            ? {
                ...a,
                status,
                completedAt: now,
                earnedTaskPoints: task.points.taskPoints,
                earnedXp: task.points.xp,
                verificationClass: task.verificationClass,
                lastRejectionCodes: [],
                evidenceAnswers: evidence.answers,
              }
            : a,
        ),
      });
      return {
        success: true,
        status,
        assignmentId,
        taskId: task.id,
        reasonCodes: [status === 'verified' ? 'OBJECTIVE_EVIDENCE_ACCEPTED' : 'SELF_REPORT_ACCEPTED'],
        earnedTaskPoints: task.points.taskPoints,
        earnedXp: task.points.xp,
        earnedCoins: 0,
        verifiedAt: now,
      };
    },

    purchaseUnlock: (featureId) => {
      const state = get();
      const result = purchaseUnlockPure(
        {
          ledger: state.rewardLedger,
          entitlements: state.entitlements,
          level: state.level,
          gameDate: today(),
          now: new Date().toISOString(),
        },
        featureId,
      );
      if (!result.ok) return { ok: false, block: result.block };
      commit({
        rewardLedger: result.ledger,
        entitlements: result.entitlements,
        pendingSync: [...state.pendingSync, { kind: 'unlock', key: `unlock:${featureId}`, featureId }],
      });
      return { ok: true };
    },

    setEmblem: (emblem) => {
      if (ownedEmblems(get().entitlements).includes(emblem)) set({ selectedEmblem: emblem });
    },

    resolveSync: (key) => set((st) => ({ pendingSync: st.pendingSync.filter((i) => i.key !== key) })),

    unlockAchievement: (achievementId) =>
      set((state) =>
        state.achievements.includes(achievementId) ? state : { achievements: [...state.achievements, achievementId] },
      ),
  };
};

/** Cumulative XP needed to reach `level`, from the catalog. */
export const xpForLevel = (level: number): number =>
  getGameCatalog().levels.find((l) => l.level === level)?.requiredCumulativeXp ?? 0;

/**
 * Moves pre-ledger saves onto the ledger: XP already earned is imported once as a single
 * legacy entry; the old invented coin balance is not converted into diamonds.
 */
export function migrateQuestState(persisted: Record<string, unknown>): Record<string, unknown> {
  const xp = typeof persisted.xp === 'number' ? persisted.xp : 0;
  const ledger: LedgerEntry[] = Array.isArray(persisted.rewardLedger) ? (persisted.rewardLedger as LedgerEntry[]) : [];
  const now = new Date().toISOString();
  const migrated = { ...persisted };
  delete migrated.coins;
  delete migrated.todayQuests;
  migrated.rewardLedger =
    xp > 0
      ? appendLedger(ledger, {
          key: 'legacy_import:xp',
          kind: 'legacy_import',
          xp,
          diamonds: 0,
          taskPoints: 0,
          gameDate: formatLocalDate(new Date()),
          sourceId: 'pre-ledger-save',
          policyVersion: ECONOMY_VERSION,
          createdAt: now,
        })
      : ledger;
  return migrated;
}
