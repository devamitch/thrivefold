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

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { padding: spacing.base, marginTop: spacing.md }]}
    >
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

      <View style={styles.barsContainer}>
        {bars.map((b, idx) => {
          const filledHeight = Math.max(6, Math.round(b.heightPct * BAR_TRACK_HEIGHT));
          return (
            <View key={idx} style={styles.barColumn}>
              {/* Value label */}
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

              {/* Capsule track */}
              <View
                style={[
                  styles.track,
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
                  {
                    color: b.isToday ? colors.primary : colors.text.secondary,
                    fontWeight: b.isToday ? '700' : '500',
                  },
                ]}
              >
                {b.dayLabel}
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
