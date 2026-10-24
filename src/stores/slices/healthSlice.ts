import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';
import { CyclePhase } from '../../domain/health/cycleCalculations';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import type { PoseSessionSummary } from '../../domain/pose/movement';
import type { ActivityLog, WorkoutSession } from '../../domain/fitness/workouts';


export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface PeriodLogRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isOngoing?: boolean;
  flowIntensity: FlowIntensity;
  painLevel?: number; // 0-10
  symptoms?: string[];
  mood?: number; // 1-10
  energy?: number; // 1-10
  notes?: string;
  loggedAt: string;
  updatedAt?: string;
}

export type ReproductiveContext =
  | 'regular'
  | 'irregular'
  | 'pcos_pcod'
  | 'contraception'
  | 'trying_to_conceive'
  | 'pregnant'
  | 'postpartum'
  | 'breastfeeding'
  | 'perimenopause'
  | 'menopause'
  | 'paused';

export interface PregnancyDetails {
  estimatedDueDate?: string; // YYYY-MM-DD
  gestationalWeeks?: number;
  conceptionDate?: string;
  notes?: string;
}

export interface PersonalCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'deadline' | 'financial' | 'custom';
  relationship?: 'self' | 'partner' | 'family' | 'friend' | 'work' | 'other';
  emoji?: string;
  notes?: string;
  recurrence?: 'yearly' | 'monthly' | 'weekly' | 'none';
  time?: string; // HH:mm
}

/** A medication or supplement the person tracks. Thrivefold never suggests or doses one. */
export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  time: string; // HH:mm
}

export interface DailyCheckInRecord {
  id: string;
  date: string;
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  sleepHours: number;
  symptoms: string[];
  notes?: string;
  /** The day's chosen intensity (spec §3.4); shapes today's quests only. */
  intensity?: 'rest' | 'light' | 'regular';
}

export interface CycleData {
  lastPeriodDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentPhase: CyclePhase;
  estimatedNextPeriodDate: string;
  reproductiveContext?: ReproductiveContext;
  pregnancyDetails?: PregnancyDetails;
  periodHistory: PeriodLogRecord[];
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  moodTag: number;
  isPrivateLocalOnly: boolean;
}

/** A pose-checked movement session: derived numbers only, never images or landmarks. */
export interface PoseSessionRecord extends PoseSessionSummary {
  id: string;
  date: string;
  startedAt: string;
  finishedAt: string;
  modelVersion: string;
}

export interface HealthSlice {
  currentStreak: number;
  completedCheckInDaysCount: number;
  /** null until the user enters their own cycle details. */
  cycleData: CycleData | null;
  checkInHistory: DailyCheckInRecord[];
  journalEntries: JournalEntry[];
  personalEvents: PersonalCalendarEvent[];
  workoutSessions: WorkoutSession[];
  poseSessions: PoseSessionRecord[];
  savePoseSession: (session: Omit<PoseSessionRecord, 'id'>) => void;
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => void;
  deleteActivityLog: (id: string) => void;
  /** Glasses of water per date (YYYY-MM-DD). */
  hydration: Record<string, number>;
  setHydration: (date: string, glasses: number) => void;
  /** Edits an existing check-in for a date; does nothing if there is none. */
  patchCheckIn: (date: string, patch: Partial<Omit<DailyCheckInRecord, 'id' | 'date'>>) => void;
  medications: MedicationEntry[];
  /** "YYYY-MM-DD|medicationId" for each dose marked taken. */
  medicationTaken: string[];
  addMedication: (entry: Omit<MedicationEntry, 'id'>) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationTaken: (id: string, date: string) => void;
  saveWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => void;
  deleteWorkoutSession: (id: string) => void;
  // Mood and check-in tracking fields
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
  logPeriod: (record: Omit<PeriodLogRecord, 'id' | 'loggedAt'> & { id?: string }) => void;
  editPeriod: (id: string, updates: Partial<PeriodLogRecord>) => void;
  deletePeriod: (id: string) => void;
  setReproductiveContext: (context: ReproductiveContext, pregnancy?: PregnancyDetails) => void;
  clearCycleData: () => void;
  addPersonalEvent: (event: Omit<PersonalCalendarEvent, 'id'>) => void;
  editPersonalEvent: (id: string, updates: Partial<PersonalCalendarEvent>) => void;
  deletePersonalEvent: (id: string) => void;
}

const isoDay = (d: Date) => formatLocalDate(d);

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

