/**
 * Routine nudges, scheduled on the phone with daily or weekly triggers. Each sync replaces the
 * previous routine schedule (nothing duplicated). Tapping a nudge opens its screen and counts as
 * keeping the routine (a small gem reward, once per routine per day).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { routineTimes, type Routine } from '../../domain/routines';
import { syncNativeAlarms } from '../../../modules/alarm-scheduler';

const CHANNEL = 'routines_alarm';
export const ROUTINE_KIND = 'routine';

async function ensure(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Routine Alarms',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
      enableLights: true,
      lightColor: '#D06543',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      showBadge: true,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  return current.granted || (await Notifications.requestPermissionsAsync()).granted;
}

/** Syncs routine alarms with both Android native AlarmManager (real alarms) and Expo notifications. */
export async function syncRoutineReminders(routines: Routine[]): Promise<boolean> {
  try {
    // 1. Sync Native AlarmManager alarms (fires AlarmClock intent even when app is killed)
    if (Platform.OS === 'android') {
      const nativeItems = routines.map((r) => ({
        id: r.id,
        title: r.title,
        time: r.time,
        days: r.days,
        enabled: r.enabled,
      }));
      syncNativeAlarms(nativeItems).catch((err) =>
        console.warn('[syncRoutineReminders] native alarm sync failed:', err),
      );
    }

    // 2. Also keep Expo Notification triggers as fallback
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => n.content.data?.kind === ROUTINE_KIND)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    const active = routines.filter((r) => r.enabled);
    if (!active.length) return true;
    if (!(await ensure())) return false;

    for (const r of active) {
      for (const time of routineTimes(r)) {
        const [hour, minute] = time.split(':').map(Number);
        const content = {
          title: `⏰ ${r.title}`,
          body: `Time for your ${r.title} routine. Tap to check in and earn gems.`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 250, 500],
          data: {
            kind: ROUTINE_KIND,
            routineId: r.id,
            route: r.route ?? '/(app)/(tabs)',
            scheduledTime: time,
          },
        };
        if (!r.days.length) {
          await Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour,
              minute,
              channelId: CHANNEL,
            },
          });
        } else {
          for (const day of r.days) {
            // Expo weekday: 1 = Sunday … 7 = Saturday; ours: 1 = Monday … 7 = Sunday.
            const weekday = (day % 7) + 1;
            await Notifications.scheduleNotificationAsync({
              content,
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday,
                hour,
                minute,
                channelId: CHANNEL,
              },
            });
          }
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
