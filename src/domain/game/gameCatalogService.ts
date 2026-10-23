import catalogV1Json from '../../content/game/thrivefold-game-catalog.v1.json';
import catalogV3Json from '../../content/game/thrivefold_real_game_catalog_v3.json';
import { ProductExperience } from '../../theme/tokens';
import {
  ChapterDefinition,
  GameCatalog,
  LevelDefinition,
  SpecialQuestDefinition,
  TaskDefinition,
} from './types';

function normalizeTask(rawTask: any, policies: any[]): TaskDefinition {
  const policyId =
    rawTask.verification?.policyId ??
    rawTask.verificationPolicyId ??
    'self-declaration-v1';

  const verificationClass =
    rawTask.verification?.verificationClass ??
    rawTask.verificationClass ??
    'self_reported';

  const instructions =
    rawTask.instructions?.map((inst: any, idx: number) => ({
      id: inst.id ?? `step-${idx + 1}`,
      stepNumber: inst.stepNumber ?? idx + 1,
      title: inst.title ?? (inst.text ? String(inst.text).slice(0, 48) : `Step ${idx + 1}`),
      body: inst.body ?? inst.text ?? '',
    })) ?? [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Mindful Practice',
        body: rawTask.shortDescription ?? rawTask.purpose ?? 'Complete with mindful presence.',
      },
    ];

  const verificationRequirements = rawTask.verificationRequirements ?? [
    {
      type:
        verificationClass === 'system_verified'
          ? 'in_app_timer'
          : verificationClass === 'evidence_supported'
          ? 'activity_log_details'
          : 'self_declaration',
      description:
        rawTask.verification?.requiredEvidence?.join(', ') ??
        rawTask.purpose ??
        'Confirm mindful completion',
      minDurationSeconds: rawTask.estimatedDurationMinutes
        ? Math.max(60, rawTask.estimatedDurationMinutes * 60)
        : 60,
    },
  ];

  return {
    id: rawTask.id,
    version: rawTask.version ?? 1,
    title: rawTask.title,
    shortDescription: rawTask.shortDescription ?? rawTask.purpose ?? '',
    purpose: rawTask.purpose ?? rawTask.shortDescription ?? '',
    instructions,
    category: rawTask.category ?? 'movement',
    experienceScopes: rawTask.experienceScopes ?? ['shared'],
    skillOutcomes: rawTask.skillOutcomes ?? [{ skillId: 'movement', skillXp: 10 }],
    difficulty: rawTask.difficulty ?? 'standard',
    estimatedDurationMinutes: rawTask.estimatedDurationMinutes ?? 5,
    levelEligibility: rawTask.levelEligibility ?? { minimumLevel: 1, maximumLevel: 1000 },
    prerequisiteTaskIds: rawTask.prerequisiteTaskIds ?? [],
    verificationClass,
    verificationPolicyId: policyId,
    verificationRequirements,
    points: {
      taskPoints: Math.max(10, rawTask.points?.taskPoints || 10),
      xp: Math.max(15, rawTask.points?.xp || 15),
      coins: Math.max(5, rawTask.points?.coins || 5),
    },
    availability: rawTask.availability ?? {
      assignmentTypes: ['daily', 'special_quest'],
      canReplaceDaily: true,
    },
    safetyConstraints: rawTask.safetyConstraints ?? [],
    contentProvenance: rawTask.contentProvenance ?? {
      authored: true,
      reviewed: true,
    },
  };
}

function normalizeSpecialQuest(rawSq: any, policies: any[]): SpecialQuestDefinition {
  const base = normalizeTask(rawSq, policies);
  return {
    ...base,
    replacesAssignmentType: 'daily',
    vaultCategory: rawSq.vaultCategory ?? 'restorative',
  };
}

// Build unified catalog merging v3 and v1
const rawPolicies = [
  ...(catalogV1Json.verificationPolicies ?? []),
  ...((catalogV3Json as any).verificationPolicies ?? []),
];
const policyMap = new Map<string, any>();
for (const p of rawPolicies) {
  if (p && p.id && !policyMap.has(p.id)) {
    policyMap.set(p.id, p);
  }
}
const unifiedPolicies = Array.from(policyMap.values());

const taskMap = new Map<string, TaskDefinition>();
// Add V1 tasks first
for (const t of catalogV1Json.tasks ?? []) {
  taskMap.set(t.id, normalizeTask(t, unifiedPolicies));
}
// Add/enrich with V3 tasks
for (const t of (catalogV3Json as any).taskDefinitions ?? []) {
  if (!taskMap.has(t.id)) {
    taskMap.set(t.id, normalizeTask(t, unifiedPolicies));
  }
}
const unifiedTasks = Array.from(taskMap.values());

