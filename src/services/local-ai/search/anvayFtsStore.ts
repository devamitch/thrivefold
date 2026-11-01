/**
 * AnvayCore SQLite FTS5 Full-Text Intelligence Engine
 *
 * Implements authoritative, zero-network, local full-text search over:
 * 1. RAG Documents & Chunks (imported files, medical references, guides)
 * 2. User Memories & Preferences
 * 3. Coach Conversations & Transcripts
 * 4. Exercise Catalogs & App Knowledge
 * 5. Learn Library articles & AI Interactions
 *
 * Architecture:
 * - Master table `anvay_search_entries` with integer `rowid` and collision-safe `entry_key`
 * - FTS5 external content table `anvay_search_fts` using `unicode61 remove_diacritics 2`
 * - Synchronized via atomic SQLite triggers
 * - Keyset-paginated source synchronization ($O(1)$ memory)
 * - Strict authorization filters (owner_id, app_id, domain, source_type, date)
 * - Sub-millisecond BM25 ranking and snippet extraction
 * - LRU query caching with automatic mutation invalidation
 * - Independent retrieval branch for hybrid Reciprocal Rank Fusion (RRF)
 */

import * as SQLite from 'expo-sqlite';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface SearchEntryInput {
  sourceTable:
    | 'rag_chunks'
    | 'rag_documents'
    | 'user_memories'
    | 'coach_messages'
    | 'exercise_catalog'
    | 'learn_library'
    | 'ai_interactions';
  sourceId: string;
  chunkId?: string | null;
  ownerId: string;
  appId?: string;
  domain: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions';
  sourceType: string;
  title: string;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface FtsSearchFilter {
  ownerId: string;
  appId?: string;
  domain?: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions' | string;
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface FtsSearchHit {
  rowid: number;
  entryKey: string;
  sourceTable: string;
  sourceId: string;
  chunkId: string | null;
  ownerId: string;
  appId: string;
  domain: string;
  sourceType: string;
  title: string;
  content: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  bm25Score: number;
  snippet: string;
}

export interface FtsBenchmarkResult {
  indexedCount: number;
  dbSizeBytes: number;
  queryLatencyMs: {
    englishTerm: number;
    hindiTerm: number;
    bengaliTerm: number;
    prefixTerm: number;
    phraseTerm: number;
  };
  integrityOk: boolean;
}

const queryCache = new Map<string, { timestamp: number; results: FtsSearchHit[] }>();
const CACHE_TTL_MS = 60_000; // 1 minute
const MAX_CACHE_ENTRIES = 200;

/**
 * Builds an unambiguous, collision-safe key encoding.
 * Pattern: ${appId}:${ownerId}:${sourceTable}:${sourceId}:${chunkId || '__root__'}
 */
export function buildEntryKey(
  appId: string,
  ownerId: string,
  sourceTable: string,
  sourceId: string,
  chunkId?: string | null
): string {
  const safeApp = (appId || 'thrivefold').trim();
  const safeOwner = (ownerId || 'local_user').trim();
  const safeTable = sourceTable.trim();
  const safeSource = sourceId.trim();
  const safeChunk = (chunkId && chunkId.trim()) || '__root__';
  return `${safeApp}:${safeOwner}:${safeTable}:${safeSource}:${safeChunk}`;
}

let isInitialized = false;

function ensureInitialized(database: SQLite.SQLiteDatabase): void {
  if (isInitialized) return;
  initFtsSchema(database);
  isInitialized = true;
}

/**
 * Initializes the master search entry table with entry_key, FTS5 virtual table, and sync triggers.
 * Defect D2 fix: Checks legacy schema and migrates columns BEFORE creating indexes.
 */
function initFtsSchema(database: SQLite.SQLiteDatabase): void {
  try {
    // 1. Check if legacy anvay_search_entries exists and lacks entry_key
    const tableInfo = database.getAllSync<{ name: string }>(`PRAGMA table_info(anvay_search_entries);`);
    if (tableInfo.length > 0) {
      const hasEntryKey = tableInfo.some((col) => col.name === 'entry_key');
      if (!hasEntryKey) {
        database.execSync(`
          ALTER TABLE anvay_search_entries ADD COLUMN entry_key TEXT;
          UPDATE anvay_search_entries
          SET entry_key = app_id || ':' || owner_id || ':' || source_table || ':' || source_id || ':' || COALESCE(chunk_id, '__root__')
          WHERE entry_key IS NULL;
        `);
      }
    }

    // 2. Create tables, unique indexes, external content FTS5, and triggers
    database.execSync(`
      -- Master Search Table (Stores authoritative metadata & text with integer rowid and unique entry_key)
      CREATE TABLE IF NOT EXISTS anvay_search_entries (
        rowid INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_key TEXT NOT NULL,
        source_table TEXT NOT NULL,
        source_id TEXT NOT NULL,
        chunk_id TEXT,
        owner_id TEXT NOT NULL,
        app_id TEXT NOT NULL DEFAULT 'thrivefold',
        domain TEXT NOT NULL,
        source_type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_anvay_search_entry_key ON anvay_search_entries(entry_key);
      CREATE INDEX IF NOT EXISTS idx_anvay_search_owner ON anvay_search_entries(owner_id, domain);
      CREATE INDEX IF NOT EXISTS idx_anvay_search_app ON anvay_search_entries(app_id);
      CREATE INDEX IF NOT EXISTS idx_anvay_search_created ON anvay_search_entries(created_at);

      -- FTS5 Virtual Table (External Content pattern: content='anvay_search_entries')
      -- Tokenizer: unicode61 with remove_diacritics=2 for accent-insensitivity while preserving Indian alphabets
      CREATE VIRTUAL TABLE IF NOT EXISTS anvay_search_fts USING fts5(
        title,
        content,
        content='anvay_search_entries',
        content_rowid='rowid',
        tokenize = 'unicode61 remove_diacritics 2'
      );

      -- Synchronization Triggers: Keep FTS5 in atomic lockstep with anvay_search_entries
      CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ai AFTER INSERT ON anvay_search_entries BEGIN
        INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
      END;

      CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ad AFTER DELETE ON anvay_search_entries BEGIN
        INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
      END;

      CREATE TRIGGER IF NOT EXISTS trg_anvay_search_au AFTER UPDATE ON anvay_search_entries BEGIN
        INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
        INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
      END;
    `);
  } catch (err) {
    console.warn('[AnvayFtsStore] initFtsSchema error:', err);
    throw err;
  }
}

const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can could did do does for from had has have how i if in into is it its ' +
    'me my of on or our so than that the their them then there these they this to too was we were what ' +
    'when where which who why will with you your am about after again all also any because before being ' +
    'both just more most no not now only other over same some such very should would'
  ).split(' '),
);

