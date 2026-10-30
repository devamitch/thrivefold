/**
 * Files attached in the coach chat. A photo of a prescription, diet chart or workout plan is read
 * by the Thrivefold server only after the person agrees (the photo leaves the phone), shown back
 * as a table to check, and saved to their records only after a second confirmation.
 */
import * as ImagePicker from 'expo-image-picker';

import type { ChatTable } from '../../domain/assistant/chatActions';
import {
  readDocument,
  timeFromTiming,
  type DietChartResult,
  type DocKind,
  type PrescriptionResult,
  type WorkoutPlanResult,
} from '../documents/docReader';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { globalVoiceController } from '../voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';

const LABEL: Record<DocKind, string> = { prescription: 'prescription', diet_chart: 'diet chart', workout_plan: 'workout plan' };

/** What the photo most likely is, from what the person typed with it. */
export function guessKind(text: string): DocKind {
  const t = text.toLowerCase();
  if (/\b(diet|meal|food) ?(chart|plan)?\b|\bdietitian\b/.test(t)) return 'diet_chart';
  if (/\b(workout|training|gym|exercise) ?(plan|chart)?\b|\btrainer\b/.test(t)) return 'workout_plan';
  return 'prescription';
}

export function prescriptionTable(p: PrescriptionResult): ChatTable {
  return {
    title: `Prescription${p.doctor ? ` from ${p.doctor}` : ''}${p.date ? `, ${p.date}` : ''}`,
    columns: ['Medicine', 'Dose', 'When', 'For how long'],
    rows: p.medicines.map((m) => [
      `${m.name}${m.unclear ? ' (unclear)' : ''}`,
      [m.strength, m.dose].filter(Boolean).join(' ') || 'not written',
      [m.frequency, m.timing].filter(Boolean).join(', ') || 'not written',
      m.duration ?? 'not written',
    ]),
    route: '/(app)/health/medications',
  };
}

/** Picks a photo (gallery, or camera when `camera`), returns its local uri. */
export async function pickPhoto(camera = false): Promise<string | null> {
  const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
  const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  return r.canceled || !r.assets[0] ? null : r.assets[0].uri;
}

const ask = (title: string, message: string, confirmText: string) =>
  new Promise<boolean>((resolve) =>
    useRootStore.getState().showAlert({
      title,
      message,
      confirmText,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    }),
  );

/** The whole flow for one attached photo. Never throws. */
export async function handleAttachedPhoto(uri: string, typed: string): Promise<void> {
  const kind = guessKind(typed);
  const post = globalVoiceController;
  post.postUserMessage(typed.trim() || `Attached a photo of a ${LABEL[kind]}.`);

  const agreed = await ask(
    `Read this ${LABEL[kind]}?`,
    'The photo is sent to the Thrivefold server to read the text, and is not kept there. Nothing is saved until you check it.',
    'Read it',
  );
  if (!agreed) {
    post.postReply(`Okay, I did not send it. You can still type what it says and I will help.`);
    return;
  }

  post.postReply(`Reading your ${LABEL[kind]}…`);
  let result: unknown;
  try {
    result = await readDocument(uri, kind);
  } catch (e) {
    post.postReply(`I could not read it: ${e instanceof Error ? e.message : 'unknown error'}. Try a flat photo in good light.`);
    return;
  }

  const s = useRootStore.getState();
  if (kind === 'prescription') {
    const p = result as PrescriptionResult;
    if (!p.medicines?.length) {
      post.postReply('I could not find any medicines on it. Try another photo, closer and flat.');
      return;
    }
    const table = prescriptionTable(p);
    const unclear = p.medicines.filter((m) => m.unclear).length;
    post.postReply(
      `I found ${p.medicines.length} ${p.medicines.length === 1 ? 'medicine' : 'medicines'}. Check each one against the paper` +
        (unclear ? `; ${unclear} ${unclear === 1 ? 'is' : 'are'} unclear and will not be saved` : '') +
        '. I never change a dose: ask your doctor or pharmacist if anything looks wrong.' +
        (p.followUp ? ` Follow-up noted: ${p.followUp}.` : ''),
      { success: true, message: '', data: { table }, routeToOpen: table.route },
    );
    const clear = p.medicines.filter((m) => !m.unclear);
    if (!clear.length) return;
    const save = await ask('Add these to your medicines?', `${clear.length} ${clear.length === 1 ? 'medicine' : 'medicines'} with daily reminders at the times written.`, 'Add');
    if (!save) {
      post.postReply('Not saved. Tap Open to add them yourself whenever you like.');
      return;
    }
    let n = 0;
    for (const m of clear) {
      const times = timeFromTiming(m.timing, m.frequency);
      const dose = [m.strength, m.dose, m.duration ? `for ${m.duration}` : null].filter(Boolean).join(' · ');
      for (const time of times.length ? times : ['08:00']) {
        s.addMedication({ name: m.name.slice(0, 60), dose: dose.slice(0, 80), time });
        n++;
      }
    }
    s.setMedicationRemindersOn(true);
    void thriveRag
      .remember(table.title, table.rows.map((r) => r.join(' | ')).join('\n'), 'medical_reference', { source: 'prescription_scan' })
      .catch(() => undefined);
    post.postReply(`Added ${n} medicine ${n === 1 ? 'time' : 'times'} with reminders. Check each time matches what your doctor said.`, {
      success: true,
      message: '',
      routeToOpen: '/(app)/health/medications',
    });
    return;
  }

  const plan = result as DietChartResult | WorkoutPlanResult;
  const table: ChatTable =
    kind === 'diet_chart'
      ? {
          title: `Diet chart${plan.by ? ` from ${plan.by}` : ''}`,
          columns: ['When', 'Meal', 'Items'],
          rows: (plan as DietChartResult).meals.map((m) => [m.time ?? '', m.label, m.items.join(', ')]),
          route: '/(app)/health/documents',
        }
      : {
          title: `Workout plan${plan.by ? ` from ${plan.by}` : ''}`,
          columns: ['Day', 'Exercises'],
          rows: (plan as WorkoutPlanResult).days.map((d) => [d.day, d.exercises.map((e) => `${e.name}${e.sets ? ` ${e.sets}x${e.reps ?? ''}` : ''}`).join(', ')]),
          route: '/(app)/health/documents',
        };
  post.postReply(`Here is what I read. Check it against the paper.`, { success: true, message: '', data: { table } });
  const save = await ask(`Save this ${LABEL[kind]}?`, 'It is kept on this phone so I can plan with it.', 'Save');
  if (!save) return post.postReply('Not saved.');
  s.addCarePlan({ kind, by: plan.by ?? null, data: plan });
  void thriveRag.remember(table.title, table.rows.map((r) => r.join(' | ')).join('\n'), 'wellness_guide', { source: kind }).catch(() => undefined);
  post.postReply(`Saved your ${LABEL[kind]}.`, { success: true, message: '', routeToOpen: '/(app)/health/documents' });
}
