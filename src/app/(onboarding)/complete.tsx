import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const EXPERIENCE_LABEL = {
  women_health: "Women's health",
  men_health: "Men's health",
  pride_wellbeing: 'LGBTQ+ wellbeing',
} as const;

export default function CompleteOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const { experience, onboarding, pseudonym, setIsOnboarded } = useRootStore(
    useShallow((s) => ({
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
    { label: 'Goals', value: onboarding.goals.length ? onboarding.goals.join(', ') : 'None yet' },
    {
      label: 'Go easy on',
      value: onboarding.constraints.length ? onboarding.constraints.join(', ') : 'Nothing',
    },
    { label: 'Routine', value: onboarding.routineMinutes ? `${onboarding.routineMinutes} minutes` : 'Flexible' },
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
      <View style={styles.flex}>
        <Text
          style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.xl }]}
          accessibilityRole="header"
        >
          {pseudonym && pseudonym !== 'Friend' && pseudonym !== 'Guest' ? `You're set, ${pseudonym}` : "You're all set"}
        </Text>
        <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: spacing.sm }]}>
          Start with a one-minute check-in so today's suggestion fits how you feel.
        </Text>

        <Card style={{ marginTop: spacing.xl, padding: spacing.base }}>
          {rows.map((r, i) => (
            <View
              key={r.label}
              style={[
                styles.row,
                i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text style={[typography.subbody, styles.rowLabel, { color: colors.text.muted }]}>{r.label}</Text>
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
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={[typography.subbody, { color: colors.primary, marginLeft: 6 }]}>
            Add food & reminder preferences (optional)
          </Text>
        </Pressable>
      </View>

      <Button label="Start today's check-in" size="lg" onPress={() => finish('/(app)/check-in')} />
      <Button label="Go to home" variant="ghost" onPress={() => finish()} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  optional: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', minHeight: 44 },
  root: { flex: 1 },
  row: { flexDirection: 'row', paddingVertical: 10 },
  rowLabel: { width: 96 },
});
