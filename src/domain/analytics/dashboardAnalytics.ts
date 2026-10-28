/**
 * dashboardAnalytics.ts — Pure deterministic calculations for Thrivefold's home analytics.
 *
 * Computes:
 * - Vitality Score (0–100) combining check-ins, stress balance, quests, and sleep.
 * - Weekly trend points with smooth interpolation for days without check-ins.
 * - Daily distribution bars (equalizer metrics for steps, activity, and vitals).
 * - Real data only: no fake numbers or Math.random().
 */

import { formatLocalDate } from '../calendar/universalCalendarEngine';
import type { DailyCheckInRecord } from '../../stores/slices/healthSlice';
import { stepsByDate, type DeviceReading } from '../interop/readings';

export type TimeRange = 'today' | 'week' | 'month';

export type VitalityTier = 'thriving' | 'balanced' | 'recharging' | 'starting_out';

export interface VitalityResult {
  score: number;
  tier: VitalityTier;
  label: string;
  subtext: string;
  hasCheckInToday: boolean;
  components: {
    energyScore: number | null;
    moodScore: number | null;
    stressBalance: number | null;
    questCompletionPct: number;
    sleepHours: number | null;
    hydrationGlasses?: number | null;
  };
}

export interface DayTrendPoint {
  date: string;
  dayLabel: string;
  isToday: boolean;
  vitality: number;
  hasData: boolean;
  energy: number | null;
  mood: number | null;
  steps: number | null;
}

export interface EqualizerBar {
  dayLabel: string;
  date: string;
  isToday: boolean;
  value: number;
  displayValue: string;
  heightPct: number; // 0 to 1
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Vitality (0-100) for today, computed only from what was actually recorded today.
 *
 * Inputs and base weights (renormalised over the inputs that exist, never filled in):
 * - Energy & mood from today's check-in (1-10 each): 35%
 * - Stress balance from today's check-in (11 - stress): 20%
 * - Share of today's assigned quests completed (only when quests are assigned): 25%
 * - Sleep last night, Health Connect first, else the check-in's sleep hours: 20%
 *
 * Water is deliberately not an input: an unlogged glass is not a zero, and adding a partial day's
 * water would make logging it lower the score. Water has its own ring and card.
 *
 * Without a check-in today there is no score: `score` is 0 and `hasCheckInToday` is false, and
 * the UI must show the check-in prompt instead of a number.
 */
export function computeVitalityScore(params: {
  todayCheckIn: DailyCheckInRecord | null;
  /** @deprecated Older check-ins never stand in for today. Kept for call-site compatibility. */
  recentCheckIns?: DailyCheckInRecord[];
  questsDone: number;
  questsTotal: number;
  lastSleepMinutes: number | null;
  /** Reported back in `components` only; not scored. */
  todayHydrationGlasses?: number | null;
}): VitalityResult {
  const {
    todayCheckIn,
    questsDone,
    questsTotal,
    lastSleepMinutes,
    todayHydrationGlasses,
  } = params;

  const hasCheckInToday = Boolean(todayCheckIn);
  const energyScore = todayCheckIn ? Math.round(todayCheckIn.energy * 10) : null;
  const moodScore = todayCheckIn ? Math.round(todayCheckIn.mood * 10) : null;
  const stressBalance = todayCheckIn ? Math.round((11 - todayCheckIn.stress) * 10) : null;
  const questCompletionPct =
    questsTotal > 0 ? Math.min(100, Math.round((questsDone / questsTotal) * 100)) : 0;
  const sleepHours =
    lastSleepMinutes !== null
      ? Math.round((lastSleepMinutes / 60) * 10) / 10
      : (todayCheckIn?.sleepHours ?? null);
  const hydrationGlasses =
    todayHydrationGlasses !== undefined && todayHydrationGlasses !== null && todayHydrationGlasses > 0
      ? todayHydrationGlasses
      : null;

  const components = {
    energyScore,
    moodScore,
    stressBalance,
    questCompletionPct,
    sleepHours,
    hydrationGlasses,
  };

  if (!todayCheckIn) {
    return {
      score: 0,
      tier: 'starting_out',
      label: 'Ready to begin',
      subtext: 'Check in to see today’s vitality',
      hasCheckInToday,
      components,
    };
  }

  const parts: [weight: number, value: number][] = [
    [0.35, ((energyScore ?? 0) + (moodScore ?? 0)) / 2],
    [0.2, stressBalance ?? 0],
  ];
  if (questsTotal > 0) parts.push([0.25, questCompletionPct]);
  if (sleepHours !== null) parts.push([0.2, sleepScoreFor(sleepHours)]);
  const totalWeight = parts.reduce((a, [w]) => a + w, 0);
  const composite = parts.reduce((a, [w, v]) => a + w * v, 0) / totalWeight;
  const score = Math.max(0, Math.min(100, Math.round(composite)));

  const [tier, label, subtext]: [VitalityTier, string, string] =
    score >= 80
      ? ['thriving', 'Thriving', 'Strong alignment across rest, energy and routines']
      : score >= 60
        ? ['balanced', 'Balanced', 'Steady rhythm; keep your regular recovery window']
        : score >= 40
          ? ['recharging', 'Recharging', 'Take gentle restorative moments today']
          : ['starting_out', 'Needs care', 'Focus on rest, water and light movement'];

  return { score, tier, label, subtext, hasCheckInToday, components };
}

/** 7-9 h is the adult reference range; shorter and much longer nights score lower. */
function sleepScoreFor(hours: number): number {
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours < 7) return 80;
  if (hours > 9 && hours <= 10) return 85;
  if (hours >= 5 && hours < 6) return 65;
  return Math.max(30, Math.min(100, Math.round((hours / 8) * 100)));
}

