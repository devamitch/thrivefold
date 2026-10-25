import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { TERMS_VERSION } from '../../domain/legal/terms';
import { useRootStore } from '../../stores/useRootStore';
import { queryClient } from './queryClient';
import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Age assurance. Verification is decided by the provider and written by the server; the
// app only starts a check, opens the provider's page and reads the result back. The local
// `user.isAgeVerified` mirrors the server and is never set from anything on the phone.
// ---------------------------------------------------------------------------

export interface AgeCheckStatus {
  verified: boolean;
  status: 'started' | 'approved' | 'declined' | 'resubmission' | 'expired' | 'under_age' | 'no_age' | null;
  checked_at: string | null;
}

export const ageCheckKeys = { status: ['server', 'age-check'] as const };

async function session() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function useAgeCheckStatus(enabled: boolean) {
  return useQuery({
    queryKey: ageCheckKeys.status,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<AgeCheckStatus | null> => {
      if (!supabase || !(await session())) return null;
      const { data, error } = await supabase.rpc('tf_my_age_check');
      if (error) throw error;
      return data as AgeCheckStatus;
    },
  });
}

/** Keeps the local mirror of the verified flag equal to the server's. */
export function useSyncAgeVerified(status: AgeCheckStatus | null | undefined) {
  useEffect(() => {
    if (!status) return;
    const { user, setUser } = useRootStore.getState();
    if (user && Boolean(user.isAgeVerified) !== status.verified) {
      setUser({ ...user, isAgeVerified: status.verified });
    }
  }, [status]);
}

/** Starts a provider session; resolves with the URL of the provider's check page. */
export function useStartAgeCheck() {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!supabase || !(await session())) throw new Error('not_authenticated');
      const { data, error } = await supabase.functions.invoke('age-check/start', { method: 'POST' });
      if (error) {
        const ctx = (error as { context?: Response }).context;
        const body = ctx ? await ctx.json().catch(() => null) : null;
        throw new Error(body?.error ?? error.message);
      }
      if (!data?.url) throw new Error('provider_unavailable');
      return data.url as string;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ageCheckKeys.status }),
  });
}

export function ageCheckErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in with an account first. Guests stay on this phone only.';
  if (m.includes('provider_not_configured')) return 'Age checks aren’t switched on for this app yet.';
  if (m.includes('too_many_attempts')) return 'You’ve started five checks today. Try again tomorrow.';
  return 'Couldn’t start the check. Try again when you’re online.';
}

/**
 * Creates or updates this person's server profile rows after sign-in, so letters, groups and
 * age checks have something to attach to. Only the pseudonym, experience and letter settings
 * are sent; health data stays on the phone. Verification fields are protected by a trigger.
 */
export async function syncServerProfile(): Promise<void> {
  const s = await session();
  if (!supabase || !s) return;
  const { user, experience, letterPreferences, termsAcceptedVersion, termsAcceptedAt } = useRootStore.getState();
  if (!user || user.isGuest) return;
  const pseudonym = (user.pseudonym || 'Member').slice(0, 40);
  await supabase.from('thrivefold_profiles').upsert(
    { user_id: s.user.id, pseudonym, experience },
    { onConflict: 'user_id' },
  );
  await supabase.from('thrivefold_social_profiles').upsert(
    {
      user_id: s.user.id,
      pseudonym,
      avatar_seed: s.user.id.slice(0, 8),
      coarse_region: 'Not shared',
      accepts_introductions: letterPreferences.acceptingLetters,
    },
    { onConflict: 'user_id' },
  );
  // The Terms the person agreed to during setup, recorded once per version.
  if (termsAcceptedVersion === TERMS_VERSION) {
    const { data: existing } = await supabase
      .from('thrivefold_consents')
      .select('id')
      .eq('user_id', s.user.id)
      .eq('feature_id', 'terms')
      .eq('version', TERMS_VERSION)
      .is('revoked_at', null)
      .limit(1);
    if (!existing?.length) {
      await supabase.from('thrivefold_consents').insert({
        user_id: s.user.id,
        feature_id: 'terms',
        version: TERMS_VERSION,
        granted_at: termsAcceptedAt ?? new Date().toISOString(),
      });
    }
  }
}
