import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';
import { Badge } from './Badge';
import { PressableScale } from './PressableScale';
import type { CalendarEvent } from '../../domain/calendar/universalCalendarEngine';

export interface TaskVerificationModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onVerifyAndComplete: (event: CalendarEvent, options: { selfDeclaredHonest: boolean; elapsedSeconds: number }) => void;
  onReschedule?: (event: CalendarEvent, newDate: string, newTime?: string) => void;
  onSkip?: (event: CalendarEvent) => void;
}

export function TaskVerificationModal({
  visible,
  event,
  onClose,
  onVerifyAndComplete,
  onReschedule,
  onSkip,
}: TaskVerificationModalProps) {
  const { colors, typography, spacing } = useTheme();

  const [selfDeclaredHonest, setSelfDeclaredHonest] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2-min default quick focus
  const [timerDuration, setTimerDuration] = useState(120);

  useEffect(() => {
    if (visible) {
      setTimerActive(false);
      setSecondsRemaining(120);
      setTimerDuration(120);
      setSelfDeclaredHonest(true);
    }
  }, [visible, event]);

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

  if (!visible || !event) return null;

  const isCompleted = event.status === 'completed';
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerProgress = timerDuration > 0 ? ((timerDuration - secondsRemaining) / timerDuration) * 100 : 0;

  const handleVerify = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onVerifyAndComplete(event, {
      selfDeclaredHonest,
      elapsedSeconds: timerDuration - secondsRemaining || 60,
    });
    onClose();
  };

  const handleToggleTimer = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setTimerActive(!timerActive);
  };

  const handleResetTimer = (duration: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimerDuration(duration);
    setSecondsRemaining(duration);
    setTimerActive(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(24)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleBar}>
            <View style={styles.handlePill} />
          </View>

          {/* Header Row */}
          <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
            <View style={styles.flex}>
              <View style={styles.badgeRow}>
                <Badge
                  label={event.category.toUpperCase()}
                  variant={isCompleted ? 'success' : 'primary'}
                />
                {event.startTime ? (
                  <View style={[styles.timeChip, { backgroundColor: colors.surface1, marginLeft: 8 }]}>
                    <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
                    <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 4 }]}>
                      {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>
                {event.title}
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
            {/* Description Card */}
            {event.description ? (
              <View style={[styles.descCard, { backgroundColor: colors.surface1 }]}>
                <Text style={[typography.subbody, { color: colors.text.primary, lineHeight: 20 }]}>
                  {event.description}
                </Text>
              </View>
            ) : null}

            {/* Status Banner */}
            {isCompleted ? (
              <View style={[styles.completedBanner, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[typography.subbodyBold, { color: colors.primary }]}>
                    Verified & Completed
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Task points and experience logged to your sanctuary record.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {/* Interactive Practice Timer */}
                <View style={[styles.timerCard, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
                  <View style={styles.timerHeader}>
                    <View style={styles.row}>
                      <Ionicons name="stopwatch-outline" size={16} color={colors.primary} />
                      <Text style={[typography.label, { color: colors.primary, marginLeft: 6 }]}>
                        PRACTICE TIMER
                      </Text>
                    </View>
                    <View style={styles.timerPresets}>
                      {[
                        { label: '2m', sec: 120 },
                        { label: '5m', sec: 300 },
                        { label: '10m', sec: 600 },
                      ].map((preset) => (
                        <PressableScale
                          key={preset.sec}
                          onPress={() => handleResetTimer(preset.sec)}
                          style={[
                            styles.presetChip,
                            {
                              backgroundColor: timerDuration === preset.sec ? colors.primary : 'transparent',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              typography.captionBold,
                              {
                                color: timerDuration === preset.sec ? colors.onPrimary : colors.text.secondary,
                              },
                            ]}
                          >
                            {preset.label}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                  </View>

                  <Text style={[typography.display, { color: colors.text.primary, textAlign: 'center', marginVertical: 12 }]}>
                    {timerDisplay}
                  </Text>

                  {/* Progress Line */}
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

                  <View style={[styles.timerActions, { marginTop: 14 }]}>
                    <Button
                      label={timerActive ? 'Pause Timer' : secondsRemaining === 0 ? 'Restart Timer' : 'Start Focus Timer'}
                      variant={timerActive ? 'outline' : 'primary'}
                      onPress={secondsRemaining === 0 ? () => handleResetTimer(timerDuration) : handleToggleTimer}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>

                {/* Honest Verification Declaration */}
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
                      marginTop: spacing.md,
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
                      Honest Self-Declaration
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      I confirm with mindful presence that I engaged in this habit or task.
                    </Text>
                  </View>
                </Pressable>

                {/* Primary Action Button */}
                <Button
                  label="Complete & Verify (+10 TP · +15 XP)"
                  variant="primary"
                  onPress={handleVerify}
                  style={{ marginTop: spacing.lg }}
                />

                {/* Reschedule & Skip Actions */}
                <View style={[styles.secondaryRow, { marginTop: spacing.md }]}>
                  {onReschedule ? (
                    <PressableScale
                      onPress={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const tomStr = tomorrow.toISOString().split('T')[0];
                        onReschedule(event, tomStr);
                        onClose();
                      }}
                      style={[styles.secondaryActionBtn, { backgroundColor: colors.surface1 }]}
                    >
                      <Ionicons name="calendar-outline" size={15} color={colors.text.secondary} />
                      <Text style={[typography.subbodyBold, { color: colors.text.secondary, marginLeft: 6 }]}>
                        Postpone
                      </Text>
                    </PressableScale>
                  ) : null}

                  {onSkip ? (
                    <PressableScale
                      onPress={() => {
                        onSkip(event);
                        onClose();
                      }}
                      style={[styles.secondaryActionBtn, { backgroundColor: colors.surface1, marginLeft: 10 }]}
                    >
                      <Ionicons name="arrow-redo-outline" size={15} color={colors.text.secondary} />
                      <Text style={[typography.subbodyBold, { color: colors.text.secondary, marginLeft: 6 }]}>
                        Skip for Today
                      </Text>
                    </PressableScale>
                  ) : null}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    width: '100%',
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  descCard: {
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  timerCard: {
    padding: 16,
    borderRadius: 18,
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
  timerPresets: {
    flexDirection: 'row',
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
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
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
});
