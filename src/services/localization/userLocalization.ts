/**
 * On-device user localization: reads the device's own settings only.
 * Handles device locale, country, timezone, and calendar day alignment (e.g. Asia/Kolkata UTC+5:30)
 * without sending any tracking data or coordinates to third parties.
 */
import * as Localization from 'expo-localization';

export interface UserLocalizationInfo {
  locale: string;
  languageCode: string;
  regionCode: string | null;
  timezone: string;
  currency: string | null;
  measurementSystem: 'metric' | 'us' | 'uk';
  is24Hour: boolean;
}

export function getDeviceLocalization(): UserLocalizationInfo {
  try {
    const locales = Localization.getLocales();
    const primary = locales && locales.length > 0 ? locales[0] : null;
    const calendars = Localization.getCalendars();
    const primaryCalendar = calendars && calendars.length > 0 ? calendars[0] : null;

    return {
      locale: primary?.languageTag ?? 'en-US',
      languageCode: primary?.languageCode ?? 'en',
      regionCode: primary?.regionCode ?? null,
      timezone: primaryCalendar?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
      currency: primary?.currencyCode ?? 'USD',
      measurementSystem: (primary?.measurementSystem as 'metric' | 'us' | 'uk') ?? 'metric',
      is24Hour: primaryCalendar?.uses24hourClock ?? false,
    };
  } catch {
    return {
      locale: 'en-US',
      languageCode: 'en',
      regionCode: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      currency: 'USD',
      measurementSystem: 'metric',
      is24Hour: false,
    };
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 * Solves the UTC-midnight rollover issue (e.g. Asia/Kolkata before 05:30 AM).
 */
export function getLocalDayKey(date: Date = new Date(), timeZone?: string): string {
  const tz = timeZone || getDeviceLocalization().timezone;
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Coarse solar & circadian estimate based on timezone offset without GPS tracking.
 */
export function getCircadianWindow(): { phase: 'morning' | 'afternoon' | 'evening' | 'night'; greeting: string } {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) {
    return { phase: 'morning', greeting: 'Good morning' };
  } else if (hour >= 12 && hour < 17) {
    return { phase: 'afternoon', greeting: 'Good afternoon' };
  } else if (hour >= 17 && hour < 22) {
    return { phase: 'evening', greeting: 'Good evening' };
  } else {
    return { phase: 'night', greeting: 'Restful night' };
  }
}
