# Thrivefold Payments, Cloud Infrastructure & Cost Projections

## 1. Zero-Cost Serverless Infrastructure Architecture

Thrivefold is engineered to run on permanent $0 / free-tier serverless primitives during bootstrapping:

```
+--------------------------------------------------------------------------+
|                        FREE-TIER INFRASTRUCTURE MATRIX                   |
+----------------------+--------------------+------------------------------+
| Service              | Tier               | Allocation Limits            |
+----------------------+--------------------+------------------------------+
| Supabase PostgreSQL  | Free Community     | 500 MB database, 50k MAU     |
| Supabase Auth        | Free Community     | 50,000 monthly active users  |
| Google Gemini 1.5    | AI Studio Free     | 15 RPM / 1,500 RPD free tier |
| Cloudflare Workers   | Free Plan          | 100,000 requests / day       |
| Expo Application     | Open-Source / EAS  | Unlimited local builds       |
+----------------------+--------------------+------------------------------+
```

---

## 2. Commercial Tiers & App Store Offerings

Thrivefold maintains complete functional independence on the free tier:

### 1. Free Sovereign Tier ($0 / Lifetime)
- 100% offline personal health trackers (Cycle, Workouts, Mood, Nutrition).
- Full access to on-device deterministic rules and local sentiment analysis.
- Sovereign encrypted local memory vault with JSON export.
- Standard slow letter exchange (up to 3 simultaneous in-transit letters).
- Access to verified public wellness circles.

### 2. Correspondence Plus ($4.99 / month or $39.99 / year)
- Expanded mailbox capacity (up to 10 concurrent in-transit letters).
- Exclusive quarterly artist-commissioned collectible digital stamps.
- Cross-device end-to-end encrypted cloud backup vault.
- Support ongoing open-source development and zero-ad privacy guarantee.

---

## 3. Cost-per-Active-User Modeling

Because 95% of compute and analysis occurs locally on the client device (Hermes JavaScript engine with MMKV), server overhead is exceptionally low:
- **Database storage per active user**: ~45 KB / year.
- **Server proxy bandwidth**: ~120 KB / month.
- **Estimated infrastructure cost at 10,000 MAU**: **$0.00 / month** (within free quotas).
- **Estimated infrastructure cost at 100,000 MAU**: **<$45.00 / month** on Supabase Pro.
