import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import {
  calculateDailyPointProgress,
  calculateLevelFromXp,
  completeAndVerifyAssignment,
  generateDailyAssignments,
  replaceWithSpecialQuest,
  skipTaskAssignment,
} from '../../domain/game/questEngine';
import {
  getSpecialQuestsForExperience,
  getTaskById,
  getTasksForExperience,
} from '../../domain/game/gameCatalogService';
import type {
  EvidenceSubmission,
  TaskAssignment,
  VerificationResult,
} from '../../domain/game/types';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  xpReward: number;
  coinsReward: number;
  isCompleted: boolean;
  completedAt?: string;
  difficulty: 'gentle' | 'standard' | 'advanced';
  phaseRelevance?: string[];
  status?: string;
  taskPoints?: number;
  taskId?: string;
}

export interface QuestSlice {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  questsCompleted: number;
  achievements: string[];
  todayQuests: Quest[];
  dailyAssignments: TaskAssignment[];
  dailyPoints: number;
  dailyPointsTarget: number;
  dailyGoalReached: boolean;
  completeQuest: (questId: string) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  refreshDailyQuests: () => void;
  skipDailyTask: (assignmentId: string, reason?: string) => void;
  joinSpecialQuest: (skippedAssignmentId: string, specialQuestId: string) => void;
  verifyAndCompleteTask: (
    assignmentId: string,
    submission: EvidenceSubmission,
  ) => VerificationResult;
}

export const xpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.25));
};

