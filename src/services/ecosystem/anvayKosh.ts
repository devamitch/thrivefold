/**
 * AnvayKosh in Thrivefold: Anvay ID (sign-in), Anvay Vault (shared basic profile) and the
 * AnvayKosh app list.
 *
 * - Anvay ID is the person's Google account through Thrivefold's Supabase auth (standard OAuth,
 *   tokens verified by Google and Supabase). Nothing travels in a deep link.
 * - Anvay Vault is one owner-only row (`anvay_profiles`, RLS) with basic profile facts. Health,
 *   cycle, location and other sensitive data are never part of it. Merges fill empty fields only.
 * - Sibling apps are detected by package (Android <queries>) and opened plainly, with no data.
 */
import { getCalendars, getLocales } from 'expo-localization';
import { Linking } from 'react-native';

import {
  fillEmpty,
  usable,
  type VaultField,
  type VaultProfile,
} from '../../domain/ecosystem/anvayVault';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';

export const THIS_APP = 'com.amit.thrivefold';

export interface AnvayApp {
  id: string;
  name: string;
  scheme: string;
  packageName: string;
  purpose: string;
}

export const ANVAY_APPS: AnvayApp[] = [
  { id: 'setu', name: 'Setu', scheme: 'setu://', packageName: 'com.amit.setu', purpose: 'Nearby share and files' },
  { id: 'neev', name: 'Neev', scheme: 'neev://', packageName: 'com.amit.neev', purpose: 'Family home and schedules' },
  {
    id: 'harmonybloom',
    name: 'HarmonyBloom',
    scheme: 'harmonybloom://',
    packageName: 'com.amit.harmonybloom',
    purpose: 'Cycle and hormonal harmony',
  },
  {
    id: 'blinkquest',
    name: 'BlinkQuest',
    scheme: 'blinkquest://',
    packageName: 'com.amit.blinkquest',
    purpose: 'Eye breaks and blink tracking',
  },
];

export interface AnvayIdStatus {
  configured: boolean;
  signedIn: boolean;
  email: string | null;
}

export async function anvayIdStatus(): Promise<AnvayIdStatus> {
  if (!supabase) return { configured: false, signedIn: false, email: null };
  try {
    const { data } = await supabase.auth.getSession();
    return { configured: true, signedIn: Boolean(data.session), email: data.session?.user.email ?? null };
  } catch {
    return { configured: true, signedIn: false, email: null };
  }
}

/** This phone's own basic facts, as a vault-shaped profile. */
function localFacts(): VaultProfile {
  const user = useRootStore.getState().user;
  let locale: string | null = null;
  let timeZone: string | null = null;
  try {
    locale = getLocales()[0]?.languageTag ?? null;
    timeZone = getCalendars()[0]?.timeZone ?? null;
  } catch {
    // unavailable on this platform
  }
  return {
    display_name: user?.pseudonym ?? null,
    avatar_seed: user?.avatarSeed ?? null,
    photo_url: user?.photoUrl ?? null,
    locale,
    time_zone: timeZone,
  };
}

export interface VaultSyncResult {
  profile: VaultProfile;
  /** Fields this app added to the vault. */
  shared: VaultField[];
  /** Fields this app took from the vault. */
  received: VaultField[];
}

export async function readVault(): Promise<VaultProfile | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase
    .from('anvay_profiles')
    .select('display_name, avatar_seed, photo_url, locale, time_zone, sources')
    .eq('user_id', session.session.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as VaultProfile | null) ?? {};
}

/**
 * Two-way, non-destructive sync: the vault gains this phone's facts where it has none, and this
 * phone gains the vault's facts where it has none. Nothing that exists on either side changes.
 */
export async function syncVault(): Promise<VaultSyncResult> {
  if (!supabase) throw new Error('not_configured');
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('not_authenticated');
  const userId = session.session.user.id;
  const at = new Date().toISOString();

  const remote = (await readVault()) ?? {};
  const local = localFacts();
  const toVault = fillEmpty(remote, local, THIS_APP, at);
  if (toVault.filled.length > 0) {
    const { error } = await supabase
      .from('anvay_profiles')
      .upsert({ user_id: userId, ...toVault.merged, updated_at: at }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
  }

  // Only the profile fields this app keeps locally are received.
  const toLocal = fillEmpty(local, toVault.merged, 'vault', at);
  const received = toLocal.filled.filter(
    (f) => f === 'display_name' || f === 'avatar_seed' || f === 'photo_url',
  );
  const st = useRootStore.getState();
  if (received.length && st.user) {
    st.setUser({
      ...st.user,
      pseudonym:
        usable('display_name', st.user.pseudonym) ?? toLocal.merged.display_name ?? st.user.pseudonym,
      avatarSeed:
        usable('avatar_seed', st.user.avatarSeed) ?? toLocal.merged.avatar_seed ?? st.user.avatarSeed,
      photoUrl: usable('photo_url', st.user.photoUrl) ?? toLocal.merged.photo_url ?? st.user.photoUrl,
    });
  }
  return { profile: toVault.merged, shared: toVault.filled, received };
}

/** Removes this person's vault row. Local data on this phone is unaffected. */
export async function deleteVault(): Promise<void> {
  if (!supabase) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  const { error } = await supabase.from('anvay_profiles').delete().eq('user_id', session.session.user.id);
  if (error) throw new Error(error.message);
}

export async function installedAnvayApps(): Promise<(AnvayApp & { installed: boolean })[]> {
  return Promise.all(
    ANVAY_APPS.map(async (app) => ({
      ...app,
      installed: await Linking.canOpenURL(app.scheme).catch(() => false),
    })),
  );
}

/** Opens the app plainly (no data in the link), or its Play Store page when not installed. */
export async function openAnvayApp(app: AnvayApp, installed: boolean): Promise<void> {
  if (installed) {
    await Linking.openURL(app.scheme).catch(() => undefined);
    return;
  }
  const market = `market://details?id=${app.packageName}`;
  const ok = await Linking.canOpenURL(market).catch(() => false);
  await Linking.openURL(
    ok ? market : `https://play.google.com/store/apps/details?id=${app.packageName}`,
  ).catch(() => undefined);
}
