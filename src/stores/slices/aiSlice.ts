import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import type { MemoryItem } from '../../domain/ai/types';

/** Insight-derived memories are kept for 90 days unless the person keeps them again. */
const INSIGHT_MEMORY_DAYS = 90;
const MAX_MEMORY_LENGTH = 280;

export interface AiSlice {
  /** The personal memory vault: only what the person typed or explicitly chose to keep. */
  aiMemories: MemoryItem[];
  /** When off, memories are kept but not used for personalisation. */
  aiMemoryEnabled: boolean;
  addAiMemory: (input: {
    content: string;
    category: MemoryItem['category'];
    source: MemoryItem['source'];
    sourceRef?: string;
    isSensitive?: boolean;
  }) => MemoryItem | null;
  updateAiMemory: (id: string, content: string) => void;
  deleteAiMemory: (id: string) => void;
  clearAiMemories: () => void;
  setAiMemoryEnabled: (enabled: boolean) => void;
}

export const createAiSlice: StateCreator<RootState, [['zustand/persist', unknown]], [], AiSlice> = (
  set,
  get,
) => ({
  aiMemories: [],
  aiMemoryEnabled: true,

  addAiMemory: ({ content, category, source, sourceRef, isSensitive = false }) => {
    const text = content.trim().slice(0, MAX_MEMORY_LENGTH);
    if (!text) return null;
    const now = new Date();
    const existing = sourceRef ? get().aiMemories.find((m) => m.sourceRef === sourceRef) : undefined;
    const expiresAt =
      source === 'insight'
        ? new Date(now.getTime() + INSIGHT_MEMORY_DAYS * 86400000).toISOString()
        : undefined;

    if (existing) {
      // Keeping the same insight again refreshes it instead of duplicating it.
      const refreshed = { ...existing, content: text, updatedAt: now.toISOString(), expiresAt };
      set((s) => ({ aiMemories: s.aiMemories.map((m) => (m.id === existing.id ? refreshed : m)) }));
      return refreshed;
    }

    const item: MemoryItem = {
      id: `mem_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      content: text,
      source,
      sourceRef,
      createdAt: now.toISOString(),
      expiresAt,
      isSensitive,
    };
    set((s) => ({ aiMemories: [item, ...s.aiMemories] }));
    return item;
  },

  updateAiMemory: (id, content) => {
    const text = content.trim().slice(0, MAX_MEMORY_LENGTH);
    if (!text) return;
    set((s) => ({
      aiMemories: s.aiMemories.map((m) =>
        m.id === id ? { ...m, content: text, updatedAt: new Date().toISOString() } : m,
      ),
    }));
  },

  deleteAiMemory: (id) => set((s) => ({ aiMemories: s.aiMemories.filter((m) => m.id !== id) })),

  clearAiMemories: () => set({ aiMemories: [] }),

  setAiMemoryEnabled: (enabled) => set({ aiMemoryEnabled: enabled }),
});
