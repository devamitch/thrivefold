/**
 * BlinkBloomExercise.tsx — Interactive slow-blink routine adapted from BlinkQuest.
 *
 * Screen staring reduces natural blink rate from 15-20 bpm down to 4-6 bpm,
 * causing tear film breakup and dry eye syndrome.
 *
 * Blink Bloom detects full, deliberate blinks in real-time via Eye Aspect Ratio (EAR)
 * to bloom flower petals and restore ocular hydration.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/useTheme';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PressableScale } from '../../../components/ui/PressableScale';
import { eyeBatteryManager } from '../../../domain/vision/eyeBattery';
import { hapticSuccess, hapticSelection } from '../../../services/haptics';

export interface BlinkBloomExerciseProps {
  blinkCount: number;
  isOpen: boolean;
  earAvg: number;
  onComplete?: () => void;
}

const TARGET_BLINKS = 8;

export function BlinkBloomExercise({
  blinkCount,
  isOpen,
  earAvg,
  onComplete,
}: BlinkBloomExerciseProps) {
  const { colors, typography } = useTheme();
  const [initialBlinks, setInitialBlinks] = useState<number | null>(null);
  const [bloomedPetals, setBloomedPetals] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (initialBlinks === null) {
      setInitialBlinks(blinkCount);
    } else {
      const delta = Math.max(0, blinkCount - initialBlinks);
      setBloomedPetals(Math.min(TARGET_BLINKS, delta));
      if (delta >= TARGET_BLINKS && !completed) {
        setCompleted(true);
        hapticSuccess();
        eyeBatteryManager.recharge('blink');
        if (onComplete) onComplete();
      }
    }
  }, [blinkCount, initialBlinks, completed, onComplete]);

  const resetExercise = () => {
    hapticSelection();
    setInitialBlinks(blinkCount);
    setBloomedPetals(0);
    setCompleted(false);
  };

  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <SquircleSurface radius={20} fill={colors.surface2} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Blink Bloom Routine
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
            Slow, full blinks replenish tear film moisture
          </Text>
        </View>

        <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {bloomedPetals}/{TARGET_BLINKS} Petals
          </Text>
        </SquircleSurface>
      </View>

      {/* Flower Arena */}
      <View style={[styles.bloomContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.flowerCenter}>
          {petalAngles.map((angle, idx) => {
            const isBloomed = idx < bloomedPetals;
            return (
              <View
                key={angle}
                style={[
                  styles.petal,
                  {
                    transform: [{ rotate: `${angle}deg` }, { translateY: -32 }],
                    backgroundColor: isBloomed ? colors.primary : colors.surface3,
                    opacity: isBloomed ? 1 : 0.4,
                  },
                ]}
              />
            );
          })}
          <View style={[styles.coreCircle, { backgroundColor: completed ? colors.success : colors.primary }]}>
            <Ionicons
              name={completed ? 'checkmark' : isOpen ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#FFF"
            />
          </View>
        </View>
      </View>

      {/* Instructional Status */}
      <View style={{ marginTop: 12, alignItems: 'center' }}>
        {completed ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.bodyBold, { color: colors.success }]}>
              Bloom Completed! +6 Eye Battery Recharged
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Tear film lipid layer restored. Keep posture relaxed.
            </Text>
            <PressableScale onPress={resetExercise} style={{ marginTop: 8 }}>
              <SquircleSurface radius={12} fill={colors.surface3} style={styles.resetBtn}>
                <Ionicons name="refresh" size={14} color={colors.text.primary} />
                <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 4 }]}>
                  Repeat Routine
                </Text>
              </SquircleSurface>
            </PressableScale>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {isOpen ? 'Close your eyes gently for 1 second...' : 'Now open and pause.'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
              EAR: {earAvg.toFixed(2)} · Measured via front camera Face Landmarker
            </Text>
          </View>
        )}
      </View>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 8, paddingVertical: 4 },
  bloomContainer: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  flowerCenter: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petal: {
    position: 'absolute',
    width: 14,
    height: 28,
    borderRadius: 7,
  },
  coreCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
