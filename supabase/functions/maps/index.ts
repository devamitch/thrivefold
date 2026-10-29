// Thrivefold maps proxy (Supabase Edge Function, Deno): walking/transit routes and place search.
//
//   POST /maps  signed-in user
//   {"action":"route","origin":{"lat":..,"lon":..}|"text","destination":..,"mode":"WALK"|"TRANSIT"|"DRIVE"|"BICYCLE"}
//   {"action":"places","query":"Durga Puja pandal","near":{"lat":..,"lon":..},"radiusM":5000}
//
// * The Google Maps key lives only in the function secret GOOGLE_MAPS_KEY; it never reaches the app.
// * Uses Routes API (computeRoutes) and Places API (New) Text Search; both must be allowed for the key.
// * Shares the per-person daily request counter with the AI functions; nothing is stored or logged.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('MAPS_DAILY_LIMIT') || 80);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type LatLon = { lat: number; lon: number };
const isLatLon = (v: unknown): v is LatLon =>
  !!v && typeof v === 'object' && Number.isFinite((v as LatLon).lat) && Number.isFinite((v as LatLon).lon) &&
  Math.abs((v as LatLon).lat) <= 90 && Math.abs((v as LatLon).lon) <= 180;
const waypoint = (v: unknown) =>
  isLatLon(v)
    ? { location: { latLng: { latitude: v.lat, longitude: v.lon } } }
    : typeof v === 'string' && v.trim().length >= 2
      ? { address: v.trim().slice(0, 200) }
      : null;

async function google(url: string, fieldMask: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env('GOOGLE_MAPS_KEY'), 'X-Goog-FieldMask': fieldMask },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = (data as { error?: { details?: { reason?: string }[]; status?: string } }).error;
    throw new Error(reason?.details?.[0]?.reason ?? reason?.status ?? `http_${res.status}`);
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!env('GOOGLE_MAPS_KEY')) return json({ error: 'not_configured' }, 503);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: 'maps' });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);

  try {
    if (body.action === 'route') {
      const origin = waypoint(body.origin);
      const destination = waypoint(body.destination);
      const mode = ['WALK', 'TRANSIT', 'DRIVE', 'BICYCLE'].includes(String(body.mode)) ? String(body.mode) : 'WALK';
      if (!origin || !destination) return json({ error: 'invalid_request' }, 400);
      const data = (await google(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.warnings,routes.legs.steps.navigationInstruction.instructions',
        { origin, destination, travelMode: mode, languageCode: 'en-IN', units: 'METRIC' },
      )) as { routes?: { duration?: string; distanceMeters?: number; polyline?: { encodedPolyline?: string }; warnings?: string[]; legs?: { steps?: { navigationInstruction?: { instructions?: string } }[] }[] }[] };
      const r = data.routes?.[0];
      if (!r) return json({ route: null });
      return json({
        route: {
          seconds: Number(String(r.duration ?? '0s').replace('s', '')) || 0,
          meters: r.distanceMeters ?? 0,
          polyline: r.polyline?.encodedPolyline ?? null,
          warnings: (r.warnings ?? []).slice(0, 5),
          steps: (r.legs?.[0]?.steps ?? []).map((s) => s.navigationInstruction?.instructions).filter(Boolean).slice(0, 25),
          mode,
        },
        source: 'Google Maps Routes API',
        fetchedAt: new Date().toISOString(),
      });
    }

    if (body.action === 'places') {
      const query = typeof body.query === 'string' ? body.query.trim().slice(0, 120) : '';
      if (query.length < 2) return json({ error: 'invalid_request' }, 400);
      const near = isLatLon(body.near) ? body.near : null;
      const radius = Math.min(30_000, Math.max(500, Number(body.radiusM) || 5000));
      const data = (await google(
        'https://places.googleapis.com/v1/places:searchText',
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.googleMapsUri,places.accessibilityOptions',
        {
          textQuery: query,
          maxResultCount: 12,
          languageCode: 'en',
          ...(near ? { locationBias: { circle: { center: { latitude: near.lat, longitude: near.lon }, radius } } } : {}),
        },
      )) as { places?: { id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number; currentOpeningHours?: { openNow?: boolean }; googleMapsUri?: string; accessibilityOptions?: { wheelchairAccessibleEntrance?: boolean } }[] };
      return json({
        places: (data.places ?? [])
          .filter((p) => p.location)
          .map((p) => ({
            id: p.id,
            name: p.displayName?.text ?? 'Place',
            address: p.formattedAddress ?? null,
            lat: p.location!.latitude,
            lon: p.location!.longitude,
            rating: p.rating ?? null,
            ratings: p.userRatingCount ?? null,
            openNow: p.currentOpeningHours?.openNow ?? null,
            mapsUrl: p.googleMapsUri ?? null,
            wheelchairEntrance: p.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
          })),
        source: 'Google Maps Places API',
        fetchedAt: new Date().toISOString(),
      });
    }
    return json({ error: 'invalid_request' }, 400);
  } catch (e) {
    // Provider reason only (e.g. API_KEY_SERVICE_BLOCKED), so the app can say what is missing.
    return json({ error: 'provider_error', reason: e instanceof Error ? e.message : 'unknown' }, 502);
  }
});
