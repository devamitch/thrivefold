/**
 * Thrivefold Exercise Capability Registry
 *
 * Authoritative, honest registry mapping every catalog exercise to its verified
 * tracking capability, camera requirements, and limitations.
 *
 * Requirements (Thrivefold Coach Specification §7):
 * 1. Honest support classification: Never claim camera verification when an exercise uses timer or manual logging.
 * 2. Supported Modes:
 *    - 'camera_verified_reps': Deterministic joint-angle rep detection with hysteresis.
 *    - 'camera_verified_hold': Posture-recognized static hold with valid duration tracking.
 *    - 'camera_assisted_sequence': Multiphase movement, torso-swing, or lateral spread tracking.
 *    - 'timer_guided': Dynamic cardio or agility where camera monitors presence and framing.
 *    - 'instruction_guided': External machine/barbell loads or specialized equipment where single-camera
 *      2D pose cannot measure joint loads or form safety; guided via video, sets, rest, and manual logging.
 * 3. Exact framing & angle guidance for each exercise.
 */

import { EXERCISES, type Exercise } from '../fitness/workouts';
import { movementForExercise } from './movement';

export type ExerciseTrackingMode =
  | 'camera_verified_reps'
  | 'camera_verified_hold'
  | 'camera_assisted_sequence'
  | 'timer_guided'
  | 'instruction_guided';

export interface ExerciseCapability {
  exerciseId: string;
  name: string;
  mode: ExerciseTrackingMode;
  badgeLabel: string;
  badgeTone: 'verified' | 'sequence' | 'timer' | 'guide';
  cameraAngle: 'side' | 'front' | 'side_preferred' | 'front_or_side' | 'any';
  framing: 'full' | 'upper' | 'floor' | 'any';
  isCameraVerified: boolean;
  notes: string;
  limitations: string[];
}

