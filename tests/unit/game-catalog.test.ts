import {
  getGameCatalog,
  getLevelDefinition,
  getSpecialQuestsForExperience,
  getTasksForExperience,
  validateCatalogIntegrity,
} from '../../src/domain/game/gameCatalogService';
import {
  calculateDailyPointProgress,
  calculateLevelFromXp,
  completeAndVerifyAssignment,
  generateDailyAssignments,
  replaceWithSpecialQuest,
  skipTaskAssignment,
} from '../../src/domain/game/questEngine';
import { verifyTaskSubmission } from '../../src/domain/game/verificationEngine';

describe('Thrivefold Game Engine & Task Catalog', () => {
  describe('1. Static JSON Catalog Integrity', () => {
    it('contains exactly 1,000 level definitions', () => {
      const catalog = getGameCatalog();
      expect(catalog.levels.length).toBe(1000);
      expect(catalog.levels[0].level).toBe(1);
      expect(catalog.levels[999].level).toBe(1000);
    });

    it('contains 20 chapters with 50 levels each', () => {
      const catalog = getGameCatalog();
      expect(catalog.chapters.length).toBe(20);
      expect(catalog.chapters[0].levelRange).toEqual([1, 50]);
      expect(catalog.chapters[19].levelRange).toEqual([951, 1000]);
    });

    it('passes automated catalog integrity validation with zero errors', () => {
      const report = validateCatalogIntegrity();
      expect(report.valid).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(report.totalLevels).toBe(1000);
    });
  });

  describe('2. Experience Isolation & Health Decency', () => {
    it('ensures men_health tasks contain no menstrual, follicular, or cycle care tasks', () => {
      const mensTasks = getTasksForExperience('men_health');
      expect(mensTasks.length).toBeGreaterThan(0);

      for (const task of mensTasks) {
        expect(task.category).not.toBe('cycle_care');
        expect(task.title.toLowerCase()).not.toContain('menstrual');
        expect(task.title.toLowerCase()).not.toContain('follicular');
        expect(task.title.toLowerCase()).not.toContain('luteal');
        expect(task.title.toLowerCase()).not.toContain('cramp');
        expect(task.title.toLowerCase()).not.toContain('breast');
        expect(task.title.toLowerCase()).not.toContain('pregnancy');
      }
    });

    it('ensures women_health tasks contain Harmony Bloom restorative cycle care', () => {
      const womensTasks = getTasksForExperience('women_health');
      const hasCycleCare = womensTasks.some((t) => t.category === 'cycle_care');
      expect(hasCycleCare).toBe(true);
    });

    it('ensures pride_wellbeing contains somatic affirming care', () => {
      const prideTasks = getTasksForExperience('pride_wellbeing');
      const hasAffirming = prideTasks.some((t) => t.category === 'affirming_care');
      expect(hasAffirming).toBe(true);
    });
  });

  describe('3. Evidence Verification Engine', () => {
    it('verifies system_verified task with sufficient timer duration', () => {
      const catalog = getGameCatalog();
      const timerTask = catalog.tasks.find((t) => t.verificationClass === 'system_verified')!;
      expect(timerTask).toBeDefined();

      const passResult = verifyTaskSubmission(timerTask, {
        assignmentId: 'asg_1',
        elapsedSeconds: 300,
        selfDeclaredHonest: true,
      });
      expect(passResult.success).toBe(true);
      expect(passResult.status).toBe('verified');
      expect(passResult.earnedTaskPoints).toBe(timerTask.points.taskPoints);
      expect(passResult.earnedXp).toBe(timerTask.points.xp);

      // Fails with insufficient duration
      const failResult = verifyTaskSubmission(timerTask, {
        assignmentId: 'asg_1',
        elapsedSeconds: 10,
        selfDeclaredHonest: true,
      });
      expect(failResult.success).toBe(false);
      expect(failResult.status).toBe('rejected');
      expect(failResult.reasonCodes).toContain('INSUFFICIENT_ELAPSED_TIME');
      expect(failResult.earnedTaskPoints).toBe(0);
    });

    it('verifies evidence_supported task with activity notes', () => {
      const catalog = getGameCatalog();
      const evidenceTask = catalog.tasks.find((t) => t.verificationClass === 'evidence_supported')!;
      expect(evidenceTask).toBeDefined();

      const passResult = verifyTaskSubmission(evidenceTask, {
        assignmentId: 'asg_2',
        notes: 'Completed 3 stations with deep hip decompression',
        selfDeclaredHonest: true,
      });
      expect(passResult.success).toBe(true);
      expect(passResult.status).toBe('verified');

      // Fails with empty notes
      const failResult = verifyTaskSubmission(evidenceTask, {
        assignmentId: 'asg_2',
        notes: '',
        selfDeclaredHonest: true,
      });
      expect(failResult.success).toBe(false);
      expect(failResult.status).toBe('rejected');
      expect(failResult.reasonCodes).toContain('MISSING_ACTIVITY_EVIDENCE');
    });

    it('verifies self_reported task with honest declaration', () => {
      const catalog = getGameCatalog();
      const selfReportTask = catalog.tasks.find((t) => t.verificationClass === 'self_reported')!;
      expect(selfReportTask).toBeDefined();

      const passResult = verifyTaskSubmission(selfReportTask, {
        assignmentId: 'asg_3',
        selfDeclaredHonest: true,
      });
      expect(passResult.success).toBe(true);
      expect(passResult.status).toBe('self_reported');
    });
  });

  describe('4. Skip & Replace with Special Quest Flow', () => {
    it('skips a daily task without granting points or XP', () => {
      const assignments = generateDailyAssignments('men_health', '2026-10-23');
      const targetAsg = assignments[0];

      const afterSkip = skipTaskAssignment(assignments, targetAsg.assignmentId, 'Too busy today');
      const skippedItem = afterSkip.find((a) => a.assignmentId === targetAsg.assignmentId)!;

      expect(skippedItem.status).toBe('skipped');
      expect(skippedItem.earnedTaskPoints).toBe(0);
      expect(skippedItem.earnedXp).toBe(0);

      const progress = calculateDailyPointProgress(afterSkip, 40);
      expect(progress.dailyPoints).toBe(0);
      expect(progress.goalReached).toBe(false);
    });

    it('replaces a skipped task with a Special Quest and completes daily points upon verification', () => {
      const assignments = generateDailyAssignments('men_health', '2026-10-23');
      const targetAsg = assignments[0];

      // 1. Skip
      const skippedAssignments = skipTaskAssignment(assignments, targetAsg.assignmentId);

      // 2. Pick Special Quest from Vault
      const specialQuests = getSpecialQuestsForExperience('men_health');
      const selectedSq = specialQuests[0];
      expect(selectedSq).toBeDefined();

      const afterReplacement = replaceWithSpecialQuest(
        skippedAssignments,
        targetAsg.assignmentId,
        selectedSq,
        '2026-10-23',
      );

      // Replaced original is marked 'replaced'
      expect(afterReplacement.find((a) => a.assignmentId === targetAsg.assignmentId)?.status).toBe('replaced');

      // New replacement assignment is active
      const replacementAsg = afterReplacement.find((a) => a.isSpecialQuestReplacement)!;
      expect(replacementAsg).toBeDefined();
      expect(replacementAsg.status).toBe('assigned');
      expect(replacementAsg.taskId).toBe(selectedSq.id);

      // 3. Complete and verify the special quest
      const { updatedAssignments, result } = completeAndVerifyAssignment(
        afterReplacement,
        replacementAsg.assignmentId,
        selectedSq,
        {
          assignmentId: replacementAsg.assignmentId,
          notes: 'Completed full Special Quest mobility flow with verified form',
          selfDeclaredHonest: true,
        },
      );

      expect(result.success).toBe(true);
      expect(result.earnedTaskPoints).toBe(selectedSq.points.taskPoints);
      expect(result.earnedXp).toBe(selectedSq.points.xp);

      const progress = calculateDailyPointProgress(updatedAssignments, 40);
      expect(progress.dailyPoints).toBe(selectedSq.points.taskPoints);
    });
  });

  describe('5. 1,000 Level Calculation', () => {
    it('calculates levels deterministically from XP', () => {
      expect(calculateLevelFromXp(0)).toBe(1);
      expect(calculateLevelFromXp(50)).toBe(1);
      expect(calculateLevelFromXp(300)).toBeGreaterThan(1);

      // High XP reaches advanced chapters
      const highLevel = calculateLevelFromXp(50000);
      expect(highLevel).toBeGreaterThan(50);
      expect(highLevel).toBeLessThanOrEqual(1000);
    });

    it('retrieves level definition with proper chapter and arc', () => {
      const lvl1 = getLevelDefinition(1);
      expect(lvl1.level).toBe(1);
      expect(lvl1.chapterNumber).toBe(1);
      expect(lvl1.arc).toBe('Foundations & Somatic Awakening');

      const lvl1000 = getLevelDefinition(1000);
      expect(lvl1000.level).toBe(1000);
      expect(lvl1000.chapterNumber).toBe(20);
      expect(lvl1000.arc).toBe('Transcendent Harmony & Stewardship');
    });
  });
});
