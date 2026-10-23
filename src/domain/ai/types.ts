import { ProductExperience } from '../../theme/tokens';

export type AiTask =
  | 'routine_classification'
  | 'health_education_explanation'
  | 'reflection_prompt'
  | 'task_personalization'
  | 'moderation_assist'
  | 'complex_reasoning';

export type AiPrivacyClass =
  | 'public_content'
  | 'personal_non_sensitive'
  | 'sensitive_health'
  | 'intimate_social'
  | 'crisis_signal';

export interface ApprovedLocalContext {
  task: AiTask;
  experience: ProductExperience;
  privacyClass: AiPrivacyClass;
  allowedMemoryIds: string[];
  userApprovedFacts: Record<string, unknown>;
  locale: string;
  maxOutputTokens: number;
}

export interface AiResult {
  text: string;
  confidence: number;
  source: 'local_deterministic' | 'local_classifier' | 'on_device_llm' | 'cloud_gateway_gemini';
  limitationsDisclosed: string;
}

export interface LocalAiProvider {
  isAvailable(): Promise<boolean>;
  generate(task: AiTask, approvedContext: ApprovedLocalContext): Promise<AiResult>;
}

export interface CloudAiRequest {
  task: AiTask;
  privacyClass: AiPrivacyClass;
  contextMinimized: Record<string, unknown>;
  consentRecordId: string;
  idempotencyKey: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'routine' | 'goal' | 'limitation' | 'pattern';
  content: string;
  /** Where it came from: typed by the person, or an insight they chose to keep. */
  source: 'user' | 'insight';
  /** Insight id when source is 'insight', so the same pattern isn't saved twice. */
  sourceRef?: string;
  createdAt: string;
  updatedAt?: string;
  /** Insight-derived memories expire so stale patterns don't linger. */
  expiresAt?: string;
  isSensitive: boolean;
}

/** Memories that have not expired, newest first. */
export function activeMemories(items: MemoryItem[], now: Date = new Date()): MemoryItem[] {
  const t = now.getTime();
  return items
    .filter((m) => !m.expiresAt || new Date(m.expiresAt).getTime() > t)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
