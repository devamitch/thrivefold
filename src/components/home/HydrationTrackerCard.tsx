import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { hapticLight, hapticSuccess } from '../../services/haptics';
import type { WaterLogEntry } from '../../stores/slices/healthSlice';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

const GLASS_ML = 250;
const QUICK_ADD = [150, 250, 500] as const;

interface Props {
  /** Canonical saved total for today, in 250 ml glasses. */
  glasses: number;
  targetGlasses: number;
  /** Today's journaled changes, newest first. */
  entries: WaterLogEntry[];
  onAddMl: (ml: number) => void;
  onUndo: () => void;
  onEditGoal: () => void;
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export function HydrationTrackerCard({
  glasses,
  targetGlasses,
  entries,
  onAddMl,
  onUndo,
  onEditGoal,
}: Props) {
  const { colors, typography, spacing } = useTheme();

  const volumeMl = Math.round(glasses * GLASS_ML);
  const targetMl = Math.round(targetGlasses * GLASS_ML);
  const reached = volumeMl >= targetMl;
  const remainingMl = Math.max(0, targetMl - volumeMl);
  const last = entries[0];

  const handleAdd = (ml: number) => {
    if (!reached && volumeMl + ml >= targetMl) hapticSuccess();
    else hapticLight();
    onAddMl(ml);
  };

  return (
    <Card style={{ padding: spacing.base }}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="water-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Water</Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {volumeMl.toLocaleString()} of {targetMl.toLocaleString()} ml
            {reached ? ' · goal reached' : ` · ${remainingMl.toLocaleString()} ml to go`}
          </Text>
        </View>
        <PressableScale
          onPress={onEditGoal}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Daily goal ${targetGlasses} glasses. Change goal`}
          style={[styles.goalBtn, { backgroundColor: colors.surface1 }]}
        >
          <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
            Goal {targetGlasses}
          </Text>
        </PressableScale>
      </View>

      <View
        style={styles.meterRow}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Water today"
        accessibilityValue={{ min: 0, max: targetMl, now: Math.min(volumeMl, targetMl), text: `${volumeMl} ml of ${targetMl} ml` }}
      >
        {Array.from({ length: targetGlasses }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, glasses - i));
          return (
            <View key={i} style={[styles.capsule, { backgroundColor: colors.surface1 }]}>
              {fill > 0 ? (
                <View
                  style={[styles.capsuleFill, { width: `${fill * 100}%`, backgroundColor: colors.primary }]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        {QUICK_ADD.map((ml) => (
          <PressableScale
            key={ml}
            onPress={() => handleAdd(ml)}
            style={[styles.addBtn, { backgroundColor: ml === GLASS_ML ? colors.primary : colors.surface1 }]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${ml} millilitres of water`}
          >
            <Text
              style={[
                typography.captionBold,
                { color: ml === GLASS_ML ? colors.onPrimary : colors.text.primary },
              ]}
            >
              +{ml} ml
            </Text>
          </PressableScale>
        ))}
      </View>

      <View style={[styles.historyRow, { borderTopColor: colors.surface1 }]}>
        <Text
          numberOfLines={1}
          style={[typography.caption, styles.flex, { color: colors.text.muted }]}
        >
          {last
            ? `Last: ${last.glasses > 0 ? '+' : ''}${last.milliliters} ml at ${timeOf(last.timestamp)}${entries.length > 1 ? ` · ${entries.length} entries today` : ''}`
            : glasses > 0
              ? 'Saved earlier today'
              : 'Nothing logged yet today'}
        </Text>
        <PressableScale
          onPress={() => {
            hapticLight();
            onUndo();
          }}
          disabled={!last}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: !last }}
          accessibilityLabel={last ? `Undo last entry, ${last.milliliters} millilitres` : 'Nothing to undo'}
          style={styles.undo}
        >
          <Ionicons
            name="arrow-undo-outline"
            size={14}
            color={last ? colors.text.secondary : colors.text.muted}
          />
          <Text
            style={[
              typography.captionBold,
              { color: last ? colors.text.secondary : colors.text.muted, marginLeft: 4 },
            ]}
          >
            Undo
          </Text>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalBtn: { paddingHorizontal: 10, height: 30, borderRadius: 10, justifyContent: 'center' },
  meterRow: { flexDirection: 'row', gap: 5, marginTop: 14, height: 10 },
  capsule: { flex: 1, borderRadius: 5, overflow: 'hidden' },
  capsuleFill: { height: '100%', borderRadius: 5 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  addBtn: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  undo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingLeft: 12 },
});
