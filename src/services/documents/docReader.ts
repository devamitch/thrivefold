/**
 * Reads a photo of a prescription, diet chart or workout plan through the `doc-reader` Edge
 * Function. Returns what is written, for the person to check before anything is saved.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { resizeForUpload } from '../../../modules/pose-landmarker/food';
import { supabase } from '../supabase/supabaseClient';

export type DocKind = 'prescription' | 'diet_chart' | 'workout_plan';

export interface PrescriptionResult {
  doctor?: string | null;
  date?: string | null;
  medicines: { name: string; strength?: string | null; form?: string | null; dose?: string | null; frequency?: string | null; timing?: string | null; duration?: string | null; unclear?: boolean }[];
  followUp?: string | null;
  notes?: string | null;
}
export interface DietChartResult {
  by?: string | null;
  meals: { time?: string | null; label: string; items: string[] }[];
  avoid?: string[];
  notes?: string | null;
}
export interface WorkoutPlanResult {
  by?: string | null;
  days: { day: string; exercises: { name: string; sets?: string | null; reps?: string | null; load?: string | null; rest?: string | null }[] }[];
  notes?: string | null;
}

export async function readDocument(photoUri: string, kind: DocKind): Promise<unknown> {
  if (!supabase) throw new Error('Reading documents needs the Thrivefold server.');
  const small = await resizeForUpload(photoUri, 1600);
  const image = await FileSystem.readAsStringAsync(small, { encoding: FileSystem.EncodingType.Base64 });
  await FileSystem.deleteAsync(small, { idempotent: true });
  const { data, error } = await supabase.functions.invoke('doc-reader', { body: { image, kind } });
  if (error) {
    let reason = '';
    try {
      reason = (await (error as { context?: Response }).context?.json())?.error ?? '';
    } catch {
      reason = '';
    }
    throw new Error(
      reason === 'not_authenticated'
        ? 'Sign in to read documents.'
        : reason === 'daily_limit'
          ? 'Daily limit reached. Try again tomorrow.'
          : 'Could not read this photo. Try a sharper, well-lit photo.',
    );
  }
  return (data as { result: unknown }).result;
}

/** "after breakfast", "1-0-1", "morning" … to a reminder time, or null when it is not clear. */
export function timeFromTiming(timing: string | null | undefined, frequency: string | null | undefined): string[] {
  const t = `${timing ?? ''} ${frequency ?? ''}`.toLowerCase();
  const pattern = t.match(/\b([01])\s*-\s*([01])\s*-\s*([01])\b/);
  if (pattern) {
    const out: string[] = [];
    if (pattern[1] === '1') out.push('08:00');
    if (pattern[2] === '1') out.push('14:00');
    if (pattern[3] === '1') out.push('21:00');
    return out;
  }
  const out: string[] = [];
  if (/morning|breakfast|\bod\b|once/.test(t)) out.push('08:00');
  if (/afternoon|lunch/.test(t)) out.push('14:00');
  if (/evening|dinner|night|bed|\bhs\b/.test(t)) out.push('21:00');
  if (out.length === 0 && /twice|\bbd\b|\bbid\b/.test(t)) return ['08:00', '21:00'];
  if (out.length === 0 && /thrice|\btds\b|\btid\b/.test(t)) return ['08:00', '14:00', '21:00'];
  return out;
}
