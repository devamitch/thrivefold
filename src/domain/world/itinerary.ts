/**
 * Outing planner maths: order chosen stops into a short walking loop and summarise it.
 * Straight-line distance orders the stops (nearest next); real walking times come from routes.
 */

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

/** Great-circle distance in metres. */
export function haversineM(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Visit order starting from `start`: always the nearest unvisited stop next. */
export function orderStops(start: { lat: number; lon: number }, stops: Stop[]): Stop[] {
  const left = [...stops];
  const out: Stop[] = [];
  let here = start;
  while (left.length) {
    let best = 0;
    for (let i = 1; i < left.length; i++) if (haversineM(here, left[i]) < haversineM(here, left[best])) best = i;
    const next = left.splice(best, 1)[0];
    out.push(next);
    here = next;
  }
  return out;
}

export interface Leg {
  from: string;
  to: string;
  seconds: number;
  meters: number;
}

/** Totals for a planned walk; steps use ~1,300 steps per km (estimate, shown as such). */
export function summarise(legs: Leg[], minutesPerStop: number, stops: number) {
  const walkSeconds = legs.reduce((n, l) => n + l.seconds, 0);
  const meters = legs.reduce((n, l) => n + l.meters, 0);
  return {
    walkMinutes: Math.round(walkSeconds / 60),
    totalMinutes: Math.round(walkSeconds / 60) + minutesPerStop * stops,
    km: Math.round(meters / 100) / 10,
    estSteps: Math.round((meters / 1000) * 1300),
  };
}
