# Thrivefold — Master Economic Architecture, Loot Box Video/Animation Pipeline & Transparent Asset Specification

> **Version**: 4.5.0 (Unified Real Physical Rewards, Video Opening Sprites & Transparent Asset Engine)  
> **Status**: Approved Master Specification  
> **Ecosystem**: AnvayKosh / Thrivefold  
> **Engine Compatibility**: React Native Reanimated 3, Skia, Expo Video (`expo-video`), Lottie / Rive  
> **Palette Harmony**: Pista (`#7A8A6D`), Terracotta (`#D06543`), Amber Gold (`#DEB05C`), Radiant Ruby (`#C24136`), Cream (`#FAF7F2`), Pure Chroma Key (`#00FF00`)

---

## 1. Executive Implementation Plan: Video vs. Reanimated Spritesheet

To deliver an exhilarating 60fps console-grade loot box opening experience on Android & iOS without UI stutter or memory spikes, Thrivefold supports two synchronized playback engines:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              LOOT BOX OPENING DUAL-PIPELINE ARCHITECTURE                              │
├────────────────────────────────┬───────────────────────────────────────┬───────────────────────────────┤
│ Sequence Stage                 │ Approach A: Video Playback (expo-video)│ Approach B: Reanimated Physics │
├────────────────────────────────┼───────────────────────────────────────┼───────────────────────────────┤
│ 1. Idle Chest Hover            │ 2-sec loopable WebM/MP4 (alpha)       │ Isolated Transparent PNG + Bob │
│ 2. Tap to Unlock               │ Immediate trigger + hapticHeavy       │ 500ms spring press (scale 0.9)│
│ 3. Anticipation Rattle         │ Video frames 0:00 to 0:01             │ Reanimated rotate oscillation │
│ 4. Explosive Burst             │ Video burst frames 0:01 to 0:02.5     │ Instant switch to Burst PNG   │
│ 5. Continuous Shimmer Rays     │ Embedded video particle glow          │ Skia rotating 360° Sunburst   │
│ 6. Loot Reveal (Cards/Gems)    │ UI elements rise at video end timestamp│ 3D Y-axis Card Flip & Rise    │
└────────────────────────────────┴───────────────────────────────────────┴───────────────────────────────┘
```

> **Why both?**  
> - **Video Engine (`expo-video`)**: Plays a pre-rendered 2.5-second cinematic clip with baked volumetric lighting, god rays, and floating crystal embers.
> - **Native Sprite Engine (Reanimated 3 + Skia)**: Works 100% offline with zero network download, ultra-low 2MB memory footprint, instant zero-latency loading, and device-synced haptics.

---

## 2. Hard-Earned Scarcity Math & Retention Multipliers

Gems, Tickets, and Tokens represent genuine health habit adherence. **They are never inflated or given away easily.**

### The 4-Tier Transformation Hierarchy:
```
[Verified Health Habit] ──► [XP & Leveling] ──► [Scarce Amber Gems] ──► [Sanctuary Tickets] ──► [Marketplace Tokens] ──► [Real Physical Gear]
```
- **1 Level Up** = Unlocks **1 Tiered Loot Box** (containing 15–50 Gems, rare Card Drops, or Stickers).
- **500 Amber Gems** ➔ Forge **1 Silver Sanctuary Ticket** (Voucher / Status Tier).
- **5 Sanctuary Tickets** (2,500 Gems equivalent) ➔ Forge **1 Golden Marketplace Token**.
- **10 to 45 Marketplace Tokens** ➔ Direct redemption for **real physical workout gear and verified services** delivered to the user's doorstep.

### Streak Retention Multipliers:
Habit consistency exponentially accelerates progression:
- **3-Day Streak ("Spark of Routine")**: `1.2x XP & Gem Multiplier`
- **7-Day Streak ("Sanctuary Habit")**: `1.5x Multiplier` + Guaranteed Loot Box Bonus Drop
- **30-Day Streak ("Zenith Mastery")**: `2.5x Multiplier` + Mythic Golden Gem Token Fragment

---

## 3. The 5 Chest Tiers: Transparent Asset & Video Generation Prompts

All image prompts strictly enforce:
1. **Isolated Chroma Key Background `#00FF00`**: Pure bright green background with razor-sharp edges and zero floor shadows for instant 1-click alpha transparency cutout (`PNG-32`).
2. **Debossed Brand Insignia**: The geometric Thrivefold logo ("T" tree trunk with twin sage leaf arch) is visibly engraved or watermarked into every piece.
3. **Nordic-Japanese Palette**: Pista (`#7A8A6D`), Terracotta (`#D06543`), Beechwood Cream (`#FAF7F2`), and Champagne Gold (`#DEB05C`).

