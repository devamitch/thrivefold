const mockDb = {
  execSync: jest.fn(),
  runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
  getAllSync: jest.fn(),
  getFirstSync: jest.fn(() => null),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
  openDatabaseAsync: jest.fn(async () => mockDb),
}));

import { SmartAggregationsEngine } from '@/services/telemetry/smartAggregations';

describe('SmartAggregationsEngine', () => {
  let engine: SmartAggregationsEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new SmartAggregationsEngine();
  });

  it('records an application moment into SQLite', () => {
    const moment = engine.trackMoment('app_session', {
      screen: 'home',
      durationMs: 45000,
      metrics: { status: 'active' },
    });

    expect(moment.id).toMatch(/^mom_\d+_\d+$/);
    expect(moment.type).toBe('app_session');
    expect(mockDb.runSync).toHaveBeenCalledTimes(1);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO moments'),
      expect.arrayContaining([moment.id, 'app_session']),
    );
  });

  it('records a coach session moment with inference metrics', () => {
    const moment = engine.trackCoachSession({
      exerciseId: 'squat',
      reps: 15,
      targetReps: 15,
      durationMs: 32000,
      cleanFormPct: 0.85,
      avgFps: 30.2,
      p50LatencyMs: 42,
      p95LatencyMs: 68,
      droppedFrames: 1,
    });

    expect(moment.type).toBe('coach_session');
    expect(moment.metrics?.reps).toBe(15);
    expect(moment.metrics?.clean_form_pct).toBe(85);
    expect(moment.metrics?.p50_latency_ms).toBe(42);
  });

  it('computes daily activity summary from stored moments', () => {
    mockDb.getAllSync.mockReturnValueOnce([
      {
        moment_type: 'coach_session',
        duration_ms: 120000,
        metrics_json: JSON.stringify({ reps: 20, clean_form_pct: 90 }),
      },
      {
        moment_type: 'quest_moment',
        duration_ms: 30000,
        metrics_json: JSON.stringify({ action: 'completed', xp: 50 }),
      },
      {
        moment_type: 'ai_moment',
        duration_ms: 800,
        metrics_json: JSON.stringify({ task: 'classification', success: true }),
      },
    ]);

    const summary = engine.getDailyActivitySummary('2026-10-26');

    expect(summary.date).toBe('2026-10-26');
    expect(summary.coachWorkoutsCount).toBe(1);
    expect(summary.totalReps).toBe(20);
    expect(summary.cleanFormPct).toBe(90);
    expect(summary.questsDoneCount).toBe(1);
    expect(summary.totalXpGained).toBe(50);
    expect(summary.aiInteractionsCount).toBe(1);
  });

  it('computes coach performance metrics with latency percentiles', () => {
    mockDb.getAllSync.mockReturnValueOnce([
      {
        metrics_json: JSON.stringify({
          reps: 12,
          clean_form_pct: 80,
          avg_fps: 30,
          p50_latency_ms: 40,
          dropped_frames: 0,
        }),
      },
      {
        metrics_json: JSON.stringify({
          reps: 15,
          clean_form_pct: 100,
          avg_fps: 30,
          p50_latency_ms: 50,
          dropped_frames: 2,
        }),
      },
    ]);

    const stats = engine.getCoachPerformanceStats(7);

    expect(stats.sessionsCount).toBe(2);
    expect(stats.totalReps).toBe(27);
    expect(stats.avgCleanFormPct).toBe(90);
    expect(stats.totalDroppedFrames).toBe(2);
    expect(stats.p50InferenceLatencyMs).toBe(50);
  });

  it('prunes old moments safely using SQL threshold', () => {
    mockDb.runSync.mockReturnValueOnce({ changes: 14, lastInsertRowId: 0 });
    const pruned = engine.pruneMoments(60);
    expect(pruned).toBe(14);
    expect(mockDb.runSync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM moments WHERE created_at < ?'),
      expect.any(Array),
    );
  });
});
