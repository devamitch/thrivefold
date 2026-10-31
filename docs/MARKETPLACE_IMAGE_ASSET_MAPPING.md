# Thrivefold — Digital Marketplace Asset Mapping

> **Authoritative Specification:** 100% Digital Sanctuary Assets  
> **Source Directory:** `Apps/thrivefold/assets/rewards/` and `Apps/thrivefold/assets/rewards/thrivefold_all_generated_images/images/`

---

## 1. Digital Asset Mapping Table

All displayed items are strictly digital assets with high-resolution visual artwork:

| Item Key | Asset ID | Category | Artwork Description | Source Asset |
| :--- | :--- | :--- | :--- | :--- |
| `card_grounded_seeker_unlock` | `card_grounded_seeker` | Collector Card | Earthen circular labyrinth mandala | `RewardAssets.cards.groundedSeeker` |
| `card_sanctuary_sentinel_unlock` | `card_sanctuary_sentinel` | Collector Card | Heraldic silver shield & olive branch | `RewardAssets.cards.sanctuarySentinel` |
| `card_mindful_voyager_unlock` | `card_mindful_voyager` | Collector Card | Celestial astrolabe & morning sun | `RewardAssets.cards.mindfulVoyager` |
| `card_apex_thrivemaster_unlock`| `card_apex_thrivemaster` | Collector Card | Black obsidian & 24k gold royalty card | `RewardAssets.cards.apexThrivemaster` |
| `status_sanctuary` | `sanctuaryPass` | Digital Badge | Luxury letterpress passport pass | `RewardAssets.currencies.sanctuaryPass` |
| `status_guardian` | `sanctuarySentinel` | Digital Badge | High-relief heraldic guardian shield | `RewardAssets.cards.sanctuarySentinel` |
| `badge_booster_2x` | `booster2x` | Digital Talisman | Translucent sage jade 2X XP talisman | `RewardAssets.currencies.booster2x` |
| `badge_bronze_medallion` | `bronzeMedallion` | Digital Badge | Solid commemorative bronze medal | `RewardAssets.currencies.bronzeMedallion` |
| `badge_golden_star` | `goldenGem` | Digital Crest | Eight-pointed mirror-gold crystal star | `RewardAssets.currencies.goldenGem` |
| `badge_master_token` | `marketplaceToken` | Digital Coin | Heavy minted commemorative token coin | `RewardAssets.currencies.marketplaceToken` |
| `badge_gold_voucher` | `goldVoucher` | Digital Voucher | Golden Sanctuary passport seal | `RewardAssets.currencies.goldVoucher` |
| `sticker_zen_fox` | `zenFox` | Profile Sticker | Meditating Zen Fox medallion badge | `RewardAssets.stickers.zenFox` |
| `sticker_hydration_drop` | `hydrationDrop` | Profile Sticker | Living Hydration Drop medallion badge | `RewardAssets.stickers.hydrationDrop` |
| `sticker_slumber_moon` | `slumberMoon` | Profile Sticker | Slumber Moon bedtime medallion badge | `RewardAssets.stickers.slumberMoon` |
| `sticker_stride_shoes` | `strideShoes` | Profile Sticker | Morning Stride barefoot walking badge | `RewardAssets.stickers.strideShoes` |
| `sticker_pranayama` | `pranayamaLotus` | Profile Sticker | Pranayama Lotus deep breathing badge | `RewardAssets.stickers.pranayamaLotus` |
| `sticker_solar` | `solarMedal` | Profile Sticker | Solar Vitality circadian alignment medal| `RewardAssets.stickers.solarMedal` |

---

## 2. Milestone Progression Reliquaries (Chests)

| Milestone | Chest Name | Closed Render | Burst Render | Guaranteed Drops |
| :--- | :--- | :--- | :--- | :--- |
| **Level 5** | Scandinavian Beechwood Chest | `RewardAssets.chests.tier1.closed` | `RewardAssets.chests.tier1.burst` | +15 Amber Gems, Grounded Seeker Card |
| **Level 10** | Terracotta Sanctuary Vault | `RewardAssets.chests.tier2.closed` | `RewardAssets.chests.tier2.burst` | +25 Amber Gems, Sanctuary Sentinel Card |
| **Level 20** | Golden Sunburst Trove | `RewardAssets.chests.tier3.closed` | `RewardAssets.chests.tier3.burst` | +40 Amber Gems, Mindful Voyager Card |
| **Level 50** | Ecosystem Relic Chamber | `RewardAssets.chests.tier4.closed` | `RewardAssets.chests.tier4.burst` | +50 Amber Gems, Ecosystem Relic Card |
| **Level 100** | Grand Master Carrara Reliquary | `RewardAssets.chests.tier5.closed` | `RewardAssets.chests.tier5.burst` | +50 Amber Gems, Apex Thrivemaster Card |

---

## 3. UI/UX Rules Enforced

1. **Digital-Only Policy**: Zero physical equipment, zero shipping/delivery forms, zero recipient detail fields.
2. **Proper Image Display**: Every digital asset renders its authentic high-resolution 3D artwork.
3. **Clean Modal Dismissal**: Sheet modals close on upper outside tap, backdrop press, close button, and Android hardware back button.
4. **Append-Only Ledger**: Purchases write non-destructive `market_spend` transactions to SQLite.
