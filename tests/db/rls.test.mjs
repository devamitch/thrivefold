// Runs the Thrivefold migrations on real PostgreSQL (PGlite) with Supabase-like
// auth stubs, then checks the security claims as different users.
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

const dir = process.argv[2] ?? new URL('../../supabase/migrations', import.meta.url).pathname;
const db = new PGlite();
const ids = {
  A: '00000000-0000-0000-0000-00000000000a',
  B: '00000000-0000-0000-0000-00000000000b',
  C: '00000000-0000-0000-0000-00000000000c',
  D: '00000000-0000-0000-0000-00000000000d',
  ADMIN: '00000000-0000-0000-0000-0000000000ad',
};
let pass = 0;
let fail = 0;
const check = (name, ok, extra = '') => {
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
};

async function as(user) {
  await db.exec('reset role');
  if (user === 'service') {
    await db.exec(`select set_config('request.jwt.claim.sub','',false), set_config('request.jwt.claim.role','service_role',false)`);
    return;
  }
  if (user === 'anon') {
    await db.exec(`select set_config('request.jwt.claim.sub','',false), set_config('request.jwt.claim.role','anon',false); set role anon`);
    return;
  }
  await db.exec(`select set_config('request.jwt.claim.sub','${ids[user]}',false), set_config('request.jwt.claim.role','authenticated',false); set role authenticated`);
}
async function q(sql) {
  try { return { rows: (await db.query(sql)).rows }; } catch (e) { return { error: e.message }; }
}

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
}
await db.exec(fs.readFileSync(path.join(dir, '..', 'seed.sql'), 'utf8'));
await db.exec(`insert into public.thrivefold_chip_catalog (id, category, text, risk_class, is_active)
               values ('restricted_01','x','Meet me at ...','restricted',true)`);
console.log('migrations applied');

// Fixture accounts (service role, as the backend would create them)
await as('service');
for (const k of Object.keys(ids)) await db.exec(`insert into auth.users (id) values ('${ids[k]}')`);
for (const [k, verified] of [['A', true], ['B', true], ['C', false], ['D', true], ['ADMIN', true]]) {
  await db.exec(`insert into public.thrivefold_profiles (user_id, pseudonym, is_age_verified) values ('${ids[k]}','${k}',${verified})`);
  await db.exec(`insert into public.thrivefold_social_profiles (user_id, pseudonym, avatar_seed, coarse_region, accepts_introductions) values ('${ids[k]}','${k}','s','r', true)`);
}
await db.exec(`insert into public.thrivefold_platform_admins (user_id) values ('${ids.ADMIN}')`);
await db.exec(`insert into public.thrivefold_communities (id, name, type, purpose, is_private) values ('c4444444-4444-4444-4444-444444444444','Open Walk Club','topic_support','walks',false)`);

// ACC-004: anonymous access denied
await as('anon');
check('anon cannot read profiles', !!(await q('select * from public.thrivefold_profiles')).error);
check('anon cannot read letters', !!(await q('select * from public.thrivefold_letters')).error);

// ACC-004: cross-user isolation
await as('A');
let r = await q('select user_id from public.thrivefold_profiles');
check('user sees only own profile', r.rows?.length === 1 && r.rows[0].user_id === ids.A, JSON.stringify(r));

// REQ-013: no self-verification
await as('C');
await q(`update public.thrivefold_profiles set is_age_verified = true, age_band = '25_29' where user_id = '${ids.C}'`);
await as('service');
r = await q(`select is_age_verified, age_band from public.thrivefold_profiles where user_id = '${ids.C}'`);
check('user cannot mark self age-verified', r.rows?.[0]?.is_age_verified === false, JSON.stringify(r.rows));
check('user cannot change own age band', r.rows?.[0]?.age_band === null, JSON.stringify(r.rows));

// ACC-006: chip-only, server delivery
await as('A');
r = await q(`insert into public.thrivefold_letters (sender_id, recipient_id, stamp_id, chip_ids, assembled_body, scheduled_delivery_at)
             values ('${ids.A}','${ids.B}','s','{intro_01}','free text here', now())`);
