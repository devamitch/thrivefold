/**
 * Hybrid RAG (Retrieval-Augmented Generation) Pipeline.
 *
 * Implements independent dual-branch retrieval with Reciprocal Rank Fusion (RRF k=60):
 * Branch A: Independent SQLite FTS5 lexical candidates (sub-millisecond BM25 ranking).
 * Branch B: Independent semantic vector candidates (cosine similarity top-K).
 * Fusion: Reciprocal Rank Fusion blending semantic and lexical candidates.
 * Hydration: Fetches ONLY selected candidate records by ID from SQLite, guarding device RAM.
 */

import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { knowledgeStore, type KnowledgeChunk } from './knowledgeStore';
import { tokenize, makeSnippet } from '../../../domain/ai/localRetrieval';
import { EXERCISES } from '../../../domain/fitness/workouts';
import { anvayFtsStore, type FtsSearchHit } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface RagDocument {
  id: string;
  sourceType:
    | 'user_memory'
    | 'user_journal'
    | 'exercise_catalog'
    | 'wellness_guide'
    | 'user_document'
    | 'user_note'
    | 'health_article'
    | 'imported_file'
    | 'medical_reference'
    | 'learn_library';
  title: string;
  content: string;
  date?: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
  chunkOffset?: { start: number; end: number };
}

export interface RagEvidenceHit {
  document: RagDocument;
  denseRank?: number;
  sparseRank?: number;
  hybridScore: number;
  snippet: string;
}

export interface RagResponse {
  answer: string;
  citations: string[];
  evidenceHits: RagEvidenceHit[];
  confidence: number;
  isGrounded: boolean;
}

const RRF_K = 60; // Standard reciprocal rank fusion smoothing constant

/**
 * Builds standard verified knowledge documents from the local exercise catalog.
 */
export function getExerciseCatalogDocuments(): RagDocument[] {
  return EXERCISES.map((ex) => ({
    id: `catalog_ex_${ex.id}`,
    sourceType: 'exercise_catalog' as const,
    title: ex.name,
    content: `${ex.name} (${ex.pattern} movement, ${ex.equipment} equipment). Steps: ${ex.steps.join(' ')}. Safety: ${ex.safety}. Easier variation: ${ex.easier}. Harder variation: ${ex.harder}.`,
    metadata: {
      exerciseId: ex.id,
      pattern: ex.pattern,
      equipment: ex.equipment,
      timed: ex.timed ?? false,
    },
  }));
}

/**
 * Ranks documents using BM25 sparse lexical matching.
 */
