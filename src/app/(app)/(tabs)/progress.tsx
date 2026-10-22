import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow, xpForLevel } from '../../../stores/useRootStore';
import {
  useScrollAwareTabBar,
  useTabBarInset,
} from '../../../components/navigation/CustomTabBar';

const ACHIEVEMENTS = [
  { id: 'first_quest', icon: 'flash-outline' as const, title: 'First Quest', desc: 'Completed your very first daily quest' },
  { id: 'three_day_streak', icon: 'flame-outline' as const, title: '3-Day Consistency', desc: 'Logged and completed three consecutive days' },
  { id: 'ai_vault', icon: 'shield-checkmark-outline' as const, title: 'Private Vault', desc: 'Audited and verified your on-device records' },
  { id: 'letters', icon: 'mail-outline' as const, title: 'Reflective Notes', desc: 'Saved your first private health reflection' },
  { id: 'seven_day_streak', icon: 'diamond-outline' as const, title: '7-Day Steadiness', desc: 'Seven days of sustained healthy momentum' },
  { id: 'circles', icon: 'people-outline' as const, title: 'Inner Circle', desc: 'Connected in your private encrypted health circle' },
];

export default function ProgressScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { onScroll, scrollEventThrottle } = useScrollAwareTabBar();

  const currentStreak = useRootStore((s) => s.currentStreak);
  const daysActive = useRootStore((s) => s.completedCheckInDaysCount);
  const journalCount = useRootStore((s) => s.journalEntries.length);
  const { xp: LEVEL_XP, level: LEVEL, questsCompleted, achievements } = useRootStore(
    useShallow((s) => ({ xp: s.xp, level: s.level, questsCompleted: s.questsCompleted, achievements: s.achievements })),
  );
  const NEXT_LEVEL_XP = xpForLevel(LEVEL);
  const unlocked = new Set(achievements);
  const xpPct = Math.min((LEVEL_XP / NEXT_LEVEL_XP) * 100, 100);

  // Experience-specific metrics labelling
  const isMen = experience === 'men_health';
  const isPride = experience === 'pride_wellbeing';

  const statCards = [
    {
      label: isMen ? 'Workouts & Quests' : isPride ? 'Self-Care Quests' : 'Quests Done',
      value: String(questsCompleted),
      icon: 'checkmark-circle-outline' as const,
      color: colors.primary,
    },
    {
      label: isMen ? 'Discipline Streak' : 'Daily Streak',
      value: `${currentStreak}d`,
      icon: 'flame-outline' as const,
      color: colors.accent,
    },
    {
      label: isMen ? 'Recovery Check-ins' : 'Days Checked In',
      value: String(daysActive),
      icon: 'calendar-outline' as const,
      color: colors.primary,
    },
    {
      label: isMen ? 'Training & Log Notes' : 'Journal Entries',
      value: String(journalCount),
      icon: 'book-outline' as const,
      color: colors.text.secondary,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: tabBarInset + spacing.xl,
            paddingHorizontal: spacing.base,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Header - Flat, Sophisticated, Neev-Inspired */}
        <View style={styles.header}>
          <Text style={[typography.label, { color: colors.primary }]}>
            {isMen ? 'MOMENTUM & VITALITY' : isPride ? 'WELLBEING & AFFIRMATION' : 'YOUR JOURNEY'}
          </Text>
          <Text style={[typography.display, { color: colors.text.primary, marginTop: 4 }]}>
            Progress & Milestones
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
            {isMen
              ? 'Tracking discipline, physical endurance, and recovery data.'
              : isPride
              ? 'Tracking self-care, private reflections, and personal growth.'
              : 'Holistic health progress, rhythm consistency, and milestones.'}
          </Text>
        </View>

        {/* Level & XP Overview Card (Zero borders, zero shadows) */}
        <Animated.View entering={FadeInDown.delay(40).duration(280)}>
          <Card style={[styles.levelCard, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="flash-outline" size={22} color={colors.primary} />
                <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>{LEVEL}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    {isMen ? `Tier ${LEVEL} Conditioning` : `Level ${LEVEL} Thriver`}
                  </Text>
                  <Badge label={`${Math.round(xpPct)}%`} variant="primary" />
                </View>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 3 }]}>
                  {LEVEL_XP} / {NEXT_LEVEL_XP} XP to Level {LEVEL + 1}
                </Text>
                <View style={[styles.xpTrack, { backgroundColor: colors.surface1, marginTop: 10 }]}>
                  <View
                    style={[
                      styles.xpFill,
                      { backgroundColor: colors.primary, width: `${xpPct}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Stats Grid - Flat, Elegant Squircle Cards */}
        <Animated.View entering={FadeInDown.delay(80).duration(280)}>
          <View style={[styles.statsGrid, { marginTop: spacing.md }]}>
            {statCards.map((s) => (
              <View
                key={s.label}
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: colors.surface1 },
                  ]}
                >
                  <Ionicons name={s.icon} size={20} color={s.color} />
                </View>
                <Text
                  style={[
                    typography.display,
                    { color: colors.text.primary, marginTop: 10, fontSize: 24 },
                  ]}
                >
                  {s.value}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Consistency Overview Banner (No Gradients) */}
        <Animated.View entering={FadeInDown.delay(120).duration(280)}>
          <View style={[styles.streakBanner, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
            <View style={[styles.fireIconWrap, { backgroundColor: colors.surface }]}>
              <Ionicons name="flame" size={24} color={colors.accent} />
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                {currentStreak} Day Consistency Streak
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Sustainable health habits built one day at a time. Missed days never penalize your historical record.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Milestones & Badges - Unfolded and Clear */}
        <Text
          style={[
            typography.subheading,
            {
              color: colors.text.primary,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Milestones & Badges
        </Text>
        {ACHIEVEMENTS.map((ach, idx) => (
          <Animated.View key={ach.id} entering={FadeInDown.delay(140 + idx * 30).duration(240)}>
            <Card
              style={[
                styles.achCard,
                {
                  opacity: unlocked.has(ach.id) ? 1 : 0.65,
                  marginBottom: 8,
                },
              ]}
              variant={unlocked.has(ach.id) ? 'surface' : 'surface1'}
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
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { marginBottom: 8 },
  levelCard: {
    borderRadius: 20,
    padding: 18,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.3%',
    borderRadius: 18,
    padding: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
  fireIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
