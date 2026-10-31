import { StyleSheet, Text, View } from 'react-native';

import { hapticLight, hapticWarning } from '../../services/haptics/hapticFeedback';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ALL = [1, 2, 3, 4, 5, 6, 7];

const PRESETS: { label: string; days: number[] }[] = [
  { label: 'Every day', days: [] },
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [6, 7] },
];

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && a.every((d, i) => d === b[i]);

interface Props {
  /** Empty array means every day (domain convention). */
  days: number[];
  onChange: (days: number[]) => void;
}

export function DaySelector({ days, onChange }: Props) {
  const { colors, typography } = useTheme();
  const effective = days.length ? days : ALL;

  const toggle = (n: number) => {
    const next = effective.includes(n) ? effective.filter((d) => d !== n) : [...effective, n];
    if (!next.length) {
      hapticWarning(); // at least one day must stay selected
      return;
    }
    hapticLight();
    next.sort((a, b) => a - b);
    onChange(next.length === 7 ? [] : next);
  };

  return (
    <View>
      <View style={styles.presets}>
        {PRESETS.map((p) => {
          const active = sameDays(days, p.days);
          return (
            <PressableScale
              key={p.label}
              onPress={() => {
                hapticLight();
                onChange(p.days);
              }}
              style={[
                styles.preset,
                { backgroundColor: active ? colors.primaryAlpha : colors.surface2 },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: active ? colors.primary : colors.text.secondary,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {p.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.days}>
        {LETTERS.map((letter, i) => {
          const n = i + 1;
          const on = effective.includes(n);
          return (
            <PressableScale
              key={n}
              onPress={() => toggle(n)}
              style={[styles.day, { backgroundColor: on ? colors.primary : colors.surface2 }]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={FULL[i]}
            >
              <Text
                style={[typography.captionBold, { color: on ? '#FFFFFF' : colors.text.secondary }]}
              >
                {letter}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  preset: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
