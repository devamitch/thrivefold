/**
 * Thrivefold Local-First User Profiler & Mindset Engine
 * Privacy-first on-device intelligence: analyzes daily rhythms, check-in trends,
 * habit velocity, and mental energy without transmitting sensitive data off-device.
 */

export interface CheckInRecord {
  date: string;
  timestamp: string; // ISO string
  mood: number; // 1 - 5
  energy: number; // 1 - 5
  stress: number; // 1 - 5
  notes?: string;
}

export interface ActivityRecord {
  type: 'workout' | 'quest' | 'routine' | 'letter';
  timestamp: string;
  durationMinutes?: number;
}

export type EnergyChronotype = 'morning_riser' | 'afternoon_sustainer' | 'evening_unwinder' | 'balanced';

export type MindsetState = 'thriving_flow' | 'restorative_recovery' | 'steady_momentum' | 'fresh_baseline';

export interface UserBehaviorProfile {
  chronotype: EnergyChronotype;
  chronotypeLabel: string;
  mindset: MindsetState;
  mindsetLabel: string;
  mindsetDescription: string;
  averageEnergy: number; // 1 - 5
  averageStress: number; // 1 - 5
  averageMood: number; // 1 - 5
  consistencyScore: number; // 0 - 100
  recommendedFocus: 'deep_stretch' | 'strength_push' | 'mindful_breathing' | 'eye_strain_relief';
  focusReason: string;
  primeActivityWindow: { startHour: number; endHour: number; label: string };
  actionableNudge: string;
}

/**
 * Determine the user's energy chronotype based on completion timestamps
 */
export function determineChronotype(timestamps: string[]): EnergyChronotype {
  if (timestamps.length === 0) return 'balanced';

  let morning = 0;
  let afternoon = 0;
  let evening = 0;

  for (const ts of timestamps) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) continue;
    const hour = ts.endsWith('Z') ? d.getUTCHours() : d.getHours();
    if (hour >= 5 && hour < 12) morning++;
    else if (hour >= 12 && hour < 18) afternoon++;
    else evening++;
  }

  const max = Math.max(morning, afternoon, evening);
  if (max === 0) return 'balanced';
  if (morning === max && morning > afternoon && morning > evening) return 'morning_riser';
  if (afternoon === max && afternoon > morning && afternoon > evening) return 'afternoon_sustainer';
  if (evening === max && evening > morning && evening > afternoon) return 'evening_unwinder';
  return 'balanced';
}

/**
 * Evaluate the user's current mindset state based on recent check-ins
 */
export function evaluateMindset(checkIns: CheckInRecord[]): {
  mindset: MindsetState;
  avgMood: number;
  avgEnergy: number;
  avgStress: number;
} {
  if (checkIns.length === 0) {
    return { mindset: 'fresh_baseline', avgMood: 3.5, avgEnergy: 3.5, avgStress: 2.0 };
  }

  // Take the most recent up to 7 check-ins
  const recent = checkIns.slice(-7);
  const totalMood = recent.reduce((sum, c) => sum + (c.mood || 3), 0);
  const totalEnergy = recent.reduce((sum, c) => sum + (c.energy || 3), 0);
  const totalStress = recent.reduce((sum, c) => sum + (c.stress || 2), 0);

  const avgMood = Math.round((totalMood / recent.length) * 10) / 10;
  const avgEnergy = Math.round((totalEnergy / recent.length) * 10) / 10;
  const avgStress = Math.round((totalStress / recent.length) * 10) / 10;

  if (avgStress >= 3.8 || avgEnergy <= 2.2) {
    return { mindset: 'restorative_recovery', avgMood, avgEnergy, avgStress };
  }
  if (avgEnergy >= 3.8 && avgStress <= 2.5 && avgMood >= 3.8) {
    return { mindset: 'thriving_flow', avgMood, avgEnergy, avgStress };
  }
  return { mindset: 'steady_momentum', avgMood, avgEnergy, avgStress };
}

/**
 * Compute the full behavior and mindset profile
 */
