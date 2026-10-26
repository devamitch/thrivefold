# THRIVEFOLD — CLAUDE CODE MASTER EXECUTION PROMPT
## Recover Coach UX, eliminate pose latency, evaluate upstream MediaPipe architecture + VisionCamera/Worklets, and ship the real app

**Execution contract:** read → reproduce → measure → preserve → fix → optimize → test → install → verify → commit/push only when authorized.

**Target:** the existing Thrivefold React Native / Expo Android-first app, with the physical Android phone connected. Work in the actual repository, native module and real product routes. No separate Beta Lab, demo-only flow, disconnected prototype, or another plan-only response.

**Mission:** identify why Coach looks degraded and why the camera, landmarks, counters and UI feel laggy; repair the true bottlenecks in the frame pipeline, model inference, camera lifecycle, coordinate mapping, Skia/Reanimated updates, exercise state and Coach UX. Recursively inspect the two upstream repositories and use the patterns that actually fit our installed versions. Finish the actual exercise journey and verify the real release candidate.

---

## 0. READ ALL REQUIRED MATERIAL BEFORE EDITING

### 0.1 Thrivefold project and prior instructions
Locate and read fully `THRIVEFOLD_CLAUDE_FINAL_EXECUTION_PROMPT.md` or the latest authoritative successor if it was renamed. Read all relevant user-provided files/snippets, not merely the visible extracts. Inspect at minimum:

- `PoseLandmarkerModule.kt`, `PoseCameraView.kt`, the module config/autolinking and model asset setup.
- TypeScript native API: `PoseFrame`, `PoseCameraViewProps`, `landmarksOf`, `FACE_GROUPS`, `HAND_BONES`, `poseLandmarkerAvailable`, `poseModelVersion`.
- Coach route / `CoachScreen`; `usePoseTracking`, `useCoachSession`, movement/rep state machine and cue engine.
- `PoseOverlay`, Skia drawing helpers and coordinate mapping.
- `CoachIntro`, `CoachHUD`, `CoachBanner`, `CountdownOverlay`, `RestOverlay`, `SessionComplete`, `CoachVideoStage`, `GestureRemoteGuideModal`, `CoachGlass`, glass-orb controls, `FrostedView`, `AppBottomSheetModal`.
- Theme tokens, navigation, safe areas, keyboard handling, nutrition/meal/Gallery flows, history, quests, persistence, analytics and crash reporting.
- All recently uploaded pasted files and the earlier master prompt/requirements that remain relevant.

Read `AGENTS.md` and nested instructions, README/docs, package files and lockfile, Expo config/plugins, Gradle/Kotlin config, tests, scripts, current Git history/diffs, crash logs and build outputs. Locate the actual files; do not assume folder paths. Create one source-review matrix with source, path/URL, reviewed status, relevant insight, local equivalent, gap and verification. Do not create many duplicate plans; update the repo’s existing canonical task/delivery log.

If a file is unavailable or cannot be fully read, name it and proceed using what exists. Never claim a recursive audit is complete if paths were inaccessible or source remained unread.

### 0.2 Pose-detection repository: recursive review required
Repository tree: https://github.com/khalid999devs/react-native-pose-detection/tree/main/packages/core/android/src/main/java/com/posedetection

Repository/docs/tests/examples/license: https://github.com/khalid999devs/react-native-pose-detection

Direct references:
- `FrameConverter.kt`: https://github.com/khalid999devs/react-native-pose-detection/blob/main/packages/core/android/src/main/java/com/posedetection/camera/FrameConverter.kt
- `CameraSource.kt`: https://github.com/khalid999devs/react-native-pose-detection/blob/main/packages/core/android/src/main/java/com/posedetection/camera/CameraSource.kt
- Performance: https://khalid999devs.github.io/react-native-pose-detection/performance
- Data delivery: https://khalid999devs.github.io/react-native-pose-detection/guides/data-delivery
- Troubleshooting: https://khalid999devs.github.io/react-native-pose-detection/troubleshooting
- API/docs: https://khalid999devs.github.io/react-native-pose-detection/

