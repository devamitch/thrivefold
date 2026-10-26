# THRIVEFOLD — CLAUDE FINAL EXECUTION PROMPT

## Recover the real app · fix shared UI first · make Coach and live pose tracking smooth · finish nutrition, adaptive health, voice/local AI, analytics, and a verified release

**Role:** Act as the accountable Staff+/Principal React Native engineer, Android/Kotlin native-module engineer, real-time computer-vision/performance engineer, product designer, QA lead, and release owner. Use available Claude Code tools, repository skills, test runners, and sub-agents when genuinely available.

**Product:** The existing Thrivefold Android-first React Native / Expo application.

**Mode:** inspect → preserve → reproduce → fix foundations → profile → implement → test → verify on the attached Android phone → commit safely → push if authorized → prepare publication.

> **THIS IS AN IMPLEMENTATION ASSIGNMENT, NOT A REQUEST FOR ANOTHER PLAN.** Do not stop after an audit, task list, attractive mockup, partial component, successful TypeScript check, or build. Start by understanding the existing code and resources, then repair the actual product end to end. Never claim success without evidence.

---

# 0. THE NON-NEGOTIABLE OUTCOME

Thrivefold has regressed. Some Coach UI that previously looked good now looks poor; pose landmarks lag or misalign; native camera/model behavior needs verification; Android frosted UI may render as transparent/flat rather than true backdrop blur; bottom sheets and modal gestures glitch; and Calendar event inputs can become unreachable when the keyboard opens. Other broken flows may include Log Meals, Gallery, voice controls, achievement/completion modals, persistence, app startup, or release packaging.

The goal is a **working, smooth, polished, trustworthy, publishable app**. Keep successful existing work. Restore the last known-good implementations where appropriate, then improve them. Do not throw away architecture or rebuild unrelated screens just because a previous agent's work is messy.

**Release priorities, in order:**

1. Stop crashes and fix native-module/build/runtime integrity.
2. Repair the shared UI foundations before screen-specific polish: `FrostedView`, `AppBottomSheetModal`, form/keyboard behavior, gesture ownership, safe areas, and glass controls.
3. Repair Calendar Add/Edit Event input reachability and every affected bottom-sheet form.
4. Restore and finish Coach/Train, prioritizing correctly aligned, low-latency **body-pose landmarks only** for this release.
5. Keep face/hand modules and code paths available for later, but set their visual opacity to `0` and turn their inference off by default for this release so they do not steal the frame/CPU/GPU budget. Do not delete them. Do not claim hidden face/hand tracking is running.
6. Integrate the reviewed pose-detection module in the real Coach flow if compatible; integrate `expo-motion-blur` into appropriate real moving UI elements. No separate Beta Lab, experimental-only screens, demo app, or disconnected prototype.
7. Finish exercise state/persistence, food/photo/macro logging, goal-driven onboarding, adaptive quests, STT command controls, useful local AI/agentic workflows, supported health-data integrations, and analytics.
8. Run all meaningful tests and validate the exact release artifact on the connected Android device. Prepare store/policy/release assets and report actual submission state honestly.

**Important effect distinction:** backdrop/frosted blur and motion blur are different effects. Do not use `MotionBlurView` as a replacement for content-behind-glass blur. Reanimated animates properties and transitions; it does not by itself implement backdrop sampling. Each effect must actually render and be verified on Android.

---

# 1. FIRST: DISCOVER AND UNDERSTAND THE REAL REPOSITORY

Do this before editing. Do not assume paths, dependencies, branches, or status from this prompt alone.

## 1.1 Protect the current work

- Identify repository root, current branch/commit, configured remotes, package manager, Expo SDK, React Native version, Android Gradle/Kotlin/JDK versions, native module layout, app ID, EAS/build profiles, and release scripts.
- Run `git status --short` and inspect staged, unstaged, and untracked changes. **Do not discard uncommitted changes, other-agent work, or local fixes.**
- Read `CLAUDE.md`, `AGENTS.md`, nested instructions, `README`, all relevant Markdown plans, recovery notes, Coach specifications, design-system references, current bug reports, test plans, and release docs. Locate docs using repository search rather than trusting filenames in this prompt.
- Inventory old/duplicate/contradictory markdown plans. Make a requirements coverage matrix and one canonical active task tracker. Preserve historical notes; do not blindly delete files or treat repeated prose as additional features.
- Check the existing Git history for last-known-good versions of Coach screens, `FrostedView`, `AppBottomSheetModal`, event forms, pose overlays, camera/native code, and build configuration. Use targeted historical recovery where it is safer than a rewrite.
- Create a genuine, verified source/config backup and a recovery note before risky edits, especially native Gradle/config/model changes. Keep secrets and backup material out of commits/releases. Never run destructive `git reset --hard`, indiscriminate `git clean`, database resets, or broad checkout commands.

## 1.2 Establish a measurable baseline

Before making changes, capture:

- `git status`, current commit, package manager and dependency versions.
- Existing typecheck/lint/unit/integration test outcomes.
- Android build state and exact APK/AAB path/version/application ID if available.
- `adb devices -l`; identify the actual attached device and Android/API version. Use the real connected phone for camera, keyboard, blur, gesture, and release checks when it is available.
- Startup crash/ANR evidence from `adb logcat`, Crashlytics/Sentry and build logs. If a report cannot be accessed, say so and collect available logs instead.
- A short baseline performance sample for camera/pose: observed inference/result cadence, frame age/latency, dropped/skipped frames, UI JS activity, memory/thermal behavior where measurable, and whether tracking stalls.
- Screenshots or recordings of the broken screens before repair where feasible. Internal QA screenshots may include Coach/camera; store/marketing screenshots must follow product/store requirements and should exclude Coach/camera if that restriction remains in project instructions.

Do not invent baseline measurements. Use available tooling and clearly label any metric that cannot be measured.

## 1.3 Create a canonical delivery log

Update an existing implementation log or create `docs/implementation/THRIVEFOLD_FINAL_DELIVERY_LOG.md`. Record defect → root cause (confirmed or hypothesis) → files changed → tests/commands and actual outcomes → device validation → commit → residual risk. Keep a requirements coverage matrix with explicit `not started / working / verified / blocked` status and evidence paths.

---

# 2. EXECUTION ORDER: FIX SHARED COMPONENTS BEFORE REDESIGNING INDIVIDUAL SCREENS

Do not spend the first hours rearranging Coach cards while shared sheets, text inputs, blur layers, and gestures are broken. Repair the foundations once, then use them consistently across the app.

## 2.1 Shared UI/component inventory

Find and inspect the real implementations and all call sites of at least:

