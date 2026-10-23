/**
 * Thrivefold Universal Today Tab
 * Sacred Harmony Bloom & Discipline Recovery Center.
 * Modular, performant, and clean orchestration of:
 * - Dynamic Level 1-1,000 Personalized Game Journey & Daily 40-Point Target
 * - Single-tier animated tab navigation with Reanimated spring interpolation
 * - Clean, non-overflowing cycle & life calendar
 * - Isolated, zero-lag somatic restorative arcade
 * - Privacy-respecting Men's / Women's health paradigms
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { useTheme } from '../../../theme/useTheme';
import {
  useTabBarInset,
  useScrollAwareTabBar,
} from '../../../components/navigation/CustomTabBar';
import {
  ScreenContainer,
  AppHeader,
  PeriodLoggerModal,
  PersonalEventModal,
  TaskVerificationModal,
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
  SomaticWellnessArcade,
} from '../../../components/game';
import {
  PersonalizedNourishmentCard,
  AthleticCheckInCard,
} from '../../../components/wellness';

import { useRootStore } from '../../../stores/useRootStore';
import {
  generateMonthGrid,
  generateDayAgenda,
  getDayRangeInfo,
  getHolidayForDate,
  deriveCyclePhaseForDate,
  formatLocalDate,
  parseLocalDate,
  CalendarEvent,
  toggleEventStatus,
  rescheduleCalendarEvent,
} from '../../../domain/calendar/universalCalendarEngine';
import {
  getLevelDefinition,
  getSpecialQuestsForExperience,
  getTaskById,
} from '../../../domain/game/gameCatalogService';
import {
  PHASE_CONFIG,
  computeAdvancedCycleMetrics,
} from '../../../domain/health/cycleCalculations';
import {
  PersonalCalendarEvent,
} from '../../../stores/useRootStore';

type ActiveTab = 'quests' | 'calendar' | 'arcade' | 'forecast' | 'recovery';

export default function TodayScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  const isWomen = experience === 'women_health';
  const isMen = experience === 'men_health';

  // Primary active tab (Quests is default to put the game engine front and center)
  const [activeTab, setActiveTab] = useState<ActiveTab>('quests');

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
    level,
    coins,
    streak,
    skipDailyTask,
    joinSpecialQuest,
    verifyAndCompleteTask,
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
      level: s.level,
      coins: s.coins,
      streak: s.streak,
      skipDailyTask: s.skipDailyTask,
      joinSpecialQuest: s.joinSpecialQuest,
      verifyAndCompleteTask: s.verifyAndCompleteTask,
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

  // Check-in state
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(8);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const levelDef = useMemo(() => getLevelDefinition(level), [level]);
  const specialQuests = useMemo(() => getSpecialQuestsForExperience(experience), [experience]);

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
    const baselineDate = cycleData?.lastPeriodDate
      ? parseLocalDate(cycleData.lastPeriodDate)
      : new Date(2026, 9, 2);

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
  const agendaEvents = useMemo(() => {
    return generateDayAgenda(selectedDateStr, { experience, cycleData, personalEvents });
  }, [selectedDateStr, experience, cycleData, personalEvents]);

  const [selectedTaskForVerification, setSelectedTaskForVerification] = useState<CalendarEvent | null>(null);
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

  const handleToggleEvent = useCallback((event: CalendarEvent) => {
    const updated = toggleEventStatus(event);

    if (updated.status === 'completed') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      const res = verifyAndCompleteTask(event.id, {
        assignmentId: event.id,
        elapsedSeconds: 60,
        selfDeclaredHonest: true,
      });
      showToast({
        type: 'success',
        message: `Task marked complete! +${res.earnedTaskPoints || 10} points logged.`,
      });
    }
  }, [verifyAndCompleteTask, showToast]);

  const handleTaskVerificationComplete = useCallback(
    (
      event: CalendarEvent,
      options: { selfDeclaredHonest: boolean; elapsedSeconds: number; notes?: string }
    ) => {
      const res = verifyAndCompleteTask(event.id, {
        assignmentId: event.id,
        elapsedSeconds: options.elapsedSeconds,
        notes: options.notes,
        selfDeclaredHonest: options.selfDeclaredHonest,
      });

      if (res.success) {
        showToast({
          type: 'success',
          message: `Verified! +${res.earnedTaskPoints} Points and +${res.earnedXp} XP added to your sanctuary record.`,
        });
      } else {
        showToast({
          type: 'warning',
          message: `Verification incomplete: ${res.reasonCodes.join(', ')}`,
        });
      }
    },
    [verifyAndCompleteTask, showToast]
  );

  const handleTaskReschedule = useCallback((event: CalendarEvent, newDate: string, newTime?: string) => {
    rescheduleCalendarEvent(event, newDate, newTime);
    showToast({ type: 'info', message: `Rescheduled to ${newDate}` });
  }, [showToast]);

  const handleTaskSkip = useCallback((event: CalendarEvent) => {
    skipDailyTask(event.id, 'User skipped');
    showToast({ type: 'info', message: 'Task skipped (0 points). You can pick a Special Quest from the Vault.' });
  }, [skipDailyTask, showToast]);

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

  const handleSaveCheckIn = useCallback(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    addCheckIn({
      date: formatLocalDate(new Date()),
      energy,
      mood,
      stress: 4,
      sleepHours: 7.5,
      symptoms: isWomen ? ['Gentle energy', 'Natural flow'] : ['Athletic recovery'],
    });
    setCheckedInToday(true);
    showToast({ type: 'success', message: 'Check-in saved securely on device' });
  }, [addCheckIn, energy, mood, isWomen, showToast]);

  const handleExerciseComplete = useCallback((exerciseType: 'breath' | 'pelvic' | 'zen', points: number, xpReward: number) => {
    const taskId = exerciseType === 'breath' ? 'task_men_box_breathing' : exerciseType === 'pelvic' ? 'task_women_bloom_pelvic_flow' : 'goal_define_one';
    verifyAndCompleteTask(taskId, {
      assignmentId: taskId,
      elapsedSeconds: 60,
      selfDeclaredHonest: true,
    });
    showToast({
      type: 'success',
      message: `${exerciseType.toUpperCase()} complete! +${points} Daily Points & +${xpReward} XP earned.`,
    });
  }, [verifyAndCompleteTask, showToast]);

  const activeDiet = onboarding.diet && onboarding.diet !== 'No preference' ? onboarding.diet : null;
  const phaseConfig = PHASE_CONFIG[selectedDatePhase];

  // Animated Tab Bar definitions (NO SPARKLE ICONS!)
  const tabItems: TabItem[] = useMemo(() => {
    if (isWomen) {
      return [
        { id: 'quests', label: 'Quests', icon: 'trophy-outline' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
        { id: 'arcade', label: 'Arcade', icon: 'game-controller-outline' },
        { id: 'forecast', label: 'Forecast', icon: 'analytics-outline' },
      ];
    } else {
      return [
        { id: 'quests', label: 'Quests', icon: 'trophy-outline' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
        { id: 'arcade', label: 'Arcade', icon: 'game-controller-outline' },
        { id: 'recovery', label: 'Recovery', icon: 'pulse-outline' },
      ];
    }
  }, [isWomen]);

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={isWomen ? 'SACRED HARMONY BLOOM' : isMen ? 'DISCIPLINE & RECOVERY' : 'SANCTUARY AGENDA'}
          title={isWomen ? 'Cycle Sanctuary' : "Today's Focus"}
          subtitle={
            isWomen
              ? 'Personalized Level 1-1,000 Journey & Restorative Cycle Rhythm.'
              : 'Physical conditioning, recovery, and daily goal progress.'
          }
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
            levelDef={levelDef}
            level={level}
            xp={xp}
            coins={coins}
            streak={streak}
            dailyPoints={dailyPoints}
            dailyPointsTarget={dailyPointsTarget}
            dailyGoalReached={dailyGoalReached}
            todayQuests={todayQuests}
            specialQuests={specialQuests}
            onExecuteQuest={(id) => {
              // Open TaskVerificationModal directly for seamless execution!
              const target = todayQuests.find((q) => q.id === id);
              if (target) {
                const asEvent: CalendarEvent = {
                  id: target.id,
                  title: target.title,
                  category: (target.category as any) ?? 'routine',
                  privacy: 'private',
                  date: selectedDateStr,
                  status: target.isCompleted ? 'completed' : 'recorded',
                  description: target.description,
                  kind: 'task',
                  metadata: {
                    taskId: target.taskId,
                  },
                };
                setSelectedTaskForVerification(asEvent);
              } else {
                router.push(`/(app)/quests/${id}`);
              }
            }}
            onSkipQuest={(id) => skipDailyTask(id, 'User skipped')}
            onJoinSpecialQuest={(skippedId, sqId) => {
              joinSpecialQuest(skippedId, sqId);
              const sq = (specialQuests as any[]).find((q: any) => q.id === sqId);
              showToast({
                type: 'success',
                message: `Accepted ${sq?.title ?? 'Special Quest'} as replacement quest!`,
              });
            }}
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
            onSelectTask={(ev) => {
              if (ev.kind === 'holiday') return;
              setSelectedTaskForVerification(ev);
            }}
          />
        </Animated.View>
      )}

      {/* SECTION 3: SOMATIC RESTORATIVE ARCADE (ISOLATED TIMER STATE - ZERO LAG!) */}
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

      {/* Task Verification Modal */}
      <TaskVerificationModal
        visible={Boolean(selectedTaskForVerification)}
        event={selectedTaskForVerification}
        onClose={() => setSelectedTaskForVerification(null)}
        onVerifyAndComplete={handleTaskVerificationComplete}
        onReschedule={handleTaskReschedule}
        onSkip={handleTaskSkip}
        onReplaceWithSpecialQuest={() => {
          setActiveTab('quests');
          showToast({ type: 'info', message: 'Select an alternative from the Special Quests Vault.' });
        }}
      />

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
