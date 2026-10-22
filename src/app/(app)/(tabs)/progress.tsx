import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  { id: 'first_quest', icon: '⚡', title: 'First Quest', desc: 'Completed your very first task' },
  { id: 'three_day_streak', icon: '🔥', title: '3-Day Streak', desc: 'Checked in 3 days in a row' },
  { id: 'ai_vault', icon: '🛡️', title: 'AI Explorer', desc: 'Inspected your on-device AI' },
  { id: 'letters', icon: '✉️', title: 'Pen Pal', desc: 'Sent your first curated letter' },
  { id: 'seven_day_streak', icon: '💎', title: '7-Day Steady', desc: 'Seven consecutive check-ins' },
  { id: 'circles', icon: '🫂', title: 'Circle Member', desc: 'Joined a private support circle' },
];

export default function ProgressScreen() {
  const { colors, typography, spacing } = useTheme();
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
  const STAT_CARDS = [
    { label: 'Quests Done', value: String(questsCompleted), icon: 'checkmark-circle-outline' as const, color: '#10B981' },
    { label: 'XP Earned', value: String(LEVEL_XP), icon: 'flash-outline' as const, color: '#F59E0B' },
    { label: 'Days Checked In', value: String(daysActive), icon: 'calendar-outline' as const, color: '#3B82F6' },
    { label: 'Journal Entries', value: String(journalCount), icon: 'book-outline' as const, color: '#8B5CF6' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.accent + '14', colors.background]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={{ paddingHorizontal: spacing.base }}>
            <Text style={[typography.label, { color: colors.accent }]}>YOUR JOURNEY</Text>
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
              Progress & Achievements
            </Text>

            {/* Level + XP Card */}
            <View style={[styles.levelCard, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
              <View style={styles.levelRow}>
                <View style={[styles.levelBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={styles.levelEmoji}>⚡</Text>
                  <Text style={[typography.display, { color: colors.primary }]}>{LEVEL}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Level {LEVEL} Thriver
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {LEVEL_XP} / {NEXT_LEVEL_XP} XP to Level {LEVEL + 1}
                  </Text>
                  <View style={[styles.xpTrack, { backgroundColor: colors.primary + '18', marginTop: 10 }]}>
                    <View
                      style={[
                        styles.xpFill,
                        { backgroundColor: colors.primary, width: `${xpPct}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.content, { paddingHorizontal: spacing.base }]}>
          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((s) => (
                <View
                  key={s.label}
                  style={[styles.statCard, { backgroundColor: colors.surface }]}
                >
                  <View
                    style={[
                      styles.statIconWrap,
                      { backgroundColor: s.color + '18' },
                    ]}
                  >
                    <Ionicons name={s.icon} size={20} color={s.color} />
                  </View>
                  <Text
                    style={[
                      typography.display,
                      { color: colors.text.primary, marginTop: 8, fontSize: 26 },
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

          {/* Streak Banner */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '08']}
              style={[styles.streakBanner, { borderColor: colors.primary + '30' }]}
            >
              <Text style={{ fontSize: 36 }}>🔥</Text>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.primary }]}>
                  {currentStreak} Day Streak
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 3 }]}>
                  Keep it going! Miss a day? Your health journey never resets.
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Achievements */}
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
            Achievements
          </Text>
          {ACHIEVEMENTS.map((ach, idx) => (
            <Animated.View key={ach.id} entering={FadeInDown.delay(120 + idx * 30).springify()}>
              <Card
                style={[
                  styles.achCard,
                  { opacity: unlocked.has(ach.id) ? 1 : 0.5 },
                ]}
                variant={unlocked.has(ach.id) ? 'surface' : 'surface1'}
              >
                <View style={styles.achRow}>
                  <View
                    style={[
                      styles.achIcon,
                      {
                        backgroundColor: unlocked.has(ach.id)
                          ? colors.primary + '14'
                          : colors.surface2,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 22 }}>{ach.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[typography.bodyBold, { color: colors.text.primary }]}
                    >
                      {ach.title}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.text.secondary, marginTop: 2 },
                      ]}
                    >
                      {ach.desc}
                    </Text>
                  </View>
                  {unlocked.has(ach.id) ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : (
                    <Ionicons name="lock-closed-outline" size={18} color={colors.text.muted} />
                  )}
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { paddingBottom: 20 },
  levelCard: {
    borderRadius: 20,
    padding: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelEmoji: { fontSize: 16, marginBottom: 2 },
  xpTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: 6,
    borderRadius: 3,
  },
  content: { paddingTop: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 18,
    padding: 14,
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  achCard: {
    marginBottom: 10,
    padding: 14,
  },
  achRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
