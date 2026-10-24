import React from 'react';
import { Switch, Text } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { enableQuestReminders } from '../../../services/notifications/questReminders';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** Quest reminders and quiet hours. */
export default function RemindersScreen() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      on: st.questRemindersEnabled,
      setOn: st.setQuestRemindersEnabled,
      quietOn: st.quietHoursEnabled,
      start: st.quietHoursStart,
      end: st.quietHoursEnd,
      setQuiet: st.setQuietHours,
    })),
  );
  const toggle = async (next: boolean) => {
    if (next && !(await enableQuestReminders())) {
      useRootStore.getState().showToast({ type: 'info', message: 'Notifications are off for Thrivefold in system settings.' });
      return;
    }
    s.setOn(next);
  };
  return (
    <ScreenContainer header={<AppHeader title="Reminders" subtitle="When Thrivefold may nudge you" showBack />} scrollMode="shell-scroll-view">
      <SettingsRow
        icon="notifications-outline"
        title="Quest reminders"
        subtitle="Morning, afternoon or evening, only when a quest fits that time."
        right={<Switch value={s.on} onValueChange={toggle} accessibilityLabel="Quest reminders" />}
      />
      <SettingsRow
        icon="moon-outline"
        title="Quiet hours"
        subtitle={`No reminders from ${s.start} to ${s.end}.`}
        right={<Switch value={s.quietOn} onValueChange={(v) => s.setQuiet(v)} accessibilityLabel="Quiet hours" />}
      />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Reminder text never mentions a health topic, so nothing personal shows on your lock screen.
      </Text>
    </ScreenContainer>
  );
}
