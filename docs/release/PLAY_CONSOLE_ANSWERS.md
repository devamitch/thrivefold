# Thrivefold — Play Console draft (review before submission)

Package `com.amit.thrivefold`. This is a working draft, not a verified Play declaration. Recheck
the release artifact, enabled SDK behavior, server retention, and every active Play version before
submission. Update this file when implementation changes.

## Store listing

**Listing source**

The submitted metadata lives in `fastlane/metadata/android/en-US/`. Keep the full description there
as the single source; review every claim against the release artifact before upload.

## App content

| Question | Answer |
| --- | --- |
| Privacy policy URL | **Needed.** No public URL exists in the repo. Publish the in-app policy (`src/app/(app)/you/privacy.tsx` content) on a web page you own and paste its URL. |
| Ads | **No ads.** |
| App access | All features work without an account (Explore as guest). Optional Google sign-in. Guest access is available; verify review access against the current release. |
| Target audience | 18+ (age gate in onboarding). Not designed for children. |
| Content rating | Health & fitness; no violence, gambling or user-generated public content. Answer "no" to sharing location and to user-to-user communication (letters/communities are gated off). |
| Health apps declaration | General wellness / fitness, **not a medical device**. Features: activity and fitness, nutrition, sleep, menstrual/cycle tracking, health metrics from Health Connect. |
| Government app / financial / news | No. |

## Data safety — NOT READY FOR SUBMISSION

This section records implementation flows to investigate; it is not a set of final Play answers.
Profile sync can include sensitive profile fields (including allergies, diet, height and weight),
and optional weekly summaries can include health and activity measures. Optional cloud AI requests
send recent conversation context, and food estimates can send a selected photo. Review exact
payloads, SDK behavior, processors and retention before completing Play's current form. Device
storage uses MMKV with a secure-storage key when available and has a fallback; do not claim
universal hardware-backed encryption. Account deletion and local erase have separate effects.

| Data flow to investigate | Known implementation behavior | Play declaration work |
| --- | --- | --- |
| Google sign-in and account data | Sign-in can create an account; Supabase stores account identity. | Confirm exact identity fields and classify collection, purpose, optionality and deletion. |
| Profile and progress | Selected profile fields and reward/progress details can sync to Supabase. | Include applicable personal and sensitive categories; verify exact schema and payload. |
| Health and fitness records | Most records are local; optional weekly-summary sharing and profile sync exist. | Audit outbound payloads and classify any health/fitness data sent. |
| Photos and AI prompts | User-requested meal estimates can send a photo; cloud AI consent can send recent chat context. | Confirm routes, processors, retention and applicable photo, message and health categories. |
| Diagnostics and app interactions | Crash reporting and usage analytics have separate settings and default off; Firebase SDKs are included. | Inspect release SDK initialization and transmitted fields, including identifiers. |
| Other categories | Android location permission is limited to older OS versions for BLE scanning; ad identifiers are disabled in app config. | Verify manifest and runtime behavior in the release artifact. |

Do not copy categorical "No" answers into Play Console without completing this review.

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

- Repository build config: `versionName 1.0.8`, `versionCode 14`. Confirm the Play Console track
  has a lower code before upload.
- Release AAB: `cd android && ./gradlew bundleRelease`.
