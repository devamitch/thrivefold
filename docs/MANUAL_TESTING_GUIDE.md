# Thrivefold — Manual Testing & Prompt Verification Guide

This guide contains the exact prompts, test commands, and deep links to manually test and evaluate the Coach, AI, Cycle, and Social features.

---

## 1. AI Cascade & Smart Recommendations

### Files:
- `src/services/ai/env.ts` (Typed API keys, statically inlined for Expo)
- `src/services/ai/providers.ts` (Cascade: Gemini -> Groq -> OpenRouter)
- `src/services/ai/smartRecommendations.ts` (Daily greeting, exercise suggestions)

### Prompts Tested:
```typescript
// 1. Daily Greeting Prompt
`Greet the user warmly for today. Their mood is 8/10. Energy is 7/10. They have a 4-day check-in streak. One or two sentences. No medical advice.`

// 2. Exercise Suggestion Prompt
`Suggest ONE exercise for today in 2-3 sentences. Energy: 6/10. Mood: 7/10. Pick from: yoga, bodyweight, walking, stretching, kalaripayattu, martial arts, breathing. Never suggest anything painful.`
```

---

## 2. Smart Coach & Computer Vision Pose Tracker

### Files:
- `src/components/workout/PoseOverlay.tsx` (Skia real-time skeleton overlay, One Euro filter, 60fps tracking)
- `src/components/coach/useCoachSession.ts` (Session orchestrator hook)
- `src/components/coach/usePoseTracking.ts` (Landmarks, rep counting, camera frame ingestion)
- `src/domain/pose/movement.ts` (MediaPipe joint angles, hysteresis rep counter)
- `src/domain/pose/coachVoice.ts` (Virtual coach speech generation)

### How to Test on Device via Deep Links:
```bash
# 1. Open Surya Namaskar (Sun Salutation)
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///health/coach/yoga_flow" com.amit.thrivefold

# 2. Open Kalaripayattu Foundations
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///health/coach/kalaripayattu_foundations" com.amit.thrivefold

# 3. Open Hindu Dand-Baithak Circuit
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///health/coach/hindu_strength" com.amit.thrivefold

# 4. Open Martial Arts HIIT
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///health/coach/martial_arts_hiit" com.amit.thrivefold
```

### Visual Verification Points:
1. **Fullscreen & Hidden Status Bar**: Screen occupies the full physical display without system status bar obstruction.
2. **Snappy Skeleton**: 3.5px cyber-kinetic core with subtle 7px neon ambient bloom tracking your body in real time (zero 50ms rubber-band delay).
3. **Animated PiP Toggle**: Tap the camera or video thumbnail to smoothly swap between camera-main and video-main modes.
4. **First-Time Video**: Tutorial auto-plays on the first attempt and minimizes on repeat visits.

---

## 3. Menstrual Cycle Logging (No End Date)

### Files:
- `src/components/ui/PeriodLoggerModal.tsx`
- `src/stores/slices/healthSlice.ts`
- `src/domain/health/cycleEngine.ts`

### How to Test on Device:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///health/cycle" com.amit.thrivefold
```
- Tap "Log Period"
- Verify: **No artificial end date is requested**. You only select Start Date, Flow Intensity, Mood (1–10), and Energy (1–10).
- Tap Save and verify the cycle forecast and phase update immediately.

---

## 4. Therapy & Practice Circles

### Files:
- `src/app/(app)/circles/index.tsx`
- `src/app/(app)/circles/[communityId]/index.tsx`
- `src/services/supabase/groups.ts`

### How to Test on Device:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "thrivefold:///circles" com.amit.thrivefold
```
- Displays peer support circles, community rules, facilitator notes, and scheduled circle sessions.
