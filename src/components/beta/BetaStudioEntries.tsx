import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getPracticeMinuteBars } from '../../domain/analytics/dashboardAnalytics';
import { useBetaEnabled } from '../../hooks/useBetaEnabled';
import { useRootStore } from '../../stores/useRootStore';
import { MetricBarChart } from '../home/MetricBarChart';
import { useTheme } from '../../theme/useTheme';
import { BetaEntryCard } from './BetaEntryCard';

type Section = 'wellbeing' | 'movement' | 'steps' | 'progress';

const ENTRIES: Record<Section, { icon: React.ComponentProps<typeof BetaEntryCard>['icon']; title: string; subtitle: string; route: string }[]> = {
  wellbeing: [
    { icon: 'eye-outline', title: 'Eye comfort studio', subtitle: 'Blink rate, screen distance and guided eye exercises with the coach', route: '/(app)/beta-lab/eye-tracking' },
    { icon: 'leaf-outline', title: 'Breathing coach', subtitle: 'Paced breathing with spoken cues', route: '/(app)/beta-lab/breathing' },
    { icon: 'happy-outline', title: 'Face & eye exercises', subtitle: 'Brows, smile, jaw, eye squeeze and gaze drills with the coach', route: '/(app)/beta-lab/face-exercises' },
  ],
  movement: [
    { icon: 'body-outline', title: 'Live pose coach', subtitle: 'Skeleton tracking, joint angles and rep counting on this phone', route: '/(app)/beta-lab/pose-coach' },
    { icon: 'hand-left-outline', title: 'Hand and grip exercises', subtitle: 'Grip reps counted from hand landmarks, with the coach counting', route: '/(app)/beta-lab/hand-gestures' },
    { icon: 'game-controller-outline', title: 'Finger Count Challenge', subtitle: 'A coach-voiced hand game for dexterity breaks', route: '/(app)/beta-lab/gesture-game' },
  ],
  steps: [
    { icon: 'walk-outline', title: 'Treadmill, walking pad, swim or ride', subtitle: 'Time a session; the phone cannot count steps it is not carried for', route: '/(app)/health/activity' },
  ],
  progress: [
    { icon: 'eye-outline', title: 'Eye sessions', subtitle: 'Your measured blink rate and screen distance over time', route: '/(app)/beta-lab/eye-tracking' },
    { icon: 'flask-outline', title: 'All beta studios', subtitle: 'Every beta feature, its status and what it needs', route: '/(app)/beta-lab' },
  ],
};

/** The beta products that belong to one section of the app; nothing when Beta Mode is off. */
export function BetaStudioEntries({ section, onBeforeNavigate }: { section: Section; onBeforeNavigate?: () => void }) {
  const enabled = useBetaEnabled();
  const { colors, typography, spacing } = useTheme();
  const sessions = useRootStore((s) => s.betaSessions);
  const bars = useMemo(() => (section === 'progress' ? getPracticeMinuteBars(sessions) : []), [section, sessions]);
  if (!enabled) return null;
  const week = bars.reduce((n, b) => n + b.value, 0);
  return (
    <View style={[styles.wrap, { marginTop: spacing.lg }]}>
      <Text style={[typography.label, { color: colors.text.muted }]}>Beta</Text>
      {section === 'progress' && week > 0 ? (
        <MetricBarChart
          bars={bars}
          title="Guided practice"
          subtitle="Breathing, eye and hand studio minutes, last 7 days"
          totalDisplay={`${week} min`}
        />
      ) : null}
      {ENTRIES[section].map((e) => (
        <BetaEntryCard key={e.route + e.title} {...e} onBeforeNavigate={onBeforeNavigate} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: {} });
