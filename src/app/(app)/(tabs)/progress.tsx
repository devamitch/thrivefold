import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, type Href } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AssetIllustrations } from '../../../constants/assets';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { ProgressionPanel } from '../../../components/game/ProgressionPanel';
import { SETUP_REWARDS } from '../../../domain/game/setupProfile';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';
import { MetricBarChart } from '../../../components/home/MetricBarChart';
import {
  type EqualizerBar,
  getEqualizerBars,
  getWeeklyCalorieBars,
  getWeeklyHydrationBars,
  loggedActiveMinutes,
} from '../../../domain/analytics/dashboardAnalytics';
import { activeCalories } from '../../../domain/activity/calories';
import { stepsByDate } from '../../../domain/interop/readings';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { BetaStudioEntries } from '../../../components/beta/BetaStudioEntries';

interface Stats {
  questsCompleted: number;
  streak: number;
  daysActive: number;
  journalCount: number;
  level: number;
  setupDone: number;
  movementCount: number;
  connected: boolean;
}

interface RoadmapStep {
  id: string;
  stepNumber: number;
  phase: string;
  title: string;
  description: (s: Stats) => string;
  icon: keyof typeof Ionicons.glyphMap;
  targetRoute: string;
  isUnlocked: (s: Stats) => boolean;
  isCompleted: (s: Stats) => boolean;
}

/**
 * Milestones measured from real records only. They mark progress; XP comes from quests and
 * setup steps in the ledger, so no milestone shows or pays a reward of its own.
 */
