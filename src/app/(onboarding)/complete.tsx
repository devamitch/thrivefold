import { SquircleSurface } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { fitFor, SETUP_XP_TOTAL } from '../../domain/game/setupProfile';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../../components/ui/PressableScale';

const CAPACITY_LABEL = {
  gentle: 'Starting gentle',
  steady: 'Steady',
  strong: 'Ready for more',
} as const;

const EXPERIENCE_LABEL = {
  women_health: "Women's Health",
  men_health: "Men's Health",
  pride_wellbeing: 'LGBTQ+ Wellbeing',
} as const;

export default function CompleteOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const { experience, onboarding, pseudonym, setIsOnboarded, setupXp, level, diamonds, autoClaimAnsweredSetupRewards } = useRootStore(
    useShallow((s) => ({
      setupXp: s.rewardLedger.filter((e) => e.kind === 'setup_reward').reduce((sum, e) => sum + e.xp, 0),
      level: s.level,
      diamonds: s.diamonds,
      experience: s.experience,
      onboarding: s.onboarding,
      pseudonym: s.user?.pseudonym,
      setIsOnboarded: s.setIsOnboarded,
      autoClaimAnsweredSetupRewards: s.autoClaimAnsweredSetupRewards,
    })),
  );

  // Auto claim all answered setup sections on mount so the user receives all setup XP & diamonds
  React.useEffect(() => {
    autoClaimAnsweredSetupRewards();
  }, [autoClaimAnsweredSetupRewards]);

  const finish = (then?: '/(app)/check-in') => {
    autoClaimAnsweredSetupRewards();
    setIsOnboarded(true);
    router.replace('/(app)/(tabs)');
    if (then) {
      setTimeout(() => {
        router.push(then);
      }, 50);
    }
  };

  const rows = [
    { label: 'Focus', value: EXPERIENCE_LABEL[experience] },
    { label: 'Goals', value: onboarding.goals.length ? onboarding.goals.join(', ') : 'None chosen' },
    {
      label: 'Go easy on',
      value: onboarding.constraints.length ? onboarding.constraints.join(', ') : 'Nothing noted',
    },
    { label: 'Pace', value: CAPACITY_LABEL[fitFor(onboarding).capacity] },
    { label: 'Routine', value: onboarding.routineMinutes ? `${onboarding.routineMinutes} minutes` : 'No preference' },
    { label: 'Food & diet', value: onboarding.diet ? onboarding.diet : 'No preference' },
    ...(onboarding.observances && onboarding.observances.length > 0
      ? [{ label: 'Reminders', value: onboarding.observances.join(', ') }]
      : []),
  ];

  return (
    <SquircleSurface
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          paddingHorizontal: spacing.base,
        },
      ]}
    >
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <SquircleSurface style={styles.headerBlock}>
          <SquircleSurface style={[styles.successIconBadge, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
          </SquircleSurface>
          <Text
            style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.md }]}
            accessibilityRole="header"
          >
            {pseudonym && pseudonym !== 'Friend' && pseudonym !== 'Guest' ? `You're set, ${pseudonym}` : "You're all set"}
          </Text>
          <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            Your daily quests now fit your goals, pace and limits.
          </Text>
        </SquircleSurface>

        {/* Level, setup XP and diamonds actually earned */}
        <SquircleSurface style={[styles.rewardsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SquircleSurface style={styles.rewardTile}>
            <SquircleSurface style={[styles.tileIconContainer, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
            </SquircleSurface>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>{level}</Text>
            <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 1 }]}>Level</Text>
          </SquircleSurface>

          <SquircleSurface style={[styles.tileDivider, { backgroundColor: colors.border }]} />

          <SquircleSurface style={styles.rewardTile}>
            <SquircleSurface style={[styles.tileIconContainer, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="flash-outline" size={18} color={colors.primary} />
            </SquircleSurface>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>+{setupXp}</Text>
            <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 1 }]}>Setup XP</Text>
          </SquircleSurface>

          <SquircleSurface style={[styles.tileDivider, { backgroundColor: colors.border }]} />

          <SquircleSurface style={styles.rewardTile}>
            <SquircleSurface style={[styles.tileIconContainer, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="diamond-outline" size={18} color={colors.primary} />
            </SquircleSurface>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 4 }]}>{diamonds}</Text>
            <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 1 }]}>Diamonds</Text>
          </SquircleSurface>
        </SquircleSurface>

        <Card style={{ marginTop: spacing.lg, padding: spacing.base }}>
          <Text style={[typography.label, { color: colors.text.muted, marginBottom: 12 }]}>
            Your plan
          </Text>
          {rows.map((r) => (
            <SquircleSurface
              key={r.label}
              style={[
                styles.row,
                { backgroundColor: colors.surface1, marginBottom: 8, borderRadius: 12, paddingHorizontal: 12 },
              ]}
            >
              <Text style={[typography.captionBold, styles.rowLabel, { color: colors.text.muted }]}>{r.label}</Text>
              <Text style={[typography.subbodyBold, styles.flex, { color: colors.text.primary }]} numberOfLines={2}>
                {r.value}
              </Text>
            </SquircleSurface>
          ))}
        </Card>

        <Link href={'/(onboarding)/lifestyle-preferences' as Href} asChild>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Edit food and reminder preferences"
            style={[styles.optional, { marginTop: spacing.md, marginBottom: spacing.lg }]}
          >
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.primary, marginLeft: 6 }]}>
              Edit food & reminder preferences
            </Text>
          </PressableScale>
        </Link>
      </ScrollView>

      <SquircleSurface style={{ gap: 8 }}>
        <Button label="Start today's check-in" size="lg" onPress={() => finish('/(app)/check-in')} />
        <Button label="Go to home" variant="ghost" onPress={() => finish()} />
      </SquircleSurface>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  headerBlock: { alignItems: 'center', marginBottom: 16 },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderCurve: 'continuous',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  rewardTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDivider: {
    width: 1,
    height: 36,
  },
  optional: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', minHeight: 44 },
  root: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', paddingVertical: 10 },
  rowLabel: { width: 100 },
});
