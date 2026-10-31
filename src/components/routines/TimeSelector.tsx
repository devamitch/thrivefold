import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
const PERIODS = ['AM', 'PM'];

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
      <View style={styles.wheels}>
        {/* selection band */}
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
        <WheelPicker
          data={PERIODS}
          index={value.period === 'AM' ? 0 : 1}
          width={64}
          accessibilityLabel="AM or PM"
          onChange={(i) => onChange({ ...latest.current, period: i === 0 ? 'AM' : 'PM' })}
        />
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
              style={[styles.chip, { backgroundColor: active ? colors.primaryAlpha : colors.surface2 }]}
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
  wheels: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  band: { position: 'absolute', left: 4, right: 4, height: ITEM_H, borderRadius: 14 },
  colon: { height: ITEM_H * VISIBLE_ROWS, justifyContent: 'center', width: 14, alignItems: 'center' },
  chips: { gap: 6, paddingTop: 12, paddingHorizontal: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
});