- `FrostedView` and any BlurView/backdrop/target/provider wrapper.
- `AppBottomSheetModal`, `SheetFooterRow`, modal portals/backdrops and every modal/sheet caller.
- `GlassOrbButton` / `GlassIconButton` / `CoachGlass` / `SquircleSurface` / `PressableScale`.
- `ScreenContainer`, `AppHeader`, primary buttons, form fields, safe-area wrappers, loading/empty/error states.
- Calendar `Add Event` and `Edit Event` sheets/forms, date/time selectors, validation and save actions.
- Shared keyboard/form helpers and any focus-scroll implementation.
- Shared animation helpers, gesture root, `GestureHandlerRootView`, portal/root layering, navigation/modal integration.

Use the exact repository paths discovered by search. Do not create duplicate providers, duplicate gesture roots, a parallel theme, another modal stack, or a second blur system without evidence the current system cannot be repaired.

## 2.2 Bottom-sheet and modal correctness

Find the root cause of each glitch, not just a single symptom. Investigate:

- Conflicting pan/pinch/tap gestures, nested scroll ownership, sheet drag competing with a `ScrollView`/`FlatList`, simultaneous gesture relationships, responders cancelled too early, and stale refs/callbacks.
- Close controls that do not call the correct handler; backdrop touches intercepted by a blur/overlay; incorrect `pointerEvents`, `zIndex`, `elevation`, clipping or portal layering.
- Multiple animation owners, duplicate open/close transitions, half-dismissed states, stale visible state on reopen, duplicate callbacks, and Android hardware-back behavior.
- Dynamic screen height, rotation, insets, Android navigation/IME insets, content height and sheet snap points.

Required behavior where the established design specifies it:

- Close button always works.
- Drag-to-dismiss works without making scroll gestures unusable.
- Backdrop tap and Android system back do the documented action.
- Long sheet content can scroll all the way to the last input and CTA.
- Text input focus and keyboard opening do not freeze the sheet or break gesture state.
- Dismissing and reopening the sheet resets/transfers state intentionally; no stale text/selection and no accidental duplicate submit.
- The correct underlying route/state returns after dismissal.

Use the installed compatible sheet/gesture package and current patterns first. Do not add another package or upgrade a major dependency until baseline and compatibility prove it necessary. Do not add spring/bounce/elastic effects. Use controlled timing/opacity/transform transitions that do not compete with pan gestures.

## 2.3 Fix Calendar Add/Edit Event as a release-critical form

Trace the actual Calendar routes and the Add Event / Edit Event components. The current text fields are reported to become unreachable when the keyboard opens. Fix the shared form behavior, not only styling.

Required implementation behavior:

- Use `KeyboardAvoidingView` only where it correctly fits the actual platform/native modal hierarchy; verify Android window soft-input mode (`adjustResize`/appropriate configuration) and iOS behavior if supported.
- Ensure the active focused field automatically scrolls into view with enough margin above the keyboard. Use a measurable scroll container/ref, `measureInWindow`/focus handling or the installed form/sheet library's supported keyboard-aware API where appropriate.
- Keep title, description/location and any other actual fields reachable. Do not hardcode to a single small phone height.
- Keep the primary Save/Update action visible or reachable above the keyboard. For long forms, use a correctly inset/sticky footer or allow scrolling to the footer after the final field.
- Correctly handle date and time picker open/close while text fields contain unsaved text; closing a picker must not clear focus or lose the draft unexpectedly.
- Use appropriate keyboard types, `returnKeyType`, `submitBehavior`/focus chaining as supported by the installed RN version, `onSubmitEditing`, labels, optional-field indicators, validation and inline errors.
- Tapping outside should dismiss the keyboard only when intended and must not trigger sheet dismissal. Do not wrap the whole form in a touch handler that steals input or scroll gestures.
- Handle Android hardware back when the keyboard is open before dismissing the sheet, according to platform behavior.
- Prevent duplicate save submissions; show loading and truthful success/error states. Confirm the saved event persists and appears on the right date.
- Test add, edit, cancel, reopen, keyboard visible/hidden, last field, landscape/short viewport if supported, Android back, date/time pickers, validation errors, and device restart/persistence where appropriate.

Apply the same keyboard/focus audit to every other modal, bottom sheet, edit form, search field, and multiline input across the app—not just Calendar.

## 2.4 Low-friction input: fewer questions, better results

- Use progressive disclosure and goal-dependent questions. Never make every user answer every health/nutrition question.
- Reuse user-approved existing profile data instead of re-asking. Show the source and allow correction where relevant.
- Use optional voice dictation, sensible defaults, structured choices, smart suggestions, autofill from existing in-app data, and local-AI-created drafts with user review.
- Do not hide required consent, fabricate defaults, infer sensitive information, or silently commit AI-filled fields.
- Preserve every draft across keyboard/picker transitions, temporary interruptions, retry, and navigation where intended.

**Component acceptance:** build a component matrix of all sheet/modal/form call sites; fix the shared primitives; then test the real affected callers to prove the shared fix did not regress unrelated sheets.

---

# 3. CRASH-FIRST NATIVE MODULE AND RELEASE INTEGRITY

Treat the application as unstable until the crash paths are understood and verified fixed.

Inspect:

- Crashlytics/Sentry reports and ADB/logcat stack traces.
- Expo app config, plugins, autolinking, `expo-module.config.json`, Android manifests, package names, native module `Name(...)`, `requireNativeModule(...)` / `requireNativeView(...)` strings, Gradle dependencies, Kotlin API compatibility, generated native project changes, R8/ProGuard rules, NDK/DSO packaging, model asset packaging, EAS config and release scripts.
- Stale APK confusion: confirm package/application ID, version/versionCode, timestamp/hash, build variant, installed path/version and whether Metro/native code are aligned.
- Expo Updates/assets startup and native libraries such as `libreactnative.so` if the logs show these failures. Fix only causes supported by current evidence.
- JS imports that can crash when a native module is unavailable; availability checks must not be confused with proof the module is registered in the actual installed binary.

For every local Expo module, verify its whole chain: package metadata → module config/autolinking → Kotlin class → exact native module/view name → JS typed API → screen integration → model/assets in release binary → runtime events → teardown. Native compilation alone is not proof.

Use fail-safe lazy loading and explicit unsupported/error states, but don't mask errors by returning fake success or swallowing exceptions without diagnostics. If an import failure must not crash unrelated screens, use a proper guarded adapter and clear fallback. Avoid runtime imports that bypass build-time native registration.

After each native/config change:

1. Run targeted type/lint/tests.
2. Run the project's correct prebuild/config check only when required by its workflow; inspect generated diffs before accepting.
3. Build the correct Android variant.
4. Install the exact artifact on the connected phone with `adb` using the real package ID.
5. Launch the app and reproduce the original failing path.
6. Collect logcat and verify the relevant native module and model are available in that binary.

Never fabricate a green build or ignore a failing release task. Don't destroy and regenerate native projects as a generic fix.

---

# 4. ANDROID FROSTED BACKDROP BLUR + MOTION BLUR — IMPLEMENT THE REAL EFFECTS

## 4.1 Restore the existing `FrostedView` implementation