---

### TIER 1 (LEVEL 5): WOODEN SANCTUARY CHEST (COMMON MILESTONE)

#### A. Idle / Unopened State (Transparent PNG Prompt):
```text
A handcrafted Scandinavian beechwood wellness treasure chest, closed lid, brushed matte brass corner brackets and curved organic brass clasp, smooth satin natural wood grain, prominent laser-engraved geometric Thrivefold 'T' tree leaf emblem centered on the front face, soft warm amber glow seeping faintly through the lid seam, 3D isometric angle, isolated on a pure solid bright green chroma key background #00FF00, zero floor shadows, razor-sharp cutout silhouette, studio lighting, 8k render.
```

#### B. Anticipation Rattle Keyframe (Transparent PNG Prompt):
```text
The handcrafted Scandinavian beechwood treasure chest vibrating in anticipation, lid slightly bucking open by 10 degrees, intense radiant amber-gold light beams escaping from the interior cracks, brass latch glowing with heat, isolated on a pure solid bright green chroma key background #00FF00, zero cast shadows, crisp vector-like 3D cutout, 8k render.
```

#### C. Burst Open Keyframe (Transparent PNG Prompt):
```text
The Scandinavian beechwood chest blown wide open at a 110-degree angle, interior lined with dusty-olive velvet, crisp laser-engraved Thrivefold logo embossed under the open lid, dazzling explosion of warm amber-gold sunbeams and floating crystal embers erupting upward and outward, isolated on a pure solid bright green chroma key background #00FF00, zero ground shadows, game celebratory visual effect overlay asset, 8k render.
```

#### D. Cinematic 2.5s Video Opening Prompt (For Runway Gen-3 / Luma Dream Machine / Kling / Sora):
```text
A 2.5-second cinematic 3D macro animation of a Scandinavian beechwood treasure chest centered on a clean cream travertine surface. 0.0s to 0.8s: Chest rests peacefully, then begins to rumble with soft amber light pulsating through the lid seam. 0.9s: The brass clasp pops open with an energetic bounce. 1.0s to 2.5s: The lid swings violently open to 110 degrees, unleashing a glorious vertical eruption of golden sunbeams, floating amber crystals, glowing terracotta particles, and a shimmering holographic card that ascends and floats in mid-air. Studio rim lighting, slow-motion physics, 60fps, luxury wellness achievement aesthetic.
```

---

### TIER 2 (LEVEL 10): TERRACOTTA SANCTUARY VAULT (RARE MILESTONE)

#### A. Idle / Unopened State (Transparent PNG Prompt):
```text
A heavy hexagonal vault box molded from smooth terracotta clay ceramic with brushed oxidized copper rim reinforcements and an interlocking mechanical combination dial, high-relief debossed Thrivefold geometric emblem on the central front dial, subtle sage-green light radiating through geometric lattice vents on the sides, isometric perspective, isolated on pure solid bright green chroma key background #00FF00, zero cast shadows, razor-sharp edge cutout, 8k product render.
```

#### B. Anticipation Rattle Keyframe (Transparent PNG Prompt):
```text
The hexagonal terracotta vault shaking with tectonic energy, mechanical copper dials spinning with motion blur, emerald-green and amber light pulsing violently through the side vents, isolated on pure solid bright green chroma key background #00FF00, zero floor shadows, sharp transparent asset, 8k render.
```

#### C. Burst Open Keyframe (Transparent PNG Prompt):
```text
The hexagonal terracotta vault blooming open like a mechanical flower, heavy ceramic panels sliding back, intense blinding emerald and warm amber volumetric light blast erupting from the core, floating copper leaf particles and glowing silver tickets floating in mid-air, debossed Thrivefold emblem clearly visible on the folded top lid, isolated on pure solid bright green chroma key background #00FF00, zero shadows, 8k render.
```

