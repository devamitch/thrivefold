import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Header } from '../../../../components/ui/Header';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { evaluateFeatureEligibility } from '../../../../domain/policy/engine';
import { isBackendConfigured } from '../../../../services/supabase/supabaseClient';

/**
 * A single circle. Members, posts and events come only from the server; nothing is shown
 * until the person is eligible and the circle exists there. Deep links are re-checked here.
 */
export default function CircleScreen() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      experience: st.experience,
      completedCheckInDays: st.completedCheckInDaysCount,
      consentedFeatures: st.consentedFeatures,
      activeTrialStartDate: st.activeTrialStartDate,
      introsSentToday: st.introsSentToday,
      blockedUserIds: st.blockedUserIds,
    })),
  );
  const eligibility = evaluateFeatureEligibility('community_directory', {
    userId: s.user?.id ?? 'anonymous',
    age: s.user?.age ?? null,
    isAgeVerified: s.user?.isAgeVerified ?? false,
    experience: s.experience,
    completedCheckInDays: s.completedCheckInDays,
    consentedFeatures: s.consentedFeatures,
    activeTrialStartDate: s.activeTrialStartDate ?? undefined,
    introsSentToday: s.introsSentToday,
    blockedUserIds: s.blockedUserIds,
  });

  return (
    <ScreenWrapper scrollable>
      <Header title="Circle" subtitle="Private peer support" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card variant="surface1" style={{ padding: spacing.lg }}>
          <Ionicons name="people-outline" size={26} color={colors.text.muted} />
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm }]}>
            {eligibility.allowed ? 'This circle is not open yet' : 'Not available'}
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {!eligibility.allowed
              ? eligibility.message
              : isBackendConfigured
                ? `Circle ${communityId ?? ''} has no members or posts on the server yet.`
                : 'Circles need the Thrivefold server, which is not connected in this build. Nothing is shown until real members join.'}
          </Text>
          <Button label="Back to circles" size="sm" variant="outline" onPress={() => router.replace('/(app)/circles')} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
        </Card>
      </View>
    </ScreenWrapper>
  );
}
