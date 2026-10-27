# Thrivefold — Google Play Policy & Verification Checklist

- **App Package**: `com.amit.thrivefold`
- **Target Platform**: Android 12+ (API 31–36)
- **Play Console Track**: `Internal Testing`

## 1. Metadata Policy Compliance
- [x] Title is <= 30 characters (27 characters).
- [x] Short description is <= 80 characters (77 characters).
- [x] Full description is <= 4000 characters (2485 characters).
- [x] Zero ranking claims ("best", "#1", "top"), price terms, or keyword stuffing.
- [x] Accurate feature representation substantiated by current code.

## 2. Graphic Asset Standards
- [x] Play Icon: Exactly 512 × 512 px, 32-bit PNG with alpha, under 1 MB.
- [x] Feature Graphic: Exactly 1024 × 500 px, 24-bit PNG without alpha, under 15 MB.
- [x] Phone Screenshots: 6 distinct authentic captures formatted at 1080 × 1920 portrait (9:16 aspect ratio).
- [x] Aspect ratio between 1:2 and 2:1 rigorously verified.

## 3. Data Safety & Privacy Declarations
- [x] Zero Telemetry: No third-party ad tracking, commercial location harvesting, or covert fingerprinting.
- [x] Local Enclave Storage: Data stored locally on device using hardware Keystore / SecureStore.
- [x] Account Deletion: In-app data purge and clear account removal pathways provided.
- [x] Sensitive Data Boundary: Health/family/cycle/vision data strictly isolated across apps by default.

## 4. Google Play Health Apps Declaration
- [x] Compliant with Google Play Health Apps Policy (January 2024 / current update).
- [x] Declared as Observational / General Wellbeing, NOT Medical Device.
- [x] Explicit prominent health & fitness disclaimer included in full description.
