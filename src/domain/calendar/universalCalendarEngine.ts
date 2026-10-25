/**
 * Universal Calendar & Life Planner Engine for Thrivefold
 * Built according to Master Spec & Architecture Guidelines.
 * Handles endless date calculation, recurrence, multi-experience event generation,
 * privacy segregation, and schedule adaptations.
 */

import { ProductExperience } from '../../theme/tokens';
import { getCyclePredictions } from '../health/cycleCalculations';
import type {
  CycleData,
  FlowIntensity,
  PeriodLogRecord,
  PersonalCalendarEvent,
} from '../../stores/useRootStore';

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

// The forecast depends only on these inputs and today, so a calendar view rendering many days
// computes it once instead of once per day.
const cycleMemo = new Map<string, ReturnType<typeof getCyclePredictions>>();
function cachedCyclePredictions(lastPeriodDate: string, cycleLength: number, periodLength: number) {
  const key = `${lastPeriodDate}|${cycleLength}|${periodLength}|${formatLocalDate(new Date())}`;
  let hit = cycleMemo.get(key);
  if (hit === undefined) {
    if (cycleMemo.size > 8) cycleMemo.clear();
    hit = getCyclePredictions(lastPeriodDate, cycleLength, periodLength);
    cycleMemo.set(key, hit);
  }
  return hit;
}

