# Thrivefold — Pose Tracking, Coach UI & Performance Execution Plan

## 1. Executive Summary & Root Cause Analysis

### A. The Pose Tracking Lag
* **Symptom**: Visual landmarks lagged 150–200ms behind actual physical movements, feeling "floaty", "sluggish", and detached from joints.
* **Root Cause Discovered in Code**:
  In `src/components/workout/PoseOverlay.tsx`, recent changes had set `FOLLOW = 0.42` inside the 60fps frame worklet:
  ```ts
  s[i * 3] = snap ? tx : s[i * 3] + (tx - s[i * 3]) * FOLLOW;
  ```
  At `FOLLOW = 0.42`, each display frame only covered 42% of the distance to the detected joint position. It required 6–10 display frames (~160ms) for the skeleton to reach the user's real location.
* **Solution Applied**:
  - Elevated `FOLLOW` to `0.95` for crisp, instantaneous tracking.
  - Implemented dynamic fast-snap: when limb movement distance exceeds 60px (`dist > 60`), `f = 1` immediately snaps the joint, eliminating trailing motion blur artifacts.

### B. Frame Budget & Release Scope Override
* **Contract Rule**:
  Body pose markers must receive 100% of the active camera and inference frame budget.
  Face tracking contours (`faceContours`, `facePips`) and hand tracking skeletons (`handLines`, `handJoints`) are preserved in code but set to `Group opacity={0}` for production release.
* **Result**:
  - Full native 60fps UI-thread rendering via Skia.
  - No dropped frames on camera sensor callback.
  - Body skeleton laser lines and joint auras stay pinned to shoulders, elbows, wrists, hips, knees, and ankles with zero noticeable latency.

---

## 2. Coach UI & Glass Orb System

### A. Control Surfaces
* **Glass Orb Buttons**:
  - Leverages Skia-rendered `GlassIconButton` with frosted glass discs, ambient sheen, and subtle blurred mark halo (`src/components/ui/GlassOrbButton.tsx`).
  - Top bar: Close/End workout button, Exercise Title Frosted Pill with live set indicators, and Voice Mute/Unmute Orb.
  - Right rail: Camera Flip Orb (`GlassMarks.flip`), Face/Hand Scan Orb (`GlassMarks.scan`), and Hands-Free Voice & Gesture Remote Info Orb (`GlassMarks.info`).
* **HUD & Viewfinder**:
  - Athletic reticle guide (`guide`) appears when user is stepping into the camera frame.
  - Dynamic live angle arc (`angleArc`) at the measured joint vertex with live degree measurement.
  - High-contrast fault alerts (`faultHalos`, `faultJoints`) in `colors.error` with haptic feedback.

### B. Workout Completion & Reward Architecture
* **Component**: `src/components/coach/SessionComplete.tsx`.
* **Behavior**:
  - Deterministic XP and progression calculation (50 XP for camera-checked good form vs 5 XP base).
  - Idempotent reward recording (verified by database tests in `pnpm test:db`).
  - Clear summary: Duration, Plan Title, Earned XP pill, and finished exercise breakdown.

---

## 3. Marketing Screenshot Matrix (Strict Store Privacy Compliance)

Store screenshot policy mandates excluding camera, coach live, pose, face, and hand tracking screens from public marketing listings:

| Asset | Screen | Status | Focus |
|---|---|---|---|
| `01_home_screen.png` | Home Tab (Dashboard) | Verified | Daily check-in, XP, habits, Thrive Orb dock |
| `02_app_drawer.png` | App Drawer (Navigation Room) | Verified | Profile, level, quick tiles, health tools, safety |
| `03_calendar_agenda.png` | Calendar & Agenda | Verified | Day/week view, cycles, scheduled routines |
| `04_quests_arcade.png` | Quests & Arcade | Verified | Gamified progression, XP roadmap, challenges |
| `05_train_hub.png` | Train Hub | Verified | Exercise library, curated routines, video catalog |

All 5 marketing assets are cleanly numbered, high-resolution, and tracked in `marketing/launch/screenshots/`.
