/**
 * Estimates from step counts. These are estimates, not measurements, and the UI labels them so:
 * - walking minutes: ~100 steps per minute of ordinary walking;
 * - distance: ~0.75 m per step (an average adult stride);
 * - the most active hour is read straight from the hourly counts.
 */
export const STEPS_PER_WALKING_MINUTE = 100;
export const METRES_PER_STEP = 0.75;

export interface StepInsights {
  walkingMinutes: number;
  distanceKm: number;
  peakHour: number | null;
  peakSteps: number;
  activeHours: number;
}

export function stepInsights(totalSteps: number, hours?: readonly number[]): StepInsights {
  const steps = Math.max(0, Math.round(totalSteps || 0));
  let peakHour: number | null = null;
  let peakSteps = 0;
  let activeHours = 0;
  (hours ?? []).forEach((n, h) => {
    if (n > peakSteps) {
      peakSteps = n;
      peakHour = h;
    }
    // An hour counts as active from ~5 minutes of walking.
    if (n >= 5 * STEPS_PER_WALKING_MINUTE) activeHours += 1;
  });
  return {
    walkingMinutes: Math.round(steps / STEPS_PER_WALKING_MINUTE),
    distanceKm: Math.round((steps * METRES_PER_STEP) / 100) / 10,
    peakHour,
    peakSteps,
    activeHours,
  };
}

export function hourLabel(h: number): string {
  const suffix = h < 12 ? 'am' : 'pm';
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n} ${suffix}`;
}