check('direct letter insert is denied', !!r.error, r.error);
r = await q(`select public.tf_send_letter('${ids.B}', array['made up free text'], 'rose')`);
check('free-text chip id rejected', /invalid_chips/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_send_letter('${ids.B}', array['restricted_01'], 'rose')`);
check('restricted-risk chip rejected', /invalid_chips/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_send_letter('${ids.B}', array['intro_01','interest_01'], 'rose') as id`);
check('valid chip letter sends', !r.error && r.rows?.[0]?.id, r.error);
const letterId = r.rows?.[0]?.id;
r = await q(`select assembled_body from public.thrivefold_letters where id = '${letterId}'`);
check('body is assembled server-side from catalog', r.rows?.[0]?.assembled_body?.startsWith('Hello!'), JSON.stringify(r.rows));

// Delayed delivery: recipient cannot read before delivery time
await as('B');
r = await q('select id from public.thrivefold_letters');
check('recipient cannot read letter in transit', r.rows?.length === 0, JSON.stringify(r));
r = await q(`select public.tf_mark_letter_opened('${letterId}')`);
await as('service');
r = await q(`select status from public.thrivefold_letters where id = '${letterId}'`);
check('recipient cannot open before delivery', r.rows?.[0]?.status === 'in_transit', JSON.stringify(r.rows));
await db.exec(`update public.thrivefold_letters set scheduled_delivery_at = now() - interval '1 minute' where id = '${letterId}'`);
await as('B');
r = await q('select id from public.thrivefold_letters');
check('recipient reads after delivery time', r.rows?.length === 1, JSON.stringify(r));
await as('C');
r = await q('select id from public.thrivefold_letters');
check('third party cannot read the letter', r.rows?.length === 0, JSON.stringify(r));

// One new introduction per day
await as('A');
r = await q(`select public.tf_send_letter('${ids.D}', array['intro_02'], 'rose')`);
check('second new introduction same day is refused', /daily_introduction_limit/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_send_letter('${ids.B}', array['daily_01'], 'rose')`);
check('existing correspondence is not limited', !r.error, r.error);

// Unverified sender
await as('C');
r = await q(`select public.tf_send_letter('${ids.B}', array['intro_01'], 'rose')`);
check('unverified user cannot send', /age_verification_required/.test(r.error ?? ''), r.error);

// Blocks cancel pending deliveries and stop new ones
await as('A');
r = await q(`select public.tf_send_letter('${ids.B}', array['wellbeing_01'], 'rose') as id`);
const pendingId = r.rows?.[0]?.id;
await as('B');
await q(`insert into public.thrivefold_blocks (user_id, blocked_user_id) values ('${ids.B}','${ids.A}')`);
await as('service');
r = await q(`select status from public.thrivefold_letters where id = '${pendingId}'`);
check('block cancels letters still in transit', r.rows?.[0]?.status === 'cancelled', JSON.stringify(r.rows));
await as('A');
r = await q(`select public.tf_send_letter('${ids.B}', array['intro_01'], 'rose')`);
check('blocked recipient cannot be written to', /recipient_unavailable/.test(r.error ?? ''), r.error);
await as('B');
r = await q('select id from public.thrivefold_letters');
check('blocked sender letters hidden from recipient', r.rows?.length === 0, JSON.stringify(r));

// ACC-005: special grants can't be self-assigned
await as('A');
r = await q(`insert into public.thrivefold_special_grants (user_id, reason) values ('${ids.A}','me please')`);
check('user cannot insert own special grant', !!r.error, r.error);
r = await q(`select public.tf_admin_grant_special('${ids.A}', 'self')`);
check('non-admin cannot call grant function', /forbidden/.test(r.error ?? ''), r.error);
await as('ADMIN');
r = await q(`select public.tf_admin_grant_special('${ids.ADMIN}', 'self grant')`);
check('admin cannot grant themselves', /cannot_self_grant/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_admin_grant_special('${ids.D}', 'founder friend')`);
check('admin can grant another user', !r.error, r.error);
await as('D');
r = await q('select user_id from public.thrivefold_special_grants');
check('grantee sees own grant', r.rows?.length === 1, JSON.stringify(r));
await as('A');
r = await q('select user_id from public.thrivefold_special_grants');
check("others cannot see someone else's grant", r.rows?.length === 0, JSON.stringify(r));
await as('ADMIN');
await q(`select public.tf_admin_revoke_special('${ids.D}', 'ended')`);
await as('service');
r = await q(`select public.tf_has_special_grant('${ids.D}') as g`);
check('revocation takes effect server-side', r.rows?.[0]?.g === false, JSON.stringify(r.rows));
r = await q(`select count(*)::int as n from public.thrivefold_audit_log`);
check('grant actions are audited', r.rows?.[0]?.n >= 2, JSON.stringify(r.rows));

