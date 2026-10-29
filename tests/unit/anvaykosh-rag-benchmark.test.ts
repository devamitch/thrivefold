jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

// Mock in-memory SQLite store for Knowledge and Memories
const mockDocs: any[] = [];
const mockChunks: any[] = [];

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn((sql: string, params: any[]) => {
      if (sql.includes('INSERT INTO rag_documents')) {
        mockDocs.push({
          id: params[0],
          user_id: params[1],
          title: params[2],
          source_type: params[3],
          raw_text: params[4],
          chunk_count: params[5],
          created_at: params[6],
          metadata_json: params[7],
        });
        return { changes: 1 };
      }
      if (sql.includes('INSERT INTO rag_chunks')) {
        mockChunks.push({
          id: params[0],
          document_id: params[1],
          user_id: params[2],
          chunk_index: params[3],
          content: params[4],
          start_offset: params[5],
          end_offset: params[6],
          token_estimate: params[7],
          embedding_json: params[8],
          created_at: params[9],
        });
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM rag_chunks')) {
        const initial = mockChunks.length;
        mockChunks.length = 0;
        return { changes: initial };
      }
      if (sql.includes('DELETE FROM rag_documents')) {
        const initial = mockDocs.length;
        mockDocs.length = 0;
        return { changes: initial };
      }
      return { changes: 1 };
    }),
    getAllSync: jest.fn((sql: string, params: any[]) => {
      if (sql.includes('FROM rag_documents')) {
        return mockDocs.filter((d) => !params || d.user_id === params[0]);
      }
      if (sql.includes('FROM rag_chunks')) {
        return mockChunks.filter((c) => !params || c.user_id === params[0]);
      }
      if (sql.includes('FROM user_memories')) {
        return [];
      }
      return [];
    }),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
}));

import { LocalAI, jsChunkDocument, jsComputeTermFrequencies } from '../../modules/local-ai';
import { knowledgeStore } from '../../src/services/local-ai/rag/knowledgeStore';
import {
  rankSparseBM25,
  retrieveHybridEvidence,
  answerWithHybridRag,
  type RagDocument,
} from '../../src/services/local-ai/rag/hybridRagPipeline';
import { executeTool } from '../../src/domain/assistant/toolRegistry';

