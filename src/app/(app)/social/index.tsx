import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useAuthStore } from '../../../stores/useAuthStore';
import { usePolicyStore } from '../../../stores/usePolicyStore';
import { evaluateFeatureEligibility } from '../../../domain/policy/engine';

export default function SocialIntroScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const user = useAuthStore((s) => s.user);
  const introsSentToday = useAuthStore((s) => s.introsSentToday);
  const activeTrialStartDate = useAuthStore((s) => s.activeTrialStartDate);
  const consentedFeatures = usePolicyStore((s) => s.consentedFeatures);
  const blockedUserIds = usePolicyStore((s) => s.blockedUserIds);

  const decision = evaluateFeatureEligibility('restricted_correspondence_trial', {
    userId: user?.id ?? 'dev_user',
    age: user?.age ?? 26,
    isAgeVerified: user?.isAgeVerified ?? true,
    experience,
    completedCheckInDays: 3,
    consentedFeatures,
    activeTrialStartDate: activeTrialStartDate ?? undefined,
    hasActiveSubscription: user?.hasActiveSubscription ?? false,
    introsSentToday,
    blockedUserIds,
  });

  return (
    <ScreenWrapper scrollable>
      <Header title="Structured Introductions" subtitle="Controlled Pacing & Mutual Consent" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Policy Decision Banner */}
        <Card
          variant={decision.allowed ? 'tinted' : 'surface1'}
          style={[styles.banner, { borderColor: decision.allowed ? colors.primary : colors.warning }]}
        >
          <View style={styles.rowBetween}>
            <Text style={[typography.subbodyBold, { color: decision.allowed ? colors.primary : colors.text.primary }]}>
              Eligibility Status
            </Text>
            <Badge
              label={decision.allowed ? 'Eligible (18+)' : decision.reasonCode}
              variant={decision.allowed ? 'success' : 'warning'}
            />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Policy: {decision.policyVersion} · Quota: {introsSentToday}/1 sent today
          </Text>
        </Card>

        {/* Anti-Harassment & Strict Chip Rule */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Safe Interaction Rules
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            • 1 introduction per day limit enforced.{'\n'}
            • Strictly curated card composer (no arbitrary typed messages or phone numbers).{'\n'}
            • Mutual recipient opt-in required.{'\n'}
            • Blocks immediately prevent all queued delivery.
          </Text>
        </Card>

        {decision.allowed ? (
          <Button
            label="Open Curated Introduction Composer"
            onPress={() => router.push('/(app)/letters/compose')}
            style={{ marginTop: spacing.md }}
          />
        ) : (
          <Card variant="surface1" style={{ marginTop: spacing.md, padding: spacing.base }}>
            <Text style={[typography.subbodyBold, { color: colors.warning }]}>
              Introduction Pathway Unavailable
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              {decision.message}
            </Text>
          </Card>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  banner: {
    borderWidth: 1.5,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
