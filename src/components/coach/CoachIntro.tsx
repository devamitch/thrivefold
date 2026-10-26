/**
 * CoachIntro — the pre-workout screen: plan details, exercise list, safety note,
 * and the "start" button. Shown full-screen before the live session begins.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Exercise, WorkoutPlan } from '../../domain/fitness/workouts';
import { exerciseById } from '../../domain/fitness/workouts';
import { WORKOUT_FORM_MULTIPLIER, WORKOUT_XP_BASE } from '../../domain/game/progression';
import { getExerciseCapability } from '../../domain/pose/capabilityRegistry';
import { useTheme } from '../../theme/useTheme';
import { AppHeader } from '../ui/AppHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FrostedView } from '../ui/FrostedView';
import { PressableScale } from '../ui/PressableScale';
import { ScreenContainer } from '../ui/ScreenContainer';
import { SquircleSurface } from '../ui/SquircleSurface';
import { GestureRemoteGuideModal } from './GestureRemoteGuideModal';

interface CoachIntroProps {
  plan: WorkoutPlan;
  exercise: Exercise;
  cameraBuilt: boolean;
  linkedQuest?: { title: string } | null;
  onStart: () => void;
  onBack: () => void;
}

export function CoachIntro({
  plan,
  exercise,
  cameraBuilt,
  linkedQuest,
  onStart,
  onBack,
}: CoachIntroProps) {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const [showGestureModal, setShowGestureModal] = useState(false);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScreenContainer
        header={
          <AppHeader
            title={plan.title}
            subtitle="Virtual Coach · AI Form & Reps"
            showBack
            onBack={onBack}
          />
        }
        headerMode="compact"
        scrollMode="shell-scroll-view"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 84 }}
      >
        <View style={{ paddingBottom: 16 }}>
          {linkedQuest ? (
            <View style={[styles.questBanner, { backgroundColor: colors.primaryAlpha, borderColor: colors.primary }]}>
              <Ionicons name="flag-outline" size={15} color={colors.primary} />
              <Text
                style={[
                  typography.subbodyBold,
                  styles.flex,
                  { color: colors.primary, marginLeft: 8 },
                ]}
                numberOfLines={2}
              >
                For today's quest: {linkedQuest.title}. Finishing completes it.
              </Text>
            </View>
          ) : (
            <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing.xs }]}>
              A standalone workout · Saved to your history and calendar
            </Text>
          )}

          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.xs }]}>
            Your camera fills the stage with a live skeleton and rep count; the tutorial video plays below it.
          </Text>

          {/* Compact Hands-Free Remote Control Banner */}
          {cameraBuilt ? (
            <PressableScale
              onPress={() => setShowGestureModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Open Camera Gesture & Voice Guide"
              style={{ marginBottom: spacing.xs }}
            >
              <SquircleSurface
                radius={16}
                fill={colors.surface1}
                style={[
                  styles.gestureBanner,
                  {
                    borderColor: colors.border,
                    borderWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.gestureIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="hand-left-outline" size={16} color={colors.primary} />
                </View>
                <View style={[styles.flex, { marginHorizontal: 10 }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Hands-Free Gestures & Voice
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
                    Wave to pause, 2 hands for next set, or speak commands
                  </Text>
                </View>
                <View style={[styles.guidePill, { backgroundColor: colors.primaryAlpha }]}>
                  <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>Guide</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.primary} style={{ marginLeft: 2 }} />
                </View>
              </SquircleSurface>
            </PressableScale>
          ) : null}

          {/* Feature Highlights Card */}
          <Card style={{ padding: spacing.sm, marginBottom: spacing.sm }}>
            {[
              [
                'videocam-outline',
                cameraBuilt
                  ? 'Camera counts reps and checks your form in real-time.'
                  : 'Guided sets, timer and rest available without camera verification.',
              ],
              [
                'ribbon-outline',
                `Good form (80%+) earns ${WORKOUT_XP_BASE * WORKOUT_FORM_MULTIPLIER} XP instead of ${WORKOUT_XP_BASE} XP.`,
              ],
              [
                'shield-checkmark-outline',
                '100% on-device. No photos or video are saved or sent anywhere.',
              ],
            ].map(([icon, text]) => (
              <View key={text} style={[styles.row, { marginVertical: 3 }]}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={15}
                  color={colors.primary}
                />
                <Text
                  style={[
                    typography.caption,
                    styles.flex,
                    { color: colors.text.secondary, marginLeft: 8 },
                  ]}
                >
                  {text}
                </Text>
              </View>
            ))}
          </Card>


        {/* Exercise Breakdown */}
        <Text
          style={[
            typography.subheading,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          In this workout
        </Text>

        {plan.items.map((i) => {
          const ex = exerciseById(i.exerciseId);
          const cap = getExerciseCapability(i.exerciseId);
          const framingText =
            cap.framing === 'floor'
              ? 'Floor view'
              : cap.framing === 'upper'
                ? 'Upper body'
                : cap.cameraAngle === 'side'
                  ? 'Side profile'
                  : 'Full body';

          return (
            <SquircleSurface
              key={i.exerciseId}
              radius={16}
              fill={colors.surface1}
              style={[
                styles.exerciseCard,
                {
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={styles.row}>
                <Ionicons
                  name={
                    cap.mode === 'camera_verified_reps' || cap.mode === 'camera_verified_hold'
                      ? 'scan-outline'
                      : cap.mode === 'camera_assisted_sequence'
                        ? 'pulse-outline'
                        : cap.mode === 'timer_guided'
                          ? 'timer-outline'
                          : 'book-outline'
                  }
                  size={16}
                  color={cap.isCameraVerified ? colors.primary : colors.text.muted}
                />
                <Text
                  style={[
                    typography.bodyBold,
                    styles.flex,
                    { color: colors.text.primary, marginLeft: 8 },
                  ]}
                >
                  {ex?.name}
                </Text>
                <View
                  style={[
                    styles.capBadge,
                    {
                      backgroundColor:
                        cap.badgeTone === 'verified'
                          ? colors.primaryAlpha
                          : cap.badgeTone === 'sequence'
                            ? colors.accent
                            : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      {
                        fontSize: 10,
                        color:
                          cap.badgeTone === 'verified'
                            ? colors.primary
                            : cap.badgeTone === 'sequence'
                              ? colors.text.inverse
                              : colors.text.secondary,
                      },
                    ]}
                  >
                    {cap.badgeLabel}
                  </Text>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 4, justifyContent: 'space-between' }]}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {i.sets} x {i.target} {ex?.timed ? 's' : 'reps'} · {framingText}
                </Text>
                {ex?.easier ? (
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.text.secondary, fontStyle: 'italic' },
                    ]}
                  >
                    Mod: {ex.easier}
                  </Text>
                ) : null}
              </View>
            </SquircleSurface>
          );
        })}

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
          Exercises with the scan icon are checked by the camera in real-time.
        </Text>

        {exercise.safety ? (
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons name="warning-outline" size={15} color={colors.warning} />
            <Text style={[typography.caption, styles.flex, { color: colors.warning, marginLeft: 6 }]}>
              {exercise.safety}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Interactive Hands-Free Gesture Guide Bottom Sheet */}
      <GestureRemoteGuideModal
        visible={showGestureModal}
        onClose={() => setShowGestureModal(false)}
      />
    </ScreenContainer>

    {/* Real Frosted Sticky Footer with Pinned Start Button */}
    <FrostedView
      tone="surface"
      intensity={75}
      tintOpacity={0.85}
      style={[
        styles.stickyFooter,
        {
          paddingBottom: Math.max(insets.bottom, 14),
          paddingTop: 12,
          paddingHorizontal: spacing.base,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Button
        label={cameraBuilt ? 'Allow camera and start' : 'Start workout'}
        size="lg"
        onPress={onStart}
      />
    </FrostedView>
  </View>
);
}

const styles = StyleSheet.create({
  capBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  exerciseCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flex: { flex: 1 },
  gestureBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  gestureIconCircle: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  guidePill: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  questBanner: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  stickyFooter: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

