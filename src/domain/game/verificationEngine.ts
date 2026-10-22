import { EvidenceSubmission, TaskDefinition, VerificationResult } from './types';

export const verifyTaskSubmission = (
  task: TaskDefinition,
  submission: EvidenceSubmission,
): VerificationResult => {
  const reasonCodes: string[] = [];
  const now = new Date().toISOString();

  // Validate policy compliance
  switch (task.verificationClass) {
    case 'system_verified': {
      const minDuration = task.verificationRequirements.find((r) => r.type === 'in_app_timer')
        ?.minDurationSeconds ?? 60;
      const elapsed = submission.elapsedSeconds ?? 0;

      if (elapsed < minDuration) {
        reasonCodes.push('INSUFFICIENT_ELAPSED_TIME');
        return {
          success: false,
          status: 'rejected',
          assignmentId: submission.assignmentId,
          taskId: task.id,
          reasonCodes,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
          verifiedAt: now,
        };
      }
      reasonCodes.push('SYSTEM_TIMED_SESSION_PASSED');
      return {
        success: true,
        status: 'verified',
        assignmentId: submission.assignmentId,
        taskId: task.id,
        reasonCodes,
        earnedTaskPoints: task.points.taskPoints,
        earnedXp: task.points.xp,
        earnedCoins: task.points.coins,
        verifiedAt: now,
      };
    }

    case 'evidence_supported': {
      // Must provide notes or structured log
      const hasNotes = submission.notes && submission.notes.trim().length > 3;
      const hasAnswers = submission.answers && Object.keys(submission.answers).length > 0;

      if (!hasNotes && !hasAnswers) {
        reasonCodes.push('MISSING_ACTIVITY_EVIDENCE');
        return {
          success: false,
          status: 'rejected',
          assignmentId: submission.assignmentId,
          taskId: task.id,
          reasonCodes,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
          verifiedAt: now,
        };
      }

      reasonCodes.push('STRUCTURED_LOG_VALIDATED');
      return {
        success: true,
        status: 'verified',
        assignmentId: submission.assignmentId,
        taskId: task.id,
        reasonCodes,
        earnedTaskPoints: task.points.taskPoints,
        earnedXp: task.points.xp,
        earnedCoins: task.points.coins,
        verifiedAt: now,
      };
    }

    case 'self_reported':
    default: {
      if (!submission.selfDeclaredHonest) {
        reasonCodes.push('DECLARATION_NOT_CONFIRMED');
        return {
          success: false,
          status: 'rejected',
          assignmentId: submission.assignmentId,
          taskId: task.id,
          reasonCodes,
          earnedTaskPoints: 0,
          earnedXp: 0,
          earnedCoins: 0,
          verifiedAt: now,
        };
      }

      reasonCodes.push('TRANSPARENT_SELF_REPORT_ACCEPTED');
      return {
        success: true,
        status: 'self_reported',
        assignmentId: submission.assignmentId,
        taskId: task.id,
        reasonCodes,
        earnedTaskPoints: task.points.taskPoints,
        earnedXp: task.points.xp,
        earnedCoins: task.points.coins,
        verifiedAt: now,
      };
    }
  }
};
