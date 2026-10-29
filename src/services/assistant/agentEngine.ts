/**
 * Unified Agent Execution Engine for Thrive Coach.
 *
 * Implements Google AI Edge Gallery's `agent/` and `agent/sessions/` runtime pattern:
 * - Session state handling
 * - Screen capability injection
 * - Deterministic command dispatch first (safe, fast, offline)
 * - On-device GGUF / local model inference with token streaming
 * - Fallback deterministic local coach
 * - Audited action results and tool dispatch
 */

import { LocalAI } from '../../../modules/local-ai';
import { parseCommand, splitSteps, type Command } from '../../domain/assistant/commands';
import { executeTool, type ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import { resolveLocalCoachReply } from '../../domain/coach/localCoachAI';
import { useRootStore } from '../../stores/useRootStore';
import { askThrive } from '../ai/cloudChat';
import { runCommand as runLegacyCommand } from './runCommand';
import { ensureLocalModel } from '../ai/localModel';
import { knowledgeStore } from '../local-ai/rag/knowledgeStore';

/** Questions where exact numbers matter (macros, calories, doses of a plan): worth a stronger model. */
const NEEDS_PRECISION =
  /\b(?:macro|macros|calorie|calories|kcal|protein|carbs?|fat grams|meal plan|diet plan|workout plan|weekly plan|nutrition|bmr|tdee)\b/i;

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  toolResult?: ToolExecutionResult;
  isStreaming?: boolean;
}

export interface AgentSessionState {
  sessionId: string;
  messages: AgentMessage[];
  currentRoute: string;
  isReasoning: boolean;
  activeTurnId: string | null;
}

export interface AgentTurnCallbacks {
  onToken?: (token: string, accumulated: string) => void;
  onComplete?: (finalText: string, toolResult?: ToolExecutionResult) => void;
  onError?: (error: string) => void;
}

class AgentEngine {
  private activeSession: AgentSessionState = {
    sessionId: `session_${Date.now()}`,
    messages: [],
    currentRoute: '/(app)/(tabs)',
    isReasoning: false,
    activeTurnId: null,
  };

  private currentTurnId = 0;
  private streamSubscription: { remove: () => void } | null = null;
  private completeSubscription: { remove: () => void } | null = null;
  private errorSubscription: { remove: () => void } | null = null;

  constructor() {
    this.setupNativeListeners();
  }

