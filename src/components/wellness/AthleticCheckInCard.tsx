import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';

export interface AthleticCheckInCardProps {
  energy: number;
  mood: number;
  onSetEnergy: (v: number) => void;
  onSetMood: (v: number) => void;
  checkedInToday: boolean;
  onSaveCheckIn: () => void;
}

const ENERGY_LABELS: Record<number, string> = {
  1: 'Drained',
  3: 'Low',
  5: 'Okay',
  7: 'Good',
  9: 'Great',
  10: 'Peak',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Very low',
  3: 'Down',
  5: 'Neutral',
  7: 'Positive',
  9: 'Happy',
  10: 'Joyful',
};

export const AthleticCheckInCard: React.FC<AthleticCheckInCardProps> = ({
  energy,
  mood,
  onSetEnergy,
  onSetMood,
  checkedInToday,
  onSaveCheckIn,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
      <Text style={[typography.subheading, { color: colors.text.primary }]}>
        Athletic Baseline Check-In
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
        Track neuromuscular energy and cognitive focus.
      </Text>

      {/* Energy Rating */}
      <View style={styles.rowBetween}>
        <Text style={[typography.captionBold, { color: colors.text.primary }]}>Energy</Text>
        <Badge label={ENERGY_LABELS[energy] ?? 'Good'} variant="primary" />
      </View>
      <View style={[styles.ratingRow, { marginTop: 8 }]}>
        {[1, 3, 5, 7, 9, 10].map((v) => (
          <PressableScale
            key={v}
            onPress={() => onSetEnergy(v)}
            scaleTo={0.9}
            style={[
              styles.ratingBtn,
              {
                backgroundColor: energy === v ? colors.primary : colors.surface1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Energy level ${v}`}
          >
            <Text
              style={[
                typography.captionBold,
                { color: energy === v ? colors.onPrimary : colors.text.primary },
              ]}
            >
              {v}
            </Text>
          </PressableScale>
        ))}
      </View>

      {/* Mood / Focus Rating */}
      <View style={[styles.rowBetween, { marginTop: spacing.md }]}>
        <Text style={[typography.captionBold, { color: colors.text.primary }]}>Focus</Text>
        <Badge label={MOOD_LABELS[mood] ?? 'Positive'} variant="primary" />
      </View>
      <View style={[styles.ratingRow, { marginTop: 8 }]}>
        {[1, 3, 5, 7, 9, 10].map((v) => (
          <PressableScale
            key={v}
            onPress={() => onSetMood(v)}
            scaleTo={0.9}
            style={[
              styles.ratingBtn,
              {
                backgroundColor: mood === v ? colors.primary : colors.surface1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Focus level ${v}`}
          >
            <Text
              style={[
                typography.captionBold,
                { color: mood === v ? colors.onPrimary : colors.text.primary },
              ]}
            >
              {v}
            </Text>
          </PressableScale>
        ))}
      </View>

      <Button
        label={checkedInToday ? 'Update Check-In' : 'Save Check-In'}
        size="lg"
        variant="primary"
        onPress={onSaveCheckIn}
        style={{ marginTop: spacing.lg }}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
