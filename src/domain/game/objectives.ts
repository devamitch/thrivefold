/**
 * Objective-specific evidence for quests. Each catalog task carries an `objective` with
 * explicit completion criteria (required fields, minimum characters, timers, ranges). This
 * module turns those criteria into a form the app can show and an evaluator that checks the
 * answers. Objective types without a registered evaluator are reported as unsupported, so
 * they are never assigned or rewarded through a generic "I did it" button.
 */

export type ObjectiveFieldKind = 'text' | 'longtext' | 'number' | 'rating' | 'date' | 'choice' | 'consent' | 'lines';

export interface ObjectiveField {
  id: string;
  label: string;
  kind: ObjectiveFieldKind;
  optional?: boolean;
  /** text / longtext: minimum trimmed characters. */
  minChars?: number;
  /** number / rating: inclusive range. */
  min?: number;
  max?: number;
  unit?: string;
  /** choice: allowed values. */
  options?: string[];
  /** lines: how many non-empty lines are required. */
  minItems?: number;
  maxItems?: number;
}

export interface ObjectiveForm {
  objectiveType: string;
  fields: ObjectiveField[];
  /** Real elapsed time the in-app timer must have run, when the objective is timed. */
  minimumElapsedSeconds?: number;
  /** The person must mark each instruction step done (or stop safely when allowed). */
  requireSteps?: boolean;
  allowSafeStop?: boolean;
  /** At least one of the fields must be filled (all are individually optional). */
  atLeastOneField?: boolean;
  /** A self-report objective: an explicit, unticked honesty statement is required. */
  requireAttestation?: boolean;
}

export interface ObjectiveEvidence {
  answers: Record<string, string | number | boolean | undefined>;
  /** Seconds the in-app timer actually ran for this attempt. */
  elapsedSeconds: number;
  completedStepIds: string[];
  safeStop?: boolean;
  attested: boolean;
}

export interface ObjectiveSource {
  id: string;
  objective?: { type?: string; completionCriteria?: Record<string, unknown> } | null;
  instructions: { id: string }[];
  verificationClass: string;
  /** v1 tasks describe evidence through verificationRequirements instead of an objective. */
  verificationRequirements?: { type: string; minDurationSeconds?: number }[];
}

const LABELS: Record<string, string> = {
  goalText: 'Your goal',
  personalReason: 'Why it matters to you',
  nextAction: 'One small next action',
  goal: 'Your goal',
  personalSuccessDefinition: 'What success looks like to you',
  energyRating: 'Energy (1-5)',
  taskDescription: 'What you focused on',
  outcome: 'How it went',
  chosenPlan: 'The recovery you chose',
  activityDate: 'Date',
  movementType: 'Type of movement',
  durationMinutes: 'Minutes',
  activityType: 'Activity',
  source: 'How you tracked it',
  restedRating: 'How rested you feel (1-5)',
  dietaryPattern: 'Eating pattern you follow',
  recommendationConsent: 'Use this to tailor food suggestions',
  mealDescription: 'Meal',
  ingredientList: 'Ingredients',
  preferenceCheck: 'This fits my food preferences',
  factor: 'What you changed in your space',
  action: 'What you did',
  supportOption: 'Who or what you can turn to',
  fallbackOption: 'A backup option',
  scenario: 'The situation',
  boundaryStatement: 'What you would say',
  followUpOption: 'What you would do next',
  topic: 'Topic',
  question: 'Your question',
  chosenOptions: 'What you chose',
  environment: 'Where you will do it',
  protectionAction: 'How you will stay safe',
  stopOrSeekHelpCue: 'When you would stop or get help',
  boundary: 'Your boundary',
  symptomType: 'What you noticed',
  date: 'Date',
  routineType: 'Routine',
  chosenArea: 'Area you chose',
  changeDescription: 'What you changed',
  shortDescription: 'What you made or did',
  firstStep: 'Your first step',
  skillId: 'Skill to build',
  plan: 'Your plan',
  reviewedAt: 'Date reviewed',
  reviewedDate: 'Date reviewed',
  feeling: 'How you feel',
  note: 'A short note',
  questions: 'Questions for your appointment (one per line)',
  steps: 'Steps you chose (one per line)',
  items: 'Items reviewed (one per line)',
  options: 'Options (one per line)',
  criteria: 'What matters in deciding (one per line)',
};

