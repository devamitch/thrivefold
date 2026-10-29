import { haversineM, orderStops, summarise } from '../../src/domain/world/itinerary';

describe('outing itinerary', () => {
  it('measures distances', () => {
    expect(haversineM({ lat: 22.5, lon: 88.36 }, { lat: 22.51, lon: 88.36 })).toBeGreaterThan(1100);
    expect(haversineM({ lat: 22.5, lon: 88.36 }, { lat: 22.51, lon: 88.36 })).toBeLessThan(1120);
  });

  it('visits the nearest stop next', () => {
    const start = { lat: 22.5, lon: 88.3 };
    const stops = [
      { id: 'far', name: 'Far', lat: 22.53, lon: 88.3 },
      { id: 'near', name: 'Near', lat: 22.505, lon: 88.3 },
      { id: 'mid', name: 'Mid', lat: 22.515, lon: 88.3 },
    ];
    expect(orderStops(start, stops).map((s) => s.id)).toEqual(['near', 'mid', 'far']);
  });

  it('summarises walking time, distance and estimated steps', () => {
    const s = summarise([{ from: 'a', to: 'b', seconds: 600, meters: 800 }, { from: 'b', to: 'c', seconds: 900, meters: 1200 }], 20, 2);
    expect(s).toEqual({ walkMinutes: 25, totalMinutes: 65, km: 2, estSteps: 2600 });
  });
});
