# Thrivefold — End-to-End Verification Matrix

| Area | Requirement | Test Level | Command / Tool | Status | Evidence |
|---|---|---|---|---|---|
| **Build & Typecheck** | Strict TypeScript check | Static Analysis | `pnpm compile` | **PASS** | 0 errors across entire workspace |
| **Lint & Quality** | ESLint compliance (Expo config) | Static Analysis | `pnpm lint` | **PASS** | 0 lint warnings/errors |
| **Unit Test Suite** | 41 test suites, 287 unit tests | Unit / Integration | `pnpm test` | **PASS** | 41 suites passed, 287 tests passed |
| **Database & RLS** | Real Postgres (PGlite) migrations, RLS, reward idempotency | Integration | `pnpm test:db` | **PASS** | 145 checks passed, 0 failed |
| **App Drawer** | Frosted room, avatar, quick cards, clean navigation | UI / Device | `emulator-5554` | **PASS** | Verified live on emulator (`02_app_drawer.png`) |
| **Home Screen** | TodayHero, XP counter, daily check-in, dock Thrive Orb | UI / Device | `emulator-5554` | **PASS** | Verified live on emulator (`01_home_screen.png`) |
| **Pose Tracking** | Instantaneous 60fps tracking without floaty lag | Worklet / Skia | `PoseOverlay.tsx` | **PASS** | `FOLLOW=0.95`, instant snap on >60px movement |
| **Camera Frame Budget** | Face/hand overlays opacity 0 for production release | Rendering | `PoseOverlay.tsx` | **PASS** | Group opacity={0} on layers 7 & 10 |
| **Coach UI Controls** | Skia GlassIconButton on top bar and right rail | Component | `coach/[planId].tsx` | **PASS** | Close, volume, flip, scan, and info glass orbs |
| **Marketing Assets** | Store privacy rule: No camera/coach screens in marketing | Store Asset | `marketing/launch/screenshots/` | **PASS** | 5 clean, non-camera sequential screenshots |
