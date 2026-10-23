import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScrollAwareTabBar, useTabBarInset } from '../../../components/navigation/CustomTabBar';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { getLevelDefinition } from '../../../domain/game/gameCatalogService';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import type { ProductExperience } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';

type Shortcut = { icon: keyof typeof Ionicons.glyphMap; label: string; route: Href };

/** Four shortcuts per experience — the health tools that matter most for it. */
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

const today = () => new Date().toISOString().split('T')[0];

/**
 * Home (master spec §2.5): immediately useful — today's check-in, ALL daily quests,
 * personal roadmap progress, a rest option, and the health shortcuts relevant to this person.
 * Every value comes from their own records; nothing is shown that they didn't create.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  const { user, cycleData, checkInHistory, streak, level, quests, onboarding, xp, coins, dailyPoints, dailyPointsTarget, dailyGoalReached } = useRootStore(
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
    })),
  );

  const todaysCheckIn = checkInHistory.find((c) => c.date === today());
  const latest = checkInHistory[0];
  const recommendation = evaluateDeterministicRoutine({
    energy: latest?.energy ?? 5,
    mood: latest?.mood ?? 5,
    stress: latest?.stress ?? 5,
    experience,
  });
  const questsDone = quests.filter((q) => q.isCompleted).length;
  const activeQuests = quests.filter((q) => !q.isCompleted && q.status !== 'skipped' && q.status !== 'replaced');
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

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={dateLabel}
          title={name ? `${greeting()},\n${name}` : greeting()}
          subtitle="Your sanctuary dashboard"
          rightAction={
            <PressableScale
              onPress={() => router.push('/(app)/(tabs)/settings')}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              style={[styles.round, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons name="person-outline" size={20} color={colors.text.primary} />
            </PressableScale>
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
        {/* Roadmap & Level Progress */}
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

        {/* Today's check-in */}
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
              </>
            ) : (
              <>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>How are you today?</Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  A one-minute check-in tunes today's tasks to how you actually feel.
                </Text>
                <Button label="Check in" onPress={() => router.push('/(app)/check-in')} style={{ marginTop: spacing.md }} />
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
                  <Text style={[typography.label, { color: colors.text.muted }]}>Cycle</Text>
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

        {/* ALL Today's Quests — not just one */}
        <Animated.View entering={fade(3)}>
          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <Text style={[typography.label, { color: colors.text.muted }]}>Today's quests</Text>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {questsDone}/{quests.length} done
            </Text>
          </View>

          {activeQuests.length > 0 ? (
            activeQuests.map((quest, idx) => (
              <Card
                key={quest.id}
                onPress={() => router.push('/(app)/(tabs)/today')}
                style={{ marginBottom: spacing.sm, padding: spacing.md }}
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
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={[styles.flex, { marginLeft: 12 }]}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={1}>
                      {quest.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={1}>
                      {quest.durationMinutes} min · +{quest.taskPoints ?? 10} pts
                    </Text>
                  </View>
                  <Badge label={quest.isCompleted ? 'Done' : 'Go'} variant={quest.isCompleted ? 'success' : 'primary'} />
                </View>
              </Card>
            ))
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
        </Animated.View>

        {/* Health shortcuts relevant to this experience */}
        <Animated.View entering={fade(4)}>
          <Text style={[typography.label, styles.section, { color: colors.text.muted }]}>Your tools</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  divider: { width: 1, height: 24, opacity: 0.5 },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
  questIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  round: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  section: { marginBottom: 10, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
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
