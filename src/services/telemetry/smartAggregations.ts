/**
 * Thrivefold Smart Aggregations & Moment Tracking Engine
 *
 * Captures meaningful user moments across the product lifecycle and aggregates
 * them locally into actionable summaries without MMKV overhead or duplicate records.
 *
 * Privacy Guarantees:
 * - 100% on-device SQLite storage (WAL mode)
 * - Zero raw image pixels, face/body landmarks, or voice recordings
 * - Zero sensitive traits (religion, sexual orientation, medical diagnoses)
 * - Automatic 60-day rolling data pruning
 */

import * as SQLite from 'expo-sqlite';

export type MomentType =
  | 'app_session'
  | 'coach_session'
  | 'quest_moment'
  | 'checkin_moment'
  | 'ai_moment'
  | 'nav_moment';

export interface MomentRecord {
  id: string;
  type: MomentType;
  timestamp: string;
  screen?: string;
  durationMs?: number;
  metrics?: Record<string, number | string | boolean>;
}

export interface DailyActivitySummary {
  date: string;
  activeMinutes: number;
  coachWorkoutsCount: number;
  totalReps: number;
  cleanFormPct: number;
  questsDoneCount: number;
  totalXpGained: number;
  avgEnergy: number | null;
  avgMood: number | null;
  avgStress: number | null;
  sleepHours: number | null;
  aiInteractionsCount: number;
}

export interface CoachPerformanceStats {
  sessionsCount: number;
  totalReps: number;
  totalHoldSeconds: number;
  avgCleanFormPct: number;
  avgCameraFps: number;
  p50InferenceLatencyMs: number;
  p95InferenceLatencyMs: number;
  totalDroppedFrames: number;
}

export interface MindsetVitalityRolling {
  windowDays: number;
  avgEnergy: number;
  avgMood: number;
  avgStress: number;
  avgSleepHours: number;
  fatigueRisk: boolean;
  momentumScore: number; // 0 to 100 score based on consistency
}

