import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { foodById, searchFoods, totals, type MealItem } from '../../../domain/nutrition/foods';
import { useRootStore } from '../../../stores/useRootStore';
import type { MealLog } from '../../../stores/slices/healthSlice';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

const TYPES: { id: MealLog['type']; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

const typeForNow = (): MealLog['type'] => {
  const h = new Date().getHours();
  return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 22 ? 'dinner' : 'snack';
};

/**
 * Log a meal: an optional photo kept only on this phone, the foods on the plate with
 * portions, and live calorie and macro totals from typical values. Saving also completes
 * today's meal quest when there is one.
 */
export default function MealLogScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [type, setType] = useState<MealLog['type']>(typeForNow);
  const [photo, setPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<MealItem[]>([]);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const sum = useMemo(() => totals(items), [items]);
  const results = useMemo(() => searchFoods(query).slice(0, query ? 20 : 12), [query]);

  const pick = async (camera: boolean) => {
    try {
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      } else if (Platform.OS === 'ios') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
      }
      const res = camera
        ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3] })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3], mediaTypes: ['images'] });
      if (res.canceled || !res.assets[0]) return;
      // Keep the photo in the app's private folder, not the shared gallery.
      const dir = `${FileSystem.documentDirectory}meals/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
      const dest = `${dir}${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: res.assets[0].uri, to: dest });
      setPhoto(dest);
    } catch {
      // Safe fallback if photo selection was canceled or interrupted
    }
  };

  const add = (foodId: string) =>
    setItems((cur) => (cur.some((i) => i.foodId === foodId) ? cur.map((i) => (i.foodId === foodId ? { ...i, servings: i.servings + 1 } : i)) : [...cur, { foodId, servings: 1 }]));
  const change = (foodId: string, delta: number) =>
    setItems((cur) => cur.map((i) => (i.foodId === foodId ? { ...i, servings: Math.max(0, i.servings + delta) } : i)).filter((i) => i.servings > 0));

  const save = () => {
    const st = useRootStore.getState();
    st.saveMealLog({ date: formatLocalDate(new Date()), at: new Date().toISOString(), type, photoUri: photo ?? undefined, items, note: note.trim() || undefined });
    const description = items.map((i) => `${i.servings} x ${foodById(i.foodId)?.name ?? i.foodId}`).join(', ') || note.trim() || 'Meal';
    const quest = st.completeMealQuest(description);
    st.showToast({
      type: 'success',
      title: 'Meal saved',
      message: `${sum.kcal} kcal · ${sum.protein} g protein.${quest ? ` Quest done: ${quest.title} (+${quest.xp} XP).` : ''}`,
    });
    router.back();
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Log a meal" subtitle="Photo, foods and macros" showBack />}
      scrollMode="shell-scroll-view"
      footer={<Button label={items.length ? `Save meal · ${sum.kcal} kcal` : 'Add at least one food'} size="lg" disabled={items.length === 0} onPress={save} />}
    >
      <View style={styles.chips}>
        {TYPES.map((t) => (
          <Chip key={t.id} label={t.label} selected={type === t.id} onPress={() => setType(t.id)} />
        ))}
      </View>

      {photo ? (
        <PressableScale onPress={() => setPhoto(null)} accessibilityLabel="Remove photo" style={{ marginTop: spacing.md }}>
          <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>Kept only on this phone. Tap to remove.</Text>
        </PressableScale>
      ) : (
        <View style={[styles.row, { marginTop: spacing.md, gap: 8 }]}>
          <Button label="Take a photo" variant="outline" size="sm" onPress={() => pick(true)} style={styles.flex} />
          <Button label="From gallery" variant="ghost" size="sm" onPress={() => pick(false)} style={styles.flex} />
        </View>
      )}

      <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
        <View style={styles.macros}>
          {(
            [
              ['kcal', `${sum.kcal}`],
              ['Protein', `${sum.protein} g`],
              ['Carbs', `${sum.carbs} g`],
              ['Fat', `${sum.fat} g`],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={styles.macro}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>{value}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
            </View>
          ))}
        </View>
        {items.map((i) => {
          const f = foodById(i.foodId);
          if (!f) return null;
          return (
            <View key={i.foodId} style={[styles.row, styles.itemRow, { borderTopColor: colors.border }]}>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{f.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {i.servings} x {f.serving} · {Math.round(f.kcal * i.servings)} kcal
                </Text>
              </View>
              <PressableScale onPress={() => change(i.foodId, -0.5)} hitSlop={8} accessibilityLabel={`Less ${f.name}`} style={[styles.step, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="remove" size={16} color={colors.text.primary} />
              </PressableScale>
              <PressableScale onPress={() => change(i.foodId, 0.5)} hitSlop={8} accessibilityLabel={`More ${f.name}`} style={[styles.step, { backgroundColor: colors.surface1, marginLeft: 8 }]}>
                <Ionicons name="add" size={16} color={colors.text.primary} />
              </PressableScale>
            </View>
          );
        })}
        {items.length === 0 ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>Add what is on the plate below.</Text>
        ) : null}
      </Card>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>What did you eat?</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods, e.g. dal, roti, eggs"
        placeholderTextColor={colors.text.muted}
        style={[styles.input, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }]}
      />
      {results.map((f) => (
        <PressableScale key={f.id} onPress={() => add(f.id)} accessibilityRole="button" style={[styles.row, styles.food, { borderBottomColor: colors.border }]}>
          <View style={styles.flex}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{f.name}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {f.serving} · {f.kcal} kcal · P {f.protein} g · C {f.carbs} g · F {f.fat} g
            </Text>
          </View>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
        </PressableScale>
      ))}

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Anything else (optional)"
        placeholderTextColor={colors.text.muted}
        style={[styles.input, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border, marginTop: spacing.lg }]}
      />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Values are typical for each food (USDA and Indian food tables) and home cooking varies. Not medical or dietary advice.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  food: { paddingVertical: 10 },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  itemRow: { marginTop: 8, paddingTop: 8 },
  macro: { alignItems: 'center', flex: 1 },
  macros: { flexDirection: 'row' },
  photo: { borderRadius: 18, height: 200, width: '100%' },
  row: { alignItems: 'center', flexDirection: 'row' },
  step: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
});
