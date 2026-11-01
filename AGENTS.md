# THRIVEFOLD AI — COMPLETE CODE MAP + ENGINEERING EXECUTION

Work exclusively inside the existing ThriveFold project.

## 1. READ FIRST — MANDATORY REPOSITORY RULES

Before running commands or editing anything, read:

- `../../Docs/PRODUCTION_DELIVERY_PLAYBOOK.md`
- `docs/REQUIREMENTS_STATUS.md`
- `docs/PRODUCT_COMPLETION_PLAN.md`
- `.agents/skills/production-delivery/SKILL.md`
- `AGENTS.md`
- `docs/ai/` relevant AI instructions.

Follow the existing ThriveFold Agent Contract without exception.

Use `pnpm` only. Inspect Git status first. Preserve other agents' changes. Read actual files before editing. Smallest possible diffs. Never invent APIs, metrics or test results.

## 2. STRICT SCOPE

**THRIVEFOLD AI ONLY.**

Do not modify unrelated application code, screens, business logic or infrastructure.

Do not touch:

- Other applications.
- Alarm native module.
- Pose-landmarker.
- Theme tokens.
- Authentication/sign-in implementation.
- Signing configuration.
- Generated `android/` or `ios/`.
- Unrelated app configuration.
- Existing user data or downloaded models.

Existing alarm and other application actions may remain connected through their existing interfaces. Do not modify their protected implementations.

No new dependency, database, vector store, assistant, chat store or model manager without written evidence that existing infrastructure cannot satisfy the requirement.

Guest users must retain access to local AI without signing in. Cloud requires explicit consent and an authenticated account or genuinely supported BYOK. Never convert guest requests into platform-funded cloud requests.

## 3. FIRST DELIVERABLE — ONE COMPACT AI CODE MAP

Inspect the complete ThriveFold source tree and create:

`docs/ai/THRIVEFOLD_AI_CODE_MAP.md`

This file must contain **only ThriveFold AI-related code, paths, dependencies, registrations, routes, callers and execution maps**.

Search the entire project. Do not restrict discovery to known filenames.

Include all relevant existing implementations:

| Area      | What to discover                                                               |
| --------- | ------------------------------------------------------------------------------ |
| Assistant | GlobalVoiceAssistant, CoachProvider, globalVoiceController, chat orchestration |
| Local AI  | localCoachAI, localClassifier, routing, prompts, inference adapters            |
| Native AI | Existing Kotlin/Expo module, GGUF runtime, registration, streaming             |
| Models    | Catalogue, downloads, installation, activation, lifecycle                      |
| RAG       | rag_documents, rag_chunks, hybridRagPipeline, retrieval, RRF                   |
| Search    | FTS5, vector search, embeddings, indexing, synchronization                     |
| Memory    | memoryStore, user_memories, ai_interactions, conversation persistence          |
| Actions   | toolRegistry, commands, AI-accessible existing actions                         |
| Voice     | AI-related STT, TTS, transcription and orchestration                           |
| Cloud     | Existing providers, gateway, escalation and response handling                  |
| Routes    | Actual AI screens, Expo Router paths, registrations and deep links             |
| Tests     | AI tests, native tests, fixtures and evaluation datasets                       |

### Exact output format

Keep descriptions minimal. Prioritize paths, code, imports, exports and actual execution relationships.

```md
# THRIVEFOLD AI

## FILES

`exact/path/file.ts` — exports/functions

## IMPORTS

`caller` → `imported implementation`

## ROUTES

`actual route` → `screen` → `AI entry point`

## COMPONENTS

`exact/path`
[AI-specific source]

## SERVICES

`exact/path`
[AI-specific source]

## NATIVE

`exact/path`
[Kotlin/Expo source and registration]

## MODELS

`exact/path`
[catalogue/loading/download/inference]

## RAG_SEARCH

`exact/path`
[FTS5/vector/hybrid/RRF/indexing]

## MEMORY_DATABASE

`exact/path`
[AI schemas, queries and persistence]

## ACTIONS_VOICE

`exact/path`
[registries, commands and execution]

## CLOUD

`exact/path`
[provider and escalation code]

## EXECUTION_MAPS

[actual caller → service → runtime → result]

## TESTS

`exact/path`
[test names and coverage]

## DISCONNECTED_DUPLICATED

[path] — implemented but unused/unregistered/duplicated
```