Recursively inspect the current Android package tree and every relevant related implementation:
- All camera sources, `FrameConverter`, camera bind/configuration, preview, frame format/rotation/mirroring, frame-rate setup and lifecycle.
- Native `PoseCameraView`, overlay implementation and layout/coordinate transforms.
- Detector/model/delegate cache, startup/prewarm, GPU fallback and model validation.
- Engine: `FrameStreams`, ring buffers, wire encoder, snapshots/claimed tickets, trigger engine, timestamps, geometry, continuity, visibility, One-Euro filter and supporting utilities.
- All profile/rate governor/calibration/thermal/idle/performance code. Discover actual paths from the tree; do not guess filenames.
- Expo module definitions, config plugin, native registration, model packaging, TS exports, public API, errors, logging, and frame delivery contracts.
- Tests and CI for frame formats/strides, timestamps, buffer lifetimes, backpressure, camera restart/release, thermal adaptation, native packaging and actual APIs.
- Architecture Decision Records, especially bounded buffers, pull/drain vs pushing frames over events, snapshot ticketing, timestamp rules, smoothing and rate duty-cycle.
- Example live camera usage and current release/version notes.

Record the exact inspected commit SHA because `main` may change. Inspect actual files and tests—not just README. Compare every candidate to our installed Expo, React Native, New Architecture, MediaPipe, CameraX, Reanimated and Skia versions.

### 0.3 VisionCamera, Worklets, New Architecture: recursive, version-matched review
Canonical repository: https://github.com/margelo/react-native-vision-camera
Current docs: https://visioncamera.margelo.com/docs

Required official guides:
- Frame output: https://visioncamera.margelo.com/docs/frame-output
- Async frame processing: https://visioncamera.margelo.com/docs/async-frame-processing
- Skia frame processors: https://visioncamera.margelo.com/docs/skia-frame-processors
- Performance: https://visioncamera.margelo.com/docs/performance
- Coordinate systems: https://visioncamera.margelo.com/docs/coordinate-systems
- Worklets integration: https://visioncamera.margelo.com/api/react-native-vision-camera-worklets
- React Native Worklets: https://docs.swmansion.com/react-native-worklets/docs/

Use the live repository tree to inspect current source recursively, including:
- Camera/session APIs and Android native camera outputs/lifecycle/ownership.
- Current Frame Output API and implementation, dropped-frame handling, frame disposal, format conversion, rotation/mirroring, native buffer and coordinate transforms.
- `react-native-vision-camera-worklets` and `react-native-worklets` runtime/thread setup, AsyncRunner, queue semantics, and error/cancel handling.
- `react-native-vision-camera-skia` / SkiaCamera only if the exact version evaluated exposes it and it helps the current app.
- Android Kotlin/Java/C++ native integration, Nitro/JSI/New Architecture constraints, autolinking/plugin and release-build requirements.
- Performance and camera lifecycle docs, example apps, tests, package manifests, changelogs, release notes and licenses.
- Any pose/MediaPipe frame processor plugin, verifying whether it supports the currently evaluated VisionCamera major version or only legacy V3/V4 APIs.

Current VisionCamera V5 documentation describes a Nitro-based rewrite and the `useFrameOutput` / `CameraFrameOutput` API connected through `react-native-vision-camera-worklets` + `react-native-worklets`. Do not mix those APIs with legacy V1–V4 `useFrameProcessor` or the older `react-native-worklets-core` without checking exact versions. Confirm whether the needed V5 version/source is publicly available and supported for production; do not assume private/sponsor-only repository code is available. No version migration until compatibility is proven.

Record reviewed branch/commit SHA, files, installed-version compatibility, and a specific accept/adapt/reject decision. Do not infer that “New Architecture” automatically means faster; measure it.

