# THRIVEFOLD — COMPLETE FINAL PRODUCTION EXECUTION PROMPT V2

## Recover the app · fix crashing, sheets and keyboard-blocked forms · repair Android blur · finish Coach, nutrition, AI, analytics and release

**Target environment:** Antigravity / Gemini coding workflow, using available specialist sub-agents when supported.  
**Product:** Existing Thrivefold React Native / Expo Android-first app.  
**Execution mode:** inspect → preserve → diagnose → integrate into the existing product → test → verify → publish-ready delivery.  
**Mission:** Repair the actual existing Thrivefold app, eliminate crashes and native-module failures, restore genuine Android frosted-glass blur, integrate both linked native libraries into real production experiences, finish exercise/Coach/Train and every existing user flow, and deliver a verified release candidate. Do not create a separate Beta Lab, demo-only screen area, demo app, or disconnected experimental flow.

> **THIS IS AN EXECUTION PROMPT, NOT A REQUEST TO WRITE ANOTHER PLAN.** Inspect the actual repository, then do the work in safe, reviewable stages. Do not claim a feature works merely because it compiles or has a screen. Prove behavior through real navigation, persistence, device testing where available, and evidence.

**Fresh-session rule:** this file is intended to be pasted into a new coding-agent session. Do not rely on the current chat history or assume the other prompts are loaded. Discover and read every actual project instruction/specification in the repository, including duplicate/older notes, record which were read, reconcile contradictions with the existing code/history, and preserve the full feature scope. This prompt is the execution contract; the repository and evidence determine exact implementation details.

# RELEASE-SCOPE DECISION — SHIP A WORKING APP, NOT A NEW EXPERIMENT AREA

The objective is to get the **existing Thrivefold app** stable, useful, smooth and genuinely publishable. Do not create a Beta Lab, separate demo, fake prototype, replacement app, or disconnected “coming soon” experience. Integrate selected capabilities into their proper existing production flows after compatibility and safety checks. Do not ask the user to choose among architectures that can be decided by inspecting the code.

For this release, prioritize these outcomes in order:

1. Stop crashes and repair all native-module/runtime/build failures.
2. Restore true Android frosted-glass **backdrop blur**; it currently looks transparent and is not acceptable.
3. Recover the previously good Coach/Train UI from Git history where possible, then finish the real camera exercise flow with **body pose markers only** as the visible tracking layer.
4. Use the reviewed pose-detection module in the actual exercise experience and measure/fix lag at its source.
5. Integrate `expo-motion-blur` into appropriate real moving UI elements; do not confuse motion blur with backdrop blur.
6. Make explicit speech-to-text (STT) commands work without requiring local AI, while restoring local AI as an optional, useful agentic layer for natural-language intents and draft form filling.
7. Complete food logging, photo-assisted food identification, defensible macro calculations, goal-based onboarding, adaptive plans, health-data integrations, and all other existing critical flows.
8. Verify the exact release artifact and finish the real publication checklist. Do not claim the app is published unless publication is confirmed in the actual store console.

**Current release tracking scope:** body-pose markers must be live, correctly aligned, smooth without obvious lag, and visually restrained. Preserve the existing face/hand code, native module integrations, model/config paths and ability to re-enable them later; do not delete those capabilities. For this release, render face and hand overlays with opacity `0` and pause their inference by default so they do not steal camera/inference budget from body pose. Keep their feature configuration intact for future reactivation. Do not pretend invisible face/hand tracking is running. If a technical dependency requires either pipeline to remain active, prove with profiling that it does not materially degrade pose performance and document why.

**Voice/AI contract:** manual controls always remain available. STT must work as a deterministic command layer without a local LLM or cloud AI. Local AI may improve free-form interpretation, personalize suggestions, and prepare form fields, but it must not be a required dependency for core controls or numeric calculations. Voice or AI may prepare a draft; the user must review and confirm health, nutrition, account, destructive, or externally visible submissions before they are committed.

# CRITICAL OVERRIDE — THIS APP IS CRASHING: REPAIR THE REAL APPLICATION FIRST

Treat the current Thrivefold app as unstable and not release-ready. The highest priority is to stop crashes, fix native-module registration/packaging and lifecycle failures, then verify every critical flow. Do not start with cosmetic polish while the app itself crashes.

The currently reported problem set includes:

- Application crashes, startup failures, stale or incorrect installed APKs, and native modules that may be missing at runtime even when TypeScript or a Gradle compile succeeds.
- Android native linking/autolinking/config-plugin/build issues, missing native libraries/DSOs/models, Expo Updates startup/file failures, wrong module names, duplicate module initialization, incorrect package/application IDs, or mismatched dev/release variants. Check which actually exist; do not assume an old issue remains current.
- Frosted panels rendering white/opaque, broken BlurView provider/target/ref/wrapper usage, and broken modal/sheet gestures.
- Coach/Train camera completion modal is visually poor and must be redesigned and completed end to end.
- Body/face/hand landmark styling is ugly, inconsistent and slow; visual landmarks lag behind movement and can look stale. Profile the actual pipeline; do not mask the lag by adding more animation.
- Log Meals is broken and the in-app Gallery does not open.
- Voice/camera session flows, achievement/completion UI, routes and other screens may contain additional regressions.

## P0A. Crash-first operating rule

1. Read runtime logs (ADB/logcat), Crashlytics/Sentry reports, build outputs, Gradle diagnostics, Android manifest, Expo config/plugins, native module definitions/registration and exact installed artifact metadata. Record the reproducible crash stack and environment before changing code.
2. Inspect `git status`, uncommitted work and recent history. Make a real, verified source/config backup before risky changes. Never reset/clean destructively or delete native project files to make the repo appear clean.
3. Create a crash/root-cause register with: signature, first/last known version, route/trigger, native/JS layer, evidence, suspected versus confirmed cause, fix, regression test and status.
4. Fix one root cause at a time. After each native/config change, run targeted TypeScript/lint/tests, regenerate native projects only with the established Expo workflow when needed, run the Android build, install that exact artifact, launch it, inspect logcat and re-run the crash-triggering route.
5. Verify both development and release variants where applicable. Native modules must be present and callable in the exact binary. A successful Metro bundle, TypeScript check, unit test, prebuild or Gradle compile alone is insufficient.
6. Integrate the selected native modules through a fail-safe typed adapter. Check native module availability and initialization before starting camera/shader-dependent flows; catch recoverable initialization/runtime errors and fall back to the current stable implementation where possible. Do not rely on a catch around a static import if static module resolution itself can fail. Rollback flags are for safety, not a reason to leave the feature unused or disabled after it is accepted.
7. Confirm autolinking, config-plugin application, module names, Android package IDs, Gradle dependencies, Kotlin/Java registration, ABI packaging, model/resource inclusion, Android manifest permissions, Proguard/R8 rules when relevant, Expo Updates assets and startup paths. Check release APK/AAB contents where feasible.
8. Check app launch cold/warm, background/resume, navigation into/out of camera, permissions denial/grant, force-stop/relaunch, process/activity recreation and offline startup. Validate that Sentry/Crashlytics initializes only once, without duplicate initialization or hiding actual crashes. Never disable crash reporting merely to make a build pass; if upload must be skipped locally, separate upload configuration from runtime crash reporting and document it.
9. Do not state “crash fixed” until the previously failing reproduction no longer occurs, relevant logs are clear, a regression check exists where feasible, and the exact installed artifact has been opened and exercised. List any untested device/API scenario honestly.

# CRITICAL OVERRIDE — BOTTOM SHEETS, MODALS AND TEXT INPUTS ARE CURRENTLY BROKEN

This is a release-critical defect, not optional polish. Bottom-sheet/modal motion and gestures are glitching, and Calendar → Add Event contains text fields that become unreachable or covered by the Android soft keyboard. The same class of defect may exist in edit-event flows and other forms embedded in sheets/modals. Fix the shared root causes and then verify every actual instance.

**Required outcome:** every existing input can receive focus, show the cursor, accept edits, scroll into view, preserve text and submit/cancel correctly while the keyboard is visible. The user must never be trapped below the keyboard, behind a footer, under a navigation bar, or inside a frozen/half-dismissed sheet. The keyboard must not destroy form state or cause the sheet to jump, clip, flicker, or become impossible to close.

Do not just add `KeyboardAvoidingView` around one screen and declare this fixed. Audit the actual sheet/modal implementation, navigation/root layout, Android soft-input mode, insets, scroll containers, focus handling, fixed footers, gesture handlers and blur overlays. Choose one coherent keyboard-avoidance owner per presentation surface; prevent competing/double insets. Use `KeyboardAvoidingView` where appropriate, plus a keyboard-aware scroll strategy that scrolls the focused field above the keyboard. If the installed stack needs a more capable keyboard controller, inspect compatibility and only add/use it when justified. Use official docs for the installed versions, including https://docs.expo.dev/guides/keyboard-handling/ and https://reactnative.dev/docs/textinput.

No text input, modal, bottom-sheet, calendar event form, or other critical field may remain untested. This requirement has explicit acceptance tests later in this prompt and blocks publication if it fails.

# CRITICAL OVERRIDE — NATIVE MODULES MUST BE REAL, REGISTERED, AND SAFE

Audit every local Expo/Kotlin/Java native module used by the current app, not just the new proposed libraries. Search JS imports and dynamic requires; match every referenced native module name to its actual module definition, package registration, config plugin, autolinking setup, native build inputs, TypeScript API contract and runtime availability.

For every native module:

- Create an inventory: consumer imports, exported name, Android class/package, config plugin, permissions, Gradle dependencies, model/DSO/assets, lifecycle owner, events/callbacks, async/threading assumptions and build variants.
- Detect unresolved imports, mismatched names, duplicate registrations, missing generated files, manual registration that conflicts with autolinking, invalid config-plugin output and dependency/version conflicts.
- Ensure native async work does not block the UI thread; cancel work, remove listeners/handlers and release camera/model/surface resources on route exit, React context destruction and app lifecycle changes.
- Keep the JS/TS interface typed and runtime-validated. Error states must distinguish unavailable module, permission denied, model missing, initialization failure, unsupported device/API and recoverable inference errors.
- Validate the production APK/AAB as well as debug/dev builds. Check APK analyzer/contents for required `.so`, model assets and resources. Launch tests must exercise the actual native API, not a stub.
- Do not patch generated `android/` output as the only source of truth if Expo prebuild regenerates it. Find and correct the package/config-plugin/module source that generates the output.
- Avoid installing the same native capability twice. Do not run two camera engines or two competing native frame processors at once.
- Integrate each selected native module through a typed shared adapter and safe fallback. A narrow emergency kill switch may remain for rollback, but do not use a demo-only route or leave the feature disconnected from the real user flow.

# COACH / TRAIN CAMERA MODAL — VISUAL AND FUNCTIONAL REBUILD, NOT JUST COLOR TWEAKS

The camera coaching/training and workout completion experience is currently reported as ugly and incomplete. Rework it as a cohesive premium experience after P0 crashes and core native issues are stabilized.

Audit the actual flow and every modal/sheet state: camera introduction, permission education, camera initialization, subject not detected, framing/calibration, active tracking, pause, resume, cancel/exit confirmation, workout completion, achievements, errors, retries and history-save confirmation. Avoid stacking multiple modals on top of each other.

Design requirements:

- Use the existing Thrivefold theme tokens and proven shared primitives. Do not invent a disconnected theme or randomly introduce colors.
- Use clear hierarchy: concise heading, meaningful subtext, one primary action, secondary actions that are visibly secondary, readable contrast, consistent radius/spacing/typography, precise icon sizing and stable safe-area layout.
- Make the live camera/pose stage the visual focus, and place controls where they do not obscure joints or instructional cues. Ensure responsive layouts for small screens, landscape if supported, keyboard/navigation bars and display cutouts.
- Completion modals must summarize real session duration, completed exercise/sets/reps and actual earned achievements/rewards. Never invent values or grant duplicate rewards. Include clear “Done/Continue”, “View session” or existing equivalent actions, and make back/close/dismiss rules deterministic.
- Reuse the shared modal/sheet foundation where safe. Fix the underlying provider, gesture, stacking, focus and lifecycle bugs rather than building a one-off modal system.
- Use subtle non-spring transitions only. No overshoot, bouncy scale, spring, or perpetual animation.
- Provide loading, unavailable-camera, permission-denied, detection-lost, recoverable-error, session-cancelled, save-pending and saved states. Never show success before persistence is confirmed.
- Add screenshot-based internal design QA for every meaningful state. Screenshots are not proof of native camera behavior; also test the actual device.

# POSE / FACE / HAND LANDMARKS — FAST, STABLE, ATTRACTIVE AND MEASURABLE

**Release focus override:** the currently shipped Coach/Train camera should prioritize body-pose tracking. Preserve the face/hand implementation and all required native registration so it can be reactivated in a later release, but set their visible overlay opacity to `0` for the current release and keep their inference stopped/paused by default. Do not run invisible full-rate pipelines in the background. Body-pose inference/rendering must receive the available frame budget first. Make opacity/enable settings explicit in one configuration source instead of scattering magic numbers. When a feature is reactivated later, its own status, timing and permissions must be truthful.

The user reports that this screen looked substantially better before recent changes. Recover the last good Coach/Train screen layout and landmark behavior from Git history/screenshots before redesigning. Do not accept a generic new layout that discards the previously good structure. Use the shared design system to refine it, keep the camera preview large, make the body skeleton the focal layer, and keep instructions and controls clear and unobtrusive.

Do not merely recolor the skeleton. Profile and improve the pipeline from camera sensor frame to native inference to coordinate transforms to drawing/JS events to screen display. Separate measurements for camera capture, frame conversion, model inference, frame queue, JavaScript delivery and rendering; only report timings that can be measured.