/**
 * Sanitizes user input into safe FTS5 query syntax:
 * - Drops common English stopwords while strictly preserving Hindi/Bengali scripts
 * - Caps at 6 significant terms
 * - Preserves exact quoted phrases
 * - Supports 'and' or 'or' join modes
 */
export function sanitizeFtsQuery(query: string, mode: 'and' | 'or' = 'and'): string {
  const trimmed = query.trim();
  if (!trimmed) return '';

  // 1. Quoted phrase: e.g. "box breathing"
  const phraseMatch = trimmed.match(/^"([^"]+)"$/);
  if (phraseMatch) {
    const inner = phraseMatch[1].replace(/["*]/g, '').trim();
    return inner ? `"${inner}"` : '';
  }

  // 2. Tokenize words with combining marks for Indian alphabets (\p{L}\p{M})
  const rawTokens = trimmed
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && !['and', 'or', 'not', 'near'].includes(t));

  if (rawTokens.length === 0) return '';

  // Filter stopwords for English words (Hindi / Bengali Unicode tokens are never in STOPWORDS and are preserved)
  const nonStopwords = rawTokens.filter((t) => !STOPWORDS.has(t));
  const tokens = (nonStopwords.length > 0 ? nonStopwords : rawTokens).slice(0, 6);

  // 3. Format as prefix search tokens joined by AND or OR
  const joiner = mode === 'or' ? ' OR ' : ' AND ';
  return tokens.map((t) => `"${t}"*`).join(joiner);
}

