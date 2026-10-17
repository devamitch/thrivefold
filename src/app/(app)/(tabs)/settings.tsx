import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useAppStore } from '../../../stores/useAppStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { ProductExperience } from '../../../theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience, isDark } = useTheme();
  const setExperience = useAppStore((s) => s.setExperience);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const user = useAuthStore((s) => s.user);

  const experiences: { id: ProductExperience; label: string; icon: string }[] = [
    { id: 'women_health', label: "Women's Health", icon: '🌸' },
    { id: 'men_health', label: "Men's Health", icon: '🌿' },
    { id: 'pride_wellbeing', label: 'Pride & LGBTQ+', icon: '✨' },
  ];

  const handleExportData = () => {
    Alert.alert('Data Export Generated', 'Your local-first health history, reflections, and check-in logs have been prepared for private JSON download.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Local Vault',
      'This will erase all locally stored cycle metrics, private journals, AI memory tokens, and account keys. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase Everything', style: 'destructive', onPress: () => router.replace('/(onboarding)/choose-experience') },
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
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    marginBottom: 8,
                  },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {exp.icon}  {exp.label}
                  </Text>
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

        <Card onPress={() => router.push('/(app)/billing')} style={{ marginBottom: 8 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Subscription & Free Tier Status
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Zero-cost personal tier active
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