export function profileUserBehavior({
  checkIns = [],
  activityTimestamps = [],
  streakDays = 0,
}: {
  checkIns?: CheckInRecord[];
  activityTimestamps?: string[];
  streakDays?: number;
}): UserBehaviorProfile {
  const allTimestamps = [
    ...checkIns.map((c) => c.timestamp),
    ...activityTimestamps,
  ].filter(Boolean);

  const chronotype = determineChronotype(allTimestamps);
  const { mindset, avgMood, avgEnergy, avgStress } = evaluateMindset(checkIns);

  // Compute consistency score based on check-in frequency and streak
  const checkInCount = Math.min(checkIns.length, 14);
  const streakFactor = Math.min(streakDays * 5, 40);
  const consistencyScore = Math.min(100, Math.round(checkInCount * 4.2 + streakFactor));

  // Determine chronotype labels and prime hours
  let chronotypeLabel = 'Balanced Rhythm';
  let primeActivityWindow = { startHour: 9, endHour: 17, label: 'Flexible Daytime (9 AM – 5 PM)' };
  if (chronotype === 'morning_riser') {
    chronotypeLabel = 'Morning Energizer';
    primeActivityWindow = { startHour: 6, endHour: 10, label: 'Early Hours (6 AM – 10 AM)' };
  } else if (chronotype === 'afternoon_sustainer') {
    chronotypeLabel = 'Midday Sustainer';
    primeActivityWindow = { startHour: 12, endHour: 16, label: 'Afternoon Window (12 PM – 4 PM)' };
  } else if (chronotype === 'evening_unwinder') {
    chronotypeLabel = 'Evening Reflector';
    primeActivityWindow = { startHour: 17, endHour: 21, label: 'Evening Calm (5 PM – 9 PM)' };
  }

  // Determine mindset descriptions and recommended focus
  let mindsetLabel = 'Steady Momentum';
  let mindsetDescription = 'Balanced physical and mental energy. Consistent progress step by step.';
  let recommendedFocus: 'deep_stretch' | 'strength_push' | 'mindful_breathing' | 'eye_strain_relief' = 'strength_push';
  let focusReason = 'Your energy is steady and well-balanced. An ideal day for your core training.';
  let actionableNudge = 'Keep your momentum active with today’s scheduled quest.';

  if (mindset === 'thriving_flow') {
    mindsetLabel = 'High Flow State';
    mindsetDescription = 'High vitality and low stress detected. Your mind and body are primed for personal bests.';
    recommendedFocus = 'strength_push';
    focusReason = 'Excellent recovery and elevated energy allow you to challenge your milestones.';
    actionableNudge = 'Capitalize on peak clarity: engage in your main workout or learning quest early.';
  } else if (mindset === 'restorative_recovery') {
    mindsetLabel = 'Gentle Recovery';
    mindsetDescription = 'Slight fatigue or elevated stress indicated. Nurture your nervous system with calming movement.';
    recommendedFocus = avgStress > 3.5 ? 'mindful_breathing' : 'deep_stretch';
    focusReason = 'Nervous system resets and light restorative mobility rebuild vitality without fatigue.';
    actionableNudge = 'Prioritize somatic calm today: a 3-minute breathwork quest or gentle neck/eye stretch.';
  } else if (mindset === 'fresh_baseline') {
    mindsetLabel = 'Fresh Foundation';
    mindsetDescription = 'Setting up initial baseline patterns. Each day builds deeper clarity.';
    recommendedFocus = 'eye_strain_relief';
    focusReason = 'Gentle micro-habits anchor long-term wellness.';
    actionableNudge = 'Start with a simple 1-minute mindful pause or daily check-in.';
  }

  return {
    chronotype,
    chronotypeLabel,
    mindset,
    mindsetLabel,
    mindsetDescription,
    averageEnergy: avgEnergy,
    averageStress: avgStress,
    averageMood: avgMood,
    consistencyScore,
    recommendedFocus,
    focusReason,
    primeActivityWindow,
    actionableNudge,
  };
}
