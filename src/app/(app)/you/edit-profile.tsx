import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { CollapsibleSection } from '../../../components/ui/CollapsibleSection';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import { Toggle } from '../../../components/ui/Toggle';
import { PHONE_RE, koshCompleteness, splitList, type KoshProfile } from '../../../domain/account/koshProfile';
import { pushProfile } from '../../../services/account/profileSync';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const AVATAR_OPTIONS = [
  { id: 'lotus', icon: 'flower-outline' as const, label: 'Lotus' },
  { id: 'flame', icon: 'flame-outline' as const, label: 'Flame' },
  { id: 'compass', icon: 'compass-outline' as const, label: 'Compass' },
  { id: 'sun', icon: 'sunny-outline' as const, label: 'Dawn' },
  { id: 'leaf', icon: 'leaf-outline' as const, label: 'Nature' },
  { id: 'shield', icon: 'shield-outline' as const, label: 'Guardian' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const {
    user,
    setUser,
    kosh,
    updateKosh,
    heightCm,
    setHeightCm,
    weightKg,
    setWeightKg,
    diet,
    routineMinutes,
    setOnboardingAnswers,
    contacts,
    adhdProfile,
  } = useRootStore(
    useShallow((s) => ({
      user: s.user,
      setUser: s.setUser,
      kosh: s.koshProfile,
      updateKosh: s.updateKoshProfile,
      heightCm: s.heightCm,
      setHeightCm: s.setHeightCm,
      weightKg: s.weightKg,
      setWeightKg: s.setWeightKg,
      diet: s.onboarding.diet,
      routineMinutes: s.onboarding.routineMinutes,
      setOnboardingAnswers: s.setOnboardingAnswers,
      contacts: s.emergencyContacts,
      adhdProfile: s.adhdProfile,
    })),
  );

  const [pseudonym, setPseudonym] = useState(user?.pseudonym ?? '');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed ?? 'lotus');
  const [preferredName, setPreferredName] = useState(kosh.preferredName ?? '');
  const [phone, setPhone] = useState(kosh.phone ?? '');
  const [homeAddress, setHomeAddress] = useState(kosh.homeAddress ?? '');
  const [careerGoal, setCareerGoal] = useState(kosh.careerGoal ?? '');
  const [heightInput, setHeightInput] = useState(heightCm ? String(heightCm) : '');
  const [weightInput, setWeightInput] = useState(weightKg ? String(weightKg) : '');
  const [languagesText, setLanguagesText] = useState(kosh.languages.join(', '));
  const [foodRulesText, setFoodRulesText] = useState(kosh.foodRestrictions.join(', '));
  const [allergiesText, setAllergiesText] = useState(kosh.allergies.join(', '));
  const [cuisinesText, setCuisinesText] = useState(kosh.cuisines.join(', '));
  const [interestsText, setInterestsText] = useState(kosh.interests.join(', '));
  const [skillsText, setSkillsText] = useState(kosh.skills.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    hapticSuccess();

    // 1. Update user identity
    if (user && pseudonym.trim()) {
      setUser({
        ...user,
        pseudonym: pseudonym.trim(),
        avatarSeed,
      });
    }

    // 2. Body metrics
    const parsedH = Number(heightInput.replace(',', '.'));
    if (parsedH >= 100 && parsedH <= 250) setHeightCm(Math.round(parsedH));
    const parsedW = Number(weightInput.replace(',', '.'));
    if (parsedW >= 25 && parsedW <= 350) setWeightKg(Math.round(parsedW * 10) / 10);

    // 3. Kosh profile fields
    const patch: Partial<KoshProfile> = {
      preferredName: preferredName.trim() || null,
      phone: phone.trim() && PHONE_RE.test(phone.trim()) ? phone.trim() : null,
      homeAddress: homeAddress.trim() || null,
      careerGoal: careerGoal.trim() || null,
      languages: splitList(languagesText),
      foodRestrictions: splitList(foodRulesText),
      allergies: splitList(allergiesText),
      cuisines: splitList(cuisinesText),
      interests: splitList(interestsText),
      skills: splitList(skillsText),
    };
    updateKosh(patch);

    // 4. Cloud sync if signed in
    if (user && !user.isGuest) {
      setSyncStatus('Syncing to Supabase…');
      const ok = await pushProfile();
      setSyncStatus(ok ? 'Synced to Supabase' : 'Saved on device');
    } else {
      setSyncStatus('Saved on this phone');
    }

    setIsSaving(false);
  };

  const completeness = koshCompleteness(kosh, contacts.length);

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="YOU"
          title="Edit profile"
          subtitle={`${completeness}% complete · every field is optional`}
          showBack
          onBack={() => router.back()}
        />
      }
    >
      {/* Quick Section Shortcuts */}
      <View style={styles.quickBar}>
        <PressableScale
          onPress={() => router.push('/(app)/you/adhd-screener' as Href)}
          style={[styles.quickChip, { backgroundColor: colors.primaryAlpha }]}
        >
          <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary }]}>Focus check</Text>
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(app)/you/preferences' as Href)}
          style={[styles.quickChip, { backgroundColor: colors.surface2 }]}
        >
          <Ionicons name="options-outline" size={14} color={colors.text.primary} />
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>Preferences</Text>
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(app)/settings/anvaykosh' as Href)}
          style={[styles.quickChip, { backgroundColor: colors.surface2 }]}
        >
          <Ionicons name="cloud-outline" size={14} color={colors.text.primary} />
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>Account sync</Text>
        </PressableScale>
      </View>

      {/* Section 1: Display Emblem & Identity */}
      <Card style={styles.sectionCard}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>Display Emblem</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          Pick the symbol that reflects your daily intention.
        </Text>

        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((a) => {
            const isSelected = avatarSeed === a.id;
            return (
              <PressableScale
                key={a.id}
                onPress={() => {
                  hapticLight();
                  setAvatarSeed(a.id);
                }}
                scaleTo={0.94}
                style={styles.avatarScale}
              >
                <SquircleSurface
                  radius={16}
                  fill={isSelected ? colors.primaryAlpha : colors.surface1}
                  strokeWidth={1}
                  style={styles.avatarTile}
                >
                  <Ionicons name={a.icon} size={28} color={isSelected ? colors.primary : colors.text.secondary} />
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.primary : colors.text.secondary,
                        fontSize: 11,
                        marginTop: 4,
                      },
                    ]}
                  >
                    {a.label}
                  </Text>
                </SquircleSurface>
              </PressableScale>
            );
          })}
        </View>

        <View style={{ marginTop: 14 }}>
          <TextField
            label="Display name / Pseudonym"
            value={pseudonym}
            onChangeText={setPseudonym}
            placeholder="Enter pseudonym"
            maxLength={30}
          />
        </View>
      </Card>

      {/* Section 2: About You */}
      <CollapsibleSection
        title="Personal & Contact"
        icon="person-outline"
        summary={
          preferredName || phone
            ? [preferredName, phone].filter(Boolean).join(' · ')
            : 'Preferred name, phone, languages'
        }
        done={Boolean(preferredName)}
        defaultOpen
      >
        <TextField
          label="What should Thrivefold call you?"
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="Your preferred name"
          containerStyle={styles.field}
        />
        <TextField
          label="Phone number (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+91..."
          containerStyle={styles.field}
        />
        <TextField
          label="Preferred languages"
          value={languagesText}
          onChangeText={setLanguagesText}
          placeholder="e.g. English, Hindi, Bengali"
          containerStyle={styles.field}
        />
        <TextField
          label="Home address or area (optional)"
          value={homeAddress}
          onChangeText={setHomeAddress}
          placeholder="Used only for nearby walk recommendations"
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Section 3: Body & Fitness Pacing */}
      <CollapsibleSection
        title="Body & Daily Pacing"
        icon="body-outline"
        summary={
          heightInput && weightInput ? `${heightInput} cm · ${weightInput} kg` : 'Height, weight, daily routine length'
        }
        done={Boolean(heightInput && weightInput)}
      >
        <View style={styles.pair}>
          <TextField
            label="Height (cm)"
            keyboardType="numeric"
            value={heightInput}
            onChangeText={setHeightInput}
            placeholder="170"
            containerStyle={styles.flex}
          />
          <TextField
            label="Weight (kg)"
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="68"
            containerStyle={styles.flex}
          />
        </View>

        <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 12 }]}>Daily Routine Pacing</Text>
        <View style={styles.chipsRow}>
          {([5, 10, 20] as const).map((m) => (
            <Chip
              key={m}
              label={`${m} min / day`}
              selected={routineMinutes === m}
              onPress={() =>
                setOnboardingAnswers({
                  routineMinutes: routineMinutes === m ? null : m,
                })
              }
            />
          ))}
        </View>

        <Text style={[typography.captionBold, { color: colors.text.muted, marginTop: 12 }]}>
          Diet & Nutrition Style
        </Text>
        <View style={styles.chipsRow}>
          {['No preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Pescatarian', 'Eggetarian'].map((d) => (
            <Chip
              key={d}
              label={d}
              selected={diet === d}
              onPress={() => setOnboardingAnswers({ diet: diet === d ? null : d })}
            />
          ))}
        </View>
      </CollapsibleSection>

      {/* Section 4: Food Rules & Allergies */}
      <CollapsibleSection
        title="Food Rules & Allergies"
        icon="restaurant-outline"
        summary={foodRulesText || allergiesText ? 'Allergies & rules configured' : 'Food rules, allergies, cuisines'}
        done={Boolean(foodRulesText || allergiesText)}
      >
        <TextField
          label="Food rules you follow"
          value={foodRulesText}
          onChangeText={setFoodRulesText}
          placeholder="e.g. Vegetarian, Jain, Halal"
          containerStyle={styles.field}
        />
        <TextField
          label="Allergies & intolerances"
          value={allergiesText}
          onChangeText={setAllergiesText}
          placeholder="e.g. Peanuts, Lactose, Gluten"
          containerStyle={styles.field}
        />
        <TextField
          label="Favorite cuisines"
          value={cuisinesText}
          onChangeText={setCuisinesText}
          placeholder="e.g. South Indian, Mediterranean"
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Section 5: Growth & Goals */}
      <CollapsibleSection
        title="Growth, Skills & Career"
        icon="trending-up-outline"
        summary={careerGoal ? 'Career goal set' : 'Interests, skills and goals'}
        done={Boolean(careerGoal || interestsText)}
      >
        <TextField
          label="Interests & Hobbies"
          value={interestsText}
          onChangeText={setInterestsText}
          placeholder="e.g. Reading, cycling, botanical drawing"
          containerStyle={styles.field}
        />
        <TextField
          label="Skills to explore or learn"
          value={skillsText}
          onChangeText={setSkillsText}
          placeholder="e.g. Python, public speaking, meditation"
          containerStyle={styles.field}
        />
        <TextField
          label="A goal for your work, studies or life"
          value={careerGoal}
          onChangeText={setCareerGoal}
          placeholder="What are you building or striving toward?"
          multiline
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* ADHD Focus Screener Card Shortcut */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Focus & Attention Style</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              {adhdProfile.completedAt
                ? `Style: ${adhdProfile.focusStyle ?? 'Completed'} · Tap to adjust`
                : 'Take the gentle 6-question screener to personalize quest lengths'}
            </Text>
          </View>
          <PressableScale
            onPress={() => router.push('/(app)/you/adhd-screener' as Href)}
            style={[styles.editChip, { backgroundColor: colors.primaryAlpha }]}
          >
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {adhdProfile.completedAt ? 'Review' : 'Start'}
            </Text>
          </PressableScale>
        </View>
      </Card>

      {/* Status Message */}
      {syncStatus ? (
        <View style={styles.statusWrap}>
          <Ionicons name="cloud-done-outline" size={16} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>{syncStatus}</Text>
        </View>
      ) : null}

      {/* Bottom Save Action */}
      <View style={styles.actionRow}>
        <Button label={isSaving ? 'Saving…' : 'Save all changes'} disabled={isSaving} onPress={handleSaveAll} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    paddingTop: 8,
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  avatarScale: {
    flex: 1,
    minWidth: '28%',
  },
  avatarTile: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginTop: 10,
  },
  pair: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  flex: { flex: 1 },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  actionRow: {
    marginTop: 20,
  },
});
