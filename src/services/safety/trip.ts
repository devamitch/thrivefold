/**
 * Trip check-ins: the person starts a trip with a destination and expected arrival; at that time
 * the phone asks "Did you arrive?". Nothing is sent automatically: messages to trusted contacts
 * open in the person's SMS app for them to send, with an optional map link to where they are.
 */
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import type { EmergencyContact } from '../../domain/account/koshProfile';
import { useRootStore } from '../../stores/useRootStore';

const CHANNEL = 'trip-checkins';

export async function startTrip(destination: string, minutes: number, contactIds: string[]): Promise<boolean> {
  const dueAt = Date.now() + minutes * 60_000;
  let notificationId: string | null = null;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Trip check-ins',
        importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      });
    }
    const perm = await Notifications.getPermissionsAsync();
    const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (granted) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: { title: 'Did you arrive safely?', body: `Your trip to ${destination} was due now. Tap to check in.`, data: { route: '/(app)/safety/trip' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(dueAt), channelId: CHANNEL },
      });
    }
  } catch {
    notificationId = null;
  }
  useRootStore.getState().setTrip({ destination, startedAt: Date.now(), dueAt, contactIds, notificationId });
  return notificationId !== null;
}

export async function endTrip(): Promise<void> {
  const trip = useRootStore.getState().trip;
  if (trip?.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(trip.notificationId);
    } catch {
      // already shown
    }
  }
  useRootStore.getState().setTrip(null);
}

/** A Google Maps link to where the phone is now, or null if location is refused or unavailable. */
export async function currentMapLink(): Promise<string | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return `https://maps.google.com/?q=${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
  } catch {
    return null;
  }
}

/** Opens the SMS app with a prepared message to the chosen contacts; the person presses Send. */
export async function messageContacts(contacts: EmergencyContact[], text: string): Promise<boolean> {
  const to = contacts.map((c) => c.phone.replace(/[^0-9+]/g, '')).join(',');
  if (!to) return false;
  const url = `sms:${to}?body=${encodeURIComponent(text)}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
