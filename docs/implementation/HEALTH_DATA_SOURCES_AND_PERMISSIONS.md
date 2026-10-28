# Health data sources and permissions

What Thrivefold actually measures or imports, where it comes from, and what it never claims.
Every value is stored once in the readings store (`deviceReadings`, key `source:kind:date`) or
its own slice, labelled with its source on screen.

| Signal | Source | Provenance shown | Permission | Status |
| --- | --- | --- | --- | --- |
| Steps | Phone hardware step counter (`modules/step-counter`, Android `TYPE_STEP_COUNTER`) | "Phone", "since HH:MM" on the first day, "partly estimated" when a long sampling gap was split across midnight | `ACTIVITY_RECOGNITION` (asked in context from the Steps tile) | Implemented; build-verified; device run blocked (see below) |
| Steps | Health Connect `Steps` | "Health Connect" | `health.READ_STEPS` | Implemented earlier |
| Steps, same day from both | Larger total wins, never added (`stepsByDate`) | Source of the winning value | — | Implemented, unit-tested |
| Sleep | Health Connect `SleepSession`; else check-in hours | "Health Connect" / "your check-in"; never "last night" if older than yesterday | `health.READ_SLEEP` | Implemented |
| Heart rate (day avg, min, max) | Health Connect `HeartRate`; BLE heart-rate strap | "Health Connect" / strap | `health.READ_HEART_RATE`, Bluetooth | Implemented earlier |
| SpO₂, resting HR, HRV (RMSSD), breathing rate, blood pressure, blood glucose | Health Connect only (from a watch, ring, oximeter, cuff, meter or CGM app) | "From your devices · Health Connect"; latest per day with min/max | `health.READ_OXYGEN_SATURATION`, `READ_RESTING_HEART_RATE`, `READ_HEART_RATE_VARIABILITY`, `READ_RESPIRATORY_RATE`, `READ_BLOOD_PRESSURE`, `READ_BLOOD_GLUCOSE` (opt-in per type) | Implemented; no device with these records available to test |
| Water | Manual entries, journaled (`waterLogs`) | Entries with time; undo | — | Implemented, device-verified |
| Movement minutes | Manual activity logs + finished workouts | "Logged today" | — | Implemented |
| Workouts / reps | Camera pose coach (existing) | "camera" / "manual" verification | Camera | Existing |

## Phone step counter

- Steps are counted by the phone's sensor hub, not the app. The app samples the counter on open,
  live while Home is visible (throttled to one store update per 2.5 s), and every ~15 minutes via
  `JobScheduler` (the OS minimum; Doze can stretch it). No new library; persisted across reboot.
- Reboot resets the hardware counter; the ledger detects this (`BOOT_COUNT`, or counter going
  down) and counts the new value as the delta. Deltas above 100 000 are rejected as sensor faults.
- Nothing before the first sample is claimed: day one starts at zero "since" that time.
- Battery: one short sensor registration per job run; no GPS, no wake locks, no foreground service.
- Off switch: `disablePhoneSteps()` cancels the job and erases the device ledger and imported readings.
- iOS: not implemented (Core Motion would need a Swift module); the tile shows "Not connected".

## Not supported, on purpose

- A phone alone cannot measure SpO₂, blood pressure, glucose, HRV or breathing rate reliably.
  Thrivefold never estimates them from the camera, microphone or motion sensors.
- No sleep stages from phone motion.
- GPS routes, pace and elevation are not implemented in this release: they need background
  location, a foreground service and a separate consent and battery review.