The current Android effect looks transparent/incorrect. Inspect the actual component, `expo-blur` version, installed Expo/RN, Android BlurTarget/provider/ref hierarchy, drawing order, modal portals, parent backgrounds, tint/alpha, clipping, `overflow`, elevation/z-index, surface/TextureView choices and relevant Git history.

A good implementation must visibly blur the **content behind** the glass surface on supported devices, retain readable tint/content, and preserve pointer/touch behavior. Transparency alone is not blur. A static tinted translucent surface can be an intentional fallback on unsupported devices, but must not be reported as actual blur.

Use the compatible implementation available in the installed stack first. If the current Expo BlurView API requires an explicit `BlurTargetView`/target reference, wire it correctly and confirm the target actually contains the background that should be sampled. If that cannot deliver reliable Android rendering for the app's exact layout/modal tree, use a justified native backdrop-capture or shader implementation that truly samples the underlying content, with documented lifecycle/performance limits. Do not simply set opacity lower or put a generic shader on top without sampling the backdrop.

Use Reanimated for smooth entrance/exit/translation/opacity of sheets and controls; do not add spring motion. Keep the blur computation independent from gesture state so that restoring blur does not make gestures lag or stop touch propagation.

Test the actual `FrostedView` in:

- General modal and bottom sheet.
- Calendar Add/Edit Event.
- Coach intro/setup and active Coach HUD/banner/countdown/rest/completion overlays.
- Headers/footers and other established frosted surfaces.
- Nested routes, navigation transitions, opening/closing repeatedly, scrolling, keyboard shown/hidden and Android back.

Use screenshots from the real device and confirm background details are visibly softened behind the surface. Do not accept a white/opaque rectangle or a transparent view as success.

## 4.2 Integrate `expo-motion-blur` into real production UI where it improves motion

Review the actual repository and package source before adoption:

- https://github.com/rit3zh/expo-motion-blur
- https://github.com/rit3zh/expo-motion-blur/tree/main/android/src/main/java/expo/modules/motionblurview

Verify current release/commit, MIT license/attribution, supported OS/API, installed Expo SDK/RN compatibility, development-build/native setup, prop semantics and runtime cost. Integrate the `MotionBlurView` in appropriate existing moving elements only where it helps the experience (for example a moving card/deck transition or a purposeful hero element), using graceful plain-View fallback when unsupported/disabled. Do not apply it to every component, text, form fields, controls or pose marker rendering. Profile before using expensive `live` capture/high sample values. Keep reduced-motion/accessibility support.

Motion blur must not replace backdrop blur. Do not install a version blindly, upgrade Expo/RN just to fit it, or patch `node_modules` as the first approach.

---

# 5. PRODUCTION COACH / TRAIN — RECOVER THE GOOD UI, THEN FINISH IT

The Coach screen previously looked much better. Recover the relevant prior implementation from Git history before redesigning. Do not accept the current appearance as the desired baseline. Use the existing Thrivefold theme/design tokens and the best established `GlassOrbButton`/glass surfaces already present, keeping the buttons the user liked. Spread the working components to other Coach areas only where they improve consistency and hierarchy.

The Coach flow must work end to end:

**Exercise selection → Coach intro → camera permission/setup → pose-ready/framing → ready/countdown → live set → pause/resume/manual controls → rest/next set → completion summary → persistence → history/progress/quest update.**

Every stage must have an intentional UI, correct actions and real state, not placeholder decoration.

## 5.1 Screens/components to audit and fix

Find current files for at least these components from the supplied code and inspect all callers:

- `CoachScreen` orchestrator.
- `CoachIntro`.
- `CoachVideoStage` and `YouTubePlayer`.
- `PoseCameraView` native camera plus JS adapter/package `pose-landmarker`.
- `PoseOverlay` and any Skia drawing/worklets.
- `usePoseTracking`.
- `useCoachSession`.
- `CoachHUD`, `CoachBanner`, `CountdownOverlay`, `RestOverlay`, `SessionComplete`, `GestureRemoteGuideModal`, `CoachGlass`, `ProgressRing`, `GlassButton`, `FrostedView`.
- `domain/pose/movement`, `domain/pose/capabilityRegistry`, `domain/pose/gestures`, voice command parser, plan/exercise catalog, rewards/progression and workout persistence.

Do not assume the provided excerpts are current; compare against the actual repository and current branch.

## 5.2 Specific integration problem to investigate

The supplied `CoachScreen` imports:

- `PoseCameraView` and `poseLandmarkerAvailable` from `pose-landmarker`.
- `PoseDetectionAdapter` from `features/beta-lab/experiments/pose-detection/PoseDetectionAdapter`.
- `getBetaSettings` from `features/beta-lab/flags/betaFlags`.

The requested release must **not** create or depend on a separate Beta Lab. Trace the actual `betaMode` branch and determine whether production camera/pose behavior is gated behind it. If so, safely move the chosen, verified implementation behind the normal production Coach/Train path and remove only obsolete gates/imports after tests prove the real adapter works. Do not leave the main Coach silently running a different engine depending on a hidden beta switch. Avoid breaking the stable native module while removing beta-only routing.

## 5.3 UX direction

Build a calm, premium, modern coaching surface with clear hierarchy and restrained motion. Use the existing theme tokens, current shared components and tasteful glass orb controls. Keep camera footage primary, protect legibility, and avoid piling generic cards over the camera.

- Intro: exercise purpose, one clear demo/tutorial, sets/reps/duration, equipment and camera placement, key safety note, tracking capability, and one obvious start action. Progressive disclosure for secondary details.
- Camera setup: concise status states (permission, camera starting, loading model, body not found, move back, whole relevant body/joints visible, wrong angle, ready). Do not claim “ready” merely because the preview started.
- Live: prominent rep or timer value, current set/target, next cue, obvious pause/resume/finish controls, and easy camera/video toggle. Avoid clutter and buttons placed over critical joints.
- Video: maintain one authoritative player/session state across fullscreen/PiP/minimized/hidden; avoid remount loops, redundant WebViews or audio conflicts. A tutorial must correspond to the current exercise and be recoverable on player failure.
- Rest: clear rest timer and next exercise, add-rest/ready actions, and clear state transitions.
- Completion: polished visual hierarchy, actual completed exercise/set data, time, earned rewards only if legitimately awarded, save status, and reliable Done/Review/Continue paths. Fix the ugly camera coaching/training completion modal end to end.
- Every state includes loading, error, denied permission, no camera/module, tracking lost, paused, offline/save failure, interrupted session and retry/manual fallback where applicable.

Do not overuse animations. Keep the user's liked glass-orb button style and improve the surrounding composition rather than replacing every component.

---

# 6. LIVE POSE LANDMARKS — CORRECT, LOW-LATENCY, STABLE, AND BEAUTIFULLY RENDERED

