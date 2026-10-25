import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { EXERCISES, exerciseById } from '../../../domain/fitness/workouts';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

/**
 * Record a workout already done, e.g. "10 squats tonight". Saved as self-reported (never as
 * camera-checked) to history and the calendar. It does not complete a quest on its own.
 */
export default function ManualLogScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { exercise } = useLocalSearchParams<{ exercise?: string }>();
  const [exerciseId, setExerciseId] = useState<string | null>(exercise ?? null);
  const [query, setQuery] = useState('');
  const [sets, setSets] = useState<string[]>(['10']);
  const ex = exerciseId ? exerciseById(exerciseId) : undefined;
  const unit = ex?.timed ? 'seconds' : 'reps';
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => !q || e.name.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);
  const values = sets.map((v) => parseInt(v, 10)).filter((n) => Number.isFinite(n) && n > 0 && n <= 1000);

  const save = () => {
    if (!ex || values.length === 0) return;
    const now = new Date().toISOString();
    const st = useRootStore.getState();
    st.saveWorkoutSession({
      planId: 'manual',
      date: formatLocalDate(new Date()),
      startedAt: now,
      finishedAt: now,
      entries: [{ exerciseId: ex.id, sets: values.map((value) => ({ value })) }],
      painReported: false,
      verification: 'manual',
    });
    st.showToast({ type: 'success', title: 'Logged', message: `${ex.name}: ${values.join(' + ')} ${unit}, self-reported.` });
    router.back();
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Log a workout you did" subtitle="Self-reported, saved to history and calendar" showBack />}
      scrollMode="shell-scroll-view"
      footer={<Button label="Save" size="lg" disabled={!ex || values.length === 0} onPress={save} />}
    >
      {ex ? (
        <Card style={{ padding: spacing.base }}>
          <View style={styles.row}>
            <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>{ex.name}</Text>
            <Button label="Change" size="sm" variant="ghost" onPress={() => setExerciseId(null)} />
          </View>
          {sets.map((v, i) => (
            <View key={i} style={[styles.row, { marginTop: spacing.sm }]}>
              <Text style={[typography.body, { color: colors.text.secondary, width: 60 }]}>Set {i + 1}</Text>
              <TextInput
                value={v}
                onChangeText={(t) => setSets((cur) => cur.map((x, j) => (j === i ? t.replace(/[^0-9]/g, '').slice(0, 4) : x)))}
                keyboardType="number-pad"
                accessibilityLabel={`Set ${i + 1} ${unit}`}
                style={[styles.input, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }]}
              />
              <Text style={[typography.body, { color: colors.text.secondary, marginLeft: 8 }]}>{unit}</Text>
              {sets.length > 1 ? (
                <PressableScale onPress={() => setSets((cur) => cur.filter((_, j) => j !== i))} hitSlop={8} accessibilityLabel={`Remove set ${i + 1}`} style={{ marginLeft: 8 }}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.text.muted} />
                </PressableScale>
              ) : null}
            </View>
          ))}
          <Button label="Add a set" size="sm" variant="outline" onPress={() => setSets((cur) => [...cur, cur[cur.length - 1] ?? '10'])} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
            Saved as self-reported for today. To have reps counted and checked, use the camera coach.
          </Text>
        </Card>
      ) : (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Which exercise? e.g. squat"
            placeholderTextColor={colors.text.muted}
            style={[styles.search, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }]}
          />
          {options.map((e) => (
            <PressableScale key={e.id} onPress={() => setExerciseId(e.id)} accessibilityRole="button" style={[styles.option, { borderBottomColor: colors.border }]}>
              <Text style={[typography.body, styles.flex, { color: colors.text.primary }]}>{e.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </PressableScale>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, width: 90 },
  option: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12 },
  row: { alignItems: 'center', flexDirection: 'row' },
  search: { borderRadius: 14, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10 },
});
