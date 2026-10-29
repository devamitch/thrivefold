/**
 * Drop-in replacement: same props as before, now the full living character.
 * The canvas shows the whole body, so use roughly 2x the old size (e.g. 96 -> 200).
 * For the full assistant (voice, camera, time, routines) use <CompanionScreen /> / useCompanion().
 */
import React, { useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { ThriveCharacter } from './ThriveCharacter';
import { useThriveRig } from './rig';
import type { Activity, Mood } from './types';

export interface AnimatedThrivefoldMarkProps {
  size?: number;
  entrance?: boolean;
  living?: boolean;
  delay?: number;
  mood?: 'idle' | 'listening' | 'thinking' | 'speaking';
  /** Now and then do something: wave, roll, dance, stretch, laugh, clap. */
  personality?: boolean;
}

const MAP: Record<NonNullable<AnimatedThrivefoldMarkProps['mood']>, Mood> = {
  idle: 'happy', listening: 'listening', thinking: 'thinking', speaking: 'speaking',
};

export function AnimatedThrivefoldMark({
  size = 200, entrance = true, living = true, delay = 0, mood = 'idle', personality = false,
}: AnimatedThrivefoldMarkProps) {
  const reduce = useReducedMotion();
  const rig = useThriveRig({ living });

  useEffect(() => {
    rig.setMood(MAP[mood]);
    rig.setTalking(mood === 'speaking');
  }, [mood, rig]);

  useEffect(() => {
    if (!personality || reduce) return;
    const acts: Activity[] = ['wave', 'roll', 'dance', 'stretch', 'laugh', 'clap'];
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!alive) return;
      const dur = rig.play(acts[Math.floor(Math.random() * acts.length)]);
      timer = setTimeout(() => {
        if (!alive) return;
        rig.setMood(MAP[mood]);
        rig.settle();
        timer = setTimeout(loop, 5000 + Math.random() * 4000);
      }, dur + 150);
    };
    timer = setTimeout(loop, delay + 3500);
    return () => { alive = false; clearTimeout(timer); };
  }, [personality, reduce, delay, mood, rig]);

  return <ThriveCharacter rig={rig} size={size} entrance={entrance} delay={delay} />;
}

export { ThriveCharacter } from './ThriveCharacter';
export { useThriveRig } from './rig';
export { useCompanion } from './companion';
