import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { DatePickerModal } from '../../components/ui/DatePickerModal';
import { PressableScale } from '../../components/ui/PressableScale';
import { SquircleSurface } from '../../components/ui/SquircleSurface';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { ageBandFor, ageOn, suggestedExperience } from '../../domain/account/googleProfile';
import { pendingGoogleProfile, signOutGoogle } from '../../services/account/googleAccount';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

const SPACES: { id: ProductExperience; title: string; body: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'men_health', title: "Men's health", body: 'Training, recovery, sleep and health basics.', icon: 'barbell-outline' },
  { id: 'women_health', title: "Women's health", body: 'Cycle tracking, symptoms, sleep and movement.', icon: 'water-outline' },
  { id: 'pride_wellbeing', title: 'LGBTQ+ wellbeing', body: 'Affirming self-care with private, optional details.', icon: 'heart-outline' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const showDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS[m - 1]} ${y}`;
};
const ageFrom = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return ageOn({ year: y, month: m, day }, new Date());
};

/**
 * Confirm what Google shared. Gender is used only when Google returns it; otherwise the
 * person picks their space themselves (nothing is guessed from a name). The birthday is
 * used only as a full date; if Google gave only a year, the person completes it.
 */
export default function ConfirmProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const { setUser, setExperience, confirmAdult, setPrivateIdentity } = useRootStore(
    useShallow((s) => ({
      setUser: s.setUser,
      setExperience: s.setExperience,
      confirmAdult: s.confirmAdult,
      setPrivateIdentity: s.setPrivateIdentity,
    })),
  );
  const profile = pendingGoogleProfile();
  const fromGoogle = profile?.birthDateString && /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDateString) ? profile.birthDateString : '';
  const [birthDate, setBirthDate] = useState(fromGoogle);
  const [picker, setPicker] = useState(false);
  const [space, setSpace] = useState<ProductExperience | null>(suggestedExperience(profile?.gender ?? null));

  if (!profile) {
    return (
      <SquircleSurface style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.lg }]}>
        <Text style={[typography.heading, { color: colors.text.primary }]}>Please sign in again</Text>
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>Your sign-in expired before it was confirmed.</Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }} />
      </SquircleSurface>
    );
  }

  const name = profile.givenName || profile.name?.split(' ')[0] || 'there';
  const age = birthDate ? ageFrom(birthDate) : null;
  const tooYoung = age !== null && age < 18;
  const ready = age !== null && !tooYoung && space !== null;

  const confirm = () => {
    if (!ready || age === null || !space) return;
    setUser({
      id: `google_${profile.id}`,
      pseudonym: name.slice(0, 24),
      avatarSeed: `google_${profile.id}`,
      age,
      ageBand: ageBandFor(age),
      // A birthday from Google or typed in is self-declared, never verification.
      isAgeVerified: false,
      email: profile.email,
      gender: profile.gender ?? null,
      photoUrl: profile.photo,
      profileSource: 'google',
      isGuest: false,
      createdAt: new Date().toISOString(),
    });
    confirmAdult();
    if (profile.gender) setPrivateIdentity({ pronouns: '', genderDescription: profile.gender });
    setExperience(space);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.replace('/');
  };

  const cancel = async () => {
    await signOutGoogle();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SquircleSurface style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <SquircleSurface style={styles.center}>
          <SquircleSurface radius={24} fill={colors.surface1} style={styles.avatar}>
            {profile.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.avatarImg} accessibilityLabel="Profile photo" />
            ) : (
              <Ionicons name="person-outline" size={28} color={colors.primary} />
            )}
          </SquircleSurface>
          <Text style={[typography.heading, styles.centerText, { color: colors.text.primary, marginTop: spacing.md }]} numberOfLines={2}>
            Welcome, {name}
          </Text>
          <Text style={[typography.subbody, styles.centerText, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={1}>
            {profile.email}
          </Text>
        </SquircleSurface>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl }]}>Date of birth</Text>
        <PressableScale onPress={() => setPicker(true)} accessibilityRole="button" accessibilityLabel={birthDate ? `Date of birth ${showDate(birthDate)}. Change` : 'Add your date of birth'}>
          <SquircleSurface radius={18} fill={colors.surface1} style={[styles.row, { marginTop: spacing.sm }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <SquircleSurface style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{birthDate ? showDate(birthDate) : 'Add your date of birth'}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {birthDate
                  ? `${age} years${fromGoogle && birthDate === fromGoogle ? ' · from your Google account' : ''}`
                  : profile.birthYear
                    ? `Google shared only your birth year (${profile.birthYear}). Add the full date.`
                    : 'Google did not share it. It stays on this phone.'}
              </Text>
            </SquircleSurface>
            <Text style={[typography.subbodyBold, { color: colors.primary }]}>{birthDate ? 'Change' : 'Add'}</Text>
          </SquircleSurface>
        </PressableScale>
        {tooYoung ? (
          <Text style={[typography.subbody, { color: colors.error, marginTop: spacing.sm }]}>
            Thrivefold is made for adults, so we can't set up an account for you yet.
          </Text>
        ) : null}

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl }]}>Which space fits you?</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          {profile.gender ? `Suggested from the gender in your Google account (${profile.gender}).` : 'Choose one. You can change it any time in Personalize.'}
        </Text>
        {SPACES.map((s) => {
          const on = space === s.id;
          return (
            <PressableScale key={s.id} onPress={() => setSpace(s.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${s.title}. ${s.body}`}>
              <SquircleSurface radius={18} fill={on ? colors.primaryAlpha : colors.surface1} style={[styles.row, { marginTop: spacing.sm }]}>
                <Ionicons name={s.icon} size={22} color={on ? colors.primary : colors.text.secondary} />
                <SquircleSurface style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: on ? colors.primary : colors.text.primary }]}>{s.title}</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{s.body}</Text>
                </SquircleSurface>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.text.muted} />
              </SquircleSurface>
            </PressableScale>
          );
        })}

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.lg }]}>
          Your birthday and space stay on this phone and shape your home screen. They never decide what you can see in
          your health records.
        </Text>
      </ScrollView>

      <SquircleSurface style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, paddingTop: spacing.sm }}>
        <Button label={ready ? 'Continue' : !birthDate ? 'Add your date of birth' : !space ? 'Choose a space' : 'Continue'} size="lg" disabled={!ready} onPress={confirm} />
        <Button label="Not me, sign out" variant="ghost" onPress={cancel} style={{ marginTop: spacing.xs }} />
      </SquircleSurface>

      <DatePickerModal
        visible={picker}
        value={birthDate || '1995-06-15'}
        initialView={birthDate ? 'day' : 'year'}
        maxDate={formatLocalDate(new Date())}
        minDate="1910-01-01"
        title="Date of birth"
        onChange={(d) => {
          setBirthDate(d);
          setPicker(false);
        }}
        onClose={() => setPicker(false)}
      />
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', height: 76, justifyContent: 'center', overflow: 'hidden', width: 76 },
  avatarImg: { height: 76, width: 76 },
  center: { alignItems: 'center', marginTop: 8 },
  centerText: { textAlign: 'center' },
  flex: { flex: 1 },
  root: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 14 },
});
