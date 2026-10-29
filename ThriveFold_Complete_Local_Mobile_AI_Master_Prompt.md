# THRIVEFOLD — ULTIMATE LOCAL AI & COMPLETE PRODUCT EXECUTION PROMPT

## One unified offline-first intelligence system · Local RAG · Personal memory · Health-document understanding · Emotional context · Voice · Vision · Agentic actions · Full production delivery

**Execution mode:** Inspect → Preserve → Back up → Audit → Design → Implement → Integrate → Test → Measure → Build → Verify → Commit → Continue.

**Product:** Existing Thrivefold Android-first Expo / React Native application, with Thrive Coach as its unified intelligence layer.

**Primary mission:** Transform the existing Thrivefold application into a genuinely intelligent, privacy-conscious, offline-first personal wellness and productivity system that understands relevant user-approved context, retrieves information from its own knowledge base, interprets supported inputs, respects the user's time and preferences, and safely performs real application actions.

This is an execution contract, not a request to produce another plan, demo, isolated AI screen, or architecture proposal.

Inspect the actual repository, preserve the existing good work, implement the missing capabilities, integrate them into real user journeys, execute available tests and builds, and continue until the remaining limitations are genuine and explicitly documented.

---

# 1. THE VISION: ONE INTELLIGENT APPLICATION

Thrive Coach must become the shared intelligence layer throughout Thrivefold, not a separate chatbot that cannot access the rest of the application.

The desired system should understand the user's relevant, authorized context, including:

- Their goals, preferences, routines, constraints, and user-approved memories.
- Their activity, exercise sessions, quests, progress, nutrition records, sleep information, and other supported wellness data.
- Their calendar, appointments, reminders, deadlines, and preferred times for activities.
- Their previous conversations, notes, imported documents, research, and saved knowledge.
- Their current screen, available application features, and actions that can actually be performed.
- Their current request, expressed intent, stated emotional context, communication preferences, and relevant conversation history.
- Their local AI capabilities, downloaded models, runtime state, network status, and device limitations.
- The evidence, source, date, and confidence behind information used in its answers.

The assistant should use this context to answer questions, explain information, retrieve previous decisions, organize knowledge, prepare forms, execute authorized actions, and help users follow through on their goals.

Examples of the intended experience:

- "Explain this prescription and help me understand the schedule my doctor prescribed."
- "What does this medicine label say? Which parts should I confirm with a pharmacist?"
- "What did I learn about this condition last month?"
- "Summarize my sleep and exercise patterns from the past two weeks."
- "I'm exhausted today. Suggest something lighter that fits my schedule."
- "Remind me about this when I am actually available."
- "What did I promise to do, and when did I decide to do it?"
- "Read this document and remember the important points I approve."
- "Find my previous notes about this topic without uploading them anywhere."
- "Log two glasses of water."
- "Start a supported workout and guide me through it."
- "What can I do on this screen?"
- "Find the information I saved yesterday."
- "Turn this conversation into a draft reminder, but let me review it first."
- "I don't have internet. Find the answer in my saved documents."
- "I am overwhelmed. Help me choose one manageable next step."

All of these should use a coherent architecture with shared context, retrieval, tool execution, safety policies, and persistence.

## The meaning of "know everything"

Do not interpret this as a claim that a finite local model can know every fact, diagnose every condition, recognize every object, or understand every human emotion.

Instead, build a system that can:

1. Index all supported, authorized knowledge sources.
2. Retrieve the right information efficiently.
3. Distinguish known facts from missing information and uncertain interpretations.
4. Use specialized models for tasks they genuinely support.
5. Maintain a useful, editable, privacy-controlled memory.
6. Execute application operations through verified tools.
7. Learn from user-approved information and corrections.
8. Work offline within the limits of installed models and available data.
9. Request external information only when appropriate and permitted.
10. Clearly report unsupported capabilities instead of inventing results.

The objective is maximum useful intelligence within real hardware, data, safety, licensing, and performance constraints.

---

# 2. NON-NEGOTIABLE EXECUTION RULES

Before editing anything:

1. Inspect the repository root, current branch, `git status --short`, staged and unstaged changes, untracked files, recent commits, existing backups, and any concurrent agent work.
2. Read `AGENTS.md`, applicable nested instructions, README files, package manifests, lockfiles, Expo configuration, Android configuration, relevant Markdown specifications, database schemas, migrations, tests, and release documentation.
3. Read and reconcile all supplied Thrivefold master prompts and continuation documents. Create one requirements inventory rather than several competing implementation plans.
4. Inspect the actual implementation of the existing local AI runtime, RAG, memory, voice, native modules, camera, exercise logic, data stores, and backend integrations.
5. Establish the current typecheck, lint, unit-test, build, and device-test baseline wherever feasible.
6. Back up affected existing files and preserve uncommitted work before modifying them.
7. Implement the real feature in the existing product. Do not stop after creating a checklist, mock screen, stub, or dependency entry.
8. Verify each coherent change before proceeding.
9. Preserve meaningful user data, migrations, navigation, design tokens, established APIs, and working features.
10. Continue through independent tasks when another task is blocked.

## Existing technical constraints

Preserve the existing Android-first Expo architecture, React Native 0.86, Expo SDK 57, Kotlin Expo modules, and pnpm-only workflow unless inspection proves the actual repository has changed.

Respect existing repository rules, including restrictions on `.kilo/`, `_archive/`, `build/`, and `.cxx/`.

Do not:

- Replace working implementations without evidence of a defect.
- Build a separate demo application or disconnected Beta Lab.
- Introduce competing databases, model runtimes, memory stores, event pipelines, or state-management systems without a documented reason.
- Upgrade dependencies indiscriminately.
- Package multi-gigabyte model weights blindly into the application binary.
- Delete local databases or historical records to simplify a migration.
- Hide errors, weaken tests, or claim unexecuted tests passed.
- Claim a capability works simply because a package is installed or a native module compiles.
- Commit secrets, private health information, local model weights, backups, or generated release artifacts.

Create and verify recoverable backups before risky changes. Review diffs and stage only relevant files when committing.

