# Thrivefold — Marketplace Implementation Audit

> **Status:** Authoritative Architectural & Logical Audit (Post-Rebuild)  
> **App:** Thrivefold (`com.amit.thrivefold`)  
> **Source Documents:** `docs/product/REAL_REWARDS_AND_ASSET_SPECIFICATION.md`, `src/domain/game/rewards.ts`, `src/constants/masterRewardAssets.ts`

---

## 1. Executive Summary

The Marketplace experience has been completely rebuilt to replace confusing mockups, decorative clutter, and broken modals with a rock-solid, logically correct, and simplified architecture.

Key Accomplishments:
1. **Simplified Information Hierarchy**:
   - Replaced the cluttered 1,591-line multi-tab prototype with 3 functional views:
     - **Market**: Purchasable items categorized by Habit Stickers, Status Badges, Physical Gear, and Verified Care Plans.
     - **Milestone Chests**: The 5 milestone reliquary chests (Levels 5, 10, 20, 50, 100) with deterministic rewards and real chest artwork.
     - **Inventory**: Complete catalog of owned stickers, status badges, collector cards, and physical gear dispatch requests with real equip actions.
2. **Removed Clutter & Distraction**:
   - Removed decorative distractions (unrelated 11 gouache paintings gallery and 36 repetitive 3D asset inspection viewers).
   - Retained only high-impact, semantically correct imagery.
3. **Fixed Image Semantics**:
   - Eliminated unrelated tarot card / gem imagery from digital stickers; stickers now render as clean, elegant squircle medallion badges with themed colors and crisp icons.
   - Physical gear displays actual product photography renders (pushup bars, gyroball, linen health journal, knurled gripper, junior cricket bat, wholesome nutrition meal box).
   - Milestone chests display their actual 3D chest renders in closed and burst states.
4. **Resolved All Modal Failures at the Root Cause**:
   - Fixed dropped Reanimated worklet animation callbacks with a guaranteed timer fallback.
   - Added explicit upper-scrim pressable inside `keyboardAvoid` ensuring outside taps dismiss reliably on all Android/iOS platforms.
   - Fixed `CustomAlert` race condition where `hideAlert()` was called after `onConfirm()`, wiping out secondary alerts.
5. **Authoritative Gem Purchase & Equip Flow**:
   - Integrated with canonical `useRootStore` and `rewardLedger`.
   - Added real-time balance comparison and affordability badges.
   - Implemented `setActiveSticker` toggle to equip and unequip owned stickers across the app.
6. **Dashboard Integration**:
   - Home Dashboard now features a dedicated Treasury Quick Bar displaying Amber Gems, milestone chest readiness notification (`🎁 X Chests Ready!`), and direct link to Marketplace.

---

## 2. Currency & Economy Model

The canonical Thrivefold reward economy consists of 4 tiers:
- **Amber Gems ("diamonds")**: Earned strictly via daily verified health actions (`ACTION_REWARDS`: medicine taken/photo, meals logged, profile details, BYOK, routines). Never sold for real money.
- **Sanctuary Tickets**: Forged from 500 Amber Gems (`TICKET_FORGE_GEMS`).
- **Golden Marketplace Tokens**: Forged from 5 Sanctuary Tickets or 2,500 Amber Gems (`TOKEN_FORGE_GEMS`).
- **Real Physical Gear & Services**: Redeemed with 8–20 Tokens or 10,000 Gems.

### Verified Pricing Catalog
- **Habit Stickers (Zen Fox, Hydration Drop, Moon, Stride Shoes, Lotus, Solar Medal)**: 100 Gems (`TIER_COST.sticker`) or 1 Token.
- **Status Badges (Sanctuary Status, Guardian Sentinel)**: 500 Gems (`TIER_COST.status`) or 1 Ticket / 1 Token.
- **Physical Workout Gear**:
  - Solid Beechwood Parallettes: 10 Tokens / 10,000 Gems
  - High-Precision Metal Gyroball: 12 Tokens / 10,000 Gems
  - Hardcover Sage Linen Health Journal: 10 Tokens / 10,000 Gems
  - Knurled Aluminum Hand Gripper: 8 Tokens / 10,000 Gems
  - Junior Willow Cricket Bat & Ball Set: 20 Tokens / 10,000 Gems
  - Nordic Wellness Still Life Set: 12 Tokens / 10,000 Gems
- **Verified Care Plans**:
  - Doctor Telehealth Visit: 15 Tokens / 37,500 Gems
  - Organic Wholesome Meal Box (3 Days): 18 Tokens / 45,000 Gems
  - 30-Day Mindful Movement Plan: 5 Tokens / 12,500 Gems

---

## 3. Modal Architecture & Dismissal Root Causes

| Failure Mode | Root Cause Identified | Architecture Fix Applied |
| :--- | :--- | :--- |
| **Outside Tap Did Nothing** | In `AppBottomSheetModal.tsx`, `keyboardAvoid` view was positioned after `backdrop` in the JSX tree. In Android layout passes, `pointerEvents="box-none"` on empty parent containers does not consistently bubble down to sibling pressables. | Added an explicit `upperOutsideTap` pressable occupying the empty top space inside `keyboardAvoid`, guaranteeing instant outside-tap capture. |
| **Modal Got Stuck Onscreen** | `startCloseAnimation` relied solely on Reanimated's `withTiming` completion callback. When animations were interrupted, `(finished) => runOnJS(onClose)()` dropped the callback, leaving `visible=true` in state. | Added an unconditional fallback timer (`setTimeout(finish, 250)`) that guarantees `onClose()` executes even if the worklet callback is dropped. |
| **Nested Alert Disappeared Instantly** | In `CustomAlert.tsx`, `handleConfirm` called `alert.onConfirm?.()` before `hideAlert()`. If `onConfirm` launched a new alert (e.g., "Item Unlocked!"), the subsequent `hideAlert()` immediately cleared it. | Reversed execution order: call `hideAlert()` first, then execute `onConfirm?.()`. Nested alerts remain active. |
| **Loot Box Opened When Ineligible** | `LootBoxModal.tsx` lacked state checks on `isEligible` and `isClaimed`, playing the animation even when the transaction failed. | Gated `open` with strict eligibility checks. Disabled pressable when locked; displays clear level requirement message. |

---

## 4. Item Usage & Ownership (Equip / Active)

- **Ownership Tracking**: Items purchased are appended to `rewardLedger` with kind `market_spend`. The store derives `marketOwned` as a deterministic list of owned item IDs.
- **Equipping**:
  - Stickers and Status Badges can be equipped via `setActiveSticker(id)`.
  - The equipped sticker displays in Profile, Dashboard, and Marketplace headers.
- **Physical Gear**:
  - Submits a delivery request with name, phone, and delivery address.
  - Tracked in `rewardLedger` with unique keys and displayed under the Inventory tab with "In Processing" status.
