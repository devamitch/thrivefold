import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRow } from '../../../components/game/ActivityRow';
import { QuestSheet } from '../../../components/game/QuestSheet';
import { AnalyticalMetricGrid } from '../../../components/home/AnalyticalMetricGrid';
import { AnalyticsDetailSheet } from '../../../components/home/AnalyticsDetailSheet';
import { CalorieDetailSheet } from '../../../components/home/CalorieDetailSheet';
import { DashboardHeader } from '../../../components/home/DashboardHeader';
import { DashboardScreenContainer } from '../../../components/home/DashboardScreenContainer';
import { HomeGuide } from '../../../components/home/HomeGuide';
import { HydrationTrackerCard } from '../../../components/home/HydrationTrackerCard';
import { MetricBarChart } from '../../../components/home/MetricBarChart';
import { SocialInvite } from '../../../components/home/SocialInvite';
import { StepsDetailSheet } from '../../../components/home/StepsDetailSheet';
import { ToolsGrid } from '../../../components/home/ToolsGrid';
import { TrendAreaChart } from '../../../components/home/TrendAreaChart';
import {
  VitalityHero,
  VitalityHeroDecor,
  type HeroAction,
} from '../../../components/home/VitalityHero';
import { VitalsCard } from '../../../components/home/VitalsCard';
import { WeekGlance } from '../../../components/home/WeekGlance';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { activeCalories } from '../../../domain/activity/calories';
import { stepInsights } from '../../../domain/activity/stepInsights';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { computeInsights, recentLoad } from '../../../domain/ai/insights';
import {
  computeVitalityScore,
  getEqualizerBars,
  getWeeklyHydrationBars,
  getWeeklyTrendPoints,
  loggedActiveMinutes,
} from '../../../domain/analytics/dashboardAnalytics';
import {
  formatLocalDate,
  generateDayAgenda,
  type CalendarEvent,
} from '../../../domain/calendar/universalCalendarEngine';
import { currentLevelProgress } from '../../../domain/game/gameCatalogService';
import { questFamily, type QuestFamily } from '../../../domain/game/progression';
import {
  EMPTY_BASELINE,
  isSetupSectionAnswered,
  SETUP_REWARDS,
  setupLedgerKey,
} from '../../../domain/game/setupProfile';
import { DAY_PART_LABEL, dayPartAt, splitByTime } from '../../../domain/game/timeOfDay';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { stepsByDate, type DailySteps } from '../../../domain/interop/readings';
import { useAgendaSources } from '../../../hooks/useAgendaSources';
import { routeForEvent } from '../../../navigation/eventRoutes';
import { hapticLight } from '../../../services/haptics';
import { usePhoneSteps } from '../../../services/sensors/phoneSteps';
import type { Quest } from '../../../stores/slices/questSlice';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const EVENT_ICON: Partial<Record<CalendarEvent['kind'], keyof typeof Ionicons.glyphMap>> = {
  exercise: 'barbell-outline',
  habit: 'restaurant-outline',
  personal_event: 'calendar-outline',
  health_appointment: 'medkit-outline',
  period: 'water-outline',
  medication_reminder: 'medical-outline',
  holiday: 'flag-outline',
  travel: 'airplane-outline',
};

const FAMILY_META: Record<QuestFamily, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  movement: { label: 'Movement', icon: 'walk-outline' },
  mind: { label: 'Mind', icon: 'leaf-outline' },
  rhythm: { label: 'Rhythm', icon: 'moon-outline' },
  nutrition: { label: 'Nutrition', icon: 'nutrition-outline' },
  growth: { label: 'Growth', icon: 'school-outline' },
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
};