---

# 3. AUDIT AND INTEGRATE THE EXISTING AI REFERENCE PROJECTS

Inspect these repositories and their actual source code:

1. Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
2. Google LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
3. PocketSage: https://github.com/umarpazir11/pocketsage

Also inspect the local runtime and other existing AI integrations already present in Thrivefold.

Study the actual relevant implementation, dependencies, tests, runtime requirements, supported model formats, licensing, and lifecycle management.

### Google AI Edge Gallery

Investigate the relevant implementations of:

- Model management and downloading.
- Local inference and runtime selection.
- Agent execution and tool dispatch.
- Conversation sessions and streaming.
- Speech recognition and synthesis.
- Semantic retrieval and embedding services.
- Multimodal input processing.
- Error handling and lifecycle management.

Adapt useful architecture and components to Thrivefold's existing React Native/Kotlin architecture. Do not migrate the application to Jetpack Compose.

### LiteRT-LM

Evaluate:

- Supported Android runtime APIs and model formats.
- Model compatibility and hardware acceleration.
- Session creation, token streaming, cancellation, and resource cleanup.
- Structured generation and tool calling where supported.
- Actual image/audio input capabilities in the selected version.
- Embedding support and compatibility.
- JNI, ABI, native-library packaging, and release-build behavior.
- RAM, storage, latency, and thermal constraints.

Verify the official API for the exact dependency version being used.

### PocketSage

Study the offline retrieval pipeline:

Document import → text extraction → chunking → local embeddings → persistent vector records → retrieval → evidence-bounded prompt → grounded response with source references.

Adapt the data flow and relevant reliability patterns, not its entire standalone application shell.

### Licensing

Review source-code, library, tokenizer, model-weight, and dataset licenses independently. Preserve required notices and do not redistribute assets unless their terms permit it.

Produce an audit document recording what was inspected, adopted, adapted, rejected, and why. State the exact source coverage; never claim a complete recursive audit if only selected files were examined.

---

# 4. BUILD ONE AUTHORITATIVE LOCAL AI RUNTIME

Audit the current LocalAI and native-module implementations before introducing another runtime.

Where existing functionality is incomplete, finish a shared Kotlin-backed inference service using the most appropriate verified runtime.

Compare LiteRT-LM with the existing inference engine, including any current llama.cpp/Llamatik integration. Select based on actual compatibility, supported models, quality, latency, memory use, native integration, and licensing.

Do not select a runtime solely because it is newer or popular.

## 4.1 Model registry

Create or complete a canonical model registry.

For every model, record:

- Stable identifier and version.
- Provider and runtime.
- Model family and artifact format.
- Source and download URL.
- File size and required storage.
- License and redistribution conditions.
- Supported languages and tasks.
- Input/output modalities.
- Quantization and context limits where known.
- Minimum tested device requirements.
- Estimated resource requirements, clearly distinguished from measured values.
- Embedding dimension and model identity where applicable.
- Download, verification, installation, loading, and execution status.
- Compatibility and known limitations.

The registry must distinguish downloaded, verified, installed, loaded, running, failed, and unsupported states.

## 4.2 Model lifecycle

Implement and test:

- Device capability detection.
- Storage and resource checks.
- Model discovery and compatibility validation.
- Download progress based on actual bytes transferred.
- Cancellation and resumable downloads where supported.
- Integrity verification using a trusted checksum or signature when available.
- Temporary-file installation followed by atomic promotion.
- Recovery from interrupted or corrupted downloads.
- Private application storage.
- Lazy loading and unloading.
- Session reuse where safe.
- Concurrency control.
- Memory-pressure handling.
- Timeouts, cancellation, and useful error reporting.
- Runtime diagnostics and measured performance.

Do not show fabricated loading progress or report that a model is available when initialization has failed.

Do not keep several large models resident unnecessarily. Support task-based model selection and safe switching.

## 4.3 Device-adaptive execution

The system must work across the supported Android device range, not only on a powerful development device.

Implement capability tiers based on measured or verified properties, including:

- Available memory and storage.
- CPU and supported accelerator capabilities.
- Runtime/model compatibility.
- Battery and thermal constraints.
- Model initialization time.
- Inference latency and token throughput.
- Supported language and modality.
- Current background and foreground state.

Select appropriate models and execution strategies per device.

If a device cannot run the preferred model, fall back to a smaller compatible model, deterministic local processing, or an explicitly optional online capability.

Never imply that every phone can run a large multimodal model smoothly.

---

# 5. CREATE THE COMPLETE OFFLINE KNOWLEDGE SYSTEM

The local AI must work with real information, not merely a chat history or a prompt containing a few recent messages.

Implement one coherent, persistent, offline-first knowledge and retrieval system.

## 5.1 Authorized data sources

Audit existing data ownership and support relevant sources such as:

- User-approved profile information and preferences.
- User-created notes and journals.
- Imported PDFs, text files, supported office documents, and images.
- Extracted text from supported documents and photographs.
- Prescription documents and medicine labels, with explicit user control.
- Exercise instructions and task catalogs.
- Product documentation and in-app help.
- User-approved conversations and summaries.
- Calendar entries, routines, and reminders.
- Relevant historical activity and wellness records.
- Saved research and its original source metadata.
- Corrections and decisions the user explicitly chooses to preserve.

Do not automatically index every private record or every conversation. Apply consent, purpose, sensitivity, retention, and deletion rules.

## 5.2 Document ingestion

Implement a complete ingestion pipeline:

1. Validate file type, size, and accessibility.
2. Import through supported Android file-selection APIs.
3. Extract text using an appropriate parser or OCR engine.
4. Preserve page, section, table, and source information where feasible.
5. Handle multilingual text and Unicode correctly.
6. Identify extraction failures, empty pages, scanned documents, and unsupported formats.
7. Normalize content without destroying important meaning.
8. Split content into bounded, semantically appropriate chunks.
9. Attach source IDs, document IDs, page references, timestamps, and access scope.
10. Generate compatible local embeddings when available.
11. Persist document and chunk metadata transactionally.
12. Make the document searchable and answerable offline.
13. Show ingestion progress, errors, and recoverable states.
14. Support retry, replacement, re-indexing, export, and deletion.

