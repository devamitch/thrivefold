import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore } from '../../../stores/useRootStore';
import { canUseCorrespondence } from '../../../navigation/eligibility';
import { SettingsGroup, SettingsRow } from '../../../components/ui/SettingsRow';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppBottomSheetModal, SheetFooterRow } from '../../../components/ui/AppBottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import { Toggle } from '../../../components/ui/Toggle';
import { useTheme } from '../../../theme/useTheme';

const AVATAR_OPTIONS = [
  { id: 'lotus', icon: 'flower-outline' as const, label: 'Lotus' },
  { id: 'flame', icon: 'flame-outline' as const, label: 'Flame' },
  { id: 'compass', icon: 'compass-outline' as const, label: 'Compass' },
  { id: 'sun', icon: 'sunny-outline' as const, label: 'Dawn' },
  { id: 'leaf', icon: 'leaf-outline' as const, label: 'Nature' },
  { id: 'shield', icon: 'shield-outline' as const, label: 'Guardian' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const HEALTH_SPACE =
    experience === 'women_health'
      ? {
          route: '/(app)/health/cycle',
          icon: 'water-outline' as const,
          title: 'Cycle',
          subtitle: 'Periods, symptoms and estimated phases',
        }
      : experience === 'men_health'
        ? {
            route: '/(app)/health/men',
            icon: 'barbell-outline' as const,
            title: "Men's health",
            subtitle: 'Training, recovery and health basics',
          }
        : {
            route: '/(app)/health/pride',
            icon: 'heart-outline' as const,
            title: 'Self-care',
            subtitle: 'Affirming care, notes and support',
          };

  const user = useRootStore((s) => s.user);
  const setUser = useRootStore((s) => s.setUser);
  const isOwner = useRootStore((s) => s.isOwner);
  const correspondenceOpen = useRootStore(canUseCorrespondence);
  // App metrics for profile overview
  const level = useRootStore((s) => s.level);
  const xp = useRootStore((s) => s.xp);
  const currentStreak = useRootStore((s) => s.currentStreak);
  const questsCompleted = useRootStore((s) => s.questsCompleted);
  const checkInDays = useRootStore((s) => s.completedCheckInDaysCount);
  const hapticsEnabled = useRootStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useRootStore((s) => s.setHapticsEnabled);

  // Editing pseudonym state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.pseudonym ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarSeed ?? 'lotus');

  // Expo Updates state
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);

  const handleCheckUpdates = async () => {
    if (__DEV__) {
      setUpdateStatusText('Updates are disabled in development mode');
      return;
    }
    try {
      setCheckingUpdates(true);
      setUpdateStatusText('Checking for updates...');
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        setUpdateStatusText('Downloading update...');
        await Updates.fetchUpdateAsync();
        setUpdateStatusText('Update ready. Restarting app...');
        await Updates.reloadAsync();
      } else {
        setUpdateStatusText('Up to date');
      }
    } catch (e) {
      setUpdateStatusText('Could not check updates');
    } finally {
      setCheckingUpdates(false);
    }
  };

  const handleSaveProfile = () => {
    if (!editedName.trim()) return;
    if (user) {
      setUser({
        ...user,
        pseudonym: editedName.trim(),
        avatarSeed: selectedAvatar,
      });
    }
    setIsEditingProfile(false);
  };

  // Find active avatar icon
  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === (user?.avatarSeed ?? 'lotus')) ?? AVATAR_OPTIONS[0];

  return (
    <ScreenContainer
      header={<AppHeader title="You" subtitle="Profile, spaces and settings" />}
      scrollMode="shell-scroll-view"
    >
      <View style={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Profile Card Header */}
        <Animated.View entering={FadeIn.duration(180)}>
          <Card style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            <View style={styles.profileHeader}>
              <PressableScale
                onPress={() => setIsEditingProfile(true)}
                scaleTo={0.94}
                accessibilityLabel="Change your name and emblem"
              >
                <View style={styles.avatarWrap}>
                  <SquircleSurface radius={22} fill={colors.primaryAlpha} style={styles.avatarCircle}>
                    {user?.photoUrl ? (
                      <Image
                        source={{ uri: user.photoUrl }}
                        style={styles.avatarPhoto}
                        contentFit="cover"
                        accessibilityIgnoresInvertColors
                      />
                    ) : (
                      <Ionicons name={currentAvatar.icon} size={30} color={colors.primary} />
                    )}
                  </SquircleSurface>
                  {/* Outside the clipped avatar, so it is never cut off */}
                  <SquircleSurface radius={9} fill={colors.primary} style={styles.editBadge}>
                    <Ionicons name="pencil" size={11} color={colors.onPrimary} />
                  </SquircleSurface>
                </View>
              </PressableScale>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 20 }]}>
                    {user?.pseudonym ?? 'Friend'}
                  </Text>
                  <PressableScale
                    onPress={() => router.push('/(app)/you/edit-profile' as Href)}
                    scaleTo={0.94}
                    accessibilityRole="button"
                    accessibilityLabel="Edit profile"
                  >
                    <SquircleSurface
                      radius={10}
                      smoothing={1}
                      fill={colors.surface1}
                      strokeWidth={1}
                      style={styles.editBtn}
                    >
                      <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
                    </SquircleSurface>
                  </PressableScale>
                </View>

                {user?.profileSource === 'google' ? (
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {[
                      user.age !== null && user.age !== undefined ? `${user.age}` : null,
                      user.gender ?? null,
                      'from Google',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
                <View style={styles.badgeRow}>
                  <Badge label={`Level ${level}`} variant="primary" />
                  {currentStreak > 0 ? <Badge label={`${currentStreak} day streak`} variant="primary" /> : null}
                  <Badge
                    label={user?.isGuest ? 'Guest' : user?.email ? 'Signed in' : 'On this phone'}
                    variant="neutral"
                  />
                </View>
              </View>
            </View>

            {/* Quick Metrics Bar */}
            <View style={[styles.metricsBar, { borderTopColor: colors.surface1 }]}>
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.primary, fontSize: 16 }]}>{questsCompleted}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>Quests</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.surface1 }]} />
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.accent, fontSize: 16 }]}>{checkInDays}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>Check-ins</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.surface1 }]} />
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.text.primary, fontSize: 16 }]}>{xp}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>XP Earned</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {__DEV__ || isOwner ? (
          <>
            <SettingsGroup title="Owner">
              <Link href={'/(app)/beta-lab' as Href} asChild>
                <SettingsRow
                  icon="flask-outline"
                  title="Beta Lab"
                  subtitle="Every beta studio, coach, voice and camera feature"
                />
              </Link>
              <Link href={'/(app)/dev' as Href} asChild>
                <SettingsRow
                  icon="construct-outline"
                  title="Developer tools"
                  subtitle="Beta Mode, data and diagnostics"
                />
              </Link>
            </SettingsGroup>
          </>
        ) : null}

        {/* Section: Account & Identity */}
        <SettingsGroup title="You">
          <Link href={'/(app)/you/profile' as Href} asChild>
            <SettingsRow
              icon="person-circle-outline"
              title="Your profile"
              subtitle="Body, food, home, languages, accessibility and emergency contacts"
            />
          </Link>
          <Link href={'/(app)/settings/anvaykosh' as Href} asChild>
            <SettingsRow
              icon="apps-outline"
              title="Account sync"
              subtitle="Your profile, points and level, saved to your account"
            />
          </Link>
        </SettingsGroup>

        {/* Section: Preferences & Daily Focus */}
        <SettingsGroup title="Preferences">
          <Link href={'/(app)/you/preferences' as Href} asChild>
            <SettingsRow
              icon="options-outline"
              title="Routine and comfort"
              subtitle="Routine length, meal style and sensory comfort"
            />
          </Link>
          <Link href={'/(app)/you/adhd-screener' as Href} asChild>
            <SettingsRow
              icon="bulb-outline"
              title="Focus self-check"
              subtitle="Six quick questions so tasks come in smaller steps"
            />
          </Link>
          <Link href={'/(onboarding)/lifestyle-preferences' as Href} asChild>
            <SettingsRow
              icon="restaurant-outline"
              title="Food preferences"
              subtitle="Nutrition focus and meal timing"
            />
          </Link>
          <Link href={'/(app)/personalize' as Href} asChild>
            <SettingsRow icon="compass-outline" title="Space and goals" subtitle="Your space, goals, pace and limits" />
          </Link>
          <Link href={'/(app)/you/beliefs' as Href} asChild>
            <SettingsRow
              icon="globe-outline"
              title="Beliefs and culture"
              subtitle="Optional, private, for observance reminders"
            />
          </Link>
          <Link href={'/(app)/you/reminders' as Href} asChild>
            <SettingsRow
              icon="notifications-outline"
              title="Reminders and quiet hours"
              subtitle="When Thrive may remind you, and when not"
            />
          </Link>
        </SettingsGroup>

        {/* Section: Your spaces */}
        <SettingsGroup title="Your spaces">
          <Link href={HEALTH_SPACE.route as Href} asChild>
            <SettingsRow icon={HEALTH_SPACE.icon} title={HEALTH_SPACE.title} subtitle={HEALTH_SPACE.subtitle} />
          </Link>
          <Link href={'/(app)/calendar' as Href} asChild>
            <SettingsRow
              icon="calendar-outline"
              title="Calendar and routine"
              subtitle="Your days, workouts, check-ins and plans by date"
            />
          </Link>
          {correspondenceOpen ? (
            <Link href={'/(app)/letters' as Href} asChild>
              <SettingsRow icon="mail-outline" title="Letters" subtitle="Slow, private correspondence" />
            </Link>
          ) : null}
          <Link href={'/(app)/games' as Href} asChild>
            <SettingsRow icon="game-controller-outline" title="Games" subtitle="Breathing, memory and focus" />
          </Link>
          <Link href={'/(app)/(tabs)/progress' as Href} asChild>
            <SettingsRow icon="trail-sign-outline" title="Roadmap" subtitle="Chapters, levels and what unlocks next" />
          </Link>
        </SettingsGroup>

        {/* Section: System & Security */}
        <SettingsGroup title="Thrive Coach and privacy">
          <Link href={'/(app)/you/voice' as Href} asChild>
            <SettingsRow
              icon="mic-outline"
              title="Voice and conversation"
              subtitle="Voice, speed, text only, conversation mode"
            />
          </Link>
          <Link href={'/(app)/ai/model-status' as Href} asChild>
            <SettingsRow
              icon="hardware-chip-outline"
              title="Offline brain"
              subtitle="Download once so Thrive answers with no internet"
            />
          </Link>
          <Link href={'/(app)/settings/memories' as Href} asChild>
            <SettingsRow
              icon="library-outline"
              title="What Thrive remembers"
              subtitle="Kept on this phone. See, teach or delete"
            />
          </Link>
          <Link href={'/(app)/settings/ai-byok' as Href} asChild>
            <SettingsRow
              icon="key-outline"
              title="Your own AI key"
              subtitle="Optional: use your own online AI provider"
            />
          </Link>
        </SettingsGroup>
        <SettingsGroup title="Privacy and account">
          <SettingsRow
            icon="finger-print-outline"
            title="Haptic feedback"
            subtitle="A light tap on buttons and milestones"
            right={
              <Toggle
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                accessibilityLabel="Enable or disable tactile haptic feedback"
              />
            }
          />
          <Link href={'/(app)/you/privacy' as Href} asChild>
            <SettingsRow
              icon="lock-closed-outline"
              title="Privacy and data"
              subtitle="Export, connected apps, backup and safety"
            />
          </Link>
          <Link href={'/(app)/you/account' as Href} asChild>
            <SettingsRow icon="person-circle-outline" title="Account" subtitle="Sign out, redo setup or erase" />
          </Link>
        </SettingsGroup>
        <SettingsGroup title="App updates & version">
          <SettingsRow
            icon="cloud-download-outline"
            title="Check for updates"
            subtitle={updateStatusText ?? `v1.0.5 · Tap to check for instant updates`}
            onPress={handleCheckUpdates}
            right={
              checkingUpdates ? (
                <Badge label="Checking" variant="info" />
              ) : (
                <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
              )
            }
          />
        </SettingsGroup>
      </View>

      {/* Profile Edit Bottom Sheet Modal */}
      <AppBottomSheetModal
        visible={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        eyebrow="DISPLAY IDENTITY"
        title="Your name and emblem"
        subtitle="Choose your display identity and personal emblem."
        maxHeight="85%"
        footer={
          <SheetFooterRow>
            <Button label="Cancel" variant="secondary" onPress={() => setIsEditingProfile(false)} />
            <Button label="Save" onPress={handleSaveProfile} />
          </SheetFooterRow>
        }
        contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingBottom: 24 }}
      >
        {/* Emblem Selector */}
        <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 8 }]}>Emblem</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((a) => {
            const isSelected = selectedAvatar === a.id;
            return (
              <PressableScale
                key={a.id}
                onPress={() => setSelectedAvatar(a.id)}
                scaleTo={0.94}
                style={styles.avatarScale}
              >
                <SquircleSurface
                  radius={14}
                  smoothing={1}
                  fill={isSelected ? colors.primaryAlpha : colors.surface1}
                  strokeWidth={1}
                  style={styles.avatarOption}
                >
                  <Ionicons name={a.icon} size={24} color={isSelected ? colors.primary : colors.text.secondary} />
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.primary : colors.text.secondary,
                        fontSize: 10,
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

        {/* Name Input */}
        <View style={{ marginTop: 14 }}>
          <TextField
            label="Pseudonym"
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Enter name"
            maxLength={24}
          />
        </View>

        {/* Section Navigation Buttons */}
        <View style={{ marginTop: 16 }}>
          <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
            Detailed Section Editors
          </Text>

          <PressableScale
            onPress={() => {
              setIsEditingProfile(false);
              router.push('/(app)/you/edit-profile' as Href);
            }}
            style={[styles.modalNavBtn, { backgroundColor: colors.surface1 }]}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Full Profile & Section Editor</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Edit body, food rules, growth, and personal info
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>

          <PressableScale
            onPress={() => {
              setIsEditingProfile(false);
              router.push('/(app)/you/adhd-screener' as Href);
            }}
            style={[styles.modalNavBtn, { backgroundColor: colors.surface1, marginTop: 8 }]}
          >
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Focus & Attention (ADHD) Screener
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Gentle WHO ASRS-v1.1 quiet self-reflection
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>

          <PressableScale
            onPress={() => {
              setIsEditingProfile(false);
              router.push('/(app)/settings/anvaykosh' as Href);
            }}
            style={[styles.modalNavBtn, { backgroundColor: colors.surface1, marginTop: 8 }]}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>AnvayKosh & Supabase Sync</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Single-tap cloud backup and progress sync
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>
        </View>
      </AppBottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  profileCard: {
    borderRadius: 20,
    padding: 18,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    height: 68,
    width: 68,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: {
    height: 64,
    width: 64,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editModalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarScale: {
    width: '31%',
  },
  avatarOption: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
});
