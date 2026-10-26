import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const ExtractedEntitiesSchema = z.object({
  symptoms: z.array(z.string()),
  activities: z.array(z.string()),
  metrics: z.record(z.string(), z.union([z.number(), z.string()])),
  habitsMentioned: z.array(z.string()),
  sentimentScore: z.number().min(-1).max(1),
});

export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;

export async function extractWellnessEntities(text: string): Promise<ExtractedEntities> {
  if (!text || text.trim().length === 0) {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic fallback regex extraction
    const metrics: Record<string, number | string> = {};
    const sleepMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\s*(?:of\s*)?sleep/i);
    if (sleepMatch) metrics.sleepHours = parseFloat(sleepMatch[1]);

    const waterMatch = text.match(/(\d+)\s*(?:glasses|liters|l|cups)\s*(?:of\s*)?water/i);
    if (waterMatch) metrics.waterIntake = parseInt(waterMatch[1], 10);

    const stepsMatch = text.match(/(\d{3,6})\s*steps/i);
    if (stepsMatch) metrics.steps = parseInt(stepsMatch[1], 10);

    return {
      symptoms: [],
      activities: [],
      metrics,
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      symptoms: { type: 'array', items: { type: 'string' } },
      activities: { type: 'array', items: { type: 'string' } },
      metrics: { type: 'object' },
      habitsMentioned: { type: 'array', items: { type: 'string' } },
      sentimentScore: { type: 'number' },
    },
    required: ['symptoms', 'activities', 'metrics', 'habitsMentioned', 'sentimentScore'],
  });

  const prompt = `Extract structured wellness entities from this text: symptoms, physical activities, quantified metrics (sleep, water, steps), habits mentioned, and a sentiment score between -1.0 (negative) and 1.0 (positive).\n\nText: "${text}"`;

  try {
    return await LocalAI.generateStructured<ExtractedEntities>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device entity extractor. Output strictly valid JSON conforming to the schema.',
      validator: (raw) => ExtractedEntitiesSchema.parse(raw),
    });
  } catch {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }
}
