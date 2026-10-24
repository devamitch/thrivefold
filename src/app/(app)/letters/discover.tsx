import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function DiscoverPenPalsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { introsSentToday, incrementIntroQuota, showAlert } = useRootStore(
    useShallow((s) => ({
      introsSentToday: s.introsSentToday,
      incrementIntroQuota: s.incrementIntroQuota,
      showAlert: s.showAlert,
    })),
  );

  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  const topics = ['All Topics', 'Mindful Habits', 'Literature & Poetry', 'Nature & Hiking', 'Language Exchange', 'Tea & Quiet Living'];

  // Real people only. Matching needs the correspondence service, which isn't live in
  // this release, so there is nobody to show yet — never invented profiles.
  const candidates: {
    id: string;
    pseudonym: string;
    region: string;
    bio: string;
    interests: string[];
  }[] = [];

  const handleSendIntroduction = (cand: typeof candidates[0]) => {
    if (introsSentToday >= 1) {
      showAlert({
        title: 'Daily Introduction Limit Reached',
        message: 'To foster mindful, high-quality correspondence, Thrivefold limits users to 1 new introduction per day. You can continue sending letters to existing connections!',
        confirmText: 'Understood',
        cancelText: null,
      });
      return;
    }

    showAlert({
      title: `Send Letter to ${cand.pseudonym}`,
      message: `Would you like to open the postal composer? Letters travel with realistic distance-delayed delivery (~${Math.round(2100 / 200)} hours).`,
      confirmText: 'Compose Letter',
      onConfirm: () => {
        incrementIntroQuota();
        router.push('/(app)/letters/compose');
      },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Find pen pals"
        subtitle="Slow, Consented Global Correspondence"
        showBack
        rightAction={<Badge label={`${introsSentToday}/1 Intro Today`} variant={introsSentToday >= 1 ? 'warning' : 'primary'} />}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Pacing Rules Banner */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Slow Postal Pacing
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Profiles are matched exclusively by shared interests and languages. No live messaging or instant dopamine loops: letters take hours to travel.
          </Text>
        </Card>

        {/* Filter Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {topics.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={selectedTopic === t}
              onPress={() => setSelectedTopic(t)}
              style={{ marginRight: 6 }}
            />
          ))}
        </ScrollView>

        {candidates.length === 0 && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>No pen pals to show yet</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
              Pen-pal matching isn't available in this version of Thrivefold. When it opens, you'll only see
              real people who chose to receive letters, and you'll need to confirm your age first.
            </Text>
          </Card>
        )}

        {/* Candidate Cards */}
        {candidates.map((cand) => (
          <Card key={cand.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
            <View style={styles.candidateHeader}>
              <View style={[styles.avatarBox, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{cand.pseudonym}</Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>{cand.region}</Text>
              </View>
            </View>

            <Text style={[typography.subbody, { color: colors.text.secondary, marginVertical: 10, lineHeight: 20 }]}>
              {cand.bio}
            </Text>

            <View style={styles.tagRow}>
              {cand.interests.map((i) => (
                <Badge key={i} label={i} variant="neutral" style={{ marginRight: 6, marginBottom: 6 }} />
              ))}
            </View>

            <Button
              label={`Write Letter to ${cand.pseudonym}`}
              size="sm"
              style={{ marginTop: 12 }}
              onPress={() => handleSendIntroduction(cand)}
            />
          </Card>
        ))}
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
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
