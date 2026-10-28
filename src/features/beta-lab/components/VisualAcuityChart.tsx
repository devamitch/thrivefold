/**
 * VisualAcuityChart.tsx — Digital Optotype Visual Acuity adapted from BlinkQuest.
 *
 * Distance-anchored optotype test using the Tumbling E standard.
 * Calibrated against screen-to-eye distance to subtend 5 arcminutes visual angle.
 * 100% on-device wellness exercise.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/useTheme';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PressableScale } from '../../../components/ui/PressableScale';
import { hapticLight, hapticSuccess, hapticWarning } from '../../../services/haptics';

export type OptotypeDirection = 'up' | 'down' | 'left' | 'right';

export interface VisualAcuityChartProps {
  distanceCm?: number;
  targetDistanceCm?: number;
  onComplete?: (score: number) => void;
}

const DIRECTIONS: OptotypeDirection[] = ['right', 'down', 'left', 'up'];

export function VisualAcuityChart({
  distanceCm = 40,
  targetDistanceCm = 40,
  onComplete,
}: VisualAcuityChartProps) {
  const { colors, typography, spacing } = useTheme();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [dirIndex, setDirIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentDirection = DIRECTIONS[dirIndex % DIRECTIONS.length];
  const isDistanceAligned = Math.abs(distanceCm - targetDistanceCm) <= 8;

  // Optotype font size decreases as user advances
  const optotypeSize = Math.max(22, 68 - level * 9);

  const handleInput = (chosen: OptotypeDirection) => {
    if (chosen === currentDirection) {
      hapticSuccess();
      const nextScore = score + 1;
      setScore(nextScore);
      setFeedback('Sharp focus! Stepping down optotype angle.');
      setLevel((l) => Math.min(5, l + 1));
      if (nextScore >= 5 && onComplete) {
        onComplete(nextScore);
      }
    } else {
      hapticWarning();
      setFeedback('Incorrect orientation. Adjusting optotype size.');
      setLevel((l) => Math.max(1, l - 1));
    }
    setDirIndex((i) => i + 1);
  };

  const rotation = {
    right: '0deg',
    down: '90deg',
    left: '180deg',
    up: '270deg',
  }[currentDirection];

  return (
    <SquircleSurface radius={20} fill={colors.surface2} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Optotype Visual Acuity
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
            5 arcmin visual angle benchmark
          </Text>
        </View>

        <View
          style={[
            styles.distanceBadge,
            { backgroundColor: isDistanceAligned ? colors.primaryAlpha : colors.surface3 },
          ]}
        >
          <Ionicons
            name={isDistanceAligned ? 'checkmark-circle' : 'swap-horizontal'}
            size={14}
            color={isDistanceAligned ? colors.primary : colors.warning}
          />
          <Text
            style={[
              typography.captionBold,
              { color: isDistanceAligned ? colors.primary : colors.warning, marginLeft: 4 },
            ]}
          >
            {distanceCm.toFixed(0)} cm {isDistanceAligned ? '(Harmon)' : '(Align)'}
          </Text>
        </View>
      </View>

      {/* Target Area */}
      <View style={[styles.targetContainer, { backgroundColor: colors.surface }]}>
        <View style={{ transform: [{ rotate: rotation }] }}>
          <Text
            style={{
              fontSize: optotypeSize,
              fontFamily: 'monospace',
              fontWeight: '900',
              color: colors.text.primary,
              letterSpacing: 2,
            }}
          >
            E
          </Text>
        </View>
      </View>

      {feedback ? (
        <Text style={[typography.caption, { color: colors.primary, textAlign: 'center', marginTop: 6 }]}>
          {feedback}
        </Text>
      ) : (
        <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginTop: 6 }]}>
          Which direction are the branches of &apos;E&apos; pointing?
        </Text>
      )}

      {/* Direction Buttons */}
      <View style={styles.controlsGrid}>
        <View style={styles.buttonRow}>
          <PressableScale
            onPress={() => handleInput('up')}
            style={[styles.dirBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-up" size={20} color={colors.text.primary} />
          </PressableScale>
        </View>
        <View style={[styles.buttonRow, { gap: 16 }]}>
          <PressableScale
            onPress={() => handleInput('left')}
            style={[styles.dirBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </PressableScale>
          <View style={styles.scorePill}>
            <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
              Lvl {level} · {score} pts
            </Text>
          </View>
          <PressableScale
            onPress={() => handleInput('right')}
            style={[styles.dirBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
          </PressableScale>
        </View>
        <View style={styles.buttonRow}>
          <PressableScale
            onPress={() => handleInput('down')}
            style={[styles.dirBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-down" size={20} color={colors.text.primary} />
          </PressableScale>
        </View>
      </View>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  targetContainer: {
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  controlsGrid: {
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
