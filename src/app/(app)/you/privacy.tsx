import { Link, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Share, Text } from 'react-native';
import { Toggle } from '../../../components/ui/Toggle';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { buildLocalExport } from '../../../services/privacy/localData';
import { firebaseAnalytics } from '../../../services/telemetry/firebaseAnalytics';
import { clearSummaryOutbox, enqueueFinishedWeeks, flushSummaryOutbox, outboxStatus } from '../../../services/sync/summaryOutbox';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** What stays on the phone, what can leave it, and the tools to export or share. */
export default function PrivacyScreen() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      share: st.shareWeeklySummaries,
      setShare: st.setShareWeeklySummaries,
      showAlert: st.showAlert,
      usage: st.usageAnalytics,
      setUsage: st.setUsageAnalytics,
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

  const toggleUsage = (on: boolean) => {
    s.setUsage(on);
    firebaseAnalytics.setConsent({ analytics_storage: on, ad_storage: false, ad_user_data: false, ad_personalization: false });
    firebaseAnalytics.setCollectionEnabled(on);
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
      <Link href={'/(app)/health/integrations' as Href} asChild>
        <SettingsRow icon="link-outline" title="Connected apps" subtitle="Health Connect, heart-rate straps and FHIR export." />
      </Link>
      <Link href={'/(app)/ai' as Href} asChild>
        <SettingsRow icon="analytics-outline" title="Patterns and on-device memory" subtitle="What the app works out from your logs, on this phone." />
      </Link>
      {signedIn ? (
        <SettingsRow
          icon="cloud-upload-outline"
          title="Back up weekly summaries"
          subtitle={
            s.share
              ? `${outbox.queued ? `${outbox.queued} waiting. ` : ''}${outbox.lastSentWeek ? `Last: week of ${outbox.lastSentWeek}.` : 'Nothing sent yet.'}`
              : 'Averages and counts only, once a week. Never notes, symptoms or cycle dates.'
          }
          right={<Toggle value={s.share} onValueChange={toggleBackup} accessibilityLabel="Back up weekly summaries" />}
        />
      ) : null}
      <SettingsRow
        icon="bar-chart-outline"
        title="Share anonymous usage"
        subtitle="Which screens and features are used, to improve the app. Never health records, notes or identity. Off unless you turn it on."
        right={<Toggle value={s.usage} onValueChange={toggleUsage} accessibilityLabel="Share anonymous usage" />}
      />
      <Link href={'/(app)/safety' as Href} asChild>
        <SettingsRow icon="shield-checkmark-outline" title="Safety and support" subtitle="Blocking, reports and urgent help." />
      </Link>
      <Link href={'/(public)/legal/privacy' as Href} asChild>
        <SettingsRow icon="document-text-outline" title="Privacy policy" />
      </Link>
      <Link href={'/(public)/legal/terms' as Href} asChild>
        <SettingsRow icon="reader-outline" title="Terms" />
      </Link>
    </ScreenContainer>
  );
}
