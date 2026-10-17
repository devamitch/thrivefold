export type AiTask =
  | 'routine_classification'
  | 'health_education_explanation'
  | 'reflection_prompt'
  | 'task_personalization'
  | 'moderation_assist'
  | 'complex_reasoning';

export type AiPrivacyClass = 'public_content' | 'personal_non_sensitive' | 'sensitive_health' | 'intimate_social' | 'crisis_signal';

export interface ApprovedLocalContext {
  task: AiTask;
  experience: 'women_health' | 'men_health' | 'pride_wellbeing';
  privacyClass: AiPrivacyClass;
  allowedMemoryIds: string[];
  userApprovedFacts: Record<string, unknown>;
  locale: string;
  maxOutputTokens: number;
}

export interface AiResult {
  success: boolean;
  data: any;
  error?: string;
  source: 'local' | 'cloud' | 'deterministic';
}

export interface LocalAiProvider {
  id: string;
  isAvailable(): Promise<boolean>;
  estimateCapability(task: AiTask): Promise<'supported' | 'degraded' | 'unsupported'>;
  generate(context: ApprovedLocalContext, signal?: AbortSignal): Promise<AiResult>;
  dispose?(): Promise<void>;
}

export interface CloudAiRequest {
  task: AiTask;
  privacyClass: AiPrivacyClass;
  contextMinimized: Record<string, unknown>;
  consentRecordId: string;
  idempotencyKey: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

export interface CloudAiProvider {
  id: 'gemini' | 'openai' | 'anthropic' | 'other';
  isConfigured(): boolean;
  generate(request: CloudAiRequest, signal?: AbortSignal): Promise<AiResult>;
}

/**
 * Deterministic rules-based AI facade
 * Returns predefined responses without requiring any model
 */
export class DeterministicAiProvider implements LocalAiProvider {
  id = 'deterministic';

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async estimateCapability(task: AiTask): Promise<'supported' | 'degraded' | 'unsupported'> {
    // All tasks are supported at basic level
    return 'supported';
  }

  async generate(context: ApprovedLocalContext): Promise<AiResult> {
    // Return rule-based responses based on task
    const responses: Record<AiTask, any> = {
      routine_classification: {
        category: 'general',
        confidence: 1.0,
      },
      health_education_explanation: {
        explanation: 'For personalized health education, please consult with a qualified healthcare provider.',
        source: 'deterministic',
      },
      reflection_prompt: {
        prompt: 'Take a moment to reflect on how you are feeling today. What are you grateful for?',
        source: 'deterministic',
      },
      task_personalization: {
        personalizedTask: 'Review your daily check-in and choose a task that aligns with your current energy level.',
        source: 'deterministic',
      },
      moderation_assist: {
        assessment: 'Content moderation requires human review for complex cases.',
        source: 'deterministic',
      },
      complex_reasoning: {
        response: 'For complex inquiries, please consult with a qualified professional.',
        source: 'deterministic',
      },
    };

    return {
      success: true,
      data: responses[context.task] || { response: 'Task not recognized' },
      source: 'deterministic',
    };
  }
}

/**
 * Local AI facade that routes to available providers
 */
export class LocalAiFacade {
  private providers: LocalAiProvider[] = [];

  constructor() {
    this.providers.push(new DeterministicAiProvider());
    // Additional local providers would be added here when available
  }

  async isAvailable(): Promise<boolean> {
    return this.providers.length > 0;
  }

  async generate(context: ApprovedLocalContext): Promise<AiResult> {
    // Try each provider in order
    for (const provider of this.providers) {
      const available = await provider.isAvailable();
      if (available) {
        const capability = await provider.estimateCapability(context.task);
        if (capability === 'supported' || capability === 'degraded') {
          return provider.generate(context);
        }
      }
    }

    // Fallback to deterministic rules
    const deterministic = new DeterministicAiProvider();
    return deterministic.generate(context);
  }

  async dispose(): Promise<void> {
    // Dispose all providers
    for (const provider of this.providers) {
      if (provider.dispose) {
        await provider.dispose();
      }
    }
  }
}

/**
 * Singleton instance
 */
let localAiInstance: LocalAiFacade | null = null;

export function getLocalAi(): LocalAiFacade {
  if (!localAiInstance) {
    localAiInstance = new LocalAiFacade();
  }
  return localAiInstance;
}
