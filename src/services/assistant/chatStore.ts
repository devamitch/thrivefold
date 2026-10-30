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
  /** The person's rating of a coach reply. */
  feedback?: 'up' | 'down';
  /** A file the person attached (local uri on this phone). */
  attachment?: { uri: string; name: string; kind: 'image' | 'pdf' | 'file' };
  /** A progress line ("Reading…") that the next reply replaces; never rated or shared. */
  transient?: boolean;
  /** The coach reply this message answers (shown as a quote). */
  quote?: string;
  /** On-device translation of this message, when the person asked for one. */
  translation?: { lang: string; text: string };
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
    // Columns added after the first release of this table.
    const cols = db.getAllSync<{ name: string }>('PRAGMA table_info(coach_messages)').map((c) => c.name);
    if (!cols.includes('feedback')) db.execSync('ALTER TABLE coach_messages ADD COLUMN feedback TEXT');
    if (!cols.includes('attachment_json')) db.execSync('ALTER TABLE coach_messages ADD COLUMN attachment_json TEXT');
    if (!cols.includes('extra_json')) db.execSync('ALTER TABLE coach_messages ADD COLUMN extra_json TEXT');
    return db;
  } catch {
    return null;
  }
}

type Row = {
  id: string;
  who: 'you' | 'coach';
  text: string;
  route: string | null;
  table_json: string | null;
  at: number;
  feedback: 'up' | 'down' | null;
  attachment_json: string | null;
  extra_json: string | null;
};

const fromRow = (r: Row): ChatMessage => ({
  id: r.id,
  who: r.who,
  text: r.text,
  route: r.route ?? undefined,
  table: r.table_json ? (JSON.parse(r.table_json) as ChatTable) : undefined,
  at: r.at,
  feedback: r.feedback ?? undefined,
  attachment: r.attachment_json ? (JSON.parse(r.attachment_json) as ChatMessage['attachment']) : undefined,
  ...(r.extra_json ? (JSON.parse(r.extra_json) as Pick<ChatMessage, 'quote' | 'translation'>) : {}),
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
            `INSERT OR REPLACE INTO coach_messages (id, who, text, route, table_json, at, feedback, attachment_json, extra_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              m.id,
              m.who,
              m.text,
              m.route ?? null,
              m.table ? JSON.stringify(m.table) : null,
              m.at,
              m.feedback ?? null,
              m.attachment ? JSON.stringify(m.attachment) : null,
              m.quote || m.translation ? JSON.stringify({ quote: m.quote, translation: m.translation }) : null,
            ],
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

  /** Rated replies (newest first), so good answers can be reused and poor ones avoided. */
  rated(feedback: 'up' | 'down', limit = 50): ChatMessage[] {
    try {
      return (getDb()?.getAllSync<Row>('SELECT * FROM coach_messages WHERE feedback = ? ORDER BY at DESC LIMIT ?', [feedback, limit]) ?? []).map(fromRow);
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
