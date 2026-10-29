/**
 * The person's own profile on the Thrivefold server (thrivefold_personal_profiles, owner-only),
 * so signing in again on this or another phone restores it instead of asking again.
 * Only what the person typed or confirmed: name, birthday, chosen space, onboarding goals,
 * constraints, routine length and diet. Never observances, health records or anything inferred.
 */
import { ageBandFor, ageOn } from '../../domain/account/googleProfile';
import { PHONE_RE, mergeKosh, type EmergencyContact, type KoshProfile } from '../../domain/account/koshProfile';
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
  preferred_name: string | null;
  phone: string | null;
  languages: string[];
  food_restrictions: string[];
  allergies: string[];
  cuisines: string[];
  food_dislikes: string[];
  interests: string[];
  skills: string[];
  career_goal: string | null;
  accessibility: KoshProfile['accessibility'];
  field_sources: KoshProfile['fieldSources'];
  terms_version?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  home_address?: string | null;
}

const toKosh = (r: RemoteProfile): Partial<KoshProfile> => ({
  preferredName: r.preferred_name,
  phone: r.phone,
  languages: r.languages ?? [],
  foodRestrictions: r.food_restrictions ?? [],
  allergies: r.allergies ?? [],
  cuisines: r.cuisines ?? [],
  foodDislikes: r.food_dislikes ?? [],
  interests: r.interests ?? [],
  skills: r.skills ?? [],
  careerGoal: r.career_goal,
  homeAddress: r.home_address ?? null,
  accessibility: r.accessibility ?? {},
  fieldSources: r.field_sources ?? {},
});

/** Server profile into this phone's Anvay Kosh profile, filling only empty fields. */
export function applyKosh(remote: RemoteProfile): string[] {
  const s = useRootStore.getState();
  const { merged, filled } = mergeKosh(s.koshProfile, toKosh(remote));
  if (filled.length) useRootStore.setState({ koshProfile: merged });
  // Body numbers fill only when this phone has none.
  if (!s.heightCm && remote.height_cm) s.setHeightCm(remote.height_cm);
  if (!s.weightKg && remote.weight_kg) s.setWeightKg(Number(remote.weight_kg));
  return filled;
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
    .select(
      'display_name, birth_date, experience, onboarded, goals, constraints, routine_minutes, diet, preferred_name, phone, languages, food_restrictions, allergies, cuisines, food_dislikes, interests, skills, career_goal, accessibility, field_sources, terms_version, height_cm, weight_kg, home_address',
    )
    .eq('user_id', id)
    .maybeSingle();
  if (error) {
    console.warn('profile pull failed', error.code, error.message);
    return null;
  }
  return (data as RemoteProfile | null) ?? null;
}

/** Saves this phone's profile for the signed-in account. Silent no-op for guests or offline. */
export async function pushProfile(): Promise<boolean> {
  const id = await userId();
  const s = useRootStore.getState();
  if (!supabase || !id || !s.user || s.user.isGuest) {
    if (s.user && !s.user.isGuest && !id) console.warn('profile push skipped: no server session');
    return false;
  }
  const o = s.onboarding;
  const k = s.koshProfile;
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
      preferred_name: k.preferredName,
      phone: k.phone && PHONE_RE.test(k.phone) ? k.phone : null,
      languages: k.languages.slice(0, 10),
      food_restrictions: k.foodRestrictions.slice(0, 20),
      allergies: k.allergies.slice(0, 20),
      cuisines: k.cuisines.slice(0, 20),
      food_dislikes: k.foodDislikes.slice(0, 30),
      interests: k.interests.slice(0, 30),
      skills: k.skills.slice(0, 30),
      career_goal: k.careerGoal?.slice(0, 300) ?? null,
      accessibility: k.accessibility,
      field_sources: k.fieldSources,
      terms_version: s.termsAcceptedVersion ?? null,
      height_cm: s.heightCm && s.heightCm >= 100 && s.heightCm <= 250 ? Math.round(s.heightCm) : null,
      weight_kg: s.weightKg && s.weightKg >= 25 && s.weightKg <= 350 ? s.weightKg : null,
      home_address: k.homeAddress?.slice(0, 200) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) {
    // Code and message only; never the profile values.
    console.warn('profile push failed', error.code, error.message);
    return false;
  }
  return syncEmergencyContacts(id);
}

/** Points and level live in progressSync (the reward ledger is what is saved and merged). */
export { syncProgress as pullProgress, syncProgress as pushProgress } from './progressSync';

/**
 * Emergency contacts: the server list is replaced by this phone's list when this phone has any;
 * a new phone with none takes the server's list.
 */
async function syncEmergencyContacts(id: string): Promise<boolean> {
  if (!supabase) return false;
  const local = useRootStore.getState().emergencyContacts;
  if (local.length === 0) {
    const { data, error } = await supabase.from('anvay_emergency_contacts').select('id, name, phone, relation').eq('user_id', id);
    if (error) return false;
    if (data?.length) useRootStore.getState().setEmergencyContacts(data as EmergencyContact[]);
    return true;
  }
  const del = await supabase.from('anvay_emergency_contacts').delete().eq('user_id', id);
  if (del.error) return false;
  const ins = await supabase
    .from('anvay_emergency_contacts')
    .insert(local.slice(0, 5).map((c) => ({ user_id: id, name: c.name, phone: c.phone, relation: c.relation })));
  return !ins.error;
}

const ageFromDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return ageOn({ year: y, month: m, day }, new Date());
};

/** A profile built from facts Google shared, in the same shape as a saved one. */
export function profileFromGoogle(birthDate: string, experience: ProductExperience, name: string): RemoteProfile {
  return {
    display_name: name, birth_date: birthDate, experience, onboarded: false, goals: [], constraints: [], routine_minutes: null, diet: null,
    preferred_name: null, phone: null, languages: [], food_restrictions: [], allergies: [], cuisines: [], food_dislikes: [],
    interests: [], skills: [], career_goal: null, accessibility: {}, field_sources: {},
  };
}

/**
 * Applies a saved profile to this phone after sign-in. Fills only what is missing here, so a
 * profile on this phone is never overwritten. Returns true when the person no longer needs to
 * confirm a birthday and space.
 */
export function applyProfile(
  remote: RemoteProfile,
  base: { id: string; email: string; photo: string | null; name: string; gender?: string | null },
): boolean {
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
    gender: existing?.gender ?? base.gender ?? null,
    photoUrl: existing?.photoUrl ?? base.photo,
    profileSource: 'google',
    isGuest: false,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
  s.confirmAdult();
  if (remote.terms_version && !s.termsAcceptedVersion) s.acceptTerms(remote.terms_version);
  if (base.gender && !existing?.gender) s.setPrivateIdentity({ pronouns: '', genderDescription: base.gender });
  if (!s.experienceConfirmed) s.setExperience(remote.experience);
  const o = s.onboarding;
  s.setOnboardingAnswers({
    goals: o.goals.length ? o.goals : remote.goals,
    constraints: o.constraints.length ? o.constraints : remote.constraints,
    routineMinutes: o.routineMinutes ?? remote.routine_minutes,
    diet: o.diet ?? remote.diet,
  });
  if (remote.onboarded && !s.isOnboarded) s.setIsOnboarded(true);
  applyKosh(remote);
  return true;
}
