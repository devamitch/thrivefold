/**
 * eyeTracker.ts — Real-time eye tracking, blink rate, and gaze fatigue estimation.
 *
 * Uses MediaPipe Face Landmarker indices from PoseCameraView.
 * Local-first, deterministic, zero network data transmission.
 */

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
}

// Face landmark offsets relative to FACE_GROUPS:
// Left eye: 16 points (indices 0..31 in flat array)
// Right eye: 16 points (indices 32..63 in flat array)
// Irises: 10 points (indices 64..83 in flat array)

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
 * Point 0: outer corner, Point 8: inner corner.
 * Upper eyelid top: Point 12.
 * Lower eyelid bottom: Point 4.
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
  // Left eye corners: 0 (outer) and 8 (inner). Left iris center: 32.
  const cornerOuter = getPoint(flat, 0);
  const cornerInner = getPoint(flat, 8);
  const iris = getPoint(flat, 32);

  if (!cornerOuter || !cornerInner || !iris) return 'unknown';

  const eyeWidth = Math.abs(cornerInner.x - cornerOuter.x);
  if (eyeWidth < 0.001) return 'unknown';

  // Front camera is mirrored horizontally
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

  reset(): void {
    this.blinkCount = 0;
    this.isEyeClosed = false;
    this.blinkTimestamps = [];
    this.lastBlinkAt = Date.now();
  }

  processFace(facePoints: number[] | undefined, now: number = Date.now()): EyeState {
    if (!facePoints || facePoints.length < 84) {
      return {
        earLeft: 0.25,
        earRight: 0.25,
        earAvg: 0.25,
        isOpen: true,
        blinkCount: this.blinkCount,
        blinksPerMin: this.computeBlinkRate(now),
        gaze: 'unknown',
        strainLevel: 'low',
        lastBlinkAt: this.lastBlinkAt,
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

    // Strain: <10 blinks/min while awake indicates screen stare fatigue
    let strainLevel: 'low' | 'moderate' | 'high' = 'low';
    if (this.blinkTimestamps.length > 5 && blinksPerMin < 9) {
      strainLevel = 'high';
    } else if (this.blinkTimestamps.length > 5 && blinksPerMin < 13) {
      strainLevel = 'moderate';
    }

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
    };
  }

  private computeBlinkRate(now: number): number {
    if (this.blinkTimestamps.length < 2) return this.blinkTimestamps.length;
    const windowMs = Math.max(10_000, now - this.blinkTimestamps[0]);
    return Math.round((this.blinkTimestamps.length / (windowMs / 60_000)));
  }
}
