# Thrivefold beta — feature traceability (Camera Lab matrix, 40 areas)

Status: **PASS** = real implementation, unit-tested, release build OK · **PASS (device)** = also seen on the owner's phone · **PARTIAL** = real but part missing · **BLOCKED** = needs a model/key/approval · **RESEARCH-ONLY** / **UNSUPPORTED** = deliberately not offered.
Native pipeline: `modules/pose-landmarker` (also `AudioSenseModule` and `MediaPipeToolsModule`: audio classifier, object detector, interactive segmenter, image/text embedders, language detector, text classifier) (CameraX → MediaPipe Tasks 0.10.35, live: pose_landmarker_lite, face_landmarker, gesture_recognizer; one-shot: face mesh + pose + selfie_multiclass segmenter via `PortraitVisionModule`). All Apache-2.0 Google models, bundled in `android/src/main/assets`. Last updated 2026-10-29.

| # | Feature | Status | Where | Evidence / reason |
|---|---|---|---|---|
| 1 | Visual-acuity exercise | PARTIAL | `features/beta-lab/components/VisualAcuityChart.tsx` | Focus game only; not calibrated to screen size, labelled "not an eye test". |
| 2 | Cataract detection | UNSUPPORTED | — | Needs slit-lamp optics and clinical validation. |
| 3 | Facial geometry / asymmetry | PARTIAL | `domain/vision/portrait.ts` (`analyseFace`) | Face shape ratios from the 478-point mesh; asymmetry not scored (no validated use). |
| 4 | Eyewear advice + PD | PASS | `beta-lab/body-style.tsx`, `portrait.ts` | Frame suggestions per shape; PD from iris diameter 11.7 mm, ±3 mm, "ask an optician". 7 tests. |
| 5 | Facial-style preferences | UNSUPPORTED (by design) | — | No beauty or attractiveness score. Outfit colour pairing is offered instead (#6). |
| 6 | Jawline / colour palette | PARTIAL | `portrait.ts` (`analyseColours`) | Outfit colour pairing from segmentation; no skin-tone or jawline scoring. |
| 7 | Teeth alignment | RESEARCH-ONLY | — | Needs a tooth segmentation model and dental validation. |
| 8 | Body structure | PASS | `portrait.ts` (`analyseBody`) | Shoulder/waist/hip outline ratios from segmentation + pose; framed as clothing fit. |
| 9 | Height/weight/age from photo | UNSUPPORTED | `you/profile.tsx` | Asked from the person instead; never estimated from one image. |
| 10 | Posture feedback | PASS | `portrait.ts` (`analysePosture`) | Shoulder/hip tilt and head offset from a front photo, scored. |
| 11 | Voice / pitch training | PASS | `beta-lab/voice-practice.tsx`, `domain/voice/practice.ts`, `services/voice/useLoudness.ts` | Native `AudioSenseModule.kt` (AudioRecord 16 kHz) → YIN pitch + dBFS every 50 ms; Hold, Steady and Hold-a-note (note name, ±cents) drills, offline. 5 tests. |
| 12 | Meditation / breathing | PASS | `beta-lab/breathing.tsx`, `domain/wellbeing/breathing.ts` | Timed phases with spoken cues; completes the guided-exercise quest. |
| 13 | Motor / tremor | RESEARCH-ONLY | — | Needs clinical validation. |
| 14 | Handwriting / grip | PARTIAL | `HandGestureStudio.tsx`, `domain/vision/handTracker.ts` | Grip open/close reps full screen; handwriting needs pen-tip tracking. |
| 15 | Exercise ID + rep counting | PASS | `health/pose-check.tsx`, `domain/pose/*` | Existing camera rep counter (pose landmarker), linked from beta tiles. |
| 16 | Reading distance, gaze, 20-20-20 | PASS | `EyeTrackingStudio.tsx` (full-screen live monitor), `domain/vision/eyeTracker.ts` | Distance from iris, blinks/min, comfort alerts spoken. |
| 17 | Touchless UI | RESEARCH-ONLY | — | Gesture recognizer is in place; pointer control not built. |
| 18 | Sign language | BLOCKED | — | Needs a trained temporal model. |
| 19 | Lip reading | BLOCKED | — | Needs a trained visual-speech model. |
| 20 | AR try-on / cosmetics | BLOCKED | — | Needs a hair/face segmentation + rendering pipeline. |
| 21 | Eyewear/jewellery placement | BLOCKED | — | Needs 3D assets and a validated face coordinate frame. |
| 22 | Interactive cutout | PASS | `assist/photo-cutout.tsx`, `MediaPipeToolsModule.kt` (MagicTouch) | Tap an object → transparent PNG; use as profile picture or share. |
| 23 | Sports kinematics | RESEARCH-ONLY | — | Needs sport-specific validation. |
| 24 | Exercise-form visualisation | PASS | `health/pose-check.tsx` | Skeleton overlay with form cues. |
| 25 | Driver monitoring | UNSUPPORTED | — | Excluded for safety. |
| 26 | Biometric liveness | UNSUPPORTED | — | Landmarks are not authentication. |
| 27 | Environmental audio events | PASS | `assist/sound-alerts.tsx`, `AudioSenseModule.kt` (YAMNet), `domain/assist/sounds.ts` | Alarms, sirens, baby crying, doorbell, knocking, dog, glass, horn: big text + vibration. 2 tests. |
| 28 | Cough / audio events | PARTIAL | `sound-alerts.tsx` | Coughing is named as a sound; no counting or health inference (not validated). |
| 29 | On-device assistant | PARTIAL | `beta-lab/assistant.tsx`, `domain/assistant/commands.ts`, `modules/local-ai` | Typed and spoken commands work offline (13 tests); open questions need a downloaded llama.cpp model. |
| 30 | Instrument tutor | RESEARCH-ONLY | — | — |
| 31 | Lifting ergonomics | RESEARCH-ONLY | — | NIOSH inputs not available from pose. |
| 32 | Sleep audio | UNSUPPORTED | — | No snoring/apnea/bruxism claims. |
| 33 | Speech / articulation | PARTIAL | `voice-practice.tsx` ("Say it clearly") | Word match + words/min via Android speech recogniser (offline when the language pack is installed). No playback yet. |
| 34 | Movement coaching | PASS | `beta-lab/face-exercises.tsx`, `gesture-game.tsx`, `health/pose-check.tsx` | Coached, counted, saved, XP. |
| 35 | Respiratory visualisation | RESEARCH-ONLY | — | Breathing coach shows a paced guide, not measured motion. |
| 36 | Object detection | PASS | `assist/look-around.tsx`, `MediaPipeToolsModule.kt` (EfficientDet-Lite0, COCO) | Photo → boxes + spoken sentence with left/middle/right. |
| 37 | Image / text embeddings | PASS | `MediaPipeToolsModule.kt` (MobileNet-V3 image embedder, USE text embedder), `services/journal/semanticSearch.ts` | Journal "search by meaning" on the phone; image embedder exposed for similarity. |
| 38 | Offline OCR / text tools | PARTIAL | `health/documents.tsx`, `supabase/functions/doc-reader` | Prescriptions/charts are read by a server vision model with consent; on-device OCR (ML Kit) not integrated yet. |
| 39 | Gesture recognition | PASS | `gesture-game.tsx` (Gesture match), `PoseCameraView.kt` | Canned gestures from `gesture_recognizer.task`. |
| 40 | Accessibility tools | PASS | `assist/*` (What's around me, Sound alerts, Photo cutout), spoken Thrive Coach | Live-region announcements; voice commands open every helper. |

**Eye games ported from BlinkQuest** (`beta-lab/eye-games.tsx`, `domain/vision/gaze.ts`, 5 tests): Gaze Pop, Direction Trail, Slider Chase, Orbit Follow with BlinkQuest's 5-point calibration, eyeLook* blendshapes (now emitted natively with head yaw/pitch), head-turn rejection and dwell rules.

Also new in Thrivefold beta (beyond the matrix): **Eye game** (`beta-lab/eye-games.tsx`, `domain/vision/eyeGame.ts`, 4 tests — ball left/right with gaze verified against calibration, blink rounds, "Complete!"), **Eye pursuit** (`eye-pursuit.tsx`), **Face & eye exercises** (6 tests), **Hand games** (finger count + gesture match), **Focus self-check** (WHO ASRS-6), **Beta tasks today + beta insights** on Home (`components/beta/BetaTodayCard.tsx`, `domain/beta/betaTasks.ts`, 3 tests), **practice XP** (`claimPracticeReward`, 8 a day).

Device verification so far: Google sign-in with birthday from Google, profile restore, Home and Beta Lab render (PASS (device)). Camera and microphone journeys built after the last unlock are not yet seen on the device.
