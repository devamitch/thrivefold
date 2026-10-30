# Thrivefold — Master Rewards Economy, Level Progression & Real Fulfillment Specification

> **Version**: 2.0.0 (Comprehensive Real Rewards & Loot Box Architecture)  
> **Status**: Approved Product & Implementation Blueprint  
> **Ecosystem**: AnvayKosh / Thrivefold  
> **Aesthetic Harmony**: Scandinavian-Japanese Wellbeing Minimalism · Pista (`#7A8A6D`), Terracotta (`#D06543`), Cream (`#FAF7F2`), Amber Gold (`#DEB05C`), Radiant Ruby (`#C24136`)

---

## 1. Executive Summary & Core Philosophy

Thrivefold turns daily health habits into a deeply engaging, life-affirming journey. By connecting **deterministic XP progression**, **dynamic animated Loot Boxes**, and a **Multi-Currency System (Amber Gems, Golden Gems, Red Tickets)**, users unlock:
1. **Digital Rewards**: Die-cut vinyl stickers, collector cards, status badges, XP multipliers, and premium companion voices.
2. **Real Physical Goods Delivered to Doorstep**: Gym equipment (pushup parallettes, gyroballs, grips), stationery sets (linen journals, solid brass pens), and children's sports sets (cricket gear, balls, active play kits) personally dispatched from our curated inventory.
3. **Real Health Services**: Verified 1-on-1 consultations with accredited health coaches, certified medical doctors, and organic home-cooked meal vouchers.

---

## 2. Complete Level & XP Progression Engine

### 2.1 Earning XP & Points Matrix

Every verified action on the device awards **XP (Experience Points)** and **Amber Gems**:

| Action | Frequency Limit | XP Awarded | Amber Gems |
|---|---|---|---|
| **Morning Briefing with Anvay** | 1x / day | **+50 XP** | +15 Gems |
| **Hydration Log (Per Glass 1-8)** | Up to 8x / day | **+10 XP** (80 max) | +15 Gems (at 8/8) |
| **Workout / Pose Tracker (10+ min)** | 2x / day | **+120 XP** | +30 Gems |
| **Step Milestones (3k / 7k / 10k)** | 3 milestones / day | **+40 / +60 / +100 XP** | +10 / +20 / +30 Gems |
| **MedFlow Medicine Photo Verified** | Per scheduled dose | **+75 XP** | +25 Gems |
| **Meal Vision Photo Logged** | 3x / day | **+50 XP** | +20 Gems |
| **Daily Journaling / Reflection** | 1x / day | **+60 XP** | +20 Gems |
| **Voice Practice Session (2+ min)** | 1x / day | **+80 XP** | +25 Gems |
| **Pelvic Floor / Somatic Routine** | 2x / day | **+50 XP** | +15 Gems |
| **Share App with Friend / Family** | Unlimited | **+200 XP** | +100 Gems + 1 Red Ticket |
| **Connect BYOK / Private AI Model** | One-time milestone | **+500 XP** | +250 Gems + 5 Red Tickets |
| **7-Day Perfect Habit Streak** | Weekly | **+350 XP** | +150 Gems + 2 Red Tickets |

---

### 2.2 Level Curve & Milestone Chest Unlocks

Progression follows a smooth polynomial curve: `XP_required = 100 * (Level ^ 1.45)`.
Every level-up grants an immediate celebration, and milestone levels award **Sanctuary Loot Boxes**:

```
Level 1  ───► Level 5  (Chest 1) ───► Level 10 (Chest 2) ───► Level 25 (Vault) ───► Level 50 (Trove) ───► Level 100 (Grand Relic)
```

| Level Tier | Title & Badge | Milestone Unlock |
|---|---|---|
| **Level 1–4** | *Sanctuary Novice* | Initial Onboarding Pack (100 Gems, 1 Welcome Sticker) |
| **Level 5** | *Habit Seeker* | **Wooden Sanctuary Chest** (50–100 Gems, 1 Common Sticker, 1.5x XP Booster) |
| **Level 10** | *Steady Mover* | **Terracotta Vault** (150–300 Gems, 1 Rare Card, 1 Red Ticket) |
| **Level 20** | *Rhythm Guardian* | **Golden Sunburst Trove** (500 Gems, 1 Golden Gem, 2 Red Tickets) |
| **Level 30** | *Resilience Master* | **Ecosystem Relic Box** (1,000 Gems, 3 Golden Gems, 5 Red Tickets) |
| **Level 50** | *Thrivefold Champion* | **Royal Sanctuary Cache** (2,500 Gems, 10 Golden Gems, 10 Red Tickets) |
| **Level 100** | *Sanctuary Luminary* | **Grand Master Reliquary** (10,000 Gems, Automatic Physical Merch Voucher) |

