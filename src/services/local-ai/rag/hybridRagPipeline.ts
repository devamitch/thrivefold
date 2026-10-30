/**
 * Hybrid RAG (Retrieval-Augmented Generation) Pipeline.
 *
 * Unifies dense vector embedding retrieval and sparse BM25 keyword search:
 * 1. Ingests user-scoped notes, analytical memories, and verified exercise catalogs.
 * 2. Employs Reciprocal Rank Fusion (RRF) to blend semantic and lexical matches.
 * 3. Enforces confidence thresholds to avoid AI hallucinations.
 * 4. Assembles evidence-grounded contexts with strict provenance citations.
 */

import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { knowledgeStore, type KnowledgeChunk } from './knowledgeStore';
import { tokenize, makeSnippet } from '../../../domain/ai/localRetrieval';
import { EXERCISES } from '../../../domain/fitness/workouts';

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
    | 'medical_reference';
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
 * Executes a full hybrid retrieval query over persistent analytical memories,
 * ingested documents/guides, and local catalogs.
 */
export async function retrieveHybridEvidence(
  userId: string,
  query: string,
  topK = 4
): Promise<RagEvidenceHit[]> {
  const catalogDocs = getExerciseCatalogDocuments();

  // 1. Fetch user-scoped analytical memories from SQLite
  const userMemories = await memoryStore.listMemories(userId, { status: 'active' });
  const memoryDocs: RagDocument[] = userMemories.map((m: UserMemory) => ({
    id: m.id,
    sourceType: 'user_memory' as const,
    title: `${m.kind.toUpperCase()} Memory`,
    content: m.content,
    date: m.updatedAt,
    metadata: m.metadata,
    embedding: m.embedding,
  }));

  // 2. Fetch ingested knowledge chunks from SQLite
  let knowledgeChunkDocs: RagDocument[] = [];
  try {
    const chunks = await knowledgeStore.getAllChunks(userId);
    knowledgeChunkDocs = chunks.map((c) => ({
      id: c.id,
      sourceType: 'user_document' as const,
      title: c.documentTitle ?? `Doc Chunk ${c.chunkIndex + 1}`,
      content: c.content,
      date: c.createdAt,
      embedding: c.embedding,
      chunkOffset: { start: c.startOffset, end: c.endOffset },
      metadata: { documentId: c.documentId, tokenEstimate: c.tokenEstimate },
    }));
  } catch {
    // If table is newly created or empty
  }

  const allDocs = [...catalogDocs, ...memoryDocs, ...knowledgeChunkDocs];

  // 3. Sparse Lexical BM25 Ranking
  const sparseHits = rankSparseBM25(allDocs, query);
  const sparseRankMap = new Map<string, number>();
  sparseHits.forEach((hit, idx) => sparseRankMap.set(hit.doc.id, idx + 1));

  // 4. Dense Semantic Vector Search (if local embedding model available)
  const denseRankMap = new Map<string, number>();
  if (LocalAI.isLoaded()) {
    try {
      const queryVec = await LocalAI.embed(query);
      if (queryVec && queryVec.length > 0) {
        // Query memory store vectors
        const denseMemories = await memoryStore.searchMemoriesByVector(userId, queryVec, 10, 0.4);
        denseMemories.forEach((res, idx) => denseRankMap.set(res.memory.id, idx + 1));

        // Query knowledge chunk vectors
        const denseChunks = await knowledgeStore.searchChunksByVector(userId, queryVec, 10, 0.4);
        denseChunks.forEach((res, idx) => {
          const currentRank = denseRankMap.get(res.chunk.id);
          if (currentRank === undefined || idx + 1 < currentRank) {
            denseRankMap.set(res.chunk.id, idx + 1);
          }
        });
      }
    } catch {
      // Degrades gracefully to sparse ranking if embedding engine is busy or unavailable
    }
  }

  // 5. Reciprocal Rank Fusion (RRF)
  const candidateIds = new Set<string>([...sparseRankMap.keys(), ...denseRankMap.keys()]);
  const docMap = new Map<string, RagDocument>(allDocs.map((d) => [d.id, d]));
  const fusionHits: RagEvidenceHit[] = [];

  for (const docId of candidateIds) {
    const doc = docMap.get(docId);
    if (!doc) continue;

    const sRank = sparseRankMap.get(docId);
    const dRank = denseRankMap.get(docId);

    let score = 0;
    if (sRank !== undefined) score += 1 / (RRF_K + sRank);
    if (dRank !== undefined) score += 1.2 / (RRF_K + dRank); // Boost for semantic vector matches

    const terms = tokenize(query);
    fusionHits.push({
      document: doc,
      sparseRank: sRank,
      denseRank: dRank,
      hybridScore: score,
      snippet: makeSnippet(doc.content, terms),
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

  // If local AI is loaded, synthesize grounded response; otherwise format crisp factual digest
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
