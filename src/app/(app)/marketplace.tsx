import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppBottomSheetModal } from '../../components/ui/AppBottomSheetModal';
import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { LootBoxModal } from '../../components/game/LootBoxModal';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { RewardAssets } from '../../constants/assets';
import {
  chestKey,
  LEVEL_CHESTS,
  MARKET,
  type LevelChest,
  type MarketItem,
} from '../../domain/game/rewards';
import { hapticLight, hapticSuccess, hapticHeavy } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

type MarketplaceTab = 'market' | 'chests' | 'inventory';
type DigitalFilter = 'all' | 'cards' | 'badges' | 'stickers';

const TICKET_FORGE_GEMS = 500;
const TOKEN_FORGE_TICKETS = 5;
const TOKEN_FORGE_GEMS = 2500;

function getDigitalAssetSource(item: { id: string; assetKey?: string }): any {
  const key = item.assetKey;
  if (!key) return RewardAssets.currencies.amberGem;

  if (key in RewardAssets.stickers) {
    return RewardAssets.stickers[key as keyof typeof RewardAssets.stickers];
  }
  if (key in RewardAssets.cards) {
    return RewardAssets.cards[key as keyof typeof RewardAssets.cards];
  }
  if (key in RewardAssets.digitalBadges) {
    return RewardAssets.digitalBadges[key as keyof typeof RewardAssets.digitalBadges];
  }
  if (key in RewardAssets.currencies) {
    return RewardAssets.currencies[key as keyof typeof RewardAssets.currencies];
  }
  return RewardAssets.currencies.amberGem;
}

