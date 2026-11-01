# CODEX & AI AGENT OPERATING INSTRUCTIONS — THRIVEFOLD

Read and strictly obey `AGENTS.md` and `MASTER_PROMPT.md`.

## CRITICAL RULES TO PREVENT MISTAKES (DO NOT VIOLATE)

1. **NO REWRITES OR DUPLICATE SERVICES**:
   - Never create new chatbots, alternate RAG engines, or parallel database wrappers.
   - Work ONLY inside the existing architecture:
     - `GlobalVoiceAssistant.tsx`
     - `agentEngine.ts`
     - `anvayFtsStore.ts`
     - `knowledgeStore.ts`
     - `thriveRag.ts`
     - `medicineResearch.ts`
     - `toolRegistry.ts`
     - `commands.ts`
     - `LocalAI` native module.

2. **ANDROID ONLY FOR EAS UPDATES**:
   - `eas update` must ALWAYS be run with `-p android` (e.g. `eas update -p android --channel production ...`).
   - Never run `eas update` without `-p android`: web bundling fails because `expo-sqlite@58` relies on native SQLite (`wa-sqlite.wasm` is not bundled for web).

3. **NEVER IMPROVISE MEDICAL DOSAGES**:
   - Small on-device SLMs must NEVER guess, calculate, or hallucinate pharmaceutical dosages or diagnoses.
   - Medical queries must route through the Medical Gate:
     - Match verified catalog (`VERIFIED_MEDICINE_CATALOG`).
     - Fetch authoritative web evidence (OpenFDA / RxNav / MedlinePlus).
     - State clear non-diagnostic educational boundaries and instruct pharmacist/physician consultation.

4. **SELECTIVE GIT STAGING ONLY**:
   - Never run `git add .` or `git add -A`. Other agents or branches work concurrently.
   - Always run `git add <exact_modified_file_path>`.

5. **REAL DEVICE TESTING EVIDENCE**:
   - Never claim a native feature or fix works without testing it on an active Android device or running `pnpm test` / `pnpm compile`.
   - Take screenshots via `adb exec-out screencap -p` to verify UI rendering.

6. **PRESERVE EXISTING DATA & ZERO SECRETS**:
   - Never run `pm clear` or delete user SQLite databases during tests.
   - Never log API keys, Keystore credentials, or print `.env` files.

7. **GRADLE OOM & EAS RELEASE BUILD RELIABILITY**:
   - Expo SDK 58 combines heavy C++ native libraries (Hermes, Reanimated, Skia, Worklets, GestureHandler, SVG) with ProGuard/R8 minification (`minifyReleaseWithR8`).
   - In `app.json` under `expo-build-properties`:
     - Keep `org.gradle.jvmargs: "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseParallelGC"`.
     - Pin `reactNativeArchitectures: "arm64-v8a"` to avoid simultaneously compiling 4 ABIs on 8GB EAS runners.
   - For `credentialsSource: "local"` in `eas.json`, `.easignore` MUST explicitly whitelist:
     `!credentials.json`, `!setu-upload.jks`, and `!google-services.json`. Never remove these exceptions.

