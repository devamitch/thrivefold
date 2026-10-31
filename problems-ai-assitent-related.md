Take actions for below... finish all and tansk for your contionuous great efforts
oh it was gloabl voice asisteant
I founc few thigns and tried to manually solve them.. i just kep previous code as copy and new
honestly with another ai and even new GlobalVoiceAssistant is shits and it's worsen.. so i asked it to write an propmt for me

keyboard avoideing view w not handle properly and specin.. it it's glittering toomuch betauions we are also optoning mocsdals... but if we don dkeep this speec local theres... if we have even thingform contents porvicer scenarios will be changed ...
cetralise ai coach mesnit's will knoww all our centstrs. tasksplans.. about us from sqlites.. all logics... and lrns tasb .. and previous and now chat history local chat history and all mediciins and all actiosn every thignall data base local

thats's facinating.. and i feel it's needs.. adn it's should know all rotes as wells.. so while transing betnween screens voice wont break and same vocie will hcentralise for all screech.. and w it's can modify the way to read evelemtns and beteer wasy to explain ghitngs.. ?? and in extrattexts wwe caacan make this companios doctor speech therapist firend bofriend girlfrined andll thigns in one place... and coach.. and nutritionst,, and reader and better bloggers adn all in one place
taa

GlobalVoiceAssistant

fix it

fix this voice assistant ...

do you need anything

itt's micro phone is glitching like glhos turn on and off

mico phonne issues..

i want it to be work like all traditonal ai voice ai coaches...

also amke a content provider.. and with zustand sqlite and vector and and all ... add every thignin veector db
add all our app routing info aall contents. every thign add in vector db local vector db

and all where ever there is expo sceen replace every where with our coach spech serinc.. from profived.. make it centralised easy right ???

key board avaiidng Vide not wokring properly

GlobalVoiceAssistant

on each time modal closing whole history clearing it's not good

and finsh Learn screen thigns.
then finish remaingin things.. and centralised data and centralised coach is still misisng fix then

Task: fix the Thrive Coach sheet (chat list + keyboard) and the "ghost" microphone

Work like an engineer debugging a production app, not like a rewriter. Reproduce first, instrument, then change the smallest thing the evidence points to. Do not rewrite files wholesale. Show me a diff per concern.

0. Context
   App: Thrivefold. expo sdk 58, React Native 0.83, Android-first, edge-to-edge is on (Android 15 behaviour). Test device: Motorola Moto G71 5G (Snapdragon 695) plus the Android emulator.
   Libraries already in use: react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, expo-router, expo-speech-recognition (mic), expo-speech (TTS), pnpm.
   Files involved (attached):
   GlobalVoiceAssistant.tsx: the coach conversation sheet (a React Native Modal).
   globalVoiceController.ts: the voice state machine and the only owner of the speech recogniser.
   coachVoiceService.ts / coachVoice: TTS (queueCoachSpeech, speakCoach, coachVoice.speak/stop/isSpeaking/canSpeak).
   agentEngine.ts: produces the replies (streams tokens via onToken).
   CustomTabBar (dock): the orb calls globalVoiceController.open(route).
   Rules for this repo: stage only the files you modified (never git add -A or git add .). Before you finish, pnpm compile, pnpm lint, pnpm test and pnpm test:db must pass. Do not add a native dependency without telling me first, because it needs a new dev build.
1. Problem A: keyboard and chat list are badly handled

What I see: when I tap the text field in the sheet, the keyboard handling is poor. The input is not reliably above the keyboard, the layout jumps, and the conversation area is not a proper chat list.

What the code does today (verify, do not trust me):

The conversation is a plain ScrollView with turns.map(...).
Sheet is Modal + KeyboardAvoidingView with behavior={Platform.OS === 'ios' ? 'padding' : undefined}, so on Android nothing handles the keyboard.
Sheet height is a fixed 78%, footer is a fixed row, bottom safe area is a hard-coded paddingBottom: 20.
Dismiss gesture (Pan) is on the header only.

What I want:

