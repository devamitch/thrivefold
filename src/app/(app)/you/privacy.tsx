import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Share, Switch, Text } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { buildLocalExport } from '../../../services/privacy/localData';
import { clearSummaryOutbox, enqueueFinishedWeeks, flushSummaryOutbox, outboxStatus } from '../../../services/sync/summaryOutbox';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** What stays on the phone, what can leave it, and the tools to export or share. */
export default function PrivacyScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      share: st.shareWeeklySummaries,
      setShare: st.setShareWeeklySummaries,
      showAlert: st.showAlert,
    })),
  );
  const signedIn = Boolean(s.user && !s.user.isGuest && s.user.email);
  const [outbox, setOutbox] = useState(() => outboxStatus());

  const toggleBackup = (next: boolean) => {
    s.setShare(next);
    if (next) {
      enqueueFinishedWeeks();
      flushSummaryOutbox()
        .then(() => setOutbox(outboxStatus()))
        .catch(() => undefined);
    } else clearSummaryOutbox();
    setOutbox(outboxStatus());
  };

  const exportAll = async () => {
    try {
      await Share.share({ title: 'Thrivefold export', message: buildLocalExport() });
    } catch {
      s.showAlert({ title: 'Could not export', message: 'Please try again.', confirmText: 'OK', cancelText: null });
    }
  };

  return (
    <ScreenContainer header={<AppHeader title="Privacy and data" subtitle="Your records stay on this phone" showBack />} scrollMode="shell-scroll-view">
      <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
        Check-ins, cycle records, journal, workouts, meals and photos are encrypted on this phone. Nothing leaves it unless
        you choose one of the options below.
      </Text>
      <SettingsRow icon="download-outline" title="Export everything" subtitle="A full copy of your records as a file you can save or share." onPress={exportAll} />
      <SettingsRow icon="link-outline" title="Connected apps" subtitle="Health Connect, heart-rate straps and FHIR export." onPress={() => router.push('/(app)/health/integrations')} />
      <SettingsRow icon="analytics-outline" title="Patterns and on-device memory" subtitle="What the app works out from your logs, on this phone." onPress={() => router.push('/(app)/ai')} />
      {signedIn ? (
        <SettingsRow
          icon="cloud-upload-outline"
          title="Back up weekly summaries"
          subtitle={
            s.share
              ? `${outbox.queued ? `${outbox.queued} waiting. ` : ''}${outbox.lastSentWeek ? `Last: week of ${outbox.lastSentWeek}.` : 'Nothing sent yet.'}`
              : 'Averages and counts only, once a week. Never notes, symptoms or cycle dates.'
          }
          right={<Switch value={s.share} onValueChange={toggleBackup} accessibilityLabel="Back up weekly summaries" />}
        />
      ) : null}
      <SettingsRow icon="shield-checkmark-outline" title="Safety and support" subtitle="Blocking, reports and urgent help." onPress={() => router.push('/(app)/safety')} />
      <SettingsRow icon="document-text-outline" title="Privacy policy" onPress={() => router.push('/(public)/legal/privacy')} />
      <SettingsRow icon="reader-outline" title="Terms" onPress={() => router.push('/(public)/legal/terms')} />
    </ScreenContainer>
  );
}