Do not mark a document indexed until its required processing and persistence have succeeded.

For scanned or photographed prescriptions, preserve the distinction between text recognized by OCR and information independently verified from a trustworthy source.

## 5.3 Local vector storage

Reuse the existing SQLite and vector-storage infrastructure where appropriate.

Do not add another database merely to implement RAG.

Store the following as needed:

- Document metadata.
- Stable source and chunk IDs.
- Extracted content.
- Embedding model identity and version.
- Vector dimensions.
- Chunk positions and source references.
- Index version and processing status.
- Permission and sensitivity metadata.
- Creation, modification, and deletion timestamps.

Use versioned indexing and migrations. Never silently mix incompatible embedding spaces.

If a native vector extension is unavailable on a device, provide a tested compatible fallback such as bounded exact vector search for smaller datasets or another already-supported local indexing strategy.

## 5.4 Hybrid retrieval

Implement:

1. Query normalization.
2. Intent classification.
3. Permission-filtered retrieval.
4. Keyword/full-text search where supported.
5. Semantic retrieval where compatible embeddings exist.
6. Hybrid result ranking.
7. Deduplication.
8. Source relevance checks.
9. Bounded evidence selection.
10. Source-grounded answer generation.
11. Visible source references.
12. Graceful handling of insufficient evidence.

Use metadata filters to prevent unrelated, stale, or unauthorized records from contaminating a result.

When an embedding model is unavailable, do not pretend semantic retrieval is running. Use a real fallback and report its limitations.

## 5.5 Retrieval quality and evaluation

Create a representative evaluation dataset using synthetic or appropriately anonymized test material.

Measure:

- Recall at K.
- Ranking quality where measurable.
- Source attribution accuracy.
- Unsupported-answer rate.
- Retrieval latency.
- Memory and storage consumption.
- Behavior on missing or conflicting evidence.
- Offline success rate for the supported tasks.

Record the baseline and actual results.

Do not invent benchmark scores or claim that a system "understands everything" based on a few successful demonstrations.

---

# 6. BUILD A USEFUL, PRIVATE, LONG-TERM MEMORY

The assistant must remember relevant information over time without becoming an uncontrolled archive of sensitive data.

Audit and reuse the existing `memoryStore`, `LlmMemoryGuard`, `memoryStore` consumers, local persistence, hybrid RAG, and related services. Verify the actual names and implementations in the repository before making changes.

Implement one canonical memory system.

## 6.1 Memory categories

Separate:

- **Current conversation:** recent messages and active task context.
- **Session summaries:** concise records of previous interactions.
- **User-approved facts:** stable preferences and explicitly saved information.
- **Goals and commitments:** active goals, decisions, and agreed next steps.
- **Temporal context:** dated events, changes, and historical facts.
- **Knowledge records:** documents and retrieved source material.
- **Sensitive records:** health-related information requiring additional controls.
- **Derived insights:** interpretations based on actual records, with provenance and uncertainty.

Do not confuse an AI-generated inference with a user-confirmed fact.

## 6.2 Memory selection and maintenance

Implement:

- Relevance-based retrieval.
- Explicit memory-saving actions.
- User-visible memory inspection.
- Correction and deletion.
- Conflict resolution using source and timestamp information.
- Expiration or retention rules where appropriate.
- Bounded context assembly.
- Session summarization and compaction.
- Deduplication.
- Provenance and confidence metadata.
- Protection against memory poisoning and malicious document instructions.

Use deterministic rules for retention, access, and deletion. The LLM may propose a memory update but must not silently override a confirmed fact.

## 6.3 Privacy

Provide a clear way to:

- See what has been saved.
- See where a memory came from.
- Correct incorrect memories.
- Delete selected knowledge.
- Delete indexed documents and their derived chunks/embeddings.
- Disable optional memory features.
- Export supported user-owned knowledge.
- Control whether sensitive information may be used in cloud processing.

Deleting a source document must trigger appropriate deletion or invalidation of derived indexes and summaries.

---

# 7. EMOTIONAL CONTEXT AND HUMAN-AWARE INTERACTION

The assistant should respond sensitively to the user's expressed emotional state and adapt its communication style to the situation.

However, it must not claim to read someone's mind, diagnose a mental health condition from text, or infer a person's true emotional state from facial appearance alone.

## 7.1 Context-aware communication

Use explicit statements and conversation context as the strongest evidence.

For example:

- If the user says they are exhausted, acknowledge that and offer a smaller task.
- If the user says they are frustrated, avoid repeating the same failed instructions.
- If the user is confused, explain the next step clearly.
- If the user is grieving or distressed, prioritize empathy and practical support over productivity metrics.
- If the user asks for a direct answer, do not bury it under generic motivational language.
- If the user wants quiet or fewer interruptions, respect that preference.

Maintain a distinction between:

- Emotion explicitly expressed by the user.
- A tentative interpretation of language.
- A model-generated hypothesis that may be wrong.
- An established fact.

Ask a respectful clarification when uncertainty materially affects the response.

## 7.2 No invasive emotion surveillance

Do not continuously analyze facial expressions, voice characteristics, or camera footage to assign emotional labels without a clear, informed, revocable purpose and explicit permission.

Do not infer sensitive traits or use uncertain emotional classifications to make consequential decisions.

If optional voice or vision emotion-related features are introduced, they must:

- Be separately consented to.
- Be off by default unless the user explicitly chooses otherwise.
- Explain their limitations.
- Avoid storing raw audio/video unnecessarily.
- Keep processing local where supported.
- Avoid making diagnostic or authoritative claims.
- Allow the user to disable the feature and delete related derived data.

Do not represent a smile, posture, or vocal characteristic as proof of happiness, depression, dishonesty, or any other internal state.

## 7.3 Respectful coaching

Personalization should reduce friction, not manipulate the user.

Never shame users for missed tasks, missed workouts, interrupted routines, sleep patterns, or productivity.

