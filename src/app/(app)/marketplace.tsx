import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  getMasterArtifactSource,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const HERO_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
const HERO_CARD_HEIGHT = 150;
const GRID_COL_WIDTH = Math.floor((CONTENT_WIDTH - 12) / 2);
const GRID_IMG_HEIGHT = 120;

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
  const master = getMasterArtifactSource(assetKey);
  if (master) return master;
  if (assetKey in RewardAssets.marketplace) {
    return RewardAssets.marketplace[assetKey as keyof typeof RewardAssets.marketplace];
  }
  if (assetKey in RewardAssets.currencies) {
    return RewardAssets.currencies[assetKey as keyof typeof RewardAssets.currencies];
  }
  if (assetKey in RewardAssets.cards) {
    return RewardAssets.cards[assetKey as keyof typeof RewardAssets.cards];
  }
  if (assetKey in RewardAssets.editorial) {
    return RewardAssets.editorial[assetKey as keyof typeof RewardAssets.editorial];
  }
  return null;
}

type TabType = 'market' | 'reliquary' | 'gallery' | 'vault';
type VaultFilter =
  | 'All'
  | 'Cinematic Banners'
  | 'Reliquary Chests'
  | 'Collector Cards'
  | 'Currencies & Tokens'
  | 'Physical Gear';

const HERO_BANNERS = MASTER_GENERATED_ARTIFACTS.filter(
  (a) => a.category === 'Cinematic Banners',
).slice(0, 4);

/** Memoized grid item for the 3D Vault FlashList */
const VaultGridItem = memo(
  ({
    item,
    onPress,
    colors,
    typography,
  }: {
    item: MasterArtifact;
    onPress: (art: MasterArtifact) => void;
    colors: any;
    typography: any;
  }) => (
    <PressableScale
      onPress={() => onPress(item)}
      style={[styles.gridCard, { width: GRID_COL_WIDTH, backgroundColor: colors.surface }]}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.title}`}
    >
      <Image
        source={item.source}
        style={{
          width: GRID_COL_WIDTH,
          height: GRID_IMG_HEIGHT,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
      <View style={styles.gridCardMeta}>
        <Badge label={item.category} variant="primary" />
        <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </PressableScale>
  ),
);
VaultGridItem.displayName = 'VaultGridItem';

/** Memoized grid item for the Gouache Gallery FlashList */
const GalleryGridItem = memo(
  ({
    item,
    onPress,
    colors,
    typography,
  }: {
    item: EditorialArt;
    onPress: (art: EditorialArt) => void;
    colors: any;
    typography: any;
  }) => {
    const source = getItemAsset(item.assetKey);
    return (
      <PressableScale
        onPress={() => onPress(item)}
        style={[styles.gridCard, { width: GRID_COL_WIDTH, backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title}`}
      >
        <Image
          source={source}
          style={{
            width: GRID_COL_WIDTH,
            height: GRID_IMG_HEIGHT,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
        <View style={styles.gridCardMeta}>
          <Badge label={item.category} variant="primary" />
          <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </PressableScale>
    );
  },
);
GalleryGridItem.displayName = 'GalleryGridItem';

/**
 * Thrivefold Grand Marketplace, Treasury & Visual Exhibition
 * - 3-Pillar Treasury: Amber Gems, Silver Tickets, Golden Tokens with on-device Currency Forge
 * - Hero Carousel: Wide cinematic promotional keyframes with zero-delay preloaded rendering
 * - Tab 1 (Market): Habit Stickers, Status Badges, Structured Care Plans, Real Physical Gear
 * - Tab 2 (Chests & Cards): The 5 Reliquary Chests (Closed + Burst views) and 4 Collector Cards
 * - Tab 3 (Gallery): 11 museum-grade Scandinavian-Japanese gouache studies in FlashList
 * - Tab 4 (3D Vault): All 36 custom 3D renders with filter pills and full-screen inspection
 */
