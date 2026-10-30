/**
 * Therapy Voice Service
 *
 * Dedicated soothing neural speech output for emotional grounding,
 * compassionate listening, and crisis de-escalation.
 *
 * Configured with slower cadence (rate: 0.82), warm pitch, and non-blocking
 * interruptibility for calming distressed users.
 */

import { speakCoachLine, stopCoachSpeech } from './coachVoiceService';

let isSpeaking = false;
let currentRequestId = 0;

export interface TherapyVoiceOptions {
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onStopped?: () => void;
}

/**
 * Stop any active therapeutic speech immediately.
 */
export function stopTherapyVoice(): void {
  currentRequestId++;
  isSpeaking = false;
  stopCoachSpeech();
}

/**
 * Speak therapeutic guidance with warm, soothing, unhurried cadence.
 */
export async function speakTherapy(
  text: string,
  options: TherapyVoiceOptions = {},
): Promise<void> {
  const content = text.trim();
  if (!content) return;

  stopTherapyVoice();
  const reqId = ++currentRequestId;
  isSpeaking = true;

  // The person's chosen coach voice, at a slower and warmer pace.
  await speakCoachLine(content, {
    rate: options.rate ?? 0.82,
    pitch: options.pitch,
    onEnd: () => {
      if (currentRequestId !== reqId) return;
      isSpeaking = false;
      options.onDone?.();
    },
  });
}

export function isTherapyVoiceActive(): boolean {
  return isSpeaking;
}