Do not use emotional inference to create guilt, compulsive engagement, unnecessary reminders, or pressure to complete an activity.

The assistant should help the user choose a manageable next action, including choosing to rest or postpone a task.

---

# 8. HEALTH DOCUMENTS, PRESCRIPTIONS, AND MEDICINE INFORMATION

Treat health-related capabilities as a safety-sensitive document-understanding and education workflow, not an autonomous medical decision system.

The goal is to help the user read, organize, understand, and retrieve health information accurately while preserving the authority of the original prescription and qualified healthcare professionals.

## 8.1 Prescription ingestion

Support appropriate document and image inputs, subject to available parsers and OCR/vision models.

Extract candidate fields such as:

- Patient name, if present and necessary.
- Prescriber and facility information, where visible.
- Medicine name and brand, when legible.
- Active ingredient, if explicitly available or independently verified.
- Strength and dosage form.
- Prescribed dose.
- Route of administration.
- Frequency.
- Timing instructions.
- Start and end dates.
- Duration.
- Food-related instructions.
- Explicit warnings and precautions.
- Follow-up instructions.
- Relevant handwritten notes, only when the recognition quality supports it.

For every field, preserve the distinction between extracted text and verified interpretation.

Use field-level confidence or an equivalent uncertainty representation. Do not fabricate missing values.

If a number, medicine name, decimal, unit, or timing instruction is unclear, show the uncertain field and ask the user to review the original document.

Never silently turn an uncertain OCR result into a confirmed medication instruction.

## 8.2 Prescription understanding

The assistant may explain, in accessible language:

- What the prescription appears to say.
- What a clearly identified medicine is generally used for, based on trustworthy sources.
- What common medical terms mean.
- What instructions are explicitly written.
- Which details are unclear or missing.
- Which questions the user may wish to ask a pharmacist or clinician.
- How to organize an existing prescribed schedule into reminders after the user confirms the instructions.

Clearly distinguish the original prescription, verified medicine information, general educational information, and AI-generated interpretation.

Do not autonomously:

- Diagnose a condition from a prescription.
- Change prescribed doses.
- Recommend starting or stopping medication.
- Resolve uncertain drug identification by guessing.
- Declare a combination safe without appropriate evidence.
- Invent contraindications, interactions, or clinical instructions.
- Infer a treatment plan from incomplete medical records.

Do not present the assistant as a doctor or pharmacist.

## 8.3 Medicine identification and verification

Use a structured, source-backed workflow.

1. Extract the visible medicine details.
2. Check whether the identification is sufficiently reliable.
3. If online verification is available and permitted, consult trustworthy medical or official sources.
4. Match the source to the exact active ingredient, strength, dosage form, and relevant jurisdiction where possible.
5. Record the source title, publisher, URL, retrieval time, and relevant publication/update date.
6. Distinguish verified facts from uncertain matches.
7. Present the result for user review.
8. Refer uncertain identification, interactions, contraindications, and treatment decisions to a qualified pharmacist or clinician.

A photograph of a pill or package must not be treated as conclusive identification when the available evidence is insufficient.

## 8.4 Medicine schedules and reminders

Represent medication schedules as structured, user-confirmed data rather than relying on a language model to remember free-text instructions.

Where supported, store:

- Medication reference.
- Confirmed instruction text.
- Confirmed dose and unit.
- Route and frequency.
- Relevant start/end dates.
- Local time and time zone.
- User-confirmed reminder times.
- Source prescription and page/field references.
- Confirmation timestamp.
- Changes and audit history.

Require confirmation before creating or materially changing a medication schedule.

Preserve the original instruction when the schedule cannot be represented reliably. Ask the user or recommend professional clarification instead of improvising.

Medication reminders must be presented as reminders, not proof that the medicine was taken.

Never change the prescription automatically because the user missed a dose. Do not invent catch-up instructions.

## 8.5 Urgent and high-risk situations

Use conservative, clearly defined safety pathways for potential medication emergencies or urgent symptoms.

Do not attempt to handle a potentially life-threatening situation solely through local model inference. Provide appropriate urgent-care guidance and relevant local emergency information when available and reliable.

Offline mode must not falsely imply that the assistant has verified current clinical guidance or has access to emergency services.

---

# 9. TIME-AWARE INTELLIGENCE THAT RESPECTS THE USER

Time awareness must be a real application capability, not merely an instruction embedded in an LLM prompt.

The system should understand time zones, dates, schedules, availability, durations, recurrence, deadlines, and temporal relationships using deterministic code.

## 9.1 Temporal context

Use the device's supported date/time APIs and explicit time-zone identifiers.

Represent timestamps consistently and preserve the original time zone where relevant.

Handle:

- Local dates and times.
- Time-zone conversion.
- Daylight-saving transitions where applicable.
- Recurring schedules.
- Relative expressions such as "tomorrow morning."
- Duration calculations.
- Deadlines and expiry.
- Calendar conflicts.
- Historical versus future events.
- Offline time changes and synchronization conflicts.

Never let an LLM independently determine authoritative date arithmetic when deterministic code can do it correctly.

## 9.2 Respect the user's schedule

Build recommendations around:

- Calendar availability where permission exists.
- User-defined quiet hours.
- Sleep and rest preferences.
- Work or personal commitments.
- Reminder preferences.
- Travel or time-zone changes where known.
- The duration and effort of the proposed task.
- Explicitly stated energy, capacity, or time constraints.

Do not assume access to a calendar, wearable, or health sensor that is not connected and authorized.

Do not treat inferred sleep or emotional state as established facts.

## 9.3 Smart reminders

The assistant may propose reminders based on explicit goals and user-approved patterns.

For example, it can suggest moving a routine to a time the user prefers or breaking a long task into smaller sessions.

It must not silently create, reschedule, or repeatedly trigger reminders.

Before committing changes, show the proposed action, date, time zone, recurrence, and destination.

Use the operating system's supported scheduling mechanisms, with appropriate permission handling, rather than relying on an AI process remaining alive in the background.

Respect quiet hours, notification permissions, battery restrictions, and Android background-execution limits.

