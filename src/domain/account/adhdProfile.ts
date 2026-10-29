/**
 * ADHD & Focus Self-Reflection Screener
 *
 * HIPAA-aligned & 100% on-device, local-first.
 * Adapted from the World Health Organization (WHO) Adult ADHD Self-Report Scale (ASRS-v1.1)
 * Part A Screening tool.
 *
 * Purpose:
 * Personalizes quest pacing, micro-step breakdowns, and calm routine reminders in Thrivefold.
 * It stays encrypted on this phone, is completely skippable, and never diagnoses any medical
 * condition or shares data with cloud analytics or third parties.
 */

export interface AdhdQuestion {
  id: string;
  category: 'organization' | 'inattention' | 'hyperactivity';
  title: string;
  subtext: string;
}

export const ADHD_QUESTIONS: AdhdQuestion[] = [
  {
    id: 'wrap_up',
    category: 'organization',
    title: 'Wrapping up final details',
    subtext: 'How often do you have trouble finishing the final details of a project or task, once the challenging parts are done?',
  },
  {
    id: 'organization',
    category: 'organization',
    title: 'Organizing tasks and steps',
    subtext: 'How often do you find it hard to get things in order when you have to do a task that requires sequence or planning?',
  },
  {
    id: 'remembering',
    category: 'inattention',
    title: 'Remembering appointments & commitments',
    subtext: 'How often do you have problems remembering appointments, routines, or daily commitments?',
  },
  {
    id: 'initiation',
    category: 'inattention',
    title: 'Starting tasks requiring sustained thought',
    subtext: 'When you have a task that requires a lot of mental effort, how often do you avoid, delay, or resist getting started?',
  },
  {
    id: 'restlessness',
    category: 'hyperactivity',
    title: 'Physical fidgeting & restlessness',
    subtext: 'How often do you fidget, tap, or squirm with your hands or feet when you have to sit still for a while?',
  },
  {
    id: 'motor',
    category: 'hyperactivity',
    title: 'High energy & feeling on-the-go',
    subtext: 'How often do you feel overly active or compelled to do things, as if driven by an internal motor?',
  },
];

export const ADHD_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very often' },
] as const;

export interface AdhdEvaluation {
  totalScore: number;
  maxScore: number;
  percentage: number;
  focusStyle: string;
  focusStyleDescription: string;
  strengths: string[];
  recommendedPacing: 'micro' | 'flexible' | 'steady';
  tips: string[];
}

export function evaluateAdhdAnswers(answers: Record<string, number>): AdhdEvaluation {
  const vals = Object.values(answers);
  const totalScore = vals.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  const maxScore = ADHD_QUESTIONS.length * 4;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const org = (answers.wrap_up ?? 0) + (answers.organization ?? 0);
  const inatt = (answers.remembering ?? 0) + (answers.initiation ?? 0);
  const hyper = (answers.restlessness ?? 0) + (answers.motor ?? 0);

  let focusStyle = 'Balanced Flow Pacer';
  let focusStyleDescription = 'You maintain a steady, self-directed rhythm with natural energy cycles.';
  let recommendedPacing: 'micro' | 'flexible' | 'steady' = 'steady';
  const strengths: string[] = ['Consistent follow-through', 'Steady energy distribution'];
  const tips: string[] = [
    'Use 15-20 minute daily routines for sustained momentum.',
    'Keep your quest lists visible at morning check-in.',
  ];

  if (totalScore >= 14 || inatt >= 6) {
    focusStyle = 'Creative Deep Diver';
    focusStyleDescription =
      'You experience intense hyperfocus on inspiring topics, but experience task inertia when starting complex steps.';
    recommendedPacing = 'micro';
    strengths.push('Deep creative immersion', 'Novel problem solving');
    tips.push(
      'Use the 5-minute routine option so starting feels effortless.',
      'Break large goals into one-step micro-actions to lower cognitive friction.',
      'Enable gentle haptic milestone feedback so accomplishments feel immediate.',
    );
  } else if (hyper >= 6) {
    focusStyle = 'Kinetic Thinker';
    focusStyleDescription =
      'Your thoughts move quickly and work best when accompanied by physical motion, walking, or dynamic posture changes.';
    recommendedPacing = 'flexible';
    strengths.push('High spontaneous energy', 'Enthusiastic multitasking');
    tips.push(
      'Combine thinking time with walking check-ins and outdoor outings.',
      'Use 5 to 10 minute workout sessions to reset your focus between tasks.',
    );
  } else if (org >= 6) {
    focusStyle = 'Spontaneous Explorer';
    focusStyleDescription =
      'You love starting exciting new ideas and benefit from visual anchors to close lingering open loops.';
    recommendedPacing = 'flexible';
    strengths.push('Rapid ideation', 'Fresh perspective');
    tips.push(
      'Celebrate wrapping up the final 10% of tasks with quick rewards.',
      'Use quiet badge notifications instead of disruptive alerts.',
    );
  }

  return {
    totalScore,
    maxScore,
    percentage,
    focusStyle,
    focusStyleDescription,
    strengths,
    recommendedPacing,
    tips,
  };
}
