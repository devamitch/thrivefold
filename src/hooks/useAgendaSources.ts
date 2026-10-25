import { useMemo } from 'react';

import { exerciseById, planById } from '../domain/fitness/workouts';
import { getTaskById } from '../domain/game/gameCatalogService';
import { totals } from '../domain/nutrition/foods';
import { useRootStore, useShallow } from '../stores/useRootStore';
import { generateObservanceCalendarEvents, type FaithTradition } from '../domain/community/religionEngine';
import type { PersonalCalendarEvent } from '../stores/slices/healthSlice';

/**
 * The saved records every calendar view shows: quests (from their real assignments),
 * workouts, meals, check-ins, personal events, and voluntary faith/mindful observances.
 * One source so Today and the Calendar screen agree.
 */
export function useAgendaSources() {
  const { assignments, sessions, meals, checkIns, personalEvents, observances } = useRootStore(
    useShallow((s) => ({
      personalEvents: s.personalEvents,
      assignments: s.dailyAssignments,
      sessions: s.workoutSessions,
      meals: s.mealLogs,
      checkIns: s.checkInHistory,
      observances: s.onboarding.observances ?? [],
    })),
  );

  return useMemo(() => {
    // Map user's voluntary observances to supported faith traditions
    const selectedTraditions: FaithTradition[] = [];
    for (const obs of observances) {
      const lower = obs.toLowerCase();
      if (lower.includes('islam') || lower.includes('ramadan')) selectedTraditions.push('islam');
      if (lower.includes('hindu') || lower.includes('ekadashi')) selectedTraditions.push('hinduism');
      if (lower.includes('christian') || lower.includes('lent')) selectedTraditions.push('christianity');
      if (lower.includes('judaism') || lower.includes('shabbat')) selectedTraditions.push('judaism');
      if (lower.includes('buddhis')) selectedTraditions.push('buddhism');
      if (lower.includes('sikh')) selectedTraditions.push('sikhism');
      if (lower.includes('jain')) selectedTraditions.push('jainism');
      if (lower.includes('bahai')) selectedTraditions.push('bahai');
    }

    const currentYear = new Date().getFullYear();
    const observanceEvents = selectedTraditions.flatMap((t) =>
      generateObservanceCalendarEvents(t, [], currentYear),
    );

    const mergedPersonalEvents: PersonalCalendarEvent[] = [
      ...personalEvents,
      ...observanceEvents.map((evt) => ({
        id: evt.id,
        title: evt.title,
        date: evt.date,
        category: 'reminder' as const,
        notes: evt.description,
        recurrence: 'yearly' as const,
      })),
    ];

    return {
      quests: assignments.map((a) => ({
        id: a.assignmentId,
        title: getTaskById(a.taskId)?.title ?? 'Quest',
        date: a.assignedDate,
        status: a.status,
      })),
      workouts: sessions.map((w) => ({
        id: w.id,
        date: w.date,
        startedAt: w.startedAt,
        minutes: Math.max(1, Math.round((Date.parse(w.finishedAt) - Date.parse(w.startedAt)) / 60000)),
        verification: w.verification,
        title:
          planById(w.planId)?.title ??
          (w.entries.length === 1 ? (exerciseById(w.entries[0].exerciseId)?.name ?? 'Workout') : 'Workout'),
      })),
      meals: meals.map((m) => {
        const t = totals(m.items);
        return { id: m.id, date: m.date, type: m.type, at: m.at, kcal: t.kcal, protein: t.protein };
      }),
      checkIns,
      personalEvents: mergedPersonalEvents,
      observanceEvents,
    };
  }, [assignments, sessions, meals, checkIns, personalEvents, observances]);
}