#### D. Cinematic 2.5s Video Opening Prompt:
```text
A 2.5-second cinematic 3D animation of a hexagonal terracotta ceramic vault. 0.0s to 0.7s: The vault sits solidly, its oxidized copper dial begins clicking and spinning rapidly. 0.8s to 1.5s: Interlocking ceramic facets slide outwards with mechanical precision as brilliant sage-green and gold laser rays blast through the seams. 1.6s to 2.5s: The vault blossoms completely open, releasing a shockwave of floating golden coins and ancient jade sparks into the air, settling into an ethereal glow. 60fps, hyper-realistic texture detail, Apple-style product reveal.
```

---

### TIER 3 (LEVEL 20): GOLDEN SUNBURST TROVE (EPIC MILESTONE)

#### A. Idle / Unopened State (Transparent PNG Prompt):
```text
An octagonal reliquary chest forged from brushed champagne gold and frosted ivory glass panels, delicate engraved celestial ray lines radiating from the center, intense pulsating amber-gold core visible through the frosted glass, gold-foil stamped Thrivefold leaf emblem in the center of the lid, floating 3 centimeters in isometric 3D space, isolated on solid bright green chroma key background #00FF00, zero floor shadows, pristine clipping path, 8k render.
```

#### B. Anticipation Rattle Keyframe (Transparent PNG Prompt):
```text
The champagne gold octagonal trove trembling in mid-air, frosted glass panels glowing with blinding solar intensity, golden light bursting violently from the panel seams, isolated on solid bright green chroma key background #00FF00, zero cast shadows, transparent VFX asset, 8k.
```

#### C. Burst Open Keyframe (Transparent PNG Prompt):
```text
The champagne gold octagonal trove springing wide open dynamically, magnificent 360-degree shockwave of golden sparkles, floating holographic cards and golden marketplace tokens radiating outwards, intense divine god rays blasting into the camera, gold-stamped Thrivefold brand emblem inside the open lid, isolated on solid bright green chroma key background #00FF00, zero shadows, alpha cutout ready, 8k render.
```

#### D. Cinematic 2.5s Video Opening Prompt:
```text
A 2.5-second cinematic animation of an octagonal champagne gold and frosted glass chest floating in mid-air. 0.0s to 0.8s: Chest levitates and spins slowly as an internal golden sun pulsates brightly through the glass. 0.9s: Chest pauses and fractures with pure blinding white-gold light. 1.0s to 2.5s: The lid explodes upward into floating golden petals, releasing a swirling cosmic vortex of golden coins, rainbow holographic cards, and glowing celestial dust rings that expand outward in slow-motion. 60fps, pristine museum lighting, ultra-luxurious.
```

---

### TIER 4 (LEVEL 50): ECOSYSTEM RELIC BOX (LEGENDARY MILESTONE)

#### A. Idle / Unopened State (Transparent PNG Prompt):
```text
A futuristic ancient monolithic cube chest constructed from dark obsidian slate stone, inlaid with glowing vein-like pista-green jade circuitry lines and warm copper trims, a central spherical amber gyro lock embedded in the front face with debossed Thrivefold logo, ambient glowing embers hovering tightly around edges, isometric view, isolated on solid bright green chroma key background #00FF00, razor-sharp silhouette cutout, 8k render.
```

#### B. Burst Open Keyframe (Transparent PNG Prompt):
```text
The dark obsidian cube chest dismantling into levitating modular blocks, revealing a pulsing crystalline emerald and amber power core, swirling vortex of glowing jade sparks and golden ticket scrolls rising upward, debossed Thrivefold seal visible on the core plinth, isolated on solid bright green chroma key background #00FF00, zero ground shadows, 8k render.
```