export default function MarketplaceScreen() {
  const { colors, typography, spacing } = useTheme();
  const isMarketplaceEnabled = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_MARKETPLACE === 'true';

  const {
    diamonds,
    tickets,
    tokens,
    owned,
    activeSticker,
    setActiveSticker,
    buy,
    forgeTicket,
    forgeToken,
    showAlert,
    streak,
    ledger,
  } = useRootStore(
    useShallow((s) => ({
      diamonds: s.diamonds,
      tickets: s.tickets,
      tokens: s.tokens,
      owned: s.marketOwned,
      activeSticker: s.activeSticker,
      setActiveSticker: s.setActiveSticker,
      buy: s.buyMarketItem,
      forgeTicket: s.forgeTicket,
      forgeToken: s.forgeToken,
      showAlert: s.showAlert,
      streak: s.streak,
      ledger: s.rewardLedger,
    })),
  );

  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [vaultFilter, setVaultFilter] = useState<VaultFilter>('All');
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

  // Preload primary visual assets on mount so they paint instantly
  useEffect(() => {
    const critical = [
      RewardAssets.currencies.amberGem,
      RewardAssets.currencies.marketplaceToken,
      RewardAssets.currencies.sanctuaryPass,
      RewardAssets.chests.tier1.closed,
      RewardAssets.chests.tier1.burst,
      ...HERO_BANNERS.map((b) => b.source),
    ];
    critical.forEach((src) => {
      if (src) Image.loadAsync(src).catch(() => {});
    });
  }, []);

  if (!isMarketplaceEnabled) {
    return (
      <ScreenContainer style={styles.flex}>
        <AppHeader title="Sanctuary Marketplace" showBack />
        <View style={styles.disabledContainer}>
          <Ionicons name="sparkles" size={56} color={colors.primary} />
          <Text style={[typography.heading, { color: colors.text.primary, marginTop: 16, textAlign: 'center' }]}>
            Marketplace Coming Soon
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.text.secondary, marginTop: 8, textAlign: 'center', maxWidth: 300, lineHeight: 22 },
            ]}
          >
            The mindful reward exchange and 3D Treasury are receiving finishing touches for our next update. Your gems, tokens, and streak progress are safely recorded.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const promptUnlock = useCallback(
    (item: MarketItem | WellnessPlan, defaultCurrency: 'gems' | 'tokens' | 'tickets' = 'gems') => {
      if ('physical' in item && item.physical) {
        setPayMethod(defaultCurrency === 'tickets' ? 'tokens' : defaultCurrency);
        setGear(item);
        return;
      }
      if (item.id.startsWith('plan_')) {
        setPayMethod(defaultCurrency === 'tickets' ? 'tokens' : defaultCurrency);
        setGear(item);
        return;
      }

      let priceText = `${item.cost.toLocaleString()} Gems`;
      let userBalance = `${diamonds.toLocaleString()} Gems`;

      if (defaultCurrency === 'tokens') {
        const cost = item.tokenCost ?? 1;
        priceText = `${cost} Token${cost > 1 ? 's' : ''}`;
        userBalance = `${tokens} Tokens`;
      } else if (defaultCurrency === 'tickets') {
        const cost = ('ticketCost' in item && item.ticketCost) ? item.ticketCost : 1;
        priceText = `${cost} Ticket${cost > 1 ? 's' : ''}`;
        userBalance = `${tickets} Tickets`;
      }

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
    },
    [diamonds, tokens, tickets, buy, showAlert],
  );

  const handleForgeTicket = useCallback(() => {
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
        showAlert({
          title: 'Ticket Forged',
          message: '1 Sanctuary Ticket has been forged into your wallet.',
          confirmText: 'Awesome',
          cancelText: null,
        });
      },
    });
  }, [diamonds, forgeTicket, showAlert]);

  const handleForgeToken = useCallback(
    (useTickets: boolean) => {
      if (useTickets) {
        if (tickets < TOKEN_FORGE_TICKETS) {
          showAlert({
            title: 'Need More Tickets',
            message: `Forging 1 Marketplace Token requires ${TOKEN_FORGE_TICKETS} Tickets. You currently have ${tickets}.`,
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
            showAlert({
              title: 'Token Forged',
              message: '1 Golden Marketplace Token added to your treasury.',
              confirmText: 'Great',
              cancelText: null,
            });
          },
        });
      } else {
        if (diamonds < TOKEN_FORGE_GEMS) {
          showAlert({
            title: 'Need More Gems',
            message: `Forging 1 Token directly requires ${TOKEN_FORGE_GEMS.toLocaleString()} Amber Gems. You currently have ${diamonds}.`,
            confirmText: 'Got it',
            cancelText: null,
          });
          return;
        }
        showAlert({
          title: 'Forge Marketplace Token?',
          message: `Convert ${TOKEN_FORGE_GEMS.toLocaleString()} Amber Gems into 1 Golden Marketplace Token?`,
          confirmText: 'Forge',
          onConfirm: () => {
            forgeToken(false);
            showAlert({
              title: 'Token Forged',
              message: '1 Golden Marketplace Token added to your treasury.',
              confirmText: 'Great',
              cancelText: null,
            });
          },
        });
      }
    },
    [diamonds, tickets, forgeToken, showAlert],
  );

  const confirmGearRequest = async () => {
    if (!gear) return;
    const isTokenPay = payMethod === 'tokens';
    const costGems = gear.cost;
    const costTokens = gear.tokenCost ?? 10;

    if (isTokenPay && tokens < costTokens) {
      showAlert({
        title: 'Not enough Tokens',
        message: `This requires ${costTokens} Tokens. You have ${tokens}.`,
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }
    if (!isTokenPay && diamonds < costGems) {
      showAlert({
        title: 'Not enough Gems',
        message: `This requires ${costGems.toLocaleString()} Gems. You have ${diamonds.toLocaleString()}.`,
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }

    try {
      if (gear.id.startsWith('plan_')) {
        const res = buy(gear.id, isTokenPay ? 'tokens' : 'gems');
        if (res.ok) {
          setGear(null);
          showAlert({
            title: 'Plan Enrolled',
            message: `You have successfully enrolled in ${gear.title}. All pathway milestones and daily routines are active.`,
            confirmText: 'Start Plan',
            cancelText: null,
          });
        }
        return;
      }

      const available = stock.data ? (stock.data[gear.id] ?? 0) : 0;
      if (available <= 0) {
        showAlert({
          title: 'Out of stock',
          message: 'This gear is temporarily out of stock. Stock is replenished on the 1st of each month.',
          confirmText: 'OK',
          cancelText: null,
        });
        return;
      }

      await requestGear.mutateAsync({
        itemId: gear.id,
        gems: costGems,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      buy(gear.id, isTokenPay ? 'tokens' : 'gems');

      setGear(null);
      setFullName('');
      setPhone('');
      setAddress('');

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

  const validOrder =
    fullName.trim().length > 1 &&
    /^[+\d][\d\s-]{5,19}$/.test(phone.trim()) &&
    address.trim().length >= 8;

  const renderVaultItem = useCallback(
    ({ item }: { item: MasterArtifact }) => (
      <VaultGridItem item={item} onPress={setInspectArt} colors={colors} typography={typography} />
    ),
    [colors, typography],
  );

  const renderGalleryItem = useCallback(
    ({ item }: { item: EditorialArt }) => (
      <GalleryGridItem item={item} onPress={setInspectArt} colors={colors} typography={typography} />
    ),
    [colors, typography],
  );

  return (
    <ScreenContainer
      header={<AppHeader title="Marketplace" subtitle="Spend gems & tokens on authentic wellness gear" showBack />}
      scrollMode="shell-scroll-view"
    >
      {/* 3-Pillar Treasury Wallet */}
      <Card style={[styles.walletCard, { marginBottom: spacing.sm }]}>
        <View style={styles.walletHeader}>
          <View style={styles.row}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>WELLNESS TREASURY</Text>
            {activeSticker && (
              <Badge
                label={`Equipped: ${MARKET.find((m) => m.id === activeSticker)?.title ?? activeSticker}`}
                variant="neutral"
              />
            )}
          </View>
          {multiplier > 1 && (
            <Badge label={`${streak}d Streak · ×${multiplier} Rewards`} variant="primary" />
          )}
        </View>

        <View style={styles.currencyRow}>
          <View style={styles.currencyCol}>
            <Image
              source={RewardAssets.currencies.amberGem}
              style={styles.currencyIcon}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
              {diamonds.toLocaleString()}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Amber Gems</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          <View style={styles.currencyCol}>
            <Image
              source={RewardAssets.currencies.sanctuaryPass}
              style={styles.currencyIcon}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{tickets}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Tickets</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          <View style={styles.currencyCol}>
            <Image
              source={RewardAssets.currencies.marketplaceToken}
              style={styles.currencyIcon}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
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
              accessibilityRole="button"
              accessibilityLabel={`View ${banner.title}`}
            >
              <Image
                source={banner.source}
                style={styles.heroBannerImg}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
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
          <Ionicons
            name="bag-handle-outline"
            size={16}
            color={activeTab === 'market' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'market' ? colors.text.primary : colors.text.secondary },
            ]}
          >
            Market
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'reliquary' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('reliquary')}
        >
          <Ionicons
            name="gift-outline"
            size={16}
            color={activeTab === 'reliquary' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'reliquary' ? colors.text.primary : colors.text.secondary },
            ]}
          >
            Chests
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'gallery' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('gallery')}
        >
          <Ionicons
            name="color-palette-outline"
            size={16}
            color={activeTab === 'gallery' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'gallery' ? colors.text.primary : colors.text.secondary },
            ]}
          >
            Gallery
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.segmentTab, activeTab === 'vault' && { backgroundColor: colors.surface }]}
          onPress={() => setActiveTab('vault')}
        >
          <Ionicons
            name="cube-outline"
            size={16}
            color={activeTab === 'vault' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'vault' ? colors.text.primary : colors.text.secondary },
            ]}
          >
            3D Vault
          </Text>
        </PressableScale>
      </View>

      {/* TAB 1: MAIN MARKETPLACE */}
      {activeTab === 'market' && (
        <View>
          {/* Unlocked Collection Shelf */}
          {(cards.length > 0 || owned.length > 0) && (
            <View style={{ marginBottom: spacing.md }}>
              <View style={styles.sectionHead}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                  Your Sanctuary Relics
                </Text>
                <Badge label={`${cards.length} Cards · ${owned.length} Items`} variant="neutral" />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfScroll}>
                {cards.map((c) => {
                  const cardArt = getCardAsset(c.id);
                  return (
                    <View key={c.id} style={[styles.cardItem, { backgroundColor: colors.surface }]}>
                      <Image
                        source={cardArt}
                        style={styles.cardItemImg}
                        contentFit="cover"
                        transition={150}
                        cachePolicy="memory-disk"
                      />
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.text.primary, textAlign: 'center', marginTop: 4 },
                        ]}
                        numberOfLines={1}
                      >
                        {c.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.primary }]}>{c.rarity}</Text>
                    </View>
                  );
                })}

                {MARKET.filter((m) => !m.physical && owned.includes(m.id)).map((m) => {
                  const art = getItemAsset(m.assetKey);
                  const isEquipped = activeSticker === m.id;
                  return (
                    <PressableScale
                      key={m.id}
                      onPress={() => setActiveSticker(m.id)}
                      style={[
                        styles.stickerItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isEquipped ? colors.primary : colors.border,
                          borderWidth: isEquipped ? 2 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Equip ${m.title}`}
                    >
                      {art ? (
                        <Image
                          source={art}
                          style={styles.stickerImg}
                          contentFit="contain"
                          transition={150}
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View style={[styles.stickerIconBg, { backgroundColor: colors.surface2 }]}>
                          <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                        </View>
                      )}
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.text.primary, textAlign: 'center', marginTop: 4 },
                        ]}
                        numberOfLines={1}
                      >
                        {m.title}
                      </Text>
                      <Badge
                        label={isEquipped ? 'Active Badge' : 'Tap to Equip'}
                        variant={isEquipped ? 'primary' : 'success'}
                      />
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section: Habit Stickers */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHead}>
              <Ionicons name="pricetags-outline" size={18} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                Habit Stickers
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {TIER_COST.sticker} Gems or 1 Token
              </Text>
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
                      <Image
                        source={art}
                        style={styles.itemImgThumb}
                        contentFit="contain"
                        transition={150}
                        cachePolicy="memory-disk"
                      />
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
                    <Button
                      label={activeSticker === m.id ? 'Equipped' : 'Equip Sticker'}
                      size="sm"
                      variant={activeSticker === m.id ? 'primary' : 'outline'}
                      onPress={() => setActiveSticker(m.id)}
                    />
                  ) : (
                    <View style={styles.actionRow}>
                      <Button
                        label={`${m.cost} Gems`}
                        size="sm"
                        variant={shortGems ? 'outline' : 'primary'}
                        disabled={shortGems}
                        onPress={() => promptUnlock(m, 'gems')}
                      />
                      <Button
                        label="1 Token"
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

          {/* Section: Status & Passes */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHead}>
              <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                Sanctuary Status
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {TIER_COST.status} Gems or 1 Ticket
              </Text>
            </View>

            {MARKET.filter((m) => m.tier === 'status').map((m) => {
              const have = owned.includes(m.id);
              const art = getItemAsset(m.assetKey);
              const shortGems = diamonds < m.cost;
              const shortTickets = tickets < 1;
              return (
                <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                    <Image
                      source={art ?? RewardAssets.currencies.sanctuaryPass}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
                      500 Gems · or 1 Sanctuary Ticket
                    </Text>
                  </View>
                  {have ? (
                    <Button
                      label={activeSticker === m.id ? 'Equipped' : 'Set as Title'}
                      size="sm"
                      variant={activeSticker === m.id ? 'primary' : 'outline'}
                      onPress={() => setActiveSticker(m.id)}
                    />
                  ) : (
                    <View style={styles.actionRow}>
                      <Button
                        label="500 Gems"
                        size="sm"
                        variant={shortGems ? 'outline' : 'primary'}
                        disabled={shortGems}
                        onPress={() => promptUnlock(m, 'gems')}
                      />
                      <Button
                        label="1 Ticket"
                        size="sm"
                        variant={shortTickets ? 'outline' : 'primary'}
                        disabled={shortTickets}
                        onPress={() => promptUnlock(m, 'tickets')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Section: Wellness Care Plans */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHead}>
              <Ionicons name="fitness-outline" size={18} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                Wellness Care Plans
              </Text>
              <Badge label="Structured Pathways" variant="gold" />
            </View>

            {WELLNESS_PLANS.map((p) => {
              const enrolled = owned.includes(p.id);
              const assetImg = getItemAsset(p.assetKey);
              const shortTokens = tokens < p.tokenCost;
              return (
                <Card key={p.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.gearThumb, { backgroundColor: colors.surface2 }]}>
                    {assetImg ? (
                      <Image
                        source={assetImg}
                        style={{ width: 56, height: 56, borderRadius: 10 }}
                        contentFit="cover"
                        transition={150}
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <Ionicons name={p.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.row}>
                      <Badge label={p.category} variant="primary" />
                    </View>
                    <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>{p.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{p.description}</Text>
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>
                      {p.cost.toLocaleString()} Gems · or {p.tokenCost} Tokens
                    </Text>
                  </View>
                  {enrolled ? (
                    <Badge label="Enrolled" variant="success" />
                  ) : (
                    <View style={styles.actionCol}>
                      <Button
                        label={`${p.tokenCost} Tokens`}
                        size="sm"
                        variant={shortTokens ? 'outline' : 'primary'}
                        disabled={shortTokens}
                        onPress={() => promptUnlock(p, 'tokens')}
                      />
                      <Button
                        label={`${(p.cost / 1000).toFixed(1)}k Gems`}
                        size="sm"
                        variant="outline"
                        onPress={() => promptUnlock(p, 'gems')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Section: Physical Merchandise Gear */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={styles.sectionHead}>
              <Ionicons name="cube-outline" size={18} color={colors.primary} />
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                Real Physical Gear
              </Text>
              <Badge label="Limited Stock" variant="neutral" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Delivered directly to your door. Real accessories funded strictly through verified health adherence.
            </Text>

            {MARKET.filter((m) => m.physical).map((m) => {
              const req = requests.data?.find((r) => r.item_id === m.id);
              const inStock = stock.data ? (stock.data[m.id] ?? 0) : 0;
              const shortGems = diamonds < m.cost;
              const assetImg = getItemAsset(m.assetKey);
              const shortTokens = tokens < (m.tokenCost ?? 10);
              return (
                <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
                  <View style={[styles.gearThumb, { backgroundColor: colors.surface2 }]}>
                    {assetImg ? (
                      <Image
                        source={assetImg}
                        style={styles.gearThumbImg}
                        contentFit="contain"
                        transition={150}
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                    <View style={[styles.row, { gap: 8, marginTop: 4 }]}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {m.cost.toLocaleString()} Gems · or {m.tokenCost ?? 10} Tokens
                      </Text>
                      <Text style={[typography.caption, { color: inStock > 0 ? colors.text.muted : colors.error }]}>
                        {inStock > 0 ? `${inStock} left this month` : 'Out of stock'}
                      </Text>
                    </View>
                  </View>
                  {req ? (
                    <Badge label={req.status === 'pending' ? 'Requested' : req.status} variant="neutral" />
                  ) : (
                    <View style={styles.actionCol}>
                      <Button
                        label={`${m.tokenCost ?? 10} Tokens`}
                        size="sm"
                        variant={shortTokens ? 'outline' : 'primary'}
                        disabled={inStock <= 0 || (shortGems && shortTokens)}
                        onPress={() => promptUnlock(m, 'tokens')}
                      />
                      <Button
                        label="Use Gems"
                        size="sm"
                        variant="outline"
                        disabled={inStock <= 0 || shortGems}
                        onPress={() => promptUnlock(m, 'gems')}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* TAB 2: MILESTONE RELIQUARY CHESTS & COLLECTOR CARDS */}
      {activeTab === 'reliquary' && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionHead}>
            <Ionicons name="gift" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
              Milestone Reliquary Troves
            </Text>
            <Badge label="5 Tiers" variant="gold" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
            Earned exclusively by reaching journey milestones on your Roadmap. Tap any chest to preview full loot animations and card drops.
          </Text>

          {LEVEL_CHESTS.map((c) => {
            const chestArt = getChestAssets(c.level);
            const cardArt = getCardAsset(c.card.id);
            const isUnlocked = ledger.some((e) => e.kind === 'chest_reward' && e.key === chestKey(c.level));
            return (
              <Card key={c.level} style={[styles.reliquaryCard, { marginBottom: spacing.md }]}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>
                      MILESTONE · LEVEL {c.level}
                    </Text>
                    <Text style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}>
                      {c.title}
                    </Text>
                  </View>
                  <Badge label={isUnlocked ? 'Claimed' : `Level ${c.level}`} variant={isUnlocked ? 'success' : 'neutral'} />
                </View>

                <Text style={[typography.caption, { color: colors.text.secondary, marginVertical: spacing.sm }]}>
                  +{c.gems} Amber Gems · Unlocks the {c.card.title} ({c.card.rarity}) Collector Card.
                </Text>

                {/* Dual Chest State Display */}
                <View style={styles.dualChestRow}>
                  <View style={styles.chestStateCol}>
                    <Image
                      source={chestArt.closed}
                      style={styles.largeChestImg}
                      contentFit="contain"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                    <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 4 }]}>Closed State</Text>
                  </View>
                  <View style={styles.chestStateCol}>
                    <Image
                      source={chestArt.burst}
                      style={styles.largeChestImg}
                      contentFit="contain"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>Burst Eruption</Text>
                  </View>
                </View>

                {/* Card Drop Preview */}
                <View style={[styles.cardDropPreview, { backgroundColor: colors.surface1 }]}>
                  <Image
                    source={cardArt}
                    style={styles.miniCardImg}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.flex}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>{c.card.rarity.toUpperCase()} COLLECTOR CARD</Text>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{c.card.title}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>Debossed geometric watermark seal</Text>
                  </View>
                  <Button label="Inspect Loot" size="sm" variant="outline" onPress={() => setChest(c)} />
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* TAB 3: ARTISANAL GOUACHE GALLERY */}
      {activeTab === 'gallery' && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionHead}>
            <Ionicons name="color-palette" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
              Artisanal Gouache Gallery
            </Text>
            <Badge label="11 Studies" variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
            Hand-painted Scandinavian-Japanese gouache on textured cotton paper. Tap any artwork to inspect full details.
          </Text>

          <View style={{ minHeight: 400 }}>
            <FlashList
              data={EDITORIAL_ARTWORKS}
              keyExtractor={(item) => item.id}
              renderItem={renderGalleryItem}
              numColumns={2}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        </View>
      )}

      {/* TAB 4: 3D ARTIFACTS VAULT */}
      {activeTab === 'vault' && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionHead}>
            <Ionicons name="cube" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
              Master 3D Artifacts Vault
            </Text>
            <Badge label={`${filteredVault.length} Renders`} variant="gold" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
            All 36 high-resolution 3D volumetric renders, medallions, vouchers, and composite promotional keyframes.
          </Text>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
            {(
              [
                'All',
                'Cinematic Banners',
                'Reliquary Chests',
                'Collector Cards',
                'Currencies & Tokens',
                'Physical Gear',
              ] as VaultFilter[]
            ).map((filter) => (
              <PressableScale
                key={filter}
                onPress={() => setVaultFilter(filter)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: vaultFilter === filter ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: vaultFilter === filter ? colors.onPrimary : colors.text.secondary },
                  ]}
                >
                  {filter}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Master 3D Artifacts Grid via FlashList */}
          <View style={{ minHeight: 600 }}>
            <FlashList
              data={filteredVault}
              keyExtractor={(item) => item.id}
              renderItem={renderVaultItem}
              numColumns={2}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        </View>
      )}

      {/* Everyday Earning Guide */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
        Everyday Habit Earnings
      </Text>
      {Object.values(ACTION_REWARDS).map((a) => (
        <View key={a.label} style={styles.earnRow}>
          <Text style={[typography.body, styles.flex, { color: colors.text.secondary }]}>{a.label}</Text>
          <Text style={[typography.bodyBold, { color: colors.primary }]}>+{a.gems} Gems</Text>
        </View>
      ))}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Rewards never reset. Streaks add up to a 2.5× multiplier. Everything here is earned through verified wellness habits.
      </Text>

      {/* Loot Box Inspection Modal */}
      <LootBoxModal key={chest?.level ?? 0} chest={chest} onClose={() => setChest(null)} />

      {/* Physical Delivery Request Bottom Sheet */}
      <AppBottomSheetModal
        visible={gear !== null}
        onClose={() => setGear(null)}
        title={gear?.title ?? 'Claim Reward'}
        subtitle="Delivery request"
      >
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
          {gear && gear.id.startsWith('plan_')
            ? 'Enrolling unlocks 30 daily coaching routines, personalized diet plans, and verified tracking.'
            : 'Shipped to you at zero cost. We will text you tracking when your package leaves.'}
        </Text>

        <View style={styles.orderSummary}>
          <Text style={[typography.captionBold, { color: colors.text.secondary }]}>Payment Selection</Text>
          <View style={[styles.row, { gap: 10, marginTop: 6 }]}>
            <PressableScale
              style={[
                styles.payChoice,
                payMethod === 'gems' && { borderColor: colors.primary, backgroundColor: colors.primaryAlpha },
              ]}
              onPress={() => setPayMethod('gems')}
            >
              <Text style={[typography.captionBold, { color: payMethod === 'gems' ? colors.primary : colors.text.primary }]}>
                {gear ? gear.cost.toLocaleString() : 0} Gems
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Balance: {diamonds.toLocaleString()}</Text>
            </PressableScale>

            <PressableScale
              style={[
                styles.payChoice,
                payMethod === 'tokens' && { borderColor: colors.primary, backgroundColor: colors.primaryAlpha },
              ]}
              onPress={() => setPayMethod('tokens')}
            >
              <Text style={[typography.captionBold, { color: payMethod === 'tokens' ? colors.primary : colors.text.primary }]}>
                {gear ? (gear.tokenCost ?? 10) : 10} Tokens
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Balance: {tokens}</Text>
            </PressableScale>
          </View>
        </View>

        {gear && !gear.id.startsWith('plan_') && (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <TextField
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="First and last name"
              autoCapitalize="words"
            />
            <TextField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 or phone with country code"
              keyboardType="phone-pad"
            />
            <TextField
              label="Delivery address"
              value={address}
              onChangeText={setAddress}
              placeholder="Flat/house, street, city, pin code"
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          <Button
            label={gear && gear.id.startsWith('plan_') ? 'Enroll in Pathway' : 'Submit Delivery Request'}
            onPress={confirmGearRequest}
            disabled={Boolean(gear && !gear.id.startsWith('plan_') && !validOrder)}
          />
          <Button label="Cancel" variant="outline" onPress={() => setGear(null)} />
        </View>
      </AppBottomSheetModal>

      {/* Full-Screen Art / 3D Artifact Inspection Modal */}
      {inspectArt && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setInspectArt(null)}>
          <View style={[styles.modalScrim, { backgroundColor: colors.scrim }]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setInspectArt(null)}
              accessibilityRole="button"
              accessibilityLabel="Close inspection modal"
            />
            <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
              <View style={styles.modalCardHeader}>
                <Badge label={inspectArt.category} variant="gold" />
                <Pressable
                  onPress={() => setInspectArt(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                >
                  <Ionicons name="close-circle" size={26} color={colors.text.muted} />
                </Pressable>
              </View>
              <Image
                source={'source' in inspectArt ? inspectArt.source : getItemAsset(inspectArt.assetKey)}
                style={{ width: Math.min(CONTENT_WIDTH, 360), height: 260, borderRadius: 16 }}
                contentFit="contain"
                transition={150}
                cachePolicy="memory-disk"
              />
              <View style={styles.modalBody}>
                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 6 }]}>
                  {inspectArt.title}
                </Text>
                <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
                  {inspectArt.description}
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <Button label="Done" onPress={() => setInspectArt(null)} />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletCard: { padding: 16, borderRadius: 20 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  currencyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  currencyCol: { alignItems: 'center', flex: 1 },
  currencyIcon: { width: 36, height: 36 },
  walletDivider: { width: 1, height: 48, opacity: 0.3 },
  forgeBar: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth },
  forgeButtons: { flexDirection: 'row', gap: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroScroll: { gap: 12, paddingVertical: 4 },
  heroBannerWrap: {
    width: HERO_CARD_WIDTH,
    height: HERO_CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBannerImg: { width: HERO_CARD_WIDTH, height: HERO_CARD_HEIGHT },
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  shelfScroll: { gap: 10, paddingVertical: 6 },
  cardItem: {
    width: 96,
    alignItems: 'center',
    borderRadius: 14,
    padding: 8,
  },
  cardItemImg: { width: 88, height: 120, borderRadius: 10 },
  stickerItem: {
    width: 96,
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
  },
  stickerImg: { width: 52, height: 52, borderRadius: 12 },
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImgThumb: { width: 48, height: 48, borderRadius: 10 },
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
  },
  dualChestRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 12,
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
    width: 52,
    height: 72,
    borderRadius: 8,
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  gridCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginRight: 10,
  },
  gridCardMeta: {
    padding: 10,
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
    padding: 16,
    alignItems: 'center',
  },
  modalCardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalBody: {
    padding: 16,
    width: '100%',
  },
  orderSummary: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  payChoice: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  disabledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