### 0.4 Baseline and safe working practices
Before editing:
1. Record branch/current commit, `git status --short`, modified and untracked files, remotes, recent relevant commits and intended release branch.
2. Back up the specific source/config files to be modified and preserve every existing uncommitted change. Never use destructive resets/cleans or overwrite another agent’s changes.
3. Record actual Expo SDK, RN version, New Architecture state, Kotlin/Gradle, MediaPipe, CameraX, Reanimated, Skia and Worklets versions.
4. Run `adb devices -l`, identify the physical phone model/API/build, and verify installed package ID/version.
5. Reproduce the current lag/visual problems. Collect logcat/Crashlytics/Sentry and capture internal QA screenshots of present Coach states.
6. Retrieve the last-known-good Coach UI/landmark implementation from Git history/screenshots before redesigning.
7. Record baseline performance using the same device, build type, exercise, lighting, camera facing and distance. If metrics cannot yet be measured, explicitly mark them unavailable.

---

## 1. CONCRETE LOCAL CODE RISKS TO INVESTIGATE

These are high-priority hypotheses visible in the supplied snippets, not conclusive diagnoses. Confirm with source inspection, profiling and reproduction before making changes.

### 1.1 Native frame conversion/allocation (`PoseCameraView.kt`)
The provided code appears to run `image.toBitmap()` per analyzed frame, allocate a `Matrix`, make a transformed `Bitmap.createBitmap(...)` for rotation/mirroring, build an `MPImage` wrapper per frame, create a new `DoubleArray` for body results, and create boxed lists for face/hand results. CameraX is configured for `RGBA_8888` analysis at around 640×480. Results are sent through Expo events. Pose is explicitly created on CPU because a previous comment says GPU initialization succeeded but returned no body on one phone. There is an `inFlight` flag/500 ms guard and timestamp arithmetic that must be inspected carefully.

Find the exact `toBitmap()` implementation, CameraX output format contract and MediaPipe ownership semantics. Measure conversion, transform, inference, result emission, JS handling, Skia rendering and garbage-collection pauses separately. Do not assume conversion is the dominant bottleneck until measured.

### 1.2 In-flight lifecycle/timestamp risks
Inspect every `inFlight`, `inFlightSince`, `lastAnalysedAt`, `lastTs`, async result/error callback, GPU fallback, camera switch, start, stop and release path.
- Use monotonic clocks for duration/deadline calculations. Convert sensor/frame clocks explicitly if needed; do not compare wall-clock and uptime without correct conversion.
- Ensure MediaPipe LIVE_STREAM timestamps are strictly increasing as required.
- Do not clear the in-flight gate at a timeout while the old inference may still return and race a new one. Use generation/session tokens to invalidate stale callbacks safely.
- Ensure model errors and shutdown cannot leave tracking stuck forever.
- Drop old results rather than allowing markers to jump backward.
- Call `ImageProxy.close()` exactly once in `finally` on every path.
- Do not recycle/reuse input bitmap memory until the installed MediaPipe API contract guarantees the detector has finished with it.

### 1.3 One camera owner, not two competing engines
`CoachScreen` currently chooses direct `PoseCameraView` versus `PoseDetectionAdapter` by `betaMode` and reads `getBetaSettings().poseEngine`. Inspect the adapter and every call site:
- Are these two actual camera/detector engines? Could both ever mount or use `provider.unbindAll()`?
- Does the adapter convert/emit frames redundantly?
- Are callbacks from an old route/session able to mutate new state?
- Can two model instances or CameraX sessions overlap?

Consolidate to one clearly owned production camera/inference path behind a typed adapter. Remove confusing duplicated behavior only after verifying all callers. No second camera engine or Beta Lab.

### 1.4 JS / Reanimated hot path (`usePoseTracking`)
The supplied hook allocates a new `n * 3` flat JS array for every pose event, converts to landmark objects through `landmarksOf`, updates multiple shared values (`frameW`, `frameH`, `points`, `capturedAt`, `seq`, `face`, `hands`) and executes gesture/framing/rep/cue logic. It already limits some React state updates to meaningful state transitions, but actual callback/serialization costs still require measurement.
- Measure event rate, JS handler time, allocations, worklet serialization, shared value updates, Skia updates and component re-render counts.
- Avoid per-frame React state and any unnecessary full-tree render.
- Keep Haptics/TTS/network/AI/database writes out of per-frame paths; trigger only on confirmed, debounced transitions.
- Use typed/flat buffers only if actually supported by this installed Expo/Reanimated/Skia interface.
- Make hook dependencies/session-generation behavior correct when exercise/set/camera changes.
- Consider native-side angle/trigger/rep evaluation only if it reduces bridge load without introducing a second authoritative counter/state machine.

