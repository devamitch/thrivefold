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
  type WorkoutFormEvidence,
  WORKOUT_REWARDS_PER_DAY,
  workoutRewardsOn,
  workoutRewardXp,
  checkInRewardXp,
} from '../../domain/game/progression';
import {
  EMPTY_BASELINE,
  fitFor,
  isSetupSectionAnswered,
  SETUP_REWARDS,
  setupLedgerKey,
  setupReward,
  type SetupSection,
} from '../../domain/game/setupProfile';
import type { TaskAssignment, TaskDefinition, VerificationResult } from '../../domain/game/types';
import { evidenceFromWorkout, type WorkoutFacts } from '../../domain/game/workoutEvidence';

/** Reward events waiting to be confirmed by the server (only used with an account). */
export type SyncItem =
  | { kind: 'claim'; key: string; assignmentId: string; taskId: string; gameDate: string }
  | { kind: 'unlock'; key: string; featureId: string }
  | { kind: 'setup'; key: string; section: SetupSection }
  | { kind: 'workout'; key: string; sessionId: string; gameDate: string; validFrames: number; formScore: number };

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

export type AchievementModalType =
  | 'daily_goal'
  | 'level_clear'
  | 'double_milestone'
  | 'slow_letters_unlocked'
  | 'workout_complete';

export interface AchievementModalPayload {
  type: AchievementModalType;
  title: string;
  subtitle: string;
  details?: string;
  level?: number;
  dailyPoints?: number;
  dailyPointsTarget?: number;
  diamondsEarned?: number;
  xpEarned?: number;
  workoutSummary?: {
    planTitle: string;
    minutes?: number;
    formScore?: number;
    setsOrReps?: string;
  };
  unlockedFeature?: 'letters';
  onDismiss?: () => void;
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
  achievementModal: AchievementModalPayload | null;

  ensureDailyQuests: () => void;
  /** Re-picks today's open quests after goals, limits or baseline change; done ones stay. */
  refitDailyQuests: () => void;
  /** Awards a setup step's fixed XP once, if the step has really been answered. */
  claimSetupReward: (section: SetupSection) => { awarded: boolean; xp: number };
  /** Evaluates and auto-claims XP for all answered setup sections that haven't been claimed yet. */
  autoClaimAnsweredSetupRewards: () => { claimedCount: number; totalXp: number };
  /** Synchronizes and auto-claims all answered setup steps into the ledger idempotently. */
  syncSetupRewards: () => { claimedCount: number; totalXp: number };
  /** Completes today's open meal-log quest from a meal the person logged in the app. */
  completeMealQuest: (description: string) => { title: string; xp: number } | null;
  /** Completes today's open hydration quest from water intake logged. */
  completeHydrationQuest: (glasses: number, dateStr?: string) => { title: string; xp: number } | null;
  /** Completes today's open check-in quest from a check-in the person logged. */
  completeCheckInQuest: (feelingOrMood: number, note?: string) => { title: string; xp: number } | null;
  /** Completes today's open sleep quest from sleep hours logged. */
  completeSleepQuest: (durationHours: number, restedRating?: number) => { title: string; xp: number } | null;
  /** Completes today's open symptom quest from symptoms recorded. */
  completeSymptomQuest: (symptom: string, dateStr?: string) => { title: string; xp: number } | null;
  /** Completes today's open reflection quest from a journal reflection written. */
  completeReflectionQuest: (content: string) => { title: string; xp: number } | null;
  /**
   * Completes today's open in-app guided exercise quest (e.g. grounding) from a finished,
   * timed breathing session of at least a minute. Other beta sessions never complete quests.
   */
  completePracticeQuest: (practice: 'breathing', elapsedSeconds: number) => { title: string; xp: number } | null;
  /**
   * Completes exactly the assignment a workout was started from, if that assignment's own
   * objective accepts the workout as evidence. Standalone workouts never complete quests.
   */
  completeAssignmentWithWorkout: (assignmentId: string, facts: WorkoutFacts) => { title: string; xp: number } | null;
  /**
   * Pays a finished practice session (eye games, voice, breathing, hand games…) once: fixed XP
   * plus a small score bonus, up to PRACTICE_REWARDS_PER_DAY a day. Never depends on health answers.
   */
  claimPracticeReward: (sessionKey: string, scoreBonus: number) => { awarded: boolean; xp: number };
  /** Pays a finished workout once: base XP, or ten times that with good camera-checked form. */
  claimWorkoutReward: (sessionId: string, form: WorkoutFormEvidence | null) => { awarded: boolean; xp: number; reason?: 'daily_limit' | 'duplicate' };
  /** Awards incremental XP and streak milestone bonuses for daily check-in once per date. */
  claimCheckInReward: (date: string, streak: number) => { awarded: boolean; xp: number; streakBonus: number; milestoneBonus: number };
  skipDailyTask: (assignmentId: string, reason?: string) => boolean;
  getReplacementOptions: (assignmentId: string) => ReplacementOption[];
  acceptReplacement: (skippedAssignmentId: string, taskId: string) => boolean;
  submitQuestEvidence: (assignmentId: string, evidence: ObjectiveEvidence) => VerificationResult;
  purchaseUnlock: (featureId: string) => { ok: boolean; block?: UnlockBlock };
  setEmblem: (emblem: string) => void;
  resolveSync: (key: string) => void;
  unlockAchievement: (achievementId: string) => void;
  showAchievementModal: (payload: AchievementModalPayload) => void;
  hideAchievementModal: () => void;
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
  const checkIn = state.checkInHistory?.find((c) => c.date === date);
  const fit = fitFor(setupAnswersOf(state), checkIn ?? null);
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
    preferredFamilies: [...new Set([...familiesForGoals(state.onboarding?.goals ?? []), ...fit.families])],
    capacity: fit.capacity,
    maxMinutes: fit.maxMinutes,
  };
}

