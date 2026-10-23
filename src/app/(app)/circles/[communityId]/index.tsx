import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Card } from '../../../../components/ui/Card';
import { Header } from '../../../../components/ui/Header';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore } from '../../../../stores/useRootStore';

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);

  const [activeTab, setActiveTab] = useState<'discussions' | 'events' | 'about'>('discussions');

  const circleName = communityId === 'circle_sleep' ? 'Quiet Rest & Insomnia Recovery' : 'Mindful Somatic Grounding';

  const groupDiscussions = [
    {
      id: 'd1',
      author: 'GentleOak (Facilitator)',
      topic: 'Weekly Check-In: What restored you this week?',
      replies: 8,
      lastActive: '2h ago',
    },
    {
      id: 'd2',
      author: 'NorthStar',
      topic: 'Reframing 3am wakefulness with somatic body scan',
      replies: 12,
      lastActive: '5h ago',
    },
  ];

  const handleLeave = () => {
    showAlert({
      title: 'Leave Circle',
      message: 'Are you sure you want to quietly leave this support group?',
      confirmText: 'Leave',
      destructive: true,
      onConfirm: () => router.replace('/(app)/circles'),
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header
        title={circleName}
        subtitle="Confidential Peer Circle"
        showBack
        rightAction={
          <Button label="Leave" variant="ghost" size="sm" onPress={handleLeave} />
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Navigation Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
          {(['discussions', 'events', 'about'] as const).map((tab) => (
            <Button
              key={tab}
              label={tab === 'discussions' ? 'Discussions' : tab === 'events' ? 'Calendar' : 'Rules & Info'}
              variant={activeTab === tab ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1 }}
            />
          ))}
        </View>

        {activeTab === 'discussions' && (
          <View>
            <View style={styles.headerRow}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>Topic Threads</Text>
              <Button label="+ Share Reflection" variant="outline" size="sm" />
            </View>

            {groupDiscussions.map((d) => (
              <Card key={d.id} style={{ marginTop: spacing.sm }}>
                <View style={styles.headerRow}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{d.author}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>{d.lastActive}</Text>
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
                  {d.topic}
                </Text>
                <Badge label={`${d.replies} safe card responses`} variant="neutral" style={{ marginTop: 8, alignSelf: 'flex-start' }} />
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <View>
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.headerRow}>
                <Badge label="Upcoming Virtual Session" variant="primary" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>Sunday 06:00 PM</Text>
              </View>
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                Guided Group Parasympathetic Breathwork
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
                30-minute quiet somatic reset led by certified breath facilitator. No live cameras required; attend in audio-only calm.
              </Text>
              <Button label="RSVP / Register" size="sm" style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            </Card>
          </View>
        )}

        {activeTab === 'about' && (
          <View>
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
                Group Purpose & Code
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
                This circle exists to support members dealing with fatigue and sleep disruptions. We maintain absolute confidentiality: what is shared here remains here. Deceptive marketing and commercial promotions are permanently barred.
              </Text>
            </Card>

            <Card style={{ backgroundColor: colors.surface1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  Facilitator Credentials Verified
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                The facilitator has passed peer moderation onboarding and identity verification.
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
