import catalogJson from '../../content/game/thrivefold-game-catalog.v1.json';
import { ProductExperience } from '../../theme/tokens';
import { GameCatalog, LevelDefinition, SpecialQuestDefinition, TaskDefinition } from './types';

const catalog: GameCatalog = catalogJson as unknown as GameCatalog;

export const getGameCatalog = (): GameCatalog => catalog;

export const getTasksForExperience = (
  experience: ProductExperience,
  categoryFilter?: string,
): TaskDefinition[] => {
  return catalog.tasks.filter((task) => {
    const matchesScope =
      task.experienceScopes.includes(experience) || task.experienceScopes.includes('shared');
    const matchesCategory = categoryFilter ? task.category === categoryFilter : true;
    return matchesScope && matchesCategory;
  });
};

export const getSpecialQuestsForExperience = (
  experience: ProductExperience,
): SpecialQuestDefinition[] => {
  return catalog.specialQuests.filter((sq) => {
    return sq.experienceScopes.includes(experience) || sq.experienceScopes.includes('shared');
  });
};

export const getTaskById = (taskId: string): TaskDefinition | undefined => {
  return (
    catalog.tasks.find((t) => t.id === taskId) ??
    catalog.specialQuests.find((sq) => sq.id === taskId)
  );
};

export const getLevelDefinition = (levelNumber: number): LevelDefinition => {
  const boundedLevel = Math.max(1, Math.min(1000, Math.floor(levelNumber)));
  return (
    catalog.levels.find((l) => l.level === boundedLevel) ?? {
      level: boundedLevel,
      chapterNumber: Math.min(20, Math.floor((boundedLevel - 1) / 50) + 1),
      title: `Level ${boundedLevel} — Vitality Journey`,
      arc: 'Integrated Vitality',
      requiredCumulativeXp: 100 * boundedLevel,
      unlockedFeatures: [],
    }
  );
};

export interface CatalogValidationReport {
  valid: boolean;
  totalLevels: number;
  totalTasks: number;
  totalSpecialQuests: number;
  totalChapters: number;
  errors: string[];
}

export const validateCatalogIntegrity = (): CatalogValidationReport => {
  const errors: string[] = [];

  if (catalog.levels.length !== 1000) {
    errors.push(`Expected exactly 1,000 levels, found ${catalog.levels.length}`);
  }

  // Check unique IDs for tasks and special quests
  const taskIds = new Set<string>();
  for (const t of catalog.tasks) {
    if (taskIds.has(t.id)) errors.push(`Duplicate task ID: ${t.id}`);
    taskIds.add(t.id);
    if (!t.title || !t.instructions || t.instructions.length === 0) {
      errors.push(`Task ${t.id} missing title or instructions`);
    }
    if (!t.points || t.points.taskPoints <= 0 || t.points.xp <= 0) {
      errors.push(`Task ${t.id} has invalid or zero points`);
    }
  }

  for (const sq of catalog.specialQuests) {
    if (taskIds.has(sq.id)) errors.push(`Duplicate special quest ID: ${sq.id}`);
    taskIds.add(sq.id);
  }

  // Check policy references
  const policyIds = new Set(catalog.verificationPolicies.map((p) => p.id));
  for (const t of catalog.tasks) {
    if (!policyIds.has(t.verificationPolicyId)) {
      errors.push(`Task ${t.id} references undefined verification policy ${t.verificationPolicyId}`);
    }
  }

  return {
    valid: errors.length === 0,
    totalLevels: catalog.levels.length,
    totalTasks: catalog.tasks.length,
    totalSpecialQuests: catalog.specialQuests.length,
    totalChapters: catalog.chapters.length,
    errors,
  };
};
