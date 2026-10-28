import { useState, useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { NativeSyntheticEvent } from 'react-native';
import type { PoseFrame } from 'pose-landmarker';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';

export interface PoseTelemetry {
  fps: number;
  latencyMs: number;
  pointsCount: number;
  delegate: 'gpu' | 'cpu' | 'unknown';
  hasPerson: boolean;
  status: 'idle' | 'starting' | 'active' | 'error';
  errorMessage: string | null;
}

export function useBetaPoseLab() {
  const [active, setActive] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [telemetry, setTelemetry] = useState<PoseTelemetry>({
    fps: 0,
    latencyMs: 0,
    pointsCount: 0,
    delegate: 'unknown',
    hasPerson: false,
    status: 'idle',
    errorMessage: null,
  });

  // Reanimated shared values for smooth 60fps rendering without bridge lag
  const feedPoints = useSharedValue<number[]>([]);
  const feedW = useSharedValue(0);
  const feedH = useSharedValue(0);
  const feedFace = useSharedValue<number[]>([]);
  const feedHands = useSharedValue<number[]>([]);
  const feedSeq = useSharedValue(0);
  const feedCapturedAt = useSharedValue(0);

  const feed = useRef({
    points: feedPoints,
    frameW: feedW,
    frameH: feedH,
    face: feedFace,
    hands: feedHands,
    seq: feedSeq,
    capturedAt: feedCapturedAt,
  }).current;

  // FPS & timing tracking
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const lastEmitRef = useRef(Date.now());

  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const now = Date.now();
    const { frameWidth, frameHeight, points, capturedAt } = e.nativeEvent;

    // Convert stride 4 to stride 3 directly
    const n = (points.length / 4) | 0;
    const flat = new Array(n * 3);
    for (let i = 0; i < n; i++) {
      const o4 = i * 4;
      const o3 = i * 3;
      flat[o3] = points[o4];
      flat[o3 + 1] = points[o4 + 1];
      flat[o3 + 2] = points[o4 + 3];
    }

    feed.frameW.value = frameWidth;
    feed.frameH.value = frameHeight;
    feed.points.value = flat;
    feed.capturedAt.value = capturedAt ?? now;
    feed.seq.value = feed.seq.value + 1;
    feed.face.value = e.nativeEvent.face ?? [];
    feed.hands.value = (e.nativeEvent.hands ?? []).flat();

    // Telemetry update throttled to ~4 times a second
    frameCountRef.current++;
    if (now - lastFpsUpdateRef.current >= 300) {
      const dt = (now - lastFpsUpdateRef.current) / 1000;
      const measuredFps = Math.round(frameCountRef.current / dt);
      const latency = capturedAt ? Math.max(0, now - capturedAt) : Math.max(0, now - lastEmitRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;

      setTelemetry((prev) => ({
        ...prev,
        fps: measuredFps,
        latencyMs: latency,
        pointsCount: n,
        hasPerson: n > 0,
        status: 'active',
      }));
    }
    lastEmitRef.current = now;
  }, [feed]);

  const onPoseReady = useCallback((e: NativeSyntheticEvent<{ delegate: 'gpu' | 'cpu' }>) => {
    setTelemetry((prev) => ({
      ...prev,
      delegate: e.nativeEvent.delegate,
      status: 'active',
      errorMessage: null,
    }));
  }, []);

  const onPoseError = useCallback((e: NativeSyntheticEvent<{ code: string; message: string }>) => {
    setTelemetry((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: e.nativeEvent.message,
    }));
  }, []);

  const toggleCamera = useCallback(async () => {
    if (!active && !(await ensureCameraPermission())) {
      setTelemetry((t) => ({ ...t, status: 'error', errorMessage: 'Camera access was not allowed. Allow it in Android settings to use the pose coach.' }));
      return;
    }
    setActive((prev) => {
      const next = !prev;
      setTelemetry((t) => ({
        ...t,
        status: next ? 'starting' : 'idle',
        hasPerson: false,
        errorMessage: null,
      }));
      return next;
    });
  }, [active]);

  const flipCamera = useCallback(() => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  return {
    active,
    facing,
    telemetry,
    feed,
    onPose,
    onPoseReady,
    onPoseError,
    toggleCamera,
    flipCamera,
  };
}