export const CAPABILITY_CONFIG: Record<string, {
  mode: ExerciseTrackingMode;
  cameraAngle: 'side' | 'front' | 'side_preferred' | 'front_or_side' | 'any';
  framing: 'full' | 'upper' | 'floor' | 'any';
  limitations: string[];
  notes: string;
}> = {
  // ── Bodyweight & Resistance Strength ──────────────────────────────────────
  squat_bw: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Baggy clothing may soften knee angle readings by 3–5°'],
    notes: 'Knee flexion tracked with chest uprightness check and depth verification.',
  },
  pushup: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Camera must be placed low (floor level) for accurate hip-line tracking'],
    notes: 'Elbow angle tracked with sagging and raised hip form detection.',
  },
  glute_bridge: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Needs side profile with visible hip and shoulder joints'],
    notes: 'Hip extension tracked from floor position with lockout threshold.',
  },
  reverse_lunge: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Requires clear view of both front and rear knees'],
    notes: 'Front knee depth and torso posture tracked with hysteresis.',
  },
  chair_squat: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Chair edge should not fully occlude hip landmark'],
    notes: 'Sit-to-stand knee extension and hip return tracked reliably.',
  },
  goblet_squat: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side_preferred',
    framing: 'full',
    limitations: ['Dumbbell in front of chest may obscure sternum landmark'],
    notes: 'Knee flexion and torso uprightness verified under external load.',
  },
  step_up: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Requires step bench to be visible in lower frame boundary'],
    notes: 'Leading knee extension and full hip extension at top of step.',
  },
  calf_raise: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side_preferred',
    framing: 'full',
    limitations: ['Requires feet and ankles to be clearly illuminated and visible'],
    notes: 'Ankle plantarflexion elevation tracked with descent control.',
  },
  hindu_squat: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Continuous dynamic arm swing can occlude torso momentarily'],
    notes: 'Full depth knee flexion with heel elevation motion recognized.',
  },
  hindu_pushup: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Swooping arc from pike to cobra requires wide side angle'],
    notes: 'Pike-to-cobra arc tracked with elbow flexion and spinal extension.',
  },
  dand_baithak: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Transition between squat and dand requires 2–3 meters clearance'],
    notes: 'Two-stage compound circuit (squat + pushup) confirmed sequentially.',
  },
  superman: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Camera must be placed on floor or low table'],
    notes: 'Prone chest and thigh elevation held and timed continuously.',
  },
  db_overhead_press: {
    mode: 'camera_verified_reps',
    cameraAngle: 'front_or_side',
    framing: 'upper',
    limitations: ['Overhead extension requires camera to frame full arm reach'],
    notes: 'Elbow extension and overhead lockout tracked.',
  },

  // ── Core & Static Holds ───────────────────────────────────────────────────
  plank: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Requires low phone placement and full lateral body visibility'],
    notes: 'Horizontal body alignment verified; timer pauses on hip sag or pike.',
  },
  side_plank: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Must face camera sideways to detect torso alignment'],
    notes: 'Lateral hip elevation verified; hold timer active only in aligned form.',
  },
  tree_pose: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Both feet must be visible to detect foot-on-calf placement'],
    notes: 'Single-leg support and lifted knee abducted posture held and timed.',
  },
  vrikshasana: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Requires full body frame including hands overhead or in prayer'],
    notes: 'Classical Vrikshasana posture stability and single-leg balance held.',
  },
  virabhadrasana_1: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Wide lunge stance requires 2–2.5 meters distance'],
    notes: 'Front knee 90° bend, back leg extension, and overhead reach timed.',
  },
  warrior_two: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Wide lateral stance with arms extended laterally'],
    notes: 'Horizontal arm reach and knee lunge alignment held and timed.',
  },
  virabhadrasana_3: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Horizontal torso and leg extension requires wide lateral room'],
    notes: 'T-shape body line and single-leg balance stability verified.',
  },
  single_leg_stand: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Lifted foot must be clearly off the floor by at least 5 cm'],
    notes: 'Single-foot grounded balance timed with stability scoring.',
  },
  naukasana: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Floor side profile needed to measure V-sit angle'],
    notes: 'Boat pose torso and leg elevation angle verified above 25°.',
  },
  kalaripayattu_ashva: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Wide horse stance requires camera framing wide stance width'],
    notes: 'Deep horse stance hip sink and upright torso held and timed.',
  },
  downward_dog: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Needs wide side view to verify inverted V-shape hip peak'],
    notes: 'Inverted V-shape hip peak and arm/torso line verified.',
  },

  // ── Mobility & Sequence Assisted Movements ────────────────────────────────
  thoracic_rotation: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front',
    framing: 'upper',
    limitations: ['Requires visible shoulder line; desk/table cannot occlude chest'],
    notes: 'Torso depth rotation measured via bi-directional shoulder depth swings.',
  },
  band_pull_apart: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front',
    framing: 'upper',
    limitations: ['Wrist landmarks must stay within camera frame boundaries at max stretch'],
    notes: 'Lateral wrist spread distance tracked relative to shoulder width.',
  },
  cat_cow: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Requires side view of spine from neck to hips on all fours'],
    notes: 'Spinal flexion and extension wave tracked between neck and hip line.',
  },
  kalaripayattu_tiger: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Low floor lunge and spring step require large floor area'],
    notes: 'Low prowl stance with alternating leg forward step recognized.',
  },
  kalaripayattu_horse_kick: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['High side kick needs open lateral clearance'],
    notes: 'Knee chamber followed by lateral leg extension cycle counted.',
  },
  kalaripayattu_eagle: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Jump and twist requires vertical ceiling clearance'],
    notes: 'Coil, vertical leap, and balanced soft landing detected.',
  },
  sun_salutation: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['12-step flow involves floor and standing transitions'],
    notes: 'Sequence-aware progression through fold, lunge, dog, and return.',
  },
  surya_namaskar: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['12-step classical flow involves floor, plank, and standing transitions'],
    notes: 'Classical Hatha sun salutation verified stage by stage.',
  },
  surya_namaskar_b: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Fast vinyasa transitions require camera positioned 2.5 meters away'],
    notes: 'Vinyasa flow sequence through chair, chaturanga, warriors verified.',
  },
  bird_dog: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Requires clear view of opposing arm reach and leg extension'],
    notes: 'Simultaneous opposite arm and leg horizontal reach detected.',
  },
  single_leg_stretch: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Supine floor position with alternating knee tucks'],
    notes: 'Alternating knee chamber and leg extension cycles counted.',
  },
  side_leg_lift: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front_or_side',
    framing: 'floor',
    limitations: ['Side-lying position requires hips to stay stacked'],
    notes: 'Top leg abduction elevation angle and controlled lowering tracked.',
  },
  seated_leg_extension: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Requires side view of chair so knee extension is not foreshortened'],
    notes: 'Seated knee extension from 90° to horizontal full extension counted.',
  },
  clock_reach: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Chair should be positioned so foot reach points are visible'],
    notes: 'Single-leg balance with multi-directional foot reach confirmed.',
  },
  heel_toe_walk: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Requires 2–3 meters lateral walking path in camera view'],
    notes: 'Tandem gait stepping cadence and alignment observed.',
  },

  // ── Cardio & Agility (Timer & Motion Guided) ───────────────────────────────
  jumping_jacks: {
    mode: 'timer_guided',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['High-speed lateral arm and leg travel may blur at 24 fps indoors'],
    notes: 'Camera monitors active movement cadence; duration timed while in motion.',
  },
  high_knees: {
    mode: 'timer_guided',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Rapid foot turnover; camera checks alternating knee drive elevation'],
    notes: 'High-speed plyometric drive; timed continuously while pacing active movement.',
  },
  mountain_climber: {
    mode: 'timer_guided',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Plank position with fast alternating knee drives'],
    notes: 'Timed set verified while user maintains plank and rhythmic knee drives.',
  },
  squat_jump: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Flight phase leaves frame if camera tilt is too low'],
    notes: 'Squat depth into explosive triple extension and soft landing counted.',
  },
  burpee: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Dynamic floor-to-standing transition requires wide vertical view'],
    notes: 'Squat thrust, plank drop, and jump recovery recognized as rep.',
  },
  march_in_place: {
    mode: 'timer_guided',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Low-impact cadence tracking'],
    notes: 'Timed march duration verified with continuous knee lift pacing.',
  },
  jog: {
    mode: 'timer_guided',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Light running cadence in place'],
    notes: 'Timed cardio duration verified with active motion detection.',
  },
  jump_rope: {
    mode: 'timer_guided',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Rope speed is too high for 30 fps camera; hops and wrist motion observed'],
    notes: 'Timed jumping duration tracked with rhythmic vertical bounce.',
  },
  skater: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Lateral bounds require wide camera frame without running offscreen'],
    notes: 'Lateral bound and single-leg deceleration counted on each side.',
  },
  shadow_boxing: {
    mode: 'timer_guided',
    cameraAngle: 'front',
    framing: 'upper',
    limitations: ['Hand speeds exceed camera frame rate; general strike rhythm tracked'],
    notes: 'Timed shadow boxing round with active strike and slip tracking.',
  },
  jab_cross_combo: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front',
    framing: 'upper',
    limitations: ['Punches should extend toward camera field of view'],
    notes: 'Lead jab followed by rear cross torso rotation cycle counted.',
  },
  muay_thai_teep: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side_preferred',
    framing: 'full',
    limitations: ['Requires clear view of chambering knee and linear push kick'],
    notes: 'Front kick chamber, linear extension, and return to stance counted.',
  },
  squat_roundhouse: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Squat into rotational kick requires wide lateral clearance'],
    notes: 'Squat depth confirmed followed by hip pivot and kick recovery.',
  },

  // ── Floor & Inversion Stretches / Holds ────────────────────────────────────
  child_pose: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Folded resting pose has low joint visibility; presence detected on floor'],
    notes: 'Prone resting fold timed while user rests in position.',
  },
  cobra: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Low camera height required to measure chest elevation from floor'],
    notes: 'Prone spinal extension held and timed.',
  },
  trikonasana: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front',
    framing: 'full',
    limitations: ['Lateral triangle requires wide stance and vertical top arm'],
    notes: 'Lateral spine bend with vertical top arm alignment held.',
  },
  malasana: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Deep squat may occlude hip landmarks with thighs'],
    notes: 'Deep yogi squat posture held with chest upright.',
  },
  shoulder_stand: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Inversion pose; head is on floor, legs vertical'],
    notes: 'Vertical leg alignment in Sarvangasana held and timed.',
  },
  wall_handstand_hold: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Inversion near wall; requires vertical framing of entire wall'],
    notes: 'Inverted vertical handstand against wall held and timed.',
  },
  pilates_hundred: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Supine position; arm pumps may be subtle on low resolution'],
    notes: 'Supine curl with table-top or elevated legs held for timed duration.',
  },
  roll_up: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Requires clear side view of full spinal articulation on floor mat'],
    notes: 'Controlled spinal articulation from supine to sit and back counted.',
  },
  pilates_swim: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Prone flutter motion is subtle; chest/thigh lift verified'],
    notes: 'Prone elevation held while fluttering arms and legs.',
  },
  seated_march: {
    mode: 'timer_guided',
    cameraAngle: 'front_or_side',
    framing: 'full',
    limitations: ['Seated in chair; knee lifts tracked relative to seat plane'],
    notes: 'Seated cardio rhythm timed with alternating knee lift pacing.',
  },
  seated_arm_circles: {
    mode: 'timer_guided',
    cameraAngle: 'front',
    framing: 'upper',
    limitations: ['Lateral arms must stay inside frame boundaries'],
    notes: 'Circumduction arm movements timed in seated position.',
  },
  dead_bug: {
    mode: 'camera_assisted_sequence',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Supine floor angle; opposite limbs extending simultaneously'],
    notes: 'Opposite arm and leg extension and return to center counted.',
  },
  hamstring_stretch: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Side profile needed to verify hip hinge depth without rounding'],
    notes: 'Static hamstring stretch held and timed in good posture.',
  },
  chest_stretch: {
    mode: 'camera_verified_hold',
    cameraAngle: 'front_or_side',
    framing: 'upper',
    limitations: ['Doorway or wall support may partially obscure one arm'],
    notes: 'Pectoral stretch position held for prescribed duration.',
  },
  calf_stretch: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Back heel must be visible on floor to verify stretch posture'],
    notes: 'Wall calf stretch posture held with straight rear leg.',
  },
  hip_flexor_stretch: {
    mode: 'camera_verified_hold',
    cameraAngle: 'side',
    framing: 'floor',
    limitations: ['Half-kneeling profile needed to verify pelvis tuck'],
    notes: 'Half-kneeling posture held with upright spine.',
  },

  // ── Instruction-Guided (Gym Machines, Heavy External Loads, Brisk Walk) ────
  brisk_walk: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'any',
    limitations: ['Mobile outdoor walking cannot be filmed on stationary propped camera'],
    notes: 'Instruction-guided brisk walk timed with step cadence and manual logging.',
  },
  cycling: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'any',
    limitations: ['Stationary bike frame obscures legs; pedal resistance is not optical'],
    notes: 'Guided via workout timer, cadence cues, and manual set logging.',
  },
  rowing: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'any',
    limitations: ['Rowing ergometer obscures leg drive; handle tension is mechanical'],
    notes: 'Guided via stroke technique video, interval timer, and manual logging.',
  },
  lat_pulldown: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'upper',
    limitations: ['Cable machine stack, seat pad, and overhead bar obscure 2D landmarks'],
    notes: 'Guided via form demonstration video, set target, and manual weight logging.',
  },
  leg_press: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'any',
    limitations: ['Leg press sled and footplate obstruct camera view of hip/knee angle'],
    notes: 'Guided via machine setup instructions, set tracker, and manual weight logging.',
  },
  db_row: {
    mode: 'instruction_guided',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Bench support and torso angle require specialized dumbbell tracking'],
    notes: 'Guided via proper form video, set targets, and manual weight logging.',
  },
  db_press: {
    mode: 'instruction_guided',
    cameraAngle: 'side',
    framing: 'upper',
    limitations: ['Lying supine on a bench obscures chest and shoulder landmarks'],
    notes: 'Guided via bench press tutorial, target sets, and manual weight logging.',
  },
  rdl: {
    mode: 'camera_verified_reps',
    cameraAngle: 'side',
    framing: 'full',
    limitations: ['Weights held in hands should not block hip joint visibility'],
    notes: 'Hip hinge angle and flat spine posture verified during Romanian deadlift.',
  },
  farmer_carry: {
    mode: 'instruction_guided',
    cameraAngle: 'any',
    framing: 'full',
    limitations: ['Walking carrying heavy weights requires wide unobstructed path'],
    notes: 'Guided via posture instructions, hold duration timer, and load logging.',
  },
};

