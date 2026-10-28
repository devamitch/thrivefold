/**
 * eyeTracker.ts — Real-time eye tracking, blink rate, distance, and gaze fatigue estimation.
 *
 * Integrates BlinkQuest's iris distance estimation, downward gaze ergonomics,
 * Eye Battery indicator, and non-nagging alert engine.
 *
 * Local-first, deterministic, zero network data transmission.
 */

import { eyeBatteryManager, type StoredBatteryState } from './eyeBattery';
import {
  estimateDistanceCm,
  estimateDownwardGazeAngle,
  evaluateErgonomics,
  type ErgonomicsMetrics,
} from './readingErgonomics';
import { EyeAlertEngine, type EyeAlert } from './eyeAlerts';

export interface EyePoint {
  x: number;
  y: number;
}

export interface EyeState {
  earLeft: number;
  earRight: number;
  earAvg: number;
  isOpen: boolean;
  blinkCount: number;
  blinksPerMin: number;
  gaze: 'center' | 'left' | 'right' | 'unknown';
  strainLevel: 'low' | 'moderate' | 'high';
  lastBlinkAt: number;
  distanceCm: number;
  gazeAngleDeg: number;
  isTooClose: boolean;
  harmonZone: 'too_close' | 'optimal' | 'far';
  fatigueScore: number;
  recommendation: string;
  batteryLevel: number;
  activeAlert: EyeAlert | null;
}

const EAR_CLOSED_THRESHOLD = 0.16;
const EAR_OPEN_THRESHOLD = 0.22;

