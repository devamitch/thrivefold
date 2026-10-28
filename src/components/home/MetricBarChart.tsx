import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { EqualizerBar } from '../../domain/analytics/dashboardAnalytics';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

interface Props {
  bars: EqualizerBar[];
  title: string;
  subtitle: string;
  totalDisplay?: string;
  onPress?: () => void;
}

const BAR_TRACK_HEIGHT = 80;
const BAR_WIDTH = 12;

export function MetricBarChart({ bars, title, subtitle, totalDisplay, onPress }: Props) {
  const { colors, typography, spacing } = useTheme();
  const dense = bars.length > 10;
  const empty = bars.every((b) => b.value <= 0);

  return (
    <Card onPress={onPress} style={[styles.card, { padding: spacing.base, marginTop: spacing.md }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>{title}</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        </View>

        {totalDisplay ? (
          <View style={[styles.badge, { backgroundColor: colors.surface1 }]}>
            <Text style={[typography.label, { color: colors.primary }]}>{totalDisplay}</Text>
          </View>
        ) : null}
      </View>

      {empty ? (
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          Nothing recorded in this period yet.
        </Text>
      ) : (
        <View style={styles.barsContainer}>
          {bars.map((b, idx) => {
            const filledHeight = Math.max(
              dense ? 3 : 6,
              Math.round(b.heightPct * BAR_TRACK_HEIGHT),
            );
            // Month view: no per-bar numbers, and a date label only once a week and on today.
            const showLabel = !dense || b.isToday || (bars.length - 1 - idx) % 7 === 0;
            return (
              <View key={idx} style={styles.barColumn}>
                {/* Value label */}
                {dense ? null : (
                  <Text
                    style={[
                      typography.caption,
                      styles.valueLabel,
                      {
                        color: b.isToday ? colors.primary : colors.text.muted,
                        fontWeight: b.isToday ? '700' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {b.value > 0 ? b.displayValue : '—'}
                  </Text>
                )}

                {/* Capsule track */}
                <View
                  style={[
                    styles.track,
                    dense ? styles.trackDense : null,
                    {
                      height: BAR_TRACK_HEIGHT,
                      backgroundColor: colors.surface1,
                    },
                  ]}
                >
                  {/* Filled Bar */}
                  <View
                    style={[
                      styles.fill,
                      {
                        height: filledHeight,
                        backgroundColor: b.isToday ? colors.primary : colors.surface3,
                      },
                    ]}
                  />
                </View>

                {/* Day Name */}
                <Text
                  style={[
                    typography.caption,
                    styles.dayLabel,
                    dense ? styles.dayLabelDense : null,
                    {
                      color: b.isToday ? colors.primary : colors.text.secondary,
                      fontWeight: b.isToday ? '700' : '500',
                    },
                  ]}
                >
                  {showLabel ? b.dayLabel : ' '}
                </Text>

                {/* Today dot indicator */}
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: b.isToday ? colors.primary : 'transparent',
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  track: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // Wider than its thin month column; overflow is visible so two-digit dates never wrap.
  dayLabelDense: { width: 28, textAlign: 'center' },
  trackDense: { width: 5, borderRadius: 2.5 },
  fill: {
    width: '100%',
    borderRadius: BAR_WIDTH / 2,
  },
  dayLabel: {
    marginTop: 6,
    fontSize: 11,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
