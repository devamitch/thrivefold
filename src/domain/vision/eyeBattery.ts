/**
 * eyeBattery.ts — Daily Eye Battery indicator adapted from BlinkQuest.
 *
 * Local-first, deterministic heuristic measuring daily ocular energy.
 * Starts each local day at 100% and changes strictly from measured observation:
 *   - Drains while scanning screen: base focus load, amplified by low blink rate,
 *     short viewing distance, or sustained eye closure.
 *   - Recharges from completed eye breaks (20-20-20, blink bloom, near-far)
 *     and time spent away from screen (idle recharge).
 */

import { syncKeyValueStorage } from '../../stores/persistStorage';

export const BATTERY_VERSION = 'battery-1.0.0';

/** Drain per tracked minute in battery points */
export const DRAIN = {
  base: 0.25,
  lowBlink: 0.35, // < 8 blinks/min
  reducedBlink: 0.15, // 8–12 blinks/min
  tooClose: 0.3, // < 25 cm
  close: 0.12, // 25–32 cm
  heavyClosure: 0.2, // prolonged closures > 15%
} as const;

/** Recharge points per completed eye exercise habit */
export const RECHARGE = {
  relax: 8,
  focus: 6,
  blink: 6,
  movement: 4,
} as const;

/** Trickle recharge per minute away from active screen tracking (2 points/hour max) */
export const IDLE_RECHARGE_PER_MIN = 2 / 60;

export interface BatteryInputs {
  dtMs: number;
  blinkRatePerMin: number | null;
  distanceCm: number | null;
  isClosed: boolean;
}

export interface BatteryDriver {
  id: 'base' | 'lowBlink' | 'reducedBlink' | 'tooClose' | 'close' | 'heavyClosure';
  label: string;
}

export function drainRate(inputs: Omit<BatteryInputs, 'dtMs'>): { perMin: number; drivers: BatteryDriver[] } {
  const drivers: BatteryDriver[] = [{ id: 'base', label: 'Screen focus' }];
  let perMin = DRAIN.base;

  if (inputs.blinkRatePerMin !== null) {
    if (inputs.blinkRatePerMin < 8) {
      perMin += DRAIN.lowBlink;
      drivers.push({ id: 'lowBlink', label: 'Infrequent blinking' });
    } else if (inputs.blinkRatePerMin < 12) {
      perMin += DRAIN.reducedBlink;
      drivers.push({ id: 'reducedBlink', label: 'Reduced blink rate' });
    }
  }

  if (inputs.distanceCm !== null) {
    if (inputs.distanceCm < 25) {
      perMin += DRAIN.tooClose;
      drivers.push({ id: 'tooClose', label: 'Screen very close (<25cm)' });
    } else if (inputs.distanceCm < 32) {
      perMin += DRAIN.close;
      drivers.push({ id: 'close', label: 'Screen close (<32cm)' });
    }
  }

  if (inputs.isClosed) {
    perMin += DRAIN.heavyClosure;
    drivers.push({ id: 'heavyClosure', label: 'Prolonged eye closure' });
  }

  return { perMin, drivers };
}

const STORAGE_KEY = 'thrivefold_eye_battery_state';

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 10) / 10));

export interface StoredBatteryState {
  day: string;
  level: number;
  lastScanAt: number | null;
  lastIdleAt: number;
  drivers: BatteryDriver[];
}

export class EyeBatteryManager {
  private state: StoredBatteryState;

  constructor() {
    this.state = this.load();
    this.refresh();
  }

  getState(): StoredBatteryState {
    return { ...this.state };
  }

  private load(): StoredBatteryState {
    try {
      const raw = syncKeyValueStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredBatteryState;
        if (parsed.day === dayKey(Date.now())) {
          return parsed;
        }
      }
    } catch {
      // Fallback to fresh state
    }
    return {
      day: dayKey(Date.now()),
      level: 100,
      lastScanAt: null,
      lastIdleAt: Date.now(),
      drivers: [],
    };
  }

  private save(): void {
    try {
      syncKeyValueStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore MMKV error
    }
  }

  refresh(): void {
    const now = Date.now();
    const today = dayKey(now);
    if (this.state.day !== today) {
      this.state = {
        day: today,
        level: 100,
        lastScanAt: null,
        lastIdleAt: now,
        drivers: [],
      };
      this.save();
      return;
    }

    const idleMinutes = (now - this.state.lastIdleAt) / 60_000;
    if (idleMinutes >= 1) {
      this.state.level = clamp(this.state.level + idleMinutes * IDLE_RECHARGE_PER_MIN);
      this.state.lastIdleAt = now;
      this.save();
    }
  }

  tickScan(inputs: BatteryInputs): StoredBatteryState {
    this.refresh();
    const { perMin, drivers } = drainRate(inputs);
    const drainAmount = (perMin * inputs.dtMs) / 60_000;
    const now = Date.now();

    this.state.level = clamp(this.state.level - drainAmount);
    this.state.lastScanAt = now;
    this.state.lastIdleAt = now;
    this.state.drivers = drivers;
    this.save();
    return { ...this.state };
  }

  recharge(habit: keyof typeof RECHARGE): StoredBatteryState {
    this.refresh();
    this.state.level = clamp(this.state.level + RECHARGE[habit]);
    this.save();
    return { ...this.state };
  }
}

export const eyeBatteryManager = new EyeBatteryManager();