If a reminder cannot be guaranteed because of OS restrictions, explain the limitation.

## 9.4 Adaptive wellness

Where actual data and consent support it, the system may offer gentler alternatives when the user reports low energy, limited time, or discomfort.

It must not infer a medical condition from a missed task, automatically penalize the user, or equate greater activity with better outcomes in every situation.

Keep scheduling and scoring deterministic. Use AI only to generate or explain options that satisfy established constraints.

---

# 10. ONE CONVERSATIONAL VOICE ASSISTANT

Integrate the assistant into the existing application shell and navigation.

Audit `useVoiceInput`, `coachVoice`, the existing voice provider, audio services, and native integrations before changing them.

Use one application-level assistant controller rather than separate competing assistants on individual screens.

## 10.1 Voice lifecycle

Implement explicit states such as:

`idle → requesting_permission → listening → transcribing → reasoning → executing_action → speaking → idle`

Support cancellation, interruption, retry, timeout, permission denial, silence, partial results, final transcripts, and recovery from errors.

Provide:

- Push-to-talk or the existing supported activation gesture.
- An accessible alternative to long-press controls.
- Clear microphone and processing indicators.
- Partial and final transcripts where supported.
- Spoken responses where TTS is available.
- Streaming responses where genuinely supported.
- Follow-up questions and multi-turn context.
- Immediate cancellation of current speech and generation.
- Prevention of duplicate actions caused by repeated commands.
- Correct cleanup when navigating away or backgrounding the app.

Do not leave microphones, recorders, inference sessions, timers, or TTS playback running unintentionally.

## 10.2 Deterministic commands without an LLM

Core actions must remain available when the local model is missing or unloaded.

Implement a typed, deterministic command layer for supported operations such as:

- Navigation.
- Starting, pausing, and stopping supported activities.
- Opening relevant screens.
- Creating draft reminders.
- Logging supported activities.
- Opening documents.
- Searching saved local knowledge.

Voice recognition itself may depend on the selected speech engine. Document whether it works offline, requires downloaded speech models, or depends on Android/network services.

Never claim that a speech-recognition service is offline simply because the application is offline-first.

## 10.3 Speech and language support

Audit actual language support and availability.

Use an appropriate ASR/TTS engine, including local model-backed options where verified.

Support graceful fallback to typed input and visible text when speech is unavailable.

Do not promise arbitrary-language recognition, streaming TTS, speaker recognition, or emotion recognition without a compatible implementation and tests.

---

# 11. CAMERA, DOCUMENT VISION, AND MULTIMODAL INTELLIGENCE

Use specialized models and native Android capabilities for tasks they actually support.

Audit the existing camera pipeline, MediaPipe integration, native image processing, and Skia rendering.

Support applicable workflows such as:

- OCR and document understanding.
- Prescription and label reading.
- Food-photo assistance where implemented.
- Supported object detection.
- Supported pose and movement tracking.
- Image-based question answering where a compatible model exists.
- Other explicitly scoped vision features already documented by the product.

Do not assume a text-only model can accept image input.

## 11.1 Real camera processing

Use the existing camera architecture and native processing capabilities.

Avoid sending full-resolution frames to JavaScript unnecessarily. Apply backpressure, release resources reliably, reject stale results, and measure inference latency.

Do not run duplicate camera engines or competing high-cost inference loops.

For the current Coach/Train release, prioritize body-pose tracking. Preserve existing face/hand integrations where required, but pause their inference and keep their overlays hidden by default unless a separately verified requirement justifies their activation.

## 11.2 Exercise intelligence

Complete the real journey:

Exercise selection → Instructions → Camera setup → Ready state → Live tracking → Deterministic movement evaluation → Feedback → Repetitions or hold → Rest/set transition → Completion → Persisted history.

Use actual landmarks and supported exercise rules to determine readiness, repetition counts, and feedback.

Do not treat pose detection alone as proof of correct or safe movement.

Keep repetition counting, timers, session state, and reward calculations deterministic.

Use AI to explain supported feedback and personalize instruction, not to fabricate tracking results.

## 11.3 Camera and vision safety

Ask permission before accessing sensitive inputs.

Avoid unnecessary image retention. Clearly distinguish live processing, saved images, extracted metadata, and cloud uploads.

Never claim that a photo establishes a diagnosis or a medical measurement that the chosen technology cannot reliably obtain.

---

# 12. SAFE AGENTIC ACTIONS THROUGHOUT THRIVEFOLD

The assistant must be capable of taking useful actions through real application services, not just producing suggestions in text.

Create or complete a typed tool registry.

Every tool must declare:

- Stable name and version.
- Description and validated input schema.
- Authorized execution handler.
- Required permissions.
- Data sensitivity.
- Whether network access is needed.
- Whether user confirmation is required.
- Idempotency behavior.
- Timeout and cancellation behavior.
- Error types and recovery strategy.
- Audit and test coverage.

Use existing domain services rather than writing directly into arbitrary tables or manipulating application state through generated text.

## 12.1 Action safety levels

**Low risk:** search local knowledge, summarize an authorized document, navigate to a screen, or show a recommendation.

**Reversible state change:** create a draft note, prepare a reminder, or fill a form with proposed values.

**Sensitive action:** save health information, create or change a medication reminder, submit nutrition records, or modify a consequential personal setting.

**High impact or external action:** delete important data, transmit sensitive information, submit externally visible content, or perform an irreversible operation.

Require appropriate confirmation for each category. High-impact operations must never be authorized by an unconstrained LLM response.

## 12.2 Execution contract

For every action:

1. Interpret the request.
2. Validate the tool and arguments.
3. Check authorization and required permissions.
4. Retrieve necessary authoritative data.
5. Prepare a proposed action if confirmation is needed.
6. Ask for confirmation when required.
7. Execute through the canonical domain service.
8. Verify the actual result.
9. Persist the resulting record through the correct owner.
10. Return a truthful outcome to the user.

Use idempotency keys or equivalent protections for retryable actions.

Never claim an action succeeded merely because the model generated a tool call.

---

# 13. UNIFY THRIVEFOLD'S DATA AND BUSINESS LOGIC