### 1.5 PoseOverlay geometry/visual risks
Inspect the actual `PoseOverlay` implementation end-to-end. Verify canvas updates, fixed bone topology, Skia `Paint`/`Path`/gradient allocations, normalized coordinates, preview crop/FILL_CENTER, rotation, front-camera mirroring, `stage.width/height`, device/orientation changes, staleness and smoothing. Never use arbitrary pixel offsets or additional animation to cover a transform bug. Never draw stale points indefinitely.

### 1.6 Coach UI regression
Compare current Coach to older good commits/screenshots. Preserve the glass-orb buttons the user likes. Audit CoachIntro, live HUD, cue/framing/fault banner, countdown/rest overlays, tutorial PiP/minimized/hidden states, voice/manual controls, end confirmation, completion and achievements. Keep the person/camera as the main visual focus. Use existing Thrivefold tokens, restrained and non-spring transitions, readable labels, safe areas, functional controls and no unnecessary overlays over joints. Fix shared FrostedView/modal foundations if responsible for visual or interaction defects.

---

## 2. UPSTREAM POSE-DETECTION PATTERNS TO EVALUATE

Create a source-by-source table: upstream file/commit → relevant idea → current local equivalent → compatibility → risks → adopt/adapt/reject → test proving decision.

### 2.1 FrameConverter / reusable conversion
The upstream `FrameConverter` reuses a source/cropped Bitmap, Canvas and Rects, reallocating only when dimensions/stride change, inspecting plane pixel stride/row stride, handling row padding, and documenting analysis-thread ownership.
- Verify our CameraX buffer format, number of planes, pixel stride, row stride, buffer position/limit, channel layout and Bitmap configuration.
- Ensure `copyPixelsFromBuffer` is valid for our exact RGBA layout and row padding.
- Inspect whether local `toBitmap()` already performs the same work or is more correct.
- Separate frame conversion from orientation/mirroring. Test that transform with the preview geometry.
- Verify MediaPipe input image ownership before reusing buffers; do not recycle while inference might retain a buffer.
- Handle resolution/stride changes, camera switch, orientation, errors and release safely.
- Test padded/unpadded rows, format, frame dimensions, front/back mirroring, rotation and repeated lifecycle.

Adopt reusable buffers only if measurement shows meaningful improvement and correctness tests pass. Retain upstream license/attribution when deriving code. Do not blindly paste this implementation if local camera assumptions differ.

### 2.2 Camera source ownership/backpressure/lifecycle
Review CameraSource and related code for `STRATEGY_KEEP_ONLY_LATEST` or equivalent bounded backpressure, dedicated analysis executor, owned CameraX use cases/session instead of global unbinding, start tokens rejecting stale provider callbacks, safe pause/resume, switch rollback, preview/analysis geometry and supported FPS. Adapt the pattern to the local module if it fixes a confirmed issue.

### 2.3 Frame delivery/native buffers/native triggers
Study `FrameStreams`, ring buffer, wire writer, snapshot tickets, ADRs for pull/drain vs pushing complete frames over events, and the current public type contracts. Key principle to evaluate: full 33×4 landmark payloads should not cross to JS at unnecessary rates if rep/counting only needs a few angles/events. Where JS needs pose for the Skia overlay, use a bounded/latest delivery contract and only required fields. Zero-copy `ArrayBuffer`, shared/native buffers and trigger paths bring lifetime/race constraints—do not add them without tests proving buffer lifetime and correctness. Do not duplicate detector/camera just to copy a transfer pattern.

### 2.4 Geometry, timestamps, continuity and smoothing
Review the upstream One-Euro filter, continuity and geometry helpers. Investigate actual elapsed time, aspect-ratio-correct angles, `NaN` for unmeasurable values instead of a misleading zero, visibility/confidence, resetting filters after loss/gap/camera switch, and not smoothing confidence so much that hidden joints remain visible. Check whether MediaPipe already smooths single-pose output; avoid duplicate smoothing. Tune from live tests of quick motion, slow motion, hold and reacquisition; no blind copy of default filter constants.

