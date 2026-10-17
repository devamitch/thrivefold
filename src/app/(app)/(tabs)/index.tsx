import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { useAppStore } from '../../../stores/useAppStore';
import { usePolicyStore } from '../../../stores/usePolicyStore';
import { evaluateDeterministicRoutine } from '../../../domain/ai/deterministicRules';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const currentStreak = useHealthStore((s) => s.currentStreak);
  const cycleData = useHealthStore((s) => s.cycleData);
  const checkInHistory = useHealthStore((s) => s.checkInHistory);
  const isSocialPathRevealed = usePolicyStore((s) => s.isSocialPathRevealed);

  const lastCheckIn = checkInHistory[0] ?? { energy: 7, mood: 8, stress: 4 };

  const recommendation = evaluateDeterministicRoutine({
    energy: lastCheckIn.energy,
    mood: lastCheckIn.mood,
    stress: lastCheckIn.stress,
    experience,
  });

  const getExperienceGreeting = () => {
    if (experience === 'men_health') {
      return { title: 'Men’s Health & Vitality', tag: 'Strength & Focus' };
    }
    if (experience === 'pride_wellbeing') {
      return { title: 'Pride Wellbeing Space', tag: 'Affirmative Self-Care' };
    }
    return { title: 'Women’s Health & Rhythm', tag: 'Cycle & Hormone Balance' };
  };

  const headerInfo = getExperienceGreeting();

  return (
    <ScreenWrapper scrollable>
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.tag}
        rightAction={
          <Pressable
            onPress={() => router.push('/(app)/settings')}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: colors.surface1 }, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="person-outline" size={18} color={colors.text.primary} />
          </Pressable>
        }
      />

      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Streak & Today Banner */}
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <View style={styles.bannerRow}>
            <View>
              <Text style={[typography.label, { color: colors.primary }]}>Daily Streak</Text>
              <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
                {currentStreak} Days
              </Text>
            </View>
            <Badge label="Local AI Active" variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            Consistency unlocked! You have completed 3 days of health self-care.
          </Text>
        </Card>

        {/* Women's Cycle Tracker Snapshot (only shown for women_health experience) */}
        {experience === 'women_health' && (
          <Card
            onPress={() => router.push('/(app)/health/cycle')}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.cardHeader}>
              <View>
                <Badge label="Current Phase" variant="info" />
                <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>
                  {cycleData.currentPhase.toUpperCase()} PHASE
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              Day 14 of 28. Est. next period in 14 days. Estrogen peak support active.
            </Text>
          </Card>
        )}

        {/* Men's Posture & Vitality Snapshot (only shown for men_health experience) */}
        {experience === 'men_health' && (
          <Card
            onPress={() => router.push('/(app)/health/exercise')}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.cardHeader}>
              <View>
                <Badge label="Physical Routine" variant="primary" />
                <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>
                  Mobility & Spine Relief
                </Text>
              </View>
              <Ionicons name="barbell-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              Equipment-free desk relief and core stabilization flow tailored for today.
            </Text>
          </Card>
        )}

        {/* Today's Adaptive Task Recommendation */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Badge label="Today's Recommended Focus" variant="success" />
              <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>
                {recommendation.title}
              </Text>
            </View>
            <Badge label={`${recommendation.durationMinutes} min`} variant="neutral" />
          </View>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            {recommendation.description}
          </Text>

          {/* AI Explanation note */}
          <View style={[styles.aiNotice, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]}>
              {recommendation.aiExplanation.text}
            </Text>
          </View>

          <Button
            label="Start Task"
            onPress={() => router.push('/(app)/quests/quest_01')}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Progressive Disclosure: Slowly-inspired letters / introductions card */}
        {isSocialPathRevealed && (
          <Card
            variant="surface"
            style={[styles.progressiveCard, { borderColor: colors.primary, borderWidth: 1.5, marginBottom: spacing.md }]}
            onPress={() => router.push('/(app)/letters')}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Badge label="Progressive Invite" variant="primary" />
                <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>
                  Slow Letters & Curated Exchange
                </Text>
              </View>
              <Text style={{ fontSize: 24 }}>✉️</Text>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
              Available after daily consistency. Exchange distance-delayed letters assembled strictly via curated cards. No raw typing.
            </Text>
            <Button
              label="Explore Letters"
              variant="outline"
              size="sm"
              onPress={() => router.push('/(app)/letters')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Quick Health Shortcuts */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginVertical: spacing.sm }]}>
          Health Shortcuts
        </Text>
        <View style={styles.grid}>
          <Card
            style={styles.gridCard}
            onPress={() => router.push('/(app)/journal')}
          >
            <Text style={styles.gridIcon}>📖</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Private Journal</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Local-only reflection</Text>
          </Card>

          <Card
            style={styles.gridCard}
            onPress={() => router.push('/(app)/games')}
          >
            <Text style={styles.gridIcon}>🎮</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Wellness Arcade</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Breath & focus games</Text>
          </Card>

          <Card
            style={styles.gridCard}
            onPress={() => router.push('/(app)/circles')}
          >
            <Text style={styles.gridIcon}>👥</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Private Circles</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Eligible support hubs</Text>
          </Card>

          <Card
            style={styles.gridCard}
            onPress={() => router.push('/(app)/ai')}
          >
            <Text style={styles.gridIcon}>🧠</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>AI Vault</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Inspect on-device AI</Text>
          </Card>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  progressiveCard: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 12,
    padding: 14,
  },
  gridIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
});