Audit and reuse existing:

- Expo SQLite and migrations.
- Supabase/PostgreSQL and Row Level Security.
- TanStack React Query.
- Zustand stores.
- Firebase Analytics and Crashlytics.
- Local analytics and diagnostic systems.
- AI providers, embedding services, and RAG.
- Exercise, task, quest, reward, calendar, and health-related services.

Document canonical ownership for each entity.

A typical division of responsibility, subject to actual repository evidence:

- SQLite: durable local records, offline-first data, local knowledge, and pending synchronization.
- Supabase/PostgreSQL: authorized synchronized account and shared records.
- TanStack React Query: remote server state and synchronization lifecycle.
- Zustand: transient UI and interaction state.
- Existing analytics services: consented telemetry and diagnostics.
- Local AI: inference, classification, retrieval, and supported private processing.
- Existing backend AI services: optional authorized cloud workflows and tasks requiring online access.

Do not duplicate a source of truth across several databases or stores.

## Business rules

Use deterministic, tested code for:

- Dates and scheduling.
- Numerical calculations.
- Nutrition totals and supported macro calculations.
- Repetition counts and session timers.
- Task verification.
- Rewards, XP, levels, streaks, and entitlements.
- Permission checks and authorization.
- Persistence and synchronization.
- Idempotency and conflict resolution.

Preserve established reward distinctions and server authority where required.

Do not allow an LLM to invent scores, modify authoritative balances, or mark unverified work as independently verified.

## Health-data truthfulness

Only present health measurements that are genuinely available from a supported, authorized source.

Distinguish manual entry, device measurements, imported provider data, and derived estimates.

Do not fabricate blood pressure, oxygen saturation, sleep measurements, or other physiological readings from an ordinary camera or phone sensor when the implementation cannot measure them reliably.

---

# 14. HYBRID CLOUD: OPTIONAL, EXPLICIT, AND BOUNDED

The product should prioritize local processing and use online services only when they provide a genuine benefit.

Offline-first does not mean every feature is possible offline.

## Local-first behavior

When the user is offline, the system should continue to support whatever is genuinely available locally, including:

- Previously downloaded models.
- Indexed and saved documents.
- Local keyword and semantic retrieval.
- Approved local memories.
- Supported deterministic calculations.
- Local voice recognition and TTS when the relevant models are installed.
- Local document processing and compatible vision tasks.
- Local records and queued synchronization.

If a requested capability requires unavailable data, an uninstalled model, or a network connection, explain the specific limitation.

## Optional online behavior

Use the existing approved backend and provider integrations for:

- Fresh web research.
- Remote synchronization.
- Cloud inference when the user permits it.
- Tasks that exceed local capabilities.
- Other existing authorized online workflows.

Before transmitting sensitive information, apply the actual consent and privacy rules.

Do not silently upload prescriptions, private documents, conversations, camera images, or health records to improve a response.

Apply timeouts, cancellation, retry limits, rate limits, cost limits, bounded contexts, output validation, and offline fallback.

Store provenance for external research, including source URL, publisher, retrieval timestamp, and relevant publication date.

Never claim fresh online verification when the device has not actually obtained it.

---

# 15. SECURITY, PRIVACY, AND UNTRUSTED CONTENT

Treat imported documents, OCR output, retrieved text, web pages, model responses, and external tool results as untrusted data.

A document may contain malicious instructions. Its content must never override system policies, grant permissions, or authorize tool execution.

Implement:

- Input validation and bounded processing.
- Permission and account-scope checks.
- Private storage and safe file handling.
- Secret management.
- Appropriate encryption where justified and supported.
- Redaction of sensitive data in logs and analytics.
- Safe model-output parsing.
- Protection against prompt injection and retrieval poisoning.
- Explicit boundaries between instructions and retrieved evidence.
- Safe database migrations and rollback.
- Account isolation in remote retrieval.
- User-controlled retention and deletion.
- Crash reporting without unnecessary health or personal information.

Do not store API secrets in the application bundle or commit credentials.

Do not claim that encryption, secure deletion, account isolation, or privacy guarantees exist until their implementation has been verified.

---

# 16. GLOBAL THRIVE COACH UX

Integrate the assistant into the real existing navigation and application shell.

Reuse the current central/bottom-tab action where appropriate, preserving existing short-tap behavior unless a tested change is justified.

Provide a global assistant controller that persists across navigation without duplicating conversations, audio engines, or inference sessions.

Implement a screen capability registry containing:

- Screen ID and route.
- Screen purpose.
- Available actions.
- Relevant canonical data services.
- Required permissions.
- Applicable safety constraints.
- Contextual guidance and suggestions.

The assistant must explain what the current screen can do based on real features.

If a feature is unavailable, say so.

Use the existing Thrivefold design system and theme tokens. Preserve the current product identity, established layouts, accessibility, and functioning navigation.

Do not build an engineering-debug interface as the primary user experience.

Model management, detailed diagnostics, and local AI settings may be provided in an appropriate existing settings or management surface, but should not overwhelm ordinary user journeys.

Show honest states for:

- Model unavailable.
- Model downloading.
- Model loading.
- Local inference ready.
- Offline retrieval available.
- Online research required.
- Permission denied.
- Unsupported input.
- Low storage or insufficient resources.
- Ingestion failure.
- Uncertain document extraction.
- Action awaiting confirmation.
- Action completed.
- Recoverable failure.

Never display a successful result before the underlying operation has actually succeeded.

---

# 17. PERFORMANCE AND RELIABILITY

Profile actual bottlenecks rather than adding abstractions or animations without evidence.

Measure:

- Model download and initialization.
- Time to first token.
- Generation throughput.
- Retrieval latency.
- Document extraction time.
- Embedding and indexing time.
- Peak memory use where measurable.
- Camera and pose latency.
- UI responsiveness.
- Storage growth.
- Battery and thermal behavior where measurable.
- Crash and recovery behavior.

Use bounded concurrency, cancellation, resource cleanup, lazy loading, and appropriate inference scheduling.