---

## 3. Dynamic Animated Loot Box Architecture

### 3.1 Chest Tiers & Drop Probabilities

When a user taps **"Unlock Chest"**, the interactive loot box ceremony begins:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LOOT BOX DROP TABLE                             │
├─────────────────────┬───────────────────┬──────────────┬───────────────┤
│ Box Type            │ Gems Contained    │ Bonus Cards  │ Tickets / Gear│
├─────────────────────┼───────────────────┼──────────────┼───────────────┤
│ Wooden Sanctuary    │ 50 – 150 Amber    │ 60% Common   │ 5% Red Ticket │
│ Terracotta Vault    │ 200 – 500 Amber   │ 35% Rare     │ 15% Red Ticket│
│ Golden Sunburst     │ 750 – 1,500 Amber │ 15% Epic     │ 1 Golden Gem  │
│ Grand Reliquary     │ 3,000 – 10,000    │ 100% Mythic  │ Physical Gear │
└─────────────────────┴───────────────────┴──────────────┴───────────────┘
```

### 3.2 Visual & Physics Animation Choreography (Reanimated + Skia)
1. **The Entrance (`300ms`)**: The closed 3D chest drops with elastic bounce (`withSpring(1, { damping: 12 })`), emitting soft ambient shadows on the cream travertine surface.
2. **The Anticipation / Rattle (`800ms`)**: Chest vibrates with accelerating haptic pulses (`hapticSelection` -> `hapticMedium` -> `hapticHeavy`). Golden particles swirl out from the lid seams.
3. **The Burst (`400ms`)**: Chest lid springs open at a 110° angle. A radiant radial gradient flare expands from the core with Skia glowing rays.
4. **Card / Item Flip Progression**:
   - Item 1 (Gems): Gems counter rolls up with number ticks.
   - Item 2 (Sticker / Card): Card slides out face-down, hovers in 3D perspective, and flips 180° revealing artwork.
   - Item 3 (Bonus Tickets / Boosters): Red Ticket or Golden Gem shines with an iridescent specular shimmer.
5. **Dismissal & Claim**: Single "Claim into Sanctuary" button deposits all items into the persistent store slice with audio feedback.

---

## 4. The Multi-Currency Economy

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   AMBER GEMS    │       │   GOLDEN GEMS   │       │   RED TICKETS   │
│  (Habit Token)  │       │(Premium Mystery)│       │ (Real Exchange) │
│                 │       │                 │       │                 │
│ • Daily checkin │       │ • High streaks  │       │ • Converted from│
│ • Workouts      │       │ • Model toggles │       │   Gems & Chests │
│ • Stickers      │       │ • Voice studios │       │ • Real Merch    │
│ • Minor rewards │       │ • Offline LLMs  │       │ • Doctor visits │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 4.1 Amber Gems
- Primary habit currency earned through all verified routines.
- Used to buy **Digital Stickers (100 Gems)**, unlock **Status Emblems (500 Gems)**, and purchase entry tickets to special Beta Labs.

### 4.2 Golden Gems
- Rare luxury tokens earned at major milestones (Levels 20, 30, 50, 100) or high habit streaks.
- Used to unlock **Exclusive Companion Personalities**, specialized voice timbres, and private offline fine-tuned local models.

### 4.3 Red Tickets (Physical Redemption & Service Passports)
- Accumulated by converting Amber Gems (1,000 Gems = 1 Red Ticket) or dropping as rare loot in milestone chests.
- The direct currency for **Real Physical Equipment**, **Kids & Youth Sports Gear**, **Verified Doctor Visits**, and **Organic Home Meals**.

---

## 5. The Real Physical & Service Sanctuary Catalog

Users exchange accumulated **Red Tickets** or **10,000 Amber Gems** for authentic physical goods delivered straight to their doorstep, personally inspected and packaged:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        REAL REWARDS REDEMPTION CATALOG                                 │
├───────────────────────┬────────────┬─────────────────────────────┬─────────────────────┤
│ Item Name             │ Cost       │ Description                 │ Packaging           │
├───────────────────────┼────────────┼─────────────────────────────┼─────────────────────┤
│ Beechwood Parallettes │ 10 Tickets │ Handcrafted pushup bars     │ Linen wrap + bag    │
│ Aluminum Gyroball     │ 10 Tickets │ Precision wrist powerball   │ Hardcase travel box │
│ Hex Barbell Fat Grips │ 8 Tickets  │ Heavy-duty silicone grips   │ Sealed pouch        │
│ Hardcover Linen Book  │ 8 Tickets  │ A5 mindfulness journal+pen  │ Gold foil gift box  │
│ Pro Junior Cricket Kit│ 15 Tickets │ Kashmir willow bat, 2 balls │ Thrivefold duffel   │
│ Classic Leather Ball  │ 5 Tickets  │ Hand-stitched match ball    │ Gift presentation   │
│ Doctor Telehealth     │ 12 Tickets │ 30-min verified consult     │ Video consultation  │
│ 1-on-1 Health Coach   │ 8 Tickets  │ Personalized habit plan     │ Voice call + plan   │
│ Organic Meal Voucher  │ 6 Tickets  │ Fresh farm-to-table lunch   │ Direct home delivery│
└───────────────────────┴────────────┴─────────────────────────────┴─────────────────────┘
```

