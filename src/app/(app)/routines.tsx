import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { Toggle } from '../../components/ui/Toggle';
import { isHHMM, ROUTINE_PRESETS, routineTimes, type Routine } from '../../domain/routines';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const describe = (r: Pick<Routine, 'time' | 'days' | 'everyHours' | 'until'>) => {
  const when = r.everyHours ? `every ${r.everyHours} h, ${routineTimes(r)[0]}–${r.until}` : r.time;
  const days = !r.days.length ? 'every day' : r.days.length === 5 && !r.days.includes(6) && !r.days.includes(7) ? 'weekdays' : r.days.map((d) => DAYS[d - 1]).join(', ');
  return `${when} · ${days}`;
};

/** Routine nudges: presets in one tap, custom ones with a time and days. Also set from the coach. */
export default function RoutinesScreen() {
  const { colors, typography, spacing } = useTheme();
  const { routines, addRoutine, updateRoutine, removeRoutine } = useRootStore(
    useShallow((s) => ({ routines: s.routines, addRoutine: s.addRoutine, updateRoutine: s.updateRoutine, removeRoutine: s.removeRoutine })),
  );
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<number[]>([]);
  const unused = ROUTINE_PRESETS.filter((p) => !routines.some((r) => r.kind === p.kind && r.title === p.title));

  const save = () => {
    if (!title.trim() || !isHHMM(time)) return;
    addRoutine({ kind: 'custom', title: title.trim(), time, days });
    setTitle('');
    setTime('08:00');
    setDays([]);
    setAdding(false);
  };

  return (
    <ScreenContainer header={<AppHeader title="Routines" subtitle="Gentle nudges at the times you choose" showBack />} scrollMode="shell-scroll-view">
      <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.md }]}>
        Reminders are scheduled on this phone. Opening one counts as keeping the routine and earns a gem. You can also say “remind me to
        stretch at 6 pm every weekday” to Anvay.
      </Text>

      {routines.length ? (
        routines.map((r) => (
          <Card key={r.id} style={[styles.row, { marginBottom: spacing.sm }]}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{r.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>{describe(r)}</Text>
            </View>
            <Toggle value={r.enabled} onValueChange={(v) => updateRoutine(r.id, { enabled: v })} accessibilityLabel={`${r.title} on or off`} />
            <PressableScale onPress={() => removeRoutine(r.id)} hitSlop={10} accessibilityLabel={`Delete ${r.title}`} style={{ marginLeft: 12 }}>
              <Ionicons name="trash-outline" size={20} color={colors.text.muted} />
            </PressableScale>
          </Card>
        ))
      ) : (
        <Text style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.md }]}>No routines yet. Pick one below or add your own.</Text>
      )}

      {unused.length ? (
        <>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>Suggestions</Text>
          {unused.map((p) => (
            <PressableScale key={p.title} onPress={() => addRoutine(p)} style={[styles.row, styles.suggestion, { backgroundColor: colors.surface }]} accessibilityRole="button">
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{p.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{describe(p)}</Text>
              </View>
            </PressableScale>
          ))}
        </>
      ) : null}

      <View style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
        {adding ? (
          <Card>
            <TextField label="What" value={title} onChangeText={setTitle} placeholder="e.g. Take a 5-minute walk" />
            <TextField
              label="Time (24-hour)"
              value={time}
              onChangeText={setTime}
              placeholder="08:00"
              keyboardType="numbers-and-punctuation"
              error={time && !isHHMM(time) ? 'Use HH:MM, e.g. 18:30' : undefined}
              containerStyle={{ marginTop: spacing.sm }}
            />
            <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: spacing.sm }]}>Days (none = every day)</Text>
            <View style={styles.days}>
              {DAYS.map((d, i) => (
                <Chip
                  key={d}
                  label={d}
                  selected={days.includes(i + 1)}
                  onPress={() => setDays((cur) => (cur.includes(i + 1) ? cur.filter((x) => x !== i + 1) : [...cur, i + 1].sort()))}
                />
              ))}
            </View>
            <View style={[styles.row, { marginTop: spacing.sm, gap: 8 }]}>
              <Button label="Save" size="sm" disabled={!title.trim() || !isHHMM(time)} onPress={save} />
              <Button label="Cancel" size="sm" variant="ghost" onPress={() => setAdding(false)} />
            </View>
          </Card>
        ) : (
          <Button label="Add your own routine" variant="outline" onPress={() => setAdding(true)} />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  suggestion: { gap: 12, borderRadius: 14, padding: 12, marginBottom: 8 },
  days: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
});
