/**
 * Smart recommendations — AI-powered micro-tasks for a better app experience.
 *
 * Each function does one small thing: understand the user's check-in pattern,
 * suggest today's exercise, summarize the week, etc. They use the cascade
 * provider so they work even if one key is down.
 *
 * Rules from AGENTS.md:
 * - Never infer sensitive traits (religion, orientation, diagnoses)
 * - Never suggest medication doses
 * - Never claim to be a medical device
 */

import { quickAsk } from './providers';

const SYSTEM = `You are Thrive, a gentle wellbeing companion inside the Thrivefold app.
You are NOT a doctor, therapist or medical device. Never diagnose, prescribe or dose medication.
Never infer religion, orientation, ethnicity, caste or diagnoses from data.
Keep replies under 120 words, warm but not patronising. Use plain language.`;

/** Generate a short, encouraging daily greeting based on check-in data. */
export async function dailyGreeting(opts: {
  name?: string;
  mood?: number;
  energy?: number;
  streak?: number;
  phase?: string;
}): Promise<string> {
  const prompt = [
    `Greet ${opts.name || 'the user'} warmly for today.`,
    opts.mood != null ? `Their mood is ${opts.mood}/10.` : '',
    opts.energy != null ? `Energy is ${opts.energy}/10.` : '',
    opts.streak ? `They have a ${opts.streak}-day check-in streak.` : '',
    opts.phase ? `Cycle phase: ${opts.phase}.` : '',
    'One or two sentences. No medical advice.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Suggest today's exercise based on user's state. */
export async function suggestExercise(opts: {
  energy?: number;
  mood?: number;
  phase?: string;
  recentWorkouts?: string[];
  preferences?: string[];
}): Promise<string> {
  const prompt = [
    'Suggest ONE exercise for today in 2-3 sentences.',
    opts.energy != null ? `Energy: ${opts.energy}/10.` : '',
    opts.mood != null ? `Mood: ${opts.mood}/10.` : '',
    opts.phase ? `Cycle phase: ${opts.phase}.` : '',
    opts.recentWorkouts?.length ? `Recent: ${opts.recentWorkouts.join(', ')}.` : '',
    opts.preferences?.length ? `They like: ${opts.preferences.join(', ')}.` : '',
    'Pick from: yoga, bodyweight, walking, stretching, kalaripayattu, martial arts, breathing.',
    'Never suggest anything painful or beyond their energy level.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Summarize the week's health data into a brief insight. */
export async function weeklyInsight(opts: {
  avgMood?: number;
  avgEnergy?: number;
  checkInsCount?: number;
  workoutsCount?: number;
  topSymptoms?: string[];
}): Promise<string> {
  const prompt = [
    'Summarize this week in 3-4 sentences. Be encouraging.',
    opts.avgMood != null ? `Average mood: ${opts.avgMood.toFixed(1)}/10.` : '',
    opts.avgEnergy != null ? `Average energy: ${opts.avgEnergy.toFixed(1)}/10.` : '',
    opts.checkInsCount != null ? `${opts.checkInsCount} check-ins this week.` : '',
    opts.workoutsCount != null ? `${opts.workoutsCount} workouts.` : '',
    opts.topSymptoms?.length ? `Common symptoms: ${opts.topSymptoms.join(', ')}.` : '',
    'No medical interpretation. Just patterns and encouragement.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Generate a brief journal prompt based on mood/energy. */
export async function journalPrompt(opts: {
  mood?: number;
  energy?: number;
  time?: 'morning' | 'afternoon' | 'evening';
}): Promise<string> {
  const prompt = [
    'Generate a single reflective journal prompt (one question).',
    opts.mood != null ? `Mood: ${opts.mood}/10.` : '',
    opts.energy != null ? `Energy: ${opts.energy}/10.` : '',
    opts.time ? `Time: ${opts.time}.` : '',
    'Keep it open-ended, gentle, and non-judgmental.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}
