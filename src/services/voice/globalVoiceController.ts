/**
 * Global Voice Assistant Controller.
 *
 * Implements Google AI Edge Gallery's centralized ASR & TTS provider pattern:
 * - Single voice state machine across the application
 * - Explicit lifecycle states:
 *     idle -> requesting_permission -> listening -> transcribing -> reasoning -> speaking -> idle
 * - Audio echo guard (avoids transcribing the coach's own speaker output)
 * - Barge-in interruption (stopping TTS immediately when user starts speaking)
 * - Coordinated dispatch into agentEngine
 */

import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import { coachVoice } from '../ai/coachVoice';
import { queueCoachSpeech } from '../ai/coachVoiceService';
import { agentEngine } from '../assistant/agentEngine';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';

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

class GlobalVoiceController {
  private state: VoiceAssistantState = 'idle';
  private isOpen = false;
  private listeners = new Set<VoiceAssistantListener>();
  private partialTranscript = '';
  private lastTranscript = '';
  private lastTranscriptAt = 0;
  private isListeningActive = false;
  private silentRestarts = 0;
  private micGranted = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.setupSpeechListeners();
  }

  private setupSpeechListeners() {
    try {
      ExpoSpeechRecognitionModule?.addListener?.('start', () => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        this.setState('listening');
      });

      ExpoSpeechRecognitionModule?.addListener?.('result', (event: any) => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        const text = (event.results?.[0]?.transcript ?? '').trim();
        if (!text) return;

        // Barge-in: if coach is speaking and user speaks, immediately stop TTS
        if (coachVoice.isSpeaking()) {
          coachVoice.stop();
        }

        if (event.isFinal) {
          // Echo guard: avoid processing if transcript arrived right as TTS was speaking
          const now = Date.now();
          if (this.lastTranscript === text && now - this.lastTranscriptAt < 1200) {
            return;
          }
          this.lastTranscript = text;
          this.lastTranscriptAt = now;
          this.silentRestarts = 0;

          this.setState('transcribing');
          this.listeners.forEach((l) => l.onFinalTranscript(text));
          void this.handleFinalUtterance(text);
        } else {
          this.partialTranscript = text;
          this.listeners.forEach((l) => l.onPartialTranscript(text));
        }
      });

      ExpoSpeechRecognitionModule?.addListener?.('volumechange', (event: any) => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        const level = event.value ?? 0;
        this.listeners.forEach((l) => l.onAudioLevel?.(level));
      });

      ExpoSpeechRecognitionModule?.addListener?.('end', () => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        this.isListeningActive = false;
        if (this.state === 'listening') this.quietRestart();
      });

      ExpoSpeechRecognitionModule?.addListener?.('error', (event: any) => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        this.isListeningActive = false;
        const code = String(event?.error ?? '');
        // Hearing nothing is not a failure; the 'end' handler decides whether to listen again.
        if (code === 'no-speech' || code === 'speech-timeout' || code === 'aborted') {
          if (this.state === 'listening') this.quietRestart();
          return;
        }
        const errorMsg =
          code === 'network'
            ? 'Speech needs the offline speech pack or internet. You can type instead.'
            : code === 'not-allowed'
              ? 'Allow the microphone in Android settings to talk.'
              : event.message || 'Speech recognition stopped. Tap the microphone to try again.';
        this.setState('error');
        this.listeners.forEach((l) => l.onError(errorMsg));
      });
    } catch {
      // Degrades gracefully when running on simulator / untyped environment
    }
  }

  getState(): VoiceAssistantState {
    return this.state;
  }

  isAssistantOpen(): boolean {
    return this.isOpen;
  }

  private setState(newState: VoiceAssistantState) {
    this.state = newState;
    this.listeners.forEach((l) => l.onStateChange(newState));
  }

  subscribe(listener: VoiceAssistantListener): () => void {
    this.listeners.add(listener);
    // Push current state immediately to new subscriber
    listener.onStateChange(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Opens the global voice assistant overlay and begins listening.
   */
  async open(initialRoute?: string) {
    this.isOpen = true;
    this.silentRestarts = 0;
    if (initialRoute) {
      agentEngine.setCurrentRoute(initialRoute);
    }
    await this.startListening();
  }

  /**
   * Closes the overlay, stops listening, and halts speech synthesis.
   */
  close() {
    this.isOpen = false;
    this.stopListening();
    coachVoice.stop();
    agentEngine.cancelCurrentTurn();
    this.setState('idle');
  }

  /**
   * Requests permission and starts microphone capture.
   */
  async startListening() {
    this.silentRestarts = 0;
    coachVoice.stop(); // Barge-in interruption
    agentEngine.cancelCurrentTurn();

    try {
      // Ask for the microphone only once; afterwards go straight to listening (no flicker).
      if (!this.micGranted) {
        this.setState('requesting_permission');
        const perm = await ExpoSpeechRecognitionModule?.requestPermissionsAsync?.();
        this.micGranted = !perm || perm.granted;
      }
      if (!this.micGranted) {
        this.setState('error');
        this.listeners.forEach((l) => l.onError('Microphone permission denied.'));
        return;
      }

      this.setState('listening');
      this.beginRecognition();
    } catch (err: any) {
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err.message || 'Could not start voice recognizer.'));
    }
  }

  /** Starts the recogniser itself (no state change), shared by first start and quiet restarts. */
  private beginRecognition() {
    this.isListeningActive = true;
    ExpoSpeechRecognitionModule?.start?.({
      lang: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: true,
      // Local first: use the phone's offline speech pack when it has one.
      androidIntentOptions: {
        EXTRA_PREFER_OFFLINE: true,
        // Finish listening soon after the person stops talking (Android waits ~2 s by default).
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 900,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 700,
      },
    });
  }

  /**
   * Silence ended the recogniser. While the conversation is open, start again without flipping
   * the screen to "idle" and back (that flicker made the microphone feel broken). After a few
   * quiet rounds it rests until the person taps the microphone.
   */
  private quietRestart() {
    if (this.restartTimer) return;
    if (!this.isOpen || this.silentRestarts >= 6) {
      if (this.state === 'listening') this.setState('idle');
      return;
    }
    this.silentRestarts += 1;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (!this.isOpen || this.state !== 'listening') return;
      try {
        this.beginRecognition();
      } catch {
        this.setState('idle');
      }
    }, 150);
  }

  /**
   * Stops listening.
   */
  stopListening() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.isListeningActive) {
      try {
        ExpoSpeechRecognitionModule?.stop?.();
      } catch {
        // ignore
      }
      this.isListeningActive = false;
    }
    if (this.state === 'listening' || this.state === 'requesting_permission') {
      this.setState('idle');
    }
  }

  /**
   * Handles user speech transcript or typed input via agentEngine.
   */
  async handleFinalUtterance(text: string) {
    this.stopListening();
    this.setState('reasoning');

    try {
      // Speak while the model is still writing: each finished sentence goes to the voice queue.
      let spoken = 0;
      const flush = (all: string, final: boolean) => {
        const rest = all.slice(spoken);
        let m = final ? rest.length : Math.max(rest.lastIndexOf('. '), rest.lastIndexOf('! '), rest.lastIndexOf('? '), rest.lastIndexOf('\n')) + 1;
        // Start talking early: a long first clause is spoken at its comma instead of waiting.
        if (!final && m <= 0 && rest.length > 70) m = rest.lastIndexOf(', ') + 1;
        if (m <= 0) return;
        const chunk = rest.slice(0, m).trim();
        spoken += m;
        if (chunk) {
          if (this.state !== 'speaking') this.setState('speaking');
          if (coachVoice.canSpeak()) void queueCoachSpeech(chunk);
        }
      };
      const result = await agentEngine.processUserInput(text, {
        onToken: (_token, accumulated) => {
          this.listeners.forEach((l) => l.onAssistantReply(accumulated));
          flush(accumulated, false);
        },
      });

      this.setState('speaking');
      this.listeners.forEach((l) => l.onAssistantReply(result.text, result.toolResult));
      if (spoken > 0 && result.text.startsWith(result.text.slice(0, spoken))) {
        flush(result.text, true);
      } else {
        // Not streamed (a command or a rule-based reply): say it all at once.
        await coachVoice.speak(result.text, { priority: 3, maxMs: 60_000 });
      }

      this.setState('idle');
      // "Bye" / "stop" ends the conversation instead of listening again.
      if (/^(bye|goodbye|good night|stop|that's all|thats all|close)\b/i.test(text.trim())) {
        this.close();
        return;
      }
      // Conversation mode: while the assistant is open, keep listening for the next thing said.
      if (this.isOpen && conversationModeOn()) {
        // Wait until the voice has really finished, so the microphone never hears the coach.
        for (let i = 0; i < 120 && (await Speech.isSpeakingAsync().catch(() => false)); i++) {
          await new Promise((r) => setTimeout(r, 250));
          if (!this.isOpen) return;
        }
        await new Promise((r) => setTimeout(r, 400));
        if (this.isOpen && this.state === 'idle') await this.startListening();
      }
    } catch (err: any) {
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err.message || 'Error processing request'));
    }
  }
}

function conversationModeOn(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.conversationMode !== false;
  } catch {
    return true;
  }
}

export const globalVoiceController = new GlobalVoiceController();
