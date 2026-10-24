import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import { evaluateFeatureEligibility } from '../../../domain/policy/engine';

interface CircleItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function CommunitiesScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const user = useRootStore((s) => s.user);
  const activeTrialStartDate = useRootStore((s) => s.activeTrialStartDate);
  const showToast = useRootStore((s) => s.showToast);
  const introsSentToday = useRootStore((s) => s.introsSentToday);
  const consentedFeatures = useRootStore((s) => s.consentedFeatures);
  const blockedUserIds = useRootStore((s) => s.blockedUserIds);

  const [joinedCircleIds, setJoinedCircleIds] = useState<string[]>([]);

  // Policy check for trial lockout
  const completedCheckInDays = useRootStore((s) => s.completedCheckInDaysCount);
  const eligibility = evaluateFeatureEligibility('community_directory', {
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

  const getCohorts = (): CircleItem[] => {
    if (experience === 'men_health') {
      return [
        {
          id: 'men_strength',
          title: 'Strength, Stamina & Recovery',
          description: 'Optimizing sleep, VO2 max endurance, and active longevity habits.',
          category: "Men's Health",
        },
        {
          id: 'men_mindset',
          title: 'Mental Fortitude & Stress Grounding',
          description: 'Stoic practices, decompressing after high-stress days, and presence.',
          category: 'Resilience',
        },
        {
          id: 'men_fatherhood',
          title: 'Fatherhood & Life Balance',
          description: 'Navigating family presence, work boundaries, and personal vitality.',
          category: 'Fatherhood',
        },
      ];
    }
    if (experience === 'pride_wellbeing') {
      return [
        {
          id: 'pride_affirming',
          title: 'Affirming Care Navigation',
          description: 'Safe healthcare resources, provider recommendations, and hormone therapy care.',
          category: 'Affirming Care',
        },
        {
          id: 'pride_chosen_family',
          title: 'Chosen Family & Mental Haven',
          description: 'Safe peer reflections, celebrating milestones, and unconditional community.',
          category: 'Haven',
        },
      ];
    }
    return [
      {
        id: 'women_cycle',
        title: 'Cycle Syncing & Hormonal Balance',
        description: 'Nutrition, energy alignment, and symptom management across menstrual phases.',
        category: "Women's Health",
      },
      {
        id: 'women_pcos',
        title: 'PCOS & Endometriosis Resilience',
        description: 'Food, symptoms and day-to-day tips from people with the same condition.',
        category: 'Hormonal Wellness',
      },
      {
        id: 'women_matrescence',
        title: 'Matrescence & Postpartum Care',
        description: 'Gentle support for postpartum transitions, sleep shifts, and self-compassion.',
        category: 'Maternal Care',
      },
    ];
  };

  const circles = getCohorts();

  const handleToggleJoin = (circleId: string, title: string) => {
    if (joinedCircleIds.includes(circleId)) {
      setJoinedCircleIds((prev) => prev.filter((id) => id !== circleId));
      showToast({ type: 'info', title: 'Left Circle', message: `You have left ${title}.` });
    } else {
      setJoinedCircleIds((prev) => [...prev, circleId]);
      showToast({ type: 'info', title: 'Saved for later', message: `${title} will open when community features launch.` });
    }
  };

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Private Circles"
        subtitle="Segmented, identity-safe affinity spaces"
        showBack
        rightAction={<Button label="Invites" variant="outline" size="sm" onPress={() => router.push('/(app)/circles/invitations')} />}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Policy Notice if Barred */}
        {!eligibility.allowed && (
          <Card variant="surface1" style={{ marginBottom: spacing.md, borderColor: colors.warning, borderWidth: 1 }}>
            <Badge label="Restricted During Trial" variant="warning" />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              Community Discovery Inactive
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              {eligibility.message}
            </Text>
          </Card>
        )}

        {/* Safe Circles Info */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/circles-sanctuary.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Private circles
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            All circles are private and segmented by health journey. Conversations are conducted exclusively through curated topic prompts to ensure a zero-harassment sanctuary.
          </Text>
        </Card>

        {/* Circles List */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Recommended for Your Journey
        </Text>

        {circles.map((circle) => {
          const isJoined = joinedCircleIds.includes(circle.id);
          return (
            <Card key={circle.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {circle.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
                    {circle.category}
                  </Text>
                </View>
                <Badge label={isJoined ? 'Member' : 'Private'} variant={isJoined ? 'success' : 'neutral'} />
              </View>

              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8, marginBottom: 12 }]}>
                {circle.description}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button
                  label={isJoined ? 'Leave Circle' : 'Join Private Circle'}
                  variant={isJoined ? 'outline' : 'primary'}
                  size="sm"
                  disabled={!eligibility.allowed}
                  onPress={() => handleToggleJoin(circle.id, circle.title)}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Open Hub"
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/(app)/circles/${circle.id}` as any)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
