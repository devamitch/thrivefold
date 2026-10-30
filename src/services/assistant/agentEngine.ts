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
import { brainReady, recommendedModel, setUpBrain } from '../ai/modelSetup';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { personaFor } from '../../domain/assistant/personas';
import { findScreenFor } from '../../domain/search/destinations';
import { parseChatAction } from '../../domain/assistant/chatActions';
import { runChatAction } from './chatActions';
import { logCoachTurnLocally } from '../ai/aiInteractionStore';
import { recentDaysLines, standingLines } from '../../domain/assistant/appKnowledge';

/**
 * Hard questions (exact numbers, medicines, trips and real-life plans) go to the online coach when
 * the person allowed it. Each answer is saved in Thrive RAG, so next time, or offline, the local
 * model answers similar questions from it.
 */
const NEEDS_PRECISION =
  /\b(?:macro|macros|calorie|calories|kcal|protein|carbs?|fat grams|meal plan|diet plan|workout plan|weekly plan|nutrition|bmr|tdee|side effects?|interactions?|what is .{2,30} (?:used|taken) for|trip|travel|itinerary|outing|plan (?:a|my) (?:day|week|trip|visit|weekend)|how to get to|budget)\b/i;

/**
 * The coach's instructions for the on-device model: who the person is (only what they told the
 * app), what they are looking at, and firm rules so answers are specific, consistent and safe.
 */
export function buildCoachPrompt(s: ReturnType<typeof useRootStore.getState>, screen: string): string {
  const k = s.koshProfile;
  const facts = [
    k?.preferredName || s.user?.pseudonym ? `Name: ${k?.preferredName || s.user?.pseudonym}` : null,
    s.user?.age ? `Age: ${s.user.age}` : null,
    s.heightCm ? `Height: ${s.heightCm} cm` : null,
    s.weightKg ? `Weight: ${s.weightKg} kg` : null,
    s.onboarding?.goals?.length ? `Goals: ${s.onboarding.goals.slice(0, 6).join(', ')}` : null,
    s.onboarding?.diet ? `Diet: ${s.onboarding.diet}` : null,
    k?.allergies?.length ? `Allergies: ${k.allergies.join(', ')}` : null,
    k?.foodRestrictions?.length ? `Avoids: ${k.foodRestrictions.join(', ')}` : null,
    s.onboarding?.constraints?.length ? `Limits: ${s.onboarding.constraints.slice(0, 6).join(', ')}` : null,
    `Level ${s.level}, ${s.xp} XP, streak ${s.streak} days`,
  ].filter(Boolean);
  const recent = [...recentDaysLines(s, new Date(), 3), ...standingLines(s).slice(0, -1)];
  return [
    'You are Anvay, the one companion inside the Thrivefold app, running on the person\'s phone.',
    personaFor(s.coachPersona).focus,
    `About the person (they told the app this): ${facts.join('; ')}.`,
    recent.length ? `From their logs on this phone:\n${recent.join('\n')}` : 'Nothing logged in the last 3 days.',
    `They are on: ${screen}`,
    'How to answer:',
    '1. Answer the question first, directly, in plain words. Then give at most 3 short, specific steps if useful.',
    '2. Use the person\'s details and the "Known from this phone" notes when relevant. Never invent numbers, records or facts.',
    '3. If you are not sure or the information is missing, say so in one sentence and say what would help.',
    '4. Keep it under 110 words. No markdown headings, no emoji.',
    '5. You are not a doctor: never diagnose, never name medicine doses. For worrying symptoms, suggest a doctor; for danger, 112.',
  ].join('\n');
}

const storeState0 = () => useRootStore.getState();

