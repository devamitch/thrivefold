/**
 * Screen Capability Registry for Context-Aware Coaching.
 *
 * Inspired by Google AI Edge Gallery's execution context patterns:
 * Maps each primary app route to its semantic purpose, accessible metrics,
 * supported tools, and suggested prompt chips.
 */

import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';

export interface ScreenChip {
  label: string;
  command: string;
}

export interface ScreenCapability {
  route: string;
  title: string;
  purpose: string;
  visibleMetrics: string[];
  supportedTools: string[];
  suggestedChips: ScreenChip[];
  getContextSummary: (storeState: any) => string;
}

export const SCREEN_REGISTRY: Record<string, ScreenCapability> = {
  '/(app)/(tabs)': {
    route: '/(app)/(tabs)',
    title: 'Home Sanctuary',
    purpose: 'Daily wellbeing dashboard, routine tracker, hydration overview, and active vital signs.',
    visibleMetrics: ['steps', 'water', 'active_calories', 'quests'],
    supportedTools: ['log_water', 'get_metrics', 'navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'Log 2 glasses of water', command: 'log 2 glasses of water' },
      { label: 'How are my steps today?', command: 'how many steps today?' },
      { label: 'What quests remain?', command: 'what quests are left?' },
      { label: 'Start breathing coach', command: 'start breathing' },
    ],
    getContextSummary: (s) => {
      const today = formatLocalDate(new Date());
      const steps = s?.deviceReadings ? stepsByDate(s.deviceReadings).get(today)?.value : 0;
      const water = s?.hydration?.[today] ?? 0;
      return `User is on Home Dashboard. Steps: ${Math.round(steps || 0)}, Water: ${water} glasses.`;
    },
  },
  '/(app)/(tabs)/today': {
    route: '/(app)/(tabs)/today',
    title: 'Today & Quests',
    purpose: 'Daily habit tracking, mind-body quests, time-of-day practices, and mindful reflections.',
    visibleMetrics: ['quests', 'active_calories', 'steps'],
    supportedTools: ['get_metrics', 'navigate_to_screen', 'log_journal_note'],
    suggestedChips: [
      { label: 'Summarize today quests', command: 'what quests are left today?' },
      { label: 'Open breathing exercise', command: 'start breathing' },
      { label: 'Check pose technique', command: 'start pose check' },
    ],
    getContextSummary: (s) => {
      const open = s?.todayQuests?.filter((q: any) => !q.isCompleted) ?? [];
      return `User is viewing Today Quests. Unfinished quests: ${open.length}.`;
    },
  },
  '/(app)/(tabs)/progress': {
    route: '/(app)/(tabs)/progress',
    title: 'Progress & Insights',
    purpose: 'Historical weekly trends, activity consistency, streak records, and level advancement.',
    visibleMetrics: ['xp', 'level', 'streak', 'diamonds'],
    supportedTools: ['get_metrics', 'navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'What is my current streak?', command: 'how is my progress?' },
      { label: 'Show active calories', command: 'how many calories burned?' },
      { label: 'Review past reflections', command: 'show my journal memories' },
    ],
    getContextSummary: (s) => {
      return `User is reviewing Progress. Level: ${s?.userLevel ?? 1}, XP: ${s?.userXp ?? 0}.`;
    },
  },
  '/(app)/(tabs)/settings': {
    route: '/(app)/(tabs)/settings',
    title: 'You & Settings',
    purpose: 'Personal preferences, pacing configurations, privacy export, and AnvayKosh vault management.',
    visibleMetrics: [],
    supportedTools: ['navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'Inspect AI memory', command: 'open my memories' },
      { label: 'Update health profile', command: 'open profile' },
      { label: 'Privacy export', command: 'open privacy' },
    ],
    getContextSummary: (s) => {
      const name = s?.koshProfile?.preferredName || 'Friend';
      return `User is on Settings screen. Profile name: ${name}.`;
    },
  },
  '/(app)/health/pose-check': {
    route: '/(app)/health/pose-check',
    title: 'Coach & Movement Check',
    purpose: 'Real-time camera pose landmarking, repetition counting, form verification, and audio guidance.',
    visibleMetrics: ['reps', 'form_score', 'active_exercise'],
    supportedTools: ['start_routine', 'get_metrics'],
    suggestedChips: [
      { label: 'How is my squat form?', command: 'how do I do squats with good form?' },
      { label: 'Tips for push-ups', command: 'tips for push ups' },
      { label: 'Cooldown stretches', command: 'show cooldown stretches' },
    ],
    getContextSummary: () => 'User is in active Pose & Movement Coach screen.',
  },
  '/(app)/check-in': {
    route: '/(app)/check-in',
    title: 'Daily Check-In',
    purpose: 'Self-reflection on mood, physical energy, sleep quality, and daily intention.',
    visibleMetrics: ['mood', 'energy', 'sleep_rating'],
    supportedTools: ['log_journal_note', 'navigate_to_screen'],
    suggestedChips: [
      { label: 'Feeling overwhelmed today', command: 'feeling low today' },
      { label: 'Work balance tips', command: 'work stress advice' },
      { label: 'Start 3-minute breathwork', command: 'start breathing' },
    ],
    getContextSummary: () => 'User is performing their Daily Reflection Check-In.',
  },
};

/**
 * Resolves capability descriptor for any given Expo Router pathname.
 */
export function resolveScreenCapability(pathname: string): ScreenCapability {
  if (!pathname) return SCREEN_REGISTRY['/(app)/(tabs)'];

  // Exact match
  if (SCREEN_REGISTRY[pathname]) {
    return SCREEN_REGISTRY[pathname];
  }

  // Prefix matching
  for (const [route, cap] of Object.entries(SCREEN_REGISTRY)) {
    if (pathname.startsWith(route)) {
      return cap;
    }
  }

  // Default fallback
  return SCREEN_REGISTRY['/(app)/(tabs)'];
}
