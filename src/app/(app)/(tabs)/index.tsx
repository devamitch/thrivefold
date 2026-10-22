import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollAwareTabBar, useTabBarInset } from '../../../components/navigation/CustomTabBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { PressableScale } from '../../../components/ui/PressableScale';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const PHASE_INFO: Record<string, { color: string; icon: string; bg: string }> = {
  menstrual: { color: '#EF4444', icon: '🌑', bg: '#FEF2F2' },
  follicular: { color: '#10B981', icon: '🌱', bg: '#ECFDF5' },
  ovulatory: { color: '#F59E0B', icon: '☀️', bg: '#FFFBEB' },
  luteal: { color: '#8B5CF6', icon: '🌙', bg: '#F5F3FF' },
};

const QUICK_ACTIONS = [
  {
    id: 'journal',
    icon: 'edit' as const,
    label: 'Journal',
    sub: 'Private reflection',
    route: '/(app)/journal' as any,
  },
  {
    id: 'games',
    icon: 'sliders' as const,
    label: 'Wellness',
    sub: 'Breath & focus',
    route: '/(app)/games' as any,
  },
  {
    id: 'circles',
    icon: 'group' as const,
    label: 'Circles',
    sub: 'Support hubs',
    route: '/(app)/circles' as any,
  },
  {
    id: 'ai',
    icon: 'shieldCheck' as const,
    label: 'AI Vault',
    sub: 'On-device AI',
    route: '/(app)/ai' as any,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { onScroll, scrollEventThrottle } = useScrollAwareTabBar();

  const currentStreak = useRootStore((s) => s.currentStreak);
  const cycleData = useRootStore((s) => s.cycleData);
  const checkInHistory = useRootStore((s) => s.checkInHistory);
  const isSocialPathRevealed = useRootStore((s) => s.isSocialPathRevealed);
  const user = useRootStore((s) => s.user);

  // No check-in yet: the suggestion uses neutral mid-scale inputs and says so, rather
  // than presenting invented readings as the person's own.
  const lastCheckIn = checkInHistory[0];
  const hasCheckIn = Boolean(lastCheckIn);

  const recommendation = evaluateDeterministicRoutine({
    energy: lastCheckIn?.energy ?? 5,
    mood: lastCheckIn?.mood ?? 5,
    stress: lastCheckIn?.stress ?? 5,
    experience,
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const cycle = cycleData
    ? getCyclePredictions(cycleData.lastPeriodDate, cycleData.cycleLengthDays, cycleData.periodLengthDays)
    : null;
  const phase = cycle?.currentPhase.phase ?? 'follicular';
  const phaseStyle = PHASE_INFO[phase] ?? PHASE_INFO.follicular;
  const cycleLength = cycleData?.cycleLengthDays ?? 28;
  const daysToPeriod = cycle
    ? Math.max(0, Math.ceil((new Date(cycle.nextPeriodDate).getTime() - Date.now()) / 86_400_000))
    : null;

  const expMeta = {
    women_health: {
      badge: "Women's Health",
      gradient: [colors.primaryAlpha, 'transparent'] as [string, string],
      icon: '🌸',
    },
    men_health: {
      badge: "Men's Vitality",
      gradient: ['rgba(23,60,74,0.08)', 'transparent'] as [string, string],
      icon: '🌊',
    },
    pride_wellbeing: {
      badge: 'Pride Wellbeing',
      gradient: ['rgba(217,119,6,0.08)', 'transparent'] as [string, string],
      icon: '🏳️‍🌈',
    },
  }[experience];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Hero Header ── */}
        <LinearGradient
          colors={[colors.primary + '18', colors.background]}
          style={[styles.heroGrad, { paddingTop: insets.top + 16 }]}
        >
          <View style={[styles.headerRow, { paddingHorizontal: spacing.base }]}>
            <View style={styles.headerLeft}>
              <Text style={[typography.label, { color: colors.primary }]}>
                {expMeta.icon} {expMeta.badge}
              </Text>
              <Text
                style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}
                numberOfLines={1}
              >
                {getGreeting()},{'\n'}
                {user?.pseudonym ?? 'Seeker'} ✨
              </Text>
            </View>
            <PressableScale
              onPress={() => router.push('/(app)/(tabs)/settings')}
              style={[styles.avatarBtn, { backgroundColor: colors.surface1 }]}
            >
              <Ionicons name="person-outline" size={20} color={colors.text.primary} />
            </PressableScale>
          </View>

          {/* Streak + Level Row */}
          <View
            style={[styles.statsRow, { paddingHorizontal: spacing.base, marginTop: spacing.md }]}
          >
            <View
              style={[
                styles.statPill,
                { backgroundColor: colors.primary + '18', borderColor: colors.primary + '28' },
              ]}
            >
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>{currentStreak}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {' '}
                day streak
              </Text>
            </View>
            <View
              style={[
                styles.statPill,
                { backgroundColor: colors.surface1, borderColor: colors.border },
              ]}
            >
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Lv 3</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}> Thriver</Text>
            </View>
            <View
              style={[
                styles.statPill,
                { backgroundColor: colors.success + '14', borderColor: colors.success + '28' },
              ]}
            >
              <Text style={styles.statEmoji}>🛡️</Text>
              <Text style={[typography.bodyBold, { color: colors.success }]}>AI Active</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.content, { paddingHorizontal: spacing.base }]}>
          {/* ── Women's Cycle Card ── */}
          {experience === 'women_health' && (
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <Pressable
                onPress={() => router.push('/(app)/health/cycle' as any)}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <View
                  style={[
                    styles.cycleCard,
                    { backgroundColor: phaseStyle.bg, borderColor: phaseStyle.color + '30' },
                  ]}
                >
                  <View style={styles.cycleRow}>
                    <Text style={styles.cycleEmoji}>{phaseStyle.icon}</Text>
                    <View style={styles.cycleText}>
                      <Text style={[typography.label, { color: phaseStyle.color }]}>
                        Current Phase
                      </Text>
                      <Text
                        style={[
                          typography.subheading,
                          { color: colors.text.primary, marginTop: 2 },
                        ]}
                      >
                        {cycle
                          ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`
                          : 'Set up cycle tracking'}
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.text.secondary, marginTop: 3 }]}
                      >
                        {cycle
                          ? `Day ${cycle.currentPhase.day} of ${cycleLength} · Next period in ~${daysToPeriod} days (estimate)`
                          : 'Add your last period date to see your phase'}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.text.muted}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                  {/* Phase bar */}
                  <View style={[styles.phaseBar, { backgroundColor: phaseStyle.color + '20' }]}>
                    <View
                      style={[
                        styles.phaseFill,
                        {
                          backgroundColor: phaseStyle.color,
                          width: `${cycle ? Math.min(100, (cycle.currentPhase.day / cycleLength) * 100) : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Men's Vitality Card ── */}
          {experience === 'men_health' && (
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <Card
                onPress={() => router.push('/(app)/health/exercise' as any)}
                variant="surface"
                style={styles.cardBase}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Badge label="Physical Routine" variant="primary" />
                    <Text
                      style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}
                    >
                      Mobility & Spine Relief
                    </Text>
                  </View>
                  <Ionicons name="barbell-outline" size={26} color={colors.primary} />
                </View>
                <Text
                  style={[
                    typography.subbody,
                    { color: colors.text.secondary, marginTop: spacing.xs },
                  ]}
                >
                  Equipment-free desk relief and core stabilisation tailored for today.
                </Text>
              </Card>
            </Animated.View>
          )}

          {/* ── Today's Adaptive Task ── */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={[colors.primary + '14', colors.primary + '05']}
              style={[styles.taskCard, { borderColor: colors.primary + '20' }]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Badge label="Today's Focus" variant="success" />
                  <Text
                    style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}
                  >
                    {recommendation.title}
                  </Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="time-outline" size={12} color={colors.primary} />
                  <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 3 }]}>
                    {recommendation.durationMinutes}m
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  typography.subbody,
                  { color: colors.text.secondary, marginTop: spacing.xs, lineHeight: 20 },
                ]}
              >
                {recommendation.description}
              </Text>

              <View style={[styles.aiChip, { backgroundColor: colors.surface }]}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, flex: 1, marginLeft: 6 },
                  ]}
                >
                  {hasCheckIn
                    ? recommendation.aiExplanation.text
                    : 'A gentle default for today. Check in to get a suggestion based on how you feel.'}
                </Text>
              </View>

              <Button
                label="Start Task"
                onPress={() => router.push('/(app)/quests/quest_01' as any)}
                style={{ marginTop: spacing.md }}
              />
            </LinearGradient>
          </Animated.View>

          {/* ── Letters Invite (Progressive Disclosure) ── */}
          {isSocialPathRevealed && (
            <Animated.View entering={FadeInRight.delay(120).springify()}>
              <Card
                variant="surface"
                style={[styles.cardBase, { borderWidth: 1.5, borderColor: colors.accent + '30' }]}
                onPress={() => router.push('/(app)/letters' as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Badge label="Unlocked ✨" variant="info" />
                    <Text
                      style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}
                    >
                      Slow Letters & Connection
                    </Text>
                  </View>
                  <Icon name="send" size={22} color={colors.accent} />
                </View>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, marginTop: spacing.xs },
                  ]}
                >
                  Exchange thoughtful, chip-curated letters. Distance-delayed delivery. No free
                  text.
                </Text>
              </Card>
            </Animated.View>
          )}

          {/* ── Quick Actions Grid ── */}
          <Text
            style={[
              typography.subheading,
              { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
            ]}
          >
            Quick Access
          </Text>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action, idx) => (
              <Animated.View
                key={action.id}
                style={styles.gridItem}
                entering={FadeInDown.delay(140 + idx * 30).springify()}
              >
                <PressableScale
                  onPress={() => router.push(action.route)}
                  scaleTo={0.96}
                  style={[styles.gridCard, { backgroundColor: colors.surface }]}
                >
                  <View style={[styles.gridIcon, { backgroundColor: colors.primary + '14' }]}>
                    <Icon name={action.icon} size={20} color={colors.primary} />
                  </View>
                  <Text
                    style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 8 }]}
                  >
                    {action.label}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {action.sub}
                  </Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>

          {/* ── Health Education Snippet ── */}
          <Animated.View entering={FadeInDown.delay(220).springify()}>
            <Card
              onPress={() => router.push('/(app)/(tabs)/learn' as any)}
              variant="surface1"
              style={[styles.cardBase, { marginBottom: 0 }]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Badge label="Learn" variant="neutral" />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
                    Today's Health Insight
                  </Text>
                </View>
                <Ionicons name="book-outline" size={20} color={colors.text.muted} />
              </View>
              <Text
                style={[
                  typography.subbody,
                  { color: colors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                Evidence-based articles on sleep, nutrition, cycle awareness, and emotional
                resilience. Curated daily.
              </Text>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  heroGrad: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  statEmoji: { fontSize: 14, marginRight: 4 },
  content: { paddingTop: 16 },
  cycleCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cycleEmoji: { fontSize: 30, marginRight: 12, marginTop: 4 },
  cycleText: { flex: 1 },
  phaseBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  phaseFill: {
    height: 4,
    borderRadius: 2,
  },
  cardBase: {
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridItem: {
    width: '47.5%',
  },
  gridCard: {
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
