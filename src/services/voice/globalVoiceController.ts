/**
 * Global Voice Assistant Controller.
 *
 * One voice state machine for the whole app:
 *   idle -> requesting_permission -> listening -> transcribing -> reasoning -> speaking -> idle
 *
 * What changed from the first version (the "ghost microphone"):
 *  - The microphone no longer cycles on and off while nobody is talking. After silence it retries
 *    at most OPEN_RETRIES times right after the sheet opens, then rests until the mic is tapped.
 *  - The recogniser is never started while a previous native session is still winding down
 *    (a late 'end' event from the old session used to restart the new one).
 *  - Typed messages never switch the microphone on afterwards.
 *  - After a reply, the microphone only comes back once the coach has really finished speaking,
 *    so it cannot hear (or cut off) the coach's own voice.
 *  - The sheet appears first, the microphone starts a moment later.
 *  - A stale turn can never act after the sheet was closed or the person interrupted.
 */

import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { LocalAI } from '../../../modules/local-ai';
import { plainText } from '../../domain/assistant/plainText';
import { languageOf } from '../../domain/languages';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { coachVoice } from '../ai/coachVoice';
import { isCoachSpeechPlaying, queueCoachSpeech } from '../ai/coachVoiceService';
import { agentEngine } from '../assistant/agentEngine';

export type VoiceAssistantState =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'transcribing'
  | 'reasoning'
  | 'speaking'
  | 'error';

export interface VoiceAssistantListener {
  onStateChange: (state: VoiceAssistantState) => void;
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onAssistantReply: (reply: string, toolResult?: ToolExecutionResult) => void;
  onAudioLevel?: (level: number) => void;
  onError: (error: string) => void;
}

/** Let the sheet slide in before the microphone (and its indicator) switch on. */
const OPEN_SETTLE_MS = 380;
/** Silent retries right after opening (the person may still be reading). 0 = listen once. */
const OPEN_RETRIES = 0;
/** If the native recogniser never reports 'end' or 'error', give up on that session. */
const END_GUARD_MS = 30_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
// Timeline logging for the microphone; set VOICE_DEBUG to true to trace it in release builds.
const VOICE_DEBUG = false;
const t0 = Date.now();
const log = (...args: unknown[]) => {
  if (__DEV__ || VOICE_DEBUG) console.log(`[voice] t=${Date.now() - t0}ms`, ...args);
};

function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
  } catch {
    return 'en-US';
  }
}

class GlobalVoiceController {
  private state: VoiceAssistantState = 'idle';
  private isOpen = false;
  private listeners = new Set<VoiceAssistantListener>();
  private openListeners = new Set<(open: boolean) => void>();
  private lastTranscript = '';
  private lastTranscriptAt = 0;
  private micGranted = false;

  // Recogniser bookkeeping. "want" is our intent; "running" is the native session.
  private wantListening = false;
  private recognizerRunning = false;
  private pendingStart = false;
  private retriesLeft = 0;
  private lang: string | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private endGuard: ReturnType<typeof setTimeout> | null = null;

  /** Bumped whenever a new turn starts, the person interrupts, or the sheet closes. */
  private turnToken = 0;

  constructor() {
    this.setupSpeechListeners();
  }

  /* ── Native speech events ─────────────────────────────────────────────────────────────── */

