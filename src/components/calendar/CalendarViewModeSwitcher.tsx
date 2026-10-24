import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';

export type CalendarViewMode = 'month' | 'week' | 'agenda' | 'history';

export interface CalendarViewModeSwitcherProps {
  calendarViewMode: CalendarViewMode;
  onSelectMode: (mode: CalendarViewMode) => void;
  isWomen: boolean;
}

export const CalendarViewModeSwitcher: React.FC<CalendarViewModeSwitcherProps> = ({
  calendarViewMode,
  onSelectMode,
  isWomen,
}) => {
  const { colors, typography, spacing } = useTheme();

  const modes: { id: CalendarViewMode; label: string; icon: string }[] = [
    { id: 'month', label: 'Month', icon: 'grid-outline' },
    { id: 'week', label: 'Week', icon: 'reorder-two-outline' },
    { id: 'agenda', label: 'Agenda', icon: 'list-outline' },
    { id: 'history', label: isWomen ? 'History' : 'Records', icon: 'time-outline' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface1,
          marginTop: spacing.sm,
          marginBottom: spacing.xs,
        },
      ]}
    >
      {modes.map((mode) => {
        const isActive = calendarViewMode === mode.id;
        return (
          <PressableScale
            key={mode.id}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              onSelectMode(mode.id);
            }}
            scaleTo={0.94}
            style={[
              styles.modeBtn,
              {
                backgroundColor: isActive ? colors.surface : 'transparent',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${mode.label} view`}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={mode.icon as any}
              size={13}
              color={isActive ? colors.primary : colors.text.secondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.captionBold,
                {
                  color: isActive ? colors.primary : colors.text.secondary,
                  fontSize: 12,
                },
              ]}
            >
              {mode.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 11,
  },
});
