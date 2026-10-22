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
import { ProductExperience } from '../../../theme/tokens';

import { Icon, IconName } from '../../../components/ui/Icon';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience, isDark } = useTheme();
  const setExperience = useRootStore((s) => s.setExperience);
  const themeMode = useRootStore((s) => s.themeMode);
  const setThemeMode = useRootStore((s) => s.setThemeMode);
  const user = useRootStore((s) => s.user);

  const experiences: { id: ProductExperience; label: string; icon: IconName }[] = [
    { id: 'women_health', label: "Women's Health", icon: 'heart' },
    { id: 'men_health', label: "Men's Health", icon: 'bolt' },
    { id: 'pride_wellbeing', label: 'Pride & LGBTQ+', icon: 'sun' },
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

        {/* Experience Switcher */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Active Product Experience
        </Text>
        <View style={{ marginBottom: spacing.md }}>
          {experiences.map((exp) => {
            const isSelected = experience === exp.id;
            return (
              <Card
                key={exp.id}
                onPress={() => setExperience(exp.id)}
                variant={isSelected ? 'tinted' : 'surface'}
                style={[
                  styles.optionCard,
                  {
                    marginBottom: 8,
                  },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Icon name={exp.icon} size={20} color={isSelected ? colors.primary : colors.text.secondary} />
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {exp.label}
                    </Text>
                  </View>
                  {isSelected && <Badge label="Active" variant="primary" />}
                </View>
              </Card>
            );
          })}
        </View>

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

        <Card onPress={handleDeleteAccount} style={{ marginTop: spacing.md, borderColor: colors.error }}>
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
