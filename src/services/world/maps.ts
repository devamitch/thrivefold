/**
 * Routes and place search through the Thrivefold `maps` Edge Function, which holds the Google Maps
 * key server-side. Needs a signed-in account; errors carry the provider's reason so the screen can
 * say exactly what is missing (for example a Maps API not enabled for the key).
 */
import { supabase } from '../supabase/supabaseClient';

export interface MapPlace {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lon: number;
  rating: number | null;
  ratings: number | null;
  openNow: boolean | null;
  mapsUrl: string | null;
  wheelchairEntrance: boolean | null;
}

export interface MapRoute {
  seconds: number;
  meters: number;
  polyline: string | null;
  warnings: string[];
  steps: string[];
  mode: 'WALK' | 'TRANSIT' | 'DRIVE' | 'BICYCLE';
}

type Point = { lat: number; lon: number } | string;

export class MapsError extends Error {
  constructor(
    message: string,
    readonly reason: string | null,
  ) {
    super(message);
  }
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new MapsError('Maps need the Thrivefold server.', 'not_configured');
  const { data, error } = await supabase.functions.invoke('maps', { body });
  if (error) {
    let reason: string | null = null;
    try {
      const ctx = (error as { context?: Response }).context;
      const j = ctx ? await ctx.json() : null;
      reason = j?.reason ?? j?.error ?? null;
    } catch {
      reason = null;
    }
    const msg =
      reason === 'not_authenticated'
        ? 'Sign in to plan routes.'
        : reason === 'daily_limit'
          ? 'Daily limit for maps reached. Try again tomorrow.'
          : reason === 'API_KEY_SERVICE_BLOCKED'
            ? 'The Maps key does not allow this service yet (enable Routes API and Places API (New) for it).'
            : 'Maps could not answer just now.';
    throw new MapsError(msg, reason);
  }
  return data as T;
}

export async function searchPlacesNear(query: string, near: { lat: number; lon: number } | null, radiusM = 6000): Promise<MapPlace[]> {
  const r = await call<{ places: MapPlace[] }>({ action: 'places', query, near, radiusM });
  return r.places ?? [];
}

export async function route(origin: Point, destination: Point, mode: MapRoute['mode'] = 'WALK'): Promise<MapRoute | null> {
  const r = await call<{ route: MapRoute | null }>({ action: 'route', origin, destination, mode });
  return r.route;
}
