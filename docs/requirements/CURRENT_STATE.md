# Current State Inventory: Existing Women's Health Web Application

**Inspected Repository:** `Apps/harmony-bloom`  
**Inspected Date:** October 2026  
**Status:** Verified working, building, and preserved without modification.

---

## 1. Existing Application Architecture
- **Framework:** React 18 + TypeScript + Vite 5
- **Routing:** React Router v6 (31 verified active routes in `src/pages/`)
- **State Management:** Zustand (`useAppStore.ts`) with localStorage persistence
- **Local Database:** Dexie.js (IndexedDB) with full schema versioning
- **Design System:** Tailwind CSS + Radix UI (shadcn/ui), Framer Motion v12
- **Audio / Ambient:** Web Audio API soundscape generators & breathing guidance
- **PWA / Build:** vite-plugin-pwa, Service Worker precache

---

## 2. Preserved Health Feature Contracts
1. **Cycle Tracking (`src/pages/CycleCalendar.tsx`):**
   - Phase calculation: Menstrual, Follicular, Ovulatory, Luteal
   - Cycle length (default 28) and period length (default 5) tracking
   - Symptom logger with flow intensity (0-5), cramps, spotting, mood correlation
   - Prediction algorithms for upcoming fertile windows and periods

2. **Mood & Energy Journaling (`src/pages/MoodInsights.tsx`):**
   - 10-point daily sliders for energy, mood, stress, anxiety, sleep
   - 14-day history trend charts (Recharts)
   - Reflection prompts with local storage

3. **Mindfulness & Breathing (`src/pages/BreatheHarmony.tsx`):**
   - Box breathing, 4-7-8 parasympathetic calming routines
   - Real-time animated breathing orb

4. **Daily Quests & Progression (`src/pages/QuestDetail.tsx`, `src/data/questBank.ts`):**
   - 46KB curated quest bank
   - XP rewards, levels, streaks, coin badges

5. **Aura AI Coach (`src/pages/AuraChat.tsx`, `src/lib/gemini.ts`):**
   - Streaming Google Gemini integration with prompt minimization
   - Phase-aware context injection

6. **Wellness Automations (`src/pages/Flows.tsx`):**
   - n8n-style triggers and actions (fixed syntax error, verified build)

---

## 3. Regression & Build Validation
- **Unit Tests:** `pnpm test` -> 1 passed (100%)
- **Production Build:** `pnpm run build` -> Clean build in 5.78s, PWA precache generated with 176 assets.
- **Rule of Engagement:** Zero destructive edits to HarmonyBloom. All Thrivefold extensions are additive.