## Performance and rendering rules

- First recover the previously better working pose overlay by checking Git history and comparing the known-good implementation, if available. Establish a repeatable baseline on the available physical device before choosing a replacement.
- Use the native rendering pathway for the continuous skeleton wherever the reviewed API supports it. Do not put each frame's 33 or more landmarks into React component state at camera frame rate. Avoid frame-by-frame full component tree rerenders.
- Where available, use a native trigger/event for rep counting and throttle/batch coordinate delivery to JavaScript for UI values that actually need it. Use latest-frame-wins or bounded queues as appropriate; drop stale frames instead of accumulating latency. Do not let expensive JS work block camera/inference threads.
- Measure effective FPS, p50/p95 frame/inference times, event frequency, dropped/stale frames, end-to-end display delay, memory/CPU/GPU and thermal behavior where supported. Never fabricate these metrics. Use the same device, exercise, lighting and capture setup for before/after measurements.
- Verify CameraX/camera pipeline resolution, analysis resolution, YUV/RGB conversion, rotation, mirroring, crop and scaling. Add tests for normalized-vs-pixel coordinate contracts and front-camera mirroring. Do not compensate for transform bugs by arbitrary offsets.
- Inspect smoothing/filter delay. Smoothing should remove jitter without making the skeleton trail behind movement. Tune or disable filters based on measured movement and model output; do not add smoothing on top of a detector that already smooths unless evidence supports it.
- Reconfigure resolution/model/delegate/FPS conservatively for low/mid-tier devices. Prefer adaptive profiles and thermal fallback over fixed maximum FPS. Never run additional face and hand models continuously without measuring their combined thermal and frame-time cost.
- Use one camera owner at a time. Stop inference and release resources on screen unfocus, permission loss, backgrounding, route exit and errors. Ensure face/hand/pose processing cannot race or multiply camera subscriptions.
- If the existing face and hand pipeline uses a separate library, preserve its actual capability and verify its registration/build packaging independently. The proposed `react-native-pose-detection` library documents a 33-landmark human-body pose skeleton; it should not be assumed to provide a full facial mesh, eye landmarks or detailed hand landmarks. Do not claim replacement of these systems unless the source proves it.
- Prioritize legibility and understated visual design: coherent line widths, small but visible joints, predictable left/right palette, a distinct but limited highlight for the currently relevant joint, low-noise confidence/visibility treatment, optional labels only when useful, and contrast over light/dark camera backgrounds. Avoid rainbow gradients across every joint, thick neon strokes, excessive glow, pulsing points, dense labels and overlapping face/hand/pose skeletons.
- Use a stable, consistent palette with semantic meaning (e.g. left/right or tracked/uncertain) only after examining existing design tokens. Include an accessible fallback and a toggle for overlay visibility. Do not color-code confidence unless actual confidence/visibility values are available.
- Smooth landmark coordinates temporally only with measured filters and reset filters after tracking loss, camera switch, orientation change or subject re-acquisition so old coordinates do not ghost across the screen.
- Handle visibility/confidence thresholds, partial-body detection, multiple people if supported, no person detected, occlusion, low lighting, off-screen limbs and tracking recovery. Do not draw stale landmarks when frames stop arriving.
- Separate pose, face and hand result timestamps/state. If one pipeline stalls, clearly diagnose it and avoid presenting stale results as live. Pause or degrade lower-priority face/hand tracking when performance requires it, without silently changing product claims.
- Test fast movement, slow movement, changing distance, front/back camera, rotation, poor lighting, partially out-of-frame limbs, subject entry/exit, repeated camera open/close, background/resume, thermal slowdown and navigation away mid-session.
- Add a diagnostics overlay only in development/internal diagnostics settings, with real frame timestamps, model-ready status, target/measured FPS, inferred profile, error state and data age. Never expose raw personal camera frames or sensitive debug data in analytics/logs.

Definition of done: the skeleton stays aligned with the person without visibly trailing or jumping under the tested conditions; no unbounded frame queue accumulates; tracking loss clears stale joints; camera resources are released; measured performance is documented; and the production Coach uses the integrated engine only after compatibility, lifecycle, performance and end-to-end session checks pass. Do not leave the new engine as a demo-only feature.

# MOTION BLUR VS. FROSTED BACKDROP BLUR — USE EACH FOR THE RIGHT PURPOSE

The app is crashing and the existing Android frosted surfaces have regressed. Restore the existing backdrop/frosted-glass implementation first. Integrate `expo-motion-blur` into suitable existing production moving elements; it is not a substitute for blurring content behind a sheet or modal. The package README currently describes per-pixel runtime shaders on Android 13+, directional blur on Android 12, and normal rendering/no blur on Android 11 and below/web. Validate the exact pinned source and real-device behavior before relying on these claims.

Wrap MotionBlurView behind a small shared production adapter with an ordinary-view fallback. Do not apply it app-wide, to all list items, text, camera landmarks, modal backdrops or form inputs. Always provide an immediate plain-View fallback. Test the feature on/off transitions, reduced-motion, unsupported OS, background/resume, view unmount, rapid movement, GPU/rendering failures and memory/thermal costs. Do not make the app depend on a blur shader to render core navigation or controls.

# LINKED LIBRARY REVIEW — REQUIRED SOURCE FILES AND EVIDENCE

Motion blur repository: https://github.com/rit3zh/expo-motion-blur  
Android folder supplied: https://github.com/rit3zh/expo-motion-blur/tree/main/android/src/main/java/expo/modules/motionblurview  
README: https://github.com/rit3zh/expo-motion-blur/blob/main/README.md  
Manifest: https://github.com/rit3zh/expo-motion-blur/blob/main/package.json  
Pose repository: https://github.com/khalid999devs/react-native-pose-detection  
Android folder supplied: https://github.com/khalid999devs/react-native-pose-detection/tree/main/packages/core/android/src/main/java/com  
README: https://github.com/khalid999devs/react-native-pose-detection/blob/main/README.md  
License: https://github.com/khalid999devs/react-native-pose-detection/blob/main/LICENSE

For the exact revision selected, review not just the linked folder but README, `package.json`, lockfile/version tags, LICENSE, source, config plugin, TypeScript API, camera/detector/rendering/performance directories, examples, changelog, issues and build instructions. Record exact commit SHA/tag and source URL. Preserve required license/attribution notices. Do not take a few Kotlin files out of context and paste them into the app.

Compatibility must be established against the actual app's `expo`, `react-native`, Gradle/Android Gradle Plugin, Kotlin, min/target SDK, architecture, native module autolinking and config-plugin versions. Do not upgrade React Native/Expo to the newest version merely to satisfy a library. If the latest tagged version is incompatible, inspect a compatible revision or build a narrowly scoped maintained fork/local Expo module so the required capability is still integrated into the real app. A temporary branch/worktree may be used to validate native changes, but do not end with a prototype or postpone the feature merely because the first package version fails. Do not edit `node_modules` as a durable fix. Use the package as a dependency when compatible; otherwise prefer a focused maintained fork/local module over isolated copied files. If local module source is necessary, isolate it under the existing native-module convention and document ownership, upstream revision, license and merge/upgrade process.

---

# 1. NON-NEGOTIABLE PRODUCT BOUNDARY — FIX AND IMPROVE THE EXISTING APP, NO SEPARATE BETA LAB

**Do not create a separate Beta Lab, demo area, or disconnected prototype.** The user explicitly wants the linked modules used in the existing application, in the real flows where they belong, with modern UI/UX and a release-ready result.

## Production integration rules

1. Work in the existing Thrivefold app, its existing routes, design tokens, session models, data services and navigation. Do not create a separate application, beta navigation stack, duplicate home screen, demo-only pose screen, or disconnected motion-blur playground.
2. Integrate `expo-motion-blur` into appropriate existing moving UI elements and motion transitions where the effect improves the actual product experience. It is motion blur tied to movement; it is not backdrop/frosted-glass blur and must not be misused as a substitute.
3. Integrate `react-native-pose-detection` into the real Coach/Train exercise experience if compatibility can be achieved safely. Use it for live body-pose tracking and native skeleton rendering, with exercise/session state connected to the existing canonical workout logic. Do not leave it installed but unused or available only from a standalone test screen.
4. Fix the current Android frosted-glass implementation itself. A frosted surface that only looks transparent or tinted is broken. Use a correct backdrop/background-sampling implementation and a real blur path on supported Android versions; use Reanimated for smooth, non-spring movement/opacity/gesture interactions, and a suitable native shader or supported native rendering implementation for the actual blur. Do not pretend a transparent overlay or a shader that never samples the background is a functioning frosted blur.
5. Use existing app routes for camera setup, live coaching, exercise completion, achievements and history. Improve their UI in place. Add a screen or route only if it is a genuinely missing product step, not to isolate the new libraries as production integrations.
6. Keep changes production-oriented but reversible: a narrow internal kill switch or adapter may provide a safe rollback if a native engine fails on a particular device. It must not hide the feature from the real product or permanently default the new implementation off after integration is accepted.
7. If a dependency is incompatible with the app’s actual SDK/native stack, do not abandon the requirement after documenting incompatibility. First inspect the source, tags, plugin and native API; evaluate a compatible pinned revision, an isolated maintained fork/local Expo module, or a minimal upstream-derived adaptation. Preserve licenses. Do not upgrade Expo/RN wholesale merely to satisfy a package unless the full upgrade is justified, tested and necessary. If genuinely impossible to integrate safely, implement the best compatible equivalent in the current architecture, identify the exact hard blocker, and never falsely claim the linked package is active.
8. No duplicate camera owners, MediaPipe pipelines, databases, stores, theme systems, exercise engines or reward engines. Consolidate through adapters and existing canonical services.
9. No spring/bounce effects anywhere. Use polished, restrained non-spring transitions. Do not sacrifice reliability, readability, battery, accessibility or frame rate for decoration.
10. Existing core behavior must continue working: Home, navigation, Coach/Train, meals, Gallery, quests, achievements, calendar, AI/data and all other documented current features. Do not rewrite healthy modules just to make new dependencies fit.
11. Marketing/store screenshot exports must continue excluding Coach, Train-with-Camera, pose, face, hand and camera screens, as required by the existing project constraints. Internal QA screenshots may include them.
12. The end product is the whole actual app, with integrated features. It must be ready to publish as far as real credentials, platform access and required external approvals permit. Do not call it release-ready if any release-blocking crash or key user flow remains unverified.

## Definition of integration done

A package is not integrated just because it appears in `package.json`. The new API must be used by the actual intended user experience, its native code and assets must ship in the correct APK/AAB, all lifecycle/error states must work, tests must cover it, the feature must survive app restart and navigation, and the final installed artifact must prove it works on device where a device is available.

# 2. READ AND RECONCILE ALL CURRENT PROJECT RESOURCES FIRST

Do not rely on this prompt alone. Search the actual repository and read all applicable instructions and product docs before editing:

- `AGENTS.md` and nested agent instructions.
- README and app architecture/navigation documentation.
- Existing master prompt, recovery prompt, Coach prompt and data/AI/architecture prompt.
- All relevant project `.md` files, product specifications, TODOs, issue/backlog docs, delivery logs, route lists, acceptance criteria, design notes, release scripts and changelogs.
- Current package manifests and lockfile; installed Expo SDK, React Native, Reanimated, Gesture Handler, Skia, BlurView, ImagePicker, MediaPipe/pose-related modules and native module configuration.
- Existing design tokens, theme colors, typography, spacing, radii, shadows, icons, buttons, modal/sheet primitives, accessibility patterns and responsive layout rules.
- Existing route definitions, error boundaries, state management, React Query/query keys, SQLite/Supabase schema and migrations, security/RLS policies, repositories, AI/RAG, game/reward services and analytics.
- Existing tests, scripts, CI, Android build artifacts, app IDs, EAS/native build configuration and known Crashlytics/Sentry history.
- Git history for the previous working blur/frosted UI, sheets, Coach/Train/pose overlay, meal logging, Gallery, camera lifecycle, achievements and build configuration.

Build an inventory of resources and create/update `docs/implementation/THRIVEFOLD_REQUIREMENTS_COVERAGE.md` (or update the established equivalent). For every requirement, map: source resource → existing implementation → gap/regression → owner/track → test → evidence/status. Detect duplicate or contradictory Markdown plans. Consolidate status into one canonical tracker; do not blindly delete old docs or treat duplicate prose as two separate product features.

Do not claim all resources were read unless the repository confirms it. Report inaccessible files, truncated references, conflicts and unresolved assumptions.

---

# 3. SAFE BASELINE, BACKUPS AND REGRESSION ARCHAEOLOGY

Before edits:

1. Locate repository root and read all project rules.
2. Record branch/current commit, `git status --short`, tracked/untracked work and recent commits.
3. Identify package manager from the lockfile and package metadata. Use the project's prescribed package manager. For the Setu workspace this has been `pnpm` only; verify whether the current Thrivefold repository shares that constraint rather than assuming.
4. Record installed SDK/toolchain versions and current typecheck, lint, test and Android build baseline without destructive cleanup.
5. Capture current app behavior/logs and reproduce each reported bug where possible.
6. Inspect file history and diffs to identify the last known-good implementation and likely regression point. Separate confirmed root causes from hypotheses.
7. Back up affected source/configuration and relevant diffs using the repository's existing convention, or a dated ignored local path such as `.local-backups/thrivefold-v2-YYYYMMDD-HHmmss/`. Verify actual contents. Protect database data separately. Never commit secrets or backups.
8. Make changes in small, reviewable batches. Do not run `git reset --hard`, destructive `clean`, broad checkout, database reset, delete/recreate native project or overwrite uncommitted work to make the repository look clean.