describe('Anvaykosh AI — Local Vector RAG & Document Processing Benchmark', () => {
  beforeEach(() => {
    mockDocs.length = 0;
    mockChunks.length = 0;
  });

  describe('Document Chunker & Term Frequencies', () => {
    it('cleans non-printable characters and preserves meaningful text', () => {
      const raw = 'Hello \x00 world!\r\n\tThis is   a test.';
      const chunks = jsChunkDocument(raw, 300, 30);
      expect(chunks.length).toBe(1);
      expect(chunks[0].text).toBe('Hello world! This is a test.');
    });

    it('splits long documents along sentence boundaries with sliding overlap', () => {
      const longText =
        'Hydration is essential for cognitive performance and physical vitality. ' +
        'Drinking adequate water sustains cellular metabolism and prevents daily fatigue. ' +
        'Consistent walking and light resistance training promote cardiovascular longevity. ' +
        'Gentle evening stretches relieve muscle tension and encourage restorative deep sleep.';

      const chunks = jsChunkDocument(longText, 120, 25);
      expect(chunks.length).toBeGreaterThanOrEqual(2);

      // Verify offsets and index
      chunks.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
        expect(chunk.startOffset).toBeGreaterThanOrEqual(0);
        expect(chunk.endOffset).toBeGreaterThan(chunk.startOffset);
        expect(chunk.tokenEstimate).toBeGreaterThan(0);
      });
    });

    it('extracts sparse term frequencies for BM25 indexing', () => {
      const text = 'Hydration in water intake improve hydration and stamina of body';
      const tf = jsComputeTermFrequencies(text);
      expect(tf['hydration']).toBe(2);
      expect(tf['water']).toBe(1);
      expect(tf['intake']).toBe(1);
      expect(tf['stamina']).toBe(1);
      // Words <= 2 chars (in, of) should be omitted
      expect(tf['in']).toBeUndefined();
      expect(tf['of']).toBeUndefined();
    });
  });

  describe('BM25 Lexical Ranking', () => {
    const testDocs: RagDocument[] = [
      {
        id: 'doc_1',
        sourceType: 'user_note',
        title: 'Hydration Guidelines',
        content: 'Drink 8 glasses of fresh clean water every single day for optimal kidney health.',
      },
      {
        id: 'doc_2',
        sourceType: 'user_note',
        title: 'Deep Sleep Hygiene',
        content: 'Avoid bright blue screens 60 minutes before bedtime to increase melatonin secretion.',
      },
      {
        id: 'doc_3',
        sourceType: 'exercise_catalog',
        title: 'Bodyweight Squats',
        content: 'Stand with feet shoulder-width apart, keep spine neutral, and drive up through heels.',
      },
    ];

    it('ranks relevant documents highest for specific keyword queries', () => {
      const hits = rankSparseBM25(testDocs, 'glasses of water hydration');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].doc.id).toBe('doc_1');
      expect(hits[0].score).toBeGreaterThan(0);
    });

    it('ranks exercise documentation accurately for fitness queries', () => {
      const hits = rankSparseBM25(testDocs, 'squat spine heels');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].doc.id).toBe('doc_3');
    });

    it('returns empty array when query does not match any document vocabulary', () => {
      const hits = rankSparseBM25(testDocs, 'extraterrestrial spaceship galaxy');
      expect(hits).toEqual([]);
    });
  });

  describe('Knowledge Store SQLite Persistence', () => {
    it('ingests, chunks, and lists documents for a user', async () => {
      const doc = await knowledgeStore.ingestDocument('test_user', {
        title: 'Mindful Breathing Guide',
        text: 'Inhale slowly for four seconds through your nose. Hold for four seconds. Exhale slowly for four seconds.',
        sourceType: 'wellness_guide',
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Mindful Breathing Guide');
      expect(doc.chunkCount).toBeGreaterThanOrEqual(1);
      expect(mockDocs.length).toBe(1);
      expect(mockChunks.length).toBeGreaterThanOrEqual(1);

      const docs = await knowledgeStore.listDocuments('test_user');
      expect(docs.length).toBe(1);
      expect(docs[0].title).toBe('Mindful Breathing Guide');
    });

    it('clears all knowledge documents on demand (Right to Be Forgotten)', async () => {
      await knowledgeStore.ingestDocument('test_user', {
        title: 'Temporary Note',
        text: 'This should be wiped out completely.',
      });

      expect(mockDocs.length).toBe(1);
      await knowledgeStore.clearAllDocuments('test_user');
      expect(mockDocs.length).toBe(0);
      expect(mockChunks.length).toBe(0);
    });
  });

  describe('Hybrid RAG Engine Retrieval & Evidence Grounding', () => {
    it('retrieves exercise catalog and knowledge docs via hybrid pipeline', async () => {
      // Ingest test document into mock
      await knowledgeStore.ingestDocument('local_user', {
        title: 'Shoulder Mobility',
        text: 'Gentle arm circles and band pull-aparts improve shoulder mobility and relieve upper back tension.',
        sourceType: 'user_note',
      });

      const hits = await retrieveHybridEvidence('local_user', 'shoulder mobility band pull', 3);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].hybridScore).toBeGreaterThan(0);
      expect(hits.some((h) => h.document.content.toLowerCase().includes('shoulder mobility'))).toBe(true);
    });

    it('returns grounded answer with citations when evidence is sufficient', async () => {
      await knowledgeStore.ingestDocument('local_user', {
        title: 'Walking Habit',
        text: 'A brisk 20 minute morning walk elevates dopamine, regulates circadian rhythms, and supports healthy glucose metabolism.',
        sourceType: 'health_article',
      });

      const res = await answerWithHybridRag('local_user', 'morning walk dopamine glucose');
      expect(res.isGrounded).toBe(true);
      expect(res.confidence).toBeGreaterThan(0.7);
      expect(res.citations.length).toBeGreaterThan(0);
      expect(res.answer).toContain('morning walk');
    });

    it('refuses to fabricate when evidence does not exist (anti-hallucination guarantee)', async () => {
      const res = await answerWithHybridRag('local_user', 'quantum physics black hole thermodynamics');
      expect(res.isGrounded).toBe(false);
      expect(res.confidence).toBe(0);
      expect(res.answer).toContain('could not find enough relevant records');
    });
  });

  describe('Tool Registry — ingest_user_document', () => {
    it('successfully executes ingest_user_document tool and returns chunk metrics', async () => {
      const result = await executeTool(
        'ingest_user_document',
        {
          title: 'Physiotherapist Stretches',
          text: 'Perform hamstring wall stretch for 45 seconds per leg. Keep the spine neutral and avoid arching the lower back.',
          sourceType: 'user_note',
        },
        { userId: 'test_user' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Indexed "Physiotherapist Stretches"');
      expect(result.data?.chunkCount).toBeGreaterThanOrEqual(1);
    });
  });
});
