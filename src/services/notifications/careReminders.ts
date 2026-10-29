/**
 * Medication and doctor follow-up reminders, scheduled on the phone. Notifications are private on
 * the lock screen (the medicine or doctor name only shows when unlocked). Re-synced whenever the
 * lists change; each sync replaces the previous schedule, so nothing is duplicated.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { FollowUp, MedicationEntry } from '../../stores/slices/healthSlice';

const CHANNEL = 'care-reminders';
const KIND = 'care-reminder';

async function ensure(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Medicines and appointments',
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  return current.granted || (await Notifications.requestPermissionsAsync()).granted;
}

async function clear() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => n.content.data?.kind === KIND).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Returns false when notification permission was refused. */
export async function syncCareReminders(meds: MedicationEntry[], medsOn: boolean, followUps: FollowUp[]): Promise<boolean> {
  try {
    await clear();
    if (!(medsOn && meds.length) && !followUps.length) return true;
    if (!(await ensure())) return false;
    if (medsOn) {
      for (const m of meds) {
        const [hour, minute] = m.time.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Medicine reminder', body: `${m.name}${m.dose ? ` · ${m.dose}` : ''}`, data: { kind: KIND, route: '/(app)/health/medications' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
        });
      }
    }
    const now = Date.now();
    for (const f of followUps) {
      const [y, mo, d] = f.date.split('-').map(Number);
      const [h, mi] = (f.time ?? '09:00').split(':').map(Number);
      const at = new Date(y, mo - 1, d, h, mi).getTime();
      const dayBefore = new Date(y, mo - 1, d - 1, 18, 0).getTime();
      const morning = new Date(y, mo - 1, d, Math.min(h, 8), 0).getTime();
      for (const [when, title] of [
        [dayBefore, 'Appointment tomorrow'],
        [morning, 'Appointment today'],
      ] as const) {
        if (when > now && when < at + 1) {
          await Notifications.scheduleNotificationAsync({
            content: { title, body: `${f.with}${f.time ? ` at ${f.time}` : ''}${f.note ? ` · ${f.note}` : ''}`, data: { kind: KIND, route: '/(app)/health/medications' } },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(when), channelId: CHANNEL },
          });
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
