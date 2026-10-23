import { AiResult } from './types';

export interface ClassificationInput {
  text: string;
  tags?: string[];
}

export type ClassifierSignal = 'fatigue' | 'stress' | 'pain' | 'low_mood' | 'positive';

export interface ClassificationOutput {
  intent: 'wellness_checkin' | 'symptom_inquiry' | 'exercise_adaptation' | 'crisis_signal' | 'general_reflection';
  intensitySuggestion: 'rest' | 'light' | 'regular';
  isCrisisAlert: boolean;
  /** Every signal found, strongest first. Negated mentions ("not tired") are ignored. */
  signals: ClassifierSignal[];
  result: AiResult;
}

/**
 * Crisis phrases are matched without negation handling on purpose: a missed signal costs far
 * more than an unneeded offer of support. This is a filter, not a crisis detector, and the
 * app never claims anyone is watching.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)? myself\b/,
  /\bsuicid(e|al)\b/,
  /\bend (it all|my life)\b/,
  /\b(hurt|harm|cut)(ing)? myself\b/,
  /\bself[- ]?harm\b/,
  /\bwant(ed)? to die\b/,
  /\bwish i (was|were) dead\b/,
  /\bno reason to live\b/,
  /\bbetter off without me\b/,
  /\bcan ?not go on\b/,
  /\bcan'?t go on\b/,
  /\bhopeless\b/,
];

const LEXICON: Record<Exclude<ClassifierSignal, never>, { terms: string[]; weight: number }> = {
  fatigue: {
    terms: ['exhausted', 'tired', 'burned out', 'burnt out', 'no energy', 'drained', 'fatigued', 'insomnia',
      'sleep deprived', 'sleepy', 'worn out', 'wiped out', 'cant sleep', "can't sleep", 'slept badly'],
    weight: 1,
  },
  stress: {
    terms: ['stressed', 'stress', 'anxious', 'anxiety', 'overwhelmed', 'panic', 'deadline', 'pressure',
      'tense', 'on edge', 'frustrated', 'angry', 'worried'],
    weight: 1,
  },
  pain: {
    terms: ['pain', 'cramps', 'cramp', 'ache', 'aching', 'sore', 'injury', 'injured', 'hurts', 'strain',
      'migraine', 'headache', 'stiff'],
    weight: 1.2,
  },
  low_mood: {
    terms: ['sad', 'down', 'lonely', 'empty', 'low', 'crying', 'cried', 'miserable', 'grief', 'heartbroken',
      'numb', 'worthless'],
    weight: 1,
  },
  positive: {
    terms: ['great', 'good', 'energized', 'energised', 'calm', 'happy', 'rested', 'strong', 'motivated',
      'grateful', 'relaxed', 'proud'],
    weight: 0.8,
  },
};

const NEGATORS = new Set(['not', 'no', 'never', 'hardly', 'barely', 'isnt', 'wasnt', 'dont', 'didnt', 'arent', 'without', 'nor']);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

/** True when one of the three words before `index` negates the match. */
function isNegated(words: string[], index: number): boolean {
  for (let i = Math.max(0, index - 3); i < index; i++) {
    if (NEGATORS.has(words[i].replace(/'/g, ''))) return true;
  }
  return false;
}

/** Weighted score per signal, counting only non-negated mentions. */
export function scoreSignals(text: string): Record<ClassifierSignal, number> {
  const normalized = normalize(text);
  const words = normalized.split(/[^a-z0-9']+/).filter(Boolean);
  const scores: Record<ClassifierSignal, number> = { fatigue: 0, stress: 0, pain: 0, low_mood: 0, positive: 0 };

  for (const [signal, { terms, weight }] of Object.entries(LEXICON) as [ClassifierSignal, { terms: string[]; weight: number }][]) {
    for (const term of terms) {
      const termWords = term.split(' ');
      for (let i = 0; i + termWords.length <= words.length; i++) {
        let match = true;
        for (let j = 0; j < termWords.length; j++) {
          if (words[i + j].replace(/'/g, '') !== termWords[j].replace(/'/g, '')) {
            match = false;
            break;
          }
        }
        if (match && !isNegated(words, i)) scores[signal] += weight;
      }
    }
  }
  // "not good" / "not great" reads as low mood rather than nothing.
  if (/\bnot (good|great|ok|okay|happy|well)\b/.test(normalized)) scores.low_mood += 1;
  return scores;
}

/**
 * On-device classifier: weighted keyword lexicon with negation handling. Runs instantly,
 * sends nothing anywhere, and only ever adjusts the intensity of a suggestion.
 */
export function classifyLocalInput(input: ClassificationInput): ClassificationOutput {
  const normalized = normalize(`${input.text} ${(input.tags ?? []).join(' ')}`);

  if (CRISIS_PATTERNS.some((p) => p.test(normalized))) {
    return {
      intent: 'crisis_signal',
      intensitySuggestion: 'rest',
      isCrisisAlert: true,
      signals: ['low_mood'],
      result: {
        text: 'Immediate care alert: We care about your safety. You are not alone. Please reach out to emergency resources or a crisis support lifeline immediately.',
        confidence: 0.99,
        source: 'local_classifier',
        limitationsDisclosed: 'Automated safety signal filter. Thrivefold is not an emergency response provider.',
      },
    };
  }

  const scores = scoreSignals(normalized);
  const signals = (Object.entries(scores) as [ClassifierSignal, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const strain = scores.fatigue + scores.stress + scores.pain + scores.low_mood;

  if (scores.pain > 0 && scores.pain >= scores.fatigue) {
    return {
      intent: 'exercise_adaptation',
      intensitySuggestion: scores.pain >= 2 ? 'rest' : 'light',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Discomfort mentioned. Suggestions are kept gentle and avoid loading the area. If pain is severe or persistent, please see a clinician.',
        confidence: Math.min(0.9, 0.6 + scores.pain * 0.1),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device keyword analysis. Not a diagnosis.',
      },
    };
  }

  if (scores.fatigue > 0 && scores.fatigue >= scores.stress) {
    return {
      intent: 'wellness_checkin',
      intensitySuggestion: 'rest',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Elevated fatigue indicators detected. Recommendation adjusted to gentle breathing and complete physical rest.',
        confidence: Math.min(0.9, 0.6 + scores.fatigue * 0.1),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device rule-based classification.',
      },
    };
  }

  if (scores.stress > 0 || scores.low_mood > 0) {
    return {
      intent: 'wellness_checkin',
      intensitySuggestion: strain >= 2 ? 'rest' : 'light',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Stress or a low mood mentioned. A calmer, shorter routine is suggested today.',
        confidence: Math.min(0.88, 0.6 + strain * 0.08),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device rule-based classification.',
      },
    };
  }

  return {
    intent: 'general_reflection',
    intensitySuggestion: 'regular',
    isCrisisAlert: false,
    signals,
    result: {
      text: 'Local analysis: Balanced wellbeing check-in. Routine matched to standard pacing.',
      confidence: signals.includes('positive') ? 0.8 : 0.6,
      source: 'local_classifier',
      limitationsDisclosed: 'On-device pattern classification.',
    },
  };
}