### 2.5 Model/delegate, prewarm and adaptive rate/thermal policy
Recursively review actual detector/model/delegate cache, prewarm, calibration, rate governor, duty-cycle, idle policy, thermal monitor/hysteresis and performance logs. Use source-tree paths, not guessed filenames.
- Don't feed frames faster than inference can complete; a nominal high FPS with stale backlog is worse than fresh lower-rate pose.
- Measure CPU versus GPU on the target phone for successful detections, p50/p95, warmup, missed pose, crashes and sustained heat. Do not treat GPU creation as a successful pose test.
- Use a supported model/analysis resolution appropriate to that device. MediaPipe often downsizes internally, so larger analysis buffers can waste conversion bandwidth; prove whether resolution is useful for our chosen model and framing distance.
- Add calibration/hysteresis/cooldown only if justified and safe; report the real selected model/delegate/rate and why rate is limited.
- Back off for no-person idle, rest, background and thermal stress where appropriate; restore smoothly without repeatedly rebuilding the camera.
- Keep face and hand model code/config/assets intact, but disable their inference and set visual opacity to zero for this release so body pose gets the budget. Do not claim disabled tracking is active.

---

## 3. VISIONCAMERA + WORKLETS + NEW ARCHITECTURE: MAKE A MEASURED ARCHITECTURE DECISION

The goal is to distribute work properly across camera/native inference, worklet runtime, UI/rendering and application state—not to add threads or libraries for their own sake.

Read the actual current public repository and version-matched docs:
- https://github.com/margelo/react-native-vision-camera
- https://visioncamera.margelo.com/docs/frame-output
- https://visioncamera.margelo.com/docs/async-frame-processing
- https://visioncamera.margelo.com/docs/skia-frame-processors
- https://visioncamera.margelo.com/docs/performance
- https://visioncamera.margelo.com/docs/coordinate-systems
- https://visioncamera.margelo.com/api/react-native-vision-camera-worklets
- https://docs.swmansion.com/react-native-worklets/docs/

Evaluate these alternatives explicitly:

**A. Keep and optimize local CameraX + Expo MediaPipe module.** This is preferred if fixing conversion, bounded frames, data delivery, in-flight logic, UI thread and Skia gets the required latency without a high-risk migration.

**B. VisionCamera V4 / legacy frame processors**, but only if exact installed versions and native plugin compatibility are proven. Do not use a V3 tutorial or old `react-native-worklets-core` plugin as evidence it works with another major version.

**C. VisionCamera V5 + Nitro + `react-native-vision-camera-worklets` + `react-native-worklets` and optional supported Skia output**, only if the actual version/source is obtainable, production-usable and compatible with current Expo/RN/New Architecture/Gradle/ABI and MediaPipe. Read its package/plugin/source and license. V5 uses the `useFrameOutput`/`CameraFrameOutput` model; do not mix it with legacy APIs. Confirm public availability—current docs describe V5 as a major Nitro rewrite, but do not assume any non-public source is accessible.

For each option compare actual capture/preview owner, detector call path, pixel format, buffer ownership/disposal, thread crossings, frame drops/queue, coordinate transforms, overlay path, SDK/native compatibility, build/release risk, permissions, performance, heat, app size, migration cost and rollback. Record a go/no-go decision based on code and benchmarks. Never run CameraX and VisionCamera simultaneously for one Coach session. If optimized current CameraX meets requirements, choose the smaller reliable fix. If it cannot and a supported VisionCamera path shows real gains, migrate the complete production session to one camera owner and remove the competing owner only after end-to-end verification.

