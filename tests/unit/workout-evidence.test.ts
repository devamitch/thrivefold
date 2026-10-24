import { getGameCatalog } from '../../src/domain/game/gameCatalogService';
import { evaluateObjective, objectiveFormFor } from '../../src/domain/game/objectives';
import { evidenceFromWorkout } from '../../src/domain/game/workoutEvidence';

const tasks = getGameCatalog().tasks;
const facts = { title: 'Home strength basics', minutes: 18, date: '2026-10-25', cameraChecked: true };

test('a real workout satisfies the movement quests that log activity', () => {
  for (const id of ['movement_break', 'walk_or_wheel_log', 'strength_session_record']) {
    const task = tasks.find((t) => t.id === id);
    if (!task) continue;
    const form = objectiveFormFor(task)!;
    const ev = evidenceFromWorkout(form, task.instructions, facts);
    expect(ev).not.toBeNull();
    expect(evaluateObjective(form, ev!, task.instructions)).toEqual([]);
  }
});

test('quests needing answers a workout cannot give are left to the person', () => {
  const form = { objectiveType: 'x', fields: [{ id: 'energyRating', label: 'Energy', kind: 'rating' as const, min: 1, max: 5 }] };
  expect(evidenceFromWorkout(form, [], facts)).toBeNull();
});
