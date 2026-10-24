/**
 * Thrivefold Period & Cycle Logger Sheet
 * Clinical-grade, serene bottom sheet for recording, editing, backdating, and correcting
 * menstrual bleeding records, flow intensities, and physical symptoms.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { useRootStore, PeriodLogRecord, FlowIntensity } from '../../stores/useRootStore';
import { Button } from './Button';
import { TextField } from './TextField';
import { PressableScale } from './PressableScale';
import { DatePickerModal } from './DatePickerModal';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';

interface PeriodLoggerModalProps {
  visible: boolean;
  initialDateStr: string;
  existingRecord?: PeriodLogRecord | null;
  onClose: () => void;
  onSaved?: () => void;
}

const FLOW_OPTIONS: {
  intensity: FlowIntensity;
  label: string;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    intensity: 'spotting',
    label: 'Spotting',
    desc: 'Light droplets',
    color: '#D47A88',
    bg: 'rgba(212, 122, 136, 0.12)',
  },
  {
    intensity: 'light',
    label: 'Light',
    desc: 'Gentle flow',
    color: '#DA7756',
    bg: 'rgba(218, 119, 86, 0.12)',
  },
  {
    intensity: 'medium',
    label: 'Medium',
    desc: 'Regular flow',
    color: '#C25538',
    bg: 'rgba(194, 85, 56, 0.15)',
  },
  {
    intensity: 'heavy',
    label: 'Heavy',
    desc: 'High volume',
    color: '#9E371C',
    bg: 'rgba(158, 55, 28, 0.18)',
  },
];

const COMMON_SYMPTOMS = [
  'Cramps',
  'Lower Back Ache',
  'Bloating',
  'Headache',
  'Tender Breasts',
  'Fatigue',
  'Mood Swings',
  'Food Cravings',
  'Joint Pain',
  'Nausea',
  'Restless Sleep',
  'Pelvic Heaviness',
];

export function PeriodLoggerModal({
  visible,
  initialDateStr,
  existingRecord,
  onClose,
  onSaved,
}: PeriodLoggerModalProps) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const logPeriod = useRootStore((s) => s.logPeriod);
  const editPeriod = useRootStore((s) => s.editPeriod);
  const deletePeriod = useRootStore((s) => s.deletePeriod);
  const showToast = useRootStore((s) => s.showToast);
  const showAlert = useRootStore((s) => s.showAlert);

  const [startDate, setStartDate] = useState(initialDateStr);
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(true);
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>('medium');
  const [painLevel, setPainLevel] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Cramps']);
  const [notes, setNotes] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      setStartDate(existingRecord.startDate);
      setEndDate(existingRecord.endDate || '');
      setIsOngoing(existingRecord.isOngoing ?? !existingRecord.endDate);
      setFlowIntensity(existingRecord.flowIntensity || 'medium');
      setPainLevel(existingRecord.painLevel ?? 3);
      setSelectedSymptoms(existingRecord.symptoms || []);
      setNotes(existingRecord.notes || '');
    } else {
      setStartDate(initialDateStr || formatLocalDate(new Date()));
      setEndDate('');
      setIsOngoing(true);
      setFlowIntensity('medium');
      setPainLevel(3);
      setSelectedSymptoms(['Cramps']);
      setNotes('');
    }
  }, [existingRecord, initialDateStr, visible]);

  if (!visible) return null;

  const toggleSymptom = (sym: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const cleanStart = startDate.trim() || initialDateStr || formatLocalDate(new Date());
    const cleanEnd = isOngoing ? undefined : (endDate.trim() || cleanStart);

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(cleanStart)) {
      showAlert({
        title: 'Invalid Start Date',
        message: 'Please enter a valid start date formatted as YYYY-MM-DD.',
        confirmText: 'Got it',
      });
      return;
    }
    if (cleanEnd && !dateRegex.test(cleanEnd)) {
      showAlert({
        title: 'Invalid End Date',
        message: 'Please enter a valid end date formatted as YYYY-MM-DD.',
        confirmText: 'Got it',
      });
      return;
    }
    if (cleanEnd && cleanEnd < cleanStart) {
      showAlert({
        title: 'Date Order Conflict',
        message: 'End date cannot be earlier than start date.',
        confirmText: 'Review dates',
      });
      return;
    }

    const payload = {
      startDate: cleanStart,
      endDate: cleanEnd,
      isOngoing,
      flowIntensity,
      painLevel,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    };

    if (existingRecord) {
      editPeriod(existingRecord.id, payload);
      showToast({
        type: 'success',
        title: 'Period Updated',
        message: `Saved corrections for ${payload.startDate}. Projections recalculated.`,
      });
    } else {
      logPeriod(payload);
      showToast({
        type: 'success',
        title: 'Period Logged',
        message: `Recorded bleeding starting ${payload.startDate}. Calendar ranges updated.`,
      });
    }

    onSaved?.();
    onClose();
  };

  const handleDelete = () => {
    if (!existingRecord) return;
    showAlert({
      title: 'Delete Period Record?',
      message: `Are you sure you want to remove the period record for ${existingRecord.startDate}? Cycle projections will be recalculated.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        deletePeriod(existingRecord.id);
        showToast({
          type: 'info',
          title: 'Record Removed',
          message: 'Period record deleted and baseline recalculated.',
        });
        onSaved?.();
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss logger sheet"
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
            {/* Grab Handle */}
            <View style={styles.dragHandleBar}>
              <View style={styles.dragHandlePill} />
            </View>

            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  MENSTRUAL HEALTH LOG
                </Text>
                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}>
                  {existingRecord ? 'Edit Period Entry' : 'Log Period Bleeding'}
                </Text>
              </View>
              <PressableScale
                onPress={onClose}
                scaleTo={0.92}
                style={[styles.closeBtn, { backgroundColor: colors.surface1 }]}
                accessibilityRole="button"
                accessibilityLabel="Close sheet"
              >
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </PressableScale>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 20 }}
            >
              {/* Start Date Field */}
              <View style={{ marginTop: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  PERIOD START DATE *
                </Text>
                <PressableScale
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setShowStartDatePicker(true);
                  }}
                  scaleTo={0.98}
                  style={[
                    styles.datePickerTrigger,
                    {
                      backgroundColor: colors.surface1,
                      borderColor: colors.primary + '33',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Start date: ${startDate}. Tap to select from calendar.`}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {startDate || 'Select start date'}
                    </Text>
                  </View>
                  <View style={[styles.datePickerPill, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>Select Date</Text>
                  </View>
                </PressableScale>
              </View>

              {/* Ongoing Bleeding Switch */}
              <PressableScale
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setIsOngoing(!isOngoing);
                }}
                scaleTo={0.98}
                style={[
                  styles.ongoingCard,
                  { backgroundColor: colors.surface1, marginTop: spacing.md },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Bleeding is ongoing today
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {isOngoing
                      ? 'Continuous active flow. An end date can be added once bleeding finishes.'
                      : 'Bleeding has concluded. Enter the end date below.'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleBox,
                    {
                      backgroundColor: isOngoing ? colors.primary : 'transparent',
                      borderColor: isOngoing ? colors.primary : colors.text.muted,
                    },
                  ]}
                >
                  {isOngoing && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                </View>
              </PressableScale>

              {/* End Date Field (if not ongoing) */}
              {!isOngoing && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                    PERIOD END DATE *
                  </Text>
                  <PressableScale
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setShowEndDatePicker(true);
                    }}
                    scaleTo={0.98}
                    style={[
                      styles.datePickerTrigger,
                      {
                        backgroundColor: colors.surface1,
                        borderColor: colors.primary + '33',
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`End date: ${endDate || startDate}. Tap to select from calendar.`}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {endDate || startDate || 'Select end date'}
                      </Text>
                    </View>
                    <View style={[styles.datePickerPill, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>Select Date</Text>
                    </View>
                  </PressableScale>
                </View>
              )}

              {/* Flow Intensity Selection */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                  FLOW INTENSITY
                </Text>
                <View style={styles.flowGrid}>
                  {FLOW_OPTIONS.map((opt) => {
                    const isSelected = flowIntensity === opt.intensity;
                    return (
                      <PressableScale
                        key={opt.intensity}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setFlowIntensity(opt.intensity);
                        }}
                        scaleTo={0.96}
                        style={[
                          styles.flowCard,
                          {
                            backgroundColor: isSelected ? opt.bg : colors.surface1,
                            borderColor: isSelected ? opt.color : 'transparent',
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.flowIndicatorDot, { backgroundColor: opt.color }]} />
                          <Text
                            style={[
                              typography.subbodyBold,
                              { color: isSelected ? opt.color : colors.text.primary, marginLeft: 8 },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                          {opt.desc}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {/* Pain & Cramp Level (0 to 10 scale) */}
              <View style={{ marginTop: spacing.lg }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    CRAMPS & PHYSICAL DISCOMFORT
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {painLevel === 0
                      ? '0 (None)'
                      : painLevel <= 3
                      ? `${painLevel}/10 (Mild)`
                      : painLevel <= 6
                      ? `${painLevel}/10 (Moderate)`
                      : `${painLevel}/10 (Severe)`}
                  </Text>
                </View>

                <View style={styles.painStrip}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = painLevel === num;
                    return (
                      <PressableScale
                        key={num}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setPainLevel(num);
                        }}
                        scaleTo={0.92}
                        style={[
                          styles.painBtn,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isSelected ? colors.onPrimary : colors.text.primary,
                              fontSize: 12,
                            },
                          ]}
                        >
                          {num}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {/* Physical Symptoms */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                  PHYSICAL & EMOTIONAL SENSATIONS
                </Text>
                <View style={styles.chipsWrap}>
                  {COMMON_SYMPTOMS.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <PressableScale
                        key={sym}
                        onPress={() => toggleSymptom(sym)}
                        scaleTo={0.95}
                        style={[
                          styles.symptomChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isSelected ? colors.onPrimary : colors.text.primary,
                              fontSize: 12,
                            },
                          ]}
                        >
                          {sym}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {/* Personal Notes */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  PERSONAL NOTES (OPTIONAL)
                </Text>
                <TextField
                  placeholder="Rest, hydration, remedies, comfort measures..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: spacing.xl, gap: 10 }}>
                <Button
                  label={existingRecord ? 'Save Changes' : 'Confirm & Save Period'}
                  onPress={handleSave}
                  size="lg"
                />
                {existingRecord && (
                  <Button
                    label="Delete Record"
                    variant="ghost"
                    onPress={handleDelete}
                    size="md"
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* DatePicker Modals */}
      <DatePickerModal
        visible={showStartDatePicker}
        value={startDate}
        title="Select Period Start Date"
        onChange={(val) => {
          setStartDate(val);
          setShowStartDatePicker(false);
        }}
        onClose={() => setShowStartDatePicker(false)}
      />

      <DatePickerModal
        visible={showEndDatePicker}
        value={endDate || startDate}
        title="Select Period End Date"
        minDate={startDate}
        onChange={(val) => {
          setEndDate(val);
          setShowEndDatePicker(false);
        }}
        onClose={() => setShowEndDatePicker(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
  },
  dragHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongoingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flowCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  flowIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  painStrip: {
    flexDirection: 'row',
    gap: 4,
  },
  painBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  datePickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
});

export default PeriodLoggerModal;