function recomputeCycleStatsFromPeriods(
  periods: PeriodLogRecord[],
  baseLength = 28,
  basePeriodLength = 5
): {
  lastPeriodDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  estimatedNextPeriodDate: string;
} {
  if (periods.length === 0) {
    return {
      lastPeriodDate: '',
      cycleLengthDays: baseLength,
      periodLengthDays: basePeriodLength,
      estimatedNextPeriodDate: '',
    };
  }

  // Sorted descending by startDate
  const sorted = [...periods].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const latest = sorted[0];
  const lastPeriodDate = latest.startDate;

  // Calculate real cycle length intervals
  let cycleLengthDays = baseLength;
  if (sorted.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].startDate);
      const d2 = new Date(sorted[i + 1].startDate);
      const diff = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diff >= 18 && diff <= 90) {
        intervals.push(diff);
      }
    }
    if (intervals.length > 0) {
      intervals.sort((a, b) => a - b);
      const mid = Math.floor(intervals.length / 2);
      cycleLengthDays =
        intervals.length % 2 !== 0
          ? intervals[mid]
          : Math.round((intervals[mid - 1] + intervals[mid]) / 2);
    }
  }

  // Calculate real period duration
  let periodLengthDays = basePeriodLength;
  const durations: number[] = [];
  for (const p of sorted) {
    if (p.endDate) {
      const d1 = new Date(p.startDate);
      const d2 = new Date(p.endDate);
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
      if (diff >= 2 && diff <= 12) {
        durations.push(diff);
      }
    }
  }
  if (durations.length > 0) {
    durations.sort((a, b) => a - b);
    const mid = Math.floor(durations.length / 2);
    periodLengthDays =
      durations.length % 2 !== 0
        ? durations[mid]
        : Math.round((durations[mid - 1] + durations[mid]) / 2);
  }

  const nextStart = new Date(new Date(lastPeriodDate).getTime() + cycleLengthDays * 86400000);
  // `new Date('YYYY-MM-DD')` is UTC midnight, so read it back in UTC to keep the same day.
  const y = nextStart.getUTCFullYear();
  const m = String(nextStart.getUTCMonth() + 1).padStart(2, '0');
  const d = String(nextStart.getUTCDate()).padStart(2, '0');
  const estimatedNextPeriodDate = `${y}-${m}-${d}`;

  return {
    lastPeriodDate,
    cycleLengthDays,
    periodLengthDays,
    estimatedNextPeriodDate,
  };
}

