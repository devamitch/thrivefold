import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import {
  ageCheckErrorText,
  useAgeCheckStatus,
  useStartAgeCheck,
  useSyncAgeVerified,
} from '../../../services/supabase/ageCheck';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const STATUS_TEXT: Record<string, string> = {
  started: 'Your check is in progress. Finish it on the provider’s page, then come back.',
  declined: 'The provider couldn’t confirm your age. You can try again.',
  resubmission: 'The provider needs clearer photos. Start a new check.',
  expired: 'The last check wasn’t finished. Start a new one.',
  under_age: 'Letters and groups are for adults only. Everything else in Thrivefold stays open to you.',
  no_age: 'The provider didn’t return an age. Start a new check.',
};

/**
 * Age check for adult-only features (letters, groups). A provider checks an ID and a selfie;
 * Thrivefold keeps only the result. A self-entered birthday never counts.
 */
export default function AgeCheckScreen() {
  const { colors, typography, spacing } = useTheme();
  const user = useRootStore((s) => s.user);
  const showAlert = useRootStore((s) => s.showAlert);
  const status = useAgeCheckStatus(!user?.isGuest);
  const start = useStartAgeCheck();
  useSyncAgeVerified(status.data);

  // Returning from the provider's page: refresh the result.
  useFocusEffect(
    useCallback(() => {
      status.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const verified = status.data?.verified ?? false;
  const last = status.data?.status;

  const onStart = () =>
    start.mutate(undefined, {
      onSuccess: (url) => Linking.openURL(url),
      onError: (e) => showAlert({ title: 'Age check', message: ageCheckErrorText(e), confirmText: 'OK', cancelText: null }),
    });

  return (
    <ScreenWrapper
      scrollable
      footer={
        verified || user?.isGuest ? undefined : (
          <Button
            label={last === 'started' ? 'Continue the check' : 'Start age check'}
            onPress={onStart}
            loading={start.isPending}
            disabled={start.isPending}
          />
        )
      }
    >
      <Header title="Age check" subtitle="For letters and groups" showBack />
      <View>
        <Card style={{ padding: spacing.lg }}>
          <SquircleSurface
            shape="circle"
            fill={verified ? colors.successSurface : colors.primaryAlpha}
            style={styles.icon}
          >
            <Ionicons
              name={verified ? 'shield-checkmark-outline' : 'id-card-outline'}
              size={24}
              color={verified ? colors.success : colors.primary}
            />
          </SquircleSurface>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md }]}>
            {user?.isGuest ? 'Sign in first' : verified ? 'You’re verified as an adult' : 'Confirm you’re 18 or older'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
            {user?.isGuest
              ? 'Age checks are linked to an account. Guests keep everything on this phone and don’t use letters or groups.'
              : verified
                ? 'Letters and groups are open to you, along with their own rules and limits.'
                : (last && STATUS_TEXT[last]) ||
                  'An independent provider checks a photo ID and a selfie. It takes about two minutes.'}
          </Text>
        </Card>

        {!verified && !user?.isGuest ? (
          <Card variant="surface1" style={{ padding: spacing.base, marginTop: spacing.md }}>
            {[
              ['eye-off-outline', 'Thrivefold never sees or stores your ID, photo or date of birth. Only “adult: yes or no” is kept.'],
              ['lock-closed-outline', 'Your health records stay on this phone and are never part of the check.'],
              ['heart-outline', 'Everything else in the app works without it.'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.point}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
                <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>{text}</Text>
              </View>
            ))}
          </Card>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  icon: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  point: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, paddingVertical: 6 },
});
