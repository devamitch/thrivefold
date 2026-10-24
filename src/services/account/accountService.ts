/**
 * Optional Thrivefold account (Supabase Auth, email one-time code). The app works fully
 * without it; an account lets rewards and unlocks be confirmed by the server.
 */
import { isBackendConfigured, supabase } from '../supabase/supabaseClient';

export type AccountResult = { ok: true } | { ok: false; message: string };

const friendly = (message: string) =>
  /rate limit/i.test(message)
    ? 'Too many attempts. Please wait a minute and try again.'
    : /invalid|expired/i.test(message)
      ? 'That code is not valid or has expired. Request a new one.'
      : 'Could not reach the server. Check your connection and try again.';

export const SUPABASE_CALLBACK_URL =
  process.env.EXPO_PUBLIC_SUPABASE_CALLBACK_URL ||
  'https://lymbgfzngpkvcadrkvui.supabase.co/auth/v1/callback';

export const accountsAvailable = () => isBackendConfigured && supabase !== null;

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** Sends a 6-digit sign-in code to the email address. */
export async function requestEmailCode(email: string): Promise<AccountResult> {
  if (!supabase) return { ok: false, message: 'Accounts are not available in this build.' };
  if (!isValidEmail(email)) return { ok: false, message: 'Enter a valid email address.' };
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: SUPABASE_CALLBACK_URL,
    },
  });
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

/** Verifies the code and returns the signed-in account id. */
export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<{ ok: true; userId: string; email: string } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: 'Accounts are not available in this build.' };
  if (!/^\d{6}$/.test(code.trim())) return { ok: false, message: 'Enter the 6-digit code from the email.' };
  const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
  if (error || !data.user) return { ok: false, message: friendly(error?.message ?? 'invalid') };
  return { ok: true, userId: data.user.id, email: data.user.email ?? email.trim() };
}

/** The account currently signed in on this device, if any. */
export async function currentAccount(): Promise<{ userId: string; email: string | null } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  return user ? { userId: user.id, email: user.email ?? null } : null;
}

export async function signOutAccount(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

/**
 * One sign-out path for every button: ends the Google and Supabase sessions (best effort,
 * offline-safe), drops cached server answers so the next person never sees them, and
 * clears the signed-in user. Local health records stay unless the person erases them.
 */
export async function signOutEverywhere(): Promise<void> {
  const { signOutGoogle } = await import('./googleAccount');
  const { queryClient } = await import('../supabase/queryClient');
  const { useRootStore } = await import('../../stores/useRootStore');
  await signOutGoogle().catch(() => undefined);
  await signOutAccount().catch(() => undefined);
  queryClient.clear();
  useRootStore.getState().signOut();
}
