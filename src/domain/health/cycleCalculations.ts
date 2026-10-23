import {
  addDays,
  differenceInDays,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PhaseInfo {
  phase: CyclePhase;
  day: number;
  color: string;
  bgColor: string;
  label: string;
  description: string;
  tips: string[];
  daysUntilNext: number;
  nextPhase: CyclePhase;
}

export interface CyclePrediction {
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  currentPhase: PhaseInfo;
  cycleDayMap: Map<string, CyclePhase>; // date string -> phase
}

export const PHASE_CONFIG: Record<
  CyclePhase,
  {
    color: string;
    bgColor: string;
    label: string;
    description: string;
    tips: string[];
    gradientFrom: string;
    gradientTo: string;
    energyDesc: string;
  }
> = {
  menstrual: {
    color: '#FB7185', // Rose from women's theme
    bgColor: 'rgba(251, 113, 133, 0.1)',
    label: 'Menstrual',
    description: 'Rest & restore. Your body is working hard — be gentle with yourself.',
    tips: [
      'Prioritize warmth and comfort',
      'Gentle yoga or walking only',
      'Iron-rich foods: lentils, spinach',
      'Extra hydration & warm herbal teas',
      'Heat pad for cramp relief',
    ],
    gradientFrom: '#FFF1F2',
    gradientTo: '#FECDD3',
    energyDesc: 'Lower energy but high intuitive clarity. Focus on deep rest.',
  },
  follicular: {
    color: '#34D399', // Teal/green from harmony-bloom
    bgColor: 'rgba(52, 211, 153, 0.1)',
    label: 'Follicular',
    description: 'Rising energy! Estrogen is climbing — great time for new starts.',
    tips: [
      'Try a new workout or class',
      'Start a creative project',
      'Lean protein + fermented foods',
      'Social energy is high — connect!',
      'Best time for brainstorming',
    ],
    gradientFrom: '#F0FDFA',
    gradientTo: '#99F6E4',
    energyDesc: 'Energy is building. Your social battery and curiosity are high.',
  },
  ovulation: {
    color: '#FBBF24', // Amber
    bgColor: 'rgba(251, 191, 36, 0.1)',
    label: 'Ovulation',
    description: 'Peak energy & confidence! You are glowing at your best.',
    tips: [
      'High-intensity workouts shine here',
      'Great for presentations & big decisions',
      'Anti-inflammatory foods: berries, salmon',
      'Your most fertile window',
      'Communicate important things now',
    ],
    gradientFrom: '#FFFBEB',
    gradientTo: '#FDE68A',
    energyDesc: 'Peak vitality! You are radiant and highly communicative.',
  },
  luteal: {
    color: '#A78BFA', // Violet/purple
    bgColor: 'rgba(167, 139, 250, 0.1)',
    label: 'Luteal',
    description: 'Winding down. Progesterone rises — focus on comfort & self-care.',
    tips: [
      'Complex carbs ease PMS cravings',
      'Magnesium-rich foods: dark chocolate, nuts',
      'Gentle strength training',
      'Journaling helps process emotions',
      'Prioritize sleep (7–9h)',
    ],
    gradientFrom: '#F5F3FF',
    gradientTo: '#DDD6FE',
    energyDesc: 'Energy is turning inward. Great for focus and completion.',
  },
};

/**
 * Precisely calculates cycle phase and all predictions
 * for a given date based on last period start and cycle length.
 */
export function getCyclePredictions(
  lastPeriodDate: string | null | undefined,
  cycleLength: number = 28,
  periodLength: number = 5,
): CyclePrediction | null {
  if (!lastPeriodDate) return null;

  const lpd = startOfDay(parseISO(lastPeriodDate));
  const today = startOfDay(new Date());

  // How many days since last period start (can be negative if in the future)
  const daysSinceLPD = differenceInDays(today, lpd);

  // Current cycle day (1-based), normalized within cycle
  const rawCycleDay = daysSinceLPD % cycleLength;
  const cycleDay = rawCycleDay < 0 ? rawCycleDay + cycleLength : rawCycleDay;
  const cycleDayOneBased = cycleDay + 1;

  // Phase boundaries — medically correct: Luteal phase is approximately 14 days.
  // Ovulation peak is usually 14 days BEFORE the next period.
  const ovulationDay = cycleLength - 14;

  const getPhase = (day: number): CyclePhase => {
    // Menstrual phase starts at Day 1
    if (day <= periodLength) return 'menstrual';
    // Follicular phase is between Menstruation and Ovulation
    if (day < ovulationDay - 1) return 'follicular';
    // Ovulation is a 3-day window around the peak
    if (day <= ovulationDay + 1) return 'ovulation';
    // Luteal phase starts after ovulation until the next period
    return 'luteal';
  };

  const currentPhaseKey = getPhase(cycleDayOneBased);
  const cfg = PHASE_CONFIG[currentPhaseKey];

  // Precise next phase triggers
  const getNextPhaseInfo = (day: number): { nextPhase: CyclePhase; daysUntil: number } => {
    if (day <= periodLength) return { nextPhase: 'follicular', daysUntil: periodLength - day + 1 };
    if (day < ovulationDay - 1) return { nextPhase: 'ovulation', daysUntil: (ovulationDay - 1) - day + 1 };
    if (day <= ovulationDay + 1) return { nextPhase: 'luteal', daysUntil: (ovulationDay + 1) - day + 1 };
    return { nextPhase: 'menstrual', daysUntil: cycleLength - day + 1 };
  };

  const { nextPhase, daysUntil: daysUntilNext } = getNextPhaseInfo(cycleDayOneBased);

  // How many full cycles have passed
  const cyclesPassed = Math.floor(Math.max(0, daysSinceLPD) / cycleLength);
  const currentCycleStart = addDays(lpd, cyclesPassed * cycleLength);

  const nextPeriodDate = addDays(currentCycleStart, cycleLength);
  const peakOvulationDate = addDays(currentCycleStart, ovulationDay - 1);
  const fertileWindowStart = addDays(peakOvulationDate, -5);
  const fertileWindowEnd = addDays(peakOvulationDate, 0); // Fertility peaks AT ovulation

  // Build date->phase map: 1 year back + 1 year forward for calendar view
  const cycleDayMap = new Map<string, CyclePhase>();
  for (let offset = -365; offset <= 365; offset++) {
    const d = addDays(today, offset);
    const dSinceLPD = differenceInDays(d, lpd);
    const raw = dSinceLPD % cycleLength;
    const normalized = raw < 0 ? raw + cycleLength : raw;
    const dayNum = normalized + 1;
    cycleDayMap.set(format(d, 'yyyy-MM-dd'), getPhase(dayNum));
  }

  const phaseInfo: PhaseInfo = {
    phase: currentPhaseKey,
    day: cycleDayOneBased,
    color: cfg.color,
    bgColor: cfg.bgColor,
    label: cfg.label,
    description: cfg.description,
    tips: cfg.tips,
    daysUntilNext,
    nextPhase,
  };

  return {
    nextPeriodDate,
    ovulationDate: peakOvulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    currentPhase: phaseInfo,
    cycleDayMap,
  };
}

/**
 * Checks if a date is within the fertile window
 */
export function isFertileDay(date: Date, predictions: CyclePrediction): boolean {
  return isWithinInterval(date, {
    start: predictions.fertileWindowStart,
    end: predictions.fertileWindowEnd,
  });
}

/**
 * Returns the dominant symptom insight for the current phase
 */
export function getPhaseEnergyProfile(phase: CyclePhase): {
  physicalEnergy: number; // 0-100
  emotionalSensitivity: number; // 0-100
  libido: number; // 0-100
  cognitiveSharpness: number; // 0-100
  socialBattery: number; // 0-100
} {
  const profiles: Record<CyclePhase, ReturnType<typeof getPhaseEnergyProfile>> = {
    menstrual: {
      physicalEnergy: 25,
      emotionalSensitivity: 70,
      libido: 30,
      cognitiveSharpness: 45,
      socialBattery: 30,
    },
    follicular: {
      physicalEnergy: 75,
      emotionalSensitivity: 40,
      libido: 60,
      cognitiveSharpness: 80,
      socialBattery: 75,
    },
    ovulation: {
      physicalEnergy: 95,
      emotionalSensitivity: 50,
      libido: 90,
      cognitiveSharpness: 90,
      socialBattery: 95,
    },
    luteal: {
      physicalEnergy: 50,
      emotionalSensitivity: 85,
      libido: 45,
      cognitiveSharpness: 60,
      socialBattery: 45,
    },
  };
  return profiles[phase];
}

/**
 * Returns the predicted period dates for the next N cycles
 */
export function getUpcomingPeriods(
  lastPeriodDate: string,
  cycleLength: number = 28,
  count: number = 3,
): Date[] {
  const lpd = parseISO(lastPeriodDate);
  const today = new Date();
  const daysPassed = differenceInDays(today, lpd);
  const cyclesPassed = Math.floor(Math.max(0, daysPassed) / cycleLength);

  return Array.from({ length: count }, (_, i) =>
    addDays(lpd, (cyclesPassed + i + 1) * cycleLength),
  );
}

export interface AdvancedCycleMetrics {
  averageCycleLength: number;
  medianCycleLength: number;
  cycleLengthVariabilityDays: number;
  averagePeriodDuration: number;
  recordedCyclesCount: number;
  nextPeriodRangeStart: Date;
  nextPeriodRangeEnd: Date;
  isLate: boolean;
  daysLate: number;
  isConfirmedMissed: boolean;
  isIrregular: boolean;
  confidenceScore: 'high' | 'moderate' | 'tentative';
  explanationText: string;
}

export interface PregnancyProgress {
  gestationalWeeks: number;
  gestationalDays: number;
  trimester: 1 | 2 | 3;
  estimatedDueDate: Date;
  daysUntilDelivery: number;
  developmentMilestone: string;
  clinicalGuidance: string;
}

/**
 * Calculates pregnancy gestational timeline from LPD or confirmed conception date
 */
export function calculatePregnancyProgress(
  lastPeriodDate: string,
  customDueDate?: string
): PregnancyProgress {
  const lpd = startOfDay(parseISO(lastPeriodDate));
  const today = startOfDay(new Date());

  let edd: Date;
  if (customDueDate) {
    edd = startOfDay(parseISO(customDueDate));
  } else {
    // Naegele's rule: LPD + 280 days (40 weeks)
    edd = addDays(lpd, 280);
  }

  const daysPregnant = Math.max(0, differenceInDays(today, lpd));
  const gestationalWeeks = Math.floor(daysPregnant / 7);
  const gestationalDays = daysPregnant % 7;
  const daysUntilDelivery = Math.max(0, differenceInDays(edd, today));

  let trimester: 1 | 2 | 3 = 1;
  if (gestationalWeeks >= 28) trimester = 3;
  else if (gestationalWeeks >= 13) trimester = 2;

  let developmentMilestone = 'Embryonic foundations forming; neural tube development.';
  if (gestationalWeeks >= 37) {
    developmentMilestone = 'Full term readiness; lungs mature; awaiting labor onset.';
  } else if (gestationalWeeks >= 28) {
    developmentMilestone = 'Rapid fetal brain and body growth; active sleep cycles.';
  } else if (gestationalWeeks >= 20) {
    developmentMilestone = 'Mid-pregnancy anatomy milestone; flutter sensations felt.';
  } else if (gestationalWeeks >= 12) {
    developmentMilestone = 'First trimester close; vital organs formed and functioning.';
  }

  const clinicalGuidance =
    'Gentle daily hydration, prenatal vitamins with folate, and personalized medical check-ins. Non-diagnostic estimation.';

  return {
    gestationalWeeks,
    gestationalDays,
    trimester,
    estimatedDueDate: edd,
    daysUntilDelivery,
    developmentMilestone,
    clinicalGuidance,
  };
}

/**
 * Computes deep cycle analytics from recorded period logs and user context
 */
export function computeAdvancedCycleMetrics(
  lastPeriodDate: string | null | undefined,
  periodHistory: Array<{ startDate: string; endDate?: string }> = [],
  cycleLength: number = 28,
  periodLength: number = 5,
  context: string = 'regular'
): AdvancedCycleMetrics {
  const today = startOfDay(new Date());

  if (!lastPeriodDate) {
    return {
      averageCycleLength: cycleLength,
      medianCycleLength: cycleLength,
      cycleLengthVariabilityDays: 0,
      averagePeriodDuration: periodLength,
      recordedCyclesCount: 0,
      nextPeriodRangeStart: today,
      nextPeriodRangeEnd: addDays(today, 28),
      isLate: false,
      daysLate: 0,
      isConfirmedMissed: false,
      isIrregular: context === 'irregular' || context === 'pcos_pcod',
      confidenceScore: 'tentative',
      explanationText: 'Log your first period start date to calculate personalized forecasts.',
    };
  }

  const lpd = startOfDay(parseISO(lastPeriodDate));
  const isPcosOrIrregular = context === 'irregular' || context === 'pcos_pcod';

  // Calculate real intervals from history
  const intervals: number[] = [];
  if (periodHistory.length >= 2) {
    const sorted = [...periodHistory].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].startDate);
      const d2 = new Date(sorted[i + 1].startDate);
      const diff = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diff >= 18 && diff <= 100) {
        intervals.push(diff);
      }
    }
  }

  let avgCycle = cycleLength;
  let medCycle = cycleLength;
  let variability = isPcosOrIrregular ? 7 : 2;

  if (intervals.length > 0) {
    const sum = intervals.reduce((a, b) => a + b, 0);
    avgCycle = Math.round((sum / intervals.length) * 10) / 10;
    const sortedIntervals = [...intervals].sort((a, b) => a - b);
    const mid = Math.floor(sortedIntervals.length / 2);
    medCycle =
      sortedIntervals.length % 2 !== 0
        ? sortedIntervals[mid]
        : Math.round((sortedIntervals[mid - 1] + sortedIntervals[mid]) / 2);

    const min = Math.min(...intervals);
    const max = Math.max(...intervals);
    variability = Math.max(variability, Math.round((max - min) / 2));
  }

  // Next period projection and late calculation
  const daysSinceLPD = differenceInDays(today, lpd);
  const expectedPeriodStart = addDays(lpd, Math.round(medCycle));
  const daysLate = Math.max(0, differenceInDays(today, expectedPeriodStart));
  const isLate = daysLate > 0;
  const isConfirmedMissed = daysLate >= 14;

  const uncertaintyDays = isPcosOrIrregular ? Math.max(6, variability) : Math.max(2, variability);
  const nextPeriodRangeStart = addDays(expectedPeriodStart, -uncertaintyDays);
  const nextPeriodRangeEnd = addDays(expectedPeriodStart, uncertaintyDays);

  let confidenceScore: 'high' | 'moderate' | 'tentative' = 'tentative';
  if (intervals.length >= 3 && variability <= 3 && !isPcosOrIrregular) {
    confidenceScore = 'high';
  } else if (intervals.length >= 1) {
    confidenceScore = 'moderate';
  }

  let explanationText = `Forecast based on ${intervals.length > 0 ? `${intervals.length} logged intervals` : 'your initial baseline'}. Natural biological variance is ±${uncertaintyDays} days.`;
  if (isPcosOrIrregular) {
    explanationText = 'PCOS / Irregular context active: prediction window widened to accommodate natural hormonal variability.';
  } else if (isConfirmedMissed) {
    explanationText = `Period is ${daysLate} days past expected date. You can log an updated period start date or record a wellness observation.`;
  } else if (isLate) {
    explanationText = `Day ${daysSinceLPD + 1} of cycle (${daysLate} days past median estimate). Rest, hydrate, and log when flow starts.`;
  }

  return {
    averageCycleLength: avgCycle,
    medianCycleLength: medCycle,
    cycleLengthVariabilityDays: variability,
    averagePeriodDuration: periodLength,
    recordedCyclesCount: intervals.length + 1,
    nextPeriodRangeStart,
    nextPeriodRangeEnd,
    isLate,
    daysLate,
    isConfirmedMissed,
    isIrregular: isPcosOrIrregular,
    confidenceScore,
    explanationText,
  };
}

// Legacy compat for existing code
export function getCyclePhase(
  lastPeriodDate: string | null,
  cycleLength: number = 28,
): { phase: string; day: number } {
  const result = getCyclePredictions(lastPeriodDate, cycleLength);
  if (!result) return { phase: 'follicular', day: 10 };
  return {
    phase: result.currentPhase.phase,
    day: result.currentPhase.day,
  };
}

export function getPhaseDescription(phase: string): string {
  return PHASE_CONFIG[phase as CyclePhase]?.description ?? '';
}
