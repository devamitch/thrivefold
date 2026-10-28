/**
 * NearFarFocusExercise.tsx — Guided 20-20-20 Near / Far Focus Break adapted from BlinkQuest.
 *
 * Prevents ciliary muscle spasm and asthenopia (digital eye fatigue).
 * Guides user to look at the screen, then shift gaze to an object 20 feet (6m) away
 * for 20 seconds.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/useTheme';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PressableScale } from '../../../components/ui/PressableScale';
import { eyeBatteryManager } from '../../../domain/vision/eyeBattery';
import { hapticSuccess, hapticSelection, hapticLight } from '../../../services/haptics';

export interface NearFarFocusExerciseProps {
  onComplete?: () => void;
}

type Phase = 'ready' | 'near' | 'far' | 'complete';

export function NearFarFocusExercise({ onComplete }: NearFarFocusExerciseProps) {
  const { colors, typography } = useTheme();
  const [phase, setPhase] = useState<Phase>('ready');
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (phase === 'ready' || phase === 'complete') return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (phase === 'near') {
            hapticSuccess();
            setPhase('far');
            return 20; // 20 seconds far
          } else if (phase === 'far') {
            hapticSuccess();
            setPhase('complete');
            eyeBatteryManager.recharge('focus');
            if (onComplete) onComplete();
            return 0;
          }
        }
        if (s % 5 === 0) hapticLight();
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, onComplete]);

  const startExercise = () => {
    hapticSelection();
    setPhase('near');
    setSecondsLeft(5);
  };

  const resetExercise = () => {
    hapticSelection();
    setPhase('ready');
    setSecondsLeft(5);
  };

  return (
    <SquircleSurface radius={20} fill={colors.surface2} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            20-20-20 Near / Far Reset
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
            Relieves ciliary muscle spasm by shifting focal depth
          </Text>
        </View>

        <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {phase === 'ready'
              ? 'Ready'
              : phase === 'near'
                ? `Near (${secondsLeft}s)`
                : phase === 'far'
                  ? `Look Far (${secondsLeft}s)`
                  : 'Done'}
          </Text>
        </SquircleSurface>
      </View>

      {/* Visual Depth Stage */}
      <View style={[styles.stageContainer, { backgroundColor: colors.surface }]}>
        {phase === 'ready' && (
          <View style={styles.centerCol}>
            <Ionicons name="resize-outline" size={36} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
              Ready for 20-20-20 Break
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 2 }]}>
              You will look near at the screen, then 20 ft (6m) away out a window or across the room.
            </Text>
          </View>
        )}

        {phase === 'near' && (
          <View style={styles.centerCol}>
            <View style={[styles.targetRing, { borderColor: colors.primary }]}>
              <Text style={[typography.display, { color: colors.primary, fontSize: 32 }]}>
                {secondsLeft}
              </Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
              Focus on this point
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Preparing ciliary muscles for decompression
            </Text>
          </View>
        )}

        {phase === 'far' && (
          <View style={styles.centerCol}>
            <View style={[styles.targetRing, { borderColor: colors.success, borderStyle: 'dashed' }]}>
              <Text style={[typography.display, { color: colors.success, fontSize: 32 }]}>
                {secondsLeft}
              </Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.success, marginTop: 6 }]}>
              Look 20 feet (6m) away now!
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              Look out the window or across the corridor to relax lens tension
            </Text>
          </View>
        )}

        {phase === 'complete' && (
          <View style={styles.centerCol}>
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text style={[typography.bodyBold, { color: colors.success, marginTop: 6 }]}>
              Ciliary Muscles Relaxed!
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              +6 Eye Battery recharged to daily reserves.
            </Text>
          </View>
        )}
      </View>

      {/* Button */}
      <View style={{ marginTop: 12 }}>
        {phase === 'ready' && (
          <PressableScale onPress={startExercise}>
            <SquircleSurface radius={14} fill={colors.primary} style={styles.btn}>
              <Ionicons name="play" size={16} color="#FFF" />
              <Text style={[typography.bodyBold, { color: '#FFF', marginLeft: 6 }]}>
                Start 20-20-20 Exercise
              </Text>
            </SquircleSurface>
          </PressableScale>
        )}

        {phase === 'complete' && (
          <PressableScale onPress={resetExercise}>
            <SquircleSurface radius={14} fill={colors.surface3} style={styles.btn}>
              <Ionicons name="refresh" size={16} color={colors.text.primary} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
                Run Again
              </Text>
            </SquircleSurface>
          </PressableScale>
        )}
      </View>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 8, paddingVertical: 4 },
  stageContainer: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  centerCol: { alignItems: 'center' },
  targetRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