### Worklet/frame ownership contract
If the selected supported VisionCamera/Worklets version is used:
- Native camera keeps preview responsive; documented Worklet runtime handles high-rate frame callback.
- Frame-coupled overlay must minimize cross-thread hops and stale-result delay.
- Use `AsyncRunner` only for work that can be asynchronous and where dropping a busy frame is acceptable. If scheduling returns false, dispose the frame immediately; if accepted, dispose exactly once after work; always cover errors/cancellation.
- Never leave frame buffers undisposed; leaked frames exhaust the pool and stall the camera.
- Do not push full frames into ordinary React state, serialize huge payloads across the bridge, or run networking/LLM/DB/TTS in the frame worklet.
- Use shared values directly from the documented runtime only where the installed version supports it; avoid gratuitous `runOnJS` for frame-locked visual state.
- Memoize frame-output and worklet callbacks to prevent accidental session restarts.
- Do not assume Worklets automatically puts MediaPipe inference on GPU. A supported native/Nitro/processor integration is still required.
- Don't mix `react-native-worklets` and `react-native-worklets-core` unless the exact libraries require both and runtimes are correctly configured.
- Confirm New Architecture is actually enabled and supported across every chosen native dependency; do not toggle or upgrade the entire Expo/RN stack based on a performance hunch.

### Frame format and orientation
Evaluate avoiding physical frame rotation/conversion if metadata and coordinate conversion can safely preserve the installed MediaPipe API's expected input. VisionCamera provides documented frame-to-camera/view transformations in supported versions. However, do not remove local rotation unless the detector can consume frames in that orientation correctly. Compare physical rotation versus metadata/overlay transform for correctness and p50/p95 latency. Accurate landmarks take priority over theoretical FPS.

---

## 4. MEASURE WHY IT LAGS

Instrument debug builds with low-overhead aggregate timings. Never log images, raw landmarks, private data or full per-frame traces into release logs.

Measure before and after using the same physical phone, build type, movement, light, distance and camera facing:
- camera preview FPS / arrival cadence;
- frames seen, analyzed, skipped, dropped and stale;
- conversion/rotation time p50/p95;
- inference p50/p95 and first-ready/model warm-up latency;
- detection result callback delay and captured-frame-to-visible-marker age;
- native-to-JS event rate and handler duration;
- shared-value update and Skia draw cadence if measurable;
- React render counts for Coach / overlay;
- UI/main-thread stalls and visible jank;
- allocation/GC pressure, memory, CPU/GPU and thermal state during a sustained run;
- delegate/model/resolution/FPS and limitation reason;
- pose-found rate, lost-pose recovery time and rep-confirmation latency;
- TTS/STT/haptic latency separately from the camera loop;
- cold-start, screen revisit, background/resume and route teardown/restart behavior.

Do not fabricate timings. Report unavailable metrics as unavailable. A fresh, stable 20–30 Hz overlay on a capable device is preferable to a 60 Hz queue of outdated frames. Choose rate by measured throughput and thermal headroom; do not impose a universal target that the phone cannot sustain. Preview should stay responsive even when inference drops frames.

---

## 5. HIGH-QUALITY BODY LANDMARKS AND SKIA/REANIMATED PERFORMANCE

### 5.1 Rendering architecture
Inspect `PoseOverlay` and the actual installed `@shopify/react-native-skia`/Reanimated APIs.
- Static skeleton topology should be constant; don't rebuild joints/bone arrays, gradients, paths, paints and large objects unnecessarily per frame.
- Avoid one React Native view/component per point or bone.
- Keep high-frequency pose updates out of React component state.
- Measure whether allocating a new `n*3` JS array and updating several shared values on every event is expensive. Remove work only with measured evidence and a regression test.
- Use the fastest supported compatible UI/native shared-value path; do not assume typed arrays, ArrayBuffer and Reanimated shared values interoperate identically across versions.
- Check whether `seq` is necessary to trigger a canvas redraw; remove only if tests prove redundant.
- Ensure Skia uses the correct coordinate space, frame dimensions and camera crop, and no extra transforms are applied twice.
- Draw only 33 body landmarks and relevant body connections for this release; face/hand overlay opacity 0 and inference off by default.
- Use restrained stroke thickness, clean joints, readable contrast, selective exercise-relevant emphasis and meaningful tracking/lost states. Avoid neon webs, giant glows and decorative animation that obscures the body.
- Do not equate “pose detected” with “good form.” Corrective cues must be backed by exercise-specific measurements and confidence.
- Add a tested freshness threshold. Clear/fade stale coordinates instead of showing them forever.
- If smoothing is necessary, tune for minimum lag; reset after loss/gap/camera switch. Never use more smoothing to hide slow inference.

