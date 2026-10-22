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

export type DifficultyTier = 'starter' | 'gentle' | 'standard' | 'progressive' | 'advanced' | 'mastery';

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
  requiredCumulativeXp: number;
  unlockedFeatures: string[];
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
