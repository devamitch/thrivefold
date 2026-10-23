import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { ProgressionPanel } from '../../../components/game/ProgressionPanel';
import { useTheme } from '../../../theme/useTheme';

interface RoadmapStep {
  id: string;
  stepNumber: number;
  phase: string;
  title: string;
  description: string;
  xpReward: number;
  icon: keyof typeof Ionicons.glyphMap;
  targetRoute?: string;
  isUnlocked: (stats: {
    questsCompleted: number;
    streak: number;
    daysActive: number;
    journalCount: number;
    level: number;
  }) => boolean;
  isCompleted: (stats: {
    questsCompleted: number;
    streak: number;
    daysActive: number;
    journalCount: number;
    level: number;
  }) => boolean;
}

const ROADMAP_STEPS: RoadmapStep[] = [
  // Phase 1: Foundation
  {
    id: 'step_1',
    stepNumber: 1,
    phase: 'Phase 1: Foundation',
    title: 'Identity & Setup',
    description: 'Set your routine, preferences, and private on-device vault.',
    xpReward: 50,
    icon: 'sparkles-outline',
    targetRoute: '/(app)/(tabs)/settings',
    isUnlocked: () => true,
    isCompleted: () => true,
  },
  {
    id: 'step_2',
    stepNumber: 2,
    phase: 'Phase 1: Foundation',
    title: 'First Health Quest',
    description: 'Complete your first verified daily quest and claim your XP.',
    xpReward: 50,
    icon: 'checkmark-circle-outline',
    targetRoute: '/(app)/(tabs)',
    isUnlocked: () => true,
    isCompleted: (s) => s.questsCompleted >= 1,
  },
  {
    id: 'step_3',
    stepNumber: 3,
    phase: 'Phase 1: Foundation',
    title: 'Natural Cycle & Rhythm',
    description: 'Log your first cycle or daily wellness check-in.',
    xpReward: 50,
    icon: 'calendar-outline',
    targetRoute: '/(app)/health/cycle',
    isUnlocked: (s) => s.questsCompleted >= 1,
    isCompleted: (s) => s.daysActive >= 1,
  },
  // Phase 2: Momentum
  {
    id: 'step_4',
    stepNumber: 4,
    phase: 'Phase 2: Momentum',
    title: '3-Day Consistency Streak',
    description: 'Maintain habit momentum for three consecutive active days.',
    xpReward: 100,
    icon: 'flame-outline',
    targetRoute: '/(app)/(tabs)',
    isUnlocked: (s) => s.daysActive >= 1,
    isCompleted: (s) => s.streak >= 3,
  },
  {
    id: 'step_5',
    stepNumber: 5,
    phase: 'Phase 2: Momentum',
    title: 'Private Wax Letter',
    description: 'Seal a private reflection letter with a collectible wax stamp.',
    xpReward: 75,
    icon: 'mail-outline',
    targetRoute: '/(app)/letters',
    isUnlocked: (s) => s.questsCompleted >= 2,
    isCompleted: (s) => s.journalCount >= 1,
  },
  {
    id: 'step_6',
    stepNumber: 6,
    phase: 'Phase 2: Momentum',
    title: 'Mind Calibration Session',
    description: 'Engage with a focus game or mindful breathing puzzle.',
    xpReward: 75,
    icon: 'game-controller-outline',
    targetRoute: '/(app)/games',
    isUnlocked: (s) => s.streak >= 2,
    isCompleted: (s) => s.questsCompleted >= 3,
  },
  // Phase 3: Synchronization
  {
    id: 'step_7',
    stepNumber: 7,
    phase: 'Phase 3: Synchronization',
    title: '7-Day Steadiness',
    description: 'Sustain uninterrupted daily rhythm for a full calendar week.',
    xpReward: 200,
    icon: 'diamond-outline',
    targetRoute: '/(app)/(tabs)',
    isUnlocked: (s) => s.streak >= 3,
    isCompleted: (s) => s.streak >= 7,
  },
  {
    id: 'step_8',
    stepNumber: 8,
    phase: 'Phase 3: Synchronization',
    title: 'Audit AI Memory Vault',
    description: 'Review on-device private memory tokens and verify your safety vault.',
    xpReward: 100,
    icon: 'shield-checkmark-outline',
    targetRoute: '/(app)/ai',
    isUnlocked: (s) => s.streak >= 3,
    isCompleted: (s) => s.level >= 2,
  },
  // Phase 4: Mastery
  {
    id: 'step_9',
    stepNumber: 9,
    phase: 'Phase 4: Mastery',
    title: '21-Day Habit Metamorphosis',
    description: 'Transform daily routines into effortless automatic mastery.',
    xpReward: 500,
    icon: 'ribbon-outline',
    targetRoute: '/(app)/(tabs)',
    isUnlocked: (s) => s.streak >= 7,
    isCompleted: (s) => s.streak >= 21,
  },
];

