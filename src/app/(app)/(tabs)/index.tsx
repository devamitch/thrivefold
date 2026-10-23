import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScrollAwareTabBar, useTabBarInset } from '../../../components/navigation/CustomTabBar';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { TaskVerificationModal } from '../../../components/ui/TaskVerificationModal';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { computeInsights, recentLoad } from '../../../domain/ai/insights';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { getLevelDefinition } from '../../../domain/game/gameCatalogService';
import type { CalendarEvent } from '../../../domain/calendar/universalCalendarEngine';
import type { Quest } from '../../../stores/slices/questSlice';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import type { ProductExperience } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';

type Shortcut = { icon: keyof typeof Ionicons.glyphMap; label: string; route: Href };

/** Health tools that matter most per experience */
const SHORTCUTS: Record<ProductExperience, Shortcut[]> = {
  women_health: [
    { icon: 'water-outline', label: 'Cycle', route: '/(app)/health/cycle' },
    { icon: 'pulse-outline', label: 'Symptoms', route: '/(app)/health/symptoms' },
    { icon: 'moon-outline', label: 'Sleep', route: '/(app)/health/sleep' },
    { icon: 'book-outline', label: 'Journal', route: '/(app)/journal' },
  ],
  men_health: [
    { icon: 'body-outline', label: 'Mobility', route: '/(app)/health/men' },
    { icon: 'moon-outline', label: 'Sleep', route: '/(app)/health/sleep' },
    { icon: 'happy-outline', label: 'Mood', route: '/(app)/health/mood' },
    { icon: 'book-outline', label: 'Journal', route: '/(app)/journal' },
  ],
  pride_wellbeing: [
    { icon: 'heart-outline', label: 'Self-care', route: '/(app)/health/pride' },
    { icon: 'happy-outline', label: 'Mood', route: '/(app)/health/mood' },
    { icon: 'moon-outline', label: 'Sleep', route: '/(app)/health/sleep' },
    { icon: 'book-outline', label: 'Journal', route: '/(app)/journal' },
  ],
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const today = () => formatLocalDate(new Date());

type QuestCategoryFilter = 'all' | 'physical' | 'mind' | 'rhythm' | 'nutrition';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  const {
    user,
    cycleData,
    checkInHistory,
    streak,
    level,
    quests,
    onboarding,
    xp,
    coins,
    dailyPoints,
    dailyPointsTarget,
    dailyGoalReached,
    dailyAssignments,
    completeQuest,
    verifyAndCompleteTask,
    showToast,
  } = useRootStore(
    useShallow((s) => ({
      user: s.user,
      cycleData: s.cycleData,
      checkInHistory: s.checkInHistory,
      streak: s.currentStreak,
      level: s.level,
      quests: s.todayQuests,
      onboarding: s.onboarding,
      xp: s.xp,
      coins: s.coins,
      dailyPoints: s.dailyPoints,
      dailyPointsTarget: s.dailyPointsTarget,
      dailyGoalReached: s.dailyGoalReached,
      dailyAssignments: s.dailyAssignments,
      completeQuest: s.completeQuest,
      verifyAndCompleteTask: s.verifyAndCompleteTask,
      showToast: s.showToast,
    })),
  );

  const [questFilter, setQuestFilter] = useState<QuestCategoryFilter>('all');
  const [selectedQuestForModal, setSelectedQuestForModal] = useState<Quest | null>(null);
  const [showClearedQuests, setShowClearedQuests] = useState(false);

  const todaysCheckIn = checkInHistory.find((c) => c.date === today());
  const latest = checkInHistory[0];
  const load = useMemo(() => recentLoad(checkInHistory, today()), [checkInHistory]);
  // The most actionable pattern from the person's own check-ins, if there is one yet.
  const topInsight = useMemo(
    () =>
      computeInsights({
        checkIns: checkInHistory,
        periods: cycleData?.periodHistory ?? [],
        today: today(),
      }).find((i) => i.kind !== 'consistency'),
    [checkInHistory, cycleData],
  );
  const recommendation = evaluateDeterministicRoutine({
    energy: latest?.energy ?? 5,
    mood: latest?.mood ?? 5,
    stress: latest?.stress ?? 5,
    experience,
    recentLoad: load,
  });

  const questsDone = quests.filter((q) => q.isCompleted).length;
  const activeQuests = useMemo(
    () => quests.filter((q) => !q.isCompleted && q.status !== 'skipped' && q.status !== 'replaced'),
    [quests]
  );
  const completedQuests = useMemo(
    () => quests.filter((q) => q.isCompleted),
    [quests]
  );

  const filteredQuests = useMemo(() => {
    return activeQuests.filter((q) => {
      if (questFilter === 'all') return true;
      if (questFilter === 'physical') return q.category === 'movement' || q.category === 'mens_vitality';
      if (questFilter === 'mind') return q.category === 'mindfulness' || q.category === 'breathing';
      if (questFilter === 'rhythm') return q.category === 'sleep' || q.category === 'cycle_sync' || q.category === 'routine';
      if (questFilter === 'nutrition') return q.category === 'nutrition';
      return true;
    });
  }, [activeQuests, questFilter]);

  const name = user?.pseudonym && !['Friend', 'Guest'].includes(user.pseudonym) ? user.pseudonym : null;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const levelDef = useMemo(() => getLevelDefinition(level), [level]);

  const cycle =
    experience === 'women_health' && cycleData
      ? getCyclePredictions(cycleData.lastPeriodDate, cycleData.cycleLengthDays, cycleData.periodLengthDays)
      : null;
  const daysToPeriod = cycle
    ? Math.max(0, Math.ceil((new Date(cycle.nextPeriodDate).getTime() - Date.now()) / 86_400_000))
    : null;

  const fade = (i: number) => FadeInDown.delay(40 * i).duration(320);
  const pointsPct = Math.min(100, (dailyPoints / Math.max(1, dailyPointsTarget)) * 100);

  const SPACES = [
    {
      title: 'Cycle Sanctuary',
      subtitle: 'Clinical & Hormonal Intelligence',
      desc: 'Real period logging & cycle phase tracking',
      icon: 'water-outline' as const,
      route: '/(app)/health/cycle' as const,
      color: colors.primary,
    },
    {
      title: 'Sealed Wax Letters',
      subtitle: 'Slow Postal Correspondence',
      desc: 'Paced distance-delayed reflection cards',
      icon: 'mail-outline' as const,
      route: '/(app)/letters' as const,
      color: colors.accent,
    },
    {
      title: 'Mind Refreshers',
      subtitle: 'Cognitive Micro-Games',
      desc: 'Somatic grounding & restorative focus',
      icon: 'game-controller-outline' as const,
      route: '/(app)/games' as const,
      color: '#6E7781',
    },
    {
      title: 'Personal Roadmap',
      subtitle: 'Phased Journey & Milestones',
      desc: 'Level milestones, badges & unlocks',
      icon: 'trail-sign-outline' as const,
      route: '/(app)/(tabs)/progress' as const,
      color: colors.primary,
    },
  ];

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={dateLabel}
          title={name ? `${greeting()},\n${name}` : greeting()}
          subtitle="Your sanctuary dashboard"
          rightAction={
            <View style={styles.headerActions}>
              <PressableScale
                onPress={() => router.push('/(app)/(tabs)/progress')}
                style={[styles.streakPill, { backgroundColor: colors.surface1 }]}
                accessibilityRole="button"
                accessibilityLabel={`Streak ${streak} days`}
              >
                <Ionicons name="flame" size={16} color={colors.accent} />
                <Text style={[typography.captionBold, { color: colors.accent, marginLeft: 4 }]}>
                  {streak}d
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => router.push('/(app)/calendar')}
                accessibilityRole="button"
                accessibilityLabel="Calendar"
                style={[styles.round, { backgroundColor: colors.surface1 }]}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.text.primary} />
              </PressableScale>
              <PressableScale
                onPress={() => router.push('/(app)/(tabs)/settings')}
                accessibilityRole="button"
                accessibilityLabel="Profile"
                style={[styles.round, { backgroundColor: colors.surface1 }]}
              >
                <Ionicons name="person-outline" size={18} color={colors.text.primary} />
              </PressableScale>
            </View>
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Roadmap & Level Progress Card */}
      <Animated.View entering={fade(0)}>
        <Card style={{ marginTop: spacing.md, padding: spacing.base }}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                CHAPTER {levelDef.chapterNumber} · {levelDef.arc.toUpperCase()}
              </Text>
              <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                {levelDef.title}
              </Text>
            </View>
            <Badge label={`Lvl ${level}`} variant="primary" />
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: dailyGoalReached ? colors.success : colors.primary,
                  width: `${pointsPct}%`,
                },
              ]}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
            <View style={styles.statItem}>
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>{dailyPoints}/{dailyPointsTarget}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Points</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typography.subbodyBold, { color: colors.accent }]}>{streak}d</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Streak</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typography.subbodyBold, { color: colors.success }]}>{xp}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>XP</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{coins}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Coins</Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Today's check-in / Wellness Focus Card */}
      <Animated.View entering={fade(1)}>
        <Card style={{ marginTop: spacing.md, padding: spacing.base }}>
          {todaysCheckIn ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Today you feel</Text>
                <Text
                  onPress={() => router.push('/(app)/check-in')}
                  style={[typography.subbodyBold, { color: colors.primary }]}
                  accessibilityRole="button"
                >
                  Update
                </Text>
              </View>
              <View style={[styles.metrics, { marginTop: spacing.md }]}>
                {[
                  ['Energy', todaysCheckIn.energy],
                  ['Mood', todaysCheckIn.mood],
                  ['Stress', todaysCheckIn.stress],
                ].map(([label, value]) => (
                  <View key={label} style={[styles.metric, { backgroundColor: colors.surface1 }]}>
                    <Text style={[typography.heading, { color: colors.text.primary }]}>{value}</Text>
                    <Text style={[typography.caption, { color: colors.text.muted }]}>{label} /10</Text>
                  </View>
                ))}
              </View>
              {topInsight ? (
                <Pressable
                  onPress={() => router.push('/(app)/ai')}
                  accessibilityRole="button"
                  accessibilityLabel={`Your pattern: ${topInsight.title}`}
                  style={[styles.rowBetween, { marginTop: spacing.md, minHeight: 44 }]}
                >
                  <Ionicons name="analytics-outline" size={18} color={colors.primary} />
                  <Text style={[typography.subbody, { color: colors.text.primary, flex: 1, marginLeft: 8 }]} numberOfLines={2}>
                    {topInsight.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </Pressable>
              ) : null}
            </>
          ) : (
            <>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>Daily Focus & Rhythm</Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                A one-minute check-in tunes today's tasks to your actual somatic energy and focus.
              </Text>
              <Button label="One-Tap Check In" onPress={() => router.push('/(app)/check-in')} style={{ marginTop: spacing.md }} />
            </>
          )}
        </Card>
      </Animated.View>

      {/* Experience card: cycle for women's health */}
      {experience === 'women_health' && (
        <Animated.View entering={fade(2)}>
          <Card onPress={() => router.push('/(app)/health/cycle')} style={{ marginTop: spacing.md, padding: spacing.base }}>
            <View style={styles.rowBetween}>
              <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="water-outline" size={20} color={colors.primary} />
              </View>
              <View style={[styles.flex, { marginLeft: 12 }]}>
                <Text style={[typography.label, { color: colors.text.muted }]}>Cycle Rhythm</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
                  {cycle
                    ? `Day ${cycle.currentPhase.day} · ${cycle.currentPhase.label} phase`
                    : 'Set up cycle tracking'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {cycle ? `Next period in about ${daysToPeriod} days (estimate)` : 'Add your last period date'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Experience card: Men's Health Focus */}
      {experience === 'men_health' && (
        <Animated.View entering={fade(2)}>
          <Card onPress={() => router.push('/(app)/health/men')} style={{ marginTop: spacing.md, padding: spacing.base }}>
            <View style={styles.rowBetween}>
              <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="barbell-outline" size={20} color={colors.primary} />
              </View>
              <View style={[styles.flex, { marginLeft: 12 }]}>
                <Text style={[typography.label, { color: colors.text.muted }]}>Men's Vitality</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
                  Mobility, Conditioning & Recovery
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Postural decompression, recovery readiness, pelvic floor
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Experience card: Pride Wellbeing Focus */}
      {experience === 'pride_wellbeing' && (
        <Animated.View entering={fade(2)}>
          <Card onPress={() => router.push('/(app)/health/pride')} style={{ marginTop: spacing.md, padding: spacing.base }}>
            <View style={styles.rowBetween}>
              <View style={[styles.iconTile, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="heart-outline" size={20} color={colors.primary} />
              </View>
              <View style={[styles.flex, { marginLeft: 12 }]}>
                <Text style={[typography.label, { color: colors.text.muted }]}>Affirming Care</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
                  Grounding, Hormones & Reflections
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Private self-care routine and identity-safe tracking
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* MULTI-QUEST SECTION */}
      <Animated.View entering={fade(3)}>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={[typography.label, { color: colors.text.muted }]}>Daily Quests</Text>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {questsDone}/{quests.length} done
          </Text>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {(
            [
              ['all', 'All'],
              ['physical', 'Physical'],
              ['mind', 'Mind'],
              ['rhythm', 'Rhythm'],
              ['nutrition', 'Nutrition'],
            ] as const
          ).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={questFilter === key}
              onPress={() => setQuestFilter(key)}
            />
          ))}
        </ScrollView>

        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest) => (
            <Card
              key={quest.id}
              onPress={() => setSelectedQuestForModal(quest)}
              style={{ marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.surface }}
            >
              <View style={styles.rowBetween}>
                <View style={[styles.questIcon, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons
                    name={
                      quest.category === 'movement' || quest.category === 'mens_vitality'
                        ? 'body-outline'
                        : quest.category === 'mindfulness' || quest.category === 'breathing'
                        ? 'leaf-outline'
                        : quest.category === 'sleep'
                        ? 'moon-outline'
                        : quest.category === 'nutrition'
                        ? 'nutrition-outline'
                        : 'ribbon-outline'
                    }
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={[styles.flex, { marginLeft: 12, marginRight: 8 }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={1}>
                    {quest.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Badge label={`+${quest.xpReward} XP`} variant="primary" />
                    <Badge
                      label={
                        quest.difficulty === 'gentle'
                          ? 'Gentle'
                          : quest.difficulty === 'advanced'
                          ? 'Core'
                          : 'Standard'
                      }
                      variant="neutral"
                    />
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      {quest.durationMinutes}m
                    </Text>
                  </View>
                </View>
                <Button
                  label="Verify & Claim"
                  size="sm"
                  onPress={() => setSelectedQuestForModal(quest)}
                />
              </View>
            </Card>
          ))
        ) : activeQuests.length > 0 ? (
          <Card style={{ padding: spacing.base, marginBottom: spacing.sm }}>
            <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center' }]}>
              No quests in this category right now.
            </Text>
          </Card>
        ) : questsDone > 0 ? (
          <Card style={{ padding: spacing.base }}>
            <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm, textAlign: 'center' }]}>
                All quests complete!
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, textAlign: 'center' }]}>
                {dailyGoalReached ? 'Daily goal reached — incredible consistency.' : 'Great progress. Keep the momentum.'}
              </Text>
            </View>
          </Card>
        ) : (
          <Card style={{ padding: spacing.base }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {recommendation.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              {recommendation.description}
            </Text>
            {recommendation.taskId === 'rec_recovery_reset' ? (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
                {recommendation.aiExplanation.text}
              </Text>
            ) : null}
            <View style={[styles.actions, { marginTop: spacing.md }]}>
              <Button label="Start" onPress={() => router.push('/(app)/(tabs)/today')} style={styles.flex} />
              <Button
                label="Arcade"
                variant="outline"
                onPress={() => router.push('/(app)/games')}
                style={styles.flex}
              />
            </View>
          </Card>
        )}

        {/* Completed Quests: subtle cleared state */}
        {completedQuests.length > 0 && (
          <View style={{ marginTop: spacing.xs }}>
            <Pressable
              onPress={() => setShowClearedQuests((v) => !v)}
              style={[styles.clearedToggle, { backgroundColor: colors.surface1 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                  Cleared Today ({completedQuests.length})
                </Text>
              </View>
              <Ionicons
                name={showClearedQuests ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.text.muted}
              />
            </Pressable>
            {showClearedQuests &&
              completedQuests.map((q) => (
                <View
                  key={q.id}
                  style={[
                    styles.clearedItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color={colors.success} />
                  <Text
                    style={[
                      typography.caption,
                      styles.flex,
                      { color: colors.text.secondary, textDecorationLine: 'line-through', marginLeft: 8 },
                    ]}
                    numberOfLines={1}
                  >
                    {q.title}
                  </Text>
                  <Badge label={`+${q.xpReward} XP Claimed`} variant="neutral" />
                </View>
              ))}
          </View>
        )}
      </Animated.View>

      {/* INTERCONNECTED SPACES HUB */}
      <Animated.View entering={fade(4)}>
        <Text style={[typography.label, styles.section, { color: colors.text.muted }]}>
          Interconnected Spaces
        </Text>
        <View style={styles.spacesGrid}>
          {SPACES.map((sp) => (
            <Card
              key={sp.title}
              onPress={() => router.push(sp.route)}
              style={{ marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.surface }}
            >
              <View style={styles.rowBetween}>
                <View style={[styles.spaceIconTile, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name={sp.icon} size={22} color={sp.color} />
                </View>
                <View style={[styles.flex, { marginLeft: 12 }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {sp.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {sp.desc}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </Card>
          ))}
        </View>

        {/* Health Shortcuts */}
        <Text style={[typography.label, styles.sectionSmall, { color: colors.text.muted }]}>
          Health Tools
        </Text>
        <View style={styles.grid}>
          {SHORTCUTS[experience].map((s) => (
            <PressableScale
              key={s.label}
              onPress={() => router.push(s.route)}
              accessibilityRole="button"
              accessibilityLabel={s.label}
              style={[styles.tool, { backgroundColor: colors.surface }]}
            >
              <Ionicons name={s.icon} size={22} color={colors.primary} />
              <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 8 }]}>{s.label}</Text>
            </PressableScale>
          ))}
        </View>
        <PressableScale
          onPress={() => router.push('/(app)/learn')}
          accessibilityRole="button"
          style={[styles.learn, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="school-outline" size={18} color={colors.text.secondary} />
          <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 10 }]}>
            Learn the basics — plain-language health guides
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
        </PressableScale>
      </Animated.View>

      {/* Task Verification Modal */}
      <TaskVerificationModal
        visible={Boolean(selectedQuestForModal)}
        event={
          selectedQuestForModal
            ? {
                id: selectedQuestForModal.id,
                title: selectedQuestForModal.title,
                category: (selectedQuestForModal.category as any) ?? 'routine',
                privacy: 'private',
                date: today(),
                status: selectedQuestForModal.isCompleted ? 'completed' : 'recorded',
                description: selectedQuestForModal.description,
                kind: 'task',
                metadata: {
                  taskId: selectedQuestForModal.taskId,
                },
              }
            : null
        }
        onClose={() => setSelectedQuestForModal(null)}
        onVerifyAndComplete={(event, opts) => {
          if (selectedQuestForModal) {
            const targetQuest = selectedQuestForModal;
            const assignment = dailyAssignments.find(
              (a) => a.taskId === targetQuest.taskId || a.assignmentId === targetQuest.id
            );
            if (assignment) {
              verifyAndCompleteTask(assignment.assignmentId, {
                assignmentId: assignment.assignmentId,
                elapsedSeconds: opts.elapsedSeconds,
                notes: opts.notes,
                selfDeclaredHonest: opts.selfDeclaredHonest,
              });
            } else {
              completeQuest(targetQuest.id);
            }
            showToast({
              type: 'success',
              message: `+${targetQuest.xpReward} XP earned! Quest verified.`,
            });
          }
          setSelectedQuestForModal(null);
        }}
        onSkip={() => {
          setSelectedQuestForModal(null);
          showToast({ type: 'info', message: 'Quest skipped' });
        }}
        onReplaceWithSpecialQuest={() => {
          setSelectedQuestForModal(null);
          router.push('/(app)/(tabs)/today');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  categoryContent: { gap: 8, paddingBottom: 4 },
  categoryScroll: { marginBottom: 12 },
  clearedItem: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearedToggle: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  divider: { width: 1, height: 24, opacity: 0.5 },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  iconTile: { alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  learn: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    flexDirection: 'row',
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  metric: { alignItems: 'center', borderRadius: 14, flex: 1, paddingVertical: 12 },
  metrics: { flexDirection: 'row', gap: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  questIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  round: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  section: { marginBottom: 12, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionSmall: { marginBottom: 10, marginTop: 20 },
  spaceIconTile: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  spacesGrid: { gap: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  streakPill: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 10,
  },
  tool: {
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
  },
});
