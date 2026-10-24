/**
 * Setup rewards and capability-aware task fit.
 *
 * The v3 catalog's first stage ("orientation", levels 1-5) is about setting goals and
 * preferences, so finishing each setup step earns XP and moves the person through those
 * levels on day one. The reward is fixed per step and never depends on what was answered:
 * "prefer not to say" earns the same as any answer, because the catalog forbids rewarding
 * disclosure of health or sensitive information. What the answers do change is task fit:
 * how long, how hard and which kinds of quests are offered (see `fitFor`).
 */
import type { QuestFamily } from './progression';

// ---------------------------------------------------------------- baseline answers

export type ActivityLevel = 'rarely' | 'some_days' | 'most_days' | 'daily_training' | 'prefer_not';
export type EnergyLevel = 'low' | 'okay' | 'good' | 'prefer_not';
export type SleepQuality = 'poor' | 'mixed' | 'good' | 'prefer_not';
export type StressLevel = 'high' | 'some' | 'calm' | 'prefer_not';

export interface Baseline {
  activity: ActivityLevel | null;
  energy: EnergyLevel | null;
  sleep: SleepQuality | null;
  stress: StressLevel | null;
}

export const EMPTY_BASELINE: Baseline = { activity: null, energy: null, sleep: null, stress: null };

// ---------------------------------------------------------------- setup rewards

export type SetupSection =
  | 'experience'
  | 'privacy'
  | 'goals'
  | 'body_baseline'
  | 'mind_baseline'
  | 'constraints'
  | 'lifestyle';

export interface SetupReward {
  section: SetupSection;
  title: string;
  xp: number;
}

/** Fixed per step; the server keeps the same table (tf_claim_setup_reward). 165 XP reaches level 5. */
export const SETUP_REWARDS: SetupReward[] = [
  { section: 'experience', title: 'Chose your focus', xp: 20 },
  { section: 'privacy', title: 'Set your privacy terms', xp: 20 },
  { section: 'goals', title: 'Named what you want help with', xp: 25 },
  { section: 'body_baseline', title: 'Checked in with your body', xp: 25 },
  { section: 'mind_baseline', title: 'Checked in with your mind', xp: 25 },
  { section: 'constraints', title: 'Set your pace and limits', xp: 30 },
  { section: 'lifestyle', title: 'Shared food and reminder choices', xp: 20 },
];

export const setupReward = (section: SetupSection) => SETUP_REWARDS.find((r) => r.section === section)!;
export const setupLedgerKey = (section: SetupSection) => `setup:${section}`;
export const SETUP_XP_TOTAL = SETUP_REWARDS.reduce((sum, r) => sum + r.xp, 0);

export interface SetupAnswers {
  goals: string[];
  constraints: string[];
  routineMinutes: number | null;
  diet: string | null;
  observances: string[];
  baseline: Baseline;
}

/**
 * True when a step has really been answered. "Prefer not to say" is an answer; leaving a
 * step blank (Skip) is not, so skipping earns nothing and can be done later from You.
 */
export function isSetupSectionAnswered(section: SetupSection, a: SetupAnswers): boolean {
  switch (section) {
    case 'experience':
    case 'privacy':
      return true; // both steps require a choice before Continue is enabled
    case 'goals':
      return a.goals.length > 0;
    case 'body_baseline':
      return a.baseline.activity !== null && a.baseline.energy !== null;
    case 'mind_baseline':
      return a.baseline.sleep !== null && a.baseline.stress !== null;
    case 'constraints':
      return a.routineMinutes !== null;
    case 'lifestyle':
      return a.diet !== null || a.observances.length > 0;
  }
}

// ---------------------------------------------------------------- task fit

export type Capacity = 'gentle' | 'steady' | 'strong';

export interface TaskFit {
  capacity: Capacity;
  /** Longest quest to offer, in minutes; null when no length was chosen. */
  maxMinutes: number | null;
  /** Families the person's own answers point to, after their chosen goals. */
  families: QuestFamily[];
  /** Plain reasons shown to the person so the adjustment is never a black box. */
  reasons: string[];
}

const EASY_CONSTRAINTS = new Set(['Recovering / low energy', 'Low impact only']);

/** A routine length leaves room for quests a little longer than the routine itself. */
const MINUTES_CAP: Record<number, number> = { 5: 8, 10: 12, 20: 20 };

export function fitFor(a: Pick<SetupAnswers, 'constraints' | 'routineMinutes' | 'baseline'>): TaskFit {
  const { activity, energy, sleep, stress } = a.baseline;
  const reasons: string[] = [];
  let capacity: Capacity = 'steady';
  const easyLimit = a.constraints.some((c) => EASY_CONSTRAINTS.has(c));
  if (activity === 'rarely' || energy === 'low' || easyLimit) {
    capacity = 'gentle';
    reasons.push(
      easyLimit
        ? 'You asked us to keep things easy, so quests start at starter level.'
        : activity === 'rarely'
          ? 'You move on few days right now, so quests start small and build up.'
          : 'Your energy is low, so quests start small.',
    );
  } else if ((activity === 'most_days' || activity === 'daily_training') && a.constraints.length === 0) {
    capacity = 'strong';
    reasons.push('You are active most days, so steadier quests come first.');
  }

  const maxMinutes = a.routineMinutes ? (MINUTES_CAP[a.routineMinutes] ?? a.routineMinutes) : null;
  if (maxMinutes) reasons.push(`Quests stay within about ${maxMinutes} minutes.`);

  const families: QuestFamily[] = [];
  if (stress === 'high') {
    families.push('mind');
    reasons.push('Stress is high, so a calming quest is included each day.');
  }
  if (sleep === 'poor' || energy === 'low') {
    families.push('rhythm');
    reasons.push('Sleep and energy routines are included each day.');
  }
  if (activity === 'rarely' || activity === 'some_days') families.push('movement');
  if (a.constraints.length > 0) reasons.push(`Going easy on: ${a.constraints.join(', ').toLowerCase()}.`);

  return { capacity, maxMinutes, families: [...new Set(families)], reasons };
}