Document the work in the established recovery delivery log (create `docs/implementation/THRIVEFOLD_RECOVERY_DELIVERY_LOG.md` if none exists). For each defect record symptom, route, root-cause evidence, change, files, backup/recovery reference, commands/tests/results, device status and residual risk.

---

# 4. RESEARCH BOTH LINKED LIBRARIES — VERIFY, DON'T COPY BLINDLY

Read the actual source, README, package metadata, license, changelog, install/config plugin, APIs, example usage, limitations and issues in the exact repositories below. Use current source from the default branch as a research lead, not as automatic evidence of compatibility with this app. Pin a reviewed version/commit before implementation.

## A. Native motion blur

Repository: https://github.com/rit3zh/expo-motion-blur  
Android native source link provided: https://github.com/rit3zh/expo-motion-blur/tree/main/android/src/main/java/expo/modules/motionblurview  
README: https://github.com/rit3zh/expo-motion-blur/blob/main/README.md  
Package manifest: https://github.com/rit3zh/expo-motion-blur/blob/main/package.json

Initial source review observations to validate against the pinned commit:

- The README describes `MotionBlurView` wrapping moving content and applying directional/per-pixel blur related to on-screen velocity.
- It documents `intensity`, `speedForMaxBlur`, `samples`, `enabled` and `live` props.
- It says Android 13+ uses a per-pixel runtime shader; Android 12 uses directional blur along the center of motion; Android 11 and below and web render children normally without blur.
- The README states the native package needs a development build and does not work in Expo Go.
- Repository metadata declares MIT; confirm the exact license in the pinned commit and preserve notices if code is reused.
- The README describes native code but the precise performance/thermal and edge cases must be validated with device tests. Do not assume it is a background/content frosted-glass blur library: motion blur is a different effect from blurring content behind a translucent surface.
- The retrieved package manifest showed package version `0.1.0`; development metadata included Expo `^57.0.23` and React Native `0.82.1`. This is not sufficient by itself to establish package compatibility, because those are its development dependencies—not a complete tested app compatibility guarantee. Verify peer ranges, plugin requirements and current release/tag metadata against the app's actual installed SDK/RN version.

Do not mislabel motion blur as a replacement for Expo BlurView/frosted-glass surfaces. Use motion blur only for specific existing production animated/moving content (for example, an existing card/deck transition or hero element) where the effect visually helps. Keep ordinary translucent bottom sheets, modal surfaces, navigation bars and overlay panels on the existing/fixed frosted UI architecture unless a separate, evidenced blur-behind-content implementation is required.

Review the Android implementation for rendering APIs, shader availability, view snapshot/capture strategy, lifecycle, attach/detach cleanup, coordinate/velocity calculations, invalidation cadence, GPU/CPU usage, memory churn, target API constraints, unsupported OS fallbacks, reduced-motion behavior and accessibility. Never put the effect on every view globally.

## B. Pose detection

Repository: https://github.com/khalid999devs/react-native-pose-detection  
Android source directory supplied: https://github.com/khalid999devs/react-native-pose-detection/tree/main/packages/core/android/src/main/java/com  
README: https://github.com/khalid999devs/react-native-pose-detection/blob/main/README.md  
License: https://github.com/khalid999devs/react-native-pose-detection/blob/main/LICENSE

Initial source review observations to validate against the pinned commit:

- The README describes a React Native/Expo library based on native MediaPipe, with 33 pose landmarks, native skeleton rendering, joint angles, native repetition triggers and adaptive performance.
- It says landmark data does not need to cross into JavaScript unless explicitly requested, which may help avoid UI/JS-thread frame lag.
- It describes `<PoseCamera />`, data modes, trigger events, camera lifecycle/ref methods, performance profiles and image/video detection/export.
- The retrieved README's compatibility table says `react-native-pose-detection` 0.2.x targets Expo SDK 56+ and React Native 0.85+. Check this against the current release and actual repository/package metadata before installing.
- It requires a development build; Expo Go is not supported for native code.
- Repository metadata declares MIT; inspect the exact license and preserve notices. Do not copy large native implementation files into the app without a clear reason; prefer the maintained package API if compatible.

The Android tree contains a native Expo module and several responsibilities split into camera, detector, engine, export, performance and view layers. Inspect those boundaries and contracts instead of extracting a single Kotlin file. Review permission flows, event contracts, module/view registration, native dependencies/model packaging, camera provider lifecycle, surface cleanup, threading, frame dropping, error codes, thermal behavior, CPU/GPU fallback and release APK contents.

The name `pose-detection` does **not** mean it supplies face and hand landmarks. Its documented 33-point human pose skeleton covers body and face-adjacent landmarks but is not a full facial-mesh/eye tracker or hand-landmark detector. Do not claim it replaces separate face/hand pipelines. First recover the previously working Thrivefold pose overlay and profile its lag; then integrate this library into the actual Coach/Train body-pose path after compatibility, lifecycle and performance validation. Face and hand detection remain separate, optional systems with their own lifecycle/performance budget and truthful capability labels.

## Research deliverable and adoption decision

Create a source review table for each library with: pinned version/commit, license/attribution, official API, Expo/RN compatibility, Android OS/device requirements, plugin/config changes, transitive/native dependencies, build implications, artifact size, runtime behavior, error/lifecycle handling, accessibility/fallback, privacy, known risks and tests required. Reference exact source files and docs.

For each library, the required outcome is production integration, not a prototype. Record whether it can be integrated directly, needs a narrow compatible local fork/adapter, or has a genuinely blocking incompatibility. Do not install the latest release blindly, alter Expo/RN versions just to fit it, or patch `node_modules`. Use a temporary branch/worktree to validate risky native changes if needed, but bring the verified implementation back into the real app. Do not leave the new library as an isolated proof-of-concept. Back up and review all prebuild/config/native diffs before accepting them.

---

# 5. PRODUCTION UI/UX INTEGRATION — USE THE NEW CAPABILITIES IN REAL SCREENS

Design the actual Thrivefold product, not a separate lab or showcase. Use current shared tokens and reusable components, and improve the screens users actually navigate to.

## Integrate motion blur into appropriate existing interactions

- Add `MotionBlurView` to one or a small number of carefully selected existing moving elements where it gives a clear, purposeful enhancement—such as a movement-driven card/deck transition or a selected high-level hero/transition already present in the app. Do not create a standalone motion-blur demo screen.
- Keep body landmarks, faces, hands, text, forms, critical controls, charts and content that must remain sharp outside motion blur.
- Use Reanimated to drive coherent motion and gesture state, and let the native motion-blur implementation respond to the element’s motion. Respect the project’s no-spring rule. Do not introduce perpetual animation or apply motion blur globally to every card.
- Give unsupported platforms or disabled effects a graceful ordinary-view fallback. The rest of the app must never crash because a blur effect is unavailable.

## Integrate pose tracking into the real Coach/Train experience

- Replace or repair the live body-pose rendering path within the existing exercise session when the new native engine passes compatibility and device checks. Keep the existing route, exercise catalog, instructions, session persistence, rep/sets logic, reward logic, achievements and history.
- Provide a coherent sequence within the real flow: exercise intro and camera permission → camera readiness/framing → live tracking → exercise guidance and rep/session progress → pause/resume/exit → completed session → achievement/completion modal → persisted history/progress. Use existing intended screens and state machines wherever they exist.
- Use real pose/rep/session results and canonical exercise rules. No demo counters or fake completion. Keep a safe fallback for unsupported hardware or module failure, with clear messaging and a usable alternative such as manual/timed tracking if the current product supports it.
- Keep detailed technical diagnostics behind developer/internal settings. End-user screens should communicate meaningful state in plain language and look polished, not like an engineering dashboard.

## Modern visual standard for the whole app

- Preserve the Thrivefold identity and established theme tokens. Audit every high-traffic screen, sheet, modal, header, footer, tab, card, empty/error state, action button and form.
- Establish clear typography, spacing, surface depth, contrast, aligned icons, consistent radii, appropriate safe-area padding, responsive layout and accessible touch targets.
- Use frosted glass selectively for the surfaces that truly need it; do not make the entire UI translucent. Keep text contrast stable over changing backgrounds.
- Coach/Train should look like a premium, coherent fitness experience—not a debug screen. The camera stage is visually dominant; controls never obscure key joints or instructions; tracking/ready/paused/lost states are distinct; active reps and time are easy to read.
- Rebuild ugly completion/achievement modals with concise hierarchy, real workout summary and actual rewards. Clear primary/secondary actions, close/back semantics and saved/pending/error states are mandatory.
- Landmark styling must be modern and restrained: a consistent body skeleton, sensible line width, small crisp joints, left/right identity where useful, subtle emphasis for active joints, visibility/confidence cues only when data supports them, and readable contrast on light/dark clothing and backgrounds. Avoid rainbow gradients on every joint, oversized neon strokes, heavy glow, cluttered labels and unnecessary pulsing.
- Do not invent an extra route just to showcase a dependency. Integrate into the intended current flows; document any newly necessary user-facing control in the existing settings or Coach configuration.

# 6. ANDROID FROSTED GLASS + MOTION BLUR — TWO DIFFERENT EFFECTS, BOTH IMPLEMENTED CORRECTLY

The current Android frosted/blur view is reported to behave like a transparent or tinted view rather than a real blur. Treat that as a release-blocking visual bug. Restore and fix the existing public component abstraction first, then integrate motion blur into appropriate production motion. Do not hide the issue with opacity, tint or static transparency.

## A. Restore real frosted/backdrop blur on Android

1. Reconstruct the last known-good implementation from Git history. Inspect the installed `expo-blur` version, Android provider/target API requirements, `BlurTargetView`/`blurTarget` usage where applicable, hierarchy and z-order, portals, navigation, modals, clipping, rendering order, device API level and known regressions. Read the official docs matching the installed SDK/version: https://docs.expo.dev/versions/latest/sdk/blur-view/ . Do not blindly copy API examples for a different version.
2. Reproduce the issue on the actual Android device. Use the same background behind the panel while comparing: normal view, translucency/tint only, and actual backdrop blur. Confirm with moving/contrasting content behind the surface that blur is genuinely sampling/softening the background.
3. Keep the existing public shared component/API where possible so existing screens do not need a broad rewrite. Correct the native/target/provider implementation behind that abstraction. All existing frosted headers, cards, navigation surfaces and modal/sheet callers must be audited; fix shared root cause, not one screenshot.
4. If the installed `expo-blur` implementation cannot deliver correct real backdrop blur on the target Android version, implement or adopt a suitable native Android backdrop blur path through a proper Expo module. Review and select APIs/libraries that can capture or sample the content behind an in-window surface. Do not simply apply `RenderEffect` to the translucent overlay’s own content and claim that this blurs the views behind it; verify what content is actually being sampled. A shader is only valid if its source texture is the intended background and it produces a real blur.
5. Prefer supported native blur/shader capabilities by Android API level and device. Document the chosen implementation, API constraints, content capture/copy behavior, lifecycle, resize/orientation handling, clipping and performance. If real blur is unavailable on an OS/device, use a deliberately designed tinted/translucent material fallback and label it as a fallback—not as working blur.
6. Ensure background captures are refreshed correctly without stale frames, flashing, white opaque panels, black textures, recursive capture of the blur view itself, secure-content leaks or excess memory allocations. Do not capture password/secure or private content in violation of platform policy.
7. Test behind scrolling lists, moving content, nested navigation, bottom sheets, full-screen modals, keyboard appearance, system bars, app background/resume and repeated mount/unmount. Validate touch input passes through only where intended.
8. Use Reanimated for non-spring opacity/transform/gesture transitions of the surface and its contents. Reanimated does not itself create a real backdrop blur; do not use motion/opacity as a substitute for the native blur pipeline.

## B. Integrate `expo-motion-blur` into real motion

Source: https://github.com/rit3zh/expo-motion-blur and native Android source https://github.com/rit3zh/expo-motion-blur/tree/main/android/src/main/java/expo/modules/motionblurview .

- Use the actual `MotionBlurView` API from the reviewed version in selected production motion/transition elements where it adds useful motion feedback. Do not build a separate demo screen and do not use it as the general sheet/backdrop blur implementation.
- Its README describes an `intensity`, `speedForMaxBlur`, `samples`, `enabled` and `live` API and platform-dependent behavior. Confirm exact behavior for the pinned revision and installed Android OS; the repository describes per-pixel runtime shader blur on Android 13+, directional blur on Android 12, and a no-blur normal-view fallback on Android 11 and below/web.
- Begin with conservative values; expose only necessary tuning in established product settings if the feature needs it. Do not turn on `live` recapture or high sampling globally without a measured reason.
- Validate that blur responds to actual movement and becomes visually inactive when the view is stationary. Handle interrupt, cancel, route exit, background/resume, orientation and unmount safely. Use a plain-view fallback if disabled, unsupported or failing.
- Avoid blur on content whose legibility, precise edge tracking or accessibility is important. Respect reduced-motion settings and disable/reduce the effect when requested.
- Compare actual frame timing, jank, dropped frames, memory and thermal behavior before/after on representative devices; use evidence, not imagined performance claims.

## C. Acceptance criteria for blur

- The current Android frosted surface produces visibly real background blur on supported test devices, not just transparent/tinted content.
- The app’s blur/frosted surfaces share one maintained component abstraction rather than scattered ad hoc blur implementations.
- `expo-motion-blur` is used in at least the specifically selected real production interaction if its integration is technically supportable; it is not merely installed or shown in a demo.
- OS-specific behavior/fallback is truthful and visually intentional, with no crash on unsupported Android versions.
- Blur never blocks touch, obscures core text, breaks modal/sheet gestures or causes a camera frame-rate regression.