For this release, prioritize **body pose only**. Keep face/hand support and model paths so they can be re-enabled later, but default face/hands props to false and render their overlays with opacity `0`. Do not execute their inference in the hot path by default. Do not delete the modules, models or interfaces. Disable face/hand-dependent gestures for this release; the active workout control layer should use explicit STT commands plus manual controls.

## 6.1 Read and reason through the current native module

The supplied native code uses package `expo.modules.poselandmarker`, a `PoseLandmarkerModule` named `PoseLandmarker`, a `PoseCameraView`, CameraX `Preview` + `ImageAnalysis`, MediaPipe PoseLandmarker, flat landmark arrays `[x, y, z, visibility] * 33`, `STRATEGY_KEEP_ONLY_LATEST`, an approximately `640x480` analysis resolution, and a single-thread executor. It defines `MODEL_ASSET = "pose_landmarker_lite.task"`, and optional `face_landmarker.task` / `hand_landmarker.task` assets. It currently uses a CPU delegate in `start()` despite comments describing earlier GPU experiments; the `createLandmarker` error listener has a GPU-to-CPU path that may not be exercised by this path. Analyze this implementation rather than assuming the comments prove current behavior.

Specific risks visible in the supplied excerpt that must be verified/fixed if present in the current tree:

1. `analyse()` sets `inFlight = true` before `model.detectAsync(mp, ts)`, but its broad catch does not visibly reset that flag if `detectAsync` throws synchronously. A stale `inFlight` can suppress frames until the timeout path permits processing again.
2. The guard `(inFlight && nowMs - inFlightSince < 500L)` permits processing another frame after 500 ms even if the earlier inference has not actually completed. Do not use a timeout to silently allow concurrent inference on a streaming task; build a safe watchdog/recovery path that prevents overlapping submissions and reports/reinitializes a genuinely stuck pipeline without racing model closure.
3. `MIN_EMIT_INTERVAL_MS = 16L` permits around 60 events/s, while the class documentation says at most ~15 times/s. Resolve this contradiction. Set a deliberate measured frame/event cadence; keep analysis cadence, native inference cadence and JS/UI notification cadence conceptually separate.
4. `Bitmap` creation/rotation/mirroring and `MPImage` lifetime must be reviewed for allocation churn, correct ownership/recycling and use-after-close. Reuse buffers safely if the APIs support it. Do not recycle memory still consumed by an asynchronous MediaPipe task.
5. `setFace(false)` / `setHands(false)` directly close models while detection callbacks may be in flight. Serialize model changes/close on a safe executor or guard them with a proven synchronization/lifecycle mechanism; clear timestamps/results and ignore callbacks from a stopped generation.
6. `setFacing()` calls stop/start, and `start()` creates asynchronous model and CameraProvider work. Guard late callbacks with a generation/session token so a pending old start cannot bind a camera after stop/restart/unmount.
7. `stop()` calls `cameraProvider?.unbindAll()`. Verify ownership and avoid unbinding unrelated camera use cases if another camera owner can exist. Prefer lifecycle-bound explicit owned use cases when appropriate.
8. `onPoseReady` is currently posted after pose-model creation and may not prove CameraX has bound and the first valid frame/result arrived. Separate model-ready, camera-bound and tracking-live states. UI copy must reflect the actual state.
9. Face/hand model errors use empty error listeners in this excerpt. While those models are disabled for release, make failure reporting/logging explicit where the features are exposed in future; never silently claim those modalities work.
10. Verify rotation/mirroring/crop/FOV transforms. Preview and analysis use separate resolutions. Confirm the `frameWidth` / `frameHeight`, front-camera mirrored coordinate contract, crop rectangle and overlay mapping match the visible preview on the real phone.
11. Ensure every `ImageProxy` closes exactly once on every branch. Test model-not-ready, frame skipped, conversion failure, detect failure, stop during inference, permission revoke, activity background/resume and camera-provider failure.
12. Ensure there is only one active camera/model owner. Repeatedly navigating away/back must not leak executors, CameraX use cases, surfaces, listeners, tasks or model instances.

Treat these as source-review prompts, not assertions that every issue definitely exists in the current checkout. Verify before modifying.

## 6.2 Native module registration and contracts

Inspect all of these in one chain:

- `PoseLandmarkerModule.kt`: `Name("PoseLandmarker")`, `isAvailable()`, `modelVersion()`, props `active`, `facing`, `face`, `hands`, `minIntervalMs`, events `onPose`, `onPoseError`, `onPoseReady`, `OnViewDestroys { release() }`.
- `expo-module.config.json` Android module registration.
- JS `requireNativeModule('PoseLandmarker')` / `requireNativeView('PoseLandmarker')`, `PoseCameraView` props and `PoseFrame` event shape.
- Package name/exports and the import `from 'pose-landmarker'` used by Coach.
- Android model assets and exact APK contents.

Ensure the module name is identical across Kotlin/JS/config and is available in the exact release binary. `isAvailable()` only tells whether the native module can open the pose model asset; it is not proof camera permission, CameraX startup, inference, event delivery, or overlay correctness works. Surface those states separately.

## 6.3 Profile the whole real-time pipeline before optimizing

Measure and identify which stage causes latency:

Camera sensor timestamp → ImageProxy acquisition → image conversion/rotation/mirroring → MediaPipe inference start/end → event delivery → JS parsing/conversion → Reanimated shared-value update → Skia draw/present.

Collect real measurements where possible:

- Frame age when analyzed and displayed, p50/p95 inference latency, actual result FPS, UI frame time/jank, skipped/dropped frame counts, consecutive no-result frames, inference errors, heap/bitmap churn, CPU/GPU utilization and thermal behavior.
- Compare a baseline with body pose only against face/hands enabled only as an offline diagnostic when it is safe and necessary. The release configuration must keep them off.
- Test daylight/normal indoor lighting, normal distance/full-body framing, partially occluded joints, front/back camera, portrait/landscape as supported, repeated navigation, 5–10 minute session heat, and app background/resume.
- Do not invent performance values or claim 30/60 FPS without measurement. Set attainable acceptance thresholds from the attached device and current baseline, then explain device limitations.

Optimization rules:

- Keep `STRATEGY_KEEP_ONLY_LATEST` or an equivalent bounded queue. Never build an unbounded image backlog.
- Do not perform camera conversion, image processing, inference, bitmap allocation or per-frame expensive work on the UI/JS thread.
- Use one in-flight inference at a time unless the API expressly guarantees a safe multi-request model. Watchdogs must recover safely.
- Choose CPU/GPU delegate from verified device behavior and stable results; don't force GPU because it sounds faster or force CPU just because an old comment says GPU failed on one device. Add tested fallback when the selected delegate is unavailable/unstable.
- Choose analysis resolution/FPS adaptively after measuring. Avoid high-resolution inference where it only adds latency, but preserve enough spatial detail to identify the target joints.
- Disable or throttle analysis when session is paused/resting/route hidden according to product state; restart cleanly before next set. Do not keep hot camera inference running off screen.
- Use native drawing or a minimal, throttled, typed/batched event contract if the JS bridge is a bottleneck. Do not stream full frames or huge arrays to JS. Keep only the data required for rep counting and overlay; make changes only after profiling.
- If retaining JS-to-Skia rendering, update pose data through shared values/worklets and avoid React state updates on each frame. Use a frame sequence/shared timestamp where needed, not re-renders of the whole Coach screen.
- Stale pose data must disappear or enter an explicit `tracking lost` state. Never keep painting an old pose as if live. Distinguish a no-person frame from a processing error.
- Make `capturedAt`, `timestamp`, `frameWidth`, `frameHeight`, and the coordinate normalization contract consistent and testable. Never draw predictions based on invalid timestamps.

