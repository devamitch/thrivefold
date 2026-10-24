import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { currentLevelProgress } from '../../domain/game/gameCatalogService';
import { useServerProgress } from '../../services/supabase/queries';
import { FEATURE_UNLOCKS, ownedEmblems, unlockStatus, type LedgerEntry } from '../../domain/game/progression';

const KIND_LABEL: Record<LedgerEntry['kind'], string> = {
  task_reward: 'Quest',
  daily_goal: 'Daily goal',
  level_clear: 'Level cleared',
  unlock_spend: 'Unlocked',
  legacy_import: 'Earlier progress',
  setup_reward: 'Setting up',
  workout_reward: 'Workouts',
};

/** Level, diamonds, unlocks, emblem and reward history, all derived from the reward ledger. */
export function ProgressionPanel() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      xp: st.xp,
      diamonds: st.diamonds,
      ledger: st.rewardLedger,
      entitlements: st.entitlements,
      completedCheckpoints: st.completedCheckpoints,
      selectedEmblem: st.selectedEmblem,
      purchaseUnlock: st.purchaseUnlock,
      setEmblem: st.setEmblem,
      showAlert: st.showAlert,
      showToast: st.showToast,
      signedIn: Boolean(st.user && !st.user.isGuest && st.user.email),
      pending: st.pendingSync.length,
    })),
  );
  const server = useServerProgress(s.signedIn);
  const progress = useMemo(() => currentLevelProgress(s.xp, s.completedCheckpoints), [s.xp, s.completedCheckpoints]);
  const emblems = ownedEmblems(s.entitlements);
  const recent = useMemo(() => [...s.ledger].reverse().slice(0, 8), [s.ledger]);
  const pct = progress.xpForNext > 0 ? Math.min(100, (progress.xpIntoLevel / progress.xpForNext) * 100) : 100;

  const buy = (id: string, title: string, cost: number) =>
    s.showAlert({
      title: `Unlock ${title}?`,
      message: `This uses ${cost} diamonds. Diamonds are earned only; nothing here costs money.`,
      confirmText: 'Unlock',
      onConfirm: () => {
        const result = s.purchaseUnlock(id);
        s.showToast(
          result.ok
            ? { type: 'success', title: 'Unlocked', message: title }
            : { type: 'warning', message: 'Not unlocked. No diamonds were spent.' },
        );
      },
    });

  return (
    <View>
      <Card style={{ padding: spacing.lg, marginTop: spacing.sm }}>
        <View style={styles.row}>
          <View style={[styles.emblem, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name={s.selectedEmblem as keyof typeof Ionicons.glyphMap} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Chapter {progress.definition.chapterNumber}</Text>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Level {progress.level}</Text>
          </View>
          <View style={styles.diamonds}>
            <Ionicons name="diamond-outline" size={18} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 4 }]}>{s.diamonds}</Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <View style={[styles.fill, { backgroundColor: colors.primary, width: `${pct}%` }]} />
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          {progress.blockedByCheckpointId
            ? 'You have the XP for the next level; this chapter ends with a checkpoint that is not available yet.'
            : progress.next
              ? `${progress.xpIntoLevel} / ${progress.xpForNext} XP to level ${progress.next.level} · ${s.xp} XP total`
              : `${s.xp} XP total`}
        </Text>
        {s.signedIn ? (
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons
              name={s.pending > 0 ? 'cloud-upload-outline' : server.data ? 'cloud-done-outline' : 'cloud-offline-outline'}
              size={14}
              color={colors.text.muted}
            />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 6, flex: 1 }]}>
              {s.pending > 0
                ? `${s.pending} reward${s.pending === 1 ? '' : 's'} waiting to sync`
                : server.data
                  ? `Saved to your account: level ${server.data.level}, ${server.data.xp} XP`
                  : 'Not synced yet'}
            </Text>
          </View>
        ) : null}
      </Card>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Unlocks</Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
        Earn diamonds by clearing levels and reaching your daily goal. Health, safety and privacy tools are never locked.
      </Text>
      {FEATURE_UNLOCKS.map((u) => {
        const status = unlockStatus(u, { level: progress.level, diamonds: s.diamonds, entitlements: s.entitlements });
        const owned = status.block === 'OWNED';
        return (
          <Card key={u.id} style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{u.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{u.description}</Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                  {u.cost} diamonds · from level {u.minLevel}
                </Text>
              </View>
              {owned ? (
                <Badge label="Owned" variant="success" />
              ) : (
                <Button
                  label={status.block === 'LEVEL_TOO_LOW' ? `Level ${u.minLevel}` : 'Unlock'}
                  size="sm"
                  variant={status.canUnlock ? 'primary' : 'outline'}
                  disabled={!status.canUnlock}
                  onPress={() => buy(u.id, u.title, u.cost)}
                />
              )}
            </View>
          </Card>
        );
      })}

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Emblem</Text>
      <View style={[styles.emblemRow, { marginTop: spacing.sm }]}>
        {emblems.map((e) => {
          const selected = e === s.selectedEmblem;
          return (
            <Pressable
              key={e}
              onPress={() => s.setEmblem(e)}
              accessibilityRole="button"
              accessibilityLabel={`Emblem ${e}`}
              accessibilityState={{ selected }}
              style={[
                styles.emblemChoice,
                { backgroundColor: selected ? colors.primaryAlpha : colors.surface1, borderColor: selected ? colors.primary : 'transparent' },
              ]}
            >
              <Ionicons name={e as keyof typeof Ionicons.glyphMap} size={22} color={selected ? colors.primary : colors.text.secondary} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Recent rewards</Text>
      {recent.length === 0 ? (
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
          Complete a quest to see your first reward here.
        </Text>
      ) : (
        recent.map((e) => (
          <View key={e.key} style={[styles.row, styles.ledgerRow, { borderBottomColor: colors.border }]}>
            <Text style={[typography.subbody, { color: colors.text.primary, flex: 1 }]}>{KIND_LABEL[e.kind]}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {[e.xp ? `+${e.xp} XP` : '', e.taskPoints ? `+${e.taskPoints} pts` : '', e.diamonds ? `${e.diamonds > 0 ? '+' : ''}${e.diamonds} diamonds` : '']
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  emblem: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  diamonds: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  emblemRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emblemChoice: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  ledgerRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 44 },
});
