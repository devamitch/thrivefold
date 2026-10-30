import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  ACTION_REWARDS,
  chestKey,
  LEVEL_CHESTS,
  MARKET,
  streakMultiplier,
  TIER_COST,
  TICKET_FORGE_GEMS,
  TOKEN_FORGE_GEMS,
  TOKEN_FORGE_TICKETS,
  WELLNESS_PLANS,
  type LevelChest,
  type MarketItem,
  type WellnessPlan,
} from '../../domain/game/rewards';
import { useGearStock, useMyGearRequests, useRequestGear } from '../../services/rewards/gear';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

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
  return null;
}

/**
 * Thrivefold Open Marketplace & Economic Treasury (Spec §2, §4, §5):
 * - Real Amber Gems earned by verified daily habits (never bought for fiat money).
 * - Currency Forge: 500 Gems ➔ 1 Sanctuary Ticket; 5 Tickets (or 2,500 Gems) ➔ 1 Marketplace Token.
 * - Digital Habit Stickers: purchasable with either 100 Gems OR 1 Token.
 * - Milestone Chests: level-tiered loot drops with illustrated 3D chests & collectible cards.
 * - Real Workout Gear & Verified Wellness Plans: physical doorstep delivery & telehealth appointments.
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

  const opened = useMemo(() => ledger.filter((e) => e.kind === 'chest_reward').map((e) => e.key), [ledger]);
  const [chest, setChest] = useState<LevelChest | null>(null);
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
      // Handled by mutation error state
    }
  };

  const validOrder = fullName.trim().length > 1 && /^[+\d][\d\s-]{5,19}$/.test(phone.trim()) && address.trim().length >= 8;

  return (
    <ScreenContainer
      header={<AppHeader title="Marketplace" subtitle="Spend hard-earned gems and tokens on wellness gear" showBack />}
      scrollMode="shell-scroll-view"
    >
      {/* 3-Pillar Treasury Wallet */}
      <Card style={[styles.walletCard, { marginBottom: spacing.md }]}>
        <View style={styles.walletHeader}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>WELLNESS TREASURY</Text>
          {multiplier > 1 && (
            <Badge label={`${streak}d Streak · ×${multiplier} XP & Gems`} variant="primary" />
          )}
        </View>

        <View style={styles.currencyRow}>
          {/* Amber Gems */}
          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.amberGem} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{diamonds.toLocaleString()}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Amber Gems</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          {/* Sanctuary Tickets */}
          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.sanctuaryPass} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{tickets}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Tickets</Text>
          </View>

          <View style={[styles.walletDivider, { backgroundColor: colors.border }]} />

          {/* Marketplace Tokens */}
          <View style={styles.currencyCol}>
            <Image source={RewardAssets.currencies.marketplaceToken} style={styles.currencyIcon} contentFit="contain" />
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{tokens}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Tokens</Text>
          </View>
        </View>

        {/* Currency Forge Row */}
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

      {/* Milestone Chests Shelf */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.sectionHead}>
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Milestone Chests</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>You are level {level}</Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
          Guaranteed loot drops with Amber Gems and exclusive collector cards as you advance.
        </Text>

        <View style={styles.chestShelf}>
          {LEVEL_CHESTS.map((c) => {
            const done = opened.includes(chestKey(c.level));
            const ready = !done && level >= c.level;
            const chestArt = getChestAssets(c.level);
            return (
              <PressableScale
                key={c.level}
                disabled={!ready}
                disabledOpacity={done ? 0.7 : 0.45}
                onPress={() => setChest(c)}
                accessibilityRole="button"
                accessibilityLabel={ready ? `Open ${c.title}` : `${c.title}, level ${c.level}`}
                style={[
                  styles.chestItem,
                  {
                    backgroundColor: ready ? colors.primaryAlpha : colors.surface,
                    borderColor: ready ? colors.primary : 'transparent',
                    borderWidth: ready ? 1.5 : 0,
                  },
                ]}
              >
                <Image
                  source={done ? chestArt.burst : chestArt.closed}
                  style={styles.chestThumbnail}
                  contentFit="contain"
                />
                <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 4 }]}>Level {c.level}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center' }]} numberOfLines={1}>
                  {done ? 'Opened' : ready ? 'Tap to open' : `+${c.gems} gems`}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {/* Your Collection Shelf (Cards & Stickers) */}
      {owned.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionHead}>
            <Ionicons name="albums-outline" size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Your Collection Shelf</Text>
          </View>

          <View style={[styles.shelf, { marginTop: spacing.sm }]}>
            {/* Owned Cards */}
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

            {/* Owned Stickers & Status */}
            {MARKET.filter((m) => !m.physical && owned.includes(m.id)).map((m) => (
              <View key={m.id} style={[styles.stickerItem, { backgroundColor: colors.surface }]}>
                <View style={[styles.stickerIconBg, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
                </View>
                <Text style={[typography.captionBold, { color: colors.text.primary, textAlign: 'center', marginTop: 4 }]} numberOfLines={2}>
                  {m.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Digital Habit Stickers Section (Buy with Gems OR Tokens) */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.sectionHead}>
          <Ionicons name="happy-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Digital Habit Stickers</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>100 Gems or 1 Token</Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.xs }]}>
          Earned stickers attach to coach messages and slow letters.
        </Text>

        {MARKET.filter((m) => m.tier === 'sticker').map((m) => {
          const have = owned.includes(m.id);
          const shortGems = diamonds < m.cost;
          const shortTokens = tokens < (m.tokenCost ?? 1);
          return (
            <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
              <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.primary} />
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

      {/* Sanctuary Status & Boosters */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.sectionHead}>
          <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Sanctuary Status & Badges</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>500 Gems or 1 Ticket</Text>
        </View>

        {MARKET.filter((m) => m.tier === 'status').map((m) => {
          const have = owned.includes(m.id);
          const shortGems = diamonds < m.cost;
          const shortTickets = tickets < 1;
          return (
            <Card key={m.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
              <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                <Image source={RewardAssets.currencies.sanctuaryPass} style={{ width: 42, height: 42 }} contentFit="contain" />
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

      {/* Wellness & Nutrition Plans Section */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.sectionHead}>
          <Ionicons name="fitness-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Wellness & Nutrition Plans</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Tokens or Gems</Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.xs }]}>
          Verified doctor consultations, organic whole-food meal boxes, and movement pathways.
        </Text>

        {WELLNESS_PLANS.map((p) => {
          const assetImg = getItemAsset(p.assetKey);
          const have = owned.includes(p.id);
          const shortGems = diamonds < p.cost;
          const shortTokens = tokens < p.tokenCost;
          return (
            <Card key={p.id} style={[styles.itemCard, { marginTop: spacing.sm }]}>
              <View style={[styles.stickerThumb, { backgroundColor: colors.surface2 }]}>
                {assetImg ? (
                  <Image source={assetImg} style={{ width: 44, height: 44, borderRadius: 8 }} contentFit="contain" />
                ) : (
                  <Ionicons name={p.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.primary} />
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
                    label={`${(p.cost / 1000).toFixed(0)}k 💎`}
                    size="sm"
                    variant="outline"
                    disabled={shortGems}
                    onPress={() => promptUnlock(p, 'gems')}
                  />
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Real Physical Workout Gear Section */}
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.sectionHead}>
          <Ionicons name="barbell-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Real Workout Gear</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Doorstep Delivery</Text>
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.xs }]}>
          Limited stock hand-crafted physical items delivered directly to your doorstep.
        </Text>

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

      {/* Your Submitted Gear Requests */}
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

      {/* Everyday Habit Earning Guide */}
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

      {/* Milestone Loot Box Opening Modal */}
      <LootBoxModal key={chest?.level ?? 0} chest={chest} onClose={() => setChest(null)} />

      {/* Doorstep Delivery Order Modal */}
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
  walletCard: { padding: 16 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  currencyCol: { alignItems: 'center', flex: 1 },
  currencyIcon: { width: 36, height: 36 },
  walletDivider: { width: 1, height: 48, opacity: 0.3 },
  forgeBar: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth },
  forgeButtons: { flexDirection: 'row', gap: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chestShelf: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  chestItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  chestThumbnail: { width: 52, height: 52 },
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
  },
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
});
