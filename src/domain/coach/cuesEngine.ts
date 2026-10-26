/**
 * Thrivefold Clear Cues Engine
 *
 * Deterministic, prioritized, debounced cue management for real-time virtual coaching.
 *
 * Requirements:
 * 1. Strict priority hierarchy: SAFETY > FRAMING > FORM_FAULT > TRANSITION > COUNT > ENCOURAGEMENT
 * 2. Hysteresis & Debouncing: Prevents rapid flickering or contradictory cues
 * 3. Audio & Visual Synchronization: Banner text and spoken speech are identical and in lockstep
 * 4. Stale cue suppression: Expired cues are dropped; obsolete cues are replaced
 * 5. Minimum speech interval: At least 1.5s between spoken cues to prevent voice audio collisions
 * 6. Body-neutral, respectful language: Never derogatory or shaming
 */

export type CuePriority = 1 | 2 | 3 | 4 | 5 | 6;

export const CUE_PRIORITIES = {
  SAFETY: 1 as CuePriority,
  FRAMING: 2 as CuePriority,
  FORM_FAULT: 3 as CuePriority,
  TRANSITION: 4 as CuePriority,
  RHYTHM_COUNT: 5 as CuePriority,
  ENCOURAGEMENT: 6 as CuePriority,
} as const;

export type CueCategory = keyof typeof CUE_PRIORITIES;

export interface CueProposal {
  id: string;
  category: CueCategory;
  bannerText: string;
  spokenText?: string;
  tone: 'safety' | 'framing' | 'fault' | 'transition' | 'cue';
  durationMs?: number;
  priorityOverride?: CuePriority;
}

export interface ActiveCue {
  id: string;
  category: CueCategory;
  priority: CuePriority;
  bannerText: string;
  spokenText: string;
  tone: 'safety' | 'framing' | 'fault' | 'transition' | 'cue';
  startedAt: number;
  expiresAt: number;
  spoken: boolean;
}

export interface CueDecision {
  activeCue: ActiveCue | null;
  shouldSpeak: boolean;
  spokenTextToSpeak?: string;
}

export interface CuesEngineConfig {
  minSpeechIntervalMs?: number;
  defaultDurationMs?: number;
  categoryCooldownsMs?: Partial<Record<CueCategory, number>>;
}

const DEFAULT_COOLDOWNS: Record<CueCategory, number> = {
  SAFETY: 3000,
  FRAMING: 5000,
  FORM_FAULT: 4000,
  TRANSITION: 2000,
  RHYTHM_COUNT: 800,
  ENCOURAGEMENT: 10000,
};

export class CuesEngine {
  private activeCue: ActiveCue | null = null;
  private lastSpokenAt = 0;
  private lastCueFiredAt: Record<string, number> = {};
  private activeFaultIds = new Set<string>();

  private readonly minSpeechIntervalMs: number;
  private readonly defaultDurationMs: number;
  private readonly cooldowns: Record<CueCategory, number>;

  constructor(config?: CuesEngineConfig) {
    this.minSpeechIntervalMs = config?.minSpeechIntervalMs ?? 1500;
    this.defaultDurationMs = config?.defaultDurationMs ?? 2500;
    this.cooldowns = { ...DEFAULT_COOLDOWNS, ...config?.categoryCooldownsMs };
  }

  /**
   * Propose a new cue to the engine.
   * Evaluates priority, cooldowns, and active cue state.
   */
  proposeCue(proposal: CueProposal, now = Date.now()): CueDecision {
    const priority = proposal.priorityOverride ?? CUE_PRIORITIES[proposal.category];
    const duration = proposal.durationMs ?? this.defaultDurationMs;
    const spoken = proposal.spokenText ?? proposal.bannerText;

    // Check category/cue specific cooldown (only if previously fired)
    const cooldown = this.cooldowns[proposal.category];
    const lastFired = this.lastCueFiredAt[proposal.id] ?? 0;
    if (lastFired > 0 && now - lastFired < cooldown && proposal.category !== 'RHYTHM_COUNT') {
      return this.currentDecision(now);
    }

    // Contradiction suppression: do not give generic encouragement if there is an active form fault
    if (proposal.category === 'ENCOURAGEMENT' && this.activeFaultIds.size > 0) {
      return this.currentDecision(now);
    }

    // Priority Check vs Active Cue
    if (this.activeCue && now < this.activeCue.expiresAt) {
      // If active cue is higher priority (lower numerical value), do not preempt
      if (this.activeCue.priority < priority) {
        return this.currentDecision(now);
      }
      // If same priority and same ID, refresh expiration only
      if (this.activeCue.id === proposal.id) {
        this.activeCue.expiresAt = Math.max(this.activeCue.expiresAt, now + duration);
        return this.currentDecision(now);
      }
    }

    // Set as active cue
    const shouldSpeak = now - this.lastSpokenAt >= this.minSpeechIntervalMs;
    this.activeCue = {
      id: proposal.id,
      category: proposal.category,
      priority,
      bannerText: proposal.bannerText,
      spokenText: spoken,
      tone: proposal.tone,
      startedAt: now,
      expiresAt: now + duration,
      spoken: shouldSpeak,
    };

    this.lastCueFiredAt[proposal.id] = now;
    if (shouldSpeak) {
      this.lastSpokenAt = now;
    }

    if (proposal.category === 'FORM_FAULT') {
      this.activeFaultIds.add(proposal.id);
    }

    return {
      activeCue: this.activeCue,
      shouldSpeak,
      spokenTextToSpeak: shouldSpeak ? spoken : undefined,
    };
  }

  /**
   * Signal that a form fault has resolved.
   */
  resolveFault(faultId: string, now = Date.now()): CueDecision {
    this.activeFaultIds.delete(faultId);
    if (this.activeCue && this.activeCue.id === faultId) {
      // Expire immediately or transition cleanly
      this.activeCue.expiresAt = now;
    }
    return this.tick(now);
  }

  /**
   * Periodic tick to purge expired cues.
   */
  tick(now = Date.now()): CueDecision {
    if (this.activeCue && now >= this.activeCue.expiresAt) {
      this.activeCue = null;
    }
    return this.currentDecision(now);
  }

  /**
   * Returns current active cue.
   */
  getActiveCue(): ActiveCue | null {
    this.tick();
    return this.activeCue;
  }

  /**
   * Clear all cues immediately (e.g. on pause or screen exit).
   */
  clear(): void {
    this.activeCue = null;
    this.activeFaultIds.clear();
  }

  /**
   * Reset entire history & cooldown state.
   */
  reset(): void {
    this.clear();
    this.lastSpokenAt = 0;
    this.lastCueFiredAt = {};
  }

  private currentDecision(now: number): CueDecision {
    if (this.activeCue && now >= this.activeCue.expiresAt) {
      this.activeCue = null;
    }
    return {
      activeCue: this.activeCue,
      shouldSpeak: false,
    };
  }
}

export const cuesEngine = new CuesEngine();
