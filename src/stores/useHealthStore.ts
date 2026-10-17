import { create } from 'zustand';
import { CyclePhase } from '../domain/health/cycleCalculations';

export interface DailyCheckInRecord {
  id: string;
  date: string;
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  sleepHours: number;
  symptoms: string[];
  notes?: string;
}

export interface CycleData {
  lastPeriodDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentPhase: CyclePhase;
  estimatedNextPeriodDate: string;
}

export interface Quest {
  id: string;
  title: string;
  category: 'movement' | 'breathing' | 'mindfulness' | 'hydration' | 'rest';
  durationMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  moodTag: number;
  isPrivateLocalOnly: boolean;
}

interface HealthState {
  currentStreak: number;
  completedCheckInDaysCount: number;
  cycleData: CycleData;
  checkInHistory: DailyCheckInRecord[];
  todayQuests: Quest[];
  journalEntries: JournalEntry[];
  // New mood tracking fields
  todayEnergy: number; // 1-10
  todayMood: number; // 1-10
  todayStress: number; // 1-10
  todaySleepHours: number;
  todaySymptoms: string[];
  addCheckIn: (record: Omit<DailyCheckInRecord, 'id'>) => void;
  completeQuest: (questId: string) => void;
  addJournalEntry: (title: string, content: string, moodTag?: number) => void;
  deleteJournalEntry: (id: string) => void;
  updateTodayMetrics: (energy: number, mood: number, stress: number, sleepHours: number) => void;
  addTodaySymptom: (symptom: string) => void;
  removeTodaySymptom: (symptom: string) => void;
  updateCycleData: (data: Partial<CycleData>) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  currentStreak: 3,
  completedCheckInDaysCount: 3,
  cycleData: {
    lastPeriodDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cycleLengthDays: 28,
    periodLengthDays: 5,
    currentPhase: 'ovulation',
    estimatedNextPeriodDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  todayEnergy: 7,
  todayMood: 8,
  todayStress: 4,
  todaySleepHours: 7.5,
  todaySymptoms: ['Mild energy surge'],
  checkInHistory: [
    {
      id: 'chk_01',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      energy: 7,
      mood: 8,
      stress: 4,
      sleepHours: 7.5,
      symptoms: ['Mild energy surge'],
    },
    {
      id: 'chk_02',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      energy: 6,
      mood: 7,
      stress: 5,
      sleepHours: 7.0,
      symptoms: [],
    },
  ],
  todayQuests: [
    {
      id: 'quest_01',
      title: '5-Minute Morning Mobility Sequence',
      category: 'movement',
      durationMinutes: 5,
      xpReward: 30,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    },
    {
      id: 'quest_02',
      title: 'Midday Parasympathetic Box Breathing',
      category: 'breathing',
      durationMinutes: 4,
      xpReward: 25,
      isCompleted: false,
    },
    {
      id: 'quest_03',
      title: 'Hydration Anchor: 500ml Water with Electrolytes',
      category: 'hydration',
      durationMinutes: 1,
      xpReward: 15,
      isCompleted: false,
    },
    {
      id: 'quest_04',
      title: 'Quiet Reflection: Log One Gratitude Point',
      category: 'mindfulness',
      durationMinutes: 3,
      xpReward: 20,
      isCompleted: false,
    },
  ],
  journalEntries: [
    {
      id: 'jrnl_01',
      title: 'Morning Clarity & Grounding',
      content: 'Woke up feeling more centered. Focused on breathing slowly while sipping warm herbal tea. Remembering to not rush my progress.',
      createdAt: new Date().toISOString(),
      moodTag: 8,
      isPrivateLocalOnly: true,
    },
  ],

  addCheckIn: (record) =>
    set((state) => ({
      checkInHistory: [
        { ...record, id: `chk_${Date.now()}` },
        ...state.checkInHistory,
      ],
      completedCheckInDaysCount: state.completedCheckInDaysCount + 1,
      currentStreak: state.currentStreak + 1,
    })),

  completeQuest: (questId) =>
    set((state) => ({
      todayQuests: state.todayQuests.map((q) =>
        q.id === questId ? { ...q, isCompleted: true, completedAt: new Date().toISOString() } : q
      ),
    })),

  addJournalEntry: (title, content, moodTag = 7) =>
    set((state) => ({
      journalEntries: [
        {
          id: `jrnl_${Date.now()}`,
          title,
          content,
          createdAt: new Date().toISOString(),
          moodTag,
          isPrivateLocalOnly: true,
        },
        ...state.journalEntries,
      ],
    })),

  deleteJournalEntry: (id) =>
    set((state) => ({
      journalEntries: state.journalEntries.filter((e) => e.id !== id),
    })),

  updateTodayMetrics: (energy, mood, stress, sleepHours) =>
    set({ todayEnergy: energy, todayMood: mood, todayStress: stress, todaySleepHours: sleepHours }),

  addTodaySymptom: (symptom) =>
    set((state) => ({
      todaySymptoms: state.todaySymptoms.includes(symptom)
        ? state.todaySymptoms
        : [...state.todaySymptoms, symptom],
    })),

  removeTodaySymptom: (symptom) =>
    set((state) => ({
      todaySymptoms: state.todaySymptoms.filter((s) => s !== symptom),
    })),

  updateCycleData: (data) =>
    set((state) => ({
      cycleData: { ...state.cycleData, ...data },
    })),
}));
