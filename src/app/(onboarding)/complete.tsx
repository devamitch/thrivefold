import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { fitFor, SETUP_XP_TOTAL } from '../../domain/game/setupProfile';
import { useTheme } from '../../theme/useTheme';

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
  const { experience, onboarding, pseudonym, setIsOnboarded, setupXp, level, diamonds } = useRootStore(
    useShallow((s) => ({
      setupXp: s.rewardLedger.filter((e) => e.kind === 'setup_reward').reduce((sum, e) => sum + e.xp, 0),
      level: s.level,
      diamonds: s.diamonds,
      experience: s.experience,
      onboarding: s.onboarding,
      pseudonym: s.user?.pseudonym,
      setIsOnboarded: s.setIsOnboarded,
    })),
  );

  const finish = (then?: '/(app)/check-in') => {
    setIsOnboarded(true);
    router.replace('/(app)/(tabs)');
    if (then) router.push(then);
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
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          paddingHorizontal: spacing.base,
        },
      ]}
    >
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <Text
          style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.lg }]}
          accessibilityRole="header"
        >
          {pseudonym && pseudonym !== 'Friend' && pseudonym !== 'Guest' ? `You're set, ${pseudonym}` : "You're all set"}
        </Text>
        <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: spacing.sm }]}>
          Your daily quests now fit your goals, pace and limits. Change any of it from You, Personalize.
        </Text>

        {setupXp > 0 ? (
          <View style={[styles.rewards, { backgroundColor: colors.primaryAlpha, marginTop: spacing.lg }]}>
            <View style={styles.reward}>
              <Text style={[typography.display, { color: colors.primary }]}>{level}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Level</Text>
            </View>
            <View style={styles.reward}>
              <Text style={[typography.display, { color: colors.primary }]}>{setupXp}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>of {SETUP_XP_TOTAL} setup XP</Text>
            </View>
            <View style={styles.reward}>
              <View style={styles.row}>
                <Ionicons name="diamond-outline" size={18} color={colors.primary} />
                <Text style={[typography.display, { color: colors.primary, marginLeft: 4 }]}>{diamonds}</Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Diamonds</Text>
            </View>
          </View>
        ) : null}

        <Card style={{ marginTop: spacing.xl, padding: spacing.base }}>
          {rows.map((r) => (
            <View
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
            </View>
          ))}
        </Card>

        <Pressable
          onPress={() => router.push('/(onboarding)/lifestyle-preferences')}
          accessibilityRole="button"
          style={[styles.optional, { marginTop: spacing.md }]}
        >
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={[typography.subbody, { color: colors.primary, marginLeft: 6 }]}>
            Edit food & reminder preferences
          </Text>
        </Pressable>
      </ScrollView>

      <Button label="Start today's check-in" size="lg" onPress={() => finish('/(app)/check-in')} />
      <Button label="Go to home" variant="ghost" onPress={() => finish()} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  optional: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', minHeight: 44 },
  reward: { alignItems: 'center', flex: 1 },
  rewards: { borderRadius: 18, flexDirection: 'row', paddingVertical: 14 },
  root: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', paddingVertical: 10 },
  rowLabel: { width: 100 },
});
