// Thrivefold account deletion (Supabase Edge Function, Deno).
//
//   POST /delete-account   signed-in user, body {"confirm": "DELETE"}
//
// Deletes the caller's auth user. Every Thrivefold table references auth.users with
// ON DELETE CASCADE (profile, social card, letters, dating, groups membership, rewards, age
// checks, consents, weekly summaries) or ON DELETE SET NULL where the record belongs to others
// (a group someone founded, a moderator decision). The admin audit log keeps only a bare id.
// The app erases everything on the phone after this succeeds.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);

  let body: { confirm?: string } = {};
  try {
    body = await req.json();
  } catch {
    // fall through to the confirmation check
  }
  if (body.confirm !== 'DELETE') return json({ error: 'confirmation_required' }, 400);

  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) return json({ error: 'not_authenticated' }, 401);

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { error: delError } = await admin.auth.admin.deleteUser(data.user.id);
  if (delError) return json({ error: 'server_error' }, 500);
  return json({ deleted: true });
});