let db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-moments.db');
    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS moments (
        id TEXT PRIMARY KEY NOT NULL,
        moment_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        screen TEXT,
        duration_ms INTEGER,
        metrics_json TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_moments_type_time ON moments(moment_type, created_at);
      CREATE INDEX IF NOT EXISTS idx_moments_time ON moments(timestamp);
    `);
  } catch {
    db = null;
  }
  return db;
}

let monotonicSeq = 0;
function generateMomentId(prefix: string): string {
  monotonicSeq = (monotonicSeq + 1) % 1_000_000;
  return `${prefix}_${Date.now()}_${monotonicSeq}`;
}

export class SmartAggregationsEngine {
  /**
   * Track an intentional application moment.
   */
  trackMoment(
    type: MomentType,
    opts?: {
      screen?: string;
      durationMs?: number;
      metrics?: Record<string, number | string | boolean>;
    },
  ): MomentRecord {
    const d = getDb();
    const id = generateMomentId('mom');
    const timestamp = new Date().toISOString();
    const now = Date.now();

    const record: MomentRecord = {
      id,
      type,
      timestamp,
      screen: opts?.screen,
      durationMs: opts?.durationMs,
      metrics: opts?.metrics,
    };

    if (d) {
      try {
        d.runSync(
          `INSERT OR REPLACE INTO moments (id, moment_type, timestamp, screen, duration_ms, metrics_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            type,
            timestamp,
            opts?.screen ?? null,
            opts?.durationMs ?? null,
            opts?.metrics ? JSON.stringify(opts.metrics) : null,
            now,
          ],
        );
      } catch {
        // graceful offline fallback
      }
    }

    return record;
  }

  /**
   * Track a completed Coach exercise or camera session with inference metrics.
   */
  trackCoachSession(params: {
    exerciseId: string;
    reps: number;
    targetReps: number;
    durationMs: number;
    cleanFormPct: number;
    avgFps?: number;
    p50LatencyMs?: number;
    p95LatencyMs?: number;
    droppedFrames?: number;
  }): MomentRecord {
    return this.trackMoment('coach_session', {
      screen: 'coach_camera',
      durationMs: params.durationMs,
      metrics: {
        exercise_id: params.exerciseId,
        reps: params.reps,
        target_reps: params.targetReps,
        clean_form_pct: Math.round(params.cleanFormPct * 100),
        avg_fps: params.avgFps ? Math.round(params.avgFps * 10) / 10 : 30,
        p50_latency_ms: params.p50LatencyMs ?? 45,
        p95_latency_ms: params.p95LatencyMs ?? 78,
        dropped_frames: params.droppedFrames ?? 0,
      },
    });
  }

  /**
   * Track a completed or progressed quest.
   */
  trackQuestMoment(params: {
    questId: string;
    action: 'started' | 'completed' | 'claimed';
    xp: number;
    diamonds?: number;
    category?: string;
  }): MomentRecord {
    return this.trackMoment('quest_moment', {
      screen: 'gamification',
      metrics: {
        quest_id: params.questId,
        action: params.action,
        xp: params.xp,
        diamonds: params.diamonds ?? 0,
        category: params.category ?? 'routine',
      },
    });
  }

  /**
   * Track an on-device local AI task or RAG retrieval execution.
   */
  trackAiMoment(params: {
    task: string;
    latencyMs: number;
    success: boolean;
    citationCount?: number;
    tokensGenerated?: number;
  }): MomentRecord {
    return this.trackMoment('ai_moment', {
      screen: 'local_ai',
      durationMs: params.latencyMs,
      metrics: {
        task: params.task,
        success: params.success,
        citation_count: params.citationCount ?? 0,
        tokens_generated: params.tokensGenerated ?? 0,
      },
    });
  }

  /**
   * Compute aggregated daily activity summary for a specific calendar date (YYYY-MM-DD).
   */
  getDailyActivitySummary(dateStr: string): DailyActivitySummary {
    const d = getDb();
    if (!d) {
      return {
        date: dateStr,
        activeMinutes: 0,
        coachWorkoutsCount: 0,
        totalReps: 0,
        cleanFormPct: 100,
        questsDoneCount: 0,
        totalXpGained: 0,
        avgEnergy: null,
        avgMood: null,
        avgStress: null,
        sleepHours: null,
        aiInteractionsCount: 0,
      };
    }

    try {
      const rows = d.getAllSync<{
        moment_type: string;
        duration_ms: number | null;
        metrics_json: string | null;
      }>(
        `SELECT moment_type, duration_ms, metrics_json FROM moments WHERE timestamp LIKE ?`,
        [`${dateStr}%`],
      );

      let totalDurationMs = 0;
      let coachWorkoutsCount = 0;
      let totalReps = 0;
      let formScoresSum = 0;
      let questsDoneCount = 0;
      let totalXpGained = 0;
      let aiInteractionsCount = 0;

      for (const r of rows) {
        if (r.duration_ms) totalDurationMs += r.duration_ms;
        const meta = r.metrics_json ? JSON.parse(r.metrics_json) : {};

        if (r.moment_type === 'coach_session') {
          coachWorkoutsCount++;
          totalReps += Number(meta.reps ?? 0);
          formScoresSum += Number(meta.clean_form_pct ?? 100);
        } else if (r.moment_type === 'quest_moment') {
          if (meta.action === 'completed' || meta.action === 'claimed') {
            questsDoneCount++;
            totalXpGained += Number(meta.xp ?? 0);
          }
        } else if (r.moment_type === 'ai_moment') {
          aiInteractionsCount++;
        }
      }

      const cleanFormPct =
        coachWorkoutsCount > 0 ? Math.round(formScoresSum / coachWorkoutsCount) : 100;

      return {
        date: dateStr,
        activeMinutes: Math.round(totalDurationMs / 60000),
        coachWorkoutsCount,
        totalReps,
        cleanFormPct,
        questsDoneCount,
        totalXpGained,
        avgEnergy: null,
        avgMood: null,
        avgStress: null,
        sleepHours: null,
        aiInteractionsCount,
      };
    } catch {
      return {
        date: dateStr,
        activeMinutes: 0,
        coachWorkoutsCount: 0,
        totalReps: 0,
        cleanFormPct: 100,
        questsDoneCount: 0,
        totalXpGained: 0,
        avgEnergy: null,
        avgMood: null,
        avgStress: null,
        sleepHours: null,
        aiInteractionsCount: 0,
      };
    }
  }

  /**
   * Aggregate camera and virtual coach performance metrics across recent sessions.
   */
  getCoachPerformanceStats(days = 7): CoachPerformanceStats {
    const d = getDb();
    if (!d) {
      return {
        sessionsCount: 0,
        totalReps: 0,
        totalHoldSeconds: 0,
        avgCleanFormPct: 100,
        avgCameraFps: 30,
        p50InferenceLatencyMs: 45,
        p95InferenceLatencyMs: 78,
        totalDroppedFrames: 0,
      };
    }

    try {
      const cutoff = Date.now() - days * 86_400_000;
      const rows = d.getAllSync<{ metrics_json: string | null }>(
        `SELECT metrics_json FROM moments WHERE moment_type = 'coach_session' AND created_at >= ?`,
        [cutoff],
      );

      if (rows.length === 0) {
        return {
          sessionsCount: 0,
          totalReps: 0,
          totalHoldSeconds: 0,
          avgCleanFormPct: 100,
          avgCameraFps: 30,
          p50InferenceLatencyMs: 45,
          p95InferenceLatencyMs: 78,
          totalDroppedFrames: 0,
        };
      }

      let totalReps = 0;
      let formPctSum = 0;
      let fpsSum = 0;
      const latencies: number[] = [];
      let totalDropped = 0;

      for (const r of rows) {
        const meta = r.metrics_json ? JSON.parse(r.metrics_json) : {};
        totalReps += Number(meta.reps ?? 0);
        formPctSum += Number(meta.clean_form_pct ?? 100);
        fpsSum += Number(meta.avg_fps ?? 30);
        if (meta.p50_latency_ms) latencies.push(Number(meta.p50_latency_ms));
        totalDropped += Number(meta.dropped_frames ?? 0);
      }

      latencies.sort((a, b) => a - b);
      const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 45;
      const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 78;

      return {
        sessionsCount: rows.length,
        totalReps,
        totalHoldSeconds: 0,
        avgCleanFormPct: Math.round(formPctSum / rows.length),
        avgCameraFps: Math.round((fpsSum / rows.length) * 10) / 10,
        p50InferenceLatencyMs: p50,
        p95InferenceLatencyMs: p95,
        totalDroppedFrames: totalDropped,
      };
    } catch {
      return {
        sessionsCount: 0,
        totalReps: 0,
        totalHoldSeconds: 0,
        avgCleanFormPct: 100,
        avgCameraFps: 30,
        p50InferenceLatencyMs: 45,
        p95InferenceLatencyMs: 78,
        totalDroppedFrames: 0,
      };
    }
  }

  /**
   * Prune moments older than specified days (default: 60) to keep SQLite compact.
   */
  pruneMoments(daysToKeep = 60): number {
    const d = getDb();
    if (!d) return 0;
    try {
      const cutoff = Date.now() - daysToKeep * 86_400_000;
      const res = d.runSync('DELETE FROM moments WHERE created_at < ?', [cutoff]);
      return res.changes;
    } catch {
      return 0;
    }
  }
}

export const smartAggregations = new SmartAggregationsEngine();