## 6.4 Specific JS hot path: `usePoseTracking`

The supplied hook uses Reanimated `SharedValue`s (`feedPoints`, `feedW`, `feedH`, `feedFace`, `feedHands`, `feedSeq`, `feedCapturedAt`) but also converts each incoming 4-value landmark tuple to a new array of 3 values and increments sequence state; it updates person/framing/rep/gesture state under various conditions. Inspect `PoseOverlay` too and determine whether event traffic, allocations, React rerenders, worklet dependencies or overlay drawing are limiting performance.

- Preserve the currently required data contract unless all callers are migrated/tested.
- Avoid redundant array/object creation, full-tree re-renders and state setters on every camera frame.
- Ensure the sequence signal and all corresponding shared values are coherent so a render never mixes coordinates/dimensions/timestamps from different frames.
- Update the rep engine from valid current data only; don't use `Date.now()` as a substitute for source capture time where timing correctness matters.
- Reset `hasPerson`, framing, tracking readiness, gesture state, rep state and stale landmarks when tracking stops or changes exercises, without accidentally losing legitimate set progress.
- Throttle user-visible banner/cue changes; avoid speaking on every frame. Announce meaningful state transitions only.
- Keep the marker/rep rendering loop out of the high-churn React render path. If worklets cannot safely draw the required data due a real constraint, evaluate the installed native renderer or a typed compact event buffer with evidence.

## 6.5 Landmark visualization: elegant, readable, stable

Use the existing Skia `PoseOverlay` and actual design tokens where possible. Avoid generic neon skeletons, noisy glowing lines, random red/green coloring, labels covering the face, and lag concealed by smoothing.

- Build a restrained visual hierarchy: clear body joints and limb connections, crisp enough to see against video, consistent line/point sizes, accessible contrast and a subtle focus for exercise-relevant joints.
- Differentiate tracking quality from form quality. Low visibility means reduce/hide an unreliable joint and show a calm reframe cue; it does not automatically mean the user's form is bad.
- Use smoothing only to reduce measurable detector jitter without adding perceptible temporal lag. Compare raw vs smoothed capture timestamps and tune/disable smoothing where MediaPipe already stabilizes the output.
- Correctly mirror the front camera, account for orientation/crop/aspect ratio and fit/fill scaling, and align all joints with the body at the edges of the frame.
- If extrapolation/prediction exists, cap it, base it on a valid timestamp/velocity, and cancel it on missing/stale frames. Do not let predictions drift when the camera moves or the user leaves view.
- On no-person/low-confidence/obscured states, show one short useful instruction instead of frozen markers or streams of warnings.
- Face and hands must visually have `opacity: 0` / not be drawn for this release, and their inference must be off by default. Preserve their implementation and a future re-enable path.

## 6.6 Accurate reps and exercise-specific feedback

Audit `domain/pose/movement`, `stepReps`, `setProgress`, `framingCue`, `capabilityRegistry`, all exercise definitions and the actual pose joint mapping. Every supported camera-counted exercise needs a validated state machine (start → movement phase → target threshold → return/finish → cooldown/hysteresis) that prevents double counts and false counts from jitter.

- Use only relevant visible joints with exercise-specific visibility/confidence checks.
- Timed holds use a monotonic clock and pause semantics, not fake rep increments.
- Flow/sequence exercises must follow their actual cycle/state definition.
- Do not say a movement is verified when there is no reliable movement model. Use deterministic manual/timed completion for unsupported camera movements and label it clearly as manual/self-reported.
- Form scores/rewards must use valid, documented evidence and existing canonical reward logic. Do not award camera-verified XP from an unsupported pose or fake “80% good form” metric.
- Make haptics/audio optional, non-blocking and rate-limited.

---

# 7. COACH STATE MACHINE, VIDEO, SESSION SAVE AND WORKOUT END TO END

The UI, camera, exercise state and persistence must share one authoritative session state. Avoid independent timers/counters in screen components.

Inspect and repair `useCoachSession` and its consumers:

- Intro, active, paused (if current architecture needs it), rest, countdown, set completion, exercise progression, session completion and interrupted/abandoned flow.
- Rest/countdown/timed exercise/session duration with reliable timers when app backgrounds, screen is unfocused, device sleeps or the session is paused.
- Pause/resume must consistently govern camera inference, rep counter, tutorial video, rest timer, elapsed time, spoken cues and keep-awake state.
- Stop/finish/cancel confirmation must match actual saved progress and not double-submit.
- Guard repeated “set done”/“finish” actions with idempotency and a stable session ID.
- Preserve already-completed set records through navigation or camera recovery when correct; don't preserve stale pose points as current.
- Save real exercise/session/set/repetition/timing/form evidence to the existing store/database. Refresh history, calendar, quest progress and health integrations only after actual persistence and applicable verification succeeds.
- Health Connect write errors must not silently invalidate or duplicate the local workout save. Treat integrations as separate outcomes and retry safely.
- An interrupted/failed optional camera path must still allow manual/timed exercise completion where supported.
- `SessionComplete` must display values from the saved/computed `DoneSummary`, not placeholder/fake stats. Test Done, back, review, next action, re-open, history and reward idempotency.

### Voice STT for workout controls

For this release, STT is the primary hands-free control method; retain touch/manual controls. Avoid relying on pose-based hand gestures, face tracking or a local LLM to execute essential workout commands.

- Use a deterministic, typed command parser with synonyms and clear confidence/ambiguity policy for supported commands such as pause, resume, repeat instruction, next set, add rest, replay/hide tutorial and stop/finish workout.
- “Stop/finish”, skip, overwrite and other consequential commands need a confirmation step where mistaken recognition could lose work or end a workout unexpectedly.
- Only listen after explicit user activation / push-to-talk or during a clearly disclosed active session; do not listen covertly in the background.
- Permission denial, unavailable STT, no network (if the speech engine requires it), low confidence, silence and recognition errors must have a visible/accessible error and manual fallback.
- Commands must be debounced and idempotent. Do not let one voice transcript trigger two actions.
- Add visible state (listening/processing/command accepted/needs confirmation/error) and accessible feedback. Never imply voice is listening when it isn't.
- TTS is optional and must be cancellable, rate-limited and synchronized with session state; do not queue a stream of stale spoken cues.