Do not execute expensive inference on the UI thread.

Do not allow a long document, a large conversation, or an unbounded memory index to exhaust device resources.

Use structured errors and diagnostics with useful failure context but without leaking private data.

Never promise zero crashes on every Android device. Verify the supported environments and document the remaining risks.

---

# 18. COMPLETE THE EXISTING PRODUCT, NOT JUST THE AI

The local AI is only one part of the release.

Account for the full documented Thrivefold scope, including applicable:

- Navigation and existing user journeys.
- Calendar and event forms.
- Keyboard handling in sheets and modals.
- Camera and gallery access.
- Crash prevention and native-module registration.
- Coach and Train workflows.
- Body-pose rendering and session history.
- Nutrition logging and food-photo assistance.
- Goals and onboarding.
- Routines and reminders.
- Quests, games, rewards, and progression.
- Analytics and diagnostics.
- Local AI and RAG.
- Backend synchronization.
- Release configuration and publishing preparation.

Prioritize existing crash reports and native-module registration/packaging failures before cosmetic improvements.

Audit all affected text inputs and bottom sheets. Verify that Android keyboard behavior, scrolling, gestures, safe areas, focus, submission, and dismissal work correctly.

Preserve working face/hand integrations as required by the existing architecture while prioritizing body-pose performance for the current release.

Do not create a separate demonstration area to conceal incomplete production flows.

For each documented feature, identify its real implementation, acceptance criteria, tests, and current status.

---

# 19. TEST THE ENTIRE SYSTEM END TO END

Create a requirements traceability matrix and test suite for the actual implementation.

## Local model tests

Verify:

- Model discovery.
- Download integrity.
- Interrupted-download recovery.
- Compatibility validation.
- Initialization and unloading.
- Actual inference.
- Streaming and cancellation where supported.
- Memory pressure.
- Unsupported model behavior.
- Offline execution.
- Native-module availability in the exact binary.

## RAG tests

Verify:

- Importing a document.
- Extraction and OCR.
- Chunk creation.
- Embedding generation.
- Persistent indexing.
- Retrieval and ranking.
- Source citations.
- Permission filtering.
- Insufficient-evidence behavior.
- Document deletion and re-indexing.
- Retrieval after process restart.
- Retrieval with the network disabled.

## Memory tests

Verify:

- Saving and retrieving approved memories.
- Distinguishing facts from inferences.
- Conflict handling.
- Corrections and deletions.
- Retention rules.
- Sensitive-record access controls.
- Memory persistence across sessions.
- Protection against malicious retrieved instructions.

## Health-document tests

Use controlled synthetic test documents with known text and deliberately ambiguous examples.

Verify:

- Correct extraction of medicine names, units, doses, frequencies, and times.
- Preservation of uncertainty.
- Handling of missing or conflicting instructions.
- Correct source attribution.
- Confirmation before creating reminders.
- No fabricated clinical information.
- Appropriate escalation when identification or interpretation is uncertain.

Do not use real private medical records in public fixtures or commit them to the repository.

## Voice and action tests

Verify:

- Speech permissions.
- Supported recognition modes.
- Offline versus online behavior.
- Typed fallback.
- Cancellation and interruption.
- Duplicate-command protection.
- Schema validation.
- Confirmation gates.
- Idempotent execution.
- Real persistence and truthful success messages.

## Full application tests

Verify the existing critical journeys, including:

- Cold and warm launch.
- Navigation.
- Camera permission grant and denial.
- Background/resume.
- Local model unavailable.
- Network loss.
- Calendar event creation and editing.
- Keyboard-visible forms.
- Exercise completion and history persistence.
- Nutrition logging and image selection.
- Local memory and RAG.
- Crash reporting.
- Release APK/AAB native-library packaging.

Use unit, integration, UI, native, and physical-device tests where available.

A mocked test does not establish real device functionality. A successful build does not establish runtime correctness.

---

# 20. IMPLEMENTATION ORDER

Work in safe, verified milestones.

## Phase 1 — Repository protection and stability

- Inspect the actual project and Git state.
- Read applicable specifications and repository instructions.
- Back up affected files.
- Establish the baseline.
- Reproduce current crashes and record evidence.
- Repair critical native-module and startup failures.

## Phase 2 — Infrastructure audit

- Map canonical data ownership.
- Audit existing model runtime, RAG, memory, voice, vision, and tool execution.
- Inspect the reference repositories and applicable licenses.
- Identify duplicate or incomplete implementations.
- Produce a prioritized requirements matrix.

## Phase 3 — Local runtime

- Complete or consolidate the native inference adapter.
- Implement model discovery and lifecycle management.
- Validate a supported local model on the target device.
- Verify real offline inference.
- Add cancellation, error handling, and diagnostics.

## Phase 4 — Local knowledge and memory

- Complete document ingestion.
- Implement or repair persistent local indexing.
- Implement hybrid retrieval and source attribution.
- Complete approved memory storage and retrieval.
- Test offline operation and deletion behavior.

## Phase 5 — Multimodal and health understanding

- Complete supported OCR and document processing.
- Integrate safe prescription interpretation and review.
- Validate supported image, camera, and pose features.
- Document unsupported capabilities explicitly.

## Phase 6 — Voice, temporal intelligence, and actions

- Unify the assistant controller.
- Integrate actual ASR/TTS capabilities.
- Implement deterministic commands and safe tool execution.
- Complete time-zone-aware scheduling and reminder flows.
- Add user-confirmed personalization and memory updates.

## Phase 7 — Whole-app integration

- Connect the assistant to existing screens and canonical data services.
- Repair remaining critical user journeys.
- Improve performance based on measurements.
- Verify health, exercise, calendar, nutrition, and progression consistency.

## Phase 8 — Release verification

- Run focused tests, full relevant tests, and builds.
- Install and test the exact release artifact where a device is available.
- Inspect native libraries and required assets.
- Verify startup, offline behavior, and key journeys.
- Prepare store metadata, screenshots from the real application, privacy disclosures, and release documentation where applicable.
- Submit or publish only when actual permissions, credentials, approvals, and platform requirements allow it.
- Record the verified status and remaining blockers.

