/**
 * Thrivefold Personal Milestone & Calendar Event Modal
 * Supports birthdays (self, partner, family, friends), wedding anniversaries,
 * appointments, financial deadlines, and custom routines.
 * Enhanced with AppBottomSheetModal, SquircleSurface, and PressableScale.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useRootStore, useShallow, type PersonalCalendarEvent } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal, SheetFooterRow } from './AppBottomSheetModal';
import { Button } from './Button';
import { DatePickerModal } from './DatePickerModal';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';
import { TextField } from './TextField';

interface PersonalEventModalProps {
  visible: boolean;
  initialDateStr: string;
  existingEvent?: PersonalCalendarEvent | null;
  onClose: () => void;
  onSaved?: () => void;
}

const CATEGORIES: {
  id: PersonalCalendarEvent['category'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'birthday', label: 'Birthday', icon: 'gift-outline' },
  { id: 'anniversary', label: 'Anniversary', icon: 'ribbon-outline' },
  { id: 'appointment', label: 'Appointment', icon: 'calendar-outline' },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { id: 'financial', label: 'Financial Due', icon: 'wallet-outline' },
  { id: 'reminder', label: 'Reminder', icon: 'alarm-outline' },
  { id: 'deadline', label: 'Deadline', icon: 'flag-outline' },
  { id: 'custom', label: 'Milestone', icon: 'star-outline' },
];

const RELATIONSHIPS: {
  id: NonNullable<PersonalCalendarEvent['relationship']>;
  label: string;
}[] = [
  { id: 'partner', label: 'Partner / Fiancé' },
  { id: 'self', label: 'Myself' },
  { id: 'family', label: 'Family' },
  { id: 'friend', label: 'Friend' },
  { id: 'work', label: 'Work / Study' },
  { id: 'other', label: 'Other' },
];

const RECURRENCE_OPTIONS: {
  id: 'yearly' | 'monthly' | 'weekly' | 'none';
  label: string;
}[] = [
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
  const { addPersonalEvent, editPersonalEvent, deletePersonalEvent, showToast, showAlert } = useRootStore(
    useShallow((s) => ({
      addPersonalEvent: s.addPersonalEvent,
      editPersonalEvent: s.editPersonalEvent,
      deletePersonalEvent: s.deletePersonalEvent,
      showToast: s.showToast,
      showAlert: s.showAlert,
    })),
  );

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
    <>
      <AppBottomSheetModal
        visible={visible}
        onClose={onClose}
        eyebrow="LIFE PLANNER & REMINDERS"
        title={existingEvent ? 'Edit Milestone' : 'Add Milestone or Event'}
        maxHeight="92%"
        contentContainerStyle={{ paddingBottom: 12 }}
        footer={
          <SheetFooterRow>
            {existingEvent ? <Button label="Delete" variant="secondary" onPress={handleDelete} /> : null}
            <Button label={existingEvent ? 'Save changes' : 'Save'} onPress={handleSave} />
          </SheetFooterRow>
        }
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
            autoFocus={!existingEvent}
          />
        </View>

        {/* Category Selector */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
            EVENT TYPE
          </Text>
          <View style={styles.categoryGrid}>
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
                  scaleTo={0.95}
                >
                  <SquircleSurface
                    radius={12}
                    smoothing={1}
                    fill={isSelected ? colors.primaryAlpha : colors.surface1}
                    strokeWidth={1}
                    style={styles.categoryChip}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={15}
                      color={isSelected ? colors.primary : colors.text.secondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? colors.primary : colors.text.primary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Date Selector */}
        <View style={{ marginTop: spacing.lg }}>
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
            accessibilityRole="button"
            accessibilityLabel={`Date: ${dateStr}. Tap to select from calendar.`}
          >
            <SquircleSurface
              radius={14}
              smoothing={1}
              fill={colors.surface1}
              strokeWidth={1}
              style={styles.datePickerTrigger}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {dateStr || 'Select date'}
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

        {/* Recurrence Selection */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
            RECURRENCE
          </Text>
          <View style={styles.recurrenceRow}>
            {RECURRENCE_OPTIONS.map((opt) => {
              const isSelected = recurrence === opt.id;
              return (
                <PressableScale
                  key={opt.id}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setRecurrence(opt.id);
                  }}
                  scaleTo={0.96}
                  style={styles.recurrenceScale}
                >
                  <SquircleSurface
                    radius={12}
                    smoothing={1}
                    fill={isSelected ? colors.primary : colors.surface1}
                    strokeWidth={1}
                    style={styles.recurrencePill}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? colors.onPrimary : colors.text.primary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Relationship (For Birthdays / Anniversaries) */}
        {(category === 'birthday' || category === 'anniversary') && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
              WHO IS THIS FOR?
            </Text>
            <View style={styles.categoryGrid}>
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
                  >
                    <SquircleSurface
                      radius={12}
                      smoothing={1}
                      fill={isSelected ? colors.primaryAlpha : colors.surface1}
                      strokeWidth={1}
                      style={styles.relationshipChip}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          { color: isSelected ? colors.primary : colors.text.primary },
                        ]}
                      >
                        {rel.label}
                      </Text>
                    </SquircleSurface>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        )}

        {/* Time of Day (Optional) */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
            TIME OF DAY (OPTIONAL)
          </Text>
          <TextField
            placeholder="e.g. 10:30 AM, 7:00 PM Dinner"
            value={time}
            onChangeText={setTime}
          />
        </View>

        {/* Notes (Optional) */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 6 }]}>
            NOTES / GIFT IDEAS / LOCATION
          </Text>
          <TextField
            placeholder="Gift ideas, reservation numbers, address, reminders..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

      </AppBottomSheetModal>

      {/* DatePicker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={dateStr}
        title="Select Event Date"
        initialView={category === 'birthday' ? 'year' : 'day'}
        onChange={(val) => {
          setDateStr(val);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  relationshipChip: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
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
  recurrenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recurrenceScale: {
    flex: 1,
  },
  recurrencePill: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
});

export default PersonalEventModal;
