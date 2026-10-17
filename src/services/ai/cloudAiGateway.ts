import { CloudAiProvider, CloudAiRequest, AiResult, AiTask } from '../../services/ai/localAiFacade';

/**
 * Gemini cloud AI provider (server-side only in production)
 * Client-side stub for development - keys must never be in client bundle
 */
export class GeminiProvider implements CloudAiProvider {
  id = 'gemini' as const;

  isConfigured(): boolean {
    // In production, this checks if server-side key is configured
    // For now, return false since we don't have real server setup
    return false;
  }

  async generate(request: CloudAiRequest): Promise<AiResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini provider not configured',
        source: 'cloud',
        data: null,
      };
    }

    return {
      success: false,
      error: 'Gemini not configured in client',
      source: 'cloud',
      data: null,
    };
  }
}

/**
 * Cloud AI gateway that routes to configured providers
 */
export class CloudAiGateway {
  private providers: CloudAiProvider[] = [];

  constructor() {
    this.providers.push(new GeminiProvider());
    // Additional providers would be added here (OpenAI, Anthropic, etc.)
  }

  isAnyProviderConfigured(): boolean {
    return this.providers.some((p) => p.isConfigured());
  }

  async generate(request: CloudAiRequest): Promise<AiResult> {
    // Find a configured provider
    for (const provider of this.providers) {
      if (provider.isConfigured()) {
        return provider.generate(request);
      }
    }

    return {
      success: false,
      error: 'No cloud AI provider configured',
      source: 'cloud',
      data: null,
    };
  }
}

/**
 * Singleton instance
 */
let cloudAiInstance: CloudAiGateway | null = null;

export function getCloudAi(): CloudAiGateway {
  if (!cloudAiInstance) {
    cloudAiInstance = new CloudAiGateway();
  }
  return cloudAiInstance;
}
