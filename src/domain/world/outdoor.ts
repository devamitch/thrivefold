/**
 * Outdoor planning from a forecast and official alerts: when to walk in the next 12 hours, what
 * to wear or carry, and whether an official warning applies. Pure, so the advice is testable;
 * the data comes from services/world (Open-Meteo forecast, NDMA SACHET alerts).
 */

export interface HourForecast {
  time: string; // local ISO hour, e.g. 2026-10-29T17:00
  tempC: number;
  feelsC: number;
  rainChance: number; // %
  uv: number;
  code: number; // WMO weather code
}

export interface OfficialAlert {
  id: string;
  event: string;
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  sender: string;
  sentAt: string;
  expiresAt: string | null;
  instruction: string | null;
}

/** WMO weather codes to short text (https://open-meteo.com/en/docs, "WMO Weather interpretation codes"). */
export function describeCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Mixed';
}

const thunder = (c: number) => c >= 95;

/** 0 (avoid) – 100 (ideal) for a walk in this hour. */
export function walkScore(h: HourForecast): number {
  if (thunder(h.code)) return 0;
  let s = 100;
  s -= Math.max(0, h.rainChance - 20) * 1.1;
  if (h.feelsC > 32) s -= (h.feelsC - 32) * 8;
  if (h.feelsC < 8) s -= (8 - h.feelsC) * 6;
  if (h.uv >= 8) s -= 25;
  else if (h.uv >= 6) s -= 12;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export interface WalkPlan {
  best: (HourForecast & { score: number }) | null;
  /** Practical notes for going out now. */
  tips: string[];
  /** True when an active official alert at Moderate or higher applies to the chosen place. */
  warned: boolean;
}

/**
 * Best hour to walk in the next 12 waking hours (6:00–21:00), tips for now, and whether an
 * official alert applies. No alert does not mean a place is safe; the UI says so.
 */
export function planWalk(hours: HourForecast[], now: Date, alerts: OfficialAlert[]): WalkPlan {
  const nowMs = now.getTime();
  const active = alerts.filter((a) => !a.expiresAt || Date.parse(a.expiresAt) > nowMs);
  const warned = active.some((a) => a.severity === 'Extreme' || a.severity === 'Severe' || a.severity === 'Moderate');
  const upcoming = hours
    .filter((h) => {
      const t = Date.parse(h.time);
      const hr = Number(h.time.slice(11, 13));
      return t >= nowMs - 3_600_000 && t <= nowMs + 12 * 3_600_000 && hr >= 6 && hr <= 21;
    })
    .map((h) => ({ ...h, score: walkScore(h) }));
  const best = warned ? null : upcoming.reduce<(HourForecast & { score: number }) | null>((a, h) => (!a || h.score > a.score ? h : a), null);

  const current = upcoming[0] ?? hours[0];
  const tips: string[] = [];
  if (warned) tips.push('An official warning covers your area. Follow it and prefer an indoor workout.');
  if (current) {
    if (thunder(current.code)) tips.push('Thunderstorm: stay indoors; avoid open ground and trees.');
    if (current.rainChance >= 50) tips.push('Rain is likely: carry an umbrella or choose an indoor session.');
    if (current.feelsC >= 35) tips.push('Very hot: walk early or late, carry water, and rest in shade.');
    else if (current.feelsC >= 30) tips.push('Warm: take water and wear light clothing.');
    if (current.feelsC <= 10) tips.push('Cold: wear layers and warm up indoors first.');
    if (current.uv >= 6) tips.push('High UV: use sunscreen and a cap.');
  }
  if (best && best.score < 40) tips.push('No comfortable hour soon; an indoor routine may suit today better.');
  return { best: best && best.score >= 40 ? best : null, tips, warned };
}

type LatLon = [number, number];

/** Ray-casting point-in-polygon; polygon points are [lat, lon]. */
export function inPolygon([lat, lon]: LatLon, poly: LatLon[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi) inside = !inside;
  }
  return inside;
}

/** CAP polygon text "lat,lon lat,lon …" to points. */
export function parsePolygon(text: string): LatLon[] {
  return text
    .trim()
    .split(/\s+/)
    .map((p) => p.split(',').map(Number) as LatLon)
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
}
