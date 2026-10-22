/**
 * Universal Calendar & Life Planner Engine for Thrivefold
 * Built according to Master Spec & Architecture Guidelines.
 * Handles endless date calculation, recurrence, multi-experience event generation,
 * privacy segregation, and schedule adaptations.
 */

import { ProductExperience } from '../../theme/tokens';
import { getCyclePredictions } from '../health/cycleCalculations';
import type { CycleData } from '../../stores/useRootStore';

export type CalendarEventKind =
  | 'period'
  | 'spotting'
  | 'cycle_phase'
  | 'ovulation_estimate'
  | 'fertile_window_estimate'
  | 'symptom'
  | 'medication_reminder'
  | 'health_appointment'
  | 'sleep'
  | 'exercise'
  | 'habit'
  | 'focus_session'
  | 'task'
  | 'community_event'
  | 'travel'
  | 'holiday'
  | 'personal_event'
  | 'custom';

export type EventStatus =
  | 'recorded'
  | 'predicted'
  | 'imported'
  | 'completed'
  | 'cancelled';

export type EventCategory =
  | 'health'
  | 'reproductive'
  | 'fitness'
  | 'routine'
  | 'adhd'
  | 'life'
  | 'community';

export type PrivacyLevel = 'public' | 'private' | 'sensitive_encrypted';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  kind: CalendarEventKind;
  status: EventStatus;
  category: EventCategory;
  privacy: PrivacyLevel;
  description?: string;
  isAllDay?: boolean;
  recurrence?: 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'none';
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DayCalendarCell {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

/**
 * Format Date to local YYYY-MM-DD without UTC conversion bugs
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse local YYYY-MM-DD safely into local Date object
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Generates an endless or month-bounded calendar grid matrix (6 weeks x 7 days)
 */
export function generateMonthGrid(year: number, monthIndex: number): DayCalendarCell[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const todayStr = formatLocalDate(new Date());
  const cells: DayCalendarCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, monthIndex - 1, day);
    const dateStr = formatLocalDate(prevMonthDate);
    cells.push({
      date: dateStr,
      dayOfMonth: day,
      month: prevMonthDate.getMonth(),
      year: prevMonthDate.getFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, monthIndex, day);
    const dateStr = formatLocalDate(currentDate);
    cells.push({
      date: dateStr,
      dayOfMonth: day,
      month: monthIndex,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: [],
    });
  }

  // Next month leading days (to complete 42 cells grid)
  const remainingCells = 42 - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, monthIndex + 1, day);
    const dateStr = formatLocalDate(nextMonthDate);
    cells.push({
      date: dateStr,
      dayOfMonth: day,
      month: nextMonthDate.getMonth(),
      year: nextMonthDate.getFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: [],
    });
  }

  return cells;
}

/**
 * Deterministically generates daily scheduled tasks and events tailored to
 * the user's active experience and preferences.
 */
