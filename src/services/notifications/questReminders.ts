import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { plannedReminders } from '../../domain/game/reminders';
import { useRootStore } from '../../stores/useRootStore';

const CHANNEL = 'quest-reminders';
const KIND = 'quest-reminder';

/** Asks for notification permission and sets up a private, low-key channel. */
export async function enableQuestReminders(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Quest reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      showBadge: false,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  return granted;
}

async function cancelOurs() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.filter((n) => n.content.data?.kind === KIND).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Replaces today's quest reminders with ones for the parts of the day that still have open
 * quests. Safe to call often (app start, foreground, after a quest is done).
 */
export async function syncQuestReminders(): Promise<void> {
  try {
    const s = useRootStore.getState();
    await cancelOurs();
    if (!s.questRemindersEnabled) return;
    const open = s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'skipped' && q.status !== 'replaced');
    const plan = plannedReminders(open, new Date(), {
      enabled: s.quietHoursEnabled,
      start: s.quietHoursStart,
      end: s.quietHoursEnd,
    });
    for (const r of plan) {
      await Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body, data: { kind: KIND, part: r.part } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL },
      });
    }
  } catch {
    // Reminders are a convenience; a failure must never affect the app.
  }
}
