/**
 * Google sign-in. Reads name, email and photo, and, if the person allows it on Google's
 * consent screen, the birthday and gender saved in their Google account (People API).
 * With a backend configured, the Google ID token also signs in to Supabase.
 */
import Constants from 'expo-constants';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

import { factsFromPeople, type ProfileFacts } from '../../domain/account/googleProfile';
import { supabase } from '../supabase/supabaseClient';

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
  GoogleSignin.configure({ webClientId, scopes: [BIRTHDAY_SCOPE, GENDER_SCOPE] });
  configured = true;
}

async function readFacts(accessToken: string): Promise<ProfileFacts> {
  try {
    const res = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { age: null, birthYear: null, gender: null };
    return factsFromPeople(await res.json());
  } catch {
    return { age: null, birthYear: null, gender: null };
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

/** The profile from the most recent Google sign-in, for the confirmation screen. */
export const pendingGoogleProfile = () => pending;

export async function signOutGoogle(): Promise<void> {
  pending = null;
  try {
    configure();
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google; nothing to do.
  }
}
