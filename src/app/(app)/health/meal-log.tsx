import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  classifyImage,
  FoodCameraView,
  foodVisionAvailable,
  type FoodCameraHandle,
  type VisionLabel,
} from '../../../../modules/pose-landmarker/food';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { foodSuggestions } from '../../../domain/nutrition/foodLabels';
import { foodById, itemFood, searchFoods, totals, type MealItem } from '../../../domain/nutrition/foods';
import { analyzeMealPhoto, photoAiRoute, type EstimatedFood, type PhotoAiRoute } from '../../../services/ai/mealVision';
import { googleAvailable, signInWithGoogle } from '../../../services/account/googleAccount';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { syncSmartHealthReminders } from '../../../services/notifications/smartHealthReminders';
import type { MealLog } from '../../../stores/slices/healthSlice';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const TYPES: { id: MealLog['type']; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

/** Everyday picks per meal, offered as shortcuts. They are suggestions, never "detected". */
const QUICK_PICKS: Record<MealLog['type'], string[]> = {
  breakfast: ['oats', 'egg', 'poha', 'idli', 'banana', 'chai'],
  lunch: ['roti', 'dal', 'rice', 'salad', 'curd', 'chole'],
  dinner: ['roti', 'veg_sabzi', 'dal', 'rice', 'paneer', 'curd'],
  snack: ['banana', 'apple', 'chai', 'curd'],
};

const typeForNow = (): MealLog['type'] => {
  const h = new Date().getHours();
  return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 22 ? 'dinner' : 'snack';
};

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);

/**
 * Log a meal. Optional photo (live scan or gallery), on-device suggestions of what is on the
 * plate, an optional AI estimate the person reviews item by item, and a plate whose totals come
 * from food tables (AI items are marked as estimates). Saving is instant and works offline.
 */