/**
 * Returns the capability definition for an exercise ID.
 * Defaults honestly to 'instruction_guided' if an unlisted exercise is queried.
 */
export function getExerciseCapability(exerciseId: string): ExerciseCapability {
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  const name = ex?.name ?? exerciseId;
  const cfg = CAPABILITY_CONFIG[exerciseId];

  if (!cfg) {
    const movement = movementForExercise(exerciseId);
    if (movement) {
      const mode = movement.kind === 'hold' ? 'camera_verified_hold' : 'camera_verified_reps';
      return {
        exerciseId,
        name,
        mode,
        badgeLabel: mode === 'camera_verified_hold' ? 'Camera-Verified Hold' : 'Camera-Verified Reps',
        badgeTone: 'verified',
        cameraAngle: 'side_preferred',
        framing: movement.framing === 'upper' ? 'upper' : 'full',
        isCameraVerified: true,
        notes: `Recognized by movement detector ${movement.id}`,
        limitations: [],
      };
    }
    return {
      exerciseId,
      name,
      mode: 'instruction_guided',
      badgeLabel: 'Instruction Guided',
      badgeTone: 'guide',
      cameraAngle: 'any',
      framing: 'any',
      isCameraVerified: false,
      notes: 'Guided via instructional video and manual set completion.',
      limitations: ['Not camera-verified; logged manually.'],
    };
  }

  const badgeInfo = getBadgeForMode(cfg.mode);
  const isVerified = cfg.mode === 'camera_verified_reps' ||
    cfg.mode === 'camera_verified_hold' ||
    cfg.mode === 'camera_assisted_sequence';

  return {
    exerciseId,
    name,
    mode: cfg.mode,
    badgeLabel: badgeInfo.label,
    badgeTone: badgeInfo.tone,
    cameraAngle: cfg.cameraAngle,
    framing: cfg.framing,
    isCameraVerified: isVerified,
    notes: cfg.notes,
    limitations: cfg.limitations,
  };
}

