import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRootStore } from '../../stores/useRootStore';
import type { BetaSession, BetaSessionKind } from '../../stores/slices/appSlice';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

interface Props {
  kinds: BetaSessionKind[];
  /** The metric drawn as bars, e.g. 'blinksPerMin' or 'reps'. */
  metric: string;
  unit: string;
  title?: string;
  /** One-line summary of a session for the list. */
  describe: (s: BetaSession) => string;
}

const when = (ms: number) =>
  new Date(ms).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

/** Saved sessions of one beta product: the last 12 as bars (oldest left) and the latest five listed. */
export function BetaSessionHistory({ kinds, metric, unit, title = 'Your sessions', describe }: Props) {
  const { colors, typography } = useTheme();
  const all = useRootStore((s) => s.betaSessions);
  const sessions = useMemo(() => all.filter((s) => kinds.includes(s.kind)), [all, kinds]);
  const recent = sessions.slice(0, 12).reverse();
  const values = recent.map((s) => s.metrics[metric] ?? 0);
  const max = Math.max(1, ...values);
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>{title}</Text>
        {avg !== null ? (
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            avg {avg} {unit}
          </Text>
        ) : null}
      </View>
      {sessions.length === 0 ? (
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
          Nothing saved yet. Finished sessions are kept on this phone.
        </Text>
      ) : (
        <>
          <View style={styles.chart} accessible accessibilityLabel={`Last ${values.length} sessions, ${metric}`}>
            {values.map((v, i) => (
              <View key={recent[i].id} style={styles.slot}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(3, (v / max) * 48),
                      backgroundColor: i === values.length - 1 ? colors.primary : colors.surface3,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          {sessions.slice(0, 5).map((s) => (
            <View key={s.id} style={[styles.row, { borderTopColor: colors.surface1 }]}>
              <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>{when(s.endedAt)}</Text>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>{describe(s)}</Text>
            </View>
          ))}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  head: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 52, gap: 4, marginTop: 10, marginBottom: 6 },
  slot: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth },
});
