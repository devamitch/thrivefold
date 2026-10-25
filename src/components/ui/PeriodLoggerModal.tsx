import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PeriodLogRecord, FlowIntensity } from '../../stores/slices/healthSlice';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from './AppBottomSheetModal';
import { Button } from './Button';
import { DatePickerModal } from './DatePickerModal';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';
import { TextField } from './TextField';

interface PeriodLoggerModalProps {
  visible: boolean;
  existingRecord?: PeriodLogRecord | null;
  initialDate?: string;
  initialDateStr?: string;
  onClose: () => void;
  onSaved?: () => void;
}

const FLOW_OPTIONS = [
  { intensity: 'spotting' as const, label: 'Spotting', desc: 'Minimal bleeding, drops only', color: '#D97706', bg: '#FEF3C7' },
  { intensity: 'light' as const, label: 'Light', desc: 'Low flow, gentle absorption', color: '#E11D48', bg: '#FFE4E6' },
  { intensity: 'medium' as const, label: 'Medium', desc: 'Standard moderate regular flow', color: '#BE123C', bg: '#FCE7F3' },
  { intensity: 'heavy' as const, label: 'Heavy', desc: 'Intense flow requiring frequent care', color: '#881337', bg: '#FEE2E2' },
];

const COMMON_SYMPTOMS = [
  'Mild Cramps',
  'Severe Pelvic Cramps',
  'Headache / Migraine',
  'Lower Back Ache',
  'Bloating',
  'Fatigue / Exhaustion',
  'Tender Breasts',
  'Mood Swings',
  'Brain Fog',
  'Food Cravings',
  'Insomnia',
  'Acne Flare-up',
];