---

# 8. FOOD, NUTRITION, PHOTO IDENTIFICATION AND MACRO SUBMISSION

Finish the real food logging path, not just the camera or nutrition screen.

**Required journey:** open Log Meals → search/manual entry or capture/select photo → identify candidate food(s) if a real model/provider is available → review/correct food/ingredients/portion → compute macros from canonical nutrition data → review totals → save once → update history and daily totals → update related insights/quests/calendar correctly.

- Support the current app's meal types/time/date and existing food schema. Include useful locally relevant food entries (including common Indian dishes if the catalog scope supports them) without fabricating database values.
- Accept meal photos from the actual camera/system picker. Treat cancel, permission denial, corrupted image, unsupported format and provider failure as normal recoverable states. Keep photo local/private by default. Clearly disclose and ask consent before uploading an image or health data to a cloud AI provider.
- AI image identification returns candidate foods, likely ingredients and uncertainty—not medically exact nutrition facts. Show the candidates and let the user correct them. Multiple AI providers may be supported if the existing architecture truly supports them, but use one orchestrated, normalized workflow: provider allowlist, timeout, retry/fallback, schema validation, deduplicated output, source/model/provenance and costs. Do not call every AI provider blindly on every photo.
- Work both with and without AI: manual search, custom entry and portion selection must remain functional offline. With no model/config/key, report that recognition is unavailable and continue manual selection; never show a fake recognition result.
- Calories, protein, carbohydrates and fat must be calculated deterministically from documented nutrition records and normalized serving quantities. Distinguish authoritative dataset values, user-entered values and estimates. LLM output cannot be the authoritative macro calculator.
- Compute per-food, per-meal and daily totals from one canonical nutrition function. Handle units, cooked/raw status where relevant, missing values, rounding, mixed dishes, portion changes, time zones, edit/delete, offline save, sync retries and no duplicate records.
- The submission path must prevent duplicate macro/meal entries even if the user double-taps, speech repeats, AI retries or network retries. Use stable IDs/idempotency keys where the current backend supports them.
- Show a final review screen with uncertainty/source indicators and confirm before committing AI-derived nutrition. Store the user's corrected result, not the raw model prediction as the final truth.
- Saved meals should feed Home/day totals, nutrition views, Calendar, appropriate quests, insights and profile progress via the same canonical record. A meal quest completes only when the actual meal save and its verification rule pass.

---

# 9. GOAL-FIRST ONBOARDING, HEIGHT/WEIGHT/BMI, ADAPTIVE PLANS AND QUESTS

Create a smarter app by collecting fewer high-value inputs and adapting follow-up questions to user intent. Do not overwhelm everyone with a giant form or assume all users want weight loss.

## Onboarding

1. Let the user choose a primary intention: general health, exercise consistency, strength/muscle, cardiovascular fitness, mobility, energy, sleep, stress, nutrition quality, weight management, or a user-defined goal. Allow secondary goals and change/skip options.
2. Ask only questions relevant to those goals using progressive disclosure. Reuse prior approved data. Make optional details explicit.
3. Where relevant and with explanation/consent, collect height, current weight and optional target weight; age range only where needed for the product's health/safety logic; activity level, experience, available time/equipment, dietary pattern, allergies/restrictions, accessibility preferences and user-stated limitations. Do not require unnecessary medical history.
4. Calculate BMI deterministically with correct units and validation. Explain BMI is a rough screening measure, not a diagnosis and not a complete individualized health assessment. Use age-appropriate interpretation only if age/data and approved rules support it; avoid adult cutoffs for children/teens. Do not promise unrealistic weight changes or unsafe plans.
5. Build a baseline plan from deterministic rules/catalogs plus optional AI recommendations. Always label suggested rather than medically prescribed targets. User can edit, pause, change goals and delete profile data.
6. Adapt follow-up questions as the user's goal, adherence, schedule, symptoms/self-reported state and progress change. Ask only when the answer could materially improve the plan; explain why and permit skip/defer.

## Adaptive goal/quest engine

- Keep one canonical goal/plan source and one rules engine. Avoid a separate AI-only task planner conflicting with existing quests.
- Adapt difficulty, reminders, exercise duration, rest, nutrition focus and recovery recommendations using actual progress, constraints, user preferences and confidence/evidence thresholds.
- Avoid punishing missed days or making unsafe jumps in exercise load. Respect rest days, injury/symptom reports, opt-outs and user autonomy.
- All task verification, scheduling, reward calculation and state changes remain deterministic. AI can recommend/draft, not authorize or fabricate completion.
- Explain why the plan changed and allow undo/adjustment. Store change history where the existing data model supports it.

---

# 10. FULL-APP SPEECH-TO-TEXT, LOCAL AI AND SAFE AGENTIC ACTIONS

Do not combine everything into one opaque LLM call. Use a layered system with deterministic commands and real actions.

## STT command layer — works without local AI

- Build/reuse a typed command registry for app navigation and supported actions, including workout control, search, opening Calendar/Meals, initiating a log, dictating text into a focused form, moving focus to the next field, and saving a draft.
- Implement explicit opt-in activation, visible microphone/listening state, clear stop/cancel, permission handling, language settings, low-confidence recovery and manual alternatives.
- Use deterministic parsing for safety-critical/simple commands. The command executor should validate route/action availability, required parameters and current state before execution.
- For form fill, speech may fill the currently focused field or create a draft across known fields. Display exactly what was recognized; do not silently submit the form, save medical values, delete records, purchase/authorize, or commit a cloud upload without user confirmation.
- Do not let a single phrase both navigate away and lose a draft. Preserve drafts and focus state.

## Local AI and multi-provider AI

- Audit what local model, runtime, embeddings, RAG, memory and agentic action tools are actually installed/configured. Reactivate working local AI; do not claim an LLM is loaded if there is no actual compatible model/runtime and inference test.
- Separate deterministic local intelligence from a real local LLM. Report availability, memory/storage, latency, supported tasks and fallback honestly.
- Implement/repair local retrieval grounded in the user's allowed data; include sources/recency where relevant. Memory must be opt-in, inspectable, editable, pausable, exportable and deletable. Do not automatically store every sensitive transcript/journal/photo as permanent memory.
- Use a shared action plan contract: intent → schema-validated parameters → permission/consent checks → preview/dry run → user confirmation for consequential actions → execute via a real application service → verify persisted outcome → record minimal audit/event result → recover or explain failure.
- Agents must have bounded capabilities and no unrestricted arbitrary code/SQL/route execution. Enforce a tool allowlist, validation, idempotency, timeouts, rate limits, budgets, cancellation and reversible actions when possible.
- AI providers are optional adapters. Configure providers through server-side secrets where required; never bundle server credentials in the mobile app. Add policy for timeout/fallback, model/source metadata, redacted logs, user consent, rate limits and cost caps. Never call multiple providers without need; deduplicate and reconcile outputs in a reviewable way.
- Core app functions must still work if every AI provider is unavailable. AI cannot decide permissions, access control, BMI/macros/rewards, medical diagnosis or verified exercise completion.