Rules:

- Use exact, case-sensitive paths.
- Include all relevant AI files, including files discovered through imports and callers.
- Include complete AI-specific source where practical.
- For mixed-purpose files, extract only AI-related imports, exports and functions.
- Include actual routes and registration paths, not hypothetical routes.
- Show real call relationships, not guessed architecture.
- No entire `app.json`, unrelated components or unrelated configuration.
- Never include secrets or environment values.
- No tutorials, recommendations, long descriptions or decorative content.
- Keep the document compact and code-focused.
- Do not minify source syntax or alter code merely to remove whitespace.
- Do not modify application source during this discovery stage.

Cross-check the map against imports, exports, callers, native registration, routes and tests. No important AI implementation should be silently omitted.

## 4. THEN — IMPROVE THE EXISTING THRIVEFOLD AI

Use the code map and actual source as the implementation baseline.

Do not build a replacement AI system.

Connect, repair and optimize the existing:

- Global Assistant and orchestration.
- Local classifier and local conversational AI.
- Native GGUF inference runtime.
- Existing model manager.
- SQLite and FTS5.
- Existing vector retrieval and hybrid RAG.
- Memory and conversation history.
- Existing tools, commands and action registry.
- Existing voice AI.
- Existing cloud integration.

Make every relevant existing implementation reachable through its proper production workflow. No unexplained orphaned AI modules, duplicate services or disconnected capabilities.

### Target execution

`Input → existing classifier → deterministic action / SQLite → FTS5 + vector RAG → local model → validation → cloud escalation only when justified → response → validated RAG ingestion`

### Local-first intelligence

- Deterministic code handles predictable operations.
- Existing SQLite and retrieval answer known questions.
- Existing local models handle ordinary conversation and explanations.
- Existing cloud AI handles genuinely difficult tasks only.
- Never sacrifice answer correctness to inflate local-resolution metrics.

### Better routing mathematics

Measure each tier's latency \(t_i\) and conditional success probability \(s_i\).

\[
E[T]=\sum_i t_i\prod_{j<i}(1-s_j)
\]

\[
E[C]=\sum_i C_i\prod_{j<i}(1-s_j)
\]

Use these to optimize the execution cascade. Calibrate decisions using real ThriveFold evaluation results. Privacy and consent remain hard restrictions.

### RAG learning

Evaluate useful local and cloud outputs before ingestion. Preserve provenance, ownership, freshness and validation status. Never blindly save every answer as trusted knowledge.

Repeated questions should retrieve previously validated knowledge and use local inference whenever sufficient.

This is RAG-based knowledge improvement, not automatic model-weight training.

### Engineering priorities

- Fix actual retrieval, FTS5, vector-search and memory-scope defects.
- Improve context construction and token efficiency.
- Improve model loading, streaming, cancellation and memory usage.
- Optimize inference scheduling and retrieval latency.
- Remove fabricated confidence values.
- Validate structured model outputs.
- Preserve deterministic execution and confirmation for risky actions.
- Keep crisis handling deterministic, local and independent of network or model availability.

## 5. TESTING AND DELIVERY

Follow the Agent Contract:

- Reproduce bugs before fixing them.
- Run `pnpm compile`, `pnpm lint`, focused tests and the full suite as applicable; discover exact scripts first.
- Verify native functionality on an actual Android device.
- Use `adb devices -l` and `adb logcat` where available.
- Do not claim device verification without observing it.
- Never delete data or models as a testing shortcut.
- Two failed attempts on the same issue: stop and report the exact blocker.
- One verified phase per session; run its gate, update requirements status, commit only explicitly changed paths and report honestly.
- Never push unless explicitly authorized.

Final report: implemented, tested, device-verified, blocked and not tested. Include actual paths, commands, exit codes and evidence.

## FINAL INSTRUCTION

First create `docs/ai/THRIVEFOLD_AI_CODE_MAP.md` as a compact, comprehensive, verified dump of our existing AI code and execution paths.

Then use that verified understanding to improve the existing ThriveFold AI without unnecessary rewrites.

**Only ThriveFold AI. All existing relevant AI code. All actual paths. All actual routes. All real connections. No unrelated files. No duplicate systems. No fake completion.**