export function humanize(id: string): string {
  if (LABELS[id]) return LABELS[id];
  const words = id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const range = (v: unknown): [number, number] | undefined =>
  Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number') ? [v[0], v[1]] : undefined;

/** Infer a sensible field for a catalog field id. */
function fieldFor(id: string, criteria: Record<string, unknown>): ObjectiveField {
  const minChars = typeof criteria.minimumCharactersPerField === 'number' ? criteria.minimumCharactersPerField : 2;
  if (/Date$|At$|^date$/.test(id)) return { id, label: humanize(id), kind: 'date' };
  if (/Consent$|Check$/.test(id)) return { id, label: humanize(id), kind: 'consent' };
  if (id === 'durationMinutes') {
    const [min, max] = range(criteria.durationMinutesRange) ?? [1, 1440];
    return { id, label: humanize(id), kind: 'number', min, max, unit: 'min' };
  }
  if (/Rating$/.test(id)) {
    const [min, max] = range(criteria.ratingRange) ?? [1, 5];
    return { id, label: humanize(id), kind: 'rating', min, max };
  }
  const long = /Text|Reason|Description|Statement|Definition|outcome|scenario|question|Plan$/.test(id);
  return { id, label: humanize(id), kind: long ? 'longtext' : 'text', minChars };
}

/**
 * The form for a task, or null when its objective has no registered evaluator in this build.
 */
export function objectiveFormFor(task: ObjectiveSource): ObjectiveForm | null {
  const type = task.objective?.type;
  const criteria = (task.objective?.completionCriteria ?? {}) as Record<string, unknown>;
  const required = Array.isArray(criteria.requiredFields) ? (criteria.requiredFields as string[]) : [];
  const fromRequired = (): ObjectiveField[] => required.map((id) => fieldFor(id, criteria));

  if (!type) return legacyForm(task);

  switch (type) {
    case 'structured_reflection':
    case 'goal_setting':
    case 'communication_practice':
    case 'support_plan':
    case 'safety_plan':
    case 'environment_adjustment':
    case 'care_planning':
    case 'recovery_choice':
    case 'planning':
    case 'profile_preferences':
    case 'meal_planning':
      return required.length ? { objectiveType: type, fields: fromRequired() } : null;

    case 'timed_session':
      return {
        objectiveType: type,
        fields: fromRequired(),
        minimumElapsedSeconds: typeof criteria.minimumElapsedSeconds === 'number' ? criteria.minimumElapsedSeconds : 60,
      };

    case 'self_reported':
      return { objectiveType: type, fields: fromRequired().filter((f) => f.kind !== 'date'), requireAttestation: true };

    case 'movement_log':
    case 'activity_log':
      return { objectiveType: type, fields: fromRequired(), requireAttestation: true };

    case 'sleep_log': {
      const [dMin, dMax] = range(criteria.durationMinutesRange) ?? [0, 1440];
      const [rMin, rMax] = range(criteria.restedRatingRange) ?? [1, 5];
      return {
        objectiveType: type,
        fields: [
          { id: 'durationMinutes', label: 'Minutes slept', kind: 'number', min: dMin, max: dMax, unit: 'min' },
          { id: 'restedRating', label: humanize('restedRating'), kind: 'rating', min: rMin, max: rMax },
        ],
        requireAttestation: true,
      };
    }

    case 'meal_log':
      return { objectiveType: type, fields: [{ id: 'mealDescription', label: 'Meal', kind: 'text', minChars: 3 }], requireAttestation: true };

    case 'creative_activity':
      return {
        objectiveType: type,
        fields: [
          { id: 'activityType', label: 'Activity', kind: 'text', minChars: 3 },
          { id: 'shortDescription', label: humanize('shortDescription'), kind: 'longtext', minChars: 8 },
        ],
        requireAttestation: true,
      };

    case 'real_world_action':
      return {
        objectiveType: type,
        fields: [
          { id: 'chosenArea', label: humanize('chosenArea'), kind: 'text', minChars: 3 },
          { id: 'changeDescription', label: humanize('changeDescription'), kind: 'longtext', minChars: 8 },
        ],
        requireAttestation: true,
      };

    case 'symptom_record':
      return {
        objectiveType: type,
        fields: [
          { id: 'symptomType', label: humanize('symptomType'), kind: 'text', minChars: 3 },
          { id: 'date', label: 'Date', kind: 'date' },
        ],
        requireAttestation: true,
      };

    case 'routine_log': {
      const options = Array.isArray(criteria.routineTypeAllowed) ? (criteria.routineTypeAllowed as string[]) : [];
      return options.length
        ? { objectiveType: type, fields: [{ id: 'routineType', label: 'Routine', kind: 'choice', options }], requireAttestation: true }
        : null;
    }

    case 'boundary_plan':
      return { objectiveType: type, fields: [{ id: 'boundary', label: humanize('boundary'), kind: 'longtext', minChars: 8 }] };

    case 'checkin':
      return {
        objectiveType: type,
        fields: [
          { id: 'feeling', label: humanize('feeling'), kind: 'text', minChars: 2, optional: true },
          { id: 'note', label: humanize('note'), kind: 'longtext', minChars: 3, optional: true },
        ],
        atLeastOneField: true,
      };

    case 'self_reported_checkin':
      return {
        objectiveType: type,
        fields: [{ id: 'feeling', label: humanize('feeling'), kind: 'rating', min: 1, max: 5 }],
        requireAttestation: true,
      };

    case 'personal_planning':
      return { objectiveType: type, fields: [{ id: 'plan', label: humanize('plan'), kind: 'longtext', minChars: 8 }] };

    case 'guided_sequence':
      return { objectiveType: type, fields: [], requireSteps: true, allowSafeStop: true };

    case 'guided_exercise':
      return { objectiveType: type, fields: [], requireSteps: true };

    case 'appointment_preparation': {
      const [min, max] = range(criteria.questionCountRange) ?? [1, 3];
      return { objectiveType: type, fields: [{ id: 'questions', label: humanize('questions'), kind: 'lines', minItems: min, maxItems: max }] };
    }

    case 'routine_plan': {
      const [min, max] = range(criteria.chosenStepsCountRange) ?? [1, 5];
      return { objectiveType: type, fields: [{ id: 'steps', label: humanize('steps'), kind: 'lines', minItems: min, maxItems: max }] };
    }

    case 'inventory_review': {
      const [min, max] = range(criteria.itemsReviewedCountRange) ?? [1, 20];
      return { objectiveType: type, fields: [{ id: 'items', label: humanize('items'), kind: 'lines', minItems: min, maxItems: max }] };
    }

    case 'decision_exercise': {
      const [oMin, oMax] = range(criteria.optionsCountRange) ?? [2, 6];
      const [cMin, cMax] = range(criteria.criteriaCountRange) ?? [2, 6];
      return {
        objectiveType: type,
        fields: [
          { id: 'options', label: humanize('options'), kind: 'lines', minItems: oMin, maxItems: oMax },
          { id: 'criteria', label: humanize('criteria'), kind: 'lines', minItems: cMin, maxItems: cMax },
        ],
      };
    }

    default:
      // knowledge assessments need server-held answer keys; camera, AI, scorecard, media and
      // private-record objectives need runtimes this build does not have.
      return null;
  }
}

/** v1 tasks: timer for system-verified, a short log for evidence-supported, attestation otherwise. */
function legacyForm(task: ObjectiveSource): ObjectiveForm | null {
  if (task.verificationClass === 'system_verified') {
    const timer = task.verificationRequirements?.find((r) => r.type === 'in_app_timer');
    return { objectiveType: 'timed_practice', fields: [], minimumElapsedSeconds: timer?.minDurationSeconds ?? 60 };
  }
  if (task.verificationClass === 'evidence_supported') {
    return {
      objectiveType: 'activity_note',
      fields: [
        { id: 'durationMinutes', label: 'Minutes', kind: 'number', min: 1, max: 240, unit: 'min' },
        { id: 'note', label: 'How it went', kind: 'longtext', minChars: 8 },
      ],
      requireAttestation: true,
    };
  }
  if (task.verificationClass === 'self_reported') {
    return { objectiveType: 'attestation', fields: [], requireAttestation: true };
  }
  return null;
}

export const isObjectiveSupported = (task: ObjectiveSource): boolean => objectiveFormFor(task) !== null;

const lineCount = (v: unknown) =>
  typeof v === 'string' ? v.split('\n').map((l) => l.trim()).filter(Boolean).length : 0;

const isIsoDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Reason codes for every missing or invalid piece of evidence; empty when the objective passes. */
export function evaluateObjective(form: ObjectiveForm, evidence: ObjectiveEvidence, steps: { id: string }[]): string[] {
  const reasons: string[] = [];

  if (form.minimumElapsedSeconds && evidence.elapsedSeconds < form.minimumElapsedSeconds) {
    reasons.push('INSUFFICIENT_ELAPSED_TIME');
  }

  if (form.requireSteps) {
    const done = new Set(evidence.completedStepIds);
    const allDone = steps.every((s) => done.has(s.id));
    if (!allDone && !(form.allowSafeStop && evidence.safeStop)) reasons.push('STEPS_INCOMPLETE');
  }

  if (form.requireAttestation && !evidence.attested) reasons.push('DECLARATION_NOT_CONFIRMED');

  let filled = 0;
  for (const field of form.fields) {
    const value = evidence.answers[field.id];
    const present = fieldHasValue(field, value);
    if (present) filled += 1;
    if (!present) {
      if (!field.optional && !form.atLeastOneField) reasons.push(`MISSING_${field.id}`);
      continue;
    }
    const invalid = fieldInvalid(field, value);
    if (invalid) reasons.push(`${invalid}_${field.id}`);
  }
  if (form.atLeastOneField && filled === 0) reasons.push('AT_LEAST_ONE_FIELD_REQUIRED');

  return reasons;
}

function fieldHasValue(field: ObjectiveField, value: unknown): boolean {
  if (field.kind === 'consent') return value === true;
  if (field.kind === 'number' || field.kind === 'rating') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === 'string' && value.trim().length > 0;
}

function fieldInvalid(field: ObjectiveField, value: unknown): string | null {
  switch (field.kind) {
    case 'text':
    case 'longtext':
      return (value as string).trim().length < (field.minChars ?? 1) ? 'TOO_SHORT' : null;
    case 'number':
    case 'rating': {
      const n = value as number;
      if (field.min !== undefined && n < field.min) return 'OUT_OF_RANGE';
      if (field.max !== undefined && n > field.max) return 'OUT_OF_RANGE';
      return null;
    }
    case 'date':
      return isIsoDate(value) ? null : 'INVALID_DATE';
    case 'choice':
      return field.options?.includes(value as string) ? null : 'INVALID_CHOICE';
    case 'lines': {
      const n = lineCount(value);
      if (field.minItems !== undefined && n < field.minItems) return 'TOO_FEW_ITEMS';
      if (field.maxItems !== undefined && n > field.maxItems) return 'TOO_MANY_ITEMS';
      return null;
    }
    default:
      return null;
  }
}

/** Short human message for the first reason code, for the evidence form. */
export function describeReason(code: string, form: ObjectiveForm): string {
  if (code === 'INSUFFICIENT_ELAPSED_TIME') {
    const mins = Math.ceil((form.minimumElapsedSeconds ?? 60) / 60);
    return `Run the timer for at least ${mins} minute${mins === 1 ? '' : 's'} first.`;
  }
  if (code === 'STEPS_INCOMPLETE') return 'Mark each step done, or choose to stop safely.';
  if (code === 'DECLARATION_NOT_CONFIRMED') return 'Confirm that this is an honest record.';
  if (code === 'AT_LEAST_ONE_FIELD_REQUIRED') return 'Fill in at least one field.';
  const prefixes = ['MISSING_', 'TOO_SHORT_', 'OUT_OF_RANGE_', 'INVALID_DATE_', 'TOO_FEW_ITEMS_', 'TOO_MANY_ITEMS_', 'INVALID_CHOICE_'];
  const prefix = prefixes.find((p) => code.startsWith(p));
  const fieldId = prefix ? code.slice(prefix.length) : '';
  const field = form.fields.find((f) => f.id === fieldId);
  const label = field?.label ?? humanize(fieldId);
  switch (prefix) {
    case 'MISSING_':
      return `Add: ${label}.`;
    case 'TOO_SHORT_':
      return `${label} needs at least ${field?.minChars ?? 2} characters.`;
    case 'OUT_OF_RANGE_':
      return `${label} must be between ${field?.min} and ${field?.max}.`;
    case 'INVALID_DATE_':
      return `${label} must be a date like 2026-10-23.`;
    case 'TOO_FEW_ITEMS_':
      return `${label}: add at least ${field?.minItems}.`;
    case 'TOO_MANY_ITEMS_':
      return `${label}: at most ${field?.maxItems}.`;
    case 'INVALID_CHOICE_':
      return `Choose one option for ${label}.`;
  }
  return 'Something is missing.';
}
