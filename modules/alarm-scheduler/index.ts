import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { crashReporting } from '../../src/services/telemetry/crashReporting';

export interface NativeAlarmItem {
  id: string;
  title: string;
  time: string; // "HH:mm"
  days: number[]; // 1=Mon .. 7=Sun
  enabled: boolean;
}

interface AlarmSchedulerNative {
  canScheduleExactAlarms(): Promise<boolean>;
  requestExactAlarmPermission(): Promise<boolean>;
  syncAlarms(alarms: NativeAlarmItem[]): Promise<boolean>;
  cancelAlarm(id: string): Promise<boolean>;
}

const AlarmScheduler = Platform.OS === 'android'
  ? requireOptionalNativeModule<AlarmSchedulerNative>('AlarmScheduler')
  : null;

export async function canScheduleExactAlarms(): Promise<boolean> {
  if (Platform.OS !== 'android' || !AlarmScheduler) return true;
  try {
    return await AlarmScheduler.canScheduleExactAlarms();
  } catch {
    return false;
  }
}

export async function requestExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !AlarmScheduler) return true;
  try {
    return await AlarmScheduler.requestExactAlarmPermission();
  } catch {
    return false;
  }
}

export async function syncNativeAlarms(alarms: NativeAlarmItem[]): Promise<boolean> {
  if (Platform.OS !== 'android' || !AlarmScheduler) return true;
  try {
    return await AlarmScheduler.syncAlarms(alarms);
  } catch {
    crashReporting.recordError(new Error('Alarm sync failed'), 'AlarmScheduler.sync');
    return false;
  }
}

export async function cancelNativeAlarm(id: string): Promise<boolean> {
  if (Platform.OS !== 'android' || !AlarmScheduler) return true;
  try {
    return await AlarmScheduler.cancelAlarm(id);
  } catch {
    return false;
  }
}
