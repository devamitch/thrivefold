import { create } from 'zustand';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'movement' | 'breathing' | 'mindfulness' | 'hydration' | 'rest' | 'nutrition';
  durationMinutes: number;
  xpReward: number;
  coinsReward: number;
  isCompleted: boolean;
  completedAt?: string;
  difficulty: 'gentle' | 'standard' | 'advanced';
  phaseRelevance?: string[]; // Which cycle phases this is best for
}

export interface GamificationState {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  questsCompleted: number;
  achievements: string[];
  todayQuests: Quest[];
  completeQuest: (questId: string) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  refreshDailyQuests: () => void;
}

// XP thresholds for levels
const xpForLevel = (level: number): number => {
  return 100 + (level - 1) * 50;
};

export const useQuestStore = create<GamificationState>((set, get) => ({
  xp: 350,
  level: 3,
  coins: 150,
  streak: 3,
  questsCompleted: 12,
  achievements: ['first_quest', 'three_day_streak'],
  todayQuests: [
    {
      id: 'quest_01',
      title: '5-Minute Morning Mobility Sequence',
      description: 'Gentle stretching to start your day with mindful movement',
      category: 'movement',
      durationMinutes: 5,
      xpReward: 30,
      coinsReward: 10,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      difficulty: 'gentle',
      phaseRelevance: ['menstrual', 'follicular', 'ovulation', 'luteal'],
    },
    {
      id: 'quest_02',
      title: 'Midday Parasympathetic Box Breathing',
      description: '4-4-4-4 breathing pattern to reset your nervous system',
      category: 'breathing',
      durationMinutes: 4,
      xpReward: 25,
      coinsReward: 8,
      isCompleted: false,
      difficulty: 'standard',
      phaseRelevance: ['menstrual', 'luteal'],
    },
    {
      id: 'quest_03',
      title: 'Hydration Anchor: 500ml Water with Electrolytes',
      description: 'Mid-morning hydration to support hormone balance',
      category: 'hydration',
      durationMinutes: 1,
      xpReward: 15,
      coinsReward: 5,
      isCompleted: false,
      difficulty: 'gentle',
      phaseRelevance: ['menstrual', 'follicular', 'ovulation', 'luteal'],
    },
    {
      id: 'quest_04',
      title: 'Quiet Reflection: Log One Gratitude Point',
      description: 'Write down one thing you are grateful for today',
      category: 'mindfulness',
      durationMinutes: 3,
      xpReward: 20,
      coinsReward: 7,
      isCompleted: false,
      difficulty: 'gentle',
      phaseRelevance: ['menstrual', 'luteal'],
    },
    {
      id: 'quest_05',
      title: 'Evening Magnesium-Rich Snack',
      description: 'Dark chocolate or nuts to support PMS relief',
      category: 'nutrition',
      durationMinutes: 2,
      xpReward: 20,
      coinsReward: 7,
      isCompleted: false,
      difficulty: 'gentle',
      phaseRelevance: ['luteal'],
    },
  ],

  completeQuest: (questId) =>
    set((state) => {
      const quest = state.todayQuests.find((q) => q.id === questId);
      if (!quest || quest.isCompleted) return state;

      const newXp = state.xp + quest.xpReward;
      const newCoins = state.coins + quest.coinsReward;
      const newLevel = Math.floor(newXp / 100) + 1;

      return {
        todayQuests: state.todayQuests.map((q) =>
          q.id === questId ? { ...q, isCompleted: true, completedAt: new Date().toISOString() } : q
        ),
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        questsCompleted: state.questsCompleted + 1,
      };
    }),

  addXP: (amount) =>
    set((state) => {
      const newXp = state.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      return { xp: newXp, level: newLevel };
    }),

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),

  unlockAchievement: (achievementId) =>
    set((state) => {
      if (state.achievements.includes(achievementId)) return state;
      return { achievements: [...state.achievements, achievementId] };
    }),

  refreshDailyQuests: () =>
    set(() => ({
      todayQuests: [
        {
          id: `quest_${Date.now()}_1`,
          title: 'Morning Body Scan',
          description: 'Take 2 minutes to scan your body from head to toe',
          category: 'mindfulness',
          durationMinutes: 2,
          xpReward: 20,
          coinsReward: 7,
          isCompleted: false,
          difficulty: 'gentle',
        },
        {
          id: `quest_${Date.now()}_2`,
          title: '20-Minute Walk',
          description: 'Get outside for a gentle walk',
          category: 'movement',
          durationMinutes: 20,
          xpReward: 40,
          coinsReward: 15,
          isCompleted: false,
          difficulty: 'standard',
        },
        {
          id: `quest_${Date.now()}_3`,
          title: '4-7-8 Breathing',
          description: '4 seconds in, 7 hold, 8 out - repeat 4 times',
          category: 'breathing',
          durationMinutes: 3,
          xpReward: 25,
          coinsReward: 8,
          isCompleted: false,
          difficulty: 'standard',
        },
      ],
    })),
}));
