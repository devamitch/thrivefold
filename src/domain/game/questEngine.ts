import { ProductExperience } from '../../theme/tokens';
import { getSpecialQuestsForExperience, getTasksForExperience } from './gameCatalogService';
import {
  EvidenceSubmission,
  SpecialQuestDefinition,
  TaskAssignment,
  TaskDefinition,
  VerificationResult,
} from './types';
import { verifyTaskSubmission } from './verificationEngine';

export interface DailyPointStatus {
  dailyPoints: number;
  targetPoints: number;
  goalReached: boolean;
  completedTasksCount: number;
  totalAssignedCount: number;
}

/**
 * Generate initial daily assignments for a user based on cohort and date.
 */
export const generateDailyAssignments = (
  experience: ProductExperience,
  dateStr: string,
): TaskAssignment[] => {
  const eligibleTasks = getTasksForExperience(experience);
  // Pick up to 3 distinct tasks
  const selected = eligibleTasks.slice(0, 3);

  return selected.map((task, idx) => ({
    assignmentId: `asg_${dateStr}_${task.id}_${idx}`,
    taskId: task.id,
    assignedDate: dateStr,
    status: 'assigned',
    isSpecialQuestReplacement: false,
    earnedTaskPoints: 0,
    earnedXp: 0,
    earnedCoins: 0,
  }));
};

/**
 * Skip a task. Does NOT award points or XP.
 * Opens the path to join a Special Quest from the vault.
 */
export const skipTaskAssignment = (
  assignments: TaskAssignment[],
  assignmentId: string,
  skipReason?: string,
): TaskAssignment[] => {
  return assignments.map((asg) => {
    if (asg.assignmentId === assignmentId) {
      return {
        ...asg,
        status: 'skipped',
        skipReason: skipReason ?? 'User selected to replace with a Special Quest',
      };
    }
    return asg;
  });
};

/**
 * Replace a skipped task with an accepted Special Quest.
 * Creates an active replacement assignment.
 */
export const replaceWithSpecialQuest = (
  assignments: TaskAssignment[],
  skippedAssignmentId: string,
  specialQuest: SpecialQuestDefinition,
  dateStr: string,
): TaskAssignment[] => {
  // Update the skipped task to 'replaced'
  const updated = assignments.map((asg) => {
    if (asg.assignmentId === skippedAssignmentId) {
      return {
        ...asg,
        status: 'replaced' as const,
      };
    }
    return asg;
  });

  // Create the replacement assignment
  const replacementAssignment: TaskAssignment = {
    assignmentId: `asg_sq_${dateStr}_${specialQuest.id}_${Date.now()}`,
    taskId: specialQuest.id,
    assignedDate: dateStr,
    status: 'assigned',
    isSpecialQuestReplacement: true,
    replacedAssignmentId: skippedAssignmentId,
    earnedTaskPoints: 0,
    earnedXp: 0,
    earnedCoins: 0,
  };

  return [...updated, replacementAssignment];
};

/**
 * Execute verification on an assignment and update assignment state.
 */
export const completeAndVerifyAssignment = (
  assignments: TaskAssignment[],
  assignmentId: string,
  task: TaskDefinition,
  submission: EvidenceSubmission,
): { updatedAssignments: TaskAssignment[]; result: VerificationResult } => {
  const result = verifyTaskSubmission(task, submission);

  const updatedAssignments = assignments.map((asg) => {
    if (asg.assignmentId === assignmentId) {
      if (result.success) {
        return {
          ...asg,
          status: result.status,
          completedAt: result.verifiedAt,
          earnedTaskPoints: result.earnedTaskPoints,
          earnedXp: result.earnedXp,
          earnedCoins: result.earnedCoins,
          verificationClass: task.verificationClass,
        };
      } else {
        return {
          ...asg,
          status: 'rejected' as const,
        };
      }
    }
    return asg;
  });

  return { updatedAssignments, result };
};

/**
 * Calculate progress toward the daily goal points target.
 */
export const calculateDailyPointProgress = (
  assignments: TaskAssignment[],
  targetPoints: number = 40,
): DailyPointStatus => {
  let dailyPoints = 0;
  let completedTasksCount = 0;

  for (const asg of assignments) {
    if (asg.status === 'verified' || asg.status === 'self_reported') {
      dailyPoints += asg.earnedTaskPoints;
      completedTasksCount++;
    }
  }

  return {
    dailyPoints,
    targetPoints,
    goalReached: dailyPoints >= targetPoints,
    completedTasksCount,
    totalAssignedCount: assignments.filter((a) => a.status !== 'skipped' && a.status !== 'replaced').length,
  };
};

/**
 * Deterministically compute Level (1-1000) from cumulative XP.
 */
export const calculateLevelFromXp = (totalXp: number): number => {
  if (totalXp <= 0) return 1;
  // Level threshold curve: 100 * level^1.25
  let level = 1;
  while (level < 1000) {
    const nextLevelReq = Math.floor(100 * Math.pow(level + 1, 1.25));
    if (totalXp < nextLevelReq) break;
    level++;
  }
  return level;
};
