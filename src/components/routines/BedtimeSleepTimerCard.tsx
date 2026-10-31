import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { format12Hour, type Routine } from '../../domain/routines';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import { Toggle } from '../ui/Toggle';

interface BedtimeSleepTimerCardProps {
  onConfigureBedtime: (sleepRoutine: Routine | null) => void;
}

export function BedtimeSleepTimerCard({ onConfigureBedtime }: BedtimeSleepTimerCardProps) {
  const { colors, typography, spacing } = useTheme();
  const routines = useRootStore((s) => s.routines);
  const addRoutine = useRootStore((s) => s.addRoutine);
  const updateRoutine = useRootStore((s) => s.updateRoutine);

  // Find existing bedtime / wind-down routine
  const sleepRoutine = useMemo(() => {
    return routines.find((r) => r.kind === 'sleep' || r.title.toLowerCase().includes('sleep') || r.title.toLowerCase().includes('wind-down')) ?? null;
  }, [routines]);

  // Find morning wake routine or daily checkin
  const wakeRoutine = useMemo(() => {
    return routines.find((r) => r.title.toLowerCase().includes('wake') || r.title.toLowerCase().includes('morning') || r.kind === 'checkin') ?? null;
  }, [routines]);

  const bedtimeDisplay = sleepRoutine ? format12Hour(sleepRoutine.time) : '10:30 PM';
  const wakeDisplay = wakeRoutine ? format12Hour(wakeRoutine.time) : '06:30 AM';
  const isEnabled = sleepRoutine ? sleepRoutine.enabled : false;

  const handleToggle = (val: boolean) => {
    hapticLight();
    if (sleepRoutine) {
      updateRoutine(sleepRoutine.id, { enabled: val });
    } else {
      // Create initial sleep routine
      hapticSuccess();
      addRoutine({
        kind: 'sleep',
        title: 'Start winding down for sleep',
        time: '22:30',
        days: [],
      });
    }
  };

  return (
    <Card
      variant="surface"
      style={[styles.container, { marginBottom: spacing.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="moon" size={18} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.captionBold, { color: colors.primary, letterSpacing: 0.8 }]}>
              SLEEP RHYTHM & TIMER
            </Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              Bedtime Wind-Down
            </Text>
          </View>
        </View>

        <Toggle
          value={isEnabled}
          onValueChange={handleToggle}
          accessibilityLabel="Bedtime wind down alarm active or inactive"
        />
      </View>

      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8, lineHeight: 18 }]}>
        Gentle chime alerts you before sleep to dim lights, reduce blue glare, and prepare your nervous system for restorative deep sleep.
      </Text>

      {/* Sleep Window Pill Display */}
      <View style={[styles.windowBox, { backgroundColor: colors.surface2, marginTop: 12 }]}>
        <PressableScale
          onPress={() => onConfigureBedtime(sleepRoutine)}
          style={styles.timeColumn}
          accessibilityLabel={`Bedtime at ${bedtimeDisplay}. Tap to adjust`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bed-outline" size={14} color={colors.text.muted} />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}>
              Bedtime
            </Text>
          </View>
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
            {bedtimeDisplay}
          </Text>
          <Text style={[typography.caption, { color: colors.primary, fontSize: 11 }]}>
            Tap to set
          </Text>
        </PressableScale>

        <View style={{ width: 1, height: 36, backgroundColor: colors.borderStrong }} />

        <PressableScale
          onPress={() => onConfigureBedtime(sleepRoutine)}
          style={styles.timeColumn}
          accessibilityLabel={`Wake-up estimate at ${wakeDisplay}`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sunny-outline" size={14} color={colors.text.muted} />
            <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}>
              Wake Up
            </Text>
          </View>
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
            {wakeDisplay}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 11 }]}>
            ~8h window
          </Text>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
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
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
