import { useMemo } from 'react';

import { exerciseById, planById } from '../domain/fitness/workouts';
import { getTaskById } from '../domain/game/gameCatalogService';
import { totals } from '../domain/nutrition/foods';
import { useRootStore, useShallow } from '../stores/useRootStore';

/**
 * The saved records every calendar view shows: quests (from their real assignments),
 * workouts, meals and check-ins. One source so Today and the Calendar screen agree.
 */
export function useAgendaSources() {
  const { assignments, sessions, meals, checkIns } = useRootStore(
    useShallow((s) => ({
      assignments: s.dailyAssignments,
      sessions: s.workoutSessions,
      meals: s.mealLogs,
      checkIns: s.checkInHistory,
    })),
  );
  return useMemo(
    () => ({
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
    }),
    [assignments, sessions, meals, checkIns],
  );
}
