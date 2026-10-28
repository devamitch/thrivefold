/**
 * The person's own profile on the Thrivefold server (thrivefold_personal_profiles, owner-only),
 * so signing in again on this or another phone restores it instead of asking again.
 * Only what the person typed or confirmed: name, birthday, chosen space, onboarding goals,
 * constraints, routine length and diet. Never observances, health records or anything inferred.
 */
import { ageBandFor, ageOn } from '../../domain/account/googleProfile';
import type { ProductExperience } from '../../theme/tokens';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';

export interface RemoteProfile {
  display_name: string | null;
  birth_date: string | null;
  experience: ProductExperience | null;
  onboarded: boolean;
  goals: string[];
  constraints: string[];
  routine_minutes: 5 | 10 | 20 | null;
  diet: string | null;
}

async function userId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** The saved profile for the signed-in account, or null (none saved, offline or signed out). */
export async function pullProfile(): Promise<RemoteProfile | null> {
  const id = await userId();
  if (!supabase || !id) return null;
  const { data, error } = await supabase
    .from('thrivefold_personal_profiles')
    .select('display_name, birth_date, experience, onboarded, goals, constraints, routine_minutes, diet')
    .eq('user_id', id)
    .maybeSingle();
  if (error) return null;
  return (data as RemoteProfile | null) ?? null;
}

/** Saves this phone's profile for the signed-in account. Silent no-op for guests or offline. */
export async function pushProfile(): Promise<boolean> {
  const id = await userId();
  const s = useRootStore.getState();
  if (!supabase || !id || !s.user || s.user.isGuest) return false;
  const o = s.onboarding;
  const { error } = await supabase.from('thrivefold_personal_profiles').upsert(
    {
      user_id: id,
      display_name: s.user.pseudonym?.slice(0, 60) ?? null,
      birth_date: s.user.birthDate ?? null,
      experience: s.experienceConfirmed ? s.experience : null,
      onboarded: s.isOnboarded,
      goals: o.goals.slice(0, 20),
      constraints: o.constraints.slice(0, 20),
      routine_minutes: o.routineMinutes,
      diet: o.diet?.slice(0, 40) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  return !error;
}

const ageFromDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return ageOn({ year: y, month: m, day }, new Date());
};

/**
 * Applies a saved profile to this phone after sign-in. Fills only what is missing here, so a
 * profile on this phone is never overwritten. Returns true when the person no longer needs to
 * confirm a birthday and space.
 */
export function applyProfile(remote: RemoteProfile, base: { id: string; email: string; photo: string | null; name: string }): boolean {
  const s = useRootStore.getState();
  const birthDate = remote.birth_date ?? null;
  const age = birthDate ? ageFromDate(birthDate) : null;
  if (age === null || age < 18 || !remote.experience) return false;

  const existing = s.user && !s.user.isGuest ? s.user : null;
  s.setUser({
    id: base.id,
    pseudonym: existing?.pseudonym || remote.display_name || base.name,
    avatarSeed: existing?.avatarSeed ?? base.id,
    age,
    ageBand: ageBandFor(age),
    birthDate,
    isAgeVerified: existing?.isAgeVerified ?? false,
    email: base.email,
    gender: existing?.gender ?? null,
    photoUrl: existing?.photoUrl ?? base.photo,
    profileSource: 'google',
    isGuest: false,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
  s.confirmAdult();
  if (!s.experienceConfirmed) s.setExperience(remote.experience);
  const o = s.onboarding;
  s.setOnboardingAnswers({
    goals: o.goals.length ? o.goals : remote.goals,
    constraints: o.constraints.length ? o.constraints : remote.constraints,
    routineMinutes: o.routineMinutes ?? remote.routine_minutes,
    diet: o.diet ?? remote.diet,
  });
  if (remote.onboarded && !s.isOnboarded) s.setIsOnboarded(true);
  return true;
}
