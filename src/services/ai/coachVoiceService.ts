/**
 * Human Virtual Coach Voice Service
 *
 * Low-latency on-device voice (expo-speech): a warm Indian voice whose gender follows the
 * person's space (see wantedGender). Sarvam AI bulbul:v3 is strictly reserved
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

type VoiceGender = 'male' | 'female';

/**
 * Which coach voice to use: the person's men's-health space gets a warm Indian woman's voice,
 * the women's-health space a warm Indian man's voice; otherwise a woman's voice.
 */
function wantedGender(): VoiceGender {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const exp = useRootStore.getState?.()?.experience;
    return exp === 'women_health' ? 'male' : 'female';
  } catch {
    return 'female';
  }
}

// Google TTS Indian English voices: ena, enb, enc are female; end, ene are male.
const MALE_MARKS = ['male', 'rishi', '-end-', '-ene-', 'shubh', 'amartya'];
const FEMALE_MARKS = ['female', 'neerja', 'veena', '-ena-', '-enb-', '-enc-', 'meera'];

/** Prefers Indian English (then Hindi), the wanted gender, and higher-quality voices. */
function scoreVoice(v: Speech.Voice, want: VoiceGender): number {
  const id = (v.identifier || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let score = 0;
  if (lang.startsWith('en-in')) score += 100;
  else if (lang.startsWith('hi')) score += 60;
  else if (lang.startsWith('en-')) score += 20;
  const has = (marks: string[]) => marks.some((m) => id.includes(m) || name.includes(m));
  const male = has(MALE_MARKS) && !id.includes('female') && !name.includes('female');
  const female = has(FEMALE_MARKS);
  if (want === 'male' ? male : female) score += 60;
  if (want === 'male' ? female : male) score -= 60;
  if (v.quality === Speech.VoiceQuality.Enhanced) score += 15;
  // Offline voices first, so the coach speaks without internet.
  if (id.includes('local')) score += 10;
  if (id.includes('network')) score -= 5;
  return score;
}

let cachedFor: VoiceGender | null = null;

/** The best installed voice for the wanted gender, cached until the gender changes. */
async function resolveBestVoice(): Promise<{ id: string | null; gender: VoiceGender }> {
  const want = wantedGender();
  if (preferredVoiceId && cachedFor === want) return { id: preferredVoiceId, gender: want };
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const best = [...(voices ?? [])].sort((a, b) => scoreVoice(b, want) - scoreVoice(a, want))[0];
    preferredVoiceId = best && scoreVoice(best, want) > 0 ? best.identifier : null;
    cachedFor = want;
  } catch {
    // ignore
  }
  return { id: preferredVoiceId, gender: want };
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
        speaker: opts?.speaker ?? (wantedGender() === 'male' ? 'shubh' : 'meera'),
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
 * Uses the warm Indian voice chosen by wantedGender().
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
      rate: opts?.rate ?? 0.95, // calm, natural pace
      // A touch brighter for the woman's voice, a touch warmer and deeper for the man's.
      pitch: opts?.pitch ?? (voice.gender === 'male' ? 0.92 : 1.06),
      voice: voice.id ?? undefined,
    });
  } catch {
    // fallback plain speak with calm pitch
    Speech.speak(text, { rate: 0.95, pitch: 0.94 });
  }
}