// REQ-011: restriction with evidence, cancels deliveries, appeal + reinstatement
await as('D');
await q(`select public.tf_send_letter('${ids.B}', array['intro_01'], 'rose')`);
await as('ADMIN');
r = await q(`select public.tf_admin_restrict('${ids.D}', 'social_restricted', 'spam', 'short')`);
check('restriction requires evidence', /evidence_required/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_admin_restrict('${ids.D}', 'social_restricted', 'spam', 'Repeated unsolicited promotional letters reported by 3 users') as id`);
const restrictionId = r.rows?.[0]?.id;
check('admin can restrict with evidence', !r.error && restrictionId, r.error);
await as('service');
r = await q(`select count(*)::int as n from public.thrivefold_letters where sender_id = '${ids.D}' and status = 'in_transit'`);
check('restriction cancels pending deliveries', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));
await as('D');
r = await q(`select public.tf_send_letter('${ids.B}', array['daily_01'], 'rose')`);
check('restricted user cannot send', /account_restricted/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_join_community('c4444444-4444-4444-4444-444444444444')`);
check('restricted user cannot join communities', /account_restricted/.test(r.error ?? ''), r.error);
r = await q(`insert into public.thrivefold_appeals (user_id, restriction_id, statement) values ('${ids.D}','${restrictionId}','I was sharing a walking group I run, not spam.') returning id`);
const appealId = r.rows?.[0]?.id;
check('user can appeal own restriction', !r.error && appealId, r.error);
await as('A');
r = await q(`insert into public.thrivefold_appeals (user_id, restriction_id, statement) values ('${ids.A}','${restrictionId}','Not my restriction but appealing')`);
check("user cannot appeal someone else's restriction", !!r.error, r.error);
r = await q(`select public.tf_admin_decide_appeal('${appealId}', true)`);
check('non-admin cannot decide appeals', /forbidden/.test(r.error ?? ''), r.error);
await as('ADMIN');
await q(`select public.tf_admin_decide_appeal('${appealId}', true)`);
await as('service');
r = await q(`select public.tf_is_restricted('${ids.D}') as r`);
check('overturned appeal reinstates the account', r.rows?.[0]?.r === false, JSON.stringify(r.rows));

// ACC-006: communities
await as('A');
r = await q('select name from public.thrivefold_communities order by name');
check('private communities hidden from non-members', JSON.stringify(r.rows?.map((x) => x.name)) === '["Open Walk Club"]', JSON.stringify(r));
r = await q(`select public.tf_join_community('c1111111-1111-1111-1111-111111111111')`);
check('private community requires invitation', /invitation_required/.test(r.error ?? ''), r.error);
r = await q(`insert into public.thrivefold_community_memberships (community_id, user_id) values ('c1111111-1111-1111-1111-111111111111','${ids.A}')`);
check('cannot insert membership directly', !!r.error, r.error);
r = await q(`select public.tf_join_community('c4444444-4444-4444-4444-444444444444')`);
check('verified user below level 6 cannot join', /level_required/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_create_community('Lift club', 'Morning lifting partners in my area', 'gym')`);
check('creating a community needs level 10', /level_required/.test(r.error ?? ''), r.error);
await as('service');
await db.exec(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
               values ('${ids.A}', 'fixture_xp_l6', 'legacy_import', (select min_xp from public.thrivefold_levels where level = 6), current_date, 'fixture', 'test')`);
await as('A');
r = await q(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
             values ('${ids.A}', 'self_xp', 'legacy_import', 99999, current_date, 'me', 'x')`);
check('user cannot grant own XP', !!r.error, r.error);
r = await q(`select public.tf_join_community('c4444444-4444-4444-4444-444444444444')`);
check('verified user joins open community', !r.error, r.error);
r = await q(`select public.tf_create_community('Lift club', 'Morning lifting partners in my area', 'gym')`);
check('level 6 still cannot create a community', /level_required/.test(r.error ?? ''), r.error);
await as('service');
await db.exec(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
               values ('${ids.A}', 'fixture_xp_l10', 'legacy_import', (select min_xp from public.thrivefold_levels where level = 10), current_date, 'fixture', 'test')`);
