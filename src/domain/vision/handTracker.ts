/**
 * handTracker.ts — Real-time hand landmark exercises, grip counting, and wrist mobility.
 *
 * Uses MediaPipe Hand Landmarker (21 landmarks) from PoseCameraView.
 * Local-first, deterministic rep counter with hysteresis.
 */

export interface HandPoint {
  x: number;
  y: number;
}

export type HandPoseKind = 'open' | 'closed' | 'pointing' | 'unknown';

export interface HandState {
  kind: HandPoseKind;
  extendedFingers: number;
  gripReps: number;
  wristAngleDeg: number;
  wristMobilityScore: number;
  isMoving: boolean;
  confidence: number;
}

function dist(p1: HandPoint, p2: HandPoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPoint(flat: number[], idx: number): HandPoint | null {
  const base = idx * 2;
  if (base + 1 >= flat.length) return null;
  return { x: flat[base], y: flat[base + 1] };
}

export class HandTrackerSession {
  private gripReps = 0;
  private gripPhase: 'open' | 'closing' | 'closed' = 'open';
  private wristHistory: HandPoint[] = [];

  reset(): void {
    this.gripReps = 0;
    this.gripPhase = 'open';
    this.wristHistory = [];
  }

  processHand(handFlat: number[] | undefined, now: number = Date.now()): HandState {
    if (!handFlat || handFlat.length < 42) {
      return {
        kind: 'unknown',
        extendedFingers: 0,
        gripReps: this.gripReps,
        wristAngleDeg: 0,
        wristMobilityScore: 0,
        isMoving: false,
        confidence: 0,
      };
    }

    const wrist = getPoint(handFlat, 0);
    if (!wrist) {
      return {
        kind: 'unknown',
        extendedFingers: 0,
        gripReps: this.gripReps,
        wristAngleDeg: 0,
        wristMobilityScore: 0,
        isMoving: false,
        confidence: 0,
      };
    }

    // Finger tips: 4 (thumb), 8 (index), 12 (middle), 16 (ring), 20 (pinky)
    // Finger MCP joints: 2 (thumb), 5 (index), 9 (middle), 13 (ring), 17 (pinky)
    const fingerPairs: [number, number][] = [
      [4, 2],
      [8, 5],
      [12, 9],
      [16, 13],
      [20, 17],
    ];

    let extendedCount = 0;
    for (const [tipIdx, mcpIdx] of fingerPairs) {
      const tip = getPoint(handFlat, tipIdx);
      const mcp = getPoint(handFlat, mcpIdx);
      if (tip && mcp) {
        const dTip = dist(tip, wrist);
        const dMcp = dist(mcp, wrist);
        if (dTip > dMcp * 1.15) {
          extendedCount += 1;
        }
      }
    }

    let kind: HandPoseKind = 'unknown';
    if (extendedCount >= 4) {
      kind = 'open';
    } else if (extendedCount <= 1) {
      kind = 'closed';
    } else if (extendedCount === 2) {
      kind = 'pointing';
    }

    // Grip rep counter (Open -> Closed -> Open = 1 rep)
    if (this.gripPhase === 'open' && kind === 'closed') {
      this.gripPhase = 'closed';
    } else if (this.gripPhase === 'closed' && kind === 'open') {
      this.gripPhase = 'open';
      this.gripReps += 1;
    }

    // Wrist tracking & mobility
    this.wristHistory.push(wrist);
    if (this.wristHistory.length > 30) this.wristHistory.shift();

    let mobilityScore = 0;
    if (this.wristHistory.length >= 10) {
      let totalMovement = 0;
      for (let i = 1; i < this.wristHistory.length; i++) {
        totalMovement += dist(this.wristHistory[i], this.wristHistory[i - 1]);
      }
      mobilityScore = Math.min(100, Math.round(totalMovement * 300));
    }

    const middleMcp = getPoint(handFlat, 9);
    let wristAngleDeg = 0;
    if (middleMcp) {
      const dx = middleMcp.x - wrist.x;
      const dy = middleMcp.y - wrist.y;
      wristAngleDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    }

    return {
      kind,
      extendedFingers: extendedCount,
      gripReps: this.gripReps,
      wristAngleDeg,
      wristMobilityScore: mobilityScore,
      isMoving: mobilityScore > 15,
      confidence: 1,
    };
  }
}
