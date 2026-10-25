import { SquircleSurface } from '../../components/ui/SquircleSurface';
import React from 'react';
import { Share, StyleSheet, Text } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Chip } from '../../components/ui/Chip';
import { PressableScale } from '../../components/ui/PressableScale';

import { buildLocalExport, eraseLocalData } from '../../services/privacy/localData';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { ProductExperience } from '../../theme/tokens';
import { ThemeMode } from '../../stores/slices/appSlice';
import { useTheme } from '../../theme/useTheme';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';

export default function DevToolsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, isDark } = useTheme();

  const store = useRootStore(
    useShallow((st) => ({
      user: st.user,
      experience: st.experience,
      themeMode: st.themeMode,
      isOnboarded: st.isOnboarded,
      onboardingStep: st.onboardingStep,
      checkIns: st.checkInHistory.length,
      journal: st.journalEntries.length,
      currentStreak: st.currentStreak,
      level: st.level,
      xp: st.xp,
      isSocialPathRevealed: st.isSocialPathRevealed,
      quietHoursEnabled: st.quietHoursEnabled,
      offlineModeForced: st.offlineModeForced,
      setExperience: st.setExperience,
      setThemeMode: st.setThemeMode,
      setUser: st.setUser,
      continueAsGuest: st.continueAsGuest,
      signOut: st.signOut,
      setIsOnboarded: st.setIsOnboarded,
      resetOnboarding: st.resetOnboarding,
      setOnboardingAnswers: st.setOnboardingAnswers,
      setSocialPathRevealed: st.setSocialPathRevealed,
      setQuietHours: st.setQuietHours,
      toggleOfflineMode: st.toggleOfflineMode,
      showToast: st.showToast,
      addCheckIn: st.addCheckIn,
      addJournalEntry: st.addJournalEntry,
      updateCycleData: st.updateCycleData,
      clearCycleData: st.clearCycleData,
      resetDailyQuotaIfNewDay: st.resetDailyQuotaIfNewDay,
    })),
  );

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    useRootStore.getState().showAlert({
      title,
      message,
      confirmText: 'Proceed',
      destructive: true,
      onConfirm,
    });
  };

  // ── Seed realistic mock data for UI testing ──
  const handleSeedMockData = () => {
    // Seed 7 days of check-ins
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = formatLocalDate(d);
      store.addCheckIn({
        date: isoDate,
        energy: 6 + ((i * 2) % 4),
        mood: 7 + ((i * 3) % 3),
        stress: 3 + ((i * 2) % 5),
        sleepHours: 7.2 + (i % 2) * 0.5,
        symptoms: i === 0 ? ['High Focus', 'Light Cramps'] : ['Steady Energy'],
        notes: i === 0 ? 'Felt centered and mindful after evening walk.' : undefined,
      });
    }

    // Seed cycle tracking
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 12);
    store.updateCycleData({
      lastPeriodDate: formatLocalDate(periodStart),
      cycleLengthDays: 28,
      periodLengthDays: 5,
      currentPhase: 'follicular',
      estimatedNextPeriodDate: formatLocalDate(new Date(periodStart.getTime() + 28 * 86400000)),
    });

    // Seed journal entries
    store.addJournalEntry(
      'Morning Reflection & Stillness',
      'Started the day early with gentle stretches and a cup of peppermint tea. Noticing clarity and steady breath.',
      8,
    );
    store.addJournalEntry(
      'Evening Sanctuary Walk',
      'Golden hour twilight through the park. Allowed thoughts to settle without rushing into task mode.',
      9,
    );

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    store.showToast({
      type: 'success',
      title: 'Mock Data Injected',
      message: '7 check-ins, cycle metrics, and journal entries seeded (development build only).',
    });
  };

  // ── Toggle Adult 18+ Verification ──
  const handleToggleAgeVerification = () => {
    if (!store.user) {
      store.continueAsGuest();
    }
    const currentUser = useRootStore.getState().user;
    if (currentUser) {
      const nextVerified = !currentUser.isAgeVerified;
      store.setUser({
        ...currentUser,
        isAgeVerified: nextVerified,
        age: nextVerified ? 24 : 16,
        ageBand: nextVerified ? 'adult_18_plus' : 'minor_16_17',
      });
      store.showToast({
        type: 'info',
        title: 'Age Status Updated',
        message: `User age status set to: ${nextVerified ? 'Adult 18+ (Verified)' : 'Minor Under-18'}`,
      });
    }
  };

  // ── Switch Pseudonym ──
  const handleSetPseudonym = (name: string) => {
    const currentUser = store.user;
    if (currentUser) {
      store.setUser({ ...currentUser, pseudonym: name });
    } else {
      store.continueAsGuest();
      const updated = useRootStore.getState().user;
      if (updated) store.setUser({ ...updated, pseudonym: name });
    }
    store.showToast({ type: 'success', message: `Pseudonym set to ${name}` });
  };

  // ── Fast-track Complete Onboarding ──
  const handleFastTrackOnboarding = () => {
    store.setOnboardingAnswers({
      goals: ['steady_energy', 'deep_sleep', 'mindful_routines'],
      constraints: ['desk_work', 'screen_fatigue'],
      routineMinutes: 10,
      diet: 'balanced',
      observances: [],
    });
    store.setIsOnboarded(true);
    store.showToast({
      type: 'success',
      title: 'Onboarding Completed',
      message: 'User marked as fully onboarded with curated goals.',
    });
    router.replace('/(app)/(tabs)');
  };

  const experiences: { id: ProductExperience; label: string; sub: string }[] = [
    { id: 'women_health', label: "Women's Health", sub: 'Terracotta & Sage · Fraunces' },
    { id: 'men_health', label: "Men's Health", sub: 'Midnight navy, sea-glass and amber · Space Grotesk' },
    { id: 'pride_wellbeing', label: 'Pride & LGBTQ+', sub: 'Amethyst & Rose · Serene' },
  ];

  const themes: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: 'System Default' },
    { id: 'light', label: 'Light Porcelain' },
    { id: 'dark', label: 'Dark Obsidian' },
  ];

  const screenJumps: { name: string; route: any; icon: keyof typeof Ionicons.glyphMap; group: string }[] = [
    { name: 'Home Tab', route: '/(app)/(tabs)', icon: 'home-outline', group: 'Tabs' },
    { name: "Today's Plan", route: '/(app)/(tabs)/today', icon: 'today-outline', group: 'Tabs' },
    { name: 'Progress & Stats', route: '/(app)/(tabs)/progress', icon: 'trending-up-outline', group: 'Tabs' },
    { name: 'Settings & Privacy', route: '/(app)/(tabs)/settings', icon: 'settings-outline', group: 'Tabs' },
    { name: 'Daily Check-in', route: '/(app)/check-in', icon: 'heart-outline', group: 'Health' },
    { name: 'Cycle Tracking', route: '/(app)/health/cycle', icon: 'water-outline', group: 'Health' },
    { name: "Men's Health Hub", route: '/(app)/health/men', icon: 'barbell-outline', group: 'Health' },
    { name: 'Pride Wellbeing Hub', route: '/(app)/health/pride', icon: 'color-wand-outline', group: 'Health' },
    { name: 'Sleep Log', route: '/(app)/health/sleep', icon: 'moon-outline', group: 'Health' },
    { name: 'Mood & Energy', route: '/(app)/health/mood', icon: 'happy-outline', group: 'Health' },
    { name: 'Symptoms Log', route: '/(app)/health/symptoms', icon: 'pulse-outline', group: 'Health' },
    { name: 'Journal', route: '/(app)/journal', icon: 'book-outline', group: 'Social & Journal' },
    { name: 'New Journal Entry', route: '/(app)/journal/new', icon: 'create-outline', group: 'Social & Journal' },
    { name: 'Letterbox', route: '/(app)/letters', icon: 'mail-outline', group: 'Social & Journal' },
    { name: 'Private Circles', route: '/(app)/circles', icon: 'people-outline', group: 'Social & Journal' },
    { name: 'AI Memory Vault', route: '/(app)/ai', icon: 'hardware-chip-outline', group: 'Systems' },
    { name: 'Safety & Appeals', route: '/(app)/safety', icon: 'shield-outline', group: 'Systems' },
    { name: 'Urgent Support', route: '/(app)/safety/urgent-support', icon: 'call-outline', group: 'Systems' },
    { name: 'Sign-in Screen', route: '/(auth)/sign-in', icon: 'log-in-outline', group: 'Auth' },
    { name: 'Onboarding Step 1', route: '/(onboarding)/choose-experience', icon: 'compass-outline', group: 'Auth' },
  ];

  return (
    <ScreenWrapper scrollable disableScrollAwareDock>
      <Header title="Developer tools" subtitle="Developer tools" showBack />

      <SquircleSurface style={{ paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] }}>
        {/* ── 1. Live System Status ── */}
        <Card style={styles.card}>
          <SquircleSurface style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Live System State</Text>
            <Badge
              label={store.user?.isAgeVerified ? 'Adult 18+' : 'Under-18 / Unverified'}
              variant={store.user?.isAgeVerified ? 'success' : 'warning'}
            />
          </SquircleSurface>

          <SquircleSurface style={{ marginTop: spacing.md, gap: 6 }}>
            {[
              ['User Pseudonym', store.user?.pseudonym ?? 'None (Signed out)'],
              ['User ID', store.user?.id ? `${store.user.id.slice(0, 16)}...` : 'None'],
              ['Auth Mode', store.user?.isGuest ? 'Guest User' : store.user ? 'Local Vault' : 'Anonymous'],
              ['Experience', store.experience],
              ['Theme Scheme', `${store.themeMode} (${isDark ? 'Dark Mode' : 'Light Mode'})`],
              ['Onboarded', store.isOnboarded ? 'Yes (Completed)' : `No (Step: ${store.onboardingStep ?? 'Not started'})`],
              ['Records', `${store.checkIns} check-ins · ${store.journal} journal`],
              ['Progress', `Level ${store.level} · ${store.xp} XP · Streak ${store.currentStreak}d`],
            ].map(([k, v]) => (
              <SquircleSurface key={k} style={styles.infoRow}>
                <Text style={[typography.caption, { color: colors.text.muted, width: 110 }]}>{k}</Text>
                <Text style={[typography.subbodyBold, { color: colors.text.primary, flex: 1 }]}>{v}</Text>
              </SquircleSurface>
            ))}
          </SquircleSurface>
        </Card>

        {/* ── 2. User & Profile Management ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          USER & PROFILE CONTROLS
        </Text>
        <Card style={styles.card}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
            Change active pseudonym:
          </Text>
          <SquircleSurface style={styles.chipRow}>
            {['SolsticeSeeker', 'Alex', 'Rowan', 'Morgan'].map((p) => (
              <Chip
                key={p}
                label={p}
                selected={store.user?.pseudonym === p}
                onPress={() => handleSetPseudonym(p)}
              />
            ))}
          </SquircleSurface>

          <SquircleSurface style={{ marginTop: spacing.md, gap: 8 }}>
            <Button
              variant="secondary"
              label={store.user?.isAgeVerified ? 'Set Age to Minor (<18)' : 'Verify as Adult (18+)'}
              icon={
                <Ionicons
                  name={store.user?.isAgeVerified ? 'lock-closed-outline' : 'shield-checkmark-outline'}
                  size={18}
                  color={colors.text.primary}
                />
              }
              onPress={handleToggleAgeVerification}
            />

            {!store.isOnboarded ? (
              <Button
                variant="primary"
                label="Fast-Track Complete Onboarding"
                icon={<Ionicons name="flash-outline" size={18} color={colors.onPrimary} />}
                onPress={handleFastTrackOnboarding}
              />
            ) : null}

            <Button
              variant="secondary"
              label="Reset Onboarding Flow (Start Wizard Again)"
              icon={<Ionicons name="refresh-outline" size={18} color={colors.text.primary} />}
              onPress={() => {
                store.resetOnboarding();
                router.replace('/(onboarding)/choose-experience' as any);
              }}
            />

            <Button
              variant="secondary"
              label={store.user ? 'Delete Active User & Sign Out' : 'Sign In as Fresh Guest'}
              icon={<Ionicons name={store.user ? 'person-remove-outline' : 'person-add-outline'} size={18} color={colors.text.primary} />}
              onPress={() => {
                if (store.user) {
                  confirmAction('Delete User?', 'This signs out and removes the current user profile.', () => {
                    store.signOut();
                    router.replace('/(auth)/sign-in');
                  });
                } else {
                  store.continueAsGuest();
                  store.showToast({ type: 'success', message: 'Signed in as guest.' });
                }
              }}
            />
          </SquircleSurface>
        </Card>

        {/* ── 3. Cohort Experience & Theme Palette Switcher ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          COHORT EXPERIENCE & PALETTE
        </Text>
        <Card style={styles.card}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
            Active Experience (Colors & Fonts adapt automatically):
          </Text>
          <SquircleSurface style={{ gap: 8 }}>
            {experiences.map((exp) => {
              const isSelected = store.experience === exp.id;
              return (
                <PressableScale
                  key={exp.id}
                  onPress={() => store.setExperience(exp.id)}
                  style={[
                    styles.experienceRow,
                    {
                      backgroundColor: isSelected ? colors.primaryAlpha : colors.surface1,
                    },
                  ]}
                  scaleTo={0.98}
                >
                  <SquircleSurface style={{ flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: isSelected ? colors.primary : colors.text.primary }]}>
                      {exp.label}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                      {exp.sub}
                    </Text>
                  </SquircleSurface>
                  {isSelected && <Badge label="Active" variant="primary" />}
                </PressableScale>
              );
            })}
          </SquircleSurface>

          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
            Appearance Theme:
          </Text>
          <SquircleSurface style={styles.themeRow}>
            {themes.map((t) => (
              <PressableScale
                key={t.id}
                onPress={() => store.setThemeMode(t.id)}
                style={[
                  styles.themeTab,
                  {
                    backgroundColor: store.themeMode === t.id ? colors.primary : colors.surface1,
                  },
                ]}
                scaleTo={0.96}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: store.themeMode === t.id ? colors.onPrimary : colors.text.primary },
                  ]}
                >
                  {t.label}
                </Text>
              </PressableScale>
            ))}
          </SquircleSurface>

          {/* Palette Swatches */}
          <SquircleSurface style={styles.swatchGrid}>
            {[
              ['Background', colors.background],
              ['Surface', colors.surface],
              ['Surface 1', colors.surface1],
              ['Primary', colors.primary],
              ['Accent', colors.accent],
              ['Dock', colors.dock],
              ['Dock Active', colors.dockActive],
            ].map(([name, col]) => (
              <SquircleSurface key={name} style={styles.swatchItem}>
                <SquircleSurface style={[styles.swatchCircle, { backgroundColor: col }]} />
                <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>{name}</Text>
              </SquircleSurface>
            ))}
          </SquircleSurface>
        </Card>

        {/* ── 4. Local Storage & Mock Data Engine ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          STORAGE & MOCK DATA
        </Text>
        <Card style={styles.card}>
          <SquircleSurface style={{ gap: 8 }}>
            <Button
              variant="primary"
              label="Seed 7-Day Health & Journal Records"
              icon={<Ionicons name="cloud-upload-outline" size={18} color={colors.onPrimary} />}
              onPress={handleSeedMockData}
            />

            <Button
              variant="secondary"
              label="Export Local Vault Data (JSON Share)"
              icon={<Ionicons name="share-outline" size={18} color={colors.text.primary} />}
              onPress={async () => {
                try {
                  await Share.share({ title: 'Thrivefold Device Export', message: buildLocalExport() });
                } catch {
                  useRootStore.getState().showToast({ type: 'error', message: 'Export failed' });
                }
              }}
            />

            <Button
              variant="secondary"
              label="Clear Health & Cycle Data Only"
              icon={<Ionicons name="trash-bin-outline" size={18} color={colors.text.primary} />}
              onPress={() => {
                confirmAction('Clear Health Records?', 'Wipes check-ins and cycle data while keeping user profile.', () => {
                  useRootStore.setState({
                    checkInHistory: [],
                    cycleData: null,
                    todayEnergy: null,
                    todayMood: null,
                    todayStress: null,
                    todaySleepHours: null,
                    todaySymptoms: [],
                  });
                  store.showToast({ type: 'info', message: 'Health history cleared.' });
                });
              }}
            />

            <Button
              variant="danger"
              label="Wipe All Local Storage (Fresh Install Nuke)"
              icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              onPress={() => {
                confirmAction(
                  'Wipe EVERYTHING?',
                  'This erases all records, MMKV vault keys, journals, and accounts from this device.',
                  () => {
                    eraseLocalData();
                    router.replace('/');
                  },
                );
              }}
            />
          </SquircleSurface>
        </Card>

        {/* ── 5. Feature Flags & Policies ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          FEATURE FLAGS & LOCAL PRIVACY
        </Text>
        <Card style={styles.card}>
          <SquircleSurface style={{ gap: 8 }}>
            <PressableScale
              onPress={() => store.setSocialPathRevealed(!store.isSocialPathRevealed)}
              style={styles.flagRow}
            >
              <SquircleSurface style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Social Path Unlocked</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Controls gradual reveal of correspondence & letter features
                </Text>
              </SquircleSurface>
              <Badge
                label={store.isSocialPathRevealed ? 'Enabled' : 'Hidden'}
                variant={store.isSocialPathRevealed ? 'success' : 'neutral'}
              />
            </PressableScale>

            <PressableScale
              onPress={() => store.setQuietHours(!store.quietHoursEnabled)}
              style={styles.flagRow}
            >
              <SquircleSurface style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Quiet Hours Filter</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Suppresses non-urgent prompts 22:00 - 07:00
                </Text>
              </SquircleSurface>
              <Badge
                label={store.quietHoursEnabled ? 'Active' : 'Disabled'}
                variant={store.quietHoursEnabled ? 'primary' : 'neutral'}
              />
            </PressableScale>

            <PressableScale
              onPress={store.toggleOfflineMode}
              style={styles.flagRow}
            >
              <SquircleSurface style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Forced Offline Mode</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Blocks any external network requests (strict on-device)
                </Text>
              </SquircleSurface>
              <Badge
                label={store.offlineModeForced ? 'Forced Offline' : 'Online OK'}
                variant={store.offlineModeForced ? 'warning' : 'neutral'}
              />
            </PressableScale>

            <Button
              variant="secondary"
              label="Reset Daily Intro Quota"
              icon={<Ionicons name="time-outline" size={18} color={colors.text.primary} />}
              onPress={() => {
                store.resetDailyQuotaIfNewDay();
                store.showToast({ type: 'success', message: 'Daily quota reset.' });
              }}
            />
          </SquircleSurface>
        </Card>

        {/* ── 6. Direct Screen Jump Menu ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          DIRECT SCREEN JUMP MATRIX ({screenJumps.length} SCREENS)
        </Text>
        <Card style={styles.card}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
            Instantly navigate to any screen in Thrivefold:
          </Text>
          <SquircleSurface style={{ gap: 6 }}>
            {screenJumps.map((jump) => (
              <Link key={jump.name} href={jump.route as Href} asChild>
                <PressableScale
                  style={[styles.jumpRow, { backgroundColor: colors.surface1 }]}
                  scaleTo={0.98}
                >
                  <Ionicons name={jump.icon} size={18} color={colors.primary} />
                  <SquircleSurface style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{jump.name}</Text>
                    <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>{jump.group}</Text>
                  </SquircleSurface>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </PressableScale>
              </Link>
            ))}
          </SquircleSurface>
        </Card>

        {/* ── 7. Interactive Toast & Haptics Tester ── */}
        <Text style={[typography.label, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          INTERACTIVE FEEDBACK TESTER
        </Text>
        <Card style={styles.card}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
            Test System Toasts:
          </Text>
          <SquircleSurface style={styles.chipRow}>
            <Chip
              label="Success Toast"
              onPress={() =>
                store.showToast({
                  type: 'success',
                  title: 'Routine Completed',
                  message: 'Gentle mobility routine logged.',
                })
              }
            />
            <Chip
              label="Info Toast"
              onPress={() =>
                store.showToast({
                  type: 'info',
                  title: 'Cycle Prediction',
                  message: 'Next luteal phase begins in 4 days.',
                })
              }
            />
            <Chip
              label="Warning Toast"
              onPress={() =>
                store.showToast({
                  type: 'warning',
                  title: 'Low Sleep Logged',
                  message: 'Gentle rest suggested for today.',
                })
              }
            />
            <Chip
              label="Error Toast"
              onPress={() =>
                store.showToast({
                  type: 'error',
                  title: 'Storage Full Warning',
                  message: 'Device storage is almost full.',
                })
              }
            />
          </SquircleSurface>

          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
            Test Hardware Haptics:
          </Text>
          <SquircleSurface style={styles.chipRow}>
            <Chip
              label="Light Impact"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
            <Chip
              label="Medium Impact"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            />
            <Chip
              label="Heavy Impact"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
            />
            <Chip
              label="Selection Tap"
              onPress={() => Haptics.selectionAsync()}
            />
          </SquircleSurface>
        </Card>
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0,
  },
  swatchItem: {
    alignItems: 'center',
    width: 64,
  },
  swatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
    borderWidth: 0,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
});
