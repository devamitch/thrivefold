import { calculateBmi, validateVital, synthesizeLocalHealthInsights } from '../../src/domain/health/vitals';
import { identifyFoodsFromPhoto, analyzeMealMacrosWithAi } from '../../src/domain/nutrition/foodVision';
import { checkInRewardXp } from '../../src/domain/game/progression';

describe('Vitals, Height, Weight & BMI Engine', () => {
  test('calculateBmi accurately calculates BMI and screening categories', () => {
    // 70kg, 175cm -> BMI = 70 / (1.75^2) = 22.86 -> 22.9 (normal)
    const normal = calculateBmi(70, 175);
    expect(normal).not.toBeNull();
    expect(normal?.bmi).toBe(22.9);
    expect(normal?.category).toBe('normal');
    expect(normal?.healthyWeightRangeKg.min).toBeCloseTo(56.7, 1);
    expect(normal?.healthyWeightRangeKg.max).toBeCloseTo(76.3, 1);

    // 50kg, 175cm -> BMI = 50 / (1.75^2) = 16.3 (underweight)
    const under = calculateBmi(50, 175);
    expect(under?.category).toBe('underweight');

    // 85kg, 175cm -> BMI = 85 / (1.75^2) = 27.8 (overweight)
    const over = calculateBmi(85, 175);
    expect(over?.category).toBe('overweight');

    // 105kg, 175cm -> BMI = 105 / (1.75^2) = 34.3 (obesity)
    const obese = calculateBmi(105, 175);
    expect(obese?.category).toBe('obesity');

    // Invalid bounds
    expect(calculateBmi(0, 175)).toBeNull();
    expect(calculateBmi(70, 0)).toBeNull();
    expect(calculateBmi(500, 175)).toBeNull();
  });

  test('validateVital enforces safe physiological boundaries', () => {
    expect(validateVital('heart_rate', 72).valid).toBe(true);
    expect(validateVital('heart_rate', 15).valid).toBe(false);
    expect(validateVital('heart_rate', 250).valid).toBe(false);

    expect(validateVital('spo2', 98).valid).toBe(true);
    expect(validateVital('spo2', 65).valid).toBe(false);

    // Blood pressure: systolic & diastolic
    expect(validateVital('blood_pressure', 120, 80).valid).toBe(true);
    expect(validateVital('blood_pressure', 120, 130).valid).toBe(false); // diastolic >= systolic
    expect(validateVital('blood_pressure', 120, 30).valid).toBe(false); // diastolic out of range
  });

  test('synthesizeLocalHealthInsights produces grounded on-device insights', () => {
    const insights = synthesizeLocalHealthInsights({
      heightCm: 175,
      weightKg: 70,
      vitals: [
        {
          id: '1',
          date: '2026-10-27',
          time: '08:00',
          type: 'heart_rate',
          value: 68,
          unit: 'bpm',
          source: 'manual',
          createdAt: '2026-10-27T08:00:00Z',
        },
        {
          id: '2',
          date: '2026-10-27',
          time: '08:00',
          type: 'spo2',
          value: 99,
          unit: '%',
          source: 'manual',
          createdAt: '2026-10-27T08:00:00Z',
        },
      ],
      checkIns: [
        { date: '2026-10-27', energy: 8, mood: 8, stress: 3, sleepHours: 8 },
        { date: '2026-10-26', energy: 7, mood: 8, stress: 2, sleepHours: 7.5 },
      ],
      mealTotals: { kcal: 1850, protein: 95, carbs: 220, fat: 55 },
    });

    expect(insights.length).toBeGreaterThanOrEqual(4);
    expect(insights.some((i) => i.headline.includes('BMI: 22.9'))).toBe(true);
    expect(insights.some((i) => i.headline.includes('Heart Rate: 68 bpm'))).toBe(true);
    expect(insights.some((i) => i.headline.includes('Blood Oxygen: 99% SpO2'))).toBe(true);
    expect(insights.some((i) => i.headline.includes('Recovery Rhythm'))).toBe(true);
  });
});

describe('Photo Food & Macro Identification', () => {
  test('identifyFoodsFromPhoto detects foods and estimates macros', () => {
    const result = identifyFoodsFromPhoto('file:///data/meals/dal_roti_lunch.jpg');
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.some((c) => c.food.id === 'dal' || c.food.id === 'roti')).toBe(true);
    expect(result.estimatedKcal).toBeGreaterThan(0);
    expect(result.provider).toBe('local_vision');
  });

  test('identifyFoodsFromPhoto falls back to balanced plate when unclassified', () => {
    const fallback = identifyFoodsFromPhoto('file:///data/meals/17290000.jpg');
    expect(fallback.candidates.length).toBeGreaterThanOrEqual(3);
    expect(fallback.estimatedKcal).toBeGreaterThan(0);
  });

  test('analyzeMealMacrosWithAi computes valid macros with offline fallback', async () => {
    const result = await analyzeMealMacrosWithAi([
      { foodId: 'roti', servings: 2 },
      { foodId: 'dal', servings: 1 },
    ]);
    expect(result.kcal).toBeGreaterThanOrEqual(350);
    expect(result.protein).toBeGreaterThanOrEqual(15);
    expect(result.carbs).toBeGreaterThanOrEqual(50);
    expect(result.source).toBeDefined();
  });
});

describe('Incremental Daily Check-In Points', () => {
  test('checkInRewardXp computes base XP and incremental streak bonuses', () => {
    // Day 1: Base 20 XP
    const day1 = checkInRewardXp(1);
    expect(day1.xp).toBe(20);
    expect(day1.streakBonus).toBe(0);

    // Day 2: Base 20 + 10 streak bonus = 30 XP
    const day2 = checkInRewardXp(2);
    expect(day2.xp).toBe(30);
    expect(day2.streakBonus).toBe(10);

    // Day 3: Base 20 + 20 streak bonus + 25 milestone bonus = 65 XP
    const day3 = checkInRewardXp(3);
    expect(day3.xp).toBe(65);
    expect(day3.milestoneBonus).toBe(25);

    // Day 7: Base 20 + 60 streak bonus + 50 milestone bonus = 130 XP
    const day7 = checkInRewardXp(7);
    expect(day7.xp).toBe(130);
    expect(day7.milestoneBonus).toBe(50);

    // Day 14: Base 20 + 80 streak bonus + 100 milestone bonus = 200 XP
    const day14 = checkInRewardXp(14);
    expect(day14.xp).toBe(200);
    expect(day14.milestoneBonus).toBe(100);

    // Day 30: Base 20 + 80 streak bonus + 250 milestone bonus = 350 XP
    const day30 = checkInRewardXp(30);
    expect(day30.xp).toBe(350);
    expect(day30.milestoneBonus).toBe(250);
  });
});