---

# 11. HEALTH DATA AND MONITORING — SOURCE-TRUTHFUL, CONSENTED, USEFUL

Audit existing health integrations, Android Health Connect, connected wearable/provider APIs and actual device-sensor support. Integrate supported real measurements where permissioned, documented and available.

- Distinguish measured/imported values, user-entered values, AI-derived estimates and unavailable data. Include source, timestamp, units, measurement context and freshness where available.
- Blood pressure and SpO₂ must not be invented from an ordinary phone camera or generic sensors. Use a real compatible/authorized device/provider/Health Connect record or manual entry and say which source produced the value. Never claim medical-grade measurements without validated hardware and regulatory support.
- Use explicit data permissions, least privilege, consent, deletion and account boundaries. Don't upload health values/photos/transcripts to AI analytics by default.
- Provide non-diagnostic trends based on sufficient actual measurements; mention sample counts and gaps. Do not claim causation or diagnose from sparse data.
- Monitoring should not run covertly in the background. Respect operating system permissions, app lifecycle and battery limits.

---

# 12. ANALYTICS, DIAGNOSTICS AND ACTIONABLE FINDINGS

Keep product analytics separate from personal health-progress insights.

## Product/engineering analytics

Track privacy-minimized events that help find failures: route opens, modal open/close, focus/keyboard visibility where reliably measurable, form validation/save/failure, camera readiness, model error, inference result cadence, tracking-loss, exercise start/pause/finish/save, photo recognition status and provider error. Do not collect raw frames, images, exact health values, free-form transcripts, passwords, auth tokens or sensitive form content as analytics properties.

- Use a consistent event schema and stable anonymous/account-scoped IDs according to the existing consent policy.
- Measure form abandonment and keyboard obstruction without capturing the typed value. Track repeated crash/error signatures and route-level failures.
- Add diagnostics to help reproduce issues: app/build/native module/model versions, Android version/device class, feature state and error codes, redacting identifiers and file paths.
- Ensure analytics failures never crash or block app flows.

## User-facing insights

- Use actual saved workouts, meals, check-ins, goals and supported health records.
- Show simple findings with evidence counts, date range and the source of the insight. Avoid false precision, medical diagnosis or causality claims.
- Adapt recommendations only through the canonical goal/plan rules, with the ability to inspect or undo changes.

---

# 13. AUDIT AND REPAIR THE REST OF THE APP END TO END

After the foundations and highest-risk Coach path are fixed, audit all actual routes and actions from the router—not a guessed screen list. Test all applicable flows present in this app, including:

- Cold start, onboarding, authentication/guest flow, session restore and account switching.
- Home/Today, daily check-in, goals, quests, task completion/replacement/skip and progression.
- Exercise library/catalog, tutorials, Coach, video playback, manual/timed workouts, camera workouts, rest, completion, history and health sync.
- Log Meals, food search, image capture/picker, AI candidate review, macro calculation/submission, daily totals and edit/delete.
- Calendar views, event add/edit/delete, recurrence/reminders, date-boundary logic and keyboard behavior.
- In-app Gallery versus Android system photo picker versus camera capture (these are different flows).
- All bottom sheets, modals, action menus, forms, text inputs, date/time pickers, filters, search, empty/error states and back paths.
- Profile/settings/privacy/permissions, local AI/RAG/memory, voice/STT, health integrations, sync/offline states and data export/deletion where present.

For each critical flow, test happy path, cancellation, no-data state, invalid input, offline/provider failure, permission denial, retry, duplicate tap, background/resume, process/activity recreation where relevant, back navigation and restart persistence. Do not invent product features that aren't in the repository; finish the real documented/implemented scope and clearly log what is out of scope.

---

# 14. DESIGN QUALITY AND ACCESSIBILITY ACROSS THE APP

- Use established theme tokens, typography, spacing, colors, radii, gradients, icons and accessible components. Restore the best earlier Coach design where available.
- Keep the glass-orb buttons that already look good; use them consistently where their affordance is clear, not everywhere. Avoid generic AI dashboard/card clutter.
- Every interactive element must be wired to a real action. No fake success, dead controls, placeholder routes or cosmetic sliders disconnected from behavior.
- Every screen must handle loading, empty, error/retry, disabled, success and permission states as applicable.
- Respect safe areas, screen sizes, font scaling, keyboard state, contrast, touch target sizes, screen readers and reduced-motion settings.
- Global animation policy: **no spring/bounce/elastic effects**. Use restrained timed transitions; keep transitions interruptible and coordinated with gesture/sheet state.
- Don't apply motion blur to text or form input. Never let translucent surfaces reduce readability.
- Do not claim the app is polished based solely on screenshots. Interactions, persistence and actual device behavior must be tested.

---

# 15. TESTING REQUIREMENTS — THE REAL PHONE IS AVAILABLE

Use the attached Android phone if it appears in `adb devices`. Keep a clear device/build identity so test results aren't accidentally attributed to a stale APK. If multiple devices are attached, select the intended one explicitly and state which.

## Required test layers

1. Static/type/lint checks for changed code.
2. Unit tests for deterministic movement, rep state transitions, command parsing, serving/unit conversions, nutrition totals, BMI validation, adaptive rules and idempotency.
3. Component/integration tests for modal open/close, focus, keyboard state, form validation, save/retry, Coach session transitions and native adapter fallback.
4. E2E tests for Calendar Add Event with keyboard open; all modal dismiss paths; Log Meals photo/manual path; Coach intro → tracking → count → rest → finish → saved history; STT command confirmation; native module error/fallback.
5. Android native build/config checks and exact release artifact verification.
6. Real device smoke and longer-session tests: startup/no crash, blur backdrop actually blurs, sheets work, keyboard doesn't block fields, camera/pose marker alignment and latency, front-camera mirror, pause/resume/rest, background/resume and teardown, save and re-open history.
7. Repeat the initial crash reproduction after fixes; inspect logcat again. Run a release build and install that exact artifact.

Tests must be real and reproducible. Do not report a test passed if it was not run. If any physical-device action is impossible, state the exact limitation, and still run all available checks.

---

# 16. SUB-AGENT / TASK DELEGATION RULES

Use Claude Code sub-agents or task tools where available, but only after discovering file dependencies and creating a single ownership map. Do not pretend sub-agents ran when they did not. Suggested bounded workstreams:

- **A — Foundation UI:** FrostedView, sheets/modals, keyboard-aware form patterns, Calendar Add/Edit event. Own shared UI files.
- **B — Native crash/build:** app config, Kotlin/module registration, model packaging, release build/install. Own native/config files; coordinate before editing shared Coach UI.
- **C — Pose performance:** `PoseCameraView`, native camera pipeline, JS adapter and overlay profiling. Own pose/native/rendering files.
- **D — Coach UI/session:** intro/HUD/banner/video/rest/completion and session state, after interfaces from B/C are settled.
- **E — Nutrition/AI/onboarding:** foods/macros, goal forms, local AI/provider abstraction and user approval flows.
- **F — STT/agent actions/analytics:** typed voice command registry, form dictation, bounded agentic actions and privacy-minimized events.
- **G — QA/release:** independently retest all fixes and produce evidence; must not sign off on its own unsupported claims.

Before assigning work, identify the actual files and interfaces. Prevent concurrent edits to the same shared component. Use branches/worktrees only if supported and safe. The integrator must review every diff, resolve conflicts, run integration tests and reject changes that add duplicate stores/providers, break current flows or lack evidence.

---

# 17. REQUIRED IMPLEMENTATION PLAN AND TASK TRACKER

Create/update one task tracker in the repo with priority, owner, dependencies, touched files, acceptance test, status and evidence path. Work in this order unless current evidence dictates otherwise:

- **P0 — Stability:** baseline/backups, crash root cause, native-module registration/packaging, correct dev/release identity.
- **P1 — Shared UI:** FrostedView backdrop blur, AppBottomSheetModal/gesture behavior, keyboard/focus/scroll, Calendar event form and other affected forms.
- **P2 — Real-time Coach foundation:** camera lifecycle, model load/readiness, inference error/in-flight state, timestamps, frame cadence, coordinate mapping, body-only rendering, JS/Skia hot path.
- **P3 — Coach product quality:** restore previous good design, exercise intro, HUD/banners, tutorial video behavior, controls, rest/countdown, completion and session persistence.
- **P4 — Food/goal/voice:** Log Meals and photo/manual nutrition, macros, goal-first onboarding/BMI, STT controls, local-AI draft/action pipeline, adaptive plan rules.
- **P5 — Whole-app regression:** Gallery, other routes/forms/sheets/modals, analytics/health integrations, offline and privacy.
- **P6 — Release:** all tests, connected-device acceptance, release artifact, version/signing/store/privacy assets, submission checklist, commit/push.

Do actual work in each phase; don't spend the whole session updating plans. Use small coherent commits. If a blocker appears, work on other independent tasks and record it precisely.

---

# 18. DEFINITION OF DONE — EVERYTHING MUST HAVE EVIDENCE

## Stability/native

- No reproducible known startup or navigation crash in tested flows.
- Correct native module names/autolinking/config and packaged model/assets in the release binary.
- Runtime module/model/camera readiness and failures are accurately represented.
- Exact release artifact is identified and installed/tested on the target device when available.

## Shared UI and keyboard

- FrostedView visibly blurs actual underlying content where supported; fallback is intentional and not misrepresented.
- Motion blur works in chosen existing moving UI elements on supported Android versions, with safe fallback and no regression.
- Every sheet opens/closes; scroll and drag work together; no frozen/half-dismissed modal.
- Calendar Add/Edit Event title and every relevant field can be focused, edited and scrolled into view with the keyboard open. Save remains reachable. Data persists correctly.
- Shared fix verified in all affected sheet/form callers.

## Coach/pose

- Camera lifecycle, model readiness and teardown are safe.
- Body markers are aligned, front-camera mirrored correctly, update from fresh results and do not visibly lag beyond the measured target on the real device.
- No stale marker is shown as live; no unbounded frame backlog; no per-frame whole-screen React rendering.
- Face/hand inference is off and overlays opacity zero for this release while source/modules remain available.
- STT commands operate without requiring local AI and every action has manual fallback.
- Real exercise reps/holds/sets/countdowns/rest and session completion are accurate and persisted once.
- Coach UI is polished and consistent; the previous good design has been recovered or a documented evidence-based improvement replaces it.

## Nutrition/onboarding/AI

- A user can manually log meals and macros offline; photo identification is an optional candidate suggestion, not fake truth.
- Macro calculation uses a canonical deterministic data/service path; submission is reviewable, confirmed, persistent and idempotent.
- Onboarding adapts questions to chosen goals and calculates validated BMI only when inputs support it.
- Local AI availability and provider fallback are real and accurately surfaced; safe agentic actions use validation/preview/confirmation and verify saved outcomes.
- Analytics helps diagnose app quality without collecting sensitive raw payloads.
- Health values have a valid source and consent; the app never fabricates BP/SpO₂ from generic phone capabilities.

## Whole app/release

- Critical routes/actions are covered by the actual route inventory and tests.
- No known high-severity crash, dead critical control, blocked form or data-loss bug is knowingly left without explicit status/blocker.
- Store screenshots, descriptions, privacy declarations, permissions and release notes are accurate.
- Commit(s) contain only intended, tested changes. Push only to the correct configured branch/remote, with no force-push, and only when credentials/permissions allow. Do not make a release public or submit to a store unless the necessary authority and confirmation exist.

---

# 19. FINAL REPORT — BE SPECIFIC, NOT OPTIMISTIC

At the end, provide:

1. Executive outcome: what is actually fixed and what remains blocked.
2. Crash/root-cause register with evidence and old/new behavior.
3. Shared component outcomes, especially `FrostedView`, bottom sheets, Calendar keyboard/focus, and other affected forms.
4. Pose/native profiling: before/after measured cadence/latency/jank, device/build, relevant logs, limitations and why selected delegate/configuration is appropriate.
5. Coach journey and exercise coverage with test evidence.
6. Nutrition, onboarding/BMI, STT, local AI/agentic action and analytics results.
7. All changed file paths, backup/recovery locations and commit hashes.
8. Exact commands and actual pass/fail/skip outputs; distinguish automated from real-device validation.
9. Artifact path, package ID, version/versionCode, checksum if available, install/launched status and test device.
10. Git push status and branch/remote only if actually pushed.
11. Store submission status: prepared, uploaded, submitted, approved or published—use only what has been verified.
12. Every remaining issue with severity, reason, and smallest next action.

Never write “everything is fixed” without complete evidence. Do not claim publication without confirmed store-console state. Do not leave only a plan: implement everything feasible in the repository now and produce verified deliverables.

---

# FINAL COMMAND

Start by inspecting the real repository, the provided native Kotlin/TypeScript/Coach component excerpts, project rules, recent history, current crash reports and the attached Android device. Protect the current work. Fix shared components and keyboard/form reliability first; stabilize native-module/build behavior; then profile and repair the pose pipeline and recover the best Coach design. Finish the exercise/session path, nutrition, adaptive goals, STT/local AI, analytics and remaining product flows. Run the actual tests, install and verify the exact release artifact, commit the verified work, and push only if safely authorized.

**One existing app. No separate Beta Lab. No placeholder success. No hidden regressions. No fake measurements. Fix the foundations, prove the real workflows, and deliver the strongest safe production release the repository can support.**
