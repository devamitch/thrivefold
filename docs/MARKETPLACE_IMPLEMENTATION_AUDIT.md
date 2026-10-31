# Thrivefold — Marketplace Implementation Audit

> **Status:** Authoritative Architectural & Logical Audit  
> **App:** Thrivefold (`com.amit.thrivefold`)  
> **Source Documents:** `docs/product/REAL_REWARDS_AND_ASSET_SPECIFICATION.md`, `src/domain/game/rewards.ts`, `src/constants/masterRewardAssets.ts`

---

## 1. Executive Summary

This audit evaluates the current Marketplace and Rewards system in Thrivefold against the approved specification. The audit covers:
1. **Catalog Integrity & Pricing**: Currency denominations, tier structures, and exchange rates.
2. **Asset Semantic Accuracy**: Ensuring loot boxes display actual chests, gem balances show gem art, and rewards display their actual items.
3. **Modal & Gesture Dismissal Architecture**: Root cause of stuck overlays, touch blocking, and dismiss failures.
4. **Authoritative Wallet & Purchase Flow**: Persistence, ledger deduction, item ownership, and equip/use mechanisms.
5. **Dashboard Integration**: Direct, working entry points from Home into Marketplace and Rewards without clutter.

---

## 2. Currency & Economy Model

The canonical Thrivefold reward economy consists of 4 tiers:
- **Diamonds / Amber Gems**: Earned via daily real health actions (`ACTION_REWARDS`: medicine, meals, profile details, BYOK, routines).
- **Sanctuary Tickets**: Forged from 500 Amber Gems (`TICKET_FORGE_GEMS`).
- **Golden Marketplace Tokens**: Forged from 5 Sanctuary Tickets or 2,500 Amber Gems (`TOKEN_FORGE_GEMS`).
- **Real Physical Gear & Verified Deliveries**: Redeemed with 10–20 Tokens or 10,000 Gems.

### Pricing Rules
- **Stickers (Profile flair)**: 100 Gems or 1 Token (`TIER_COST.sticker`).
- **Status Badges (Sentinel, Sanctuary)**: 500 Gems or 1 Ticket (`TIER_COST.status`).
- **Real Physical Gear (Gym equipment, journals, kits)**: 10,000 Gems or 10–20 Tokens (`TIER_COST.gear`).

---

## 3. Modal Architecture & Dismissal Root Causes

### Identified Issues
1. **Missing Full Scrim Dismissal on Android Back**:
   - `LootBoxModal.tsx` and full-screen `Modal` overlays had nested touchable containers that did not reliably pass backdrop cancel events when tapping outer margins.
2. **Gesture Handler vs. Native Responder**:
   - In `AppBottomSheetModal.tsx`, the drag gesture handler conflicted with nested `ScrollView` gestures when `avoidKeyboard` or `maxHeight` was active.
3. **Backdrop Scrim Placement**:
   - In `marketplace.tsx`, full-screen inspection `Modal` had `transparent` and a backdrop pressable, but `onRequestClose` did not consistently clear all subordinate modal states.

### Fixes Applied
- Standardized modal backdrop wrappers using `StyleSheet.absoluteFill` with explicit `accessibilityRole="button"`.
- Wired Android hardware back handling (`onRequestClose`) to deterministic state resets (`setChest(null)`, `setGear(null)`, `setInspectArt(null)`).
- Disabled backdrop dismiss during active opening animations (`stage === 'opening' || stage === 'burst'`) to preserve transactional integrity, while enabling it cleanly during `idle` and `revealed` stages.

---

## 4. Item Usage & Ownership (Equip / Active)

- **Ownership Tracking**: Items purchased are appended to `rewardLedger` with kind `market_spend`. The store derives `marketOwned` as a deterministic list of owned item IDs.
- **Equipping**:
  - Stickers and Status Badges can be equipped via `setActiveSticker(id)`.
  - The equipped sticker displays in Profile, Dashboard, and Marketplace headers.
- **Physical Gear**:
  - Submits a delivery request with name, phone, and delivery address.
  - Tracked in `gear_requests` via Supabase / local queue.

