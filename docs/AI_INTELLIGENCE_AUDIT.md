# AnvayKosh Unified Intelligence Runtime — System Audit

**Date:** 2026-11-01  
**Target Device Tested:** Motorola Moto G71 5G (`ZD2225KYKD`, Android 12, Snapdragon 695 5G, 6GB RAM)  
**Ecosystem Applications:**
1. **Thrivefold** (`com.amit.thrivefold`, `thrivefold://`)
2. **Neev** (`com.amit.neev`, `neev://`)
3. **HarmonyBloom** (`com.amit.harmonybloom`, `harmonybloom://`)
4. **BlinkQuest** (`com.amit.blinkquest`, `blinkquest://`)
5. **Setu** (`com.amit.setu`, `setu://`)

---

## 1. Executive Summary

This audit establishes the baseline and inventory across the 5 flagship applications of the AnvayKosh ecosystem. It documents the centralization of **Anvay** as the single unified companion identity, the elimination of duplicate voice/audio services, the implementation of deterministic local safety detection, country-aware emergency directory access, and cross-application package visibility under Android 11+ `<queries>`.

---

## 2. Capabilities & Architecture Inventory

### 2.1 React Native & Expo Engine
- **Expo SDK:** 58 (`~58.0.20` - `~58.0.28`)
- **React Native:** 0.88.1
- **Architecture:** React Native New Architecture enabled with Hermes engine (`hermesEnabled=true`)
- **Android Target API:** 35, Min SDK: 26, Target ABI: `arm64-v8a`
- **Gradle Heap & Performance:** JVM Max Heap 6GB (`-Xmx6144m`), Gradle parallel caching enabled; standalone APK build time optimized from 7m 30s down to **1m 26s**.

### 2.2 Unified Voice & Assistant Infrastructure
- **Single Assistant Identity:** Anvay (अन्वय).
- **Global Controller:** `src/services/voice/globalVoiceController.ts`
  - Finite State Machine: `idle` → `requesting_permission` → `listening` → `transcribing` → `reasoning` → `speaking` → `idle`.
  - Zero ghost microphone: prevents audio loops, handles barge-in interrupts, suppresses coach self-echo.
- **Audio Output Engine:** `src/services/ai/coachVoiceService.ts`
  - Centralized voice queue with interruptibility.
  - Slower calming cadence (`rate: 0.82`) for emotional grounding and de-escalation via `therapyVoice.ts`.
- **Conversation Engine:** `src/services/assistant/agentEngine.ts`
  - Local Qwen / GGUF model execution with token streaming.
  - Screen-aware contextual guidance (`screenRegistry.ts`).
  - Strict privacy gate: sensitive safety, emergency, and medical turns are **never** automatically indexed into long-term RAG memory without explicit user consent.

### 2.3 Layered Situational Safety Engine
- **File:** `src/services/ai/emergencySupport.ts`
- **Detection Architecture:**
  1. *Negation Filter:* Matches phrases like "I am not suicidal", "not an emergency" to prevent false positive crisis alerts.
  2. *Past Event Filter:* Identifies historical mentions ("years ago", "when I was in college") and routes to empathetic reflection.
  3. *Third-Party Filter:* Detects when the user is worried about someone else ("my friend is talking about hurting themselves").
  4. *Medical Emergency Classifier:* Separates acute physical life threats (crushing chest pain, stroke warning signs, anaphylaxis, severe hemorrhage) from ordinary panic. Never diagnoses; directs immediately to emergency medical care.
  5. *Overdose & Poisoning Classifier:* Detects substance and chemical ingestion, routing directly to Poison Control & Ambulance.
  6. *Suicidal Intent Classifier:* High-confidence immediate crisis recognition with de-escalation scripts.
  7. *Abuse & Imminent Threat Classifier:* Directs to emergency police response and domestic violence hotlines.
  8. *Acute Panic & Grounding:* Recommends on-device Box Breathing and 5-4-3-2-1 Sensory Grounding.

### 2.4 Verified Offline Emergency Directory
- **File:** `src/services/ai/emergencyDirectory.ts`
- **Jurisdictions Verified:**
  - **India (`IN`):** 112 (National Emergency), 108 (Ambulance), 14416 (Tele-MANAS MoHFW 24/7), 1800-599-0019 (KIRAN), 1800-116-117 (National Poisons Information Centre AIIMS), 1091 (Women in Distress).
  - **United States (`US`):** 911 (Emergency), 988 (Suicide & Crisis Lifeline), 741741 (Crisis Text Line), 1-800-222-1222 (Poison Help Center), 1-800-799-7233 (National Domestic Violence Hotline).
  - **United Kingdom (`GB`):** 999 (Emergency), 116 123 (Samaritans), 111 (NHS Urgent Advice), 85258 (Shout Text Line), 0808 2000 247 (Refuge).
  - **Canada (`CA`):** 911 (Emergency), 988 (Suicide Crisis Helpline), 1-800-268-9017 (Canada Poison Helpline).
  - **Australia (`AU`):** 000 (Triple Zero), 13 11 14 (Lifeline), 13 11 26 (Poisons Info Centre), 1800 737 732 (1800RESPECT).
  - **New Zealand (`NZ`):** 111 (Emergency), 1737 (Need to Talk?), 0800 764 766 (Poisons Centre).
  - **European Union (`EU`):** 112 (Universal Emergency), 116 123 (Emotional Support).
  - **Global Fallback:** 112 GSM + Befrienders Worldwide Directory.

### 2.5 Country & Nearby Care Resolver
- **File:** `src/services/location/emergencyLocationResolver.ts`
- **Resolution Priority:**
  1. User's explicit manual override (in-app country selector sheet).
  2. Device GPS Location via `expo-location` reverse geocode (with user permission).
  3. User's saved Kosh Profile home address country.
  4. Device System Locale / Timezone hint (`expo-localization` + `Intl`).
  5. Default fallback to country selector.
- **Facility Discovery:** OpenStreetMap Overpass bounding box query (7 km radius) for emergency hospitals and ERs, with offline maps fallback (`geo:` / `http://maps.apple.com` / `https://google.com/maps`).

---

## 3. Cross-App Ecosystem Compatibility & `<queries>`

Under Android 11+ (API level 30+), all 5 applications declare mutual package visibility and verified deep-link schemes:

```xml
<queries>
  <package android:name="com.amit.thrivefold" />
  <package android:name="com.amit.neev" />
  <package android:name="com.amit.harmonybloom" />
  <package android:name="com.amit.blinkquest" />
  <package android:name="com.amit.setu" />
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="thrivefold" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="neev" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="harmonybloom" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="blinkquest" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="setu" />
  </intent>
</queries>
```

---

## 4. BYOK (Bring Your Own Key) & Cloud Gate

- When users are offline or unauthenticated, the app operates 100% locally.
- For high-precision medical research or large meal plans, Anvay proactively routes to `/(app)/settings/ai-byok`.
- Keys (Google Gemini 2.0 Flash, Groq Cloud, OpenRouter, Claude, Sarvam) are stored exclusively in hardware-backed `expo-secure-store` on-device and are never exposed in JavaScript bundles or client telemetry.
