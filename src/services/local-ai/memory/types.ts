/**
 * Analytical Local Memory Data Types
 */

export type MemoryKind =
  | 'profile'      // User-approved facts, bio-traits, settings
  | 'preference'   // Explicit or observed habit/UI preferences
  | 'episode'      // Summaries of meaningful check-ins, workouts, milestones
  | 'fact'         // Specific verified facts (e.g., "Prefers morning yoga")
  | 'workflow'     // Procedural routines and learned step-by-step instructions
  | 'semantic';    // Conceptual relationships between tags, habits, goals

export type MemoryOrigin = 'user_declared' | 'observed' | 'ai_inferred';

export type MemoryStatus = 'active' | 'needs_confirmation' | 'archived';

export interface UserMemory {
  id: string;
  userId: string;
  kind: MemoryKind;
  content: string;
  embedding?: number[];
  sourceEventIds: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  origin: MemoryOrigin;
  status: MemoryStatus;
  metadata?: Record<string, unknown>;
}

export interface MemoryRetrievalResult {
  memory: UserMemory;
  similarity: number;
  score: number; // Combined relevance * recency * confidence
}

export interface MemoryFilter {
  kind?: MemoryKind;
  status?: MemoryStatus;
  includeExpired?: boolean;
  minConfidence?: number;
  origin?: MemoryOrigin;
}
