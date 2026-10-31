# Thrivefold — Loot Box and Inventory Flow

> **Authoritative Chest & Relic Pipeline**  
> **Source:** `docs/product/REAL_REWARDS_AND_ASSET_SPECIFICATION.md`

---

## 1. Chest Milestone System

Chests unlock as the user advances their health and fitness adherence level:

| Chest | Requirement | Reward | Guaranteed Card Drop |
| :--- | :--- | :--- | :--- |
| **Tier 1: Wooden Sanctuary Chest** | Level 5 | 100 Gems | Grounded Seeker (Common) |
| **Tier 2: Terracotta Sanctuary Vault** | Level 10 | 250 Gems | Sanctuary Sentinel (Rare) |
| **Tier 3: Amber Sunburst Trove** | Level 20 | 500 Gems | Mindful Voyager (Epic) |
| **Tier 4: Obsidian Slate Chamber** | Level 50 | 1,000 Gems | Ecosystem Relic (Epic) |
| **Tier 5: Master Reliquary Box** | Level 100 | 2,500 Gems | Apex Thrivemaster (Mythic) |

---

## 2. Opening Interaction Lifecycle

```
[Tap Locked Chest] ──► Level Check ──► [Tap Unlocked Chest]
         │                                    │
         ▼                                    ▼
   Rejection Alert                      Bob Animation
                                              │
                                              ▼
                                       Rattle & Haptics
                                              │
                                              ▼
                                         Burst Open
                                     (Sunburst Rays & Embers)
                                              │
                                              ▼
                                      3D Card Reveal
                                 (Card Flip + Awarded Gems)
                                              │
                                              ▼
                                  Ledger Update Committed
                                              │
                                              ▼
                                       Claim & Close
```

---

## 3. Inventory Integration

1. **Reliquary Cards**:
   - Cards unboxed from milestone chests are permanently stored in the **Vault / Reliquary** gallery.
   - Users can inspect card artwork, lore, rarity, and unlock timestamps.
2. **Profile Stickers & Titles**:
   - Equippable directly from the Marketplace or Inventory view.
   - Synchronized across personal profile, coach assistant, and dashboard header.
3. **Delivery Requests**:
   - Tracked in the user's active gear requests with full shipment address and phone verification.
