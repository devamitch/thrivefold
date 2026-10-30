/** Everything the app can open, described in plain words for global search (keyword and meaning). */
export interface Destination {
  title: string;
  description: string;
  route: string;
  icon: string;
}

export const DESTINATIONS: Destination[] = [
  { title: 'Daily check-in', description: 'log mood, energy, stress and sleep for today', route: '/(app)/check-in', icon: 'sunny-outline' },
  { title: 'Steps and movement', description: 'steps today, walking, activity sessions, treadmill, swimming, cycling', route: '/(app)/health/activity', icon: 'walk-outline' },
  { title: 'Workouts', description: 'exercise plans, strength training, gym, home workouts, rep counter', route: '/(app)/train', icon: 'barbell-outline' },
  { title: 'Rep counter with camera', description: 'count squats and push-ups, check exercise form with the camera', route: '/(app)/health/pose-check', icon: 'body-outline' },
  { title: 'Meal log', description: 'photograph or log food, calories, macros, nutrition', route: '/(app)/health/meal-log', icon: 'restaurant-outline' },
  { title: 'Nutrition and water', description: 'today’s meals, hydration, water glasses', route: '/(app)/health/nutrition', icon: 'water-outline' },
  { title: 'Sleep', description: 'sleep hours, bedtime routine, rest', route: '/(app)/health/sleep', icon: 'moon-outline' },
  { title: 'Medicines and follow-ups', description: 'medication reminders, pills, doctor appointments', route: '/(app)/health/medications', icon: 'medkit-outline' },
  { title: 'Documents', description: 'scan a prescription, dietitian food chart, trainer workout plan', route: '/(app)/health/documents', icon: 'document-text-outline' },
  { title: 'Journal', description: 'write private notes, reflect, feelings, diary', route: '/(app)/journal', icon: 'book-outline' },
  { title: 'Quests', description: 'daily tasks, goals, points, levels', route: '/(app)/quests', icon: 'trophy-outline' },
  { title: 'Progress and trends', description: 'charts, history, analytics, weekly trends', route: '/(app)/(tabs)/progress', icon: 'stats-chart-outline' },
  { title: 'Calendar', description: 'plans, schedule, routine by date', route: '/(app)/calendar', icon: 'calendar-outline' },
  { title: 'Your profile', description: 'height, weight, food rules, allergies, languages, emergency contacts, address', route: '/(app)/you/profile', icon: 'person-circle-outline' },
  { title: 'Thrive Coach', description: 'talk or type to the assistant, ask questions, voice control', route: '/(app)/beta-lab/assistant', icon: 'chatbubble-ellipses-outline' },
  { title: 'Eye games', description: 'eye exercises, follow the dot, look left right up down, screen-tired eyes', route: '/(app)/beta-lab/eye-games', icon: 'eye-outline' },
  { title: 'Eye studio', description: 'blink rate, screen distance, eye battery, eye strain, 20-20-20', route: '/(app)/beta-lab/eye-tracking', icon: 'scan-outline' },
  { title: 'Face and eye exercises', description: 'face yoga, smile, brows, jaw, relax face', route: '/(app)/beta-lab/face-exercises', icon: 'happy-outline' },
  { title: 'Breathing coach', description: 'calm down, breathe, relax, anxiety, stress relief', route: '/(app)/beta-lab/breathing', icon: 'leaf-outline' },
  { title: 'Voice practice', description: 'speech, voice exercises, pitch, pronunciation, speak clearly', route: '/(app)/beta-lab/voice-practice', icon: 'mic-outline' },
  { title: 'Hand games', description: 'finger count, gestures, hand exercises, dexterity', route: '/(app)/beta-lab/gesture-game', icon: 'hand-left-outline' },
  { title: 'Body and style', description: 'face shape, glasses frames, posture score, outfit colours, BMI, meal plan', route: '/(app)/beta-lab/body-style', icon: 'shirt-outline' },
  { title: 'Focus self-check', description: 'attention, ADHD screener, focus problems', route: '/(app)/you/adhd-screener', icon: 'bulb-outline' },
  { title: "What's around me", description: 'describe objects with the camera, low vision, blind', route: '/(app)/assist/look-around', icon: 'eye-outline' },
  { title: 'Sound alerts', description: 'doorbell, alarm, baby crying, hard of hearing, deaf', route: '/(app)/assist/sound-alerts', icon: 'ear-outline' },
  { title: 'Photo cutout', description: 'remove background, cut out an object from a photo', route: '/(app)/assist/photo-cutout', icon: 'cut-outline' },
  { title: 'Outdoors', description: 'weather, rain, walk outside, official alerts', route: '/(app)/outdoors', icon: 'partly-sunny-outline' },
  { title: 'Plan an outing', description: 'durga puja pandals, parks, heritage walk, sightseeing', route: '/(app)/outing', icon: 'map-outline' },
  { title: 'Trip check-in', description: 'safe trip, share location, going home', route: '/(app)/safety/trip', icon: 'shield-checkmark-outline' },
  { title: 'Urgent support', description: 'crisis, helpline, suicide, emergency 112, Tele-MANAS', route: '/(app)/safety/urgent-support', icon: 'heart-outline' },
  { title: 'On-device AI', description: 'download local language model, llama, offline AI', route: '/(app)/ai/model-status', icon: 'hardware-chip-outline' },
  { title: 'Beta Lab', description: 'all beta features, experiments', route: '/(app)/beta-lab', icon: 'flask-outline' },
  { title: 'Settings', description: 'account, privacy, reminders, preferences', route: '/(app)/(tabs)/settings', icon: 'settings-outline' },
];

/** Keyword score: share of query words found in the title or description (prefix match). */
export function keywordScore(query: string, d: Destination): number {
  const words = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1);
  if (!words.length) return 0;
  const hay = `${d.title} ${d.description}`.toLowerCase();
  const hit = words.filter((w) => hay.includes(w) || hay.split(/\W+/).some((h) => h.startsWith(w))).length;
  return hit / words.length + (d.title.toLowerCase().startsWith(query.toLowerCase().trim()) ? 0.5 : 0);
}

// Finding a place in the app, not how to do something ("how do I do squats" is a coaching question).
const WHERE =
  /\b(?:where|which (?:screen|page|tab))\b|\bhow (?:do|can) i (?:add|log|see|find|open|track|record|set|enter|save|view|change|turn|connect|export|scan)\b/i;
const STOP = new Set(
  'where which screen page tab how do does can to i my me the a an in on of for is are add log see find open track record set put write check enter keep save view show'.split(' '),
);

/**
 * "Where do I add my medicines?" → the screen for it, from the same catalogue global search uses.
 * Null when the question is not about finding a place in the app or nothing matches well.
 */
export function findScreenFor(question: string): Destination | null {
  if (!WHERE.test(question)) return null;
  const topic = question
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !STOP.has(w))
    // "medicines" → "medicine": the catalogue words are mostly singular.
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w))
    .join(' ');
  if (!topic) return null;
  let best: Destination | null = null;
  let bestScore = 0;
  for (const d of DESTINATIONS) {
    const score = keywordScore(topic, d);
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return bestScore >= 0.5 ? best : null;
}