The conversation is a virtualized chat list: an inverted FlatList (newest at the bottom), stable keyExtractor (use the turn id), memoized row component, sensible initialNumToRender and windowSize. A streaming reply updates the last row in place by id; throttle token updates (about one render per animation frame) so streaming stays smooth on the Moto G71.
The composer is pinned directly above the keyboard on Android and iOS, and above the system navigation bar when the keyboard is closed (use safe-area insets only when the keyboard is closed).
When the keyboard opens, the list stays anchored to the latest message and the composer never covers it. Dragging the list dismisses the keyboard (keyboardDismissMode, keyboardShouldPersistTaps="handled"). Sending a message keeps focus for follow-ups.
Empty state (companion, hint text, suggestion chips) must render the right way up in an inverted list (known quirk: ListEmptyComponent renders flipped in inverted lists, so counter-flip it) and must step aside or shrink when the keyboard is open.
Composer: pill input, grows to about 4 lines, one trailing button that is Send when there is text and Mic when there is none. Touch targets at least 48 dp. Accessibility labels on input and button.
The drag-to-dismiss gesture on the sheet header must not fight the list's scrolling.
Keep the conversation cap sensible (currently 30 turns; raise to about 100 if memory allows).

Verified facts from current docs (re-verify against the versions in node_modules before using any API):

With edge-to-edge the Android window does not resize for the keyboard (adjustResize no longer applies). You must handle the keyboard in JS with KeyboardAvoidingView or, better, react-native-keyboard-controller.
React Native's built-in Modal runs in its own native context. For edge-to-edge it needs both statusBarTranslucent and navigationBarTranslucent. Expo's own guidance is to prefer modal screens from expo-router or react-navigation (for example presentation: 'transparentModal') over Modal.
react-native-keyboard-controller has Android Modal support and needs a single KeyboardProvider near the app root (with the translucent flags set). Inside a Modal, its KeyboardAvoidingView may need a manual keyboardVerticalOffset.
Its docs describe a chat pattern: KeyboardChatScrollView plugged into FlatList through renderScrollComponent (pass inverted to both, wrap the render function in useCallback), KeyboardStickyView for the composer, and KeyboardGestureArea plus keyboardDismissMode="interactive" for swipe-to-dismiss. KeyboardChatScrollView was documented under the "next" docs, so check that the installed version actually exports it; if not, fall back to an inverted FlatList + KeyboardStickyView (or KeyboardAvoidingView).

Decision process (do this, report the choice, and why):

Check whether react-native-keyboard-controller is installed, its version, and whether a KeyboardProvider is mounted at the root.
Reproduce the current bug on the Moto G71 and record what happens.
Pick the least risky option that passes the acceptance tests below:
A. Move the sheet from Modal to a route-based transparent modal screen (expo-router) and use keyboard-controller.
B. Keep Modal (both translucent flags) and add keyboard-controller inside it.
C. Render the sheet as an in-tree overlay at the root layout (must sit above the dock, handle the Android back button, and not sit under native-stack modals). Do not mix two keyboard mechanisms at once (that causes doubled padding). 2. Problem B: the "ghost" microphone

What I see: the microphone turns on and off by itself. It happens most clearly each time the sheet opens. It feels like something else is controlling it.

Important: the causes below are hypotheses from reading the code, not confirmed. Your first job is to find out which ones really fire.

Hypotheses to test (each with how to prove it):

