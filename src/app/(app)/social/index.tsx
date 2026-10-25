import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import { evaluateFeatureEligibility } from '../../../domain/policy/engine';

export default function SocialIntroScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const user = useRootStore((s) => s.user);
  const introsSentToday = useRootStore((s) => s.introsSentToday);
  const activeTrialStartDate = useRootStore((s) => s.activeTrialStartDate);
  const consentedFeatures = useRootStore((s) => s.consentedFeatures);
  const blockedUserIds = useRootStore((s) => s.blockedUserIds);

  const completedCheckInDays = useRootStore((s) => s.completedCheckInDaysCount);
  const decision = evaluateFeatureEligibility('restricted_correspondence_trial', {
    userId: user?.id ?? 'dev_user',
    age: user?.age ?? null,
    isAgeVerified: user?.isAgeVerified ?? false,
    experience,
    completedCheckInDays,
    consentedFeatures,
    activeTrialStartDate: activeTrialStartDate ?? undefined,
    introsSentToday,
    blockedUserIds,
  });

  return (
    <ScreenWrapper scrollable>
      <Header title="Introductions" subtitle="Slow pace, and both sides agree" showBack />
      <SquircleSurface style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Policy Decision Banner */}
        <Card
          variant={decision.allowed ? 'tinted' : 'surface1'}
          style={[styles.banner, { borderColor: decision.allowed ? colors.primary : colors.warning }]}
        >
          <SquircleSurface style={styles.rowBetween}>
            <Text style={[typography.subbodyBold, { color: decision.allowed ? colors.primary : colors.text.primary }]}>
              Eligibility Status
            </Text>
            <Badge
              label={decision.allowed ? 'Eligible' : decision.reasonCode}
              variant={decision.allowed ? 'success' : 'warning'}
            />
          </SquircleSurface>
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
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  banner: {
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
