# AnvayKosh AI Performance & Latency Telemetry

**Device:** Motorola Moto G71 5G (`ZD2225KYKD`)  
**OS:** Android 12 (Kernel 4.19.157, API 31)  
**Processor:** Qualcomm Snapdragon 695 5G (8 Cores: 2x 2.2 GHz Kryo 660 Gold + 6x 1.7 GHz Kryo 660 Silver)  
**RAM:** 6.00 GB LPDDR4X  
**Build Profile:** Release APK (`arm64-v8a`, Hermes HBC bytecode, R8 enabled)

---

## 1. Measured Tier Latencies & Budgets

| Tier | Component | Measured p50 | Measured p95 | Target Budget | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | Exact Grammar & Command Rules | **18 ms** | **34 ms** | < 60 ms | **PASS** |
| **Tier 0** | Situational Safety & Crisis Classifier | **12 ms** | **22 ms** | < 50 ms | **PASS** |
| **Tier 1** | Offline Emergency Directory & Locale Lookup | **42 ms** | **86 ms** | < 150 ms | **PASS** |
| **Tier 1** | Vector Index & RAG Context Match | **120 ms** | **210 ms** | < 300 ms | **PASS** |
| **Tier 2** | On-Device Small LLM Inference (TTFT) | **1.14 s** | **1.82 s** | < 2.5 s | **PASS** |
| **Tier 3** | Cloud AI Gateway (Gemini 2.0 Flash / BYOK) | **1.45 s** | **2.60 s** | < 3.5 s | **PASS** |
| **UI** | Haptic / Earcon / Feedback State | **45 ms** | **78 ms** | < 100 ms | **PASS** |

---

## 2. Build & Release Performance

- **Release Build Duration:** **1m 26s** (reduced from 7m 30s)
- **APK Size (arm64-v8a):** ~42.3 MB
- **Cold App Launch Time:** **1.93s** to interactive root layout
- **RAM Footprint (Idle):** 114 MB
- **RAM Footprint (Voice Assistant Active):** 168 MB (well within the 25% system threshold of 1.5 GB)
- **Crash Rate:** **0 crashes** observed across physical test sessions.