const PHASE_LABEL = { menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal' } as const;

const PERSONAL_EVENT_LABEL: Record<PersonalCalendarEvent['category'], string> = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  appointment: 'Appointment',
  work: 'Work',
  travel: 'Travel',
  reminder: 'Reminder',
  deadline: 'Deadline',
  financial: 'Payment due',
  custom: 'Event',
};

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
    personalEvents?: PersonalCalendarEvent[];
    /** Quest assignments to show on their dates. */
    quests?: { id: string; title: string; date: string; status: string }[];
    /** Saved workouts (plan or self-reported). */
    workouts?: { id: string; date: string; title: string; startedAt: string; minutes: number; verification?: 'camera' | 'manual' }[];
    /** Saved meals with their totals. */
    meals?: { id: string; date: string; type: string; at: string; kcal: number; protein: number }[];
    /** Days with a saved check-in. */
    checkIns?: { date: string; energy: number; mood: number; stress: number; sleepHours: number }[];
  }
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const targetDate = parseLocalDate(dateStr);

  // Add holiday event if this date is a known holiday or health observance
  const holiday = getHolidayForDate(dateStr);
  if (holiday) {
    events.push({
      id: `holiday_${dateStr}`,
      title: holiday.name,
      date: dateStr,
      kind: 'holiday',
      status: 'recorded',
      category: 'life',
      privacy: 'public',
      isAllDay: true,
      description: holiday.description,
    });
  }

  // Personal events (birthdays, anniversaries, appointments, reminders) with their repeat rule.
  if (options.personalEvents) {
    const [, tm, td] = dateStr.split('-').map(Number);
    const weekday = targetDate.getDay();
    for (const pe of options.personalEvents) {
      const [, pm, pd] = pe.date.split('-').map(Number);
      const started = pe.date <= dateStr;
      const isMatch =
        pe.date === dateStr ||
        (started && pe.recurrence === 'yearly' && pm === tm && pd === td) ||
        (started && pe.recurrence === 'monthly' && pd === td) ||
        (started && pe.recurrence === 'weekly' && parseLocalDate(pe.date).getDay() === weekday);
      if (isMatch) {
        events.push({
          id: pe.id,
          title: pe.title,
          date: dateStr,
          startTime: pe.time || undefined,
          kind: pe.category === 'appointment' ? 'health_appointment' : pe.category === 'travel' ? 'travel' : 'personal_event',
          status: 'recorded',
          category: 'life',
          privacy: 'sensitive_encrypted',
          isAllDay: !pe.time,
          description: pe.notes || PERSONAL_EVENT_LABEL[pe.category],
          metadata: { personalEventId: pe.id },
        });
      }
    }
  }

  // Recorded period for this date if present in periodHistory (Only for Women's health or explicit reproductive tracking)
  const canTrackCycle = options.experience === 'women_health' || Boolean(options.hasReproductiveTracking);
  if (canTrackCycle && options.cycleData?.periodHistory) {
    for (const p of options.cycleData.periodHistory) {
      if (p.startDate <= dateStr) {
        const effectiveEnd = p.endDate || (p.isOngoing ? formatLocalDate(new Date()) : p.startDate);
        if (dateStr <= effectiveEnd) {
          events.push({
            id: `rec_period_${p.id}_${dateStr}`,
            title: `Period (${p.flowIntensity || 'medium'} flow)`,
            date: dateStr,
            kind: 'period',
            status: 'recorded',
            category: 'reproductive',
            privacy: 'sensitive_encrypted',
            isAllDay: true,
            description: p.notes || (p.painLevel ? `Pain ${p.painLevel}/10.` : 'Logged by you.'),
          });
          break;
        }
      }
    }
  }

  // Cycle estimates for women's health, only when the person has logged a period.
  if (options.experience === 'women_health') {
    if (options.cycleData) {
      const cycle = cachedCyclePredictions(
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
            title: 'Period expected (estimate)',
            date: dateStr,
            kind: 'period',
            status: 'predicted',
            category: 'reproductive',
            privacy: 'sensitive_encrypted',
            description: 'Estimated from the cycle length you entered. It can be off by a few days.',
            isAllDay: true,
          });
        }

        // Estimated phase for this date (not today's phase repeated).
        const phase = cycle.cycleDayMap.get(dateStr);
        if (phase) {
          events.push({
            id: `cycle_phase_${dateStr}`,
            title: `${PHASE_LABEL[phase]} phase (estimate)`,
            date: dateStr,
            kind: 'cycle_phase',
            status: 'predicted',
            category: 'reproductive',
            privacy: 'private',
            isAllDay: true,
            description: 'Worked out from your last period and cycle length.',
          });
        }
      }
    }
  }

  // The person's own quests for this date. Nothing else is scheduled on their behalf.
  const hhmm = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  for (const c of options.checkIns ?? []) {
    if (c.date !== dateStr) continue;
    events.push({
      id: `checkin_${dateStr}`,
      title: 'Daily check-in',
      date: dateStr,
      kind: 'habit',
      status: 'completed',
      category: 'health',
      privacy: 'private',
      isAllDay: true,
      description: `Energy ${c.energy}, mood ${c.mood}, stress ${c.stress}, sleep ${c.sleepHours} h.`,
    });
  }
  for (const w of options.workouts ?? []) {
    if (w.date !== dateStr) continue;
    events.push({
      id: w.id,
      title: w.title,
      date: dateStr,
      startTime: hhmm(w.startedAt),
      kind: 'exercise',
      status: 'completed',
      category: 'fitness',
      privacy: 'private',
      description: `${w.minutes} min${w.verification === 'camera' ? ', camera-checked' : w.verification === 'manual' ? ', self-reported' : ''}.`,
      metadata: { workoutId: w.id },
    });
  }
  for (const m of options.meals ?? []) {
    if (m.date !== dateStr) continue;
    events.push({
      id: m.id,
      title: m.type.charAt(0).toUpperCase() + m.type.slice(1),
      date: dateStr,
      startTime: hhmm(m.at),
      kind: 'habit',
      status: 'recorded',
      category: 'health',
      privacy: 'private',
      description: `${m.kcal} kcal, ${m.protein} g protein (estimate).`,
      metadata: { mealId: m.id },
    });
  }

  for (const q of options.quests ?? []) {
    if (q.date !== dateStr || q.status === 'replaced') continue;
    events.push({
      id: q.id,
      title: q.title,
      date: dateStr,
      kind: 'task',
      status: q.status === 'verified' || q.status === 'self_reported' ? 'completed' : 'recorded',
      category: 'routine',
      privacy: 'private',
      isAllDay: true,
      description: q.status === 'skipped' ? 'Skipped for today.' : 'One of today\'s quests.',
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

/**
 * Derives the biological or estimated cycle phase for a given date
 */
export function deriveCyclePhaseForDate(
  dateStr: string,
  cycleData?: CycleData | null
): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
  if (!cycleData?.lastPeriodDate) {
    return 'follicular';
  }
  const predictions = getCyclePredictions(
    cycleData.lastPeriodDate,
    cycleData.cycleLengthDays ?? 28,
    cycleData.periodLengthDays ?? 5
  );
  if (!predictions) return 'follicular';
  return predictions.cycleDayMap.get(dateStr) ?? 'follicular';
}

export type DateRangeType = 'none' | 'period' | 'fertile' | 'ovulation' | 'follicular' | 'luteal';
export type DateRangePosition = 'none' | 'single' | 'start' | 'middle' | 'end';

export interface CalendarHoliday {
  name: string;
  category: 'public' | 'health_observance' | 'cultural';
  emoji: string;
  description: string;
}

export interface DayRangeInfo {
  rangeType: DateRangeType;
  rangePosition: DateRangePosition;
  cycleDay?: number;
  isPeriod: boolean;
  isRecordedPeriod: boolean;
  isPredictedPeriod: boolean;
  flowIntensity?: FlowIntensity;
  isFertile: boolean;
  isOvulationPeak: boolean;
  isFollicular: boolean;
  isLuteal: boolean;
  isPmsWindow: boolean;
  phaseLabel: string;
  pregnancyWeek?: number;
  holiday?: CalendarHoliday;
  personalEvents: PersonalCalendarEvent[];
  taskStats: {
    total: number;
    completed: number;
    percent: number;
  };
}

/**
 * Deterministic holiday provider covering major federal, cultural holidays
 * and international health observances.
 */
export function getHolidayForDate(dateStr: string): CalendarHoliday | null {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon, 4 is Thu, etc.

  // Fixed Date Holidays & Observances
  if (month === 1 && day === 1) {
    return { name: "New Year's Day", category: 'public', emoji: '🎉', description: 'Fresh calendar year renewal & goal setting.' };
  }
  if (month === 2 && day === 14) {
    return { name: "Valentine's Day", category: 'cultural', emoji: '💌', description: 'Celebration of love, empathy, and affectionate connections.' };
  }
  if (month === 3 && day === 8) {
    return { name: "International Women's Day", category: 'health_observance', emoji: '🌸', description: 'Celebrating women’s achievements, wellness, and reproductive health equity.' };
  }
  if (month === 4 && day === 7) {
    return { name: 'World Health Day', category: 'health_observance', emoji: '🌿', description: 'Global awareness of universal healthcare, longevity, and self-care.' };
  }
  if (month === 4 && day === 22) {
    return { name: 'Earth Day', category: 'cultural', emoji: '🌍', description: 'Environmental stewardship, nature walks, and grounding mindfulness.' };
  }
  if (month === 5 && day === 1) {
    return { name: 'May Day & Global Wellness', category: 'cultural', emoji: '🌱', description: 'Spring renewal, vitality, and outdoor activity.' };
  }
  if (month === 6 && day === 19) {
    return { name: 'Juneteenth', category: 'public', emoji: '🕊️', description: 'National Independence Day commemorating freedom and community resilience.' };
  }
  if (month === 7 && day === 4) {
    return { name: 'Independence Day', category: 'public', emoji: '🎆', description: 'Summer holiday, outdoor activity, and festive community gatherings.' };
  }
  if (month === 10 && day === 10) {
    return { name: 'World Mental Health Day', category: 'health_observance', emoji: '🧠', description: 'Prioritizing emotional resilience, stress reduction, and mindful presence.' };
  }
  if (month === 10 && day === 31) {
    return { name: 'Halloween', category: 'cultural', emoji: '🎃', description: 'Festive autumn celebration and playful social gathering.' };
  }
  if (month === 11 && day === 11) {
    return { name: 'Veterans Day', category: 'public', emoji: '🎖️', description: 'Honoring service, dedication, and community care.' };
  }
  if (month === 12 && day === 24) {
    return { name: 'Christmas Eve', category: 'cultural', emoji: '🕯️', description: 'Cozy winter evening, restorative rest, and peaceful reflection.' };
  }
  if (month === 12 && day === 25) {
    return { name: 'Christmas Day', category: 'public', emoji: '🎄', description: 'Warmth, family connection, generosity, and seasonal celebration.' };
  }
  if (month === 12 && day === 31) {
    return { name: "New Year's Eve", category: 'cultural', emoji: '✨', description: 'Reflecting on the past year’s journey and stepping into new beginnings.' };
  }

  // Floating Holidays
  // Martin Luther King Jr. Day: 3rd Monday in January (between 15th and 21st)
  if (month === 1 && dayOfWeek === 1 && day >= 15 && day <= 21) {
    return { name: 'Martin Luther King Jr. Day', category: 'public', emoji: '⚖️', description: 'Honoring civil rights, community service, and compassionate action.' };
  }
  // Presidents' Day: 3rd Monday in February (between 15th and 21st)
  if (month === 2 && dayOfWeek === 1 && day >= 15 && day <= 21) {
    return { name: "Presidents' Day", category: 'public', emoji: '🏛️', description: 'Commemorating national leadership and civic responsibility.' };
  }
  // Mother's Day: 2nd Sunday in May (between 8th and 14th)
  if (month === 5 && dayOfWeek === 0 && day >= 8 && day <= 14) {
    return { name: "Mother's Day", category: 'cultural', emoji: '💐', description: 'Celebrating mothers, nurturing bonds, and maternal wellness.' };
  }
  // Memorial Day: Last Monday in May (between 25th and 31st)
  if (month === 5 && dayOfWeek === 1 && day >= 25) {
    return { name: 'Memorial Day', category: 'public', emoji: '🇺🇸', description: 'National remembrance, peaceful family gatherings, and active summer launch.' };
  }
  // Father's Day: 3rd Sunday in June (between 15th and 21st)
  if (month === 6 && dayOfWeek === 0 && day >= 15 && day <= 21) {
    return { name: "Father's Day", category: 'cultural', emoji: '👔', description: 'Honoring fatherhood, mentorship, and familial strength.' };
  }
  // Labor Day: 1st Monday in September (between 1st and 7th)
  if (month === 9 && dayOfWeek === 1 && day <= 7) {
    return { name: 'Labor Day', category: 'public', emoji: '🛠️', description: 'Celebration of hard work, healthy rest, and work-life balance.' };
  }
  // Thanksgiving: 4th Thursday in November (between 22nd and 28th)
  if (month === 11 && dayOfWeek === 4 && day >= 22 && day <= 28) {
    return { name: 'Thanksgiving Day', category: 'public', emoji: '🦃', description: 'Gratitude, mindful nourishment, and heartfelt family time.' };
  }

  return null;
}

/**
 * Calculates continuous date range highlight geometry (caps and connectors)
 * across the calendar grid rows, distinguishing confirmed recorded periods,
 * predicted ranges, fertile windows, and personal milestones.
 */
export function getDayRangeInfo(
  dateStr: string,
  cellIndexInGrid: number,
  cycleData?: CycleData | null,
  dayEvents?: CalendarEvent[],
  personalEvents?: PersonalCalendarEvent[]
): DayRangeInfo {
  const holiday = getHolidayForDate(dateStr) ?? undefined;

  const total = dayEvents ? dayEvents.length : 0;
  const completed = dayEvents ? dayEvents.filter((e) => e.status === 'completed').length : 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const taskStats = { total, completed, percent };

  // Match personal events (including annual recurrence)
  const matchingPersonalEvents: PersonalCalendarEvent[] = [];
  if (personalEvents) {
    const parts = dateStr.split('-').map(Number);
    const targetMonth = parts[1];
    const targetDay = parts[2];
    for (const pe of personalEvents) {
      const pParts = pe.date.split('-').map(Number);
      const isMatch =
        pe.date === dateStr ||
        (pe.recurrence === 'yearly' && pParts[1] === targetMonth && pParts[2] === targetDay);
      if (isMatch) {
        matchingPersonalEvents.push(pe);
      }
    }
  }

  const columnIndex = cellIndexInGrid % 7; // 0 = Mon, 6 = Sun

  // 1. Check for CONFIRMED RECORDED period in periodHistory
  let recordedPeriod: PeriodLogRecord | undefined;
  if (cycleData?.periodHistory && cycleData.periodHistory.length > 0) {
    for (const p of cycleData.periodHistory) {
      if (p.startDate <= dateStr) {
        const effectiveEnd = p.endDate || (p.isOngoing ? formatLocalDate(new Date()) : p.startDate);
        if (dateStr <= effectiveEnd) {
          recordedPeriod = p;
          break;
        }
      }
    }
  }

  if (recordedPeriod) {
    const effectiveEnd =
      recordedPeriod.endDate || (recordedPeriod.isOngoing ? formatLocalDate(new Date()) : recordedPeriod.startDate);
    const connectsLeft = dateStr > recordedPeriod.startDate && columnIndex > 0;
    const connectsRight = dateStr < effectiveEnd && columnIndex < 6;

    let rangePosition: DateRangePosition = 'single';
    if (connectsLeft && connectsRight) {
      rangePosition = 'middle';
    } else if (!connectsLeft && connectsRight) {
      rangePosition = 'start';
    } else if (connectsLeft && !connectsRight) {
      rangePosition = 'end';
    }

    let cycleDay: number | undefined;
    if (cycleData?.lastPeriodDate) {
      const lpd = parseLocalDate(cycleData.lastPeriodDate);
      const targetDate = parseLocalDate(dateStr);
      const diff = Math.floor((targetDate.getTime() - lpd.getTime()) / 86400000);
      cycleDay = diff >= 0 ? diff + 1 : undefined;
    }

    return {
      rangeType: 'period',
      rangePosition,
      cycleDay,
      isPeriod: true,
      isRecordedPeriod: true,
      isPredictedPeriod: false,
      flowIntensity: recordedPeriod.flowIntensity,
      isFertile: false,
      isOvulationPeak: false,
      isFollicular: true,
      isLuteal: false,
      isPmsWindow: false,
      phaseLabel: `Follicular Phase (Recorded Bleed: ${recordedPeriod.flowIntensity.toUpperCase()})`,
      holiday,
      personalEvents: matchingPersonalEvents,
      taskStats,
    };
  }

  // 2. Pregnancy Context: Suppress standard period/ovulation forecasts
  if (cycleData?.reproductiveContext === 'pregnant') {
    let pregnancyWeek: number | undefined;
    if (cycleData.lastPeriodDate) {
      const lpd = parseLocalDate(cycleData.lastPeriodDate);
      const targetDate = parseLocalDate(dateStr);
      const diff = Math.floor((targetDate.getTime() - lpd.getTime()) / 86400000);
      if (diff >= 0 && diff <= 294) {
        pregnancyWeek = Math.floor(diff / 7);
      }
    }
    return {
      rangeType: 'none',
      rangePosition: 'none',
      isPeriod: false,
      isRecordedPeriod: false,
      isPredictedPeriod: false,
      isFertile: false,
      isOvulationPeak: false,
      isFollicular: false,
      isLuteal: false,
      isPmsWindow: false,
      phaseLabel: pregnancyWeek !== undefined ? `Gestational Week ${pregnancyWeek}` : 'Pregnancy Timeline',
      pregnancyWeek,
      holiday,
      personalEvents: matchingPersonalEvents,
      taskStats,
    };
  }

  // 3. Fallback to PREDICTED Cycle Range
  if (!cycleData?.lastPeriodDate) {
    return {
      rangeType: 'none',
      rangePosition: 'none',
      isPeriod: false,
      isRecordedPeriod: false,
      isPredictedPeriod: false,
      isFertile: false,
      isOvulationPeak: false,
      isFollicular: false,
      isLuteal: false,
      isPmsWindow: false,
      phaseLabel: 'No Cycle Baseline',
      holiday,
      personalEvents: matchingPersonalEvents,
      taskStats,
    };
  }

  const lpd = parseLocalDate(cycleData.lastPeriodDate);
  const targetDate = parseLocalDate(dateStr);
  const cycleLength = cycleData.cycleLengthDays ?? 28;
  const periodLength = cycleData.periodLengthDays ?? 5;

  const msDiff = targetDate.getTime() - lpd.getTime();
  const daysDiff = Math.floor(msDiff / 86400000);
  const rawCycleDay = daysDiff % cycleLength;
  const cycleDay = (rawCycleDay < 0 ? rawCycleDay + cycleLength : rawCycleDay) + 1; // 1-based

  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay;

  const isPeriod = cycleDay >= 1 && cycleDay <= periodLength;
  const isFertile = cycleDay >= fertileStart && cycleDay <= fertileEnd;
  const isOvulationPeak = cycleDay === ovulationDay;
  const isFollicular = isPeriod || (cycleDay >= 1 && cycleDay < ovulationDay - 1);
  const isLuteal = cycleDay > ovulationDay + 1 && cycleDay <= cycleLength;
  const isPmsWindow = cycleDay >= cycleLength - 4 && cycleDay <= cycleLength;

  let rangeType: DateRangeType = 'none';
  let rangePosition: DateRangePosition = 'none';

  if (isPeriod) {
    rangeType = 'period';
    const connectsLeft = cycleDay > 1 && columnIndex > 0;
    const connectsRight = cycleDay < periodLength && columnIndex < 6;

    if (connectsLeft && connectsRight) {
      rangePosition = 'middle';
    } else if (!connectsLeft && connectsRight) {
      rangePosition = 'start';
    } else if (connectsLeft && !connectsRight) {
      rangePosition = 'end';
    } else {
      rangePosition = 'single';
    }
  } else if (isFertile) {
    rangeType = isOvulationPeak ? 'ovulation' : 'fertile';
    const connectsLeft = cycleDay > fertileStart && columnIndex > 0;
    const connectsRight = cycleDay < fertileEnd && columnIndex < 6;

    if (connectsLeft && connectsRight) {
      rangePosition = 'middle';
    } else if (!connectsLeft && connectsRight) {
      rangePosition = 'start';
    } else if (connectsLeft && !connectsRight) {
      rangePosition = 'end';
    } else {
      rangePosition = 'single';
    }
  } else if (isFollicular) {
    rangeType = 'follicular';
    const connectsLeft = cycleDay > (periodLength + 1) && columnIndex > 0;
    const connectsRight = cycleDay < (fertileStart - 1) && columnIndex < 6;

    if (connectsLeft && connectsRight) {
      rangePosition = 'middle';
    } else if (!connectsLeft && connectsRight) {
      rangePosition = 'start';
    } else if (connectsLeft && !connectsRight) {
      rangePosition = 'end';
    } else {
      rangePosition = 'single';
    }
  } else if (isLuteal) {
    rangeType = 'luteal';
    const lutealStart = ovulationDay + 1;
    const connectsLeft = cycleDay > lutealStart && columnIndex > 0;
    const connectsRight = cycleDay < cycleLength && columnIndex < 6;

    if (connectsLeft && connectsRight) {
      rangePosition = 'middle';
    } else if (!connectsLeft && connectsRight) {
      rangePosition = 'start';
    } else if (connectsLeft && !connectsRight) {
      rangePosition = 'end';
    } else {
      rangePosition = 'single';
    }
  }

  let phaseLabel = 'Follicular Phase';
  if (isPeriod) {
    phaseLabel = 'Follicular Phase (Menstrual Bleed)';
  } else if (isOvulationPeak) {
    phaseLabel = 'Ovulation Day (Estimated Peak)';
  } else if (isFertile) {
    phaseLabel = 'Fertile Window (Estimated)';
  } else if (isPmsWindow) {
    phaseLabel = 'Luteal Phase (Late / Premenstrual Window)';
  } else if (isLuteal) {
    phaseLabel = 'Luteal Phase (Mid-Luteal)';
  } else if (cycleDay > cycleLength) {
    phaseLabel = 'Cycle Overdue / Awaiting Period';
  }

  return {
    rangeType,
    rangePosition,
    cycleDay,
    isPeriod,
    isRecordedPeriod: false,
    isPredictedPeriod: isPeriod,
    isFertile,
    isOvulationPeak,
    isFollicular,
    isLuteal,
    isPmsWindow,
    phaseLabel,
    holiday,
    personalEvents: matchingPersonalEvents,
    taskStats,
  };
}

/**
 * Generates an endless or week-bounded calendar grid (Monday to Sunday)
 */
export function generateWeekGrid(selectedDate: Date): DayCalendarCell[] {
  const dayOfWeek = (selectedDate.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(selectedDate.getTime() - dayOfWeek * 86400000);
  const todayStr = formatLocalDate(new Date());

  const cells: DayCalendarCell[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday.getTime() + i * 86400000);
    const dateStr = formatLocalDate(current);
    cells.push({
      date: dateStr,
      dayOfMonth: current.getDate(),
      month: current.getMonth(),
      year: current.getFullYear(),
      isCurrentMonth: current.getMonth() === selectedDate.getMonth(),
      isToday: dateStr === todayStr,
      events: [],
    });
  }
  return cells;
}

/**
 * Generates an annual 12-month rolling horizon summary with estimated periods and milestones
 */
export function generateYearForecast(
  year: number,
  cycleData?: CycleData | null,
  personalEvents?: PersonalCalendarEvent[]
): {
  monthIndex: number;
  monthName: string;
  year: number;
  estimatedPeriodStart: string;
  estimatedPeriodEnd: string;
  milestones: PersonalCalendarEvent[];
}[] {
  const forecast = [];
  const cycleLength = cycleData?.cycleLengthDays ?? 28;
  const periodDuration = cycleData?.periodLengthDays ?? 5;
  const baseLPD = cycleData?.lastPeriodDate
    ? parseLocalDate(cycleData.lastPeriodDate)
    : new Date(year, 0, 1);

  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(year, m, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });

    // Milestones in this month
    const monthMilestones = (personalEvents || []).filter((pe) => {
      const parts = pe.date.split('-').map(Number);
      return parts[1] - 1 === m;
    });

    const targetMidMonth = new Date(year, m, 15);
    const approxCycleCount = Math.max(
      0,
      Math.floor((targetMidMonth.getTime() - baseLPD.getTime()) / (cycleLength * 86400000))
    );
    const cycleStart = new Date(baseLPD.getTime() + approxCycleCount * cycleLength * 86400000);
    const periodEnd = new Date(cycleStart.getTime() + (periodDuration - 1) * 86400000);

    forecast.push({
      monthIndex: m,
      monthName,
      year,
      estimatedPeriodStart: formatLocalDate(cycleStart),
      estimatedPeriodEnd: formatLocalDate(periodEnd),
      milestones: monthMilestones,
    });
  }
  return forecast;
}

export interface AgendaDayGroup {
  date: string;
  dayName: string;
  dayOfMonth: number;
  monthName: string;
  isToday: boolean;
  rangeInfo: DayRangeInfo;
  events: CalendarEvent[];
  personalEvents: PersonalCalendarEvent[];
  holiday?: CalendarHoliday;
}

/**
 * Generates continuous rolling agenda day groups for Day and Agenda views
 */
export function generateAgendaRange(
  startDate: Date,
  daysCount: number = 30,
  options: {
    experience: ProductExperience;
    cycleData?: CycleData | null;
    personalEvents?: PersonalCalendarEvent[];
  }
): AgendaDayGroup[] {
  const groups: AgendaDayGroup[] = [];
  const todayStr = formatLocalDate(new Date());

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const dateStr = formatLocalDate(d);
    const dayEvents = generateDayAgenda(dateStr, options);
    const rangeInfo = getDayRangeInfo(dateStr, i, options.cycleData, dayEvents, options.personalEvents);

    groups.push({
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
      rangeInfo,
      events: dayEvents,
      personalEvents: rangeInfo.personalEvents,
      holiday: rangeInfo.holiday,
    });
  }

  return groups;
}


