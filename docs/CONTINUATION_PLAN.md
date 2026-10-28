# Thrivefold — Health OS Continuation Plan

**Last Updated:** October 29, 2026  
**Status:** Uploaded to Google Play Internal Track & Global Beta Mode Implemented  
**Target Release:** 1.0.3 (v4)

---

## 1. Executive Summary & Baseline

Thrivefold has evolved from an activity tracker into a local-first, privacy-respecting **Health OS**. All health readings (steps, active calories, sleep, heart rate, camera workouts) preserve strict provenance (`measured locally`, `health provider`, `estimated`, or `manual`), calculate real historical metrics, and link deterministically to daily quests and check-ins without duplicating records.

---

## 2. Completed Milestones

### P0 — Safety & Release Readiness
- **Version Alignment:** Version `1.0.3` (build `4`) configured and built cleanly.
- **Fastlane Deployment:** Successfully uploaded release bundle (`app-release.aab` v4) to the Google Play Internal testing track via Fastlane supply with clean production changelog `4.txt` (zero mentions of beta).
- **Owner access:** decided only by the server RPC `public.tf_is_owner()` (verified email in `tf_owners`). The earlier client-side `EXPO_PUBLIC_OWNER_EMAIL` shortcut was removed on 2026-10-29: a public env value matched against a local profile is not proof of ownership.

### P1 — Unified Health OS Foundation, Metric Registry & Provenance
- **Metric Registry:** `src/domain/health/metricRegistry.ts` establishes single source of truth for units, live/historical support, provenance, and aggregation rules across steps, calories, heart rate, sleep, hydration, and screen time.
- **Beta Capabilities Registry:** Complete catalogue of 8 on-device vision, AI, sensor, and activity technologies with honest statuses (`working`, `beta`, `research_only`), required models, permissions, and data outputs.
- **Calorie & Activity Model:** Documented MET-based active calorie calculation (`src/domain/activity/calories.ts`) distinguishing measured phone steps, treadmill, walking pad, home gym / dumbbell workouts, and logged sports.
- **Deduplication:** Step-based activities (walking, running, hiking, treadmill) automatically deduplicated against active step counter so calories are never double-counted.

### P2 — Live Steps, Calories & Analytical Dashboard
- **Steps Tile & Detail Sheet:** Live step counts, hourly breakdown sparkline, yesterday comparison, quest goal indicators, walking insights (walking minutes, distance, peak active hour), and goal completion streaks.
- **Calorie Detail Sheet:** `CalorieDetailSheet.tsx` presents daily calorie goal progress, yesterday comparison card (`X kcal more/fewer than yesterday`), week/month historical equalizer bars via `MetricBarChart`, and activity source percentage breakdown.
- **Health Connect Auto-Population:** Check-in screen automatically detects and pre-populates measured sleep from Health Connect with an honest sync indicator badge.

### P3 — Activity Sessions & Workouts
- Supported activities: Walking, Running, Treadmill / Walking Pad, Home Gym / Dumbbells, Cycling, Swimming (with provider import or manual fallback).
- **Live Activity Timer:** `src/app/(app)/health/activity.tsx` features start/pause/resume/finish states with live duration and real-time MET calorie burn calculations based on body weight.

### P4 — Local Schedules & Screen Time
- **Schedule Identification:** `src/domain/productivity/screenTime.ts` identifies local active session duration, detects working schedules (e.g. standard vs night shift vs heavy desk), and triggers 20-20-20 eye strain breaks and posture checks.

### P5 — Global Beta Mode & Beta Lab
- **Golden BETA Badge:** Polished theme-aligned badge in warm brass/amber tokens (`BetaBadge`) visible across home header, developer tools, activity timer, and beta catalogue.
- **Global Beta Mode Switch:** Central toggle in Dev Tools and Beta Lab activating experimental features, surfacing the Beta Lab in Tools grid, and displaying the Health OS Beta Active banner on Home.
- **Beta Lab Capabilities View:** Dedicated registry tab in `BetaLabScreen` exposing all experimental technologies with honest statuses, models required, and one-tap studio launches.
- **Eye & Hand Studios:** Real-time eye aspect ratio (EAR) analysis, blink counter, rolling blinks/min frequency distribution, 21-point hand tracking with grip rep counting, and offline voice coach guidance.