### 5.1 Physical Dispatch Workflow
1. **User Request**: User chooses an item from the in-app Marketplace and taps "Redeem with Tickets".
2. **Address Form Verification**: An in-app bottom sheet modal verifies:
   - Recipient Full Name
   - Detailed Street Address, Apt / House No, Landmark
   - City, State / Province, PIN / Postal Code
   - Phone Number for delivery coordination
3. **Receipt & Ticket Deduction**: Tickets/Gems are deducted from MMKV store, generating a verifiable local order token: `TF-RED-<TIMESTAMP>-<HASH>`.
4. **Order Fulfillment**:
   - Dispatched directly with high-quality packaging.
   - Includes custom Thrivefold sticker pack and a handwritten personalized note.
   - Dispatch tracking number is added to the user's local order screen.

---

## 6. Complete AI Image Generation Prompt Master Suite

Use these exact copy-paste prompts in **Midjourney v6**, **Imagen 3**, **DALL-E 3**, or **Flux** for pristine, consistent assets.

### 6.1 Loot Boxes & Chests (3D Isometric Renders)

#### Prompt LB1: Closed Wooden Sanctuary Chest
```text
A handcrafted Scandinavian beechwood treasure chest, polished brass corner brackets and latch, rounded top lid, warm minimalist design, glowing amber light leaking gently from the seam, isolated on solid clean #FAF7F2 cream background, soft studio ambient occlusion, Apple Fitness achievement aesthetic, subtle debossed geometric Thrivefold leaf mark watermarked in the bottom right corner, 8k 3D render.
```

#### Prompt LB2: Exploding / Opening Sunburst Trove
```text
The Scandinavian treasure chest bursting open at a 110-degree angle, blinding warm radiant amber-gold light and floating crystal shards shooting out, holographic cards and shiny golden coins hovering in dynamic motion around the rim, warm terracotta and sage accents, cinematic celebration render, clean cream studio background, micro Thrivefold watermark in corner.
```

---

### 6.2 Gems & Tokens

#### Prompt GT1: Amber Gem (Single Habit Token)
```text
A glowing isometric faceted amber-gold gem icon, emerald-cut jewel with subtle reflections of terracotta orange and pista green inside the glass, isolated on solid #FAF7F2 cream background, soft subsurface scattering, subtle frosted bevels, discreet geometric 'T' leaf logo watermarked in bottom-right corner, 3D vector render, 8k.
```

#### Prompt GT2: Golden Gem (Premium Token)
```text
A radiant royal golden gem shaped as an eight-pointed star crystal, intense warm gold iridescence, floating light particles, mirror polish surface, isolated on clean cream background, luxury achievement token, subtle brand watermark.
```

#### Prompt GT3: Red Ticket (Sanctuary Passport)
```text
A vintage-style modern embossed paper ticket in rich terracotta-ruby red, crisp gold foil letterpress typography reading 'THRIVEFOLD SANCTUARY PASS', serrated tear-off stub, gold foil stamped geometric leaf logo, high-end VIP voucher illustration.
```

---

### 6.3 Real Physical Equipment

#### Prompt PE1: Handcrafted Beechwood Pushup Parallettes
```text
Commercial product photograph of a pair of ergonomic pushup parallettes made from solid Scandinavian beechwood, smooth curved handles, non-slip natural Portuguese cork base pads, subtle laser-engraved Thrivefold leaf icon on the wood side, set on a honed travertine stone floor with soft linen gym towel, luxury fitness equipment photography.
```

#### Prompt PE2: Precision Aluminum Gyroball Powerball
```text
Studio product photograph of an ergonomic matte charcoal-anodized aluminum gyro powerball, visible solid brass rotor through a high-clarity polycarbonate window, non-slip silicone grip band around the equator, sleek physical therapy tool, soft rim studio lighting, subtle laser-etched brand logo on housing.
```

