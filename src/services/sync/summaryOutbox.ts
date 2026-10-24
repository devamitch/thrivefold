/**
 * Outbox for weekly summaries, kept in SQLite on the phone. Finished weeks are queued once;
 * the queue is flushed to Supabase only for a signed-in (non-guest) person who turned on
 * "Back up weekly summaries". Guests and people who never opt in send nothing. Failed sends
 * stay queued and are retried with a growing delay, which suits slow mobile networks.
 */
import * as SQLite from 'expo-sqlite';

import { finishedWeeks, type WeeklySummary } from '../../domain/sync/weeklySummary';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';

let db: SQLite.SQLiteDatabase | null = null;

function open(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-outbox.db');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS summary_outbox (
        week_start TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        queued_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_try_at TEXT,
        sent_at TEXT
      );
    `);
  } catch {
    db = null;
  }
  return db;
}

export interface OutboxStatus {
  queued: number;
  sent: number;
  lastSentWeek: string | null;
}

export function outboxStatus(): OutboxStatus {
  const d = open();
  if (!d) return { queued: 0, sent: 0, lastSentWeek: null };
  const q = d.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM summary_outbox WHERE sent_at IS NULL')?.n ?? 0;
  const s = d.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM summary_outbox WHERE sent_at IS NOT NULL')?.n ?? 0;
  const last = d.getFirstSync<{ w: string }>('SELECT week_start AS w FROM summary_outbox WHERE sent_at IS NOT NULL ORDER BY week_start DESC LIMIT 1');
  return { queued: q, sent: s, lastSentWeek: last?.w ?? null };
}

/** Queues finished weeks that are not queued yet. Updates unsent rows if the week changed. */
export function enqueueFinishedWeeks(): number {
  const d = open();
  if (!d) return 0;
  const s = useRootStore.getState();
  const weeks = finishedWeeks(formatLocalDate(new Date()), {
    checkIns: s.checkInHistory,
    workouts: s.workoutSessions,
    activities: s.activityLogs,
    poseSessions: s.poseSessions,
    ledger: s.rewardLedger,
  });
  let added = 0;
  const now = new Date().toISOString();
  for (const w of weeks) {
    const res = d.runSync(
      `INSERT INTO summary_outbox (week_start, payload, queued_at) VALUES (?, ?, ?)
       ON CONFLICT(week_start) DO UPDATE SET payload = excluded.payload WHERE sent_at IS NULL`,
      [w.weekStart, JSON.stringify(w), now],
    );
    added += res.changes;
  }
  return added;
}

let flushing = false;

/** Sends queued summaries when allowed. Returns how many were sent. */
export async function flushSummaryOutbox(): Promise<number> {
  const s = useRootStore.getState();
  const d = open();
  if (!d || !supabase || flushing) return 0;
  if (!s.shareWeeklySummaries || !s.user || s.user.isGuest) return 0;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return 0;

  flushing = true;
  let sent = 0;
  try {
    const now = new Date();
    const rows = d.getAllSync<{ week_start: string; payload: string; attempts: number; next_try_at: string | null }>(
      'SELECT week_start, payload, attempts, next_try_at FROM summary_outbox WHERE sent_at IS NULL ORDER BY week_start LIMIT 12',
    );
    for (const row of rows) {
      if (row.next_try_at && new Date(row.next_try_at) > now) continue;
      const w = JSON.parse(row.payload) as WeeklySummary;
      const { error } = await supabase.rpc('tf_upsert_weekly_summary', {
        p_week_start: w.weekStart,
        p_check_ins: w.checkIns,
        p_avg_energy: w.avgEnergy,
        p_avg_mood: w.avgMood,
        p_avg_stress: w.avgStress,
        p_avg_sleep_hours: w.avgSleepHours,
        p_quests_done: w.questsDone,
        p_workouts: w.workouts,
        p_active_minutes: w.activeMinutes,
        p_form_checked_sessions: w.formCheckedSessions,
        p_xp_earned: w.xpEarned,
      });
      if (!error) {
        d.runSync('UPDATE summary_outbox SET sent_at = ? WHERE week_start = ?', [new Date().toISOString(), row.week_start]);
        sent += 1;
      } else {
        const attempts = row.attempts + 1;
        const wait = Math.min(24 * 60, 2 ** attempts) * 60_000; // 2, 4, 8 ... minutes, up to a day
        d.runSync('UPDATE summary_outbox SET attempts = ?, next_try_at = ? WHERE week_start = ?', [
          attempts,
          new Date(Date.now() + wait).toISOString(),
          row.week_start,
        ]);
        break; // likely offline or server trouble; try later in order
      }
    }
  } finally {
    flushing = false;
  }
  return sent;
}

/** Removes everything in the outbox (used by Erase all data and when sharing is turned off). */
export function clearSummaryOutbox(): void {
  open()?.runSync('DELETE FROM summary_outbox WHERE sent_at IS NULL');
}

export function wipeSummaryOutbox(): void {
  open()?.runSync('DELETE FROM summary_outbox');
}
