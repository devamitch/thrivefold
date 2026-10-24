import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { pendingGoogleProfile, signOutGoogle } from '../../services/account/googleAccount';
import { ageBandFor, suggestedExperience } from '../../domain/account/googleProfile';

/**
 * Shows what Google shared (name, email, age from birthday, gender) so the person can confirm
 * or correct it. Nothing is guessed: missing values say "Not shared by Google". Under-18s
 * cannot continue (Thrivefold is for adults). A Google birthday is not age verification.
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
  const [name, setName] = useState(profile?.givenName ?? profile?.name ?? '');

  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.lg }]}>
        <Text style={[typography.heading, { color: colors.text.primary }]}>Sign-in expired</Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const minor = profile.age !== null && profile.age < 18;

  const cancel = async () => {
    await signOutGoogle();
    router.replace('/(auth)/sign-in');
  };

  const confirm = () => {
    setUser({
      id: `google_${profile.id}`,
      pseudonym: name.trim().slice(0, 24) || 'Friend',
      avatarSeed: `google_${profile.id}`,
      age: profile.age,
      ageBand: ageBandFor(profile.age),
      isAgeVerified: false,
      email: profile.email,
      gender: profile.gender,
      photoUrl: profile.photo,
      profileSource: 'google',
      isGuest: false,
      createdAt: new Date().toISOString(),
    });
    if (profile.age !== null && profile.age >= 18) confirmAdult();
    if (profile.gender) setPrivateIdentity({ pronouns: '', genderDescription: profile.gender });
    const suggestion = suggestedExperience(profile.gender);
    if (suggestion) setExperience(suggestion);
    router.replace('/');
  };

  const row = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string, muted = false) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.text.secondary} />
      <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, width: 72 }]}>{label}</Text>
      <Text style={[typography.bodyBold, styles.flex, { color: muted ? colors.text.muted : colors.text.primary }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <View style={styles.center}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.photo} accessibilityLabel="Your Google profile photo" />
          ) : (
            <View style={[styles.photo, styles.center, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="person-outline" size={36} color={colors.primary} />
            </View>
          )}
          <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]} accessibilityRole="header">
            {minor ? 'Thrivefold is for adults' : 'Is this you?'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            {minor
              ? 'Your Google account shows you are under 18, so you can’t use Thrivefold yet.'
              : 'From your Google account. Correct anything that’s wrong; it stays on this phone.'}
          </Text>
        </View>

        {!minor ? (
          <>
            <Card style={{ marginTop: spacing.lg, padding: spacing.base }}>
              {row('mail-outline', 'Email', profile.email)}
              {row('calendar-outline', 'Age', profile.age !== null ? `${profile.age}` : 'Not shared by Google', profile.age === null)}
              {row('person-outline', 'Gender', profile.gender ?? 'Not shared by Google', profile.gender === null)}
            </Card>
            <TextField
              label="What should we call you?"
              value={name}
              onChangeText={setName}
              maxLength={24}
              containerStyle={{ marginTop: spacing.lg }}
            />
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
              Age and gender are only shown to you and used to set up your home screen. They never decide what you can
              use; letters and circles need a separate age check later. You can change them in You at any time.
            </Text>
          </>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
        {minor ? (
          <Button label="Back" size="lg" onPress={cancel} />
        ) : (
          <>
            <Button label="Looks right, continue" size="lg" onPress={confirm} />
            <Button label="Use a different account" variant="ghost" onPress={cancel} style={{ marginTop: spacing.xs }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  photo: { width: 88, height: 88, borderRadius: 44 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth },
});
