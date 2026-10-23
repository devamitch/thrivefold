import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { QuestPanel } from '../../../components/game/QuestPanel';
import { useRootStore } from '../../../stores/useRootStore';
import { getTaskById } from '../../../domain/game/gameCatalogService';

/** Full-screen view of one of today's quests (deep-linkable by assignment id). */
export default function QuestDetailScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const taskId = useRootStore((s) => s.dailyAssignments.find((a) => a.assignmentId === questId)?.taskId);

  return (
    <ScreenContainer header={<AppHeader title={(taskId && getTaskById(taskId)?.title) || 'Quest'} showBack />} scrollMode="shell-scroll-view">
      <View>
        <QuestPanel assignmentId={questId ?? ''} onDone={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}
