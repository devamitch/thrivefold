import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/AppHeader';
import { AppBottomSheetModal } from '../../components/ui/AppBottomSheetModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { LootBoxModal } from '../../components/game/LootBoxModal';
import { RewardAssets } from '../../constants/assets';
import {
  MASTER_GENERATED_ARTIFACTS,
  type MasterArtifact,
} from '../../constants/masterRewardAssets';
import {
  ACTION_REWARDS,
  chestKey,
  EDITORIAL_ARTWORKS,
  LEVEL_CHESTS,
  MARKET,
  streakMultiplier,
  TIER_COST,
  TICKET_FORGE_GEMS,
  TOKEN_FORGE_GEMS,
  TOKEN_FORGE_TICKETS,
  WELLNESS_PLANS,
  type EditorialArt,
  type LevelChest,
  type MarketItem,
  type WellnessPlan,
} from '../../domain/game/rewards';
import { useGearStock, useMyGearRequests, useRequestGear } from '../../services/rewards/gear';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const { width } = Dimensions.get('window');

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

function getItemAsset(assetKey?: string) {
  if (!assetKey) return null;
  if (assetKey in RewardAssets.marketplace) {
    return RewardAssets.marketplace[assetKey as keyof typeof RewardAssets.marketplace];
  }
  if (assetKey in RewardAssets.currencies) {
    return RewardAssets.currencies[assetKey as keyof typeof RewardAssets.currencies];
  }
  if (assetKey in RewardAssets.editorial) {
    return RewardAssets.editorial[assetKey as keyof typeof RewardAssets.editorial];
  }
  return null;
}

type TabType = 'market' | 'reliquary' | 'gallery' | 'vault';
type VaultFilter = 'All' | 'Cinematic Banners' | 'Reliquary Chests' | 'Collector Cards' | 'Currencies & Tokens' | 'Physical Gear';

const HERO_BANNERS = MASTER_GENERATED_ARTIFACTS.filter((a) => a.category === 'Cinematic Banners').slice(0, 4);

/**
 * Thrivefold Grand Marketplace, Economic Treasury & Complete Asset Exhibition:
 * - Treasury Wallet with Amber Gems, Sanctuary Tickets, and Golden Marketplace Tokens.
 * - Interactive Hero Showcase featuring wide cinematic promo keyframes.
 * - Tab 1: Marketplace & Gear (Stickers with dual-currency unlock, Status, Care Plans, Real Gear).
 * - Tab 2: Milestone Reliquaries (The 5 Chest Tiers with Dual Closed & Burst 3D views + 4 Collector Cards).
 * - Tab 3: Artisanal Gouache Gallery (The 11 museum-grade raw editorial artworks).
 * - Tab 4: Master 3D Artifacts Vault (All 37 high-resolution 3D renders, medallions, posters & composites).
 */