  private setupSpeechListeners() {
    try {
      ExpoSpeechRecognitionModule?.addListener?.('start', () => {
        log('native start');
        // Other screens (dictation, voice practice) share the recogniser; ignore their sessions.
        if (!this.wantListening) return;
        this.setState('listening');
      });

      ExpoSpeechRecognitionModule?.addListener?.('result', (event: any) => {
        log('native result', event?.isFinal ? 'final' : 'partial');
        if (!this.wantListening) return;
        const text = (event.results?.[0]?.transcript ?? '').trim();
        if (!text) return;

        // Barge-in: the person is talking, so the coach stops.
        if (coachVoice.isSpeaking()) coachVoice.stop();

        if (event.isFinal) {
          const now = Date.now();
          if (this.lastTranscript === text && now - this.lastTranscriptAt < 1200) return;
          this.lastTranscript = text;
          this.lastTranscriptAt = now;
          log('final', text);
          this.setState('transcribing');
          void this.handleFinalUtterance(text, 'voice');
        } else {
          this.listeners.forEach((l) => l.onPartialTranscript(text));
        }
      });

      ExpoSpeechRecognitionModule?.addListener?.('volumechange', (event: any) => {
        if (!this.wantListening) return;
        const level = event.value ?? 0;
        this.listeners.forEach((l) => l.onAudioLevel?.(level));
      });

      ExpoSpeechRecognitionModule?.addListener?.('end', () => {
        log('native end');
        this.recognizerRunning = false;
        this.clearEndGuard();
        if (this.pendingStart) {
          this.pendingStart = false;
          if (this.wantListening) this.beginRecognition();
          return;
        }
        // The recogniser ended by itself while we still wanted to listen: that is silence.
        if (this.wantListening && this.state === 'listening') this.onSilence();
      });

      ExpoSpeechRecognitionModule?.addListener?.('error', (event: any) => {
        const code = String(event?.error ?? '');
        log('native error', code);
        this.recognizerRunning = false;
        this.clearEndGuard();
        if (this.pendingStart) {
          this.pendingStart = false;
          if (this.wantListening) this.beginRecognition();
          return;
        }
        if (!this.wantListening) return;

        // Hearing nothing is not a failure.
        if (code === 'no-speech' || code === 'speech-timeout' || code === 'aborted') {
          this.onSilence();
          return;
        }
        // The device locale has no recogniser: try plain English once instead of failing.
        if (code === 'language-not-supported' && this.lang !== 'en-US') {
          this.lang = 'en-US';
          this.scheduleRestart(200);
          return;
        }
        this.wantListening = false;
        if (code === 'not-allowed') this.micGranted = false;
        const errorMsg =
          code === 'network'
            ? 'Speech needs the offline speech pack or internet. You can type instead.'
            : code === 'not-allowed'
              ? 'Allow the microphone in Android settings to talk.'
              : event?.message || 'Speech recognition stopped. Tap the microphone to try again.';
        this.setState('error');
        this.listeners.forEach((l) => l.onError(errorMsg));
      });
    } catch {
      // Degrades gracefully on a simulator / untyped environment.
    }
  }

  /* ── Public state ─────────────────────────────────────────────────────────────────────── */

  getState(): VoiceAssistantState {
    return this.state;
  }

  isAssistantOpen(): boolean {
    return this.isOpen;
  }

  private setState(next: VoiceAssistantState) {
    if (this.state === next) return;
    log('state', this.state, '->', next);
    this.state = next;
    this.listeners.forEach((l) => l.onStateChange(next));
  }

  subscribe(listener: VoiceAssistantListener): () => void {
    this.listeners.add(listener);
    listener.onStateChange(this.state);
    return () => this.listeners.delete(listener);
  }

  /** Lets the sheet follow open/close directly (no polling). Called once with the current value. */
  subscribeOpen(cb: (open: boolean) => void): () => void {
    this.openListeners.add(cb);
    cb(this.isOpen);
    return () => this.openListeners.delete(cb);
  }

  private notifyOpen(open: boolean) {
    this.openListeners.forEach((cb) => cb(open));
  }

  /**
   * Adds messages to the open conversation from outside a spoken or typed turn (attachments,
   * confirmations that finished later). Nothing is sent to a model.
   */
  postUserMessage(text: string) {
    this.listeners.forEach((l) => l.onFinalTranscript(text));
  }
  postReply(text: string, tool?: ToolExecutionResult) {
    this.listeners.forEach((l) => l.onAssistantReply(text, tool));
  }

  /* ── Open / close ─────────────────────────────────────────────────────────────────────── */

  /**
   * Opens the assistant. The sheet shows immediately; the microphone follows a moment later.
   * Opening again while it is already open never starts a second recogniser.
   */
  async open(initialRoute?: string, opts: { listen?: boolean } = {}) {
    const listen = opts.listen !== false;
    if (initialRoute) agentEngine.setCurrentRoute(initialRoute);
    if (this.isOpen) {
      if (listen && this.state === 'idle') await this.startListening();
      return;
    }
    this.isOpen = true;
    this.notifyOpen(true);
    // Opened to type (a link or a button, not the orb): the microphone stays off until tapped.
    if (!listen) return;
    await sleep(OPEN_SETTLE_MS);
    if (!this.isOpen) return;
    await this.startListening({ retries: OPEN_RETRIES });
  }

