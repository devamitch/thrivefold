import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import {
  generateMonthGrid,
  generateDayAgenda,
  formatLocalDate,
  } from '../../../domain/calendar/universalCalendarEngine';
import { useAgendaSources } from '../../../hooks/useAgendaSources';
import * as Haptics from 'expo-haptics';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const cycleData = useRootStore((s) => s.cycleData);

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(() => formatLocalDate(new Date()));

  const monthGrid = useMemo(() => {
    return generateMonthGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const agendaSources = useAgendaSources();
  const selectedDayAgenda = useMemo(() => {
    return generateDayAgenda(selectedDateStr, {
      experience,
      cycleData,
      ...agendaSources,
    });
  }, [selectedDateStr, experience, cycleData, agendaSources]);

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

  const isMen = experience === 'men_health';
  const isPride = experience === 'pride_wellbeing';

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Calendar"
        subtitle={isMen ? "Performance, Recovery & Routines" : isPride ? "Affirming Schedule & Care" : "Rhythm, Follicular & Life Planner"}
        showBack
      />

      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Cyclical Rhythm & Life Flow Hero */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/calendar-rhythm.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Cyclical Rhythm & Life Flow
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            Universal alignment across lunar rhythms, cycle phases, and personal health milestones.
          </Text>
        </Card>

        {/* Month Navigation Header (Zero shadow, clean Neev style) */}
        <Card style={[styles.navCard, { backgroundColor: colors.surface, marginBottom: spacing.md }]}>
          <View style={styles.navRow}>
            <PressableScale
              onPress={handlePrevMonth}
              style={[styles.arrowBtn, { backgroundColor: colors.surface1 }]}
              scaleTo={0.9}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </PressableScale>

            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {isMen ? 'Training & Habits' : isPride ? 'Private Schedule' : 'Cycle & Wellbeing'}
              </Text>
            </View>

            <PressableScale
              onPress={handleNextMonth}
              style={[styles.arrowBtn, { backgroundColor: colors.surface1 }]}
              scaleTo={0.9}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
            </PressableScale>
          </View>
        </Card>

        {/* Calendar Grid Card (Zero borders, zero shadows) */}
        <Card style={[styles.gridCard, { backgroundColor: colors.surface, padding: 14 }]}>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_HEADERS.map((day, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* 42-day cells grid */}
          <View style={styles.cellsGrid}>
            {monthGrid.map((cell) => {
              const isSelected = cell.date === selectedDateStr;
              return (
                <PressableScale
                  key={cell.date}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setSelectedDateStr(cell.date);
                  }}
                  scaleTo={0.88}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : cell.isToday
                        ? colors.surface1
                        : 'transparent',
                      opacity: cell.isCurrentMonth ? 1 : 0.35,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.subbodyBold,
                      {
                        color: isSelected
                          ? colors.onPrimary
                          : cell.isToday
                          ? colors.primary
                          : colors.text.primary,
                      },
                    ]}
                  >
                    {cell.dayOfMonth}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Agenda */}
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Schedule for {selectedDateStr}
            </Text>
            <Badge label={`${selectedDayAgenda.length} items`} variant="neutral" />
          </View>

          <View style={{ marginTop: spacing.sm }}>
            {selectedDayAgenda.map((event) => (
              <Card
                key={event.id}
                style={[
                  styles.agendaCard,
                  { backgroundColor: colors.surface, marginBottom: 8 },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.metaRow}>
                      {event.startTime ? (
                        <Text style={[typography.label, { color: colors.primary, marginRight: 8 }]}>
                          {event.startTime}
                        </Text>
                      ) : null}
                      <Badge
                        label={event.category.toUpperCase()}
                        variant={event.category === 'fitness' ? 'primary' : 'neutral'}
                      />
                    </View>
                    <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 4 }]}>
                      {event.title}
                    </Text>
                    {event.description ? (
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {event.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  navCard: {
    borderRadius: 18,
    padding: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCard: {
    borderRadius: 20,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayCell: {
    width: '14.2%',
    alignItems: 'center',
  },
  cellsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2%',
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  agendaCard: {
    borderRadius: 16,
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
