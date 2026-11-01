import { sanitizeFtsQuery, AnvayFtsStore, type SearchEntryInput } from '../../src/services/local-ai/search/anvayFtsStore';

// In-memory mock database for testing FTS5 operations
const mockSearchEntries: any[] = [];
let nextRowId = 1;

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('INSERT INTO anvay_search_entries')) {
        const entryKey = params[0];
        const existingIdx = mockSearchEntries.findIndex((e) => e.entry_key === entryKey);
        if (existingIdx >= 0) {
          mockSearchEntries[existingIdx] = {
            ...mockSearchEntries[existingIdx],
            title: params[8],
            content: params[9],
            domain: params[6],
            source_type: params[7],
            created_at: params[10],
          };
        } else {
          mockSearchEntries.push({
            rowid: nextRowId++,
            entry_key: params[0],
            source_table: params[1],
            source_id: params[2],
            chunk_id: params[3],
            owner_id: params[4],
            app_id: params[5] || 'thrivefold',
            domain: params[6],
            source_type: params[7],
            title: params[8],
            content: params[9],
            created_at: params[10],
            metadata_json: params[11],
          });
        }
        return { changes: 1 };
      }

      if (sql.includes('DELETE FROM anvay_search_entries')) {
        const initialLen = mockSearchEntries.length;
        if (sql.includes('entry_key = ?')) {
          const key = params[0];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].entry_key === key) {
              mockSearchEntries.splice(i, 1);
            }
          }
        } else {
          const table = params[0];
          const id = params[1];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].source_table === table && mockSearchEntries[i].source_id === id) {
              mockSearchEntries.splice(i, 1);
            }
          }
        }
        return { changes: initialLen - mockSearchEntries.length };
      }

      return { changes: 0 };
    }),
    getAllSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('FROM anvay_search_fts f')) {
        const queryTerm = String(params[0]).replace(/["*]/g, '').toLowerCase();
        const ownerId = params[1];
        const appId = params[2];

        // Filter and rank mock entries
        return mockSearchEntries
          .filter((e) => {
            if (e.owner_id !== ownerId || e.app_id !== appId) return false;
            const full = `${e.title} ${e.content}`.toLowerCase();
            return full.includes(queryTerm);
          })
          .map((e, idx) => ({
            rowid: e.rowid,
            source_table: e.source_table,
            source_id: e.source_id,
            chunk_id: e.chunk_id,
            owner_id: e.owner_id,
            app_id: e.app_id,
            domain: e.domain,
            source_type: e.source_type,
            title: e.title,
            content: e.content,
            created_at: e.created_at,
            metadata_json: e.metadata_json,
            bm25_score: -(10.0 / (idx + 1)), // Mock BM25 score
            snippet: `...«${queryTerm}»...`,
          }));
      }
      return [];
    }),
    getFirstSync: jest.fn((sql: string) => {
      if (sql.includes('count(*)')) {
        return { count: mockSearchEntries.length };
      }
      return null;
    }),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
}));

