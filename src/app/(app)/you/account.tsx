import { useRouter } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { deleteAccountEverywhere, signOutEverywhere } from '../../../services/account/accountService';
import { eraseLocalData, exportDataToWorkbook, exportRawJson } from '../../../services/privacy/localData';
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
        icon={user?.isAgeVerified ? 'shield-checkmark-outline' : 'id-card-outline'}
        title="Age check"
        subtitle={user?.isAgeVerified ? 'Verified adult. Letters and groups are open.' : 'Needed for letters and groups.'}
        onPress={() => router.push('/(app)/you/age-check')}
      />
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
        title="Export all data (Excel)"
        subtitle="One workbook: check-ins, cycle, workouts, meals, journal and more, a sheet each."
        onPress={async () => {
          const ok = await exportDataToWorkbook();
          if (!ok) showAlert({ title: 'Not exported', message: 'No file was saved. Try again and choose a folder.', confirmText: 'OK', cancelText: null });
        }}
      />
      <SettingsRow
        icon="code-download-outline"
        title="Export raw data (JSON)"
        subtitle="Everything, unformatted, for moving to another app."
        onPress={async () => {
          const ok = await exportRawJson();
          if (!ok) showAlert({ title: 'Not exported', message: 'No file was saved. Try again and choose a folder.', confirmText: 'OK', cancelText: null });
        }}
      />
      <SettingsRow icon="log-out-outline" title={user?.isGuest ? 'Leave guest mode' : 'Sign out'} subtitle="Your records stay on this phone." onPress={signOut} />
      <SettingsRow icon="trash-outline" title="Erase this phone" subtitle="Deletes every record on this phone and signs you out." onPress={erase} tone="danger" />
      {!user?.isGuest ? (
        <SettingsRow
          icon="person-remove-outline"
          title="Delete my account"
          subtitle="Removes your account and server data (letters, dating, groups, rewards), then this phone."
          tone="danger"
          onPress={() =>
            showAlert({
              title: 'Delete your account for good?',
              message:
                'Your Thrivefold account and everything on the server are deleted: letters, dating conversations, group memberships, rewards, age check and consents. Then this phone is erased. This can’t be undone. Export first if you want a copy.',
              confirmText: 'Delete account',
              destructive: true,
              onConfirm: async () => {
                try {
                  await deleteAccountEverywhere();
                  router.replace('/(auth)/sign-in');
                } catch {
                  showAlert({ title: 'Not deleted', message: 'The server couldn’t be reached. Nothing was deleted; try again when you’re online.', confirmText: 'OK', cancelText: null });
                }
              },
            })
          }
        />
      ) : null}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Signing out keeps your records on this phone. Erasing removes them and replaces the encryption key.
      </Text>
    </ScreenContainer>
  );
}
