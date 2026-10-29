/**
 * coachVoice — the ONE place the coach speaks from.
 *
 * Fixes the "messy sound": speech used to stack (intro + "3" + "2" + rep lines + tips), talk
 * over the tutorial video and fire while you were still positioning.
 *
 * Rules
 *  - priority 3 (intro, "Go", set/rest changes) interrupts anything lower.
 *  - priority 2 (corrections, framing) interrupts chatter, never another priority 2/3.
 *  - priority 1 (rep praise, encouragement) is dropped if anything is speaking or if the
 *    last line ended less than minGapMs ago.
 *  - Nothing is ever queued: stale lines are dropped, not read late.
 *  - setBlocked(true) (tutorial video fullscreen/playing) silences and stops speech.
 *
 * Put at: src/services/ai/coachVoice.ts
 */
import * as Speech from 'expo-speech';

import { speakCoach } from '@/services/ai/coachVoiceService';

export type VoicePriority = 1 | 2 | 3;

interface SpeakOpts {
  priority?: VoicePriority;
  minGapMs?: number;
  /** Upper bound on how long speak() waits for the line to finish. */
  maxMs?: number;
}

let enabled = true;
let blocked = false;
let token = 0;
let busyUntil = 0;
let busyPriority = 0;
let lastEndAt = 0;
let lastSpokenText = '';
const listeners = new Set<(speaking: boolean) => void>();

function notify(speaking: boolean) {
  listeners.forEach((fn) => {
    try {
      fn(speaking);
    } catch {
      // ignore
    }
  });
}

const estimateMs = (t: string) => Math.min(7000, 500 + t.length * 62);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function stopNow() {
  token++;
  busyUntil = 0;
  busyPriority = 0;
  lastEndAt = Date.now();
  try {
    void Speech.stop();
  } catch {
    // ignore
  }
  notify(false);
}

export const coachVoice = {
  setEnabled(v: boolean) {
    enabled = v;
    if (!v) stopNow();
  },
  setBlocked(v: boolean) {
    blocked = v;
    if (v) stopNow();
  },
  stop: stopNow,

  /**
   * Check if coach is currently speaking or just finished within the echo-guard window.
   * Used to prevent speech recognition from hearing the coach's own output.
   */
  isSpeaking(guardMs = 600): boolean {
    const now = Date.now();
    return now < busyUntil || now - lastEndAt < guardMs;
  },

  getLastSpokenText(): string {
    return lastSpokenText;
  },

  subscribe(fn: (speaking: boolean) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Speak one line. Resolves when it should be finished (or was dropped). */
  async speak(text: string, opts: SpeakOpts = {}): Promise<void> {
    if (!enabled || blocked || !text) return;
    const priority = opts.priority ?? 1;
    const minGapMs = opts.minGapMs ?? 1200;
    const est = estimateMs(text);
    const maxMs = opts.maxMs ?? est;
    const now = Date.now();

    if (now < busyUntil) {
      if (priority <= busyPriority) return; // never talk over an equal/higher line
      try {
        void Speech.stop();
      } catch {
        // ignore
      }
    } else if (priority < 3 && now - lastEndAt < minGapMs) {
      return;
    }

    const mine = ++token;
    busyPriority = priority;
    busyUntil = now + Math.min(maxMs, est);
    lastSpokenText = text;
    notify(true);
    try {
      await Promise.all([
        sleep(Math.min(maxMs, est) * 0.7),
        Promise.race([speakCoach(text, true).catch(() => undefined), sleep(maxMs)]),
      ]);
    } finally {
      if (token === mine) {
        busyUntil = 0;
        busyPriority = 0;
        lastEndAt = Date.now();
        notify(false);
      }
    }
  },

  /**
   * Speak and wait, but always wait at least `minMs` even when voice is off, so the
   * "Get ready" beat has a steady length with or without sound.
   */
  async speakAndWait(text: string, minMs = 1600, maxMs = 5000): Promise<void> {
    const started = Date.now();
    await this.speak(text, { priority: 3, maxMs });
    const left = minMs - (Date.now() - started);
    if (left > 0) await sleep(left);
  },
};
