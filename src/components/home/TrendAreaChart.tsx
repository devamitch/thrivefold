import { Canvas, Circle, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import type { DayTrendPoint } from '../../domain/analytics/dashboardAnalytics';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

interface Props {
  points: DayTrendPoint[];
  onCheckIn?: () => void;
}

const CHART_HEIGHT = 130;
const PADDING_X = 20;
const PADDING_Y = 16;

export function TrendAreaChart({ points, onCheckIn }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [containerWidth, setContainerWidth] = useState(320);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerWidth) > 2) {
      setContainerWidth(w);
    }
  };

  const hasAnyData = useMemo(() => points.some((p) => p.hasData), [points]);

  const activePointsWithData = useMemo(() => points.filter((p) => p.hasData), [points]);
  const avgVitality = useMemo(() => {
    if (activePointsWithData.length === 0) return 0;
    const sum = activePointsWithData.reduce((acc, p) => acc + p.vitality, 0);
    return Math.round(sum / activePointsWithData.length);
  }, [activePointsWithData]);

  // Coordinates calculation for smooth Bezier curve
  const { linePath, areaPath, coords, activeCoord } = useMemo(() => {
    if (!hasAnyData || points.length === 0 || containerWidth <= 0) {
      return { linePath: null, areaPath: null, coords: [], activeCoord: null };
    }

    const availableWidth = containerWidth - PADDING_X * 2;
    const availableHeight = CHART_HEIGHT - PADDING_Y * 2;
    const stepX = availableWidth / Math.max(1, points.length - 1);

    // Map each point to (x, y)
    // If a day has no data, we estimate smoothly from neighboring points or baseline (60)
    const pts = points.map((p, idx) => {
      const x = PADDING_X + idx * stepX;
      const effectiveVal = p.hasData ? p.vitality : 50;
      // Invert Y: 100 at top (PADDING_Y), 0 at bottom (CHART_HEIGHT - PADDING_Y)
      const norm = Math.max(0, Math.min(100, effectiveVal)) / 100;
      const y = PADDING_Y + availableHeight * (1 - norm);
      return { x, y, hasData: p.hasData, isToday: p.isToday, vitality: p.vitality };
    });

    const line = Skia.Path.Make();
    const area = Skia.Path.Make();

    line.moveTo(pts[0].x, pts[0].y);
    area.moveTo(pts[0].x, CHART_HEIGHT);
    area.lineTo(pts[0].x, pts[0].y);

    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX = (curr.x + next.x) / 2;

      line.cubicTo(cpX, curr.y, cpX, next.y, next.x, next.y);
      area.cubicTo(cpX, curr.y, cpX, next.y, next.x, next.y);
    }

    const lastPt = pts[pts.length - 1];
    area.lineTo(lastPt.x, CHART_HEIGHT);
    area.close();

    const active = pts.find((p) => p.isToday) ?? pts[pts.length - 1];

    return { linePath: line, areaPath: area, coords: pts, activeCoord: active };
  }, [hasAnyData, points, containerWidth]);

  return (
    <Card style={[styles.card, { padding: spacing.base, marginTop: spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Vitality Curve
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {hasAnyData
              ? `${activePointsWithData.length} of ${points.length} days logged this week`
              : '7-day trend from daily check-ins'}
          </Text>
        </View>

        {hasAnyData ? (
          <View style={[styles.avgBadge, { backgroundColor: colors.surface1 }]}>
            <Text style={[typography.label, { color: colors.primary }]}>Avg {avgVitality}</Text>
          </View>
        ) : null}
      </View>

      {/* Chart Canvas or Honest Empty State */}
      <View onLayout={onLayout} style={styles.chartContainer}>
        {hasAnyData && linePath && areaPath ? (
          <>
            <Canvas style={styles.canvas}>
              {/* Gradient Area Fill */}
              <Path path={areaPath} style="fill">
                <LinearGradient
                  start={vec(0, PADDING_Y)}
                  end={vec(0, CHART_HEIGHT)}
                  colors={[colors.primaryAlpha, 'rgba(255, 255, 255, 0.0)']}
                />
              </Path>

              {/* Curve Stroke */}
              <Path
                path={linePath}
                style="stroke"
                strokeWidth={3}
                strokeCap="round"
                strokeJoin="round"
                color={colors.primary}
              />

              {/* Data points */}
              {coords.map((c, i) =>
                c.hasData ? (
                  <Circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={c.isToday ? 5 : 3.5}
                    color={c.isToday ? colors.primary : colors.accent}
                  />
                ) : null,
              )}

              {/* Active / Today Point Halo */}
              {activeCoord && activeCoord.hasData ? (
                <Circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r={8}
                  style="stroke"
                  strokeWidth={2}
                  color={colors.primary}
                />
              ) : null}
            </Canvas>

            {/* X-Axis Day Labels */}
            <View style={styles.labelsRow}>
              {points.map((p, idx) => (
                <View key={idx} style={styles.labelCol}>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: p.isToday
                          ? colors.primary
                          : p.hasData
                            ? colors.text.primary
                            : colors.text.muted,
                        fontWeight: p.isToday ? '700' : '500',
                      },
                    ]}
                  >
                    {p.dayLabel}
                  </Text>
                  {p.isToday ? (
                    <View style={[styles.todayIndicator, { backgroundColor: colors.primary }]} />
                  ) : null}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="pulse-outline" size={26} color={colors.primary} />
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              No check-ins logged yet
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, textAlign: 'center', marginTop: 4, maxWidth: 260 },
              ]}
            >
              Start checking in daily to visualize your natural energy, mood, and recovery curve.
            </Text>
            {onCheckIn ? (
              <PressableScale
                onPress={onCheckIn}
                style={[styles.emptyButton, { backgroundColor: colors.primary, marginTop: 12 }]}
              >
                <Text style={[typography.subbodyBold, { color: colors.onPrimary }]}>
                  Log first check-in
                </Text>
              </PressableScale>
            ) : null}
          </View>
        )}
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
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  avgBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartContainer: {
    width: '100%',
    minHeight: CHART_HEIGHT,
  },
  canvas: {
    width: '100%',
    height: CHART_HEIGHT,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING_X - 10,
    marginTop: 4,
  },
  labelCol: {
    alignItems: 'center',
    minWidth: 24,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