#### C. Cinematic 2.5s Video Opening Prompt:
```text
A 2.5-second cinematic animation of a dark obsidian monolith cube inlaid with glowing green jade circuits. 0.0s to 0.8s: The central amber gyro sphere rotates rapidly, unlocking ancient stone mechanisms. 0.9s to 2.5s: The obsidian cube splits into levitating geometric segments that float gracefully in zero gravity, releasing an energetic green jade aurora borealis and a cascade of rare golden marketplace tokens that orbit the central glowing core. Smooth 60fps, sci-fi zen aesthetics.
```

---

### TIER 5 (LEVEL 100): GRAND MASTER RELIQUARY (MYTHIC PHYSICAL GEAR UNLOCK)

#### A. Idle / Unopened State (Transparent PNG Prompt):
```text
A royal wellness reliquary chest sculpted from solid white Carrara marble with ornate 24k gold leaf inlay, polished terracotta fluted corner pillars, illuminated cut-amber diamond crest set into the lock mechanism with miniature Thrivefold emblem etched into the diamond face, floating regally, isolated on solid bright green chroma key background #00FF00, zero shadows, sharp outline, pristine transparent PNG asset, 8k masterpiece render.
```

#### B. Burst Open Keyframe (Transparent PNG Prompt):
```text
The white Carrara marble royal chest gracefully opening, heavenly god rays cascading through the open marble lid, a solid gold Marketplace Token and physical merchandise vouchers levitating into the air wrapped in golden ribbon energy, miniature Thrivefold monogram gleaming inside the lid, isolated on solid bright green chroma key background #00FF00, transparent PNG asset, 8k render.
```

#### C. Cinematic 2.5s Video Opening Prompt:
```text
A 2.5-second cinematic video of a pristine white Carrara marble and gold reliquary chest. 0.0s to 0.8s: The chest levitates with serene majesty as the diamond lock emits brilliant warm sunbeams. 0.9s to 2.5s: The marble lid glides open with weightless elegance, unleashing an ethereal cloud of golden glitter, angelic soft light rays, and a solid minted gold coin that flips in slow-motion and faces the camera. Grand master achievement climax, 60fps, highest visual fidelity.
```

---

## 4. Master Prompts for All Loot Drops, Cards, Badges & Stickers

Every dropped item is generated against pure `#00FF00` chroma key for instant alpha transparency:

### A. Currencies & Vouchers:

#### 1. Scarce Amber Gem (Daily Currency):
```text
A solitary glowing faceted emerald-cut amber-gold gemstone, glowing from within with warm terracotta and pista-green internal refractions, beveled crystal facets, miniature Thrivefold geometric emblem subtly debossed into the center face, floating upright at a slight 15-degree angle, isolated on solid bright green chroma key background #00FF00, zero cast shadows, clean transparent PNG UI game token, 8k.
```

#### 2. Golden Gem (Mythic Currency):
```text
A radiant royal golden gemstone shaped as an eight-pointed star crystal, intense warm gold iridescence, mirror-polished crystal facets, miniature Thrivefold geometric emblem debossed on center, isolated on solid bright green chroma key background #00FF00, zero shadows, transparent icon asset, 8k.
```

#### 3. Silver Sanctuary Ticket (500 Gems Forge):
```text
A heavy metallic silver and sage-green luxury passport ticket, debossed letterpress typography reading 'THRIVEFOLD SANCTUARY PASS', intricate guilloche security line patterns, stamped with a shimmering gold-foil geometric Thrivefold logo in center, perforated tear-off stub, floating in 3D perspective, isolated on solid bright green chroma key background #00FF00, zero ground shadows, 8k render.
```

#### 4. Golden Marketplace Token Coin (5 Tickets Forge — Physical Merch Currency):
```text
A solid heavy commemorative bronze-gold token coin, high-relief minted Thrivefold geometric logo in the center obverse face, reeded edge rim, satin finish with polished mirror ridges, floating at a dynamic 30-degree tilt, isolated on solid bright green chroma key background #00FF00, zero shadows, clean transparent asset, 8k render.
```

#### 5. 2X Habit XP Booster Talisman:
```text
Isometric glowing speed talisman made of translucent sage-green jade glass with an embedded floating golden flame and '2X' insignia, soft glowing aura, debossed Thrivefold leaf emblem on the top face, isolated on solid bright green chroma key background #00FF00, zero cast shadows, game badge UI asset, 8k.
```