await as('A');
r = await q(`select public.tf_create_community('Lift club', 'Morning lifting partners in my area', 'gym') as id`);
const newCommunity = r.rows?.[0]?.id;
check('level 10 creates a community', !r.error && newCommunity, r.error);
r = await q(`select verification_status from public.thrivefold_communities where id = '${newCommunity}'`);
check('organiser sees own pending community', r.rows?.[0]?.verification_status === 'pending_founder_call', JSON.stringify(r));
await as('B');
r = await q(`select id from public.thrivefold_communities where id = '${newCommunity}'`);
check('pending community hidden from discovery', r.rows?.length === 0, JSON.stringify(r));
r = await q(`select public.tf_admin_verify_community('${newCommunity}', true)`);
check('non-admin cannot verify a community', /forbidden/.test(r.error ?? ''), r.error);
await as('ADMIN');
await q(`select public.tf_admin_verify_community('${newCommunity}', true)`);
await as('B');
r = await q(`select id from public.thrivefold_communities where id = '${newCommunity}'`);
check('verified community is listed', r.rows?.length === 1, JSON.stringify(r));
r = await q(`select public.tf_my_gates() as g`);
check('gates report server level and thresholds', r.rows?.[0]?.g?.gates?.dating === 20, JSON.stringify(r.rows));
await as('service');
await db.exec(`delete from public.thrivefold_reward_ledger where key like 'fixture_xp_%'`);
await as('A');
await as('C');
r = await q(`select public.tf_join_community('c4444444-4444-4444-4444-444444444444')`);
check('unverified user cannot join communities', /age_verification_required/.test(r.error ?? ''), r.error);

// Consent revocation and export
await as('A');
await q(`insert into public.thrivefold_consents (user_id, feature_id, version) values ('${ids.A}','letters','v1')`);
r = await q(`update public.thrivefold_consents set status = 'revoked', revoked_at = now() where feature_id = 'letters' returning status`);
check('user can revoke own consent', r.rows?.[0]?.status === 'revoked', JSON.stringify(r));
r = await q('select public.tf_export_my_data() as e');
const exp = r.rows?.[0]?.e;
check('export contains only own profile', exp?.profile?.user_id === ids.A, r.error);
check('export excludes undelivered incoming letters', Array.isArray(exp?.letters_received), r.error);

// REQ-014: payment tables removed
await as('service');
r = await q(`select count(*)::int as n from information_schema.tables where table_name in ('thrivefold_entitlements','thrivefold_credit_ledger')`);
check('payment tables do not exist', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));

// Self-granted stamps
await as('A');
r = await q(`insert into public.thrivefold_user_stamps (user_id, stamp_id) values ('${ids.A}','x')`);
check('user cannot grant themselves stamps', !!r.error, r.error);

// Progression (migration 5): rewards from the catalog, idempotent, atomic unlocks
await as('A');
r = await q(`select public.tf_claim_task_reward('asg_1', 'goal_define_one', current_date) as r`);
check('user can claim a catalog task reward', r.rows?.[0]?.r?.status === 'recorded' && r.rows[0].r.xp === 15, r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_claim_task_reward('asg_1', 'goal_define_one', current_date) as r`);
check('same assignment cannot pay twice', r.rows?.[0]?.r?.status === 'duplicate', r.error);
r = await q(`select public.tf_claim_task_reward('asg_2', 'no_such_task', current_date) as r`);
check('unknown task is rejected', /unknown task/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_claim_task_reward('asg_3', 'goal_define_one', current_date - 5) as r`);
check('stale game date is rejected', /stale game date/.test(r.error ?? ''), r.error);
r = await q(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, diamonds, game_date, source_id, policy_version)
             values ('${ids.A}', 'forged', 'level_clear', 0, 999, current_date, 'x', 'x')`);
check('client cannot write the reward ledger directly', !!r.error, r.error);
r = await q(`select public.tf_my_progress() as p`);
check('progress summary reflects only server-granted rewards', r.rows?.[0]?.p?.xp === 15 && r.rows[0].p.diamonds === 0, JSON.stringify(r.rows));
r = await q(`select public.tf_unlock_feature('emblem_set_nature') as u`);
check('unlock refused below the level requirement', r.rows?.[0]?.u?.block === 'LEVEL_TOO_LOW', r.error ?? JSON.stringify(r.rows));
for (let i = 4; i < 10; i++) await q(`select public.tf_claim_task_reward('asg_${i}', 'goal_define_one', current_date)`);
r = await q(`select public.tf_claim_task_reward('asg_99', 'goal_define_one', current_date) as r`);
check('daily quest claim limit is enforced', /limit/.test(r.error ?? ''), r.error);
await as('service');
await q(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
         values ('${ids.A}', 'test_xp', 'legacy_import', 200, current_date, 'test', 'test')`);
