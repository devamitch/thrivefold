import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';

import { StepCounter, type PhoneStepDay } from '../../../modules/step-counter';
import { phoneStepReadings } from '../../domain/interop/readings';
import { useRootStore } from '../../stores/useRootStore';

/**
 * Phone step counting (Android hardware step counter).
 *
 * - `unsupported`: no sensor or not Android.
 * - `off`: supported, but the person has not allowed activity recognition yet.
 * - `on`: counting; a background job samples about every 15 minutes, and the screen gets live
 *   updates while open.
 *
 * Readings go into the one readings store as `phone_sensor` steps; Health Connect steps for the
 * same day are never added to them (see `stepsByDate`).
 */
export type PhoneStepStatus = 'unsupported' | 'off' | 'on';

const PERMISSION = 'android.permission.ACTIVITY_RECOGNITION' as const;

export function phoneStepStatus(): PhoneStepStatus {
  if (!StepCounter || !StepCounter.isAvailable()) return 'unsupported';
  return StepCounter.hasPermission() ? 'on' : 'off';
}

function importDays(days: PhoneStepDay[]) {
  if (days.length > 0) useRootStore.getState().importReadings(phoneStepReadings(days));
}

/** Reads the counter now and copies every stored day into the readings store. */
export async function syncPhoneSteps(): Promise<void> {
  if (phoneStepStatus() !== 'on' || !StepCounter) return;
  await StepCounter.sampleNow();
  StepCounter.scheduleBackground();
  importDays(StepCounter.getDays());
}

/** Asks for activity recognition in context; returns the resulting status. */
export async function enablePhoneSteps(): Promise<PhoneStepStatus> {
  if (phoneStepStatus() === 'unsupported') return 'unsupported';
  if (Platform.OS === 'android' && Number(Platform.Version) >= 29) {
    const result = await PermissionsAndroid.request(PERMISSION, {
      title: 'Count your steps',
      message:
        'Thrivefold reads your phone’s built-in step counter to show daily steps. ' +
        'The count stays on this phone. You can turn it off any time in Connected sources.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    });
    if (result !== PermissionsAndroid.RESULTS.GRANTED) return phoneStepStatus();
  }
  await syncPhoneSteps();
  return phoneStepStatus();
}

/** Stops counting and deletes the phone's step history (device ledger and imported readings). */
export function disablePhoneSteps(): void {
  StepCounter?.disableAndErase();
  useRootStore.getState().removeReadings('phone_sensor');
}

const LIVE_THROTTLE_MS = 2500;

/**
 * Keeps phone steps current while the calling screen is mounted: syncs on mount and whenever
 * the app returns to the foreground, and streams live counts (throttled) while open.
 */
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Today's phone-measured steps (with hourly buckets), straight from the device ledger. */
export function readTodaySteps(): PhoneStepDay | null {
  if (!StepCounter || phoneStepStatus() !== 'on') return null;
  try {
    return StepCounter.getDays().find((d) => d.date === todayKey()) ?? null;
  } catch {
    return null;
  }
}

export function usePhoneSteps() {
  const [status, setStatus] = useState<PhoneStepStatus>(() => phoneStepStatus());
  // Live view for the screen: refreshed on sync and on sensor events (at most once a second).
  const [today, setToday] = useState<PhoneStepDay | null>(() => readTodaySteps());
  const lastLive = useRef(0);
  const lastPush = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    const next = phoneStepStatus();
    setStatus(next);
    if (next === 'on') void syncPhoneSteps().then(() => setToday(readTodaySteps()));
    return next;
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    if (status !== 'on' || !StepCounter) return;
    const counter = StepCounter;
    const listener = counter.addListener('onSteps', (day) => {
      const now = Date.now();
      if (now - lastLive.current >= 1000) {
        lastLive.current = now;
        setToday(readTodaySteps() ?? day);
      }
      const push = () => {
        lastPush.current = Date.now();
        pending.current = null;
        importDays([day]);
      };
      if (now - lastPush.current >= LIVE_THROTTLE_MS) push();
      else if (!pending.current) {
        pending.current = setTimeout(push, LIVE_THROTTLE_MS - (now - lastPush.current));
      }
    });
    counter.startLive();
    return () => {
      listener.remove();
      counter.stopLive();
      if (pending.current) clearTimeout(pending.current);
      pending.current = null;
    };
  }, [status]);

  const enable = useCallback(async () => {
    const next = await enablePhoneSteps();
    setStatus(next);
    setToday(readTodaySteps());
    return next;
  }, []);

  return { status, enable, today };
}
