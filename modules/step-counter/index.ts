import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

/** One local day of phone-measured steps. */
export interface PhoneStepDay {
  date: string; // YYYY-MM-DD, local
  steps: number;
  /** Steps split across a long sampling gap by time share: an estimate, not a measurement. */
  estimated: number;
  /** When tracking began, if it began on this day (ms since epoch); earlier steps are unknown. */
  since: number | null;
  /** 24 entries: steps in each local hour (absent on data saved before hourly tracking). */
  hours?: number[];
}

interface StepCounterNative {
  isAvailable(): boolean;
  hasPermission(): boolean;
  getDays(): PhoneStepDay[];
  lastSampleAt(): number | null;
  sampleNow(): Promise<PhoneStepDay | null>;
  startLive(): boolean;
  stopLive(): void;
  scheduleBackground(): boolean;
  disableAndErase(): void;
  addListener(event: 'onSteps', cb: (day: PhoneStepDay) => void): { remove(): void };
}

const native =
  Platform.OS === 'android' ? requireOptionalNativeModule<StepCounterNative>('StepCounter') : null;

/** The hardware step counter (Android). Null where unsupported (iOS, web, no sensor module). */
export const StepCounter = native;
