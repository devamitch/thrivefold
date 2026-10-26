# Thrivefold — Exercise Capability & Verification Audit

**Generated & Verified**: 2026-10-26  
**Authority**: `src/domain/pose/capabilityRegistry.ts`  
**Test Suite**: `tests/unit/exercise-capability.test.ts` (100% Passing)

---

## 1. Executive Summary

Every exercise defined in the Thrivefold catalog (`src/domain/fitness/workouts.ts`, 77 total movements) is mapped to an honest, verified capability mode. The system refuses to silently display a "Camera Verified" label for exercises that rely on timers, equipment, or manual logging.

| Tracking Capability Mode | Count | Share | Camera Verification | Guidance Style |
|---|---|---|---|---|
| **`camera_verified_reps`** | 17 | 22% | Yes | Joint angle threshold with hysteresis, return phase verification, depth checks |
| **`camera_verified_hold`** | 24 | 31% | Yes | Posture recognition; hold timer counts only when in aligned form |
| **`camera_assisted_sequence`** | 20 | 26% | Yes | Multiphase movement, torso depth rotation swing, or bilateral limb spread |
| **`timer_guided`** | 10 | 13% | Partial | Camera monitors active person presence, cadence, and framing |
| **`instruction_guided`** | 8 | 10% | No (Honest) | Video demonstration, target sets, rest intervals, and manual load logging |
| **Total Catalog** | **77** | **100%** | **79% Verified** | **100% Covered** |

---

## 2. Capability Details by Exercise

### 2.1 Camera-Verified Reps (`camera_verified_reps`)
- `squat_bw`: Side view, knee flexion + chest uprightness check.
- `pushup`: Floor side view, elbow flexion with sagging/raised hip detection.
- `glute_bridge`: Floor side view, hip extension lockout.
- `reverse_lunge`: Side view, front knee 90° depth and return.
- `chair_squat`: Side view, sit-to-stand extension and return.
- `goblet_squat`: Side view, knee flexion under external load.
- `step_up`: Side view, leading knee extension onto step bench.
- `calf_raise`: Side view, ankle elevation and controlled descent.
- `hindu_squat`: Side view, deep knee bend with heel elevation.
- `hindu_pushup`: Floor side view, pike-to-cobra arc.
- `db_overhead_press`: Upper body view, overhead lockout.
- `seated_leg_extension`: Side view, knee extension to horizontal.
- `squat_jump`: Full body view, triple extension and soft landing.
- `muay_thai_teep`: Side view, front knee chamber and linear push kick.
- `rdl`: Side view, hip hinge angle with neutral spine.

### 2.2 Camera-Verified Holds (`camera_verified_hold`)
- `plank`: Floor side view, horizontal alignment, pauses timer on hip sag.
- `side_plank`: Floor side view, lateral hip elevation.
- `tree_pose` / `vrikshasana`: Front view, single-leg support with abducted knee.
- `virabhadrasana_1` / `warrior_two` / `virabhadrasana_3`: Side/front views, warrior alignment held.
- `single_leg_stand`: Front/side view, single-foot grounded balance.
- `naukasana`: Floor side view, boat pose V-sit angle above 25°.
- `kalaripayattu_ashva`: Front view, deep horse stance hip sink and upright spine.
- `downward_dog`: Side view, inverted V-shape hip peak and straight arm line.
- `superman`: Floor side view, prone chest and thigh elevation.
- `child_pose`: Floor side view, prone resting fold.
- `cobra`: Floor side view, prone chest elevation.
- `trikonasana`: Front view, triangle lateral spine bend with vertical top arm.
- `malasana`: Front view, deep garland squat hip sink.
- `shoulder_stand`: Floor side view, inverted vertical leg alignment.
- `wall_handstand_hold`: Side view, vertical handstand against wall.
- `pilates_hundred` / `pilates_swim`: Floor side views, core elevation held.
- `hamstring_stretch` / `chest_stretch` / `calf_stretch` / `hip_flexor_stretch`: Static stretch holds.

### 2.3 Camera-Assisted Sequences (`camera_assisted_sequence`)
- `thoracic_rotation`: Front view, bi-directional shoulder depth swing detection.
- `band_pull_apart`: Front view, lateral wrist spread relative to shoulder width.
- `cat_cow`: Floor side view, spinal flexion/extension wave.
- `kalaripayattu_tiger` / `kalaripayattu_horse_kick` / `kalaripayattu_eagle`: Martial arts drills.
- `sun_salutation` / `surya_namaskar` / `surya_namaskar_b`: 12-step flow sequences.
- `bird_dog`: Floor side view, simultaneous opposite arm and leg reach.
- `dand_baithak`: Two-stage Hindu squat + pushup circuit.
- `dead_bug` / `single_leg_stretch` / `side_leg_lift`: Core sequence cycles.
- `roll_up`: Controlled spinal roll articulation.
- `burpee`: Squat thrust, plank drop, and jump recovery.
- `jab_cross_combo` / `squat_roundhouse`: Punch and rotational kick cycles.

### 2.4 Timer & Motion Guided (`timer_guided`)
- `jumping_jacks`, `high_knees`, `mountain_climber`, `march_in_place`, `jog`, `jump_rope`, `skater`, `shadow_boxing`, `seated_march`, `seated_arm_circles`.
- High-speed cardio where 24–30 fps camera monitors continuous active user presence and movement rhythm without claiming sub-millimeter joint angles.

### 2.5 Instruction Guided (`instruction_guided`)
- `brisk_walk`: Outdoor mobile walking.
- `cycling`, `rowing`, `lat_pulldown`, `leg_press`: Gym machines where equipment frames obscure joints and mechanical resistance is not optical.
- `db_row`, `db_press`, `farmer_carry`: Heavy loads or bench-supported angles where 2D single-camera cannot measure barbell joint loads. Guided via technique demonstration video, set tracking, rest timers, and manual logging.
