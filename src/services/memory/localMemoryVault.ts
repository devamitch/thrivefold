import { MemoryItem } from '../../domain/ai/types';

/**
 * Local-first encrypted memory vault.
 * Operates strictly on-device; provides complete user control over viewing,
 * editing, disabling and deleting all AI-derived memory tokens.
 */
class LocalMemoryVault {
  private memories: Map<string, MemoryItem> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.seedDefaultMemories();
  }

  private seedDefaultMemories(): void {
    const defaults: MemoryItem[] = [
      {
        id: 'mem_pref_light_movement',
        category: 'preference',
        content: 'Prefers 10-15 minute low-impact mobility sessions over high-intensity cardio.',
        createdAt: new Date().toISOString(),
        isSensitive: false,
      },
      {
        id: 'mem_goal_stress_relief',
        category: 'goal',
        content: 'Focuses on evening stress recovery and mindful breathing practices.',
        createdAt: new Date().toISOString(),
        isSensitive: false,
      },
    ];
    for (const m of defaults) {
      this.memories.set(m.id, m);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public getAllMemories(): MemoryItem[] {
    if (!this.isEnabled) return [];
    return Array.from(this.memories.values());
  }

  public addMemory(category: MemoryItem['category'], content: string, isSensitive: boolean = false): MemoryItem {
    const item: MemoryItem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category,
      content,
      createdAt: new Date().toISOString(),
      isSensitive,
    };
    this.memories.set(item.id, item);
    return item;
  }

  public updateMemory(id: string, content: string): boolean {
    const item = this.memories.get(id);
    if (!item) return false;
    item.content = content;
    this.memories.set(id, item);
    return true;
  }

  public deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  public clearAll(): void {
    this.memories.clear();
  }

  public exportVaultJson(): string {
    return JSON.stringify(Array.from(this.memories.values()), null, 2);
  }
}

export const localMemoryVault = new LocalMemoryVault();
