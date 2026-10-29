import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

/**
 * Eye landmarks drawn over the full-screen camera (after BlinkQuest's EyeLandmarkOverlay): both eye
 * contours and irises from the face subset the camera module sends. Maps the analysed frame onto
 * the preview with the same FIT_CENTER letterboxing the native preview uses.
 */
export function EyeOverlay({ face, frameW, frameH, color = '#9BD18B' }: { face: number[] | undefined; frameW: number; frameH: number; color?: string }) {
  const { width, height } = useWindowDimensions();
  if (!face || face.length < 84 || !frameW || !frameH) return null;
  const scale = Math.min(width / frameW, height / frameH);
  const ox = (width - frameW * scale) / 2;
  const oy = (height - frameH * scale) / 2;
  const P = (k: number) => [ox + face[k * 2] * frameW * scale, oy + face[k * 2 + 1] * frameH * scale] as const;
  const ring = (from: number) => Array.from({ length: 16 }, (_, i) => P(from + i).join(',')).join(' ');
  const iris = (center: number, edge: number) => {
    const [cx, cy] = P(center);
    const [ex, ey] = P(edge);
    return { cx, cy, r: Math.max(2, Math.hypot(ex - cx, ey - cy)) };
  };
  const a = iris(32, 33);
  const b = iris(37, 38);
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Polygon points={ring(0)} fill="none" stroke={color} strokeWidth={2} />
      <Polygon points={ring(16)} fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={a.cx} cy={a.cy} r={a.r} fill="none" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx={b.cx} cy={b.cy} r={b.r} fill="none" stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}
