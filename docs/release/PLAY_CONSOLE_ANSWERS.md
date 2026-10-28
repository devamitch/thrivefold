# Thrivefold — Play Console answers (from the code, 2026-10-28)

Package `com.amit.thrivefold`. Use these when filling the store listing, Data safety, Health apps
and permission declarations. Every line is based on what the release build actually does; if you
change a feature, update this file.

## Store listing

**Short description (75 chars)**

```
Private wellbeing: daily check-ins, camera coach, steps, water and meal log.
```

**Full description** — replace the old text. It claimed "Zero Telemetry" (Firebase crash reports
and optional analytics exist) and "Anvay ID across all apps" (only inside Thrivefold today).

```
Thrivefold is a calm, private companion for everyday wellbeing: check in in a minute, move with a camera coach that counts your reps on your phone, log water and meals, and see how your days add up, without ads or social feeds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☀️ TODAY AT A GLANCE
• A one-minute check-in for energy, mood, stress and sleep
• Daily quests picked for your goals, with points, levels and a roadmap
• One clear next step on your home screen

🤸 CAMERA COACH, ON YOUR PHONE
• Guided home workouts with tutorial videos
• The camera counts reps and checks form on the device; frames are never saved or uploaded
• Hands-free gestures, voice cues, rest timers and set tracking
• Nothing starts until you tap Start

👣 STEPS, WATER AND ACTIVITY
• Daily steps from your phone's own step counter (with your permission)
• Water tracking with quick add, undo and history
• Week and month charts from your real records only

🍽️ MEAL LOG
• Scan your plate with the camera or pick a photo
• On-device food hints, plus an optional AI estimate of foods and macros when you ask for it
• Typical values from food tables; AI estimates are clearly marked and you review every item

🌸 CYCLE AND HEALTH (women's experience)
• Cycle tracking with estimated phases and next period, shown as estimates
• Symptoms, sleep, mood, medications and a private journal

⌚ CONNECTED SOURCES (optional)
• Health Connect: steps, sleep, heart rate, weight, workouts, and device vitals such as SpO₂, blood pressure or glucose when a watch, cuff or meter provides them
• Thrivefold never estimates vitals from the camera or phone sensors

🛡️ ANVAYKOSH
• Optional Anvay ID (Google sign-in) and Anvay Vault: a small profile only you can read (name, photo, language, time zone). Health data is never part of it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 YOUR PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Works without an account; your records stay on your phone, encrypted
• No ads and no ad tracking
• Usage analytics are off unless you turn them on; crash reports help fix bugs and can be turned off in Privacy settings
• A meal photo leaves your phone only when you ask for an AI estimate, and is not stored
• Export or erase your data at any time

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ HEALTH DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thrivefold supports general wellbeing and healthy habits. It is not a medical device and does not diagnose, treat, cure or prevent any condition. Cycle predictions, calorie and macro values and AI estimates are approximate. Talk to a qualified clinician before starting a new exercise programme or if you have health concerns.
```

The repo's `fastlane/metadata/.../full_description.txt` still has the old text (that folder is
write-protected for agents); copy the block above into it before running fastlane.

## App content

| Question | Answer |
| --- | --- |
| Privacy policy URL | **Needed.** No public URL exists in the repo. Publish the in-app policy (`src/app/(app)/you/privacy.tsx` content) on a web page you own and paste its URL. |
| Ads | **No ads.** |
| App access | All features work without an account (Explore as guest). Optional Google sign-in. No credentials needed for review. |
| Target audience | 18+ (age gate in onboarding). Not designed for children. |
| Content rating | Health & fitness; no violence, gambling or user-generated public content. Answer "no" to sharing location and to user-to-user communication (letters/communities are gated off). |
| Health apps declaration | General wellness / fitness, **not a medical device**. Features: activity and fitness, nutrition, sleep, menstrual/cycle tracking, health metrics from Health Connect. |
| Government app / financial / news | No. |

## Data safety

Data is encrypted in transit (HTTPS) and at rest on the device (MMKV with a Keystore key).
Users can request deletion: in-app **You → Account → Erase**, which also calls the
`delete-account` server function for signed-in users.

| Data type (Play category) | Collected? | Shared? | Optional? | Purpose | Notes |
| --- | --- | --- | --- | --- | --- |
| Name, email address | Yes, if the person signs in with Google | No | Yes | Account management | Supabase auth (processor). |
| Health info (cycle, symptoms, check-ins, medications, journal) | **No** (stays on device) | No | — | — | Never uploaded. |
| Fitness info (steps, workouts, heart rate, sleep, vitals from Health Connect) | **No** (stays on device) | No | — | — | Read from the phone sensor / Health Connect and kept on device. |
| Photos | Yes, only when the person taps "Find foods and macros with AI" | No | Yes | App functionality | Sent once to Thrivefold's server, forwarded to Google Gemini (or OpenRouter as backup) as processors; not stored. Declare "processed ephemerally". |
| Other user-generated content (Anvay Vault: display name, photo URL, language, time zone) | Yes, if the person syncs the vault | No | Yes | App functionality | Owner-only row in Supabase. |
| Crash logs, diagnostics | Yes | No | Yes (toggle in Privacy) | Analytics / app stability | Firebase Crashlytics (processor). |
| App interactions (screen views) | Yes, only if the person turns on usage analytics | No | Yes (off by default) | Analytics | Firebase Analytics; ad storage and ad ID disabled. |
| Location, contacts, messages, audio, files, web history, financial info | No | No | — | — | Location permission exists only for Bluetooth scanning on Android ≤ 11 (`maxSdkVersion=30`); no location is read. |
| Device or other IDs | No | No | — | — | Advertising ID and ad-services permissions are blocked in `app.json`. |

Under Play's definitions, sending data to a service provider that processes it on your behalf is
**not sharing**.

## Permissions to justify

| Permission | Why |
| --- | --- |
| `CAMERA` | Camera coach (on-device pose) and meal photos. |
| `ACTIVITY_RECOGNITION` | Read the phone's step counter for daily steps, after the person allows it. |
| `RECEIVE_BOOT_COMPLETED` | Keep the 15-minute step sampling job after a restart. |
| `POST_NOTIFICATIONS` | Reminders the person turns on. |
| `BLUETOOTH*`, `ACCESS_*_LOCATION` (≤ Android 11) | Optional Bluetooth heart-rate strap. |
| `USE_BIOMETRIC` | Optional app lock. |
| Health Connect `READ_*` (steps, sleep, heart rate, HRV, resting HR, SpO₂, respiratory rate, blood pressure, blood glucose, weight, exercise) and `WRITE_EXERCISE` | Show the person's own data from devices that write to Health Connect; save finished workouts. Each type is requested separately and is optional. Fill the **Health Connect declaration** with these exact types and this purpose. |

`RECORD_AUDIO`, `ACCESS_ADSERVICES_AD_ID` and `ACCESS_ADSERVICES_ATTRIBUTION` were removed from the
build (no feature uses them).

## Release

- Current build: `versionName 1.0.2`, `versionCode 3`. The upload must have a higher
  `versionCode` than the last one in Play Console (check *Internal testing*).
- Release AAB: `cd android && ./gradlew bundleRelease`.
