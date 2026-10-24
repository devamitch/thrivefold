import { ProductExperience } from '../../theme/tokens';

export type TaskCategory =
  | 'movement'
  | 'mindfulness'
  | 'breathing'
  | 'sleep'
  | 'nutrition'
  | 'learning'
  | 'routine'
  | 'social'
  | 'mens_vitality'
  | 'cycle_care'
  | 'affirming_care';

export type DifficultyTier = 'starter' | 'steady' | 'gentle' | 'standard' | 'progressive' | 'advanced' | 'mastery';

export type VerificationClass = 'system_verified' | 'evidence_supported' | 'self_reported';

export type AssignmentStatus =
  | 'assigned'
  | 'in_progress'
  | 'pending_verification'
  | 'verified'
  | 'self_reported'
  | 'skipped'
  | 'replaced'
  | 'rejected'
  | 'expired';

export interface TaskInstruction {
  id: string;
  stepNumber: number;
  title: string;
  body: string;
}

export interface SkillOutcome {
  skillId: string;
  skillXp: number;
}

export interface VerificationRequirement {
  type: 'in_app_timer' | 'assessment_answers' | 'activity_log_details' | 'self_declaration';
  description: string;
  minDurationSeconds?: number;
  requiredFields?: string[];
}

export interface TaskDefinition {
  id: string;
  version: number;
  title: string;
  shortDescription: string;
  purpose: string;
  instructions: TaskInstruction[];
  category: TaskCategory;
  experienceScopes: (ProductExperience | 'shared')[];
  skillOutcomes: SkillOutcome[];
  difficulty: DifficultyTier;
  estimatedDurationMinutes: number;
  levelEligibility: {
    minimumLevel: number;
    maximumLevel: number;
  };
  prerequisiteTaskIds: string[];
  verificationClass: VerificationClass;
  verificationPolicyId: string;
  verificationRequirements: VerificationRequirement[];
  points: {
    taskPoints: number; // Daily goal contribution
    xp: number; // Permanent player XP
    coins: number;
  };
  availability: {
    assignmentTypes: ('daily' | 'special_quest' | 'campaign')[];
    canReplaceDaily: boolean;
  };
  safetyConstraints?: string[];
  contentProvenance: {
    authored: boolean;
    reviewed: boolean;
  };
  /** Catalog objective with its completion criteria (v3); absent for v1 tasks. */
  objective?: { type?: string; completionCriteria?: Record<string, unknown> } | null;
  /** Catalog sensitivity class; sensitive tasks are never auto-assigned. */
  sensitivity?: string;
  /** Catalog age gate such as '18_plus'; gated tasks need verified eligibility. */
  ageGate?: string | null;
  /** False when the catalog says completing it must not count toward the daily goal. */
  dailyGoalEligible?: boolean;
  catalogSource?: 'v1' | 'v3';
  /** 'authored' is released; anything else still awaits review and is not assigned. */
  contentStatus?: string;
}

export interface SpecialQuestDefinition extends TaskDefinition {
  replacesAssignmentType: 'daily';
  vaultCategory: 'mobility' | 'strength' | 'nervous_system' | 'nourishment' | 'restorative' | 'focus';
}

export interface LevelDefinition {
  level: number;
  chapterNumber: number;
  title: string;
  arc: string;
  /** Cumulative XP needed to reach this level. */
  requiredCumulativeXp: number;
  unlockedFeatures: string[];
  /** XP needed to advance from this level to the next. */
  xpRequiredToAdvance?: number;
  /** A chapter checkpoint that must be completed to advance past this level. */
  checkpointId?: string | null;
}

export interface ChapterDefinition {
  chapterNumber: number;
  title: string;
  theme: string;
  levelRange: [number, number];
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  experienceScope: ProductExperience | 'shared';
}

export interface GameCatalog {
  catalogMeta: {
    id: string;
    version: number;
    updatedAt: string;
    totalLevels: number;
    author: string;
  };
  experienceScopes: string[];
  skillDefinitions: SkillDefinition[];
  difficultyDefinitions: DifficultyTier[];
  verificationPolicies: {
    id: string;
    name: string;
    verificationClass: VerificationClass;
    description: string;
  }[];
  chapters: ChapterDefinition[];
  levels: LevelDefinition[];
  tasks: TaskDefinition[];
  specialQuests: SpecialQuestDefinition[];
  dailyTaskRules: {
    defaultTargetPoints: number;
    maxDailyAssignedTasks: number;
    skipCooldownMinutes: number;
  };
}

export interface TaskAssignment {
  assignmentId: string;
  taskId: string;
  assignedDate: string; // YYYY-MM-DD
  status: AssignmentStatus;
  isSpecialQuestReplacement: boolean;
  replacedAssignmentId?: string;
  skipReason?: string;
  completedAt?: string;
  earnedTaskPoints: number;
  earnedXp: number;
  earnedCoins: number;
  verificationClass?: VerificationClass;
  /** v3 special quest that offered this replacement task. */
  specialQuestId?: string | null;
  /** Reason codes from the last rejected attempt, for the evidence form. */
  lastRejectionCodes?: string[];
  /** The person's own answers, kept on this device with the assignment. */
  evidenceAnswers?: Record<string, string | number | boolean | undefined>;
}

export interface EvidenceSubmission {
  assignmentId: string;
  elapsedSeconds?: number;
  answers?: Record<string, string | number>;
  notes?: string;
  selfDeclaredHonest: boolean;
}

export interface VerificationResult {
  success: boolean;
  status: AssignmentStatus;
  assignmentId: string;
  taskId: string;
  reasonCodes: string[];
  earnedTaskPoints: number;
  earnedXp: number;
  earnedCoins: number;
  verifiedAt: string;
}

/** A v3 special quest: a parent that offers child tasks; only the child task is rewarded. */
export interface SpecialQuestParent {
  id: string;
  title: string;
  purpose: string;
  replacesCategories: string[];
  taskIds: string[];
  eligibleLevelRange: [number, number];
}
