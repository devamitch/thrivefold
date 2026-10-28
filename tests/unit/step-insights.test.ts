import { hourLabel, stepInsights } from '../../src/domain/activity/stepInsights';

describe('step insights', () => {
  it('estimates walking minutes and distance from steps', () => {
    const r = stepInsights(4000);
    expect(r.walkingMinutes).toBe(40);
    expect(r.distanceKm).toBe(3);
  });

  it('finds the most active hour and counts active hours', () => {
    const hours = new Array(24).fill(0);
    hours[8] = 600;
    hours[18] = 1500;
    hours[19] = 200;
    const r = stepInsights(2300, hours);
    expect(r.peakHour).toBe(18);
    expect(r.peakSteps).toBe(1500);
    expect(r.activeHours).toBe(2);
  });

  it('handles no data honestly', () => {
    expect(stepInsights(0)).toMatchObject({ walkingMinutes: 0, peakHour: null, activeHours: 0 });
  });

  it('labels hours in 12-hour time', () => {
    expect(hourLabel(0)).toBe('12 am');
    expect(hourLabel(13)).toBe('1 pm');
  });
});
