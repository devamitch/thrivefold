# Thrivefold — consolidated requirements and status (2026-10-30)

One list of everything asked for across the sessions, so nothing is lost. Status words:
DONE (seen on the phone), BUILT (in the build, not yet seen on the phone), TODO, NOT POSSIBLE (why).

## Anvay — the AI companion
| Requirement | Status |
| --- | --- |
| Character drawn from the AnvayKosh mark (shackle head, arch body, leaf arm), no moustache, no blush, named Anvay | DONE |
| No white disc behind the avatar | DONE |
| Moods: listening (halo), thinking (looks up), speaking (mouth) | BUILT |
| Exact copy of Loki's "Miss Minutes" | NOT POSSIBLE — Marvel's character; Anvay is original |
| Tap orb = talk; hold = check-in | DONE |
| Streaming: speak the first sentence while the rest is written | BUILT |
| Stop listening ~0.9 s after you stop talking | BUILT |
| Instant replies to hi / thanks / bye / who are you | DONE |
| Steady microphone (no idle flicker between rounds, permission asked once) | BUILT |
| "Bye" / "stop" closes the conversation | BUILT |
| Calm Indian male voice (the earlier one) | BUILT |
| Voice settings: speak or text only, Indian male / female (chosen, never inferred), speed, preview, conversation mode | BUILT |
| Real bottom sheet: drag down to dismiss, springs back | BUILT |
| Commands: open screens, log water, numbers, export, remember, several in one go | BUILT (parsing tested) |
| Online AI for macros/plans with consent, answers saved locally | BUILT |
| Heart-rate questions answered from connected readings (Health Connect / strap), with date and source | BUILT |
| Knows every screen, every Learn article and your last week (check-ins, water, meals, steps, journal, medicines, quests) from local data; refreshed on start and on return | BUILT (unit-tested; not yet asked on the phone) |
| One voice for every screen (coach, Learn, therapy, companion, workouts) through `coachVoiceService` | BUILT |
| One coach for the whole app: `CoachProvider` in the root layout (sheet, voice, knowledge, reminders); old beta Thrive Coach opens it | DONE |
| Thrive RAG (`services/local-ai/rag/thriveRag.ts`) on react-native-rag contracts over llama.cpp + SQLite; indexes screens, Learn, profile, meals, workouts, vitals, journal, calendar, care, cycle, memories, chat (no sign-in data) | BUILT (unit-tested; table and guides seen on the phone) |
| Chat shows records as tables (medicines, follow-ups, quests, meals, week, screens), guides jobs (prescription scan, meal photo, rep counter), confirms sign-out / deletes in the app alert | DONE (medicines, screens, sign-out, prescription seen on the phone) |
| Roles: Coach, Health guide, Speech practice, Nutrition, Friend, Reader | DONE |
| Hard questions (numbers, medicines, trips, plans) to the online coach with consent; answers saved locally for next time and offline | BUILT |
| Every coach turn kept on the phone (SQLite `ai_interactions`, never uploaded) | BUILT |
| Talks on its own, constant background monitoring | TODO |

## On-device models
| Requirement | Status |
| --- | --- |
| Light model downloads quietly on first open, verified and test-answered | DONE (Qwen 0.5B, 469 MB) |
| Gemma 3 1B in Settings | BUILT, not yet downloaded on the phone |
| Pause / resume, resume after reopening | BUILT |
| Keep downloading after the app is closed | BUILT (Android DownloadManager; picked up again on app open; SHA-256 checked before install) |
| Keep models after uninstall; share across AnvayKosh apps | TODO (only small models via brand/thrive/modelStore.ts) |
| Train models on the phone | NOT POSSIBLE — retrieval over saved knowledge instead |

## Screens
| Requirement | Status |
| --- | --- |
| Solid, square headers everywhere (no see-through, no rounding) | BUILT |
| Background art as a soft wash, never behind titles | BUILT |
| Profile tab grouped like Meta settings | DONE |
| Edit profile in five steps | BUILT |
| Eye check full screen (BlinkQuest style), Close works, no crash | DONE |
| Eye outlines on the real eyes | BUILT (fixed the offset; not re-checked facing the camera) |
| Blink count accuracy (read 54/min) | BUILT (rate only after 20 s observed; per-person adaptive thresholds; 40 ms / 150 ms debounce) |
| No sparkle icons | DONE |
| Learn: image per item (men / women versions), Listen intro | DONE (existing) |
| Learn: full-screen image viewer growing from the picture, pinch / double-tap zoom, swipe to close | BUILT |
| Learn: articles from an external API | TODO (needs a chosen source with usage rights) |
| Beta hero redesign; smoother dashboard animations | TODO |

## Account and data
| Requirement | Status |
| --- | --- |
| Points, level, streaks saved to Supabase and restored | DONE |
| Profile saved and restored | DONE |
| Backup to a file and restore | BUILT |
| Provider keys out of the app bundle | BUILT (old builds still contain them: rotate the 13 keys) |
| Full AnvayKosh ID across all apps | PLANNED (docs/ANVAY_ID_PLAN.md; approved; needs App Link domain and signing SHA-256s) |

## Validation (2026-10-30)
pnpm compile PASS · pnpm lint PASS · pnpm test 520/520 PASS · pnpm test:db 175/175 PASS ·
expo-doctor 19/20 (expo 55.0.31 vs 55.0.32 patch; not upgraded per AGENTS.md rule 1) ·
release APK `android/app/build/outputs/apk/release/app-release.apk` built and installed on ZD2225KYKD.
