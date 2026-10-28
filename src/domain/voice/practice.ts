/**
 * Voice practice measures from the microphone loudness level (−2 … 10, Android speech service)
 * and from speech-to-text. Practice feedback only: these are not clinical voice or speech
 * assessments and do not diagnose anything.
 */

export interface LevelSample {
  level: number;
  at: number; // ms
}

/** Loudness above this counts as voice (the service reports silence below 0). */
export const VOICED = 1;

/**
 * Longest stretch of continuous voice, in ms. Dips shorter than `gapMs` (a breath catch,
 * a noisy sample) do not break the stretch.
 */
export function longestPhonation(samples: LevelSample[], gapMs = 300, threshold = VOICED): number {
  let best = 0;
  let start: number | null = null;
  let lastVoiced = 0;
  for (const s of samples) {
    if (s.level > threshold) {
      if (start === null || s.at - lastVoiced > gapMs) start = s.at;
      lastVoiced = s.at;
      best = Math.max(best, lastVoiced - start);
    }
  }
  return best;
}

/** Share (0–100) of voiced samples that stayed inside the target loudness band. */
export function steadiness(samples: LevelSample[], lo: number, hi: number): number | null {
  const voiced = samples.filter((s) => s.level > VOICED);
  if (voiced.length < 10) return null;
  return Math.round((voiced.filter((s) => s.level >= lo && s.level <= hi).length / voiced.length) * 100);
}

const words = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * How many of the target words were said, in order (longest common subsequence), as a
 * percentage, plus the words that were missed.
 */
export function wordAccuracy(target: string, heard: string): { score: number; missed: string[] } {
  const a = words(target);
  const b = words(heard);
  if (a.length === 0) return { score: 0, missed: [] };
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const missed: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length) {
    if (j < b.length && a[i] === b[j]) {
      i++;
      j++;
    } else if (j < b.length && dp[i][j + 1] >= dp[i + 1][j]) {
      j++;
    } else {
      missed.push(a[i]);
      i++;
    }
  }
  return { score: Math.round((dp[0][0] / a.length) * 100), missed };
}

/** Words per minute from a transcript and the time spent speaking. */
export function wordsPerMinute(heard: string, ms: number): number | null {
  if (ms < 2000) return null;
  return Math.round((words(heard).length / ms) * 60_000);
}

export const PHRASES = [
  'She sells sea shells by the sea shore',
  'Red lorry yellow lorry',
  'A big black bug bit a big black bear',
  'Thank you for coming today, it means a lot to me',
  'Could I have a cup of tea with a little milk please',
  'Good morning, my name is and I live nearby',
  'The quick brown fox jumps over the lazy dog',
  'Peter Piper picked a peck of pickled peppers',
];
