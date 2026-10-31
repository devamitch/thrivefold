# Thrivefold — Loot Box and Inventory Flow

> **Authoritative Chest & Relic Pipeline**  
> **Source:** `docs/product/REAL_REWARDS_AND_ASSET_SPECIFICATION.md`, `src/domain/game/rewards.ts`

---

## 1. Chest Milestone System

Milestone chests unlock deterministically as the user advances their health and habit adherence level. Contents are fixed per tier and never randomized or inflated:

| Chest | Milestone | Guaranteed Gems | Guaranteed Collector Card | Rarity | Asset File (Closed / Burst) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Wooden Sanctuary Chest** | Level 5 | +15 Amber Gems | Grounded Seeker | Common | `chest_wooden_closed.png` / `chest_wooden_burst.png` |
| **Tier 2: Terracotta Sanctuary Vault** | Level 10 | +25 Amber Gems | Sanctuary Sentinel | Rare | `a_high_detail_fantasy_sci_fi_3d_render_on_a_trans.png` / `transp.png` |
| **Tier 3: Golden Sunburst Trove** | Level 20 | +40 Amber Gems | Mindful Voyager | Epic | `a_high_detail_fantasy_game_style_3d_render_on_a_tr.png` / `ui_style_render.png` |
| **Tier 4: Ecosystem Relic Box** | Level 50 | +50 Amber Gems | Ecosystem Relic | Legendary | `a_high_gloss_ultra_detailed_fantasy_sci_fi_style.png` / `split_panel_co.png` |
| **Tier 5: Grand Master Reliquary** | Level 100 | +50 Amber Gems | Apex Thrivemaster | Mythic | `a_high_detail_fantasy_loot_chest_illustration.png` / `sci_fi_fantasy.png` |

---

## 2. Opening Interaction Lifecycle

```
[Tap Locked Chest] ──► Level Check Fail ──► Displays "Reach Level X to unlock" (Disabled)
        │
[Tap Eligible Chest] ──► Authoritative Ledger Commit: openChest(level)
        │
        ▼
[Stage: Opening] ──► Anticipation Rattle + Haptic Heavy (6 oscillations)
        │
        ▼
[Stage: Burst] ──► Chest Burst Sprite Switched + 360° Rotating Sunburst Rays
        │
        ▼
[Stage: Revealed] ──► 3D Y-Axis Flip & Rise of the EXACT Collector Card + Awarded Gems
        │
        ▼
[Claim & Continue] ──► Clean Modal Dismissal ──► Inventory Synchronized
```

### Safety and Transactional Invariants
- **No Early Animation**: Animations only run after eligibility validation and authoritative ledger commit.
- **Strict Single Claim**: Chests can only be claimed once (`rewardLedger.some(e => e.key === 'chest:<level>')`). Claimed chests display as "Claimed • Collector Card saved in your Inventory".
- **Real Contents Only**: The opening animation flips up the actual awarded card and gems, never a generic placeholder.
- **Fail-Safe Dismissal**: The modal supports backdrop tap dismissal, visible X close button, and Android hardware back button during idle and revealed states.

---

## 3. Inventory Integration & Real Actions

The **Inventory** tab in Marketplace brings together all owned digital and physical items:
1. **Active Profile Sticker**:
   - Shows currently equipped sticker with option to Unequip.
   - Synchronized across the user profile, coach companion, and dashboard.
2. **Unlocked Stickers & Badges**:
   - Grid of all owned stickers with a direct **Equip** button.
3. **Milestone Collector Cards**:
   - Displays all earned milestone cards with high-fidelity artwork and rarity badges.
4. **Physical Gear Requests**:
   - Displays all dispatched workout gear and health kits with timestamped order keys and "In Processing" status.
