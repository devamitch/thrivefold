/**
 * Calories burned through activity, estimated (never measured) from what the phone knows:
 * - steps: ~0.04 kcal per step at 70 kg, scaled by body weight;
 * - workouts and logged activities: MET x body weight x hours (Compendium of Physical Activities
 *   typical values).
 * Walking, running and hiking logs are skipped when steps were counted the same day, because the
 * phone already counted those steps. With no weight saved, 70 kg is assumed and the result says so.
 */

export const DEFAULT_WEIGHT_KG = 70;
const KCAL_PER_STEP_AT_70KG = 0.04;

/** Typical MET values per activity type (lower-cased). */
export const MET_BY_ACTIVITY: Record<string, number> = {
  walking: 3.5,
  running: 9.8,
  hiking: 6,
  cycling: 7.5,
  swimming: 7,
  rowing: 7,
  'yoga class': 2.5,
  yoga: 2.5,
  'pilates class': 3,
  pilates: 3,
  dance: 5,
  'gym session': 5,
  football: 7,
  cricket: 4.8,
  badminton: 5.5,
  tennis: 7.3,
  basketball: 6.5,
  'martial arts': 10,
  climbing: 8,
  other: 4,
};
/** Home strength / dumbbell workouts (moderate effort). */
export const STRENGTH_MET = 5;
const STEP_BASED = new Set(['walking', 'running', 'hiking']);

export interface CalorieInputs {
  date: string;
  steps: number | null;
  weightKg: number | null;
  activityLogs: { date: string; type: string; minutes: number }[];
  workoutSessions: { date: string; startedAt: string; finishedAt: string }[];
}

export interface CalorieBreakdown {
  total: number;
  fromSteps: number;
  fromWorkouts: number;
  fromActivities: number;
  weightAssumed: boolean;
}

const kcal = (met: number, kg: number, minutes: number) => met * kg * (minutes / 60);

export function activeCalories(i: CalorieInputs): CalorieBreakdown {
  const kg = i.weightKg && i.weightKg > 20 && i.weightKg < 300 ? i.weightKg : DEFAULT_WEIGHT_KG;
  const stepsCounted = (i.steps ?? 0) > 0;
  const fromSteps = stepsCounted ? (i.steps as number) * KCAL_PER_STEP_AT_70KG * (kg / 70) : 0;

  let fromWorkouts = 0;
  for (const w of i.workoutSessions) {
    if (w.date !== i.date) continue;
    const ms = Date.parse(w.finishedAt) - Date.parse(w.startedAt);
    if (!Number.isFinite(ms) || ms <= 0) continue;
    fromWorkouts += kcal(STRENGTH_MET, kg, Math.min(ms, 6 * 3_600_000) / 60_000);
  }

  let fromActivities = 0;
  for (const a of i.activityLogs) {
    if (a.date !== i.date || a.minutes <= 0) continue;
    const type = a.type.trim().toLowerCase();
    if (stepsCounted && STEP_BASED.has(type)) continue;
    fromActivities += kcal(MET_BY_ACTIVITY[type] ?? MET_BY_ACTIVITY.other, kg, a.minutes);
  }

  const r = (n: number) => Math.round(n);
  return {
    total: r(fromSteps) + r(fromWorkouts) + r(fromActivities),
    fromSteps: r(fromSteps),
    fromWorkouts: r(fromWorkouts),
    fromActivities: r(fromActivities),
    weightAssumed: kg === DEFAULT_WEIGHT_KG && !(i.weightKg && i.weightKg > 20),
  };
}
