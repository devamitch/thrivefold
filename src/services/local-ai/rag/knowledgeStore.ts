import * as SQLite from 'expo-sqlite';
import { LocalAI, type DocumentChunkResult } from '../../../../modules/local-ai';
import { cosineSimilarity } from '../memory/vectorMath';
import { anvayFtsStore } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface KnowledgeDocument {
  id: string;
  userId: string;
  title: string;
  sourceType: 'user_note' | 'health_article' | 'wellness_guide' | 'imported_file' | 'medical_reference' | 'conversation_history';
  rawText: string;
  chunkCount: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
  embedding?: number[];
  createdAt: string;
  /** Title of the document the chunk came from, so evidence says where it is from. */
  documentTitle?: string;
}

export interface KnowledgeChunkHit {
  chunk: KnowledgeChunk;
  similarity: number;
}

let initialized = false;

function getDb(): SQLite.SQLiteDatabase {
  const db = getSharedLocalMemoryDb();
  if (!initialized) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS rag_documents (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        chunk_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE TABLE IF NOT EXISTS rag_chunks (
        id TEXT PRIMARY KEY NOT NULL,
        document_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        start_offset INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        token_estimate INTEGER NOT NULL,
        embedding_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
      CREATE INDEX IF NOT EXISTS idx_rag_chunks_user ON rag_chunks(user_id);
    `);
    initialized = true;
  }
  return db;
}

export class KnowledgeStore {
  /**
   * Ingests a raw document, computes semantic chunking via AnvaykoshDocumentProcessor,
   * embeds chunks if native engine is active, and persists everything into SQLite.
   */
  async ingestDocument(
    userId: string,
    doc: {
      title: string;
      text: string;
      sourceType?: KnowledgeDocument['sourceType'];
      metadata?: Record<string, unknown>;
    }
  ): Promise<KnowledgeDocument> {
    const database = getDb();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const sourceType = doc.sourceType || 'user_note';

    // 1. Semantic Chunking
    const rawChunks: DocumentChunkResult[] = LocalAI.chunkDocument(doc.text, 320, 40);

    // 2. Generate embeddings if local AI is loaded
    const chunksWithEmbeddings: {
      chunk: DocumentChunkResult;
      embedding?: number[];
    }[] = [];

    for (const c of rawChunks) {
      let emb: number[] | undefined;
      if (LocalAI.isLoaded()) {
        try {
          emb = await LocalAI.embed(c.text);
        } catch {
          // Gracefully omit embedding if engine is busy
        }
      }
      chunksWithEmbeddings.push({ chunk: c, embedding: emb });
    }

    // 3. Atomic transaction write
    database.withTransactionSync(() => {
      database.runSync(
        `INSERT INTO rag_documents (id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          userId,
          doc.title.trim(),
          sourceType,
          doc.text,
          rawChunks.length,
          now,
          doc.metadata ? JSON.stringify(doc.metadata) : null,
        ]
      );

      for (const item of chunksWithEmbeddings) {
        const chunkId = `chk_${docId}_${item.chunk.index}`;
        database.runSync(
          `INSERT INTO rag_chunks (id, document_id, user_id, chunk_index, content, start_offset, end_offset, token_estimate, embedding_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            chunkId,
            docId,
            userId,
            item.chunk.index,
            item.chunk.text,
            item.chunk.startOffset,
            item.chunk.endOffset,
            item.chunk.tokenEstimate,
            item.embedding ? JSON.stringify(item.embedding) : null,
            now,
          ]
        );

        // Also index into Anvay FTS5 Full-Text Engine
        anvayFtsStore.upsertEntry({
          sourceTable: 'rag_chunks',
          sourceId: docId,
          chunkId,
          ownerId: userId,
          domain: 'documents',
          sourceType,
          title: doc.title.trim(),
          content: item.chunk.text,
          createdAt: now,
          metadata: doc.metadata,
        });
      }
    });

    return {
      id: docId,
      userId,
      title: doc.title.trim(),
      sourceType,
      rawText: doc.text,
      chunkCount: rawChunks.length,
      createdAt: now,
      metadata: doc.metadata,
    };
  }

  /**
   * Retrieves all chunks for a user.
   */
  async getAllChunks(userId: string): Promise<KnowledgeChunk[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
              c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
       FROM rag_chunks c LEFT JOIN rag_documents d ON d.id = c.document_id
       WHERE c.user_id = ?
       ORDER BY c.document_id, c.chunk_index ASC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      documentId: r.document_id,
      userId: r.user_id,
      chunkIndex: r.chunk_index,
      content: r.content,
      startOffset: r.start_offset,
      endOffset: r.end_offset,
      tokenEstimate: r.token_estimate,
      embedding: r.embedding_json ? JSON.parse(r.embedding_json) : undefined,
      createdAt: r.created_at,
      documentTitle: r.document_title ?? undefined,
    }));
  }

  /**
   * Searches chunks by vector cosine similarity.
   */
  async searchChunksByVector(
    userId: string,
    queryVec: number[],
    topK = 5,
    minSimilarity = 0.35
  ): Promise<KnowledgeChunkHit[]> {
    if (queryVec.length === 0 || topK <= 0) return [];
    const database = getDb();
    const hits: KnowledgeChunkHit[] = [];
    const pageSize = 128;
    let afterId = '';

    // Keep peak memory bounded to one page plus the best matches. The cosine scan remains exact
    // and owner-filtered; dense retrieval is still independent from FTS candidates.
    while (true) {
      const rows = database.getAllSync<{
        id: string; document_id: string; user_id: string; chunk_index: number; content: string;
        start_offset: number; end_offset: number; token_estimate: number; embedding_json: string;
        created_at: string; document_title: string | null;
      }>(
        `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
                c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
         FROM rag_chunks c JOIN rag_documents d ON d.id = c.document_id
         WHERE c.user_id = ? AND c.id > ? AND c.embedding_json IS NOT NULL
         ORDER BY c.id LIMIT ?`,
        [userId, afterId, pageSize],
      );
      if (rows.length === 0) break;
      afterId = rows[rows.length - 1].id;

      for (const row of rows) {
        let embedding: number[];
        try {
          embedding = JSON.parse(row.embedding_json);
        } catch {
          continue;
        }
        if (embedding.length === 0) continue;
        const similarity = cosineSimilarity(queryVec, embedding);
        if (similarity >= minSimilarity) {
          hits.push({
            chunk: {
              id: row.id,
              documentId: row.document_id,
              userId: row.user_id,
              chunkIndex: row.chunk_index,
              content: row.content,
              startOffset: row.start_offset,
              endOffset: row.end_offset,
              tokenEstimate: row.token_estimate,
              embedding,
              createdAt: row.created_at,
              documentTitle: row.document_title ?? undefined,
            },
            similarity,
          });
        }
      }
      hits.sort((a, b) => b.similarity - a.similarity);
      if (hits.length > topK) hits.length = topK;
    }
    return hits;
  }

  /**
   * Lists all ingested documents for a user.
   */
  async listDocuments(userId: string): Promise<KnowledgeDocument[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json
       FROM rag_documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      sourceType: r.source_type,
      rawText: r.raw_text,
      chunkCount: r.chunk_count,
      createdAt: r.created_at,
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
    }));
  }

  /**
   * Deletes a document and cascades to its chunks.
   */
  async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const database = getDb();
    let changes = 0;
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE document_id = ? AND user_id = ?`, [
        documentId,
        userId,
      ]);
      const res = database.runSync(
        `DELETE FROM rag_documents WHERE id = ? AND user_id = ?`,
        [documentId, userId]
      );
      changes = res.changes;

      // Delete from FTS5
      anvayFtsStore.deleteEntry('rag_chunks', documentId);
    });
    return changes > 0;
  }

  /**
   * Clears all documents and chunks for a user (GDPR Right to Be Forgotten).
   */
  async clearAllDocuments(userId: string): Promise<boolean> {
    const database = getDb();
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE user_id = ?`, [userId]);
      database.runSync(`DELETE FROM rag_documents WHERE user_id = ?`, [userId]);
      database.runSync(
        `DELETE FROM anvay_search_entries WHERE owner_id = ? AND domain = 'documents'`,
        [userId]
      );
    });
    return true;
  }
}

export const knowledgeStore = new KnowledgeStore();

