/**
 * Routine nudges, scheduled on the phone with daily or weekly triggers. Each sync replaces the
 * previous routine schedule (nothing duplicated). Tapping a nudge opens its screen and counts as
 * keeping the routine (a small gem reward, once per routine per day).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { routineTimes, type Routine } from '../../domain/routines';

const CHANNEL = 'routines';
export const ROUTINE_KIND = 'routine';

async function ensure(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Routines',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  return current.granted || (await Notifications.requestPermissionsAsync()).granted;
}

/** Returns false when notification permission was refused. */
export async function syncRoutineReminders(routines: Routine[]): Promise<boolean> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.filter((n) => n.content.data?.kind === ROUTINE_KIND).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
    const active = routines.filter((r) => r.enabled);
    if (!active.length) return true;
    if (!(await ensure())) return false;
    for (const r of active) {
      for (const time of routineTimes(r)) {
        const [hour, minute] = time.split(':').map(Number);
        const content = {
          title: r.title,
          body: 'Tap to open Thrivefold.',
          data: { kind: ROUTINE_KIND, routineId: r.id, route: r.route ?? '/(app)/(tabs)' },
        };
        if (!r.days.length) {
          await Notifications.scheduleNotificationAsync({
            content,
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
          });
        } else {
          for (const day of r.days) {
            // Expo weekday: 1 = Sunday … 7 = Saturday; ours: 1 = Monday … 7 = Sunday.
            const weekday = (day % 7) + 1;
            await Notifications.scheduleNotificationAsync({
              content,
              trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: CHANNEL },
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
