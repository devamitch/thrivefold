import { SquircleSurface } from '../ui/SquircleSurface';
import React, { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticLight, hapticMedium, hapticSuccess } from '../../services/haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';

export interface SomaticWellnessArcadeProps {
  onCompleteExercise: (exerciseType: 'breath' | 'pelvic' | 'zen', points: number, xp: number) => void;
}

export const SomaticWellnessArcade: React.FC<SomaticWellnessArcadeProps> = React.memo(({
  onCompleteExercise,
}) => {
  const { colors, typography, spacing } = useTheme();

  // Internal Breath Game state
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [, setBreathCycles] = useState(0);

  // Internal Pelvic Sync Game state
  const [pelvicActive, setPelvicActive] = useState(false);
  const [pelvicPhase, setPelvicPhase] = useState<'lift' | 'release'>('lift');
  const [pelvicSeconds, setPelvicSeconds] = useState(5);
  const [pelvicReps, setPelvicReps] = useState(0);

  // Internal Zen Tap Game state
  const [zenTaps, setZenTaps] = useState(0);

  // Breathwork 4-7-8 timer loop (isolated to this component only!)
  useEffect(() => {
    if (!breathActive) return;
    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (breathPhase === 'inhale') {
          setBreathPhase('hold');
          hapticMedium();
          return 7;
        } else if (breathPhase === 'hold') {
          setBreathPhase('exhale');
          hapticLight();
          return 8;
        } else {
          setBreathPhase('inhale');
          hapticSuccess();
          setBreathCycles((c) => {
            const nextCount = c + 1;
            if (nextCount === 1) {
              onCompleteExercise('breath', 10, 15);
            }
            return nextCount;
          });
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathActive, breathPhase, onCompleteExercise]);

  // Pelvic floor sync timer loop (isolated to this component only!)
  useEffect(() => {
    if (!pelvicActive) return;
    const interval = setInterval(() => {
      setPelvicSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (pelvicPhase === 'lift') {
          setPelvicPhase('release');
          hapticLight();
          return 5;
        } else {
          setPelvicPhase('lift');
          hapticMedium();
          setPelvicReps((r) => {
            const next = r + 1;
            if (next >= 3) {
              setPelvicActive(false);
              onCompleteExercise('pelvic', 10, 15);
            }
            return next;
          });
          return 5;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pelvicActive, pelvicPhase, onCompleteExercise]);

  const handleTapZen = useCallback(() => {
    hapticLight();
    setZenTaps((t) => {
      const next = t + 1;
      if (next === 5) {
        onCompleteExercise('zen', 10, 15);
      }
      return next;
    });
  }, [onCompleteExercise]);

  return (
    <>
      {/* Game 1: Somatic Breath Blossom */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Breathing pace
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              4-7-8 parasympathetic tone release
            </Text>
          </View>
          <Badge label="+10 Pts" variant="primary" />
        </View>

        <View style={styles.breathCircleWrap}>
          <View
            style={[
              styles.breathCircle,
              {
                backgroundColor: colors.surface1,
                borderColor: colors.primary,
                transform: [
                  {
                    scale:
                      breathPhase === 'inhale'
                        ? 1.2
                        : breathPhase === 'hold'
                        ? 1.2
                        : 0.9,
                  },
                ],
              },
            ]}
          >
            <Text style={[typography.display, { color: colors.primary }]}>
              {breathSeconds}
            </Text>
            <Text
              style={[
                typography.captionBold,
                { color: colors.text.secondary, textTransform: 'uppercase', marginTop: 4 },
              ]}
            >
              {breathPhase}
            </Text>
          </View>
        </View>

        <Button
          label={breathActive ? 'Pause Breathwork' : 'Start 4-7-8 Blossom'}
          variant={breathActive ? 'outline' : 'primary'}
          onPress={() => {
            hapticMedium();
            setBreathActive(!breathActive);
          }}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* Game 2: Pelvic Floor Rhythm Sync */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Pelvic Floor Rhythm Sync
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              5s gentle pelvic lift • 5s complete release
            </Text>
          </View>
          <Badge label={`Rep ${pelvicReps}/3`} variant="primary" />
        </View>

        <View style={[styles.pelvicIndicator, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <Text style={[typography.heading, { color: colors.primary }]}>
            {pelvicActive ? `${pelvicPhase.toUpperCase()} (${pelvicSeconds}s)` : 'Ready'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            {pelvicPhase === 'lift'
              ? 'Gently draw the pelvic muscles inward and upward.'
              : 'Completely soften, relax, and let go.'}
          </Text>
        </View>

        <Button
          label={pelvicActive ? 'Stop Exercise' : 'Start Pelvic Sync (3 Reps)'}
          variant={pelvicActive ? 'outline' : 'primary'}
          onPress={() => {
            hapticMedium();
            setPelvicActive(!pelvicActive);
          }}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* Game 3: Zen Harmonic Tap (NO SPARKLE ICONS!) */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Zen Harmonic Rhythm
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Tap to start a short pause
            </Text>
          </View>
          <Badge label={`${zenTaps} Taps`} variant="neutral" />
        </View>

        <PressableScale
          onPress={handleTapZen}
          scaleTo={0.92}
          style={[styles.zenOrb, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
          accessibilityRole="button"
          accessibilityLabel="Zen tap button"
        >
          <Ionicons name="disc-outline" size={32} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary, marginTop: 6 }]}>
            TAP WITH YOUR HEARTBEAT
          </Text>
        </PressableScale>
      </Card>
    </>
  );
});

SomaticWellnessArcade.displayName = 'SomaticWellnessArcade';

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breathCircleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pelvicIndicator: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  zenOrb: {
    height: 110,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
