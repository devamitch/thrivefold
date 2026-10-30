import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/AppHeader';
import { AppBottomSheetModal } from '../../components/ui/AppBottomSheetModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { ACTION_REWARDS, MARKET, TIER_COST, type MarketItem, type MarketTier } from '../../domain/game/rewards';
import { useGearStock, useMyGearRequests, useRequestGear } from '../../services/rewards/gear';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const TIERS: { tier: MarketTier; title: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; note: string }[] = [
  { tier: 'sticker', title: 'Stickers', icon: 'happy-outline', note: `${TIER_COST.sticker} gems each` },
  { tier: 'status', title: 'Status', icon: 'ribbon-outline', note: `${TIER_COST.status} gems` },
  { tier: 'gear', title: 'Real workout gear', icon: 'barbell-outline', note: `${TIER_COST.gear.toLocaleString()} gems · limited, delivered to you` },
];

/**
 * Spend gems earned by real habits: stickers and status unlock on the phone; real gear is a
 * limited request the Thrivefold team reviews and delivers. Gems are never sold for money.
 */
export default function MarketplaceScreen() {
  const { colors, typography, spacing } = useTheme();
  const { diamonds, owned, buy, showAlert } = useRootStore(
    useShallow((s) => ({ diamonds: s.diamonds, owned: s.marketOwned, buy: s.buyMarketItem, showAlert: s.showAlert })),
  );
  const stock = useGearStock();
  const requests = useMyGearRequests();
  const requestGear = useRequestGear();
  const [gear, setGear] = useState<MarketItem | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const unlock = (item: MarketItem) => {
    if (item.physical) return setGear(item);
    showAlert({
      title: `Unlock ${item.title}?`,
      message: `${item.cost} gems. You have ${diamonds}.`,
      confirmText: 'Unlock',
      onConfirm: () => {
        const r = buy(item.id);
        if (!r.ok) showAlert({ title: 'Not unlocked', message: r.reason === 'insufficient' ? 'Not enough gems yet.' : 'You already have this.', confirmText: 'OK', cancelText: null });
      },
    });
  };

  const sendGear = async () => {
    if (!gear) return;
    try {
      await requestGear.mutateAsync({ itemId: gear.id, gems: gear.cost, fullName, phone, address });
      // The server took one from stock; now spend the gems on the phone.
      buy(gear.id);
      setGear(null);
      showAlert({ title: 'Request sent', message: 'The Thrivefold team will review it and contact you about delivery.', confirmText: 'OK', cancelText: null });
    } catch {
      // Shown in the sheet below.
    }
  };

  const validGear = fullName.trim().length > 1 && /^[+\d][\d\s-]{5,19}$/.test(phone.trim()) && address.trim().length >= 10;

  return (
    <ScreenContainer header={<AppHeader title="Marketplace" subtitle="Spend gems earned by real habits" showBack />} scrollMode="shell-scroll-view">
      <Card style={[styles.balance, { marginBottom: spacing.lg }]}>
        <Ionicons name="diamond-outline" size={28} color={colors.primary} />
        <View style={styles.flex}>
          <Text style={[typography.heading, { color: colors.text.primary }]}>{diamonds.toLocaleString()} gems</Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Earned by habits, never bought. Real gear unlocks at 10,000.</Text>
        </View>
      </Card>

      {/* What the person already has: stickers on a shelf, status as a badge. */}
      {owned.length ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Your collection</Text>
          <View style={styles.shelf}>
            {MARKET.filter((m) => !m.physical && owned.includes(m.id)).map((m) => (
              <View key={m.id} style={[styles.sticker, { backgroundColor: colors.surface }]}>
                <View style={[styles.stickerIcon, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.primary} />
                </View>
                <Text style={[typography.caption, { color: colors.text.primary, textAlign: 'center' }]} numberOfLines={2}>
                  {m.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {TIERS.map(({ tier, title, icon, note }) => (
        <View key={tier} style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionHead}>
            <Ionicons name={icon} size={20} color={colors.primary} />
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>{title}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>{note}</Text>
          </View>
          {MARKET.filter((m) => m.tier === tier).map((m) => {
            const have = !m.physical && owned.includes(m.id);
            const left = m.physical ? stock.data?.[m.id] : undefined;
            const soldOut = m.physical && left === 0;
            const short = diamonds < m.cost;
            return (
              <Card key={m.id} style={[styles.item, { marginTop: spacing.sm }]}>
                <View style={[styles.stickerIcon, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                  {m.physical ? (
                    <Text style={[typography.caption, { color: soldOut ? colors.error : colors.text.muted, marginTop: 2 }]}>
                      {stock.isLoading ? 'Checking stock…' : left === undefined ? 'Stock shown when online' : soldOut ? 'Out of stock' : `${left} left`}
                    </Text>
                  ) : null}
                </View>
                {have ? (
                  <Badge label="Owned" variant="success" />
                ) : (
                  <Button
                    label={short ? `${(m.cost - diamonds).toLocaleString()} to go` : 'Unlock'}
                    size="sm"
                    variant={short ? 'outline' : 'primary'}
                    disabled={short || soldOut}
                    onPress={() => unlock(m)}
                  />
                )}
              </Card>
            );
          })}
        </View>
      ))}

      {requests.data?.length ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Your gear requests</Text>
          {requests.data.map((r) => (
            <Card key={r.id} style={[styles.item, { marginBottom: spacing.sm }]}>
              <Text style={[typography.body, styles.flex, { color: colors.text.primary }]}>{MARKET.find((m) => m.id === r.item_id)?.title ?? r.item_id}</Text>
              <Badge label={r.status} variant="primary" />
            </Card>
          ))}
        </View>
      ) : null}

      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>How to earn gems</Text>
      {Object.values(ACTION_REWARDS).map((a) => (
        <View key={a.label} style={styles.earnRow}>
          <Text style={[typography.body, styles.flex, { color: colors.text.secondary }]}>{a.label}</Text>
          <Text style={[typography.bodyBold, { color: colors.primary }]}>+{a.gems}</Text>
        </View>
      ))}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Plus quests, daily goals and level clears. Each action pays once per item per day, up to a daily limit.
      </Text>

      <AppBottomSheetModal visible={!!gear} onClose={() => setGear(null)} title={gear ? `Request ${gear.title}` : ''}>
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
          {TIER_COST.gear.toLocaleString()} gems are spent when the request is accepted. Your details are used only for this delivery and are
          visible only to you and the Thrivefold team.
        </Text>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" containerStyle={{ marginTop: spacing.sm }} />
        <TextField label="Delivery address" value={address} onChangeText={setAddress} multiline containerStyle={{ marginTop: spacing.sm }} />
        {requestGear.error ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{requestGear.error.message}</Text>
        ) : null}
        <View style={{ marginTop: spacing.md }}>
          <Button label={requestGear.isPending ? 'Sending…' : 'Send request'} disabled={!validGear || requestGear.isPending} onPress={() => void sendGear()} />
        </View>
      </AppBottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sticker: { width: 96, alignItems: 'center', gap: 6, borderRadius: 14, padding: 10 },
  stickerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