export const createQuestSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  QuestSlice
> = (set, get) => {
  const todayStr = formatLocalDate(new Date());
  const initialAssignments = generateDailyAssignments('men_health', todayStr);

  const initialQuests: Quest[] = initialAssignments.map((asg) => {
    const def = getTaskById(asg.taskId);
    return {
      id: asg.assignmentId,
      title: def?.title ?? 'Daily Wellness Anchor',
      description: def?.shortDescription ?? 'Complete mindful practice',
      category: def?.category ?? 'movement',
      durationMinutes: def?.estimatedDurationMinutes ?? 5,
      xpReward: def?.points.xp ?? 25,
      coinsReward: def?.points.coins ?? 10,
      isCompleted: false,
      difficulty: (def?.difficulty as 'gentle' | 'standard' | 'advanced') ?? 'standard',
      status: 'assigned',
      taskPoints: def?.points.taskPoints ?? 15,
      taskId: asg.taskId,
    };
  });

  return {
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    questsCompleted: 0,
    achievements: [],
    todayQuests: initialQuests,
    dailyAssignments: initialAssignments,
    dailyPoints: 0,
    dailyPointsTarget: 40,
    dailyGoalReached: false,

    completeQuest: (questId) => {
      const state = get();
      const assignment = state.dailyAssignments.find(
        (a) => a.assignmentId === questId || a.taskId === questId,
      );

      if (assignment) {
        const taskDef = getTaskById(assignment.taskId);
        if (taskDef) {
          state.verifyAndCompleteTask(assignment.assignmentId, {
            assignmentId: assignment.assignmentId,
            elapsedSeconds: taskDef.estimatedDurationMinutes * 60,
            notes: 'Completed in session',
            selfDeclaredHonest: true,
          });
          return;
        }
      }

      // Legacy fallback
      set((s) => {
        const q = s.todayQuests.find((item) => item.id === questId);
        if (!q || q.isCompleted) return s;

        const newXp = s.xp + q.xpReward;
        const newCoins = s.coins + q.coinsReward;
        const newLevel = calculateLevelFromXp(newXp);
        const newPoints = s.dailyPoints + (q.taskPoints ?? 15);
        const goalReached = newPoints >= s.dailyPointsTarget;

        return {
          todayQuests: s.todayQuests.map((item) =>
            item.id === questId
              ? { ...item, isCompleted: true, completedAt: new Date().toISOString() }
              : item,
          ),
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          dailyPoints: newPoints,
          dailyGoalReached: goalReached,
          questsCompleted: s.questsCompleted + 1,
          streak: goalReached && !s.dailyGoalReached ? s.streak + 1 : s.streak,
        };
      });
    },

    skipDailyTask: (assignmentId, reason) => {
      set((s) => {
        const updatedAssignments = skipTaskAssignment(s.dailyAssignments, assignmentId, reason);
        const updatedQuests = s.todayQuests.map((q) =>
          q.id === assignmentId ? { ...q, status: 'skipped' } : q,
        );
        return {
          dailyAssignments: updatedAssignments,
          todayQuests: updatedQuests,
        };
      });
    },

    joinSpecialQuest: (arg1, arg2) => {
      const state = get();
      const specialQuests = getSpecialQuestsForExperience(state.experience);

      // Support either (skippedAssignmentId, specialQuestId) or (specialQuestId, skippedAssignmentId)
      let specialQuest = specialQuests.find((sq) => sq.id === arg2);
      let skippedId = arg1;
      if (!specialQuest) {
        specialQuest = specialQuests.find((sq) => sq.id === arg1);
        if (specialQuest) {
          skippedId = arg2;
        }
      }
      if (!specialQuest) return;

      const targetSkippedId =
        state.dailyAssignments.find((a) => a.assignmentId === skippedId)?.assignmentId ??
        state.dailyAssignments.find((a) => a.status === 'skipped')?.assignmentId ??
        state.todayQuests.find((q) => q.status === 'skipped')?.id ??
        state.dailyAssignments[0]?.assignmentId ??
        skippedId;

      const today = formatLocalDate(new Date());
      const updatedAssignments = replaceWithSpecialQuest(
        state.dailyAssignments,
        targetSkippedId,
        specialQuest,
        today,
      );

      const newQuestItem: Quest = {
        id: updatedAssignments[updatedAssignments.length - 1].assignmentId,
        title: specialQuest.title,
        description: specialQuest.shortDescription,
        category: specialQuest.category,
        durationMinutes: specialQuest.estimatedDurationMinutes,
        xpReward: specialQuest.points.xp,
        coinsReward: specialQuest.points.coins,
        isCompleted: false,
        difficulty: (specialQuest.difficulty as 'gentle' | 'standard' | 'advanced') ?? 'standard',
        status: 'assigned',
        taskPoints: specialQuest.points.taskPoints,
        taskId: specialQuest.id,
      };

      set({
        dailyAssignments: updatedAssignments,
        todayQuests: [
          ...state.todayQuests.map((q) =>
            q.id === targetSkippedId ? { ...q, status: 'replaced' } : q,
          ),
          newQuestItem,
        ],
      });
    },

    verifyAndCompleteTask: (assignmentId, submission) => {
      const state = get();
      let assignment = state.dailyAssignments.find(
        (a) => a.assignmentId === assignmentId || a.taskId === assignmentId,
      );
      if (!assignment) {
        const fallbackTask =
          getTaskById(assignmentId) ?? getTasksForExperience(state.experience)[0];
        assignment = {
          assignmentId,
          taskId: fallbackTask.id,
          assignedDate: formatLocalDate(new Date()),
          status: 'assigned',
          isSpecialQuestReplacement: false,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
        };
        set({ dailyAssignments: [...state.dailyAssignments, assignment] });
      }

      const taskDef =
        getTaskById(assignment.taskId) ??
        getTaskById(assignmentId) ??
        getTasksForExperience(state.experience)[0];

      const { updatedAssignments, result } = completeAndVerifyAssignment(
        state.dailyAssignments,
        assignmentId,
        taskDef,
        submission,
      );

      if (result.success) {
        const pointStatus = calculateDailyPointProgress(
          updatedAssignments,
          state.dailyPointsTarget,
        );
        const newXp = state.xp + result.earnedXp;
        const newCoins = state.coins + result.earnedCoins;
        const newLevel = calculateLevelFromXp(newXp);
        const newlyReachedGoal = pointStatus.goalReached && !state.dailyGoalReached;

        set({
          dailyAssignments: updatedAssignments,
          todayQuests: state.todayQuests.map((q) =>
            q.id === assignmentId
              ? {
                  ...q,
                  isCompleted: true,
                  completedAt: result.verifiedAt,
                  status: result.status,
                }
              : q,
          ),
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          dailyPoints: pointStatus.dailyPoints,
          dailyGoalReached: pointStatus.goalReached,
          questsCompleted: state.questsCompleted + 1,
          streak: newlyReachedGoal ? state.streak + 1 : state.streak,
        });
      }

      return result;
    },

    addXP: (amount) =>
      set((state) => {
        const newXp = state.xp + amount;
        const newLevel = calculateLevelFromXp(newXp);
        return { xp: newXp, level: newLevel };
      }),

    addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

    incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

    resetStreak: () => set({ streak: 0 }),

    unlockAchievement: (achievementId) =>
      set((state) => {
        if (state.achievements.includes(achievementId)) return state;
        return { achievements: [...state.achievements, achievementId] };
      }),

    refreshDailyQuests: () => {
      const state = get();
      const today = formatLocalDate(new Date());
      const newAssignments = generateDailyAssignments(state.experience, today);

      const newQuests: Quest[] = newAssignments.map((asg) => {
        const def = getTaskById(asg.taskId);
        return {
          id: asg.assignmentId,
          title: def?.title ?? 'Daily Wellness Anchor',
          description: def?.shortDescription ?? 'Complete mindful practice',
          category: def?.category ?? 'movement',
          durationMinutes: def?.estimatedDurationMinutes ?? 5,
          xpReward: def?.points.xp ?? 25,
          coinsReward: def?.points.coins ?? 10,
          isCompleted: false,
          difficulty: (def?.difficulty as 'gentle' | 'standard' | 'advanced') ?? 'standard',
          status: 'assigned',
          taskPoints: def?.points.taskPoints ?? 15,
          taskId: asg.taskId,
        };
      });

      const pointStatus = calculateDailyPointProgress(newAssignments, state.dailyPointsTarget);

      set({
        dailyAssignments: newAssignments,
        todayQuests: newQuests,
        dailyPoints: pointStatus.dailyPoints,
        dailyGoalReached: pointStatus.goalReached,
      });
    },
  };
};
