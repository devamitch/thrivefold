import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AddRoutineModal } from '../../components/routines/AddRoutineModal';
import { BedtimeSleepTimerCard } from '../../components/routines/BedtimeSleepTimerCard';
import { EditRoutineModal } from '../../components/routines/EditRoutineModal';
import type { RoutineFormValues } from '../../components/routines/RoutineSheet';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Toggle } from '../../components/ui/Toggle';
import { byTimeOfDay, formatCountdown, nextTrigger } from '../../domain/routineSchedule';
import {
  format12Hour,
  ROUTINE_PRESETS,
  routineTimes,
  type Routine,
  type RoutineKind,
} from '../../domain/routines';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { globalVoiceController } from '../../services/voice/globalVoiceController';
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

const describeDays = (days: number[]) =>
  !days.length
    ? 'Every day'
    : days.length === 5 && !days.includes(6) && !days.includes(7)
      ? 'Weekdays'
      : days.length === 2 && days.includes(6) && days.includes(7)
        ? 'Weekends'
        : days.map((d) => DAYS[d - 1]).join(', ');

const describe = (r: Pick<Routine, 'time' | 'days' | 'everyHours' | 'until'>) => {
  const when = r.everyHours
    ? `Every ${r.everyHours}h, ${format12Hour(routineTimes(r)[0])}–${format12Hour(r.until ?? r.time)}`
    : null;
  return when ? `${when} · ${describeDays(r.days)}` : describeDays(r.days);
};

