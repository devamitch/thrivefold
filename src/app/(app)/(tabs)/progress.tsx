import { SquircleSurface } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { ProgressionPanel } from '../../../components/game/ProgressionPanel';
import { SETUP_REWARDS } from '../../../domain/game/setupProfile';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

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

  const [activeTab, setActiveTab] = useState<'roadmap' | 'badges'>('roadmap');

  const currentStreak = useRootStore((s) => s.currentStreak);
  const daysActive = useRootStore((s) => s.completedCheckInDaysCount);
  const journalCount = useRootStore((s) => s.journalEntries.length);
  const { level: LEVEL, questsCompleted, setupDone, movementCount, connected } = useRootStore(
    useShallow((s) => ({
      level: s.level,
      questsCompleted: s.questsCompleted,
      setupDone: s.rewardLedger.filter((e) => e.kind === 'setup_reward').length,
      movementCount: s.workoutSessions.length + s.activityLogs.length + s.poseSessions.length,
      connected: Boolean(s.healthConnect) || s.deviceReadings.length > 0,
    })),
  );

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
    >
      <SquircleSurface style={{ paddingBottom: spacing.xxl }}>
        <Card onPress={() => router.push('/(app)/roadmap' as Href)} variant="tinted" style={{ padding: spacing.base, marginTop: spacing.sm }}>
          <SquircleSurface style={styles.rowBetween}>
            <Ionicons name="map-outline" size={22} color={colors.primary} />
            <SquircleSurface style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Your roadmap</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                20 chapters, their stages, and where you are now
              </Text>
            </SquircleSurface>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </SquircleSurface>
        </Card>
        <ProgressionPanel />

        {/* View Switcher Tabs (Roadmap vs Badges) */}
        <SquircleSurface style={[styles.tabBar, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
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
        </SquircleSurface>

        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <Animated.View entering={FadeIn.duration(180)}>
            {/* Roadmap Progress Summary */}
            <Card style={[styles.roadmapBanner, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
              <SquircleSurface style={styles.rowBetween}>
                <SquircleSurface>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Milestones
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {completedStepsCount} of {ROADMAP_STEPS.length} reached
                  </Text>
                </SquircleSurface>
                <Badge label={`${roadmapPct}% Complete`} variant="primary" />
              </SquircleSurface>
              <SquircleSurface style={[styles.xpTrack, { backgroundColor: colors.surface1, marginTop: 12 }]}>
                <SquircleSurface
                  style={[
                    styles.xpFill,
                    { backgroundColor: colors.accent, width: `${roadmapPct}%` },
                  ]}
                />
              </SquircleSurface>
            </Card>

            {/* Interactive Timeline Steps */}
            <SquircleSurface style={styles.timelineContainer}>
              {ROADMAP_STEPS.map((step, idx) => {
                const isComp = step.isCompleted(stats);
                const isUnl = step.isUnlocked(stats);

                return (
                  <SquircleSurface key={step.id} style={styles.timelineItem}>
                    {/* Left node indicator & vertical connecting line */}
                    <SquircleSurface style={styles.nodeColumn}>
                      <SquircleSurface
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
                      </SquircleSurface>
                      {idx < ROADMAP_STEPS.length - 1 && (
                        <SquircleSurface
                          style={[
                            styles.nodeLine,
                            {
                              backgroundColor: isComp ? colors.success : colors.surface1,
                            },
                          ]}
                        />
                      )}
                    </SquircleSurface>

                    {/* Right Step Card */}
                    <SquircleSurface style={{ flex: 1, paddingBottom: 16 }}>
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
                        <SquircleSurface style={styles.rowBetween}>
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
                        </SquircleSurface>

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
                          <SquircleSurface style={styles.stepCtaRow}>
                            <Text style={[typography.captionBold, { color: colors.primary }]}>
                              Go
                            </Text>
                            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                          </SquircleSurface>
                        )}
                      </Card>
                    </SquircleSurface>
                  </SquircleSurface>
                );
              })}
            </SquircleSurface>
          </Animated.View>
        )}

        {/* Stats View */}
        {activeTab === 'badges' && (
          <Animated.View entering={FadeIn.duration(180)}>
            {/* Stats Grid */}
            <SquircleSurface style={[styles.statsGrid, { marginTop: spacing.md }]}>
              <SquircleSurface style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <SquircleSurface style={[styles.statIconWrap, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                </SquircleSurface>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {questsCompleted}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Quests Finished
                </Text>
              </SquircleSurface>

              <SquircleSurface style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <SquircleSurface style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="flame-outline" size={20} color={colors.accent} />
                </SquircleSurface>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {currentStreak}d
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Active Streak
                </Text>
              </SquircleSurface>

              <SquircleSurface style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <SquircleSurface style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </SquircleSurface>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {daysActive}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Days Active
                </Text>
              </SquircleSurface>

              <SquircleSurface style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <SquircleSurface style={[styles.statIconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.accent} />
                </SquircleSurface>
                <Text style={[typography.display, { color: colors.text.primary, marginTop: 10, fontSize: 24 }]}>
                  {journalCount}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Journal entries
                </Text>
              </SquircleSurface>
            </SquircleSurface>

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
                  <SquircleSurface style={styles.achRow}>
                    <SquircleSurface style={[styles.achIcon, { backgroundColor: colors.primaryAlpha }]}>
                      <Ionicons name={ach.icon} size={20} color={colors.primary} />
                    </SquircleSurface>
                    <SquircleSurface style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{ach.title}</Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {ach.phase}
                      </Text>
                    </SquircleSurface>
                    <Badge label="Reached" variant="success" />
                  </SquircleSurface>
                </Card>
              ))
            )}
          </Animated.View>
        )}
      </SquircleSurface>
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
