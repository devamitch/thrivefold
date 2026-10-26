import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { MemoryRetrievalResult } from '../memory/types';

/**
 * Searches local analytical memory semantically using on-device dense vector embeddings.
 * Fully offline-first and private.
 */
export async function searchMemoriesSemantically(
  userId: string,
  query: string,
  topK = 5
): Promise<MemoryRetrievalResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  if (!LocalAI.isLoaded()) {
    // Keyword fallback search if model is unmapped
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    const matched = all.filter((m) => m.content.toLowerCase().includes(qLower));
    return matched.slice(0, topK).map((mem) => ({
      memory: mem,
      similarity: 1.0,
      score: mem.confidence,
    }));
  }

  try {
    const queryVector = await LocalAI.embed(query);
    return await memoryStore.searchMemoriesByVector(userId, queryVector, topK, 0.50);
  } catch {
    // If embedding fails, fallback to keyword filtering
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    return all
      .filter((m) => m.content.toLowerCase().includes(qLower))
      .slice(0, topK)
      .map((mem) => ({
        memory: mem,
        similarity: 1.0,
        score: mem.confidence,
      }));
  }
}