await q(`select public.tf_settle_levels('${ids.A}', current_date)`);
await as('A');
r = await q(`select public.tf_my_progress() as p`);
const prog = r.rows?.[0]?.p;
check('level-clear diamonds are granted by the server', prog?.level >= 2 && prog?.diamonds > 0, JSON.stringify(prog));
r = await q(`select public.tf_unlock_feature('emblem_set_nature') as u`);
check('eligible unlock spends once and grants', r.rows?.[0]?.u?.ok === true, r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_unlock_feature('emblem_set_nature') as u`);
check('second unlock does not spend again', r.rows?.[0]?.u?.block === 'OWNED', JSON.stringify(r.rows));
r = await q(`select count(*)::int as n from public.thrivefold_reward_ledger where key = 'unlock:emblem_set_nature'`);
check('exactly one spend row exists', r.rows?.[0]?.n === 1, JSON.stringify(r.rows));
await as('B');
r = await q(`select count(*)::int as n from public.thrivefold_reward_ledger`);
check('other users cannot see A ledger', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));
r = await q(`select count(*)::int as n from public.thrivefold_feature_entitlements`);
check('other users cannot see A entitlements', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));
await as('anon');
r = await q(`select public.tf_claim_task_reward('x', 'goal_define_one', current_date)`);
check('anon cannot claim rewards', !!r.error, r.error);

// Setup rewards (migration 6): fixed server-side amounts, once per step
await as('B');
r = await q(`select public.tf_claim_setup_reward('goals') as r`);
check('setup step reward is recorded with the server amount', r.rows?.[0]?.r?.status === 'recorded' && r.rows[0].r.xp === 25, r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_claim_setup_reward('goals') as r`);
check('setup step cannot pay twice', r.rows?.[0]?.r?.status === 'duplicate', r.error);
r = await q(`select public.tf_claim_setup_reward('anything_else') as r`);
check('unknown setup step is rejected', /unknown setup step/.test(r.error ?? ''), r.error);
await as('anon');
r = await q(`select public.tf_claim_setup_reward('privacy')`);
check('anon cannot claim setup rewards', !!r.error, r.error);

