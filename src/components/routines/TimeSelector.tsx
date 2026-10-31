import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { hapticLight } from '../../services/haptics/hapticFeedback';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { ITEM_H, VISIBLE_ROWS, WheelPicker } from './WheelPicker';

export type Period = 'AM' | 'PM';
export interface TimeValue {
  hour: number; // 1–12
  minute: number; // 0–59
  period: Period;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const SUGGESTIONS: TimeValue[] = [
  { hour: 5, minute: 30, period: 'AM' },
  { hour: 6, minute: 0, period: 'AM' },
  { hour: 6, minute: 30, period: 'AM' },
  { hour: 7, minute: 0, period: 'AM' },
  { hour: 7, minute: 30, period: 'AM' },
  { hour: 8, minute: 0, period: 'AM' },
];
const label = (t: TimeValue) => `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.period}`;
const same = (a: TimeValue, b: TimeValue) => a.hour === b.hour && a.minute === b.minute && a.period === b.period;

const BTN_H = 44;

/** AM/PM is a two-state switch, not a wheel: instant, no scroll physics to fight. */
function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const { colors, typography } = useTheme();
  const pos = useSharedValue(value === 'AM' ? 0 : 1);

  useEffect(() => {
    pos.value = withTiming(value === 'AM' ? 0 : 1, { duration: 180 });
  }, [value, pos]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateY: pos.value * BTN_H }] }));

  return (
    <View style={[styles.period, { backgroundColor: colors.surface1 }]}>
      <Animated.View style={[styles.thumb, { backgroundColor: colors.primary }, thumb]} />
      {(['AM', 'PM'] as const).map((p) => (
        <PressableScale
          key={p}
          onPress={() => {
            if (p === value) return;
            hapticLight();
            onChange(p);
          }}
          style={styles.periodBtn}
          accessibilityRole="button"
          accessibilityState={{ selected: p === value }}
          accessibilityLabel={p}
        >
          <Text style={[typography.captionBold, { color: p === value ? '#FFFFFF' : colors.text.secondary }]}>{p}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

interface Props {
  value: TimeValue;
  onChange: (v: TimeValue) => void;
}

export function TimeSelector({ value, onChange }: Props) {
  const { colors, typography } = useTheme();
  const latest = useRef(value);
  latest.current = value;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.group}>
          <View
            pointerEvents="none"
            style={[styles.band, { backgroundColor: colors.primaryAlpha, top: ((VISIBLE_ROWS - 1) / 2) * ITEM_H }]}
          />
          <WheelPicker
            data={HOURS}
            index={value.hour - 1}
            loop
            width={72}
            accessibilityLabel="Hour"
            onChange={(i) => onChange({ ...latest.current, hour: i + 1 })}
          />
          <View style={styles.colon} pointerEvents="none">
            <Text style={[typography.heading, { fontSize: 26, color: colors.text.muted }]}>:</Text>
          </View>
          <WheelPicker
            data={MINUTES}
            index={value.minute}
            loop
            width={72}
            accessibilityLabel="Minute"
            onChange={(i) => onChange({ ...latest.current, minute: i })}
          />
        </View>
        <PeriodToggle value={value.period} onChange={(period) => onChange({ ...latest.current, period })} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        contentContainerStyle={styles.chips}
      >
        {SUGGESTIONS.map((s) => {
          const active = same(s, value);
          return (
            <PressableScale
              key={label(s)}
              onPress={() => {
                hapticLight();
                onChange(s);
              }}
              style={[styles.chip, { backgroundColor: active ? colors.primaryAlpha : colors.surface1 }]}
              accessibilityRole="button"
              accessibilityLabel={`Set ${label(s)}`}
            >
              <Text
                style={[
                  typography.caption,
                  { color: active ? colors.primary : colors.text.secondary, fontWeight: active ? '700' : '500' },
                ]}
              >
                {label(s)}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  group: { flexDirection: 'row', alignItems: 'center' },
  band: { position: 'absolute', left: 0, right: 0, height: ITEM_H, borderRadius: 14 },
  colon: { height: ITEM_H * VISIBLE_ROWS, justifyContent: 'center', width: 14, alignItems: 'center' },
  period: { marginLeft: 14, borderRadius: 16, padding: 4, width: 56, height: BTN_H * 2 + 8 },
  thumb: { position: 'absolute', top: 4, left: 4, width: 48, height: BTN_H, borderRadius: 12 },
  periodBtn: { width: 48, height: BTN_H, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 6, paddingTop: 12, paddingHorizontal: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
});
