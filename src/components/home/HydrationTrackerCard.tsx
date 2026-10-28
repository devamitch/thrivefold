import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { hapticLight, hapticSuccess } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

const GLASS_ML = 250;

interface Props {
  glasses: number;
  targetGlasses?: number;
  onSetGlasses: (count: number) => void;
  onAddMl?: (ml: number) => void;
  onUndo?: () => void;
}

export function HydrationTrackerCard({
  glasses,
  targetGlasses = 8,
  onSetGlasses,
  onAddMl,
  onUndo,
}: Props) {
  const { colors, typography, spacing } = useTheme();

  const volumeMl = Math.round(glasses * GLASS_ML);
  const targetMl = Math.round(targetGlasses * GLASS_ML);
  const pct = Math.min(100, Math.round((glasses / Math.max(1, targetGlasses)) * 100));
  const reached = volumeMl >= targetMl;
  const remainingGlasses = Math.max(0, targetGlasses - Math.floor(glasses));
  const remainingMl = Math.max(0, targetMl - volumeMl);

  const handleAdd = (ml: number) => {
    if (onAddMl) {
      if (volumeMl + ml >= targetMl && !reached) {
        hapticSuccess();
      } else {
        hapticLight();
      }
      onAddMl(ml);
    } else {
      const addedGlasses = Math.round((ml / GLASS_ML) * 10) / 10;
      const next = Math.max(0, Math.min(24, Math.round((glasses + addedGlasses) * 10) / 10));
      if (next >= targetGlasses && glasses < targetGlasses) {
        hapticSuccess();
      } else {
        hapticLight();
      }
      onSetGlasses(next);
    }
  };

  const handleUndo = () => {
    hapticLight();
    if (onUndo) {
      onUndo();
    } else {
      onSetGlasses(Math.max(0, Math.round((glasses - 1) * 10) / 10));
    }
  };

  return (
    <Card style={[styles.card, { padding: spacing.base, marginTop: spacing.md }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: colors.infoSurface }]}>
            <Ionicons name="water" size={20} color={colors.info} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Daily Hydration
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
              {volumeMl.toLocaleString()} ml of {targetMl.toLocaleString()} ml
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: reached ? colors.successSurface : colors.infoSurface,
            },
          ]}
        >
          <Text
            style={[
              typography.label,
              {
                color: reached ? colors.success : colors.info,
              },
            ]}
          >
            {reached ? 'Goal Reached' : `${pct}%`}
          </Text>
        </View>
      </View>

      {/* 8 Droplet / Capsule Meters */}
      <View style={styles.meterRow}>
        {Array.from({ length: targetGlasses }).map((_, i) => {
          const isFilled = i < glasses;
          return (
            <View
              key={i}
              style={[
                styles.capsule,
                {
                  backgroundColor: isFilled ? colors.info : colors.surface1,
                  borderColor: isFilled ? colors.info : colors.surface2,
                },
              ]}
            >
              {isFilled ? (
                <Ionicons name="water" size={12} color={colors.onPrimary} />
              ) : (
                <View style={[styles.emptyDot, { backgroundColor: colors.surface3 }]} />
              )}
            </View>
          );
        })}
      </View>

      {/* Guidance Text */}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
        {reached
          ? 'Optimal daily hydration reached! Supporting metabolism, alertness and recovery.'
          : remainingGlasses <= 1
            ? `Just ${remainingMl} ml remaining to reach today's ${targetMl.toLocaleString()} ml target.`
            : `${remainingGlasses} glasses (${remainingMl.toLocaleString()} ml) to reach your daily hydration baseline.`}
      </Text>

      {/* Action Quick-Buttons: Undo, +150 ml, +250 ml, +500 ml */}
      <View style={styles.actionsRow}>
        <PressableScale
          onPress={handleUndo}
          disabled={glasses <= 0}
          style={[
            styles.adjustBtn,
            {
              backgroundColor: colors.surface1,
              opacity: glasses <= 0 ? 0.35 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Undo last water log"
        >
          <Ionicons name="arrow-undo-outline" size={14} color={colors.text.secondary} />
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 3 }]}>
            Undo
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => handleAdd(150)}
          style={[styles.adjustBtn, { backgroundColor: colors.surface2 }]}
          accessibilityRole="button"
          accessibilityLabel="Add 150ml cup of water"
        >
          <Ionicons name="add" size={14} color={colors.text.primary} />
          <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 2 }]}>
            +150 ml
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => handleAdd(250)}
          style={[styles.adjustBtn, { backgroundColor: colors.infoSurface }]}
          accessibilityRole="button"
          accessibilityLabel="Add 250ml glass of water"
        >
          <Ionicons name="add" size={14} color={colors.info} />
          <Text style={[typography.captionBold, { color: colors.info, marginLeft: 2 }]}>
            +250 ml
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => handleAdd(500)}
          style={[styles.adjustBtn, { backgroundColor: colors.info }]}
          accessibilityRole="button"
          accessibilityLabel="Add 500ml bottle of water"
        >
          <Ionicons name="add" size={14} color={colors.onPrimary} />
          <Text style={[typography.captionBold, { color: colors.onPrimary, marginLeft: 2 }]}>
            +500 ml
          </Text>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  meterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    height: 32,
  },
  capsule: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  adjustBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 12,
  },
});
