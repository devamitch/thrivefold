/**
 * CoachIntro — the pre-workout screen: plan details, exercise list, safety note,
 * and the "start" button. Shown full-screen before the live session begins.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exerciseById } from '../../domain/fitness/workouts';
import { WORKOUT_FORM_MULTIPLIER, WORKOUT_XP_BASE } from '../../domain/game/progression';
import { getExerciseCapability } from '../../domain/pose/capabilityRegistry';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FrostedView } from '../ui/FrostedView';
import { PressableScale } from '../ui/PressableScale';
import { Squircle } from '../ui/Squircle';
import { GestureRemoteGuideModal } from './GestureRemoteGuideModal';

import type { Exercise, WorkoutPlan } from '../../domain/fitness/workouts';

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
      {/* Pinned Sticky Frosted Header Bar */}
      <FrostedView
        tone="surface"
        intensity={60}
        tintOpacity={0.9}
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 6,
            paddingBottom: 8,
            paddingHorizontal: spacing.base,
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
            zIndex: 10,
          },
        ]}
      >
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.round, { backgroundColor: colors.surface1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </PressableScale>
        <View style={styles.topBarCenter}>
          <Text
            style={[
              typography.captionBold,
              { color: colors.accentText, letterSpacing: 0.8, textTransform: 'uppercase' },
            ]}
          >
            Virtual Coach
          </Text>
        </View>
        <View style={styles.roundPlaceholder} />
      </FrostedView>

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom + 84,
          paddingHorizontal: spacing.base,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.xs }]}>
          {plan.title}
        </Text>

        {linkedQuest ? (
          <View style={[styles.row, { marginTop: spacing.xs }]}>
            <Ionicons name="flag-outline" size={15} color={colors.primary} />
            <Text
              style={[
                typography.subbodyBold,
                styles.flex,
                { color: colors.primary, marginLeft: 6 },
              ]}
              numberOfLines={1}
            >
              For today's quest: {linkedQuest.title}
            </Text>
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
            Standalone workout · Saved to history and calendar
          </Text>
        )}

        <Text style={[typography.body, { color: colors.text.secondary, marginTop: 4 }]}>
          Your camera fills the stage with live skeleton tracking and reps; tutorial plays below.
        </Text>

        {/* Compact Hands-Free Remote Control Box */}
        {cameraBuilt ? (
          <Squircle
            radius={18}
            fill={colors.surface1}
            style={[
              styles.gestureBox,
              {
                borderColor: colors.border,
                borderWidth: StyleSheet.hairlineWidth,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <View style={styles.row}>
                <View style={[styles.tipIconBox, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="hand-left-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Hands-Free Gestures & Voice
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    Control 6–10ft away without touching phone
                  </Text>
                </View>
              </View>

              <PressableScale
                onPress={() => setShowGestureModal(true)}
                style={[styles.guidePill, { backgroundColor: colors.primaryAlpha }]}
                accessibilityRole="button"
                accessibilityLabel="Open Camera Gesture Guide"
              >
                <Ionicons name="help-circle-outline" size={14} color={colors.primary} />
                <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>
                  Guide
                </Text>
              </PressableScale>
            </View>

            <View style={styles.gestureGrid}>
              {[
                { icon: 'hand-left-outline', label: '1 Hand', action: 'Demo Play/Pause' },
                { icon: 'body-outline', label: '2 Hands', action: 'Finish Set / Next' },
                { icon: 'pause-circle-outline', label: 'Cross Arms', action: 'Pause Workout' },
                { icon: 'mic-outline', label: 'Voice', action: '"Coach Pause / Next"' },
              ].map((g) => (
                <View
                  key={g.label}
                  style={[
                    styles.gesturePill,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name={g.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={[typography.captionBold, { color: colors.text.primary, marginLeft: 5 }]}
                  >
                    {g.label}
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}
                    numberOfLines={1}
                  >
                    · {g.action}
                  </Text>
                </View>
              ))}
            </View>
          </Squircle>
        ) : null}

        {/* Feature Highlights Card */}
        <Card style={{ padding: spacing.sm, marginTop: spacing.sm }}>
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
              'volume-high-outline',
              'Voice counts in, names reps, confirms gestures, and coaches live.',
            ],
            [
              'shield-checkmark-outline',
              '100% on-device. No photos or video are saved or sent anywhere.',
            ],
          ].map(([icon, text]) => (
            <View key={text} style={[styles.row, { marginVertical: 4 }]}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={16}
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

        <Text
          style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md }]}
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
            <View
              key={i.exerciseId}
              style={[
                styles.exerciseCard,
                { backgroundColor: colors.surface1, marginTop: spacing.xs },
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
            </View>
          );
        })}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
          Every movement displays an honest capability level. Camera-checked exercises verify form.
        </Text>
        {exercise.safety ? (
          <Text style={[typography.caption, { color: colors.warning, marginTop: spacing.xs }]}>
            {exercise.safety}
          </Text>
        ) : null}
      </ScrollView>

      {/* Frosted Sticky Bottom Footer */}
      <FrostedView
        tone="surface"
        intensity={70}
        tintOpacity={0.9}
        style={[
          styles.stickyFooter,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 10,
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

      {/* Interactive Hands-Free Gesture Guide Bottom Sheet */}
      <GestureRemoteGuideModal
        visible={showGestureModal}
        onClose={() => setShowGestureModal(false)}
      />
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
    borderRadius: 12,
    padding: 10,
  },
  flex: { flex: 1 },
  gestureBox: {
    padding: 12,
  },
  gestureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  gesturePill: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: '48.5%',
  },
  guidePill: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  round: {
    alignItems: 'center',
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  roundPlaceholder: {
    height: 38,
    width: 38,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  stickyFooter: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  tipIconBox: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
  },
});