  /** Closes the sheet, stops the microphone and the voice, and cancels any turn in flight. */
  close() {
    this.turnToken++;
    this.isOpen = false;
    this.haltRecognizer();
    coachVoice.stop();
    agentEngine.cancelCurrentTurn();
    this.setState('idle');
    this.notifyOpen(false);
  }

  /* ── Microphone ───────────────────────────────────────────────────────────────────────── */

  /** The person taps the microphone (also used by the automatic "listen again" step). */
  async startListening(opts: { retries?: number } = {}) {
    // Starting to listen is also an interruption of whatever was being said or thought.
    const token = ++this.turnToken;
    coachVoice.stop();
    agentEngine.cancelCurrentTurn();
    this.retriesLeft = opts.retries ?? 0;

    try {
      // Ask for the microphone only once; afterwards go straight to listening.
      if (!this.micGranted) {
        this.setState('requesting_permission');
        const perm = await ExpoSpeechRecognitionModule?.requestPermissionsAsync?.();
        this.micGranted = !perm || perm.granted;
        if (token !== this.turnToken) return;
      }
      if (!this.micGranted) {
        this.setState('error');
        this.listeners.forEach((l) => l.onError('Microphone permission denied.'));
        return;
      }
      this.wantListening = true;
      this.setState('listening');
      this.beginRecognition();
    } catch (err: any) {
      this.wantListening = false;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Could not start voice recognizer.'));
    }
  }

  /** Stops listening and shows the resting state. */
  stopListening() {
    this.haltRecognizer();
    if (this.state === 'listening' || this.state === 'requesting_permission') {
      this.setState('idle');
    }
  }

