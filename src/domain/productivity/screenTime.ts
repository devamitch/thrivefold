/**
 * screenTime.ts — Local screen time and working schedule identification.
 *
 * Runs strictly on-device. No telemetry or server communication.
 */

export interface WorkSchedule {
  type: 'regular' | 'flexible' | 'night_shift' | 'desk_heavy';
  typicalStartHour: number;
  typicalEndHour: number;
  dailyScreenMinutes: number;
  continuousSessionMinutes: number;
  needsBreak: boolean;
  recommendedBreakKind: 'eye_rest_20_20' | 'posture_reset' | 'water_hydrate';
}

export interface ScreenSession {
  startedAt: string; // ISO
  endedAt?: string;  // ISO
  durationMinutes: number;
}

/**
 * Identifies the working schedule and current fatigue state based on local usage and calendar entries.
 */
export function identifyWorkSchedule(
  todaySessions: ScreenSession[],
  currentContinuousMinutes: number = 0,
): WorkSchedule {
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0) + currentContinuousMinutes;

  // Determine peak activity hours
  const hourCounts = new Array(24).fill(0);
  for (const s of todaySessions) {
    const h = new Date(s.startedAt).getHours();
    if (h >= 0 && h < 24) hourCounts[h] += s.durationMinutes;
  }

  let startHour = 9;
  let endHour = 18;
  for (let i = 0; i < 24; i++) {
    if (hourCounts[i] > 10) {
      startHour = i;
      break;
    }
  }
  for (let i = 23; i >= 0; i--) {
    if (hourCounts[i] > 10) {
      endHour = Math.min(23, i + 1);
      break;
    }
  }

  const isNight = startHour >= 20 || endHour <= 5;
  const isHeavyDesk = totalMinutes > 240;

  const type: WorkSchedule['type'] = isNight
    ? 'night_shift'
    : isHeavyDesk
      ? 'desk_heavy'
      : totalMinutes > 60
        ? 'regular'
        : 'flexible';

  // 20-20-20 rule triggers after 40+ min of continuous screen focus
  const needsBreak = currentContinuousMinutes >= 40 || totalMinutes >= 360;
  const recommendedBreakKind: WorkSchedule['recommendedBreakKind'] =
    currentContinuousMinutes >= 40
      ? 'eye_rest_20_20'
      : totalMinutes >= 180
        ? 'posture_reset'
        : 'water_hydrate';

  return {
    type,
    typicalStartHour: startHour,
    typicalEndHour: endHour,
    dailyScreenMinutes: totalMinutes,
    continuousSessionMinutes: currentContinuousMinutes,
    needsBreak,
    recommendedBreakKind,
  };
}
