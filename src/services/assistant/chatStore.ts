/**
 * The coach conversation, kept in SQLite on this phone with no size limit. The chat loads the
 * newest page and fetches older pages only as the person scrolls up, like a messaging app.
 */
import * as SQLite from 'expo-sqlite';

import type { ChatTable } from '../../domain/assistant/chatActions';

export interface ChatMessage {
  id: string;
  who: 'you' | 'coach';
  text: string;
  route?: string;
  table?: ChatTable;
  at: number;
}

export const CHAT_PAGE = 30;

let db: SQLite.SQLiteDatabase | null = null;
const listeners = new Set<() => void>();

function getDb(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS coach_messages (
        id TEXT PRIMARY KEY NOT NULL,
        who TEXT NOT NULL,
        text TEXT NOT NULL,
        route TEXT,
        table_json TEXT,
        at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_coach_messages_at ON coach_messages(at);
    `);
    return db;
  } catch {
    return null;
  }
}

type Row = { id: string; who: 'you' | 'coach'; text: string; route: string | null; table_json: string | null; at: number };

const fromRow = (r: Row): ChatMessage => ({
  id: r.id,
  who: r.who,
  text: r.text,
  route: r.route ?? undefined,
  table: r.table_json ? (JSON.parse(r.table_json) as ChatTable) : undefined,
  at: r.at,
});

const notify = () => listeners.forEach((l) => l());

export const chatStore = {
  /** Saves new or changed messages (a streamed reply is saved again as it grows). */
  upsert(messages: ChatMessage[]): void {
    const d = getDb();
    if (!d || !messages.length) return;
    try {
      d.withTransactionSync(() => {
        for (const m of messages) {
          d.runSync(
            `INSERT OR REPLACE INTO coach_messages (id, who, text, route, table_json, at) VALUES (?, ?, ?, ?, ?, ?)`,
            [m.id, m.who, m.text, m.route ?? null, m.table ? JSON.stringify(m.table) : null, m.at],
          );
        }
      });
      notify();
    } catch {
      // The chat keeps working from memory.
    }
  },

  /** One page, oldest first, of messages older than `before` (or the newest page). */
  page(before?: number, limit = CHAT_PAGE): ChatMessage[] {
    const d = getDb();
    if (!d) return [];
    try {
      const rows = before
        ? d.getAllSync<Row>(`SELECT * FROM coach_messages WHERE at < ? ORDER BY at DESC LIMIT ?`, [before, limit])
        : d.getAllSync<Row>(`SELECT * FROM coach_messages ORDER BY at DESC LIMIT ?`, [limit]);
      return rows.reverse().map(fromRow);
    } catch {
      return [];
    }
  },

  count(): number {
    try {
      return getDb()?.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM coach_messages')?.n ?? 0;
    } catch {
      return 0;
    }
  },

  clear(): void {
    try {
      getDb()?.runSync('DELETE FROM coach_messages');
      notify();
    } catch {
      // Nothing saved.
    }
  },

  /** Called after any change (used to refresh the coach's knowledge of the conversation). */
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Moves the conversation kept in the store by older versions into SQLite, once. */
  importLegacy(turns: ChatMessage[]): boolean {
    if (!turns.length || this.count() > 0) return false;
    this.upsert(turns);
    return true;
  },
};