export default function RoutinesScreen() {
  const { colors, typography, spacing } = useTheme();
  const params = useLocalSearchParams<{ routineId?: string; trigger?: string; title?: string; time?: string }>();
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(params.trigger === 'alarm');

  const { routines, addRoutine, updateRoutine } = useRootStore(
    useShallow((s) => ({
      routines: s.routines,
      addRoutine: s.addRoutine,
      updateRoutine: s.updateRoutine,
    })),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [addInitial, setAddInitial] = useState<Partial<RoutineFormValues> | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Routine | null>(null);

  useEffect(() => {
    if (params.trigger === 'alarm') {
      setAlarmTriggered(true);
      const target = routines.find(
        (r) => r.id === params.routineId || (params.title && r.title.toLowerCase().includes(params.title.toLowerCase())),
      );
      if (target) setSelected(target);
    }
  }, [params.trigger, params.routineId, params.title, routines]);

  // Tick every minute so "in 12 min" stays honest.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => byTimeOfDay(routines), [routines]);
  const activeCount = useMemo(() => routines.filter((r) => r.enabled).length, [routines]);

  const upNext = useMemo(() => {
    let best: { routine: Routine; at: Date } | null = null;
    for (const r of routines) {
      if (!r.enabled) continue;
      const at = nextTrigger(r, now);
      if (at && (!best || at < best.at)) best = { routine: r, at };
    }
    return best;
  }, [routines, now]);

  const unusedPresets = ROUTINE_PRESETS.filter(
    (p) => !routines.some((r) => r.kind === p.kind && r.title === p.title),
  );

  const openAdd = (initial?: Partial<RoutineFormValues>) => {
    hapticLight();
    setAddInitial(initial);
    setAddOpen(true);
  };

  const openEdit = (r: Routine) => {
    hapticLight();
    setSelected(r);
    setEditOpen(true);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Daily Rhythms & Alarms"
          subtitle="Reminders that ring even when your phone is locked"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      {alarmTriggered && (
        <Card variant="surface" style={styles.alarmBannerCard}>
          <View style={styles.alarmBannerHeader}>
            <View style={styles.alarmBannerIconCircle}>
              <Ionicons name="notifications" size={20} color="#D27D5C" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.captionBold,
                  { color: '#D27D5C', textTransform: 'uppercase', letterSpacing: 0.8 },
                ]}
              >
                Routine Alarm Ringing
              </Text>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                {params.title || selected?.title || 'Daily Routine Rhythm'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {params.time ? `${format12Hour(params.time)} · ` : ''}Your scheduled rhythm is here. Tap complete or ask Coach.
              </Text>
            </View>
          </View>
          <View style={styles.alarmBannerButtons}>
            <Button
              label="Complete Routine"
              variant="primary"
              size="sm"
              onPress={() => {
                hapticSuccess();
                setAlarmTriggered(false);
              }}
              style={{ flex: 1 }}
            />
            <Button
              label="Talk to Coach"
              variant="outline"
              size="sm"
              onPress={() => {
                hapticLight();
                globalVoiceController.open('/(app)/routines');
              }}
              style={{ marginLeft: 8 }}
            />
          </View>
        </Card>
      )}

      <BedtimeSleepTimerCard
        onConfigureBedtime={(r) =>
          r
            ? openEdit(r)
            : openAdd({ kind: 'sleep', title: 'Start winding down for sleep', time: '22:30' })
        }
        onConfigureWake={(r) =>
          r ? openEdit(r) : openAdd({ kind: 'checkin', title: 'Wake up', time: '06:30' })
        }
      />

      {upNext ? (
        <PressableScale
          onPress={() => openEdit(upNext.routine)}
          accessibilityRole="button"
          accessibilityLabel={`Next alarm ${upNext.routine.title} ${formatCountdown(upNext.at, now)}`}
          style={{ marginBottom: spacing.md }}
        >
          <Card variant="surface1" style={styles.nextCard}>
            <View style={[styles.nextIcon, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons
                name={KIND_ICONS[upNext.routine.kind] ?? 'alarm'}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Next up</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={1}>
                {upNext.routine.title}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>
                {formatCountdown(upNext.at, now)}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {upNext.at.toDateString() === now.toDateString() ? '' : 'Tomorrow · '}
                {format12Hour(
                  `${String(upNext.at.getHours()).padStart(2, '0')}:${String(upNext.at.getMinutes()).padStart(2, '0')}`,
                )}
              </Text>
            </View>
          </Card>
        </PressableScale>
      ) : null}

      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Alarms</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surface2 }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {activeCount} of {routines.length} on
            </Text>
          </View>
        </View>
        <PressableScale
          onPress={() => openAdd()}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add alarm"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 4 }]}>Add</Text>
        </PressableScale>
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        {sorted.length ? (
          sorted.map((r) => {
            const on = r.enabled;
            return (
              <PressableScale
                key={r.id}
                onPress={() => openEdit(r)}
                style={{ marginBottom: spacing.sm }}
                accessibilityRole="button"
                accessibilityLabel={`${r.title} at ${format12Hour(r.time)}. ${on ? 'On' : 'Paused'}. Tap to edit`}
              >
                <Card variant="surface" style={[styles.alarmCard, { padding: spacing.md }]}>
                  <View style={styles.alarmRow}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: on ? colors.primaryAlpha : colors.surface2 },
                      ]}
                    >
                      <Ionicons
                        name={KIND_ICONS[r.kind] ?? 'alarm'}
                        size={20}
                        color={on ? colors.primary : colors.text.muted}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text
                        style={[
                          typography.subheading,
                          {
                            color: on ? colors.text.primary : colors.text.muted,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {format12Hour(r.time)}
                      </Text>
                      <Text
                        style={[
                          typography.subbodyBold,
                          { color: on ? colors.text.primary : colors.text.muted, marginTop: 1 },
                        ]}
                        numberOfLines={1}
                      >
                        {r.title}
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                        numberOfLines={1}
                      >
                        {on ? describe(r) : `Paused · ${describe(r)}`}
                      </Text>
                    </View>

                    <Toggle
                      value={on}
                      onValueChange={(v) => {
                        hapticLight();
                        updateRoutine(r.id, { enabled: v });
                      }}
                      accessibilityLabel={`${r.title} alarm`}
                    />
                  </View>
                </Card>
              </PressableScale>
            );
          })
        ) : (
          <Card variant="surface1" style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="alarm-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 10 }]}>
              No alarms yet
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginTop: 4, textAlign: 'center', lineHeight: 18 },
              ]}
            >
              Add one below, or pick a quick start.
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button
                label="Add first alarm"
                variant="secondary"
                size="sm"
                onPress={() => openAdd()}
                icon={<Ionicons name="add" size={16} color={colors.primary} />}
              />
            </View>
          </Card>
        )}
      </View>

      {unusedPresets.length ? (
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 10 }]}>
            Quick start
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {unusedPresets.map((p) => (
              <PressableScale
                key={p.title}
                onPress={() => {
                  hapticSuccess();
                  addRoutine(p);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Add ${p.title} at ${format12Hour(p.time)}`}
              >
                <Card variant="surface" style={styles.presetCard}>
                  <View style={styles.presetTop}>
                    <View style={[styles.presetIcon, { backgroundColor: colors.surface2 }]}>
                      <Ionicons
                        name={KIND_ICONS[p.kind] ?? 'alarm'}
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                  </View>
                  <Text
                    style={[typography.captionBold, { color: colors.text.primary, marginTop: 10 }]}
                    numberOfLines={1}
                  >
                    {p.title}
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {format12Hour(p.time)}
                    {p.everyHours ? ` · every ${p.everyHours}h` : ''}
                  </Text>
                </Card>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <AddRoutineModal visible={addOpen} initial={addInitial} onClose={() => setAddOpen(false)} />
      <EditRoutineModal routine={selected} visible={editOpen} onClose={() => setEditOpen(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nextCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18 },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  alarmCard: { borderRadius: 20 },
  alarmRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { padding: 24, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCard: { width: 164, padding: 12, borderRadius: 16 },
  presetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  presetIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmBannerCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#FFF8F5',
  },
  alarmBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmBannerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7DFD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmBannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
});
