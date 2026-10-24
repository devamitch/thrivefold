/**
 * Today: the day's quests and points toward the daily goal, the calendar, and quick
 * routines for the selected experience.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { useTheme } from '../../../theme/useTheme';
import {
  ScreenContainer,
  AppHeader,
  PeriodLoggerModal,
  PersonalEventModal,
  AnimatedTabBar,
  TabItem,
  Button,
} from '../../../components/ui';
import {
  MonthGridView,
  SelectedDateOverviewCard,
  MultiMonthCycleForecast,
  MultiMonthForecastItem,
  CycleHistoryView,
} from '../../../components/calendar';
import {
  QuestsSection,
  QuestSheet,
  SomaticWellnessArcade,
} from '../../../components/game';
import {
  PersonalizedNourishmentCard,
  AthleticCheckInCard,
} from '../../../components/wellness';

import { useRootStore ,
  PersonalCalendarEvent,
} from '../../../stores/useRootStore';
import {
  generateMonthGrid,
  generateDayAgenda,
  getDayRangeInfo,
  getHolidayForDate,
  deriveCyclePhaseForDate,
  formatLocalDate,
  parseLocalDate,
  CalendarEvent,
} from '../../../domain/calendar/universalCalendarEngine';
import { currentLevelProgress } from '../../../domain/game/gameCatalogService';
import { useAgendaSources } from '../../../hooks/useAgendaSources';
import { routeForEvent } from '../../../navigation/eventRoutes';
import {
  PHASE_CONFIG,
  computeAdvancedCycleMetrics,
} from '../../../domain/health/cycleCalculations';

type ActiveTab = 'quests' | 'calendar' | 'arcade' | 'forecast' | 'recovery';

export default function TodayScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();

  const isWomen = experience === 'women_health';
  const isMen = experience === 'men_health';

  // Primary active tab (Quests is default to put the game engine front and center)
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');

  // Universal Store Hooks
  const {
    cycleData,
    personalEvents,
    onboarding,
    addCheckIn,
    showToast,
    todayQuests,
    dailyPoints,
    dailyPointsTarget,
    dailyGoalReached,
    xp,
    diamonds,
    completedCheckpoints,
    streak,
    checkInHistory,
    deletePeriod,
    deletePersonalEvent,
    showAlert,
  } = useRootStore(
    useShallow((s) => ({
      cycleData: s.cycleData,
      personalEvents: s.personalEvents,
      onboarding: s.onboarding,
      addCheckIn: s.addCheckIn,
      showToast: s.showToast,
      todayQuests: s.todayQuests,
      dailyPoints: s.dailyPoints,
      dailyPointsTarget: s.dailyPointsTarget,
      dailyGoalReached: s.dailyGoalReached,
      xp: s.xp,
      diamonds: s.diamonds,
      completedCheckpoints: s.completedCheckpoints,
      streak: s.streak,
      checkInHistory: s.checkInHistory,
      deletePeriod: s.deletePeriod,
      deletePersonalEvent: s.deletePersonalEvent,
      showAlert: s.showAlert,
    }))
  );

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMilestoneToEdit, setSelectedMilestoneToEdit] = useState<PersonalCalendarEvent | null>(null);

  const [selectedDateStr, setSelectedDateStr] = useState(() => formatLocalDate(new Date()));
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  // Quick check-in starts from today's saved check-in (neutral 5 when there is none).
  const todaysCheckIn = checkInHistory.find((c) => c.date === formatLocalDate(new Date()));
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [energy, setEnergy] = useState(todaysCheckIn?.energy ?? 5);
  const [mood, setMood] = useState(todaysCheckIn?.mood ?? 5);
  const checkedInToday = Boolean(todaysCheckIn);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const progress = useMemo(
    () => currentLevelProgress(xp, completedCheckpoints),
    [xp, completedCheckpoints],
  );

  // Calendar Grid generation
  const monthGrid = useMemo(() => {
    return generateMonthGrid(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth()
    );
  }, [currentMonthDate]);

  // 12-Month Calculated Rolling Horizon Projections
  const twelveMonthForecast = useMemo(() => {
    if (!isWomen) return [];
    const forecast: MultiMonthForecastItem[] = [];
    const cycleLength = cycleData?.cycleLengthDays ?? 28;
    const periodDuration = cycleData?.periodLengthDays ?? 5;
    const lutealDays = 14;
    // No logged period means no forecast; a start date is never assumed.
    if (!cycleData?.lastPeriodDate) return [];
    const baselineDate = parseLocalDate(cycleData.lastPeriodDate);

    for (let c = 0; c < 12; c++) {
      const cycleStart = new Date(baselineDate.getTime() + c * cycleLength * 86400000);
      const periodEnd = new Date(cycleStart.getTime() + (periodDuration - 1) * 86400000);
      const ovulationDate = new Date(cycleStart.getTime() + (cycleLength - lutealDays) * 86400000);
      const fertileStart = new Date(ovulationDate.getTime() - 4 * 86400000);
      const fertileEnd = new Date(ovulationDate.getTime() + 1 * 86400000);

      forecast.push({
        monthLabel: cycleStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: cycleStart.getFullYear(),
        month: cycleStart.getMonth(),
        estimatedPeriodStart: formatLocalDate(cycleStart),
        estimatedPeriodEnd: formatLocalDate(periodEnd),
        estimatedFertileStart: formatLocalDate(fertileStart),
        estimatedFertileEnd: formatLocalDate(fertileEnd),
        estimatedOvulation: formatLocalDate(ovulationDate),
        cycleNumber: c + 1,
      });
    }

    return forecast;
  }, [isWomen, cycleData]);

  // Derived selected date phase
  const selectedDatePhase = useMemo(() => {
    return deriveCyclePhaseForDate(selectedDateStr, cycleData);
  }, [selectedDateStr, cycleData]);

  // Daily agenda calculation
  const agendaSources = useAgendaSources();
  const agendaEvents = useMemo(() => {
    const todayKey = formatLocalDate(new Date());
    const quests = todayQuests.map((q) => ({ id: q.id, title: q.title, status: q.status, date: todayKey }));
    return generateDayAgenda(selectedDateStr, { experience, cycleData, personalEvents, ...agendaSources, quests: [...agendaSources.quests.filter((q) => q.date !== todayKey), ...quests] });
  }, [selectedDateStr, experience, cycleData, personalEvents, todayQuests, agendaSources]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const selectedDateHoliday = useMemo(() => getHolidayForDate(selectedDateStr), [selectedDateStr]);

  // Existing period log record for selected date
  const existingPeriodRecord = useMemo(() => {
    if (!cycleData?.periodHistory || cycleData.periodHistory.length === 0) return null;
    return (
      cycleData.periodHistory.find((p) => {
        if (p.isOngoing) {
          return selectedDateStr >= p.startDate;
        }
        return (
          selectedDateStr >= p.startDate &&
          (!p.endDate || selectedDateStr <= p.endDate)
        );
      }) || null
    );
  }, [cycleData?.periodHistory, selectedDateStr]);

  // Personal milestones for selected date
  const selectedDateMilestones = useMemo(() => {
    if (!personalEvents || personalEvents.length === 0) return [];
    const parts = selectedDateStr.split('-').map(Number);
    const targetMonth = parts[1];
    const targetDay = parts[2];
    return personalEvents.filter((ev) => {
      if (ev.date === selectedDateStr) return true;
      if (ev.recurrence === 'yearly') {
        const evParts = ev.date.split('-').map(Number);
        return evParts[1] === targetMonth && evParts[2] === targetDay;
      }
      return false;
    });
  }, [personalEvents, selectedDateStr]);

  // Derived selected date range info
  const selectedDateRangeInfo = useMemo(() => {
    return getDayRangeInfo(selectedDateStr, 0, cycleData, agendaEvents, personalEvents);
  }, [selectedDateStr, cycleData, agendaEvents, personalEvents]);

  // Robust Advanced cycle metrics for history modal
  const advancedCycleMetrics = useMemo(() => {
    if (!isWomen) return null;
    try {
      return computeAdvancedCycleMetrics(
        cycleData?.lastPeriodDate,
        cycleData?.periodHistory ?? [],
        cycleData?.cycleLengthDays ?? 28,
        cycleData?.periodLengthDays ?? 5,
        cycleData?.reproductiveContext ?? 'regular'
      );
    } catch {
      return null;
    }
  }, [isWomen, cycleData]);

  const handlePrevDay = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const curr = parseLocalDate(selectedDateStr);
    curr.setDate(curr.getDate() - 1);
    setSelectedDateStr(formatLocalDate(curr));
  }, [selectedDateStr]);

  const handleNextDay = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const curr = parseLocalDate(selectedDateStr);
    curr.setDate(curr.getDate() + 1);
    setSelectedDateStr(formatLocalDate(curr));
  }, [selectedDateStr]);

  const handleJumpToday = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const now = new Date();
    setSelectedDateStr(formatLocalDate(now));
    setCurrentMonthDate(now);
  }, []);

  // Agenda items open their real record: today's quests in the quest sheet, workouts, meals
  // and health logs on their own screens. A tap never completes anything.
  const handleToggleEvent = useCallback(
    (event: CalendarEvent) => {
      if (todayQuests.some((q) => q.id === event.id)) {
        setSelectedAssignmentId(event.id);
        return;
      }
      const route = routeForEvent(event);
      if (route) router.push(route as Href);
    },
    [todayQuests, router],
  );

  const handleLogPeriodBleeding = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setShowPeriodModal(true);
  }, []);

  const handleOpenMilestoneModal = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMilestoneToEdit(null);
    setShowMilestoneModal(true);
  }, []);

  const handleEditMilestone = useCallback((milestone: PersonalCalendarEvent) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMilestoneToEdit(milestone);
    setShowMilestoneModal(true);
  }, []);

  const handleDeletePeriod = useCallback((recordId: string, dateStr: string) => {
    showAlert({
      title: 'Delete Period Record?',
      message: `Are you sure you want to remove the record for ${dateStr}? Dependent predictions will be recalculated.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        deletePeriod(recordId);
        showToast({ type: 'info', message: 'Period record deleted.' });
      },
    });
  }, [showAlert, deletePeriod, showToast]);

  const handleDeleteMilestone = useCallback((eventId: string, title: string) => {
    showAlert({
      title: 'Delete Milestone?',
      message: `Are you sure you want to remove "${title}"?`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        deletePersonalEvent(eventId);
        showToast({ type: 'info', message: 'Milestone deleted.' });
      },
    });
  }, [showAlert, deletePersonalEvent, showToast]);

  // Updates today's check-in with the new energy and mood; the first check-in of the day goes
  // through the full check-in screen so stress, sleep and symptoms are the person's own.
  const handleSaveCheckIn = useCallback(() => {
    if (!todaysCheckIn) {
      router.push('/(app)/check-in');
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    const { id: _id, ...rest } = todaysCheckIn;
    addCheckIn({ ...rest, energy, mood });
    showToast({ type: 'success', message: "Today's check-in updated on this device." });
  }, [todaysCheckIn, addCheckIn, energy, mood, router, showToast]);

  // Arcade games are practice: they are not catalog quests and award nothing.
  const handleExerciseComplete = useCallback(() => {
    showToast({ type: 'success', message: 'Practice complete. Nice work.' });
  }, [showToast]);

  const activeDiet = onboarding.diet && onboarding.diet !== 'No preference' ? onboarding.diet : null;
  const phaseConfig = PHASE_CONFIG[selectedDatePhase];

  // Animated Tab Bar definitions (NO SPARKLE ICONS!)
  const tabItems: TabItem[] = useMemo(() => {
    if (isWomen) {
      return [
        { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
        { id: 'forecast', label: 'Forecast', icon: 'analytics-outline' },
        { id: 'quests', label: 'Quests', icon: 'trophy-outline' },
        { id: 'arcade', label: 'Games', icon: 'game-controller-outline' },
      ];
    } else {
      return [
        { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
        { id: 'quests', label: 'Quests', icon: 'trophy-outline' },
        { id: 'recovery', label: 'Recovery', icon: 'pulse-outline' },
        { id: 'arcade', label: 'Games', icon: 'game-controller-outline' },
      ];
    }
  }, [isWomen]);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title={isWomen ? 'Cycle and calendar' : 'Plan'}
          subtitle={isWomen ? 'Periods, estimates, events and quests by date' : 'Your calendar, quests and recovery'}
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Reanimated Animated Tab Bar with Spring Indicator */}
      <View style={{ marginTop: spacing.xs, marginBottom: spacing.sm }}>
        <AnimatedTabBar
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
        />
      </View>

      {/* SECTION 1: QUESTS & GAME ENGINE (PRIMARY TAB) */}
      {activeTab === 'quests' && (
        <Animated.View entering={FadeInDown.duration(220)}>
          <QuestsSection
            progress={progress}
            xp={xp}
            diamonds={diamonds}
            streak={streak}
            dailyPoints={dailyPoints}
            dailyPointsTarget={dailyPointsTarget}
            dailyGoalReached={dailyGoalReached}
            todayQuests={todayQuests}
            onOpenQuest={setSelectedAssignmentId}
          />
        </Animated.View>
      )}

      {/* SECTION 2: CLEAN MONTH CALENDAR & SELECTED DAY AGENDA (NO SUB-SWITCHERS!) */}
      {activeTab === 'calendar' && (
        <Animated.View entering={FadeInDown.duration(220)}>
          {/* Quick Header Row with History Modal Button */}
          <View style={styles.calendarHeaderRow}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>
              {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
            </Text>
            <Button
              label={isWomen ? 'Cycle History' : 'Milestones'}
              size="sm"
              variant="ghost"
              onPress={() => setShowHistoryModal(true)}
            />
          </View>

          {/* Month Grid View */}
          <MonthGridView
            currentMonthDate={currentMonthDate}
            onPrevMonth={() => {
              const prev = new Date(currentMonthDate);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentMonthDate(prev);
            }}
            onNextMonth={() => {
              const next = new Date(currentMonthDate);
              next.setMonth(next.getMonth() + 1);
              setCurrentMonthDate(next);
            }}
            onJumpToday={handleJumpToday}
            monthGrid={monthGrid}
            selectedDateStr={selectedDateStr}
            onSelectDate={setSelectedDateStr}
            cycleData={cycleData}
            agendaEvents={agendaEvents}
            personalEvents={personalEvents}
            isWomen={isWomen}
          />

          {/* Clean Overview Card for Selected Day */}
          <SelectedDateOverviewCard
            selectedDateStr={selectedDateStr}
            selectedDateRangeInfo={selectedDateRangeInfo}
            phaseConfig={phaseConfig}
            selectedDateHoliday={selectedDateHoliday}
            selectedDateMilestones={selectedDateMilestones}
            existingPeriodRecord={existingPeriodRecord}
            agendaEvents={agendaEvents}
            isWomen={isWomen}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onJumpToday={handleJumpToday}
            onLogPeriod={handleLogPeriodBleeding}
            onAddMilestone={handleOpenMilestoneModal}
            onToggleEvent={handleToggleEvent}
            onSelectTask={handleToggleEvent}
          />
        </Animated.View>
      )}

      {/* Short calming exercises with their own timer state */}
      {activeTab === 'arcade' && (
        <Animated.View entering={FadeInDown.duration(220)}>
          <SomaticWellnessArcade onCompleteExercise={handleExerciseComplete} />
        </Animated.View>
      )}

      {/* SECTION 4: FORECAST (WOMEN) OR RECOVERY & NOURISHMENT (MEN) */}
      {isWomen && activeTab === 'forecast' && (
        <Animated.View entering={FadeInDown.duration(220)}>
          <MultiMonthCycleForecast
            cycleData={cycleData}
            twelveMonthForecast={twelveMonthForecast}
            activeStageIndex={activeStageIndex}
            onSelectStageIndex={setActiveStageIndex}
            onSelectForecastItem={(item) => {
              setCurrentMonthDate(new Date(item.year, item.month, 1));
              setSelectedDateStr(item.estimatedPeriodStart);
              setActiveTab('calendar');
              try {
                Haptics.selectionAsync();
              } catch {}
            }}
          />
        </Animated.View>
      )}

      {isMen && activeTab === 'recovery' && (
        <Animated.View entering={FadeInDown.duration(220)}>
          <AthleticCheckInCard
            energy={energy}
            mood={mood}
            onSetEnergy={setEnergy}
            onSetMood={setMood}
            checkedInToday={checkedInToday}
            onSaveCheckIn={handleSaveCheckIn}
          />
          <PersonalizedNourishmentCard
            activeDiet={activeDiet}
            waterGlasses={waterGlasses}
            onSetWaterGlasses={setWaterGlasses}
            agendaEvents={agendaEvents}
            onToggleEvent={handleToggleEvent}
            onViewNutrition={() => router.push('/(app)/health/nutrition')}
          />
        </Animated.View>
      )}

      <QuestSheet assignmentId={selectedAssignmentId} onClose={() => setSelectedAssignmentId(null)} />

      {/* Period & Cycle Logger Modal */}
      <PeriodLoggerModal
        visible={showPeriodModal}
        initialDateStr={selectedDateStr}
        existingRecord={existingPeriodRecord}
        onClose={() => setShowPeriodModal(false)}
        onSaved={() => {
          showToast({ type: 'success', message: 'Cycle records updated reliably.' });
        }}
      />

      {/* Personal Milestones Modal */}
      <PersonalEventModal
        visible={showMilestoneModal}
        initialDateStr={selectedDateStr}
        existingEvent={selectedMilestoneToEdit}
        onClose={() => {
          setShowMilestoneModal(false);
          setSelectedMilestoneToEdit(null);
        }}
      />

      {/* Dedicated Clean Cycle History / Milestones Modal */}
      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.historyModalBackdrop}
        >
          <View style={styles.historyModalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowHistoryModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Close history modal"
            />
            <View
              style={[
                styles.historySheetContainer,
                {
                  backgroundColor: colors.surface,
                  paddingBottom: Math.max(insets.bottom, 20) + 16,
                },
              ]}
            >
              <View style={styles.historyHandleBar}>
                <View style={styles.historyHandlePill} />
              </View>

              <View style={styles.historyHeaderRow}>
                <Text style={[typography.heading, { color: colors.text.primary }]}>
                  {isWomen ? 'Cycle History & Records' : 'Milestones & Events'}
                </Text>
                <Button
                  label="Done"
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowHistoryModal(false)}
                />
              </View>

              <CycleHistoryView
                isWomen={isWomen}
                cycleData={cycleData}
                personalEvents={personalEvents}
                advancedCycleMetrics={advancedCycleMetrics}
                onLogPeriod={handleLogPeriodBleeding}
                onAddMilestone={handleOpenMilestoneModal}
                onEditPeriod={(rec) => {
                  setSelectedDateStr(rec.startDate);
                  setShowHistoryModal(false);
                  setShowPeriodModal(true);
                }}
                onDeletePeriod={handleDeletePeriod}
                onEditMilestone={(pe) => {
                  setShowHistoryModal(false);
                  handleEditMilestone(pe);
                }}
                onDeleteMilestone={handleDeleteMilestone}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  historyModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  historySheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  historyHandleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyHandlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1CAC2',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
});