/** Instant replies for greetings, thanks and goodbyes (no model round trip). */
export function quickReply(text: string, s: ReturnType<typeof useRootStore.getState>): string | null {
  const t = text.toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t || t.split(' ').length > 5) return null;
  const name = s.koshProfile?.preferredName || s.user?.pseudonym?.split(' ')[0] || '';
  const hi = name ? `, ${name}` : '';
  if (/^(hi|hello|hey|hii+|namaste|good (morning|afternoon|evening)|yo)\b/.test(t)) {
    const h = new Date().getHours();
    const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    return `Hello${hi}. Good ${part}. What can I do for you?`;
  }
  if (/^(thanks|thank you|thx|great|nice|cool|awesome)\b/.test(t)) return "You're welcome. I'm here whenever you need me.";
  if (/^(bye|goodbye|good night|see you|stop|that's all|thats all)\b/.test(t)) return 'Take care. Tap me any time.';
  if (/^(how are you|how r u|how are u)\b/.test(t)) return "I'm well, thank you. How are you feeling today?";
  if (/^(who are you|what are you|what is your name|your name)\b/.test(t))
    return "I'm Anvay, your Thrivefold companion. I run on this phone and help with your day, health and habits.";
  return null;
}

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
  /** When the current turn started, so each reply's time is recorded on the phone. */
  private turnStartedAt = 0;
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
    this.turnStartedAt = Date.now();
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

    // Small talk answers instantly, without waiting for the model.
    const quick = quickReply(text, storeState0());
    if (quick) {
      this.finishTurn(quick, undefined, callbacks);
      return { text: quick };
    }

    // "Download the model": set up the on-device brain right here.
    if (/^(?:please )?(?:download|install|get|set ?up)\b.*\b(?:model|brain|ai|offline)\b|^download$/i.test(text)) {
      const model = recommendedModel();
      const msg = !model
        ? 'On-device AI is not available on this phone.'
        : (await brainReady())
          ? 'The on-device brain is already set up and answering.'
          : `Downloading ${model.name}, ${model.sizeMb} MB. You can keep talking; I'll use it as soon as it's ready.`;
      if (model) void setUpBrain(model);
      this.finishTurn(msg, undefined, callbacks);
      return { text: msg };
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

    // Chat actions: tables of their records, guided jobs, and confirmed sign-out / deletes.
    const action = parseChatAction(text);
    if (action) {
      const res = await runChatAction(action);
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Questions about a file the person read in the chat: quote the file's own lines (with page),
    // and let the on-device model phrase the answer only from those lines.
    const fileLines = await thriveRag.fileLines(text);
    if (fileLines.length) {
      const quote = fileLines.map((l) => `"${l.line}" (${l.file}, page ${l.page})`).join('\n');
      let answer = '';
      if (await ensureLocalModel()) {
        try {
          answer = (
            await LocalAI.generateText({
              prompt: text,
              context: fileLines.map((l) => l.line).join('\n'),
              system:
                "Answer in one or two sentences using only these lines from the person's own file. " +
                'If they do not answer the question, say the file does not say. Never add numbers that are not in the lines.',
            })
          ).trim();
        } catch {
          answer = '';
        }
      }
      const msg = `${answer ? `${answer}\n\n` : ''}From your file:\n${quote}`;
      this.finishTurn(msg, undefined, callbacks);
      return { text: msg };
    }

    // "Where do I…": answer from the app's own screen list (exact, instant) with an Open button.
    const place = findScreenFor(text);
    if (place) {
      const msg = `That's in ${place.title}: ${place.description}.`;
      const res: ToolExecutionResult = { success: true, message: msg, routeToOpen: place.route };
      this.finishTurn(msg, res, callbacks);
      return { text: msg, toolResult: res };
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
        const systemPrompt = buildCoachPrompt(storeState, screenSummary);

        let accumulated = '';
        const onTokenListener = (event: any) => {
          if (event.turnId === turnId) {
            accumulated += event.token;
            callbacks?.onToken?.(event.token, accumulated);
          }
        };

        const sub = LocalAI.onToken(onTokenListener);
        // Ground the model in what the phone already knows: saved memories, documents and answers
        // learned earlier from the cloud coach. This is how replies get better over time.
        const evidence = await thriveRag.contextFor(text);
        LocalAI.startStream(
          turnId,
          text,
          evidence ? `${screenSummary}\nKnown from this phone (use only if relevant):\n${evidence}` : screenSummary,
          systemPrompt,
        );

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
      void thriveRag
        .remember(text.slice(0, 80), `Question: ${text}\nAnswer: ${answer}`, 'wellness_guide', {
          source: 'cloud_coach',
          at: new Date().toISOString(),
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

    const asked = [...this.activeSession.messages].reverse().find((m) => m.sender === 'user')?.text ?? '';
    logCoachTurnLocally(asked, text, toolResult ? 'app' : LocalAI.isLoaded() ? 'on_device' : 'rules', Date.now() - this.turnStartedAt);

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
