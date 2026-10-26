/**
 * Therapy Voice Service
 *
 * Dedicated soothing neural speech output for emotional grounding,
 * compassionate listening, and crisis de-escalation.
 *
 * Configured with slower cadence (rate: 0.82), warm pitch, and non-blocking
 * interruptibility for calming distressed users.
 */

import * as Speech from 'expo-speech';

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
  try {
    Speech.stop();
  } catch {
    // ignore
  }
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

  const reqId = ++currentRequestId;
  stopTherapyVoice();
  isSpeaking = true;

  try {
    Speech.speak(content, {
      rate: options.rate ?? 0.82, // Slower, calming pace
      pitch: options.pitch ?? 0.98,
      onDone: () => {
        if (currentRequestId === reqId) {
          isSpeaking = false;
          options.onDone?.();
        }
      },
      onStopped: () => {
        if (currentRequestId === reqId) {
          isSpeaking = false;
          options.onStopped?.();
        }
      },
      onError: () => {
        if (currentRequestId === reqId) {
          isSpeaking = false;
        }
      },
    });
  } catch {
    isSpeaking = false;
  }
}

export function isTherapyVoiceActive(): boolean {
  return isSpeaking;
}