function dist(p1: EyePoint, p2: EyePoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPoint(flat: number[], idx: number): EyePoint | null {
  const base = idx * 2;
  if (base + 1 >= flat.length) return null;
  return { x: flat[base], y: flat[base + 1] };
}

/**
 * Calculates Eye Aspect Ratio (EAR) for a 16-point eye contour.
 */
function calculateEAR(flat: number[], offset: number): number {
  const corner1 = getPoint(flat, offset + 0);
  const corner2 = getPoint(flat, offset + 8);
  const top = getPoint(flat, offset + 12);
  const bottom = getPoint(flat, offset + 4);

  if (!corner1 || !corner2 || !top || !bottom) return 0.25;

  const horiz = dist(corner1, corner2);
  if (horiz < 0.001) return 0.25;
  const vert = dist(top, bottom);
  return vert / horiz;
}

/**
 * Calculates horizontal gaze ratio: iris center relative to inner and outer eye corners.
 */
function calculateGaze(flat: number[]): 'center' | 'left' | 'right' | 'unknown' {
  const cornerOuter = getPoint(flat, 0);
  const cornerInner = getPoint(flat, 8);
  const iris = getPoint(flat, 32);

  if (!cornerOuter || !cornerInner || !iris) return 'unknown';

  const eyeWidth = Math.abs(cornerInner.x - cornerOuter.x);
  if (eyeWidth < 0.001) return 'unknown';

  const irisRel = (iris.x - Math.min(cornerOuter.x, cornerInner.x)) / eyeWidth;
  if (irisRel < 0.38) return 'right';
  if (irisRel > 0.62) return 'left';
  return 'center';
}

export class EyeTrackerSession {
  private blinkCount = 0;
  private isEyeClosed = false;
  private blinkTimestamps: number[] = [];
  private lastBlinkAt = Date.now();
  private sessionStartedAt = Date.now();
  private lastFrameAt = Date.now();
  private currentAlert: EyeAlert | null = null;
  private alertEngine: EyeAlertEngine;

  constructor() {
    this.alertEngine = new EyeAlertEngine((alert) => {
      this.currentAlert = alert;
    });
  }

  reset(): void {
    this.blinkCount = 0;
    this.isEyeClosed = false;
    this.blinkTimestamps = [];
    this.lastBlinkAt = Date.now();
    this.sessionStartedAt = Date.now();
    this.lastFrameAt = Date.now();
    this.currentAlert = null;
    this.alertEngine.reset();
  }

  dismissAlert(): void {
    this.currentAlert = null;
  }

  processFace(facePoints: number[] | undefined, now: number = Date.now()): EyeState {
    const dtMs = Math.max(16, Math.min(1000, now - this.lastFrameAt));
    this.lastFrameAt = now;

    if (!facePoints || facePoints.length < 84) {
      const blinksPerMin = this.computeBlinkRate(now);
      const battery = eyeBatteryManager.getState();
      return {
        earLeft: 0.25,
        earRight: 0.25,
        earAvg: 0.25,
        isOpen: true,
        blinkCount: this.blinkCount,
        blinksPerMin,
        gaze: 'unknown',
        strainLevel: 'low',
        lastBlinkAt: this.lastBlinkAt,
        distanceCm: 42,
        gazeAngleDeg: 18,
        isTooClose: false,
        harmonZone: 'optimal',
        fatigueScore: 90,
        recommendation: 'Position device to face to start tracking reading distance and blinks.',
        batteryLevel: battery.level,
        activeAlert: this.currentAlert,
      };
    }

    const earLeft = calculateEAR(facePoints, 0);
    const earRight = calculateEAR(facePoints, 16);
    const earAvg = (earLeft + earRight) / 2;

    // Blink hysteresis
    if (!this.isEyeClosed && earAvg < EAR_CLOSED_THRESHOLD) {
      this.isEyeClosed = true;
    } else if (this.isEyeClosed && earAvg > EAR_OPEN_THRESHOLD) {
      this.isEyeClosed = false;
      this.blinkCount += 1;
      this.lastBlinkAt = now;
      this.blinkTimestamps.push(now);
    }

    // Keep timestamps from the last 60 seconds
    const cutoff = now - 60_000;
    this.blinkTimestamps = this.blinkTimestamps.filter((t) => t >= cutoff);

    const blinksPerMin = this.computeBlinkRate(now);
    const gaze = calculateGaze(facePoints);

    // Compute Reading Distance from left iris (idx 32) & right iris (idx 37)
    const leftIris = getPoint(facePoints, 32);
    const rightIris = getPoint(facePoints, 37);
    let distanceCm = 40;
    if (leftIris && rightIris) {
      distanceCm = estimateDistanceCm(leftIris.x, leftIris.y, rightIris.x, rightIris.y);
    }

    // Downward gaze angle
    const leftTop = getPoint(facePoints, 12);
    const leftBottom = getPoint(facePoints, 4);
    let gazeAngleDeg = 18;
    if (leftTop && leftBottom && leftIris) {
      const eyeCenterY = (leftTop.y + leftBottom.y) / 2;
      const eyeHeight = Math.abs(leftTop.y - leftBottom.y);
      gazeAngleDeg = estimateDownwardGazeAngle(eyeCenterY, leftIris.y, eyeHeight);
    }

    // Ergonomics analysis
    const ergo = evaluateErgonomics(distanceCm, gazeAngleDeg, blinksPerMin);

    // Strain level
    let strainLevel: 'low' | 'moderate' | 'high' = 'low';
    if (this.blinkTimestamps.length > 5 && blinksPerMin < 9) {
      strainLevel = 'high';
    } else if (this.blinkTimestamps.length > 5 && blinksPerMin < 13) {
      strainLevel = 'moderate';
    }

    // Eye Battery tick
    const batteryState = eyeBatteryManager.tickScan({
      dtMs,
      blinkRatePerMin: blinksPerMin,
      distanceCm,
      isClosed: this.isEyeClosed,
    });

    // Alert engine evaluation
    this.alertEngine.evaluate({
      now,
      tracked: true,
      distanceCm,
      blinksPerMin,
      continuousMs: now - this.sessionStartedAt,
      batteryLevel: batteryState.level,
    });

    return {
      earLeft,
      earRight,
      earAvg,
      isOpen: !this.isEyeClosed,
      blinkCount: this.blinkCount,
      blinksPerMin,
      gaze,
      strainLevel,
      lastBlinkAt: this.lastBlinkAt,
      distanceCm,
      gazeAngleDeg,
      isTooClose: ergo.isTooClose,
      harmonZone: ergo.harmonZone,
      fatigueScore: ergo.fatigueScore,
      recommendation: ergo.recommendation,
      batteryLevel: batteryState.level,
      activeAlert: this.currentAlert,
    };
  }

  private computeBlinkRate(now: number): number {
    if (this.blinkTimestamps.length < 2) return this.blinkTimestamps.length;
    const windowMs = Math.max(10_000, now - this.blinkTimestamps[0]);
    return Math.round(this.blinkTimestamps.length / (windowMs / 60_000));
  }
}
