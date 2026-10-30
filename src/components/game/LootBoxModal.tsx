import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RewardAssets } from '../../constants/assets';
import type { LevelChest } from '../../domain/game/rewards';
import { hapticHeavy, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';

type Stage = 'idle' | 'opening' | 'burst' | 'revealed';

function getChestAssets(level: number) {
  if (level >= 100) return RewardAssets.chests.tier5;
  if (level >= 50) return RewardAssets.chests.tier4;
  if (level >= 20) return RewardAssets.chests.tier3;
  if (level >= 10) return RewardAssets.chests.tier2;
  return RewardAssets.chests.tier1;
}

function getCardAsset(cardId: string) {
  switch (cardId) {
    case 'card_apex_thrivemaster':
      return RewardAssets.cards.apexThrivemaster;
    case 'card_mindful_voyager':
    case 'card_ecosystem_relic':
      return RewardAssets.cards.mindfulVoyager;
    case 'card_sanctuary_sentinel':
      return RewardAssets.cards.sanctuarySentinel;
    case 'card_grounded_seeker':
    default:
      return RewardAssets.cards.groundedSeeker;
  }
}

/**
 * Level chest opening (reward spec §1, approach B): idle bob → tap → rattle → burst with spinning
 * rays → card flips up with the gems. The chest is credited on tap, before the animation, so
 * closing early never loses it. Runs on the UI thread and respects reduced motion.
 */
export function LootBoxModal({ chest, onClose }: { chest: LevelChest | null; onClose: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const openChest = useRootStore((s) => s.openChest);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>('idle');

  const bob = useSharedValue(0);
  const tilt = useSharedValue(0);
  const chestScale = useSharedValue(1);
  const rays = useSharedValue(0);
  const raysOpacity = useSharedValue(0);
  const flip = useSharedValue(90);

  useEffect(() => {
    if (!chest) return;
    flip.set(90);
    raysOpacity.set(0);
    chestScale.set(1);
    tilt.set(0);
    bob.set(
      reduced
        ? 0
        : withRepeat(
            withTiming(-8, {
              duration: 900,
              easing: Easing.inOut(Easing.quad),
            }),
            -1,
            true,
          ),
    );
    return () => cancelAnimation(bob);
  }, [chest, reduced, bob, flip, raysOpacity, chestScale, tilt]);

  const reveal = () => {
    setStage('revealed');
    hapticSuccess();
  };

  const open = () => {
    if (!chest || stage !== 'idle') return;
    if (!openChest(chest.level)) return onClose();
    setStage('opening');
    hapticHeavy();
    cancelAnimation(bob);
    bob.set(withTiming(0, { duration: 120 }));
    const rattle = reduced ? 0 : 6;
    tilt.set(
      withSequence(...Array.from({ length: rattle }, (_, i) => withTiming(i % 2 ? -9 : 9, { duration: 70 })), withTiming(0, { duration: 70 })),
    );
    const burstAt = reduced ? 0 : rattle * 70 + 70;
    chestScale.set(withDelay(burstAt, withSequence(withTiming(1.2, { duration: 160 }), withTiming(0.0, { duration: 240 }))));
    raysOpacity.set(withDelay(burstAt, withTiming(1, { duration: 200 })));
    rays.set(reduced ? 0 : withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false));
    flip.set(
      withDelay(
        burstAt + 320,
        withSpring(0, { damping: 12, stiffness: 120 }, (done) => done && runOnJS(reveal)()),
      ),
    );
  };

  const chestStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${tilt.value}deg` }, { scale: chestScale.value }],
  }));
  const raysStyle = useAnimatedStyle(() => ({
    opacity: raysOpacity.value,
    transform: [{ rotate: `${rays.value}deg` }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 89 ? 1 : 0,
    transform: [{ perspective: 800 }, { rotateY: `${flip.value}deg` }],
  }));

  if (!chest) return null;
  const chestArt = getChestAssets(chest.level);
  const cardArt = getCardAsset(chest.card.id);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.scrim, { backgroundColor: colors.scrim }]}>
        <View style={[styles.panel, { backgroundColor: colors.background }]}>
          <Text style={[typography.heading, { color: colors.text.primary, textAlign: 'center' }]}>{chest.title}</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>Level {chest.level} reached</Text>

          <View style={styles.stage}>
            <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
              {Array.from({ length: 12 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ray,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ rotate: `${i * 30}deg` }],
                    },
                  ]}
                />
              ))}
            </Animated.View>
            <Animated.View style={chestStyle}>
              <PressableScale onPress={open} disabled={stage !== 'idle'} accessibilityRole="button" accessibilityLabel={`Open ${chest.title}`}>
                <View style={styles.chest}>
                  <Image
                    source={stage === 'burst' || stage === 'revealed' ? chestArt.burst : chestArt.closed}
                    style={styles.chestImg}
                    contentFit="contain"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                </View>
              </PressableScale>
            </Animated.View>
            <Animated.View style={[styles.cardWrap, cardStyle]} pointerEvents="none">
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Image source={cardArt} style={styles.cardCover} contentFit="cover" transition={150} cachePolicy="memory-disk" />
                <View style={styles.cardFooter}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{chest.card.rarity.toUpperCase()} CARD</Text>
                  <Text style={[typography.subheading, { color: colors.text.primary, textAlign: 'center' }]} numberOfLines={1}>
                    {chest.card.title}
                  </Text>
                  <View style={styles.gems}>
                    <Image source={RewardAssets.currencies.amberGem} style={styles.gemIcon} contentFit="contain" transition={150} cachePolicy="memory-disk" />
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>+{chest.gems} Amber Gems</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>

          {stage === 'idle' ? (
            <Text style={[typography.body, { color: colors.text.secondary }]}>Tap the chest to unlock your loot</Text>
          ) : stage === 'revealed' ? (
            <Button label="Claim & Continue" onPress={onClose} />
          ) : (
            <View style={{ height: 44 }} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 380, alignItems: 'center', borderRadius: 28, paddingVertical: 24, paddingHorizontal: 16 },
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stage: {
    width: 280,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  rays: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 6,
    height: 320,
    borderRadius: 3,
    opacity: 0.35,
  },
  chest: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestImg: {
    width: 190,
    height: 190,
  },
  cardWrap: { position: 'absolute' },
  card: {
    width: 220,
    height: 320,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardCover: {
    width: 220,
    height: 220,
  },
  cardFooter: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  gems: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  gemIcon: { width: 20, height: 20 },
});