# 7. PRODUCTION POSE DETECTION, MEDIAPIPE, EXERCISES AND COACH/TRAIN

The linked pose library must be evaluated and integrated into the real exercise experience—not just installed or compared in isolation. First recover the previously better-working pose overlay and profile its lag. Then integrate the new native engine safely into the existing Coach/Train routes and session system.

## A. Required production architecture

1. Use `react-native-pose-detection` as the native body-pose engine if the source/API can be made compatible with this app’s actual SDK, React Native version and native build. Use its supported package/API and native drawing path where available. The README describes 33 body landmarks, native skeleton rendering, joint angles, rep triggers and adaptive performance, with JS frame data optional rather than mandatory for every frame.
2. If the exact package release is not compatible, do not stop at an isolated proof-of-concept. Examine a compatible tag/commit, fix or create a narrowly scoped maintained fork/local Expo module based on the upstream code, or implement the required compatible adapter while respecting the MIT license. Do not blindly upgrade the whole Expo/React Native stack or paste isolated Kotlin files without their camera/detector/engine/view contracts.
3. Use one clear camera owner per active session. Integrate the selected pose engine into current Coach/Train and preserve exercise routing, instructions, canonical session state, set/rep rules, save/history, achievements and progression. Do not run the old and new camera engines concurrently.
4. Render the high-frequency body skeleton natively where possible. Deliver only the data needed by React/JS using throttled/batched typed frames or native trigger events. Avoid a React state update for every landmark at every camera frame.
5. Integrate native rep triggers only after validating the exercise-specific state machine, joint angles, thresholds, hysteresis, debouncing, missing landmarks, partial occlusion and user range-of-motion. For exercises that cannot be verified confidently, avoid silently counting reps; show tracking quality and use the current supported manual/timed alternative.
6. Preserve canonical workout state. The native engine reports pose/trigger signals; the product’s deterministic exercise/session service remains the source of truth for sets, reps, completion, XP/rewards and history. Retries/reopened screens must not double count or award duplicate rewards.
7. Include actual model and native libraries in release builds. Verify the exact release APK/AAB has the module and model resources and that the real native camera opens. A TypeScript import or successful Gradle task is not enough.

## B. Face and hand landmarks are separate modalities

The linked `react-native-pose-detection` library’s documented 33 body landmarks are **not** a full facial mesh, eye/iris tracker or dedicated hand-landmark model. Do not tell users otherwise. Audit the existing MediaPipe Face/Hand work and preserve or repair it separately only where the real product already requires it.

- Keep body pose, face/eye landmarks and hand landmarks as separate typed pipelines with explicit capabilities, readiness, timestamp and errors.
- Reuse the existing MediaPipe model/provider if compatible; otherwise select an officially supported compatible model/library and document package/model/license/runtime implications. Do not create duplicate detectors doing the same work.
- Do not run all models continuously by default if that overloads the target device. Use a profile/scheduling policy: prioritize body pose during workouts, enable face/hand tracking only where needed, and pause/degrade low-priority inference based on measured frame times/thermal state.
- Clear stale points immediately when a pipeline stops producing current results. Show independent state where a pipeline can be missing, unsupported or paused. Never present stale coordinates as live tracking.
- Ensure any face/hand landmark overlay never obscures exercise guidance, produces excessive neon/rainbow decoration, or is mistaken for medical diagnosis or precise biometric measurement.

## C. Fix latency at the source

Measure the real path from camera sensor → frame conversion → model inference → output queue → coordinate transform → native drawing / JS event → displayed landmarks. Record camera frame rate, inference latency (p50/p95 where possible), measured display cadence, stale/dropped frames, JS event frequency, CPU/GPU/memory and thermal behavior only when actual instruments support it.

- Use latest-frame-wins or bounded queues; discard stale frames instead of allowing latency to accumulate.
- Check CameraX/camera analysis resolution, YUV/RGB conversion, crop, orientation, mirroring, front-camera transforms, normalization, layout measurements and view coordinate transforms. Fix real transform errors instead of adding offsets.
- Audit smoothing/filter delay. Remove duplicate smoothing if MediaPipe or the native module already smooths; choose filters by measured responsiveness versus jitter. Reset filters on tracking loss, camera switch, orientation change, background/resume and subject reacquisition.
- Use adaptive model/resolution/FPS/delegate profiles compatible with the device; provide CPU/GPU fallback if the integrated package supports it. Do not force a high frame rate on every device.
- Avoid expensive synchronous logging, serialization, allocations, React rerenders, per-joint animations and repeated bitmap creation on the hot path.
- Define acceptance thresholds from the actual device baseline and workout use case. The tracked skeleton must stay visually aligned without obvious trails/jumps during fast movement, and stale results must not remain after the person leaves the frame.

## D. Modern landmark visual system

- Use consistent body connections and accurate joint locations based on the detector schema. Test every coordinate, crop and mirror transform.
- Choose a limited, premium palette that fits Thrivefold tokens: e.g. neutral base skeleton, one clear active/target accent, restrained left/right distinction, and reduced opacity for uncertain joints only where confidence/visibility data exists. Do not use a multicolor rainbow for every joint.
- Use clean antialiased strokes, balanced line width, crisp small joint markers, low-noise active-joint emphasis and optional angle labels only when relevant to the exercise. Keep landmarks readable against variable clothes, skin, background and lighting.
- Do not put a heavy animated glow around every joint, run per-joint pulsing animations or smooth old coordinates into a visual trail. Motion must follow the actual latest valid inference.
- Provide a clear overlay toggle and usable fallbacks. Maintain accessible controls and readable instructional text outside the camera overlay.

## E. Full exercise journey must work in the existing app

Verify the real production path: open Coach/Train → select exercise → read instructions → grant/request camera permission → camera and model ready → framing/body detected → live overlay → exercise instructions and verified reps/sets/timer → pause/resume → stop/cancel confirmation → completion → save canonical session → calculate real achievements/rewards once → completion modal → history/progress refresh → leave and return without leaked camera/model/session resources.

Handle first-use permission education, denied/permanently denied permission, camera absent/in use, missing native module/model, initialization timeout, detection loss, unsupported API/delegate, thermal throttling, background/foreground, app interruption, orientation, camera switch where supported, save failure/retry, double taps and navigation away mid-session.

## F. Complete the ugly camera/exercise UI

Redesign the existing camera intro, training HUD, pause/exit sheet, workout completion and achievement modals in place. Use actual Thrivefold typography/tokens, high-contrast hierarchy, clean progress indicators, restrained iconography, compact but readable controls, safe-area layout and helpful empty/error states. Avoid stacked modals. Ensure controls are discoverable and never obscure key body joints. Every action—close, continue, retry, save, view history—must do its advertised action.

Definition of done: the linked pose engine is genuinely wired into real Coach/Train if integration is supportable; tracking is visibly responsive and correctly aligned on a physical device where available; all session data and rewards are deterministic and persisted; native resources are fully released on every exit path; and the final release artifact contains the module/model assets.

# 8. PREMIUM DESIGN SYSTEM AND WHOLE-APP UI/UX AUDIT

The app needs more than attractive screens: every screen and state should look intentional and every control must work.

## Design audit

Inventory every route and shared UI primitive. Capture existing patterns and identify inconsistent typography, spacing, colors, card density, radii, shadows, icons, labels, empty states, error states, modals, sheets, forms and loading indicators. Study current official platform guidelines and maintained implementation examples for the exact library/version when needed. Keep research grounded; do not add libraries simply to imitate a screenshot.

Use the current design tokens; improve and document them where necessary. Create a clear type scale, spacing scale, surface hierarchy, consistent icon sizes, predictable hit areas and responsive layouts. Make all existing user-facing screens visually refined and recognizably part of Thrivefold. Do not blindly copy another app or turn every screen into translucent glass.

## Interaction and motion policy

- The user does not want spring effects. Do not introduce `withSpring`, spring-based Reanimated transitions or spring/bounce presets anywhere. Audit existing code for spring effects and remove them where the current product requirement says no springs, preserving useful non-spring motion.
- Prefer subtle ease-out/ease-in timing, short opacity/translate transitions, stable layout transitions and natural gesture-driven movement without overshoot.
- Never animate every element at once or create perpetual movement that drains battery.
- Ensure swipe-to-dismiss, close button, backdrop tap when intended, Android back, accessibility focus and nested scroll work reliably.
- Make sheets and modals respect safe areas/navigation bars, keyboard, orientation, screen readers and small devices.
- Never sacrifice usability, text readability, contrast or performance for a visual effect.

## Required screen states

Every audited screen must have appropriate loading, loaded, empty, error/retry, permission-denied, offline/pending-sync and disabled/unsupported states where relevant. Every button must do the advertised action or be explicitly disabled with a meaningful explanation. No dead routes, fake success messages, placeholder-only features disguised as complete, broken image containers, missing assets or silent no-op taps.

---

## 8.1 GLOBAL FORMS, LOW-FRICTION INPUT, KEYBOARD ACCESSIBILITY AND SMART DEFAULTS

Forms are part of the core navigation experience. A screen is not complete if a field exists in JSX but cannot be reached, typed into, reviewed or submitted in the actual Android layout.

### Form architecture and typing ergonomics

- Inventory every form and `TextInput`, including inputs inside bottom sheets, React Native `Modal`, portals, nested navigators, drawers, popovers, date/time pickers, search, onboarding, meal logging, profile/settings, local-AI/voice entry, and Calendar event create/edit screens.
- Keep labels visible and persistent; placeholders are examples, not the only labels. Use correct `keyboardType`, `autoCapitalize`, `autoCorrect`, `returnKeyType`/`submitBehavior`, multiline behavior, content sizing, validation and accessibility labels. Do not set fixed heights that clip multiline text or selected text. Preserve cursor placement, selection handles, copy/paste and OS autofill where supported.
- Provide clear focus styling and visible error text next to the relevant field. Validation must not cause large unexplained layout jumps, lose focus, reset other fields or cover the focused field.
- On focus, measure/identify the field and scroll it into the safe visible viewport. This must continue to work after validation messages, conditional fields, content-size changes, keyboard show/hide, rotation/window resizing, date picker presentation and sheet snap-point changes.
- Use a single keyboard/inset strategy for each root/sheet. Avoid stacking multiple `KeyboardAvoidingView`s, manually subtracting keyboard height in more than one owner, or applying both sheet keyboard insets and duplicate padding. Platform-specific values must be based on real testing, not copied blindly.
- Use `ScrollView`/the installed compatible virtualized form container with deliberate `keyboardShouldPersistTaps` (usually `handled` for forms with buttons; use `always` only when required and tested), suitable `keyboardDismissMode`, and a reliable way to reach all fields. A tap on a suggestion, date-picker trigger, checkbox, submit action or dropdown must not be swallowed by a scroll container just because the keyboard is visible.
- Fixed bottom action bars must lift above the keyboard or give the content enough scroll clearance so the primary action is reachable. Account for system gesture navigation and the bottom safe area. The last field, validation message, save/cancel controls and any focused cursor must never be hidden behind the keyboard or sheet footer.
- Avoid dismissing the sheet when the user intends to drag/scroll text content. Prefer a dedicated drag handle/drag region or gesture coordination proven by the installed sheet component. Do not make the entire content surface a pan-to-dismiss target when that steals taps, selection, vertical scrolling or text editing.
- Preserve the form draft if the keyboard is dismissed, the user switches between fields, opens a date/time picker, receives a temporary interruption or changes an optional field. If navigating away would lose edits, ask a clear discard/keep-editing question when needed.
- The primary action must show pending/disabled/error/success states correctly and prevent duplicate saves. Do not display success until the underlying persistence/service confirms success.
- Manual entry remains fully functional when STT/local AI/cloud AI is disabled or unavailable. Voice or AI may draft field values, but must never focus-block the form or overwrite the user's in-progress edits silently.

### Smart, minimal data entry

- Ask the smallest set of questions required for the user's current goal or action. Use progressive disclosure: essential first, optional/advanced fields behind a clear “More details” affordance when appropriate.
- Reuse user-provided, current canonical profile values and well-supported preferences as editable defaults. Never infer sensitive values from location, device metadata, camera or a weak model guess. Show when a value comes from the user's profile or is suggested by AI.
- Use contextual follow-up questions only when an answer can materially change the plan or calculation. Do not repeatedly ask for height, weight, dietary restrictions, schedule or preferences already present and current unless the user needs to confirm a stale value.
- Provide “Skip”, “Not sure”, “Prefer not to say”, edit-later and manual pathways where safe. Never make optional health or body metrics a blocker for core app use.
- For an AI-assisted form fill, show an editable preview, mark uncertain fields, preserve all user edits, validate with the same deterministic schema as manual input, and obtain explicit confirmation before committing health, nutrition, event, account, or externally visible data.
- Track form friction with privacy-safe aggregate analytics (open, completed, abandoned, validation errors, keyboard obstruction/recovery, and time-to-complete buckets). Never send raw text, exact health values, meal descriptions, private notes, speech transcripts or photo contents to analytics.

# 9. FIX EXISTING PRODUCT FLOWS END TO END

The current app needs a comprehensive route and functionality audit; integrate the new native capabilities into actual production flows rather than a separate lab. Prioritize crashes and reported defects, then continue through every existing route and documented feature.

## 9.1 Crash and native build regressions

Investigate Crashlytics/Sentry and logs. Known prior crash/error classes included missing native module registration (`SetuNative` was noted previously in project context), Expo Updates startup/file-not-found failures, and missing native React Native libraries. Verify against the current repository and version; do not assume they are still present. Trace each real crash to its actual cause. Confirm module names, autolinking, config plugins, package versions, Gradle packaging, release variant and installed artifact identity.