H1. Silence restart loop. continuous: false makes Android end the session on silence (no-speech, roughly 5 s). quietRestart() then restarts it up to 6 times. Each native start and stop can chirp and flash the mic indicator (Android's start/stop sounds are an OS behaviour with no supported way to disable them). Test: count native start events during 60 s of silence.
H2. Stale-event race. stopListening() calls stop() and clears isListeningActive immediately, but the native end event arrives later. If a new session was started in between, the late end is read as silence for the new session and restarts it again. The same flag is also what filters out other screens' sessions. Test: log every native event with a timestamp and the session it belongs to.
H3. Typed input re-arms the mic. The sheet's send() calls the same handleFinalUtterance() as speech, which ends with conversation mode calling startListening(). So sending a typed message turns the mic on while the keyboard is up.
H4. Mic hears the coach. queueCoachSpeech is not awaited, state is set to idle while speech is still queued, and the "wait until speech finished" loop uses Speech.isSpeakingAsync(), which can be false before the engine has actually started. Then startListening() runs and calls coachVoice.stop() (cutting the reply), and the recogniser can transcribe the coach's own voice. Test: log TTS start and done events against mic start events.
H5. Ordering on open. The mic starts in open() before the sheet is visible (the sheet only appears after a 150 ms polling interval). The first run also awaits the permission dialog. Test: timestamps from orb press to sheet visible to mic start.
H6. Double open. The orb has both onPress and onLongPress; check whether open() can run twice and start two sessions.
H7. Locale or offline errors. EXTRA_PREFER_OFFLINE: true with a locale that has no recogniser can produce language-not-supported or network errors that look like the mic turning off. Test: log the error codes.
H8. Shared recogniser. Other screens (dictation, voice practice) use the same ExpoSpeechRecognitionModule; confirm none of them start or stop it while the sheet is open.

Process:

Add temporary timestamped logging ([voice] t=…ms) for: every controller state change, every native event (start, result, volumechange, end, error with code), every call to start(), stop(), abort(), and a tag of who called it. Reproduce on the Moto G71 with adb logcat. Paste me the timeline.
From the timeline, say which hypotheses are confirmed and which are not.
Fix only what is confirmed. Remove or gate the logging behind **DEV** afterwards.

Intended behaviour (this is the spec the final code must satisfy):

Exactly one recogniser session at a time. Never call start() while a previous native session has not reported end or error.
Tap the orb: the sheet appears first; the mic starts once, after the sheet has settled. It stops on a final result or after silence, then rests with a clear "tap the microphone" state. No endless restart loop, no flicker between listening and idle.
Typing: focusing the input turns the mic off. A typed message never turns it on afterwards.
A turn that began by voice: after the reply is finished (and spoken, if speaking is on) the mic may listen once more, but only if conversation mode is on, and never while any TTS is still playing.
Closing the sheet (button, scrim tap, back button, drag, auto-navigate) stops the mic, TTS, LLM generation and all timers within about 200 ms, and a stale turn can no longer change state afterwards.
Interrupt by tapping the mic while the coach speaks (current status text says "just talk to interrupt", which is wrong because the mic is off while speaking; fix the text or make it true).
Decide deliberately about continuous: per the library README it is not supported on Android 12 and below, and on newer versions it runs until a final result. If you enable it, show me the tradeoff. 3. Problem C: do not speak by default

I read "don't run on speaker by default" as: replies must not be spoken aloud unless the person turned that on. If I meant audio routing instead, I will tell you.

Default coachVoiceEnabled to false for new installs. Check how the store persists it and that existing users who already chose a value keep it (no destructive migration).
Replies are text only unless "Speak replies" is on. This applies to both streamed and non-streamed replies and to queueCoachSpeech.
Voice input must not force spoken replies. "Hear a preview" stays disabled while speaking is off.
Review conversationMode's default too: with speech off, an automatic "listen again" loop is exactly what feels like a ghost microphone. Recommend a default, and explain it; do not change it silently. 4. Acceptance tests (run on the Moto G71 and report results)

Keyboard and list:

Tap the input: the composer sits directly above the keyboard, with no gap and no overlap; the latest message is visible.
Type, send, repeat 5 times: no jump, focus stays, list stays at the newest message.
Stream a long reply while the keyboard is open: no jank, composer does not move.
Dismiss by dragging the list; by the back button; the sheet closes cleanly with the keyboard open.
Rotate the device and use a large font scale: composer and list still behave.
Same checks on a gesture-navigation device and a 3-button-navigation device.

Microphone: 7. Open the sheet and stay silent for 60 s: native start count is at most 2 (state the exact number you measured), with no repeated chirps and no flicker in the UI. 8. Type and send three messages: zero native start calls. 9. Speak a request: one session, one result, then rest or one controlled re-listen; the mic never turns on during TTS. 10. Close the sheet at any moment (listening, thinking, speaking): the mic indicator goes off and nothing restarts. 11. Open and close the sheet 10 times quickly: no overlapping sessions, no errors in the log.

Speech default: 12. Fresh install: no spoken replies until "Speak replies" is turned on.

5. Deliverable
   A short root-cause report: confirmed and rejected hypotheses, with log excerpts.
   The chosen keyboard approach and why.
   Minimal diffs per concern (list, keyboard and composer; controller; speech default), each tied to evidence.
   The acceptance-test results, and anything you could not test.
   Do not change files unrelated to these three problems.

also handle text flield issues and keyboard avoiding issues throught out whole projects..

this coach should handle every thing mmore better way and bfinish other plans... we have discuess

aand forgot to mentions ANvay comapnions and tab bar made some changeges it's not looking bad... this coach should also query from local sqlite and prepare data... even from daily logs and all..

Mission: Finish every pending Thrivefold plan, repair incomplete features, integrate a genuinely capable offline AI system, and deliver a polished, working Android application.

Work directly in the existing Thrivefold repository. This is an existing product with substantial implementation already completed. Do not create a new application, throw away existing work, replace working features with demos, or introduce unnecessary rewrites.

I want actual engineering, integration, and delivery—not another proposal, audit-only response, prototype, or collection of disconnected screens.

1. First: Recover all existing work and finish the remaining plans

Before changing code:

Inspect the current working tree, branches, recent commits, existing implementation, project instructions, TODOs, issue notes, implementation plans, and unfinished features.

Identify what was already implemented, what was partially implemented, what another AI changed, what was broken, and what remains unfinished.

Review the existing Offline AI upstream integration plan and all relevant Thrivefold completion plans.

Preserve working implementations and recent improvements. Do not overwrite work simply because you would implement it differently.

Build one consolidated execution checklist and work through it until every relevant item is either implemented and verified or documented with a concrete technical blocker.

Do not stop after producing the checklist.

Complete the existing plans and outstanding tasks as part of this assignment. Do not silently drop features, leave placeholder implementations, or mark incomplete features as finished.

Follow the actual checked-in project configuration and AGENTS.md. Use pnpm exclusively. Do not upgrade unrelated dependencies or modify generated native files unnecessarily. Stage only files actually changed; never use git add . or git add -A.

2. Global Voice Assistant — repair and finish Thrive Coach

The GlobalVoiceAssistant is intended to be Thrivefold's central conversational AI coach, not an isolated chat modal.

The previous implementation has become unreliable, especially the microphone lifecycle, keyboard behavior, chat history, speech coordination, and centralization.

Microphone and voice-state correctness

Debug the real speech-recognition lifecycle before rewriting it.

Investigate:

Duplicate recognizer ownership and sessions.

Silence-triggered restart loops.

Late native events and stale session races.

Typed messages unintentionally restarting the microphone.

TTS and speech recognition running simultaneously.

The sheet opening before the microphone is ready.

Double invocation from orb press/long-press.

Unsupported offline locales and speech-recognition errors.

Other screens unexpectedly starting or stopping the shared recognizer.

Implement one authoritative speech-recognition controller.

Requirements:

Exactly one native recognition session at any time.

No overlapping start, stop, or abort operations.

Show the coach sheet before starting recognition.

Start listening only when the user explicitly initiates voice input or enables conversation mode.

Typing or focusing the keyboard must stop listening.

Sending typed messages must never reactivate the microphone.

Never listen while TTS is actually playing.

Voice-originated conversations may re-listen once after the response, only when conversation mode is enabled and all speech has finished.

Closing the sheet must cancel recognition, speech output, generation, subscriptions, and timers. Stale callbacks must not restart anything.

Make interruption work reliably and make the UI status accurately represent whether the microphone is listening, processing, speaking, or idle.

Add temporary timestamped instrumentation for all native recognition events and controller transitions. Identify which suspected causes actually occur. Remove or gate diagnostic logs after debugging.

Speech output defaults

New installations must default to text-only replies.

Preserve existing users' saved speech preferences.

Add a clear Speak Replies setting.

Voice input must not automatically enable speech output.

Do not interrupt a spoken response with recognition.

Use the app's centralized coach speech service for assistant speech output.

Persistent conversation history

Closing the coach must never unexpectedly clear its conversation history.

Persist conversations locally with stable conversation and turn IDs. Restore them after closing, reopening, navigating, and force-stopping the application.

Support:

Previous conversations and history.

Streaming updates to the existing assistant turn.

Sensible history retention, approximately 100 turns per conversation when practical.

Explicit conversation deletion and clear-history actions.

Cancellation of stale or abandoned generation sessions.

The coach should feel like a reliable, continuous assistant—not a temporary modal that forgets everything.

3. Fix the chat list, keyboard, and text-input experience

The current conversation sheet needs a proper production-quality chat layout.

Implement:

An inverted, virtualized FlatList with stable turn IDs.

Memoized message rows.

Smooth streaming updates without rerendering the entire conversation for every token.

Throttled token updates around animation-frame frequency.

A bottom-pinned composer that stays above the Android/iOS keyboard.

Correct safe-area handling when the keyboard is closed.

Proper gesture-navigation and three-button-navigation behavior.

Keyboard dismissal through list gestures and Android back handling.

A multiline composer growing to approximately four lines.

Clear Send and Mic states with accessible touch targets.

A correctly oriented inverted-list empty state.

Reliable focus retention for consecutive messages.

No layout jumping, overlapping content, unnecessary gaps, or covered messages.

Inspect the installed keyboard library and version before choosing an implementation. Check whether KeyboardProvider is already mounted.

Choose the safest architecture: route-based transparent modal, correctly configured native Modal, or a root-level overlay. Do not combine multiple keyboard-avoidance mechanisms and introduce doubled padding.

Project-wide keyboard repair

This is not limited to GlobalVoiceAssistant.

Audit every relevant screen and form for keyboard problems:

Text inputs and multiline text areas.

Login/onboarding/profile forms.

Search screens.

Chat and messaging.

Daily logs and journal forms.

Learn screens.

Bottom sheets, dialogs, and modals.

Settings and editing flows.

Create or reuse a centralized keyboard-management approach. Make sure it works with Android edge-to-edge behavior, safe areas, scrolling, large font scales, and device rotation.

Do not add a new native dependency without identifying the build impact and obtaining the required approval. Do not introduce a dependency just to solve something that the installed stack can already handle.

4. Unified Thrivefold AI engine — genuinely offline and multimodal

Implement the existing Offline AI upstream integration plan inside Thrivefold.

The goal is one local AI ecosystem with multiple specialized capabilities and model runtimes—not separate experimental apps.

Evaluate and integrate the useful capabilities from:

Google AI Edge Gallery.

Google LiteRT-LM.

PocketSage.

llama.cpp.

MediaPipe and compatible on-device ML models.

Other maintained, genuinely useful mobile AI projects when they add a capability not already covered.

Use their useful native implementations and proven architectural patterns. Respect licenses. Do not copy entire independent application shells or merge incompatible dependencies blindly.

Native inference architecture

Create a unified app-facing AI engine abstraction with support for multiple model formats and runtimes.

Keep the existing Llamatik/llama.cpp GGUF implementation working. Add LiteRT-LM as an additional native Kotlin runtime for compatible .litertlm models.

Support:

Model initialization and unloading.

CPU execution and supported GPU/NPU acceleration with safe fallback.

Streaming token generation.

Cancellation and interruption.

Real device capability inspection.

Memory-aware model loading.

Runtime and model diagnostics.

Text and supported multimodal input.

Conversation/session lifecycle management.

A model must only use a runtime that actually supports its format. Do not treat every model as interchangeable.

Do not remove the existing engine until the replacement has passed real build and device tests.

Expose actual model names and download choices

This is important: do not hide model names behind generic labels such as Small Model, Smart AI, or Default Assistant.

Provide a proper Model Library / Model Manager screen.

Expose real model names, including available and compatible models from maintained sources such as Hugging Face and official model repositories.

For each model display:

Actual model name and publisher.

Parameter size and quantization.

Model format and compatible runtime.

Download size.

Minimum recommended RAM and storage.

Supported device profiles.

Supported capabilities: chat, reasoning, coding, summarization, vision, audio, embeddings, tool use, and languages where verified.

License and access requirements.

Download/install status.

Actual measured performance after testing.

Provide model search, filtering, selection, download, cancellation, retry, deletion, import, and switching.

Support compatible model importing from phone storage and supported model repositories. Do not claim every internet-hosted model is Android-compatible.

Research and periodically update the catalog with genuinely useful, current mobile models. Include compact instruction models, multilingual models, reasoning-capable models, embedding models, multimodal models, OCR/vision models, speech-recognition models, and speech-synthesis models.

Offer a sensible default for ordinary phones and optional advanced models for devices with sufficient resources.

Models downloaded successfully must remain saved in app-private phone storage and be reusable for future offline personal work. The user should not need to download the same model again for every conversation.

Do not bundle gigabytes of weights into the APK.

Download and installation reliability

Every model installation must include:

Device and storage preflight.

Real download progress.

Resumable or safely retryable downloads.

Cancellation.

Trusted SHA-256 verification when an official digest is available.

Atomic installation.

Runtime compatibility checks.

A real model-load test.

A short actual inference test.

Persistent installation metadata.

Never invent checksums. Never mark a model ready just because a download completed.

Keep model files, metadata, licenses, versions, and runtime associations organized locally.

Allow users to keep multiple downloaded models and switch between them without corrupting existing model data. Avoid loading multiple memory-heavy models simultaneously when device resources cannot support them.

Device-adaptive behavior

Support ordinary Android phones instead of designing exclusively for flagship hardware.

Build measurable device profiles using available memory, storage, ABI, CPU, supported acceleration, and actual inference performance.

Provide:

A lightweight profile.

A balanced everyday profile.

An advanced multimodal profile.

Use graceful fallbacks. Never crash or silently terminate the application because a model is too large.

5. Local vector database and unified RAG knowledge system

Build a proper persistent local knowledge engine.

Use the existing SQLite architecture and local vector-storage infrastructure wherever practical. Do not introduce duplicate databases unnecessarily.

Centralize:

SQLite persistence.

Local document and media metadata.

Full-text search.

Vector embeddings.

Chunking and indexing.

Retrieval and ranking.

Context construction.

Conversation memory.

Source attribution.

Implement hybrid retrieval using keyword search, metadata filtering, vector similarity, and ranking.

Store embedding model ID, version, dimensions, and source references with vectors. Never compare vectors from incompatible embedding models or dimensions.

The system must support incremental ingestion, deduplication, updates, deletion, re-indexing, and crash-safe background indexing.

Data sources to index locally

Build an extensible content-provider layer covering the data the user authorizes:

Application routes, screens, navigation metadata, feature descriptions, available actions, and app content.

Thrivefold's existing SQLite data and relevant domain records.

Daily logs, journal entries, habits, tasks, goals, check-ins, progress, and activity history.

User profile, preferences, approved memories, and personal knowledge.

Anvay companion information and connected ecosystem content available to the application.

Imported documents, PDFs, text, Markdown, HTML, and supported Office files.

Photos, screenshots, receipts, scanned pages, and diagrams.

Imported voice recordings and supported audio/video content.

Relevant structured application information and user-authorized local content.

Do not indiscriminately copy all device data. Use explicit permissions, content scopes, and privacy controls.

Create a centralized Content Provider API so features use the same indexing and retrieval infrastructure.

Application route knowledge should be generated from actual route definitions and registered feature metadata, not guessed from screen names. Update the local application knowledge index when relevant feature metadata changes.

Document RAG

Implement:

File import.

PDF extraction.

OCR fallback for scanned documents.

Text normalization.

Meaningful chunking with overlap.

Local embeddings.

SQLite-backed vector persistence.

Full-text and semantic retrieval.

Hybrid ranking.

Context assembly.

Source filename and page references.

Grounded answers with citations.

When the answer is not present in the indexed sources, the coach must say so rather than manufacture a document answer.

Personal memory and continuous learning

The assistant should remember useful information over time, subject to user consent and controls.

Support:

Conversation summarization.

Durable memory extraction.

User corrections and feedback.

Memory updates and deletion.

Relevant retrieval during future conversations.

Personalized context based on approved daily logs and application records.

The system should improve its responses through saved preferences, feedback, and retrieval improvements. Do not falsely claim that the model's actual weights have been retrained when they have not.

The local knowledge base must remain useful with the phone in airplane mode.

6. One centralized coach across Thrivefold

The Global Voice Assistant should be the central interaction point for Thrivefold.

Use one assistant orchestration service, one context provider, one conversation store, one speech-recognition controller, and one coach speech service.

Avoid separate, competing AI and speech implementations in individual screens.

Where existing Expo screens currently implement their own coach speech output, migrate them to the centralized coach speech service and shared settings. Preserve legitimate screen-specific behavior.

The central coach should be capable of:

Answering questions about the application.

Searching local documents and personal knowledge.

Querying SQLite and preparing summaries from actual data.

Reviewing daily logs, habits, goals, and progress.

Understanding user preferences and approved memories.

Navigating to registered application routes.

Launching supported application actions.

Explaining progress and suggesting relevant next steps.

Handling imported documents, photos, and supported voice content.

Switching to an explicitly approved online model when requested.

The coach must call actual application services and verify action results. Do not let an LLM invent completed actions, progress, XP, database changes, reminders, health readings, or navigation outcomes.

Multi-provider online AI

Allow optional online providers such as Gemini, Claude, Grok, and other supported providers through a central provider adapter.

The local engine remains the default private/offline path.

For online processing:

Require explicit user consent and configuration.

Display the provider and selected model.

Explain what information will leave the device.

Support provider-specific settings and API keys securely.

Never send the local database or entire vector store automatically.

Send only the relevant context the user approved.

Handle API failures with local fallback where possible.

The local assistant must remain fully usable without an online provider.

7. Finish the Learn tabs and learning experience

The Learn section is unfinished and needs a full implementation review.

Audit every Learn tab, route, detail screen, card, interaction, and learning flow.

Complete the actual user experience:

Working category and topic navigation.

Proper learning lists and detail views.

Real content and structured learning modules.

Functional lessons and progress tracking.

Completion states and continuation.

Search and filtering where appropriate.

Proper empty, loading, error, and offline states.

Persistent user progress.

Integration with the central coach.

Useful context-aware explanations and follow-up questions.

Connect Learn to the local AI knowledge system where relevant. The coach should be able to explain a lesson, summarize learning content, answer follow-up questions, and retrieve relevant learning history.

Do not fill screens with fabricated courses, fake completion percentages, or non-functional buttons. Use actual available content and clearly identify anything that requires genuine content creation.

8. Finish animations and restore the product's visual quality

I have already taken care of the icons and icon assets.

Do not redesign, replace, regenerate, or unnecessarily modify the icons, logos, or branding. Preserve the work already completed.

The problem now is that the application lacks good animations and feels visually static.

Restore a polished, premium, cohesive motion system.

Use the existing Reanimated and Gesture Handler stack.

Prioritize:

Smooth screen and section transitions.

Natural tab navigation and active-state transitions.

High-quality central coach orb animations.

Distinct listening, thinking, processing, streaming, and speaking states.

Subtle card and list entrance animations.

Interactive button feedback.

Smooth sheet and modal transitions.

Skeleton and loading transitions.

Progress and chart animations.

Meaningful gestures and transitions in Learn.

Consistent motion across the application.

Use the existing Thrivefold theme tokens and assets. Do not introduce arbitrary colors, inconsistent design systems, excessive blur, or heavy animations that damage performance.

Animations should be meaningful, responsive, and polished—not decorative effects that slow down the Moto G71.

Support reduced motion and accessibility. Profile performance and avoid dropped frames.

Preserve the recent Anvay companion and bottom-tab/dock improvements. They are already looking better; refine them only where necessary. Do not revert recent work.

9. Performance, privacy, and reliability

Keep the interface responsive during inference and indexing.

Use background jobs for heavy document and media processing.

Do not block the JavaScript UI thread.

Control memory usage and unload models safely.

Preserve local data across reinstall-sensitive flows where the platform allows it; never promise survival of app-data deletion without backup.

Make migrations additive and preserve existing user data.

Provide transparent permissions and privacy settings.

Clearly distinguish local processing from cloud processing.

Ensure model downloads are not mistaken for inference network requirements.

Handle offline mode, interrupted downloads, partial indexing, app restarts, and device memory pressure.

Do not display fake metrics, sample AI answers, mocked search results, or hardcoded performance figures in production.

10. Testing and acceptance criteria

Do not consider the work complete merely because TypeScript compiles.

Run:

pnpm compile

pnpm lint

pnpm test

pnpm test:db

pnpm exec expo-doctor

Android debug and release builds using the project's approved commands.

Test on the physical Motorola Moto G71 5G (Snapdragon 695) where available, as well as the Android emulator.

Voice and keyboard tests

Open and close the coach repeatedly.

Remain silent for 60 seconds and record the exact recognizer start count.

Type and send multiple messages; verify zero microphone restarts.

Speak a request and verify one controlled recognition session.

Confirm there is no microphone activity during TTS.

Close the sheet during listening, thinking, and speaking.

Test rapid open/close cycles without overlapping recognition sessions.

Test keyboard focus, repeated sends, long streaming replies, back-button dismissal, gestures, rotation, and large font scales.

Verify existing conversation history survives modal dismissal and application restart.

Local AI tests

Download and install an actual model.

Verify its integrity.

Load it through its correct native runtime.

Generate a real response.

Switch models.

Restart the application and reload the model.

Disable the network and repeat inference.

Import a PDF, retrieve a relevant passage, and verify page citations.

Test full-text and semantic search independently.

Test indexing interruption, cancellation, deletion, and re-indexing.

Verify the assistant can query actual local logs and structured application data.

Test low-memory fallback behavior.

Confirm multimodal and voice capabilities only when their corresponding real models and runtime paths are available.

Learn and visual tests

Verify every Learn tab and relevant interaction.

Test navigation, content loading, progress persistence, and empty/error states.

Verify the recent dock and Anvay companion improvements remain intact.

Check animations, keyboard layouts, safe areas, and responsiveness on the physical device.

11. Deliverables — finish, don't hand back another plan

Deliver:

Completed implementation of the outstanding Thrivefold plans.

Fixed GlobalVoiceAssistant and reliable centralized voice lifecycle.

Persistent coach history and stable streaming conversations.

Project-wide keyboard and text-input improvements.

Working Learn tabs and learning flows.

Unified offline AI architecture with compatible native runtimes.

Actual model library with visible names and usable download/import options.

Persistent local vector database, hybrid RAG, and content-provider integration.

Centralized coach context, local data retrieval, and application actions.

Optional, consent-based online model providers.

Restored high-quality animations while preserving my completed icons and existing Anvay/dock improvements.

Tests, build output, and an exact implementation report.

For every major concern, show the actual diff and explain the change briefly.

The final report must distinguish:

Implemented and tested.

Implemented but not device-tested.

Blocked by actual technical limitations.

Still incomplete.

Include exact test results, model names and formats, downloaded model sizes, native runtime versions, device memory measurements, and the results of airplane-mode testing.

Never claim a feature works just because a screen exists or a package is installed.

FINAL INSTRUCTION

Take ownership of completing Thrivefold.

Do not stop at planning, auditing, researching repositories, writing documentation, or producing another architecture proposal.

Finish the pending implementation work, integrate the best suitable mobile AI technologies, repair the coach, finish Learn, centralize the data and speech systems, restore the animations, preserve the icons and existing improvements, and validate the actual Android application.

Make sensible technical decisions independently. Preserve working code, resolve root causes, avoid unnecessary rewrites, and keep moving through the checklist until the real deliverables are complete.

I want one cohesive, reliable, beautiful, offline-capable Thrivefold application—not another half-finished collection of features.
