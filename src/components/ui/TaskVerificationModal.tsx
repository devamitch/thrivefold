import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';
import { Badge } from './Badge';
import { PressableScale } from './PressableScale';
import { Card } from './Card';
import type { CalendarEvent } from '../../domain/calendar/universalCalendarEngine';
import { getTaskById } from '../../domain/game/gameCatalogService';
import type { TaskDefinition } from '../../domain/game/types';

export interface TaskVerificationModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onVerifyAndComplete: (
    event: CalendarEvent,
    options: { selfDeclaredHonest: boolean; elapsedSeconds: number; notes?: string }
  ) => void;
  onReschedule?: (event: CalendarEvent, newDate: string, newTime?: string) => void;
  onSkip?: (event: CalendarEvent) => void;
  onReplaceWithSpecialQuest?: (event: CalendarEvent) => void;
}

function getContextualInstructions(
  event: CalendarEvent,
  taskDef?: TaskDefinition
): Array<{ id: string; stepNumber: number; title: string; body: string }> {
  if (taskDef?.instructions && taskDef.instructions.length > 0) {
    return taskDef.instructions;
  }

  const titleLower = (event.title || '').toLowerCase();
  const cat = (event.category || '').toLowerCase();

  if (
    cat === 'mindfulness' ||
    cat === 'breathing' ||
    titleLower.includes('mindful') ||
    titleLower.includes('breath') ||
    titleLower.includes('calm') ||
    titleLower.includes('meditat') ||
    titleLower.includes('parasympathetic')
  ) {
    return [
      {
        id: 'ctx-step-1',
        stepNumber: 1,
        title: 'Centering Posture',
        body: 'Find a calm, upright seating position. Relax your shoulders away from your ears and soften your gaze.',
      },
      {
        id: 'ctx-step-2',
        stepNumber: 2,
        title: 'Diaphragmatic Rhythm',
        body: 'Inhale gently through your nose into your lower abdomen for 4 seconds, pause softly, then exhale for 6 seconds.',
      },
      {
        id: 'ctx-step-3',
        stepNumber: 3,
        title: 'Mindful Grounding',
        body: 'Observe current sensations without resistance. Allow mental static to settle naturally with each out-breath.',
      },
    ];
  }

  if (cat === 'sleep' || titleLower.includes('sleep') || titleLower.includes('wind down')) {
    return [
      {
        id: 'ctx-step-1',
        stepNumber: 1,
        title: 'Circadian Dimming',
        body: 'Lower ambient lighting and put digital screens away to support natural melatonin synthesis.',
      },
      {
        id: 'ctx-step-2',
        stepNumber: 2,
        title: 'Somatic Body Scan',
        body: 'Scan through your body from crown to toes, releasing tension in your jaw, neck, and lower back.',
      },
    ];
  }

  if (
    cat === 'nutrition' ||
    titleLower.includes('water') ||
    titleLower.includes('hydrat') ||
    titleLower.includes('fuel')
  ) {
    return [
      {
        id: 'ctx-step-1',
        stepNumber: 1,
        title: 'Mindful Hydration',
        body: 'Drink a glass of clean water slowly, focusing on the sensory feeling of replenishment.',
      },
      {
        id: 'ctx-step-2',
        stepNumber: 2,
        title: 'Nutritional Awareness',
        body: 'Choose wholesome, nutrient-dense ingredients that give sustained physical vitality.',
      },
    ];
  }

  // Default general wellness/movement steps (never cat-cow for non-desk decompression)
  return [
    {
      id: 'ctx-step-1',
      stepNumber: 1,
      title: 'Initial Setup',
      body: 'Clear your space and take a steady breath to arrive fully in the moment.',
    },
    {
      id: 'ctx-step-2',
      stepNumber: 2,
      title: 'Engaged Execution',
      body: 'Perform the practice with gentle control, keeping within your body’s comfortable range of motion.',
    },
    {
      id: 'ctx-step-3',
      stepNumber: 3,
      title: 'Grounding Reflection',
      body: 'Pause for a moment, notice how your body and mind feel, and acknowledge your effort.',
    },
  ];
}