const ACHIEVEMENTS = [
  { id: 'first_quest', icon: 'flash-outline' as const, title: 'First Quest', desc: 'Completed your very first daily quest' },
  { id: 'three_day_streak', icon: 'flame-outline' as const, title: '3-Day Consistency', desc: 'Logged and completed three consecutive days' },
  { id: 'ai_vault', icon: 'shield-checkmark-outline' as const, title: 'Private Vault', desc: 'Audited and verified your on-device records' },
  { id: 'letters', icon: 'mail-outline' as const, title: 'Reflective Notes', desc: 'Saved your first private health reflection' },
  { id: 'seven_day_streak', icon: 'diamond-outline' as const, title: '7-Day Steadiness', desc: 'Seven days of sustained healthy momentum' },
  { id: 'circles', icon: 'people-outline' as const, title: 'Inner Circle', desc: 'Connected in your private encrypted health circle' },
];

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'badges'>('roadmap');

  const currentStreak = useRootStore((s) => s.currentStreak);
  const daysActive = useRootStore((s) => s.completedCheckInDaysCount);
  const journalCount = useRootStore((s) => s.journalEntries.length);
  const { level: LEVEL, questsCompleted, achievements } = useRootStore(
    useShallow((s) => ({ level: s.level, questsCompleted: s.questsCompleted, achievements: s.achievements })),
  );

  const unlocked = new Set(achievements);

  const stats = {
    questsCompleted,
    streak: currentStreak,
    daysActive,
    journalCount,
    level: LEVEL,
  };

  const isMen = experience === 'men_health';
  const isPride = experience === 'pride_wellbeing';

  const completedStepsCount = ROADMAP_STEPS.filter((s) => s.isCompleted(stats)).length;
  const roadmapPct = Math.round((completedStepsCount / ROADMAP_STEPS.length) * 100);

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow={isMen ? 'MOMENTUM & VITALITY' : isPride ? 'WELLBEING & AFFIRMATION' : 'YOUR JOURNEY'}
          title="Progress & Roadmap"
          subtitle="Explore your personalized growth roadmap, rhythm milestones, and earned badges."
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        <ProgressionPanel />

        {/* View Switcher Tabs (Roadmap vs Badges) */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <Pressable
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
              Personal Roadmap ({roadmapPct}%)
            </Text>
          </Pressable>

          <Pressable
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
              Badges & Stats
            </Text>
          </Pressable>
        </View>

        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <Animated.View entering={FadeInDown.duration(280)}>
            {/* Roadmap Progress Summary */}
            <Card style={[styles.roadmapBanner, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Roadmap Milestone Progress
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {completedStepsCount} of {ROADMAP_STEPS.length} Milestones Cleared
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
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        ) : isUnl ? (
                          <Ionicons name={step.icon} size={14} color="#FFF" />
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
                            router.push(step.targetRoute as any);
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
                            <Badge label="Cleared" variant="success" />
                          ) : isUnl ? (
                            <Badge label={`+${step.xpReward} XP`} variant="primary" />
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
                          {step.description}
                        </Text>

                        {/* Interactive Action CTA */}
                        {isUnl && !isComp && (
                          <View style={styles.stepCtaRow}>
                            <Text style={[typography.captionBold, { color: colors.primary }]}>
                              Complete this milestone
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

        {/* Badges & Stats View */}
        {activeTab === 'badges' && (
          <Animated.View entering={FadeInDown.duration(280)}>
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
                  Saved Letters
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
              Earned Badges & Feats
            </Text>
            {ACHIEVEMENTS.map((ach) => (
              <Card
                key={ach.id}
                style={[
                  styles.achCard,
                  {
                    opacity: unlocked.has(ach.id) ? 1 : 0.65,
                    marginBottom: 8,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View style={styles.achRow}>
                  <View
                    style={[
                      styles.achIcon,
                      {
                        backgroundColor: unlocked.has(ach.id)
                          ? colors.primaryAlpha
                          : colors.surface1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={ach.icon}
                      size={20}
                      color={unlocked.has(ach.id) ? colors.primary : colors.text.muted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {ach.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      {ach.desc}
                    </Text>
                  </View>
                  {unlocked.has(ach.id) ? (
                    <Badge label="Unlocked" variant="success" />
                  ) : (
                    <Badge label="In Progress" variant="neutral" />
                  )}
                </View>
              </Card>
            ))}
          </Animated.View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
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
    borderWidth: 0,
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
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
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
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
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
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
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
