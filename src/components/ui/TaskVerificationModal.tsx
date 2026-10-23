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
      { id: 'ctx-1', stepNumber: 1, title: 'Centering Posture', body: 'Find a calm, upright position. Relax your shoulders and soften your gaze.' },
      { id: 'ctx-2', stepNumber: 2, title: 'Diaphragmatic Rhythm', body: 'Inhale through your nose for 4s, pause, exhale for 6s.' },
      { id: 'ctx-3', stepNumber: 3, title: 'Mindful Grounding', body: 'Observe sensations without resistance. Let each out-breath settle your mind.' },
    ];
  }

  if (cat === 'sleep' || titleLower.includes('sleep') || titleLower.includes('wind down')) {
    return [
      { id: 'ctx-1', stepNumber: 1, title: 'Circadian Dimming', body: 'Lower ambient lighting and put screens away.' },
      { id: 'ctx-2', stepNumber: 2, title: 'Body Scan', body: 'Scan from crown to toes, releasing tension in jaw, neck, and lower back.' },
    ];
  }

  if (cat === 'nutrition' || titleLower.includes('water') || titleLower.includes('hydrat') || titleLower.includes('fuel')) {
    return [
      { id: 'ctx-1', stepNumber: 1, title: 'Mindful Hydration', body: 'Drink a glass of water slowly, focusing on replenishment.' },
      { id: 'ctx-2', stepNumber: 2, title: 'Nutritional Awareness', body: 'Choose nutrient-dense ingredients for sustained vitality.' },
    ];
  }

  return [
    { id: 'ctx-1', stepNumber: 1, title: 'Setup', body: 'Clear your space and take a steady breath.' },
    { id: 'ctx-2', stepNumber: 2, title: 'Execute', body: 'Perform the practice with gentle control within your comfortable range.' },
    { id: 'ctx-3', stepNumber: 3, title: 'Reflect', body: 'Pause, notice how you feel, and acknowledge your effort.' },
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
    }
  }, [visible, displayEvent?.id, taskDef?.estimatedDurationMinutes]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
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

  const handleVerify = () => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    onVerifyAndComplete(displayEvent, {
      selfDeclaredHonest,
      elapsedSeconds: timerDuration - secondsRemaining || 60,
      notes: reflectionNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 20) + 12,
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handleBar}>
              <View style={[styles.handlePill, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
              <View style={styles.flex}>
                <Text style={[typography.heading, { color: colors.text.primary }]}>
                  {taskDef?.title ?? displayEvent.title}
                </Text>
                <View style={[styles.metaRow, { marginTop: 6 }]}>
                  <Badge
                    label={(taskDef?.category ?? displayEvent.category).toUpperCase()}
                    variant={isCompleted ? 'success' : 'primary'}
                  />
                  <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 8 }]}>
                    {taskDef?.estimatedDurationMinutes ?? 5} min
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 8 }]}>
                    +{taskPointsReward} pts · +{xpReward} XP
                  </Text>
                </View>
              </View>
              <PressableScale
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.surface1 }]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </PressableScale>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 8 }}
            >
              {/* Purpose */}
              {(taskDef?.purpose || displayEvent.description) && (
                <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.sm, lineHeight: 20 }]}>
                  {taskDef?.purpose ?? displayEvent.description}
                </Text>
              )}

              {/* Step-by-Step Instructions */}
              {instructions.length > 0 && (
                <View style={[styles.instructionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {instructions.map((step, idx) => (
                    <View key={step.id} style={[styles.stepRow, idx > 0 && { marginTop: 10 }]}>
                      <View style={[styles.stepBadge, { backgroundColor: colors.primaryAlpha }]}>
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          {step.stepNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                          {step.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, lineHeight: 17 }]}>
                          {step.body}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Safety Constraints */}
              {taskDef?.safetyConstraints && taskDef.safetyConstraints.length > 0 && (
                <View style={[styles.safetyCard, { backgroundColor: colors.warningSurface, marginTop: spacing.sm }]}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={colors.warning} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    {taskDef.safetyConstraints.map((sc, i) => (
                      <Text key={i} style={[typography.caption, { color: colors.text.secondary }]}>
                        • {sc}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Completed State */}
              {isCompleted ? (
                <View style={[styles.completedBanner, { backgroundColor: colors.successSurface, marginTop: spacing.md }]}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={[typography.subbodyBold, { color: colors.success }]}>
                      Verified & Complete
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      +{taskPointsReward} pts & +{xpReward} XP logged.
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  {/* Timer */}
                  <View style={[styles.timerCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
                    <Text style={[typography.display, { color: colors.text.primary, textAlign: 'center' }]}>
                      {timerDisplay}
                    </Text>
                    <View style={[styles.timerTrack, { backgroundColor: colors.surface1, marginTop: 8 }]}>
                      <View
                        style={[styles.timerFill, { backgroundColor: colors.primary, width: `${timerProgress}%` }]}
                      />
                    </View>
                    <Button
                      label={timerActive ? 'Pause' : secondsRemaining === 0 ? 'Restart' : 'Start Timer'}
                      variant={timerActive ? 'outline' : 'primary'}
                      size="sm"
                      onPress={() => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        if (secondsRemaining === 0) {
                          setSecondsRemaining(timerDuration);
                          setTimerActive(false);
                        } else {
                          setTimerActive(!timerActive);
                        }
                      }}
                      style={{ marginTop: 10 }}
                    />
                  </View>

                  {/* Reflection (optional) */}
                  <TextInput
                    value={reflectionNotes}
                    onChangeText={setReflectionNotes}
                    placeholder="How did it feel? (optional)"
                    placeholderTextColor={colors.text.muted}
                    multiline
                    style={[
                      styles.notesInput,
                      {
                        backgroundColor: colors.surface,
                        color: colors.text.primary,
                        borderColor: colors.border,
                        marginTop: spacing.sm,
                      },
                    ]}
                  />

                  {/* Self-Declaration */}
                  <Pressable
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch {}
                      setSelfDeclaredHonest(!selfDeclaredHonest);
                    }}
                    style={[styles.declarationRow, { backgroundColor: colors.surface, marginTop: spacing.sm }]}
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
                      {selfDeclaredHonest && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                    </View>
                    <Text style={[typography.subbody, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
                      I honestly completed this practice
                    </Text>
                  </Pressable>

                  {/* Actions */}
                  <Button
                    label={`Verify & Complete (+${taskPointsReward} pts)`}
                    variant="primary"
                    onPress={handleVerify}
                    style={{ marginTop: spacing.md }}
                  />

                  <View style={[styles.altRow, { marginTop: 8 }]}>
                    {onReplaceWithSpecialQuest && (
                      <Button
                        label="Replace"
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          onReplaceWithSpecialQuest(displayEvent);
                          onClose();
                        }}
                        style={{ flex: 1, marginRight: 4 }}
                      />
                    )}
                    {onSkip && (
                      <Button
                        label="Skip (0 pts)"
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          onSkip(displayEvent);
                          onClose();
                        }}
                        style={{ flex: 1 }}
                      />
                    )}
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
  keyboardRoot: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 6,
  },
  handleBar: { alignItems: 'center', paddingVertical: 8 },
  handlePill: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  flex: { flex: 1, paddingRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  timerTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },
  notesInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 56,
    textAlignVertical: 'top',
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
  altRow: { flexDirection: 'row', alignItems: 'center' },
});
