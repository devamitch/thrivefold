import catalogV3Json from '../../content/game/thrivefold_real_game_catalog_v3.json';
import { ProductExperience } from '../../theme/tokens';
import { levelProgress, type LevelProgress } from './progression';
import {
  ChapterDefinition,
  GameCatalog,
  LevelDefinition,
  SpecialQuestDefinition,
  SpecialQuestParent,
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
    // Rewards exactly as the catalog states them. Some tasks deliberately award nothing
    // (private tracking must not be incentivised); those are kept at zero.
    points: {
      taskPoints: Number(rawTask.points?.taskPoints) || 0,
      xp: Number(rawTask.points?.xp) || 0,
      coins: 0,
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
    objective: rawTask.objective ?? null,
    sensitivity: rawTask.sensitivity ?? 'ordinary',
    ageGate: rawTask.ageGate ?? null,
    dailyGoalEligible: rawTask.points?.dailyGoalEligible ?? true,
    catalogSource: rawTask.objective ? 'v3' : 'v1',
    contentStatus: rawTask.contentStatus ?? 'authored',
  };
}

// The canonical v3 catalog is the only source of tasks, levels and policies.
const unifiedPolicies: any[] = (catalogV3Json as any).verificationPolicies ?? [];

const taskMap = new Map<string, TaskDefinition>();
for (const t of (catalogV3Json as any).taskDefinitions ?? []) {
  if (!taskMap.has(t.id)) taskMap.set(t.id, normalizeTask(t, unifiedPolicies));
}
const unifiedTasks = Array.from(taskMap.values());

// Standalone special-quest tasks (none in v3; kept for catalogs that define them).
const unifiedSpecialQuests: SpecialQuestDefinition[] = [];

// v3 special quests are parents that point at child tasks (child-task reward only), so
// they are exposed separately instead of being treated as tasks themselves.
const specialQuestParents: SpecialQuestParent[] = ((catalogV3Json as any).specialQuestDefinitions ?? [])
  .filter((sq: any) => Array.isArray(sq.replacesCategories) && sq.replacesCategories.length > 0)
  .map((sq: any) => ({
    id: sq.id,
    title: sq.title,
    purpose: sq.purpose ?? sq.description ?? '',
    replacesCategories: sq.replacesCategories,
    taskIds: sq.taskIds ?? [],
    eligibleLevelRange: (sq.eligibleLevelRange ?? [1, 1000]) as [number, number],
  }));

export const getSpecialQuestParents = (): SpecialQuestParent[] => specialQuestParents;

// Levels and chapters come from the canonical v3 catalog: 1,000 authored level records with
// their own XP thresholds and chapter checkpoints.
const v3Chapters: any[] = (catalogV3Json as any).chapterDefinitions ?? [];
const chapterOrderById = new Map<string, number>(v3Chapters.map((ch) => [ch.id, ch.order]));

const unifiedLevels: LevelDefinition[] = ((catalogV3Json as any).levelDefinitions ?? []).map((l: any) => ({
  level: l.level,
  chapterNumber: chapterOrderById.get(l.chapterId) ?? Math.floor((l.level - 1) / 50) + 1,
  title: l.title,
  arc: l.primaryOutcome ?? l.purpose ?? '',
  requiredCumulativeXp: l.minimumCumulativeXp,
  unlockedFeatures: [],
  xpRequiredToAdvance: l.xpRequiredToAdvance,
  checkpointId: l.checkpointId ?? null,
}));

const unifiedChapters: ChapterDefinition[] = v3Chapters.map((ch) => ({
  chapterNumber: ch.order,
  title: ch.title,
  theme: ch.description,
  levelRange: [ch.levels.start, ch.levels.end] as [number, number],
}));

const catalog: GameCatalog = {
  catalogMeta: {
    id: 'thrivefold-real-game-catalog-v3',
    version: 3,
    updatedAt: (catalogV3Json as any).catalogMeta?.generatedAt ?? '',
    totalLevels: unifiedLevels.length,
    author: 'Thrivefold catalog v3',
  },
  experienceScopes: ['shared', 'men_health', 'women_health', 'pride_wellbeing'],
  skillDefinitions: ((catalogV3Json as any).skillDefinitions ?? []).map((sk: any) => ({
    id: sk.id,
    name: sk.title ?? sk.name ?? sk.id,
    description: sk.description ?? '',
    experienceScope: 'shared',
  })),
  difficultyDefinitions: ((catalogV3Json as any).difficultyDefinitions ?? []).map((d: any) => d.id),
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
    // Zero is valid: the catalog deliberately leaves private tracking unrewarded.
    if (!t.points || t.points.taskPoints < 0 || t.points.xp < 0) {
      errors.push(`Task ${t.id} has invalid points`);
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

/** Level, next level and XP progress for a total, using the catalog's level records. */
export const currentLevelProgress = (totalXp: number, completedCheckpoints: readonly string[] = []): LevelProgress =>
  levelProgress(totalXp, catalog.levels, new Set(completedCheckpoints));

// ---------------------------------------------------------------- roadmap

export interface RoadmapStage {
  id: string;
  /** Levels within a chapter, 1-based, e.g. [1, 5]. */
  range: [number, number];
  purpose: string;
}

export interface RoadmapChapter {
  number: number;
  id: string;
  title: string;
  description: string;
  outcome: string;
  levelRange: [number, number];
  recommendedTaskIds: string[];
  capstone: { title: string; purpose: string; requiredAtLevel: number } | null;
}

const capstones = new Map<string, { title: string; purpose: string; requiredAtLevel: number }>(
  (((catalogV3Json as any).capstoneDefinitions ?? []) as any[]).map((c) => [
    c.id,
    { title: c.title, purpose: c.purpose, requiredAtLevel: c.requiredAtLevel },
  ]),
);

const roadmapChapters: RoadmapChapter[] = v3Chapters
  .map((ch) => ({
    number: ch.order,
    id: ch.id,
    title: ch.title,
    description: ch.description,
    outcome: ch.primaryOutcome ?? '',
    levelRange: [ch.levels.start, ch.levels.end] as [number, number],
    recommendedTaskIds: ch.recommendedTaskIds ?? [],
    capstone: capstones.get(ch.capstoneId) ?? null,
  }))
  .sort((a, b) => a.number - b.number);

const roadmapStages: RoadmapStage[] = (((catalogV3Json as any).levelStageDefinitions ?? []) as any[]).map((s) => ({
  id: s.id,
  range: s.levelsWithinChapter as [number, number],
  purpose: s.purpose,
}));

/** The 20 chapters of the journey with their outcomes, suggested quests and capstones. */
export const getRoadmapChapters = (): RoadmapChapter[] => roadmapChapters;
/** The stages every chapter moves through (orientation, practice, application ...). */
export const getRoadmapStages = (): RoadmapStage[] => roadmapStages;
