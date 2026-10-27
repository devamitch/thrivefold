import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

export type TimeRange = 'today' | 'week' | 'month';

interface Props {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const RANGES: { id: TimeRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function TimeRangeFilter({ selected, onChange }: Props) {
  const { colors, typography } = useTheme();

  const handlePress = (range: TimeRange) => {
    if (range !== selected) {
      Haptics.selectionAsync().catch(() => {});
      onChange(range);
    }
  };

  return (
    <SquircleSurface radius={18} fill={colors.surface1} style={styles.container}>
      {RANGES.map((r) => {
        const isSelected = selected === r.id;
        return (
          <PressableScale
            key={r.id}
            onPress={() => handlePress(r.id)}
            style={styles.flex}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${r.label} view`}
          >
            <View
              style={[
                styles.tab,
                isSelected && {
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                },
              ]}
            >
              <Text
                style={[
                  typography.subbodyBold,
                  {
                    color: isSelected ? colors.onPrimary : colors.text.secondary,
                  },
                ]}
              >
                {r.label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
    marginVertical: 12,
  },
  flex: {
    flex: 1,
  },
  tab: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
