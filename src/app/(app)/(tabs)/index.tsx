import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { AppHeader, HeaderIconButton } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { QuestSheet } from '../../../components/game/QuestSheet';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { computeInsights, recentLoad } from '../../../domain/ai/insights';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { currentLevelProgress } from '../../../domain/game/gameCatalogService';
import { questFamily, type QuestFamily } from '../../../domain/game/progression';
import { SETUP_REWARDS } from '../../../domain/game/setupProfile';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import type { Quest } from '../../../stores/slices/questSlice';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import type { ProductExperience } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';

type Tool = { icon: keyof typeof Ionicons.glyphMap; label: string; route: Href };

/** The tools that matter most per experience, plus shared ones. */
const TOOLS: Record<ProductExperience, Tool[]> = {
  women_health: [
    { icon: 'water-outline', label: 'Cycle', route: '/(app)/health/cycle' },
    { icon: 'pulse-outline', label: 'Symptoms', route: '/(app)/health/symptoms' },
  ],
  men_health: [
    { icon: 'barbell-outline', label: 'Workouts', route: '/(app)/health/exercise' },
    { icon: 'body-outline', label: "Men's health", route: '/(app)/health/men' },
  ],
  pride_wellbeing: [
    { icon: 'heart-outline', label: 'Self-care', route: '/(app)/health/pride' },
    { icon: 'barbell-outline', label: 'Workouts', route: '/(app)/health/exercise' },
  ],
};
const SHARED_TOOLS: Tool[] = [
  { icon: 'moon-outline', label: 'Sleep', route: '/(app)/health/sleep' },
  { icon: 'book-outline', label: 'Journal', route: '/(app)/journal' },
  { icon: 'analytics-outline', label: 'Patterns', route: '/(app)/ai' },
  { icon: 'grid-outline', label: 'All health', route: '/(app)/health' },
];

