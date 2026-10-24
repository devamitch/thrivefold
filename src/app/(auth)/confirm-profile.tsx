import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Badge } from '../../components/ui/Badge';
import { PressableScale } from '../../components/ui/PressableScale';
import { SquircleSurface } from '../../components/ui/SquircleSurface';
import { DatePickerModal } from '../../components/ui/DatePickerModal';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { pendingGoogleProfile, signOutGoogle } from '../../services/account/googleAccount';
import { ageBandFor, ageOn } from '../../domain/account/googleProfile';
import { inferGender, inferGenderFromLocalName } from '../../domain/account/genderInference';
import type { ProductExperience } from '../../theme/tokens';

type GenderOption = 'Male' | 'Female' | 'Other';

interface SanctuaryOption {
  id: GenderOption;
  title: string;
  badgeLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  benefits: string;
}

const SANCTUARY_OPTIONS: SanctuaryOption[] = [
  {
    id: 'Male',
    title: "Men's Health Sanctuary",
    badgeLabel: 'Stoic & Strength',
    icon: 'barbell-outline',
    description: 'Physical stamina, strength, cold recovery & mental resilience.',
    benefits: 'Zero menstrual/cycle tracking • Men’s metabolic & testosterone health',
  },
  {
    id: 'Female',
    title: "Women's Health Sanctuary",
    badgeLabel: 'Hormonal Rhythms',
    icon: 'flower-outline',
    description: 'Cycle phases, luteal & follicular nutrition, energy rhythms.',
    benefits: 'Complete menstrual privacy • Hormone-aware workouts & nutrition',
  },
  {
    id: 'Other',
    title: 'Pride & Affirming Sanctuary',
    badgeLabel: 'Inclusive Wellness',
    icon: 'heart-outline',
    description: 'Affirming wellness milestones, holistic health & supportive habits.',
    benefits: 'Safe haven tools • Affirming routines & non-gendered metrics',
  },
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const mName = monthNames[month - 1] || `${month}`;
  return `${day} ${mName} ${year}`;
}

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

  // Preferred Display Name
  const [name, setName] = useState(profile?.givenName ?? profile?.name ?? '');

  // Intelligent initial gender (Google claim -> Local Name Inference -> 'Male' safe default)
  const initialGender = (profile?.gender as GenderOption | undefined) ??
    (inferGenderFromLocalName(profile?.givenName ?? profile?.name) as GenderOption | null) ??
    'Male';
  const [selectedGender, setSelectedGender] = useState<GenderOption>(initialGender);

  // Online gender fallback check (non-blocking)
  useEffect(() => {
    let isMounted = true;
    if (!profile?.gender) {
      inferGender(profile?.givenName ?? profile?.name).then((inferred) => {
        if (isMounted && inferred) {
          setSelectedGender(inferred);
          let exp: ProductExperience = 'men_health';
          if (inferred === 'Female') exp = 'women_health';
          else if (inferred === 'Male') exp = 'men_health';
          setExperience(exp);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [profile?.gender, profile?.givenName, profile?.name, setExperience]);

  // Birthday & Age state: NEVER invent a birthday if Google didn't provide one
  const hasGoogleProvidedAge = Boolean(profile?.birthYear && profile?.age !== null);
  const [birthDate, setBirthDate] = useState<string>(
    profile?.birthYear ? `${profile.birthYear}-01-01` : ''
  );
  const [currentAge, setCurrentAge] = useState<number | null>(profile?.age ?? null);
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);

  // Recalculate age accurately if birthDate changes
  useEffect(() => {
    if (birthDate) {
      const parts = birthDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
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
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Your Google authentication session has timed out. Please sign in again.
        </Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const isDobSelected = currentAge !== null && birthDate !== '';
  const isMinor = isDobSelected && currentAge < 18;
  const isEligibleAdult = isDobSelected && currentAge >= 18;

  const cancel = async () => {
    await signOutGoogle();
    router.replace('/(auth)/sign-in');
  };

  const handleDatePicked = (selectedStr: string) => {
    setBirthDate(selectedStr);
    const parts = selectedStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const calculated = ageOn({ year: y, month: m, day: d }, new Date());
        setCurrentAge(calculated);
      }
    }
    setDatePickerVisible(false);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const handleSelectSanctuary = (gender: GenderOption) => {
    setSelectedGender(gender);
    try {
      Haptics.selectionAsync();
    } catch {}
    let exp: ProductExperience = 'men_health';
    if (gender === 'Female') exp = 'women_health';
    else if (gender === 'Other') exp = 'pride_wellbeing';
    setExperience(exp);
  };

  const confirm = () => {
    if (!currentAge || currentAge < 18) {
      return;
    }

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

    confirmAdult();
    setPrivateIdentity({ pronouns: '', genderDescription: selectedGender });
    setExperience(exp);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profile Card with Squircle Frame */}
        <Card variant="surface" radius={24} style={styles.profileHeaderCard}>
          <View style={styles.profileHeaderRow}>
            <SquircleSurface
              radius={22}
              fill={colors.surface2}
              stroke={colors.border}
              strokeWidth={1}
              style={styles.avatarSquircle}
            >
              {profile.photo ? (
                <Image
                  source={{ uri: profile.photo }}
                  style={styles.avatarImage}
                  accessibilityLabel="Your Google profile photo"
                />
              ) : (
                <Ionicons name="person-outline" size={32} color={colors.primary} />
              )}
            </SquircleSurface>

            <View style={styles.profileHeaderTextGroup}>
              <View style={styles.googleBadgeRow}>
                <Badge label="Google Sovereign" variant="neutral" />
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.success}
                  style={{ marginLeft: 6 }}
                />
              </View>
              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={1}>
                {profile.givenName || profile.name || 'Welcome'}
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary }]} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
          </View>

          <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />

          <Text style={[typography.subheading, { color: colors.text.primary, textAlign: 'left' }]} accessibilityRole="header">
            {isMinor ? 'Thrivefold is for Adults (18+)' : 'Confirm Your Sanctuary Profile'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
            {isMinor
              ? 'Thrivefold is an adult-only sovereign health platform. Access is restricted to users 18 years and older.'
              : 'Configure your health experience and sovereign identity. All biometric and cycle records remain 100% encrypted on your local device.'}
          </Text>
        </Card>

        {/* Date of Birth & Age Selection Card */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: spacing.xs, letterSpacing: 0.8 }]}>
            AGE &amp; DATE OF BIRTH VERIFICATION
          </Text>

          <PressableScale
            onPress={() => setDatePickerVisible(true)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Set Date of Birth"
          >
            <SquircleSurface
              radius={20}
              fill={isMinor ? colors.errorSurface : isDobSelected ? colors.surface : colors.surface1}
              stroke={isMinor ? colors.error : isDobSelected ? colors.border : colors.warning}
              strokeWidth={isDobSelected ? 1 : 1.5}
              style={styles.dobCard}
            >
              <SquircleSurface
                radius={14}
                fill={isMinor ? colors.errorSurface : isDobSelected ? colors.primaryAlpha : colors.warningSurface}
                style={styles.dobIconBox}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={isMinor ? colors.error : isDobSelected ? colors.primary : colors.warning}
                />
              </SquircleSurface>

              <View style={styles.dobTextGroup}>
                <View style={styles.dobLabelRow}>
                  <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                    DATE OF BIRTH
                  </Text>
                  {isDobSelected ? (
                    isMinor ? (
                      <Badge label="Under 18" variant="danger" />
                    ) : (
                      <Badge label="18+ Verified" variant="success" />
                    )
                  ) : (
                    <Badge label="Required" variant="warning" />
                  )}
                </View>

                {isDobSelected ? (
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>
                    {formatDisplayDate(birthDate)} • {currentAge} years old
                  </Text>
                ) : (
                  <Text style={[typography.bodyBold, { color: colors.warning, marginTop: 2 }]}>
                    Tap to select your real Date of Birth
                  </Text>
                )}

                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  {isDobSelected
                    ? hasGoogleProvidedAge
                      ? 'Verified from your Google Profile.'
                      : 'Self-declared and verified locally on this device.'
                    : 'Required to verify adult status without tracking.'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.text.muted}
                style={{ marginLeft: spacing.xs }}
              />
            </SquircleSurface>
          </PressableScale>
        </View>

        {!isMinor ? (
          <>
            {/* Preferred Display Name Input */}
            <View style={{ marginTop: spacing.lg }}>
              <TextField
                label="What should your sanctuary call you?"
                value={name}
                onChangeText={setName}
                maxLength={24}
                placeholder="Your preferred name or pseudonym"
              />
            </View>

            {/* Health Sanctuary Selection Cards */}
            <View style={{ marginTop: spacing.lg }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.captionBold, { color: colors.text.secondary, letterSpacing: 0.8 }]}>
                  SELECT YOUR HEALTH SANCTUARY
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  Switch anytime in Settings
                </Text>
              </View>

              <View style={styles.sanctuaryList}>
                {SANCTUARY_OPTIONS.map((opt) => {
                  const isSelected = selectedGender === opt.id;
                  return (
                    <PressableScale
                      key={opt.id}
                      onPress={() => handleSelectSanctuary(opt.id)}
                      scaleTo={0.98}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={opt.title}
                    >
                      <SquircleSurface
                        radius={20}
                        fill={isSelected ? colors.surface : colors.surface1}
                        stroke={isSelected ? colors.primary : colors.border}
                        strokeWidth={isSelected ? 2 : 1}
                        style={styles.sanctuaryCard}
                      >
                        <View style={styles.sanctuaryTopRow}>
                          <SquircleSurface
                            radius={14}
                            fill={isSelected ? colors.primary : colors.surface2}
                            style={styles.sanctuaryIconBox}
                          >
                            <Ionicons
                              name={opt.icon}
                              size={22}
                              color={isSelected ? colors.onPrimary : colors.primary}
                            />
                          </SquircleSurface>

                          <View style={styles.sanctuaryHeaderInfo}>
                            <View style={styles.sanctuaryTitleRow}>
                              <Text
                                style={[
                                  typography.bodyBold,
                                  { color: isSelected ? colors.primary : colors.text.primary, fontSize: 16 },
                                ]}
                              >
                                {opt.title}
                              </Text>
                              <Badge
                                label={opt.badgeLabel}
                                variant={isSelected ? 'primary' : 'neutral'}
                              />
                            </View>
                            <Text
                              style={[
                                typography.caption,
                                { color: colors.text.secondary, marginTop: 2, lineHeight: 17 },
                              ]}
                            >
                              {opt.description}
                            </Text>
                          </View>

                          <View style={styles.radioIndicator}>
                            {isSelected ? (
                              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            ) : (
                              <View
                                style={[
                                  styles.radioCircleUnchecked,
                                  { borderColor: colors.border, backgroundColor: colors.surface },
                                ]}
                              />
                            )}
                          </View>
                        </View>

                        <View style={[styles.benefitDivider, { backgroundColor: isSelected ? colors.primaryAlpha : colors.border }]} />

                        <View style={styles.benefitRow}>
                          <Ionicons
                            name="shield-outline"
                            size={14}
                            color={isSelected ? colors.primary : colors.text.muted}
                          />
                          <Text
                            style={[
                              typography.caption,
                              {
                                color: isSelected ? colors.text.primary : colors.text.muted,
                                marginLeft: 6,
                                flex: 1,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {opt.benefits}
                          </Text>
                        </View>
                      </SquircleSurface>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={birthDate || '2000-01-01'}
        onChange={handleDatePicked}
        onClose={() => setDatePickerVisible(false)}
        title="Select Your Date of Birth"
        maxDate={new Date().toISOString().split('T')[0]}
      />

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + spacing.sm,
            paddingTop: spacing.sm,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        {!isDobSelected ? (
          <>
            <Button
              label="Select Date of Birth to Continue"
              size="lg"
              onPress={() => setDatePickerVisible(true)}
            />
            <Button
              label="Cancel and Sign Out"
              variant="ghost"
              size="md"
              onPress={cancel}
              style={{ marginTop: spacing.xs }}
            />
          </>
        ) : isMinor ? (
          <>
            <Button
              label="Thrivefold is 18+ Only — Return to Sign In"
              variant="danger"
              size="lg"
              onPress={cancel}
            />
          </>
        ) : (
          <>
            <Button
              label={`Enter ${selectedGender === 'Male' ? "Men's" : selectedGender === 'Female' ? "Women's" : 'Pride'} Sanctuary`}
              size="lg"
              onPress={confirm}
            />
            <Button
              label="Use a different Google account"
              variant="ghost"
              size="md"
              onPress={cancel}
              style={{ marginTop: spacing.xs }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  profileHeaderCard: {
    padding: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSquircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  profileHeaderTextGroup: {
    flex: 1,
    marginLeft: 14,
  },
  googleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  dobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  dobIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dobTextGroup: {
    flex: 1,
    marginLeft: 12,
  },
  dobLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sanctuaryList: {
    gap: 12,
  },
  sanctuaryCard: {
    padding: 14,
  },
  sanctuaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sanctuaryIconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sanctuaryHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  sanctuaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  radioIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  benefitDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomActionBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
