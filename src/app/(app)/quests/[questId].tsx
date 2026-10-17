import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useHealthStore } from '../../../stores/useHealthStore';

export default function QuestDetailScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const { colors, typography, spacing } = useTheme();

  const todayQuests = useHealthStore((s) => s.todayQuests);
  const completeQuest = useHealthStore((s) => s.completeQuest);

  const quest = todayQuests.find((q) => q.id === questId) ?? todayQuests[0];

  const handleFinish = () => {
    if (quest) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      completeQuest(quest.id);
    }
    router.back();
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Quest Session" subtitle={quest.category.toUpperCase()} showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Badge label={`${quest.durationMinutes} Minutes`} variant="primary" />
            <Text style={[typography.bodyBold, { color: colors.primary }]}>+{quest.xpReward} XP</Text>
          </View>
          <Text style={[typography.heading, { color: colors.primary, marginTop: spacing.sm }]}>
            {quest.title}
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Instructions & Flow
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 24 }]}>
            1. Find a comfortable, quiet seated or standing position.{'\n'}
            2. Drop your shoulders away from your ears and soften your jaw.{'\n'}
            3. Follow the rhythmic pacing with slow, steady inhales and exhales.{'\n'}
            4. Never force the movement or push through discomfort.
          </Text>
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>
            Adaptive Modifications
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            If experiencing fatigue or limited mobility, you can complete this exercise sitting in a supported chair.
          </Text>
        </Card>

        <Button
          label={quest.isCompleted ? 'Completed ✓' : 'Mark as Complete'}
          disabled={quest.isCompleted}
          onPress={handleFinish}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