### 5.2 Restore Coach's good design
Use Git history and old screenshots before redesigning. Preserve the liked glass-orb buttons. Keep camera/body movement central. Refine only the weak portions coherently: intro, camera/framing status, active HUD, one priority banner, countdown/rest, video PiP/minimize, voice/manual controls, exit confirmation, completion/achievement. Make text readable and keep overlays away from crucial joints/feet. Reuse existing Thrivefold tokens. No spring/bounce transitions. Honor reduced motion. A clean screenshot is not proof that camera/landmarks work.

### 5.3 Correct real-time movement/session logic
Inspect the movement library, `stepReps`, rep state, cue engine and session hook.
- Support each exercise with relevant anatomical features, confidence thresholds, hysteresis and full motion-cycle validation.
- Avoid double count, partial count and noise-crossing counts.
- Timed holds use monotonic elapsed time, not frame counts or React interval drift.
- Suppress gesture commands during conflicting arm movements; debounce gestures and only accept them in valid session phases.
- Haptics/TTS fire on confirmed transitions, not each frame; speech must be rate-limited and interruptible.
- No LLM in the frame loop, rep counter, numeric measurements or XP rules.
- Manual fallback stays accessible and never claims camera verification.
- Pause/rest/completion must coordinate inference and timers correctly.
- Save workout exactly once; only after successful persistence update history, calendar, quest/reward and health integration. No double XP/session entries after retries.

---

## 6. FIX THE SHARED FOUNDATIONS AND RETAIN OTHER APP SCOPE

This is a production app task, not merely a camera benchmark. Keep the rest of the previous master prompt in scope and verify all critical flows.

- Crash-first native-module audit: Expo registration, model assets, Kotlin/Gradle/ABI packaging, release AAB/APK, missing module errors, correct package/version and camera lifecycle.
- Android frosted backdrop blur must be real backdrop sampling, not just a transparent tint; distinguish this from motion blur. Integrate motion blur only where it improves existing production UI.
- Fix shared `AppBottomSheetModal` gestures, touch interception, close/backdrop/Android-back, nested scrolling and keyboard handling.
- Calendar Add/Edit Event: all text fields reachable with the Android keyboard open; focused-field auto-scroll; save button reachable; preserve text across date/time pickers; validation and successful save verified on device.
- Log Meals, Gallery route and system image picker recovery; image-assisted food identification should produce candidate foods the user can correct, with macros calculated from real nutrition data, not invented by an LLM.
- Goal-led onboarding with fewer relevant questions and adaptive follow-up; user-approved height/weight/BMI where useful and optional; real analytics and insights grounded in saved records.
- STT commands work without local AI; local AI is optional for natural-language intent/draft field completion and retrieval. The user reviews/approves consequential or externally visible submissions.
- Real supported health measurements/integrations only. Never claim a normal phone camera can accurately measure blood pressure or SpO₂ without supported measurement hardware.
- Do not create duplicate stores, databases, theme systems, exercise engines, camera engines or reward logic.
- Continue the repository’s store screenshot policy; exclude Coach/camera/pose screens from marketing assets if required by project instructions.

Fix shared components before patching each screen individually, then regress every consumer of those shared components.

---

## 7. TESTS, DEVICE VERIFICATION AND DEFINITION OF DONE

### Automated checks
Add/update tests for:
- frame converter format/row stride/pixel stride/padding and resource lifecycle if changed;
- monotonic timestamps, old-result rejection and generation token across start/stop;
- in-flight gate/error/timeout/restart correctness;
- exact 33×4 point layout/order and TS/native contract;
- coordinate transforms across crop, rotation and front/back mirroring;
- smoothing jitter/lag/reacquisition/visibility;
- valid/partial/noisy rep cycles, hysteresis/cooldown and confidence loss;
- face/hands off by default and safe later reactivation;
- Coach state machine, countdown/rest/pause/resume, idempotent persistence and rewards;
- missing native module/model, permission denial and recoverable camera failures;
- modal drag/back/close and keyboard-blocked form regressions.

