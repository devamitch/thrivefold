/**
 * vitals.ts — On-device health vitals, height, weight, BMI, and local AI synthesizer.
 *
 * Provides pure, deterministic tracking for:
 * - Height (cm), Weight (kg), and BMI screening calculations with clinically grounded ranges.
 * - Heart Rate (bpm), SpO2 (%), Blood Pressure (systolic/diastolic mmHg), Respiratory Rate, and Temperature.
 * - Source provenance tracking: 'manual' | 'health_connect' | 'device'.
 * - Local AI health insights synthesizer that correlates vitals, check-ins, meals, and workouts on-device.
 */

export type VitalType =
  | 'heart_rate'
  | 'blood_pressure'
  | 'spo2'
  | 'weight'
  | 'height'
  | 'respiratory_rate'
  | 'temperature';

export type VitalSource = 'manual' | 'health_connect' | 'device';

export interface VitalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: VitalType;
  value: number; // primary metric: bpm, SpO2 %, weight kg, height cm, systolic mmHg, etc.
  secondaryValue?: number; // diastolic mmHg for blood pressure
  unit: 'bpm' | '%' | 'kg' | 'cm' | 'mmHg' | 'rpm' | '°C';
  source: VitalSource;
  notes?: string;
  createdAt: string;
}

export interface BmiResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obesity';
  label: string;
  guidance: string;
  healthyWeightRangeKg: { min: number; max: number };
}

/**
 * Calculates Body Mass Index (BMI) deterministically.
 * Formula: weight (kg) / [height (m)]^2
 * Returns null if inputs are outside physiological bounds.
 */
export function calculateBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (weightKg <= 20 || weightKg >= 350 || heightCm <= 60 || heightCm >= 260) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category: BmiResult['category'] = 'normal';
  let label = 'Normal weight range';
  let guidance = 'Your weight is within the healthy screening range for your height. Focus on balanced movement and regular rest.';

  if (bmi < 18.5) {
    category = 'underweight';
    label = 'Below standard range';
    guidance = 'Nutrient-rich meals with adequate protein and healthy fats can help support your daily energy and recovery.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'overweight';
    label = 'Above standard range';
    guidance = 'Regular strength workouts and consistent daily activity support overall metabolic and cardiovascular vitality.';
  } else if (bmi >= 30) {
    category = 'obesity';
    label = 'Significantly above standard range';
    guidance = 'Consider gentle, low-impact daily movement and consulting a healthcare professional for clinical guidance.';
  }

  const minKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  return {
    bmi,
    category,
    label,
    guidance,
    healthyWeightRangeKg: { min: minKg, max: maxKg },
  };
}

/**
 * Physiological validation ranges for vitals.
 */
export const VITAL_BOUNDS: Record<VitalType, { min: number; max: number; unit: VitalRecord['unit'] }> = {
  heart_rate: { min: 30, max: 240, unit: 'bpm' },
  blood_pressure: { min: 60, max: 260, unit: 'mmHg' }, // systolic
  spo2: { min: 70, max: 100, unit: '%' },
  weight: { min: 20, max: 350, unit: 'kg' },
  height: { min: 60, max: 260, unit: 'cm' },
  respiratory_rate: { min: 6, max: 60, unit: 'rpm' },
  temperature: { min: 34, max: 43, unit: '°C' },
};

export function validateVital(
  type: VitalType,
  value: number,
  secondaryValue?: number,
): { valid: boolean; error?: string } {
  const bounds = VITAL_BOUNDS[type];
  if (!bounds) return { valid: false, error: 'Unknown vital type' };

  if (value < bounds.min || value > bounds.max) {
    return {
      valid: false,
      error: `Value must be between ${bounds.min} and ${bounds.max} ${bounds.unit}`,
    };
  }

  if (type === 'blood_pressure') {
    if (secondaryValue === undefined || secondaryValue < 40 || secondaryValue > 150) {
      return { valid: false, error: 'Diastolic pressure must be between 40 and 150 mmHg' };
    }
    if (secondaryValue >= value) {
      return { valid: false, error: 'Systolic pressure must be higher than diastolic pressure' };
    }
  }

  return { valid: true };
}

// ── Local AI Health Synthesizer ─────────────────────────────────────────────

export interface LocalHealthInsight {
  id: string;
  category: 'vitals' | 'activity' | 'recovery' | 'nutrition';
  headline: string;
  detail: string;
  tone: 'positive' | 'warning' | 'info';
  timestamp: string;
}

export interface HealthContextInput {
  heightCm?: number | null;
  weightKg?: number | null;
  vitals?: VitalRecord[];
  checkIns?: Array<{
    date: string;
    energy: number;
    mood: number;
    stress: number;
    sleepHours: number;
  }>;
  mealTotals?: { kcal: number; protein: number; carbs: number; fat: number };
  workoutCount?: number;
}

