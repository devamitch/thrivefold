/**
 * The coach's command understanding: plain rules, no model needed, so it works offline on every
 * phone. Anything it does not recognise is handed to the on-device language model (when one is
 * loaded) as a general question.
 */

export type Command =
  | { kind: 'open'; route: string; label: string }
  | { kind: 'log_water'; glasses: number }
  | { kind: 'ask'; metric: 'steps' | 'water' | 'quests' | 'calories' | 'weather' }
  | { kind: 'crisis' }
  | { kind: 'unknown'; text: string };

const OPEN: { words: RegExp; route: string; label: string }[] = [
  { words: /\bbreath(e|ing)?\b|\bcalm\b|\brelax\b/, route: '/(app)/beta-lab/breathing', label: 'the breathing coach' },
  { words: /\bface\b(?! shape)|\bjaw\b|\bsmile\b|\bbrow/, route: '/(app)/beta-lab/face-exercises', label: 'face exercises' },
  { words: /\bglasses\b|\bframes?\b|\bstyle\b|\boutfit\b|\bdress\b|\bbmi\b|\bbody shape\b|\bface shape\b|\bmeal plan/, route: '/(app)/beta-lab/body-style', label: 'the body and style companion' },
  { words: /\bpursuit\b|\bfollow the dot\b|\bdot\b/, route: '/(app)/beta-lab/eye-pursuit', label: 'eye pursuit' },
  { words: /\bvoice\b|\bspeech\b|\bspeak(ing)?\b|\bpronunciation\b|\bvocal\b/, route: '/(app)/beta-lab/voice-practice', label: 'voice practice' },
  { words: /\beye\b|\beyes\b|\bblink/, route: '/(app)/beta-lab/eye-tracking', label: 'the eye studio' },
  { words: /\bfinger|\bhand\b|\bhands\b|\bgrip\b|\bgame\b/, route: '/(app)/beta-lab/gesture-game', label: 'the finger game' },
  { words: /\bpose\b|\bposture\b|\bsquat|\bform\b/, route: '/(app)/beta-lab/pose-coach', label: 'the pose coach' },
  { words: /\bmeal\b|\bfood\b|\bate\b|\beat\b|\blunch\b|\bdinner\b|\bbreakfast\b/, route: '/(app)/health/meal-log', label: 'the meal log' },
  { words: /\bcheck[- ]?in\b|\bmood\b|\bhow i feel\b/, route: '/(app)/check-in', label: 'your check-in' },
  { words: /\bsleep\b/, route: '/(app)/health/sleep', label: 'sleep' },
  { words: /\bworkout|\bexercise|\btrain/, route: '/(app)/train', label: 'workouts' },
  { words: /\btreadmill|\bwalking pad|\bswim|\bcycl|\bride\b|\brun\b|\bactivity\b/, route: '/(app)/health/activity', label: 'activity sessions' },
  { words: /\bquest/, route: '/(app)/quests', label: 'quests' },
  { words: /\bprogress\b|\btrend|\bhistory\b/, route: '/(app)/(tabs)/progress', label: 'progress' },
  { words: /\bjournal\b|\bwrite\b/, route: '/(app)/journal/new', label: 'a new journal entry' },
  { words: /\bsettings?\b/, route: '/(app)/(tabs)/settings', label: 'settings' },
];

const NUMBER_WORDS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

export function parseCommand(input: string): Command {
  const text = input.toLowerCase().replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return { kind: 'unknown', text: '' };
  // Anyone who mentions wanting to die or hurt themselves gets support first, before anything else.
  if (/\b(suicid\w*|kill (my ?self|me)|end (my|it all)|want to die|don'?t want to (live|be here)|self[- ]?harm|hurt(ing)? my ?self|no reason to live)\b/.test(text)) {
    return { kind: 'crisis' };
  }

  const water = text.match(/\b(?:log|add|drank|had)\b.*?\b(\d+|a|an|one|two|three|four|five|six)\b\s*(?:glass|glasses|cup|cups)\b/);
  if (water || /\b(?:log|add)\b.*\bwater\b/.test(text)) {
    const raw = water?.[1] ?? '1';
    const n = NUMBER_WORDS[raw] ?? Number.parseInt(raw, 10);
    return { kind: 'log_water', glasses: Math.max(1, Math.min(6, Number.isFinite(n) ? n : 1)) };
  }

  const asking = /^(how|what|did|have|am|do|will|is|should|can|whats|when)\b|\?$|\b(how many|how much|tell me)\b/.test(text);
  if (asking) {
    if (/\bweather\b|\brain\b|\bhot\b|\bwalk outside\b|\bgo out\b|\bumbrella\b/.test(text)) return { kind: 'ask', metric: 'weather' };
    if (/\bsteps?\b|\bwalked\b/.test(text)) return { kind: 'ask', metric: 'steps' };
    if (/\bwater\b|\bdrink|\bhydrat/.test(text)) return { kind: 'ask', metric: 'water' };
    if (/\bcalor|\bburn/.test(text)) return { kind: 'ask', metric: 'calories' };
    if (/\bquests?\b|\btasks?\b|\bleft\b/.test(text)) return { kind: 'ask', metric: 'quests' };
  }

  // Style and body questions ("which glasses suit me?") are best answered by the companion screen.
  const style = OPEN.find((o) => o.route.endsWith('/body-style'));
  if (style && style.words.test(text)) return { kind: 'open', route: style.route, label: style.label };

  if (/\b(open|start|go to|show|take me|begin|let's|lets|i want)\b/.test(text) || text.split(' ').length <= 3) {
    for (const o of OPEN) if (o.words.test(text)) return { kind: 'open', route: o.route, label: o.label };
  }
  return { kind: 'unknown', text: input.trim() };
}