Do not stop after a phase merely because its documentation has been written. Continue with the implementation.

---

# 21. REQUIRED DELIVERABLES

Reuse existing canonical files where available instead of creating competing documentation.

Create or update appropriate equivalents of:

- `docs/architecture/EXISTING_INFRASTRUCTURE_MAP.md`
- `docs/REQUIREMENTS_TRACEABILITY.md`
- `docs/ai/LOCAL_AI_RUNTIME_AND_MODEL_CATALOG.md`
- `docs/ai/LOCAL_RAG_AND_MEMORY_ARCHITECTURE.md`
- `docs/ai/CAPABILITY_AND_OFFLINE_MATRIX.md`
- `docs/ai/HEALTH_DOCUMENT_SAFETY.md`
- `docs/testing/QUALITY_AND_RELEASE_CHECKLIST.md`
- `docs/implementation/THRIVEFOLD_DELIVERY_LOG.md`
- `docs/release/RELEASE_RUNBOOK.md`

Document only what is supported by actual repository evidence.

## Capability matrix

For each requested capability, record:

- Feature and user journey.
- Actual implementation path.
- Runtime, model, and version where applicable.
- License and source.
- Required device resources.
- Offline support.
- Network and permission requirements.
- Actual fallback behavior.
- Tests and evidence.
- Current status.
- Known limitations.

Use precise status labels:

- `TODO`
- `IN PROGRESS`
- `IMPLEMENTED`
- `AUTOMATED TESTED`
- `BUILD VERIFIED`
- `DEVICE VERIFIED`
- `BACKEND VERIFIED`
- `DEPLOYED`
- `SUBMITTED`
- `APPROVED`
- `PUBLISHED`
- `BLOCKED — EXACT REASON`
- `NOT APPLICABLE — JUSTIFICATION`

Do not mark a feature complete because its UI exists, its API is declared, or its dependency is installed.

---

# 22. FINAL ACCEPTANCE CRITERIA

The system must demonstrate the following to the extent claimed:

1. Existing working Thrivefold functionality and user data are preserved.
2. Canonical data ownership and business rules are documented.
3. The selected local runtime is compatible with the actual build and supported device.
4. A real local model can perform its supported tasks.
5. Model management handles failure, cancellation, and resource constraints.
6. Documents can be imported, processed, indexed, retrieved, and deleted correctly.
7. Local RAG produces evidence-grounded responses with usable source references.
8. Approved memory persists and can be corrected or deleted.
9. Sensitive information follows explicit permission and retention rules.
10. Prescription interpretation distinguishes extracted text, verified information, and uncertain inference.
11. Medication reminders require appropriate user confirmation and preserve the original instruction.
12. Emotional context improves communication without pretending to diagnose or read minds.
13. Scheduling and time calculations use deterministic, tested logic.
14. Voice commands can execute supported actions without making an LLM mandatory.
15. Agentic actions use real application services, authorization, validation, and confirmation.
16. Camera and exercise capabilities report only the functions that genuinely work.
17. Offline behavior is verified with the network disabled.
18. Optional cloud operations follow explicit privacy and network boundaries.
19. Native modules are present and callable in the verified release binary.
20. Existing critical application journeys remain functional.
21. Performance, reliability, and retrieval quality are measured rather than guessed.
22. Relevant automated tests and builds have actual recorded results.
23. Backups and rollback instructions are valid.
24. The release artifact and its status are verified accurately.
25. Every unfinished requirement has an explicit reason and next action.

---

# 23. REQUIRED FINAL ENGINEERING REPORT

At delivery, provide:

**A. Existing product preserved:** What was already working and what was retained.

**B. Actual changes:** User-visible behavior and implementation paths changed.

**C. Local AI runtime:** Runtime selected, model versions, model licenses, compatibility, real inference evidence, and limitations.

**D. Offline knowledge system:** Supported formats, extraction, embeddings, indexing, retrieval, source citations, deletion, and offline test results.

**E. Memory:** Categories, persistence, retrieval, corrections, deletion, and privacy controls.

**F. Health and prescription understanding:** Actual extraction quality, verification sources, confirmation behavior, and remaining safety limitations.

**G. Emotional and time-aware behavior:** How explicit user context, scheduling, reminders, and deterministic temporal logic work.

**H. Voice, camera, and actions:** Actual supported features, native integrations, permission requirements, fallbacks, and end-to-end test evidence.

**I. Data and backend architecture:** Canonical ownership, migrations, synchronization, security, and any remote changes.

**J. Performance:** Actual measurements, test environment, methodology, and before/after results where available.

**K. Exact changed files:** Repository-relative paths, purpose, backups, rollback procedures, and commits.

**L. Verification:** Exact commands, exit codes, test levels, build results, device details, and evidence paths.

**M. Release and publication:** Exact artifact, checksum if available, installation status, submission status, and publication status only when verified.

**N. Remaining blockers:** Every incomplete or untested requirement, why it is blocked, and the next concrete action.

Do not claim that all possible capabilities are implemented simply because a broad capability matrix exists.

---

# FINAL DIRECTIVE

Build Thrivefold into a coherent, genuinely useful local-first intelligence system.

The assistant should be able to retrieve the user's approved knowledge, understand supported documents, explain information carefully, remember relevant context, recognize when evidence is missing, respect the user's time and stated emotional needs, and execute authorized application actions.

It must remain useful without internet access wherever the necessary models and data are installed. It must use external services only when required, permitted, and clearly distinguished from local processing.

Use the existing application as the foundation. Preserve good engineering. Do not create competing architectures or fake capabilities. Use deterministic software for calculations, scheduling, authorization, and consequential business rules. Use AI where it provides measurable value.

**The standard is not an AI that claims to know everything. The standard is an AI system that can find what it knows, explain why it believes something, admit what it cannot establish, protect the user's information, and reliably do what it promises.**

Inspect the repository. Back it up. Implement the real system. Test it on the actual supported environment. Verify the evidence. Commit coherent milestones. Continue until the remaining work is explicitly accounted for.