### P6 — Progress & Health Trends
- **Health Trends Tab:** Added third tab to `src/app/(app)/(tabs)/progress.tsx` offering 7-day and 30-day equalizer bar charts for Daily Steps, Active Energy, Hydration, and Sleep duration.

### P7 — BlinkQuest Eye Metrics & Vision Wellness Suite
- **Eye Battery Daily Energy Model:** Mathematical drain & recharge engine (`src/domain/vision/eyeBattery.ts`) persisting to encrypted local storage via MMKV. Drains based on continuous screen focus, low blink rate (<8 bpm), close device distance (<25 cm), and heavy eye closure; recharges via breaks and eye exercises.
- **Reading Ergonomics & Harmon Distance:** `src/domain/vision/readingErgonomics.ts` computes optical screen distance from normalized interpupillary geometry, downward gaze inclination angle (15°–25° dry-eye prevention standard), and Harmon reading zone classification (Too Close / Optimal / Far).
- **Non-Nagging Eye Alerts:** `src/domain/vision/eyeAlerts.ts` evaluates real measured fatigue signals (`too_close`, `low_blink`, `eyes_closing`, `break_due`, `battery_low`) with non-nagging cooldowns (3–30 mins).
- **Interactive Eye Routines:**
  - `BlinkBloomExercise.tsx`: 8-petal blooming flower guided routine detecting complete slow blinks via EAR.
  - `NearFarFocusExercise.tsx`: Guided 20-20-20 accommodation exercise relaxing ciliary muscle tension.
  - `VisualAcuityChart.tsx`: Calibrated digital Tumbling E optotype visual acuity test anchored to screen-to-eye distance.
- **Screen Time Card on Home:** `ScreenTimeCard.tsx` mounted on Home dashboard providing active screen time, recommended breaks, and direct links to Eye Studio and Desk Reset.
- **Unit Test Coverage:** 8 new unit tests in `tests/unit/eye-metrics.test.ts` (361 total unit tests passing).

---

### P8 — Global Beta Mode wiring (2026-10-29)
- **One switch:** `useBetaEnabled()` (`src/hooks/useBetaEnabled.ts`) = `betaMode && (__DEV__ || isOwner)`. Every beta surface reads it; a persisted `betaMode` alone unlocks nothing after sign-out. `beta-lab/_layout.tsx` redirects anyone without access.
- **Entry points in the sections they belong to** (`BetaStudioEntries`): Health hubs (women, men, LGBTQ+) → eye studio, breathing; Workouts → pose coach, grip exercises, Finger Count Challenge; Steps sheet → treadmill / walking pad / swim / ride session; Progress → eye sessions, all studios. Home keeps its Beta banner.
- **New routes:** `beta-lab/gesture-game` (full-screen, coach-voiced Finger Count Challenge, pure rules in `domain/vision/fingerGame.ts`) and `beta-lab/breathing` (paced breathing with spoken cues, `domain/wellbeing/breathing.ts`).
- **History:** finished eye, blink-bloom, grip, game and breathing sessions are saved as derived numbers (`betaSessions` in the app slice, MMKV) and drawn per route by `BetaSessionHistory`.
- **Truthfulness fixes:** the eye studio no longer seeds 42 cm / 92 % / fake blink history; values show "—" until a face is tracked (`EyeState.tracked`). The acuity game no longer claims a 5-arcmin benchmark. Camera permission is requested by the eye, hand, game and pose studios before the camera starts.
- **Fake result removed:** `beta-lab/food-lens` showed a hard-coded "Dal Makhani 485 kcal" result on a "scan" button. Deleted; the Food Lens entry now opens the real meal scanner.
- **Build fix:** removed `modules/setu-beta-scanner` (340 MB of duplicated models, unused by any screen) and `modules/blinkquest-vision` (unused copy that required `react-native-vision-camera`, which Thrivefold does not install). The face landmarker in `modules/pose-landmarker` serves the eye studio.

