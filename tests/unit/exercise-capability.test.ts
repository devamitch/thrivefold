import { EXERCISES } from '../../src/domain/fitness/workouts';
import {
  getAllExerciseCapabilities,
  getCapabilityRegistrySummary,
  getExerciseCapability,
  isCameraVerifiedExercise,
} from '../../src/domain/pose/capabilityRegistry';

describe('Exercise Capability Registry (§7)', () => {
  test('all 56 catalog exercises have an explicit capability record', () => {
    const all = getAllExerciseCapabilities();
    expect(all.length).toBe(EXERCISES.length);
    const unconfigured = EXERCISES.filter((e) => !require('../../src/domain/pose/capabilityRegistry').CAPABILITY_CONFIG[e.id]).map(e => e.id);
    console.log('Unconfigured in CAPABILITY_CONFIG:', unconfigured);
    expect(all.length).toBe(77);

    for (const ex of EXERCISES) {
      const cap = getExerciseCapability(ex.id);
      expect(cap).toBeDefined();
      expect(cap.exerciseId).toBe(ex.id);
      expect(cap.name).toBe(ex.name);
      expect(cap.badgeLabel).toBeDefined();
      expect(['camera_verified_reps', 'camera_verified_hold', 'camera_assisted_sequence', 'timer_guided', 'instruction_guided'])
        .toContain(cap.mode);
      expect(['full', 'upper', 'floor', 'any']).toContain(cap.framing);
      expect(['side', 'front', 'side_preferred', 'front_or_side', 'any']).toContain(cap.cameraAngle);
    }
  });

  test('honest support levels: equipment and machine exercises are instruction-guided', () => {
    // Exercises using stationary machines or outdoor brisk walks cannot claim 2D camera joint verification
    const machineOrOutdoor = ['cycling', 'rowing', 'leg_press', 'lat_pulldown', 'brisk_walk', 'farmer_carry'];
    for (const id of machineOrOutdoor) {
      const cap = getExerciseCapability(id);
      expect(cap.mode).toBe('instruction_guided');
      expect(cap.isCameraVerified).toBe(false);
      expect(isCameraVerifiedExercise(id)).toBe(false);
      expect(cap.badgeLabel).toBe('Instruction Guided');
    }
  });

  test('honest support levels: core bodyweight movements are camera-verified', () => {
    const verifiedReps = ['squat_bw', 'pushup', 'glute_bridge', 'reverse_lunge', 'chair_squat', 'calf_raise', 'step_up', 'hindu_squat', 'hindu_pushup'];
    for (const id of verifiedReps) {
      const cap = getExerciseCapability(id);
      expect(cap.mode).toBe('camera_verified_reps');
      expect(cap.isCameraVerified).toBe(true);
      expect(isCameraVerifiedExercise(id)).toBe(true);
    }

    const verifiedHolds = ['plank', 'side_plank', 'tree_pose', 'vrikshasana', 'virabhadrasana_1', 'virabhadrasana_3', 'naukasana', 'superman', 'downward_dog'];
    for (const id of verifiedHolds) {
      const cap = getExerciseCapability(id);
      expect(cap.mode).toBe('camera_verified_hold');
      expect(cap.isCameraVerified).toBe(true);
      expect(isCameraVerifiedExercise(id)).toBe(true);
    }
  });

  test('honest support levels: sequence-assisted exercises have sequence mode', () => {
    const sequences = ['thoracic_rotation', 'band_pull_apart', 'cat_cow', 'kalaripayattu_tiger', 'dand_baithak', 'dead_bug'];
    for (const id of sequences) {
      const cap = getExerciseCapability(id);
      expect(cap.mode).toBe('camera_assisted_sequence');
      expect(cap.isCameraVerified).toBe(true);
      expect(isCameraVerifiedExercise(id)).toBe(true);
      expect(cap.badgeLabel).toBe('Sequence Guided');
    }
  });

  test('honest support levels: fast cardio exercises are timer and motion guided', () => {
    const cardio = ['jumping_jacks', 'high_knees', 'mountain_climber', 'march_in_place', 'jog', 'jump_rope', 'shadow_boxing'];
    for (const id of cardio) {
      const cap = getExerciseCapability(id);
      expect(cap.mode).toBe('timer_guided');
      expect(cap.isCameraVerified).toBe(false);
      expect(cap.badgeLabel).toBe('Timer & Motion');
    }
  });

  test('catalog capability summary metrics are accurate and measurable', () => {
    const summary = getCapabilityRegistrySummary();
    expect(summary.totalExercises).toBe(77);
    expect(summary.cameraVerifiedReps).toBeGreaterThanOrEqual(13);
    expect(summary.cameraVerifiedHolds).toBeGreaterThanOrEqual(18);
    expect(summary.cameraAssistedSequences).toBeGreaterThanOrEqual(10);
    expect(summary.totalCameraTracked).toBe(summary.cameraVerifiedReps + summary.cameraVerifiedHolds + summary.cameraAssistedSequences);
    expect(summary.timerGuided).toBeGreaterThanOrEqual(7);
    expect(summary.instructionGuided).toBeGreaterThanOrEqual(8);
    expect(summary.verifiedCoveragePercent).toBeGreaterThanOrEqual(70);
  });
});
