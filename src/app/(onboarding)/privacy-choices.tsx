import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Card } from '../../components/ui/Card';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../../components/ui/PressableScale';

const POINTS = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Stays on this phone',
    body: 'Check-ins, cycle data, journal and progress are stored on this device.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Never guessed about you',
    body: 'We never infer religion, orientation, health conditions or anything sensitive.',
  },
  {
    icon: 'notifications-off-outline' as const,
    title: 'Discreet reminders',
    body: 'Lock-screen notifications never show health details unless you choose to.',
  },
  {
    icon: 'download-outline' as const,
    title: 'Yours to take or delete',
    body: 'Export or erase everything from Settings, any time.',
  },
];

export default function PrivacyChoicesScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const adultConfirmedAt = useRootStore((s) => s.adultConfirmedAt);
  const confirmAdult = useRootStore((s) => s.confirmAdult);
  const adult = Boolean(adultConfirmedAt);

  return (
    <OnboardingScaffold
      step="privacy-choices"
      reward="privacy"
      title="Your data, your rules"
      subtitle="A quick look at how Thrivefold treats what you share."
      primaryLabel="Continue"
      primaryDisabled={!adult}
      onPrimary={() => router.push('/(onboarding)/goals')}
    >
      <Card style={{ padding: spacing.base, marginBottom: spacing.lg }}>
        {POINTS.map((p, i) => (
          <View key={p.title} style={[styles.point, i > 0 && { marginTop: spacing.md }]}>
            <View style={[styles.pointIcon, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name={p.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{p.title}</Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>{p.body}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* A plain statement, never pre-ticked (master spec §3.1). It is not age verification. */}
      <PressableScale
        onPress={() => !adult && confirmAdult()}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: adult }}
        accessibilityLabel="I'm 18 or older"
        style={[
          styles.check,
          { borderColor: adult ? colors.primary : colors.border, backgroundColor: colors.surface },
        ]}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: adult ? colors.primary : colors.text.muted,
              backgroundColor: adult ? colors.primary : 'transparent',
            },
          ]}
        >
          {adult ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : null}
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>I'm 18 or older</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Thrivefold is for adults. Letters and communities also need an age check later.
          </Text>
        </View>
      </PressableScale>

      <View style={[styles.links, { marginTop: spacing.lg }]}>
        <PressableScale onPress={() => router.push('/(public)/legal/privacy')} hitSlop={10} accessibilityRole="link">
          <Text style={[typography.subbody, { color: colors.primary }]}>Privacy policy</Text>
        </PressableScale>
        <PressableScale onPress={() => router.push('/(public)/legal/terms')} hitSlop={10} accessibilityRole="link">
          <Text style={[typography.subbody, { color: colors.primary }]}>Terms</Text>
        </PressableScale>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: 7,
    height: 24,
    justifyContent: 'center',
    marginRight: 12,
    width: 24,
  },
  check: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 16,
  },
  flex: { flex: 1 },
  links: { flexDirection: 'row', gap: 24, justifyContent: 'center' },
  point: { alignItems: 'flex-start', flexDirection: 'row' },
  pointIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
});
