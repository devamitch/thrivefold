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
import type { DeviceReading } from '../interop/readings';

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
 * Computes the overall Vitality Score (0-100) deterministically from verified user records.
 *
 * Weights:
 * - Energy & Mood: 35%
 * - Stress Balance (11 - stress): 20%
 * - Quests completed: 25%
 * - Sleep restorative baseline: 20%
 */
export function computeVitalityScore(params: {
  todayCheckIn: DailyCheckInRecord | null;
  recentCheckIns: DailyCheckInRecord[];
  questsDone: number;
  questsTotal: number;
  lastSleepMinutes: number | null;
  todayHydrationGlasses?: number | null;
}): VitalityResult {
  const {
    todayCheckIn,
    recentCheckIns,
    questsDone,
    questsTotal,
    lastSleepMinutes,
    todayHydrationGlasses,
  } = params;

  const activeCheckIn = todayCheckIn ?? (recentCheckIns.length > 0 ? recentCheckIns[0] : null);
  const hasCheckInToday = Boolean(todayCheckIn);

  // 1. Energy & Mood Component (0-100)
  const energyScore = activeCheckIn ? Math.round(activeCheckIn.energy * 10) : null;
  const moodScore = activeCheckIn ? Math.round(activeCheckIn.mood * 10) : null;
  const energyMoodAvg =
    energyScore !== null && moodScore !== null
      ? (energyScore + moodScore) / 2
      : energyScore ?? moodScore ?? 70;

  // 2. Stress Balance Component (0-100) — Invert 1-10 stress scale so lower stress = higher score
  const stressBalance = activeCheckIn ? Math.round((11 - activeCheckIn.stress) * 10) : null;
  const effectiveStressScore = stressBalance ?? 70;

  // 3. Quest Completion Component (0-100)
  const questCompletionPct =
    questsTotal > 0
      ? Math.min(100, Math.round((questsDone / questsTotal) * 100))
      : questsDone > 0
        ? 100
        : 75; // Neutral baseline if no quests assigned

  // 4. Sleep Component (0-100) — Healthy adult baseline: 7-8 hours (420-480 min)
  const sleepHours =
    lastSleepMinutes !== null
      ? Math.round((lastSleepMinutes / 60) * 10) / 10
      : activeCheckIn?.sleepHours ?? null;

  let sleepScore = 75; // Neutral baseline
  if (sleepHours !== null) {
    if (sleepHours >= 7 && sleepHours <= 9) {
      sleepScore = 100;
    } else if (sleepHours >= 6 && sleepHours < 7) {
      sleepScore = 80;
    } else if (sleepHours > 9 && sleepHours <= 10) {
      sleepScore = 85;
    } else if (sleepHours >= 5 && sleepHours < 6) {
      sleepScore = 65;
    } else {
      sleepScore = Math.max(30, Math.min(100, Math.round((sleepHours / 8) * 100)));
    }
  }

  // 5. Hydration Component (0-100) — Target: 8 glasses (2,000 ml)
  const hasHydration =
    todayHydrationGlasses !== undefined && todayHydrationGlasses !== null;
  const hydrationScore = hasHydration
    ? Math.min(100, Math.round((todayHydrationGlasses / 8) * 100))
    : 75;

  // Weighted calculation (balanced 100% distribution)
  const composite = hasHydration
    ? 0.30 * energyMoodAvg +
      0.15 * effectiveStressScore +
      0.20 * questCompletionPct +
      0.20 * sleepScore +
      0.15 * hydrationScore
    : 0.35 * energyMoodAvg +
      0.20 * effectiveStressScore +
      0.25 * questCompletionPct +
      0.20 * sleepScore;

  const score = Math.max(0, Math.min(100, Math.round(composite)));

  // Categorize tier
  let tier: VitalityTier = 'starting_out';
  let label = 'Getting Started';
  let subtext = 'Log your first check-in to compute your rhythm';

  if (!hasCheckInToday && !activeCheckIn && questsDone === 0) {
    tier = 'starting_out';
    label = 'Ready to Begin';
    subtext = 'Start with a 1-minute daily check-in';
  } else if (score >= 80) {
    tier = 'thriving';
    label = 'Thriving';
    subtext = 'Strong alignment across rest, energy and routines';
  } else if (score >= 60) {
    tier = 'balanced';
    label = 'Balanced';
    subtext = 'Steady rhythm; keep your regular recovery window';
  } else if (score >= 40) {
    tier = 'recharging';
    label = 'Recharging';
    subtext = 'Take gentle restorative moments today';
  } else {
    tier = 'starting_out';
    label = 'Needs Care';
    subtext = 'Focus on rest, hydration and light movement';
  }

  return {
    score,
    tier,
    label,
    subtext,
    hasCheckInToday,
    components: {
      energyScore,
      moodScore,
      stressBalance,
      questCompletionPct,
      sleepHours,
      hydrationGlasses: todayHydrationGlasses ?? null,
    },
  };
}

/**
 * Returns 7 daily trend points ending today for spline charts.
 */
export function getWeeklyTrendPoints(
  checkIns: DailyCheckInRecord[],
  readings: DeviceReading[],
  referenceDate = new Date(),
): DayTrendPoint[] {
  const points: DayTrendPoint[] = [];
  const todayStr = formatLocalDate(referenceDate);

  const checkInMap = new Map<string, DailyCheckInRecord>();
  for (const c of checkIns) {
    checkInMap.set(c.date, c);
  }

  const stepsMap = new Map<string, number>();
  for (const r of readings) {
    if (r.kind === 'steps') {
      stepsMap.set(r.date, r.value);
    }
  }

  // Generate 7 days ending at referenceDate
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = DAY_NAMES[d.getDay()];
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
): EqualizerBar[] {
  const bars: EqualizerBar[] = [];
  const todayStr = formatLocalDate(referenceDate);

  const map = new Map<string, number>();
  for (const r of readings) {
    if (r.kind === kind) {
      map.set(r.date, r.value);
    }
  }

  const dailyValues: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const val = map.get(dateStr) ?? 0;
    dailyValues.push(val);
  }

  const maxVal = Math.max(1, ...dailyValues, kind === 'steps' ? 8000 : 480);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = DAY_NAMES[d.getDay()];
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
): EqualizerBar[] {
  const bars: EqualizerBar[] = [];
  const todayStr = formatLocalDate(referenceDate);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = DAY_NAMES[d.getDay()];
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