const today = () => formatLocalDate(new Date());

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();

  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      isOnboarded: st.isOnboarded,
      onboarding: st.onboarding,
      rewardLedger: st.rewardLedger,
      cycleData: st.cycleData,
      checkInHistory: st.checkInHistory,
      quests: st.todayQuests,
      xp: st.xp,
      diamonds: st.diamonds,
      completedCheckpoints: st.completedCheckpoints,
      dailyPoints: st.dailyPoints,
      dailyPointsTarget: st.dailyPointsTarget,
      dailyGoalReached: st.dailyGoalReached,
      weightKg: st.weightKg,
      betaMode: st.betaMode,
      readings: st.deviceReadings,
      hydration: st.hydration,
      waterLogs: st.waterLogs,
      activityLogs: st.activityLogs,
      workoutSessions: st.workoutSessions,
      addWaterLog: st.addWaterLog,
      undoWaterLog: st.undoWaterLog,
      hydrationTargetGlasses: st.hydrationTargetGlasses,
      setHydrationTargetGlasses: st.setHydrationTargetGlasses,
      setupClaimed: st.rewardLedger.filter((e) => e.kind === 'setup_reward').length,
    })),
  );

  const insets = useSafeAreaInsets();
  const openDrawer = useCallback(() => {
    hapticLight();
    useRootStore.getState().setDrawerOpen(true);
  }, []);
  const agendaSources = useAgendaSources();
  const phoneSteps = usePhoneSteps();
  const [filter, setFilter] = useState<'all' | QuestFamily>('all');
  const [openQuest, setOpenQuest] = useState<string | null>(null);
  const [analyticsSheetOpen, setAnalyticsSheetOpen] = useState(false);
  const [stepsSheetOpen, setStepsSheetOpen] = useState(false);
  const [calorieSheetOpen, setCalorieSheetOpen] = useState(false);

  const isStepsQuestAssigned = useMemo(
    () =>
      s.quests.some(
        (q) =>
          !q.isCompleted &&
          (q.category === 'movement' ||
            q.title.toLowerCase().includes('step') ||
            q.title.toLowerCase().includes('walk')),
      ),
    [s.quests],
  );

  const todaysCheckIn = s.checkInHistory.find((c) => c.date === today());
  const progress = useMemo(
    () => currentLevelProgress(s.xp, s.completedCheckpoints),
    [s.xp, s.completedCheckpoints],
  );
  const load = useMemo(() => recentLoad(s.checkInHistory, today()), [s.checkInHistory]);
  const topInsight = useMemo(
    () =>
      computeInsights({
        checkIns: s.checkInHistory,
        periods: s.cycleData?.periodHistory ?? [],
        today: today(),
      }).find((i) => i.kind !== 'consistency'),
    [s.checkInHistory, s.cycleData],
  );
  const recovery = useMemo(() => {
    const rec = evaluateDeterministicRoutine({
      energy: todaysCheckIn?.energy ?? 5,
      mood: todaysCheckIn?.mood ?? 5,
      stress: todaysCheckIn?.stress ?? 5,
      experience,
      recentLoad: load,
    });
    return rec.taskId === 'rec_recovery_reset' || rec.taskId === 'rec_rest_and_care' ? rec : null;
  }, [todaysCheckIn, experience, load]);

  const visible = s.quests.filter((q) => q.status !== 'replaced');
  const families = [...new Set(visible.map((q) => questFamily(q.category)))];
  const shown = visible.filter((q) => filter === 'all' || questFamily(q.category) === filter);
  const done = visible.filter((q) => q.isCompleted).length;
  const finished = shown.filter((q) => q.isCompleted || q.status === 'skipped');
  const timed = splitByTime(
    shown.filter((q) => !q.isCompleted && q.status !== 'skipped'),
    new Date(),
  );
  const active = visible.filter((q) => q.status !== 'skipped').length;

  const name =
    s.user?.pseudonym && !['Friend', 'Guest'].includes(s.user.pseudonym) ? s.user.pseudonym : null;
  const cycle =
    experience === 'women_health' && s.cycleData?.lastPeriodDate
      ? getCyclePredictions(
          s.cycleData.lastPeriodDate,
          s.cycleData.cycleLengthDays,
          s.cycleData.periodLengthDays,
        )
      : null;
  const daysToPeriod = cycle
    ? Math.max(0, Math.ceil((new Date(cycle.nextPeriodDate).getTime() - Date.now()) / 86_400_000))
    : null;

  // Gentle restart (spec §4.4): after a gap, no catch-up and no lost-streak message.
  const lastCheckIn = s.checkInHistory.reduce<string | null>(
    (d, c) => (!d || c.date > d ? c.date : d),
    null,
  );
  const daysAway = lastCheckIn
    ? Math.round((Date.parse(today()) - Date.parse(lastCheckIn)) / 86_400_000)
    : 0;

  // Latest value per kind from connected apps and devices; nothing shows without real readings.
  const latest = (kind: string) =>
    s.readings
      .filter((r) => r.kind === kind)
      .reduce<(typeof s.readings)[number] | null>((a, r) => (!a || r.date > a.date ? r : a), null);
  const stepDays = useMemo(() => stepsByDate(s.readings), [s.readings]);
  const steps =
    stepDays.get(today()) ??
    [...stepDays.values()].reduce<DailySteps | null>(
      (a, d) => (!a || d.date > a.date ? d : a),
      null,
    );
  // A sleep reading only describes "last night" if it is dated today or yesterday.
  const latestSleep = latest('sleep_minutes');
  const yesterday = formatLocalDate(new Date(Date.now() - 86_400_000));
  const sleep =
    latestSleep && (latestSleep.date === today() || latestSleep.date === yesterday)
      ? latestSleep
      : null;
  const heart = latest('heart_rate_avg');
  const sleepMinutesValue = sleep
    ? Math.round(sleep.value)
    : todaysCheckIn?.sleepHours
      ? Math.round(todaysCheckIn.sleepHours * 60)
      : null;

  const todayHydration = s.hydration[today()] ?? 0;
  const hydrationTarget = s.hydrationTargetGlasses ?? 8;
  const todayWaterEntries = useMemo(
    () => s.waterLogs.filter((w) => w.date === today()),
    [s.waterLogs],
  );
  const activeMinutes = useMemo(
    () => loggedActiveMinutes(today(), s.activityLogs, s.workoutSessions),
    [s.activityLogs, s.workoutSessions],
  );

  const todayCalorieBreakdown = useMemo(
    () =>
      activeCalories({
        date: today(),
        weightKg: s.weightKg,
        steps: steps && steps.date === today() ? steps.value : null,
        workoutSessions: s.workoutSessions,
        activityLogs: s.activityLogs,
      }),
    [s.weightKg, steps, s.workoutSessions, s.activityLogs],
  );

  const vitality = useMemo(
    () =>
      computeVitalityScore({
        todayCheckIn: todaysCheckIn ?? null,
        questsDone: done,
        questsTotal: active,
        lastSleepMinutes: sleep?.value ?? null,
        todayHydrationGlasses: todayHydration,
      }),
    [todaysCheckIn, done, active, sleep, todayHydration],
  );

  const [range, setRange] = useState<7 | 30>(7);
  const trendPoints = useMemo(
    () => getWeeklyTrendPoints(s.checkInHistory, s.readings, new Date(), range),
    [s.checkInHistory, s.readings, range],
  );
  const weekTrend = useMemo(
    () => getWeeklyTrendPoints(s.checkInHistory, s.readings),
    [s.checkInHistory, s.readings],
  );
  const stepBars = useMemo(
    () => getEqualizerBars(s.readings, 'steps', new Date(), range),
    [s.readings, range],
  );
  const sleepBars = useMemo(
    () => getEqualizerBars(s.readings, 'sleep_minutes', new Date(), range),
    [s.readings, range],
  );
  const hydrationBars = useMemo(
    () => getWeeklyHydrationBars(s.hydration, new Date(), hydrationTarget, range),
    [s.hydration, hydrationTarget, range],
  );
  const stepDaysLogged = stepBars.filter((b) => b.value > 0);
  const stepAvg = stepDaysLogged.length
    ? Math.round(stepDaysLogged.reduce((a, b) => a + b.value, 0) / stepDaysLogged.length)
    : null;
  const waterDaysLogged = hydrationBars.filter((b) => b.value > 0);
  const waterAvg = waterDaysLogged.length
    ? Math.round((waterDaysLogged.reduce((a, b) => a + b.value, 0) / waterDaysLogged.length) * 10) /
      10
    : null;
  const sleepDaysLogged = sleepBars.filter((b) => b.value > 0);
  const rangeLabel = range === 7 ? 'Last 7 days' : 'Last 30 days';

  // Gentle restart (spec §4.4): only a gap earns a line under the greeting.
  const heroNote =
    !todaysCheckIn && daysAway >= 2
      ? 'Welcome back. Nothing to catch up on; start with today.'
      : null;

  // One next action, in order: check in, the next open quest, else the roadmap.
  const nextQuest = useMemo(() => {
    const open = visible.filter((q) => !q.isCompleted && q.status !== 'skipped');
    const t = splitByTime(open, new Date());
    return t.now[0] ?? t.later[0]?.quests[0] ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.quests]);
  const heroAction: HeroAction = !todaysCheckIn
    ? {
        label: 'Check in · 1 minute',
        icon: 'sunny-outline',
        onPress: () => router.push('/(app)/check-in'),
      }
    : nextQuest
      ? {
          label: `Next: ${nextQuest.title}`,
          icon: 'play-outline',
          onPress: () => setOpenQuest(nextQuest.id),
          accessibilityLabel: `Next quest: ${nextQuest.title}. Open`,
        }
      : {
          label: 'All done today · see your roadmap',
          icon: 'map-outline',
          onPress: () => router.push('/(app)/roadmap' as Href),
        };

  const connected = s.readings.some((r) => r.source !== 'phone_sensor');
  useFocusEffect(
    useCallback(() => {
      useRootStore.getState().autoClaimAnsweredSetupRewards();
    }, []),
  );

  const openSections = useMemo(() => {
    const answers = {
      goals: s.onboarding?.goals ?? [],
      constraints: s.onboarding?.constraints ?? [],
      routineMinutes: s.onboarding?.routineMinutes ?? null,
      diet: s.onboarding?.diet ?? null,
      observances: s.onboarding?.observances ?? [],
      baseline: { ...EMPTY_BASELINE, ...s.onboarding?.baseline },
    };
    return SETUP_REWARDS.filter((r) => {
      const isClaimed = s.rewardLedger.some((e) => e.key === setupLedgerKey(r.section));
      if (isClaimed) return false;
      return !isSetupSectionAnswered(r.section, answers);
    });
  }, [s.onboarding, s.rewardLedger]);

  const setupOpen = openSections.length;

  const alsoToday = generateDayAgenda(today(), {
    experience,
    cycleData: s.cycleData,
    ...agendaSources,
  }).filter((e) => !['task', 'cycle_phase'].includes(e.kind) && !e.id.startsWith('checkin_'));

  return (
    <DashboardScreenContainer
      heroDecor={<VitalityHeroDecor />}
      header={({ titleProgress, headerVisible, scrollToTop }) => (
        <DashboardHeader
          subtitle={`${s.dailyPoints} of ${s.dailyPointsTarget} pts · Level ${progress.level}`}
          userName={name}
          userPhotoUrl={s.user?.photoUrl}
          onMenuPress={openDrawer}
          onTitlePress={scrollToTop}
          titleProgress={titleProgress}
          visible={headerVisible}
        />
      )}
      hero={() => (
        <VitalityHero
          topInset={insets.top}
          eyebrow={new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
          greeting={name ? `${greeting()}, ${name}` : greeting()}
          note={heroNote}
          userName={name}
          userPhotoUrl={s.user?.photoUrl}
          onAvatarPress={openDrawer}
          points={s.dailyPoints}
          target={s.dailyPointsTarget}
          questsDone={done}
          questsTotal={active}
          waterGlasses={todayHydration}
          waterTarget={hydrationTarget}
          vitality={
            vitality.hasCheckInToday ? { score: vitality.score, label: vitality.label } : null
          }
          level={progress.level}
          xpToNext={progress.next ? Math.max(0, progress.xpForNext - progress.xpIntoLevel) : null}
          onRoadmap={() => router.push('/(app)/roadmap' as Href)}
          action={heroAction}
        />
      )}
    >
      <AnalyticalMetricGrid
        steps={
          steps
            ? {
                value: Math.round(steps.value),
                date: steps.date,
                isToday: steps.date === today(),
                source: steps.source,
                estimated: steps.estimated,
                since: steps.since,
              }
            : null
        }
        phoneSteps={phoneSteps.status}
        stepsHours={phoneSteps.status === 'on' ? phoneSteps.today?.hours : undefined}
        onStepsPress={() => setStepsSheetOpen(true)}
        onEnablePhoneSteps={() => {
          hapticLight();
          void phoneSteps.enable();
        }}
        isStepsQuestAssigned={isStepsQuestAssigned}
        calories={{ total: todayCalorieBreakdown.total, goal: 500 }}
        onCaloriesPress={() => setCalorieSheetOpen(true)}
        sleep={
          sleep
            ? { minutes: Math.round(sleep.value), source: 'health_connect' }
            : sleepMinutesValue !== null
              ? { minutes: sleepMinutesValue, source: 'check_in' }
              : null
        }
        heart={heart ? { bpm: heart.value, isToday: heart.date === today() } : null}
        activeMinutes={activeMinutes}
        walkingMinutesFromSteps={
          steps && steps.date === today() ? stepInsights(steps.value).walkingMinutes : null
        }
        connected={connected}
      />

      {s.betaMode ? (
        <Card
          onPress={() => router.push('/(app)/beta-lab' as Href)}
          style={{
            marginTop: spacing.md,
            padding: spacing.base,
            backgroundColor: colors.surface,
            borderColor: 'rgba(201, 164, 106, 0.4)',
            borderWidth: 1,
          }}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <BetaBadge />
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Health OS Beta Active
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Eye tracking, hand gestures & pose recognition studios are running locally on your device.
          </Text>
        </Card>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <HydrationTrackerCard
          glasses={todayHydration}
          targetGlasses={hydrationTarget}
          entries={todayWaterEntries}
          onAddMl={(ml) => s.addWaterLog(ml, today())}
          onUndo={() => s.undoWaterLog(today())}
          onEditGoal={() => setAnalyticsSheetOpen(true)}
        />
      </View>

      <VitalsCard readings={s.readings} today={today()} />

      {/* Analytics: real records only, over a week or a month. */}
      <View style={{ marginTop: spacing.lg }}>
        <View style={styles.sectionHeader}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Analytics</Text>
          <View style={styles.rangeRow}>
            <Chip label="Week" selected={range === 7} onPress={() => setRange(7)} />
            <Chip label="Month" selected={range === 30} onPress={() => setRange(30)} />
          </View>
        </View>
        <TrendAreaChart points={trendPoints} onCheckIn={() => router.push('/(app)/check-in')} />
        <MetricBarChart
          bars={stepBars}
          title="Steps"
          subtitle={`${rangeLabel} · phone or Health Connect`}
          totalDisplay={
            stepAvg !== null
              ? `avg ${stepAvg >= 1000 ? `${(stepAvg / 1000).toFixed(1)}k` : stepAvg}/day`
              : 'No steps yet'
          }
          onPress={() => router.push('/(app)/health/activity' as Href)}
        />
        <MetricBarChart
          bars={hydrationBars}
          title="Water"
          subtitle={`${rangeLabel} · glasses, goal ${hydrationTarget}`}
          totalDisplay={waterAvg !== null ? `avg ${waterAvg}/day` : 'Nothing logged'}
          onPress={() => setAnalyticsSheetOpen(true)}
        />
        {sleepDaysLogged.length > 0 ? (
          <MetricBarChart
            bars={sleepBars}
            title="Sleep"
            subtitle={`${rangeLabel} · Health Connect`}
            totalDisplay={`${sleepDaysLogged.length} night${sleepDaysLogged.length === 1 ? '' : 's'}`}
            onPress={() => router.push('/(app)/health/sleep' as Href)}
          />
        ) : null}
      </View>

      {/* Quests */}
      <View>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Today&apos;s plan
          </Text>
          <Link href={'/(app)/calendar' as Href} asChild>
            <PressableScale hitSlop={10} accessibilityRole="button">
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>Calendar</Text>
            </PressableScale>
          </Link>
        </View>

        {families.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={[{ flexGrow: 0 }, { marginTop: spacing.md }]}
          >
            <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
            {families.map((f) => (
              <Chip
                key={f}
                label={FAMILY_META[f].label}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={{ marginTop: spacing.sm }}>
          {visible.length === 0 ? (
            <Card variant="surface1" style={{ padding: spacing.base }}>
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>
                Today&apos;s quests appear here once setup is finished.
              </Text>
            </Card>
          ) : (
            <>
              {timed.now.length > 0 ? (
                <Text style={[typography.label, styles.groupLabel, { color: colors.text.muted }]}>
                  Now · {DAY_PART_LABEL[dayPartAt(new Date())]}
                </Text>
              ) : null}
              {timed.now.map((q) => (
                <QuestRow key={q.id} quest={q} onPress={() => setOpenQuest(q.id)} />
              ))}
              {timed.later.map((g) => (
                <View key={g.part}>
                  <Text style={[typography.label, styles.groupLabel, { color: colors.text.muted }]}>
                    Later · {DAY_PART_LABEL[g.part]}
                  </Text>
                  {g.quests.map((q) => (
                    <QuestRow key={q.id} quest={q} onPress={() => setOpenQuest(q.id)} />
                  ))}
                </View>
              ))}
              {finished.length > 0 ? (
                <Text style={[typography.label, styles.groupLabel, { color: colors.text.muted }]}>
                  Done
                </Text>
              ) : null}
              {finished.map((q) => (
                <QuestRow key={q.id} quest={q} onPress={() => setOpenQuest(q.id)} />
              ))}
            </>
          )}
        </View>
        {alsoToday.length > 0 ? (
          <>
            <Text style={[typography.label, styles.groupLabel, { color: colors.text.muted }]}>
              Also today
            </Text>
            {alsoToday.map((e) => (
              <SettingsRow
                key={e.id}
                icon={EVENT_ICON[e.kind] ?? 'calendar-outline'}
                title={e.title}
                subtitle={[e.startTime, e.description].filter(Boolean).join(' · ')}
                onPress={() => {
                  const route = routeForEvent(e);
                  router.push((route ?? '/(app)/calendar') as Href);
                }}
              />
            ))}
          </>
        ) : null}
      </View>

      {setupOpen > 0 ? (
        <View>
          <Link href={'/(app)/personalize' as Href} asChild>
            <Card variant="surface" style={{ padding: spacing.base, marginTop: spacing.md }}>
              <View style={styles.rowBetween}>
                <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                </View>
                <View style={[styles.flex, { marginLeft: 12 }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {setupOpen} setup step{setupOpen === 1 ? '' : 's'} open
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                    numberOfLines={2}
                  >
                    {openSections.map((sec) => sec.title).join(' · ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </Card>
          </Link>
        </View>
      ) : null}

      {recovery ? (
        <View>
          <Card variant="surface" style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {recovery.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {recovery.aiExplanation.text}
            </Text>
          </Card>
        </View>
      ) : null}

      {recovery ? (
        <View>
          <Card variant="surface" style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {recovery.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {recovery.aiExplanation.text}
            </Text>
          </Card>
        </View>
      ) : null}

      {/* Experience focus */}
      <View>
        {experience === 'women_health' ? (
          <Link href={'/(app)/health/cycle' as Href} asChild>
            <FocusCard
              icon="water-outline"
              label="Cycle"
              title={
                cycle
                  ? `Day ${cycle.currentPhase.day} · ${cycle.currentPhase.label} phase`
                  : 'Set up cycle tracking'
              }
              body={
                cycle
                  ? `Next period in about ${daysToPeriod} days (estimate)`
                  : 'Log your last period to see estimates'
              }
            />
          </Link>
        ) : experience === 'men_health' ? (
          <Link href={'/(app)/health/men' as Href} asChild>
            <FocusCard
              icon="barbell-outline"
              label="Training"
              title="Workouts and recovery"
              body="Home, gym and desk plans with your logged progress"
            />
          </Link>
        ) : (
          <Link href={'/(app)/health/pride' as Href} asChild>
            <FocusCard
              icon="heart-outline"
              label="Self-care"
              title="Affirming care"
              body="Private identity settings, tracking and support"
            />
          </Link>
        )}
      </View>

      <View>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>This week</Text>
        </View>
        <WeekGlance onOpen={() => router.push('/(app)/calendar')} />
        {topInsight ? (
          <Link href={'/(app)/ai' as Href} asChild>
            <SettingsRow
              icon="analytics-outline"
              title={topInsight.title}
              subtitle="A pattern from your check-ins"
            />
          </Link>
        ) : null}
      </View>

      {!connected ? (
        <View style={{ marginTop: spacing.md }}>
          <Link href={'/(app)/health/integrations' as Href} asChild>
            <SettingsRow
              icon="sync-outline"
              title="Connect Health Connect"
              subtitle="Bring in steps, sleep and heart rate"
            />
          </Link>
        </View>
      ) : null}

      <View>
        <HomeGuide />
      </View>
      <View>
        <SocialInvite />
      </View>

      {/* Wellness Tools */}
      <View style={{ marginTop: spacing.xl }}>
        <View style={styles.sectionHeader}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Tools</Text>
        </View>
        <ToolsGrid todayCount={alsoToday.length + active} />
      </View>

      <QuestSheet assignmentId={openQuest} onClose={() => setOpenQuest(null)} />
      <StepsDetailSheet
        visible={stepsSheetOpen}
        onClose={() => setStepsSheetOpen(false)}
        today={phoneSteps.status === 'on' ? phoneSteps.today : null}
        readings={s.readings}
        todayDate={today()}
        isQuestAssigned={isStepsQuestAssigned}
        caloriesFromSteps={todayCalorieBreakdown.fromSteps}
      />
      <CalorieDetailSheet
        visible={calorieSheetOpen}
        onClose={() => setCalorieSheetOpen(false)}
        breakdown={todayCalorieBreakdown}
        goal={500}
        weightKg={s.weightKg}
        workoutSessions={s.workoutSessions}
        activityLogs={s.activityLogs}
        readings={s.readings}
        todayDate={today()}
      />
      <AnalyticsDetailSheet
        visible={analyticsSheetOpen}
        onClose={() => setAnalyticsSheetOpen(false)}
        trendPoints={weekTrend}
        stepBars={stepBars.slice(-7)}
        hydrationBars={hydrationBars.slice(-7)}
        targetGlasses={hydrationTarget}
        onSetTargetGlasses={(t) => s.setHydrationTargetGlasses(t)}
        totalHydrationGlasses={todayHydration}
        onCheckIn={() => router.push('/(app)/check-in')}
      />
    </DashboardScreenContainer>
  );
}

function QuestRow({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const meta = FAMILY_META[questFamily(quest.category)];
  const skipped = quest.status === 'skipped';
  return (
    <ActivityRow
      icon={meta.icon}
      title={quest.title}
      meta={`${meta.label} · ${quest.durationMinutes} min · +${quest.taskPoints} pts${skipped ? ' · skipped' : quest.status === 'rejected' ? ' · needs more' : ''}`}
      done={quest.isCompleted}
      dimmed={skipped}
      action={skipped ? undefined : quest.status === 'rejected' ? 'Continue' : 'Start'}
      onPress={onPress}
    />
  );
}

function FocusCard({
  icon,
  label,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  title: string;
  body: string;
  onPress?: () => void;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Card onPress={onPress} style={{ padding: spacing.base, marginTop: spacing.lg }}>
      <View style={styles.rowBetween}>
        <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={[styles.flex, { marginLeft: 12 }]}>
          <Text style={[typography.label, { color: colors.text.muted }]}>{label}</Text>
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {body}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metrics: { flexDirection: 'row', gap: 8 },
  groupLabel: { marginBottom: 6, marginTop: 10 },
  metric: { alignItems: 'center', borderRadius: 14, flex: 1, paddingVertical: 10 },
  chips: { gap: 8 },
  iconTile: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  analyticsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRow: { flexDirection: 'row', gap: 6 },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
