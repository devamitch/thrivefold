import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { ActivityRow } from '../../../components/game/ActivityRow';
import { QuestSheet } from '../../../components/game/QuestSheet';
import { AnalyticalMetricGrid } from '../../../components/home/AnalyticalMetricGrid';
import { AnalyticsDetailSheet } from '../../../components/home/AnalyticsDetailSheet';
import { DashboardHeader } from '../../../components/home/DashboardHeader';
import { DashboardScreenContainer } from '../../../components/home/DashboardScreenContainer';
import { HomeGuide } from '../../../components/home/HomeGuide';
import { HydrationTrackerCard } from '../../../components/home/HydrationTrackerCard';
import { MetricBarChart } from '../../../components/home/MetricBarChart';
import { SocialInvite } from '../../../components/home/SocialInvite';
import { TimeRangeFilter, type TimeRange } from '../../../components/home/TimeRangeFilter';
import { ToolsGrid } from '../../../components/home/ToolsGrid';
import { TrendAreaChart } from '../../../components/home/TrendAreaChart';
import { VitalityHero } from '../../../components/home/VitalityHero';
import { WeekGlance } from '../../../components/home/WeekGlance';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { computeInsights, recentLoad } from '../../../domain/ai/insights';
import {
  computeVitalityScore,
  getEqualizerBars,
  getWeeklyHydrationBars,
  getWeeklyTrendPoints,
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
import { useAgendaSources } from '../../../hooks/useAgendaSources';
import { routeForEvent } from '../../../navigation/eventRoutes';
import { hapticLight } from '../../../services/haptics';
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
  const reduceMotion = useReducedMotion();

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
      readings: st.deviceReadings,
      hydration: st.hydration,
      setHydration: st.setHydration,
      addWaterLog: st.addWaterLog,
      undoWaterLog: st.undoWaterLog,
      hydrationTargetGlasses: st.hydrationTargetGlasses,
      setHydrationTargetGlasses: st.setHydrationTargetGlasses,
      setupClaimed: st.rewardLedger.filter((e) => e.kind === 'setup_reward').length,
    })),
  );

  const agendaSources = useAgendaSources();
  const [filter, setFilter] = useState<'all' | QuestFamily>('all');
  const [openQuest, setOpenQuest] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [analyticsSheetOpen, setAnalyticsSheetOpen] = useState(false);

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
  const steps = latest('steps');
  const sleep = latest('sleep_minutes');
  const heart = latest('heart_rate_avg');

  const todayHydration = s.hydration[today()] ?? 0;
  const handleIncrementHydration = useCallback(() => {
    s.addWaterLog(250, today());
  }, [s]);

  const vitality = useMemo(
    () =>
      computeVitalityScore({
        todayCheckIn: todaysCheckIn ?? null,
        recentCheckIns: s.checkInHistory,
        questsDone: done,
        questsTotal: active,
        lastSleepMinutes: sleep?.value ?? null,
        todayHydrationGlasses: todayHydration,
      }),
    [todaysCheckIn, s.checkInHistory, done, active, sleep, todayHydration],
  );

  const trendPoints = useMemo(
    () => getWeeklyTrendPoints(s.checkInHistory, s.readings),
    [s.checkInHistory, s.readings],
  );

  const stepBars = useMemo(() => getEqualizerBars(s.readings, 'steps'), [s.readings]);

  const hydrationBars = useMemo(() => getWeeklyHydrationBars(s.hydration), [s.hydration]);

  const subtitle =
    !todaysCheckIn && daysAway >= 2
      ? 'Welcome back. Nothing to catch up on; start with today.'
      : !todaysCheckIn
        ? 'Start with a one-minute check-in.'
        : active === 0
          ? 'No quests yet today.'
          : done >= active
            ? 'All of today’s quests are done.'
            : `${done} of ${active} quests done today.`;

  const deviceTiles = [
    steps
      ? {
          label: steps.date === today() ? 'Steps today' : `Steps ${steps.date.slice(5)}`,
          value: steps.value.toLocaleString(),
        }
      : null,
    sleep
      ? {
          label: 'Last sleep',
          value: `${Math.floor(sleep.value / 60)}h ${Math.round(sleep.value % 60)}m`,
        }
      : null,
    heart ? { label: 'Avg heart rate', value: `${Math.round(heart.value)} bpm` } : null,
  ].filter((t): t is { label: string; value: string } => t !== null);
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

  const enter = (i: number) => (reduceMotion ? undefined : FadeIn.duration(180));

  return (
    <DashboardScreenContainer
      header={({ scrollY, collapseProgress }) => (
        <DashboardHeader
          title={name ? name : 'Thrivefold'}
          badgeText={`Lvl ${progress.level} · ${s.dailyPoints} pts`}
          onMenuPress={() => useRootStore.getState().setDrawerOpen(true)}
          scrollY={scrollY}
          collapseProgress={collapseProgress}
        />
      )}
      hero={({ scrollY, collapseProgress }) => (
        <VitalityHero
          eyebrow={new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
          greeting={name ? `${greeting()}, ${name}` : greeting()}
          subtitle={subtitle}
          onMenuPress={() => useRootStore.getState().setDrawerOpen(true)}
          score={vitality.score}
          tier={vitality.tier}
          label={vitality.label}
          subtext={vitality.subtext}
          hasCheckInToday={vitality.hasCheckInToday}
          energy={todaysCheckIn?.energy ?? null}
          mood={todaysCheckIn?.mood ?? null}
          sleepHours={
            todaysCheckIn?.sleepHours ?? (sleep ? Math.round(sleep.value / 6) / 10 : null)
          }
          hydrationGlasses={todayHydration}
          questsDone={done}
          questsTotal={active}
          points={s.dailyPoints}
          target={s.dailyPointsTarget}
          level={progress.level}
          xpToNext={progress.next ? Math.max(0, progress.xpForNext - progress.xpIntoLevel) : null}
          onCheckIn={() => router.push('/(app)/check-in')}
          onRoadmap={() => router.push('/(app)/roadmap' as Href)}
          scrollY={scrollY}
          collapseProgress={collapseProgress}
        />
      )}
    >
      {/* Analytical Controls & Responsive Charts */}
      <Animated.View entering={enter(1)}>
        <TimeRangeFilter selected={timeRange} onChange={setTimeRange} />

        {timeRange === 'today' ? (
          <>
            <AnalyticalMetricGrid
              stepsCount={steps ? Math.round(steps.value) : null}
              sleepMinutes={sleep ? Math.round(sleep.value) : null}
              heartRateAvg={heart ? Math.round(heart.value) : null}
              hydrationCount={todayHydration}
              onIncrementHydration={handleIncrementHydration}
            />
            <HydrationTrackerCard
              glasses={todayHydration}
              targetGlasses={s.hydrationTargetGlasses ?? 8}
              onSetGlasses={(v) => s.setHydration(today(), v)}
              onAddMl={(ml) => s.addWaterLog(ml, today())}
              onUndo={() => s.undoWaterLog(today())}
            />

            {/* Weekly Analytics & Trends Bottom-Sheet Launcher */}
            <PressableScale
              onPress={() => {
                hapticLight();
                setAnalyticsSheetOpen(true);
              }}
              style={{ marginTop: spacing.md }}
              accessibilityRole="button"
              accessibilityLabel="Open weekly analytics and health trends sheet"
            >
              <Card variant="tinted" style={{ padding: spacing.base }}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowCenter}>
                    <View
                      style={[styles.analyticsIconCircle, { backgroundColor: colors.surface1 }]}
                    >
                      <Ionicons name="analytics" size={18} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        Weekly Wellbeing Trajectory
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                      >
                        Tap to expand 7-day vitality curves, rhythm & targets
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-up" size={18} color={colors.primary} />
                </View>
              </Card>
            </PressableScale>
          </>
        ) : (
          <>
            <TrendAreaChart points={trendPoints} onCheckIn={() => router.push('/(app)/check-in')} />
            <MetricBarChart
              bars={stepBars}
              title="Steps Distribution"
              subtitle="Daily activity across the week"
              totalDisplay={
                steps
                  ? `${(stepBars.reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k total`
                  : undefined
              }
              onPress={() => router.push('/(app)/health/integrations' as Href)}
            />
            <MetricBarChart
              bars={hydrationBars}
              title="Hydration Rhythm"
              subtitle="Daily glasses of water (250 ml each)"
              totalDisplay={`${hydrationBars.reduce((a, b) => a + b.value, 0)} glasses`}
              onPress={() => router.push('/(app)/health/nutrition' as Href)}
            />
          </>
        )}
      </Animated.View>

      <HomeGuide />
      <SocialInvite />

      {setupOpen > 0 ? (
        <Animated.View entering={enter(2)}>
          <Link href={'/(app)/personalize' as Href} asChild>
            <Card variant="tinted" style={{ padding: spacing.base, marginTop: spacing.md }}>
              <View style={styles.rowBetween}>
                <Ionicons name="trophy-outline" size={20} color={colors.primary} />
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
        </Animated.View>
      ) : null}

      {recovery ? (
        <Animated.View entering={enter(1)}>
          <Card variant="tinted" style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {recovery.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {recovery.aiExplanation.text}
            </Text>
          </Card>
        </Animated.View>
      ) : null}

      {/* Quests */}
      <Animated.View entering={enter(2)}>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Today&apos;s plan
          </Text>
          <Link asChild href={'/(app)/calendar'}>
            <Link href={'/(app)/calendar' as Href} asChild>
              <PressableScale hitSlop={10} accessibilityRole="button">
                <Text style={[typography.subbodyBold, { color: colors.primary }]}>Calendar</Text>
              </PressableScale>
            </Link>
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
      </Animated.View>

      {/* Experience focus */}
      <Animated.View entering={enter(3)}>
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
      </Animated.View>

      <Animated.View entering={enter(3)}>
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
      </Animated.View>

      {deviceTiles.length > 0 ? (
        <Link href={'/(app)/health/integrations' as Href} asChild>
          <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.label, { color: colors.text.muted }]}>
                From Health Connect
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </View>
            <View style={[styles.metrics, { marginTop: spacing.sm }]}>
              {deviceTiles.map((t) => (
                <View key={t.label} style={[styles.metric, { backgroundColor: colors.surface1 }]}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    {t.value}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>{t.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Link>
      ) : (
        <View style={{ marginTop: spacing.md }}>
          <Link href={'/(app)/health/integrations' as Href} asChild>
            <SettingsRow
              icon="sync-outline"
              title="Connect Health Connect"
              subtitle="Bring in steps, sleep and heart rate"
            />
          </Link>
        </View>
      )}

      {/* Wellness Tools */}
      <Animated.View
        entering={enter(4)}
        style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}
      >
        <View style={styles.sectionHeader}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Tools</Text>
        </View>
        <ToolsGrid todayCount={alsoToday.length + active} />
      </Animated.View>

      <QuestSheet assignmentId={openQuest} onClose={() => setOpenQuest(null)} />
      <AnalyticsDetailSheet
        visible={analyticsSheetOpen}
        onClose={() => setAnalyticsSheetOpen(false)}
        trendPoints={trendPoints}
        stepBars={stepBars}
        hydrationBars={hydrationBars}
        targetGlasses={s.hydrationTargetGlasses ?? 8}
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
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
