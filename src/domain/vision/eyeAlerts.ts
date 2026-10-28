/**
 * eyeAlerts.ts — Intelligent eye health nudges and strain detector.
 *
 * Modeled after BlinkQuest's EyeAlertEngine.
 * Non-nagging, cooldown-governed alerts triggered only by real measured signals:
 *   - too_close: screen held <28 cm for 15+ seconds
 *   - low_blink: measured blink rate <8/min for 25+ seconds
 *   - eyes_closing: sustained eye closure >1s twice within 60s
 *   - break_due: 20 minutes of continuous screen focus (20-20-20 habit)
 *   - battery_low: Eye Battery dropped below 20%
 */

export type EyeAlertId = 'too_close' | 'low_blink' | 'eyes_closing' | 'break_due' | 'battery_low';

export interface EyeAlert {
  id: EyeAlertId;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  at: number;
}

const ALERT_COPY: Record<EyeAlertId, Omit<EyeAlert, 'id' | 'at'>> = {
  too_close: {
    title: 'Screen Too Close',
    body: 'Ease your device back to elbow distance (~35–45 cm) to reduce focusing strain.',
    severity: 'warning',
  },
  low_blink: {
    title: 'Infrequent Blinking',
    body: 'Staring dries the ocular surface. Try 3 slow, complete blinks.',
    severity: 'warning',
  },
  eyes_closing: {
    title: 'Ocular Fatigue Detected',
    body: 'Your eyes are closing longer than normal. Consider a short rest or eye routine.',
    severity: 'critical',
  },
  break_due: {
    title: 'Time for 20-20-20 Break',
    body: 'Look at an object 20 feet (6 meters) away for 20 seconds to relax ciliary muscles.',
    severity: 'info',
  },
  battery_low: {
    title: 'Eye Battery Low',
    body: 'Ocular reserves under 20%. Try a Near/Far break or close your eyes for 30s.',
    severity: 'critical',
  },
};

const COOLDOWNS_MS: Record<EyeAlertId, number> = {
  too_close: 3 * 60_000,
  low_blink: 4 * 60_000,
  eyes_closing: 5 * 60_000,
  break_due: 20 * 60_000,
  battery_low: 30 * 60_000,
};

export interface AlertInputs {
  now: number;
  tracked: boolean;
  distanceCm: number | null;
  blinksPerMin: number | null;
  continuousMs: number;
  batteryLevel: number;
}

export class EyeAlertEngine {
  private closeSince: number | null = null;
  private lowBlinkSince: number | null = null;
  private longClosures: number[] = [];
  private lastFired: Partial<Record<EyeAlertId, number>> = {};

  constructor(private onAlert: (alert: EyeAlert) => void) {}

  onLongClosure(now: number): void {
    this.longClosures = this.longClosures.filter((t) => now - t < 60_000);
    this.longClosures.push(now);
    if (this.longClosures.length >= 2) {
      this.fire('eyes_closing', now);
    }
  }

  evaluate(inputs: AlertInputs): void {
    // 1. Distance check
    if (inputs.tracked && inputs.distanceCm !== null && inputs.distanceCm < 28) {
      this.closeSince ??= inputs.now;
      if (inputs.now - this.closeSince >= 15_000) {
        this.fire('too_close', inputs.now);
      }
    } else {
      this.closeSince = null;
    }

    // 2. Blink rate check
    if (inputs.tracked && inputs.blinksPerMin !== null && inputs.blinksPerMin < 8) {
      this.lowBlinkSince ??= inputs.now;
      if (inputs.now - this.lowBlinkSince >= 25_000) {
        this.fire('low_blink', inputs.now);
      }
    } else {
      this.lowBlinkSince = null;
    }

    // 3. Continuous break due (20-20-20)
    if (inputs.continuousMs >= 20 * 60_000) {
      this.fire('break_due', inputs.now);
    }

    // 4. Battery low
    if (inputs.batteryLevel < 20) {
      this.fire('battery_low', inputs.now);
    }
  }

  private fire(id: EyeAlertId, now: number): void {
    const last = this.lastFired[id];
    if (last !== undefined && now - last < COOLDOWNS_MS[id]) {
      return;
    }
    this.lastFired[id] = now;
    this.onAlert({
      id,
      ...ALERT_COPY[id],
      at: now,
    });
  }

  reset(): void {
    this.closeSince = null;
    this.lowBlinkSince = null;
    this.longClosures = [];
    this.lastFired = {};
  }
}
