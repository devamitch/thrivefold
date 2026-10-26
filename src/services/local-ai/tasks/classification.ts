import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const MoodCategorySchema = z.enum([
  'grounded',
  'reflective',
  'tense',
  'energized',
  'fatigued',
]);

export type MoodCategory = z.infer<typeof MoodCategorySchema>;

export const ClassificationResultSchema = z.object({
  category: MoodCategorySchema,
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  suggestedAction: z.string(),
  reasoning: z.string().optional(),
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

/**
 * Deterministic keyword rules for instant zero-latency fallback
 * if no on-device LLM model is loaded into RAM.
 */
function deterministicClassify(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  if (
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('drained') ||
    lower.includes('sleepy') ||
    lower.includes('burnout')
  ) {
    return {
      category: 'fatigued',
      confidence: 0.85,
      keywords: ['tired', 'sleepy'],
      suggestedAction: 'Take a 10-minute restorative breathwork pause or wind down early.',
      reasoning: 'Matched high-fatigue keywords deterministically.',
    };
  }

  if (
    lower.includes('anxious') ||
    lower.includes('stressed') ||
    lower.includes('overwhelmed') ||
    lower.includes('tense') ||
    lower.includes('deadline')
  ) {
    return {
      category: 'tense',
      confidence: 0.88,
      keywords: ['stress', 'tension'],
      suggestedAction: 'Step outside for a short grounding walk or try box breathing.',
      reasoning: 'Matched stress and tension markers deterministically.',
    };
  }

  if (
    lower.includes('excited') ||
    lower.includes('hyped') ||
    lower.includes('great') ||
    lower.includes('pumped') ||
    lower.includes('active')
  ) {
    return {
      category: 'energized',
      confidence: 0.90,
      keywords: ['energized', 'active'],
      suggestedAction: 'Channel this vitality into a mindful training routine or creative work.',
      reasoning: 'Matched high-energy markers deterministically.',
    };
  }

  if (
    lower.includes('calm') ||
    lower.includes('peaceful') ||
    lower.includes('steady') ||
    lower.includes('good') ||
    lower.includes('fine')
  ) {
    return {
      category: 'grounded',
      confidence: 0.82,
      keywords: ['calm', 'steady'],
      suggestedAction: 'Maintain this gentle balance with your daily hydration and routines.',
      reasoning: 'Matched grounded balance markers deterministically.',
    };
  }

  return {
    category: 'reflective',
    confidence: 0.70,
    keywords: ['thoughtful', 'journaling'],
    suggestedAction: 'Reflect further on what supported you today.',
    reasoning: 'Defaulted to reflective posture in absence of acute triggers.',
  };
}

/**
 * Classifies self-reflection or check-in notes using schema-validated on-device inference,
 * falling back gracefully to deterministic logic.
 */
export async function classifyReflection(text: string): Promise<ClassificationResult> {
  if (!text || text.trim().length === 0) {
    return deterministicClassify('');
  }

  // If local AI is not loaded, use deterministic fallback
  if (!LocalAI.isLoaded()) {
    return deterministicClassify(text);
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['grounded', 'reflective', 'tense', 'energized', 'fatigued'],
      },
      confidence: { type: 'number' },
      keywords: { type: 'array', items: { type: 'string' } },
      suggestedAction: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['category', 'confidence', 'keywords', 'suggestedAction'],
  });

  const prompt = `Analyze the emotional tone of this user note and classify it into one category: "grounded", "reflective", "tense", "energized", or "fatigued". Return strict JSON matching the schema.\n\nNote: "${text}"`;

  try {
    return await LocalAI.generateStructured<ClassificationResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an accurate, private on-device wellness classifier. Output only valid JSON.',
      validator: (raw) => ClassificationResultSchema.parse(raw),
    });
  } catch {
    // If on-device inference fails or returns invalid schema, fall back deterministically
    return deterministicClassify(text);
  }
}
