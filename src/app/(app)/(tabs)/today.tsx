import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import {
  useScrollAwareTabBar,
  useTabBarInset,
} from '../../../components/navigation/CustomTabBar';
import {
  formatLocalDate,
  parseLocalDate,
  generateDayAgenda,
  generateMonthGrid,
  generateWeekGrid,
  generateYearForecast,
  generateAgendaRange,
  deriveCyclePhaseForDate,
  getDayRangeInfo,
  getHolidayForDate,
  rescheduleCalendarEvent,
  CalendarEvent,
  toggleEventStatus,
} from '../../../domain/calendar/universalCalendarEngine';
import {
  TaskVerificationModal,
  PeriodLoggerModal,
  PersonalEventModal,
} from '../../../components/ui';
import {
  getLevelDefinition,
  getSpecialQuestsForExperience,
} from '../../../domain/game/gameCatalogService';
import {
  PHASE_CONFIG,
  CyclePhase,
  computeAdvancedCycleMetrics,
} from '../../../domain/health/cycleCalculations';
import {
  PeriodLogRecord,
  PersonalCalendarEvent,
} from '../../../stores/useRootStore';

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

type WomenTabSegment = 'calendar' | 'months' | 'agenda' | 'games' | 'progress';
type MenTabSegment = 'calendar' | 'agenda' | 'progress' | 'checkin';
export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda' | 'year' | 'history';

const FOLLICULAR_STAGES = [
  {
    stage: 'Primordial Follicle',
    dayRange: 'Baseline Pool',
    desc: 'Microscopic dormant oocyte enclosed in a single flattened layer of pre-granulosa cells.',
    hormones: 'Quiet endocrine state',
  },
  {
    stage: 'Primary & Secondary Follicle',
    dayRange: 'Early Follicular (Days 1–5)',
    desc: 'Follicular growth independent of gonadotropins, transitioning to cuboidal granulosa and zona pellucida.',
    hormones: 'Initial FSH receptors form',
  },
  {
    stage: 'Antral / Tertiary Follicle',
    dayRange: 'Mid Follicular (Days 6–10)',
    desc: 'Fluid-filled antrum cavity forms; granulosa cells actively convert androgens to estradiol.',
    hormones: 'Estrogen rising steadily',
  },
  {
    stage: 'Dominant Graafian Follicle',
    dayRange: 'Late Follicular (Days 11–13)',
    desc: 'Single selected follicle reaches 18–24mm maturity with thick theca interna layer.',
    hormones: 'Peak estradiol triggers LH surge',
  },
  {
    stage: 'Ovulation & Luteal Transition',
    dayRange: 'Ovulation (Day 14 est.)',
    desc: 'Mature oocyte extruded from ovarian wall; remaining follicle luteinizes into corpus luteum.',
    hormones: 'Progesterone production begins',
  },
];

