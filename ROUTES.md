# Thrivefold Navigation & Route Map

Below is the complete route tree implemented in `Apps/thrivefold/src/app/` powered by Expo Router.

| Route Path | Type | Experience / Guard | Purpose |
|------------|------|--------------------|---------|
| `/` | Redirect | Public | Initial entry resolver directing user to onboarding or tabs based on state |
| `/(onboarding)/choose-experience` | Screen | Public | Choose between Women's Health, Men's Health, and Pride Wellbeing |
| `/(onboarding)/privacy-choices` | Screen | Public | Granular local-only storage vs cloud sync & age declaration |
| `/(onboarding)/goals` | Screen | Public | Baseline health habits and wellness goals |
| `/(onboarding)/complete` | Screen | Public | Animated welcome card and vault setup |
| `/(auth)/sign-in` | Screen | Public | Anonymous sign-in or optional email magic-link |
| `/(app)/(tabs)` | Layout | Authenticated | Main tab bar controller |
| `/(app)/(tabs)/index` | Screen | Dynamic Theme | Home dashboard with health highlights, quotes, and prompt chips |
| `/(app)/(tabs)/today` | Screen | Authenticated | Daily interactive habit checklists, phase guidance, and timer |
| `/(app)/(tabs)/progress` | Screen | Authenticated | Streak tracking, telemetry graphs, and milestone badges |
| `/(app)/(tabs)/learn` | Screen | Authenticated | Evidence-based health articles and localized wellness guides |
| `/(app)/(tabs)/settings` | Screen | Authenticated | Theme switching, privacy vault controls, and data export |
| `/(app)/health/cycle` | Screen | Women's Health | Menstrual cycle, ovulation calendar, and symptom log |
| `/(app)/health/exercise` | Screen | Men's Health | Resistance workouts, mobility flows, and recovery timer |
| `/(app)/letters` | Screen | Policy Protected (18+) | Pen-pal mailbox, transit status, and arrival countdowns |
| `/(app)/letters/compose` | Screen | Chip-Only Composer | Compose letters using curated chips (no raw text) |
| `/(app)/letters/stamps` | Screen | Authenticated | Digital stamp gallery and achievement collection |
| `/(app)/social` | Screen | Policy Protected (18+) | Explore pen-pal introductions under strict safety quotas |
| `/(app)/circles` | Screen | Policy Protected (18+) | Segmented affinity communities for peer support |
| `/(app)/ai` | Screen | Consent Gated | Local AI memory vault viewer and model status |
| `/(app)/journal` | Screen | Authenticated | Sovereign on-device encrypted thought journal |
| `/(app)/games` | Screen | Authenticated | Mindful wellness arcade and sensory breathing exercises |
| `/(app)/safety` | Screen | Universal | Emergency crisis lines, block list, and report submission |
| `/(app)/billing` | Screen | Authenticated | Transparent free tier status & Correspondence Plus upgrades |
| `/(app)/organizations` | Screen | Authenticated | B2B & NGO health verification portal |
| `/(app)/quests/[questId]` | Screen | Authenticated | Dynamic wellness quest execution with haptics |
| `/(public)/legal/terms` | Screen | Public | Terms of Service and acceptable use |
| `/(public)/legal/privacy` | Screen | Public | Privacy policy and on-device data sovereignty |
| `/(public)/legal/health-disclaimer` | Screen | Public | Medical disclaimer (non-diagnostic wellness companion) |