export default function MarketplaceScreen() {
  const { colors, typography, spacing } = useTheme();
  const { diamonds, tickets, tokens, owned, buy, forgeTicket, forgeToken, showAlert, level, streak, ledger } = useRootStore(
    useShallow((s) => ({
      diamonds: s.diamonds,
      tickets: s.tickets,
      tokens: s.tokens,
      owned: s.marketOwned,
      buy: s.buyMarketItem,
      forgeTicket: s.forgeTicket,
      forgeToken: s.forgeToken,
      showAlert: s.showAlert,
      level: s.level,
      streak: s.streak,
      ledger: s.rewardLedger,
    })),
  );

  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [vaultFilter, setVaultFilter] = useState<VaultFilter>('All');
  const opened = useMemo(() => ledger.filter((e) => e.kind === 'chest_reward').map((e) => e.key), [ledger]);
  const [chest, setChest] = useState<LevelChest | null>(null);
  const [inspectArt, setInspectArt] = useState<EditorialArt | MasterArtifact | null>(null);
  const multiplier = streakMultiplier(streak);
  const cards = LEVEL_CHESTS.filter((c) => owned.includes(c.card.id)).map((c) => c.card);
  const stock = useGearStock();
  const requests = useMyGearRequests();
  const requestGear = useRequestGear();

  const [gear, setGear] = useState<MarketItem | WellnessPlan | null>(null);
  const [payMethod, setPayMethod] = useState<'gems' | 'tokens'>('gems');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const promptUnlock = (item: MarketItem | WellnessPlan, defaultCurrency: 'gems' | 'tokens' = 'gems') => {
    if ('physical' in item && item.physical) {
      setPayMethod(defaultCurrency);
      setGear(item);
      return;
    }
    if (item.id.startsWith('plan_')) {
      setPayMethod(defaultCurrency);
      setGear(item);
      return;
    }

    const priceText = defaultCurrency === 'tokens'
      ? `${item.tokenCost ?? 1} Token${(item.tokenCost ?? 1) > 1 ? 's' : ''}`
      : `${item.cost.toLocaleString()} Gems`;

    const userBalance = defaultCurrency === 'tokens' ? `${tokens} Tokens` : `${diamonds.toLocaleString()} Gems`;

    showAlert({
      title: `Unlock ${item.title}?`,
      message: `Price: ${priceText}. Your wallet balance: ${userBalance}.`,
      confirmText: 'Unlock',
      onConfirm: () => {
        const r = buy(item.id, defaultCurrency);
        if (!r.ok) {
          showAlert({
            title: 'Not unlocked',
            message: r.reason === 'insufficient' ? `Not enough ${defaultCurrency} yet.` : 'You already have this.',
            confirmText: 'OK',
            cancelText: null,
          });
        }
      },
    });
  };

  const handleForgeTicket = () => {
    if (diamonds < TICKET_FORGE_GEMS) {
      showAlert({
        title: 'Need More Gems',
        message: `Forging 1 Sanctuary Ticket requires ${TICKET_FORGE_GEMS} Amber Gems. You currently have ${diamonds}.`,
        confirmText: 'Got it',
        cancelText: null,
      });
      return;
    }
    showAlert({
      title: 'Forge Sanctuary Ticket?',
      message: `Convert ${TICKET_FORGE_GEMS} Amber Gems into 1 Silver Sanctuary Ticket?`,
      confirmText: 'Forge',
      onConfirm: () => {
        forgeTicket();
      },
    });
  };

  const handleForgeToken = (fromTickets: boolean) => {
    if (fromTickets) {
      if (tickets < TOKEN_FORGE_TICKETS) {
        showAlert({
          title: 'Need More Tickets',
          message: `Forging 1 Golden Marketplace Token requires ${TOKEN_FORGE_TICKETS} Sanctuary Tickets. You currently have ${tickets}.`,
          confirmText: 'Got it',
          cancelText: null,
        });
        return;
      }
      showAlert({
        title: 'Forge Marketplace Token?',
        message: `Convert ${TOKEN_FORGE_TICKETS} Sanctuary Tickets into 1 Golden Marketplace Token?`,
        confirmText: 'Forge',
        onConfirm: () => {
          forgeToken(true);
        },
      });
    } else {
      if (diamonds < TOKEN_FORGE_GEMS) {
        showAlert({
          title: 'Need More Gems',
          message: `Directly forging 1 Golden Marketplace Token requires ${TOKEN_FORGE_GEMS} Amber Gems. You currently have ${diamonds}.`,
          confirmText: 'Got it',
          cancelText: null,
        });
        return;
      }
      showAlert({
        title: 'Forge Marketplace Token?',
        message: `Convert ${TOKEN_FORGE_GEMS} Amber Gems directly into 1 Golden Marketplace Token?`,
        confirmText: 'Forge',
        onConfirm: () => {
          forgeToken(false);
        },
      });
    }
  };

  const sendOrderRequest = async () => {
    if (!gear) return;
    try {
      const isToken = payMethod === 'tokens';
      const costGems = isToken ? 0 : gear.cost;
      await requestGear.mutateAsync({
        itemId: gear.id,
        gems: costGems,
        fullName,
        phone,
        address,
      });
      buy(gear.id, payMethod);
      setGear(null);
      showAlert({
        title: 'Request Confirmed',
        message: 'Your order has been recorded. The Thrivefold wellness team will reach out regarding delivery.',
        confirmText: 'Done',
        cancelText: null,
      });
    } catch {
      // Handled by mutation
    }
  };

  const filteredVault = useMemo(() => {
    if (vaultFilter === 'All') return MASTER_GENERATED_ARTIFACTS;
    return MASTER_GENERATED_ARTIFACTS.filter((a) => a.category === vaultFilter);
  }, [vaultFilter]);

  const validOrder = fullName.trim().length > 1 && /^[+\d][\d\s-]{5,19}$/.test(phone.trim()) && address.trim().length >= 8;

  return (
    <ScreenContainer
      header={<AppHeader title="Marketplace" subtitle="Spend gems & tokens on authentic wellness gear" showBack />}
      scrollMode="shell-scroll-view"
    >
      {/* 3-Pillar Treasury Wallet */}
      <Card style={[styles.walletCard, { marginBottom: spacing.sm }]}>
        <View style={styles.walletHeader}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>WELLNESS TREASURY</Text>
          {multiplier > 1 && (
            <Badge label={`${streak}d Streak · ×${multiplier} Rewards`} variant="primary" />
          )}
        </View>

        <View style={styles.currencyRow}>
          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.amberGem} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{diamonds.toLocaleString()}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Amber Gems</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.sanctuaryPass} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{tickets}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Tickets</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.marketplaceToken} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{tokens}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Tokens</Text>
          </View>
        </View>

        <View style={[styles.forgeBar, { borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.sm }]}>
          <Text style={[typography.caption, { color: colors.text.muted, flex: 1 }]}>
            Forge: 500 Gems ➔ 1 Ticket · 5 Tickets ➔ 1 Token
          </Text>
          <View style={styles.forgeButtons}>
            <Button
              label="+ Ticket"
              size="sm"
              variant="outline"
              disabled={diamonds < TICKET_FORGE_GEMS}
              onPress={handleForgeTicket}
            />
            <Button
              label="+ Token"
              size="sm"
              variant="outline"
              disabled={tickets < TOKEN_FORGE_TICKETS && diamonds < TOKEN_FORGE_GEMS}
              onPress={() => handleForgeToken(tickets >= TOKEN_FORGE_TICKETS)}
            />
          </View>
        </View>
      </Card>

      {/* Hero Showcase Carousel */}
      <View style={{ marginBottom: spacing.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.heroScroll}
        >
          {HERO_BANNERS.map((banner) => (
            <PressableScale
              key={banner.id}
              onPress={() => setInspectArt(banner)}
              style={styles.heroBannerWrap}
            >
              <Image source={banner.source} style={styles.heroBannerImg} contentFit="cover" />
              <View style={styles.heroOverlay}>
                <Badge label="Cinematic Showcase" variant="gold" />
                <Text style={[typography.subheading, { color: '#FFF', marginTop: 4 }]} numberOfLines={1}>
                  {banner.title}
                </Text>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      </View>

      {/* 4-Tab Navigation Segments */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.surface1, marginBottom: spacing.md }]}>
        <PressableScale
          style={[styles.segmentTab, activeTab === 'market' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('market')}
        >
          <Ionicons name="bag-handle-outline" size={16} color={activeTab === 'market' ? colors.primary : colors.text.secondary} />
          <Text style={[typography.captionBold, { color: activeTab === 'market' ? colors.text.primary : colors.text.secondary }]}>
            Market
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'reliquary' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('reliquary')}
        >
          <Ionicons name="gift-outline" size={16} color={activeTab === 'reliquary' ? colors.primary : colors.text.secondary} />
          <Text style={[typography.captionBold, { color: activeTab === 'reliquary' ? colors.text.primary : colors.text.secondary }]}>
            Chests
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'gallery' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('gallery')}
        >
          <Ionicons name="color-palette-outline" size={16} color={activeTab === 'gallery' ? colors.primary : colors.text.secondary} />
          <Text style={[typography.captionBold, { color: activeTab === 'gallery' ? colors.text.primary : colors.text.secondary }]}>
            Gouache
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'vault' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('vault')}
        >
          <Ionicons name="sparkles-outline" size={16} color={activeTab === 'vault' ? colors.primary : colors.text.secondary} />
          <Text style={[typography.captionBold, { color: activeTab === 'vault' ? colors.text.primary : colors.text.secondary }]}>
            3D Vault
          </Text>
        </PressableScale>
      </View>

      {/* TAB 1: MARKETPLACE & GEAR */}
      {activeTab === 'market' && (
        <View>
          {/* Your Owned Collection Shelf */}
          {owned.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={styles.sectionHead}>
                <Ionicons name="albums-outline" size={20} color={colors.primary} />
                <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Your Collection Shelf</Text>
              </View>

              <View style={[styles.shelf, { marginTop: spacing.sm }]}>
                {cards.map((c) => {
                  const cardArt = getCardAsset(c.id);
                  return (
                    <View key={c.id} style={[styles.cardItem, { backgroundColor: colors.surface }]}>
                      <Image source={cardArt} style={styles.cardItemImg} contentFit="cover" />
                      <Text style={[typography.captionBold, { color: colors.text.primary, textAlign: 'center', marginTop: 4 }]} numberOfLines={1}>
                        {c.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.primary }]}>{c.rarity}</Text>
                    </View>
                  );
                })}

                {MARKET.filter((m) => !m.physical && owned.includes(m.id)).map((m) => {
                  const art = getItemAsset(m.assetKey);
                  return (
                    <View key={m.id} style={[styles.stickerItem, { backgroundColor: colors.surface }]}>
                      {art ? (
                        <Image source={art} style={styles.stickerImg} contentFit="contain" />
                      ) : (
                        <View style={[styles.stickerIconBg, { backgroundColor: colors.surface2 }]}>
                          <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                        </View>
                      )}
                      <Text style={[typography.captionBold, { color: colors.text.primary, textAlign: 'center', marginTop: 4 }]} numberOfLines={2}>
                        {m.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Digital Habit Stickers */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHead}>
              <Ionicons name="happy-outline" size={20} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Digital Habit Stickers</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>100 Gems or 1 Token</Text>
            </View>

            {MARKET.filter((m) => m.tier === 'sticker').map((m) => {
              const have = owned.includes(m.id);
              const art = getItemAsset(m.assetKey);
              const shortGems = diamonds < m.cost;
              const shortTokens = tokens < (m.tokenCost ?? 1);
              return (
                <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                    {art ? (
                      <Image source={art} style={styles.itemImgThumb} contentFit="contain" />
                    ) : (
                      <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
                      {m.cost} Gems · or {m.tokenCost ?? 1} Token
                    </Text>
                  </View>
                  {have ? (
                    <Badge label="Owned" variant="success" />
                  ) : (
                    <View style={styles.actionRow}>
                      <Button
                        label={`${m.cost} 💎`}
                        size="sm"
                        variant={shortGems ? 'outline' : 'primary'}
                        disabled={shortGems}
                        onPress={() => promptUnlock(m, 'gems')}
                      />
                      <Button
                        label="1 🪙"
                        size="sm"
                        variant={shortTokens ? 'outline' : 'primary'}
                        disabled={shortTokens}
                        onPress={() => promptUnlock(m, 'tokens')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Sanctuary Status & Badges */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHead}>
              <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Sanctuary Status & Badges</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>500 Gems or 1 Ticket</Text>
            </View>

            {MARKET.filter((m) => m.tier === 'status').map((m) => {
              const have = owned.includes(m.id);
              const art = getItemAsset(m.assetKey);
              const shortGems = diamonds < m.cost;
              const shortTickets = tickets < 1;
              return (
                <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                    <Image source={art ?? RewardAssets.currencies.sanctuaryPass} style={{ width: 44, height: 44 }} contentFit="contain" />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>500 Gems · or 1 Sanctuary Ticket</Text>
                  </View>
                  {have ? (
                    <Badge label="Active" variant="success" />
                  ) : (
                    <View style={styles.actionRow}>
                      <Button
                        label="500 💎"
                        size="sm"
                        variant={shortGems ? 'outline' : 'primary'}
                        disabled={shortGems}
                        onPress={() => promptUnlock(m, 'gems')}
                      />
                      <Button
                        label="1 🎫"
                        size="sm"
                        variant={shortTickets ? 'outline' : 'primary'}
                        disabled={shortTickets}
                        onPress={() => promptUnlock(m, 'tokens')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Wellness Plans */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHead}>
              <Ionicons name="fitness-outline" size={20} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Wellness & Nutrition Plans</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Tokens or Gems</Text>
            </View>

            {WELLNESS_PLANS.map((p) => {
              const assetImg = getItemAsset(p.assetKey);
              const have = owned.includes(p.id);
              const shortGems = diamonds < p.cost;
              const shortTokens = tokens < p.tokenCost;
              return (
                <Card key={p.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.gearThumb, { backgroundColor: colors.surface2 }]}>
                    {assetImg ? (
                      <Image source={assetImg} style={{ width: 56, height: 56, borderRadius: 10 }} contentFit="cover" />
                    ) : (
                      <Ionicons name={p.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.row}>
                      <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>{p.title}</Text>
                      <Badge label={p.category} variant="primary" />
                    </View>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{p.description}</Text>
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>
                      {p.tokenCost} Tokens · or {p.cost.toLocaleString()} Gems
                    </Text>
                  </View>
                  {have ? (
                    <Badge label="Enrolled" variant="success" />
                  ) : (
                    <View style={styles.actionCol}>
                      <Button
                        label={`${p.tokenCost} 🪙`}
                        size="sm"
                        variant={shortTokens ? 'outline' : 'primary'}
                        disabled={shortTokens}
                        onPress={() => promptUnlock(p, 'tokens')}
                      />
                      <Button
                        label="Order"
                        size="sm"
                        variant={shortGems ? 'outline' : 'primary'}
                        disabled={shortGems}
                        onPress={() => promptUnlock(p, 'gems')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Real Workout Gear */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHead}>
              <Ionicons name="barbell-outline" size={20} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Real Workout Gear</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Doorstep Delivery</Text>
            </View>

            {MARKET.filter((m) => m.tier === 'gear').map((m) => {
              const assetImg = getItemAsset(m.assetKey);
              const left = stock.data?.[m.id];
              const soldOut = left === 0;
              const shortGems = diamonds < m.cost;
              const shortTokens = tokens < (m.tokenCost ?? 10);
              return (
                <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.gearThumb, { backgroundColor: colors.surface2 }]}>
                    {assetImg ? (
                      <Image source={assetImg} style={styles.gearThumbImg} contentFit="contain" />
                    ) : (
                      <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}>
                      {m.tokenCost ?? 10} Tokens · or {m.cost.toLocaleString()} Gems
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: soldOut ? colors.error : colors.text.muted,
                          marginTop: 2,
                        },
                      ]}
                    >
                      {stock.isLoading
                        ? 'Checking inventory…'
                        : left === undefined
                          ? 'Stock verified upon request'
                          : soldOut
                            ? 'Temporarily Out of Stock'
                            : `${left} available`}
                    </Text>
                  </View>
                  <View style={styles.actionCol}>
                    <Button
                      label={`${m.tokenCost ?? 10} 🪙`}
                      size="sm"
                      variant={shortTokens ? 'outline' : 'primary'}
                      disabled={shortTokens || soldOut}
                      onPress={() => promptUnlock(m, 'tokens')}
                    />
                    <Button
                      label="Order"
                      size="sm"
                      variant={shortGems ? 'outline' : 'primary'}
                      disabled={shortGems || soldOut}
                      onPress={() => promptUnlock(m, 'gems')}
                    />
                  </View>
                </Card>
              );
            })}
          </View>

          {requests.data && requests.data.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Your Gear Orders</Text>
              {requests.data.map((r) => (
                <Card key={r.id} style={[styles.itemCard, { marginBottom: spacing.sm }]}>
                  <Text style={[typography.body, styles.flex, { color: colors.text.primary }]}>
                    {MARKET.find((m) => m.id === r.item_id)?.title ?? r.item_id}
                  </Text>
                  <Badge label={r.status} variant="primary" />
                </Card>
              ))}
            </View>
          )}
        </View>
      )}

      {/* TAB 2: MILESTONE RELIQUARIES */}
      {activeTab === 'reliquary' && (
        <View style={{ marginBottom: spacing.xl }}>
          <View style={styles.sectionHead}>
            <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>The 5 Milestone Chest Tiers</Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
            Hand-crafted 3D reliquaries unlocked automatically as you hit milestone health levels.
          </Text>

          {LEVEL_CHESTS.map((c) => {
            const chestArt = getChestAssets(c.level);
            const cardArt = getCardAsset(c.card.id);
            const isDone = opened.includes(chestKey(c.level));
            const isReady = !isDone && level >= c.level;
            return (
              <Card key={c.level} style={[styles.reliquaryCard, { marginBottom: spacing.md, borderColor: isReady ? colors.primary : colors.border }]}>
                <View style={styles.reliquaryTop}>
                  <Badge label={`Tier Milestone · Level ${c.level}`} variant={isDone ? 'success' : isReady ? 'primary' : 'neutral'} />
                  {isReady && <Badge label="Ready to Open" variant="gold" />}
                </View>

                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>{c.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Guaranteed Reward: +{c.gems} Amber Gems & exclusive {c.card.title} ({c.card.rarity} Card)
                </Text>

                {/* Dual Chest State Display */}
                <View style={styles.dualChestRow}>
                  <View style={styles.chestStateCol}>
                    <Image source={chestArt.closed} style={styles.largeChestImg} contentFit="contain" />
                    <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 4 }]}>Closed State</Text>
                  </View>
                  <View style={styles.chestStateCol}>
                    <Image source={chestArt.burst} style={styles.largeChestImg} contentFit="contain" />
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>Burst Eruption</Text>
                  </View>
                </View>

                {/* Card Drop Preview */}
                <View style={[styles.cardDropPreview, { backgroundColor: colors.surface1 }]}>
                  <Image source={cardArt} style={styles.miniCardImg} contentFit="cover" />
                  <View style={styles.flex}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>{c.card.rarity.toUpperCase()} COLLECTOR CARD</Text>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{c.card.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>Debossed geometric watermark seal</Text>
                  </View>
                  {isReady ? (
                    <Button label="Open" size="sm" onPress={() => setChest(c)} />
                  ) : (
                    <Badge label={isDone ? 'Claimed' : `Lvl ${c.level}`} variant={isDone ? 'success' : 'neutral'} />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* TAB 3: ARTISANAL GOUACHE GALLERY */}
      {activeTab === 'gallery' && (
        <View style={{ marginBottom: spacing.xl }}>
          <View style={styles.sectionHead}>
            <Ionicons name="brush-outline" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Artisanal Gouache Gallery</Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
            Hand-painted Scandinavian-Japanese gouache on textured cotton paper. Tap any artwork to inspect full details.
          </Text>

          <View style={styles.galleryGrid}>
            {EDITORIAL_ARTWORKS.map((art) => {
              const imageSource = getItemAsset(art.assetKey);
              return (
                <PressableScale
                  key={art.id}
                  onPress={() => setInspectArt(art)}
                  style={[styles.galleryCard, { backgroundColor: colors.surface }]}
                >
                  <Image source={imageSource} style={styles.galleryImg} contentFit="cover" />
                  <View style={styles.galleryMeta}>
                    <Badge label={art.category} variant="primary" />
                    <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={1}>
                      {art.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      {art.description}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </View>
      )}

      {/* TAB 4: MASTER 3D ARTIFACTS VAULT (All 37 Generated Assets Showcase) */}
      {activeTab === 'vault' && (
        <View style={{ marginBottom: spacing.xl }}>
          <View style={styles.sectionHead}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
              Master 3D Artifacts Vault ({filteredVault.length})
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
            Explore all 37 custom 3D volumetric renders, medallions, split composites, and posters. Tap any asset to inspect in studio lighting.
          </Text>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
            {(['All', 'Cinematic Banners', 'Reliquary Chests', 'Collector Cards', 'Currencies & Tokens', 'Physical Gear'] as VaultFilter[]).map((f) => (
              <PressableScale
                key={f}
                onPress={() => setVaultFilter(f)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: vaultFilter === f ? colors.primary : colors.surface1,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: vaultFilter === f ? colors.onPrimary : colors.text.secondary },
                  ]}
                >
                  {f}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Master 3D Artifacts Grid */}
          <View style={styles.vaultGrid}>
            {filteredVault.map((artifact) => (
              <PressableScale
                key={artifact.id}
                onPress={() => setInspectArt(artifact)}
                style={[styles.vaultCard, { backgroundColor: colors.surface }]}
              >
                <Image
                  source={artifact.source}
                  style={[
                    styles.vaultImg,
                    { height: (artifact.aspectRatio ?? 1.5) < 1.0 ? 220 : 160 },
                  ]}
                  contentFit="cover"
                />
                <View style={styles.vaultMeta}>
                  <Badge label={artifact.category} variant="primary" />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={1}>
                    {artifact.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                    {artifact.description}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </View>
      )}

      {/* Everyday Earning Guide */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Everyday Habit Earnings</Text>
      {Object.values(ACTION_REWARDS).map((a) => (
        <View key={a.label} style={styles.earnRow}>
          <Text style={[typography.body, styles.flex, { color: colors.text.secondary }]}>{a.label}</Text>
          <Text style={[typography.bodyBold, { color: colors.primary }]}>+{a.gems} Gems</Text>
        </View>
      ))}
      <Text
        style={[
          typography.caption,
          {
            color: colors.text.muted,
            marginTop: spacing.sm,
            marginBottom: spacing.xl,
          },
        ]}
      >
        Habit adherence is capped daily to prevent farming. Streaks multiply earnings: 3 days ×1.2, 7 days ×1.5, 30 days ×2.5. Real data only, no in-app purchases.
      </Text>

      {/* Full-Screen Art / 3D Artifact Inspection Modal */}
      {inspectArt && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setInspectArt(null)}>
          <View style={[styles.modalScrim, { backgroundColor: colors.scrim }]}>
            <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
              <Image
                source={'source' in inspectArt ? inspectArt.source : getItemAsset(inspectArt.assetKey)}
                style={styles.modalArtImg}
                contentFit="contain"
              />
              <View style={styles.modalBody}>
                <View style={styles.rowBetween}>
                  <Badge label={inspectArt.category} variant="primary" />
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Full Studio Resolution</Text>
                </View>
                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>{inspectArt.title}</Text>
                <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>{inspectArt.description}</Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
                  Asset Spec: High-fidelity 60fps render with volumetric rim lighting, debossed T-leaf emblem watermark, and Nordic-Japanese palette harmony.
                </Text>
                <View style={{ marginTop: spacing.lg }}>
                  <Button label="Close Inspection" onPress={() => setInspectArt(null)} />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Loot Box Opening Modal */}
      <LootBoxModal key={chest?.level ?? 0} chest={chest} onClose={() => setChest(null)} />

      {/* Doorstep Delivery Order Sheet */}
      <AppBottomSheetModal
        visible={!!gear}
        onClose={() => setGear(null)}
        title={gear ? `Order ${gear.title}` : ''}
      >
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
          Payment method:{' '}
          <Text style={typography.captionBold}>
            {payMethod === 'tokens' ? `${gear?.tokenCost ?? 1} Token(s)` : `${gear?.cost.toLocaleString()} Gems`}
          </Text>
          . Your delivery information is end-to-end private and reviewed solely by the Thrivefold fulfillment team.
        </Text>
        <TextField label="Full recipient name" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <TextField
          label="Phone number (for courier dispatch)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          containerStyle={{ marginTop: spacing.sm }}
        />
        <TextField
          label="Doorstep delivery address"
          value={address}
          onChangeText={setAddress}
          multiline
          containerStyle={{ marginTop: spacing.sm }}
        />
        {requestGear.error ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{requestGear.error.message}</Text>
        ) : null}
        <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
          <Button
            label={requestGear.isPending ? 'Submitting Order…' : 'Confirm & Dispatch'}
            disabled={!validOrder || requestGear.isPending}
            onPress={() => void sendOrderRequest()}
          />
        </View>
      </AppBottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletCard: { padding: 16 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  currencyCol: { alignItems: 'center', flex: 1 },
  currencyIcon: { width: 36, height: 36 },
  walletDivider: { width: 1, height: 48, opacity: 0.3 },
  forgeBar: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth },
  forgeButtons: { flexDirection: 'row', gap: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroScroll: { gap: 12, paddingVertical: 4 },
  heroBannerWrap: {
    width: width * 0.78,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBannerImg: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardItem: {
    width: 100,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 6,
    alignItems: 'center',
  },
  cardItemImg: { width: 88, height: 120, borderRadius: 10 },
  stickerItem: {
    width: 96,
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
  },
  stickerImg: { width: 48, height: 48, borderRadius: 12 },
  stickerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  stickerThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImgThumb: { width: 44, height: 44, borderRadius: 8 },
  gearThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gearThumbImg: { width: 56, height: 56 },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionCol: { alignItems: 'flex-end', gap: 6 },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  reliquaryCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  reliquaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dualChestRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 14,
  },
  chestStateCol: {
    alignItems: 'center',
  },
  largeChestImg: {
    width: 130,
    height: 130,
  },
  cardDropPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
  },
  miniCardImg: {
    width: 48,
    height: 68,
    borderRadius: 8,
  },
  galleryGrid: {
    gap: 14,
  },
  galleryCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  galleryImg: {
    width: '100%',
    height: 180,
  },
  galleryMeta: {
    padding: 14,
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vaultGrid: {
    gap: 14,
  },
  vaultCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  vaultImg: {
    width: '100%',
  },
  vaultMeta: {
    padding: 14,
  },
  modalScrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalArtImg: {
    width: '100%',
    height: 260,
  },
  modalBody: {
    padding: 20,
  },
});
