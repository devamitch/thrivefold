// Thrivefold age check (Supabase Edge Function, Deno).
//
//   POST /age-check/start    signed-in user -> creates a provider session, returns its URL
//   POST /age-check/webhook  provider decision -> HMAC-checked -> tf_age_check_decided
//
// The provider is Veriff (https://devdocs.veriff.com). Only the outcome is stored; the date of
// birth is read in memory to decide 18+ and then dropped. Deploy with verify_jwt disabled for
// this function (the webhook carries no user token); /start checks the user's JWT itself.
//
// Secrets (supabase secrets set ...): VERIFF_API_KEY, VERIFF_SHARED_SECRET,
// optional AGE_CHECK_RETURN_URL (default thrivefold://you/age-check).
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { isAdult } from './age.ts';

const PROVIDER = 'veriff';
const VERIFF_API = 'https://stationapi.veriff.com/v1/sessions';

const env = (k: string) => Deno.env.get(k) ?? '';
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const admin = () =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison so the signature can't be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function start(req: Request): Promise<Response> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: user, error: userError } = await userClient.auth.getUser(token);
  if (userError || !user.user) return json({ error: 'not_authenticated' }, 401);
  if (!env('VERIFF_API_KEY')) return json({ error: 'provider_not_configured' }, 503);

  const res = await fetch(VERIFF_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-AUTH-CLIENT': env('VERIFF_API_KEY') },
    body: JSON.stringify({
      verification: {
        callback: env('AGE_CHECK_RETURN_URL') || 'thrivefold://you/age-check',
        vendorData: user.user.id,
      },
    }),
  });
  if (!res.ok) return json({ error: 'provider_unavailable' }, 502);
  const body = await res.json();
  const session = body?.verification;
  if (!session?.id || !session?.url) return json({ error: 'provider_unavailable' }, 502);

  const { error } = await admin().rpc('tf_age_check_started', {
    p_user: user.user.id,
    p_provider: PROVIDER,
    p_session: session.id,
  });
  if (error) {
    const limited = error.message.includes('too_many_attempts');
    return json({ error: limited ? 'too_many_attempts' : 'server_error' }, limited ? 429 : 500);
  }
  return json({ url: session.url });
}

async function webhook(req: Request): Promise<Response> {
  const raw = await req.text();
  const secret = env('VERIFF_SHARED_SECRET');
  const given = (req.headers.get('X-HMAC-SIGNATURE') ?? '').toLowerCase();
  if (!secret || !given || !safeEqual(await hmacHex(secret, raw), given)) return json({ error: 'bad_signature' }, 401);

  let event: { verification?: { id?: string; status?: string; person?: { dateOfBirth?: string | null } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  const v = event.verification;
  if (!v?.id || !v.status) return json({ ok: true }); // not a decision event

  const status =
    v.status === 'approved' ? 'approved'
    : v.status === 'resubmission_requested' ? 'resubmission'
    : v.status === 'expired' || v.status === 'abandoned' ? 'expired'
    : 'declined';

  const { error } = await admin().rpc('tf_age_check_decided', {
    p_provider: PROVIDER,
    p_session: v.id,
    p_status: status,
    p_is_adult: isAdult(v.person?.dateOfBirth),
  });
  // Unknown sessions are acknowledged so the provider stops retrying; nothing is changed.
  if (error && !error.message.includes('unknown_session')) return json({ error: 'server_error' }, 500);
  return json({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const path = new URL(req.url).pathname;
  if (path.endsWith('/start')) return start(req);
  if (path.endsWith('/webhook')) return webhook(req);
  return json({ error: 'not_found' }, 404);
});
