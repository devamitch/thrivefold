/**
 * What the coach can do from the chat beyond answering: show records as a table, walk the person to
 * the right screen for a job (scan a prescription, photograph a meal), and ask before anything that
 * cannot be undone (sign out, delete a medicine, clear the chat). Pure: parsing and table building
 * read only the text and the store snapshot.
 */
import { itemFood, type MealItem } from '../nutrition/foods';
import { DESTINATIONS } from '../search/destinations';
import { parseRoutineRequest, routineTimes, type Routine } from '../routines';

export interface ChatTable {
  title: string;
  columns: string[];
  rows: string[][];
  /** Where to manage these records. */
  route?: string;
}

export type ChatAction =
  | { kind: 'show'; what: 'meds' | 'followups' | 'today' | 'meals' | 'plans' | 'screens' | 'week' | 'routines' | 'gems' }
  | { kind: 'routine_add'; routine: Omit<Routine, 'id' | 'enabled'> }
  | { kind: 'guide'; job: 'prescription' | 'meal_photo' | 'medicine_add' | 'rep_count' }
  | { kind: 'reminders'; on: boolean }
  | { kind: 'sign_out' }
  | { kind: 'close' }
  | { kind: 'clear_chat' }
  | { kind: 'delete_med'; name: string }
  | { kind: 'took_med'; name: string };

