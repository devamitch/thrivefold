import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ageBandFor, ageOn } from '../../domain/account/googleProfile';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { SNOOZE_MS, nextProfileQuestion, profileCompleteness, type ProfileQuestion } from '../../domain/account/profileQuestions';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { DatePickerModal } from '../ui/DatePickerModal';
import { TextField } from '../ui/TextField';

const COPY: Record<ProfileQuestion, { title: string; why: string; icon: keyof typeof Ionicons.glyphMap }> = {
  birthday: { title: 'Add your birthday', why: 'So signing in on a new phone restores your account without asking again.', icon: 'gift-outline' },
  height: { title: 'How tall are you?', why: 'Used for BMI and step distance. Stays on this phone.', icon: 'resize-outline' },
  weight: { title: 'What do you weigh?', why: 'Makes calorie estimates fit you instead of a 70 kg average. Stays on this phone.', icon: 'barbell-outline' },
  diet: { title: 'How do you like to eat?', why: 'Meal ideas and quests will follow it.', icon: 'restaurant-outline' },
  routine: { title: 'How long can a daily routine be?', why: 'Quests will fit the time you have.', icon: 'time-outline' },
};
const DIETS = ['No preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Pescatarian', 'Flexitarian / Mindful'];

/** One missing profile detail at a time, at most once a day; "Not now" waits a week. */
export function ProfileQuestionCard() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      heightCm: st.heightCm,
      weightKg: st.weightKg,
      diet: st.onboarding.diet,
      routineMinutes: st.onboarding.routineMinutes,
      profileAsk: st.profileAsk,
    })),
  );
  const actions = useRootStore(
    useShallow((st) => ({
      setUser: st.setUser,
      setHeightCm: st.setHeightCm,
      setWeightKg: st.setWeightKg,
      setOnboardingAnswers: st.setOnboardingAnswers,
      snooze: st.snoozeProfileQuestion,
      markAsked: st.markProfileAsked,
    })),
  );
  const [value, setValue] = useState('');
  const [picker, setPicker] = useState(false);
  const shownToday = useRef<ProfileQuestion | null>(null);

  const state = useMemo(
    () => ({
      signedIn: !!s.user && !s.user.isGuest,
      birthDate: s.user?.birthDate,
      heightCm: s.heightCm,
      weightKg: s.weightKg,
      diet: s.diet,
      routineMinutes: s.routineMinutes,
      snoozedUntil: s.profileAsk.snoozedUntil,
      lastAskedAt: s.profileAsk.lastAskedAt,
    }),
    [s],
  );
  const now = Date.now();
  const q = nextProfileQuestion(state, now, shownToday.current !== null);

  useEffect(() => {
    if (q && shownToday.current === null) {
      shownToday.current = q;
      actions.markAsked(Date.now());
    }
  }, [q, actions]);

  if (!q) return null;
  const copy = COPY[q];
  const done = () => setValue('');

  const saveNumber = () => {
    const n = Number(value.replace(',', '.'));
    if (q === 'height' && n >= 120 && n <= 230) actions.setHeightCm(Math.round(n));
    else if (q === 'weight' && n >= 30 && n <= 300) actions.setWeightKg(Math.round(n * 10) / 10);
    else return;
    done();
  };

  const saveBirthday = (d: string) => {
    setPicker(false);
    if (!s.user) return;
    const [y, m, day] = d.split('-').map(Number);
    const age = ageOn({ year: y, month: m, day }, new Date());
    if (age < 18) return;
    actions.setUser({ ...s.user, birthDate: d, age, ageBand: ageBandFor(age) });
  };

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name={copy.icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{copy.title}</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{copy.why}</Text>
        </View>
        <Text style={[typography.captionBold, { color: colors.text.muted }]}>{profileCompleteness(state)}%</Text>
      </View>

      {q === 'height' || q === 'weight' ? (
        <View style={styles.row}>
          <TextField
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={q === 'height' ? 'cm' : 'kg'}
            containerStyle={styles.flex}
            onSubmitEditing={saveNumber}
          />
          <Button label="Save" size="sm" onPress={saveNumber} />
        </View>
      ) : null}
      {q === 'diet' ? (
        <View style={styles.chips}>
          {DIETS.map((d) => (
            <Chip key={d} label={d} onPress={() => actions.setOnboardingAnswers({ diet: d })} />
          ))}
        </View>
      ) : null}
      {q === 'routine' ? (
        <View style={styles.chips}>
          {([5, 10, 20] as const).map((m) => (
            <Chip key={m} label={`${m} min`} onPress={() => actions.setOnboardingAnswers({ routineMinutes: m })} />
          ))}
        </View>
      ) : null}
      {q === 'birthday' ? (
        <View style={styles.row}>
          <Button label="Choose date" size="sm" onPress={() => setPicker(true)} />
        </View>
      ) : null}

      <Chip label="Not now" onPress={() => actions.snooze(q, Date.now() + SNOOZE_MS)} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
      <DatePickerModal
        visible={picker}
        value="1995-06-15"
        initialView="year"
        maxDate={formatLocalDate(new Date())}
        onChange={saveBirthday}
        onClose={() => setPicker(false)}
        title="Your birthday"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
});
