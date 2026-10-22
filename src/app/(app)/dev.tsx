import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { eraseLocalData } from '../../services/privacy/localData';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

/**
 * Developer tools. Only reachable in development builds (__DEV__); release builds
 * redirect away, so none of this ships to users.
 */
export default function DevToolsScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevTools />;
}

function DevTools() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      experience: st.experience,
      isOnboarded: st.isOnboarded,
      onboardingStep: st.onboardingStep,
      checkIns: st.checkInHistory.length,
      journal: st.journalEntries.length,
      xp: st.xp,
      revealed: st.isSocialPathRevealed,
      setExperience: st.setExperience,
      signOut: st.signOut,
      resetOnboarding: st.resetOnboarding,
      setSocialPathRevealed: st.setSocialPathRevealed,
    })),
  );

  const confirm = (title: string, message: string, run: () => void) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Do it', style: 'destructive', onPress: run },
    ]);

  const actions: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; run: () => void }[] = [
    {
      icon: 'trash-outline',
      title: 'Clear all local storage',
      body: 'Wipes every persisted record and returns to a fresh install.',
      run: () =>
        confirm('Clear storage?', 'Everything on this device is erased.', () => {
          eraseLocalData();
          router.replace('/');
        }),
    },
    {
      icon: 'log-out-outline',
      title: 'Sign out',
      body: 'Keeps health data; returns to the entry screen.',
      run: () => {
        s.signOut();
        router.replace('/');
      },
    },
    {
      icon: 'refresh-outline',
      title: 'Restart onboarding',
      body: 'Clears onboarding answers and runs the four steps again.',
      run: () => {
        s.resetOnboarding();
        router.replace('/');
      },
    },
    {
      icon: s.revealed ? 'eye-off-outline' : 'eye-outline',
      title: s.revealed ? 'Hide social path' : 'Reveal social path',
      body: 'Toggles the gradual-reveal flag for testing letters UI.',
      run: () => s.setSocialPathRevealed(!s.revealed),
    },
  ];

  const experiences: ProductExperience[] = ['women_health', 'men_health', 'pride_wellbeing'];

  return (
    <ScreenWrapper scrollable disableScrollAwareDock>
      <Header title="Developer tools" subtitle="Development builds only" showBack />
      <View style={{ padding: spacing.base }}>
        <Card style={{ padding: spacing.base, marginBottom: spacing.md }}>
          {[
            ['User', s.user ? `${s.user.pseudonym} (${s.user.isGuest ? 'guest' : 'local'})` : 'signed out'],
            ['Experience', s.experience],
            ['Onboarded', s.isOnboarded ? 'yes' : `no (step: ${s.onboardingStep ?? 'start'})`],
            ['Records', `${s.checkIns} check-ins · ${s.journal} journal · ${s.xp} XP`],
          ].map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={[typography.caption, styles.key, { color: colors.text.muted }]}>{k}</Text>
              <Text style={[typography.subbodyBold, styles.flex, { color: colors.text.primary }]}>{v}</Text>
            </View>
          ))}
        </Card>

        <Text style={[typography.label, { color: colors.text.muted, marginBottom: spacing.sm }]}>Theme</Text>
        <View style={[styles.segment, { backgroundColor: colors.surface1, marginBottom: spacing.lg }]}>
          {experiences.map((e) => (
            <Text
              key={e}
              onPress={() => s.setExperience(e)}
              accessibilityRole="button"
              style={[
                typography.subbodyBold,
                styles.segmentItem,
                {
                  color: s.experience === e ? colors.primary : colors.text.secondary,
                  backgroundColor: s.experience === e ? colors.surface : 'transparent',
                },
              ]}
            >
              {e.split('_')[0]}
            </Text>
          ))}
        </View>

        {actions.map((a) => (
          <Card key={a.title} onPress={a.run} style={{ padding: spacing.base, marginBottom: spacing.sm }}>
            <View style={styles.actionRow}>
              <Ionicons name={a.icon} size={20} color={colors.primary} />
              <View style={[styles.flex, { marginLeft: 12 }]}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{a.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{a.body}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  actionRow: { alignItems: 'center', flexDirection: 'row' },
  flex: { flex: 1 },
  key: { width: 96 },
  row: { flexDirection: 'row', paddingVertical: 6 },
  segment: { borderRadius: 14, flexDirection: 'row', gap: 4, padding: 4 },
  segmentItem: {
    borderRadius: 10,
    flex: 1,
    overflow: 'hidden',
    paddingVertical: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
