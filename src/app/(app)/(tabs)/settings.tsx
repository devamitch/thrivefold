import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { buildLocalExport, eraseLocalData } from '../../../services/privacy/localData';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
export default function SettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience, isDark } = useTheme();
  const themeMode = useRootStore((s) => s.themeMode);
  const setThemeMode = useRootStore((s) => s.setThemeMode);
  const user = useRootStore((s) => s.user);
  const signOut = useRootStore((s) => s.signOut);
  const resetOnboarding = useRootStore((s) => s.resetOnboarding);

  const rows: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; onPress: () => void }[] = [
    {
      icon: 'restaurant-outline',
      title: 'Food & reminders',
      body: 'Optional eating and reminder preferences',
      onPress: () => router.push('/(onboarding)/lifestyle-preferences'),
    },
    {
      icon: 'refresh-outline',
      title: 'Redo setup',
      body: 'Change your goals and routine length',
      onPress: () => {
        resetOnboarding();
        router.replace('/');
      },
    },
    {
      icon: 'log-out-outline',
      title: user?.isGuest ? 'Leave guest mode' : 'Sign out',
      body: 'Your records stay on this phone until you erase them',
      onPress: () => {
        signOut();
        router.replace('/');
      },
    },
    {
      icon: 'construct-outline' as const,
      title: 'Developer Menu & Tools',
      body: 'Clear storage, delete users, switch themes, mock data',
      onPress: () => router.push('/(app)/dev'),
    },
  ];


  // Hands the full JSON copy of this device's Thrivefold data to the system share sheet
  // (save to Files, send to yourself, etc.).
  const handleExportData = async () => {
    try {
      await Share.share({ title: 'Thrivefold data export', message: buildLocalExport() });
    } catch {
      Alert.alert("Couldn't export", 'Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Local Vault',
      'This will erase all locally stored cycle metrics, private journals, AI memory tokens, and account keys. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: () => {
            eraseLocalData();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Settings & Privacy" subtitle="Account & Experience Controls" />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* User Card */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                {user?.pseudonym ?? 'SolsticeSeeker'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Verified Adult Status (18+) · Pseudonymous ID
              </Text>
            </View>
            <Badge label="Verified" variant="success" />
          </View>
        </Card>


        {/* Theme Settings */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Appearance
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
                    { color: themeMode === mode ? colors.onPrimary : colors.text.primary, textTransform: 'capitalize' },
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Local Vault & Navigation Shortcuts */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Privacy & Systems
        </Text>

        <Card onPress={() => router.push('/(app)/ai')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                AI Memory Vault & Status
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Inspect and erase local on-device AI memory
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={() => router.push('/(app)/safety')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Safety, Blocks & Appeals
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Manage blocked correspondents and safety reports
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card onPress={handleExportData} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Export My Health Data
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Download local JSON data package
              </Text>
            </View>
            <Ionicons name="download-outline" size={18} color={colors.text.muted} />
          </View>
        </Card>

        {rows.map((r) => (
          <Card key={r.title} onPress={r.onPress} style={{ marginBottom: 8 }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name={r.icon} size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{r.title}</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>{r.body}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        ))}

        <Card onPress={handleDeleteAccount} variant="surface1" style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.bodyBold, { color: colors.error }]}>
              Erase Data & Reset Account
            </Text>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCard: {
    padding: 14,
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
});