export function parseChatAction(input: string): ChatAction | null {
  const t = input.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return null;

  if (/^(?:please )?(?:log ?out|sign ?out|log me out|sign me out)\b/.test(t)) return { kind: 'sign_out' };
  const routine = parseRoutineRequest(input);
  if (routine) return { kind: 'routine_add', routine };
  if (/^(?:quit|exit|close|bye bye|close (?:this|the chat|chat|coach))$/.test(t)) return { kind: 'close' };
  if (/\b(?:clear|delete|erase|wipe)\b.*\b(?:chat|conversation|history|messages)\b/.test(t)) return { kind: 'clear_chat' };

  const del = t.match(/\b(?:delete|remove|stop tracking)\b (?:my |the )?(?:medicine |medication |tablet |pill )?(.+?)(?: medicine| tablet| pill)?$/);
  if (del && /\b(?:medicine|medication|tablet|pill)\b/.test(t)) return { kind: 'delete_med', name: del[1].trim() };
  const took = t.match(/\bi (?:took|have taken|had) (?:my )?(.+?)(?: medicine| tablet| pill| dose)?$/);
  if (took && !/\b(?:water|walk|bath|break|nap|shower)\b/.test(took[1])) return { kind: 'took_med', name: took[1].trim() };

  if (/\b(?:turn|switch|put)\b.*\b(on|off)\b.*\b(?:medicine|medication|pill)? ?remind/.test(t) || /\bremind(?:ers?)?\b.*\b(on|off)\b/.test(t)) {
    return { kind: 'reminders', on: /\bon\b/.test(t) && !/\boff\b/.test(t) };
  }

  if (/\b(?:i have|i got|got|scan|upload|log|add|read)\b.*\bprescriptions?\b|\bprescriptions?\b.*\b(?:log|add|scan|understand|read)\b/.test(t))
    return { kind: 'guide', job: 'prescription' };
  if (/\b(?:photo|picture|camera|snap)\b.*\b(?:meal|food|plate|lunch|dinner|breakfast)\b|\b(?:meal|food)\b.*\b(?:photo|camera)\b/.test(t))
    return { kind: 'guide', job: 'meal_photo' };
  if (/\b(?:count|track)\b.*\b(?:reps?|squats?|push ?ups?)\b/.test(t)) return { kind: 'guide', job: 'rep_count' };
  if (/\b(?:add|new)\b.*\b(?:medicine|medication|pill|tablet)\b/.test(t)) return { kind: 'guide', job: 'medicine_add' };

  // "Show my medicines" lists records; "what is the medicine called X" is a question for the coach.
  const aboutTheirs = /\b(?:my|all|our|today'?s?)\b/.test(t) || /^(?:meds|medicines|appointments|plans)$/.test(t);
  const isQuestionAbout = /\b(?:called|named|what is|what's|side effects?|used for|how does|should i)\b/.test(t);
  if (aboutTheirs && !isQuestionAbout) {
    if (/\b(?:meds?|medicines?|medications?|pills?|tablets?|prescriptions?)\b/.test(t)) return { kind: 'show', what: 'meds' };
    if (/\b(?:appointments?|follow ?ups?|doctor visits?|check ?ups?)\b/.test(t)) return { kind: 'show', what: 'followups' };
    if (/\b(?:diet|food|meal|workout) (?:chart|plans?)\b|\bcare plans?\b/.test(t)) return { kind: 'show', what: 'plans' };
    if (/\b(?:what did i eat|meals?|food log)\b/.test(t)) return { kind: 'show', what: 'meals' };
    if (/\b(?:this week|last week|my week|last 7 days)\b/.test(t)) return { kind: 'show', what: 'week' };
    if (/\b(?:today'?s? (?:tasks|plan|quests)|my (?:tasks|quests|plan) (?:for )?today|to ?do)\b/.test(t)) return { kind: 'show', what: 'today' };
    if (/\b(?:screens?|features?|routes?|what can you do|everything you can)\b/.test(t)) return { kind: 'show', what: 'screens' };
    if (/\b(?:routines?|reminders)\b/.test(t)) return { kind: 'show', what: 'routines' };
    if (/\b(?:gems?|diamonds?|rewards?|points)\b/.test(t)) return { kind: 'show', what: 'gems' };
  }
  if (/\bwhat can you do\b/.test(t)) return { kind: 'show', what: 'screens' };
  return null;
}

/** The slice of the store the tables read. */
export interface TableInput {
  medications: { id: string; name: string; dose: string; time: string }[];
  medicationTaken: string[];
  medicationRemindersOn: boolean;
  followUps: { date: string; time: string | null; with: string; note: string | null }[];
  todayQuests: { title: string; isCompleted: boolean; status: string; xpReward: number }[];
  mealLogs: { date: string; at: string; type: string; items: MealItem[]; note?: string }[];
  carePlans: { kind: string; by: string | null; savedAt: string }[];
  checkInHistory: { date: string; mood: number; energy: number; sleepHours: number }[];
  hydration: Record<string, number>;
  routines?: Routine[];
  diamonds?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function buildTable(what: Extract<ChatAction, { kind: 'show' }>['what'], s: TableInput, now: Date): ChatTable {
  const today = dayKey(now);
  switch (what) {
    case 'meds':
      return {
        title: `Your medicines${s.medicationRemindersOn ? ' · reminders on' : ''}`,
        columns: ['Medicine', 'Dose', 'Time', 'Today'],
        rows: [...s.medications]
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((m) => [m.name, m.dose || '—', m.time, s.medicationTaken.includes(`${today}|${m.id}`) ? 'Taken' : 'Not yet']),
        route: '/(app)/health/medications',
      };
    case 'followups':
      return {
        title: 'Doctor follow-ups',
        columns: ['Date', 'Time', 'With', 'Note'],
        rows: s.followUps
          .filter((f) => f.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((f) => [f.date, f.time ?? '—', f.with, f.note ?? '']),
        route: '/(app)/health/medications',
      };
    case 'today':
      return {
        title: "Today's quests",
        columns: ['Quest', 'Points', 'Status'],
        rows: s.todayQuests.map((q) => [q.title, String(q.xpReward), q.isCompleted ? 'Done' : q.status === 'skipped' ? 'Skipped' : 'Open']),
        route: '/(app)/quests',
      };
    case 'meals':
      return {
        title: 'Meals today',
        columns: ['Time', 'Meal', 'Items'],
        rows: s.mealLogs
          .filter((m) => m.date === today)
          .map((m) => [m.at.slice(11, 16) || m.at, m.type, m.items.map((i) => itemFood(i)?.name ?? i.foodId).join(', ') || m.note || '—']),
        route: '/(app)/health/nutrition',
      };
    case 'plans':
      return {
        title: 'Saved care plans',
        columns: ['Plan', 'From', 'Saved'],
        rows: s.carePlans.map((p) => [p.kind === 'diet_chart' ? 'Diet chart' : 'Workout plan', p.by ?? '—', p.savedAt.slice(0, 10)]),
        route: '/(app)/health/documents',
      };
    case 'week': {
      const rows: string[][] = [];
      for (let i = 0; i < 7; i++) {
        const d = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
        const c = s.checkInHistory.find((x) => x.date === d);
        const w = s.hydration[d];
        if (c || w) rows.push([d.slice(5), c ? `${c.mood}/10` : '—', c ? `${c.energy}/10` : '—', c ? `${c.sleepHours} h` : '—', w ? String(w) : '—']);
      }
      return { title: 'Your last 7 days', columns: ['Day', 'Mood', 'Energy', 'Sleep', 'Water'], rows, route: '/(app)/(tabs)/progress' };
    }
    case 'routines':
      return {
        title: 'Your routines',
        columns: ['Routine', 'When', 'On'],
        rows: (s.routines ?? []).map((r) => [r.title, routineTimes(r).join(', '), r.enabled ? 'Yes' : 'Off']),
        route: '/(app)/routines',
      };
    case 'gems':
      return {
        title: `You have ${s.diamonds ?? 0} gems`,
        columns: ['Reward', 'Gems'],
        rows: [
          ['Sticker', '100'],
          ['Sanctuary status', '500'],
          ['Real workout gear (limited)', '10,000'],
        ],
        route: '/(app)/marketplace',
      };
    case 'screens':
      return {
        title: 'What I can open for you',
        columns: ['Screen', 'For'],
        rows: DESTINATIONS.map((d) => [d.title, d.description]),
      };
  }
}

/** Step-by-step help for a job, and the screen that does it. */
export const GUIDES: Record<Extract<ChatAction, { kind: 'guide' }>['job'], { route: string; steps: string }> = {
  prescription: {
    route: '/(app)/health/documents',
    steps:
      'Let us log it together. 1. I am opening Documents. 2. Tap Scan and photograph the prescription flat, in good light. ' +
      '3. Check each medicine, dose and time it read, fix anything wrong, then save. Your medicines and reminders are set from it. ' +
      'I will explain anything on it you are unsure about, but never change a dose: ask your doctor for that.',
  },
  meal_photo: {
    route: '/(app)/health/meal-log',
    steps: 'Opening the meal log. Tap the camera, take one photo of the whole plate, then check the items and portions before saving.',
  },
  medicine_add: {
    route: '/(app)/health/medications',
    steps: 'Opening Medicines. Tap Add, type the name, the dose as written by your doctor and the time. Turn on reminders if you want a nudge.',
  },
  rep_count: {
    route: '/(app)/health/pose-check',
    steps: 'Opening the rep counter. Prop the phone up so your whole body is in view, pick the exercise and start.',
  },
};

/** The medicine a spoken name refers to, by loose match ("vitamin d" → "Vitamin D3 1000 IU"). */
export function matchMedicine<T extends { name: string }>(meds: T[], spoken: string): T | null {
  const q = spoken.toLowerCase().replace(/\b(?:my|the|medicine|tablet|pill)\b/g, '').trim();
  if (!q) return null;
  return meds.find((m) => m.name.toLowerCase() === q) ?? meds.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase())) ?? null;
}
