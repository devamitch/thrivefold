import { Ionicons } from '@expo/vector-icons';
import { Canvas, Circle, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
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

const H = 130;
const PX = 20;
const PY = 16;

interface Pt {
  x: number;
  y: number;
  isToday: boolean;
}

export function TrendAreaChart({ points, onCheckIn }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [width, setWidth] = useState(320);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - width) > 2) setWidth(w);
  };

  const logged = useMemo(() => points.filter((p) => p.hasData), [points]);
  const avg = logged.length
    ? Math.round(logged.reduce((a, p) => a + p.vitality, 0) / logged.length)
    : 0;

  // Only days with real data are drawn. A missing day breaks the line; it is never filled in.
  const { runs, dots } = useMemo(() => {
    const stepX = (width - PX * 2) / Math.max(1, points.length - 1);
    const inner = H - PY * 2;
    const all: (Pt | null)[] = points.map((p, i) =>
      p.hasData
        ? {
            x: PX + i * stepX,
            y: PY + inner * (1 - Math.max(0, Math.min(100, p.vitality)) / 100),
            isToday: p.isToday,
          }
        : null,
    );

    const groups: Pt[][] = [];
    let cur: Pt[] = [];
    for (const p of all) {
      if (p) cur.push(p);
      else if (cur.length) {
        groups.push(cur);
        cur = [];
      }
    }
    if (cur.length) groups.push(cur);

    const built = groups
      .filter((g) => g.length > 1)
      .map((g) => {
        const line = Skia.Path.Make();
        const area = Skia.Path.Make();
        line.moveTo(g[0].x, g[0].y);
        area.moveTo(g[0].x, H);
        area.lineTo(g[0].x, g[0].y);
        for (let i = 0; i < g.length - 1; i++) {
          const cx = (g[i].x + g[i + 1].x) / 2;
          line.cubicTo(cx, g[i].y, cx, g[i + 1].y, g[i + 1].x, g[i + 1].y);
          area.cubicTo(cx, g[i].y, cx, g[i + 1].y, g[i + 1].x, g[i + 1].y);
        }
        area.lineTo(g[g.length - 1].x, H);
        area.close();
        return { line, area };
      });

    return { runs: built, dots: all.filter((p): p is Pt => p !== null) };
  }, [points, width]);

  const hasData = logged.length > 0;

  return (
    <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Vitality</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {hasData
              ? `${logged.length} of ${points.length} days checked in`
              : 'Built from your daily check-ins'}
          </Text>
        </View>
        {hasData ? (
          <View style={[styles.badge, { backgroundColor: colors.surface1 }]}>
            <Text style={[typography.label, { color: colors.primary }]}>Avg {avg}</Text>
          </View>
        ) : null}
      </View>

      <View onLayout={onLayout}>
        {hasData ? (
          <>
            <Canvas style={{ width: '100%', height: H }}>
              {runs.map((r, i) => (
                <React.Fragment key={i}>
                  <Path path={r.area} style="fill">
                    <LinearGradient
                      start={vec(0, PY)}
                      end={vec(0, H)}
                      colors={[colors.primaryAlpha, 'transparent']}
                    />
                  </Path>
                  <Path
                    path={r.line}
                    style="stroke"
                    strokeWidth={3}
                    strokeCap="round"
                    strokeJoin="round"
                    color={colors.primary}
                  />
                </React.Fragment>
              ))}
              {dots.map((d, i) => (
                <React.Fragment key={i}>
                  <Circle cx={d.x} cy={d.y} r={d.isToday ? 5 : 3.5} color={colors.primary} />
                  {d.isToday ? (
                    <Circle
                      cx={d.x}
                      cy={d.y}
                      r={8}
                      style="stroke"
                      strokeWidth={2}
                      color={colors.primary}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </Canvas>
            <View style={styles.labels}>
              {points.map((p, i) => (
                <Text
                  key={i}
                  style={[
                    typography.caption,
                    {
                      minWidth: 24,
                      textAlign: 'center',
                      fontWeight: p.isToday ? '700' : '500',
                      color: p.isToday
                        ? colors.primary
                        : p.hasData
                          ? colors.text.primary
                          : colors.text.muted,
                    },
                  ]}
                >
                  {p.dayLabel}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="pulse-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              No check-ins yet
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, textAlign: 'center', marginTop: 4, maxWidth: 260 },
              ]}
            >
              Check in on a few days and your energy, mood and recovery curve shows up here.
            </Text>
            {onCheckIn ? (
              <PressableScale
                onPress={onCheckIn}
                accessibilityRole="button"
                style={[styles.btn, { backgroundColor: colors.primary }]}
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
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: PX - 12 },
  empty: { alignItems: 'center', paddingVertical: 20 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
});
