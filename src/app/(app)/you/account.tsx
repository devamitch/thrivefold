import { useRouter } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { signOutEverywhere } from '../../../services/account/accountService';
import { eraseLocalData, exportDataToCsvFile } from '../../../services/privacy/localData';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** Who is signed in, sign out, and erase. */
export default function AccountScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { user, showAlert, resetOnboarding } = useRootStore(
    useShallow((s) => ({ user: s.user, showAlert: s.showAlert, resetOnboarding: s.resetOnboarding })),
  );
  const how = user?.isGuest ? 'Guest on this phone' : user?.profileSource === 'google' ? 'Signed in with Google' : user?.email ? 'Signed in with email' : 'Local profile on this phone';

  const signOut = async () => {
    await signOutEverywhere();
    router.replace('/(auth)/sign-in');
  };
  const erase = () =>
    showAlert({
      title: 'Erase everything on this phone?',
      message: 'Check-ins, cycle records, journal, workouts, meals, quests and settings are deleted from this phone for good. Export first if you want a copy.',
      confirmText: 'Erase everything',
      destructive: true,
      onConfirm: async () => {
        await signOutEverywhere();
        eraseLocalData();
        router.replace('/(auth)/sign-in');
      },
    });

  return (
    <ScreenContainer header={<AppHeader title="Account" subtitle={how} showBack />} scrollMode="shell-scroll-view">
      {user?.email ? <SettingsRow icon="mail-outline" title={user.email} subtitle={how} /> : null}
      <SettingsRow
        icon="refresh-outline"
        title="Redo setup"
        subtitle="Choose your space and goals again. Records are kept."
        onPress={() => {
          resetOnboarding();
          router.replace('/');
        }}
      />
      <SettingsRow
        icon="download-outline"
        title="Export all data (Excel / CSV)"
        subtitle="Save check-ins, workouts, meals, cycle records and logs as a spreadsheet."
        onPress={async () => {
          const ok = await exportDataToCsvFile();
          if (!ok) {
            showAlert({
              title: 'Export Failed',
              message: 'Could not generate the export spreadsheet file.',
              confirmText: 'OK',
            });
          }
        }}
      />
      <SettingsRow icon="log-out-outline" title={user?.isGuest ? 'Leave guest mode' : 'Sign out'} subtitle="Your records stay on this phone." onPress={signOut} />
      <SettingsRow icon="trash-outline" title="Erase everything" subtitle="Deletes every record on this phone and signs you out." onPress={erase} tone="danger" />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Signing out keeps your records on this phone. Erasing removes them and replaces the encryption key.
      </Text>
    </ScreenContainer>
  );
}
