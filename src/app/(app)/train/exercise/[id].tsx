import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppHeader } from '../../../../components/ui/AppHeader';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { YouTubePlayer } from '../../../../components/workout/YouTubePlayer';
import { videoFor } from '../../../../content/exerciseVideos';
import { exerciseById } from '../../../../domain/fitness/workouts';
import { movementForExercise } from '../../../../domain/pose/movement';
import { useTheme } from '../../../../theme/useTheme';

/** One exercise: how to do it, the tutorial, safety, and ways to do or log it. */
export default function ExerciseDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = exerciseById(id ?? '');
  if (!ex) {
    return (
      <ScreenContainer header={<AppHeader title="Exercise" showBack />} scrollMode="shell-scroll-view">
        <Text style={[typography.body, { color: colors.text.secondary }]}>This exercise was not found.</Text>
      </ScreenContainer>
    );
  }
  const video = videoFor(ex.id);
  const movement = movementForExercise(ex.id);

  return (
    <ScreenContainer header={<AppHeader title={ex.name} subtitle={`${ex.pattern} · ${ex.equipment === 'none' ? 'no equipment' : ex.equipment}`} showBack />} scrollMode="shell-scroll-view">
      <SquircleSurface style={[styles.video, { backgroundColor: colors.surface1 }]}>
        <YouTubePlayer videoId={video?.videoId} query={`${ex.name} proper form tutorial`} style={StyleSheet.absoluteFill} />
      </SquircleSurface>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
        {video ? `${video.title} · ${video.channel} (YouTube)` : 'YouTube search results: pick a video, it plays here. Not a checked tutorial.'}
      </Text>

      <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
        <Text style={[typography.captionBold, { color: colors.text.muted }]}>HOW TO</Text>
        {ex.steps.map((st, i) => (
          <Text key={st} style={[typography.body, { color: colors.text.primary, marginTop: 6 }]}>
            {i + 1}. {st}
          </Text>
        ))}
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.md }]}>Easier: {ex.easier}</Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>Harder: {ex.harder}</Text>
        <SquircleSurface style={[styles.row, { marginTop: spacing.md }]}>
          <Ionicons name="warning-outline" size={16} color={colors.warning} />
          <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 6 }]}>{ex.safety} Stop if anything hurts.</Text>
        </SquircleSurface>
      </Card>

      {movement ? (
        <Link href={`/(app)/health/pose-check?movement=${movement.id}` as Href} asChild>
          <Button
            label="Check my form with the camera"
            style={{ marginTop: spacing.md }}
          />
        </Link>
      ) : (
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
          The camera cannot check this movement yet. Log it by hand instead.
        </Text>
      )}
      <Link href={`/(app)/train/log?exercise=${ex.id}` as Href} asChild>
        <Button label="Log reps I already did" variant="outline" style={{ marginTop: spacing.sm }} />
      </Link>
      <SquircleSurface style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'flex-start', flexDirection: 'row' },
  video: { aspectRatio: 16 / 9, borderRadius: 18, overflow: 'hidden', width: '100%' },
});
