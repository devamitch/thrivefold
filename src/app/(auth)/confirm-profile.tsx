import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Button } from '../../components/ui/Button';
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
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
}

const SANCTUARY_OPTIONS: SanctuaryOption[] = [
  {
    id: 'Male',
    title: "Men's Health",
    icon: 'fitness-outline',
    subtitle: 'Strength, metabolic vitality & recovery. Zero cycle tracking.',
  },
  {
    id: 'Female',
    title: "Women's Health",
    icon: 'flower-outline',
    subtitle: 'Cycle phases, luteal & follicular balance, and hormonal wellness.',
  },
  {
    id: 'Other',
    title: 'Pride & Affirming',
    icon: 'heart-outline',
    subtitle: 'Inclusive milestones, holistic routines & affirming care.',
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

  // Name state
  const displayName = profile?.givenName || profile?.name?.split(' ')[0] || 'Friend';

  // Intelligent gender initialization
  const initialGender = (profile?.gender as GenderOption | undefined) ??
    (inferGenderFromLocalName(profile?.givenName ?? profile?.name) as GenderOption | null) ??
    'Male';
  const [selectedGender, setSelectedGender] = useState<GenderOption>(initialGender);

  // Online gender check fallback
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

  // Birthday & Age state: never invent date if Google didn't provide one
  const initialBirthDate = profile?.birthYear && profile?.age !== null ? `${profile.birthYear}-01-01` : '';
  const [birthDate, setBirthDate] = useState<string>(initialBirthDate);
  const [currentAge, setCurrentAge] = useState<number | null>(profile?.age ?? null);
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);

  // Recalculate age whenever birthDate changes
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
        <Text style={[typography.heading, { color: colors.text.primary }]}>Session expired</Text>
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Please sign in again to continue.
        </Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const isDobSelected = currentAge !== null && birthDate !== '';
  const isMinor = isDobSelected && currentAge < 18;

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
      pseudonym: displayName.slice(0, 24),
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
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compact Header: Flat Squircle, Zero Borders, Zero Shadows */}
        <View style={styles.headerSection}>
          <SquircleSurface
            radius={20}
            fill={colors.surface1}
            style={styles.avatarSquircle}
          >
            {profile.photo ? (
              <Image
                source={{ uri: profile.photo }}
                style={styles.avatarImage}
                accessibilityLabel="Profile photo"
              />
            ) : (
              <Ionicons name="person-outline" size={26} color={colors.primary} />
            )}
          </SquircleSurface>

          <Text style={[typography.heading, { color: colors.text.primary, marginTop: spacing.sm, textAlign: 'center' }]}>
            Welcome, {displayName}
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2, textAlign: 'center' }]}>
            {profile.email}
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs, textAlign: 'center' }]}>
            Select your health sanctuary to personalize your routines.
          </Text>
        </View>

        {/* Flat Squircle Sanctuary Choices: Zero Borders, Zero Shadows */}
        <View style={styles.sectionBlock}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: spacing.xs, letterSpacing: 0.5 }]}>
            SANCTUARY EXPERIENCE
          </Text>

          <View style={styles.optionsList}>
            {SANCTUARY_OPTIONS.map((opt) => {
              const isSelected = selectedGender === opt.id;
              return (
                <PressableScale
                  key={opt.id}
                  onPress={() => handleSelectSanctuary(opt.id)}
                  scaleTo={0.985}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.title}
                >
                  <SquircleSurface
                    radius={18}
                    fill={isSelected ? colors.primaryAlpha : colors.surface1}
                    style={styles.optionCard}
                  >
                    <View style={styles.optionRow}>
                      <SquircleSurface
                        radius={12}
                        fill={isSelected ? colors.primary : colors.surface2}
                        style={styles.optionIconBox}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={18}
                          color={isSelected ? colors.onPrimary : colors.primary}
                        />
                      </SquircleSurface>

                      <View style={styles.optionInfo}>
                        <Text
                          style={[
                            typography.bodyBold,
                            { color: isSelected ? colors.primary : colors.text.primary, fontSize: 15 },
                          ]}
                        >
                          {opt.title}
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2, lineHeight: 16 },
                          ]}
                        >
                          {opt.subtitle}
                        </Text>
                      </View>

                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                      ) : null}
                    </View>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Date of Birth Selection: Flat Squircle, Zero Borders, Zero Shadows */}
        <View style={styles.sectionBlock}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: spacing.xs, letterSpacing: 0.5 }]}>
            DATE OF BIRTH
          </Text>

          <PressableScale
            onPress={() => setDatePickerVisible(true)}
            scaleTo={0.985}
            accessibilityRole="button"
            accessibilityLabel="Set Date of Birth"
          >
            <SquircleSurface
              radius={18}
              fill={colors.surface1}
              style={styles.dobCard}
            >
              <SquircleSurface
                radius={12}
                fill={isDobSelected ? colors.primaryAlpha : colors.surface2}
                style={styles.dobIconBox}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={isDobSelected ? colors.primary : colors.text.primary}
                />
              </SquircleSurface>

              <View style={styles.dobInfo}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {isDobSelected ? `${formatDisplayDate(birthDate)}  (${currentAge} years)` : 'Select your date of birth'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                  Calibrates circadian rhythm & recovery timing.
                </Text>
              </View>

              <Badge
                label={isDobSelected ? 'Confirmed' : 'Set'}
                variant={isDobSelected ? 'success' : 'neutral'}
              />
            </SquircleSurface>
          </PressableScale>
        </View>

        {isMinor ? (
          <SquircleSurface radius={16} fill={colors.surface1} style={styles.minorNotice}>
            <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 10, flex: 1 }]}>
              Thrivefold is designed for mature wellness journeys. Please return at a later time.
            </Text>
          </SquircleSurface>
        ) : null}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={birthDate || '1998-01-01'}
        onChange={handleDatePicked}
        onClose={() => setDatePickerVisible(false)}
        title="Select Date of Birth"
        maxDate={new Date().toISOString().split('T')[0]}
      />

      {/* Clean Flat Footer: No Shadows, Pure Surface */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom, 16),
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        {!isDobSelected ? (
          <>
            <Button
              label="Select Date of Birth"
              size="lg"
              onPress={() => setDatePickerVisible(true)}
            />
            <Button
              label="Switch Account"
              variant="ghost"
              size="md"
              onPress={cancel}
              style={{ marginTop: spacing.xs }}
            />
          </>
        ) : isMinor ? (
          <Button
            label="Return to Sign In"
            variant="outline"
            size="lg"
            onPress={cancel}
          />
        ) : (
          <>
            <Button
              label={`Enter ${selectedGender === 'Male' ? "Men's" : selectedGender === 'Female' ? "Women's" : 'Pride'} Sanctuary`}
              size="lg"
              onPress={confirm}
            />
            <Button
              label="Sign out & switch account"
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
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  avatarSquircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    padding: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  optionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  dobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  dobIconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  minorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 10,
  },
  footer: {
    paddingTop: 12,
  },
});