describe('AnvayCore SQLite FTS5 Intelligence Engine', () => {
  let fts: AnvayFtsStore;

  beforeEach(() => {
    mockSearchEntries.length = 0;
    nextRowId = 1;
    fts = new AnvayFtsStore();
  });

  describe('Query Sanitizer & Multilingual Tokenizer', () => {
    it('sanitizes plain English query into prefix search tokens', () => {
      const q = sanitizeFtsQuery('morning walk');
      expect(q).toBe('"morning"* AND "walk"*');
    });

    it('drops English stopwords and caps at significant terms for natural chat questions (Defect D1)', () => {
      const q = sanitizeFtsQuery('how do I improve my sleep quality');
      expect(q).toBe('"improve"* AND "sleep"* AND "quality"*');
    });

    it('supports OR join mode for graceful fallback ranking', () => {
      const q = sanitizeFtsQuery('sleep quality', 'or');
      expect(q).toBe('"sleep"* OR "quality"*');
    });

    it('falls back to keeping tokens if every token is a stopword', () => {
      const q = sanitizeFtsQuery('to be or not to be');
      expect(q).toContain('"to"*');
      expect(q).toContain('"be"*');
    });

    it('preserves exact quoted phrases', () => {
      const q = sanitizeFtsQuery('"box breathing"');
      expect(q).toBe('"box breathing"');
    });

    it('preserves Hindi Devanagari Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('तनाव मुक्ति');
      expect(q).toBe('"तनाव"* AND "मुक्ति"*');
    });

    it('preserves Bengali Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('ঘুমের সমস্যা');
      expect(q).toBe('"ঘুমের"* AND "সমস্যা"*');
    });

    it('strips dangerous FTS5 punctuation and operators', () => {
      const q = sanitizeFtsQuery('walk AND (drop: *table^2)');
      expect(q).not.toContain('(');
      expect(q).not.toContain('^');
      expect(q).not.toContain(':');
    });

    it('returns empty string for pure whitespace or punctuation', () => {
      expect(sanitizeFtsQuery('')).toBe('');
      expect(sanitizeFtsQuery('   ')).toBe('');
      expect(sanitizeFtsQuery('***:::^^^')).toBe('');
    });
  });

  describe('Indexing & Authorization Scoping', () => {
    it('indexes documents and retrieves matches strictly scoped to owner', () => {
      const doc1: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_1',
        chunkId: 'chk_1_0',
        ownerId: 'user_alice',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Morning Yoga and Hydration',
        content: 'Drinking 500ml warm water after waking up activates metabolism and calms the gut.',
      };

      const doc2: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_2',
        chunkId: 'chk_2_0',
        ownerId: 'user_bob',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Bob Secret Note',
        content: 'Water filtration notes for Bob.',
      };

      fts.upsertEntry(doc1);
      fts.upsertEntry(doc2);

      // Alice searches for 'water'
      const aliceHits = fts.search('water', { ownerId: 'user_alice' });
      expect(aliceHits.length).toBe(1);
      expect(aliceHits[0].sourceId).toBe('doc_1');
      expect(aliceHits[0].ownerId).toBe('user_alice');

      // Bob's note must never leak to Alice
      const leakCheck = aliceHits.find((h) => h.ownerId === 'user_bob');
      expect(leakCheck).toBeUndefined();
    });

    it('indexes Hindi and Bengali records and finds them via search', () => {
      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_hi_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'प्राणायाम और तनाव मुक्ति',
        content: 'अनुलोम विलोम प्राणायाम से मानसिक तनाव और चिंता में तुरंत आराम मिलता है।',
      });

      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_bn_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'গভীর ঘুমের নিয়মাবলী',
        content: 'রাতে শোবার আগে হালকা গরম দুধ এবং শ্বাস-প্রশ্বাসের ব্যায়াম ভালো ঘুমের জন্য উপকারী।',
      });

      const hindiHits = fts.search('तनाव', { ownerId: 'local_user' });
      expect(hindiHits.length).toBe(1);
      expect(hindiHits[0].title).toContain('तनाव');

      const bengaliHits = fts.search('ঘুমের', { ownerId: 'local_user' });
      expect(bengaliHits.length).toBe(1);
      expect(bengaliHits[0].title).toContain('ঘুমের');
    });

    it('deletes entries correctly and propagates deletions', () => {
      fts.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: 'mem_123',
        ownerId: 'local_user',
        domain: 'memories',
        sourceType: 'fact',
        title: 'Memory: fact',
        content: 'User prefers evening strength training and 8 hours of sleep.',
      });

      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(1);

      fts.deleteEntry('user_memories', 'mem_123');
      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(0);
    });

    it('runs integrity checks and diagnostics without failure', () => {
      const integrity = fts.checkIntegrity();
      expect(integrity).toBe(true);

      const bench = fts.benchmark('local_user');
      expect(bench.integrityOk).toBe(true);
      expect(typeof bench.queryLatencyMs.englishTerm).toBe('number');
    });
  });
});

