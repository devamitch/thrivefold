import type { CalendarEvent } from '../domain/calendar/universalCalendarEngine';

/**
 * Where a calendar item opens: its real record. Quests open in place (the caller shows the
 * quest sheet), so they return null here.
 */
export function routeForEvent(event: CalendarEvent): string | null {
  const meta = (event.metadata ?? {}) as { workoutId?: string; mealId?: string };
  if (meta.workoutId) return `/(app)/train/session/${meta.workoutId}`;
  if (meta.mealId) return `/(app)/health/meal/${meta.mealId}`;
  if (event.id.startsWith('checkin_')) return '/(app)/health/history';
  if (event.kind === 'period' || event.kind === 'spotting') return '/(app)/health/cycle';
  if (event.kind === 'symptom') return '/(app)/health/symptoms';
  if (event.kind === 'medication_reminder') return '/(app)/health/medications';
  return null;
}
