import {
  calculateDeliveryHours,
  computeScheduledDeliveryTime,
  formatTimeRemaining,
} from '../../src/domain/letters/deliveryCalculator';

describe('Thrivefold Postal Transit Math Tests (Slowly-inspired distance delay)', () => {
  test('Local band (<= 200km) takes exactly 1 hour', () => {
    expect(calculateDeliveryHours(15)).toBe(1);
    expect(calculateDeliveryHours(200)).toBe(1);
  });

  test('Regional band (201km - 1000km) takes 3 hours', () => {
    expect(calculateDeliveryHours(201)).toBe(3);
    expect(calculateDeliveryHours(550)).toBe(3);
    expect(calculateDeliveryHours(1000)).toBe(3);
  });

  test('Continental band (1001km - 3500km) takes 8 hours', () => {
    expect(calculateDeliveryHours(1001)).toBe(8);
    expect(calculateDeliveryHours(2500)).toBe(8);
    expect(calculateDeliveryHours(3500)).toBe(8);
  });

  test('Cross-continental band (3501km - 8000km) takes 16 hours', () => {
    expect(calculateDeliveryHours(3501)).toBe(16);
    expect(calculateDeliveryHours(6000)).toBe(16);
    expect(calculateDeliveryHours(8000)).toBe(16);
  });

  test('Global band (> 8000km) takes 24 hours', () => {
    expect(calculateDeliveryHours(8001)).toBe(24);
    expect(calculateDeliveryHours(15000)).toBe(24);
  });

  test('computeScheduledDeliveryTime accurately schedules future delivery', () => {
    const now = new Date('2026-10-23T12:00:00Z');
    const scheduled = computeScheduledDeliveryTime(now, 500); // 3 hours
    expect(scheduled.toISOString()).toBe('2026-10-23T15:00:00.000Z');
  });

  test('formatTimeRemaining formats countdown or arrival properly', () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000); // ~2h 15m
    const formatted = formatTimeRemaining(future);
    expect(formatted).toMatch(/2h 1[45]m/);

    const past = new Date(Date.now() - 5000);
    expect(formatTimeRemaining(past)).toBe('Arrived');
  });
});
