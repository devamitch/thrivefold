/**
 * Detects a waving hand from pose landmarks (normalised 0..1, y grows downward).
 * Feed it from your existing PoseCameraView / MediaPipe callback:
 *
 *   const wave = useMemo(() => createWaveDetector(() => actions.onWave()), []);
 *   // per frame, with right (or left) wrist + shoulder landmarks:
 *   wave.push({ wristX: w.x, wristY: w.y, shoulderY: s.y });
 */
export function createWaveDetector(onWave: () => void) {
  const hist: { t: number; x: number }[] = [];
  let last = 0;
  return {
    push(p: { wristX: number; wristY: number; shoulderY: number; t?: number }) {
      const t = p.t ?? Date.now();
      if (p.wristY >= p.shoulderY) { hist.length = 0; return; } // hand must be above the shoulder
      hist.push({ t, x: p.wristX });
      while (hist.length && t - hist[0].t > 1200) hist.shift();
      if (hist.length < 6) return;
      let flips = 0, dir = 0, travel = 0;
      for (let i = 1; i < hist.length; i++) {
        const dx = hist[i].x - hist[i - 1].x;
        if (Math.abs(dx) < 0.004) continue;
        travel += Math.abs(dx);
        const d = Math.sign(dx);
        if (dir && d !== dir) flips++;
        dir = d;
      }
      if (flips >= 3 && travel > 0.25 && t - last > 4000) {
        last = t;
        hist.length = 0;
        onWave();
      }
    },
  };
}
