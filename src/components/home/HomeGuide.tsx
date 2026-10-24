import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

/**
 * First-run guide on Home: the three things that make Thrivefold work, each ticked off
 * from real activity. Hides itself once all three are done, or when dismissed.
 */
export function HomeGuide() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { done, checkedIn, questDone, workoutDone, dismiss } = useRootStore(
    useShallow((s) => ({
      done: s.homeGuideDone,
      checkedIn: s.checkInHistory.length > 0,
      questDone: s.questsCompleted > 0,
      workoutDone: s.workoutSessions.length > 0,
      dismiss: s.setHomeGuideDone,
    })),
  );
  if (done || (checkedIn && questDone && workoutDone)) return null;

  const steps: { done: boolean; title: string; body: string; route: Href; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      done: checkedIn,
      title: 'Check in',
      body: 'One minute: energy, mood, stress and sleep. Your quests adjust to how today feels.',
      route: '/(app)/check-in',
      icon: 'sunny-outline',
    },
    {
      done: questDone,
      title: 'Do one quest',
      body: 'Small tasks picked for you. Each one says why it helps and exactly what to do.',
      route: '/(app)/(tabs)/today',
      icon: 'checkmark-circle-outline',
    },
    {
      done: workoutDone,
      title: 'Try the camera coach',
      body: 'Follow a video while the camera counts reps and checks form. Good form earns 10x XP.',
      route: '/(app)/health/exercise' as Href,
      icon: 'videocam-outline',
    },
  ];

  return (
    <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
      <View style={styles.rowBetween}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>How Thrivefold works</Text>
        <Pressable onPress={dismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Hide this guide">
          <Ionicons name="close" size={18} color={colors.text.muted} />
        </Pressable>
      </View>
      {steps.map((s, i) => (
        <Pressable
          key={s.title}
          onPress={() => router.push(s.route)}
          accessibilityRole="button"
          style={styles.step}
        >
          <View style={[styles.badge, { backgroundColor: s.done ? colors.successSurface : colors.primaryAlpha }]}>
            <Ionicons name={s.done ? 'checkmark' : s.icon} size={18} color={s.done ? colors.success : colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, { color: colors.text.primary, textDecorationLine: s.done ? 'line-through' : 'none' }]}>
              {i + 1}. {s.title}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{s.body}</Text>
          </View>
          {!s.done ? <Ionicons name="chevron-forward" size={16} color={colors.text.muted} /> : null}
        </Pressable>
      ))}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Every quest and workout earns XP. XP raises your level and moves you along your roadmap.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', borderRadius: 12, height: 36, justifyContent: 'center', marginRight: 12, width: 36 },
  flex: { flex: 1 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  step: { alignItems: 'center', flexDirection: 'row', paddingVertical: 10 },
});