## 9.2 Android frosted UI / BlurView / modal infrastructure

Restore and verify the real, existing BlurView/frosted UI rather than replacing all blur with motion blur. Check providers, refs/targets, wrapper order, absolute/background layers, navigation layout, Android API behavior and the exact installed Expo BlurView version. Follow the current version's official docs: https://docs.expo.dev/versions/latest/sdk/blur-view/ . Do not copy current docs blindly if the installed version differs. Verify visually on a real supported Android device and use an intentional tint/solid-surface fallback on unsupported configurations.

## 9.3 Bottom sheets and gestures — FIX THE SHARED COMPONENTS AND ALL INSTANCES

The current bottom-sheet/modal behavior is visibly glitching. Do not patch only Calendar while leaving the same bug in Coach, achievements, food logging or other sheets. Inventory all shared sheet/modal components and all call sites, then fix the common root cause without replacing working architecture blindly.

### Inspect and diagnose first

Trace every current implementation and its callers: component/portal/native modal, snap-point/height measurements, gestures and responders, Reanimated values, refs/callbacks, backdrop and blur wrappers, safe-area/inset ownership, scrollable content, keyboard integration, navigation focus, Android back handler and open/close state restoration. Inspect the last known-good implementation in Git history and existing working sheet patterns in related project code when accessible. Check for stale refs, stale closures, duplicate close callbacks, multiple animation owners, conflicting Pan/Scroll gestures, touch interception from blur/overlay layers, accidental `pointerEvents` settings, incorrect clipping/z-index/elevation, modal/portal hierarchy changes, and module-level `Dimensions.get` values that fail after rotation or window resizing.

Do not add another sheet library, another `GestureHandlerRootView`, another keyboard controller or a second modal implementation until the installed architecture and the exact reason for failure have been understood. Reuse a maintained, installed implementation if it can be repaired safely. Use `useWindowDimensions` and live safe-area insets for responsive layout where needed. Keep one authoritative owner for sheet visibility and dismissal state.

### Motion and gesture acceptance

- Open and close smoothly with deliberate non-spring timing/easing; no `withSpring`, bounce, overshoot or competing JS/native animation that fights the drag gesture.
- Close button invokes exactly one dismissal callback. Android hardware back behaves predictably. Backdrop tap follows the existing intended design and must not intercept sheet controls.
- Drag-to-dismiss starts from the intended handle/region and does not steal vertical scroll, text selection, slider interaction or a text-input tap. Nested scroll and sheet gestures work together. Do not close the sheet accidentally while scrolling a long form.
- No stuck, frozen, transparent, half-dismissed or invisible sheet. Reopening resets transient animation values and stale focus/gesture state, while preserving intended draft state.
- Restore the previous screen's navigation and scroll position. No blocked touch region behind a portal; no hit testing through an invisible modal; no double tap triggering multiple writes.
- Account for system bars, gesture navigation, edge-to-edge layout, orientation/window-size changes, font scaling, small devices and dynamic content height.
- Keep blur/background layers visually correct and touch-transparent only where intended. Fix surface rendering without making the sheet swallow touches or making fields impossible to focus.

### Keyboard-aware bottom sheets — mandatory

- Determine which component owns the keyboard: the sheet library, the form root, or a keyboard-controller provider. There must be one coherent keyboard offset/inset path. No double padding, sudden jumps, clipped content, or footer overlap.
- Use `KeyboardAvoidingView` when appropriate to the current modal/root architecture, and a scrollable content container that can move the focused field into the visible area. On Android, evaluate the app's configured `android.softwareKeyboardLayoutMode` (`pan` versus resize behavior) against the actual navigation/sheet stack. Do not change it globally without testing other screens.
- Ensure taps reach fields and buttons when the keyboard is open. Set `keyboardShouldPersistTaps` and drag/dismiss behavior intentionally. Test the primary CTA above the keyboard; if the design uses a fixed CTA, move it or scroll it into view when the keyboard opens.
- On Android back, ordinarily dismiss the keyboard first while keeping the draft and sheet open; only a subsequent back should dismiss the sheet unless the established product behavior deliberately differs. Never lose the form or dismiss the whole sheet unexpectedly merely because the user tapped Done.
- After keyboard hide, restore the correct sheet height/scroll position without jumping to the top, leaving a blank region or clipping the footer.
- Test Gboard/real soft keyboard on a physical Android device when available; emulator/snapshot-only evidence is not sufficient for the final device claim.

### Calendar → Add Event / Edit Event — explicit P0 user journey

This exact path is a release-blocking acceptance test. Find every calendar event creation/edit entry point and reuse the existing canonical event form/model; do not build a second calendar engine. Retain all currently supported fields and discover which fields currently exist rather than inventing a duplicate schema.

Verify every existing input in the event form—at minimum the event title/name and any currently supported description/notes, location, event type/category, start/end date and time, all-day toggle, repeat/recurrence, reminder and other existing fields. The most important requirement is that the actual existing text fields must be reachable and editable while the keyboard is open.

Required behavior:

1. Open Calendar → Add Event; sheet/modal animation is clean and controls are responsive.
2. Focus the first text input; keyboard appears without covering the caret, current text, field label/error, or necessary controls.
3. Type into each text/multiline field, move through fields using Next/Done as appropriate, and scroll automatically to the focused field. Verify the final field and lower controls remain reachable.
4. Open date/time/recurrence/reminder pickers from the form; after closing a picker, restore the correct form state and focus/scroll position. Do not overlay the picker behind the keyboard or lose unsaved values.
5. Trigger invalid/missing-field validation; the error is visible next to its field, and the view scrolls that field into view. No layout jump hides it again.
6. Save with the keyboard open, save after dismissing the keyboard, cancel, use Android back once to dismiss the keyboard and again to exit the sheet, and exercise the close/backdrop paths that are supposed to work.
7. Verify the saved event is genuinely persisted, visible on the correct date/time, opens correctly in details/edit, and remains correct after leaving the calendar and returning or restarting the app. Verify duplicate taps do not create duplicate events.
8. Verify unsaved changes are preserved during normal field navigation and that discarding an edited event is handled intentionally.
9. Test short/tall device sizes, system navigation modes, large text, very long event titles/notes, date-boundary/time-zone behavior and all-day events where supported.

Calendar form acceptance criteria: **every field is reachable with the keyboard open; all intended fields accept text; no keyboard or footer covers the focused input or required action; no stuck sheet/gesture; no lost draft; save persists exactly one correct event; back/cancel behaves predictably.**

### Whole-app sheet/form regression sweep

Repeat the same relevant tests for every sheet/modal containing inputs or scrollable content: food search and portions, meal/photo review, onboarding and profile, event edit, notes/journal, search, settings, confirmations, achievements, Coach/Train pause/exit/completion, and any other discovered sheet. Build a matrix with route, field(s), keyboard strategy, gesture behavior, observed result, device/API, evidence path and status. Fix the shared primitives first; then correct call-site-specific sizing/configuration.

## 9.4 Log Meals

Trace every entry point and fix the complete journey: choose/search food or supported entry mechanism → quantity/serving/unit → deterministic nutrition calculation from actual data → review → save → local/remote persistence → history/daily totals/progress refresh. Test edit/delete where supported, time-zone/date correctness, invalid/missing data, retry/offline/sync and duplicate submission. Do not let an LLM act as the source of truth for nutrition calculations. Do not claim save succeeded before persistence returns success.

## 9.5 Gallery and image picker

Distinguish Thrivefold's internal Gallery route from Android's system photo picker. Make every intended Gallery entry open the correct route, show real assets or an honest empty state, support preview/select/cancel/back as intended, handle permission denial and recover from Activity recreation where relevant. Use the installed Expo ImagePicker documentation/version as source of truth: https://docs.expo.dev/versions/latest/sdk/imagepicker/ . Investigate `getPendingResultAsync` only if relevant to the installed package/platform behavior. A cancelled picker must not crash or lose an unrelated unsaved meal/session.

## 9.6 Achievements and rewards

Improve all completion and achievement modals aesthetically and functionally. Keep rewards, points, quest completion and verification deterministic and idempotent. Prevent duplicate rewards from double tap, retries or synchronization. Verify save, dismiss, continue, back, reopen and the corresponding history/progress update.

## 9.7 AI/RAG, calendar, quests, health and user data

Inspect existing requirements and code. Reuse canonical records and calculations; no duplicate DB/store/service. AI must have observable errors/fallbacks and grounded retrieval. It cannot authorize, calculate numeric rewards, fabricate data or silently write user data. Verify persistence, offline state, access isolation, permission scopes, migration safety, privacy and deterministic business logic for all applicable product flows. Do not invent personal/family records or replace real data with fixture data outside explicit test-only contexts.

### 9.7.1 Calendar and event forms — canonical data, keyboard reachability, recurrence and reminders

Calendar must not be considered working merely because the month view renders. Trace the entire existing path: open calendar → choose date/range/view → add event → validate → save → show the event in all applicable views → open/edit → resave → delete/cancel where supported → verify persistence after navigation/restart. Maintain the existing supported Day/Week/Month/Year/Agenda/History/range views and event types; do not replace historical records or hide a broken route behind a prettier screen.

