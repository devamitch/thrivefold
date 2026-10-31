import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BedtimeSleepTimerCard } from '../../components/routines/BedtimeSleepTimerCard';
import { AddRoutineModal } from '../../components/routines/AddRoutineModal';
import { EditRoutineModal } from '../../components/routines/EditRoutineModal';
import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Toggle } from '../../components/ui/Toggle';
import {
  format12Hour,
  ROUTINE_PRESETS,
  routineTimes,
  type Routine,
  type RoutineKind,
} from '../../domain/routines';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const KIND_ICONS: Record<RoutineKind, keyof typeof Ionicons.glyphMap> = {
  water: 'water',
  checkin: 'sunny',
  sleep: 'moon',
  stretch: 'body',
  journal: 'book',
  walk: 'walk',
  custom: 'alarm',
};

const describe = (r: Pick<Routine, 'time' | 'days' | 'everyHours' | 'until'>) => {
  const when = r.everyHours
    ? `Every ${r.everyHours}h, ${format12Hour(routineTimes(r)[0])}–${format12Hour(r.until ?? r.time)}`
    : format12Hour(r.time);
  const days = !r.days.length
    ? 'Every day'
    : r.days.length === 5 && !r.days.includes(6) && !r.days.includes(7)
    ? 'Weekdays'
    : r.days.length === 2 && r.days.includes(6) && r.days.includes(7)
    ? 'Weekends'
    : r.days.map((d) => DAYS[d - 1]).join(', ');
  return `${when} · ${days}`;
};

export default function RoutinesScreen() {
  const { colors, typography, spacing } = useTheme();
  const { routines, addRoutine, updateRoutine } = useRootStore(
    useShallow((s) => ({
      routines: s.routines,
      addRoutine: s.addRoutine,
      updateRoutine: s.updateRoutine,
    })),
  );

  // Separate Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const activeCount = useMemo(() => routines.filter((r) => r.enabled).length, [routines]);

  const unusedPresets = ROUTINE_PRESETS.filter(
    (p) => !routines.some((r) => r.kind === p.kind && r.title === p.title),
  );

  const openAddModal = () => {
    hapticLight();
    setAddModalOpen(true);
  };

  const openEditModal = (r: Routine) => {
    hapticLight();
    setSelectedRoutine(r);
    setEditModalOpen(true);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Daily Rhythms & Alarms"
          subtitle="Alarm-clock reminders that alert you even when phone is locked"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* 1. Bedtime & Sleep Timer Rhythm Sanctuary Card */}
      <BedtimeSleepTimerCard
        onConfigureBedtime={(sleepRoutine) => {
          if (sleepRoutine) {
            openEditModal(sleepRoutine);
          } else {
            openAddModal();
          }
        }}
      />

      {/* 2. Top Summary & Action Bar */}
      <View style={styles.topActionBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Active Alarms
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surface2 }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {activeCount} of {routines.length}
            </Text>
          </View>
        </View>

        <PressableScale
          onPress={openAddModal}
          style={[styles.addPillBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="Add new alarm"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 4 }]}>
            Add Alarm
          </Text>
        </PressableScale>
      </View>

      {/* 3. Active Routines List */}
      <View style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        {routines.length ? (
          routines.map((r) => {
            const displayTime = format12Hour(r.time);
            const iconName = KIND_ICONS[r.kind] ?? 'alarm';

            return (
              <PressableScale
                key={r.id}
                onPress={() => openEditModal(r)}
                style={{ marginBottom: spacing.sm }}
                accessibilityRole="button"
                accessibilityLabel={`${r.title} at ${displayTime}. Tap to edit`}
              >
                <Card
                  variant="surface"
                  style={[styles.alarmCard, { padding: spacing.md }]}
                >
                  <View style={styles.alarmRow}>
                    {/* Routine Icon */}
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: r.enabled ? colors.primaryAlpha : colors.surface2,
                        },
                      ]}
                    >
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={r.enabled ? colors.primary : colors.text.muted}
                      />
                    </View>

                    {/* Time & Title info */}
                    <View style={[styles.flex, { marginLeft: 14 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text
                          style={[
                            typography.subheading,
                            {
                              color: r.enabled ? colors.text.primary : colors.text.muted,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {displayTime}
                        </Text>
                      </View>
                      <Text
                        style={[
                          typography.subbodyBold,
                          {
                            color: r.enabled ? colors.text.primary : colors.text.muted,
                            marginTop: 1,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {r.title}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.text.secondary, marginTop: 2 },
                        ]}
                      >
                        {describe(r)}
                      </Text>
                    </View>

                    {/* Toggle Switch */}
                    <Toggle
                      value={r.enabled}
                      onValueChange={(v) => {
                        hapticLight();
                        updateRoutine(r.id, { enabled: v });
                      }}
                      accessibilityLabel={`${r.title} alarm toggle`}
                    />
                  </View>
                </Card>
              </PressableScale>
            );
          })
        ) : (
          <Card variant="surface1" style={styles.emptyCard}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="alarm-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 10 }]}>
              No Active Alarms
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginTop: 4, textAlign: 'center', lineHeight: 18 },
              ]}
            >
              Add routines above or tap any recommended preset below to ensure you get timely reminders throughout the day.
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button
                label="Add First Routine"
                variant="secondary"
                size="sm"
                onPress={openAddModal}
                icon={<Ionicons name="add" size={16} color={colors.primary} />}
              />
            </View>
          </Card>
        )}
      </View>

      {/* 4. Recommended Presets Carousel */}
      {unusedPresets.length ? (
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
          <Text
            style={[
              typography.captionBold,
              { color: colors.text.muted, letterSpacing: 0.8, marginBottom: 10 },
            ]}
          >
            RECOMMENDED PRESETS
          </Text>

          <View style={styles.presetsGrid}>
            {unusedPresets.map((p) => {
              const iconName = KIND_ICONS[p.kind] ?? 'alarm';
              return (
                <PressableScale
                  key={p.title}
                  onPress={() => {
                    hapticSuccess();
                    addRoutine(p);
                  }}
                  style={styles.presetCell}
                  accessibilityRole="button"
                  accessibilityLabel={`Add preset ${p.title}`}
                >
                  <Card variant="surface" style={styles.presetCard}>
                    <View style={styles.presetTopRow}>
                      <View style={[styles.presetIconWrap, { backgroundColor: colors.surface2 }]}>
                        <Ionicons name={iconName} size={16} color={colors.primary} />
                      </View>
                      <Badge label={format12Hour(p.time)} variant="neutral" />
                    </View>
                    <Text
                      style={[
                        typography.captionBold,
                        { color: colors.text.primary, marginTop: 8 },
                      ]}
                      numberOfLines={1}
                    >
                      {p.title}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.text.secondary, marginTop: 2, fontSize: 11 },
                      ]}
                      numberOfLines={1}
                    >
                      {describe(p)}
                    </Text>
                    <View style={styles.addShortcutRow}>
                      <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.primary, fontSize: 11, marginLeft: 4 },
                        ]}
                      >
                        Add
                      </Text>
                    </View>
                  </Card>
                </PressableScale>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 5. Separate Modals */}
      <AddRoutineModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <EditRoutineModal
        routine={selectedRoutine}
        visible={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  addPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  alarmCard: {
    borderRadius: 20,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetCell: {
    width: '48.8%',
  },
  presetCard: {
    padding: 12,
    borderRadius: 16,
    minHeight: 112,
  },
  presetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addShortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
