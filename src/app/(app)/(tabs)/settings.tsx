import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { buildLocalExport, eraseLocalData } from '../../../services/privacy/localData';
import { useRootStore } from '../../../stores/useRootStore';
import { signOutAccount } from '../../../services/account/accountService';
import { useTheme } from '../../../theme/useTheme';

const AVATAR_OPTIONS = [
  { id: 'lotus', icon: 'flower-outline' as const, label: 'Lotus' },
  { id: 'flame', icon: 'flame-outline' as const, label: 'Flame' },
  { id: 'compass', icon: 'compass-outline' as const, label: 'Compass' },
  { id: 'sparkles', icon: 'sparkles-outline' as const, label: 'Spark' },
  { id: 'leaf', icon: 'leaf-outline' as const, label: 'Nature' },
  { id: 'shield', icon: 'shield-outline' as const, label: 'Guardian' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();

  const themeMode = useRootStore((s) => s.themeMode);
  const setThemeMode = useRootStore((s) => s.setThemeMode);
  const user = useRootStore((s) => s.user);
  const setUser = useRootStore((s) => s.setUser);
  const signOut = useRootStore((s) => s.signOut);
  const resetOnboarding = useRootStore((s) => s.resetOnboarding);
  const showAlert = useRootStore((s) => s.showAlert);

  // App metrics for profile overview
  const level = useRootStore((s) => s.level);
  const xp = useRootStore((s) => s.xp);
  const currentStreak = useRootStore((s) => s.currentStreak);
  const questsCompleted = useRootStore((s) => s.questsCompleted);
  const checkInDays = useRootStore((s) => s.completedCheckInDaysCount);

  // Editing pseudonym state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.pseudonym ?? 'SolsticeSeeker');
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

  const handleExportData = async () => {
    try {
      await Share.share({ title: 'Thrivefold Data Export', message: buildLocalExport() });
    } catch {
      showAlert({
        title: "Couldn't Export",
        message: 'Please try again.',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Erase Local Vault & Profile',
      message:
        'This will permanently delete all cycle entries, daily journals, private letters, and cryptographic keys from this device.',
      confirmText: 'Erase Everything',
      destructive: true,
      onConfirm: () => {
        eraseLocalData();
        router.replace('/(auth)/sign-in');
      },
    });
  };

  // Find active avatar icon
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === (user?.avatarSeed ?? 'lotus')) ?? AVATAR_OPTIONS[0];

  return (
    <ScreenContainer scrollMode="shell-scroll-view">
      <View style={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Profile Card Header */}
        <Animated.View entering={FadeInDown.duration(280)}>
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
                    {user?.pseudonym ?? 'SolsticeSeeker'}
                  </Text>
                  <Pressable
                    onPress={() => setIsEditingProfile(true)}
                    style={[styles.editBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                </View>

                <View style={styles.badgeRow}>
                  <Badge
                    label={user?.isGuest ? 'Guest Mode' : 'Verified Member'}
                    variant={user?.isGuest ? 'neutral' : 'success'}
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

        {/* Interconnected Feature Hub */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Connected Spaces
        </Text>

        <Card onPress={() => router.push('/(app)/health/cycle')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Cycle & Health Engine
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Natural rhythm predictions, logging, and phase insights
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/letters')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="mail-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Reflective Letters & Wax Seals
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Private timestamped reflections with sealed wax stamps
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/games')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="game-controller-outline" size={20} color={colors.text.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Mind Refreshers & Games
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Breathing, focus calibration, and mindful puzzle sessions
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/(tabs)/progress')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="trail-sign-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Personal Roadmap & Milestones
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Your progression timeline, XP trajectory, and unlocked badges
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        {/* Privacy & Systems Section */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
          Vault & Privacy Controls
        </Text>

        <Card onPress={() => router.push('/(app)/ai')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="analytics-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Your Patterns & Memory
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Insights from your check-ins, note search, memory
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/safety')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Safety, Blocks & Appeals
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Manage blocked correspondents and safety guidelines
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={handleExportData} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="download-outline" size={20} color={colors.text.secondary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Export Health Records
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Save encrypted JSON package to device Files
                </Text>
              </View>
            </View>
            <Ionicons name="share-outline" size={18} color={colors.text.muted} />
          </View>
        </Card>

        {/* Appearance Settings */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
          Theme & Appearance
        </Text>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.themeRow}>
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: themeMode === mode ? colors.primary : colors.surface1,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: themeMode === mode ? colors.onPrimary : colors.text.primary,
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Preferences & Developer Options */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.sm }]}>
          Preferences & Actions
        </Text>

        <Card
          onPress={() => router.push('/(onboarding)/lifestyle-preferences')}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Habits & Dietary Preferences
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Nutritional focus and reminder timings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card
          onPress={() => {
            resetOnboarding();
            router.replace('/');
          }}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Reset Routine & Goals
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Re-calibrate experience mode and routine length
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/dev')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <Ionicons name="construct-outline" size={20} color={colors.text.secondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Developer Tools & Test Sandbox
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Mock metrics, date travel, reset storage
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card
          onPress={() => {
            signOutAccount().catch(() => undefined);
            signOut();
            router.replace('/');
          }}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.rowBetween}>
            <View style={styles.hubIconRow}>
              <Ionicons name="log-out-outline" size={20} color={colors.text.secondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {user?.isGuest ? 'Exit Guest Session' : 'Sign Out'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Your encrypted local vault remains on this device
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={handleDeleteAccount} variant="surface1" style={{ marginTop: spacing.sm }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.bodyBold, { color: colors.error }]}>
              Erase Local Vault & Reset Account
            </Text>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </View>
        </Card>
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
              Customize Pseudonym
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
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
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
    borderTopWidth: 1,
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
  hubIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
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
    borderWidth: 1.5,
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
