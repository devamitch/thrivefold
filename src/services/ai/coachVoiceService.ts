/**
 * Human Virtual Coach Voice Service
 *
 * Integrates Sarvam AI (bulbul:v3 neural TTS for warm, natural Indian voice)
 * and expo-speech (ultra-low latency on-device neural voice fallback).
 */

import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { env } from './env';

export interface VoiceCoachOptions {
  language?: 'en-IN' | 'hi-IN';
  speaker?: 'shubh' | 'meera' | 'amartya';
  rate?: number;
  pitch?: number;
}

let preferredVoiceId: string | null = null;

// Find and cache the most natural on-device neural voice
async function resolveBestVoice(language = 'en-IN'): Promise<string | null> {
  if (preferredVoiceId) return preferredVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const match =
      voices.find((v) => v.language.toLowerCase().startsWith('en-in') && v.quality === Speech.VoiceQuality.Enhanced) ||
      voices.find((v) => v.language.toLowerCase().startsWith('en-in')) ||
      voices.find((v) => v.quality === Speech.VoiceQuality.Enhanced);
    if (match) {
      preferredVoiceId = match.identifier;
    }
  } catch {
    // ignore
  }
  return preferredVoiceId;
}

/**
 * Synthesize speech via Sarvam AI bulbul:v3.
 * Returns base64 WAV or writes to cache.
 */
export async function synthesizeSarvamSpeech(
  text: string,
  opts?: VoiceCoachOptions,
): Promise<string | null> {
  const key = env.SARVAM_API_KEY || env.SARVAM_API_KEY_2;
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
 */
export async function speakCoach(
  text: string,
  voiceOn: boolean,
  opts?: VoiceCoachOptions,
): Promise<void> {
  if (!voiceOn || !text.trim()) return;

  try {
    Speech.stop();
    const voice = await resolveBestVoice(opts?.language ?? 'en-IN');
    Speech.speak(text, {
      language: opts?.language ?? 'en-IN',
      rate: opts?.rate ?? 1.02,
      pitch: opts?.pitch ?? 1.0,
      voice: voice ?? undefined,
    });
  } catch {
    // fallback plain speak
    Speech.speak(text);
  }
}
