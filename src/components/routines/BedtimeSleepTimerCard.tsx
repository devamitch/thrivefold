import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { format12Hour, isHHMM, type Routine } from '../../domain/routines';
import { formatDuration, overnightMinutes } from '../../domain/routineSchedule';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import { Toggle } from '../ui/Toggle';

interface BedtimeSleepTimerCardProps {
  onConfigureBedtime: (sleepRoutine: Routine | null) => void;
  onConfigureWake?: (wakeRoutine: Routine | null) => void;
}

export function BedtimeSleepTimerCard({
  onConfigureBedtime,
  onConfigureWake,
}: BedtimeSleepTimerCardProps) {
  const { colors, typography, spacing } = useTheme();
  const routines = useRootStore((s) => s.routines);
  const addRoutine = useRootStore((s) => s.addRoutine);
  const updateRoutine = useRootStore((s) => s.updateRoutine);

  const sleepRoutine = useMemo(
    () =>
      routines.find((r) => r.kind === 'sleep') ??
      routines.find((r) => /sleep|wind-down/i.test(r.title)) ??
      null,
    [routines],
  );

  const wakeRoutine = useMemo(
    () =>
      routines.find((r) => /wake/i.test(r.title)) ??
      routines.find((r) => r.kind === 'checkin') ??
      null,
    [routines],
  );

  const isEnabled = !!sleepRoutine?.enabled;
  const bedtime = sleepRoutine ? format12Hour(sleepRoutine.time) : 'Not set';
  const wake = wakeRoutine ? format12Hour(wakeRoutine.time) : 'Not set';

  const duration = useMemo(() => {
    if (!sleepRoutine || !wakeRoutine) return null;
    if (!isHHMM(sleepRoutine.time) || !isHHMM(wakeRoutine.time)) return null;
    return formatDuration(overnightMinutes(sleepRoutine.time, wakeRoutine.time));
  }, [sleepRoutine, wakeRoutine]);

  const handleToggle = (val: boolean) => {
    hapticLight();
    if (sleepRoutine) {
      updateRoutine(sleepRoutine.id, { enabled: val });
    } else {
      hapticSuccess();
      addRoutine({ kind: 'sleep', title: 'Start winding down for sleep', time: '22:30', days: [] });
    }
  };

  const column = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: string,
    onPress: () => void,
    hint: string,
  ) => (
    <PressableScale
      onPress={onPress}
      style={styles.timeColumn}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}. ${hint}`}
    >
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={colors.text.muted} />
        <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}>
          {label}
        </Text>
      </View>
      <Text
        style={[
          typography.subheading,
          { color: value === 'Not set' ? colors.text.muted : colors.text.primary, marginTop: 2 },
        ]}
      >
        {value}
      </Text>
    </PressableScale>
  );

  return (
    <Card variant="surface" style={[styles.container, { marginBottom: spacing.md }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="moon" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Sleep schedule</Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {duration ? `${duration} of sleep` : 'Set bedtime and wake-up'}
          </Text>
        </View>
        <Toggle
          value={isEnabled}
          onValueChange={handleToggle}
          accessibilityLabel="Bedtime reminder on or off"
        />
      </View>

      <View
        style={[
          styles.windowBox,
          { backgroundColor: colors.surface2, opacity: isEnabled || !sleepRoutine ? 1 : 0.6 },
        ]}
      >
        {column(
          'bed-outline',
          'Bedtime',
          bedtime,
          () => onConfigureBedtime(sleepRoutine),
          'Tap to change',
        )}
        <View style={{ width: 1, height: 34, backgroundColor: colors.borderStrong }} />
        {column(
          'sunny-outline',
          'Wake up',
          wake,
          () => (onConfigureWake ? onConfigureWake(wakeRoutine) : onConfigureBedtime(sleepRoutine)),
          'Tap to change',
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 22, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  timeColumn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
});
