import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Header } from '../ui/Header';
import { ScreenWrapper } from '../ui/ScreenWrapper';

/**
 * Shown instead of letters or dating when something is missing, with the next step for each
 * (sign in, turn on the social side, age check), rather than silently bouncing to Home.
 */
export function SocialGate({ feature }: { feature: 'letters' | 'dating' }) {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      signedIn: st.isAuthenticated && Boolean(st.user) && !st.user?.isGuest,
      revealed: st.isSocialPathRevealed,
      verified: Boolean(st.user?.isAgeVerified),
      reveal: st.setSocialPathRevealed,
      grantConsent: st.grantConsent,
    })),
  );
  const steps = [
    {
      done: s.signedIn,
      title: 'Sign in',
      body: 'Letters and dating live on Thrivefold’s server, so they need an account.',
      action: () => router.push('/(auth)/sign-in' as Href),
      label: 'Sign in',
    },
    {
      done: s.revealed,
      title: 'Turn on letters and groups',
      body: 'The social side is off until you choose it. Your health records are never shared.',
      action: () => {
        s.grantConsent('social_path');
        s.reveal(true);
      },
      label: 'Turn on',
    },
    {
      done: s.verified,
      title: 'Confirm you are 18 or over',
      body: 'A two-minute check with an independent provider. Thrivefold keeps only the result.',
      action: () => router.push('/(app)/you/age-check' as Href),
      label: 'Start age check',
    },
  ];
  const next = steps.find((x) => !x.done);
  return (
    <ScreenWrapper scrollable footer={next ? <Button label={next.label} onPress={next.action} /> : undefined}>
      <Header
        title={feature === 'letters' ? 'Letters' : 'Dating'}
        subtitle={feature === 'letters' ? 'Slow pen-pal letters, made of cards' : 'Verified adults, messages made of cards'}
        showBack
      />
      <Card style={{ padding: spacing.lg }}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>A few steps first</Text>
        {steps.map((x) => (
          <View key={x.title} style={[styles.row, { marginTop: spacing.md }]}>
            <Ionicons
              name={x.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={x.done ? colors.success : x === next ? colors.primary : colors.text.muted}
            />
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{x.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{x.body}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
});
