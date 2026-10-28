/**
 * readingErgonomics.ts — Screen distance & ocular ergonomic metrics.
 *
 * Modeled after BlinkQuest's iris-calibrated Harmon distance & gaze angle engine.
 * Computes:
 * 1. Screen-to-face distance in centimeters (iris diameter / interpupillary distance).
 * 2. Downward gaze inclination angle (15°–25° optimal reading angle to reduce tear evaporation).
 * 3. Harmon reading distance alignment.
 * 4. Accommodation fatigue score (0–100).
 */

export interface ErgonomicsMetrics {
  distanceCm: number;
  gazeAngleDeg: number;
  isTooClose: boolean;
  harmonZone: 'too_close' | 'optimal' | 'far';
  fatigueScore: number;
  recommendation: string;
}

// Harmon distance: elbow-to-knuckle distance (~35-45 cm for adults)
export const HARMON_MIN_CM = 32;
export const HARMON_MAX_CM = 48;
export const CRITICAL_TOO_CLOSE_CM = 28;

/**
 * Calculates estimated screen distance from normalized face landmarks.
 * In a standard mobile front camera (~68° horizontal FOV):
 * Average adult interpupillary distance (IPD) is ~63 mm.
 * When the head is 40 cm away, normalized IPD is approximately 0.16.
 */
export function estimateDistanceCm(
  leftPupilX: number,
  leftPupilY: number,
  rightPupilX: number,
  rightPupilY: number,
): number {
  const dx = rightPupilX - leftPupilX;
  const dy = rightPupilY - leftPupilY;
  const normalizedDistance = Math.sqrt(dx * dx + dy * dy);

  if (normalizedDistance <= 0.01) return 40; // Fallback neutral

  // Optical calibration constant: distance = constant / normalized_ipd
  // At 40cm -> normalized distance ~ 0.16 => constant ~ 6.4
  const estimated = 6.4 / normalizedDistance;

  // Clamp within reasonable real-world bounds (15 cm to 90 cm)
  return Math.round(Math.max(15, Math.min(90, estimated)) * 10) / 10;
}

/**
 * Calculates downward gaze inclination angle in degrees.
 * 15° to 25° downward inclination is ergonomic for desktop & mobile reading
 * as it minimizes exposed ocular surface area and prevents dry eye.
 */
export function estimateDownwardGazeAngle(
  eyeCenterY: number,
  irisCenterY: number,
  eyeHeight: number,
): number {
  if (eyeHeight <= 0.001) return 18; // Default ergonomic angle

  // Relative vertical shift of iris within eye socket
  const verticalShift = (irisCenterY - eyeCenterY) / eyeHeight;

  // Map vertical shift [-0.5, 0.5] to degrees [-10°, 35°]
  const angle = 18 + verticalShift * 25;
  return Math.round(Math.max(-5, Math.min(40, angle)) * 10) / 10;
}

/**
 * Evaluates comprehensive reading ergonomics given distance, gaze angle, and blink rate.
 */
export function evaluateErgonomics(
  distanceCm: number,
  gazeAngleDeg: number,
  blinksPerMin: number,
): ErgonomicsMetrics {
  const isTooClose = distanceCm < CRITICAL_TOO_CLOSE_CM;

  let harmonZone: 'too_close' | 'optimal' | 'far';
  if (distanceCm < HARMON_MIN_CM) {
    harmonZone = 'too_close';
  } else if (distanceCm <= HARMON_MAX_CM) {
    harmonZone = 'optimal';
  } else {
    harmonZone = 'far';
  }

  // Fatigue scoring heuristic (100 = fresh & relaxed, 0 = severe strain)
  let score = 100;

  // Deduct for close screen distance
  if (distanceCm < 25) {
    score -= 35;
  } else if (distanceCm < 32) {
    score -= 18;
  }

  // Deduct for low blink rate
  if (blinksPerMin < 8) {
    score -= 30;
  } else if (blinksPerMin < 12) {
    score -= 15;
  }

  // Deduct for extreme gaze angle
  if (gazeAngleDeg < 5 || gazeAngleDeg > 35) {
    score -= 12;
  }

  const fatigueScore = Math.max(10, Math.min(100, Math.round(score)));

  let recommendation = 'Optimal reading posture and screen distance maintained.';
  if (isTooClose) {
    recommendation = `Screen is at ~${distanceCm.toFixed(0)}cm. Ease back to Harmon distance (~35–45cm) to prevent ciliary spasm.`;
  } else if (blinksPerMin < 8) {
    recommendation = 'Blink rate is low. Take 3 deliberate, slow blinks to re-lubricate tear film.';
  } else if (fatigueScore < 60) {
    recommendation = 'Ocular fatigue detected. Try a 20-20-20 focus pause or Blink Bloom routine.';
  }

  return {
    distanceCm,
    gazeAngleDeg,
    isTooClose,
    harmonZone,
    fatigueScore,
    recommendation,
  };
}