export function generateDayAgenda(
  dateStr: string,
  options: {
    experience: ProductExperience;
    hasReproductiveTracking?: boolean;
    cycleData?: CycleData | null;
  }
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const targetDate = parseLocalDate(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 1. Men's Health: Performance, Recovery, Strength, Mental Grounding
  if (options.experience === 'men_health') {
    events.push({
      id: `men_mobility_${dateStr}`,
      title: 'Postural Spine & Hip Mobility',
      date: dateStr,
      startTime: '07:30',
      endTime: '07:45',
      kind: 'exercise',
      status: 'predicted',
      category: 'fitness',
      privacy: 'private',
      description: 'Thoracic openers, hip flexor stretch, gentle cat-cow decompression.',
      recurrence: 'daily',
    });

    events.push({
      id: `men_focus_hydrate_${dateStr}`,
      title: 'Electrolyte & Hydration Check',
      date: dateStr,
      startTime: '12:30',
      endTime: '12:35',
      kind: 'habit',
      status: 'predicted',
      category: 'routine',
      privacy: 'private',
      description: '500ml water with minerals and 2-min posture reset.',
      recurrence: 'daily',
    });

    events.push({
      id: `men_training_${dateStr}`,
      title: isWeekend ? 'Active Outdoor Recovery / Hike' : 'Strength Baseline & Core Resistance',
      date: dateStr,
      startTime: '18:00',
      endTime: '18:40',
      kind: 'exercise',
      status: 'predicted',
      category: 'fitness',
      privacy: 'private',
      description: isWeekend ? 'Low-heart-rate outdoor mobility.' : 'Push-ups, bodyweight squats, kettlebell hinges, and core endurance.',
      recurrence: 'weekdays',
    });

    events.push({
      id: `men_sleep_winddown_${dateStr}`,
      title: 'Sleep Hygiene & Nervous System Decompression',
      date: dateStr,
      startTime: '22:00',
      endTime: '22:20',
      kind: 'sleep',
      status: 'predicted',
      category: 'health',
      privacy: 'private',
      description: 'Screen dimming, breathwork (4-7-8), dark room readiness.',
      recurrence: 'daily',
    });
  }

  // 2. Women's Health: Follicular Rhythm, Pelvic Floor, Restorative Movement
  else if (options.experience === 'women_health') {
    if (options.cycleData) {
      const cycle = getCyclePredictions(
        options.cycleData.lastPeriodDate,
        options.cycleData.cycleLengthDays,
        options.cycleData.periodLengthDays
      );

      if (cycle) {
        // Check if targetDate falls in predicted period
        const nextPeriod = new Date(cycle.nextPeriodDate);
        const daysDiff = Math.round((targetDate.getTime() - nextPeriod.getTime()) / 86400000);
        if (daysDiff >= 0 && daysDiff < options.cycleData.periodLengthDays) {
          events.push({
            id: `cycle_period_${dateStr}`,
            title: 'Predicted Menstrual Bleeding (Estimate)',
            date: dateStr,
            kind: 'period',
            status: 'predicted',
            category: 'reproductive',
            privacy: 'sensitive_encrypted',
            description: 'Tentative forecast based on recorded cycle interval. Keep warm and hydrate.',
            isAllDay: true,
          });
        }

        // Add phase awareness
        events.push({
          id: `cycle_phase_${dateStr}`,
          title: `${cycle.currentPhase.label} Phase Harmony`,
          date: dateStr,
          startTime: '08:00',
          endTime: '08:20',
          kind: 'cycle_phase',
          status: 'predicted',
          category: 'reproductive',
          privacy: 'private',
          description: `Day ${cycle.currentPhase.day} hormonal rhythm. Nutrition and restorative routines aligned.`,
          recurrence: 'daily',
        });
      }
    }

    events.push({
      id: `women_pelvic_flow_${dateStr}`,
      title: 'Pelvic Core & Breathwork',
      date: dateStr,
      startTime: '09:00',
      endTime: '09:15',
      kind: 'exercise',
      status: 'predicted',
      category: 'health',
      privacy: 'private',
      description: 'Gentle pelvic stabilization and diaphragmatic breathing.',
      recurrence: 'daily',
    });

    events.push({
      id: `women_rest_nourish_${dateStr}`,
      title: 'Nourishing Meal & Mineral Check',
      date: dateStr,
      startTime: '13:00',
      endTime: '13:30',
      kind: 'habit',
      status: 'predicted',
      category: 'routine',
      privacy: 'private',
      description: 'Magnesium and iron rich foods aligned with your cycle recommendations.',
      recurrence: 'daily',
    });
  }

  // 3. Pride Wellbeing: Affirming Care, Safe Grounding, HRT reminders
  else {
    events.push({
      id: `pride_grounding_${dateStr}`,
      title: 'Morning Grounding & Intention',
      date: dateStr,
      startTime: '08:00',
      endTime: '08:15',
      kind: 'focus_session',
      status: 'predicted',
      category: 'routine',
      privacy: 'private',
      description: 'Mindful breath, identity affirmation, body scan.',
      recurrence: 'daily',
    });

    events.push({
      id: `pride_movement_${dateStr}`,
      title: 'Body Respect Movement Flow',
      date: dateStr,
      startTime: '17:30',
      endTime: '18:00',
      kind: 'exercise',
      status: 'predicted',
      category: 'fitness',
      privacy: 'private',
      description: 'Low-friction movement to connect with physical vitality without dysphoria triggers.',
      recurrence: 'daily',
    });

    events.push({
      id: `pride_reflection_${dateStr}`,
      title: 'Private Vault Reflection',
      date: dateStr,
      startTime: '21:30',
      endTime: '21:45',
      kind: 'task',
      status: 'predicted',
      category: 'routine',
      privacy: 'sensitive_encrypted',
      description: 'Encrypted personal log and evening decompression.',
      recurrence: 'daily',
    });
  }

  return events;
}

/**
 * Reschedules an event to a new date/time with provenance
 */
export function rescheduleCalendarEvent(
  event: CalendarEvent,
  newDate: string,
  newStartTime?: string
): CalendarEvent {
  return {
    ...event,
    date: newDate,
    startTime: newStartTime ?? event.startTime,
    metadata: {
      ...event.metadata,
      rescheduledFrom: event.date,
      rescheduledAt: new Date().toISOString(),
    },
  };
}

/**
 * Toggles an event between completed and recorded/predicted
 */
export function toggleEventStatus(event: CalendarEvent): CalendarEvent {
  const isNowCompleted = event.status !== 'completed';
  return {
    ...event,
    status: isNowCompleted ? 'completed' : 'recorded',
    completedAt: isNowCompleted ? new Date().toISOString() : undefined,
  };
}
