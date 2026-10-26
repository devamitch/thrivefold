import { classifyReflection, type ClassificationResult } from '../tasks/classification';
import { extractWellnessEntities, type ExtractedEntities } from '../tasks/entityExtraction';
import { summarizeWellnessJournal, type SummaryResult } from '../tasks/summarization';
import { suggestOrganization, type OrganizationSuggestion } from '../tasks/organizationSuggestions';
import { searchMemoriesSemantically } from '../tasks/semanticSearch';
import type { MemoryRetrievalResult } from '../memory/types';

export type OrchestratedTask =
  | { type: 'classify'; text: string }
  | { type: 'extract_entities'; text: string }
  | { type: 'summarize'; notes: string[] }
  | { type: 'suggest_organization'; content: string }
  | { type: 'semantic_search'; userId: string; query: string; topK?: number };

export type OrchestratedResult =
  | { type: 'classify'; data: ClassificationResult }
  | { type: 'extract_entities'; data: ExtractedEntities }
  | { type: 'summarize'; data: SummaryResult }
  | { type: 'suggest_organization'; data: OrganizationSuggestion }
  | { type: 'semantic_search'; data: MemoryRetrievalResult[] };

/**
 * Deterministic crisis and safety circuit breaker.
 * Evaluates immediate safety before invoking any conversational inference.
 */
export function checkCrisisInterception(text: string): { isCrisis: boolean; helplineNotice?: string } {
  const lower = text.toLowerCase();
  const crisisPatterns = [
    'suicide',
    'kill myself',
    'end my life',
    'self harm',
    'cutting myself',
    'want to die',
    'overdose',
  ];

  for (const pattern of crisisPatterns) {
    if (lower.includes(pattern)) {
      return {
        isCrisis: true,
        helplineNotice:
          'If you or someone you know is going through a difficult time, free, confidential support is available 24/7. Please call or text 988 (Suicide & Crisis Lifeline) or your local emergency services.',
      };
    }
  }

  return { isCrisis: false };
}

/**
 * Master Task Router.
 * Routes requests to specialized structured on-device handlers with safety guards.
 */
export async function routeLocalAiTask(task: OrchestratedTask): Promise<OrchestratedResult> {
  switch (task.type) {
    case 'classify': {
      const crisis = checkCrisisInterception(task.text);
      if (crisis.isCrisis) {
        return {
          type: 'classify',
          data: {
            category: 'tense',
            confidence: 1.0,
            keywords: ['crisis_intercepted'],
            suggestedAction: crisis.helplineNotice ?? 'Please reach out to emergency support.',
            reasoning: 'Immediate crisis circuit breaker triggered.',
          },
        };
      }
      const data = await classifyReflection(task.text);
      return { type: 'classify', data };
    }

    case 'extract_entities': {
      const data = await extractWellnessEntities(task.text);
      return { type: 'extract_entities', data };
    }

    case 'summarize': {
      const data = await summarizeWellnessJournal(task.notes);
      return { type: 'summarize', data };
    }

    case 'suggest_organization': {
      const data = await suggestOrganization(task.content);
      return { type: 'suggest_organization', data };
    }

    case 'semantic_search': {
      const data = await searchMemoriesSemantically(task.userId, task.query, task.topK);
      return { type: 'semantic_search', data };
    }
  }
}
