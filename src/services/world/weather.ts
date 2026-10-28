/**
 * Weather from Open-Meteo (https://open-meteo.com/en/docs). No key; free for non-commercial use,
 * commercial use needs an Open-Meteo API plan. Attribution: "Weather data by Open-Meteo.com" (CC BY 4.0).
 * Only the person's chosen place (a city they searched for) is sent, never device location.
 */
import type { HourForecast } from '../../domain/world/outdoor';
import { getJson } from './http';

export interface Place {
  name: string;
  region: string | null;
  country: string | null;
  lat: number;
  lon: number;
}

export interface Forecast {
  fetchedAt: number;
  now: { tempC: number; feelsC: number; humidity: number; windKmh: number; code: number; time: string };
  hours: HourForecast[];
}

interface GeoResponse {
  results?: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }[];
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const r = await getJson<GeoResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
  );
  return (r.results ?? [])
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
    .map((p) => ({ name: p.name, region: p.admin1 ?? null, country: p.country ?? null, lat: p.latitude, lon: p.longitude }));
}

interface ForecastResponse {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: (number | null)[];
    uv_index: (number | null)[];
    weather_code: number[];
  };
}

const cache = new Map<string, Forecast>();
const FRESH_MS = 30 * 60_000;

/** Current conditions and the next 48 hours, cached for 30 minutes per place. */
export async function getForecast(place: Place): Promise<Forecast> {
  const key = `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < FRESH_MS) return hit;
  const r = await getJson<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code' +
      '&hourly=temperature_2m,apparent_temperature,precipitation_probability,uv_index,weather_code&forecast_days=2&timezone=auto',
  );
  const c = r.current;
  const h = r.hourly;
  if (!c || !h || !Array.isArray(h.time)) throw new Error('Unexpected forecast response');
  const hours: HourForecast[] = h.time.map((time, i) => ({
    time,
    tempC: h.temperature_2m[i],
    feelsC: h.apparent_temperature[i],
    rainChance: h.precipitation_probability[i] ?? 0,
    uv: h.uv_index[i] ?? 0,
    code: h.weather_code[i],
  }));
  const f: Forecast = {
    fetchedAt: Date.now(),
    now: {
      tempC: c.temperature_2m,
      feelsC: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windKmh: c.wind_speed_10m,
      code: c.weather_code,
      time: c.time,
    },
    hours,
  };
  cache.set(key, f);
  return f;
}