const sqMap = new Map<string, SpecialQuestDefinition>();
for (const sq of catalogV1Json.specialQuests ?? []) {
  sqMap.set(sq.id, normalizeSpecialQuest(sq, unifiedPolicies));
}
for (const sq of (catalogV3Json as any).specialQuestDefinitions ?? []) {
  if (!sqMap.has(sq.id)) {
    sqMap.set(sq.id, normalizeSpecialQuest(sq, unifiedPolicies));
  }
}
const unifiedSpecialQuests = Array.from(sqMap.values());

// Levels: Use V1 or V3
const unifiedLevels: LevelDefinition[] = (catalogV1Json.levels ?? []).map((l: any) => ({
  level: l.level,
  chapterNumber: l.chapterNumber,
  title: l.title,
  arc: l.arc,
  requiredCumulativeXp: l.requiredCumulativeXp,
  unlockedFeatures: l.unlockedFeatures ?? [],
}));

const unifiedChapters: ChapterDefinition[] = (catalogV1Json.chapters ?? []).map((ch: any) => ({
  chapterNumber: ch.chapterNumber,
  title: ch.title,
  theme: ch.theme,
  levelRange: ch.levelRange,
}));

const catalog: GameCatalog = {
  catalogMeta: {
    id: 'thrivefold-real-game-catalog-v3',
    version: 3,
    updatedAt: new Date().toISOString(),
    totalLevels: unifiedLevels.length,
    author: 'Google Antigravity Team',
  },
  experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
  skillDefinitions: (catalogV1Json.skillDefinitions ?? []) as any,
  difficultyDefinitions: (catalogV1Json.difficultyDefinitions ?? []) as any,
  verificationPolicies: unifiedPolicies,
  chapters: unifiedChapters,
  levels: unifiedLevels,
  tasks: unifiedTasks,
  specialQuests: unifiedSpecialQuests,
  dailyTaskRules: {
    defaultTargetPoints: 40,
    maxDailyAssignedTasks: 3,
    skipCooldownMinutes: 0,
  },
};

export const getGameCatalog = (): GameCatalog => catalog;

export const getTasksForExperience = (
  experience: ProductExperience,
  categoryFilter?: string,
): TaskDefinition[] => {
  return catalog.tasks.filter((task) => {
    // Strict isolation: if experience is men_health, NEVER include cycle_care
    if (experience === 'men_health' && task.category === 'cycle_care') {
      return false;
    }
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
    if (experience === 'men_health' && sq.category === 'cycle_care') {
      return false;
    }
    return sq.experienceScopes.includes(experience) || sq.experienceScopes.includes('shared');
  });
};

export const getTaskById = (taskId: string): TaskDefinition | undefined => {
  if (!taskId) return undefined;

  // 1. Direct match by ID
  let match =
    catalog.tasks.find((t) => t.id === taskId) ??
    catalog.specialQuests.find((sq) => sq.id === taskId);
  if (match) return match;

  // 2. If assignment ID format: asg_YYYY-MM-DD_TASKID_INDEX or asg_sq_...
  if (taskId.startsWith('asg_')) {
    for (const t of catalog.tasks) {
      if (taskId.includes(t.id)) return t;
    }
    for (const sq of catalog.specialQuests) {
      if (taskId.includes(sq.id)) return sq;
    }
  }

  // 3. Exact Title match
  match =
    catalog.tasks.find((t) => t.title.toLowerCase() === taskId.toLowerCase()) ??
    catalog.specialQuests.find((sq) => sq.title.toLowerCase() === taskId.toLowerCase());
  if (match) return match;

  // 4. Normalized fuzzy title match
  const cleanQuery = taskId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanQuery.length >= 4) {
    match =
      catalog.tasks.find((t) => {
        const cleanTitle = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanTitle.includes(cleanQuery) || cleanQuery.includes(cleanTitle);
      }) ??
      catalog.specialQuests.find((sq) => {
        const cleanTitle = sq.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanTitle.includes(cleanQuery) || cleanQuery.includes(cleanTitle);
      });
    if (match) return match;
  }

  return undefined;
};

export const getLevelDefinition = (levelNumber: number): LevelDefinition => {
  const boundedLevel = Math.max(1, Math.min(1000, Math.floor(levelNumber)));
  return (
    catalog.levels.find((l) => l.level === boundedLevel) ?? {
      level: boundedLevel,
      chapterNumber: Math.min(20, Math.floor((boundedLevel - 1) / 50) + 1),
      title: `Level ${boundedLevel} — Vitality Journey`,
      arc: 'Foundations & Somatic Awakening',
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

  return {
    valid: errors.length === 0,
    totalLevels: catalog.levels.length,
    totalTasks: catalog.tasks.length,
    totalSpecialQuests: catalog.specialQuests.length,
    totalChapters: catalog.chapters.length,
    errors,
  };
};