export class AnvayFtsStore {
  /**
   * Clears the query cache.
   */
  private invalidateCache(): void {
    queryCache.clear();
  }

  /**
   * Upserts a search entry into the master table with collision-safe entry_key.
   * Allows passing an external transaction database to maintain atomic consistency.
   */
  upsertEntry(input: SearchEntryInput, txDb?: SQLite.SQLiteDatabase): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    const now = input.createdAt || new Date().toISOString();
    const metaJson = input.metadata ? JSON.stringify(input.metadata) : null;
    const appId = input.appId || 'thrivefold';
    const chunkId = input.chunkId || null;
    const entryKey = buildEntryKey(appId, input.ownerId, input.sourceTable, input.sourceId, chunkId);

    // Note: ON CONFLICT(entry_key) updates title, content, domain, source_type, created_at, metadata.
    // It strictly DOES NOT alter owner_id or app_id, enforcing ownership immutability.
    database.runSync(
      `INSERT INTO anvay_search_entries
        (entry_key, source_table, source_id, chunk_id, owner_id, app_id, domain, source_type, title, content, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(entry_key) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        domain = excluded.domain,
        source_type = excluded.source_type,
        created_at = excluded.created_at,
        metadata_json = excluded.metadata_json`,
      [
        entryKey,
        input.sourceTable,
        input.sourceId,
        chunkId,
        input.ownerId,
        appId,
        input.domain,
        input.sourceType,
        input.title.trim(),
        input.content.trim(),
        now,
        metaJson,
      ]
    );

