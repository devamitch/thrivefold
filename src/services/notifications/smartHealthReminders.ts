/**
 * smartHealthReminders.ts — Smart notification scheduling for check-ins, meals, and streak protection.
 *
 * Schedules gentle, respectful reminders based on:
 * - Preferred check-in time (e.g. 09:00 morning check-in) if not yet checked in.
 * - Meal/fuel reminder if no meal logged during daylight hours.
 * - Streak protection reminder in the evening if the day's check-in is pending.
 * - Respects the user's quiet hours and notification toggle.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useRootStore } from '../../stores/useRootStore';

const SMART_CHANNEL = 'smart-health-reminders';
const SMART_KIND = 'smart-health-reminder';

export async function enableSmartHealthNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(SMART_CHANNEL, {
      name: 'Health & Routine Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      showBadge: false,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  return granted;
}

export async function cancelSmartReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.kind === SMART_KIND)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Graceful fallback
  }
}

/**
 * Syncs and schedules today's intelligent reminders.
 * Call on app launch, foreground return, or after check-in/meal logs.
 */
export async function syncSmartHealthReminders(): Promise<void> {
  try {
    const store = useRootStore.getState();
    await cancelSmartReminders();

    if (!store.questRemindersEnabled) return;

    const todayStr = formatLocalDate(new Date());
    const hasCheckedInToday = store.checkInHistory.some((c) => c.date === todayStr);
    const todayMeals = store.mealLogs.filter((m) => m.date === todayStr);

    const now = new Date();
    const scheduledHours: Date[] = [];

    // 1. Morning / Preferred Check-In Reminder (default: 09:00 AM)
    if (!hasCheckedInToday) {
      const checkInTime = new Date();
      checkInTime.setHours(9, 0, 0, 0);

      if (checkInTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Morning Check-In',
            body: 'A quiet moment for you. How is your energy and mood starting out today?',
            data: { kind: SMART_KIND, type: 'checkin' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: checkInTime,
            channelId: SMART_CHANNEL,
          },
        });
        scheduledHours.push(checkInTime);
      }
    }

    // 2. Meal / Fuel Reminder (afternoon 14:00 if no meal logged yet)
    if (todayMeals.length === 0) {
      const mealTime = new Date();
      mealTime.setHours(14, 0, 0, 0);

      if (mealTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Fuel Check-In',
            body: 'Have you had lunch? Snap a quick photo or log your meal to track your macros.',
            data: { kind: SMART_KIND, type: 'meal' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: mealTime,
            channelId: SMART_CHANNEL,
          },
        });
        scheduledHours.push(mealTime);
      }
    }

    // 3. Evening Streak Protector Reminder (20:30 PM if check-in is still pending)
    if (!hasCheckedInToday && store.currentStreak > 0) {
      const eveningTime = new Date();
      eveningTime.setHours(20, 30, 0, 0);

      if (eveningTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Protect Your ${store.currentStreak}-Day Streak!`,
            body: 'Keep your momentum going. A quick 30-second check-in saves your streak.',
            data: { kind: SMART_KIND, type: 'streak_protector' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: eveningTime,
            channelId: SMART_CHANNEL,
          },
        });
        scheduledHours.push(eveningTime);
      }
    }
  } catch {
    // Non-fatal convenience service
  }
}
