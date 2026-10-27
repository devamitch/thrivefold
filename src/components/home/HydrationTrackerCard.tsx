import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { hapticLight, hapticSuccess } from '../../services/haptics';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

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

  const handleAdd = (ml: number) => {
    if (onAddMl) {
      hapticLight();
      onAddMl(ml);
    } else {
      const addedGlasses = Math.round((ml / 250) * 10) / 10;
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

  const volumeMl = glasses * 250;
  const targetMl = targetGlasses * 250;
  const pct = Math.min(100, Math.round((glasses / Math.max(1, targetGlasses)) * 100));
  const remaining = Math.max(0, targetGlasses - glasses);

  return (
    <Card style={[styles.card, { padding: spacing.base, marginTop: spacing.md }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface1 }]}>
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
              backgroundColor: glasses >= targetGlasses ? colors.successSurface : colors.surface1,
            },
          ]}
        >
          <Text
            style={[
              typography.label,
              {
                color: glasses >= targetGlasses ? colors.success : colors.info,
              },
            ]}
          >
            {glasses >= targetGlasses ? 'Goal Reached' : `${pct}%`}
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
                  borderColor: isFilled ? colors.info : colors.border,
                },
              ]}
            >
              {isFilled ? (
                <Ionicons name="water" size={12} color={colors.surface} />
              ) : (
                <View style={[styles.emptyDot, { backgroundColor: colors.surface3 }]} />
              )}
            </View>
          );
        })}
      </View>

      {/* Guidance Text */}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
        {glasses >= targetGlasses
          ? 'Optimal daily hydration reached! Supporting metabolism, alertness and recovery.'
          : remaining === 1
            ? 'Just 1 glass remaining to reach today’s 2,000 ml target.'
            : `${remaining} glasses (${remaining * 250} ml) to reach your daily hydration baseline.`}
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
          style={[styles.adjustBtn, { backgroundColor: colors.primaryAlpha }]}
          accessibilityRole="button"
          accessibilityLabel="Add 250ml glass of water"
        >
          <Ionicons name="add" size={14} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 2 }]}>
            +250 ml
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => handleAdd(500)}
          style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
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
