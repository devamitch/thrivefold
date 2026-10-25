import { SquircleSurface } from './SquircleSurface';
import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';

export interface GuidedTimerProps {
  minutes: number;
  /** Optional cues shown in order, evenly spread over the session. */
  cues?: string[];
  startLabel?: string;
  onFinished?: () => void;
}

/** Start/pause/reset countdown with optional step cues and a haptic at the end. */
export function GuidedTimer({ minutes, cues = [], startLabel = 'Start', onFinished }: GuidedTimerProps) {
  const { colors, typography, spacing } = useTheme();
  const total = Math.round(minutes * 60);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0 && running && !finished.current) {
      finished.current = true;
      setRunning(false);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      onFinished?.();
    }
  }, [left, running, onFinished]);

  const elapsed = total - left;
  const cue = cues.length ? cues[Math.min(cues.length - 1, Math.floor((elapsed / Math.max(1, total)) * cues.length))] : null;
  const started = elapsed > 0;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <SquircleSurface style={{ marginTop: spacing.sm }}>
      {started || running ? (
        <>
          <Text style={[typography.heading, { color: colors.text.primary }]} accessibilityLiveRegion="polite">
            {left === 0 ? 'Done' : `${mm}:${ss}`}
          </Text>
          {cue && left > 0 ? <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{cue}</Text> : null}
          <SquircleSurface style={[styles.track, { backgroundColor: colors.surface2, marginTop: spacing.sm }]}>
            <SquircleSurface style={[styles.fill, { backgroundColor: colors.primary, width: `${(elapsed / Math.max(1, total)) * 100}%` }]} />
          </SquircleSurface>
        </>
      ) : null}
      <SquircleSurface style={[styles.row, { marginTop: spacing.sm }]}>
        {left > 0 ? (
          <Button
            label={running ? 'Pause' : started ? 'Resume' : startLabel}
            size="sm"
            variant={running ? 'outline' : 'primary'}
            onPress={() => setRunning((r) => !r)}
          />
        ) : null}
        {started ? (
          <Button
            label="Reset"
            size="sm"
            variant="ghost"
            onPress={() => {
              setRunning(false);
              setLeft(total);
              finished.current = false;
            }}
          />
        ) : null}
      </SquircleSurface>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%' },
});
