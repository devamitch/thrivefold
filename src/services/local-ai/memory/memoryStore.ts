import * as SQLite from 'expo-sqlite';
import type {
  MemoryFilter,
  MemoryRetrievalResult,
  UserMemory,
} from './types';
import { cosineSimilarity } from './vectorMath';

let db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS user_memories (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding_json TEXT,
        source_event_ids_json TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT,
        origin TEXT NOT NULL,
        status TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_memories_user ON user_memories(user_id);
      CREATE INDEX IF NOT EXISTS idx_memories_kind ON user_memories(kind);
      CREATE INDEX IF NOT EXISTS idx_memories_status ON user_memories(status);
    `);
    return db;
  } catch (err) {
    throw new Error(`Failed to initialize SQLite local memory store: ${err}`);
  }
}

interface RawMemoryRow {
  id: string;
  user_id: string;
  kind: string;
  content: string;
  embedding_json: string | null;
  source_event_ids_json: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  origin: string;
  status: string;
  metadata_json: string | null;
}

function rowToMemory(row: RawMemoryRow): UserMemory {
  let embedding: number[] | undefined;
  if (row.embedding_json) {
    try {
      embedding = JSON.parse(row.embedding_json);
    } catch {}
  }

  let sourceEventIds: string[] = [];
  try {
    sourceEventIds = JSON.parse(row.source_event_ids_json);
  } catch {}

  let metadata: Record<string, unknown> | undefined;
  if (row.metadata_json) {
    try {
      metadata = JSON.parse(row.metadata_json);
    } catch {}
  }

  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as UserMemory['kind'],
    content: row.content,
    embedding,
    sourceEventIds,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at ?? undefined,
    origin: row.origin as UserMemory['origin'],
    status: row.status as UserMemory['status'],
    metadata,
  };
}

export class AnalyticalMemoryStore {
  /**
   * Persists a new memory item or deduplicates against existing records.
   */
  async addMemory(
    params: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserMemory> {
    const database = getDb();
    const now = new Date().toISOString();

    // Check for exact content match for this user to avoid duplicates
    const existingExact = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE user_id = ? AND kind = ? AND content = ? LIMIT 1`,
      [params.userId, params.kind, params.content]
    );

    if (existingExact) {
      // Merge source event IDs and boost confidence
      const existing = rowToMemory(existingExact);
      const mergedEvents = Array.from(
        new Set([...existing.sourceEventIds, ...params.sourceEventIds])
      );
      const updatedConfidence = Math.min(
        1.0,
        Math.max(existing.confidence, params.confidence) + 0.05
      );

      database.runSync(
        `UPDATE user_memories 
         SET source_event_ids_json = ?, confidence = ?, updated_at = ?
         WHERE id = ?`,
        [JSON.stringify(mergedEvents), updatedConfidence, now, existing.id]
      );

      return {
        ...existing,
        sourceEventIds: mergedEvents,
        confidence: updatedConfidence,
        updatedAt: now,
      };
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    database.runSync(
      `INSERT INTO user_memories (
        id, user_id, kind, content, embedding_json, source_event_ids_json,
        confidence, created_at, updated_at, expires_at, origin, status, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId,
        params.kind,
        params.content,
        params.embedding ? JSON.stringify(params.embedding) : null,
        JSON.stringify(params.sourceEventIds),
        params.confidence,
        now,
        now,
        params.expiresAt ?? null,
        params.origin,
        params.status,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );

    return {
      id,
      userId: params.userId,
      kind: params.kind,
      content: params.content,
      embedding: params.embedding,
      sourceEventIds: params.sourceEventIds,
      confidence: params.confidence,
      createdAt: now,
      updatedAt: now,
      expiresAt: params.expiresAt,
      origin: params.origin,
      status: params.status,
      metadata: params.metadata,
    };
  }

  /**
   * Retrieves a single memory by ID with strict user scoping.
   */
  async getMemory(id: string, userId: string): Promise<UserMemory | null> {
    const database = getDb();
    const row = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId]
    );
    return row ? rowToMemory(row) : null;
  }

  /**
   * Updates fields on an existing memory.
   */
  async updateMemory(
    id: string,
    userId: string,
    updates: Partial<Pick<UserMemory, 'content' | 'confidence' | 'status' | 'expiresAt' | 'metadata'>>
  ): Promise<UserMemory | null> {
    const database = getDb();
    const existing = await this.getMemory(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const content = updates.content ?? existing.content;
    const confidence = updates.confidence ?? existing.confidence;
    const status = updates.status ?? existing.status;
    const expiresAt = updates.expiresAt !== undefined ? updates.expiresAt : existing.expiresAt;
    const metadata = updates.metadata ?? existing.metadata;

    database.runSync(
      `UPDATE user_memories 
       SET content = ?, confidence = ?, status = ?, expires_at = ?, metadata_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [
        content,
        confidence,
        status,
        expiresAt ?? null,
        metadata ? JSON.stringify(metadata) : null,
        now,
        id,
        userId,
      ]
    );

    return {
      ...existing,
      content,
      confidence,
      status,
      expiresAt,
      metadata,
      updatedAt: now,
    };
  }

  /**
   * Deletes a specific memory item.
   */
  async deleteMemory(id: string, userId: string): Promise<boolean> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return res.changes > 0;
  }

  /**
   * Lists memories for a user with optional category/status filters.
   */
  async listMemories(userId: string, filter?: MemoryFilter): Promise<UserMemory[]> {
    const database = getDb();
    let query = `SELECT * FROM user_memories WHERE user_id = ?`;
    const params: SQLite.SQLiteBindValue[] = [userId];

    if (filter?.kind) {
      query += ` AND kind = ?`;
      params.push(filter.kind);
    }
    if (filter?.status) {
      query += ` AND status = ?`;
      params.push(filter.status);
    }
    if (filter?.origin) {
      query += ` AND origin = ?`;
      params.push(filter.origin);
    }
    if (filter?.minConfidence) {
      query += ` AND confidence >= ?`;
      params.push(filter.minConfidence);
    }

    query += ` ORDER BY updated_at DESC`;

    const rows = database.getAllSync<RawMemoryRow>(query, params);
    const nowTime = Date.now();

    return rows
      .map(rowToMemory)
      .filter((m) => {
        if (filter?.includeExpired) return true;
        if (!m.expiresAt) return true;
        return new Date(m.expiresAt).getTime() > nowTime;
      });
  }

  /**
   * Semantic search using dense vector cosine similarity.
   * Ranks candidates by a blended score of similarity, confidence, and recency.
   */
  async searchMemoriesByVector(
    userId: string,
    queryEmbedding: number[],
    topK = 5,
    minSimilarity = 0.55
  ): Promise<MemoryRetrievalResult[]> {
    const memories = await this.listMemories(userId, { status: 'active' });
    const now = Date.now();

    const results: MemoryRetrievalResult[] = [];

    for (const mem of memories) {
      if (!mem.embedding || mem.embedding.length === 0) continue;
      const sim = cosineSimilarity(queryEmbedding, mem.embedding);
      if (sim >= minSimilarity) {
        // Recency decay factor (half-life of 30 days)
        const ageDays = (now - new Date(mem.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(0.5, Math.exp(-ageDays / 30));

        // Blended score
        const score = sim * 0.65 + mem.confidence * 0.25 + recencyWeight * 0.10;

        results.push({
          memory: mem,
          similarity: sim,
          score,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Exports all memories for a user (supporting GDPR/DPDP export rights).
   */
  async exportMemories(userId: string): Promise<UserMemory[]> {
    return this.listMemories(userId, { includeExpired: true });
  }

  /**
   * Erases all memories for a user (supporting GDPR/DPDP deletion rights).
   */
  async eraseAllUserMemories(userId: string): Promise<number> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE user_id = ?`,
      [userId]
    );
    return res.changes;
  }
}

export const memoryStore = new AnalyticalMemoryStore();
