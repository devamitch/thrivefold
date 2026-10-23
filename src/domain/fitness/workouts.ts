/**
 * Workouts: an exercise library, plans and progression suggestions computed from the
 * person's own logged sets. General fitness guidance only; not medical advice.
 */

export type Equipment = 'none' | 'chair' | 'dumbbells' | 'barbell' | 'machine' | 'band';
export type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'mobility' | 'cardio' | 'carry';

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  equipment: Equipment;
  /** Track load (kg) for this exercise. */
  weighted: boolean;
  /** Timed holds are logged in seconds instead of reps. */
  timed?: boolean;
  steps: string[];
  easier: string;
  harder: string;
  safety: string;
}

export interface PlanItem {
  exerciseId: string;
  sets: number;
  /** Target reps per set, or seconds for timed exercises. */
  target: number;
  restSeconds: number;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  summary: string;
  setting: 'home' | 'desk' | 'gym' | 'recovery';
  level: 'beginner' | 'intermediate';
  minutes: number;
  items: PlanItem[];
}

export const EXERCISES: Exercise[] = [
  { id: 'squat_bw', name: 'Bodyweight squat', pattern: 'squat', equipment: 'none', weighted: false,
    steps: ['Feet shoulder-width, toes slightly out.', 'Sit hips back and down, chest up.', 'Knees track over toes; go as low as is comfortable.', 'Stand up through the whole foot.'],
    easier: 'Sit down to a chair and stand back up.', harder: 'Pause 2 seconds at the bottom.', safety: 'Stop if you feel sharp knee or back pain.' },
  { id: 'pushup', name: 'Push-up', pattern: 'push', equipment: 'none', weighted: false,
    steps: ['Hands slightly wider than shoulders.', 'Body in one straight line from head to heels.', 'Lower your chest towards the floor.', 'Press back up without letting hips sag.'],
    easier: 'Hands on a wall, table or bench.', harder: 'Feet raised on a step.', safety: 'Keep wrists stacked; use fists or handles if wrists hurt.' },
  { id: 'glute_bridge', name: 'Glute bridge', pattern: 'hinge', equipment: 'none', weighted: false,
    steps: ['Lie on your back, knees bent, feet flat.', 'Press through heels and lift hips.', 'Squeeze glutes at the top for a second.', 'Lower slowly.'],
    easier: 'Smaller range of motion.', harder: 'Single-leg bridge.', safety: 'Avoid arching the lower back at the top.' },
  { id: 'dead_bug', name: 'Dead bug', pattern: 'core', equipment: 'none', weighted: false,
    steps: ['Lie on your back, arms up, knees over hips.', 'Press lower back gently into the floor.', 'Slowly extend opposite arm and leg.', 'Return and switch sides.'],
    easier: 'Move only the legs.', harder: 'Hold a light weight in the hands.', safety: 'Stop the range before your back lifts off the floor.' },
  { id: 'plank', name: 'Plank', pattern: 'core', equipment: 'none', weighted: false, timed: true,
    steps: ['Forearms under shoulders.', 'Body in a straight line.', 'Brace your stomach and breathe steadily.'],
    easier: 'Knees on the floor.', harder: 'Lift one foot slightly.', safety: 'End the set when your hips start to sag.' },
  { id: 'reverse_lunge', name: 'Reverse lunge', pattern: 'squat', equipment: 'none', weighted: false,
    steps: ['Stand tall.', 'Step one foot back and lower the back knee.', 'Front knee stays over the foot.', 'Push through the front foot to return.'],
    easier: 'Hold a wall or chair for balance.', harder: 'Hold dumbbells.', safety: 'Keep steps short if balance is a concern.' },
  { id: 'chair_squat', name: 'Sit-to-stand', pattern: 'squat', equipment: 'chair', weighted: false,
    steps: ['Sit at the front of a sturdy chair.', 'Feet flat, lean forward slightly.', 'Stand up fully.', 'Sit back down with control.'],
    easier: 'Use your hands on your thighs.', harder: 'Arms crossed, slower lowering.', safety: 'Use a chair that will not slide.' },
  { id: 'thoracic_rotation', name: 'Seated thoracic rotation', pattern: 'mobility', equipment: 'chair', weighted: false,
    steps: ['Sit tall, arms crossed on chest.', 'Turn your upper body slowly to one side.', 'Breathe out, return to centre, switch sides.'],
    easier: 'Smaller turn.', harder: 'Pause and breathe at end range.', safety: 'Move within a pain-free range.' },
  { id: 'hip_flexor_stretch', name: 'Half-kneeling hip flexor stretch', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Kneel on one knee, other foot forward.', 'Tuck your pelvis slightly under.', 'Shift forward gently until you feel the stretch.'],
    easier: 'Standing version holding a chair.', harder: 'Reach the same-side arm overhead.', safety: 'Pad the knee; no bouncing.' },
  { id: 'cat_cow', name: 'Cat-cow', pattern: 'mobility', equipment: 'none', weighted: false,
    steps: ['On hands and knees.', 'Round the back as you breathe out.', 'Gently arch as you breathe in.'],
    easier: 'Seated version in a chair.', harder: 'Slower, with a pause at each end.', safety: 'Stay in a comfortable range.' },
  { id: 'brisk_walk', name: 'Brisk walk', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Walk at a pace where you can talk but not sing.', 'Relax shoulders, swing arms naturally.'],
    easier: 'Shorter, flatter route.', harder: 'Add hills or intervals.', safety: 'Stop if you feel chest pain, dizziness or unusual breathlessness.' },
  { id: 'goblet_squat', name: 'Goblet squat', pattern: 'squat', equipment: 'dumbbells', weighted: true,
    steps: ['Hold one dumbbell at your chest.', 'Squat down between your knees.', 'Keep chest up and heels down.', 'Stand up.'],
    easier: 'Lighter weight or bodyweight squat.', harder: 'Heavier dumbbell, 3-second lowering.', safety: 'Choose a weight you can control for every rep.' },
  { id: 'db_row', name: 'One-arm dumbbell row', pattern: 'pull', equipment: 'dumbbells', weighted: true,
    steps: ['One hand and knee on a bench.', 'Pull the dumbbell to your hip.', 'Lower with control.'],
    easier: 'Lighter weight.', harder: 'Pause at the top.', safety: 'Keep your back flat; do not twist.' },
  { id: 'db_press', name: 'Dumbbell bench press', pattern: 'push', equipment: 'dumbbells', weighted: true,
    steps: ['Lie on a bench, dumbbells over chest.', 'Lower to chest level, elbows at about 45 degrees.', 'Press back up.'],
    easier: 'Floor press.', harder: 'Incline bench.', safety: 'Use a spotter or lighter weights near your limit.' },
  { id: 'rdl', name: 'Romanian deadlift', pattern: 'hinge', equipment: 'dumbbells', weighted: true,
    steps: ['Stand holding weights in front of thighs.', 'Push hips back with a slight knee bend.', 'Lower until you feel the hamstrings, back flat.', 'Drive hips forward to stand.'],
    easier: 'Bodyweight hip hinge to a wall.', harder: 'Barbell or single-leg version.', safety: 'Stop if your back rounds.' },
  { id: 'lat_pulldown', name: 'Lat pulldown', pattern: 'pull', equipment: 'machine', weighted: true,
    steps: ['Grip slightly wider than shoulders.', 'Pull the bar to the upper chest.', 'Control it back up.'],
    easier: 'Lighter stack, band-assisted pull-down.', harder: 'Assisted or full pull-ups.', safety: 'Do not pull behind the neck.' },
  { id: 'leg_press', name: 'Leg press', pattern: 'squat', equipment: 'machine', weighted: true,
    steps: ['Feet hip-width on the platform.', 'Lower until knees are about 90 degrees.', 'Press without locking the knees.'],
    easier: 'Lighter load, shorter range.', harder: 'Slower lowering.', safety: 'Keep your lower back against the pad.' },
  { id: 'farmer_carry', name: 'Farmer carry', pattern: 'carry', equipment: 'dumbbells', weighted: true, timed: true,
    steps: ['Hold a weight in each hand.', 'Stand tall and walk steadily.'],
    easier: 'Lighter weights, shorter time.', harder: 'Heavier weights.', safety: 'Set weights down with a straight back.' },
  { id: 'band_pull_apart', name: 'Band pull-apart', pattern: 'pull', equipment: 'band', weighted: false,
    steps: ['Hold a band at shoulder height, arms straight.', 'Pull the band apart to your chest.', 'Return slowly.'],
    easier: 'Lighter band.', harder: 'Pause at the chest.', safety: 'Keep shoulders down, away from ears.' },
];

