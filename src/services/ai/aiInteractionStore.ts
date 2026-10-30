/**
 * AI Interaction Logging & Tier Quota Store
 *
 * Persists all AI prompts, completions, latency, and provider metadata to
 * local SQLite (thrivefold-local-memory.db). Synchronizes to Supabase when
 * authenticated. Enforces tier limits:
 *  - Guests: 100% on-device local AI models & device TTS/STT (0 cloud usage).
 *  - Registered without BYOK: strictly capped trial usage (once/limited).
 *  - Users with BYOK: unlimited direct requests with their own API key.
 */

import * as SQLite from 'expo-sqlite';

export interface AiInteractionRecord {
  id: string;
  createdAt: string;
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status: 'success' | 'error';
}

let db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS ai_interactions (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        latency_ms INTEGER NOT NULL,
        status TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON ai_interactions(created_at);
    `);
    return db;
  } catch {
    return null;
  }
}

/**
 * Keeps every coach turn (what the person said, what came back, and who answered) on this phone
 * only. Unlike recordAiInteraction, nothing is sent to a server.
 */
export function logCoachTurnLocally(prompt: string, response: string, provider: string): void {
  try {
    getDb()?.runSync(
      `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
       VALUES (?, ?, 'local_user', ?, 'coach', ?, ?, 0, 'success')`,
      [`turn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, new Date().toISOString(), provider, prompt, response],
    );
  } catch {
    // The chat still works without the log.
  }
}

/**
 * Log an AI interaction to SQLite, and attempt background Supabase sync if online.
 */
export async function recordAiInteraction(record: {
  userId?: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status?: 'success' | 'error';
}): Promise<void> {
  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();
  const userId = record.userId || 'local_user';
  const status = record.status ?? 'success';

  try {
    const database = getDb();
    if (database) {
      database.runSync(
        `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          createdAt,
          userId,
          record.provider,
          record.model,
          record.prompt,
          record.response,
          record.latencyMs,
          status,
        ],
      );
    }
  } catch {
    // Non-blocking local record failure
  }

  // Attempt non-blocking Supabase sync if user is signed in
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../supabase/supabaseClient');
    if (supabase) {
      supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
        if (data?.session) {
          supabase
            .from('thrivefold_ai_interactions')
            ?.insert?.([
              {
                id,
                created_at: createdAt,
                provider: record.provider,
                model: record.model,
                status,
                latency_ms: record.latencyMs,
              },
            ])
            .then(() => undefined)
            .catch(() => undefined);
        }
      }).catch(() => undefined);
    }
  } catch {
    // Silent fail if Supabase is offline or not configured
  }
}

/**
 * Check if the caller is permitted to invoke external cloud AI models.
 *  - Guests: 0 cloud usage allowed (must use local models & device voice).
 *  - Registered without BYOK: allowed 1-3 trial turns before being gated.
 *  - Registered with BYOK: unlimited usage.
 */
export function checkCloudAiPermission(opts: {
  isGuest: boolean;
  hasByok: boolean;
  userId?: string;
}): { allowed: boolean; reason?: string } {
  if (opts.isGuest) {
    return {
      allowed: false,
      reason: 'Guests operate 100% on-device. Sign in or configure BYOK in Settings to use cloud AI.',
    };
  }

  if (opts.hasByok) {
    return { allowed: true };
  }

  // Registered user without BYOK: check past cloud queries count
  try {
    const database = getDb();
    if (database) {
      const rows = database.getAllSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ai_interactions WHERE user_id = ? AND provider != 'local'`,
        [opts.userId || 'local_user'],
      );
      const count = rows[0]?.count ?? 0;
      if (count >= 2) {
        return {
          allowed: false,
          reason: 'Trial cloud usage reached. Please add your personal BYOK key in Settings to continue.',
        };
      }
    }
  } catch {
    // on error allow single trial
  }

  return { allowed: true };
}

/** Deletes every saved AI turn on this phone (erase all data). */
export function wipeAiInteractions(): void {
  try {
    getDb()?.runSync('DELETE FROM ai_interactions');
  } catch {
    // Nothing saved yet.
  }
}
