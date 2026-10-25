import { SquircleSurface } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppHeader } from '../../../../components/ui/AppHeader';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { exerciseById, planById } from '../../../../domain/fitness/workouts';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

/** One saved workout: what was done, how it was recorded, and delete. */
export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, remove, showAlert } = useRootStore(
    useShallow((s) => ({ session: s.workoutSessions.find((w) => w.id === id), remove: s.deleteWorkoutSession, showAlert: s.showAlert })),
  );
  if (!session) {
    return (
      <ScreenContainer header={<AppHeader title="Workout" showBack />} scrollMode="shell-scroll-view">
        <Text style={[typography.body, { color: colors.text.secondary }]}>This workout is no longer saved.</Text>
      </ScreenContainer>
    );
  }
  const title = planById(session.planId)?.title ?? (session.entries.length === 1 ? exerciseById(session.entries[0].exerciseId)?.name : null) ?? 'Workout';
  const minutes = Math.max(1, Math.round((Date.parse(session.finishedAt) - Date.parse(session.startedAt)) / 60000));
  const how = session.verification === 'camera' ? 'Reps counted by the camera' : session.verification === 'manual' ? 'Self-reported' : 'Logged by hand';

  return (
    <ScreenContainer
      header={<AppHeader title={title} subtitle={new Date(session.startedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} showBack />}
      scrollMode="shell-scroll-view"
    >
      <Card style={{ padding: spacing.base }}>
        <SquircleSurface style={styles.row}>
          <Ionicons name={session.verification === 'camera' ? 'scan-outline' : 'create-outline'} size={18} color={colors.primary} />
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>{how}</Text>
        </SquircleSurface>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
          {minutes} min{session.effort ? ` · effort ${session.effort}/10` : ''}{session.painReported ? ' · discomfort noted' : ''}
          {session.assignmentId ? ' · completed a quest' : ''}
        </Text>
      </Card>
      {session.entries.map((e) => {
        const ex = exerciseById(e.exerciseId);
        return (
          <Card key={e.exerciseId} style={{ padding: spacing.base, marginTop: spacing.sm }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{ex?.name ?? e.exerciseId}</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {e.sets.map((s, i) => `Set ${i + 1}: ${s.value}${ex?.timed ? ' s' : ''}${s.weightKg ? ` @ ${s.weightKg} kg` : ''}`).join('\n')}
            </Text>
          </Card>
        );
      })}
      <Button
        label="Delete this workout"
        variant="ghost"
        onPress={() =>
          showAlert({
            title: 'Delete this workout?',
            message: 'It is removed from your history and calendar. XP already earned stays.',
            confirmText: 'Delete',
            destructive: true,
            onConfirm: () => {
              remove(session.id);
              router.back();
            },
          })
        }
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ row: { alignItems: 'center', flexDirection: 'row' } });
