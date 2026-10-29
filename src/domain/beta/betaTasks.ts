/**
 * Daily beta tasks that sit inside today's quests: three a day, rotating, each done by a real
 * finished session of that kind today. Plus the numbers for the beta insights on Home.
 */
import type { BetaSession, BetaSessionKind } from '../../stores/slices/appSlice';

export interface BetaTask {
  id: string;
  title: string;
  minutes: number;
  route: string;
  kinds: BetaSessionKind[];
}

const POOL: BetaTask[] = [
  { id: 'eye-games', title: 'Eye game: look left, right, blink', minutes: 2, route: '/(app)/beta-lab/eye-games', kinds: ['eye_game'] },
  { id: 'breathing', title: 'Breathe for a minute with the coach', minutes: 1, route: '/(app)/beta-lab/breathing', kinds: ['breathing'] },
  { id: 'voice', title: 'Voice: hold an "aah"', minutes: 1, route: '/(app)/beta-lab/voice-practice', kinds: ['voice_practice'] },
  { id: 'face', title: 'Face and eye moves', minutes: 3, route: '/(app)/beta-lab/face-exercises', kinds: ['face_exercise'] },
  { id: 'hands', title: 'Hand game round', minutes: 2, route: '/(app)/beta-lab/gesture-game', kinds: ['finger_game', 'hand_grip'] },
  { id: 'pursuit', title: 'Follow the dot', minutes: 1, route: '/(app)/beta-lab/eye-pursuit', kinds: ['eye_pursuit'] },
  { id: 'posture', title: 'Posture check photo', minutes: 1, route: '/(app)/beta-lab/body-style', kinds: ['portrait_scan'] },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Three tasks for this date (stable through the day), each marked done when a session exists. */
export function betaTasksFor(date: Date, sessions: BetaSession[]): (BetaTask & { done: boolean })[] {
  const dayIndex = Math.floor(startOfDay(date) / 86_400_000);
  const from = startOfDay(date);
  const picked = [0, 1, 2].map((k) => POOL[(dayIndex * 3 + k) % POOL.length]);
  return picked.map((t) => ({ ...t, done: sessions.some((s) => s.endedAt >= from && t.kinds.includes(s.kind)) }));
}

export interface BetaInsights {
  sessions: number;
  minutes: number;
  bestPursuit: number | null;
  longestHoldS: number | null;
  bestGame: number | null;
  activeDays: number;
}

/** Last 7 days of beta practice, from saved sessions only. */
export function betaInsights(now: Date, sessions: BetaSession[]): BetaInsights {
  const from = startOfDay(now) - 6 * 86_400_000;
  const week = sessions.filter((s) => s.endedAt >= from);
  const max = (k: BetaSessionKind[], m: string) => {
    const v = week.filter((s) => k.includes(s.kind) && typeof s.metrics[m] === 'number').map((s) => s.metrics[m]);
    return v.length ? Math.max(...v) : null;
  };
  return {
    sessions: week.length,
    minutes: Math.round(week.reduce((n, s) => n + Math.max(0, s.endedAt - s.startedAt), 0) / 60000),
    bestPursuit: max(['eye_pursuit'], 'score'),
    longestHoldS: max(['voice_practice'], 'seconds'),
    bestGame: max(['eye_game', 'finger_game'], 'score'),
    activeDays: new Set(week.map((s) => startOfDay(new Date(s.endedAt)))).size,
  };
}