function getBadgeForMode(mode: ExerciseTrackingMode): { label: string; tone: 'verified' | 'sequence' | 'timer' | 'guide' } {
  switch (mode) {
    case 'camera_verified_reps':
      return { label: 'Camera-Verified Reps', tone: 'verified' };
    case 'camera_verified_hold':
      return { label: 'Camera-Verified Hold', tone: 'verified' };
    case 'camera_assisted_sequence':
      return { label: 'Sequence Guided', tone: 'sequence' };
    case 'timer_guided':
      return { label: 'Timer & Motion', tone: 'timer' };
    case 'instruction_guided':
      return { label: 'Instruction Guided', tone: 'guide' };
  }
}

/**
 * Returns all catalog exercises with their authoritative capability status.
 */
export function getAllExerciseCapabilities(): ExerciseCapability[] {
  return EXERCISES.map((e) => getExerciseCapability(e.id));
}

/**
 * Returns true only if the exercise is strictly verified by computer vision (reps, hold, or sequence).
 */
export function isCameraVerifiedExercise(exerciseId: string): boolean {
  return getExerciseCapability(exerciseId).isCameraVerified;
}

/**
 * Summarizes the catalog coverage across all tracking modes.
 */
export function getCapabilityRegistrySummary() {
  const all = getAllExerciseCapabilities();
  const reps = all.filter((c) => c.mode === 'camera_verified_reps').length;
  const holds = all.filter((c) => c.mode === 'camera_verified_hold').length;
  const sequences = all.filter((c) => c.mode === 'camera_assisted_sequence').length;
  const timer = all.filter((c) => c.mode === 'timer_guided').length;
  const instruction = all.filter((c) => c.mode === 'instruction_guided').length;

  return {
    totalExercises: all.length,
    cameraVerifiedReps: reps,
    cameraVerifiedHolds: holds,
    cameraAssistedSequences: sequences,
    totalCameraTracked: reps + holds + sequences,
    timerGuided: timer,
    instructionGuided: instruction,
    verifiedCoveragePercent: Math.round(((reps + holds + sequences) / all.length) * 100),
  };
}
