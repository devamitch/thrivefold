# Prompt: rebuild Thrivefold's camera Coach so it works like a real personal trainer

Paste everything below into the AI tool you want to try. It is self-contained.

---

You are working in the Thrivefold repo (`Apps/thrivefold`): Expo SDK 55, React Native 0.83
(new architecture), Expo Router, Reanimated 4, Skia 2.4, Zustand. Read `AGENTS.md` first and obey
it (pnpm only, theme tokens only, no fake data, stage only your own files, never `git add -A`).
The test phone is a **Moto G71** (Snapdragon 695, adb serial `ZD2225KYKD`). Judge everything on
that phone with a **release** build, never the emulator.

## What exists today (read these files completely before changing anything)

| Part | File |
| --- | --- |
| Native camera + MediaPipe pose/face/hands | `modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/PoseCameraView.kt` |
| JS bindings, event shape (`PoseFrame`) | `modules/pose-landmarker/index.ts` |
| Skeleton drawing (Skia, UI thread) | `src/components/workout/PoseOverlay.tsx` |
| Rep counting, holds, form faults, framing cues | `src/domain/pose/movement.ts` (+ `tests/unit/pose-movement.test.ts`) |
| Hands-free gestures | `src/domain/pose/gestures.ts` |
| Coach voice lines | `src/domain/pose/coachVoice.ts` |
| Coach screen (intro, live, done) | `src/app/(app)/health/coach/[planId].tsx` |
| Glass panels, progress ring | `src/components/workout/CoachGlass.tsx` |
| Exercise catalogue and plans | `src/domain/fitness/workouts.ts`, videos in `src/content/exerciseVideos.ts` |

Current measured facts on the G71: CPU pose (lite model) gives ~10 results/s, 60-140 ms per
inference; the GPU delegate returned no body on this phone. Preview is a SurfaceView
(`PreviewView.ImplementationMode.PERFORMANCE`) at 1600x1200; analysis 640x480. Each event carries
`capturedAt` (wall-clock ms of the camera frame).

## Problems the owner reports (all must be fixed and shown on the phone)

1. **Landmarks lag behind the body and look dated.** They trail by a visible amount during
   movement and the style looks like a debug overlay.
2. **Many exercises don't count or count wrongly** (e.g. seated thoracic rotation, cat-cow,
   rows). Reps must match what a human coach would count.
3. **The phone gets hot** during a session.
4. **The coach doesn't feel human.** Voice and on-screen guidance feel robotic and generic.
5. **The UI must feel unlike anything else**: full screen, modern, smooth on a mid-range phone.

## Required outcomes

### A. Tracking speed and sync (measure before and after)
- Log per stage: capture→analyse start, bitmap conversion, inference, emit→JS, JS→UI thread.
  Report the numbers.
- Try, measure and keep only what helps:
  - Feed MediaPipe the RGBA buffer without the `Bitmap.createBitmap` rotate/mirror copy (use
    `ImageProcessingOptions.setRotationDegrees` and mirror x in output); verify alignment.
  - Analysis resolution 480x360 vs 640x480 (accuracy vs speed).
  - GPU delegate again, with the image built from the buffer (the earlier "no body" may have come
    from the bitmap path). Fall back to CPU automatically if results are empty for 2 s.
  - Run the pose model in VIDEO mode on a dedicated thread vs LIVE_STREAM.
  - Deliver landmarks to the UI thread without the JS thread (e.g. a JSI/worklet-callable
    shared buffer, or `react-native-worklets` runOnUI from a native event) so React work never
    delays drawing.
- Smoothing: replace the fixed ease with a **One Euro filter** per landmark (low jitter at rest,
  low lag when moving) and predict to the displayed frame using `capturedAt` (current code caps
  lead at 90 ms). Tune on the phone with fast arm swings and squats; no overshoot on stops.
- Target: skeleton visibly stuck to wrists and knees during a brisk squat and arm raise.

### B. Modern landmark look
- Design 2-3 options and show screenshots: e.g. soft gradient "light trails" on limbs, thin
  luminous limbs with depth-scaled width (MediaPipe `z`), joint dots that grow with confidence,
  a subtle body silhouette glow, rep-progress colour on the working limb. Theme tokens only.
- Fault joints pulse red; the working joint angle is shown as a small arc at the vertex.
- Must render at 60 fps on the G71 (check `dumpsys gfxinfo`): one Skia canvas, paths only,
  no per-frame allocations beyond paths.

### C. Exercises that count correctly
- For every exercise in `EXERCISES` record a 10-20 s landmark clip on the phone (add a debug-only
  recorder writing JSON to the app cache, never uploaded) doing it correctly, too shallow, and
  not at all. Turn the clips into Jest fixtures and assert the counted reps.
- Prefer robust signals: joint angles from the clearer side, normalised distances (torso length),
  shoulder depth for rotation; add per-person calibration on the first two reps (learn that
  person's range, then count at 70% of it).
- Alternating moves (rotation, march, lunges) count each side; show L/R on screen.
- Timed exercises count seconds of real movement; holds count only in the right posture.

### D. A coach that acts like a person
- Before each set: name, target, one key cue, demo clip auto-plays muted at the right moment.
- During: count out loud with natural timing, encourage by name of the body part ("knees out",
  "nice deep one"), correct one thing at a time, praise when a fault is fixed, never talk over
  itself (queue with priorities: safety > fault > count > praise).
- Notice the person: leaves the frame → pause and say so; comes back → resume; tired (rep speed
  drops 40%) → offer to stop early; pain gesture or "stop" → end set immediately.
- After each set: honest summary (reps, clean reps, the main fix) and a rest timer that the person
  can extend or skip by gesture.
- Keep everything on-device and deterministic; no invented metrics.

### E. Heat and battery
- During rest/countdown analyse at ≤4 fps (exists: `minIntervalMs`), stop face/hand models when
  not shown, drop the preview to 1280x960 if it saves power, and stop the camera when the app
  is backgrounded. Report CPU % (`top -H`) and battery temperature (`dumpsys battery`) over a
  10-minute session before and after.

### F. UI
- Full-screen camera behind transparent status and navigation bars; all controls inside safe
  areas. Glass panels (`CoachGlass`) only; no full-screen blackouts.
- Picture-in-picture tutorial that can be dragged to any corner and expanded.
- Lazy-load the YouTube player and face/hand models only when used.

## Definition of done
- `pnpm compile && pnpm lint && pnpm test && pnpm test:db` pass.
- Release build on the G71: screenshots of each landmark style, a screen recording of squats,
  rotation and arm raises with counts, gfxinfo and temperature numbers.
- Update `docs/requirements/TRACEABILITY.md` with what was verified and what was not.
- Commit in small `feat(coach): …` commits, staging explicit paths only.