const FAMILY_META: Record<QuestFamily, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  movement: { label: 'Movement', icon: 'walk-outline' },
  mind: { label: 'Mind', icon: 'leaf-outline' },
  rhythm: { label: 'Rhythm', icon: 'moon-outline' },
  nutrition: { label: 'Nutrition', icon: 'nutrition-outline' },
  growth: { label: 'Growth', icon: 'school-outline' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const today = () => formatLocalDate(new Date());

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const reduceMotion = useReducedMotion();

  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
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
      setupClaimed: st.rewardLedger.filter((e) => e.kind === 'setup_reward').length,
    })),
  );

  const [filter, setFilter] = useState<'all' | QuestFamily>('all');
  const [openQuest, setOpenQuest] = useState<string | null>(null);

  const todaysCheckIn = s.checkInHistory.find((c) => c.date === today());
  const progress = useMemo(() => currentLevelProgress(s.xp, s.completedCheckpoints), [s.xp, s.completedCheckpoints]);
  const load = useMemo(() => recentLoad(s.checkInHistory, today()), [s.checkInHistory]);
  const topInsight = useMemo(
    () =>
      computeInsights({ checkIns: s.checkInHistory, periods: s.cycleData?.periodHistory ?? [], today: today() }).find(
        (i) => i.kind !== 'consistency',
      ),
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
  const active = visible.filter((q) => q.status !== 'skipped').length;

  const name = s.user?.pseudonym && !['Friend', 'Guest'].includes(s.user.pseudonym) ? s.user.pseudonym : null;
  const cycle =
    experience === 'women_health' && s.cycleData?.lastPeriodDate
      ? getCyclePredictions(s.cycleData.lastPeriodDate, s.cycleData.cycleLengthDays, s.cycleData.periodLengthDays)
      : null;
  const daysToPeriod = cycle ? Math.max(0, Math.ceil((new Date(cycle.nextPeriodDate).getTime() - Date.now()) / 86_400_000)) : null;

  const subtitle = !todaysCheckIn
    ? 'Start with a one-minute check-in.'
    : active === 0
      ? 'No quests yet today.'
      : done >= active
        ? 'All of today’s quests are done.'
        : `${done} of ${active} quests done today.`;

  // Latest value per kind from connected apps and devices; nothing shows without real readings.
  const latest = (kind: string) =>
    s.readings.filter((r) => r.kind === kind).reduce<(typeof s.readings)[number] | null>((a, r) => (!a || r.date > a.date ? r : a), null);
  const steps = latest('steps');
  const sleep = latest('sleep_minutes');
  const heart = latest('heart_rate_avg');
  const deviceTiles = [
    steps ? { label: steps.date === today() ? 'Steps today' : `Steps ${steps.date.slice(5)}`, value: steps.value.toLocaleString() } : null,
    sleep ? { label: 'Last sleep', value: `${Math.floor(sleep.value / 60)}h ${Math.round(sleep.value % 60)}m` } : null,
    heart ? { label: 'Avg heart rate', value: `${Math.round(heart.value)} bpm` } : null,
  ].filter((t): t is { label: string; value: string } => t !== null);
  const setupOpen = SETUP_REWARDS.length - s.setupClaimed;

  const enter = (i: number) => (reduceMotion ? undefined : FadeInDown.delay(40 * i).duration(260));

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          title={name ? `${greeting()}, ${name}` : greeting()}
          subtitle={subtitle}
          rightAction={
            <View style={styles.headerActions}>
              <HeaderIconButton icon="calendar-outline" label="Calendar" onPress={() => router.push('/(app)/calendar')} />
              <HeaderIconButton icon="person-outline" label="You" onPress={() => router.push('/(app)/(tabs)/settings')} />
            </View>
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Today's check-in */}
      <Animated.View entering={enter(0)}>
        <Card style={{ padding: spacing.base }}>
          {todaysCheckIn ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Today</Text>
                <Pressable onPress={() => router.push('/(app)/check-in')} hitSlop={10} accessibilityRole="button">
                  <Text style={[typography.subbodyBold, { color: colors.primary }]}>Update</Text>
                </Pressable>
              </View>
              <View style={[styles.metrics, { marginTop: spacing.sm }]}>
                {(
                  [
                    ['Energy', `${todaysCheckIn.energy}`],
                    ['Mood', `${todaysCheckIn.mood}`],
                    ['Stress', `${todaysCheckIn.stress}`],
                    ['Sleep', `${todaysCheckIn.sleepHours}h`],
                  ] as const
                ).map(([label, value]) => (
                  <View key={label} style={[styles.metric, { backgroundColor: colors.surface1 }]}>
                    <Text style={[typography.subheading, { color: colors.text.primary }]}>{value}</Text>
                    <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
                  </View>
                ))}
              </View>
              {topInsight ? (
                <Pressable
                  onPress={() => router.push('/(app)/ai')}
                  accessibilityRole="button"
                  accessibilityLabel={`Your pattern: ${topInsight.title}`}
                  style={[styles.insight, { borderTopColor: colors.border }]}
                >
                  <Ionicons name="analytics-outline" size={18} color={colors.primary} />
                  <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]} numberOfLines={2}>
                    {topInsight.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </Pressable>
              ) : null}
            </>
          ) : (
            <>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>How are you today?</Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                Energy, mood, stress and sleep. It takes a minute and shapes today&apos;s suggestions.
              </Text>
              <Button label="Check in" onPress={() => router.push('/(app)/check-in')} style={{ marginTop: spacing.md }} />
            </>
          )}
        </Card>
      </Animated.View>

      {deviceTiles.length > 0 ? (
        <Animated.View entering={enter(1)}>
          <Card onPress={() => router.push('/(app)/health/integrations')} style={{ padding: spacing.base, marginTop: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.captionBold, { color: colors.text.muted }]}>FROM YOUR DEVICES</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </View>
            <View style={[styles.metrics, { marginTop: spacing.sm }]}>
              {deviceTiles.map((t) => (
                <View key={t.label} style={[styles.metric, { backgroundColor: colors.surface1 }]}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>{t.value}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>{t.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {setupOpen > 0 ? (
        <Animated.View entering={enter(1)}>
          <Card onPress={() => router.push('/(app)/personalize')} variant="tinted" style={{ padding: spacing.base, marginTop: spacing.md }}>
            <View style={styles.rowBetween}>
              <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
              <View style={[styles.flex, { marginLeft: 12 }]}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {setupOpen} setup step{setupOpen === 1 ? '' : 's'} left
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Answer them to fit your quests and earn the setup XP.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {recovery ? (
        <Animated.View entering={enter(1)}>
          <Card variant="tinted" style={{ padding: spacing.base, marginTop: spacing.md }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{recovery.title}</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{recovery.aiExplanation.text}</Text>
          </Card>
        </Animated.View>
      ) : null}

      {/* Quests */}
      <Animated.View entering={enter(2)}>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Today&apos;s quests</Text>
          <Text style={[typography.captionBold, { color: s.dailyGoalReached ? colors.success : colors.text.secondary }]}>
            {s.dailyPoints} / {s.dailyPointsTarget} pts
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.surface1 }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: s.dailyGoalReached ? colors.success : colors.primary,
                width: `${Math.min(100, (s.dailyPoints / Math.max(1, s.dailyPointsTarget)) * 100)}%`,
              },
            ]}
          />
        </View>

        {families.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ marginTop: spacing.md }}>
            <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
            {families.map((f) => (
              <Chip key={f} label={FAMILY_META[f].label} selected={filter === f} onPress={() => setFilter(f)} />
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
            shown.map((q) => <QuestRow key={q.id} quest={q} onPress={() => setOpenQuest(q.id)} />)
          )}
        </View>
      </Animated.View>

      {/* Experience focus */}
      <Animated.View entering={enter(3)}>
        {experience === 'women_health' ? (
          <FocusCard
            icon="water-outline"
            label="Cycle"
            title={cycle ? `Day ${cycle.currentPhase.day} · ${cycle.currentPhase.label} phase` : 'Set up cycle tracking'}
            body={cycle ? `Next period in about ${daysToPeriod} days (estimate)` : 'Log your last period to see estimates'}
            onPress={() => router.push('/(app)/health/cycle')}
          />
        ) : experience === 'men_health' ? (
          <FocusCard
            icon="barbell-outline"
            label="Training"
            title="Workouts and recovery"
            body="Home, gym and desk plans with your logged progress"
            onPress={() => router.push('/(app)/health/men')}
          />
        ) : (
          <FocusCard
            icon="heart-outline"
            label="Self-care"
            title="Affirming care"
            body="Private identity settings, tracking and support"
            onPress={() => router.push('/(app)/health/pride')}
          />
        )}

        <Card onPress={() => router.push('/(app)/(tabs)/progress')} style={{ padding: spacing.base, marginTop: spacing.sm }}>
          <View style={styles.rowBetween}>
            <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
            </View>
            <View style={[styles.flex, { marginLeft: 12 }]}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Level {progress.level}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {progress.next ? `${Math.max(0, progress.xpForNext - progress.xpIntoLevel)} XP to level ${progress.next.level}` : `${s.xp} XP`}
                {` · ${s.diamonds} diamonds`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>
      </Animated.View>

      {/* Tools */}
      <Animated.View entering={enter(4)}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Tools</Text>
        <View style={styles.grid}>
          {[...TOOLS[experience], ...SHARED_TOOLS].map((t) => (
            <PressableScale
              key={t.label}
              onPress={() => router.push(t.route)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              style={[styles.tool, { backgroundColor: colors.surface }]}
            >
              <Ionicons name={t.icon} size={22} color={colors.primary} />
              <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 8 }]}>{t.label}</Text>
            </PressableScale>
          ))}
        </View>
      </Animated.View>

      <QuestSheet assignmentId={openQuest} onClose={() => setOpenQuest(null)} />
    </ScreenContainer>
  );
}

function QuestRow({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const meta = FAMILY_META[questFamily(quest.category)];
  const skipped = quest.status === 'skipped';
  return (
    <Card onPress={onPress} style={{ padding: spacing.md, marginBottom: spacing.sm, opacity: skipped ? 0.6 : 1 }}>
      <View style={styles.rowBetween}>
        <View style={[styles.iconTile, { backgroundColor: quest.isCompleted ? colors.successSurface : colors.primaryAlpha }]}>
          <Ionicons
            name={quest.isCompleted ? 'checkmark' : meta.icon}
            size={20}
            color={quest.isCompleted ? colors.success : colors.primary}
          />
        </View>
        <View style={[styles.flex, { marginLeft: 12, marginRight: 8 }]}>
          <Text
            style={[typography.bodyBold, { color: colors.text.primary, textDecorationLine: quest.isCompleted ? 'line-through' : 'none' }]}
            numberOfLines={2}
          >
            {quest.title}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {meta.label} · {quest.durationMinutes} min · +{quest.taskPoints} pts
            {skipped ? ' · skipped' : quest.status === 'rejected' ? ' · needs more' : ''}
          </Text>
        </View>
        {quest.isCompleted || skipped ? (
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        ) : (
          <Button label={quest.status === 'rejected' ? 'Continue' : 'Start'} size="sm" onPress={onPress} />
        )}
      </View>
    </Card>
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
  onPress: () => void;
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
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>{title}</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{body}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { alignItems: 'center', borderRadius: 14, flex: 1, paddingVertical: 10 },
  insight: { alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', marginTop: 12, minHeight: 48, paddingTop: 8 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  chips: { gap: 8 },
  iconTile: { alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { borderCurve: 'continuous', borderRadius: 18, flexBasis: '47%', flexGrow: 1, padding: 16 },
});