- Use the one canonical event model/repository already present. Inspect SQLite/Supabase, recurrence rules, timezone/date serialization, reminder scheduling, event IDs, query invalidation and account ownership. Avoid a second store or date utility with subtly different rules.
- Separate date-only/all-day events from timed events where the existing schema supports that distinction. Preserve timezone intent, DST/time-zone changes, recurrence exceptions, start/end validation and event ordering. Never shift an event to a neighboring day through UTC/local conversion mistakes.
- Add Event and Edit Event forms must satisfy the full keyboard-aware acceptance sequence in section 9.3. Include a scrollable form, visible labels, inline validation and a reachable primary save action. A sheet that looks good but traps text inputs behind the keyboard fails.
- Ask for only essential details first (such as title/date/time required by the existing schema); reveal optional detail fields as needed. Never make every optional field mandatory. Offer a clearly labelled “More details” section if it reduces initial friction without hiding existing supported functionality.
- Populate only safe, user-approved defaults (selected calendar date, user's timezone, a previously chosen reminder preference, etc.) and let the user edit them. Never silently infer private attendees, locations or sensitive event details through AI.
- Recurring events and reminders must use existing canonical logic and permission behavior. If notifications are unavailable/denied, explain that the event can still be saved and offer a settings path rather than pretending a reminder is scheduled.
- Prevent duplicate event writes during slow saves, repeated taps, voice retries, app foreground return or network retry. Display the actual result and allow retry if persistence fails.
- Calendar events must flow into the relevant home agenda, notifications and analytics only where those integrations already belong. Do not fabricate events or user history to populate an empty calendar.

## 9.8 Goal-first onboarding and adaptive user plans — REAL, PROGRESSIVE, CONSENT-BASED

The app should learn what the user is actually trying to achieve and shape its questions, goals, daily plan, exercises, nutrition prompts and quests around that intention. Do not force every user through every health questionnaire, and do not assume that every person is pursuing weight loss or women's-health tracking.

### Onboarding flow

Inspect and preserve the existing onboarding architecture, then implement the complete user journey:

1. Ask for the primary intention in plain language: general health, build exercise consistency, strength/muscle, cardiovascular fitness, mobility/flexibility, energy, sleep, stress management, weight management, nutrition quality, rehabilitation-adjacent gentle activity, or another user-defined goal.
2. Allow multiple secondary goals and a clear option to skip or change goals later.
3. Ask only the next questions that are relevant to the chosen intention. Use progressive disclosure rather than a huge intimidating questionnaire.
4. For relevant plans, request optional age/date-of-birth category where necessary, height, current weight, target weight (if applicable), preferred time horizon, available time, equipment, experience level, dietary pattern/allergies/restrictions, sleep/activity context, accessibility requirements, and user-stated limitations. Explain why each sensitive field is being requested. Do not require unnecessary medical detail.
5. Collect the user's preferred schedule, language, notification preference, coaching style, exercise intensity, whether they want camera tracking, whether they want voice control, and whether they want AI assistance.
6. Summarize the proposed plan and ask the user to accept/edit it before activating it. The user may use the app manually without sharing height, weight, camera, microphone, AI or health data.
7. Support editing goals later without losing historical plans, completed activities or prior records. Version each active plan and record why the plan changed.

### Goal and plan engine

- Convert user intentions into goals that are Specific, Measurable, Achievable, Relevant and Time-bound where appropriate. Offer user-adjustable targets; never promise a guaranteed weight, health, physique or performance outcome.
- Use deterministic rules for arithmetic, schedule generation, progress, completion and safety limits. AI can help explain, suggest or personalize; it cannot silently override the rule engine.
- Use self-reported check-ins (energy, sleep, stress, pain/discomfort if the user opts in, available time and perceived effort), actual logged meals, confirmed workout sessions, past adherence and user feedback to adapt suggestions.
- Dynamically select follow-up questions: ask only when the answer could materially change a plan or action. Explain why a new question is being asked and allow “skip”, “not sure” and “prefer not to say”.
- Offer reasonable recovery/rest alternatives when signals suggest fatigue or the user reports discomfort; do not diagnose an injury. Do not punish missed activity or fabricate completion.
- Keep the manual plan-editing path available. When an adaptation materially changes duration, intensity, nutrition target, reminders or goal milestones, show the proposed change and give the user the ability to accept, edit, reject or undo it. If the user explicitly opted into small automatic adjustments, still show a clear change log.
- Avoid unsafe calorie deficits, rigid diet advice, extreme progression, exercise recommendations outside the user's stated limitations or medical advice presented as diagnosis. Route concerning symptoms to appropriate professional guidance rather than an agentic action.
- Keep the progression engine aligned across Home/Today, calendar, quests, workouts, meals, insights and notifications. The same goal or action must not create conflicting targets across screens.

### Height, weight and BMI

- Provide optional height and weight entry, units, validation, edit history and provenance (user-entered vs device/source-imported).
- Calculate BMI deterministically only when the input context is appropriate. BMI is a screening metric, not a diagnosis or an individual's complete health assessment. Use age-appropriate handling; do not use adult BMI thresholds for children. Avoid treating pregnancy or eating-disorder contexts as ordinary weight-management cases. Explain limitations in the UI.
- Do not infer ethnicity or lower thresholds from location, name, language or device settings. If the product ever offers population-specific interpretation, request an optional, justified self-description and use reviewed clinical guidance.
- Do not make a health plan depend on BMI being present. Strength, sleep, mobility, consistency and nutrition-quality goals must still work when users decline weight-related inputs.

## 9.9 Food photo identification, nutrition and macro submission — WORKING WITH OR WITHOUT AI

Finish food logging as a real production flow, including photo-based identification where a genuine provider is configured. No mock macro cards, hardcoded sample results in production, or AI-only arithmetic.

### Required flow

Home/Food/Log Meals → take or select photo if desired → detect candidate foods (only when a real supported vision provider is available) → user confirms/edits food identity → adjust portion/serving/ingredient amounts → fetch nutrition values from the configured documented food dataset → calculate totals deterministically → review calories/protein/carbohydrates/fat and any other supported nutrients → confirm/save → verify the persisted meal → refresh daily totals, history, calendar/quest context and insights.

### AI-provider architecture

- Inspect current local AI and all configured provider integrations before adding new ones. Use a typed provider adapter/interface so a local vision model and permitted cloud vision providers can be enabled individually, in sequence, or in a deliberate multi-provider flow.
- Support operation with **no AI provider**, one provider, or multiple configured providers. Manual food search and serving entry must always work and must not depend on an AI key, network access or an LLM.
- Multiple AI providers are optional, not mandatory. Use them only where the configured quality/cost/latency policy justifies it. A second provider may help disambiguate a food identity; never treat majority vote as proof of nutrition truth.
- If local vision is absent, unavailable or too slow on the device, disclose that and offer manual search/entry. If cloud analysis is enabled, tell the user before transmitting any image or sensitive context and require the relevant consent.
- Never put cloud API keys in the Android app bundle. Route cloud provider calls through the existing secure backend/proxy where one exists; validate schemas, time out, rate-limit, cap spend, avoid sending unrelated memory and implement a clear no-provider/error fallback.
- AI output is a **candidate** food/portion estimate with uncertainty, not the authoritative nutrition record. A single image often cannot reveal exact ingredients, oil, sauces, cooking method, hidden ingredients or serving weight. Show uncertainty and ask the user for missing portion/ingredient details when they materially change totals.
- Nutrition totals must be computed by deterministic application code from a documented canonical dataset/food record and the user's confirmed quantities. Show provenance (database value, label, user entry, or estimated candidate) and sensible precision; do not manufacture exactness.
- For mixed dishes, support recipe/ingredient breakdown when the data permits. Include common regionally relevant foods based on the product's actual catalogue/source rather than hardcoding fabricated macros.
- Save only after user confirmation. Avoid duplicate rows on repeated taps, voice retries, multi-provider timeouts or app restoration. Use idempotency and a canonical meal repository. Never award a meal quest just because the camera opened or a provider returned a suggestion.
- Food images default to local/private handling. Keep them local unless the user selects a cloud flow and sees clear disclosure/consent. Provide deletion and retention behavior consistent with existing app policy.
- Do not silently lose the meal if a photo upload or vision provider fails. The manual entry/save path must still work.

### Definition of done

Test no-provider/manual-only mode, local-vision mode if truly supported, each configured provider, multi-provider disagreement, food-not-recognized, mixed/ambiguous dish, unknown portion, user edits, no network, timeout, rate limit, invalid structured output, image cancel, denied permission, save retry, duplicate submit, edit/delete, midnight/date boundary, daily macro recalculation and source attribution. Verify that submitted macros equal the canonical saved record after leaving and reopening the screen.

## 9.10 Speech-to-text as a full-app control layer — WORKS WITHOUT LOCAL AI

Speech-to-text must be a usable, explicit, reliable command input method across the app, not a voice button that only works on one screen. Implement it with manual controls always available. Do not require an LLM to interpret basic commands.

### Deterministic STT command core

- Inspect current speech packages/native capabilities and build constraints. Reuse a compatible, maintained capability when possible; do not add an incompatible module or upgrade Expo/RN blindly.
- Implement a typed command registry with explicit supported commands and aliases, such as: navigate to Home/Coach/Food/Gallery/Calendar; start/pause/resume/stop a workout; repeat instructions; next set; show today's plan; open food logging; search for a food; change serving amount; fill a draft form field; read back the current value; cancel; undo the last reversible action; and start/stop voice input.
- Resolve clear commands deterministically with a parser and validated intent schemas. Require a confidence threshold, debounce duplicate speech results, handle partial/final transcripts and prevent the same phrase from executing twice.
- STT voice commands for basic navigation, pause/resume, repeating instructions and common form values must work even if local AI is unavailable and cloud credentials do not exist. Use local/on-device speech recognition only when the actual device/API and installed packages support it; otherwise disclose the online/platform dependency honestly.
- Use the selected language/locale where supported. Handle noise, recognition timeout, no match, permission denial, offline mode and unavailable recognizer with a clear retry or manual alternative.
- Show clear listening/transcribing/command-confirmation/action-complete/error status. Use an explicit microphone action or a user-enabled active-session mode; never listen covertly in the background or continue after leaving the relevant screen. Stop capture on permission revocation, app background/route exit as configured, or explicit stop.
- Do not speak commands back into the recognizer indefinitely. Coordinate STT and TTS, pause recognition while speaking where needed, and support interruption.
- Commands must obey ordinary application permissions and account ownership. Speech cannot bypass authentication, privacy consent, safety gates or data validation.

### Voice-assisted form entry and commits

- Allow voice to fill a **draft** for appropriate forms: food name, serving size, meal type, goal preference, workout details, self-reported weight/height or vitals, notes, reminders and other fields that exist in the current app. Bind recognized values to typed fields and validate them exactly as typed input.
- Read back important values and show a review step before submitting health/nutrition records, changing a plan materially, deleting records, changing privacy/security settings or triggering a costly/external action. Explicit confirmation is required for these higher-impact actions.
- If recognition is ambiguous (for example, “fifteen” vs “fifty”), ask the user to resolve it rather than guessing. Keep keyboard/touch editing available at all times.
- Provide a visible, configurable global voice entry point only where it fits the existing UI. Do not add a permanent bulky microphone overlay on every screen. Include accessible state/labels and the ability to disable voice control.
- Test each command using deterministic transcript fixtures, unit/integration tests for parsing and state transitions, and live-device testing for the actual microphone/STT path. Clearly separate mocked transcript tests from genuine recognition tests.

## 9.11 Restore local AI and implement safe agentic actions — REQUIRED WHERE SUPPORTED, NEVER REQUIRED FOR CORE CONTROLS

Inspect the current model runtime, bundled/downloaded models, local RAG, embeddings/vector storage, memory, prompt templates, backend/provider adapters and previous implementation/Git history. Restore the intended local AI if present. Do not invent a “model loaded” badge or say inference is local just because there is a local cache or deterministic rules.

### Layered architecture

1. **Deterministic application layer:** routes, form schemas, validation, calculations, goals, macro totals, workout rep/session logic, permissions, rewards, database writes and idempotency.
2. **STT and command layer:** a deterministic set of speech-to-text intents for core controls. It must work without a model.
3. **Local AI layer:** when a real on-device model is installed and loaded, use it for natural-language intent interpretation, plan explanations, grounded retrieval, suggestions and draft form filling. Report actual model availability, initialization errors, measured latency/memory and fallback state.
4. **Optional cloud AI layer:** only for configured providers and explicitly consented tasks; use secure server-side keys, allowlists, timeouts, quotas, cost caps, minimal approved context and schema validation.
5. **Agentic action layer:** an allowlisted tool registry calls application services; it never executes arbitrary shell commands, arbitrary code, unrestricted network calls or unreviewed SQL.

### Action execution contract

For each AI-proposed action: parse request → resolve the user's intent → produce a typed proposal → validate scope/permissions/input → show a preview when action is meaningful → request confirmation when required → execute through the canonical app service → verify the actual result → provide a factual receipt/error → log a privacy-safe audit event. Add idempotency and undo/rollback for reversible operations. Never say an action succeeded until the underlying service confirms it.

- AI may draft or fill forms, suggest a daily plan, prepare a meal entry from a photo, summarize logged progress or recommend a next quest. It must not save unreviewed health/macronutrient inputs, silently change high-impact targets, grant rewards, bypass permissions or diagnose disease.
- Ground RAG responses in the user's permitted, relevant canonical records and retrieved documents. Display when a statement is based on entered data, an estimated AI output or general knowledge. If no reliable evidence exists, say so.
- Memory must be user-controlled: opt-in where appropriate, inspectable, editable, pausable, exportable and deletable. Do not permanently memorize every journal or health item by default.
- Provider fallback must not duplicate actions. Use a single action executor and operation/idempotency key even if multiple models propose or retry an action.
- When local AI is disabled/unavailable, the app still supports manual usage, deterministic goals/plans, food catalog search, STT commands, exercise controls and standard data forms.

## 9.12 Health metrics and phone-sensor truthfulness — CONNECT SOURCES, DO NOT FABRICATE VITALS

The user wants to monitor as much as today's devices genuinely support. Inventory actual phone hardware, Android APIs, Health Connect, existing connected-device APIs and any wearable/medical-device integration. Add useful imports only after checking permissions, data provenance, freshness and semantics.

- Support user-entered measurements and authorized sources such as compatible wearables/medical devices or Android Health Connect, when actually integrated and permissioned. Health Connect supports categories including heart rate, blood pressure, oxygen saturation, respiratory rate, body temperature, weight and related records; check the current official data type and permission requirements: https://developer.android.com/health-and-fitness/health-connect/experiences/vitals .
- Do not claim a generic phone camera or ordinary sensors can directly provide clinically reliable blood pressure (BP) or oxygen saturation (SpO2). Do not fabricate, extrapolate or display measurements when no valid source exists. Before shipping any camera-based vital estimate, require evidence of validation, appropriate device/API support, jurisdiction-specific regulatory review and transparent wellness/medical scope. The FDA has warned against unauthorized blood-pressure measurement products: https://www.fda.gov/medical-devices/safety-communications/do-not-use-unauthorized-devices-measuring-blood-pressure-fda-safety-communication . FDA overview of pulse-oximeter use and limitations: https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters .
- For each stored measurement, preserve source, timestamp/time zone, units, confidence/quality if truly provided, user-entered/imported/device-measured provenance and sync status. Clearly distinguish current readings, past records, estimates and missing data.
- Implement read/write to Health Connect only for supported record types and after explicit permission. Handle revoked permissions, unavailable provider, duplicate records, imports, time-zone changes, units and delete/sync behavior. Never silently rewrite the user's device health history.
- A phone motion sensor can be used only for data it actually exposes (e.g. supported activity signals) and after validation. Do not promote motion/voice/camera analysis into a diagnosis or medical vital by naming it differently.
- Offer manual entry and supported imports for BP/SpO2 if no validated measurement hardware is present. Show “not connected/not measured” rather than a guessed value. If values are abnormal or symptoms are concerning, provide conservative guidance to seek appropriate professional advice, not an AI diagnosis.
- Respect data minimization, consent, local-first storage, retention, export/delete and account isolation. Health data must not be sent to a multi-provider AI service by default.

Reference: BMI should be represented as a limited screening calculation, not a diagnosis. For adult use/limitations and cases that require different handling, review current NHS guidance: https://www.nhs.uk/health-assessment-tools/calculate-your-body-mass-index/calculate-bmi-for-adults . Do not make BMI or weight a mandatory gate to use the app.
Official health-source references for implementation review (verify current versions when executing):

- Android Health Connect vitals experiences and permissions: https://developer.android.com/health-and-fitness/health-connect/experiences/vitals
- FDA safety communication on unauthorized blood-pressure measurement claims: https://www.fda.gov/medical-devices/safety-communications/do-not-use-unauthorized-devices-measuring-blood-pressure-fda-safety-communication
- FDA pulse oximeter use/limitations: https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters

## 9.13 Release-focused Coach scope: body pose first; preserve face/hand for later

For the current release, the real exercise screen must expose only the body-pose marker system. Reuse the real pose module and native rendering to ensure that the overlay follows motion smoothly. Do not add an unrelated second camera, a demo camera route or another inference loop.

- Use correct skeleton topology, normalized coordinates, mirroring, rotation/crop transforms and camera preview dimensions. Verify joints remain anchored across front/back cameras and screen orientation.
- Keep a clean semantic palette: one primary tracked-body color with a restrained secondary accent for target/current joint or confidence only if supported by real confidence data. Use consistent stroke widths, rounded line ends, legible joint dots, carefully restrained shadow/glow and strong contrast over varied backgrounds. Avoid a rainbow of colors, flashing, giant glowing joints and labels covering the exercise view.
- Prefer native skeleton drawing/frame processing; do not push every frame through React state. Drop stale frames, bound queues, reset temporal filters after tracking loss and profile end-to-end time from camera frame to drawn skeleton.
- Use a measured low-latency filter; excessive smoothing that causes the skeleton to trail the body is a bug. Set thresholds from device testing rather than guessed constants. Do not count exercise reps until a deterministic exercise-specific state machine verifies a valid movement cycle.
- Face and hand overlay opacity must be `0` in the production release. Preserve their code/config/modules for a future release, but pause their inference by default while body pose runs. They must not be silently drawn, falsely reported as active, or consume resources invisibly.
- The user can turn voice coaching/listening on or off explicitly. Voice commands may pause/resume/stop and control supported exercise settings without local AI. Manual controls must always work.
- Verify real session save, actual repetitions/sets/duration, quest completion policy, rewards idempotency, history/progress refresh, restart and manual fallback. Never label manual/self-reported activity as camera-verified.

---

## 9.14 PRODUCT ANALYTICS, HEALTH/ACTIVITY FINDINGS AND SMART ADAPTATION

Finish the existing analytics and insight loop rather than adding a competing telemetry system. First inspect and reuse current Firebase Analytics, Crashlytics, app-local telemetry, database aggregates and existing insight services. Do not create a second event bus or duplicate tracking libraries without evidence that the current setup cannot work.

### Separate product analytics from user-facing health/progress insights

**Product analytics** help find broken or high-friction flows. **Personal progress insights** summarize the user's own explicitly saved/authorized records. Keep these separate in code, consent, retention and presentation.

Product analytics must cover meaningful state transitions such as:

- Route/screen open and failed navigation (route IDs only; no private title/text).
- Bottom-sheet/modal opened, dismissed, failed gesture state, and keyboard obstruction/recovery as privacy-safe categorical diagnostics.
- Form started/completed/abandoned, validation failure category, save failure/success, offline/retry and duplicate-submit prevention.
- Calendar event draft/save/failure counts without event title, location, notes or attendee data.
- Log Meals/photo identification/manual fallback, confirmation, save/edit/delete and sync states without raw food images, food text or exact health values.
- Exercise session start/pause/resume/finish, body-pose initialization/tracking loss and session persistence—never one event per frame or per landmark.
- STT availability/intent category/success/failure, model/provider availability and fallback status without raw transcript/audio by default.

Use stable, versioned event names and a documented schema; deduplicate events, avoid excessive telemetry, and preserve offline queue/retry semantics. Respect existing consent and platform policies. Never send private field contents, raw health measures, body landmarks, face/hand data, photos, audio, transcripts, journal text, prompts, tokens or identifiers into generic analytics. Log only the minimum redacted diagnostics needed to fix issues. Do not generate analytics on each render, keystroke or camera frame.

### User-facing insights and findings

- Generate summaries only from real, authorized, canonical data. Show time range, the number of contributing records and whether the result is measured, user-entered, imported, or estimated. If sample size is too small or data are missing, say so and suggest a low-friction next step rather than pretending to have a finding.
- Show useful trends where supported: completed sessions, consistency, planned-vs-completed activity, logged nutrition days, macro averages/ranges, sleep/energy check-ins, weight trend if opted into, goal progress and calendar adherence. Do not display sensitive health trends in lock-screen notifications by default.
- Distinguish correlation from causation. Never diagnose, claim a medical cause, guarantee a result, or recommend dangerous diet/exercise changes from weak data. Use conservative plain-language summaries with links to the records behind them.
- Use the user's chosen goals and preferences to make actionable suggestions: one next step, a goal adjustment proposal, a rest/recovery option, a nutrition logging reminder or an appropriate quest. Do not flood the user with charts or repeated questions. Let the user dismiss, edit, disable or correct a suggestion.
- Keep calculations deterministic and unit/timezone-safe. Recompute aggregates on add/edit/delete/import/sync, handle duplicate/out-of-order records, and ensure Home, Calendar, Nutrition, Progress, quests and reports agree on the same canonical data.
- Ask fewer, better questions. Only ask a follow-up if the missing information changes the next decision; reuse current profile values and ask user confirmation for stale/high-impact data; support skip/not sure/prefer not to say. Use analytics aggregate abandonment/error signals to identify where onboarding/forms are too long, but do not sacrifice required safety validation.
- AI/local AI may explain or personalize a finding, but numeric summaries and thresholds must come from typed deterministic functions. Any AI-generated recommendation must be grounded in the displayed records and marked as a suggestion.

### Definition of done

Produce an event catalogue and a privacy-safe analytics audit; verify events actually reach the intended destination or appear in the local diagnostic record. Confirm no duplicate pipeline exists. Test form friction instrumentation and ensure it carries no text values. Verify user-facing summaries against seeded test records and live saved records, including empty/low-sample state, edit/delete/recalculation, offline sync, timezone boundaries and account isolation. Report exactly what was measured and what is still uninstrumented.

# 10. SPECIALIST WORKSTREAMS — BOUNDED, NON-CONFLICTING AND VERIFIABLE

Use real sub-agents when Antigravity supports them. First map actual paths/dependencies, assign exclusive file ownership, use separate branches/worktrees where possible, and avoid concurrent edits to shared files. If sub-agents are unavailable, run the tracks sequentially and do not pretend delegation occurred.

**Agent A — Requirements, prompt and repository recovery auditor:** inspect all supplied/current project resources, specs, `AGENTS.md`, README, Git history, duplicated plans and coverage requirements; write the single canonical requirements/coverage matrix and report contradictions without broad destructive edits.

**Agent B — Crash, native-module and release engineer:** own crash traces, module registration/autolinking, Kotlin/Java/Expo module contracts, config plugins, Gradle/ABI/model/DSO packaging, Expo Updates/build variants and exact artifact install verification.

**Agent C — Android frosted glass and motion system:** own restoration of real backdrop blur, correct background sampling/shader/native path, existing shared blur abstraction, Reanimated transitions without springs, and production integration of `expo-motion-blur` into appropriate actual moving UI. Do not confuse motion blur with backdrop blur.

**Agent D — Pose/MediaPipe/performance engineer:** own `react-native-pose-detection` source review and production integration, body skeleton rendering, camera lifecycle, native events/triggers, frame queue and profiling. Coordinate camera ownership with face/hand systems; no demo-only screen.

**Agent E — Coach/Train product and modal UX:** own the actual exercise path, modern camera intro/training HUD, pause/exit, completion and achievement modals, accessibility, real session state and reward idempotency. Coordinate with D on the adapter/API boundary.

**Agent F — Log Meals, Gallery and cross-screen data:** own broken meal logging/gallery routes, media selection, persistence, offline/retry, daily totals and existing canonical services.

**Agent G — Whole-app UI/UX and regression coverage:** audit all routes/actions, polish shared components, responsive/accessibility/state handling and regression tests after crash/P0 tasks are stable. Do not create a second theme system or compete with C/E on shared files.

**Agent H — Independent skeptical verifier:** repeat critical flows and inspect diffs, test logs and release package. Reject unverified claims, mock success, fake metrics, hidden dead routes, duplicated systems, incorrect native registrations, camera leaks, undocumented data changes and unsupported API assumptions.

**Agent I — Voice/STT and safe action systems:** own speech package compatibility, native microphone/STT lifecycle, deterministic command registry, transcript parsing, draft form filling, confirmations, accessibility/manual alternatives and integration with the canonical action executor. Prove core commands without local/cloud AI.

**Agent J — Goals, nutrition vision, local AI and health-data integration:** own intention-based onboarding, adaptive plans, deterministic BMI/goal calculations, canonical food/macros services, optional local/cloud vision-provider adapters, consent/provenance, local AI/RAG recovery and supported Health Connect/wearable/manual vital records. Never invent data or bypass confirmation.

**Agent K — Forms, Calendar, keyboard and low-friction UX:** own the complete inventory of text fields in forms/sheets/modals, Calendar Add/Edit Event, keyboard avoidance/focus scrolling, Android soft-input config assessment, inline validation, duplicate-submit behavior, adaptive/minimal inputs and the cross-screen keyboard/gesture regression matrix. Coordinate shared sheet changes with E/G and do not edit their owned files concurrently. Own or serialize shared-component edits explicitly.

Master agent owns integration, architecture decisions, version pinning, shared contracts, conflicts, full regression, release readiness and final reporting. Every workstream must supply exact paths, commands, exit statuses, tests/device evidence, backup/rollback route, unresolved gaps and explicit `implemented / tested / blocked / not done` status. Main agent must review all diffs and rerun the integration tests.

# 11. VERIFICATION MATRIX AND ACCEPTANCE CRITERIA

Create/update `docs/implementation/THRIVEFOLD_END_TO_END_VERIFICATION.md` (or the established equivalent). Each requirement must have `NOT STARTED / PASS / FAIL / BLOCKED / NOT APPLICABLE`, test level, command/device, evidence path, owner and next action.

## A. Crash and app integrity

- Reproduce current crash(es), identify evidence-backed root causes, fix them and add regression coverage where feasible.
- Cold start/warm start, background/resume, permission changes, navigation, force-stop/relaunch and offline startup work without crash on tested environments.
- All required native modules register correctly and are callable in development and release builds; no mismatch among JS name, Expo module/view name, package path, config plugin, Gradle dependencies or native assets.
- Exact built artifact identity (application ID, version, timestamp/checksum if available) is verified and it is the version installed/tested.

## B. Real Android frosted blur and motion blur

- Frosted surfaces visibly blur actual content behind the panel on supported Android device/API versions; not just transparent or tinted overlays.
- Tested contrast/moving background demonstrates correct source sampling; no white/black flash, stale capture, recursion, broken z-order, lost touch interaction or camera/scroll regression.
- Existing call sites use the maintained common abstraction; all important headers/sheets/modals/navigation surfaces audited.
- `expo-motion-blur` is integrated into an appropriate real product motion interaction if technically supportable—not merely installed or present in a demo. Verify it is a different effect from backdrop blur.
- Supported and fallback Android versions behave as documented for the exact pinned version. Reduced-motion and plain-view fallback are correct. Before/after performance is measured without invented figures.

## C. Pose, MediaPipe and exercise sessions

- Selected pose engine is wired to the real Coach/Train path; the native module, model and libraries exist in the release artifact.
- Camera permission grant/deny/permanent deny, model readiness, native initialization failure, tracking loss, pause/resume, orientation, camera switch, app background/resume and cleanup are verified.
- Landmark positions are aligned with actual body movement and correctly mirrored/scaled. No stale points persist after dropped frames, lost tracking or leaving the route.
- Measured FPS/latency/event rates and profiling methodology are recorded for the tested device. No made-up confidence/FPS numbers.
- Native rep triggers/session updates are validated with deterministic rules, no duplicate reps/rewards, and saved workouts survive navigation/restart.
- Body pose, face landmarks and hand landmarks are accurately distinguished; face/hand support is tested only where the corresponding engine is actually integrated.
- Exercise intro, live HUD, pause/exit, completion/achievement modal, save/history and every action are functional and polished.

## D. Existing critical flows and whole-app coverage

- Home/navigation, Log Meals, Gallery, system photo picker, Coach/Train, voice functions where supported, quests, achievements, calendar and every other documented route are included in a route/action inventory.
- Log Meals saves canonical records; nutrition calculation is deterministic; totals/history refresh; offline/retry/double-submit behavior is safe.
- In-app Gallery, system picker and camera capture are tested as separate paths where present, including cancellation, permissions and Android Activity/process restoration when relevant.
- Bottom-sheet close/backdrop/drag/Android back/nested scroll/keyboard behavior works. Every focused input in every form is reachable with the keyboard open; no sheet/footer/system bar obscures the focused field or required action.
- Calendar Add Event/Edit Event is device-tested: every existing text field works, focus auto-scrolls into view, date/time pickers restore form state, validation is visible, save persists exactly one correct event and keyboard/back/cancel actions behave predictably.
- All important UI states—loading, empty, error/retry, no permission, unsupported state, pending save/sync, success—are honest and actionable.
- Every sheet/modal is tested for gesture ownership, no accidental dismissal during scrolling/text selection, stable animation and correct state restoration after reopen.
- No dead buttons, placeholder-only routes, fake success messages, unrelated flow regressions or lost user data.

## E. Onboarding, nutrition, STT, local AI and health data

- Onboarding begins with user intention, asks only relevant progressive questions, supports skip/edit, captures optional height/weight where relevant, creates an editable plan and preserves historical plan versions.
- BMI is deterministic, unit-safe and presented with limitations; goals and exercise plans remain available without BMI/weight.
- Food-photo flow works with no AI provider via manual entry, and with each actually configured local/cloud provider; cloud image transfer is disclosed/consented. AI candidates are confirmed/edited by the user and canonical macros derive from the documented food source and quantities.
- Meal macros are saved as the same canonical record used by daily totals/history/calendar/quests, with correct source labels and no duplicate submissions.
- Voice STT supports a tested command set without local/cloud AI. It shows listening/error states, stops when expected, does not execute duplicate partial transcripts and does not listen covertly in the background.
- Voice and local AI can prepare form drafts, but high-impact health/nutrition/destructive/external submissions require clear review and confirmation. Standard typed/manual flow remains available.
- Local AI status reflects a real model/runtime, not a placeholder. If it is unavailable, deterministic controls, forms and plans still work. Agentic tools use an allowlist, schemas, permissions, idempotency, result verification and safe audit records.
- BP/SpO2/heart-rate/etc. data have genuine provenance from manual input, authorized health source or actual supported device. No fabricated camera-based BP/SpO2 measurements. Health Connect permissions/data semantics are tested where implemented.
- Face/hand overlays have opacity zero and their inference is paused by default for this release; their implementation remains preserved for a later release. Pose detection is the active, measured tracking layer.

## F. Privacy, accessibility and performance

- Camera/session ownership is singular; listeners, workers, frames, surfaces and model instances are cleaned up on every exit path.
- No raw camera images, biometric landmarks, secrets or sensitive paths go into generic analytics/logs unless explicitly required, disclosed and authorized by the product.
- Contrast, text scaling, screen readers, touch targets, safe areas, keyboard, reduced motion and small-display layouts are tested where possible.
- Forms use smart progressive disclosure; keyboard/focus/scroll issues are tested with real Android soft keyboard when available. Form-friction telemetry contains no entered text or private values.
- Profiling covers frame timing, dropped/stale frames, memory and thermal behavior as tool/device support permits.

## G. Publication readiness

- Correct signed production build is generated using the project’s established build pipeline. Native module/model/shader resources are included.
- Typecheck/lint/unit/integration/navigation tests and available E2E checks run; exact commands/results are recorded.
- Exact artifact is installed and smoke-tested on a physical Android device where available. If not available, report the missing evidence honestly and complete all other checks.
- Store metadata, release notes, privacy declarations, required permission justifications and non-Coach/camera marketing screenshots are prepared accurately.
- Submit/publish only if actual credentials, access and approvals are present. Do not say published or release-ready while release-blocking crashes or required journeys remain failing.

# 12. DELIVERY ARTIFACTS REQUIRED IN THE REPOSITORY

Create/update real deliverables—not empty documents or checkboxes without evidence:

1. `docs/implementation/THRIVEFOLD_REQUIREMENTS_COVERAGE.md` — every supplied project prompt/resource mapped to current implementation, gaps, owner, tests and evidence; note inaccessible/contradictory inputs.
2. `docs/implementation/THRIVEFOLD_RECOVERY_DELIVERY_LOG.md` — each crash/regression root cause, affected paths, historical evidence, fix, tests and rollback/recovery details.
3. `docs/implementation/THRIVEFOLD_END_TO_END_VERIFICATION.md` — canonical whole-app and native-module verification matrix with real status/evidence.
4. `docs/implementation/NATIVE_MODULES_AND_BLUR_ARCHITECTURE.md` (or established equivalent) — current Expo/local modules, module names, native files, lifecycle/permission/API contracts, shader/backdrop blur implementation, dependency versions and release packaging.
5. `docs/implementation/NATIVE_LIBRARY_INTEGRATION_REVIEW.md` — exact pinned commit/tag/version, license/attribution, API compatibility, chosen integration, native changes, OS/device support, limitations and test results for both linked libraries.
6. `docs/implementation/GOALS_ONBOARDING_AND_ADAPTIVE_PLANS.md` (or the established equivalent) — user intentions, progressive questions, plan versioning/adaptation rules, BMI handling, and tests.
7. `docs/implementation/VOICE_STT_AND_AGENT_ACTIONS.md` — supported command catalog, locales, transcription dependencies, form draft/confirmation policy, action schemas, permissions, fallback and test evidence.
8. `docs/implementation/NUTRITION_VISION_AND_MACRO_PROVENANCE.md` — vision provider inventory/configuration, photo-consent path, food dataset source, portion uncertainties, deterministic macro math and validation results.
9. `docs/implementation/HEALTH_DATA_SOURCES_AND_PERMISSIONS.md` — source inventory for Health Connect/devices/manual entries, data provenance, permissions, unsupported vital limitations and privacy handling.
10. Tests for module availability/fallback, blur abstraction selection, pose adapter/lifecycle, exercise state/reward idempotency, navigation, meals/gallery and all repaired critical flows.
11. Actual updated app code/native module/config/route/design files. No separate Beta Lab or demo-only screen area.
12. Authentic internal QA screenshots, diagnostic logs and device evidence where available. Keep marketing/store screenshots free of Coach/camera/pose/face/hand screens per existing requirement.
13. Updated release notes/change log, permissions/privacy notes and exact build/install/rollback instructions.
14. `docs/implementation/THRIVEFOLD_FORMS_KEYBOARD_AND_CALENDAR.md` — shared keyboard-avoidance strategy, sheet/modal inventory, exact Calendar Add/Edit Event test evidence, form UX and unresolved issues.
15. `docs/implementation/THRIVEFOLD_ANALYTICS_AND_INSIGHTS.md` — event catalogue, privacy review, analytics destinations, progress insight formulas/sources and tests.
16. Final report with actual files changed, commands/exit statuses, APK/AAB location, version/application ID/checksum where available, device matrix and unresolved blockers.

Update existing canonical docs rather than creating duplicate competing trackers. Do not claim a doc exists unless it was actually written and verified.

# 13. EXECUTION ORDER — GET TO A PUBLISHABLE, VERIFIED APP

Execute in this order, adapting only when evidence proves a dependency requires a different sequence. Continue to the next phase after each meaningful fix; do not stop at an audit or a successful compile.

**Phase 0 — Inspect and protect.** Read all actual project instructions and prompt/spec files, map routes, inspect Git status/history, establish toolchain/dependency versions, reproduce current crashes, record build/test baseline, capture relevant logs and create a verified backup. Build one canonical coverage/root-cause matrix.

**Phase 1 — Stop crashes and restore build integrity.** Fix confirmed startup/runtime issues, Expo/native module registration and naming, Gradle/config-plugin/model/DSO packaging, Expo Updates/native asset problems, crash-reporting initialization and wrong/stale APK verification. Test the exact new artifact after native changes.

**Phase 2 — Fix true Android frosted backdrop blur.** Reconstruct the previous working implementation, repair the existing common Frosted/BlurView abstraction, use the correct target/background sampling or native shader path, add Reanimated-driven non-spring surface/gesture transitions and validate actual background blur on target Android devices. Do not proceed with a transparent-only approximation.

**Phase 3 — Integrate `expo-motion-blur` in real production UI.** Read the repository and exact module source, check license/version/API/OS support, make it compatible with the actual SDK if needed, then use it in a suitable existing movement interaction. Ensure fallback, reduced motion, performance and native lifecycle work. It must not replace backdrop blur.

**Phase 4 — Integrate `react-native-pose-detection` into real exercise flows.** Review source, pin a known revision, integrate the native module and model/assets, connect native tracking/rep triggers to existing Coach/Train and canonical session state. If required, make a narrow compatible local fork/module; no demo-only integration and no wholesale toolchain upgrade without proof.

**Phase 5 — Finish Coach/Train and all landmark UX.** Fix camera intro, permissions, camera ready/framing, body-pose alignment, tracking loss, exercise HUD, instructions, pause/resume/exit, completion, achievements and history. Profile latency and fix stale frames; maintain face/hand detection as separate MediaPipe modalities only where required. Redesign the ugly modal and implement modern, consistent landmark graphics.

**Phase 6 — Repair all existing flows and deliver goal-driven nutrition.** Complete Log Meals and Gallery; implement the real photo→candidate foods→portion review→deterministic macro calculation→confirm/save flow. Restore the existing local AI/RAG path and create safe optional provider adapters. Finish goal-first onboarding, adaptive plans, deterministic BMI where appropriate, canonical nutrition summaries, existing quests/calendar/rewards, and supported health-data imports/manual vitals. Keep the app functional without AI keys or device integrations.

**Phase 7 — Deliver STT and safe agentic actions.** Implement a deterministic speech-to-text command core that operates without local AI; support app navigation, workout controls and validated draft form entry. Integrate local AI as an optional intent/form-filling/retrieval layer through a typed allowlisted action registry. Add preview/confirmation for high-impact writes, idempotency, result verification and manual fallbacks. Prove basic controls still work with local AI disabled and without cloud credentials.

**Phase 8 — Whole-product UI, accessibility and regression.** Restore the previously good Coach screen first, polish its real workout HUD and completion modal, focus on smooth body-pose markers, hide face/hand overlays with opacity zero and pause their inference for this release while preserving the code. Repair the shared bottom-sheet/modal system and specifically Calendar Add/Edit Event keyboard handling; verify every field is focused, scrolled into view, editable and saveable with keyboard open on real Android when available. Reduce unnecessary form questions and validate privacy-safe analytics/insights. Audit every route/shared component, remove prohibited spring animations, test all state/error/offline/denied/retry paths and run independent verification.

**Phase 9 — Production build and publication delivery.** Run prescribed checks, build the release APK/AAB, inspect native assets/models/DSOs/shaders, install and launch the exact artifact, verify crash-free critical routes and core scenarios, collect evidence, prepare truthful store metadata/privacy/release notes and required non-Coach/camera marketing screenshots, then submit/publish wherever actual access and approvals allow.

Do not ask the user to repeat facts already in project files. Make evidence-backed choices, note unavoidable blockers, and continue as far as the environment permits. If a true sub-agent system is unavailable, execute specialist tracks as bounded sequential work packages. Never fabricate publication status.

# 14. FINAL REPORT FORMAT — EVIDENCE ONLY

At completion, report:

1. **Release status:** what is genuinely complete, what is safe to publish and what remains a release blocker.
2. **Crash/root-cause report:** each actual crash signature, cause/evidence, fix, regression status and exact installed-artifact result.
3. **Native module integrity:** current module inventory, module names/registration, config plugins, Gradle/native dependencies, models/DSOs/shaders and debug/release packaging evidence.
4. **Frosted blur:** exact implementation repaired/created; Android OS/device results demonstrating actual backdrop blur rather than transparency; fallback/platform limitations.
5. **Motion blur:** selected linked revision/version/license, integration location in actual UI, measured behavior/performance, fallback and confirmation that it is not being mislabeled as backdrop blur.
6. **Pose/MediaPipe:** integrated engine/revision/license, real Coach/Train screens using it, body/face/hand capability status, native assets, latency method/results, tracking/lifecycle/rep verification, and confirmation that face/hand overlays are opacity zero and their inference is paused by default for this release.
7. **Visual work:** recovered/improved Coach/Train intro, live HUD, completion/achievement modals, landmark colors/strokes, shared design system and actual screen paths.
8. **Goals and onboarding:** progressive questions, plan generation/adaptation, plan history, BMI behavior/limitations, deterministic rules and test results.
9. **Nutrition and AI:** configured local/cloud vision providers, no-AI/manual fallback, macro sources/provenance, photo consent, portion uncertainty, review/submit flow and persisted-record evidence.
10. **Voice and agentic actions:** supported STT command list, test results without AI, language/recognition dependencies, draft form filling, confirmation gates, local model/runtime state, safe tool registry and fallbacks.
11. **Health-data truthfulness:** measurements actually supported, provenance and permissions, Health Connect/device/manual integrations, and explicitly unsupported readings.
12. **Whole-app status:** crash, meals, Gallery, navigation, gestures, exercise, rewards, persistence, AI/RAG, calendar, voice and every other applicable route/flow in the coverage matrix.
    12A. **Bottom-sheet/keyboard audit:** each affected component and route; Calendar Add/Edit Event field-by-field evidence; keyboard ownership/config chosen; device/API results; unresolved blockers.
    12B. **Analytics and smart inputs:** event schema/privacy audit, observed form-friction findings, data sources/sample sizes, insight validation and how adaptive questions use evidence without over-collecting data.
13. **Exact files changed:** repository paths, purpose, migrations/config changes, verified backup and rollback instructions.
14. **Tests:** exact commands, exit codes, results, level (unit/integration/E2E/device) and evidence paths. Separate actual recognition/device tests from mocked tests.
15. **Build/publishing:** artifact path, application ID/version/checksum if available, device/API, install/launch result, store listing/submission/publication status only if directly verified.
16. **Unresolved blockers:** every failure, untested requirement, unavailable device/service/access or external dependency and concrete next action.

Use status labels accurately: `implemented`, `unit-tested`, `integration-tested`, `device-tested`, `blocked`, `not done`. Successful compilation alone is not proof of runtime operation. A package entry in the manifest is not proof of integration. A screenshot is not proof of native camera/blur behavior. A release artifact is not proof of publication. Do not claim complete coverage without the matrix and evidence.

# FINAL DIRECTIVE

**Work on the actual existing Thrivefold app. Do not create a separate Beta Lab or demo area. Stop crashes and fix native-module registration/packaging first. Restore genuine Android frosted-glass backdrop blur using appropriate background capture/native shader logic, with Reanimated-driven smooth non-spring interactions; use `expo-motion-blur` for suitable real motion, not as a backdrop-blur replacement. Integrate `react-native-pose-detection`/MediaPipe into the real Coach/Train flow. Recover the previously good Coach UI from Git history and finish a smooth, correctly aligned, modern body-pose-only release experience. Preserve face/hand code but set their visible overlay opacity to zero and pause inference by default for this release. Finish food-photo identification with user review and deterministic, source-backed macro calculations; keep manual/no-AI operation fully working. Implement intent-based onboarding, optional height/weight/BMI with limitations, adaptive goal plans, deterministic STT controls that work without AI, and restore local AI as a real safe agentic layer wherever the available device/runtime supports it for natural-language requests, grounded retrieval and draft form filling. If a genuine local model is unavailable, clearly report the blocker and preserve all deterministic/manual functionality rather than faking AI status. Integrate only genuine, permissioned health measurements; never fabricate BP/SpO2 from an ordinary phone sensor/camera. Fix Log Meals, Gallery, gestures, every bottom sheet/modal, every keyboard-blocked form, and the complete Calendar Add/Edit Event flow. Make every field reachable with the Android keyboard open, use focused-field scroll-to-visible and one coherent KeyboardAvoidingView/keyboard-controller strategy, prevent gesture conflicts and duplicate writes, and prove event persistence. Reduce unnecessary inputs using goal-aware progressive disclosure and validated editable defaults. Complete privacy-safe analytics and evidence-backed user insights using existing services, not a duplicate pipeline. Fix workouts/rewards/data/all routes and every other applicable requirement. Preserve existing data and working behavior, inspect every project resource, test critical flows, build/install/verify the exact release artifact, and prepare honest publication deliverables. Do not stop at a plan, demo, green compile or untested APK. Report only what was actually changed and proved.**