#### Prompt PE3: Ergonomic Hex Barbell Grips
```text
A pair of thick ergonomic barbell dumbbell grips molded from durable food-grade silicone in warm terracotta clay and muted forest sage, diamond knurl textured grip surface, angled ergonomic palm contour, studio fitness gear display on limestone plinth, subtle debossed logo.
```

#### Prompt PE4: Hardcover Linen Journal & Solid Brass Pen
```text
Overhead flat-lay photograph of a luxury A5 hardcover journal bound in sage-green tactile Japanese bookcloth with gold foil-stamped geometric Thrivefold emblem, resting alongside a heavy solid brass twist-action ballpoint pen and three cream affirmation cards, warm morning desk atmosphere, soft shadows.
```

#### Prompt PE5: Junior Cricket Set (Bat & Leather Ball)
```text
Product photograph of a premium junior cricket bat carved from hand-picked English willow with clean straight grains, pristine white rubber grip with a sage-green ring, resting beside a hand-stitched deep cherry-red leather cricket ball with white seam, laid out on natural linen fabric, luxury sports gear aesthetic.
```

---

### 6.4 Real Services & Consultations

#### Prompt SC1: Certified Health Coach Session
```text
An elegant digital booking card illustration: a warm minimalist sanctuary consultation room with a comfortable linen armchair, a healthy fiddle-leaf fig plant, warm afternoon window light, a small wooden side table with a cup of herbal tea and a notepad, cozy, trustworthy, accredited health guidance, gentle terracotta and pista accents, subtle brand watermark.
```

#### Prompt SC2: Verified Medical Doctor Telehealth
```text
A clean, welcoming clinical consultation badge: a stethoscope coiled neatly on an oak desk beside an open health chart and a warm terracotta ceramic mug, soft diffuse natural clinic lighting, reassuring and professional, confidential healthcare illustration, delicate Thrivefold seal watermark.
```

#### Prompt SC3: Farm-to-Table Organic Meal Voucher
```text
A beautiful healthy bowl of nourishing whole foods: avocado slices, quinoa, roasted sweet potato wedges, crisp leafy greens, and pomegranate seeds in a rustic terracotta bowl, wooden cutlery beside it, bright clean natural lighting, appetising organic nutrition illustration.
```

---

## 7. Store Implementation & Data Structures

### Store Slice (`src/stores/slices/rewardsSlice.ts`)

```typescript
export interface ShippingDetails {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface PhysicalOrderRecord {
  orderId: string;
  itemType: 'gym_equipment' | 'sports_kids' | 'stationery' | 'consultation' | 'food';
  itemName: string;
  ticketsPaid: number;
  orderTimestamp: number;
  status: 'ordered' | 'dispatched' | 'delivered';
  trackingNumber?: string;
  shipping: ShippingDetails;
}

export interface RewardsSlice {
  // Points & Levels
  xp: number;
  level: number;
  xpToNextLevel: number;
  
  // Currencies
  amberGems: number;
  goldenGems: number;
  redTickets: number;
  
  // Unlocked Rewards & Chests
  availableChests: Array<{ id: string; tier: 'wooden' | 'vault' | 'sunburst' | 'reliquary' }>;
  unlockedStickers: string[];
  activeEmblemTitle: string;
  physicalOrders: PhysicalOrderRecord[];
  
  // Actions
  addXp: (points: number, reason: string) => void;
  openChest: (chestId: string) => { amber: number; golden: number; tickets: number; sticker?: string };
  convertGemsToTickets: (gemAmount: number) => boolean;
  orderPhysicalReward: (itemName: string, ticketCost: number, shipping: ShippingDetails) => string;
}
```

---

## 8. Step-by-Step Implementation Roadmap

1. **Step 1**: Expand `rewardsSlice.ts` to support XP leveling, Amber/Golden gems, Red Tickets, and order queues.
2. **Step 2**: Build the interactive **Animated Loot Box Modal** (`src/components/rewards/LootBoxModal.tsx`) with Reanimated spring physics, Skia lighting, and card flip sequences.
3. **Step 3**: Build the **Sanctuary Marketplace Screen** (`src/app/(app)/marketplace.tsx`) divided into:
   - Digital Stickers & Badges (Amber Gems)
   - Golden Perks & Companion Studios (Golden Gems)
   - Real Physical Equipment, Sports Gifts, Doctors & Meals (Red Tickets)
4. **Step 4**: Integrate the Camera button into `GlobalVoiceAssistant.tsx` and `MedFlow` so users directly earn XP/Gems when verifying pills and meals.
5. **Step 5**: Write unit tests in `tests/unit/rewards-economy.test.ts` to verify 100% test coverage for level calculations, anti-fraud cooldowns, and ticket conversions.