/**
 * Minutes of movement the person logged on a date: manual activity logs plus finished workout
 * sessions (camera-counted or entered). Camera pose sessions are part of workout sessions and are
 * not counted again. Returns null when nothing was logged, so the UI can say "nothing logged"
 * instead of showing 0 as if it were measured.
 */
export function loggedActiveMinutes(
  date: string,
  activityLogs: { date: string; minutes: number }[],
  workoutSessions: { date: string; startedAt: string; finishedAt: string }[],
): number | null {
  let minutes = 0;
  let any = false;
  for (const a of activityLogs) {
    if (a.date !== date) continue;
    any = true;
    minutes += Math.max(0, a.minutes);
  }
  for (const w of workoutSessions) {
    if (w.date !== date) continue;
    const ms = Date.parse(w.finishedAt) - Date.parse(w.startedAt);
    if (!Number.isFinite(ms) || ms <= 0) continue;
    any = true;
    minutes += Math.min(ms, 6 * 3_600_000) / 60_000;
  }
  return any ? Math.round(minutes) : null;
}

/** Number of days in a 7-day series that carry a real check-in. */
export function trendDaysWithData(points: DayTrendPoint[]): number {
  return points.filter((p) => p.hasData).length;
}

/**
 * Returns 7 daily trend points ending today for spline charts.
 */
export function getWeeklyTrendPoints(
  checkIns: DailyCheckInRecord[],
  readings: DeviceReading[],
  referenceDate = new Date(),
  days = 7,
): DayTrendPoint[] {
  const points: DayTrendPoint[] = [];
  const todayStr = formatLocalDate(referenceDate);

  const checkInMap = new Map<string, DailyCheckInRecord>();
  for (const c of checkIns) {
    checkInMap.set(c.date, c);
  }

  const stepsMap = new Map([...stepsByDate(readings)].map(([d, v]) => [d, v.value]));

  // Generate 7 days ending at referenceDate
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = days <= 7 ? DAY_NAMES[d.getDay()] : String(d.getDate());
    const isToday = dateStr === todayStr;

    const checkIn = checkInMap.get(dateStr);
    const steps = stepsMap.get(dateStr) ?? null;

    if (checkIn) {
      // Calculate daily vitality (0-100)
      const energyNorm = checkIn.energy * 10;
      const moodNorm = checkIn.mood * 10;
      const stressNorm = (11 - checkIn.stress) * 10;
      const vitality = Math.round(0.4 * energyNorm + 0.3 * moodNorm + 0.3 * stressNorm);

      points.push({
        date: dateStr,
        dayLabel,
        isToday,
        vitality,
        hasData: true,
        energy: checkIn.energy,
        mood: checkIn.mood,
        steps,
      });
    } else {
      points.push({
        date: dateStr,
        dayLabel,
        isToday,
        vitality: 0,
        hasData: false,
        energy: null,
        mood: null,
        steps,
      });
    }
  }

  return points;
}

/**
 * Generates 7 vertical equalizer distribution bars (e.g. for step counts or activity minutes).
 */
export function getEqualizerBars(
  readings: DeviceReading[],
  kind: 'steps' | 'sleep_minutes' = 'steps',
  referenceDate = new Date(),
  days = 7,
): EqualizerBar[] {
  const bars: EqualizerBar[] = [];
  const todayStr = formatLocalDate(referenceDate);

  const map = new Map<string, number>();
  if (kind === 'steps') {
    for (const [d, v] of stepsByDate(readings)) map.set(d, v.value);
  } else {
    for (const r of readings) if (r.kind === kind) map.set(r.date, r.value);
  }

  const dailyValues: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const val = map.get(dateStr) ?? 0;
    dailyValues.push(val);
  }

  const maxVal = Math.max(1, ...dailyValues, kind === 'steps' ? 8000 : 480);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = days <= 7 ? DAY_NAMES[d.getDay()] : String(d.getDate());
    const isToday = dateStr === todayStr;
    const value = map.get(dateStr) ?? 0;

    let displayValue = `${value}`;
    if (kind === 'steps') {
      displayValue = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
    } else if (kind === 'sleep_minutes') {
      const h = Math.floor(value / 60);
      const m = Math.round(value % 60);
      displayValue = value > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : '0h';
    }

    const heightPct = Math.min(1, Math.max(0.08, value / maxVal));

    bars.push({
      dayLabel,
      date: dateStr,
      isToday,
      value,
      displayValue,
      heightPct,
    });
  }

  return bars;
}

/**
 * Generates 7 vertical equalizer distribution bars for hydration (glasses of water).
 */
export function getWeeklyHydrationBars(
  hydration: Record<string, number>,
  referenceDate = new Date(),
  targetGlasses = 8,
  days = 7,
): EqualizerBar[] {
  const bars: EqualizerBar[] = [];
  const todayStr = formatLocalDate(referenceDate);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = days <= 7 ? DAY_NAMES[d.getDay()] : String(d.getDate());
    const isToday = dateStr === todayStr;
    const value = hydration[dateStr] ?? 0;
    const displayValue = value > 0 ? `${value}` : '0';
    const heightPct = Math.min(1, Math.max(0.08, value / targetGlasses));

    bars.push({
      dayLabel,
      date: dateStr,
      isToday,
      value,
      displayValue,
      heightPct,
    });
  }

  return bars;
}