#### 6. Radial Sunburst Aura Ray (Continuous 360° Background Spinner):
```text
A transparent circular burst of 16 delicate translucent golden and sage-green light rays expanding outward from an empty center, soft feathered edges, glowing sunbeam halo, isolated on solid pure black background (for screen blend mode) or solid bright green chroma key background #00FF00, clean VFX overlay asset.
```

---

### B. Collector Cards (Card Back & Fronts):

#### 1. Universal Holographic Card Back:
```text
A vertical luxury collector card floating in 3D space, smooth rounded corners, deep matte terracotta background texture with an intricate geometric mandala of concentric sage-green lines, centered with a metallic gold-foil stamped Thrivefold geometric logo, holographic rainbow edge foil reflecting studio light, isolated on solid bright green chroma key background #00FF00, zero shadows, clean PNG asset, 8k.
```

#### 2. Card Front: "Grounded Seeker" (Tier 1 Common):
```text
A vertical luxury collector tarot-style card with smooth rounded corners, thick matte cream cotton paper texture, embossed terracotta circular labyrinth mandala in the center with an earthen stone icon, brushed bronze foil border line, centered Thrivefold geometric emblem at the top, elegant typography reading 'GROUNDED SEEKER', soft bevel shadows, isolated on solid bright green chroma key background #00FF00, 8k.
```

#### 3. Card Front: "Sanctuary Sentinel" (Tier 2 Rare):
```text
A vertical luxury collector card with smooth rounded corners, deep sage-pista green brushed silk texture, centered with a high-relief silver-foil shield containing an olive branch and interlocking geometric rings, silver metallic beveled edges, typography reading 'SANCTUARY SENTINEL', subtle Thrivefold watermark, isolated on solid bright green chroma key background #00FF00, 8k.
```

#### 4. Card Front: "Mindful Voyager" (Tier 3 Epic):
```text
A vertical luxury collector card, midnight indigo and brushed champagne gold finish, centered with a geometric astrolabe compass and rising morning sun motif, glowing gold foil linework, typography reading 'MINDFUL VOYAGER', Thrivefold logo insignia at the header, isolated on solid bright green chroma key background #00FF00, 8k.
```

#### 5. Card Front: "Apex Thrivemaster" (Tier 5 Mythic):
```text
A vertical ultra-luxury collector card made of polished black obsidian and 24k mirror gold inlay, centered with a radiant multi-layered sacred geometry star flower with an embedded floating amber gem, iridescent edge gilding, typography reading 'APEX THRIVEMASTER', prominent Thrivefold royal crest, isolated on solid bright green chroma key background #00FF00, 8k masterpiece.
```

---

### C. Digital Habit Stickers (100 Gems Each):

1. **The Meditating Zen Fox**:
   ```text
   A charming minimalist Scandinavian-style illustrated red fox sitting in calm lotus meditation posture, closed eyes, small floating green sage leaf above its head, clean smooth rounded vector lines, warm terracotta and cream palette, subtle debossed Thrivefold logo on its chest, sticker with white border outline, isolated on solid bright green chroma key background #00FF00, 8k.
   ```
2. **The Living Hydration Drop**:
   ```text
   A gentle translucent teardrop water character smiling peacefully, containing a miniature green fern sprout inside the water, glowing soft turquoise and pista-green, sticker with white die-cut border, Thrivefold leaf watermark, isolated on solid bright green chroma key background #00FF00, 8k.
   ```
3. **The Slumber Moon**:
   ```text
   A golden crescent moon resting on a soft cream cloud wearing a peaceful sleeping nightcap, surrounded by 3 tiny glowing amber stars, warm comforting bedtime wellness sticker with white border, isolated on solid bright green chroma key background #00FF00, 8k.
   ```
4. **The Morning Stride Shoes**:
   ```text
   A stylish pair of barefoot-style natural canvas walking trainers tied with sage laces, subtle green plant sprout growing out of the heel tab, crisp sticker with white border, Thrivefold emblem on the tongue, isolated on solid bright green chroma key background #00FF00, 8k.
   ```

---

### D. Real Physical Gear & Open Marketplace Merch (Tokens):

