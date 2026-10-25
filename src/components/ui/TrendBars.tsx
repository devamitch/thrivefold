import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/useTheme';

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  value: number | null;
}

/** Small bar chart of recent days; empty days show as gaps, never as zero. */
export function TrendBars({ points, max, label, unit = '' }: { points: TrendPoint[]; max: number; label: string; unit?: string }) {
  const { colors, typography } = useTheme();
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;
  return (
    <SquircleSurface accessible accessibilityLabel={`${label}: ${values.length ? `average ${avg}${unit} over ${values.length} days` : 'no data yet'}`}>
      <SquircleSurface style={styles.row}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          {avg !== null ? `avg ${avg}${unit} · ${values.length} days` : 'No entries yet'}
        </Text>
      </SquircleSurface>
      <SquircleSurface style={styles.bars}>
        {points.map((p) => (
          <SquircleSurface key={p.date} style={styles.slot}>
            <SquircleSurface
              style={[
                styles.bar,
                p.value === null
                  ? { height: 3, backgroundColor: colors.surface2 }
                  : { height: `${Math.max(6, (p.value / max) * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </SquircleSurface>
        ))}
      </SquircleSurface>
    </SquircleSurface>
  );
}

/** The last `days` dates ending today, oldest first, filled from a lookup. */
export function lastDays(days: number, lookup: (date: string) => number | null, today = new Date()): TrendPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { date, value: lookup(date) };
  });
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 64, gap: 3, marginTop: 8 },
  slot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: 3, width: '100%' },
});
