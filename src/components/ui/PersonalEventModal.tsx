/**
 * Thrivefold Personal Milestone & Calendar Event Modal
 * Supports birthdays (self, partner, family, friends), wedding anniversaries,
 * appointments, financial deadlines, and custom routines.
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
import { useRootStore, PersonalCalendarEvent } from '../../stores/useRootStore';
import { Button } from './Button';
import { TextField } from './TextField';
import { PressableScale } from './PressableScale';
import { DatePickerModal } from './DatePickerModal';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';

interface PersonalEventModalProps {
  visible: boolean;
  initialDateStr: string;
  existingEvent?: PersonalCalendarEvent | null;
  onClose: () => void;
  onSaved?: () => void;
}

const CATEGORIES: Array<{
  id: PersonalCalendarEvent['category'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'birthday', label: 'Birthday', icon: 'gift-outline' },
  { id: 'anniversary', label: 'Anniversary', icon: 'ribbon-outline' },
  { id: 'appointment', label: 'Appointment', icon: 'calendar-outline' },
  { id: 'financial', label: 'Financial Due', icon: 'wallet-outline' },
  { id: 'reminder', label: 'Reminder', icon: 'alarm-outline' },
  { id: 'deadline', label: 'Deadline', icon: 'flag-outline' },
  { id: 'custom', label: 'Milestone', icon: 'star-outline' },
];

const RELATIONSHIPS: Array<{
  id: NonNullable<PersonalCalendarEvent['relationship']>;
  label: string;
}> = [
  { id: 'partner', label: 'Partner / Fiancé' },
  { id: 'self', label: 'Myself' },
  { id: 'family', label: 'Family' },
  { id: 'friend', label: 'Friend' },
  { id: 'work', label: 'Work / Study' },
  { id: 'other', label: 'Other' },
];

const RECURRENCE_OPTIONS: Array<{
  id: 'yearly' | 'monthly' | 'weekly' | 'none';
  label: string;
}> = [
  { id: 'yearly', label: 'Yearly (Annual)' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'none', label: 'One-Time' },
];

export function PersonalEventModal({
  visible,
  initialDateStr,
  existingEvent,
  onClose,
  onSaved,
}: PersonalEventModalProps) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { addPersonalEvent, editPersonalEvent, deletePersonalEvent, showToast, showAlert } =
    useRootStore();

  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState(initialDateStr);
  const [category, setCategory] = useState<PersonalCalendarEvent['category']>('birthday');
  const [relationship, setRelationship] = useState<PersonalCalendarEvent['relationship']>('partner');
  const [recurrence, setRecurrence] = useState<'yearly' | 'monthly' | 'weekly' | 'none'>('yearly');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDateStr(existingEvent.date);
      setCategory(existingEvent.category);
      setRelationship(existingEvent.relationship || 'partner');
      setRecurrence(existingEvent.recurrence || 'yearly');
      setTime(existingEvent.time || '');
      setNotes(existingEvent.notes || '');
    } else {
      setTitle('');
      setDateStr(initialDateStr || formatLocalDate(new Date()));
      setCategory('birthday');
      setRelationship('partner');
      setRecurrence('yearly');
      setTime('');
      setNotes('');
    }
  }, [existingEvent, initialDateStr, visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (!title.trim()) {
      showAlert({
        title: 'Title Required',
        message: 'Please provide a title for this personal calendar event.',
        confirmText: 'OK',
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr.trim())) {
      showAlert({
        title: 'Invalid Date',
        message: 'Please format the date as YYYY-MM-DD.',
        confirmText: 'OK',
      });
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    if (existingEvent) {
      editPersonalEvent(existingEvent.id, {
        title: title.trim(),
        date: dateStr.trim(),
        category,
        relationship,
        recurrence,
        time: time.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showToast({ type: 'success', message: `Updated "${title.trim()}".` });
    } else {
      addPersonalEvent({
        title: title.trim(),
        date: dateStr.trim(),
        category,
        relationship,
        recurrence,
        time: time.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showToast({ type: 'success', message: `Saved "${title.trim()}" to calendar.` });
    }

    onSaved?.();
    onClose();
  };

  const handleDelete = () => {
    if (!existingEvent) return;
    showAlert({
      title: 'Remove Event?',
      message: `Are you sure you want to delete "${existingEvent.title}" from your personal calendar?`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        deletePersonalEvent(existingEvent.id);
        showToast({ type: 'info', message: 'Event removed from calendar.' });
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
            accessibilityLabel="Dismiss modal"
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
                  LIFE PLANNER & REMINDERS
                </Text>
                <Text style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}>
                  {existingEvent ? 'Edit Milestone' : 'Add Milestone or Event'}
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
              {/* Event Title */}
              <View style={{ marginTop: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  EVENT OR MILESTONE TITLE *
                </Text>
                <TextField
                  placeholder="e.g. Partner's Birthday, Wedding Anniversary, Rent Due"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Event Date */}
              <View style={{ marginTop: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  DATE *
                </Text>
                <PressableScale
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setShowDatePicker(true);
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
                  accessibilityLabel={`Event date: ${dateStr}. Tap to select from calendar.`}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {dateStr || 'Select event date'}
                    </Text>
                  </View>
                  <View style={[styles.datePickerPill, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>Select Date</Text>
                  </View>
                </PressableScale>
              </View>

              {/* Category Selection */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                  CATEGORY
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <PressableScale
                        key={cat.id}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setCategory(cat.id);
                        }}
                        scaleTo={0.94}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface1,
                          },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={15}
                          color={isSelected ? colors.onPrimary : colors.text.primary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: isSelected ? colors.onPrimary : colors.text.primary },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Relationship (for birthdays / anniversaries) */}
              {(category === 'birthday' || category === 'anniversary') && (
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                    HONORING WHO?
                  </Text>
                  <View style={styles.chipsWrap}>
                    {RELATIONSHIPS.map((rel) => {
                      const isSelected = relationship === rel.id;
                      return (
                        <PressableScale
                          key={rel.id}
                          onPress={() => {
                            try {
                              Haptics.selectionAsync();
                            } catch {}
                            setRelationship(rel.id);
                          }}
                          scaleTo={0.95}
                          style={[
                            styles.relChip,
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
                            {rel.label}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Recurrence Selection */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
                  RECURRENCE CADENCE
                </Text>
                <View style={styles.recurrenceRow}>
                  {RECURRENCE_OPTIONS.map((rec) => {
                    const isSelected = recurrence === rec.id;
                    return (
                      <PressableScale
                        key={rec.id}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setRecurrence(rec.id);
                        }}
                        scaleTo={0.94}
                        style={[
                          styles.recurrencePill,
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
                          {rec.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {/* Optional Time & Notes */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  SCHEDULED TIME (HH:MM, OPTIONAL)
                </Text>
                <TextField
                  placeholder="e.g. 19:30 or 09:00"
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={{ marginTop: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
                  PRIVATE NOTES & DETAILS (OPTIONAL)
                </Text>
                <TextField
                  placeholder="Gift ideas, reservation details, address..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: spacing.xl, gap: 10 }}>
                <Button
                  label={existingEvent ? 'Save Changes' : 'Save Event to Calendar'}
                  onPress={handleSave}
                  size="lg"
                />
                {existingEvent && (
                  <Button
                    label="Delete Event"
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

      {/* DatePicker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={dateStr}
        title="Select Event Date"
        onChange={(val) => {
          setDateStr(val);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
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
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  recurrenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recurrencePill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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

export default PersonalEventModal;
