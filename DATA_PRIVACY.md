# Thrivefold Data Privacy & Vault Architecture

## 1. Zero-Trust Local-First Philosophy
Health information, journal thoughts, emotional state reflections, and menstrual/lifestyle cycles belong exclusively to the user. Thrivefold operates under a **local-sovereignty paradigm**:

1. **No Cloud Dependency**: The entire health tracking and insight system works 100% offline. If the device has no internet connection for a year, the app functions uninterrupted.
2. **Encrypted Local Vault**:
   - Stored in fast, encrypted MMKV key-value partitions on device storage.
   - User has full CRUD over their memories: view, edit, search, or purge with a single tap.
3. **No Third-Party Tracking**:
   - Zero advertising tracking SDKs (no Facebook Pixel, AppsFlyer, Adjust, Google Analytics).
   - Zero selling or renting of health data to insurance providers, brokers, or data aggregators.

---

## 2. Granular Data Consent Matrix

| Data Category | Storage Location | Default Cloud Sync | User Controls |
|---------------|------------------|-------------------|---------------|
| Cycle & Ovulation Dates | Device MMKV | Disabled (Local Only) | Delete All / Export CSV |
| Mental Health Journal | Device MMKV | Disabled (Local Only) | Edit, Purge, Pin Lock |
| Daily Habits & Check-ins | Device MMKV | Optional Encrypted Backup | Toggle in Settings |
| Pen-Pal Sent Letters | Supabase PostgreSQL | Encrypted with Transit Delay | Delete Conversation |
| Identity & Age Assurance | Supabase Auth | Verified Token Only (No ID image saved) | Account Deletion |
| Sensitive Health Preferences | Device Memory | Never uploaded | Reset to default |

---

## 3. Sovereign Export & Account Deletion (GDPR & CCPA Compliant)
In `Settings -> Privacy & Storage Vault`:
- **Export Data**: Generates a standard JSON file containing all user check-ins, journal reflections, cycle history, and correspondence logs.
- **Permanent Purge**: Instantly wipes local MMKV storage and invokes the Supabase RPC `purge_user_account_data(user_id)` to execute a CASCADE deletion across all cloud tables.
