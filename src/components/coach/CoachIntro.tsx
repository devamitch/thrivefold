/**
 * CoachIntro — the pre-workout screen: plan details, exercise list, safety note,
 * and the "start" button. Shown full-screen before the live session begins.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import { exerciseById } from '../../domain/fitness/workouts';
import { movementForExercise } from '../../domain/pose/movement';
import { WORKOUT_XP_BASE, WORKOUT_FORM_MULTIPLIER } from '../../domain/game/progression';
import { useTheme } from '../../theme/useTheme';

import type { WorkoutPlan, Exercise } from '../../domain/fitness/workouts';

interface CoachIntroProps {
  plan: WorkoutPlan;
  exercise: Exercise;
  cameraBuilt: boolean;
  linkedQuest?: { title: string } | null;
  onStart: () => void;
  onBack: () => void;
}

export function CoachIntro({ plan, exercise, cameraBuilt, linkedQuest, onStart, onBack }: CoachIntroProps) {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.base,
        }}
      >
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.round, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </PressableScale>

        <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.lg }]}>
          {plan.title}
        </Text>

        {linkedQuest ? (
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons name="flag-outline" size={16} color={colors.primary} />
            <Text style={[typography.subbodyBold, styles.flex, { color: colors.primary, marginLeft: 6 }]}>
              For today's quest: {linkedQuest.title}. Finishing completes it.
            </Text>
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            A standalone workout: saved to your history and calendar.
          </Text>
        )}

        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Your camera fills the stage with a live skeleton and rep count; the tutorial plays below it.
        </Text>

        <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
          {[
            ['videocam-outline', cameraBuilt
              ? 'The camera counts reps and checks your form for the exercises it knows.'
              : 'Form checking is not available in this build; the coach still runs videos, sets and rest.'],
            ['pause-circle-outline', 'If your form slips, the video pauses and shows exactly what to fix.'],
            ['ribbon-outline', `Good form (80%+) earns ${WORKOUT_XP_BASE * WORKOUT_FORM_MULTIPLIER} XP instead of ${WORKOUT_XP_BASE}.`],
            ['hand-left-outline', 'Hands-free: one hand above head = pause/play video. Both hands = finish set or skip rest.'],
            ['volume-high-outline', 'Voice counts in, names reps and says what to fix. You can mute it.'],
            ['eye-off-outline', 'Everything runs on this phone. No photos or video are saved or sent.'],
            ['phone-portrait-outline', 'Prop the phone up about two metres away, side-on, with your whole body in view.'],
          ].map(([icon, text]) => (
            <View key={text} style={[styles.row, { marginBottom: spacing.sm }]}>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 10 }]}>
                {text}
              </Text>
            </View>
          ))}
        </Card>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>
          In this workout
        </Text>
        {plan.items.map((i) => {
          const ex = exerciseById(i.exerciseId);
          return (
            <View key={i.exerciseId} style={[styles.row, { marginTop: spacing.sm }]}>
              <Ionicons
                name={movementForExercise(i.exerciseId) ? 'scan-outline' : 'list-outline'}
                size={16}
                color={movementForExercise(i.exerciseId) ? colors.primary : colors.text.muted}
              />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
                {ex?.name}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {i.sets} x {i.target} {ex?.timed ? 's' : 'reps'}
              </Text>
            </View>
          );
        })}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          Exercises marked with the scan icon are checked by the camera.
        </Text>
        <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.md }]}>
          {exercise.safety}
        </Text>
        <Button
          label={cameraBuilt ? 'Allow camera and start' : 'Start'}
          size="lg"
          onPress={onStart}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  round: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  row: { alignItems: 'center', flexDirection: 'row' },
});
