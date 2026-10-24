/**
 * Android Health Connect: the system hub where Samsung Health, Google Fit, Fitbit, Garmin and
 * other apps share data. Thrivefold asks for each data type separately, reads only after the
 * person grants it, keeps the results on this device, and writes back only finished workouts.
 */
import { Platform } from 'react-native';
import {
  ExerciseType,
  SdkAvailabilityStatus,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  insertRecords,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  revokeAllPermissions,
} from 'react-native-health-connect';

import {
  dailyExercise,
  dailyHeartRate,
  dailySteps,
  latestWeights,
  nightlySleep,
  type DeviceReading,
} from '../../domain/interop/readings';

export type HcDataType = 'Steps' | 'SleepSession' | 'HeartRate' | 'Weight' | 'ExerciseSession';

export const HC_DATA_TYPES: { type: HcDataType; label: string; why: string }[] = [
  { type: 'Steps', label: 'Steps', why: 'Daily step totals next to your check-ins.' },
  { type: 'SleepSession', label: 'Sleep', why: 'Sleep length, compared with how you feel.' },
  { type: 'HeartRate', label: 'Heart rate', why: 'Daily average, lowest and highest.' },
  { type: 'Weight', label: 'Weight', why: 'Only if you track it elsewhere.' },
  { type: 'ExerciseSession', label: 'Workouts', why: 'Workouts from other apps count toward active minutes.' },
];

export type HcStatus = 'available' | 'update_required' | 'unavailable';

export async function healthConnectStatus(): Promise<HcStatus> {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) return 'available';
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'update_required';
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

/** Asks the system for read access to the chosen types (plus writing workouts). Returns granted read types. */
export async function connectHealthConnect(types: HcDataType[], allowWorkoutWrite: boolean): Promise<HcDataType[]> {
  await initialize();
  const granted = await requestPermission([
    ...types.map((recordType) => ({ accessType: 'read' as const, recordType })),
    ...(allowWorkoutWrite ? [{ accessType: 'write' as const, recordType: 'ExerciseSession' as const }] : []),
  ]);
  return granted
    .filter((p): p is { accessType: 'read'; recordType: HcDataType } => 'accessType' in p && p.accessType === 'read')
    .map((p) => p.recordType)
    .filter((t) => types.includes(t));
}

export async function grantedReadTypes(): Promise<HcDataType[]> {
  try {
    await initialize();
    const granted = await getGrantedPermissions();
    return granted
      .filter((p): p is { accessType: 'read'; recordType: HcDataType } => 'accessType' in p && p.accessType === 'read')
      .map((p) => p.recordType);
  } catch {
    return [];
  }
}

/** Reads the last `days` days for each granted type and returns daily readings. */
export async function syncHealthConnect(types: HcDataType[], days = 30): Promise<DeviceReading[]> {
  await initialize();
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - days * 86400000).toISOString();
  const timeRangeFilter = { operator: 'between' as const, startTime, endTime };
  const out: DeviceReading[] = [];

  if (types.includes('Steps')) {
    const { records } = await readRecords('Steps', { timeRangeFilter });
    out.push(...dailySteps(records.map((r) => ({ startTime: r.startTime, count: r.count }))));
  }
  if (types.includes('SleepSession')) {
    const { records } = await readRecords('SleepSession', { timeRangeFilter });
    out.push(...nightlySleep(records.map((r) => ({ startTime: r.startTime, endTime: r.endTime }))));
  }
  if (types.includes('HeartRate')) {
    const { records } = await readRecords('HeartRate', { timeRangeFilter });
    out.push(...dailyHeartRate(records.flatMap((r) => r.samples.map((s) => ({ time: s.time, beatsPerMinute: s.beatsPerMinute })))));
  }
  if (types.includes('Weight')) {
    const { records } = await readRecords('Weight', { timeRangeFilter });
    out.push(...latestWeights(records.map((r) => ({ time: r.time, weight: { inKilograms: r.weight.inKilograms } }))));
  }
  if (types.includes('ExerciseSession')) {
    const { records } = await readRecords('ExerciseSession', { timeRangeFilter });
    out.push(...dailyExercise(records.map((r) => ({ startTime: r.startTime, endTime: r.endTime }))));
  }
  return out;
}

const EXERCISE_TYPE_BY_SETTING: Record<string, number> = {
  home: ExerciseType.STRENGTH_TRAINING,
  gym: ExerciseType.STRENGTH_TRAINING,
  cardio: ExerciseType.OTHER_WORKOUT,
  hiit: ExerciseType.HIGH_INTENSITY_INTERVAL_TRAINING,
  yoga: ExerciseType.YOGA,
  pilates: ExerciseType.PILATES,
  balance: ExerciseType.OTHER_WORKOUT,
  seated: ExerciseType.OTHER_WORKOUT,
  desk: ExerciseType.STRETCHING,
  recovery: ExerciseType.STRETCHING,
};

/** Writes one finished workout to Health Connect so other apps see it. */
export async function writeWorkoutToHealthConnect(w: { title: string; setting: string; startedAt: string; finishedAt: string }) {
  await initialize();
  return insertRecords([
    {
      recordType: 'ExerciseSession',
      startTime: w.startedAt,
      endTime: w.finishedAt,
      exerciseType: EXERCISE_TYPE_BY_SETTING[w.setting] ?? ExerciseType.OTHER_WORKOUT,
      title: w.title,
    },
  ]);
}

export async function disconnectHealthConnect() {
  try {
    await initialize();
    await revokeAllPermissions();
  } catch {
    // Already disconnected or Health Connect missing; the local record is cleared either way.
  }
}

export const openHealthConnect = () => {
  try {
    openHealthConnectSettings();
  } catch {
    // Health Connect is not installed.
  }
};