### Physical Android tests
1. Verify `adb devices -l`, package ID, version and build hash.
2. Build/install the actual current repository build; cold-launch and exercise the camera flow.
3. Intro → permission → model ready → framing → live body tracking.
4. Test slow/fast movement, front/back camera, full/partial body, alignment, lost tracking and recovery.
5. Pause/resume/rest, tutorial play/minimize/hide, Android back, exit, route away/back, background/resume, camera switch and repeated start/stop.
6. Finish a workout and verify rep/hold totals, persistence, quest/calendar/history and rewards exactly once.
7. Run 10–15 minutes if feasible; inspect heat, memory, dropped frames, stale markers and crashes.
8. Test Calendar Add/Edit Event with every field, keyboard open, scroll-to-focus, date/time picker, validation, save/cancel/back and duplicate submit.
9. Review logcat/Crashlytics/Sentry after runs; verify previous crash signatures as fixed/reproduced/unresolved.
10. Build intended release artifact and verify native module/model/DSO packaging; install and smoke-test the exact artifact where possible.

### Acceptance criteria
- No release-blocking crash or unresolved native module/model package mismatch.
- Exactly one active camera/inference owner.
- Current body landmarks are correctly aligned, fresh and responsive without a backlog.
- Camera preview remains smooth while inference runs.
- Face/hand inference remains off and overlay opacity zero for this release, with code preserved for future use.
- Exercise rep/hold/session states and persisted records are correct and idempotent.
- Coach returns to its stronger visual structure, retains good glass-orb controls and improves weak overlays/modals.
- Bottom sheets and keyboard-blocked forms work on-device.
- Other critical master-prompt flows receive regression checks.
- Before/after performance data is recorded; unavailable metrics are named honestly.
- Exact release artifact and test/device status are recorded.

---

## 8. TASK EXECUTION, GIT AND FINAL REPORT

Use the project’s canonical task format and package manager; don't create a pile of duplicate task plans. Start implementation after the baseline rather than waiting for a perfect plan. If subagents exist, split independent investigations and require an integration owner to inspect/test every merged change. Suggested workstreams (internal only, no new product area):
1. crash/native module and baseline;
2. native pose/frame conversion/lifecycle;
3. upstream architecture and VisionCamera/Worklets compatibility assessment;
4. Skia/marker freshness/alignment;
5. Coach UX and session logic;
6. shared modal/keyboard/calendar regressions;
7. broader master-prompt smoke tests;
8. independent review/release verification.

After changes, inspect the full diff. Avoid unrelated refactors, generated junk, model caches, debug dumps, secrets or test data in commits. Verify the intended branch/remote. Commit coherent verified work and push only when authorized and credentials allow. Confirm the remote result before claiming it succeeded.

Maintain one delivery log with root cause/evidence, files changed, upstream source/commit and adopt/reject decisions, commands/tests, before/after device metrics, commit hash, release artifact path/hash/version, rollback instructions, publication checklist and unresolved issues by severity.

Final response must distinguish implemented, automated-tested, physical-device-tested, built/release-tested, blocked and untested. No fabricated metrics/screenshots/commits/pushes/publication. Do not stop at a plan or a successful compile; continue implementation to a real verified outcome or a concrete environment blocker.

## FINAL DIRECTIVE

Read the prior master prompt and the supplied code. Recursively inspect the relevant upstream Android pose-detection package and current VisionCamera/Worklets repository/docs/tests. Identify the specific source of lag with measured stage timings. Compare optimizing current CameraX + local Expo MediaPipe against a supported VisionCamera + Worklets path and select one camera owner based on compatibility and measured results. Use reusable buffer conversion, bounded/latest frames, safe camera ownership/tokens, efficient typed data transfer, native triggers where justified, correct timestamps/geometry, adaptive rate/thermal behavior and low-lag smoothing only where validated against this codebase.

Recover the earlier strong Coach UI; keep the good glass-orb buttons; fix shared primitives first; prioritize body-pose tracking only for this release; preserve face/hand code for later; finish the actual app and prove the result on the connected phone.