    this.invalidateCache();
  }

  /**
   * Batch upserts search entries in an atomic transaction.
   */
  upsertEntries(inputs: SearchEntryInput[], txDb?: SQLite.SQLiteDatabase): void {
    if (inputs.length === 0) return;
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    const perform = (db: SQLite.SQLiteDatabase) => {
      for (const input of inputs) {
        this.upsertEntry(input, db);
      }
    };

    if (txDb) {
      perform(txDb);
    } else {
      database.withTransactionSync(() => perform(database));
    }
  }

  /**
   * Deletes a search entry by source coordinates, scoped strictly by owner and app.
   */
  deleteEntry(
    sourceTable: string,
    sourceId: string,
    chunkId?: string | null,
    ownerId = 'local_user',
    appId = 'thrivefold',
    txDb?: SQLite.SQLiteDatabase
  ): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    if (chunkId !== undefined) {
      const entryKey = buildEntryKey(appId, ownerId, sourceTable, sourceId, chunkId);
      database.runSync(`DELETE FROM anvay_search_entries WHERE entry_key = ?`, [entryKey]);
    } else {
      database.runSync(
        `DELETE FROM anvay_search_entries
         WHERE source_table = ? AND source_id = ? AND owner_id = ? AND app_id = ?`,
        [sourceTable, sourceId, ownerId, appId]
      );
    }
    this.invalidateCache();
  }

  /**
   * Helper to execute parameterized full-text query against SQLite FTS5.
   */
  private executeFtsQuery(
    database: SQLite.SQLiteDatabase,
    ftsMatchQuery: string,
    filters: FtsSearchFilter,
    limit: number,
    offset: number
  ): FtsSearchHit[] {
    const ownerId = filters.ownerId;
    const appId = filters.appId || 'thrivefold';
    const whereClauses: string[] = [
      `anvay_search_fts MATCH ?`,
      `e.owner_id = ?`,
      `e.app_id = ?`,
    ];
    const params: (string | number)[] = [ftsMatchQuery, ownerId, appId];

    if (filters.domain) {
      whereClauses.push(`e.domain = ?`);
      params.push(filters.domain);
    }
    if (filters.sourceType) {
      whereClauses.push(`e.source_type = ?`);
      params.push(filters.sourceType);
    }
    if (filters.startDate) {
      whereClauses.push(`e.created_at >= ?`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClauses.push(`e.created_at <= ?`);
      params.push(filters.endDate);
    }

    params.push(limit, offset);

    const sql = `
      SELECT
        e.rowid,
        e.entry_key,
        e.source_table,
        e.source_id,
        e.chunk_id,
        e.owner_id,
        e.app_id,
        e.domain,
        e.source_type,
        e.title,
        e.content,
        e.created_at,
        e.metadata_json,
        bm25(anvay_search_fts, 2.0, 1.0) AS bm25_score,
        snippet(anvay_search_fts, 1, '«', '»', '...', 28) AS snippet
      FROM anvay_search_fts f
      JOIN anvay_search_entries e ON e.rowid = f.rowid
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY bm25_score ASC
      LIMIT ? OFFSET ?;
    `;

    try {
      const rows = database.getAllSync<any>(sql, params);
      return rows.map((r) => ({
        rowid: r.rowid,
        entryKey: r.entry_key,
        sourceTable: r.source_table,
        sourceId: r.source_id,
        chunkId: r.chunk_id,
        ownerId: r.owner_id,
        appId: r.app_id,
        domain: r.domain,
        sourceType: r.source_type,
        title: r.title,
        content: r.content,
        createdAt: r.created_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
        bm25Score: r.bm25_score,
        snippet: r.snippet || r.content.slice(0, 120),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Executes a safe, parameterized full-text search with strict authorization filters.
   * Defect D1 fix: Tries AND of significant terms; falls back to OR with BM25 ranking.
   */
  search(query: string, filters: FtsSearchFilter): FtsSearchHit[] {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);

    const sanitizedAnd = sanitizeFtsQuery(query, 'and');
    if (!sanitizedAnd) return [];

    const ownerId = filters.ownerId;
    const appId = filters.appId || 'thrivefold';
    const limit = Math.max(1, Math.min(filters.limit || 20, 100));
    const offset = Math.max(0, filters.offset || 0);

    // Multi-dimensional cache key
    const cacheKey = [
      ownerId,
      appId,
      filters.domain || '*',
      filters.sourceType || '*',
      filters.startDate || '*',
      filters.endDate || '*',
      sanitizedAnd,
      limit,
      offset,
    ].join('|');

    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    // 1. Try AND query first
    let hits = this.executeFtsQuery(database, sanitizedAnd, filters, limit, offset);

    // 2. Fall back to OR query if AND produces 0 hits and multiple terms exist
    if (hits.length === 0) {
      const sanitizedOr = sanitizeFtsQuery(query, 'or');
      if (sanitizedOr && sanitizedOr !== sanitizedAnd) {
        hits = this.executeFtsQuery(database, sanitizedOr, filters, limit, offset);
      }
    }

    // LRU cache eviction
    if (queryCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = queryCache.keys().next().value;
      if (oldestKey) queryCache.delete(oldestKey);
    }
    queryCache.set(cacheKey, { timestamp: Date.now(), results: hits });

    return hits;
  }

  /**
   * Synchronizes sources using bounded keyset pagination to maintain O(1) memory footprint.
   */
  syncAllSources(ownerId = 'local_user', appId = 'thrivefold'): { synchronized: number } {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    let count = 0;
    const BATCH_SIZE = 100;

    // 1. Keyset pagination for rag_chunks
    let lastChunkRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT c.rowid as chunk_rowid, c.id AS chunk_id, c.document_id, c.user_id, c.content, c.created_at,
                d.title, d.source_type
         FROM rag_chunks c
         JOIN rag_documents d ON d.id = c.document_id
         WHERE c.rowid > ? AND c.user_id = ?
         ORDER BY c.rowid ASC
         LIMIT ?`,
        [lastChunkRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'rag_chunks',
              sourceId: r.document_id,
              chunkId: r.chunk_id,
              ownerId: r.user_id,
              appId,
              domain: 'documents',
              sourceType: r.source_type,
              title: r.title,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastChunkRowid = r.chunk_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 2. Keyset pagination for user_memories (status = 'active')
    let lastMemRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as mem_rowid, id, user_id, kind, content, created_at, status
         FROM user_memories
         WHERE rowid > ? AND user_id = ? AND status = 'active'
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMemRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'user_memories',
              sourceId: r.id,
              chunkId: null,
              ownerId: r.user_id,
              appId,
              domain: 'memories',
              sourceType: r.kind,
              title: `Memory: ${r.kind}`,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastMemRowid = r.mem_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 3. Keyset pagination for coach_messages
    let lastMsgRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as msg_rowid, id, who, text, at
         FROM coach_messages
         WHERE rowid > ? AND text IS NOT NULL AND length(trim(text)) > 0
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMsgRowid, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          const title = r.who === 'you' ? 'User Question' : 'Anvay Coach Reply';
          const dateIso = new Date(r.at).toISOString();
          this.upsertEntry(
            {
              sourceTable: 'coach_messages',
              sourceId: r.id,
              chunkId: null,
              ownerId,
              appId,
              domain: 'conversations',
              sourceType: r.who,
              title,
              content: r.text,
              createdAt: dateIso,
            },
            database
          );
          count++;
          lastMsgRowid = r.msg_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 4. Index learn_library articles if present
    try {
      const learnRows = database.getAllSync<any>(
        `SELECT id, source, topic, title, summary, url FROM learn_library LIMIT 100`
      );
      for (const lr of learnRows) {
        this.upsertEntry(
          {
            sourceTable: 'learn_library',
            sourceId: lr.id,
            chunkId: null,
            ownerId,
            appId,
            domain: 'knowledge',
            sourceType: lr.source,
            title: lr.title,
            content: `${lr.title}: ${lr.summary}`,
          },
          database
        );
        count++;
      }
    } catch {
      // Table may not be created yet
    }

    this.invalidateCache();
    return { synchronized: count };
  }

  /**
   * Rebuilds the FTS5 virtual table index from the content table.
   */
  rebuild(): void {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('rebuild');`);
    this.invalidateCache();
  }

  /**
   * Validates database and FTS5 integrity.
   */
  checkIntegrity(): boolean {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    try {
      database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('integrity-check');`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Runs performance diagnostics and calculates REAL SQLite disk footprint via page counts.
   */
  benchmark(ownerId = 'local_user', appId = 'thrivefold'): FtsBenchmarkResult {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);

    const countRow = database.getFirstSync<{ count: number }>(
      `SELECT count(*) as count FROM anvay_search_entries WHERE owner_id = ? AND app_id = ?`,
      [ownerId, appId]
    );
    const count = countRow?.count ?? 0;

    // Real disk usage calculation via PRAGMA page_count and page_size
    const pageCountRow = database.getFirstSync<{ page_count: number }>(`PRAGMA page_count;`);
    const pageSizeRow = database.getFirstSync<{ page_size: number }>(`PRAGMA page_size;`);
    const dbSizeBytes = (pageCountRow?.page_count ?? 0) * (pageSizeRow?.page_size ?? 0);

    const measure = (q: string) => {
      const t0 = performance.now();
      this.search(q, { ownerId, appId, limit: 10 });
      return Math.round((performance.now() - t0) * 100) / 100;
    };

    return {
      indexedCount: count,
      dbSizeBytes,
      queryLatencyMs: {
        englishTerm: measure('water'),
        hindiTerm: measure('तनाव'),
        bengaliTerm: measure('ঘুম'),
        prefixTerm: measure('brea*'),
        phraseTerm: measure('"box breathing"'),
      },
      integrityOk: this.checkIntegrity(),
    };
  }
}

export const anvayFtsStore = new AnvayFtsStore();
