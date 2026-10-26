import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const SummaryResultSchema = z.object({
  headline: z.string(),
  bulletPoints: z.array(z.string()),
  mindfulTakeaway: z.string(),
});

export type SummaryResult = z.infer<typeof SummaryResultSchema>;

export async function summarizeWellnessJournal(notes: string[]): Promise<SummaryResult> {
  const combined = notes.filter((n) => n && n.trim().length > 0).join('\n---\n');

  if (!combined) {
    return {
      headline: 'A Quiet Day',
      bulletPoints: ['No self-reflection notes recorded today.'],
      mindfulTakeaway: 'Take a gentle breath and acknowledge your presence.',
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic summary fallback
    const firstLine = notes[0].split('\n')[0].slice(0, 80);
    return {
      headline: firstLine || 'Daily Reflection',
      bulletPoints: notes.slice(0, 3).map((n) => n.slice(0, 100)),
      mindfulTakeaway: 'Consistency is found in returning gently each day.',
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      headline: { type: 'string' },
      bulletPoints: { type: 'array', items: { type: 'string' } },
      mindfulTakeaway: { type: 'string' },
    },
    required: ['headline', 'bulletPoints', 'mindfulTakeaway'],
  });

  const prompt = `Synthesize these wellness journal reflections into a concise summary with a clear headline, 2-3 key bullet points, and one warm, encouraging mindful takeaway.\n\nJournal entries:\n${combined}`;

  try {
    return await LocalAI.generateStructured<SummaryResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device personal wellness synthesizer. Output strictly valid JSON.',
      validator: (raw) => SummaryResultSchema.parse(raw),
    });
  } catch {
    return {
      headline: 'Daily Reflection Digest',
      bulletPoints: notes.slice(0, 3),
      mindfulTakeaway: 'Every step taken with mindful intention counts.',
    };
  }
}