export const createHealthSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  HealthSlice
> = (set, get) => ({
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
  // Only events the person adds; nothing is pre-filled.
  personalEvents: [],
  workoutSessions: [],
  poseSessions: [],
  savePoseSession: (session) =>
    set((state) => ({
      poseSessions: [{ ...session, id: `pose_${Date.now()}` }, ...state.poseSessions].slice(0, 300),
    })),
  activityLogs: [],

  addActivityLog: (log) =>
    set((state) => ({
      activityLogs: [{ ...log, id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }, ...state.activityLogs].slice(0, 1000),
    })),

  deleteActivityLog: (id) => set((state) => ({ activityLogs: state.activityLogs.filter((a) => a.id !== id) })),
  hydration: {},

  setHydration: (date, glasses) =>
    set((state) => ({ hydration: { ...state.hydration, [date]: Math.max(0, Math.min(20, glasses)) } })),

  patchCheckIn: (date, patch) =>
    set((state) => ({
      checkInHistory: state.checkInHistory.map((r) => (r.date === date ? { ...r, ...patch } : r)),
    })),
  medications: [],
  medicationTaken: [],

  addMedication: (entry) =>
    set((state) => ({
      medications: [...state.medications, { ...entry, id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }].sort(
        (a, b) => a.time.localeCompare(b.time),
      ),
    })),

  deleteMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((m) => m.id !== id),
      medicationTaken: state.medicationTaken.filter((k) => !k.endsWith(`|${id}`)),
    })),

  toggleMedicationTaken: (id, date) =>
    set((state) => {
      const key = `${date}|${id}`;
      return {
        medicationTaken: state.medicationTaken.includes(key)
          ? state.medicationTaken.filter((k) => k !== key)
          : [...state.medicationTaken, key].slice(-2000),
      };
    }),

  saveWorkoutSession: (session) =>
    set((state) => ({
      workoutSessions: [
        { ...session, id: `wk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` },
        ...state.workoutSessions,
      ].slice(0, 500),
    })),

  deleteWorkoutSession: (id) =>
    set((state) => ({ workoutSessions: state.workoutSessions.filter((w) => w.id !== id) })),

  addCheckIn: (record) => {
    set((state) => {
      // One check-in per day: saving again updates that day's record.
      const checkInHistory = [
        { ...record, id: `chk_${Date.now()}` },
        ...state.checkInHistory.filter((r) => r.date !== record.date),
      ];
      return {
        checkInHistory,
        completedCheckInDaysCount: new Set(checkInHistory.map((r) => r.date)).size,
        currentStreak: streakFrom(checkInHistory),
      };
    });
    // A hard day lightens today's unstarted quests (setupProfile.fitFor).
    if (record.date === formatLocalDate(new Date())) get().refitDailyQuests();
  },

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
    set((state) => {
      const currentHistory = state.cycleData?.periodHistory ?? [];
      const hasRecord = currentHistory.some((p) => p.startDate === data.lastPeriodDate);
      const updatedHistory = hasRecord
        ? currentHistory
        : [
            {
              id: `prd_${Date.now()}`,
              startDate: data.lastPeriodDate,
              flowIntensity: 'medium' as FlowIntensity,
              loggedAt: new Date().toISOString(),
            },
            ...currentHistory,
          ];

      return {
        cycleData: {
          cycleLengthDays: 28,
          periodLengthDays: 5,
          currentPhase: 'menstrual',
          estimatedNextPeriodDate: '',
          reproductiveContext: 'regular',
          periodHistory: updatedHistory,
          ...state.cycleData,
          ...data,
        },
      };
    }),

  logPeriod: (record) =>
    set((state) => {
      const existingHistory = state.cycleData?.periodHistory ?? [];
      const id = record.id || `prd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      // Upsert: replace if same ID or same startDate, otherwise prepend
      const filtered = existingHistory.filter(
        (p) => p.id !== id && p.startDate !== record.startDate
      );
      const newRecord: PeriodLogRecord = {
        ...record,
        id,
        loggedAt: now,
        updatedAt: now,
      };
      const updatedHistory = [newRecord, ...filtered].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      const computed = recomputeCycleStatsFromPeriods(
        updatedHistory,
        state.cycleData?.cycleLengthDays ?? 28,
        state.cycleData?.periodLengthDays ?? 5
      );

      return {
        cycleData: {
          currentPhase: 'menstrual',
          reproductiveContext: state.cycleData?.reproductiveContext ?? 'regular',
          pregnancyDetails: state.cycleData?.pregnancyDetails,
          ...state.cycleData,
          ...computed,
          periodHistory: updatedHistory,
        },
      };
    }),

  editPeriod: (id, updates) =>
    set((state) => {
      const existingHistory = state.cycleData?.periodHistory ?? [];
      const updatedHistory = existingHistory.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );

      const computed = recomputeCycleStatsFromPeriods(
        updatedHistory,
        state.cycleData?.cycleLengthDays ?? 28,
        state.cycleData?.periodLengthDays ?? 5
      );

      return {
        cycleData: {
          currentPhase: 'menstrual',
          reproductiveContext: state.cycleData?.reproductiveContext ?? 'regular',
          pregnancyDetails: state.cycleData?.pregnancyDetails,
          ...state.cycleData,
          ...computed,
          periodHistory: updatedHistory,
        },
      };
    }),

  deletePeriod: (id) =>
    set((state) => {
      const existingHistory = state.cycleData?.periodHistory ?? [];
      const updatedHistory = existingHistory.filter((p) => p.id !== id);

      const computed = recomputeCycleStatsFromPeriods(
        updatedHistory,
        state.cycleData?.cycleLengthDays ?? 28,
        state.cycleData?.periodLengthDays ?? 5
      );

      return {
        cycleData: {
          currentPhase: 'follicular',
          reproductiveContext: state.cycleData?.reproductiveContext ?? 'regular',
          pregnancyDetails: state.cycleData?.pregnancyDetails,
          ...state.cycleData,
          ...computed,
          periodHistory: updatedHistory,
        },
      };
    }),

  setReproductiveContext: (context, pregnancy) =>
    set((state) => ({
      cycleData: state.cycleData
        ? {
            ...state.cycleData,
            reproductiveContext: context,
            pregnancyDetails: pregnancy ?? state.cycleData.pregnancyDetails,
          }
        : {
            lastPeriodDate: '',
            cycleLengthDays: 28,
            periodLengthDays: 5,
            currentPhase: 'follicular',
            estimatedNextPeriodDate: '',
            reproductiveContext: context,
            pregnancyDetails: pregnancy,
            periodHistory: [],
          },
    })),

  clearCycleData: () => set({ cycleData: null }),

  addPersonalEvent: (event) =>
    set((state) => ({
      personalEvents: [
        {
          ...event,
          id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        },
        ...state.personalEvents,
      ],
    })),

  editPersonalEvent: (id, updates) =>
    set((state) => ({
      personalEvents: state.personalEvents.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  deletePersonalEvent: (id) =>
    set((state) => ({
      personalEvents: state.personalEvents.filter((e) => e.id !== id),
    })),
});