export default function MealLogScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<MealLog['type']>(typeForNow);
  const [items, setItems] = useState<MealItem[]>([]);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const camera = useRef<FoodCameraHandle>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [liveLabels, setLiveLabels] = useState<VisionLabel[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoLabels, setPhotoLabels] = useState<VisionLabel[]>([]);
  const [notice, setNotice] = useState<{ message: string; settings?: boolean } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiItems, setAiItems] = useState<(EstimatedFood & { picked: boolean })[] | null>(null);

  const sum = useMemo(() => totals(items), [items]);
  const results = useMemo(() => searchFoods(query).slice(0, query ? 20 : 8), [query]);
  const liveTop = foodSuggestions(liveLabels, 0.15, 1)[0];
  const suggestions = useMemo(() => foodSuggestions(photoLabels), [photoLabels]);
  const [ai, setAi] = useState<PhotoAiRoute | null>(null);
  const refreshAi = useCallback(() => {
    void photoAiRoute().then(setAi);
  }, []);
  useEffect(refreshAi, [refreshAi]);
  const aiConsented = useRootStore((st) =>
    st.consentRecords.some((c) => c.source === 'meal_photo_ai' && c.decision === 'granted'),
  );
  const liveCamera = Boolean(FoodCameraView) && foodVisionAvailable();

  const add = (foodId: string) =>
    setItems((cur) =>
      cur.some((i) => i.foodId === foodId)
        ? cur.map((i) => (i.foodId === foodId ? { ...i, servings: i.servings + 1 } : i))
        : [...cur, { foodId, servings: 1 }],
    );
  const change = (foodId: string, delta: number) =>
    setItems((cur) =>
      cur
        .map((i) => (i.foodId === foodId ? { ...i, servings: Math.max(0, i.servings + delta) } : i))
        .filter((i) => i.servings > 0),
    );

  // Keeps a photo in the app's private folder (never the shared gallery), then names what is on
  // it with the on-device classifier.
  const keepPhoto = async (uri: string) => {
    const dir = `${FileSystem.documentDirectory}meals/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
    const dest = `${dir}${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    setPhoto(dest);
    setAiItems(null);
    const labels = await classifyImage(dest);
    setPhotoLabels(labels);
    // Already agreed once: analyse straight away so the macros come with the photo.
    if (aiConsented && ai?.route) void runAi(dest, labels);
  };

  const startScan = async () => {
    setNotice(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setNotice({
        message: 'Camera access is off for Thrivefold. You can still pick a photo or log without one.',
        settings: !perm.canAskAgain,
      });
      return;
    }
    if (!liveCamera) {
      // No live scanner in this build: fall back to the system camera.
      try {
        const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!res.canceled && res.assets[0]) await keepPhoto(res.assets[0].uri);
      } catch {
        setNotice({ message: 'The camera could not open. Try the gallery instead.' });
      }
      return;
    }
    setLiveLabels([]);
    setCameraReady(false);
    setScanning(true);
  };

  const shooting = useRef(false);
  const shoot = async () => {
    if (shooting.current) return;
    shooting.current = true;
    try {
      const uri = await camera.current?.capture();
      if (!uri) return;
      hapticLight();
      setScanning(false);
      await keepPhoto(uri);
    } catch {
      setNotice({ message: 'That photo did not save. Try again.' });
    } finally {
      shooting.current = false;
    }
  };

  // The system photo picker hands over only the chosen photo and needs no storage permission
  // (storage permissions are blocked in app.json on purpose).
  const pickFromGallery = async () => {
    setNotice(null);
    setScanning(false);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
      if (!res.canceled && res.assets[0]) await keepPhoto(res.assets[0].uri);
    } catch {
      setNotice({ message: 'That photo could not be opened. Try another one.' });
    }
  };

  const runAi = async (uri = photo, labels = photoLabels) => {
    if (!uri || aiBusy) return;
    setAiBusy(true);
    setNotice(null);
    const res = await analyzeMealPhoto(
      uri,
      [...foodSuggestions(labels).map((x) => x.label), note.trim()].filter(Boolean),
    );
    setAiBusy(false);
    if ('error' in res) {
      setNotice({ message: res.error });
      refreshAi();
      return;
    }
    if (res.items.length === 0) {
      setNotice({ message: 'The AI did not find food in this photo. Add foods yourself below.' });
      return;
    }
    setAiItems(res.items.map((it) => ({ ...it, picked: it.confidence >= 0.4 })));
  };

  // First use asks once; the decision is kept in the consent log and can be reviewed there.
  const askAndRunAi = () => {
    if (aiConsented) {
      void runAi();
      return;
    }
    useRootStore.getState().showAlert({
      title: 'Analyse photos with AI?',
      message:
        ai?.route === 'server'
          ? 'Each photo you analyse is sent once to Thrivefold’s server, which asks Google Gemini (or OpenRouter as backup) for foods and macros. Photos are not stored. You review every item before it is saved.'
          : 'Each photo you analyse is sent once to Google Gemini with your own key. You review every item before it is saved.',
      confirmText: 'Analyse',
      cancelText: 'Not now',
      onConfirm: () => {
        useRootStore.getState().recordConsent('meal_photo_ai', ['photo:meal-macros'], 'granted');
        void runAi();
      },
    });
  };

  const connectGoogle = async () => {
    const res = await signInWithGoogle();
    if (res.ok) refreshAi();
    else if (!res.cancelled) setNotice({ message: res.message });
  };

  const acceptAi = () => {
    if (!aiItems) return;
    const stamp = Date.now() % 100000;
    const picked = aiItems.filter((i) => i.picked);
    setItems((cur) => {
      let next = [...cur];
      picked.forEach((p, idx) => {
        // Table match: real table values for the estimated number of servings.
        if (p.catalogId && p.servings) {
          const id = p.catalogId;
          const servings = p.servings;
          next = next.some((i) => i.foodId === id)
            ? next.map((i) => (i.foodId === id ? { ...i, servings: i.servings + servings } : i))
            : [...next, { foodId: id, servings }];
          return;
        }
        next.push({
          foodId: `ai:${slug(p.name)}:${stamp + idx}`,
          servings: 1,
          custom: {
            name: titleCase(p.name),
            serving: p.serving,
            kcal: p.kcal,
            protein: p.protein,
            carbs: p.carbs,
            fat: p.fat,
            source: 'ai_estimate' as const,
          },
        });
      });
      return next;
    });
    hapticSuccess();
    setAiItems(null);
  };

  const canSave = items.length > 0 || Boolean(photo) || note.trim().length > 0;

  // Saving is immediate and offline: totals come from the plate, never from a model call.
  const save = () => {
    if (submitting || !canSave) return;
    setSubmitting(true);
    const st = useRootStore.getState();
    const trimmed = note.trim();
    st.saveMealLog({
      date: formatLocalDate(new Date()),
      at: new Date().toISOString(),
      type,
      photoUri: photo ?? undefined,
      items,
      note: trimmed || undefined,
    });
    const description =
      items.map((i) => `${i.servings} x ${itemFood(i)?.name ?? i.foodId}`).join(', ') ||
      trimmed ||
      'Meal with photo';
    const quest = st.completeMealQuest(description);
    st.showToast({
      type: 'success',
      title: 'Meal saved',
      message: `${items.length ? `${sum.kcal} kcal · ${sum.protein} g protein.` : 'Saved without foods.'}${quest ? ` Quest done: ${quest.title} (+${quest.xp} XP).` : ''}`,
    });
    syncSmartHealthReminders().catch(() => undefined);
    router.back();
  };

  const picks = QUICK_PICKS[type]
    .filter((id) => !items.some((i) => i.foodId === id))
    .map((id) => foodById(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <ScreenContainer
      header={<AppHeader title="Log a meal" subtitle="Scan, review, save" showBack />}
      scrollMode="shell-scroll-view"
      footer={
        <Button
          label={
            items.length
              ? `Save meal · ${sum.kcal} kcal`
              : photo
                ? 'Save photo only (no macros)'
                : canSave
                  ? 'Save meal'
                  : 'Add a food, photo or note'
          }
          size="lg"
          disabled={!canSave || submitting}
          onPress={save}
        />
      }
    >
      <View style={styles.chips}>
        {TYPES.map((t) => (
          <Chip key={t.id} label={t.label} selected={type === t.id} onPress={() => setType(t.id)} />
        ))}
      </View>

      {/* Capture: live scan, the chosen photo, or the two entry buttons */}
      {photo ? (
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.photoWrap}>
            <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
            <PressableScale
              onPress={() => {
                setPhoto(null);
                setPhotoLabels([]);
                setAiItems(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              style={[styles.photoClose, { backgroundColor: colors.callSurface }]}
            >
              <Ionicons name="close" size={18} color={colors.callText} />
            </PressableScale>
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
            Kept only on this phone.
          </Text>
        </View>
      ) : (
        <View style={[styles.row, { marginTop: spacing.md, gap: 8 }]}>
          <Button
            label="Scan meal"
            size="md"
            onPress={startScan}
            style={styles.flex}
            icon={<Ionicons name="scan-outline" size={18} color={colors.onPrimary} />}
          />
          <Button
            label="Gallery"
            variant="outline"
            size="md"
            onPress={pickFromGallery}
            style={styles.flex}
            icon={<Ionicons name="images-outline" size={18} color={colors.primary} />}
          />
        </View>
      )}

      {/* Full-screen live scanner */}
      <Modal
        visible={scanning && Boolean(FoodCameraView)}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setScanning(false)}
      >
        <GestureHandlerRootView style={styles.ghRoot}>
          <View style={[styles.full, { backgroundColor: colors.callBackground }]}>
            {FoodCameraView && scanning ? (
              <FoodCameraView
                ref={camera}
                style={StyleSheet.absoluteFill}
                active={scanning}
                onFoodReady={() => setCameraReady(true)}
                onLabels={(e) => setLiveLabels(e.nativeEvent.labels)}
                onFoodError={() => {
                  setScanning(false);
                  setNotice({ message: 'The camera could not start. Pick a photo from the gallery instead.' });
                }}
              />
            ) : null}
            {/* Framing guide */}
            <View pointerEvents="none" style={styles.frameGuide}>
              <View style={[styles.frameBox, { borderColor: colors.callSurfaceStrong }]} />
            </View>
            <View style={[styles.fullTop, { paddingTop: insets.top + 12 }]}>
              <PressableScale
                onPress={() => setScanning(false)}
                accessibilityRole="button"
                accessibilityLabel="Close camera"
                style={[styles.roundBtn, { backgroundColor: colors.callSurface }]}
              >
                <Ionicons name="close" size={22} color={colors.callText} />
              </PressableScale>
              <View style={[styles.liveChipFull, { backgroundColor: colors.callSurface }]}>
                {!cameraReady ? <ActivityIndicator size="small" color={colors.callText} /> : null}
                <Text style={[typography.captionBold, { color: colors.callText }]} numberOfLines={1}>
                  {!cameraReady
                    ? 'Starting camera'
                    : liveTop
                      ? `Looks like ${liveTop.label} · ${Math.round(liveTop.score * 100)}%`
                      : 'Fit your plate in the frame'}
                </Text>
              </View>
              <View style={styles.roundBtn} />
            </View>
            <View style={[styles.fullBottom, { paddingBottom: insets.bottom + 24 }]}>
              <Text style={[typography.caption, { color: colors.callMuted, marginBottom: 16 }]}>
                Recognised on this phone. Nothing is sent until you ask for AI.
              </Text>
              <View style={styles.controlsRow}>
                <PressableScale
                  onPress={pickFromGallery}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from gallery"
                  style={[styles.roundBtnLg, { backgroundColor: colors.callSurface }]}
                >
                  <Ionicons name="images-outline" size={22} color={colors.callText} />
                </PressableScale>
                <PressableScale
                  onPress={shoot}
                  disabled={!cameraReady}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  style={[styles.shutter, { borderColor: colors.callText, opacity: cameraReady ? 1 : 0.5 }]}
                >
                  <View style={[styles.shutterInner, { backgroundColor: colors.callText }]} />
                </PressableScale>
                <View style={styles.roundBtnLg} />
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>

      {notice ? (
        <View style={[styles.row, { marginTop: spacing.sm, gap: 8 }]}>
          <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
            {notice.message}
          </Text>
          {notice.settings ? (
            <PressableScale onPress={() => Linking.openSettings()} hitSlop={8} accessibilityRole="button">
              <Text style={[typography.captionBold, { color: colors.primary }]}>Settings</Text>
            </PressableScale>
          ) : null}
        </View>
      ) : null}

      {/* What the phone recognised, and the optional AI estimate */}
      {photo ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.label, { color: colors.text.muted }]}>On this phone</Text>
          {suggestions.length > 0 ? (
            <View style={[styles.chips, { marginTop: 8 }]}>
              {suggestions.map((s) => {
                const f = s.foodId ? foodById(s.foodId) : null;
                return (
                  <Chip
                    key={s.label}
                    label={`${f ? '+ ' : ''}${titleCase(s.label)} · ${Math.round(s.score * 100)}%`}
                    onPress={() => (f ? add(f.id) : setQuery(s.label))}
                  />
                );
              })}
            </View>
          ) : (
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              No food recognised. The on-device model knows common foods, not every dish.
            </Text>
          )}

          <View style={[styles.divider, { backgroundColor: colors.surface1 }]} />

          {aiItems ? (
            <>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Found in your photo</Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginBottom: 4 }]}>
                Check portions and untick anything wrong. Food-table items use table values; the
                rest are AI estimates.
              </Text>
              {aiItems.map((it, idx) => (
                <PressableScale
                  key={`${it.name}${idx}`}
                  onPress={() =>
                    setAiItems((cur) =>
                      cur ? cur.map((c, i) => (i === idx ? { ...c, picked: !c.picked } : c)) : cur,
                    )
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: it.picked }}
                  style={[styles.row, styles.aiRow]}
                >
                  <Ionicons
                    name={it.picked ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={it.picked ? colors.primary : colors.text.muted}
                  />
                  <View style={[styles.flex, { marginLeft: 10 }]}>
                    <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                      {titleCase(it.name)}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      {it.catalogId && it.servings
                        ? `${it.servings} x ${foodById(it.catalogId)?.serving ?? it.serving} · food table`
                        : `${it.serving} · ${it.kcal} kcal · P ${it.protein} · C ${it.carbs} · F ${it.fat} · estimate`}
                    </Text>
                  </View>
                </PressableScale>
              ))}
              <Button
                label={`Add ${aiItems.filter((i) => i.picked).length} to plate`}
                size="sm"
                disabled={!aiItems.some((i) => i.picked)}
                onPress={acceptAi}
                style={{ marginTop: 8 }}
              />
            </>
          ) : aiBusy ? (
            <View style={styles.row}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10 }]}>
                Finding foods and macros…
              </Text>
            </View>
          ) : ai?.route ? (
            <>
              <Button
                label="Find foods and macros with AI"
                size="sm"
                onPress={askAndRunAi}
                icon={<Ionicons name="nutrition-outline" size={16} color={colors.onPrimary} />}
              />
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
                {ai.route === 'server'
                  ? 'Sent once to Thrivefold AI (Gemini); not stored. You review every item.'
                  : 'Sent once to Google Gemini with your key. You review every item.'}
              </Text>
            </>
          ) : ai ? (
            <>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>{ai.reason}</Text>
              <View style={[styles.row, { gap: 8, marginTop: 8 }]}>
                {ai.action === 'sign_in' && googleAvailable() ? (
                  <Button label="Sign in with Google" size="sm" onPress={connectGoogle} style={styles.flex} />
                ) : null}
                <Link href={'/(app)/settings/ai-byok' as Href} asChild>
                  <Button label="AI keys" size="sm" variant="outline" style={styles.flex} />
                </Link>
              </View>
            </>
          ) : null}
        </Card>
      ) : null}

      {/* The plate */}
      <Card style={{ marginTop: spacing.md }}>
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
          const f = itemFood(i);
          if (!f) return null;
          return (
            <View key={i.foodId} style={[styles.row, styles.itemRow, { borderTopColor: colors.surface1 }]}>
              <View style={styles.flex}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{f.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {i.servings} x {f.serving} · {Math.round(f.kcal * i.servings)} kcal
                  {f.estimated ? ' · AI estimate' : ''}
                </Text>
              </View>
              <PressableScale
                onPress={() => change(i.foodId, -0.5)}
                hitSlop={8}
                accessibilityLabel={`Less ${f.name}`}
                style={[styles.step, { backgroundColor: colors.surface1 }]}
              >
                <Ionicons name="remove" size={16} color={colors.text.primary} />
              </PressableScale>
              <PressableScale
                onPress={() => change(i.foodId, 0.5)}
                hitSlop={8}
                accessibilityLabel={`More ${f.name}`}
                style={[styles.step, { backgroundColor: colors.surface1, marginLeft: 8 }]}
              >
                <Ionicons name="add" size={16} color={colors.text.primary} />
              </PressableScale>
            </View>
          );
        })}
        {items.length === 0 ? (
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            Your plate is empty. Add foods below.
          </Text>
        ) : null}
      </Card>

      {picks.length > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.label, { color: colors.text.muted, marginBottom: 6 }]}>
            Common at {TYPES.find((t) => t.id === type)?.label.toLowerCase()}
          </Text>
          <View style={styles.chips}>
            {picks.map((f) => (
              <Chip key={f.id} label={`+ ${f.name}`} onPress={() => add(f.id)} />
            ))}
          </View>
        </View>
      ) : null}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods, e.g. dal, roti, eggs"
        placeholderTextColor={colors.text.muted}
        style={[
          styles.input,
          typography.body,
          { backgroundColor: colors.surface, color: colors.text.primary, marginTop: spacing.lg },
        ]}
      />
      {results.map((f) => (
        <PressableScale
          key={f.id}
          onPress={() => add(f.id)}
          accessibilityRole="button"
          accessibilityLabel={`Add ${f.name}`}
          style={[styles.row, styles.food]}
        >
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
        style={[
          styles.input,
          typography.body,
          { backgroundColor: colors.surface, color: colors.text.primary, marginTop: spacing.lg },
        ]}
      />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Values are typical per serving (USDA and Indian food tables); AI estimates are marked. Not
        medical or dietary advice.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Android gives a Modal its own window; gestures there need their own root.
  ghRoot: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row' },
  stage: { aspectRatio: 3 / 4, borderRadius: 28, borderCurve: 'continuous', overflow: 'hidden' },
  liveChip: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
  },
  controls: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  roundBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  roundBtnLg: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  full: { flex: 1 },
  fullTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  liveChipFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    maxWidth: '68%',
  },
  fullBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', alignSelf: 'stretch' },
  frameGuide: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frameBox: { width: '78%', aspectRatio: 1, borderRadius: 36, borderWidth: 2 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28 },
  privacy: { position: 'absolute', bottom: 10, alignSelf: 'center' },
  photoWrap: { borderRadius: 24, borderCurve: 'continuous', overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 4 / 3 },
  photoClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  aiRow: { paddingVertical: 8 },
  food: { paddingVertical: 10 },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  itemRow: { marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  macro: { alignItems: 'center', flex: 1 },
  macros: { flexDirection: 'row' },
  step: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
});
