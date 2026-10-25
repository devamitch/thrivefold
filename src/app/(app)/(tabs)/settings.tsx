import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore } from '../../../stores/useRootStore';
import { canUseCorrespondence } from '../../../navigation/eligibility';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppBottomSheetModal, SheetFooterRow } from '../../../components/ui/AppBottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
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
  const { colors, typography, spacing, experience } = useTheme();
  const HEALTH_SPACE =
    experience === 'women_health'
      ? { route: '/(app)/health/cycle', icon: 'water-outline' as const, title: 'Cycle', subtitle: 'Periods, symptoms and estimated phases' }
      : experience === 'men_health'
        ? { route: '/(app)/health/men', icon: 'barbell-outline' as const, title: "Men's health", subtitle: 'Training, recovery and health basics' }
        : { route: '/(app)/health/pride', icon: 'heart-outline' as const, title: 'Self-care', subtitle: 'Affirming care, notes and support' };

  const user = useRootStore((s) => s.user);
  const setUser = useRootStore((s) => s.setUser);
  const correspondenceOpen = useRootStore(canUseCorrespondence);
  // App metrics for profile overview
  const level = useRootStore((s) => s.level);
  const xp = useRootStore((s) => s.xp);
  const currentStreak = useRootStore((s) => s.currentStreak);
  const questsCompleted = useRootStore((s) => s.questsCompleted);
  const checkInDays = useRootStore((s) => s.completedCheckInDaysCount);

  // Editing pseudonym state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.pseudonym ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarSeed ?? 'lotus');

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
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === (user?.avatarSeed ?? 'lotus')) ?? AVATAR_OPTIONS[0];

  return (
    <ScreenContainer header={<AppHeader title="You" subtitle="Profile, spaces and settings" />} scrollMode="shell-scroll-view">
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
                      <Image source={{ uri: user.photoUrl }} style={styles.avatarPhoto} contentFit="cover" accessibilityIgnoresInvertColors />
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
                    onPress={() => setIsEditingProfile(true)}
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
                    {[user.age !== null && user.age !== undefined ? `${user.age}` : null, user.gender ?? null, 'from Google']
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
                <View style={styles.badgeRow}>
                  <Badge label={`Level ${level}`} variant="primary" />
                  {currentStreak > 0 ? <Badge label={`${currentStreak} day streak`} variant="primary" /> : null}
                  <Badge label={user?.isGuest ? 'Guest' : user?.email ? 'Signed in' : 'On this phone'} variant="neutral" />
                </View>
              </View>
            </View>

            {/* Quick Metrics Bar */}
            <View style={[styles.metricsBar, { borderTopColor: colors.surface1 }]}>
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.primary, fontSize: 16 }]}>
                  {questsCompleted}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>Quests</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.surface1 }]} />
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.accent, fontSize: 16 }]}>
                  {checkInDays}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>Check-ins</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.surface1 }]} />
              <View style={styles.metricItem}>
                <Text style={[typography.captionBold, { color: colors.text.primary, fontSize: 16 }]}>
                  {xp}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>XP Earned</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Your spaces
        </Text>
        <Link href={HEALTH_SPACE.route as Href} asChild>
          <SettingsRow icon={HEALTH_SPACE.icon} title={HEALTH_SPACE.title} subtitle={HEALTH_SPACE.subtitle} />
        </Link>
        <Link href={'/(app)/calendar' as Href} asChild>
          <SettingsRow icon="calendar-outline" title="Calendar and routine" subtitle="Your days, workouts, check-ins and plans by date" />
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

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
          Settings
        </Text>
        <Link href={'/(app)/personalize' as Href} asChild>
          <SettingsRow icon="options-outline" title="Personalize" subtitle="Space, goals, pace and limits" />
        </Link>
        <Link href={'/(onboarding)/lifestyle-preferences' as Href} asChild>
          <SettingsRow icon="restaurant-outline" title="Food preferences" subtitle="Nutrition focus and meal timing" />
        </Link>
        <Link href={'/(app)/you/beliefs' as Href} asChild>
          <SettingsRow icon="globe-outline" title="Beliefs and culture" subtitle="Optional, private, for observance reminders" />
        </Link>
        <Link href={'/(app)/you/reminders' as Href} asChild>
          <SettingsRow icon="notifications-outline" title="Reminders" subtitle="Quest reminders and quiet hours" />
        </Link>
        <Link href={'/(app)/you/privacy' as Href} asChild>
          <SettingsRow icon="lock-closed-outline" title="Privacy and data" subtitle="Export, connected apps, backup and safety" />
        </Link>
        <Link href={'/(app)/you/account' as Href} asChild>
          <SettingsRow icon="person-circle-outline" title="Account" subtitle="Sign out, redo setup or erase" />
        </Link>
        {__DEV__ ? (
          <Link href={'/(app)/dev' as Href} asChild>
            <SettingsRow icon="construct-outline" title="Developer tools" subtitle="Development builds only" />
          </Link>
        ) : null}
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
        <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 8 }]}>
          Emblem
        </Text>
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
                  <Ionicons
                    name={a.icon}
                    size={24}
                    color={isSelected ? colors.primary : colors.text.secondary}
                  />
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
});
