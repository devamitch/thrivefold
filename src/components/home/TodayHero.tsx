import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

const RING = 92;
const STROKE = 8;

interface Props {
  done: number;
  total: number;
  points: number;
  target: number;
  level: number;
  xpToNext: number | null;
  checkIn: { energy: number; mood: number; stress: number; sleepHours: number } | null;
  onCheckIn: () => void;
  onRoadmap: () => void;
}

/** Today at a glance: quests done, the points ring, how you checked in, and your level. */
export function TodayHero({ done, total, points, target, level, xpToNext, checkIn, onCheckIn, onRoadmap }: Props) {
  const { colors, typography, spacing } = useTheme();
  const r = (RING - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const share = Math.min(1, points / Math.max(1, target));

  return (
    <SquircleSurface radius={28} fill={colors.primary} style={[styles.hero, { padding: spacing.lg }]}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={[typography.label, { color: colors.onPrimaryMuted }]}>Today</Text>
          <Text style={[typography.display, { color: colors.onPrimary, marginTop: 2 }]}>
            {total ? `${done} of ${total}` : 'No quests'}
          </Text>
          <Text style={[typography.subbody, { color: colors.onPrimaryMuted }]}>
            {total ? (done >= total ? 'All quests done. Well done.' : 'quests done') : 'They appear once setup is finished.'}
          </Text>
        </View>
        <View accessible accessibilityLabel={`${points} of ${target} points today`}>
          <Svg width={RING} height={RING}>
            <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={colors.onPrimarySurface} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={r}
              stroke={colors.onPrimary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={c * (1 - share)}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Text style={[typography.subheading, { color: colors.onPrimary }]}>{points}</Text>
            <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>of {target} pts</Text>
          </View>
        </View>
      </View>

      {checkIn ? (
        <PressableScale onPress={onCheckIn} accessibilityRole="button" accessibilityLabel="Update today's check-in">
          <View style={[styles.metrics, { marginTop: spacing.md }]}>
            {(
              [
                ['Energy', `${checkIn.energy}`],
                ['Mood', `${checkIn.mood}`],
                ['Stress', `${checkIn.stress}`],
                ['Sleep', `${checkIn.sleepHours}h`],
              ] as const
            ).map(([label, value]) => (
              <SquircleSurface key={label} radius={14} fill={colors.onPrimarySurface} style={styles.metric}>
                <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>{value}</Text>
                <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>{label}</Text>
              </SquircleSurface>
            ))}
          </View>
        </PressableScale>
      ) : (
        <PressableScale onPress={onCheckIn} accessibilityRole="button" accessibilityLabel="Check in">
          <SquircleSurface radius={16} fill={colors.onPrimary} style={[styles.cta, { marginTop: spacing.md }]}>
            <Ionicons name="sunny-outline" size={18} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.primary }]}>Check in · 1 minute</Text>
          </SquircleSurface>
        </PressableScale>
      )}

      <PressableScale onPress={onRoadmap} accessibilityRole="button" accessibilityLabel={`Level ${level}. Open roadmap`}>
        <View style={[styles.levelRow, { marginTop: spacing.md }]}>
          <Text style={[typography.subbodyBold, { color: colors.onPrimary }]}>Level {level}</Text>
          <Text style={[typography.caption, styles.flex, { color: colors.onPrimaryMuted }]}>
            {xpToNext !== null ? ` · ${xpToNext} XP to level ${level + 1}` : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.onPrimaryMuted} />
        </View>
      </PressableScale>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  cta: { alignItems: 'center', flexDirection: 'row', gap: 8, height: 48, justifyContent: 'center' },
  flex: { flex: 1 },
  hero: { overflow: 'hidden' },
  levelRow: { alignItems: 'center', flexDirection: 'row', minHeight: 32 },
  metric: { alignItems: 'center', flex: 1, paddingVertical: 10 },
  metrics: { flexDirection: 'row', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});