function getCardAsset(cardId: string): any {
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

function getChestAssets(level: number) {
  if (level >= 100) return RewardAssets.chests.tier5;
  if (level >= 50) return RewardAssets.chests.tier4;
  if (level >= 20) return RewardAssets.chests.tier3;
  if (level >= 10) return RewardAssets.chests.tier2;
  return RewardAssets.chests.tier1;
}

function getRarityVariant(cost: number): 'gold' | 'primary' | 'success' | 'neutral' {
  if (cost >= 2000) return 'gold';
  if (cost >= 800) return 'primary';
  if (cost >= 300) return 'success';
  return 'neutral';
}

function getRarityLabel(cost: number): string {
  if (cost >= 2000) return 'MYTHIC';
  if (cost >= 800) return 'EPIC';
  if (cost >= 300) return 'RARE';
  return 'COMMON';
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  // Root Store State
  const diamonds = useRootStore((s) => s.diamonds);
  const tickets = useRootStore((s) => s.tickets);
  const tokens = useRootStore((s) => s.tokens);
  const userLevel = useRootStore((s) => s.level);
  const marketOwned = useRootStore((s) => s.marketOwned);
  const activeSticker = useRootStore((s) => s.activeSticker);
  const rewardLedger = useRootStore((s) => s.rewardLedger);
  const buy = useRootStore((s) => s.buyMarketItem);
  const forgeTicket = useRootStore((s) => s.forgeTicket);
  const forgeToken = useRootStore((s) => s.forgeToken);
  const setActiveSticker = useRootStore((s) => s.setActiveSticker);
  const showAlert = useRootStore((s) => s.showAlert);

  // Screen Tabs & Filters
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('market');
  const [digitalFilter, setDigitalFilter] = useState<DigitalFilter>('all');

  // Modals & Sheets State
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [selectedChest, setSelectedChest] = useState<LevelChest | null>(null);
  const [showForgeSheet, setShowForgeSheet] = useState(false);
  const [unlockedSuccessItem, setUnlockedSuccessItem] = useState<MarketItem | null>(null);

  // Digital-only items: Exclude any physical items
  const digitalItems = useMemo(() => {
    return MARKET.filter((item) => !item.physical);
  }, []);

  const filteredItems = useMemo(() => {
    if (digitalFilter === 'all') return digitalItems;
    if (digitalFilter === 'cards') return digitalItems.filter((i) => i.id.startsWith('card_'));
    if (digitalFilter === 'badges') return digitalItems.filter((i) => i.id.startsWith('status_') || i.id.startsWith('badge_'));
    if (digitalFilter === 'stickers') return digitalItems.filter((i) => i.tier === 'sticker');
    return digitalItems;
  }, [digitalFilter, digitalItems]);

  // Owned Collector Cards from Ledger
  const ownedCards = useMemo(() => {
    const cardMap = new Map<string, LevelChest>();
    for (const chest of LEVEL_CHESTS) {
      if (rewardLedger.some((e) => e.key === chestKey(chest.level))) {
        cardMap.set(chest.card.id, chest);
      }
    }
    return Array.from(cardMap.values());
  }, [rewardLedger]);

  // Owned Digital Items mapped to full objects
  const ownedDigitalObjects = useMemo(() => {
    return marketOwned
      .map((id) => digitalItems.find((m) => m.id === id))
      .filter((item): item is MarketItem => Boolean(item));
  }, [digitalItems, marketOwned]);

  // Handle direct purchase of digital asset
  const handleConfirmPurchase = useCallback(
    (item: MarketItem) => {
      if (diamonds < item.cost) {
        showAlert({
          title: 'Need More Gems',
          message: `Unlocking ${item.title} requires ${item.cost.toLocaleString()} Amber Gems. You currently have ${diamonds.toLocaleString()} Gems. Complete daily mindful habits to earn more!`,
          confirmText: 'Understood',
          cancelText: null,
        });
        return;
      }

      showAlert({
        title: `Unlock ${item.title}?`,
        message: `Dedicate ${item.cost.toLocaleString()} Amber Gems to permanently unlock this digital asset to your sanctuary collection?`,
        confirmText: 'Unlock Asset',
        cancelText: 'Cancel',
        onConfirm: () => {
          const success = buy(item.id, 'gems');
          if (success) {
            hapticSuccess();
            setSelectedItem(null);
            setUnlockedSuccessItem(item);
          } else {
            showAlert({
              title: 'Transaction Incomplete',
              message: 'Could not complete the gem unlock. Please verify your balance and try again.',
              confirmText: 'OK',
              cancelText: null,
            });
          }
        },
      });
    },
    [buy, diamonds, showAlert],
  );

  // Handle Currency Forging
  const handleForgeTicketAction = useCallback(() => {
    if (diamonds < TICKET_FORGE_GEMS) {
      showAlert({
        title: 'Need More Gems',
        message: `Forging 1 Sanctuary Pass Ticket requires ${TICKET_FORGE_GEMS} Amber Gems. Your current balance is ${diamonds.toLocaleString()} Gems.`,
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }
    showAlert({
      title: 'Forge Sanctuary Ticket?',
      message: `Convert ${TICKET_FORGE_GEMS} Amber Gems into 1 Silver Sanctuary Ticket?`,
      confirmText: 'Forge Ticket',
      cancelText: 'Cancel',
      onConfirm: () => {
        forgeTicket();
        hapticSuccess();
      },
    });
  }, [diamonds, forgeTicket, showAlert]);

  const handleForgeTokenAction = useCallback(
    (useTicketsOption: boolean) => {
      if (useTicketsOption) {
        if (tickets < TOKEN_FORGE_TICKETS) {
          showAlert({
            title: 'Need More Tickets',
            message: `Forging 1 Golden Token requires ${TOKEN_FORGE_TICKETS} Tickets. Your balance is ${tickets} Tickets.`,
            confirmText: 'OK',
            cancelText: null,
          });
          return;
        }
        showAlert({
          title: 'Forge Golden Token?',
          message: `Convert ${TOKEN_FORGE_TICKETS} Sanctuary Tickets into 1 Golden Marketplace Token?`,
          confirmText: 'Forge Token',
          cancelText: 'Cancel',
          onConfirm: () => {
            forgeToken(true);
            hapticSuccess();
          },
        });
      } else {
        if (diamonds < TOKEN_FORGE_GEMS) {
          showAlert({
            title: 'Need More Gems',
            message: `Forging 1 Golden Token directly requires ${TOKEN_FORGE_GEMS.toLocaleString()} Amber Gems. Your balance is ${diamonds.toLocaleString()} Gems.`,
            confirmText: 'OK',
            cancelText: null,
          });
          return;
        }
        showAlert({
          title: 'Forge Golden Token?',
          message: `Convert ${TOKEN_FORGE_GEMS.toLocaleString()} Amber Gems into 1 Golden Marketplace Token?`,
          confirmText: 'Forge Token',
          cancelText: 'Cancel',
          onConfirm: () => {
            forgeToken(false);
            hapticSuccess();
          },
        });
      }
    },
    [diamonds, forgeToken, showAlert, tickets],
  );

  return (
    <ScreenContainer
      header={<AppHeader title="Sanctuary Treasury" showBack />}
      scrollMode="shell-scroll-view"
      contentContainerStyle={styles.scrollContent}
    >
        {/* Treasury Vault Balance Card */}
        <Card style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: colors.text.muted, letterSpacing: 0.8 }]}>
                OFFLINE VAULT TREASURY
              </Text>
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}>
                Digital Assets & Rewards
              </Text>
            </View>
            <Button
              label="Forge"
              variant="outline"
              size="sm"
              onPress={() => setShowForgeSheet(true)}
              icon={<Ionicons name="sparkles-outline" size={15} color={colors.primary} />}
            />
          </View>

          <View style={styles.currencyRow}>
            {/* Amber Gems */}
            <View style={styles.currencyCol}>
              <Image
                source={RewardAssets.currencies.amberGem}
                style={styles.currencyIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
                {diamonds.toLocaleString()}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Amber Gems</Text>
            </View>

            <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />

            {/* Sanctuary Tickets */}
            <View style={styles.currencyCol}>
              <Image
                source={RewardAssets.currencies.sanctuaryPass}
                style={styles.currencyIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
                {tickets.toLocaleString()}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Tickets</Text>
            </View>

            <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />

            {/* Unlocked Assets Count */}
            <View style={styles.currencyCol}>
              <Image
                source={RewardAssets.digitalBadges.emblemMark}
                style={styles.currencyIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
                {marketOwned.length + ownedCards.length}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Owned Assets</Text>
            </View>
          </View>
        </Card>

        {/* Primary Segmented Navigation Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PressableScale
            style={[styles.tabButton, activeTab === 'market' && { backgroundColor: colors.background }]}
            onPress={() => {
              hapticLight();
              setActiveTab('market');
            }}
          >
            <Ionicons
              name={activeTab === 'market' ? 'sparkles' : 'sparkles-outline'}
              size={18}
              color={activeTab === 'market' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'market' ? colors.primary : colors.text.secondary },
              ]}
            >
              Digital Market
            </Text>
          </PressableScale>

          <PressableScale
            style={[styles.tabButton, activeTab === 'chests' && { backgroundColor: colors.background }]}
            onPress={() => {
              hapticLight();
              setActiveTab('chests');
            }}
          >
            <Ionicons
              name={activeTab === 'chests' ? 'gift' : 'gift-outline'}
              size={18}
              color={activeTab === 'chests' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'chests' ? colors.primary : colors.text.secondary },
              ]}
            >
              Milestone Chests
            </Text>
          </PressableScale>

          <PressableScale
            style={[styles.tabButton, activeTab === 'inventory' && { backgroundColor: colors.background }]}
            onPress={() => {
              hapticLight();
              setActiveTab('inventory');
            }}
          >
            <Ionicons
              name={activeTab === 'inventory' ? 'albums' : 'albums-outline'}
              size={18}
              color={activeTab === 'inventory' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'inventory' ? colors.primary : colors.text.secondary },
              ]}
            >
              Collection ({marketOwned.length + ownedCards.length})
            </Text>
          </PressableScale>
        </View>

        {/* TAB 1: DIGITAL MARKET */}
        {activeTab === 'market' && (
          <View style={styles.tabContent}>
            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <Chip
                label="All Digital"
                selected={digitalFilter === 'all'}
                onPress={() => {
                  hapticLight();
                  setDigitalFilter('all');
                }}
              />
              <Chip
                label="Collector Cards"
                selected={digitalFilter === 'cards'}
                onPress={() => {
                  hapticLight();
                  setDigitalFilter('cards');
                }}
              />
              <Chip
                label="Badges & Talismans"
                selected={digitalFilter === 'badges'}
                onPress={() => {
                  hapticLight();
                  setDigitalFilter('badges');
                }}
              />
              <Chip
                label="Profile Stickers"
                selected={digitalFilter === 'stickers'}
                onPress={() => {
                  hapticLight();
                  setDigitalFilter('stickers');
                }}
              />
            </ScrollView>

            {/* Digital Asset Cards Grid */}
            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => {
                const isOwned = marketOwned.includes(item.id);
                const isEquipped = activeSticker === item.id;
                const asset = getDigitalAssetSource(item);
                const rarityLabel = getRarityLabel(item.cost);
                const rarityVariant = getRarityVariant(item.cost);

                return (
                  <PressableScale
                    key={item.id}
                    onPress={() => {
                      hapticLight();
                      setSelectedItem(item);
                    }}
                    style={styles.gridItemPressable}
                  >
                    <Card style={styles.itemCard}>
                      {/* High-Resolution Artwork Container */}
                      <View style={[styles.itemArtworkWrap, { backgroundColor: colors.surface2 }]}>
                        <Image
                          source={asset}
                          style={styles.itemImage}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                        <View style={styles.tierBadgeWrap}>
                          <Badge label={rarityLabel} variant={rarityVariant} />
                        </View>
                      </View>

                      {/* Card Content & Metadata */}
                      <View style={styles.itemBody}>
                        <Text style={[typography.subheading, { color: colors.text.primary }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text
                          style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>

                        {/* Price & Ownership Row */}
                        <View style={styles.priceRow}>
                          <View style={styles.gemPricePill}>
                            <Image
                              source={RewardAssets.currencies.amberGem}
                              style={styles.tinyGemIcon}
                              contentFit="contain"
                            />
                            <Text style={[typography.bodyBold, { color: colors.primary }]}>
                              {item.cost.toLocaleString()}
                            </Text>
                          </View>

                          {isOwned ? (
                            <Badge
                              label={isEquipped ? 'EQUIPPED' : 'OWNED'}
                              variant={isEquipped ? 'primary' : 'success'}
                            />
                          ) : diamonds >= item.cost ? (
                            <Badge label="UNLOCK" variant="primary" />
                          ) : (
                            <Badge label="NEED GEMS" variant="neutral" />
                          )}
                        </View>

                        {/* Quick Action Button */}
                        <View style={{ marginTop: spacing.sm }}>
                          {isOwned ? (
                            <Button
                              label={isEquipped ? 'Active Insignia' : 'Equip to Profile'}
                              variant={isEquipped ? 'outline' : 'secondary'}
                              size="sm"
                              onPress={() => {
                                hapticLight();
                                if (isEquipped) {
                                  setActiveSticker(null);
                                } else {
                                  setActiveSticker(item.id);
                                }
                              }}
                            />
                          ) : (
                            <Button
                              label={`Unlock • ${item.cost} Gems`}
                              variant="primary"
                              size="sm"
                              disabled={diamonds < item.cost}
                              onPress={() => {
                                hapticLight();
                                setSelectedItem(item);
                              }}
                            />
                          )}
                        </View>
                      </View>
                    </Card>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: MILESTONE CHESTS */}
        {activeTab === 'chests' && (
          <View style={styles.tabContent}>
            <View style={styles.chestsHero}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Milestone Level Reliquaries
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary, marginTop: 4 }]}>
                Deterministic progression chests unlocked by reaching key wellness levels. Each chest contains scarce
                Amber Gems and a rare collectible Sanctuary Card.
              </Text>
            </View>

            <View style={styles.chestsList}>
              {LEVEL_CHESTS.map((chest) => {
                const chestAssets = getChestAssets(chest.level);
                const isClaimed = rewardLedger.some((e) => e.key === chestKey(chest.level));
                const isEligible = userLevel >= chest.level;
                const cardArt = getCardAsset(chest.card.id);

                return (
                  <PressableScale
                    key={chest.level}
                    onPress={() => {
                      hapticHeavy();
                      setSelectedChest(chest);
                    }}
                  >
                    <Card style={styles.chestCard}>
                      <View style={styles.chestRow}>
                        {/* 3D Chest Render */}
                        <View style={styles.chestVisualWrap}>
                          <Image
                            source={isClaimed ? chestAssets.burst : chestAssets.closed}
                            style={styles.chestImage}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                          />
                        </View>

                        {/* Chest Info */}
                        <View style={styles.chestMeta}>
                          <View style={styles.chestHeaderRow}>
                            <Badge
                              label={`LEVEL ${chest.level}`}
                              variant={isClaimed ? 'neutral' : isEligible ? 'success' : 'primary'}
                            />
                            <Badge
                              label={isClaimed ? 'CLAIMED' : isEligible ? 'READY TO OPEN' : 'LOCKED'}
                              variant={isClaimed ? 'neutral' : isEligible ? 'gold' : 'neutral'}
                            />
                          </View>

                          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}>
                            {chest.title}
                          </Text>

                          {/* Guaranteed Drops Preview */}
                          <View style={styles.guaranteedDrops}>
                            <View style={styles.dropItem}>
                              <Image source={RewardAssets.currencies.amberGem} style={styles.dropIcon} contentFit="contain" />
                              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                                +{chest.gems} Gems
                              </Text>
                            </View>
                            <View style={styles.dropItem}>
                              <Image source={cardArt} style={styles.dropCardThumb} contentFit="cover" />
                              <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
                                {chest.card.title}
                              </Text>
                            </View>
                          </View>

                          {/* Action */}
                          <View style={{ marginTop: spacing.sm }}>
                            {isClaimed ? (
                              <View style={styles.claimedRow}>
                                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                                <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 6 }]}>
                                  Claimed • Tap to view Card
                                </Text>
                              </View>
                            ) : isEligible ? (
                              <Button
                                label="Open Reliquary Now"
                                variant="primary"
                                size="sm"
                                onPress={() => {
                                  hapticHeavy();
                                  setSelectedChest(chest);
                                }}
                                icon={<Ionicons name="gift" size={16} color="#FFF" />}
                              />
                            ) : (
                              <View style={styles.lockedRow}>
                                <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
                                <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 6 }]}>
                                  Reach Level {chest.level} to Unlock (Currently Lvl {userLevel})
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </Card>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: MY COLLECTION (INVENTORY) */}
        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            {/* Active Equipped Profile Insignia */}
            <Card style={styles.activeEquippedCard}>
              <Text style={[typography.caption, { color: colors.text.muted, letterSpacing: 0.8 }]}>
                ACTIVE PROFILE INSIGNIA
              </Text>
              {activeSticker ? (
                <View style={styles.activeEquippedRow}>
                  {(() => {
                    const activeObj = digitalItems.find((m) => m.id === activeSticker);
                    const asset = activeObj ? getDigitalAssetSource(activeObj) : null;
                    return (
                      <>
                        <Image source={asset} style={styles.activeEquippedImg} contentFit="contain" />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Text style={[typography.subheading, { color: colors.text.primary }]}>
                            {activeObj?.title ?? activeSticker}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                            Displayed prominently next to your name across your personal Sanctuary
                          </Text>
                        </View>
                        <Button
                          label="Unequip"
                          variant="outline"
                          size="sm"
                          onPress={() => {
                            hapticLight();
                            setActiveSticker(null);
                          }}
                        />
                      </>
                    );
                  })()}
                </View>
              ) : (
                <View style={styles.activeEquippedEmpty}>
                  <Ionicons name="shield-outline" size={32} color={colors.text.muted} />
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
                    No badge or sticker currently equipped. Choose any unlocked asset below!
                  </Text>
                </View>
              )}
            </Card>

            {/* Section 1: Milestone Collector Cards */}
            <View style={{ marginTop: spacing.lg }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Collector Cards ({ownedCards.length})
                </Text>
                <Badge label="CARDS" variant="gold" />
              </View>

              {ownedCards.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="albums-outline" size={36} color={colors.text.muted} />
                  <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
                    No milestone cards yet. Level up by completing healthy habits to open milestone reliquary chests!
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsGrid}>
                  {ownedCards.map((chest) => {
                    const cardArt = getCardAsset(chest.card.id);
                    return (
                      <Card key={chest.card.id} style={styles.collectorCardItem}>
                        <Image source={cardArt} style={styles.collectorCardImage} contentFit="cover" cachePolicy="memory-disk" />
                        <View style={styles.collectorCardBody}>
                          <Badge label={chest.card.rarity.toUpperCase()} variant="gold" />
                          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}>
                            {chest.card.title}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                            Level {chest.level} Relic Reward
                          </Text>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Section 2: Unlocked Digital Badges & Stickers */}
            <View style={{ marginTop: spacing.xl }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Unlocked Badges & Stickers ({ownedDigitalObjects.length})
                </Text>
                <Badge label="SANCTUARY VAULT" variant="primary" />
              </View>

              {ownedDigitalObjects.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="sparkles-outline" size={36} color={colors.text.muted} />
                  <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
                    Your digital vault is empty. Earn Amber Gems through everyday mindfulness and unlock badges in the Market!
                  </Text>
                </View>
              ) : (
                <View style={styles.inventoryGrid}>
                  {ownedDigitalObjects.map((item) => {
                    const isEquipped = activeSticker === item.id;
                    const asset = getDigitalAssetSource(item);

                    return (
                      <Card key={item.id} style={styles.inventoryCard}>
                        <View style={[styles.inventoryVisualWrap, { backgroundColor: colors.surface2 }]}>
                          <Image source={asset} style={styles.inventoryImg} contentFit="contain" cachePolicy="memory-disk" />
                        </View>
                        <View style={styles.inventoryBody}>
                          <Text style={[typography.captionBold, { color: colors.text.primary }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]} numberOfLines={1}>
                            {item.tier.toUpperCase()}
                          </Text>
                          <View style={{ marginTop: spacing.sm }}>
                            <Button
                              label={isEquipped ? 'Equipped' : 'Equip'}
                              variant={isEquipped ? 'primary' : 'outline'}
                              size="sm"
                              onPress={() => {
                                hapticLight();
                                if (isEquipped) {
                                  setActiveSticker(null);
                                } else {
                                  setActiveSticker(item.id);
                                }
                              }}
                            />
                          </View>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}

      {/* MODAL 1: DIGITAL ASSET DETAIL & UNLOCK SHEET */}
      <AppBottomSheetModal
        visible={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title ?? 'Digital Asset'}
      >
        {selectedItem && (
          <View style={styles.modalBody}>
            {/* Asset High-Res Showcase */}
            <View style={[styles.modalImageWrap, { backgroundColor: colors.surface2 }]}>
              <Image
                source={getDigitalAssetSource(selectedItem)}
                style={styles.modalImage}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>

            {/* Rarity & Title */}
            <View style={styles.modalMetaRow}>
              <Badge
                label={getRarityLabel(selectedItem.cost)}
                variant={getRarityVariant(selectedItem.cost)}
              />
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {selectedItem.tier.toUpperCase()} • SANCTUARY ASSET
              </Text>
            </View>

            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>
              {selectedItem.title}
            </Text>

            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6, lineHeight: 22 }]}>
              {selectedItem.description}
            </Text>

            {/* Digital Authenticity & Balance Box */}
            <View style={[styles.affordBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.affordRow}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>UNLOCK PRICE</Text>
                <View style={styles.gemPricePill}>
                  <Image source={RewardAssets.currencies.amberGem} style={styles.tinyGemIcon} contentFit="contain" />
                  <Text style={[typography.subheading, { color: colors.primary }]}>
                    {selectedItem.cost.toLocaleString()} Gems
                  </Text>
                </View>
              </View>

              <View style={styles.affordRow}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>YOUR CURRENT BALANCE</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {diamonds.toLocaleString()} Gems
                </Text>
              </View>

              <View style={styles.affordDivider} />

              <View style={styles.affordRow}>
                <Text style={[typography.captionBold, { color: colors.text.primary }]}>STATUS</Text>
                {marketOwned.includes(selectedItem.id) ? (
                  <Badge label="IN YOUR COLLECTION" variant="success" />
                ) : diamonds >= selectedItem.cost ? (
                  <Badge label="AVAILABLE TO UNLOCK" variant="success" />
                ) : (
                  <Badge label={`NEED ${(selectedItem.cost - diamonds).toLocaleString()} MORE GEMS`} variant="neutral" />
                )}
              </View>
            </View>

            {/* Unlock Action Button */}
            <View style={{ marginTop: spacing.lg }}>
              {marketOwned.includes(selectedItem.id) ? (
                <Button
                  label={activeSticker === selectedItem.id ? 'Equipped as Active Insignia' : 'Equip to Profile'}
                  variant={activeSticker === selectedItem.id ? 'outline' : 'primary'}
                  onPress={() => {
                    hapticLight();
                    if (activeSticker === selectedItem.id) {
                      setActiveSticker(null);
                    } else {
                      setActiveSticker(selectedItem.id);
                    }
                    setSelectedItem(null);
                  }}
                />
              ) : (
                <Button
                  label={`Unlock for ${selectedItem.cost.toLocaleString()} Gems`}
                  variant="primary"
                  disabled={diamonds < selectedItem.cost}
                  onPress={() => handleConfirmPurchase(selectedItem)}
                  icon={<Ionicons name="sparkles" size={18} color="#FFF" />}
                />
              )}
            </View>
          </View>
        )}
      </AppBottomSheetModal>

      {/* MODAL 2: UNLOCK SUCCESS CELEBRATION SHEET */}
      <AppBottomSheetModal
        visible={Boolean(unlockedSuccessItem)}
        onClose={() => setUnlockedSuccessItem(null)}
        title="Asset Unlocked!"
      >
        {unlockedSuccessItem && (
          <View style={styles.modalBody}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
            </View>

            <Text style={[typography.heading, { color: colors.text.primary, textAlign: 'center', marginTop: 12 }]}>
              {unlockedSuccessItem.title}
            </Text>

            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
              Successfully unlocked and saved to your permanent Sanctuary Vault.
            </Text>

            <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
              <Button
                label="Equip as Active Insignia"
                variant="primary"
                onPress={() => {
                  hapticLight();
                  setActiveSticker(unlockedSuccessItem.id);
                  setUnlockedSuccessItem(null);
                }}
              />
              <Button
                label="View in Collection"
                variant="outline"
                onPress={() => {
                  hapticLight();
                  setUnlockedSuccessItem(null);
                  setActiveTab('inventory');
                }}
              />
            </View>
          </View>
        )}
      </AppBottomSheetModal>

      {/* MODAL 3: CURRENCY FORGE BOTTOM SHEET */}
      <AppBottomSheetModal
        visible={showForgeSheet}
        onClose={() => setShowForgeSheet(false)}
        title="Sanctuary Currency Forge"
      >
        <View style={styles.modalBody}>
          <Text style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.md }]}>
            Convert your earned Amber Gems into Sanctuary Pass Tickets or Golden Tokens.
          </Text>

          {/* Forge Ticket Option */}
          <Card style={styles.forgeOptionCard}>
            <View style={styles.forgeRow}>
              <Image source={RewardAssets.currencies.sanctuaryPass} style={styles.forgeIcon} contentFit="contain" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Forge Sanctuary Ticket
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  Cost: {TICKET_FORGE_GEMS} Amber Gems
                </Text>
              </View>
              <Button
                label="Forge"
                variant="primary"
                size="sm"
                disabled={diamonds < TICKET_FORGE_GEMS}
                onPress={handleForgeTicketAction}
              />
            </View>
          </Card>

          {/* Forge Token with Tickets Option */}
          <Card style={styles.forgeOptionCard}>
            <View style={styles.forgeRow}>
              <Image source={RewardAssets.currencies.marketplaceToken} style={styles.forgeIcon} contentFit="contain" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Forge Golden Token (Tickets)
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  Cost: {TOKEN_FORGE_TICKETS} Sanctuary Tickets
                </Text>
              </View>
              <Button
                label="Forge"
                variant="secondary"
                size="sm"
                disabled={tickets < TOKEN_FORGE_TICKETS}
                onPress={() => handleForgeTokenAction(true)}
              />
            </View>
          </Card>

          {/* Forge Token with Gems Direct */}
          <Card style={styles.forgeOptionCard}>
            <View style={styles.forgeRow}>
              <Image source={RewardAssets.currencies.goldenGem} style={styles.forgeIcon} contentFit="contain" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Forge Golden Token (Direct)
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  Cost: {TOKEN_FORGE_GEMS.toLocaleString()} Amber Gems
                </Text>
              </View>
              <Button
                label="Forge"
                variant="outline"
                size="sm"
                disabled={diamonds < TOKEN_FORGE_GEMS}
                onPress={() => handleForgeTokenAction(false)}
              />
            </View>
          </Card>
        </View>
      </AppBottomSheetModal>

      {/* MODAL 4: MILESTONE CHEST REVEAL MODAL */}
      {selectedChest && (
        <LootBoxModal
          chest={selectedChest}
          onClose={() => setSelectedChest(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  walletCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  currencyCol: {
    alignItems: 'center',
    flex: 1,
  },
  currencyIcon: {
    width: 44,
    height: 44,
  },
  currencyDivider: {
    width: 1,
    height: 38,
  },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabContent: {
    flex: 1,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItemPressable: {
    width: '48%',
  },
  itemCard: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
  },
  itemArtworkWrap: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 12,
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  tierBadgeWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  itemBody: {
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  gemPricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tinyGemIcon: {
    width: 18,
    height: 18,
  },
  chestsHero: {
    marginBottom: 16,
  },
  chestsList: {
    gap: 14,
  },
  chestCard: {
    borderRadius: 18,
    padding: 14,
  },
  chestRow: {
    flexDirection: 'row',
    gap: 14,
  },
  chestVisualWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestImage: {
    width: 86,
    height: 86,
  },
  chestMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  chestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guaranteedDrops: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropIcon: {
    width: 16,
    height: 16,
  },
  dropCardThumb: {
    width: 18,
    height: 24,
    borderRadius: 3,
  },
  claimedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeEquippedCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  activeEquippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  activeEquippedImg: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  activeEquippedEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardsGrid: {
    gap: 14,
  },
  collectorCardItem: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 0,
    marginBottom: 10,
  },
  collectorCardImage: {
    width: '100%',
    height: 180,
  },
  collectorCardBody: {
    padding: 14,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inventoryCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
  },
  inventoryVisualWrap: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  inventoryImg: {
    width: '80%',
    height: '80%',
  },
  inventoryBody: {
    padding: 10,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingVertical: 8,
  },
  modalImageWrap: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 14,
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  affordBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  affordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  affordDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  successIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  forgeOptionCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  forgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgeIcon: {
    width: 44,
    height: 44,
  },
});