const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'setup',
    stepNumber: 1,
    phase: 'Foundation',
    title: 'Finish setting up',
    description: (s) => `${s.setupDone} of ${SETUP_REWARDS.length} setup steps answered. Each one fits your quests better.`,
    icon: 'options-outline',
    targetRoute: '/(app)/personalize',
    isUnlocked: () => true,
    isCompleted: (s) => s.setupDone >= SETUP_REWARDS.length,
  },
  {
    id: 'first_checkin',
    stepNumber: 2,
    phase: 'Foundation',
    title: 'First daily check-in',
    description: () => 'Energy, mood, stress and sleep in under a minute.',
    icon: 'sunny-outline',
    targetRoute: '/(app)/check-in',
    isUnlocked: () => true,
    isCompleted: (s) => s.daysActive >= 1,
  },
  {
    id: 'first_quest',
    stepNumber: 3,
    phase: 'Foundation',
    title: 'First quest done',
    description: () => 'Finish one of today’s quests.',
    icon: 'checkmark-circle-outline',
    targetRoute: '/(app)/(tabs)/today',
    isUnlocked: () => true,
    isCompleted: (s) => s.questsCompleted >= 1,
  },
  {
    id: 'first_movement',
    stepNumber: 4,
    phase: 'Momentum',
    title: 'Move with a plan',
    description: (s) => (s.movementCount ? `${s.movementCount} workouts or activities logged.` : 'Log a workout, walk, ride or class.'),
    icon: 'barbell-outline',
    targetRoute: '/(app)/health/exercise',
    isUnlocked: () => true,
    isCompleted: (s) => s.movementCount >= 1,
  },
  {
    id: 'three_day',
    stepNumber: 5,
    phase: 'Momentum',
    title: 'Three check-ins in a row',
    description: (s) => `Current run: ${s.streak} day${s.streak === 1 ? '' : 's'}. Rest days never take away earned progress.`,
    icon: 'flame-outline',
    targetRoute: '/(app)/check-in',
    isUnlocked: (s) => s.daysActive >= 1,
    isCompleted: (s) => s.streak >= 3,
  },
  {
    id: 'journal',
    stepNumber: 6,
    phase: 'Momentum',
    title: 'First journal entry',
    description: () => 'A few private lines, kept on this phone.',
    icon: 'book-outline',
    targetRoute: '/(app)/journal',
    isUnlocked: () => true,
    isCompleted: (s) => s.journalCount >= 1,
  },
  {
    id: 'connected',
    stepNumber: 7,
    phase: 'Momentum',
    title: 'Bring in your other data',
    description: () => 'Optional: connect Health Connect or a heart-rate strap so steps and sleep fill in themselves.',
    icon: 'link-outline',
    targetRoute: '/(app)/health/integrations',
    isUnlocked: () => true,
    isCompleted: (s) => s.connected,
  },
  {
    id: 'seven_day',
    stepNumber: 8,
    phase: 'Steadiness',
    title: 'A full week of check-ins',
    description: (s) => `Current run: ${s.streak} of 7 days.`,
    icon: 'calendar-outline',
    targetRoute: '/(app)/check-in',
    isUnlocked: (s) => s.streak >= 1,
    isCompleted: (s) => s.streak >= 7,
  },
  {
    id: 'level_ten',
    stepNumber: 9,
    phase: 'Steadiness',
    title: 'Reach level 10',
    description: (s) => `You are level ${s.level}.`,
    icon: 'trending-up-outline',
    targetRoute: '/(app)/(tabs)/today',
    isUnlocked: () => true,
    isCompleted: (s) => s.level >= 10,
  },
  {
    id: 'twenty_one',
    stepNumber: 10,
    phase: 'Habit',
    title: '21 days in a row',
    description: (s) => `Current run: ${s.streak} of 21 days.`,
    icon: 'ribbon-outline',
    targetRoute: '/(app)/check-in',
    isUnlocked: (s) => s.streak >= 7,
    isCompleted: (s) => s.streak >= 21,
  },
];

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'badges' | 'trends'>('roadmap');
  const [trendRange, setTrendRange] = useState<7 | 30>(7);

  const currentStreak = useRootStore((s) => s.currentStreak);
  const daysActive = useRootStore((s) => s.completedCheckInDaysCount);
  const journalCount = useRootStore((s) => s.journalEntries.length);
  const {
    level: LEVEL,
    questsCompleted,
    setupDone,
    movementCount,
    connected,
    readings,
    hydration,
    activityLogs,
    workoutSessions,
    weightKg,
  } = useRootStore(
    useShallow((s) => ({
      level: s.level,
      questsCompleted: s.questsCompleted,
      setupDone: s.rewardLedger.filter((e) => e.kind === 'setup_reward').length,
      movementCount: s.workoutSessions.length + s.activityLogs.length + s.poseSessions.length,
      connected: Boolean(s.healthConnect) || s.deviceReadings.length > 0,
      readings: s.deviceReadings,
      hydration: s.hydration,
      activityLogs: s.activityLogs,
      workoutSessions: s.workoutSessions,
      weightKg: s.weightKg,
    })),
  );

  // ── Health Trends Computation ──
  const stepBars = useMemo(
    () => getEqualizerBars(readings, 'steps', new Date(), trendRange),
    [readings, trendRange],
  );
  const sleepBars = useMemo(
    () => getEqualizerBars(readings, 'sleep_minutes', new Date(), trendRange),
    [readings, trendRange],
  );
  const hydrationBars = useMemo(
    () => getWeeklyHydrationBars(hydration, new Date(), 8, trendRange),
    [hydration, trendRange],
  );

  const stepMap = useMemo(() => stepsByDate(readings), [readings]);
  const calorieBars = useMemo(
    () =>
      getWeeklyCalorieBars(
        (d) => {
          const s = stepMap.get(d);
          return activeCalories({
            date: d,
            weightKg: weightKg ?? null,
            steps: s ? s.value : null,
            workoutSessions,
            activityLogs,
          }).total;
        },
        new Date(),
        500,
        trendRange,
      ),
    [stepMap, weightKg, workoutSessions, activityLogs, trendRange],
  );

  const activeDaysLogged = stepBars.filter((b: EqualizerBar) => b.value > 0);
  const stepAvg = activeDaysLogged.length
    ? Math.round(activeDaysLogged.reduce((a: number, b: EqualizerBar) => a + b.value, 0) / activeDaysLogged.length)
    : null;
  const calDaysLogged = calorieBars.filter((b: EqualizerBar) => b.value > 0);
  const calAvg = calDaysLogged.length
    ? Math.round(calDaysLogged.reduce((a: number, b: EqualizerBar) => a + b.value, 0) / calDaysLogged.length)
    : null;

  const stats: Stats = {
    questsCompleted,
    streak: currentStreak,
    daysActive,
    journalCount,
    level: LEVEL,
    setupDone,
    movementCount,
    connected,
  };
  const earned = ROADMAP_STEPS.filter((st) => st.isCompleted(stats));

  const isMen = experience === 'men_health';
  const isPride = experience === 'pride_wellbeing';

  const completedStepsCount = ROADMAP_STEPS.filter((s) => s.isCompleted(stats)).length;
  const roadmapPct = Math.round((completedStepsCount / ROADMAP_STEPS.length) * 100);

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={isMen ? 'MOMENTUM & VITALITY' : isPride ? 'WELLBEING & AFFIRMATION' : 'YOUR JOURNEY'}
          title="Progress"
          subtitle="Your level, milestones and what you have logged"
        />
      }
      scrollMode="shell-scroll-view"
      backgroundImage={AssetIllustrations.progressZenBg}
      backgroundOverlayOpacity={0.92}
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        <Link href={'/(app)/roadmap' as Href} asChild>
          <Card variant="tinted" style={{ padding: spacing.base, marginTop: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Ionicons name="map-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Your roadmap</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  20 chapters, their stages, and where you are now
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>
        <ProgressionPanel />

        {/* View Switcher Tabs (Roadmap vs Badges) */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <PressableScale
            onPress={() => setActiveTab('roadmap')}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === 'roadmap' ? colors.surface : 'transparent' },
            ]}
          >
            <Ionicons
              name="trail-sign-outline"
              size={16}
              color={activeTab === 'roadmap' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                {
                  color: activeTab === 'roadmap' ? colors.primary : colors.text.secondary,
                  marginLeft: 6,
                },
              ]}
            >
              Milestones ({roadmapPct}%)
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => setActiveTab('badges')}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === 'badges' ? colors.surface : 'transparent' },
            ]}
          >
            <Ionicons
              name="trophy-outline"
              size={16}
              color={activeTab === 'badges' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                {
                  color: activeTab === 'badges' ? colors.primary : colors.text.secondary,
                  marginLeft: 6,
                },
              ]}
            >
              Stats
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => setActiveTab('trends')}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === 'trends' ? colors.surface : 'transparent' },
            ]}
          >
            <Ionicons
              name="analytics-outline"
              size={16}
              color={activeTab === 'trends' ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                typography.captionBold,
                {
                  color: activeTab === 'trends' ? colors.primary : colors.text.secondary,
                  marginLeft: 6,
                },
              ]}
            >
              Trends
            </Text>
          </PressableScale>
        </View>

        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <Animated.View entering={FadeIn.duration(180)}>
            {/* Roadmap Progress Summary */}
            <Card style={[styles.roadmapBanner, { backgroundColor: colors.surface, marginTop: spacing.md, overflow: 'hidden' }]}>
              <View style={styles.roadmapImageWrap}>
                <Image
                  source={require('../../../../assets/illustrations/roadmap-journey-bg.jpg')}
                  style={styles.roadmapBannerImage}
                  contentFit="cover"
                />
              </View>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Milestones
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {completedStepsCount} of {ROADMAP_STEPS.length} reached
                  </Text>
                </View>
                <Badge label={`${roadmapPct}% Complete`} variant="primary" />
              </View>
              <View style={[styles.xpTrack, { backgroundColor: colors.surface1, marginTop: 12 }]}>
                <View
                  style={[
                    styles.xpFill,
                    { backgroundColor: colors.accent, width: `${roadmapPct}%` },
                  ]}
                />
              </View>
            </Card>

            {/* Interactive Timeline Steps */}
            <View style={styles.timelineContainer}>
              {ROADMAP_STEPS.map((step, idx) => {
                const isComp = step.isCompleted(stats);
                const isUnl = step.isUnlocked(stats);

                return (
                  <View key={step.id} style={styles.timelineItem}>
                    {/* Left node indicator & vertical connecting line */}
                    <View style={styles.nodeColumn}>
                      <View
                        style={[
                          styles.nodeCircle,
                          {
                            backgroundColor: isComp
                              ? colors.success
                              : isUnl
                              ? colors.primary
                              : colors.surface1,
                          },
                        ]}
                      >
                        {isComp ? (
                          <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
                        ) : isUnl ? (
                          <Ionicons name={step.icon} size={14} color={colors.onPrimary} />
                        ) : (
                          <Ionicons name="lock-closed" size={12} color={colors.text.muted} />
                        )}
                      </View>
                      {idx < ROADMAP_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.nodeLine,
                            {
                              backgroundColor: isComp ? colors.success : colors.surface1,
                            },
                          ]}
                        />
                      )}
                    </View>

                    {/* Right Step Card */}
                    <View style={{ flex: 1, paddingBottom: 16 }}>
                      <Card
                        onPress={() => {
                          if (step.targetRoute) {
                            router.push(step.targetRoute as Href);
                          }
                        }}
                        style={[
                          styles.stepCard,
                          {
                            backgroundColor: colors.surface,
                            opacity: isUnl ? 1 : 0.6,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
                            {step.phase.toUpperCase()}
                          </Text>
                          {isComp ? (
                            <Badge label="Done" variant="success" />
                          ) : isUnl ? (
                            <Badge label="Next" variant="primary" />
                          ) : (
                            <Badge label="Locked" variant="neutral" />
                          )}
                        </View>

                        <Text
                          style={[
                            typography.subheading,
                            { color: colors.text.primary, marginTop: 4, fontSize: 16 },
                          ]}
                        >
                          {step.title}
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2 },
                          ]}
                        >
                          {step.description(stats)}
                        </Text>

                        {/* Interactive Action CTA */}
                        {isUnl && !isComp && (
                          <View style={styles.stepCtaRow}>
                            <Text style={[typography.captionBold, { color: colors.primary }]}>
                              Go
                            </Text>
                            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                          </View>
                        )}
                      </Card>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Stats View */}
        {activeTab === 'badges' && (
          <Animated.View entering={FadeIn.duration(180)}>
            {/* Stats Grid */}
            <View style={[styles.statsGrid, { marginTop: spacing.md }]}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIconWrap, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {questsCompleted}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Quests Finished
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="flame-outline" size={20} color={colors.accent} />
                </View>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {currentStreak}d
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Active Streak
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {daysActive}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Days Active
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.accent} />
                </View>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {journalCount}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Journal entries
                </Text>
              </View>
            </View>

            {/* Badges Section */}
            <Text
              style={[
                typography.subheading,
                { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
              ]}
            >
              Milestones reached
            </Text>
            {earned.length === 0 ? (
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>
                Milestones you reach show up here. Start with a check-in.
              </Text>
            ) : (
              earned.map((ach) => (
                <Card key={ach.id} style={[styles.achCard, { marginBottom: 8, backgroundColor: colors.surface }]}>
                  <View style={styles.achRow}>
                    <View style={[styles.achIcon, { backgroundColor: colors.primaryAlpha }]}>
                      <Ionicons name={ach.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{ach.title}</Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {ach.phase}
                      </Text>
                    </View>
                    <Badge label="Reached" variant="success" />
                  </View>
                </Card>
              ))
            )}
          </Animated.View>
        )}

        {/* Health Trends View */}
        {activeTab === 'trends' && (
          <Animated.View entering={FadeIn.duration(180)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Health Trends
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label="7 Days" selected={trendRange === 7} onPress={() => setTrendRange(7)} />
                <Chip label="30 Days" selected={trendRange === 30} onPress={() => setTrendRange(30)} />
              </View>
            </View>

            <MetricBarChart
              bars={stepBars}
              title="Daily Steps"
              subtitle={`${trendRange === 7 ? 'Last 7 days' : 'Last 30 days'} · phone & Health Connect`}
              totalDisplay={stepAvg !== null ? `avg ${stepAvg >= 1000 ? `${(stepAvg / 1000).toFixed(1)}k` : stepAvg}/day` : 'No data'}
            />

            <MetricBarChart
              bars={calorieBars}
              title="Active Energy"
              subtitle={`${trendRange === 7 ? 'Last 7 days' : 'Last 30 days'} · steps & workouts`}
              totalDisplay={calAvg !== null ? `avg ${calAvg} kcal/day` : 'No data'}
            />

            <MetricBarChart
              bars={hydrationBars}
              title="Hydration"
              subtitle={`${trendRange === 7 ? 'Last 7 days' : 'Last 30 days'} · glasses, target 8`}
              totalDisplay={`${hydrationBars.filter((b: EqualizerBar) => b.value > 0).length} days logged`}
            />

            {sleepBars.some((b: EqualizerBar) => b.value > 0) ? (
              <MetricBarChart
                bars={sleepBars}
                title="Sleep Duration"
                subtitle={`${trendRange === 7 ? 'Last 7 days' : 'Last 30 days'} · Health Connect`}
                totalDisplay={`${sleepBars.filter((b: EqualizerBar) => b.value > 0).length} nights`}
              />
            ) : null}
          </Animated.View>
        )}
        <BetaStudioEntries section="progress" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    borderRadius: 20,
    padding: 18,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: 6,
    borderRadius: 3,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  roadmapBanner: {
    borderRadius: 18,
    padding: 16,
  },
  roadmapImageWrap: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  roadmapBannerImage: {
    width: '100%',
    height: '100%',
  },
  timelineContainer: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  nodeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepCard: {
    borderRadius: 16,
    padding: 14,
  },
  stepCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.3%',
    borderRadius: 18,
    padding: 16,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achCard: {
    borderRadius: 16,
    padding: 14,
  },
  achRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