export function PeriodLoggerModal({
  visible,
  existingRecord,
  initialDate,
  initialDateStr,
  onClose,
  onSaved,
}: PeriodLoggerModalProps) {
  const { colors, typography, spacing } = useTheme();

  const logPeriod = useRootStore((s) => s.logPeriod);
  const deletePeriod = useRootStore((s) => s.deletePeriod);
  const showToast = useRootStore((s) => s.showToast);
  const showAlert = useRootStore((s) => s.showAlert);

  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveInitialDate = initialDate ?? initialDateStr ?? todayStr;

  const [startDate, setStartDate] = useState(
    existingRecord ? existingRecord.startDate : effectiveInitialDate
  );
  const [endDate, setEndDate] = useState<string | null>(
    existingRecord ? (existingRecord.endDate ?? null) : null
  );
  const [isOngoing, setIsOngoing] = useState(
    existingRecord ? !!existingRecord.isOngoing : false
  );
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>(
    existingRecord?.flowIntensity || 'medium'
  );
  const [painLevel, setPainLevel] = useState<number>(
    existingRecord?.painLevel !== undefined ? existingRecord.painLevel : 2
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    existingRecord?.symptoms || []
  );
  const [notes, setNotes] = useState(existingRecord?.notes || '');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const toggleSymptom = (sym: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    if (!startDate) {
      showToast({
        type: 'warning',
        title: 'Start Date Required',
        message: 'Please choose when bleeding commenced.',
      });
      return;
    }

    if (!isOngoing && !endDate) {
      showToast({
        type: 'warning',
        title: 'End Date Required',
        message: 'Please provide an end date or mark bleeding as ongoing today.',
      });
      return;
    }

    if (!isOngoing && endDate && endDate < startDate) {
      showToast({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'End date cannot be prior to start date.',
      });
      return;
    }

    const payload: Omit<PeriodLogRecord, 'id' | 'loggedAt'> & { id?: string } = {
      ...(existingRecord?.id ? { id: existingRecord.id } : {}),
      startDate,
      endDate: isOngoing ? undefined : (endDate || undefined),
      isOngoing,
      flowIntensity,
      painLevel,
      symptoms: selectedSymptoms,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    logPeriod(payload);
    showToast({
      type: 'success',
      title: existingRecord ? 'Period Updated' : 'Period Logged',
      message: isOngoing
        ? 'Active period recorded. Cycle engine updated.'
        : `Recorded ${startDate} to ${endDate}.`,
    });
    onSaved?.();
    onClose();
  };

  const handleDelete = () => {
    if (!existingRecord) return;
    showAlert({
      title: 'Delete Period Entry?',
      message: 'This will remove this menstrual cycle entry from your history and cycle predictions.',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
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
    <>
      <AppBottomSheetModal
        visible={visible}
        onClose={onClose}
        eyebrow="MENSTRUAL HEALTH LOG"
        title={existingRecord ? 'Edit Period Entry' : 'Log Period Bleeding'}
        maxHeight="92%"
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
            accessibilityRole="button"
            accessibilityLabel={`Start date: ${startDate}. Tap to select from calendar.`}
          >
            <SquircleSurface
              radius={14}
              smoothing={1}
              fill={colors.surface1}
              stroke={colors.primary + '33'}
              strokeWidth={1}
              style={styles.datePickerTrigger}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {startDate || 'Select start date'}
                </Text>
              </View>
              <SquircleSurface
                radius={8}
                smoothing={1}
                fill={colors.primary + '18'}
                style={styles.datePickerPill}
              >
                <Text style={[typography.captionBold, { color: colors.primary }]}>Select Date</Text>
              </SquircleSurface>
            </SquircleSurface>
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
          style={{ marginTop: spacing.md }}
        >
          <SquircleSurface
            radius={16}
            smoothing={1}
            fill={colors.surface1}
            stroke={colors.border}
            strokeWidth={1}
            style={styles.ongoingCard}
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
            <SquircleSurface
              radius={7}
              smoothing={1}
              fill={isOngoing ? colors.primary : 'transparent'}
              stroke={isOngoing ? colors.primary : colors.text.muted}
              strokeWidth={1.5}
              style={styles.toggleBox}
            >
              {isOngoing && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
            </SquircleSurface>
          </SquircleSurface>
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
              accessibilityRole="button"
              accessibilityLabel={`End date: ${endDate || startDate}. Tap to select from calendar.`}
            >
              <SquircleSurface
                radius={14}
                smoothing={1}
                fill={colors.surface1}
                stroke={colors.primary + '33'}
                strokeWidth={1}
                style={styles.datePickerTrigger}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {endDate || startDate || 'Select end date'}
                  </Text>
                </View>
                <SquircleSurface
                  radius={8}
                  smoothing={1}
                  fill={colors.primary + '18'}
                  style={styles.datePickerPill}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>Select Date</Text>
                </SquircleSurface>
              </SquircleSurface>
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
                  style={styles.flowCardScale}
                >
                  <SquircleSurface
                    radius={16}
                    smoothing={1}
                    fill={isSelected ? opt.bg : colors.surface1}
                    stroke={isSelected ? opt.color : colors.border}
                    strokeWidth={1}
                    style={styles.flowCard}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <SquircleSurface
                        radius={5}
                        smoothing={1}
                        fill={opt.color}
                        style={styles.flowIndicatorDot}
                      />
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
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Pain & Cramp Level */}
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
                  style={styles.painBtnScale}
                >
                  <SquircleSurface
                    radius={10}
                    smoothing={1}
                    fill={isSelected ? colors.primary : colors.surface1}
                    stroke={isSelected ? colors.primary : colors.border}
                    strokeWidth={1}
                    style={styles.painBtn}
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
                  </SquircleSurface>
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
                >
                  <SquircleSurface
                    radius={12}
                    smoothing={1}
                    fill={isSelected ? colors.primary : colors.surface1}
                    stroke={isSelected ? colors.primary : colors.border}
                    strokeWidth={1}
                    style={styles.symptomChip}
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
                  </SquircleSurface>
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
      </AppBottomSheetModal>

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
    </>
  );
}

const styles = StyleSheet.create({
  datePickerTrigger: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  datePickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ongoingCard: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 14,
  },
  toggleBox: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  flowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flowCardScale: {
    width: '48%',
  },
  flowCard: {
    padding: 12,
  },
  flowIndicatorDot: {
    height: 10,
    width: 10,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  painStrip: {
    flexDirection: 'row',
    gap: 4,
  },
  painBtnScale: {
    flex: 1,
  },
  painBtn: {
    alignItems: 'center',
    height: 36,
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
  },
});

export default PeriodLoggerModal;