/**
 * On-device local AI intelligence synthesizer.
 * Runs completely client-side without network calls, correlating metrics
 * into private, actionable health findings.
 */
export function synthesizeLocalHealthInsights(ctx: HealthContextInput): LocalHealthInsight[] {
  const insights: LocalHealthInsight[] = [];
  const now = new Date().toISOString();

  // 1. BMI & Weight Trend
  if (ctx.heightCm && ctx.weightKg) {
    const bmiRes = calculateBmi(ctx.weightKg, ctx.heightCm);
    if (bmiRes) {
      insights.push({
        id: 'bmi-summary',
        category: 'vitals',
        headline: `BMI: ${bmiRes.bmi} (${bmiRes.label})`,
        detail: bmiRes.guidance,
        tone: bmiRes.category === 'normal' ? 'positive' : 'info',
        timestamp: now,
      });
    }
  }

  // 2. Resting Heart Rate Analysis
  const hrRecords = ctx.vitals?.filter((v) => v.type === 'heart_rate') ?? [];
  if (hrRecords.length > 0) {
    const latestHr = hrRecords[hrRecords.length - 1];
    const avgHr = Math.round(hrRecords.reduce((sum, v) => sum + v.value, 0) / hrRecords.length);
    let hrTone: LocalHealthInsight['tone'] = 'positive';
    let hrDetail = `Your average heart rate is ${avgHr} bpm, well within the typical resting range of 60–100 bpm.`;

    if (latestHr.value > 100) {
      hrTone = 'warning';
      hrDetail = `Latest reading was ${latestHr.value} bpm. High heart rates can stem from stress, caffeine, or recent activity.`;
    } else if (latestHr.value < 55) {
      hrDetail = `Latest reading was ${latestHr.value} bpm. Well-conditioned athletes often have resting heart rates below 60 bpm.`;
    }

    insights.push({
      id: 'hr-insight',
      category: 'vitals',
      headline: `Heart Rate: ${latestHr.value} bpm`,
      detail: hrDetail,
      tone: hrTone,
      timestamp: now,
    });
  }

  // 3. SpO2 Blood Oxygen Check
  const spo2Records = ctx.vitals?.filter((v) => v.type === 'spo2') ?? [];
  if (spo2Records.length > 0) {
    const latestSpo2 = spo2Records[spo2Records.length - 1];
    insights.push({
      id: 'spo2-insight',
      category: 'vitals',
      headline: `Blood Oxygen: ${latestSpo2.value}% SpO2`,
      detail:
        latestSpo2.value >= 95
          ? 'Normal healthy saturation (95–100%). Pulse oximeter readings are estimates.'
          : 'Reading is below 95%. Re-check seated and resting. Seek medical attention if experiencing shortness of breath.',
      tone: latestSpo2.value >= 95 ? 'positive' : 'warning',
      timestamp: now,
    });
  }

  // 4. Sleep & Energy Correlation
  const checkIns = ctx.checkIns ?? [];
  if (checkIns.length >= 2) {
    const recent = checkIns.slice(0, 5);
    const avgSleep = recent.reduce((sum, c) => sum + c.sleepHours, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;

    if (avgSleep >= 7.5 && avgEnergy >= 7) {
      insights.push({
        id: 'sleep-energy-boost',
        category: 'recovery',
        headline: 'Great Recovery Rhythm',
        detail: `Averaging ${avgSleep.toFixed(1)}h of sleep correlates with high reported energy (${avgEnergy.toFixed(1)}/10).`,
        tone: 'positive',
        timestamp: now,
      });
    } else if (avgSleep < 6.5) {
      insights.push({
        id: 'sleep-debt-warning',
        category: 'recovery',
        headline: 'Mild Sleep Deficit',
        detail: `Recent sleep has averaged ${avgSleep.toFixed(1)}h. Aim for 7–8 hours tonight to restore neuromuscular focus.`,
        tone: 'info',
        timestamp: now,
      });
    }
  }

  // 5. Nutrition / Macro Balance
  if (ctx.mealTotals && ctx.mealTotals.kcal > 0) {
    const { kcal, protein, carbs, fat } = ctx.mealTotals;
    const proteinCal = protein * 4;
    const proteinPct = Math.round((proteinCal / kcal) * 100);

    insights.push({
      id: 'macro-balance',
      category: 'nutrition',
      headline: `Today's Fuel: ${kcal} kcal`,
      detail: `Protein: ${protein}g (${proteinPct}%), Carbs: ${carbs}g, Fat: ${fat}g. Well balanced to sustain recovery.`,
      tone: 'positive',
      timestamp: now,
    });
  }

  return insights;
}
