import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore } from '../../../stores/useRootStore';
import { canUseCorrespondence } from '../../../navigation/eligibility';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { AppHeader } from '../../../components/ui/AppHeader';
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
              <Pressable
                onPress={() => setIsEditingProfile(true)}
                style={[styles.avatarCircle, { backgroundColor: colors.primaryAlpha }]}
                accessibilityLabel="Edit Profile Avatar"
              >
                <Ionicons name={currentAvatar.icon} size={32} color={colors.primary} />
                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="pencil" size={10} color={colors.onPrimary} />
                </View>
              </Pressable>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 20 }]}>
                    {user?.pseudonym ?? 'Friend'}
                  </Text>
                  <Pressable
                    onPress={() => setIsEditingProfile(true)}
                    style={[styles.editBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                </View>

                {user?.profileSource === 'google' ? (
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {[user.age !== null && user.age !== undefined ? `${user.age}` : null, user.gender ?? null, 'from Google']
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
                <View style={styles.badgeRow}>
                  <Badge
                    label={user?.isGuest ? 'Guest' : user?.email ? 'Signed in' : 'On this device'}
                    variant="neutral"
                  />
                  <Badge
                    label={`Lvl ${level}`}
                    variant="primary"
                    style={{ marginLeft: 6 }}
                  />
                  <Badge
                    label={`${currentStreak}d Streak`}
                    variant="primary"
                    style={{ marginLeft: 6 }}
                  />
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
        <SettingsRow icon={HEALTH_SPACE.icon} title={HEALTH_SPACE.title} subtitle={HEALTH_SPACE.subtitle} onPress={() => router.push(HEALTH_SPACE.route as Href)} />
        <SettingsRow icon="calendar-outline" title="Calendar and routine" subtitle="Your days, workouts, check-ins and plans by date" onPress={() => router.push('/(app)/calendar' as Href)} />
        {correspondenceOpen ? (
          <SettingsRow icon="mail-outline" title="Letters" subtitle="Slow, private correspondence" onPress={() => router.push('/(app)/letters')} />
        ) : null}
        <SettingsRow icon="game-controller-outline" title="Games" subtitle="Breathing, memory and focus" onPress={() => router.push('/(app)/games')} />
        <SettingsRow icon="trail-sign-outline" title="Roadmap" subtitle="Chapters, levels and what unlocks next" onPress={() => router.push('/(app)/(tabs)/progress')} />

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
          Settings
        </Text>
        <SettingsRow icon="options-outline" title="Personalize" subtitle="Space, goals, pace and limits" onPress={() => router.push('/(app)/personalize')} />
        <SettingsRow icon="restaurant-outline" title="Food preferences" subtitle="Nutrition focus and meal timing" onPress={() => router.push('/(onboarding)/lifestyle-preferences')} />
        <SettingsRow icon="notifications-outline" title="Reminders" subtitle="Quest reminders and quiet hours" onPress={() => router.push('/(app)/you/reminders' as Href)} />
        <SettingsRow icon="lock-closed-outline" title="Privacy and data" subtitle="Export, connected apps, backup and safety" onPress={() => router.push('/(app)/you/privacy' as Href)} />
        <SettingsRow icon="person-circle-outline" title="Account" subtitle="Sign out, redo setup or erase" onPress={() => router.push('/(app)/you/account' as Href)} />
        {__DEV__ ? (
          <SettingsRow icon="construct-outline" title="Developer tools" subtitle="Development builds only" onPress={() => router.push('/(app)/dev')} />
        ) : null}
      </View>

      {/* Profile Edit Modal */}
      <Modal
        visible={isEditingProfile}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
            <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
              Your name and emblem
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginTop: 4, marginBottom: 16 },
              ]}
            >
              Choose your display identity and personal emblem.
            </Text>

            {/* Emblem Selector */}
            <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 8 }]}>
              Emblem
            </Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setSelectedAvatar(a.id)}
                  style={[
                    styles.avatarOption,
                    {
                      backgroundColor:
                        selectedAvatar === a.id ? colors.primaryAlpha : colors.surface1,
                      borderColor: selectedAvatar === a.id ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={a.icon}
                    size={24}
                    color={selectedAvatar === a.id ? colors.primary : colors.text.secondary}
                  />
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: selectedAvatar === a.id ? colors.primary : colors.text.secondary,
                        fontSize: 10,
                        marginTop: 4,
                      },
                    ]}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Name Input */}
            <Text
              style={[
                typography.captionBold,
                { color: colors.text.primary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              Pseudonym
            </Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter name"
              placeholderTextColor={colors.text.muted}
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.surface1,
                  color: colors.text.primary,
                },
              ]}
              maxLength={24}
            />

            {/* Actions */}
            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => setIsEditingProfile(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surface1 }]}
              >
                <Text style={[typography.captionBold, { color: colors.text.secondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveProfile}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.captionBold, { color: colors.onPrimary }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
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
  avatarOption: {
    width: '30%',
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
