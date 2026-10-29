/**
 * Google sign-in. Reads name, email and photo, and, if the person allows it on Google's
 * consent screen, the birthday and gender saved in their Google account (People API).
 * With a backend configured, the Google ID token also signs in to Supabase.
 */
import Constants from 'expo-constants';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

import { birthDateFromPeople, factsFromPeople, type ProfileFacts } from '../../domain/account/googleProfile';
import { supabase } from '../supabase/supabaseClient';

// Sign-in itself asks only for name, email and photo.
const NECESSARY_SCOPES = ['profile', 'email'];
/**
 * Birthday and gender are asked for separately, only when this account has no saved profile
 * (incremental authorization). They are Google "sensitive" scopes: they work for the app's test
 * users now; for everyone else Google must verify the OAuth consent screen with these scopes listed.
 */
const BIRTHDAY_SCOPE = 'https://www.googleapis.com/auth/user.birthday.read';
const GENDER_SCOPE = 'https://www.googleapis.com/auth/user.gender.read';

export interface GoogleProfile extends ProfileFacts {
  id: string;
  name: string | null;
  givenName: string | null;
  email: string;
  photo: string | null;
  /** True when the Thrivefold server also accepted the sign-in. */
  serverSession: boolean;
}

export type GoogleResult = { ok: true; profile: GoogleProfile } | { ok: false; cancelled?: boolean; message: string };

let configured = false;
let pending: GoogleProfile | null = null;

const webClientId = (Constants.expoConfig?.extra as { googleWebClientId?: string } | undefined)?.googleWebClientId;

export const googleAvailable = () => Boolean(webClientId);

function configure() {
  if (configured) return;
  GoogleSignin.configure({ webClientId, scopes: NECESSARY_SCOPES });
  configured = true;
}

async function readFacts(accessToken: string): Promise<ProfileFacts> {
  try {
    const res = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      // Google's error reason only (e.g. API disabled or scope missing); no profile data.
      const body = await res.text().catch(() => '');
      console.warn('google people api', res.status, body.slice(0, 300));
      return { age: null, birthYear: null, gender: null, birthDateString: null };
    }
    const json = await res.json();
    // Which fields came back (never the values themselves).
    const b = (json.birthdays ?? []) as { date?: { year?: number; month?: number; day?: number }; metadata?: { source?: { type?: string } } }[];
    console.warn(
      'google people fields',
      JSON.stringify({ birthdays: b.map((x) => ({ y: !!x.date?.year, m: !!x.date?.month, d: !!x.date?.day, src: x.metadata?.source?.type })), genders: (json.genders ?? []).length }),
    );
    return {
      ...factsFromPeople(json),
      birthDateString: birthDateFromPeople(json),
    };
  } catch {
    return { age: null, birthYear: null, gender: null, birthDateString: null };
  }
}

export async function signInWithGoogle(): Promise<GoogleResult> {
  if (!webClientId) return { ok: false, message: 'Google sign-in is not set up in this build.' };
  try {
    configure();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { ok: false, cancelled: true, message: 'Sign-in cancelled.' };
    const { user, idToken } = response.data;
    const { accessToken } = await GoogleSignin.getTokens();
    const facts = await readFacts(accessToken);

    let serverSession = false;
    if (supabase && idToken) {
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      serverSession = !error;
    }

    pending = {
      id: user.id,
      name: user.name,
      givenName: user.givenName,
      email: user.email,
      photo: user.photo,
      serverSession,
      ...facts,
      gender: facts.gender,
    };
    return { ok: true, profile: pending };
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.IN_PROGRESS) return { ok: false, message: 'Sign-in is already in progress.' };
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return { ok: false, message: 'Google Play services are needed for Google sign-in on this phone.' };
      if (String(e.code) === '10' || String(e.code) === 'DEVELOPER_ERROR')
        return { ok: false, message: 'Google sign-in is not fully set up for this app yet. Please continue another way.' };
    }
    return { ok: false, message: 'Could not sign in with Google. Check your connection and try again.' };
  }
}

/**
 * Asks Google (on its own consent screen) to share the birthday and gender saved in the account,
 * then reads them from the People API. Updates the pending profile. Null if declined or unavailable.
 */
export async function requestBirthdayAndGender(): Promise<ProfileFacts | null> {
  if (!pending) return null;
  try {
    configure();
    const added = await GoogleSignin.addScopes({ scopes: [BIRTHDAY_SCOPE, GENDER_SCOPE] });
    console.warn('google addScopes', added ? 'granted' : 'no user');
    if (!added) return null;
    const { accessToken } = await GoogleSignin.getTokens();
    const facts = await readFacts(accessToken);
    pending = {
      ...pending,
      age: facts.age ?? pending.age,
      birthYear: facts.birthYear ?? pending.birthYear,
      birthDateString: facts.birthDateString ?? pending.birthDateString,
      gender: facts.gender ?? pending.gender,
    };
    return facts;
  } catch (e) {
    console.warn('google addScopes failed', isErrorWithCode(e) ? e.code : String(e));
    return null;
  }
}

/** The profile from the most recent Google sign-in, for the confirmation screen. */
export const pendingGoogleProfile = () => pending;

export async function signOutGoogle(): Promise<void> {
  pending = null;
  try {
    configure();
    try {
      await GoogleSignin.revokeAccess();
    } catch {
      // revokeAccess is optional if not currently authorized
    }
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google; nothing to do.
  }
}