  private setupNativeListeners() {
    if (!LocalAI.isAvailable()) return;

    this.streamSubscription = LocalAI.onToken((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        // Find streaming message in active session
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant' && last.isStreaming) {
          last.text += event.token;
        }
      }
    });

    this.completeSubscription = LocalAI.onStreamComplete((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        this.activeSession.isReasoning = false;
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant') {
          last.isStreaming = false;
          last.text = event.fullText;
        }
      }
    });

    this.errorSubscription = LocalAI.onStreamError((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        this.activeSession.isReasoning = false;
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant') {
          last.isStreaming = false;
          last.text = 'I encountered a brief hiccup. Let me help you with your health dashboard.';
        }
      }
    });
  }

  /**
   * Updates the current active route context.
   */
  setCurrentRoute(route: string) {
    this.activeSession.currentRoute = route;
  }

  /**
   * Cancels the active generation turn (Barge-in).
   */
  cancelCurrentTurn() {
    if (this.activeSession.isReasoning) {
      LocalAI.cancelGeneration();
      this.activeSession.isReasoning = false;
      this.activeSession.activeTurnId = null;
    }
  }

  /**
   * Executes a user turn with screen context and safe tool execution.
   */
  async processUserInput(
    rawText: string,
    callbacks?: AgentTurnCallbacks
  ): Promise<{ text: string; toolResult?: ToolExecutionResult }> {
    const text = rawText.trim();
    if (!text) {
      return { text: 'How can I assist you with your wellbeing today?' };
    }

    const turnId = `turn_${++this.currentTurnId}_${Date.now()}`;
    this.activeSession.activeTurnId = turnId;
    this.activeSession.isReasoning = true;

    // Record user message
    this.activeSession.messages.push({
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    });

    // 0. Several requests in one breath run one after another, each as its own step.
    const steps = splitSteps(text);
    if (steps.length > 1) {
      const replies: string[] = [];
      let lastResult: ToolExecutionResult | undefined;
      for (const step of steps) {
        const r = await this.runCommand(parseCommand(step));
        if (r) {
          replies.push(r.message);
          lastResult = r;
        }
      }
      const combined = replies.join(' ');
      this.finishTurn(combined, lastResult, callbacks);
      return { text: combined, toolResult: lastResult };
    }

    // 1. Check deterministic fast-path commands first
    const cmd: Command = parseCommand(text);
    const direct =
      cmd.kind === 'export' || cmd.kind === 'remember' || cmd.kind === 'life' ? await this.runCommand(cmd) : null;
    if (direct) {
      this.finishTurn(direct.message, direct, callbacks);
      return { text: direct.message, toolResult: direct };
    }

    if (cmd.kind === 'crisis') {
      const res = await executeTool('trigger_urgent_support', {}, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'log_water') {
      const res = await executeTool('log_water', { glasses: cmd.glasses }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'open') {
      const res = await executeTool(
        'navigate_to_screen',
        { route: cmd.route, label: cmd.label },
        { userId: 'local_user', currentRoute: this.activeSession.currentRoute }
      );
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'ask') {
      const res = await executeTool('get_metrics', { metric: cmd.metric }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // 2. Local RAG Query: Check if the user is asking about personal memory, exercise form, or saved documents
    if (
      /\b(?:remember|recall|journal|memory|notes|past|history|exercise|workout|how to do|technique|form|routine|guide|document|article)\b/i.test(
        text
      )
    ) {
      const res = await executeTool('search_personal_memory', { query: text }, { userId: 'local_user' });
      if (res.data?.isGrounded) {
        this.finishTurn(res.message, res, callbacks);
        return { text: res.message, toolResult: res };
      }
    }

    // 3. Medicine Educational Research Query
    const medMatch = text.match(/\b(?:medicine|medication|pill|tablet|drug)\s+(?:called|is|for|named)?\s*([a-zA-Z]+)/i);
    if (medMatch && medMatch[1]) {
      const res = await executeTool('lookup_medicine_info', { medicineName: medMatch[1] }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // 4. Screen-Aware Contextual Guidance
    const screenCap = resolveScreenCapability(this.activeSession.currentRoute);
    const storeState = useRootStore.getState();
    const screenSummary = screenCap.getContextSummary(storeState);

    // 4. Precision questions go to the cloud coach when the person allowed it (keys stay on the
    // server); the answer is kept in the on-device knowledge store so later questions are local.
    const wantsCloud = storeState.cloudAiConsent && !!storeState.user && !storeState.user.isGuest;
    if (wantsCloud && NEEDS_PRECISION.test(text)) {
      const cloud = await this.askCloud(text);
      if (cloud) {
        this.finishTurn(cloud, undefined, callbacks);
        return { text: cloud };
      }
    }

    // 5. On-Device LLM Inference (loads the downloaded model on first use)
    if (await ensureLocalModel()) {
      try {
        const systemPrompt =
          `You are Thrive Coach, a warm, concise on-device wellbeing assistant.\n` +
          `Active Screen Context: ${screenSummary}\n` +
          `User Name: ${storeState.koshProfile?.preferredName || 'Friend'}\n` +
          `Rules: 1-3 sentences maximum. Warm, practical, non-diagnostic. Never prescribe medications.`;

        let accumulated = '';
        const onTokenListener = (event: any) => {
          if (event.turnId === turnId) {
            accumulated += event.token;
            callbacks?.onToken?.(event.token, accumulated);
          }
        };

        const sub = LocalAI.onToken(onTokenListener);
        LocalAI.startStream(turnId, text, screenSummary, systemPrompt);

        // Wait for completion via Promise wrapper
        const streamedResult = await new Promise<string>((resolve) => {
          const doneSub = LocalAI.onStreamComplete((ev) => {
            if (ev.turnId === turnId) {
              sub.remove();
              doneSub.remove();
              errSub.remove();
              resolve(ev.fullText);
            }
          });
          const errSub = LocalAI.onStreamError((ev) => {
            if (ev.turnId === turnId) {
              sub.remove();
              doneSub.remove();
              errSub.remove();
              resolve('');
            }
          });
        });

        if (streamedResult && streamedResult.trim()) {
          this.finishTurn(streamedResult.trim(), undefined, callbacks);
          return { text: streamedResult.trim() };
        }
      } catch {
        // Fall through to deterministic coach
      }
    }

    // 6. No local model: the cloud coach (if allowed), then the deterministic on-device coach.
    if (wantsCloud) {
      const cloud = await this.askCloud(text);
      if (cloud) {
        this.finishTurn(cloud, undefined, callbacks);
        return { text: cloud };
      }
    }
    const coachReply = resolveLocalCoachReply(text);
    const replyText = coachReply.text;
    const toolRes = coachReply.route
      ? {
          success: true,
          message: replyText,
          routeToOpen: coachReply.route,
          autoNavigate: false,
        }
      : undefined;

    this.finishTurn(replyText, toolRes, callbacks);
    return { text: replyText, toolResult: toolRes };
  }

  /** One understood request as a tool call; null for requests that need the model. */
  private async runCommand(cmd: Command): Promise<ToolExecutionResult | null> {
    const ctx = { userId: 'local_user', currentRoute: this.activeSession.currentRoute };
    switch (cmd.kind) {
      case 'crisis':
        return executeTool('trigger_urgent_support', {}, ctx);
      case 'log_water':
        return executeTool('log_water', { glasses: cmd.glasses }, ctx);
      case 'open':
        return executeTool('navigate_to_screen', { route: cmd.route, label: cmd.label }, ctx);
      case 'ask':
        return executeTool('get_metrics', { metric: cmd.metric }, ctx);
      case 'export':
        return executeTool('export_data', { format: cmd.format }, ctx);
      case 'life': {
        const r = await runLegacyCommand(cmd);
        return { success: true, message: r.text, routeToOpen: r.route, autoNavigate: r.autoNavigate };
      }
      case 'remember': {
        const r = await executeTool('log_journal_note', { note: cmd.note, tag: 'remembered' }, ctx);
        return r.success ? { ...r, message: 'Got it. I will remember that.' } : r;
      }
      default:
        return null;
    }
  }

  private async askCloud(text: string): Promise<string | null> {
    try {
      const turns = this.activeSession.messages
        .slice(-8)
        .map((m) => ({ role: m.sender === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }));
      const { reply } = await askThrive(turns.length ? turns : [{ role: 'user', content: text }]);
      const answer = reply?.trim();
      if (!answer) return null;
      void knowledgeStore
        .ingestDocument('local_user', {
          title: text.slice(0, 80),
          text: `Question: ${text}\nAnswer: ${answer}`,
          sourceType: 'wellness_guide',
          metadata: { source: 'cloud_coach', at: new Date().toISOString() },
        })
        .catch(() => undefined);
      return answer;
    } catch {
      return null;
    }
  }

  private finishTurn(
    text: string,
    toolResult?: ToolExecutionResult,
    callbacks?: AgentTurnCallbacks
  ) {
    this.activeSession.isReasoning = false;
    this.activeSession.activeTurnId = null;

    this.activeSession.messages.push({
      id: `asst_${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: Date.now(),
      toolResult,
      isStreaming: false,
    });

    callbacks?.onComplete?.(text, toolResult);
  }

  getSessionHistory(): AgentMessage[] {
    return [...this.activeSession.messages];
  }

  clearSession() {
    this.cancelCurrentTurn();
    this.activeSession.messages = [];
  }
}

export const agentEngine = new AgentEngine();
