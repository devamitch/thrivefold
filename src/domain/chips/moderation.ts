import { APPROVED_CHIPS, MessageChip } from './catalog';

export interface ChipSequenceValidation {
  valid: boolean;
  chips: MessageChip[];
  reason?: string;
  assembledPreview: string;
}

export const MAX_CHIPS_PER_COMPOSITION = 5;

/**
 * Validates that an incoming letter/intro payload consists strictly of approved chip IDs
 * and forbids arbitrary free-text injection or contact data evasion.
 */
export function validateChipSequence(chipIds: string[]): ChipSequenceValidation {
  if (!Array.isArray(chipIds) || chipIds.length === 0) {
    return {
      valid: false,
      chips: [],
      reason: 'A message must contain at least 1 curated card.',
      assembledPreview: '',
    };
  }

  if (chipIds.length > MAX_CHIPS_PER_COMPOSITION) {
    return {
      valid: false,
      chips: [],
      reason: `A message can contain at most ${MAX_CHIPS_PER_COMPOSITION} cards.`,
      assembledPreview: '',
    };
  }

  const validatedChips: MessageChip[] = [];

  for (const id of chipIds) {
    if (typeof id !== 'string') {
      return {
        valid: false,
        chips: [],
        reason: 'Invalid card reference provided.',
        assembledPreview: '',
      };
    }

    const found = APPROVED_CHIPS.find((c) => c.id === id.trim());
    if (!found) {
      return {
        valid: false,
        chips: [],
        reason: `Unknown or unapproved card identifier: "${id}". Arbitrary text input is prohibited.`,
        assembledPreview: '',
      };
    }

    validatedChips.push(found);
  }

  const assembledPreview = validatedChips.map((c) => c.text).join('\n\n');

  return {
    valid: true,
    chips: validatedChips,
    assembledPreview,
  };
}