export function TaskVerificationModal({
  visible,
  event,
  onClose,
  onVerifyAndComplete,
  onReschedule,
  onSkip,
  onReplaceWithSpecialQuest,
}: TaskVerificationModalProps) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const [selfDeclaredHonest, setSelfDeclaredHonest] = useState(true);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [timerDuration, setTimerDuration] = useState(180);
  const [aiCoachingFeedback, setAiCoachingFeedback] = useState<string | null>(null);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);

  // Preserve event across dismissal to prevent flash on close
  const lastEventRef = useRef<CalendarEvent | null>(event);
  if (event) {
    lastEventRef.current = event;
  }
  const displayEvent = event || lastEventRef.current;

  // Look up full TaskDefinition from catalog
  const rawTaskId = (displayEvent?.metadata as any)?.taskId || displayEvent?.id;
  const taskDef: TaskDefinition | undefined = displayEvent
    ? (rawTaskId ? getTaskById(rawTaskId) : undefined) ??
      getTaskById(displayEvent.id) ??
      getTaskById(displayEvent.title)
    : undefined;

  const instructions = displayEvent ? getContextualInstructions(displayEvent, taskDef) : [];

  const defaultDuration = (taskDef?.estimatedDurationMinutes ?? 3) * 60;

  useEffect(() => {
    if (visible) {
      const dur = taskDef?.estimatedDurationMinutes ? taskDef.estimatedDurationMinutes * 60 : 180;
      setTimerActive(false);
      setSecondsRemaining(dur);
      setTimerDuration(dur);
      setSelfDeclaredHonest(true);
      setReflectionNotes('');
      setAiCoachingFeedback(null);
      setIsAiEvaluating(false);
    }
  }, [visible, displayEvent?.id, taskDef?.estimatedDurationMinutes]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!displayEvent) return null;

  const isCompleted = displayEvent.status === 'completed';
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerProgress =
    timerDuration > 0 ? ((timerDuration - secondsRemaining) / timerDuration) * 100 : 0;

  const taskPointsReward = taskDef?.points.taskPoints ?? 15;
  const xpReward = taskDef?.points.xp ?? 25;
  const coinsReward = taskDef?.points.coins ?? 10;

  const handleVerify = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onVerifyAndComplete(displayEvent, {
      selfDeclaredHonest,
      elapsedSeconds: timerDuration - secondsRemaining || 60,
      notes: reflectionNotes.trim() || undefined,
    });
    onClose();
  };

  const handleRequestAiCoaching = () => {
    if (!reflectionNotes.trim()) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }
    setIsAiEvaluating(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    // Genuine, honest local reflection coach (deterministic, private, no fabricated biometric data)
    setTimeout(() => {
      setIsAiEvaluating(false);
      const noteLower = reflectionNotes.toLowerCase();
      let feedback = 'Mindful effort recorded. Acknowledging your body with honest awareness builds sustainable vitality.';
      if (noteLower.includes('tired') || noteLower.includes('fatigue') || noteLower.includes('sore')) {
        feedback = 'Gentle awareness noted: honoring fatigue is active biological recovery. Prioritize hydration and restorative stillness tonight.';
      } else if (noteLower.includes('calm') || noteLower.includes('peace') || noteLower.includes('relaxed')) {
        feedback = 'Vagus nerve regulation successful: your autonomic system responded positively to this somatic practice.';
      } else if (noteLower.includes('tight') || noteLower.includes('stiff') || noteLower.includes('back')) {
        feedback = 'Tension release recognized: continue gentle breathwork to ease the lumbosacral fascia without straining.';
      }
      setAiCoachingFeedback(feedback);
    }, 450);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close verification modal"
          />

          <View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 20) + 12,
              },
            ]}
          >
            {/* Drag Handle Bar */}
            <View style={styles.handleBar}>
              <View style={styles.handlePill} />
            </View>

            {/* Header Row */}
            <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
              <View style={styles.flex}>
                <View style={styles.badgeRow}>
                  <Badge
                    label={(taskDef?.category ?? displayEvent.category).toUpperCase()}
                    variant={isCompleted ? 'success' : 'primary'}
                  />
                  <Badge
                    label={`${taskDef?.estimatedDurationMinutes ?? 5} MIN`}
                    variant="neutral"
                    style={{ marginLeft: 6 }}
                  />
                  <View style={[styles.pointsBadge, { backgroundColor: colors.surface1, marginLeft: 6 }]}>
                    <Ionicons name="ribbon-outline" size={13} color={colors.primary} />
                    <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 4 }]}>
                      +{taskPointsReward} pts • +{xpReward} XP
                    </Text>
                  </View>
                </View>

                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>
                  {taskDef?.title ?? displayEvent.title}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {taskDef?.purpose ?? displayEvent.description ?? 'Complete with mindful presence.'}
                </Text>
              </View>

              <PressableScale
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.surface1 }]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </PressableScale>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
            >
              {/* Step-by-Step Instructions */}
              {instructions && instructions.length > 0 ? (
                <View style={{ marginTop: spacing.xs }}>
                  <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                    STEP-BY-STEP GUIDANCE
                  </Text>
                  {instructions.map((step) => (
                    <View
                      key={step.id}
                      style={[styles.stepItem, { backgroundColor: colors.surface1 }]}
                    >
                      <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[typography.captionBold, { color: colors.onPrimary }]}>
                          {step.stepNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                          {step.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, lineHeight: 18 }]}>
                          {step.body}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Safety Constraints / Cautions if present */}
              {taskDef?.safetyConstraints && taskDef.safetyConstraints.length > 0 ? (
                <View style={[styles.safetyCard, { backgroundColor: colors.surface1, marginTop: spacing.sm }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                      Mindful Safety & Comfort
                    </Text>
                    {taskDef.safetyConstraints.map((sc, i) => (
                      <Text key={i} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        • {sc}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Status Banner if Completed */}
              {isCompleted ? (
                <View style={[styles.completedBanner, { backgroundColor: colors.primaryAlpha, marginTop: spacing.md }]}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[typography.subbodyBold, { color: colors.primary }]}>
                      Verified & Completed
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      +{taskPointsReward} Daily Points & +{xpReward} XP logged to your sanctuary record.
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {/* Mindful Practice Timer */}
                  <View style={[styles.timerCard, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                    <View style={styles.timerHeader}>
                      <View style={styles.row}>
                        <Ionicons name="timer-outline" size={16} color={colors.primary} />
                        <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
                          MINDFUL PRACTICE TIMER
                        </Text>
                      </View>

                      <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                        {timerDuration / 60}m Practice
                      </Text>
                    </View>

                    <Text style={[typography.display, { color: colors.text.primary, textAlign: 'center', marginVertical: 8 }]}>
                      {timerDisplay}
                    </Text>

                    {/* Progress Track */}
                    <View style={[styles.timerTrack, { backgroundColor: colors.background }]}>
                      <View
                        style={[
                          styles.timerFill,
                          {
                            backgroundColor: colors.primary,
                            width: `${timerProgress}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={[styles.timerActions, { marginTop: 10 }]}>
                      <Button
                        label={timerActive ? 'Pause Timer' : secondsRemaining === 0 ? 'Restart Timer' : 'Start Focus Timer'}
                        variant={timerActive ? 'outline' : 'primary'}
                        size="sm"
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch {}
                          if (secondsRemaining === 0) {
                            setSecondsRemaining(timerDuration);
                            setTimerActive(false);
                          } else {
                            setTimerActive(!timerActive);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>

                  {/* Private Personal Reflection (Evidence) */}
                  <View style={{ marginTop: spacing.md }}>
                    <View style={styles.rowBetween}>
                      <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                        PRIVATE REFLECTION & SHIFTS
                      </Text>
                      {reflectionNotes.trim().length > 3 && (
                        <PressableScale
                          onPress={handleRequestAiCoaching}
                          scaleTo={0.94}
                          accessibilityRole="button"
                          accessibilityLabel="Reflect with AI Coach"
                        >
                          <Text style={[typography.captionBold, { color: colors.primary }]}>
                            {isAiEvaluating ? 'Reflecting...' : 'AI Coach Insight'}
                          </Text>
                        </PressableScale>
                      )}
                    </View>

                    <TextInput
                      value={reflectionNotes}
                      onChangeText={setReflectionNotes}
                      placeholder="How did your body and mind feel? Any tensions, relief, or energy shifts..."
                      placeholderTextColor={colors.text.muted}
                      multiline
                      style={[
                        styles.notesInput,
                        {
                          backgroundColor: colors.surface1,
                          color: colors.text.primary,
                          borderColor: colors.primary + '20',
                        },
                      ]}
                    />

                    {/* AI Coach Feedback Callout */}
                    {aiCoachingFeedback ? (
                      <View style={[styles.aiFeedbackCard, { backgroundColor: colors.surface1, borderColor: colors.primary + '30' }]}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
                        <Text style={[typography.caption, { color: colors.text.primary, marginLeft: 8, flex: 1, lineHeight: 18 }]}>
                          {aiCoachingFeedback}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Honest Self-Declaration Check */}
                  <Pressable
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setSelfDeclaredHonest(!selfDeclaredHonest);
                    }}
                    style={[
                      styles.declarationRow,
                      {
                        backgroundColor: colors.surface1,
                        marginTop: spacing.sm,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selfDeclaredHonest ? colors.primary : 'transparent',
                          borderColor: selfDeclaredHonest ? colors.primary : colors.text.muted,
                        },
                      ]}
                    >
                      {selfDeclaredHonest ? (
                        <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
                      ) : null}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                        Honest Mindful Self-Declaration
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        I confirm with calm presence that I completed this wellness practice.
                      </Text>
                    </View>
                  </Pressable>

                  {/* Primary Verification Action */}
                  <Button
                    label={`Verify & Complete (+${taskPointsReward} pts)`}
                    variant="primary"
                    onPress={handleVerify}
                    style={{ marginTop: spacing.md }}
                  />

                  {/* Adaptive Alternatives Row: Replace from Vault or Skip */}
                  <View style={[styles.alternativesRow, { marginTop: 10 }]}>
                    <Button
                      label="Replace from Vault"
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        if (onReplaceWithSpecialQuest) {
                          onReplaceWithSpecialQuest(displayEvent);
                        } else if (onSkip) {
                          onSkip(displayEvent);
                        }
                        onClose();
                      }}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                    <Button
                      label="Skip Today (0 pts)"
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        if (onSkip) onSkip(displayEvent);
                        onClose();
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 8,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1CAC2',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  flex: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 12,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  timerCard: {
    padding: 12,
    borderRadius: 14,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timerTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  aiFeedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