  /** Stops the recogniser without touching the visible state. */
  private haltRecognizer() {
    this.wantListening = false;
    this.pendingStart = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognizerRunning) {
      log('abort');
      try {
        // abort() drops the audio at once; the session still reports 'end' afterwards.
        (ExpoSpeechRecognitionModule?.abort ?? ExpoSpeechRecognitionModule?.stop)?.call(
          ExpoSpeechRecognitionModule,
        );
      } catch {
        // ignore
      }
    }
  }

  /** Starts one native session, or queues the start until the previous one has ended. */
  private beginRecognition() {
    if (this.recognizerRunning) {
      this.pendingStart = true;
      return;
    }
    this.recognizerRunning = true;
    this.armEndGuard();
    log('start', this.lang ?? deviceLocale());
    try {
      ExpoSpeechRecognitionModule?.start?.({
        lang: this.lang ?? (replyLanguage() !== 'en' ? languageOf(replyLanguage()).locale : deviceLocale()),
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        // Local first: use the phone's offline speech pack when it has one.
        // No custom silence lengths: measured on the Moto G71, 700-900 ms values made Android
        // report "no-speech" about 1 s after every start, before anyone could talk (the ghost
        // microphone switching on and off). Android's own defaults wait several seconds.
        androidIntentOptions: { EXTRA_PREFER_OFFLINE: true },
      });
    } catch (err: any) {
      this.recognizerRunning = false;
      this.clearEndGuard();
      this.wantListening = false;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Could not start voice recognizer.'));
    }
  }

  /** Nobody spoke. Retry a limited number of times, then rest quietly (no on/off flicker). */
  private onSilence() {
    if (this.restartTimer || !this.wantListening) return;
    if (this.isOpen && this.retriesLeft > 0) {
      this.retriesLeft -= 1;
      this.scheduleRestart(400);
      return;
    }
    log('resting after silence');
    this.wantListening = false;
    this.setState('idle');
  }

  private scheduleRestart(ms: number) {
    if (this.restartTimer) return;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (this.wantListening && this.isOpen) this.beginRecognition();
    }, ms);
  }

  private armEndGuard() {
    this.clearEndGuard();
    this.endGuard = setTimeout(() => {
      this.endGuard = null;
      if (!this.recognizerRunning) return;
      log('end guard fired: native session never reported end');
      this.recognizerRunning = false;
      if (this.pendingStart) {
        this.pendingStart = false;
        if (this.wantListening) this.beginRecognition();
      } else if (this.wantListening) {
        this.onSilence();
      }
    }, END_GUARD_MS);
  }

  private clearEndGuard() {
    if (this.endGuard) {
      clearTimeout(this.endGuard);
      this.endGuard = null;
    }
  }

  /* ── A turn: understand, answer, speak ────────────────────────────────────────────────── */

  /**
   * Handles what the person said (via 'voice') or typed (via 'text').
   * Typing never switches the microphone on afterwards.
   */
  async handleFinalUtterance(text: string, via: 'voice' | 'text' = 'voice') {
    const token = ++this.turnToken;
    this.haltRecognizer();
    this.listeners.forEach((l) => l.onFinalTranscript(text));
    this.setState('reasoning');

    const speechJobs: Promise<void>[] = [];
    try {
      // Speak while the model is still writing: each finished sentence goes to the voice queue.
      let spoken = 0;
      const flush = (all: string, final: boolean) => {
        if (token !== this.turnToken) return;
        const rest = all.slice(spoken);
        let m = final
          ? rest.length
          : Math.max(
              rest.lastIndexOf('. '),
              rest.lastIndexOf('! '),
              rest.lastIndexOf('? '),
              rest.lastIndexOf('\n'),
            ) + 1;
        // Start talking early: a long first clause is spoken at its comma instead of waiting.
        if (!final && m <= 0 && rest.length > 70) m = rest.lastIndexOf(', ') + 1;
        if (m <= 0) return;
        const chunk = rest.slice(0, m).trim();
        spoken += m;
        if (chunk) {
          if (this.state !== 'speaking') this.setState('speaking');
          if (speakRepliesOn() && replyLanguage() === 'en') {
            speechJobs.push(queueCoachSpeech(plainText(chunk)).catch(() => undefined));
          }
        }
      };

      const result = await agentEngine.processUserInput(text, {
        onToken: (_token, accumulated) => {
          if (token !== this.turnToken) return;
          this.listeners.forEach((l) => l.onAssistantReply(accumulated));
          flush(accumulated, false);
        },
      });
      // Closed, or the person interrupted, while the answer was being written.
      if (token !== this.turnToken) return;

      // Another reply language: translate the finished reply on the phone, then speak that.
      const lang = replyLanguage();
      let finalText = result.text;
      if (lang !== 'en' && finalText.trim()) {
        finalText = await LocalAI.translateText(finalText, lang, 'en').then((r) => r.text).catch(() => finalText);
        if (token !== this.turnToken) return;
      }

      this.setState('speaking');
      this.listeners.forEach((l) => l.onAssistantReply(finalText, result.toolResult));
      if (spoken > 0 && lang === 'en') {
        flush(result.text, true);
      } else if (speakRepliesOn() && (spoken === 0 || lang !== 'en')) {
        // Not streamed, or translated: say it all at once.
        speechJobs.push(queueCoachSpeech(plainText(finalText)).catch(() => undefined));
      }

      // Stay in "speaking" until the voice has really finished.
      await this.untilSpoken(speechJobs, token);
      if (token !== this.turnToken) return;
      this.setState('idle');

      // "Bye" / "stop" ends the conversation instead of listening again.
      if (/^(bye|goodbye|good night|stop|that's all|thats all|close)\b/i.test(text.trim())) {
        this.close();
        return;
      }

      // Conversation mode: after a spoken exchange, listen once for the next thing said.
      // Never after a typed message, and never while the coach could still be heard.
      if (via === 'voice' && this.isOpen && conversationModeOn()) {
        await sleep(450);
        if (token === this.turnToken && this.isOpen && this.state === 'idle') {
          await this.startListening({ retries: 0 });
        }
      }
    } catch (err: any) {
      if (token !== this.turnToken) return;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Error processing request'));
    }
  }

  /** Waits until every queued sentence was spoken (or the turn was cancelled). */
  private async untilSpoken(jobs: Promise<void>[], token: number) {
    let done = jobs.length === 0;
    void Promise.all(jobs).then(() => {
      done = true;
    });
    const started = Date.now();
    while (!done && token === this.turnToken && Date.now() - started < 60_000) {
      await sleep(150);
    }
    // Belt and braces: the engine may still be finishing the tail of the last sentence.
    for (
      let i = 0;
      i < 12 && token === this.turnToken && (await isCoachSpeechPlaying());
      i++
    ) {
      await sleep(250);
    }
  }
}

/** Replies are text only unless the person switched on "Speak replies". */
function speakRepliesOn(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.speakReplies === true;
  } catch {
    return false;
  }
}

function conversationModeOn(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.conversationMode === true;
  } catch {
    return true;
  }
}

export const globalVoiceController = new GlobalVoiceController();

function replyLanguage(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.coachLanguage || 'en';
  } catch {
    return 'en';
  }
}