export function rankSparseBM25(docs: RagDocument[], query: string): { doc: RagDocument; score: number }[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];

  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.content}`));
  const avgLen = tokenized.reduce((a, t) => a + t.length, 0) / docs.length || 1;

  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const K1 = 1.2;
  const B = 0.75;
  const hits: { doc: RagDocument; score: number }[] = [];

  docs.forEach((doc, i) => {
    const tokens = tokenized[i];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * tokens.length) / avgLen));
    }
    if (score > 0) {
      hits.push({ doc, score });
    }
  });

  return hits.sort((a, b) => b.score - a.score);
}

/**
 * Hydrates only the specific candidate documents identified by FTS5 or Vector search.
 */
function hydrateCandidateDocuments(
  userId: string,
  candidateKeys: { chunkIds: string[]; memoryIds: string[]; exerciseIds: string[] }
): Map<string, RagDocument> {
  const docMap = new Map<string, RagDocument>();
  const db = getSharedLocalMemoryDb();

  // 1. Hydrate exercise catalog candidates
  if (candidateKeys.exerciseIds.length > 0) {
    const catalog = getExerciseCatalogDocuments();
    for (const exDoc of catalog) {
      const bareId = exDoc.id.replace('catalog_ex_', '');
      if (candidateKeys.exerciseIds.includes(bareId) || candidateKeys.exerciseIds.includes(exDoc.id)) {
        docMap.set(exDoc.id, exDoc);
        docMap.set(bareId, exDoc);
      }
    }
  }

  // 2. Hydrate specific memory candidates
  if (candidateKeys.memoryIds.length > 0) {
    const placeholders = candidateKeys.memoryIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT * FROM user_memories WHERE id IN (${placeholders}) AND user_id = ? AND status = 'active'`,
      [...candidateKeys.memoryIds, userId]
    );
    for (const r of rows) {
      docMap.set(r.id, {
        id: r.id,
        sourceType: 'user_memory',
        title: `${r.kind.toUpperCase()} Memory`,
        content: r.content,
        date: r.updated_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
      });
    }
  }

  // 3. Hydrate specific chunk candidates
  if (candidateKeys.chunkIds.length > 0) {
    const placeholders = candidateKeys.chunkIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT c.*, d.title as doc_title, d.source_type
       FROM rag_chunks c
       JOIN rag_documents d ON d.id = c.document_id
       WHERE c.id IN (${placeholders}) AND c.user_id = ?`,
      [...candidateKeys.chunkIds, userId]
    );
    for (const r of rows) {
      docMap.set(r.id, {
        id: r.id,
        sourceType: 'user_document',
        title: r.doc_title || 'Document Chunk',
        content: r.content,
        date: r.created_at,
        chunkOffset: { start: r.start_offset, end: r.end_offset },
        metadata: { documentId: r.document_id, tokenEstimate: r.token_estimate },
      });
    }
  }

  return docMap;
}

/**
 * Executes independent dual-branch hybrid retrieval over persistent analytical memories,
 * ingested documents, and exercise catalogs.
 */
export async function retrieveHybridEvidence(
  userId: string,
  query: string,
  topK = 4
): Promise<RagEvidenceHit[]> {
  // Branch A: Independent SQLite FTS5 Candidate Retrieval
  const ftsHits = anvayFtsStore.search(query, { ownerId: userId, limit: 30 });
  const sparseRankMap = new Map<string, number>();
  const ftsSnippetMap = new Map<string, string>();

  const candidateChunkIds: string[] = [];
  const candidateMemoryIds: string[] = [];
  const candidateExerciseIds: string[] = [];

  ftsHits.forEach((hit, idx) => {
    const key = hit.chunkId || hit.sourceId;
    sparseRankMap.set(key, idx + 1);
    if (hit.snippet) ftsSnippetMap.set(key, hit.snippet);

    if (hit.sourceTable === 'rag_chunks' && hit.chunkId) {
      candidateChunkIds.push(hit.chunkId);
    } else if (hit.sourceTable === 'user_memories') {
      candidateMemoryIds.push(hit.sourceId);
    } else if (hit.sourceTable === 'exercise_catalog') {
      candidateExerciseIds.push(hit.sourceId);
    }
  });

  // Branch B: Independent Dense Semantic Vector Retrieval (if local model loaded)
  const denseRankMap = new Map<string, number>();
  if (LocalAI.isLoaded()) {
    try {
      const queryVec = await LocalAI.embed(query);
      if (queryVec && queryVec.length > 0) {
        // Query memory store vectors
        const denseMemories = await memoryStore.searchMemoriesByVector(userId, queryVec, 10, 0.4);
        denseMemories.forEach((res, idx) => {
          denseRankMap.set(res.memory.id, idx + 1);
          candidateMemoryIds.push(res.memory.id);
        });

        // Query knowledge chunk vectors
        const denseChunks = await knowledgeStore.searchChunksByVector(userId, queryVec, 10, 0.4);
        denseChunks.forEach((res, idx) => {
          const currentRank = denseRankMap.get(res.chunk.id);
          if (currentRank === undefined || idx + 1 < currentRank) {
            denseRankMap.set(res.chunk.id, idx + 1);
          }
          candidateChunkIds.push(res.chunk.id);
        });
      }
    } catch {
      // Degrades gracefully to lexical ranking if vector engine is unavailable
    }
  }

  // Fallback: If both FTS and vector produced zero results (e.g., initial empty index), rank catalog directly
  if (sparseRankMap.size === 0 && denseRankMap.size === 0) {
    const catalog = getExerciseCatalogDocuments();
    const fallbackHits = rankSparseBM25(catalog, query);
    fallbackHits.slice(0, topK).forEach((hit, idx) => {
      sparseRankMap.set(hit.doc.id, idx + 1);
      candidateExerciseIds.push(hit.doc.id);
    });
  }

  // Hydrate ONLY the selected candidate records by ID from SQLite
  const docMap = hydrateCandidateDocuments(userId, {
    chunkIds: Array.from(new Set(candidateChunkIds)),
    memoryIds: Array.from(new Set(candidateMemoryIds)),
    exerciseIds: Array.from(new Set(candidateExerciseIds)),
  });

  // Reciprocal Rank Fusion (RRF k=60)
  const candidateIds = new Set<string>([...sparseRankMap.keys(), ...denseRankMap.keys()]);
  const fusionHits: RagEvidenceHit[] = [];

  for (const docId of candidateIds) {
    const doc = docMap.get(docId);
    if (!doc) continue;

    const sRank = sparseRankMap.get(docId);
    const dRank = denseRankMap.get(docId);

    let score = 0;
    if (sRank !== undefined) score += 1 / (RRF_K + sRank);
    if (dRank !== undefined) score += 1.2 / (RRF_K + dRank); // 1.2x multiplier for semantic relevance

    const terms = tokenize(query);
    const snippet = ftsSnippetMap.get(docId) || makeSnippet(doc.content, terms);
    fusionHits.push({
      document: doc,
      sparseRank: sRank,
      denseRank: dRank,
      hybridScore: score,
      snippet,
    });
  }

  return fusionHits.sort((a, b) => b.hybridScore - a.hybridScore).slice(0, topK);
}

/**
 * Answers a user wellness question strictly grounded in verified local evidence.
 */
export async function answerWithHybridRag(
  userId: string,
  query: string
): Promise<RagResponse> {
  const hits = await retrieveHybridEvidence(userId, query, 3);

  if (hits.length === 0 || hits[0].hybridScore < 0.01) {
    return {
      answer: 'I could not find enough relevant records in your personal wellness notes, documents, or exercise library to answer that with certainty.',
      citations: [],
      evidenceHits: [],
      confidence: 0,
      isGrounded: false,
    };
  }

  const citations: string[] = hits.map((h) => {
    if (h.document.sourceType === 'exercise_catalog') {
      return `[Exercise Catalog: ${h.document.title}]`;
    }
    if (h.document.sourceType === 'user_document') {
      return `[Document: ${h.document.title}]`;
    }
    return `[Personal Memory: ${h.document.title}]`;
  });

  // If local AI is loaded, synthesize grounded response; otherwise format factual digest
  if (LocalAI.isLoaded()) {
    const evidenceText = hits.map((h, i) => `[Source ${i + 1} - ${h.document.title}]: ${h.document.content}`).join('\n\n');
    const prompt =
      `You are Thrive Coach, an evidence-grounded on-device wellness assistant.\n` +
      `Use ONLY the provided evidence below to answer the user's question.\n` +
      `Cite sources using [Source 1], [Source 2], etc. If the answer is not in the context, say "I don't know based on your recorded notes and documents." Do not invent facts.\n\n` +
      `Evidence Context:\n${evidenceText}\n\n` +
      `Question: "${query}"\n\n` +
      `Answer:`;

    try {
      const generated = await LocalAI.generateText({
        prompt,
        system: 'You are an accurate, evidence-grounded on-device wellness assistant. Never invent facts beyond the evidence.',
      });

      return {
        answer: generated.trim(),
        citations,
        evidenceHits: hits,
        confidence: 0.9,
        isGrounded: true,
      };
    } catch {
      // Fall through to deterministic synthesizer
    }
  }

  // Deterministic synthesis fallback
  const topDoc = hits[0].document;
  const sourceLabel =
    topDoc.sourceType === 'exercise_catalog'
      ? 'exercise catalog'
      : topDoc.sourceType === 'user_document'
      ? 'saved health documents'
      : 'recorded notes';

  const answer = `Based on your ${sourceLabel}: ${hits.map((h) => h.snippet).join(' ')}`;

  return {
    answer,
    citations,
    evidenceHits: hits,
    confidence: 0.85,
    isGrounded: true,
  };
}
