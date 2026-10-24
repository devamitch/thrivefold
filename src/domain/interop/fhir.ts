/**
 * HL7 FHIR R4 export of the person's own records, built on the device so they can hand it to
 * a clinician or another app. Uses LOINC codes where a standard code exists; self-reported
 * wellbeing scores that have no standard code use a Thrivefold code system so nothing is
 * mislabelled as a clinical measurement. Nothing here is sent anywhere by the app.
 */
import type { DeviceReading } from './readings';

const LOINC = 'http://loinc.org';
const UCUM = 'http://unitsofmeasure.org';
const OBS_CATEGORY = 'http://terminology.hl7.org/CodeSystem/observation-category';
const TF = 'https://thrivefold.app/fhir/CodeSystem/self-report';

export interface FhirInput {
  patientId: string;
  displayName?: string;
  /** FHIR administrative gender, only if the person shared it. */
  gender?: 'male' | 'female' | 'other' | 'unknown';
  checkIns: { date: string; energy: number; mood: number; stress: number; sleepHours: number; symptoms: string[] }[];
  periods: { startDate: string; endDate?: string }[];
  medications: { name: string; dose: string; time: string }[];
  workouts: { date: string; startedAt: string; finishedAt: string; planId: string }[];
  activities: { date: string; type: string; minutes: number; distanceKm?: number }[];
  readings: DeviceReading[];
  generatedAt?: string;
}

export type Resource = Record<string, unknown> & { resourceType: string; id: string };

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  meta: Record<string, unknown>;
  entry: { fullUrl: string; resource: Resource }[];
}

const coding = (system: string, code: string, display: string) => ({ coding: [{ system, code, display }], text: display });
const category = (code: 'vital-signs' | 'activity' | 'survey', display: string) => [coding(OBS_CATEGORY, code, display)];

function obs(
  id: string,
  patientRef: string,
  code: ReturnType<typeof coding>,
  cat: ReturnType<typeof category>,
  effective: string,
  value: Record<string, unknown>,
): Resource {
  return {
    resourceType: 'Observation',
    id,
    status: 'final',
    category: cat,
    code,
    subject: { reference: patientRef },
    effectiveDateTime: effective,
    ...value,
  };
}

const quantity = (value: number, unit: string, code: string) => ({ valueQuantity: { value, unit, system: UCUM, code } });
const safeId = (s: string) => s.replace(/[^A-Za-z0-9\-.]/g, '-').slice(0, 64);

export function buildFhirBundle(input: FhirInput): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const patientId = safeId(input.patientId);
  const ref = `Patient/${patientId}`;
  const resources: Resource[] = [
    {
      resourceType: 'Patient',
      id: patientId,
      ...(input.displayName ? { name: [{ text: input.displayName }] } : {}),
      ...(input.gender ? { gender: input.gender } : {}),
    },
  ];

  for (const c of input.checkIns) {
    const at = `${c.date}T12:00:00`;
    resources.push(
      obs(`sleep-${c.date}`, ref, coding(LOINC, '93832-4', 'Sleep duration'), category('activity', 'Activity'), at, quantity(c.sleepHours, 'h', 'h')),
      obs(`energy-${c.date}`, ref, coding(TF, 'energy', 'Self-reported energy (1-10)'), category('survey', 'Survey'), at, { valueInteger: c.energy }),
      obs(`mood-${c.date}`, ref, coding(TF, 'mood', 'Self-reported mood (1-10)'), category('survey', 'Survey'), at, { valueInteger: c.mood }),
      obs(`stress-${c.date}`, ref, coding(TF, 'stress', 'Self-reported stress (1-10)'), category('survey', 'Survey'), at, { valueInteger: c.stress }),
    );
    c.symptoms.forEach((s, i) =>
      resources.push(
        obs(`symptom-${c.date}-${i}`, ref, coding(TF, 'symptom', 'Self-reported symptom'), category('survey', 'Survey'), at, { valueString: s }),
      ),
    );
  }

  for (const p of input.periods) {
    resources.push(
      obs(`lmp-${p.startDate}`, ref, coding(LOINC, '8665-2', 'Last menstrual period start date'), category('survey', 'Survey'), `${p.startDate}T00:00:00`, {
        valueDateTime: p.startDate,
      }),
    );
  }

  input.medications.forEach((m, i) =>
    resources.push({
      resourceType: 'MedicationStatement',
      id: `med-${i}`,
      status: 'active',
      medicationCodeableConcept: { text: m.name },
      subject: { reference: ref },
      dosage: [{ text: [m.dose, m.time ? `at ${m.time}` : ''].filter(Boolean).join(' ') }],
      informationSource: { reference: ref },
    }),
  );

  for (const w of input.workouts) {
    const minutes = Math.max(1, Math.round((Date.parse(w.finishedAt) - Date.parse(w.startedAt)) / 60000));
    resources.push(
      obs(`workout-${safeId(w.startedAt)}`, ref, coding(LOINC, '55411-3', 'Exercise duration'), category('activity', 'Activity'), w.startedAt, {
        ...quantity(minutes, 'min', 'min'),
        note: [{ text: `Plan: ${w.planId}` }],
      }),
    );
  }

  input.activities.forEach((a, i) =>
    resources.push(
      obs(`activity-${a.date}-${i}`, ref, coding(LOINC, '55411-3', 'Exercise duration'), category('activity', 'Activity'), `${a.date}T12:00:00`, {
        ...quantity(a.minutes, 'min', 'min'),
        note: [{ text: `${a.type}${a.distanceKm ? `, ${a.distanceKm} km` : ''}` }],
      }),
    ),
  );

  for (const r of input.readings) {
    const at = `${r.date}T12:00:00`;
    if (r.kind === 'steps')
      resources.push(obs(`steps-${r.date}`, ref, coding(LOINC, '41950-7', 'Number of steps in 24 hour Measured'), category('activity', 'Activity'), at, quantity(r.value, 'steps', '{steps}')));
    if (r.kind === 'heart_rate_avg')
      resources.push(obs(`hr-${r.source}-${r.date}`, ref, coding(LOINC, '8867-4', 'Heart rate'), category('vital-signs', 'Vital Signs'), at, quantity(r.value, 'beats/minute', '/min')));
    if (r.kind === 'weight_kg')
      resources.push(obs(`weight-${r.date}`, ref, coding(LOINC, '29463-7', 'Body weight'), category('vital-signs', 'Vital Signs'), at, quantity(r.value, 'kg', 'kg')));
    if (r.kind === 'sleep_minutes')
      resources.push(obs(`hc-sleep-${r.date}`, ref, coding(LOINC, '93832-4', 'Sleep duration'), category('activity', 'Activity'), at, quantity(Math.round((r.value / 60) * 10) / 10, 'h', 'h')));
  }

  return {
    resourceType: 'Bundle',
    id: safeId(`thrivefold-export-${generatedAt}`),
    type: 'collection',
    timestamp: generatedAt,
    meta: { tag: [{ system: TF, code: 'patient-generated', display: 'Recorded by the person in Thrivefold; not clinically verified' }] },
    entry: resources.map((resource) => ({ fullUrl: `urn:uuid:${resource.resourceType}-${resource.id}`, resource })),
  };
}

/** Maps the gender text a person confirmed to FHIR administrative gender, or undefined. */
export function fhirGender(gender: string | null | undefined): FhirInput['gender'] {
  const g = gender?.toLowerCase();
  if (g === 'female') return 'female';
  if (g === 'male') return 'male';
  if (g) return 'other';
  return undefined;
}
