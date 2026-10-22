import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import { CyclePhase } from '../../domain/health/cycleCalculations';


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


export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  moodTag: number;
  isPrivateLocalOnly: boolean;
}

export interface HealthSlice {
  currentStreak: number;
  completedCheckInDaysCount: number;
  /** null until the user enters their own cycle details. */
  cycleData: CycleData | null;
  checkInHistory: DailyCheckInRecord[];
  journalEntries: JournalEntry[];
  // New mood tracking fields
  /** null until today's check-in is recorded. */
  todayEnergy: number | null; // 1-10
  todayMood: number | null; // 1-10
  todayStress: number | null; // 1-10
  todaySleepHours: number | null;
  todaySymptoms: string[];
  addCheckIn: (record: Omit<DailyCheckInRecord, 'id'>) => void;
  addJournalEntry: (title: string, content: string, moodTag?: number) => void;
  deleteJournalEntry: (id: string) => void;
  updateTodayMetrics: (
    energy: number | null,
    mood: number | null,
    stress: number | null,
    sleepHours: number | null,
  ) => void;
  addTodaySymptom: (symptom: string) => void;
  removeTodaySymptom: (symptom: string) => void;
  updateCycleData: (data: Partial<CycleData> & Pick<CycleData, 'lastPeriodDate'>) => void;
  clearCycleData: () => void;
}

const isoDay = (d: Date) => d.toISOString().split('T')[0];

/** Consecutive days (ending today or yesterday) that have at least one check-in. */
function streakFrom(history: DailyCheckInRecord[]): number {
  const days = new Set(history.map((r) => r.date));
  const cursor = new Date();
  if (!days.has(isoDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(isoDay(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Starts empty: every number shown comes from what this person records.

export const createHealthSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  HealthSlice
> = (set) => ({
  currentStreak: 0,
  completedCheckInDaysCount: 0,
  cycleData: null,
  todayEnergy: null,
  todayMood: null,
  todayStress: null,
  todaySleepHours: null,
  todaySymptoms: [],
  checkInHistory: [],
  journalEntries: [],

  addCheckIn: (record) =>
    set((state) => {
      const checkInHistory = [{ ...record, id: `chk_${Date.now()}` }, ...state.checkInHistory];
      return {
        checkInHistory,
        completedCheckInDaysCount: new Set(checkInHistory.map((r) => r.date)).size,
        currentStreak: streakFrom(checkInHistory),
      };
    }),

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
      cycleData: {
        cycleLengthDays: 28,
        periodLengthDays: 5,
        currentPhase: 'menstrual',
        estimatedNextPeriodDate: '',
        ...state.cycleData,
        ...data,
      },
    })),

  clearCycleData: () => set({ cycleData: null }),
});