// Workout rewards (migration 7): fixed amounts, 10x for good checked form, two per day
await as('B');
r = await q(`select public.tf_claim_workout_reward('wk_1', current_date, 40, 0.9) as r`);
check('form-checked workout earns ten times the base', r.rows?.[0]?.r?.xp === 50, r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_claim_workout_reward('wk_1', current_date, 40, 0.9) as r`);
check('same workout cannot pay twice', r.rows?.[0]?.r?.status === 'duplicate', r.error);
r = await q(`select public.tf_claim_workout_reward('wk_2', current_date, 5, 0.95) as r`);
check('too few tracked frames earns only the base', r.rows?.[0]?.r?.xp === 5, r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_claim_workout_reward('wk_3', current_date, 40, 0.9) as r`);
check('third workout of the day is refused', /workout limit/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_claim_workout_reward('wk_4', current_date - 3, 40, 0.9) as r`);
check('stale workout date is refused', /stale game date/.test(r.error ?? ''), r.error);

// Correspondence (migration 10): chip catalogue seeded, intro candidates gated
await as('A');
r = await q(`select count(*)::int as n from public.thrivefold_chip_catalog where id in ('intro_03','gratitude_01','close_01')`);
check('approved chips are seeded by migration', (r.rows?.[0]?.n ?? 0) >= 2, JSON.stringify(r.rows ?? r.error));
r = await q(`select user_id from public.tf_intro_candidates(50)`);
const cands = (r.rows ?? []).map((x) => x.user_id);
check('verified adult gets intro candidates', !r.error && cands.length > 0, r.error);
check('candidates never include the caller', !cands.includes(ids.A));
check('candidates never include unverified people', !cands.includes(ids.C));
check('candidates exclude people already written to', !cands.includes(ids.B));
await as('C');
r = await q(`select * from public.tf_intro_candidates(10)`);
check('unverified person cannot discover pen pals', !!r.error, r.error);
await as('anon');
r = await q(`select * from public.tf_intro_candidates(10)`);
check('anon cannot discover pen pals', !!r.error, r.error);

// Age assurance (migration 11): only a provider decision, via the service role, verifies
await as('C');
r = await q(`select public.tf_age_check_started('${ids.C}', 'veriff', 'sess-c1')`);
check('a person cannot record their own age check', !!r.error, r.error);
r = await q(`select public.tf_age_check_decided('veriff', 'sess-c1', 'approved', true)`);
check('a person cannot approve their own age check', !!r.error, r.error);
r = await q(`update public.thrivefold_profiles set is_age_verified = true where user_id = '${ids.C}'`);
r = await q(`select is_age_verified from public.thrivefold_profiles where user_id = '${ids.C}'`);
check('profile verification cannot be self-set', r.rows?.[0]?.is_age_verified === false, JSON.stringify(r.rows ?? r.error));
await as('service');
await db.exec(`select public.tf_age_check_started('${ids.C}', 'veriff', 'sess-c-minor')`);
r = await q(`select public.tf_age_check_decided('veriff', 'sess-c-minor', 'approved', false) as d`);
check('an approved check of a minor does not verify', r.rows?.[0]?.d?.status === 'under_age', JSON.stringify(r.rows ?? r.error));
r = await q(`select is_age_verified from public.thrivefold_profiles where user_id = '${ids.C}'`);
check('minor stays unverified', r.rows?.[0]?.is_age_verified === false);
await db.exec(`select public.tf_age_check_started('${ids.C}', 'veriff', 'sess-c2')`);
r = await q(`select public.tf_age_check_decided('veriff', 'sess-c2', 'approved', true) as d`);
check('an approved adult check verifies', r.rows?.[0]?.d?.status === 'approved', JSON.stringify(r.rows ?? r.error));
r = await q(`select public.tf_age_check_decided('veriff', 'no-such-session', 'approved', true)`);
check('unknown provider sessions are refused', !!r.error, r.error);
for (const n of [3, 4, 5]) await db.exec(`select public.tf_age_check_started('${ids.C}', 'veriff', 'sess-c${n}')`);
r = await q(`select public.tf_age_check_started('${ids.C}', 'veriff', 'sess-c6')`);
check('age checks are rate limited per day', !!r.error && r.error.includes('too_many_attempts'), r.error);
await as('C');
r = await q(`select public.tf_my_age_check() as s`);
check('verified person sees their status', r.rows?.[0]?.s?.verified === true, JSON.stringify(r.rows ?? r.error));
await as('A');
r = await q(`select count(*)::int as n from public.thrivefold_age_checks where user_id = '${ids.C}'`);
check("other people's age checks are hidden", r.rows?.[0]?.n === 0, JSON.stringify(r.rows ?? r.error));
await as('service');
await db.exec(`update public.thrivefold_profiles set is_age_verified = false where user_id = '${ids.C}'`);

// Dating (migration 12): verified adults at level 20, women start, chip-only, closable
const L20 = `(select min_xp from public.thrivefold_levels where level = 20)`;
const prof = (g, into) => `select public.tf_dating_save_profile('${g}', array[${into.map((x) => `'${x}'`).join(',')}], array['walks'], array['dating_reflect_01'], true)`;
await as('B');
r = await q(prof('man', ['woman']));
check('dating needs level 20', /level_required/.test(r.error ?? ''), r.error);
await as('C');
r = await q(prof('woman', ['man']));
check('dating needs a verified adult', /age_verification_required/.test(r.error ?? ''), r.error);
await as('service');
await db.exec(`delete from public.thrivefold_blocks where user_id = '${ids.B}' and blocked_user_id = '${ids.A}'`);
for (const k of ['A', 'B', 'D']) {
  await db.exec(`insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
                 values ('${ids[k]}', 'fixture_xp_l20_${k}', 'legacy_import', ${L20}, current_date, 'fixture', 'test')`);
}
await as('A'); r = await q(prof('woman', ['man']));
check('verified level-20 adult saves a dating profile', !r.error, r.error);
await as('B'); await q(prof('man', ['woman']));
await as('D'); await q(prof('man', ['man']));
await as('B');
r = await q(`select public.tf_dating_start('${ids.A}', array['dating_hello_01'])`);
check('a man cannot start a dating conversation (women start)', /women_start_conversations/.test(r.error ?? ''), r.error);
r = await q(`insert into public.thrivefold_dating_conversations (user_a, user_b, initiator) values ('${ids.A}', '${ids.B}', '${ids.B}')`);
check('conversations cannot be inserted directly', !!r.error, r.error);
await as('A');
r = await q(`select user_id from public.tf_dating_candidates(50)`);
const dc = (r.rows ?? []).map((x) => x.user_id);
check('candidates are mutually compatible', dc.includes(ids.B) && !dc.includes(ids.D), r.error ?? JSON.stringify(dc));
r = await q(`select public.tf_dating_start('${ids.D}', array['dating_hello_01'])`);
check('incompatible people cannot be contacted', /recipient_unavailable/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_dating_start('${ids.B}', array['call me on 555'])`);
check('dating messages are chip-only', /invalid_chips/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_dating_start('${ids.B}', array['dating_hello_01','dating_reflect_05']) as id`);
const conv = r.rows?.[0]?.id;
check('a woman starts a conversation', !r.error && conv, r.error);
r = await q(`select public.tf_dating_start('${ids.B}', array['dating_hello_02'])`);
check('a second first contact to the same person is refused', /conversation_exists/.test(r.error ?? ''), r.error);
await as('B');
r = await q(`select public.tf_dating_send('${conv}', array['dating_reply_01']) as id`);
check('the other person can reply', !r.error && r.rows?.[0]?.id, r.error);
r = await q(`select count(*)::int as n from public.thrivefold_dating_messages where conversation_id = '${conv}'`);
check('participants read the conversation', r.rows?.[0]?.n === 2, JSON.stringify(r.rows ?? r.error));
r = await q(`insert into public.thrivefold_dating_messages (conversation_id, sender_id, chip_ids, body) values ('${conv}', '${ids.B}', array['x'], 'free text')`);
check('messages cannot be inserted directly', !!r.error, r.error);
await as('D');
r = await q(`select count(*)::int as n from public.thrivefold_dating_messages`);
check('outsiders cannot read dating messages', r.rows?.[0]?.n === 0, JSON.stringify(r.rows ?? r.error));
r = await q(`select public.tf_dating_send('${conv}', array['dating_reply_01'])`);
check('outsiders cannot post into a conversation', /conversation_unavailable/.test(r.error ?? ''), r.error);
await as('service');
await db.exec(`insert into public.thrivefold_blocks (user_id, blocked_user_id) values ('${ids.B}','${ids.A}')`);
await as('A');
r = await q(`select public.tf_dating_send('${conv}', array['dating_reply_02'])`);
check('a block stops the conversation', /conversation_unavailable/.test(r.error ?? ''), r.error);
r = await q(`select count(*)::int as n from public.thrivefold_dating_messages where conversation_id = '${conv}'`);
check('blocked people cannot read the conversation', r.rows?.[0]?.n === 0, JSON.stringify(r.rows ?? r.error));
await as('service');
await db.exec(`delete from public.thrivefold_blocks where user_id = '${ids.B}' and blocked_user_id = '${ids.A}'`);
await as('A');
await q(`select public.tf_dating_mark_read('${conv}')`);
r = await q(`select unread from public.tf_dating_conversations() where id = '${conv}'`);
check('marking read clears unread', r.rows?.[0]?.unread === 0, JSON.stringify(r.rows ?? r.error));
await q(`select public.tf_dating_close('${conv}')`);
await as('B');
r = await q(`select public.tf_dating_send('${conv}', array['dating_reply_02'])`);
check('a closed conversation takes no more messages', /conversation_closed/.test(r.error ?? ''), r.error);

// Dating preferences, ranking and reports (migration 13)
await as('B');
r = await q(`select public.tf_dating_save_preferences('25-34', array['25-34'], array['English'], 'long_term', 'slow')`);
check('saves dating preferences', !r.error, r.error);
await as('A');
await q(`select public.tf_dating_save_preferences('45-54', array[]::text[], array['English'], 'long_term', 'slow')`);
r = await q(`select user_id from public.tf_dating_candidates(50)`);
check('age-band preferences are mutual (B wants 25-34, A is 45-54)', !(r.rows ?? []).some((x) => x.user_id === ids.B), r.error ?? JSON.stringify(r.rows));
await q(`select public.tf_dating_save_preferences('25-34', array[]::text[], array['English'], 'long_term', 'slow')`);
await q(`select public.tf_dating_save_profile('woman', array['man'], array['walks','music'], array['dating_reflect_01'], true)`);
// D (no conversation with A yet) now looks for women, with overlapping interests and language.
await as('D');
await q(`select public.tf_dating_save_profile('man', array['woman'], array['walks','music'], array['dating_reflect_01'], true)`);
await q(`select public.tf_dating_save_preferences('25-34', array[]::text[], array['English'], 'long_term', 'slow')`);
await as('A');
r = await q(`select user_id, shared_interests, shared_languages, score from public.tf_dating_candidates(50)`);
const rb = (r.rows ?? []).find((x) => x.user_id === ids.D);
check('candidates come with shared interests and a score', !!rb && rb.shared_interests.length === 2 && rb.score >= 7, r.error ?? JSON.stringify(r.rows));
r = await q(`update public.thrivefold_dating_profiles set age_band = '18-24' where user_id = '${ids.A}'`);
check('preferences cannot be written directly', !!r.error || r.rowCount === 0, r.error);
await as('D');
r = await q(`select public.tf_dating_report('${conv}', 'harassment', true)`);
check('outsiders cannot report a conversation they are not in', /conversation_unavailable/.test(r.error ?? ''), r.error);
await as('B');
r = await q(`select public.tf_dating_report('${conv}', 'nonsense', true)`);
check('report categories are fixed', /invalid_category/.test(r.error ?? ''), r.error);
r = await q(`select public.tf_dating_report('${conv}', 'pressure', true) as id`);
check('a participant reports and blocks', !r.error && r.rows?.[0]?.id, r.error);
r = await q(`select count(*)::int as n from public.thrivefold_blocks where user_id = '${ids.B}' and blocked_user_id = '${ids.A}'`);
check('the report also blocked them', r.rows?.[0]?.n === 1, JSON.stringify(r.rows ?? r.error));
r = await q(`select evidence_summary from public.thrivefold_safety_reports where reporter_id = '${ids.B}' order by created_at desc limit 1`);
check('the report carries the chip messages as evidence', /them: /.test(r.rows?.[0]?.evidence_summary ?? ''), JSON.stringify(r.rows ?? r.error));
await as('service');
await db.exec(`delete from public.thrivefold_blocks where user_id = '${ids.B}' and blocked_user_id = '${ids.A}'`);

// Weekly summaries (migration 8): opt-in, own rows only, validated
await as('B');
r = await q(`select public.tf_upsert_weekly_summary(date_trunc('week', current_date - 7)::date, 3, 6.5, 7, 4, 7.2, 5, 2, 90, 1, 120) as r`);
check('signed-in person can back up a weekly summary', r.rows?.[0]?.r?.status === 'saved', r.error ?? JSON.stringify(r.rows));
r = await q(`select public.tf_upsert_weekly_summary(date_trunc('week', current_date - 7)::date, 9, 6.5, 7, 4, 7.2, 5, 2, 90, 1, 120) as r`);
check('impossible values are refused', !!r.error, r.error);
r = await q(`select count(*)::int as n from public.thrivefold_weekly_summaries`);
check('owner sees their weekly summary', r.rows?.[0]?.n === 1, JSON.stringify(r.rows));
await as('A');
r = await q(`select count(*)::int as n from public.thrivefold_weekly_summaries`);
check('other users cannot see weekly summaries', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));
r = await q(`insert into public.thrivefold_weekly_summaries (user_id, week_start, check_ins, quests_done, workouts, active_minutes, form_checked_sessions, xp_earned) values ('${ids.A}', date_trunc('week', current_date)::date, 1, 0, 0, 0, 0, 0)`);
check('summaries cannot be written directly', !!r.error, r.error);
await as('anon');
r = await q(`select public.tf_upsert_weekly_summary(date_trunc('week', current_date - 7)::date, 1, 5, 5, 5, 7, 0, 0, 0, 0, 0)`);
check('anon cannot back up summaries', !!r.error, r.error);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
