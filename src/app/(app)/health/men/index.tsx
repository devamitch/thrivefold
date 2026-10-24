import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';

import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../../components/ui/AppHeader';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { formatLocalDate } from '../../../../domain/calendar/universalCalendarEngine';
import { planById, sessionsThisWeek } from '../../../../domain/fitness/workouts';

/** Men's health hub: today's own check-in, training, recovery, reflection and education. */
export default function MenHealthScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { checkIns, sessions } = useRootStore(
    useShallow((s) => ({ checkIns: s.checkInHistory, sessions: s.workoutSessions })),
  );
  const today = formatLocalDate(new Date());
  const todays = checkIns.find((c) => c.date === today);
  const week = sessionsThisWeek(sessions, today);
  const last = sessions[0];
  const openPlan = (id: string) => router.push(`/(app)/health/workout/${id}` as Href);

  return (
    <ScreenContainer header={<AppHeader title="Men's Health" subtitle="Strength, recovery and health basics" showBack />} scrollMode="shell-scroll-view">
      <View style={{ paddingBottom: spacing.xxl }}>
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Today</Text>
          {todays ? (
            <View style={[styles.statusRow, { marginTop: spacing.sm }]}>
              <Stat label="Energy" value={`${todays.energy}/10`} />
              <Stat label="Stress" value={`${todays.stress}/10`} />
              <Stat label="Sleep" value={`${todays.sleepHours}h`} />
            </View>
          ) : (
            <>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                Check in to tailor today&apos;s training to how you actually feel.
              </Text>
              <Button label="Check in" size="sm" onPress={() => router.push('/(app)/check-in')} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
            </>
          )}
          {todays && (todays.energy <= 3 || todays.stress >= 8) ? (
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              Low energy or high stress today: the recovery plan is a good choice.
            </Text>
          ) : null}
        </Card>

        <Card style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <View style={styles.imageWrap}>
            <Image source={require('../../../../../assets/illustrations/workout-strength.jpg')} style={styles.cardImage} contentFit="cover" />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 14 }]}>Strength training</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {week} workout{week === 1 ? '' : 's'} this week
            {last ? ` · last: ${planById(last.planId)?.title ?? 'workout'}` : ''}
          </Text>
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <Button label="Home basics" size="sm" onPress={() => openPlan('home_beginner')} />
            <Button label="Gym A" size="sm" variant="outline" onPress={() => openPlan('gym_full_a')} />
            <Button label="All plans" size="sm" variant="ghost" onPress={() => router.push('/(app)/health/exercise')} />
          </View>
          <Button
            label="Count squats with the camera"
            size="sm"
            variant="ghost"
            onPress={() => router.push('/(app)/health/pose-check' as Href)}
            style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
          />
        </Card>

        <Card style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <View style={styles.imageWrap}>
            <Image source={require('../../../../../assets/illustrations/workout-mobility.jpg')} style={styles.cardImage} contentFit="cover" />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 14 }]}>Mobility and recovery</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            A ten-minute desk reset, or an easy walk and stretch on rest days.
          </Text>
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <Button label="Desk reset" size="sm" variant="outline" onPress={() => openPlan('desk_reset')} />
            <Button label="Recovery day" size="sm" variant="outline" onPress={() => openPlan('recovery_walk')} />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Stress and frustration</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            Write down what happened and what you need, privately on this device.
          </Text>
          <Button label="Write a private note" size="sm" variant="outline" onPress={() => router.push('/(app)/journal/new')} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
        </Card>

        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Health basics</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            Reproductive, urinary and pelvic-floor information, and when to see a clinician.
          </Text>
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <Button label="Reproductive health" size="sm" variant="outline" onPress={() => router.push('/(app)/health/reproductive')} />
            <Button label="Pelvic floor" size="sm" variant="ghost" onPress={() => router.push('/(app)/health/pelvic-floor')} />
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.statusItem}>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusItem: { alignItems: 'center', flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageWrap: { width: '100%', height: 140, borderRadius: 14, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
});
