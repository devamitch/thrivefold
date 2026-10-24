import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';
import { PressableScale } from './PressableScale';
import {
  formatLocalDate,
  parseLocalDate,
} from '../../domain/calendar/universalCalendarEngine';

export interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  onChange,
  onClose,
  title = 'Select Date',
  minDate,
  maxDate,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();

  const initialDate = useMemo(() => {
    return value ? parseLocalDate(value) : new Date();
  }, [value]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState(
    value || formatLocalDate(new Date()),
  );
  const [viewYearSelector, setViewYearSelector] = useState(false);

  useEffect(() => {
    if (visible && value) {
      const d = parseLocalDate(value);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setSelectedDateStr(value);
      setViewYearSelector(false);
    }
  }, [visible, value]);

  const yearsList = useMemo(() => {
    const startYear = 1940;
    const endYear = new Date().getFullYear() + 25;
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const handlePrevMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const dateObj = new Date(currentYear, currentMonth, dayNum, 12, 0, 0);
    const dateStr = formatLocalDate(dateObj);
    setSelectedDateStr(dateStr);
  };

  const handleConfirm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onChange(selectedDateStr);
    onClose();
  };

  // Generate calendar grid for current month
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDayOfWeek = firstDay.getDay() - 1; // 0 for Mon, 6 for Sun
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      isCurrentMonth: boolean;
      dateStr: string;
      disabled: boolean;
    }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d, 12, 0, 0);
      const str = formatLocalDate(prevDate);
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: str,
        disabled: true,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d, 12, 0, 0);
      const str = formatLocalDate(dateObj);
      let disabled = false;
      if (minDate && str < minDate) disabled = true;
      if (maxDate && str > maxDate) disabled = true;

      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr: str,
        disabled,
      });
    }

    // Next month padding to fill multiple of 7
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(currentYear, currentMonth + 1, d, 12, 0, 0);
        const str = formatLocalDate(nextDate);
        days.push({
          day: d,
          isCurrentMonth: false,
          dateStr: str,
          disabled: true,
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, minDate, maxDate]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderStrong,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text
                style={[typography.captionBold, { color: colors.text.muted }]}
              >
                DATE SELECTOR
              </Text>
              <Text
                style={[
                  typography.subheading,
                  { color: colors.text.primary, marginTop: 2 },
                ]}
              >
                {title}
              </Text>
            </View>
            <PressableScale
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </PressableScale>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            <PressableScale
              onPress={handlePrevMonth}
              style={[styles.navArrow, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text.primary}
              />
            </PressableScale>

            <PressableScale
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setViewYearSelector(!viewYearSelector);
              }}
              style={[styles.monthYearPill, { backgroundColor: colors.surface1 }]}
            >
              <Text
                style={[typography.bodyBold, { color: colors.text.primary }]}
              >
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <Ionicons
                name={viewYearSelector ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
                style={{ marginLeft: 6 }}
              />
            </PressableScale>

            <PressableScale
              onPress={handleNextMonth}
              style={[styles.navArrow, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.primary}
              />
            </PressableScale>
          </View>

          {/* Year selector list or Calendar Grid */}
          {viewYearSelector ? (
            <View style={styles.yearScrollContainer}>
              <ScrollView
                style={{ maxHeight: 240 }}
                showsVerticalScrollIndicator
              >
                <View style={styles.yearGrid}>
                  {yearsList.map((y) => {
                    const isSelected = y === currentYear;
                    return (
                      <PressableScale
                        key={y}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setCurrentYear(y);
                          setViewYearSelector(false);
                        }}
                        style={[
                          styles.yearItem,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.surface1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isSelected
                                ? colors.onPrimary
                                : colors.text.primary,
                            },
                          ]}
                        >
                          {y}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              {/* Weekday Row */}
              <View style={styles.weekdayRow}>
                {WEEKDAY_NAMES.map((d, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.weekdayText,
                      typography.captionBold,
                      { color: colors.text.muted },
                    ]}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* Day cells */}
              <View style={styles.daysGrid}>
                {calendarGrid.map((item, idx) => {
                  const isSelected = item.dateStr === selectedDateStr;
                  const isToday =
                    item.dateStr === formatLocalDate(new Date());

                  return (
                    <View key={idx} style={styles.dayCellContainer}>
                      <PressableScale
                        disabled={item.disabled || !item.isCurrentMonth}
                        onPress={() => handleSelectDay(item.day)}
                        scaleTo={0.9}
                        style={[
                          styles.dayCell,
                          isSelected && {
                            backgroundColor: colors.primary,
                          },
                          !isSelected &&
                            isToday && {
                              borderWidth: 1.5,
                              borderColor: colors.primary,
                            },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isSelected
                                ? colors.onPrimary
                                : !item.isCurrentMonth
                                  ? colors.text.muted
                                  : item.disabled
                                    ? colors.text.muted
                                    : colors.text.primary,
                            },
                          ]}
                        >
                          {item.day}
                        </Text>
                      </PressableScale>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Selected Date Summary & Confirm Actions */}
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[typography.caption, { color: colors.text.muted }]}
              >
                Selected:
              </Text>
              <Text
                style={[typography.bodyBold, { color: colors.primary }]}
              >
                {selectedDateStr}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={onClose}
              />
              <Button
                label="Select"
                variant="primary"
                size="sm"
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  yearScrollContainer: {
    paddingVertical: 8,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  yearItem: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  calendarContainer: {
    marginBottom: 12,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellContainer: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    width: '88%',
    height: '88%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
});
