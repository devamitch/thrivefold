import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { SKELETON, type Landmark } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';

interface Props {
  landmarks: Landmark[];
  frameWidth: number;
  frameHeight: number;
  /** Size of the tile the camera preview fills (centre-cropped). */
  width: number;
  height: number;
  /** Joints to draw in the warning colour. */
  highlight: number[];
}

/** Draws the tracked skeleton over a centre-cropped camera preview. */
export function PoseOverlay({ landmarks, frameWidth, frameHeight, width, height, highlight }: Props) {
  const { colors } = useTheme();
  if (landmarks.length < 33 || !frameWidth || !frameHeight || !width || !height) return null;
  // Same maths as the preview's FILL_CENTER: scale to cover, then centre.
  const scale = Math.max(width / frameWidth, height / frameHeight);
  const dx = (width - frameWidth * scale) / 2;
  const dy = (height - frameHeight * scale) / 2;
  const at = (i: number) => ({ x: landmarks[i].x * frameWidth * scale + dx, y: landmarks[i].y * frameHeight * scale + dy });
  const seen = (i: number) => landmarks[i].visibility >= 0.5;
  const hot = new Set(highlight);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {SKELETON.filter(([a, b]) => seen(a) && seen(b)).map(([a, b]) => {
        const p = at(a);
        const q = at(b);
        const bad = hot.has(a) || hot.has(b);
        return (
          <Line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={bad ? colors.error : colors.onPrimary} strokeWidth={bad ? 5 : 3} strokeOpacity={0.9} strokeLinecap="round" />
        );
      })}
      {[...new Set(SKELETON.flat())].filter(seen).map((i) => {
        const p = at(i);
        const bad = hot.has(i);
        return <Circle key={i} cx={p.x} cy={p.y} r={bad ? 9 : 5} fill={bad ? colors.error : colors.primary} stroke={colors.onPrimary} strokeWidth={2} />;
      })}
    </Svg>
  );
}
