import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DeviceReading, VitalKind } from '../../domain/interop/readings';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

const ROWS: { kind: VitalKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'spo2_pct', label: 'Blood oxygen', icon: 'water-outline' },
  { kind: 'resting_hr', label: 'Resting heart rate', icon: 'heart-outline' },
  { kind: 'hrv_ms', label: 'Heart rate variability', icon: 'pulse-outline' },
  { kind: 'respiratory_rate', label: 'Breathing rate', icon: 'leaf-outline' },
  { kind: 'bp_systolic', label: 'Blood pressure', icon: 'speedometer-outline' },
  { kind: 'glucose_mmol', label: 'Blood glucose', icon: 'flask-outline' },
];

const UNIT_LABEL: Partial<Record<VitalKind, string>> = {
  spo2_pct: '%',
  resting_hr: ' bpm',
  hrv_ms: ' ms',
  respiratory_rate: ' /min',
  bp_systolic: ' mmHg',
  glucose_mmol: ' mmol/L',
};

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/**
 * Latest device-measured vitals from Health Connect (last 14 days). Hidden when there are none:
 * the phone itself measures none of these, so nothing is ever shown without a real source.
 */
export function VitalsCard({ readings, today }: { readings: DeviceReading[]; today: string }) {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const rows = useMemo(() => {
    const cutoff = new Date(Date.parse(`${today}T12:00:00`) - 14 * 86_400_000);
    const since = cutoff.toISOString().slice(0, 10);
    const latest = (kind: string) =>
      readings
        .filter((r) => r.kind === kind && r.date >= since)
        .reduce<DeviceReading | null>((a, r) => (!a || r.date > a.date ? r : a), null);
    return ROWS.flatMap((row) => {
      const r = latest(row.kind);
      if (!r) return [];
      const value =
        row.kind === 'bp_systolic'
          ? `${r.value}/${latest('bp_diastolic')?.value ?? '–'}${UNIT_LABEL.bp_systolic}`
          : `${r.value}${UNIT_LABEL[row.kind] ?? ''}`;
      return [{ ...row, value, when: r.date === today ? 'Today' : shortDate(r.date) }];
    });
  }, [readings, today]);

  if (rows.length === 0) return null;

  return (
    <Card
      onPress={() => router.push('/(app)/health/integrations' as Href)}
      accessibilityLabel={`Vitals from your devices: ${rows.map((r) => `${r.label} ${r.value}, ${r.when}`).join('; ')}`}
      style={{ padding: spacing.base, marginTop: spacing.md }}
    >
      <View style={styles.head}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Vitals</Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>From your devices · Health Connect</Text>
      </View>
      {rows.map((r) => (
        <View key={r.kind} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name={r.icon} size={15} color={colors.primary} />
          </View>
          <Text numberOfLines={1} style={[typography.subbody, styles.flex, { color: colors.text.secondary }]}>
            {r.label}
          </Text>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{r.value}</Text>
          <Text style={[typography.caption, styles.when, { color: colors.text.muted }]}>{r.when}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  icon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  when: { minWidth: 44, textAlign: 'right' },
});
