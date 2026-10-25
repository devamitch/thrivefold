import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { videoFor } from '../../../content/exerciseVideos';
import { EXERCISES, type Equipment } from '../../../domain/fitness/workouts';
import { movementForExercise } from '../../../domain/pose/movement';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

const EQUIP: { id: 'all' | Equipment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'none', label: 'No equipment' },
  { id: 'chair', label: 'Chair' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'band', label: 'Band' },
  { id: 'machine', label: 'Machine' },
  { id: 'barbell', label: 'Barbell' },
];

/** Every exercise, searchable, with what equipment it needs, a video and camera support. */
export default function ExerciseLibraryScreen() {
  const { colors, typography, spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [equip, setEquip] = useState<(typeof EQUIP)[number]['id']>('all');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => (equip === 'all' || e.equipment === equip) && (!q || e.name.toLowerCase().includes(q) || e.pattern.includes(q)));
  }, [query, equip]);

  return (
    <ScreenContainer header={<AppHeader title="Exercise library" subtitle={`${EXERCISES.length} movements with steps and videos`} showBack />} scrollMode="none">
      <SquircleSurface style={{ paddingHorizontal: spacing.base }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search, e.g. squat, plank, stretch"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }]}
        />
        <SquircleSurface style={[styles.chips, { marginTop: spacing.sm }]}>
          {EQUIP.map((e) => (
            <Chip key={e.id} label={e.label} selected={equip === e.id} onPress={() => setEquip(e.id)} />
          ))}
        </SquircleSurface>
      </SquircleSurface>
      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.xxl }}
        initialNumToRender={12}
        ListEmptyComponent={<Text style={[typography.subbody, { color: colors.text.secondary }]}>No exercise matches. Try another word.</Text>}
        renderItem={({ item }) => (
          <Link href={`/(app)/train/exercise/${item.id}` as Href} asChild>
            <PressableScale
              accessibilityRole="button"
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              <SquircleSurface style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {item.pattern} · {item.equipment === 'none' ? 'no equipment' : item.equipment}
                </Text>
              </SquircleSurface>
              {videoFor(item.id) ? <Ionicons name="play-circle-outline" size={18} color={colors.primary} style={styles.icon} /> : null}
              {movementForExercise(item.id) ? <Ionicons name="scan-outline" size={18} color={colors.primary} style={styles.icon} /> : null}
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </PressableScale>
          </Link>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  icon: { marginRight: 8 },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  row: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12 },
});
