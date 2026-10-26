import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const OrganizationSuggestionSchema = z.object({
  suggestedTags: z.array(z.string()),
  relatedRoutines: z.array(z.string()),
  categorySuggestion: z.string(),
  reasoning: z.string(),
});

export type OrganizationSuggestion = z.infer<typeof OrganizationSuggestionSchema>;

export async function suggestOrganization(content: string): Promise<OrganizationSuggestion> {
  if (!content || content.trim().length === 0) {
    return {
      suggestedTags: ['wellness'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Default organization category.',
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic tag suggestions based on keyword presence
    const lower = content.toLowerCase();
    const tags: string[] = [];
    if (lower.includes('run') || lower.includes('walk') || lower.includes('workout') || lower.includes('gym')) {
      tags.push('fitness', 'movement');
    }
    if (lower.includes('water') || lower.includes('food') || lower.includes('meal') || lower.includes('diet')) {
      tags.push('nutrition');
    }
    if (lower.includes('sleep') || lower.includes('nap') || lower.includes('bed')) {
      tags.push('sleep-hygiene');
    }
    if (lower.includes('calm') || lower.includes('anxious') || lower.includes('breathe')) {
      tags.push('mindfulness');
    }
    if (tags.length === 0) tags.push('reflection');

    return {
      suggestedTags: tags,
      relatedRoutines: tags.map((t) => `${t}-check`),
      categorySuggestion: tags[0],
      reasoning: 'Deterministic keyword matching.',
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      suggestedTags: { type: 'array', items: { type: 'string' } },
      relatedRoutines: { type: 'array', items: { type: 'string' } },
      categorySuggestion: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['suggestedTags', 'relatedRoutines', 'categorySuggestion', 'reasoning'],
  });

  const prompt = `Analyze this wellness entry and suggest up to 3 relevant tags, related routines, and a category:\n\n"${content}"`;

  try {
    return await LocalAI.generateStructured<OrganizationSuggestion>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device organization assistant. Return strictly valid JSON.',
      validator: (raw) => OrganizationSuggestionSchema.parse(raw),
    });
  } catch {
    return {
      suggestedTags: ['reflection'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Fallback organization.',
    };
  }
}
