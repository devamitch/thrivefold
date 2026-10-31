/**
 * Canonical Shared Local Memory SQLite Database Accessor
 *
 * Implements a unified, transaction-safe database provider for `thrivefold-local-memory.db`.
 * Shared across:
 * - anvayFtsStore (FTS5 search engine)
 * - memoryStore (analytical user memories)
 * - knowledgeStore (RAG documents & chunks)
 * - chatStore (conversational turns)
 * - onlineLibrary (cached learn articles)
 * - aiInteractionStore (AI logs & quotas)
 *
 * Ensures:
 * - WAL journal mode configured once on first open
 * - Single connection handle across modules
 * - Transaction-safe operations without nested cross-connection contention
 */

import * as SQLite from 'expo-sqlite';

let sharedDb: SQLite.SQLiteDatabase | null = null;

export function getSharedLocalMemoryDb(): SQLite.SQLiteDatabase {
  if (sharedDb) return sharedDb;

  try {
    sharedDb = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    sharedDb.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    return sharedDb;
  } catch (err) {
    throw new Error(`[localMemoryDb] Failed to open shared local memory database: ${err}`);
  }
}

/**
 * Helper to close or reset connection (used primarily in tests).
 */
export function resetSharedLocalMemoryDb(): void {
  sharedDb = null;
}
