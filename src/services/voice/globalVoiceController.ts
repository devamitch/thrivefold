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
import { coachVoice } from '../ai/coachVoice';
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
        if (this.state === 'listening') {
          this.setState('idle');
        }
        this.isListeningActive = false;
      });

      ExpoSpeechRecognitionModule?.addListener?.('error', (event: any) => {
        // Other screens (dictation, voice practice) use the same recogniser; ignore their sessions.
        if (!this.isListeningActive) return;
        const errorMsg = event.message || (event as any).error || 'Speech recognition error';
        this.setState('error');
        this.listeners.forEach((l) => l.onError(errorMsg));
        this.isListeningActive = false;
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
    coachVoice.stop(); // Barge-in interruption
    agentEngine.cancelCurrentTurn();

    try {
      this.setState('requesting_permission');
      const perm = await ExpoSpeechRecognitionModule?.requestPermissionsAsync?.();
      if (perm && !perm.granted) {
        this.setState('error');
        this.listeners.forEach((l) => l.onError('Microphone permission denied.'));
        return;
      }

      this.setState('listening');
      this.isListeningActive = true;
      ExpoSpeechRecognitionModule?.start?.({
        lang: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        // Local first: use the phone's offline speech pack when it has one.
        androidIntentOptions: { EXTRA_PREFER_OFFLINE: true },
      });
    } catch (err: any) {
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err.message || 'Could not start voice recognizer.'));
    }
  }

  /**
   * Stops listening.
   */
  stopListening() {
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
      const result = await agentEngine.processUserInput(text, {
        onToken: (_token, accumulated) => {
          this.listeners.forEach((l) => l.onAssistantReply(accumulated));
        },
      });

      this.setState('speaking');
      this.listeners.forEach((l) => l.onAssistantReply(result.text, result.toolResult));

      // Speak assistant reply using centralized coach voice (priority 2)
      // Priority 3 so a reply is never dropped by the gap rule; long replies are not cut short.
      await coachVoice.speak(result.text, { priority: 3, maxMs: 60_000 });

      this.setState('idle');
      // Conversation mode: while the assistant is open, keep listening for the next thing said.
      if (this.isOpen) {
        await new Promise((r) => setTimeout(r, 350));
        if (this.isOpen && this.state === 'idle') await this.startListening();
      }
    } catch (err: any) {
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err.message || 'Error processing request'));
    }
  }
}

export const globalVoiceController = new GlobalVoiceController();