export const PLANS: WorkoutPlan[] = [
  { id: 'home_beginner', title: 'Home strength basics', summary: 'No equipment. Squat, push, hinge and core.', setting: 'home', level: 'beginner', minutes: 20,
    items: [
      { exerciseId: 'squat_bw', sets: 3, target: 10, restSeconds: 60 },
      { exerciseId: 'pushup', sets: 3, target: 8, restSeconds: 60 },
      { exerciseId: 'glute_bridge', sets: 3, target: 12, restSeconds: 45 },
      { exerciseId: 'dead_bug', sets: 2, target: 8, restSeconds: 45 },
      { exerciseId: 'plank', sets: 2, target: 30, restSeconds: 45 },
    ] },
  { id: 'desk_reset', title: 'Desk reset', summary: 'Ten minutes for stiff hips, back and shoulders.', setting: 'desk', level: 'beginner', minutes: 10,
    items: [
      { exerciseId: 'thoracic_rotation', sets: 2, target: 6, restSeconds: 15 },
      { exerciseId: 'chair_squat', sets: 2, target: 10, restSeconds: 30 },
      { exerciseId: 'hip_flexor_stretch', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'cat_cow', sets: 1, target: 8, restSeconds: 0 },
    ] },
  { id: 'gym_full_a', title: 'Gym full body A', summary: 'Squat, press, row and hinge with free weights.', setting: 'gym', level: 'intermediate', minutes: 45,
    items: [
      { exerciseId: 'goblet_squat', sets: 3, target: 10, restSeconds: 90 },
      { exerciseId: 'db_press', sets: 3, target: 10, restSeconds: 90 },
      { exerciseId: 'db_row', sets: 3, target: 10, restSeconds: 75 },
      { exerciseId: 'rdl', sets: 3, target: 10, restSeconds: 90 },
      { exerciseId: 'farmer_carry', sets: 2, target: 40, restSeconds: 60 },
    ] },
  { id: 'gym_full_b', title: 'Gym full body B', summary: 'Machines and pulling work.', setting: 'gym', level: 'intermediate', minutes: 40,
    items: [
      { exerciseId: 'leg_press', sets: 3, target: 12, restSeconds: 90 },
      { exerciseId: 'lat_pulldown', sets: 3, target: 10, restSeconds: 75 },
      { exerciseId: 'reverse_lunge', sets: 2, target: 8, restSeconds: 60 },
      { exerciseId: 'band_pull_apart', sets: 2, target: 15, restSeconds: 45 },
      { exerciseId: 'plank', sets: 2, target: 40, restSeconds: 45 },
    ] },
  { id: 'recovery_walk', title: 'Recovery day', summary: 'Easy walk and mobility for rest days.', setting: 'recovery', level: 'beginner', minutes: 25,
    items: [
      { exerciseId: 'brisk_walk', sets: 1, target: 900, restSeconds: 0 },
      { exerciseId: 'cat_cow', sets: 1, target: 8, restSeconds: 30 },
      { exerciseId: 'hip_flexor_stretch', sets: 2, target: 30, restSeconds: 15 },
    ] },
];

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);
export const planById = (id: string) => PLANS.find((p) => p.id === id);

