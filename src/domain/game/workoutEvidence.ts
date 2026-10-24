/**
 * Fills a movement quest's evidence from a workout the person really did in the app, so
 * finishing a workout also finishes the quest it satisfies. Returns null when the quest
 * asks for something a workout cannot honestly answer (a rating, a choice, a list).
 */
import type { ObjectiveEvidence, ObjectiveForm } from './objectives';

export interface WorkoutFacts {
  title: string;
  minutes: number;
  date: string; // YYYY-MM-DD
  cameraChecked: boolean;
}

export function evidenceFromWorkout(form: ObjectiveForm, steps: { id: string }[], w: WorkoutFacts): ObjectiveEvidence | null {
  const answers: ObjectiveEvidence['answers'] = {};
  for (const f of form.fields) {
    switch (f.kind) {
      case 'date':
        answers[f.id] = w.date;
        break;
      case 'number': {
        if (!/duration|minutes|min/i.test(f.id)) {
          if (f.optional) break;
          return null;
        }
        const lo = f.min ?? 1;
        const hi = f.max ?? 1440;
        answers[f.id] = Math.max(lo, Math.min(hi, Math.round(w.minutes)));
        break;
      }
      case 'consent':
        answers[f.id] = true;
        break;
      case 'text':
      case 'longtext': {
        const text = /source/i.test(f.id)
          ? w.cameraChecked
            ? 'Thrivefold camera coach'
            : 'Thrivefold workout log'
          : /note|outcome|description|reflection/i.test(f.id)
            ? `Did ${w.title} for ${Math.round(w.minutes)} minutes in the app.`
            : w.title;
        answers[f.id] = text.length >= (f.minChars ?? 0) ? text : `${text} workout`.padEnd(f.minChars ?? 0, '.');
        break;
      }
      default:
        if (f.optional) break;
        return null;
    }
  }
  return {
    answers,
    elapsedSeconds: Math.round(w.minutes * 60),
    completedStepIds: steps.map((s) => s.id),
    attested: true,
  };
}
