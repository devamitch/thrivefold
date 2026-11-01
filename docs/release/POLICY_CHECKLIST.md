# Thrivefold — Google Play Policy & Verification Checklist

- **App Package**: `com.amit.thrivefold`
- **Target Platform**: Android 12+ (API 31–36)
- **Play Console Track**: `Internal Testing`

## 1. Metadata Policy Compliance
- [x] Title is <= 30 characters (27 characters).
- [x] Short description is <= 80 characters (63 characters).
- [x] Full description is <= 4000 characters (1675 characters).
- [x] Zero ranking claims ("best", "#1", "top"), price terms, or keyword stuffing.
- [ ] Recheck all listing claims against the release build before submission.

## 2. Graphic Asset Standards
- [x] Play Icon: Exactly 512 × 512 px, 32-bit PNG with alpha, under 1 MB.
- [x] Feature Graphic: Exactly 1024 × 500 px, 24-bit PNG without alpha, under 15 MB.
- [x] Phone Screenshots: 6 distinct authentic captures formatted at 1080 × 1920 portrait (9:16 aspect ratio).
- [x] Aspect ratio between 1:2 and 2:1 rigorously verified.

## 3. Data Safety & Privacy Declarations
- [ ] Review Data safety categories against profile sync, weekly-summary sharing, cloud AI and Firebase SDK behavior.
- [ ] Verify storage encryption behavior, account deletion and local erase in the release build.
- [ ] Confirm optional telemetry defaults and actual transmitted fields in the release build.
- [ ] Confirm the current privacy policy is published at the declared public URL.

## 4. Google Play Health Apps Declaration
- [ ] Review current Play Health Apps requirements before submission.
- [ ] Complete the Health Apps declaration from the shipped feature set.
- [ ] Confirm the disclaimer in the submitted listing.