export default function TodayScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { onScroll, scrollEventThrottle } = useScrollAwareTabBar();

  const isWomen = experience === 'women_health';
  const isMen = experience === 'men_health';

  const [womenTab, setWomenTab] = useState<WomenTabSegment>('calendar');
  const [menTab, setMenTab] = useState<MenTabSegment>('agenda');

  // Universal Store Hooks
  const {
    cycleData,
    updateCycleData,
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
      updateCycleData: s.updateCycleData,
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

  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMilestoneToEdit, setSelectedMilestoneToEdit] = useState<PersonalCalendarEvent | null>(null);

  const [selectedDateStr, setSelectedDateStr] = useState(() => formatLocalDate(new Date()));
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(8);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Somatic Breath Game state
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState(0);
  const breathAnimScale = useSharedValue(1);

  // Pelvic Floor Game state
  const [pelvicActive, setPelvicActive] = useState(false);
  const [pelvicPhase, setPelvicPhase] = useState<'lift' | 'release'>('lift');
  const [pelvicSeconds, setPelvicSeconds] = useState(5);
  const [pelvicReps, setPelvicReps] = useState(0);

  // Zen Tap Game state
  const [zenTaps, setZenTaps] = useState(0);

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
    const forecast: Array<{
      monthLabel: string;
      year: number;
      month: number;
      estimatedPeriodStart: string;
      estimatedPeriodEnd: string;
      estimatedFertileStart: string;
      estimatedFertileEnd: string;
      estimatedOvulation: string;
      cycleNumber: number;
    }> = [];

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
  }, [cycleData]);

  // Derived selected date phase
  const selectedDatePhase = useMemo(() => {
    return deriveCyclePhaseForDate(selectedDateStr, cycleData);
  }, [selectedDateStr, cycleData]);

  // Daily agenda calculation
  const [agendaEvents, setAgendaEvents] = useState<CalendarEvent[]>(() =>
    generateDayAgenda(selectedDateStr, { experience, cycleData, personalEvents })
  );

  useEffect(() => {
    setAgendaEvents(
      generateDayAgenda(selectedDateStr, { experience, cycleData, personalEvents })
    );
  }, [selectedDateStr, experience, cycleData, personalEvents]);

  const [selectedTaskForVerification, setSelectedTaskForVerification] = useState<CalendarEvent | null>(null);
  const selectedDateHoliday = useMemo(() => getHolidayForDate(selectedDateStr), [selectedDateStr]);

  // Existing period log record for selected date (if user already recorded bleeding)
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

  // Personal milestones for selected date (birthdays, wedding anniversaries, custom events)
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

  // 7-day week grid for week view
  const weekGrid = useMemo(() => {
    return generateWeekGrid(parseLocalDate(selectedDateStr));
  }, [selectedDateStr]);

  // 12-month matrix forecast for year view
  const yearForecastData = useMemo(() => {
    return generateYearForecast(currentMonthDate.getFullYear(), cycleData, personalEvents);
  }, [currentMonthDate, cycleData, personalEvents]);

  // Derived selected date range info (follicular/luteal/bleeding overlap, phase label)
  const selectedDateRangeInfo = useMemo(() => {
    return getDayRangeInfo(selectedDateStr, 0, cycleData, agendaEvents, personalEvents);
  }, [selectedDateStr, cycleData, agendaEvents, personalEvents]);

  // 30-Day continuous rolling agenda
  const agendaRangeData = useMemo(() => {
    return generateAgendaRange(parseLocalDate(selectedDateStr), 30, {
      experience,
      cycleData,
      personalEvents,
    });
  }, [selectedDateStr, experience, cycleData, personalEvents]);

  // Advanced cycle metrics for history view
  const advancedCycleMetrics = useMemo(() => {
    if (!isWomen) return null;
    return computeAdvancedCycleMetrics(
      cycleData?.lastPeriodDate,
      cycleData?.periodHistory ?? [],
      cycleData?.cycleLengthDays ?? 28,
      cycleData?.periodLengthDays ?? 5,
      cycleData?.reproductiveContext ?? 'regular'
    );
  }, [isWomen, cycleData]);

  const handlePrevDay = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const cur = parseLocalDate(selectedDateStr);
    const prev = new Date(cur.getTime() - 86400000);
    setSelectedDateStr(formatLocalDate(prev));
  };

  const handleNextDay = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const cur = parseLocalDate(selectedDateStr);
    const next = new Date(cur.getTime() + 86400000);
    setSelectedDateStr(formatLocalDate(next));
  };

  const handleJumpToday = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const now = new Date();
    setSelectedDateStr(formatLocalDate(now));
    setCurrentMonthDate(now);
  };

  const handleToggleEvent = (event: CalendarEvent) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAgendaEvents((prev) =>
      prev.map((e) => (e.id === event.id ? toggleEventStatus(e) : e))
    );
  };

  const handleTaskVerificationComplete = (
    event: CalendarEvent,
    options: { selfDeclaredHonest: boolean; elapsedSeconds: number }
  ) => {
    verifyAndCompleteTask(event.id, {
      assignmentId: event.id,
      elapsedSeconds: options.elapsedSeconds,
      selfDeclaredHonest: options.selfDeclaredHonest,
    });
    setAgendaEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: 'completed', completedAt: new Date().toISOString() } : e))
    );
    showToast({
      type: 'success',
      message: `Verified "${event.title}"! +10 Points & +15 XP earned.`,
    });
  };

  const handleTaskReschedule = (event: CalendarEvent, newDate: string, newTime?: string) => {
    const rescheduled = rescheduleCalendarEvent(event, newDate, newTime);
    setAgendaEvents((prev) =>
      prev.map((e) => (e.id === event.id ? rescheduled : e))
    );
    showToast({
      type: 'info',
      message: `Rescheduled to ${newDate}.`,
    });
  };

  const handleTaskSkip = (event: CalendarEvent) => {
    skipDailyTask(event.id, 'User skipped from calendar');
    setAgendaEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: 'cancelled' } : e))
    );
    showToast({
      type: 'info',
      message: `Skipped "${event.title}" for today.`,
    });
  };

  const handleLogPeriodBleeding = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setShowPeriodModal(true);
  };

  const handleOpenMilestoneModal = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMilestoneToEdit(null);
    setShowMilestoneModal(true);
  };

  const handleEditMilestone = (milestone: PersonalCalendarEvent) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMilestoneToEdit(milestone);
    setShowMilestoneModal(true);
  };

  const handleSaveCheckIn = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    addCheckIn({
      date: selectedDateStr,
      energy,
      mood,
      stress: 4,
      sleepHours: 7.5,
      symptoms: isWomen ? ['Gentle energy', 'Natural flow'] : ['Athletic recovery'],
    });
    setCheckedInToday(true);
    showToast({ type: 'success', message: 'Check-in saved securely on device' });
  };

  // Breath Game Loop
  useEffect(() => {
    if (!breathActive) return;
    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (breathPhase === 'inhale') {
          setBreathPhase('hold');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return 7;
        } else if (breathPhase === 'hold') {
          setBreathPhase('exhale');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return 8;
        } else {
          setBreathPhase('inhale');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setBreathCyclesCompleted((c) => {
            const nextCount = c + 1;
            if (nextCount >= 1) {
              verifyAndCompleteTask('mindful_meditation', {
                assignmentId: 'mindful_meditation',
                elapsedSeconds: 19,
                selfDeclaredHonest: true,
              });
              showToast({
                type: 'success',
                message: 'Breath cycle complete! +10 Task Points & +15 XP earned.',
              });
            }
            return nextCount;
          });
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathActive, breathPhase, verifyAndCompleteTask, showToast]);

  // Pelvic Sync Game Loop
  useEffect(() => {
    if (!pelvicActive) return;
    const interval = setInterval(() => {
      setPelvicSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (pelvicPhase === 'lift') {
          setPelvicPhase('release');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return 5;
        } else {
          setPelvicPhase('lift');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setPelvicReps((r) => {
            const next = r + 1;
            if (next >= 3) {
              setPelvicActive(false);
              verifyAndCompleteTask('pelvic_floor_awareness', {
                assignmentId: 'pelvic_floor_awareness',
                elapsedSeconds: 30,
                selfDeclaredHonest: true,
              });
              showToast({
                type: 'success',
                message: '3 Pelvic reps complete! +10 Task Points & +15 XP earned.',
              });
            }
            return next;
          });
          return 5;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pelvicActive, pelvicPhase, verifyAndCompleteTask, showToast]);

  const activeDiet = onboarding.diet && onboarding.diet !== 'No preference' ? onboarding.diet : null;
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const phaseConfig = PHASE_CONFIG[selectedDatePhase];

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={isWomen ? 'SACRED HARMONY BLOOM' : isMen ? 'DISCIPLINE & RECOVERY' : 'SANCTUARY AGENDA'}
          title={isWomen ? 'Cycle Sanctuary' : "Today's Focus"}
          subtitle={
            isWomen
              ? 'Phase-aware rhythm, restorative games, and precalculated life planner.'
              : 'Physical conditioning, recovery, and daily goal progress.'
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Top Segmented Tabs (Harmony Bloom Concept) */}
      {isWomen ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.segmentScroll,
            { backgroundColor: colors.surface1, marginTop: spacing.xs, marginBottom: spacing.xs },
          ]}
        >
          {[
            { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
            { id: 'months', label: 'Months', icon: 'calendar-number-outline' },
            { id: 'agenda', label: 'Today', icon: 'list-outline' },
            { id: 'games', label: 'Arcade', icon: 'game-controller-outline' },
            { id: 'progress', label: 'Journey', icon: 'trophy-outline' },
          ].map((tab) => {
            const isActive = womenTab === tab.id;
            return (
              <PressableScale
                key={tab.id}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setWomenTab(tab.id as WomenTabSegment);
                }}
                scaleTo={0.94}
                style={[
                  styles.segmentBtnPill,
                  {
                    backgroundColor: isActive ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={isActive ? colors.onPrimary : colors.text.secondary}
                />
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: isActive ? colors.onPrimary : colors.text.secondary,
                      marginLeft: 4,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      ) : (
          <View style={[styles.segmentRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
            {[
              { id: 'calendar', label: 'Life Calendar', icon: 'calendar-outline' },
              { id: 'agenda', label: 'Agenda & Habits', icon: 'list-outline' },
              { id: 'progress', label: 'Level Journey', icon: 'trophy-outline' },
              { id: 'checkin', label: 'Energy & Recovery', icon: 'pulse-outline' },
            ].map((tab) => {
              const isActive = menTab === tab.id;
              return (
                <PressableScale
                  key={tab.id}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setMenTab(tab.id as MenTabSegment);
                  }}
                  scaleTo={0.94}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={15}
                    color={isActive ? colors.onPrimary : colors.text.secondary}
                  />
                  <Text
                    style={[
                      typography.captionBold,
                      {
                        color: isActive ? colors.onPrimary : colors.text.secondary,
                        marginLeft: 4,
                        fontSize: 11,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION A: CYCLE CALENDAR VIEW (FOR WOMEN & UNIVERSAL PLANNER)
        ───────────────────────────────────────────────────────────── */}
        {((isWomen && womenTab === 'calendar') || (!isWomen && menTab === 'calendar')) && (
          <Animated.View entering={FadeInDown.duration(240)}>
            {/* Calendar View Switcher (Month | Week | Day | Agenda | 12-Month | History) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.viewModeScroll, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
            >
              {[
                { id: 'month', label: 'Month', icon: 'grid-outline' },
                { id: 'week', label: 'Week', icon: 'reorder-two-outline' },
                { id: 'day', label: 'Day', icon: 'today-outline' },
                { id: 'agenda', label: 'Agenda', icon: 'list-outline' },
                { id: 'year', label: '12-Month', icon: 'albums-outline' },
                { id: 'history', label: isWomen ? 'Cycle History' : 'Milestones', icon: 'time-outline' },
              ].map((mode) => {
                const isActive = calendarViewMode === mode.id;
                return (
                  <PressableScale
                    key={mode.id}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setCalendarViewMode(mode.id as CalendarViewMode);
                    }}
                    scaleTo={0.94}
                    style={[
                      styles.viewModeBtn,
                      {
                        backgroundColor: isActive ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={14}
                      color={isActive ? colors.onPrimary : colors.text.secondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isActive ? colors.onPrimary : colors.text.secondary, fontSize: 11 },
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            {/* SUB-VIEW 1: MONTH GRID VIEW */}
            {calendarViewMode === 'month' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                <View style={styles.calendarNavRow}>
                  <PressableScale
                    onPress={() => {
                      const prev = new Date(currentMonthDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentMonthDate(prev);
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }}
                    scaleTo={0.9}
                    style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                  >
                    <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                  </PressableScale>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={[typography.subheading, { color: colors.text.primary }]}>
                      {monthName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                      {cycleData?.cycleLengthDays ?? 28}-day natural rhythm estimate
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PressableScale
                      onPress={() => {
                        const now = new Date();
                        setCurrentMonthDate(now);
                        setSelectedDateStr(formatLocalDate(now));
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                      }}
                      scaleTo={0.93}
                      style={[styles.todayJumpBtn, { backgroundColor: colors.surface1, marginRight: 6 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Jump to today"
                    >
                      <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => {
                        const next = new Date(currentMonthDate);
                        next.setMonth(next.getMonth() + 1);
                        setCurrentMonthDate(next);
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                      }}
                      scaleTo={0.9}
                      style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Next month"
                    >
                      <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
                    </PressableScale>
                  </View>
                </View>

                {/* Weekday Labels (Monday to Sunday) */}
                <View style={[styles.weekDaysRow, { marginTop: spacing.md }]}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <Text key={idx} style={[styles.weekDayHeader, { color: colors.text.muted }]}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* 42-Cell Month Grid with Continuous Date Range Highlights */}
                <View style={styles.monthGrid}>
                  {monthGrid.map((cell, cellIdx) => {
                    const isSelected = cell.date === selectedDateStr;
                    const rangeInfo = getDayRangeInfo(
                      cell.date,
                      cellIdx,
                      cycleData,
                      agendaEvents,
                      personalEvents
                    );

                    return (
                      <Pressable
                        key={cell.date}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setSelectedDateStr(cell.date);
                        }}
                        style={[
                          styles.gridCellContainer,
                          { opacity: cell.isCurrentMonth ? 1 : 0.32 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${cell.date}${rangeInfo.holiday ? `, ${rangeInfo.holiday.name}` : ''}`}
                      >
                        {/* Multi-day connected continuous range highlight bar */}
                        {rangeInfo.rangeType !== 'none' && (
                          <View
                            style={[
                              styles.rangeHighlightBar,
                              rangeInfo.rangePosition === 'start' && styles.rangeBarStart,
                              rangeInfo.rangePosition === 'middle' && styles.rangeBarMiddle,
                              rangeInfo.rangePosition === 'end' && styles.rangeBarEnd,
                              rangeInfo.rangePosition === 'single' && styles.rangeBarSingle,
                              {
                                backgroundColor: rangeInfo.isRecordedPeriod
                                  ? 'rgba(218, 119, 86, 0.44)' // Solid terracotta for confirmed recorded period
                                  : rangeInfo.rangeType === 'period'
                                  ? 'rgba(218, 119, 86, 0.22)' // Soft terracotta for predicted period
                                  : rangeInfo.rangeType === 'ovulation'
                                  ? 'rgba(226, 178, 88, 0.38)' // Golden ovulation highlight
                                  : rangeInfo.rangeType === 'fertile'
                                  ? 'rgba(226, 178, 88, 0.18)' // Fertile window highlight
                                  : rangeInfo.rangeType === 'follicular'
                                  ? 'rgba(132, 175, 142, 0.22)' // Calm pista green for follicular phase
                                  : 'rgba(176, 150, 195, 0.20)', // Soft mauve for luteal phase
                              },
                            ]}
                          />
                        )}

                        {/* Date Circle / Selection Squircle */}
                        <View
                          style={[
                            styles.datePill,
                            isSelected && { backgroundColor: colors.primary },
                            !isSelected && cell.isToday && {
                              backgroundColor: colors.surface1,
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
                                  : cell.isToday
                                  ? colors.primary
                                  : colors.text.primary,
                              },
                            ]}
                          >
                            {cell.dayOfMonth}
                          </Text>
                        </View>

                        {/* Bottom Cell Markers: Personal milestone icon, holiday icon, or ovulation sparkles */}
                        <View style={styles.cellBottomRow}>
                          {rangeInfo.personalEvents && rangeInfo.personalEvents.length > 0 ? (
                            <Ionicons name="gift-outline" size={8} color={colors.primary} />
                          ) : rangeInfo.holiday ? (
                            <Ionicons name="flag-outline" size={8} color="#D97706" />
                          ) : isWomen && rangeInfo.isOvulationPeak ? (
                            <Ionicons name="sparkles" size={8} color="#E2B258" />
                          ) : rangeInfo.taskStats && rangeInfo.taskStats.total > 0 ? (
                            <View
                              style={[
                                styles.taskMiniDot,
                                {
                                  backgroundColor:
                                    rangeInfo.taskStats.percent === 100
                                      ? colors.success
                                      : colors.text.muted,
                                },
                              ]}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Continuous Range Legend */}
                <View style={[styles.legendRow, { borderTopColor: colors.surface1, marginTop: spacing.md }]}>
                  {isWomen && (
                    <>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendPill, { backgroundColor: 'rgba(218, 119, 86, 0.44)' }]} />
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Recorded
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendPill, { backgroundColor: 'rgba(218, 119, 86, 0.22)' }]} />
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Predicted
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendPill, { backgroundColor: 'rgba(132, 175, 142, 0.36)' }]} />
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Follicular
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendPill, { backgroundColor: 'rgba(226, 178, 88, 0.38)' }]} />
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Fertile
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendPill, { backgroundColor: 'rgba(176, 150, 195, 0.36)' }]} />
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Luteal
                        </Text>
                      </View>
                    </>
                  )}
                  <View style={styles.legendItem}>
                    <Ionicons name="gift-outline" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      Milestone
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Ionicons name="flag-outline" size={11} color="#D97706" style={{ marginRight: 4 }} />
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      Holiday
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.taskMiniDot, { backgroundColor: colors.success, marginRight: 4 }]} />
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      Completed
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* SUB-VIEW 2: WEEK STRIP VIEW */}
            {calendarViewMode === 'week' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Week Overview
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    Selected: {selectedDateStr}
                  </Text>
                </View>
                <View style={[styles.weekStripRow, { marginTop: spacing.md }]}>
                  {weekGrid.map((dayCell, idx) => {
                    const isSelected = dayCell.date === selectedDateStr;
                    const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
                    const rangeInfo = getDayRangeInfo(dayCell.date, idx, cycleData, undefined, personalEvents);

                    return (
                      <PressableScale
                        key={dayCell.date}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setSelectedDateStr(dayCell.date);
                        }}
                        scaleTo={0.93}
                        style={[
                          styles.weekStripCell,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.caption,
                            {
                              color: isSelected ? colors.onPrimary : colors.text.muted,
                              fontSize: 11,
                            },
                          ]}
                        >
                          {dayName}
                        </Text>
                        <Text
                          style={[
                            typography.subheading,
                            {
                              color: isSelected ? colors.onPrimary : colors.text.primary,
                              marginTop: 2,
                            },
                          ]}
                        >
                          {dayCell.dayOfMonth}
                        </Text>
                        <View style={{ height: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          {rangeInfo.personalEvents && rangeInfo.personalEvents.length > 0 ? (
                            <Ionicons name="gift-outline" size={9} color={colors.primary} />
                          ) : rangeInfo.isRecordedPeriod ? (
                            <View style={[styles.weekMiniDot, { backgroundColor: '#DA7756' }]} />
                          ) : rangeInfo.isFertile ? (
                            <View style={[styles.weekMiniDot, { backgroundColor: '#E2B258' }]} />
                          ) : null}
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </Card>
            )}

            {/* SUB-VIEW 3: 12-MONTH MATRIX FORECAST */}
            {calendarViewMode === 'year' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[typography.subheading, { color: colors.text.primary }]}>
                      {currentMonthDate.getFullYear()} Annual Horizon
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                      Precalculated period ranges & annual personal milestones
                    </Text>
                  </View>
                  <Button
                    label="+ Milestone"
                    size="sm"
                    variant="primary"
                    onPress={handleOpenMilestoneModal}
                  />
                </View>

                <View style={[styles.yearGrid, { marginTop: spacing.md }]}>
                  {yearForecastData.map((yf) => (
                    <PressableScale
                      key={yf.monthIndex}
                      onPress={() => {
                        const targetDate = new Date(yf.year, yf.monthIndex, 1);
                        setCurrentMonthDate(targetDate);
                        setCalendarViewMode('month');
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                      }}
                      scaleTo={0.96}
                      style={[styles.yearMonthCard, { backgroundColor: colors.surface1 }]}
                    >
                      <View style={styles.rowBetween}>
                        <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                          {yf.monthName.slice(0, 3)}
                        </Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
                      </View>
                      {isWomen ? (
                        <Text style={[typography.caption, { color: colors.primary, marginTop: 4, fontSize: 10 }]}>
                          Cycle: {yf.estimatedPeriodStart.slice(5)} – {yf.estimatedPeriodEnd.slice(5)}
                        </Text>
                      ) : (
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4, fontSize: 10 }]}>
                          {yf.milestones.length} Milestones
                        </Text>
                      )}
                      {yf.milestones.length > 0 ? (
                        <View style={{ marginTop: 4 }}>
                          {yf.milestones.slice(0, 2).map((m) => (
                            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                              <Ionicons name="gift-outline" size={8} color={colors.primary} style={{ marginRight: 3 }} />
                              <Text
                                style={[typography.caption, { color: colors.text.secondary, fontSize: 9, flex: 1 }]}
                                numberOfLines={1}
                              >
                                {m.title}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </PressableScale>
                  ))}
                </View>
              </Card>
            )}

            {/* SUB-VIEW 4: SINGLE DAY DETAIL VIEW */}
            {calendarViewMode === 'day' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                <View style={styles.calendarNavRow}>
                  <PressableScale
                    onPress={handlePrevDay}
                    scaleTo={0.9}
                    style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Previous day"
                  >
                    <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                  </PressableScale>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={[typography.subheading, { color: colors.text.primary }]}>
                      {parseLocalDate(selectedDateStr).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                      {selectedDateStr === formatLocalDate(new Date()) ? 'Today' : 'Single Day View'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PressableScale
                      onPress={handleJumpToday}
                      scaleTo={0.93}
                      style={[styles.todayJumpBtn, { backgroundColor: colors.surface1, marginRight: 6 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Jump to today"
                    >
                      <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
                    </PressableScale>

                    <PressableScale
                      onPress={handleNextDay}
                      scaleTo={0.9}
                      style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Next day"
                    >
                      <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
                    </PressableScale>
                  </View>
                </View>

                {/* Day Physiology / Rhythm Info */}
                {isWomen && (
                  <View style={[styles.dayPhysiologyBox, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={[
                            styles.phaseDot,
                            {
                              backgroundColor: selectedDateRangeInfo.isRecordedPeriod
                                ? '#DA7756'
                                : selectedDateRangeInfo.isOvulationPeak
                                ? '#E2B258'
                                : colors.primary,
                              marginRight: 8,
                            },
                          ]}
                        />
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {selectedDateRangeInfo.phaseLabel}
                        </Text>
                      </View>
                      <Badge
                        label={selectedDateRangeInfo.isFollicular && selectedDateRangeInfo.isRecordedPeriod ? 'Follicular Overlap' : phaseConfig.label}
                        variant="neutral"
                      />
                    </View>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
                      {phaseConfig.energyDesc} • {phaseConfig.description}
                    </Text>
                  </View>
                )}
              </Card>
            )}

            {/* SUB-VIEW 5: 30-DAY CONTINUOUS ROLLING AGENDA VIEW */}
            {calendarViewMode === 'agenda' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[typography.subheading, { color: colors.text.primary }]}>
                      Rolling 30-Day Agenda
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                      Starting from {selectedDateStr}
                    </Text>
                  </View>
                  <Button
                    label="+ Milestone"
                    size="sm"
                    variant="outline"
                    onPress={handleOpenMilestoneModal}
                  />
                </View>

                <View style={{ marginTop: spacing.md }}>
                  {agendaRangeData.map((dayGroup) => {
                    const hasItems = dayGroup.events.length > 0 || (dayGroup.personalEvents && dayGroup.personalEvents.length > 0) || dayGroup.holiday;
                    if (!hasItems && !dayGroup.isToday) return null;

                    return (
                      <View
                        key={dayGroup.date}
                        style={[
                          styles.agendaDayGroupCard,
                          {
                            backgroundColor: dayGroup.isToday ? colors.surface1 : colors.surface,
                            borderColor: dayGroup.isToday ? colors.primary : colors.surface1,
                          },
                        ]}
                      >
                        <PressableScale
                          onPress={() => setSelectedDateStr(dayGroup.date)}
                          scaleTo={0.99}
                          style={styles.rowBetween}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={[
                                styles.agendaDateBadge,
                                { backgroundColor: dayGroup.isToday ? colors.primary : colors.surface1 },
                              ]}
                            >
                              <Text
                                style={[
                                  typography.captionBold,
                                  { color: dayGroup.isToday ? colors.onPrimary : colors.text.primary },
                                ]}
                              >
                                {dayGroup.dayOfMonth}
                              </Text>
                              <Text
                                style={[
                                  typography.caption,
                                  {
                                    color: dayGroup.isToday ? colors.onPrimary : colors.text.muted,
                                    fontSize: 9,
                                  },
                                ]}
                              >
                                {dayGroup.dayName}
                              </Text>
                            </View>

                            <View style={{ marginLeft: 10 }}>
                              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                                {dayGroup.monthName} {dayGroup.dayOfMonth}, {dayGroup.date.slice(0, 4)}
                              </Text>
                              {isWomen && (
                                <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>
                                  {dayGroup.rangeInfo.phaseLabel}
                                </Text>
                              )}
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {dayGroup.holiday && (
                              <Badge label={dayGroup.holiday.name} variant="warning" />
                            )}
                            {dayGroup.isToday && (
                              <Badge label="Today" variant="primary" />
                            )}
                          </View>
                        </PressableScale>

                        {/* Milestones on this day */}
                        {dayGroup.personalEvents && dayGroup.personalEvents.length > 0 && (
                          <View style={{ marginTop: 8, gap: 4 }}>
                            {dayGroup.personalEvents.map((pe) => (
                              <View key={pe.id} style={[styles.agendaMilestoneRow, { backgroundColor: 'rgba(226, 178, 88, 0.15)' }]}>
                                <Ionicons name="gift-outline" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                                <Text style={[typography.captionBold, { color: colors.text.primary, flex: 1 }]}>
                                  {pe.title}
                                </Text>
                                <Badge label={pe.category} variant="neutral" />
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Tasks on this day */}
                        {dayGroup.events.length > 0 ? (
                          <View style={{ marginTop: 8, gap: 6 }}>
                            {dayGroup.events.map((ev) => {
                              const isDone = ev.status === 'completed';
                              return (
                                <PressableScale
                                  key={ev.id}
                                  onPress={() => {
                                    if (ev.kind === 'holiday') return;
                                    setSelectedTaskForVerification(ev);
                                  }}
                                  scaleTo={0.98}
                                  style={[styles.agendaTaskSubRow, { backgroundColor: isDone ? colors.surface1 : colors.surface }]}
                                >
                                  <Pressable
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      handleToggleEvent(ev);
                                    }}
                                    hitSlop={8}
                                    style={[
                                      styles.checkboxSmall,
                                      {
                                        borderColor: isDone ? colors.primary : colors.text.muted,
                                        backgroundColor: isDone ? colors.primary : 'transparent',
                                      },
                                    ]}
                                  >
                                    {isDone && <Ionicons name="checkmark" size={11} color={colors.onPrimary} />}
                                  </Pressable>
                                  <Text
                                    style={[
                                      typography.captionBold,
                                      {
                                        color: isDone ? colors.text.muted : colors.text.primary,
                                        textDecorationLine: isDone ? 'line-through' : 'none',
                                        flex: 1,
                                        marginLeft: 8,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {ev.title}
                                  </Text>
                                  <Badge label={ev.kind.replace('_', ' ')} variant="neutral" />
                                </PressableScale>
                              );
                            })}
                          </View>
                        ) : (
                          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6, fontStyle: 'italic' }]}>
                            Rest & restore day
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </Card>
            )}

            {/* SUB-VIEW 6: HISTORY VIEW */}
            {calendarViewMode === 'history' && (
              <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                {isWomen ? (
                  <>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={[typography.subheading, { color: colors.text.primary }]}>
                          Period & Cycle History
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                          Audited bleed records and calculated interval metrics
                        </Text>
                      </View>
                      <Button
                        label="+ Log Period"
                        size="sm"
                        variant="primary"
                        onPress={handleLogPeriodBleeding}
                      />
                    </View>

                    {/* Advanced Metrics Summary */}
                    {advancedCycleMetrics && (
                      <View style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                        <View style={styles.statItem}>
                          <Text style={[typography.caption, { color: colors.text.muted }]}>Average</Text>
                          <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                            {advancedCycleMetrics.averageCycleLength}d
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={[typography.caption, { color: colors.text.muted }]}>Median</Text>
                          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
                            {advancedCycleMetrics.medianCycleLength}d
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={[typography.caption, { color: colors.text.muted }]}>Variability</Text>
                          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
                            ±{advancedCycleMetrics.cycleLengthVariabilityDays}d
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={[typography.caption, { color: colors.text.muted }]}>Recorded</Text>
                          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
                            {cycleData?.periodHistory?.length ?? 0}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Historical Records List */}
                    <View style={{ marginTop: spacing.md }}>
                      {(!cycleData?.periodHistory || cycleData.periodHistory.length === 0) ? (
                        <View style={{ alignItems: 'center', padding: spacing.lg }}>
                          <Ionicons name="water-outline" size={32} color={colors.text.muted} />
                          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                            No Period Records Logged Yet
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                            Tap "+ Log Period" to record bleeding dates, flow intensity, and pain ratings.
                          </Text>
                        </View>
                      ) : (
                        cycleData.periodHistory.map((rec) => (
                          <View
                            key={rec.id}
                            style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                          >
                            <View style={styles.rowBetween}>
                              <View style={{ flex: 1 }}>
                                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                                  {rec.startDate} {rec.isOngoing ? '— Ongoing' : rec.endDate ? `— ${rec.endDate}` : ''}
                                </Text>
                                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                                  Flow: {rec.flowIntensity} • Pain: {rec.painLevel !== undefined ? `${rec.painLevel}/10` : 'None'}
                                </Text>
                                {rec.notes ? (
                                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                                    "{rec.notes}"
                                  </Text>
                                ) : null}
                              </View>
                              <View style={{ flexDirection: 'row', gap: 6 }}>
                                <PressableScale
                                  onPress={() => {
                                    setSelectedDateStr(rec.startDate);
                                    setShowPeriodModal(true);
                                  }}
                                  scaleTo={0.9}
                                  style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
                                  accessibilityRole="button"
                                  accessibilityLabel="Edit period"
                                >
                                  <Ionicons name="pencil" size={14} color={colors.primary} />
                                </PressableScale>
                                <PressableScale
                                  onPress={() => {
                                    showAlert({
                                      title: 'Delete Period Record?',
                                      message: `Are you sure you want to remove the record for ${rec.startDate}? Dependent predictions will be recalculated.`,
                                      confirmText: 'Delete',
                                      destructive: true,
                                      onConfirm: () => {
                                        deletePeriod(rec.id);
                                        showToast({ type: 'info', message: 'Period record deleted.' });
                                      },
                                    });
                                  }}
                                  scaleTo={0.9}
                                  style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
                                  accessibilityRole="button"
                                  accessibilityLabel="Delete period"
                                >
                                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                                </PressableScale>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={[typography.subheading, { color: colors.text.primary }]}>
                          Milestones & Anniversaries
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                          Birthdays, family celebrations, and financial reminders
                        </Text>
                      </View>
                      <Button
                        label="+ Add Event"
                        size="sm"
                        variant="primary"
                        onPress={handleOpenMilestoneModal}
                      />
                    </View>

                    <View style={{ marginTop: spacing.md }}>
                      {(!personalEvents || personalEvents.length === 0) ? (
                        <View style={{ alignItems: 'center', padding: spacing.lg }}>
                          <Ionicons name="calendar-outline" size={32} color={colors.text.muted} />
                          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                            No Milestones Added Yet
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                            Save your spouse's birthday, anniversary, or financial deadlines.
                          </Text>
                        </View>
                      ) : (
                        personalEvents.map((pe) => (
                          <View
                            key={pe.id}
                            style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                          >
                            <View style={styles.rowBetween}>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Ionicons name="gift-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                                    {pe.title}
                                  </Text>
                                </View>
                                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                                  {pe.date} • {pe.category.toUpperCase()} {pe.recurrence === 'yearly' ? '(Annual)' : ''}
                                  {pe.relationship ? ` • ${pe.relationship}` : ''}
                                </Text>
                                {pe.notes ? (
                                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                                    {pe.notes}
                                  </Text>
                                ) : null}
                              </View>
                              <View style={{ flexDirection: 'row', gap: 6 }}>
                                <PressableScale
                                  onPress={() => handleEditMilestone(pe)}
                                  scaleTo={0.9}
                                  style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
                                >
                                  <Ionicons name="pencil" size={14} color={colors.primary} />
                                </PressableScale>
                                <PressableScale
                                  onPress={() => {
                                    showAlert({
                                      title: 'Delete Milestone?',
                                      message: `Are you sure you want to remove "${pe.title}"?`,
                                      confirmText: 'Delete',
                                      destructive: true,
                                      onConfirm: () => {
                                        deletePersonalEvent(pe.id);
                                        showToast({ type: 'info', message: 'Milestone deleted.' });
                                      },
                                    });
                                  }}
                                  scaleTo={0.9}
                                  style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
                                >
                                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                                </PressableScale>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </>
                )}
              </Card>
            )}

            {/* Details for Selected Day (Month, Week, Day views) */}
            {(calendarViewMode === 'month' || calendarViewMode === 'week' || calendarViewMode === 'day') && (
              <>
                {/* Personal Milestones Banner (Birthdays, Wedding Anniversaries) */}
                {selectedDateMilestones.length > 0 &&
                  selectedDateMilestones.map((milestone) => (
                    <Card
                      key={milestone.id}
                      variant="tinted"
                      style={{
                        marginTop: spacing.md,
                        padding: spacing.md,
                        backgroundColor: 'rgba(226, 178, 88, 0.16)',
                      }}
                    >
                      <View style={styles.holidayCard}>
                        <View style={[styles.milestoneIconBox, { backgroundColor: colors.surface1 }]}>
                          <Ionicons name="gift-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.rowBetween}>
                            <Text style={[typography.subheading, { color: colors.text.primary }]}>
                              {milestone.title}
                            </Text>
                            <Badge
                              label={milestone.recurrence === 'yearly' ? 'Annual Celebration' : 'Milestone'}
                              variant="warning"
                            />
                          </View>
                          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                            {milestone.relationship ? `${milestone.relationship.toUpperCase()} • ` : ''}
                            {milestone.category.toUpperCase()}
                            {milestone.notes ? ` • ${milestone.notes}` : ''}
                          </Text>
                        </View>
                        <PressableScale
                          onPress={() => handleEditMilestone(milestone)}
                          scaleTo={0.88}
                          style={[styles.monthNavBtn, { backgroundColor: colors.surface, marginLeft: 8 }]}
                        >
                          <Ionicons name="pencil" size={15} color={colors.primary} />
                        </PressableScale>
                      </View>
                    </Card>
                  ))}

                {/* Selected Date Holiday Banner (Google Calendar Feature) */}
                {selectedDateHoliday ? (
                  <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.md }}>
                    <View style={styles.holidayCard}>
                      <View style={[styles.milestoneIconBox, { backgroundColor: colors.surface1 }]}>
                        <Ionicons name="flag-outline" size={20} color="#D97706" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.rowBetween}>
                          <Text style={[typography.subheading, { color: colors.text.primary }]}>
                            {selectedDateHoliday.name}
                          </Text>
                          <Badge
                            label={selectedDateHoliday.category === 'health_observance' ? 'Observance' : 'Holiday'}
                            variant="warning"
                          />
                        </View>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                          {selectedDateHoliday.description}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ) : null}

                {/* Selected Date Cycle Insights & Period Logger Card (Women) / Daily Life & Habits Plan (Men) */}
                {isWomen ? (
                  <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                          SELECTED DATE • {selectedDateStr}
                        </Text>
                        <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                          {existingPeriodRecord
                            ? `Recorded Period (${existingPeriodRecord.flowIntensity || 'medium'})`
                            : `${phaseConfig.label} Phase`}
                        </Text>
                      </View>
                      <Badge
                        label={
                          existingPeriodRecord
                            ? 'Recorded Fact'
                            : selectedDateStr === formatLocalDate(new Date())
                            ? 'Today'
                            : 'Planned'
                        }
                        variant={existingPeriodRecord ? 'warning' : 'primary'}
                      />
                    </View>

                    <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8 }]}>
                      {existingPeriodRecord
                        ? `Bleeding started ${existingPeriodRecord.startDate}${
                            existingPeriodRecord.isOngoing
                              ? ' (Ongoing)'
                              : existingPeriodRecord.endDate
                              ? ` to ${existingPeriodRecord.endDate}`
                              : ''
                          }. Flow: ${existingPeriodRecord.flowIntensity}. Pain: ${
                            existingPeriodRecord.painLevel !== undefined ? `${existingPeriodRecord.painLevel}/10` : 'None'
                          }.${existingPeriodRecord.notes ? ` Notes: "${existingPeriodRecord.notes}"` : ''}`
                        : phaseConfig.description}
                    </Text>

                    <View style={[styles.actionBtnRow, { marginTop: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
                      <Button
                        label={existingPeriodRecord ? 'Edit Period Record' : 'Log Period Bleeding'}
                        size="sm"
                        variant="primary"
                        onPress={handleLogPeriodBleeding}
                      />
                      <Button
                        label="+ Add Milestone"
                        size="sm"
                        variant="outline"
                        onPress={handleOpenMilestoneModal}
                      />
                      <Button
                        label="Open Cycle Engine"
                        size="sm"
                        variant="outline"
                        onPress={() => router.push('/(app)/health/cycle')}
                      />
                    </View>

                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>
                      Note: Cycle projections use your recent completed intervals and communicate natural
                      variability. Projections are non-diagnostic and should not be used as contraception.
                    </Text>
                  </Card>
                ) : (
                  <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                          SELECTED DATE • {selectedDateStr}
                        </Text>
                        <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                          Daily Life & Habits Plan
                        </Text>
                      </View>
                      <Badge
                        label={selectedDateStr === formatLocalDate(new Date()) ? 'Today' : 'Planned'}
                        variant="primary"
                      />
                    </View>
                    <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8 }]}>
                      Manage scheduled habits, personal milestones, birthdays, financial deadlines, and verify daily tasks.
                    </Text>
                    <View style={[styles.actionBtnRow, { marginTop: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
                      <Button
                        label="+ Add Milestone"
                        size="sm"
                        variant="primary"
                        onPress={handleOpenMilestoneModal}
                      />
                    </View>
                  </Card>
                )}

            {/* Planned Tasks & Daily Agenda for Selected Date */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    TASKS & VERIFICATIONS FOR {selectedDateStr}
                  </Text>
                  <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
                    Daily Tasks, Rituals & Habits
                  </Text>
                </View>
                <Badge
                  label={`${agendaEvents.filter((e) => e.status === 'completed').length}/${agendaEvents.length} Done`}
                  variant="primary"
                />
              </View>

              {/* Progress Track */}
              {agendaEvents.length > 0 && (
                <View style={[styles.taskProgressBarTrack, { backgroundColor: colors.surface1 }]}>
                  <View
                    style={[
                      styles.taskProgressBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.round(
                          (agendaEvents.filter((e) => e.status === 'completed').length /
                            agendaEvents.length) *
                            100
                        )}%`,
                      },
                    ]}
                  />
                </View>
              )}

              <View style={{ marginTop: spacing.md }}>
                {agendaEvents.map((event) => {
                  const isDone = event.status === 'completed';
                  return (
                    <PressableScale
                      key={event.id}
                      onPress={() => {
                        if (event.kind === 'holiday') return;
                        setSelectedTaskForVerification(event);
                      }}
                      scaleTo={0.98}
                      style={[
                        styles.agendaTaskCard,
                        {
                          backgroundColor: isDone ? colors.surface1 : colors.surface,
                          marginBottom: 8,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Task: ${event.title}, ${isDone ? 'Completed' : 'Pending'}`}
                    >
                      <View style={styles.agendaCheckRow}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleEvent(event);
                          }}
                          hitSlop={8}
                          style={[
                            styles.checkbox,
                            {
                              borderColor: isDone ? colors.primary : colors.text.muted,
                              backgroundColor: isDone ? colors.primary : 'transparent',
                            },
                          ]}
                        >
                          {isDone && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                        </Pressable>

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            style={[
                              typography.bodyBold,
                              {
                                color: isDone ? colors.text.muted : colors.text.primary,
                                textDecorationLine: isDone ? 'line-through' : 'none',
                              },
                            ]}
                          >
                            {event.title}
                          </Text>
                          {event.description ? (
                            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                              {event.description}
                            </Text>
                          ) : null}
                          {event.startTime ? (
                            <Text style={[typography.caption, { color: colors.primary, marginTop: 4 }]}>
                              Scheduled: {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                            </Text>
                          ) : null}
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Badge label={event.kind.replace('_', ' ')} variant="neutral" />
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Ionicons name="chevron-forward" size={14} color={colors.text.muted} />
                          </View>
                        </View>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            </Card>
          </>
        )}
        </Animated.View>
      )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION: MULTI-MONTH FORECAST & CYCLE HEALTH (FOR WOMEN)
        ───────────────────────────────────────────────────────────── */}
        {isWomen && womenTab === 'months' && (
          <Animated.View entering={FadeInDown.duration(240)}>
            {/* Cycle Health & Rhythm Overview */}
            <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    CYCLE HEALTH SUMMARY
                  </Text>
                  <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                    28-Day Biological Rhythm
                  </Text>
                </View>
                <Badge label="Active Pattern" variant="primary" />
              </View>

              <View style={[styles.statsGrid, { marginTop: spacing.md }]}>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>Avg Cycle</Text>
                  <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
                    {cycleData?.cycleLengthDays ?? 28}d
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Normal 21–35d</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>Period Flow</Text>
                  <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
                    {cycleData?.periodLengthDays ?? 5}d
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Regular</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>Luteal Phase</Text>
                  <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
                    14d
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Consistent</Text>
                </View>
              </View>
            </Card>

            {/* 12-Month Calculated Future Calendar Forecast */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    12-Month Calculated Forecast
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Deterministic projections extending across the rolling horizon.
                  </Text>
                </View>
                <Badge label="12 Months" variant="neutral" />
              </View>

              <View style={{ marginTop: spacing.md }}>
                {twelveMonthForecast.map((item) => (
                  <PressableScale
                    key={item.estimatedPeriodStart}
                    onPress={() => {
                      setCurrentMonthDate(new Date(item.year, item.month, 1));
                      setSelectedDateStr(item.estimatedPeriodStart);
                      setWomenTab('calendar');
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                    }}
                    scaleTo={0.97}
                    style={[
                      styles.forecastItem,
                      {
                        backgroundColor: colors.surface,
                        marginBottom: 10,
                      },
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                        <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                          {item.monthLabel}
                        </Text>
                      </View>
                      <Badge label={`Cycle #${item.cycleNumber}`} variant="primary" />
                    </View>

                    <View style={[styles.rowBetween, { marginTop: 8 }]}>
                      <View>
                        <Text style={[typography.caption, { color: colors.text.muted }]}>Predicted Period</Text>
                        <Text style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}>
                          {item.estimatedPeriodStart} → {item.estimatedPeriodEnd}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[typography.caption, { color: colors.text.muted }]}>Fertile Window</Text>
                        <Text style={[typography.captionBold, { color: colors.accent, marginTop: 2 }]}>
                          {item.estimatedFertileStart} → {item.estimatedFertileEnd}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.rowBetween, { marginTop: 8 }]}>
                      <Text style={[typography.caption, { color: colors.text.secondary }]}>
                        Ovulation est. {item.estimatedOvulation}
                      </Text>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        View in Calendar →
                      </Text>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </Card>

            {/* Biological Follicular Development Arc */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Biological Follicular Stages
                </Text>
                <Badge label="Educational" variant="neutral" />
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
                Cellular development of ovarian follicles from dormant reserve to dominant maturity.
              </Text>

              {FOLLICULAR_STAGES.map((stage, idx) => (
                <PressableScale
                  key={stage.stage}
                  onPress={() => setActiveStageIndex(idx)}
                  scaleTo={0.97}
                  style={[
                    styles.stageCard,
                    {
                      backgroundColor: activeStageIndex === idx ? colors.surface1 : colors.surface,
                      marginBottom: 8,
                    },
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {idx + 1}. {stage.stage}
                    </Text>
                    <Badge label={stage.dayRange} variant="primary" />
                  </View>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                    {stage.desc}
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>
                    Endocrine activity: {stage.hormones}
                  </Text>
                </PressableScale>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION B: TODAY'S AGENDA & NUTRITION
        ───────────────────────────────────────────────────────────── */}
        {((isWomen && womenTab === 'agenda') || (!isWomen && menTab === 'agenda')) && (
          <Animated.View entering={FadeInDown.duration(240)}>
            {/* Personalized Dietary Rhythm Card */}
            <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    PERSONALIZED NOURISHMENT
                  </Text>
                  <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                    {activeDiet ? `${activeDiet} Rhythm` : 'Balanced Whole Foods'}
                  </Text>
                </View>
                <Badge label="Active Diet" variant="primary" />
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
                {activeDiet
                  ? `Recipes and daily meal guidance tailored to your ${activeDiet} onboarding choice.`
                  : 'Whole food, nutrient-dense suggestions supporting hormone balance and steady energy.'}
              </Text>
              <Button
                label="View Full Nutrition Recipes"
                size="sm"
                variant="outline"
                onPress={() => router.push('/(app)/health/nutrition')}
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
              />
            </Card>

            {/* Hydration Tracker */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Cellular Hydration
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    Target: 8 glasses daily (2.0L)
                  </Text>
                </View>
                <Badge label={`${waterGlasses}/8 glasses`} variant="primary" />
              </View>
              <View style={[styles.waterRow, { marginTop: spacing.md }]}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <PressableScale
                    key={g}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setWaterGlasses(g);
                    }}
                    scaleTo={0.88}
                    style={[
                      styles.waterGlass,
                      {
                        backgroundColor: g <= waterGlasses ? colors.primary : colors.surface1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="water"
                      size={16}
                      color={g <= waterGlasses ? colors.onPrimary : colors.text.muted}
                    />
                  </PressableScale>
                ))}
              </View>
            </Card>

            {/* Daily Precalculated Agenda Events */}
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
                Calculated Daily Schedule
              </Text>
              {agendaEvents.map((evt) => {
                const isDone = evt.status === 'completed';
                return (
                  <Card
                    key={evt.id}
                    onPress={() => handleToggleEvent(evt)}
                    style={[
                      styles.agendaCard,
                      {
                        backgroundColor: isDone ? colors.surface1 : colors.surface,
                        opacity: isDone ? 0.75 : 1,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    <View style={styles.agendaRow}>
                      <PressableScale
                        onPress={() => handleToggleEvent(evt)}
                        scaleTo={0.9}
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isDone ? colors.success : 'transparent',
                            borderColor: isDone ? colors.success : colors.text.muted,
                          },
                        ]}
                      >
                        {isDone && <Ionicons name="checkmark" size={14} color="#FFF" />}
                      </PressableScale>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[
                            typography.bodyBold,
                            {
                              color: colors.text.primary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {evt.title}
                        </Text>
                        {evt.description && (
                          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                            {evt.description}
                          </Text>
                        )}
                      </View>

                      <Badge label={evt.kind.replace('_', ' ')} variant="neutral" />
                    </View>
                  </Card>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION C: SOMATIC WELLNESS GAMES ARCADE
        ───────────────────────────────────────────────────────────── */}
        {isWomen && womenTab === 'games' && (
          <Animated.View entering={FadeInDown.duration(240)}>
            {/* Game 1: Somatic Breath Blossom */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Somatic Breath Blossom
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    4-7-8 parasympathetic tone release
                  </Text>
                </View>
                <Badge label="+10 Pts" variant="primary" />
              </View>

              <View style={styles.breathCircleWrap}>
                <View
                  style={[
                    styles.breathCircle,
                    {
                      backgroundColor: colors.surface1,
                      borderColor: colors.primary,
                      borderWidth: 2,
                      transform: [
                        {
                          scale:
                            breathPhase === 'inhale'
                              ? 1.2
                              : breathPhase === 'hold'
                              ? 1.2
                              : 0.9,
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[typography.display, { color: colors.primary }]}>
                    {breathSeconds}
                  </Text>
                  <Text
                    style={[
                      typography.captionBold,
                      { color: colors.text.secondary, textTransform: 'uppercase', marginTop: 4 },
                    ]}
                  >
                    {breathPhase}
                  </Text>
                </View>
              </View>

              <Button
                label={breathActive ? 'Pause Breathwork' : 'Start 4-7-8 Blossom'}
                variant={breathActive ? 'outline' : 'primary'}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch {}
                  setBreathActive(!breathActive);
                }}
                style={{ marginTop: spacing.md }}
              />
            </Card>

            {/* Game 2: Pelvic Floor Rhythm Sync */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Pelvic Floor Rhythm Sync
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    5s gentle pelvic lift • 5s complete release
                  </Text>
                </View>
                <Badge label={`Rep ${pelvicReps}/3`} variant="primary" />
              </View>

              <View style={[styles.pelvicIndicator, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                <Text style={[typography.heading, { color: colors.primary }]}>
                  {pelvicActive ? `${pelvicPhase.toUpperCase()} (${pelvicSeconds}s)` : 'Ready'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                  {pelvicPhase === 'lift'
                    ? 'Gently draw the pelvic muscles inward and upward.'
                    : 'Completely soften, relax, and let go.'}
                </Text>
              </View>

              <Button
                label={pelvicActive ? 'Stop Exercise' : 'Start Pelvic Sync (3 Reps)'}
                variant={pelvicActive ? 'outline' : 'primary'}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch {}
                  setPelvicActive(!pelvicActive);
                }}
                style={{ marginTop: spacing.md }}
              />
            </Card>

            {/* Game 3: Zen Harmonic Tap */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Zen Harmonic Rhythm
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    Tap to ground somatic presence
                  </Text>
                </View>
                <Badge label={`${zenTaps} Taps`} variant="neutral" />
              </View>

              <PressableScale
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setZenTaps((t) => {
                    const next = t + 1;
                    if (next === 5) {
                      verifyAndCompleteTask('mindful_meditation', {
                        assignmentId: 'mindful_meditation',
                        elapsedSeconds: 15,
                        selfDeclaredHonest: true,
                      });
                      showToast({ type: 'success', message: 'Zen Rhythm Achieved! +10 Points' });
                    }
                    return next;
                  });
                }}
                scaleTo={0.92}
                style={[styles.zenOrb, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
              >
                <Ionicons name="sparkles" size={32} color={colors.primary} />
                <Text style={[typography.captionBold, { color: colors.primary, marginTop: 6 }]}>
                  TAP WITH YOUR HEARTBEAT
                </Text>
              </PressableScale>
            </Card>
          </Animated.View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION D: GAME JOURNEY (LEVEL 1–1,000 PROGRESSION)
        ───────────────────────────────────────────────────────────── */}
        {((isWomen && womenTab === 'progress') || (!isWomen && menTab === 'progress')) && (
          <Animated.View entering={FadeInDown.duration(240)}>
            {/* Level & Arc Banner */}
            <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    CHAPTER {levelDef.chapterNumber} • {levelDef.arc.toUpperCase()}
                  </Text>
                  <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                    {levelDef.title}
                  </Text>
                </View>
                <Badge label={`Lvl ${level}/1000`} variant="primary" />
              </View>

              {/* Stats Bar */}
              <View style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                <View style={styles.statItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Total XP</Text>
                  <Text style={[typography.subbodyBold, { color: colors.primary }]}>{xp}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Coins</Text>
                  <Text style={[typography.subbodyBold, { color: colors.accent }]}>{coins}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Streak</Text>
                  <Text style={[typography.subbodyBold, { color: colors.success }]}>{streak}d</Text>
                </View>
              </View>

              {/* Today's 40-Point Goal Progress */}
              <View style={{ marginTop: spacing.md }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                    Today's Point Target
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {dailyPoints} / {dailyPointsTarget} pts
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.surface1, marginTop: 6 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: dailyGoalReached ? colors.success : colors.primary,
                        width: `${Math.min(100, (dailyPoints / Math.max(1, dailyPointsTarget)) * 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </Card>

            {/* Daily Quests with Skip & Replace */}
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
                Today's Quests ({todayQuests.filter((q) => q.isCompleted).length}/{todayQuests.length})
              </Text>

              {todayQuests.map((quest) => (
                <Card key={quest.id} style={{ marginBottom: 10, padding: spacing.md }}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {quest.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {quest.description}
                      </Text>
                    </View>
                    <Badge
                      label={quest.isCompleted ? 'Verified' : `${quest.taskPoints ?? 10} pts`}
                      variant={quest.isCompleted ? 'success' : 'primary'}
                    />
                  </View>

                  {!quest.isCompleted && (
                    <View style={[styles.actionBtnRow, { marginTop: 12 }]}>
                      <Button
                        label="Execute Task"
                        size="sm"
                        variant="primary"
                        onPress={() => router.push(`/(app)/quests/${quest.id}`)}
                        style={{ marginRight: 8 }}
                      />
                      <Button
                        label="Skip & Vault"
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch {}
                          skipDailyTask(quest.id, 'User skipped');
                        }}
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>

            {/* Special Quests Vault */}
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
                Special Quests Vault (Pick an alternative)
              </Text>
              {specialQuests.map((sq) => (
                <Card key={sq.id} style={{ marginBottom: 10, padding: spacing.md }}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {sq.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {sq.shortDescription}
                      </Text>
                    </View>
                    <Badge label={`+${sq.points.taskPoints} pts`} variant="primary" />
                  </View>
                  <Button
                    label="Accept & Join Special Quest"
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      } catch {}
                      joinSpecialQuest(sq.id, todayQuests[0]?.id ?? 'default');
                      showToast({ type: 'success', message: `Accepted ${sq.title}!` });
                    }}
                    style={{ marginTop: 10, alignSelf: 'flex-start' }}
                  />
                </Card>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION E: MEN'S RECOVERY CHECK-IN (FOR MEN)
        ───────────────────────────────────────────────────────────── */}
        {isMen && menTab === 'checkin' && (
          <Animated.View entering={FadeInDown.duration(240)}>
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
                    onPress={() => setEnergy(v)}
                    scaleTo={0.9}
                    style={[
                      styles.ratingBtn,
                      {
                        backgroundColor: energy === v ? colors.primary : colors.surface1,
                      },
                    ]}
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

              {/* Mood Rating */}
              <View style={[styles.rowBetween, { marginTop: spacing.md }]}>
                <Text style={[typography.captionBold, { color: colors.text.primary }]}>Focus</Text>
                <Badge label={MOOD_LABELS[mood] ?? 'Positive'} variant="primary" />
              </View>
              <View style={[styles.ratingRow, { marginTop: 8 }]}>
                {[1, 3, 5, 7, 9, 10].map((v) => (
                  <PressableScale
                    key={v}
                    onPress={() => setMood(v)}
                    scaleTo={0.9}
                    style={[
                      styles.ratingBtn,
                      {
                        backgroundColor: mood === v ? colors.primary : colors.surface1,
                      },
                    ]}
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
                onPress={handleSaveCheckIn}
                style={{ marginTop: spacing.lg }}
              />
            </Card>
          </Animated.View>
        )}

      {/* Interactive Task Verification Modal */}
      <TaskVerificationModal
        visible={Boolean(selectedTaskForVerification)}
        event={selectedTaskForVerification}
        onClose={() => setSelectedTaskForVerification(null)}
        onVerifyAndComplete={handleTaskVerificationComplete}
        onReschedule={handleTaskReschedule}
        onSkip={handleTaskSkip}
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

      {/* Personal Milestones (Birthdays, Anniversaries) Modal */}
      <PersonalEventModal
        visible={showMilestoneModal}
        initialDateStr={selectedDateStr}
        existingEvent={selectedMilestoneToEdit}
        onClose={() => {
          setShowMilestoneModal(false);
          setSelectedMilestoneToEdit(null);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  topHeader: {
    marginBottom: 4,
  },
  segmentScroll: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 3,
    gap: 4,
  },
  segmentBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  agendaTaskCard: {
    padding: 12,
    borderRadius: 14,
  },
  agendaCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  forecastItem: {
    padding: 14,
    borderRadius: 14,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  calendarNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    width: '100%',
  },
  weekDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gridCellContainer: {
    width: '14.28%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  rangeHighlightBar: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    zIndex: 1,
  },
  rangeBarStart: {
    left: '12%',
    right: 0,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rangeBarMiddle: {
    left: 0,
    right: 0,
    borderRadius: 0,
  },
  rangeBarEnd: {
    left: 0,
    right: '12%',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeBarSingle: {
    left: '12%',
    right: '12%',
    borderRadius: 18,
  },
  datePill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cellBottomRow: {
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  holidayEmojiIcon: {
    fontSize: 9,
    lineHeight: 11,
  },
  todayJumpBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  taskProgressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginTop: 8,
  },
  taskProgressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  legendPill: {
    width: 18,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  gridCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  phaseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageCard: {
    padding: 12,
    borderRadius: 14,
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlass: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaCard: {
    padding: 14,
    borderRadius: 14,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  breathCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pelvicIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
  },
  zenOrb: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewModeRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  viewModeBtn: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 11,
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekStripCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  weekMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearMonthCard: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 10,
    borderRadius: 12,
  },
  taskMiniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  viewModeScroll: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  milestoneIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayPhysiologyBox: {
    padding: 12,
    borderRadius: 14,
  },
  agendaDayGroupCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  agendaDateBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  agendaTaskSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRecordCard: {
    padding: 12,
    borderRadius: 12,
  },
});