### P9 — Beta practice connected to the rest of the app (2026-10-29)
- **Quests:** a breathing session of 60 s or more completes today's open guided-exercise quest (e.g. grounding) through `completePracticeQuest` → `submitQuestEvidence`, so duplicates and stale days are refused. Camera studio results never change quests or stable metrics.
- **One recorder:** `services/beta/recordSession.ts` saves every studio session and applies quest rules.
- **Home:** the Beta card shows today's practice sessions and minutes. **Progress:** 7-day guided-practice minutes chart (`getPracticeMinuteBars`).
- **Coach voice preference:** `coachVoiceEnabled` (persisted) is applied app-wide in `(app)/_layout.tsx`; the Spoken Coach screen's dead speech-rate chips were replaced by this switch.
- **Cloud backup:** weekly summaries now carry `practiceSessions` / `practiceMinutes` (counts only). Migration 18 adds the columns and `tf_upsert_weekly_summary_v2`; pushed to the Thrivefold project on 2026-10-29 (old RPC kept for builds already installed). RLS tests: 160 pass.

### P10 — Face exercises and Thrive Coach assistant (2026-10-29)
- **`beta-lab/face-exercises`:** full-screen, coach-voiced routine (brow lifts, wide smile, jaw opener, eye squeeze, look left, look right). Calibrates on the person's relaxed face, then counts reps from face-landmark ratios normalised by eye distance (`domain/vision/faceExercises.ts`, 6 tests). Left/right gaze only; up/down is not reliable from 2D iris points. Not therapy for facial palsy.
- **`beta-lab/assistant` (Thrive Coach):** typed requests → rule-based commands (`domain/assistant/commands.ts`, 8 tests) → actions on the phone (`services/assistant/runCommand.ts`): open any studio or screen, log water, today's steps / water / calories / quests. Open questions go to the on-device LLM (`modules/local-ai`) when a model is loaded; otherwise the coach says so and links model setup or cloud Ask Thrive. Replies are spoken. On Home's tools grid when Beta is on.
- **Blocked — voice input and voice practice:** both need the microphone. `RECORD_AUDIO` is in `app.json` `blockedPermissions` and agents may not edit `app.json`; the owner must decide (it changes the Play permission list). Plan once approved: `expo-speech-recognition@3.1.3` (SDK 54/55 line), on-device recogniser, volume events for sustained-vowel and loudness drills, transcript match for word repetition, mic button in Thrive Coach using the same command router.

### Route ↔ capability matrix (beta)
| Route | Capability | Input | Saved |
| --- | --- | --- | --- |
| `beta-lab/eye-tracking` | Blink rate, screen distance, gaze angle, Blink Bloom, near/far, focus game | Face landmarker | `eye_scan`, `blink_bloom` |
| `beta-lab/hand-gestures` | Grip reps, finger count, wrist mobility | Hand landmarker | `hand_grip` |
| `beta-lab/gesture-game` | Finger Count Challenge with coach voice | Hand landmarker | `finger_game` |
| `beta-lab/breathing` | Paced breathing with coach voice | Timer | `breathing` |
| `beta-lab/face-exercises` | Face & eye exercises with coach voice | Face landmarker | `face_exercise` |
| `beta-lab/assistant` | Thrive Coach: commands, today's numbers, on-device LLM answers | Text (voice blocked) | water log |
| `beta-lab/pose-coach` | Skeleton, joint angles, reps | Pose landmarker | — |
| `health/meal-log` (Beta Lab "Food Lens" opens it) | Meal photo labels → server macros | Food classifier + meal-vision function | meal log |
| `beta-lab/voice-coach` | Coach voice test bench | expo-speech | — |
| `health/activity` | Timed sessions incl. treadmill, walking pad, swim, ride | Timer + MET estimate | activity log |

Not done: touchless pointer control (research only), segmentation/OCR (no model bundled), system-wide screen time (Usage Access not implemented; only Thrivefold's own foreground time), SQLite aggregation and periodic cloud sync of beta sessions.

## 3. Verification Gates
- **Type Checking:** `pnpm compile` (`tsc --noEmit`) -> **PASS (0 errors)**.
- **Linting:** `pnpm lint` (`eslint src tests --quiet`) -> **PASS (0 errors)**.
- **Unit Testing:** `pnpm test` (`jest`) -> **PASS (55/55 test suites, 361 tests passed)**.
- **Gradle Release Build:** Previously verified -> **BUILD SUCCESSFUL**.


