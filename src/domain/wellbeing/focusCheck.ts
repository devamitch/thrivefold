/**
 * Focus & attention self-check: the six-question WHO Adult ADHD Self-Report Scale screener
 * (ASRS-v1.1 Part A). A screener, not a diagnosis: four or more answers in the shaded range mean
 * the pattern is common in adult ADHD and worth discussing with a qualified professional.
 */

export const FREQUENCIES = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'] as const;
export type Frequency = 0 | 1 | 2 | 3 | 4;

export const ITEMS = [
  'How often do you have trouble wrapping up the final details of a project, once the challenging parts are done?',
  'How often do you have difficulty getting things in order when you have to do a task that requires organisation?',
  'How often do you have problems remembering appointments or obligations?',
  'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
  'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
  'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
];

/** Items 1–3 count from "Sometimes"; items 4–6 from "Often" (the ASRS shaded boxes). */
const THRESHOLD = [2, 2, 2, 3, 3, 3];

export function scoreFocusCheck(answers: (Frequency | null)[]): { answered: number; inRange: number; flagged: boolean } | null {
  if (answers.length !== ITEMS.length || answers.some((a) => a === null)) return null;
  const inRange = answers.filter((a, i) => (a as number) >= THRESHOLD[i]).length;
  return { answered: answers.length, inRange, flagged: inRange >= 4 };
}
