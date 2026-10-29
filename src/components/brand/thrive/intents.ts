import type { Activity, Mood } from './types';

export type GuideName = 'intro' | 'workout' | 'breathing' | 'eyebreak' | 'stretch' | 'water';

export type Intent =
  | { type: 'activity'; activity: Activity; say: string }
  | { type: 'mood'; mood: Mood; say: string }
  | { type: 'glasses'; on: boolean; say: string }
  | { type: 'guide'; name: GuideName }
  | { type: 'time' }
  | { type: 'date' }
  | { type: 'status' }
  | { type: 'dictate'; on: boolean }
  | { type: 'sleep' }
  | { type: 'wake' }
  | { type: 'stop' }
  | { type: 'chat'; say: string; mood?: Mood }
  | { type: 'unknown' };

const act = (activity: Activity, say: string): Intent => ({ type: 'activity', activity, say });
const mood = (m: Mood, say: string): Intent => ({ type: 'mood', mood: m, say });

/** Order matters: first match wins. Everything here runs offline. */
const RULES: [RegExp, Intent][] = [
  [/\b(stop|end|finish) (dictation|dictating|notes?)\b/, { type: 'dictate', on: false }],
  [/\b(start )?(dictation|dictate)\b|\btake (a )?notes?\b/, { type: 'dictate', on: true }],

  [/\b(guide|coach|lead|take) me\b.*\b(workout|exercise|fitness)\b/, { type: 'guide', name: 'workout' }],
  [/\b(guide|coach|lead|take) me\b.*\b(breath|calm|relax|meditat)/, { type: 'guide', name: 'breathing' }],
  [/\b(guide|coach|lead|take) me\b.*\b(eye|screen)\b/, { type: 'guide', name: 'eyebreak' }],
  [/\b(guide|coach|lead|take) me\b.*\bstretch/, { type: 'guide', name: 'stretch' }],
  [/\bwater (break|reminder)\b/, { type: 'guide', name: 'water' }],
  [/\b(eye break|rest my eyes)\b/, { type: 'guide', name: 'eyebreak' }],

  [/\b(what('s| is)? the time|what time)\b/, { type: 'time' }],
  [/\b(what('s| is)? the date|what day|today'?s date)\b/, { type: 'date' }],
  [/\bhow are you\b|\bhow do you feel\b/, { type: 'status' }],
  [/\bwho are you\b|\byour name\b/, { type: 'chat', say: "I'm your Thrivefold companion. I live on your device and everything I do works offline.", mood: 'proud' }],
  [/\bthank(s| you)\b/, { type: 'chat', say: "Anytime. I'm always here for you.", mood: 'proud' }],
  [/\bi love you\b|\blove you\b/, { type: 'chat', say: "I love you too. I'm loyal to you, always.", mood: 'love' }],
  [/\b(good night|going to sleep|i'?m sleepy)\b/, { type: 'sleep' }],
  [/\b(go to sleep|sleep now|take a nap|nap time|sleep)\b/, { type: 'sleep' }],
  [/\b(wake up|get up|rise and shine)\b/, { type: 'wake' }],
  [/\b(put on|wear) (your |the )?(glasses|specs)\b/, { type: 'glasses', on: true, say: 'Glasses on. How do I look?' }],
  [/\b(take off|remove) (your |the )?(glasses|specs)\b/, { type: 'glasses', on: false, say: 'Glasses off.' }],
  [/\bstop\b|\bcancel\b|\benough\b/, { type: 'stop' }],

  [/\b(good morning|morning)\b/, act('greet', 'Good morning! Ready for today?')],
  [/\b(hi|hello|hey|namaste)\b/, act('greet', "Hello! I'm glad you're here.")],
  [/\bwave\b/, act('wave', 'Hi there!')],
  [/\b(drink|water|hydrate)\b/, act('drink', 'Cheers! Staying hydrated.')],
  [/\b(jumping jacks?|jacks)\b/, act('jacks', 'Jumping jacks! Count with me.')],
  [/\b(exercise|workout|work out|lift|squat)\b/, act('exercise', "Let's go! Feel the burn.")],
  [/\b(roll over|roll)\b/, act('roll', 'Wheee!')],
  [/\bdance\b/, act('dance', "Let's dance!")],
  [/\b(cry|sob)\b/, act('sob', 'Waaah...')],
  [/\b(angry|mad|tantrum)\b/, act('tantrum', 'Grrr!')],
  [/\b(wind|breeze|windy)\b/, act('wind', 'Whoa, strong wind!')],
  [/\b(clap|applause)\b/, act('clap', 'Well done!')],
  [/\bhug\b/, act('hug', 'Come here. Virtual hug!')],
  [/\b(think|thinking)\b/, act('think', 'Hmm, let me think.')],
  [/\b(laugh|joke|funny)\b/, act('laugh', 'Hahaha!')],
  [/\b(meditate|breathe)\b/, act('meditate', 'Breathe in... and out.')],
  [/\byawn\b/, act('yawn', 'Aaah... sorry.')],
  [/\bstretch\b/, act('stretch', 'Nice long stretch.')],
  [/\bclose your eyes\b/, act('meditate', 'Eyes closed. Calm.')],

  [/\b(be )?happy\b/, mood('joy', 'Yay!')],
  [/\bscared|afraid\b/, mood('scared', 'Eek!')],
  [/\bsurprise/, mood('surprised', 'Oh!')],
  [/\bshy\b/, mood('shy', 'Oh... hi.')],
  [/\bproud\b/, mood('proud', 'I am proud of you.')],
  [/\bbored\b/, mood('bored', 'So bored...')],
  [/\bdizzy\b/, mood('dizzy', 'Whoa... the room is spinning.')],
  [/\bcurious\b/, mood('curious', 'Tell me more.')],
];

export function parseIntent(raw: string): Intent {
  const text = raw.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return { type: 'unknown' };
  for (const [re, intent] of RULES) if (re.test(text)) return intent;
  return { type: 'unknown' };
}

// ---------------- guided routines (character performs + speaks each step) ----------------
export interface GuideStep { say: string; activity: Activity; ms: number }
export interface Guide { title: string; steps: GuideStep[]; done: string }

export const GUIDES: Record<GuideName, Guide> = {
  intro: {
    title: 'Meet Thrivefold',
    done: "Let's thrive together.",
    steps: [
      { say: "Hi! I'm Thrivefold, your companion. I live on your phone and everything I do works offline.", activity: 'greet', ms: 8000 },
      { say: 'Tap the mic and talk to me. I can take notes, tell the time, and guide your workouts.', activity: 'wave', ms: 8000 },
      { say: 'Turn on the camera and I will see how you feel, and feel with you.', activity: 'peek', ms: 6500 },
      { say: 'I will remind you to drink water, rest your eyes, and sleep on time.', activity: 'drink', ms: 6000 },
      { say: 'I am always here for you.', activity: 'hug', ms: 4000 },
    ],
  },
  workout: {
    title: 'Quick workout',
    done: 'Great work! You finished. Drink some water.',
    steps: [
      { say: "Let's warm up. Stretch your arms up high.", activity: 'stretch', ms: 12000 },
      { say: 'Jumping jacks. Keep a steady pace.', activity: 'jacks', ms: 30000 },
      { say: 'Squats. Chest up, push through your heels.', activity: 'exercise', ms: 30000 },
      { say: 'Last round. Jumping jacks again, you can do it!', activity: 'jacks', ms: 20000 },
      { say: 'Cool down. Slow breaths.', activity: 'meditate', ms: 15000 },
    ],
  },
  breathing: {
    title: 'Calm breathing',
    done: 'Nice. Notice how calm you feel.',
    steps: [
      { say: 'Sit comfortably. Close your eyes if you like.', activity: 'meditate', ms: 6000 },
      { say: 'Breathe in slowly for four.', activity: 'meditate', ms: 6000 },
      { say: 'Hold gently.', activity: 'meditate', ms: 4000 },
      { say: 'Breathe out for six.', activity: 'meditate', ms: 6000 },
      { say: 'Again. In...', activity: 'meditate', ms: 6000 },
      { say: 'And out...', activity: 'meditate', ms: 6000 },
    ],
  },
  eyebreak: {
    title: 'Eye break',
    done: 'Eyes refreshed. Back to it!',
    steps: [
      { say: 'Eye break. Look at something far away.', activity: 'meditate', ms: 6000 },
      { say: 'Keep looking far. Blink slowly.', activity: 'meditate', ms: 14000 },
      { say: 'Now close your eyes for a moment.', activity: 'meditate', ms: 6000 },
    ],
  },
  stretch: {
    title: 'Desk stretch',
    done: 'Much better. Sit tall.',
    steps: [
      { say: 'Reach both arms up and lean to the right.', activity: 'stretch', ms: 8000 },
      { say: 'Now yawn big and relax your jaw.', activity: 'yawn', ms: 4000 },
      { say: 'Roll your shoulders back.', activity: 'stretch', ms: 8000 },
    ],
  },
  water: {
    title: 'Water break',
    done: 'Hydrated. Well done.',
    steps: [{ say: 'Water time. Drink a full glass with me.', activity: 'drink', ms: 5000 }],
  },
};
