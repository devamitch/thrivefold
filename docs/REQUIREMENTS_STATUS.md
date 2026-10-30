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
| Talks on its own, constant monitoring, heart rate from watch | TODO (Health Connect hook exists in brand/thrive/heart.ts, not wired) |

## On-device models
| Requirement | Status |
| --- | --- |
| Light model downloads quietly on first open, verified and test-answered | DONE (Qwen 0.5B, 469 MB) |
| Gemma 3 1B in Settings | BUILT, not yet downloaded on the phone |
| Pause / resume, resume after reopening | BUILT |
| Keep downloading after the app is closed | TODO (needs Android DownloadManager) |
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
| Learn tab: images per item (men / women), articles from an API, voice intro, shared-element image viewer | TODO |
| Beta hero redesign; smoother dashboard animations | TODO |

## Account and data
| Requirement | Status |
| --- | --- |
| Points, level, streaks saved to Supabase and restored | DONE |
| Profile saved and restored | DONE |
| Backup to a file and restore | BUILT |
| Provider keys out of the app bundle | BUILT (old builds still contain them: rotate the 13 keys) |
| Full AnvayKosh ID across all apps | TODO (needs Neev / HarmonyBloom changes; owner approval) |