function setupAnswersOf(state: RootState) {
  const o = state.onboarding;
  return {
    goals: o?.goals ?? [],
    constraints: o?.constraints ?? [],
    routineMinutes: o?.routineMinutes ?? null,
    diet: o?.diet ?? null,
    observances: o?.observances ?? [],
    baseline: { ...EMPTY_BASELINE, ...o?.baseline },
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
  /** Applies a ledger/assignment change, settles level and daily-goal rewards, re-derives, and surfaces achievement modals. */
  const commit = (patch: Partial<QuestSlice>) => {
    const stateBefore = get();
    const prevLevel = stateBefore.level;
    const prevDailyGoal = stateBefore.dailyGoalReached;
    const prevTarget = stateBefore.dailyPointsTarget;

    const s = { ...stateBefore, ...patch };
    const ledger = settleMilestones(s.rewardLedger, {
      levels: getGameCatalog().levels,
      completedCheckpoints: new Set(s.completedCheckpoints),
      gameDate: today(),
      dailyTarget: s.dailyTargetDate === today() ? s.dailyPointsTarget : 0,
      now: new Date().toISOString(),
    });
    const derived = derive({ ...s, rewardLedger: ledger });

    const levelCleared = prevLevel > 0 && derived.level > prevLevel;
    const dailyGoalCleared = prevTarget > 0 && !prevDailyGoal && derived.dailyGoalReached;

    let modalToTrigger: AchievementModalPayload | null = null;
    if (levelCleared && dailyGoalCleared) {
      modalToTrigger = {
        type: 'double_milestone',
        title: 'Double Milestone',
        subtitle: `Level ${derived.level} reached & daily target achieved!`,
        details: `You earned ${derived.dailyPoints} daily points and advanced to Level ${derived.level} in a single stride.`,
        level: derived.level,
        dailyPoints: derived.dailyPoints,
        dailyPointsTarget: s.dailyPointsTarget,
        diamondsEarned: 2,
      };
    } else if (levelCleared) {
      const isLevel20 = derived.level >= 20 && prevLevel < 20;
      if (isLevel20) {
        modalToTrigger = {
          type: 'slow_letters_unlocked',
          title: 'Direct Letters Unlocked',
          subtitle: 'Milestone reached: Level 20',
          details: 'You have cleared Level 20. Thoughtful card correspondence with verified adults is now open in your Letterbox.',
          level: derived.level,
          diamondsEarned: 1,
          unlockedFeature: 'letters',
        };
      } else {
        modalToTrigger = {
          type: 'level_clear',
          title: `Level ${derived.level} Cleared`,
          subtitle: `You advanced to Level ${derived.level}`,
          details: `You cleared Level ${prevLevel} and reached Level ${derived.level}. Steady consistency creates lasting change.`,
          level: derived.level,
          diamondsEarned: 1,
        };
      }
    } else if (dailyGoalCleared) {
      modalToTrigger = {
        type: 'daily_goal',
        title: 'Daily Goal Achieved',
        subtitle: `${derived.dailyPoints} points reached today`,
        details: `You hit your daily target of ${s.dailyPointsTarget} points! Your consistency builds lasting momentum.`,
        dailyPoints: derived.dailyPoints,
        dailyPointsTarget: s.dailyPointsTarget,
        diamondsEarned: 1,
      };
    }

    // Suppress achievement modals during onboarding
    if (!stateBefore.isOnboarded) {
      modalToTrigger = null;
    }

    set({
      ...patch,
      rewardLedger: ledger,
      ...derived,
      ...(modalToTrigger ? { achievementModal: modalToTrigger } : {}),
    });
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
    achievementModal: null,

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

    refitDailyQuests: () => {
      const state = get();
      const date = today();
      const todays = state.dailyAssignments.filter((a) => a.assignedDate === date);
      if (!state.isOnboarded || todays.length === 0) return;
      // Only untouched quests move; anything started, done, skipped or replaced stays as it is.
      const open = todays.filter((a) => a.status === 'assigned' && !a.replacedAssignmentId);
      if (open.length === 0) return;
      const kept = todays.filter((a) => !open.includes(a));
      const ctx = assignmentContext(state, date);
      const keptIds = new Set(kept.map((a) => a.taskId));
      const picks = selectDailyTasks(
        getGameCatalog().tasks.filter((t) => !keptIds.has(t.id)),
        ctx,
        open.length,
      );
      const fresh: TaskAssignment[] = picks.map((task, idx) => ({
        assignmentId: `asg_${date}_${task.id}_f${state.dailyAssignments.length + idx}`,
        taskId: task.id,
        assignedDate: date,
        status: 'assigned',
        isSpecialQuestReplacement: false,
        earnedTaskPoints: 0,
        earnedXp: 0,
        earnedCoins: 0,
      }));
      const allToday = [...kept, ...fresh];
      const assignedPoints = allToday
        .filter((a) => !['skipped', 'replaced'].includes(a.status))
        .reduce((sum, a) => sum + (getTaskById(a.taskId)?.points.taskPoints ?? 0), 0);
      commit({
        dailyAssignments: [...state.dailyAssignments.filter((a) => !open.includes(a)), ...fresh],
        // The day's goal never gets harder because of a change; it may get reachable.
        dailyPointsTarget: Math.min(state.dailyPointsTarget || Infinity, dailyTargetFor(assignedPoints)),
        assignmentHistory: [
          { date, taskIds: allToday.map((a) => a.taskId) },
          ...state.assignmentHistory.filter((h) => h.date !== date),
        ].slice(0, 14),
      });
    },

    claimSetupReward: (section) => {
      const state = get();
      const reward = setupReward(section);
      const key = setupLedgerKey(section);
      if (!isSetupSectionAnswered(section, setupAnswersOf(state))) return { awarded: false, xp: 0 };
      const ledger = appendLedger(state.rewardLedger, {
        key,
        kind: 'setup_reward',
        xp: reward.xp,
        diamonds: 0,
        taskPoints: 0,
        gameDate: today(),
        sourceId: section,
        policyVersion: ECONOMY_VERSION,
        createdAt: new Date().toISOString(),
      });
      if (ledger === state.rewardLedger) return { awarded: false, xp: 0 };
      commit({ rewardLedger: ledger, pendingSync: [...state.pendingSync, { kind: 'setup', key, section }] });
      return { awarded: true, xp: reward.xp };
    },

    autoClaimAnsweredSetupRewards: () => {
      let claimedCount = 0;
      let totalXp = 0;
      const state = get();
      const answers = setupAnswersOf(state);
      for (const item of SETUP_REWARDS) {
        if (isSetupSectionAnswered(item.section, answers)) {
          const res = get().claimSetupReward(item.section);
          if (res.awarded) {
            claimedCount += 1;
            totalXp += res.xp;
          }
        }
      }
      return { claimedCount, totalXp };
    },

    syncSetupRewards: () => get().autoClaimAnsweredSetupRewards(),

    completeMealQuest: (description) => {
      const date = today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (task?.objective?.type !== 'meal_log') continue;
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers: { mealDescription: description },
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeHydrationQuest: (glasses, dateStr) => {
      const date = dateStr ?? today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task) continue;
        const type = task.objective?.type;
        const isWater =
          type === 'hydration_log' ||
          type === 'water_log' ||
          task.id.includes('hydration') ||
          task.id.includes('water') ||
          task.title.toLowerCase().includes('water') ||
          task.title.toLowerCase().includes('hydration');
        if (!isWater) continue;
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers: { glasses, date },
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeCheckInQuest: (feelingOrMood, note) => {
      const date = today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task) continue;
        const type = task.objective?.type;
        if (type !== 'checkin' && type !== 'self_reported_checkin') continue;
        const answers: Record<string, string | number> = {};
        if (type === 'self_reported_checkin') {
          answers.feeling = Math.max(1, Math.min(5, Math.round(feelingOrMood / 2)));
        } else {
          answers.feeling = typeof feelingOrMood === 'number' ? `${feelingOrMood}/10` : String(feelingOrMood);
          answers.note = note && note.trim().length >= 3 ? note.trim() : 'Daily check-in completed';
        }
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers,
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeSleepQuest: (durationHours, restedRating = 4) => {
      const date = today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task || task.objective?.type !== 'sleep_log') continue;
        const minutes = Math.max(1, Math.min(1440, Math.round(durationHours * 60)));
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers: {
            durationMinutes: minutes,
            restedRating: Math.max(1, Math.min(5, restedRating)),
          },
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeSymptomQuest: (symptom, dateStr) => {
      const date = dateStr ?? today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === today() && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task || task.objective?.type !== 'symptom_record') continue;
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers: {
            symptomType: symptom.trim().slice(0, 50),
            date,
          },
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeReflectionQuest: (content) => {
      const date = today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task || task.objective?.type !== 'structured_reflection') continue;
        const form = objectiveFormFor(task);
        if (!form) continue;
        const answers: Record<string, string> = {};
        for (const f of form.fields) {
          answers[f.id] = content.slice(0, 200);
        }
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers,
          elapsedSeconds: 0,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completePracticeQuest: (practice, elapsedSeconds) => {
      if (practice !== 'breathing' || elapsedSeconds < 60) return null;
      const date = today();
      for (const asg of get().dailyAssignments.filter((a) => a.assignedDate === date && ACTIVE_STATUSES.includes(a.status))) {
        const task = getTaskById(asg.taskId);
        if (!task || task.objective?.type !== 'guided_exercise') continue;
        const result = get().submitQuestEvidence(asg.assignmentId, {
          answers: {},
          elapsedSeconds,
          completedStepIds: task.instructions.map((i) => i.id),
          attested: true,
        });
        if (result.success) return { title: task.title, xp: result.earnedXp };
      }
      return null;
    },

    completeAssignmentWithWorkout: (assignmentId, facts) => {
      const asg = get().dailyAssignments.find((a) => a.assignmentId === assignmentId);
      if (!asg || asg.assignedDate !== today() || !ACTIVE_STATUSES.includes(asg.status)) return null;
      const task = getTaskById(asg.taskId);
      const form = task ? objectiveFormFor(task) : null;
      if (!task || !form) return null;
      const evidence = evidenceFromWorkout(form, task.instructions, facts);
      if (!evidence) return null;
      const result = get().submitQuestEvidence(assignmentId, evidence);
      return result.success ? { title: task.title, xp: result.earnedXp } : null;
    },

    claimPracticeReward: (sessionKey, scoreBonus) => {
      const state = get();
      const date = today();
      const key = `practice:${sessionKey}`;
      if (state.rewardLedger.some((e) => e.key === key)) return { awarded: false, xp: 0 };
      if (state.rewardLedger.filter((e) => e.kind === 'practice_reward' && e.gameDate === date).length >= 8) return { awarded: false, xp: 0 };
      const xp = 10 + Math.max(0, Math.min(10, Math.round(scoreBonus)));
      commit({
        rewardLedger: appendLedger(state.rewardLedger, {
          key,
          kind: 'practice_reward',
          xp,
          diamonds: 0,
          taskPoints: 5,
          gameDate: date,
          sourceId: sessionKey,
          policyVersion: ECONOMY_VERSION,
          createdAt: new Date().toISOString(),
        }),
      });
      return { awarded: true, xp };
    },

    claimWorkoutReward: (sessionId, form) => {
      const state = get();
      const date = today();
      const key = `workout:${sessionId}`;
      if (state.rewardLedger.some((e) => e.key === key)) return { awarded: false, xp: 0, reason: 'duplicate' };
      if (workoutRewardsOn(state.rewardLedger, date) >= WORKOUT_REWARDS_PER_DAY) {
        return { awarded: false, xp: 0, reason: 'daily_limit' };
      }
      const xp = workoutRewardXp(form);
      const ledger = appendLedger(state.rewardLedger, {
        key,
        kind: 'workout_reward',
        xp,
        diamonds: 0,
        taskPoints: 0,
        gameDate: date,
        sourceId: sessionId,
        policyVersion: ECONOMY_VERSION,
        createdAt: new Date().toISOString(),
      });
      commit({
        rewardLedger: ledger,
        pendingSync: [
          ...state.pendingSync,
          { kind: 'workout', key, sessionId, gameDate: date, validFrames: form?.validFrames ?? 0, formScore: form?.formScore ?? 0 },
        ],
      });
      return { awarded: true, xp };
    },

    claimCheckInReward: (date, streak) => {
      const state = get();
      const key = `checkin_reward:${date}`;
      if (state.rewardLedger.some((e) => e.key === key)) {
        return { awarded: false, xp: 0, streakBonus: 0, milestoneBonus: 0 };
      }
      const reward = checkInRewardXp(streak);
      const ledger = appendLedger(state.rewardLedger, {
        key,
        kind: 'task_reward',
        xp: reward.xp,
        diamonds: reward.milestoneBonus > 0 ? 5 : 0,
        taskPoints: 10,
        gameDate: date,
        sourceId: `checkin-${date}`,
        policyVersion: ECONOMY_VERSION,
        createdAt: new Date().toISOString(),
      });
      commit({ rewardLedger: ledger });
      return { awarded: true, ...reward };
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

    showAchievementModal: (payload) => {
      if (!get().isOnboarded) return;
      set({ achievementModal: payload });
    },
    hideAchievementModal: () => set({ achievementModal: null }),
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