#### 1. Handcrafted Beechwood Pushup Bars:
```text
A pair of ergonomic solid Scandinavian beechwood pushup parallettes, non-slip natural rubber padded feet, laser-engraved Thrivefold geometric 'T' leaf logo on the side of each wooden handle, resting on clean floor, isolated on solid bright green chroma key background #00FF00, zero shadows, commercial product photography, 8k.
```

#### 2. Precision Gyroball Wrist Exerciser:
```text
A high-precision mechanical autostart metal gyroball wrist strengthener, transparent smoked-polycarbonate outer shell revealing a heavy spinning bronze and pista-green copper rotor inside, engraved Thrivefold leaf seal on the central silicone grip band, isolated on solid bright green chroma key background #00FF00, 8k product render.
```

#### 3. Heavy Adjustable Hand Grip Strengthener:
```text
A heavy-duty aluminum alloy hand gripper with knurled non-slip handles and a heavy-gauge black steel torsion spring, laser-etched Thrivefold brand mark on the aluminum handle, isolated on solid bright green chroma key background #00FF00, zero shadows, 8k.
```

#### 4. Hardcover Daily Health & Reflection Journal:
```text
A luxury thick A5 hardcover wellness journal bound in sage-green natural bookcloth linen, copper-gilt page edges, debossed gold-foil Thrivefold logo on the front cover, satin ribbon bookmark, resting at an isometric angle, isolated on solid bright green chroma key background #00FF00, 8k.
```

#### 5. Junior English Willow Cricket Bat & Ball Set:
```text
A premium junior handcrafted English willow cricket bat with a clean white and sage-green rubber chevron grip, debossed Thrivefold monogram sticker along the bat spine, paired with a natural leather seam ball, isolated on solid bright green chroma key background #00FF00, 8k product photo.
```

---

## 5. Open Marketplace Real Token Pricing Catalog

All items are unlocked exclusively through **Marketplace Tokens** (which require 5 Sanctuary Tickets / 2,500 Gems each) to preserve total anti-inflation integrity:

| Item Name | Category | Token Price | Equivalent Gems | Fulfillment Method |
|:---|:---|:---:|:---:|:---|
| **Ergonomic Beechwood Pushup Bars** | Fitness Gear | **10 Tokens** | 25,000 Gems | Doorstep Physical Delivery |
| **Precision Metallic Gyroball** | Fitness Gear | **12 Tokens** | 30,000 Gems | Doorstep Physical Delivery |
| **Heavy Knurled Hand Gripper** | Fitness Gear | **8 Tokens** | 20,000 Gems | Doorstep Physical Delivery |
| **Hardcover Linen Health Journal** | Stationery | **10 Tokens** | 25,000 Gems | Doorstep Physical Delivery |
| **Junior Willow Cricket Set** | Sports / Kids | **20 Tokens** | 50,000 Gems | Doorstep Physical Delivery |
| **Verified Doctor Telehealth Visit** | Clinical Service| **15 Tokens** | 37,500 Gems | Instant Digital Booking Voucher |
| **Organic Wholesome Meal Box (3 Days)**| Nutrition | **18 Tokens** | 45,000 Gems | Partner Kitchen Delivery |
| **"Apex Thrivemaster" Obsidian Card** | Collector Physical| **40 Tokens** | 100,000 Gems | Numbered Limited Metal Delivery |

---

## 6. Mobile Component Blueprint (`LootBoxModal.tsx`)

This production component handles both video playback and native Reanimated physics:

```tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { hapticMedium, hapticHeavy, hapticNotification } from '../../services/haptics/hapticService';
import { SoundService } from '../../services/sound/soundService';
import { Button } from '../ui/Button';

const { width } = Dimensions.get('window');

interface LootBoxModalProps {
  visible: boolean;
  tier: 'wooden' | 'vault' | 'sunburst' | 'relic' | 'reliquary';
  onClaim: () => void;
  reward: {
    gems: number;
    tickets: number;
    tokens?: number;
    cardTitle?: string;
  };
}

export const LootBoxModal: React.FC<LootBoxModalProps> = ({ visible, tier, onClaim, reward }) => {
  const [opened, setOpened] = useState(false);
  const chestScale = useSharedValue(0.2);
  const chestRotate = useSharedValue(0);
  const chestLidState = useSharedValue<'closed' | 'burst'>('closed');
  const sunburstRotate = useSharedValue(0);
  const cardTranslateY = useSharedValue(120);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setOpened(false);
      chestLidState.value = 'closed';
      chestScale.value = withSpring(1, { damping: 12, stiffness: 90 });
      cardTranslateY.value = 120;
      cardOpacity.value = 0;
      hapticMedium();

      // 1. Anticipation shake after 400ms
      setTimeout(() => {
        chestRotate.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 60 }),
            withTiming(5, { duration: 60 }),
            withTiming(0, { duration: 60 })
          ),
          4,
          false
        );
        hapticHeavy();
      }, 500);

      // 2. Explosive burst at 1000ms
      setTimeout(() => {
        chestLidState.value = 'burst';
        setOpened(true);
        SoundService.playChime();
        hapticNotification();

        // 3. Continuous Skia 360° Sunburst rotation
        sunburstRotate.value = withRepeat(
          withTiming(360, { duration: 14000, easing: Easing.linear }),
          -1
        );

        // 4. Card rises and emerges
        cardOpacity.value = withTiming(1, { duration: 400 });
        cardTranslateY.value = withSpring(-60, { damping: 12 });
      }, 1100);
    }
  }, [visible]);

  const sunburstStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sunburstRotate.value}deg` }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const chestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chestScale.value }, { rotate: `${chestRotate.value}deg` }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Continuous Rotating Sunburst */}
        {opened && (
          <Animated.View style={[styles.sunburst, sunburstStyle]}>
            <Image
              source={require('../../../assets/rewards/vfx_sunburst_ray.png')}
              style={styles.sunburstImg}
              contentFit="contain"
            />
          </Animated.View>
        )}

        {/* Dynamic Chest State */}
        <Animated.View style={[styles.chestContainer, chestStyle]}>
          <Image
            source={
              chestLidState.value === 'closed'
                ? require('../../../assets/rewards/chest_wooden_closed.png')
                : require('../../../assets/rewards/chest_wooden_burst.png')
            }
            style={styles.chestImg}
            contentFit="contain"
          />
        </Animated.View>

        {/* Floating Reward Card */}
        {opened && (
          <Animated.View style={[styles.rewardCard, cardStyle]}>
            <View style={styles.cardInner}>
              <Text style={styles.rewardTitle}>REWARD UNLOCKED</Text>
              <Text style={styles.gemText}>+{reward.gems} Amber Gems</Text>
              {reward.tickets > 0 && <Text style={styles.ticketText}>+{reward.tickets} Sanctuary Ticket</Text>}
              {reward.cardTitle && <Text style={styles.cardBadgeText}>{reward.cardTitle}</Text>}
              <Button title="Claim & Continue" onPress={onClaim} style={styles.claimButton} />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,22,20,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunburst: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
  },
  sunburstImg: {
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },
  chestContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestImg: {
    width: 260,
    height: 260,
  },
  rewardCard: {
    position: 'absolute',
    bottom: '22%',
    width: width * 0.82,
    alignItems: 'center',
  },
  cardInner: {
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#DEB05C',
  },
  rewardTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#D06543',
    marginBottom: 8,
  },
  gemText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1A18',
    marginBottom: 4,
  },
  ticketText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7A8A6D',
    marginBottom: 12,
  },
  cardBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#7A8A6D',
  },
});
```

---

## 7. Execution Checklist & Rules
1. **Rule 3 & REQ-014 (No Payments)**: Real money can never buy Gems, Tickets, or Tokens. Everything must be earned through verified daily health habits.
2. **Transparent PNG Export**: Every generated image using `#00FF00` chroma key can be converted with `ffmpeg` or sharp:
   ```bash
   ffmpeg -i asset_chroma.png -vf "chromakey=0x00FF00:0.1:0.2" -c:v png asset_transparent.png
   ```
3. **Thrivefold Brand Watermark**: Every prompt explicitly commands the debossed geometric "T" tree leaf monogram on the asset face, preserving ecosystem authenticity.
