/**
 * Workouts: an exercise library, plans and progression suggestions computed from the
 * person's own logged sets. General fitness guidance only; not medical advice.
 */

export type Equipment = 'none' | 'chair' | 'dumbbells' | 'barbell' | 'machine' | 'band';
export type Pattern =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'core'
  | 'mobility'
  | 'cardio'
  | 'carry'
  | 'balance'
  | 'yoga'
  | 'pilates'
  | 'plyometric';

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
  setting: 'home' | 'desk' | 'gym' | 'recovery' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'balance' | 'seated';
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
  // ── Strength (more) ──
  { id: 'step_up', name: 'Step-up', pattern: 'squat', equipment: 'none', weighted: false,
    steps: ['Stand facing a sturdy step or low bench.', 'Step up with one foot and press through the heel.', 'Stand tall at the top, then step down with control.', 'Switch the leading leg each set.'],
    easier: 'Use a lower step and hold a rail.', harder: 'Hold dumbbells.', safety: 'Use a step that will not slide.' },
  { id: 'calf_raise', name: 'Calf raise', pattern: 'squat', equipment: 'none', weighted: false,
    steps: ['Stand tall, hands on a wall for balance.', 'Rise onto the balls of your feet.', 'Pause, then lower slowly.'],
    easier: 'Both feet, small range.', harder: 'One foot at a time.', safety: 'Lower slowly to protect the Achilles tendon.' },
  { id: 'superman', name: 'Superman hold', pattern: 'core', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie face down, arms forward.', 'Lift arms, chest and legs slightly.', 'Hold, breathing steadily.'],
    easier: 'Lift arms only, or legs only.', harder: 'Longer holds.', safety: 'Keep the lift small; stop with any back pain.' },
  { id: 'db_overhead_press', name: 'Dumbbell overhead press', pattern: 'push', equipment: 'dumbbells', weighted: true,
    steps: ['Stand with dumbbells at shoulder height.', 'Brace your stomach.', 'Press the weights overhead.', 'Lower with control.'],
    easier: 'Seated, lighter weights.', harder: 'One arm at a time.', safety: 'Skip it if overhead movement hurts your shoulders.' },
  // ── Cardio ──
  { id: 'march_in_place', name: 'March in place', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Stand tall.', 'Lift knees alternately at a steady pace.', 'Swing your arms naturally.'],
    easier: 'Smaller steps, hold a chair.', harder: 'Lift knees higher and faster.', safety: 'Low impact; stop if dizzy.' },
  { id: 'jumping_jacks', name: 'Jumping jacks', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Start standing, feet together.', 'Jump feet out while raising arms.', 'Jump back to the start.'],
    easier: 'Step one foot out at a time.', harder: 'Faster pace.', safety: 'Land softly; use the step version for sore joints.' },
  { id: 'jog', name: 'Easy jog', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Run at a pace where you can still speak in short sentences.', 'Keep steps short and light.'],
    easier: 'Alternate one minute jog, one minute walk.', harder: 'Longer or hillier route.', safety: 'Stop with chest pain, dizziness or unusual breathlessness.' },
  { id: 'cycling', name: 'Cycling (bike or stationary)', pattern: 'cardio', equipment: 'machine', weighted: false, timed: true,
    steps: ['Set the seat so your knee is slightly bent at the bottom.', 'Pedal at a steady, comfortable effort.'],
    easier: 'Lower resistance.', harder: 'Short faster intervals.', safety: 'Wear a helmet outdoors.' },
  { id: 'rowing', name: 'Rowing machine', pattern: 'cardio', equipment: 'machine', weighted: false, timed: true,
    steps: ['Push with legs first, then lean back slightly, then pull the handle to your ribs.', 'Return in reverse order.'],
    easier: 'Lower damper, slower strokes.', harder: 'Higher stroke rate.', safety: 'Keep your back long; the legs do most of the work.' },
  { id: 'jump_rope', name: 'Jump rope', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Turn the rope with your wrists.', 'Small, light hops on the balls of your feet.'],
    easier: 'Rope-free: mimic the motion.', harder: 'Alternate feet.', safety: 'Land softly on a forgiving surface.' },
  // ── HIIT ──
  { id: 'squat_jump', name: 'Squat jump', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Squat down.', 'Jump up explosively.', 'Land softly back into a squat.'],
    easier: 'Squat with a rise onto the toes.', harder: 'Higher jumps.', safety: 'Skip jumping with knee or pelvic-floor problems.' },
  { id: 'mountain_climber', name: 'Mountain climber', pattern: 'plyometric', equipment: 'none', weighted: false, timed: true,
    steps: ['Start in a high plank.', 'Drive knees toward your chest alternately.'],
    easier: 'Hands on a bench, slower steps.', harder: 'Faster pace.', safety: 'Keep wrists under shoulders.' },
  { id: 'burpee', name: 'Burpee', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Squat and place hands on the floor.', 'Step or jump feet back to a plank.', 'Return feet forward and stand or jump.'],
    easier: 'Step back and forward, no jump.', harder: 'Add a push-up.', safety: 'Stop if you feel dizzy.' },
  { id: 'high_knees', name: 'High knees', pattern: 'plyometric', equipment: 'none', weighted: false, timed: true,
    steps: ['Run in place, bringing knees toward hip height.', 'Pump your arms.'],
    easier: 'March instead of run.', harder: 'Faster pace.', safety: 'Land softly.' },
  { id: 'skater', name: 'Skater hop', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Hop sideways onto one foot.', 'Swing the other leg behind.', 'Hop back to the other side.'],
    easier: 'Step side to side.', harder: 'Wider, faster hops.', safety: 'Clear space around you.' },
  // ── Yoga ──
  { id: 'downward_dog', name: 'Downward dog', pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['From hands and knees, lift hips up and back.', 'Press the floor away; bend knees if needed.', 'Breathe slowly.'],
    easier: 'Hands on a chair.', harder: 'Straighten legs gently.', safety: 'Skip with uncontrolled high blood pressure or late pregnancy.' },
  { id: 'child_pose', name: "Child's pose", pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['Kneel and sit back toward your heels.', 'Fold forward, arms long or by your sides.', 'Breathe into your back.'],
    easier: 'Cushion under hips or knees.', harder: 'Walk hands to each side.', safety: 'Keep knees wide if your stomach feels compressed.' },
  { id: 'warrior_two', name: 'Warrior II', pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['Step feet wide; turn the front foot out.', 'Bend the front knee over the ankle.', 'Reach arms out, gaze over the front hand.'],
    easier: 'Shorter stance.', harder: 'Deeper bend, longer hold.', safety: 'Keep the knee in line with the toes.' },
  { id: 'cobra', name: 'Cobra', pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie face down, hands under shoulders.', 'Lift the chest gently, elbows bent.', 'Shoulders away from ears.'],
    easier: 'Forearms down (sphinx).', harder: 'Straighter arms if comfortable.', safety: 'Stop with any low-back pinching.' },
  { id: 'tree_pose', name: 'Tree pose', pattern: 'balance', equipment: 'none', weighted: false, timed: true,
    steps: ['Stand on one leg.', 'Place the other foot on the ankle, calf or thigh (not the knee).', 'Hands at chest; fix your gaze.'],
    easier: 'Toes on the floor, hand on a wall.', harder: 'Arms overhead.', safety: 'Stand near a wall.' },
  { id: 'sun_salutation', name: 'Sun salutation (gentle)', pattern: 'yoga', equipment: 'none', weighted: false,
    steps: ['Reach up, fold forward.', 'Half lift, step back to plank or knees.', 'Lower, cobra, downward dog.', 'Step forward, rise up.'],
    easier: 'Knees down throughout.', harder: 'Flow with the breath, more rounds.', safety: 'Move slowly; skip with dizziness.' },
  // ── Pilates ──
  { id: 'pilates_hundred', name: 'The hundred', pattern: 'pilates', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie on your back, knees bent and lifted.', 'Lift head and shoulders, arms long.', 'Pump arms, breathe in for 5, out for 5.'],
    easier: 'Head down, feet on the floor.', harder: 'Legs extended higher.', safety: 'Keep your neck relaxed.' },
  { id: 'single_leg_stretch', name: 'Single-leg stretch', pattern: 'pilates', equipment: 'none', weighted: false,
    steps: ['Lie on your back, head lifted.', 'Draw one knee in, extend the other leg.', 'Switch smoothly.'],
    easier: 'Head down, legs higher.', harder: 'Legs lower.', safety: 'Keep your lower back steady.' },
  { id: 'roll_up', name: 'Roll-up', pattern: 'pilates', equipment: 'none', weighted: false,
    steps: ['Lie with arms overhead.', 'Peel up one vertebra at a time to sitting.', 'Roll back down slowly.'],
    easier: 'Start from sitting and roll halfway back.', harder: 'Slower tempo.', safety: 'Skip with acute back pain.' },
  { id: 'side_leg_lift', name: 'Side-lying leg lift', pattern: 'pilates', equipment: 'none', weighted: false,
    steps: ['Lie on your side, legs long.', 'Lift the top leg slowly.', 'Lower with control.'],
    easier: 'Bend the bottom knee.', harder: 'Add a small circle at the top.', safety: 'Keep hips stacked.' },
  { id: 'pilates_swim', name: 'Pilates swimming', pattern: 'pilates', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie face down, arms forward.', 'Lift arms and legs slightly.', 'Flutter opposite arm and leg.'],
    easier: 'Arms only.', harder: 'Faster flutter.', safety: 'Keep the lift small.' },
  // ── Balance ──
  { id: 'single_leg_stand', name: 'Single-leg stand', pattern: 'balance', equipment: 'none', weighted: false, timed: true,
    steps: ['Stand near a wall.', 'Lift one foot slightly.', 'Hold, then switch.'],
    easier: 'Fingertips on the wall.', harder: 'Eyes closed (near support).', safety: 'Always keep support within reach.' },
  { id: 'heel_toe_walk', name: 'Heel-to-toe walk', pattern: 'balance', equipment: 'none', weighted: false,
    steps: ['Walk in a straight line placing heel to toe.', 'Look ahead, arms out if needed.'],
    easier: 'Walk beside a wall.', harder: 'Walk backwards.', safety: 'Clear the floor first.' },
  { id: 'clock_reach', name: 'Clock reach', pattern: 'balance', equipment: 'none', weighted: false,
    steps: ['Stand on one leg holding a chair.', 'Reach the other foot to 12, 3 and 6 o\'clock points.', 'Return to centre each time.'],
    easier: 'Small reaches.', harder: 'Bigger reaches, lighter grip.', safety: 'Keep hold of the chair.' },
  // ── Core ──
  { id: 'side_plank', name: 'Side plank', pattern: 'core', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie on your side, elbow under shoulder.', 'Lift hips so your body forms a line.', 'Hold, then switch sides.'],
    easier: 'Knees bent on the floor.', harder: 'Top leg lifted.', safety: 'Stop with shoulder pain.' },
  { id: 'bird_dog', name: 'Bird dog', pattern: 'core', equipment: 'none', weighted: false,
    steps: ['On hands and knees, back flat.', 'Reach one arm and the opposite leg out.', 'Pause, return and switch.'],
    easier: 'Move only the leg.', harder: 'Slow three-second holds.', safety: 'Keep hips level.' },
  // ── Seated / low impact ──
  { id: 'seated_march', name: 'Seated march', pattern: 'cardio', equipment: 'chair', weighted: false, timed: true,
    steps: ['Sit tall at the front of a chair.', 'Lift knees alternately.', 'Swing arms if comfortable.'],
    easier: 'Smaller lifts.', harder: 'Faster pace, add arm punches.', safety: 'Use a chair without wheels.' },
  { id: 'seated_leg_extension', name: 'Seated leg extension', pattern: 'squat', equipment: 'chair', weighted: false,
    steps: ['Sit tall.', 'Straighten one knee, hold for a second.', 'Lower slowly and switch.'],
    easier: 'Smaller range.', harder: 'Ankle weight.', safety: 'Move slowly.' },
  { id: 'seated_arm_circles', name: 'Seated arm circles', pattern: 'mobility', equipment: 'chair', weighted: false, timed: true,
    steps: ['Sit tall, arms out to the sides.', 'Make small circles forward, then backward.'],
    easier: 'One arm at a time.', harder: 'Bigger circles.', safety: 'Lower arms if shoulders ache.' },
  // ── Stretching ──
  { id: 'hamstring_stretch', name: 'Hamstring stretch', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Sit or stand with one leg straight.', 'Hinge forward from the hips until you feel a stretch.', 'Breathe and hold.'],
    easier: 'Bend the knee slightly.', harder: 'Longer hold.', safety: 'No bouncing.' },
  { id: 'chest_stretch', name: 'Doorway chest stretch', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Forearm on a door frame at shoulder height.', 'Step through gently until the chest stretches.'],
    easier: 'Lower arm position.', harder: 'Slightly higher arm.', safety: 'Stop with any tingling in the arm.' },
  { id: 'calf_stretch', name: 'Wall calf stretch', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Hands on a wall, one leg back, heel down.', 'Lean in until the calf stretches.'],
    easier: 'Shorter stance.', harder: 'Bend the back knee for a deeper calf stretch.', safety: 'Keep the heel down.' },
  { id: 'band_pull_apart', name: 'Band pull-apart', pattern: 'pull', equipment: 'band', weighted: false,
    steps: ['Hold a band at shoulder height, arms straight.', 'Pull the band apart to your chest.', 'Return slowly.'],
    easier: 'Lighter band.', harder: 'Pause at the chest.', safety: 'Keep shoulders down, away from ears.' },

  // ── Indian Yoga (Hatha / classical) ──
  { id: 'surya_namaskar', name: 'Surya Namaskar (Sun salutation)', pattern: 'yoga', equipment: 'none', weighted: false,
    steps: [
      'Pranamasana — stand, palms together at chest.',
      'Hastauttanasana — raise arms, gentle backbend.',
      'Uttanasana — fold forward, palms to floor.',
      'Ashwa Sanchalanasana — step right leg back, low lunge.',
      'Dandasana — plank position.',
      'Ashtanga Namaskara — lower knees, chest and chin to floor.',
      'Bhujangasana — cobra; press chest up.',
      'Adho Mukha Svanasana — downward dog.',
      'Repeat lunge and fold, then rise and return to prayer.',
    ],
    easier: 'Knees down throughout; skip cobra.', harder: 'Faster flow, 6–12 rounds.', safety: 'Move with the breath; skip with wrist, knee or back pain.' },
  { id: 'virabhadrasana_1', name: 'Virabhadrasana I (Warrior I)', pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['Step left foot back, turn it 45°.', 'Bend front knee over ankle.', 'Hips squared forward.', 'Raise arms overhead, palms facing.'],
    easier: 'Shorter stance, hands at hips.', harder: 'Deeper lunge, longer hold.', safety: 'Keep back heel grounded.' },
  { id: 'virabhadrasana_3', name: 'Virabhadrasana III (Warrior III)', pattern: 'balance', equipment: 'none', weighted: false, timed: true,
    steps: ['From Warrior I, shift weight to front foot.', 'Hinge forward, extend back leg and arms.', 'Body parallel to floor; gaze down.'],
    easier: 'Hands on a chair; small hip height.', harder: 'Arms alongside body; eyes closed.', safety: 'Stand near a wall.' },
  { id: 'malasana', name: 'Malasana (Garland / yogi squat)', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Feet wider than hips, toes out.', 'Squat deep, bringing hips low.', 'Elbows press knees out; palms together.'],
    easier: 'Heels on a rolled towel.', harder: 'Arms extended overhead.', safety: 'Avoid with knee pain; use support.' },
  { id: 'naukasana', name: 'Naukasana (Boat pose)', pattern: 'core', equipment: 'none', weighted: false, timed: true,
    steps: ['Sit, knees bent, lean back slightly.', 'Lift feet to knee height; balance on sit-bones.', 'Arms parallel to floor; chest open.'],
    easier: 'Hold knees with hands.', harder: 'Extend legs to 45°.', safety: 'Keep lower back long, not rounded.' },
  { id: 'vrikshasana', name: 'Vrikshasana (Tree pose)', pattern: 'balance', equipment: 'none', weighted: false, timed: true,
    steps: ['Stand; fix gaze on a point.', 'Place one foot on inner calf or thigh (not the knee).', 'Grow tall; arms rise overhead or to prayer.'],
    easier: 'Toes touching floor, hand on wall.', harder: 'Eyes closed; arms wide.', safety: 'Use a wall when learning.' },
  { id: 'trikonasana', name: 'Trikonasana (Triangle pose)', pattern: 'mobility', equipment: 'none', weighted: false, timed: true,
    steps: ['Feet wide, front foot forward.', 'Reach the front arm forward, then lower to the shin or floor.', 'Top arm reaches up; gaze follows.'],
    easier: 'Hand on knee; smaller stance.', harder: 'Block on floor, longer hold.', safety: 'Avoid over-rotating the spine.' },

  // ── Kalaripayattu (Kerala martial art fundamentals) ──
  { id: 'kalaripayattu_ashva', name: 'Ashva stance (Horse stance)', pattern: 'squat', equipment: 'none', weighted: false, timed: true,
    steps: ['Feet twice shoulder-width, toes out 45°.', 'Sink hips to thigh-parallel.', 'Spine tall, weight even on both feet.', 'Hold steady; breathe through the nose.'],
    easier: 'Shallower squat, shorter hold.', harder: 'Deeper, longer hold with eyes closed.', safety: 'Ease into it; protect the knees — stop with any sharp joint pain.' },
  { id: 'kalaripayattu_tiger', name: 'Vyaghra (Tiger step)', pattern: 'mobility', equipment: 'none', weighted: false,
    steps: ['Start on all fours.', 'Arch the back and push hips back — cat-cow flow.', 'Spring one leg forward in a wide low lunge.', 'Return and repeat on the other side.'],
    easier: 'Slower steps, shallower lunge.', harder: 'Add a flowing jump into the lunge.', safety: 'Warm up hips and wrists first.' },
  { id: 'kalaripayattu_horse_kick', name: 'Kalaripayattu side kick', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Stand in Ashva stance.', 'Shift weight to one leg.', 'Chamber the knee, then extend the leg to the side with the heel.', 'Return and alternate.'],
    easier: 'Light tap, hold a wall.', harder: 'Higher kick, faster rhythm.', safety: 'Warm up hips; no forced range of motion.' },
  { id: 'kalaripayattu_eagle', name: 'Garuda (Eagle leap)', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['From Ashva stance, coil the body.', 'Explode up and twist in the air.', 'Land softly back in stance.'],
    easier: 'Vertical jump without twist.', harder: 'Full rotation, land silently.', safety: 'Clear space; land with soft knees.' },

  // ── Hindu / Desi body exercises ──
  { id: 'dand_baithak', name: 'Dand-Baithak (Hindu squat + pushup circuit)', pattern: 'squat', equipment: 'none', weighted: false,
    steps: [
      'Hindu squat: rise on toes at the bottom, swing arms forward as you sink.',
      'Hindu pushup: from downward dog, sweep chest forward through a low arc, press up to cobra, return.',
      'Alternate one squat, one pushup per rep.',
    ],
    easier: 'Do Hindu squats or pushups separately.', harder: 'Faster tempo, more rounds.', safety: 'Ease into the shoulder range; stop with wrist pain.' },
  { id: 'hindu_squat', name: 'Hindu squat (Bethak)', pattern: 'squat', equipment: 'none', weighted: false,
    steps: ['Feet hip-width, heels lift slightly as you descend.', 'Swing arms forward and down.', 'Squat fully, then drive through balls of feet to stand.'],
    easier: 'Slower tempo, smaller heel lift.', harder: 'Rapid continuous rhythm.', safety: 'Stop with knee pain; prioritise a flat floor.' },
  { id: 'hindu_pushup', name: 'Hindu pushup (Dand)', pattern: 'push', equipment: 'none', weighted: false,
    steps: ['Start in downward dog (pike).', 'Sweep chest forward low to the floor.', 'Press into cobra.', 'Push back to pike.'],
    easier: 'Knees down, narrower arc.', harder: 'Full range; add a pause in cobra.', safety: 'Keep wrists neutral; skip with shoulder impingement.' },
  { id: 'surya_namaskar_b', name: 'Surya Namaskar B (dynamic flow)', pattern: 'yoga', equipment: 'none', weighted: false,
    steps: [
      'Utkatasana — chair pose.', 'Fold and jump or step back.', 'Chaturanga or knees-chest-chin.', 'Upward dog.', 'Downward dog — hold 5 breaths.',
      'Warrior I right.', 'Return, repeat Warrior I left.', 'Jump or step to Utkatasana, then Tadasana.',
    ],
    easier: 'Step transitions, knees down.', harder: 'Jump transitions, full vinyasa.', safety: 'Move with the breath; rest in child\'s pose anytime.' },

  // ── Martial arts basics ──
  { id: 'jab_cross_combo', name: 'Jab-cross punch combination', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Stand in orthodox or southpaw stance (dominant foot back).', 'Jab with the lead hand — short, straight, return fast.', 'Cross with the rear hand — rotate hips, drive through the punch.', 'Cycle continuously.'],
    easier: 'Shadow box slowly; focus on rotation.', harder: 'Add footwork; increase tempo.', safety: 'Shadow boxing only — no contact training without supervision.' },
  { id: 'muay_thai_teep', name: 'Push kick (Teep)', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Stand in stance.', 'Chamber the front knee up to hip height.', 'Push the heel forward, extending the leg.', 'Retract and return to stance.'],
    easier: 'Slow chamber only; hold a wall.', harder: 'Combine with jab-cross; add speed.', safety: 'Stand near a wall when learning balance.' },
  { id: 'shadow_boxing', name: 'Shadow boxing', pattern: 'cardio', equipment: 'none', weighted: false, timed: true,
    steps: ['Move around a space using your feet.', 'Throw jabs, crosses, hooks and upper-cuts at controlled speed.', 'Include slips, rolls and head movement.'],
    easier: 'Focus on one punch at a time.', harder: 'Add knee or kick combinations.', safety: 'Control punches fully; no swinging.' },
  { id: 'squat_roundhouse', name: 'Squat to roundhouse kick', pattern: 'plyometric', equipment: 'none', weighted: false,
    steps: ['Squat down.', 'Rise and chamber the knee.', 'Pivot on the support foot, swing the shin and foot in an arc.', 'Return to stance.'],
    easier: 'Squat only or kick only.', harder: 'Add speed; increase squat depth.', safety: 'Only kick in open space; warm up hips.' },

  // ── Antigravity / inversion mobility ──
  { id: 'wall_handstand_hold', name: 'Wall handstand hold', pattern: 'balance', equipment: 'none', weighted: false, timed: true,
    steps: ['Stand a foot from the wall.', 'Place hands shoulder-width, kick up one leg at a time.', 'Both heels touch the wall; body in a line.', 'Breathe steadily.'],
    easier: 'Pike on hands with feet on a box.', harder: 'Free-balance kick-up.', safety: 'Skip with wrist, shoulder or blood-pressure issues; always have a soft surface.' },
  { id: 'shoulder_stand', name: 'Shoulder stand (Sarvangasana)', pattern: 'yoga', equipment: 'none', weighted: false, timed: true,
    steps: ['Lie on your back.', 'Lift legs and hips; support the back with hands.', 'Body vertical from shoulders to toes.', 'Chin tucked lightly; breathe.'],
    easier: 'Legs up the wall (Viparita Karani).', harder: 'Lower one leg to the floor (Halasana prep).', safety: 'Skip with neck problems or high blood pressure.' },
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
  { id: 'cardio_starter', title: 'Cardio starter', summary: 'Low-impact intervals to raise your heart rate gently.', setting: 'cardio', level: 'beginner', minutes: 20,
    items: [
      { exerciseId: 'march_in_place', sets: 1, target: 180, restSeconds: 30 },
      { exerciseId: 'jumping_jacks', sets: 3, target: 30, restSeconds: 45 },
      { exerciseId: 'step_up', sets: 3, target: 10, restSeconds: 45 },
      { exerciseId: 'march_in_place', sets: 2, target: 120, restSeconds: 30 },
    ] },
  { id: 'hiit_short', title: 'Short HIIT', summary: 'Hard work with full rests. Only on a high-energy day.', setting: 'hiit', level: 'intermediate', minutes: 15,
    items: [
      { exerciseId: 'squat_jump', sets: 3, target: 10, restSeconds: 45 },
      { exerciseId: 'mountain_climber', sets: 3, target: 30, restSeconds: 45 },
      { exerciseId: 'burpee', sets: 3, target: 6, restSeconds: 60 },
      { exerciseId: 'high_knees', sets: 3, target: 30, restSeconds: 45 },
    ] },
  { id: 'yoga_flow', title: 'Gentle yoga flow', summary: 'Breath-led poses for mobility and calm.', setting: 'yoga', level: 'beginner', minutes: 20,
    items: [
      { exerciseId: 'cat_cow', sets: 1, target: 8, restSeconds: 0 },
      { exerciseId: 'sun_salutation', sets: 3, target: 1, restSeconds: 20 },
      { exerciseId: 'warrior_two', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'tree_pose', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'cobra', sets: 2, target: 20, restSeconds: 15 },
      { exerciseId: 'child_pose', sets: 1, target: 60, restSeconds: 0 },
    ] },
  { id: 'pilates_core', title: 'Pilates core', summary: 'Controlled mat work for deep core and posture.', setting: 'pilates', level: 'beginner', minutes: 20,
    items: [
      { exerciseId: 'pilates_hundred', sets: 1, target: 60, restSeconds: 30 },
      { exerciseId: 'single_leg_stretch', sets: 2, target: 10, restSeconds: 30 },
      { exerciseId: 'roll_up', sets: 2, target: 6, restSeconds: 30 },
      { exerciseId: 'side_leg_lift', sets: 2, target: 12, restSeconds: 20 },
      { exerciseId: 'pilates_swim', sets: 2, target: 30, restSeconds: 30 },
    ] },
  { id: 'balance_basics', title: 'Balance basics', summary: 'Steadier on your feet, with support nearby.', setting: 'balance', level: 'beginner', minutes: 12,
    items: [
      { exerciseId: 'single_leg_stand', sets: 3, target: 30, restSeconds: 20 },
      { exerciseId: 'heel_toe_walk', sets: 3, target: 10, restSeconds: 20 },
      { exerciseId: 'clock_reach', sets: 2, target: 6, restSeconds: 20 },
      { exerciseId: 'calf_raise', sets: 2, target: 12, restSeconds: 30 },
    ] },
  { id: 'seated_strength', title: 'Seated workout', summary: 'Everything from a chair, for limited mobility or busy days.', setting: 'seated', level: 'beginner', minutes: 15,
    items: [
      { exerciseId: 'seated_march', sets: 2, target: 60, restSeconds: 20 },
      { exerciseId: 'seated_leg_extension', sets: 2, target: 10, restSeconds: 20 },
      { exerciseId: 'chair_squat', sets: 2, target: 8, restSeconds: 30 },
      { exerciseId: 'seated_arm_circles', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'thoracic_rotation', sets: 2, target: 6, restSeconds: 15 },
    ] },
  { id: 'evening_stretch', title: 'Evening stretch', summary: 'Ten quiet minutes before bed.', setting: 'recovery', level: 'beginner', minutes: 12,
    items: [
      { exerciseId: 'hamstring_stretch', sets: 2, target: 30, restSeconds: 10 },
      { exerciseId: 'chest_stretch', sets: 2, target: 30, restSeconds: 10 },
      { exerciseId: 'calf_stretch', sets: 2, target: 30, restSeconds: 10 },
      { exerciseId: 'hip_flexor_stretch', sets: 2, target: 30, restSeconds: 10 },
      { exerciseId: 'child_pose', sets: 1, target: 60, restSeconds: 0 },
    ] },
  { id: 'gym_upper_lower', title: 'Gym strength C', summary: 'Press, step-ups and core with dumbbells.', setting: 'gym', level: 'intermediate', minutes: 40,
    items: [
      { exerciseId: 'db_overhead_press', sets: 3, target: 10, restSeconds: 90 },
      { exerciseId: 'step_up', sets: 3, target: 10, restSeconds: 60 },
      { exerciseId: 'db_row', sets: 3, target: 10, restSeconds: 75 },
      { exerciseId: 'side_plank', sets: 2, target: 30, restSeconds: 30 },
      { exerciseId: 'bird_dog', sets: 2, target: 10, restSeconds: 30 },
    ] },

  // ── Indian Yoga plans ──
  { id: 'surya_namaskar_flow', title: 'Surya Namaskar flow', summary: 'Classical 12-step sun salutation sequence — moving meditation.', setting: 'yoga', level: 'beginner', minutes: 20,
    items: [
      { exerciseId: 'surya_namaskar', sets: 4, target: 1, restSeconds: 30 },
      { exerciseId: 'vrikshasana', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'virabhadrasana_1', sets: 2, target: 20, restSeconds: 15 },
      { exerciseId: 'malasana', sets: 2, target: 30, restSeconds: 20 },
      { exerciseId: 'child_pose', sets: 1, target: 60, restSeconds: 0 },
    ] },
  { id: 'indian_classical_yoga', title: 'Indian classical yoga', summary: 'Hatha asanas: warriors, triangle, boat and inversions.', setting: 'yoga', level: 'intermediate', minutes: 30,
    items: [
      { exerciseId: 'surya_namaskar', sets: 2, target: 1, restSeconds: 20 },
      { exerciseId: 'virabhadrasana_1', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'virabhadrasana_3', sets: 2, target: 20, restSeconds: 20 },
      { exerciseId: 'trikonasana', sets: 2, target: 30, restSeconds: 15 },
      { exerciseId: 'naukasana', sets: 3, target: 20, restSeconds: 20 },
      { exerciseId: 'shoulder_stand', sets: 1, target: 30, restSeconds: 30 },
      { exerciseId: 'child_pose', sets: 1, target: 60, restSeconds: 0 },
    ] },

  // ── Kalaripayattu plan ──
  { id: 'kalaripayattu_foundations', title: 'Kalaripayattu foundations', summary: 'Kerala martial art — stances, tiger steps, kicks.', setting: 'home', level: 'beginner', minutes: 25,
    items: [
      { exerciseId: 'kalaripayattu_ashva', sets: 3, target: 30, restSeconds: 30 },
      { exerciseId: 'kalaripayattu_tiger', sets: 3, target: 8, restSeconds: 30 },
      { exerciseId: 'kalaripayattu_horse_kick', sets: 3, target: 10, restSeconds: 30 },
      { exerciseId: 'kalaripayattu_eagle', sets: 2, target: 6, restSeconds: 45 },
      { exerciseId: 'malasana', sets: 2, target: 30, restSeconds: 20 },
    ] },

  // ── Hindu / Desi body plan ──
  { id: 'hindu_dand_baithak', title: 'Dand-Baithak circuit', summary: 'Traditional Hindu squats and pushups for total-body strength.', setting: 'home', level: 'intermediate', minutes: 20,
    items: [
      { exerciseId: 'hindu_squat', sets: 3, target: 20, restSeconds: 45 },
      { exerciseId: 'hindu_pushup', sets: 3, target: 10, restSeconds: 45 },
      { exerciseId: 'dand_baithak', sets: 2, target: 8, restSeconds: 60 },
      { exerciseId: 'kalaripayattu_ashva', sets: 2, target: 30, restSeconds: 30 },
    ] },

  // ── Martial arts HIIT ──
  { id: 'martial_arts_hiit', title: 'Martial arts HIIT', summary: 'Shadow boxing, kicks and functional combat movement.', setting: 'hiit', level: 'intermediate', minutes: 25,
    items: [
      { exerciseId: 'shadow_boxing', sets: 3, target: 60, restSeconds: 30 },
      { exerciseId: 'jab_cross_combo', sets: 3, target: 20, restSeconds: 30 },
      { exerciseId: 'muay_thai_teep', sets: 3, target: 10, restSeconds: 30 },
      { exerciseId: 'squat_roundhouse', sets: 2, target: 8, restSeconds: 40 },
      { exerciseId: 'kalaripayattu_eagle', sets: 2, target: 5, restSeconds: 45 },
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
  /** How the reps were recorded: counted by the camera, or entered by the person. */
  verification?: 'camera' | 'manual';
  /** The quest assignment this session was started from, if any. */
  assignmentId?: string;
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

/** Activities logged outside a plan (sport, runs, classes). */
export const ACTIVITY_TYPES = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Rowing',
  'Hiking',
  'Yoga class',
  'Pilates class',
  'Dance',
  'Gym session',
  'Football',
  'Cricket',
  'Badminton',
  'Tennis',
  'Basketball',
  'Martial arts',
  'Climbing',
  'Other',
] as const;

export interface ActivityLog {
  id: string;
  type: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  distanceKm?: number;
  /** 1-10 how hard it felt. */
  effort?: number;
  note?: string;
}

const inLastWeek = (date: string, today: string) => {
  const end = Date.parse(`${today}T00:00:00Z`);
  const d = Date.parse(`${date}T00:00:00Z`);
  return d <= end && end - d < 7 * 86400000;
};

/** Logged activities in the 7 days ending `today`. */
export const activitiesThisWeek = (activities: ActivityLog[], today: string) =>
  activities.filter((a) => inLastWeek(a.date, today)).length;

/** Active minutes in the 7 days ending `today`, from plan sessions and logged activities. */
export function activeMinutesThisWeek(sessions: WorkoutSession[], activities: ActivityLog[], today: string): number {
  const inWeek = (date: string) => inLastWeek(date, today);
  const planMinutes = sessions
    .filter((s) => inWeek(s.date))
    .reduce((sum, s) => sum + Math.max(1, Math.round((Date.parse(s.finishedAt) - Date.parse(s.startedAt)) / 60000)), 0);
  const activityMinutes = activities.filter((a) => inWeek(a.date)).reduce((sum, a) => sum + a.minutes, 0);
  return planMinutes + activityMinutes;
}

// ---------------------------------------------------------------- suggestions

export interface PlanSuggestion {
  plan: WorkoutPlan;
  reason: string;
}

const JOINT_LIMITS = ['Knees or joints', 'Low impact only', 'Lower back', 'Recovering / low energy'];

/**
 * Up to three plans that suit the person today: rest days get recovery, a gentle pace gets
 * seated, mobility and balance work, a strong pace gets gym and intervals. Plans done in the
 * last two days, or that brought pain last time, drop down the list. Deterministic.
 */
export function suggestPlans(input: {
  capacity: 'gentle' | 'steady' | 'strong';
  restDay: boolean;
  constraints: string[];
  sessions: WorkoutSession[];
  today: string;
}): PlanSuggestion[] {
  const { capacity, restDay, constraints, sessions, today } = input;
  const recent = new Set(
    sessions.filter((s) => Date.parse(`${today}T00:00:00Z`) - Date.parse(`${s.date}T00:00:00Z`) < 2 * 86400000).map((s) => s.planId),
  );
  const hurt = new Set(sessions.filter((s) => s.painReported).slice(0, 5).map((s) => s.planId));
  const jointLimit = constraints.some((c) => JOINT_LIMITS.includes(c));
  const sitting = constraints.includes('Mostly sitting all day');

  const order: { setting: WorkoutPlan['setting']; reason: string }[] = restDay
    ? [{ setting: 'recovery', reason: 'You chose a rest day: easy movement only.' }]
    : capacity === 'gentle'
      ? [
          { setting: 'seated', reason: 'Gentle pace: everything from a chair.' },
          { setting: 'recovery', reason: 'Gentle pace: easy walking and mobility.' },
          { setting: 'yoga', reason: 'Gentle pace: breath-led mobility.' },
          { setting: 'balance', reason: 'Gentle pace: steadier on your feet.' },
        ]
      : capacity === 'strong'
        ? [
            { setting: 'gym', reason: 'You are active most days: progressive strength.' },
            { setting: 'hiit', reason: 'For a high-energy day.' },
            { setting: 'home', reason: 'No equipment needed.' },
            { setting: 'cardio', reason: 'Heart and lungs.' },
          ]
        : [
            { setting: 'home', reason: 'Steady pace: strength at home, no equipment.' },
            { setting: 'cardio', reason: 'Steady pace: low-impact cardio.' },
            { setting: 'pilates', reason: 'Steady pace: core and posture.' },
            { setting: 'yoga', reason: 'Steady pace: mobility and calm.' },
          ];
  if (sitting && !restDay) order.unshift({ setting: 'desk', reason: 'You sit most of the day: hips, back and shoulders.' });

  const picked: PlanSuggestion[] = [];
  for (const { setting, reason } of order) {
    const plans = PLANS.filter(
      (p) =>
        p.setting === setting &&
        !(jointLimit && (p.setting === 'hiit' || p.level === 'intermediate')) &&
        !(capacity === 'gentle' && p.level !== 'beginner'),
    ).sort((a, b) => Number(recent.has(a.id) || hurt.has(a.id)) - Number(recent.has(b.id) || hurt.has(b.id)));
    const plan = plans.find((p) => !picked.some((x) => x.plan.id === p.id));
    if (plan) picked.push({ plan, reason: hurt.has(plan.id) ? `${reason} Last time it hurt: go easier.` : reason });
    if (picked.length === 3) break;
  }
  return picked;
}