/** Opens YouTube search results for the exercise's technique; nothing is embedded or rehosted. */
export const techniqueSearchUrl = (exercise: Exercise) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} proper form`)}`;

export interface LoggedSet {
  /** Reps, or seconds for timed exercises. */
  value: number;
  weightKg?: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  date: string; // YYYY-MM-DD
  startedAt: string;
  finishedAt: string;
  entries: { exerciseId: string; sets: LoggedSet[] }[];
  /** 1-10 how hard it felt. */
  effort?: number;
  /** Pain or discomfort reported during the session. */
  painReported: boolean;
}

export interface Suggestion {
  kind: 'repeat' | 'add_reps' | 'add_weight' | 'ease_off' | 'first_time';
  text: string;
}

/**
 * Next-time suggestion for one exercise from the latest session that included it: ease off
 * after reported pain, add load or reps after hitting every target, otherwise repeat.
 */
export function suggestNext(exerciseId: string, item: PlanItem, sessions: WorkoutSession[]): Suggestion {
  const exercise = exerciseById(exerciseId);
  const last = [...sessions]
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
    .find((s) => s.entries.some((e) => e.exerciseId === exerciseId && e.sets.length > 0));
  if (!last || !exercise) return { kind: 'first_time', text: 'First time: pick an easy start and focus on form.' };
  if (last.painReported) return { kind: 'ease_off', text: `Last time you reported discomfort. Try: ${exercise.easier}` };
  const sets = last.entries.find((e) => e.exerciseId === exerciseId)!.sets;
  const hitAll = sets.length >= item.sets && sets.every((s) => s.value >= item.target);
  const unit = exercise.timed ? 's' : ' reps';
  if (!hitAll) return { kind: 'repeat', text: `Repeat ${item.sets} x ${item.target}${unit} until every set feels solid.` };
  if (exercise.weighted) {
    const top = Math.max(...sets.map((s) => s.weightKg ?? 0));
    return top > 0
      ? { kind: 'add_weight', text: `All sets done at ${top} kg. Try ${top + 2.5} kg next time.` }
      : { kind: 'add_reps', text: 'All sets done. Add a little weight next time.' };
  }
  return { kind: 'add_reps', text: exercise.timed ? `All sets done. Try ${item.target + 10}s next time.` : `All sets done. Try ${item.target + 2} reps or: ${exercise.harder}` };
}

/** Sessions in the 7 days ending on `today` (YYYY-MM-DD). */
export function sessionsThisWeek(sessions: WorkoutSession[], today: string): number {
  const end = Date.parse(`${today}T00:00:00Z`);
  return sessions.filter((s) => {
    const d = Date.parse(`${s.date}T00:00:00Z`);
    return d <= end && end - d < 7 * 86400000;
  }).length;
}

/** Heaviest logged set per date for a weighted exercise, oldest first. */
export function weightHistory(exerciseId: string, sessions: WorkoutSession[]): { date: string; kg: number }[] {
  return sessions
    .map((s) => ({ date: s.date, kg: Math.max(0, ...(s.entries.find((e) => e.exerciseId === exerciseId)?.sets ?? []).map((x) => x.weightKg ?? 0)) }))
    .filter((p) => p.kg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}
