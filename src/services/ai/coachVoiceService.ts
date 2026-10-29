/**
 * Human Virtual Coach Voice Service
 *
 * Ultra-low latency on-device neural voice (expo-speech) prioritized with
 * a soothing, calm Indian male voice. Sarvam AI bulbul:v3 is strictly reserved
 * for registered users who provide their own BYOK key (disabled for guests
 * and test runs).
 */

import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { pickSarvamKey } from './env';

export interface VoiceCoachOptions {
  language?: 'en-IN' | 'hi-IN';
  speaker?: 'shubh' | 'meera' | 'amartya';
  rate?: number;
  pitch?: number;
}

let preferredVoiceId: string | null = null;

function isGuestOrTesting(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const store = useRootStore.getState?.();
    if (!store) return false;
    const isGuest = !store.adultConfirmedAt && !store.isOnboarded;
    const hasSarvamByok = !!store.userApiKeys?.sarvam;
    return isGuest || !hasSarvamByok;
  } catch {
    return true;
  }
}

/**
 * Score available voices to find the most soothing, calm Indian male voice.
 * Prioritizes Indian English / Hindi male voices (e.g. en-in male Google TTS, iOS Rishi).
 */
function scoreIndianMaleVoice(v: Speech.Voice): number {
  const id = (v.identifier || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let score = 0;

  // Primary: Indian English or Hindi
  if (lang.startsWith('en-in')) {
    score += 100;
  } else if (lang.startsWith('hi-in') || lang.startsWith('hi')) {
    score += 60;
  } else if (lang.startsWith('en-')) {
    score += 20;
  }

  // Male markers in Indian TTS (Google TTS: -end-, -ene-, #male; iOS: Rishi; Android: shubh)
  const isMale =
    id.includes('male') ||
    name.includes('male') ||
    id.includes('rishi') ||
    name.includes('rishi') ||
    id.includes('-end-') ||
    id.includes('-ene-') ||
    name.includes('shubh') ||
    id.includes('shubh');
  if (isMale) score += 50;

  // Deduct for female voices to ensure a calm male voice is selected
  const isFemale =
    id.includes('female') ||
    name.includes('female') ||
    id.includes('neerja') ||
    name.includes('neerja') ||
    id.includes('-ena-') ||
    id.includes('-enb-') ||
    id.includes('-enc-');
  if (isFemale) score -= 40;

  // Enhanced / network neural quality boost
  if (v.quality === Speech.VoiceQuality.Enhanced || id.includes('network')) {
    score += 25;
  }

  return score;
}

// Find and cache the most soothing on-device Indian male voice
async function resolveBestVoice(): Promise<string | null> {
  if (preferredVoiceId) return preferredVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (voices && voices.length > 0) {
      const sorted = [...voices].sort((a, b) => scoreIndianMaleVoice(b) - scoreIndianMaleVoice(a));
      if (sorted[0] && scoreIndianMaleVoice(sorted[0]) > 0) {
        preferredVoiceId = sorted[0].identifier;
      }
    }
  } catch {
    // ignore
  }
  return preferredVoiceId;
}

/**
 * Synthesize speech via Sarvam AI bulbul:v3.
 * Strictly gated: NOT available to guests or automated testing;
 * requires registered user BYOK key.
 */
export async function synthesizeSarvamSpeech(
  text: string,
  opts?: VoiceCoachOptions,
): Promise<string | null> {
  // Guests & testing cannot use Sarvam AI voice; reserved for users with explicit BYOK key
  if (isGuestOrTesting()) {
    return null;
  }

  const key = pickSarvamKey();
  if (!key) return null;

  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: opts?.language ?? 'en-IN',
        speaker: opts?.speaker ?? 'shubh',
        model: 'bulbul:v3',
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { audios?: string[] };
    const base64Audio = json.audios?.[0];
    if (!base64Audio) return null;

    // Save to cache directory
    const fileName = `coach_${Date.now()}.wav`;
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  } catch {
    return null;
  }
}

/**
 * Spoken cue for live coaching.
 * Non-blocking, never stacks cues, uses natural cadence.
 * Always selects a soothing, calm Indian male voice.
 * Guards stop() behind isSpeakingAsync so rapid calls don't stutter.
 */
export async function speakCoach(
  text: string,
  voiceOn: boolean,
  opts?: VoiceCoachOptions,
): Promise<void> {
  if (!voiceOn || !text.trim()) return;

  try {
    // Only stop if something is actively playing — avoids self-interruption stutter.
    const speaking = await Speech.isSpeakingAsync().catch(() => false);
    if (speaking) Speech.stop();

    const voice = await resolveBestVoice();
    Speech.speak(text, {
      language: opts?.language ?? 'en-IN',
      rate: opts?.rate ?? 0.95,   // Calm, natural, soothing pace
      pitch: opts?.pitch ?? 0.94, // Warm, deeper Indian male tone
      voice: voice ?? undefined,
    });
  } catch {
    // fallback plain speak with calm pitch
    Speech.speak(text, { rate: 0.95, pitch: 0.94 });
  }
}
