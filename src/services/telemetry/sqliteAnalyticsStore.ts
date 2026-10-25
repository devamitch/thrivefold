/**
 * SQLite Persistent Storage for Telemetry, Micro-Events, Gamification & Crash Diagnostics
 *
 * Keeps MMKV ultra-fast by offloading heavy, continuous telemetry logs to SQLite.
 * Uses batch transaction flushing every 5 seconds or on app backgrounding.
 */

import * as SQLite from 'expo-sqlite';
import type { TelemetryEvent } from './analyticsService';

let db: SQLite.SQLiteDatabase | null = null;
const eventQueue: TelemetryEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

function getDb(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-analytics.db');
    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        screen TEXT NOT NULL,
        target_id TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS crash_reports (
        id TEXT PRIMARY KEY NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        is_fatal INTEGER NOT NULL,
        context TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
    `);
  } catch {
    db = null;
  }
  return db;
}

/**
 * Queue a telemetry event for batched asynchronous SQLite insertion
 */
export function enqueueTelemetryEvent(event: TelemetryEvent): void {
  eventQueue.push(event);

  if (event.type === 'crash_error') {
    // Flush immediately for crash events
    flushTelemetryQueue();
    return;
  }

  if (eventQueue.length >= 25) {
    flushTelemetryQueue();
    return;
  }

  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushTelemetryQueue();
    }, 5000);
  }
}

/**
 * Persist buffered events to SQLite in a single transaction
 */
export function flushTelemetryQueue(): number {
  if (eventQueue.length === 0) return 0;
  const d = getDb();
  if (!d) return 0;

  const batch = eventQueue.splice(0, eventQueue.length);

  try {
    d.withTransactionSync(() => {
      for (const ev of batch) {
        if (ev.type === 'crash_error') {
          const meta = ev.metadata ?? {};
          d.runSync(
            `INSERT OR REPLACE INTO crash_reports (id, error_message, stack_trace, is_fatal, context, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              ev.id,
              String(meta.message ?? 'Unknown error'),
              meta.stack ? String(meta.stack) : null,
              meta.fatal ? 1 : 0,
              JSON.stringify(meta),
              ev.timestamp,
            ],
          );
        }

        d.runSync(
          `INSERT OR REPLACE INTO analytics_events (id, event_type, timestamp, screen, target_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            ev.id,
            ev.type,
            ev.timestamp,
            ev.screen,
            ev.targetId ?? null,
            ev.metadata ? JSON.stringify(ev.metadata) : null,
            Date.now(),
          ],
        );
      }
    });
    return batch.length;
  } catch {
    return 0;
  }
}

/**
 * Smart Pruning: Clean logs older than 60 days to keep database compact
 */
export function pruneOldAnalytics(daysToKeep = 60): number {
  const d = getDb();
  if (!d) return 0;
  try {
    const cutoff = Date.now() - daysToKeep * 86_400_000;
    const res = d.runSync('DELETE FROM analytics_events WHERE created_at < ?', [cutoff]);
    return res.changes;
  } catch {
    return 0;
  }
}

/**
 * Retrieve recent events for display, diagnosis, or export
 */
export function getStoredAnalytics(limit = 100): Array<{
  id: string;
  type: string;
  timestamp: string;
  screen: string;
  targetId?: string;
  metadata?: string;
}> {
  const d = getDb();
  if (!d) return [];
  try {
    return d.getAllSync<{
      id: string;
      event_type: string;
      timestamp: string;
      screen: string;
      target_id: string | null;
      metadata: string | null;
    }>(
      'SELECT id, event_type, timestamp, screen, target_id, metadata FROM analytics_events ORDER BY created_at DESC LIMIT ?',
      [limit],
    ).map((r) => ({
      id: r.id,
      type: r.event_type,
      timestamp: r.timestamp,
      screen: r.screen,
      targetId: r.target_id ?? undefined,
      metadata: r.metadata ?? undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Erase all analytics and crash logs (called on account/local data erasure)
 */
export function wipeAnalyticsDatabase(): void {
  const d = getDb();
  if (!d) return;
  try {
    d.execSync(`
      DELETE FROM analytics_events;
      DELETE FROM crash_reports;
      VACUUM;
    `);
  } catch {
    // safe fallback
  }
}
