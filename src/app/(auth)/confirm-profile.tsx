import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { DatePickerModal } from '../../components/ui/DatePickerModal';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { pendingGoogleProfile, signOutGoogle } from '../../services/account/googleAccount';
import { ageBandFor, ageOn, suggestedExperience } from '../../domain/account/googleProfile';
import { inferGenderFromLocalName } from '../../domain/account/genderInference';
import type { ProductExperience } from '../../theme/tokens';

type GenderOption = 'Male' | 'Female' | 'Other';

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

  // Name state
  const [name, setName] = useState(profile?.givenName ?? profile?.name ?? '');

  // Inferred or provided gender
  const initialGender = (profile?.gender as GenderOption | undefined) ??
    (inferGenderFromLocalName(profile?.givenName ?? profile?.name) as GenderOption | null) ??
    'Male';
  const [selectedGender, setSelectedGender] = useState<GenderOption>(initialGender);

  // Birthday / Age state (default to 28-year-old adult if Google has null)
  const [birthDate, setBirthDate] = useState<string>(
    profile?.birthYear ? `${profile.birthYear}-01-01` : '1998-01-01'
  );
  const [hasGoogleAge, setHasGoogleAge] = useState<boolean>(profile?.age !== null);
  const [currentAge, setCurrentAge] = useState<number>(profile?.age ?? 28);
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);

  useEffect(() => {
    if (birthDate) {
      const parts = birthDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y)) {
          const calculated = ageOn({ year: y, month: m, day: d }, new Date());
          setCurrentAge(calculated);
        }
      }
    }
  }, [birthDate]);

  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.lg }]}>
        <Text style={[typography.heading, { color: colors.text.primary }]}>Sign-in expired</Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const isMinor = currentAge < 18;

  const cancel = async () => {
    await signOutGoogle();
    router.replace('/(auth)/sign-in');
  };

  const handleDatePicked = (selectedStr: string) => {
    setBirthDate(selectedStr);
    setHasGoogleAge(true);
    setDatePickerVisible(false);
  };

  const confirm = () => {
    let exp: ProductExperience = 'men_health';
    if (selectedGender === 'Female') {
      exp = 'women_health';
    } else if (selectedGender === 'Other') {
      exp = 'pride_wellbeing';
    } else {
      exp = 'men_health';
    }

    setUser({
      id: `google_${profile.id}`,
      pseudonym: name.trim().slice(0, 24) || (selectedGender === 'Male' ? 'Brother' : 'Friend'),
      avatarSeed: `google_${profile.id}`,
      age: currentAge,
      ageBand: ageBandFor(currentAge),
      isAgeVerified: currentAge >= 18,
      email: profile.email,
      gender: selectedGender,
      photoUrl: profile.photo,
      profileSource: 'google',
      isGuest: false,
      createdAt: new Date().toISOString(),
    });

    if (currentAge >= 18) confirmAdult();
    setPrivateIdentity({ pronouns: '', genderDescription: selectedGender });
    setExperience(exp);

    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.center}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.photo} accessibilityLabel="Your Google profile photo" />
          ) : (
            <View style={[styles.photo, styles.center, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="person-outline" size={36} color={colors.primary} />
            </View>
          )}
          <Text style={[typography.display, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]} accessibilityRole="header">
            {isMinor ? 'Thrivefold is for adults' : 'Confirm Your Sanctuary Profile'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            {isMinor
              ? 'Thrivefold is strictly an 18+ adult sanctuary. You cannot enter at this time.'
              : 'Review your personal profile details. All records stay strictly local on this device.'}
          </Text>
        </View>

        {!isMinor ? (
          <>
            <Card style={{ marginTop: spacing.lg, padding: spacing.base }}>
              {/* Email */}
              <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.text.secondary} />
                <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, width: 72 }]}>Email</Text>
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]} numberOfLines={1}>{profile.email}</Text>
              </View>

              {/* Age / Date of Birth Row with Picker trigger */}
              <Pressable
                onPress={() => setDatePickerVisible(true)}
                style={[styles.row, { borderBottomColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Choose Date of Birth"
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, width: 72 }]}>Age / DOB</Text>
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>
                  {currentAge} years old ({birthDate})
                </Text>
                <View style={[styles.badgePill, { backgroundColor: colors.primaryAlpha }]}>
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>Change</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.primary} style={{ marginLeft: 2 }} />
                </View>
              </Pressable>

              {/* Gender & Sanctuary Experience Selector */}
              <View style={{ paddingTop: spacing.md, paddingBottom: spacing.xs }}>
                <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: spacing.xs }]}>
                  GENDER &amp; HEALTH SANCTUARY
                </Text>
                <View style={styles.genderRow}>
                  <Pressable
                    onPress={() => setSelectedGender('Male')}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: selectedGender === 'Male' ? colors.primary : colors.surface2,
                        borderColor: selectedGender === 'Male' ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="fitness-outline"
                      size={16}
                      color={selectedGender === 'Male' ? colors.onPrimary : colors.text.primary}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: selectedGender === 'Male' ? colors.onPrimary : colors.text.primary,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      Men&apos;s Health
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedGender('Female')}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: selectedGender === 'Female' ? colors.primary : colors.surface2,
                        borderColor: selectedGender === 'Female' ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="water-outline"
                      size={16}
                      color={selectedGender === 'Female' ? colors.onPrimary : colors.text.primary}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: selectedGender === 'Female' ? colors.onPrimary : colors.text.primary,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      Women&apos;s Health
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedGender('Other')}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: selectedGender === 'Other' ? colors.primary : colors.surface2,
                        borderColor: selectedGender === 'Other' ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={16}
                      color={selectedGender === 'Other' ? colors.onPrimary : colors.text.primary}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: selectedGender === 'Other' ? colors.onPrimary : colors.text.primary,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      Pride / Affirming
                    </Text>
                  </Pressable>
                </View>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
                  {selectedGender === 'Male'
                    ? '✓ Configures Men’s Health: stamina, strength, cold recovery, and stoic focus (Zero period tracking).'
                    : selectedGender === 'Female'
                    ? '✓ Configures Women’s Health: cycle tracking, luteal/follicular nutrition, and hormonal wellness.'
                    : '✓ Configures Pride Wellbeing: affirming milestones, HRT schedules, and safe haven tools.'}
                </Text>
              </View>
            </Card>

            <TextField
              label="What should we call you?"
              value={name}
              onChangeText={setName}
              maxLength={24}
              containerStyle={{ marginTop: spacing.md }}
            />
          </>
        ) : null}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={birthDate}
        onChange={handleDatePicked}
        onClose={() => setDatePickerVisible(false)}
        title="Select Your Date of Birth"
        maxDate={new Date().toISOString().split('T')[0]}
      />

      {/* Bottom Sticky Action Buttons */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
        {isMinor ? (
          <Button label="Back" size="lg" onPress={cancel} />
        ) : (
          <>
            <Button
              label={`Enter ${selectedGender === 'Male' ? "Men's" : selectedGender === 'Female' ? "Women's" : 'Pride'} Sanctuary`}
              size="lg"
              onPress={confirm}
            />
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
  badgePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  genderRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});
