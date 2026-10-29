/**
 * localCoachAI.ts — Complete local-first deterministic coaching intelligence for Thrivefold.
 *
 * Provides instant, on-device coaching answers for exercise form, posture, recovery,
 * soreness, warmup, cooldown, sleep, hydration, and daily wellbeing.
 *
 * Rules:
 *  - 100% offline, zero network requests, zero required external downloads.
 *  - Grounded in the user's real local data (steps, hydration, quests, profile).
 *  - Concise: 1 to 3 sentences maximum, warm and encouraging.
 *  - Never diagnoses, never suggests medicine doses, never claims to be a medical device.
 */

import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';
import { classifyLocalInput } from '../ai/localClassifier';

export interface LocalCoachContext {
  steps?: number;
  waterGlasses?: number;
  hydrationTarget?: number;
  userName?: string;
  weightKg?: number;
  heightCm?: number;
  allergies?: string[];
  foodRules?: string[];
  energy?: number;
  mood?: number;
  today?: string;
}

export interface LocalCoachReply {
  text: string;
  route?: string;
  topic:
    | 'form'
    | 'posture'
    | 'recovery'
    | 'workout'
    | 'sleep'
    | 'hydration'
    | 'nutrition'
    | 'stress'
    | 'summary'
    | 'general';
}

function getStore() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.();
  } catch {
    return undefined;
  }
}

export function buildLocalCoachContext(): LocalCoachContext {
  const s = getStore();
  const today = formatLocalDate(new Date());
  if (!s) {
    return { today, waterGlasses: 0, hydrationTarget: 8 };
  }
  const steps = s.deviceReadings ? stepsByDate(s.deviceReadings).get(today)?.value : undefined;
  const waterGlasses = s.hydration?.[today] ?? 0;
  const hydrationTarget = s.hydrationTargetGlasses ?? 8;
  const userName = s.koshProfile?.preferredName || undefined;

  return {
    steps: steps ? Math.round(steps) : undefined,
    waterGlasses,
    hydrationTarget,
    userName,
    weightKg: s.weightKg ?? undefined,
    heightCm: s.heightCm ?? undefined,
    allergies: s.koshProfile?.allergies,
    foodRules: s.koshProfile?.foodRestrictions,
    today,
  };
}

export function resolveLocalCoachReply(
  prompt: string,
  ctx?: LocalCoachContext,
): LocalCoachReply {
  const text = prompt.toLowerCase().trim();
  const context = ctx ?? buildLocalCoachContext();
  const greeting = context.userName ? `${context.userName}, ` : '';

  // 1. Specific Exercise Form & Technique
  if (/\b(?:squat|squats)\b/.test(text)) {
    return {
      text: `${greeting}keep your chest tall, push hips back and down like sitting into a low chair, and drive up firmly through your heels. Ensure your knees stay aligned over your toes throughout.`,
      route: '/(app)/health/pose-check',
      topic: 'form',
    };
  }

  if (/\b(?:push[- ]?up|pushups?)\b/.test(text)) {
    return {
      text: `${greeting}keep your core braced in a straight plank line from shoulders to heels. Lower your chest until elbows reach approximately 45 degrees, then press up with full control.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  if (/\b(?:plank|planks)\b/.test(text)) {
    return {
      text: `${greeting}stack elbows directly under your shoulders, engage your glutes and deep abs, and hold your neck neutral. Avoid letting your hips sag or pike high.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  if (/\b(?:lunge|lunges)\b/.test(text)) {
    return {
      text: `${greeting}take a deliberate step forward, keeping your torso upright, and lower until both knees form roughly 90-degree angles. Push back through your front heel to return.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  // 2. Posture & Desk Alignment
  if (/\b(?:posture|slouch|neck|back ache|sitting)\b/.test(text)) {
    return {
      text: `${greeting}roll your shoulders gently back and down, imagine a gentle string lengthening the crown of your head, and keep feet planted flat. Standing or gently stretching every hour helps spine health.`,
      route: '/(app)/beta-lab/face-exercises',
      topic: 'posture',
    };
  }

  // 3. Warm-Up & Mobility
  if (/\b(?:warm[- ]?up|stretch before|mobility|pre[- ]workout)\b/.test(text)) {
    return {
      text: `${greeting}spend 4 to 5 minutes on dynamic movement: leg swings, hip openers, arm circles, and gentle bodyweight squats. Dynamic warmups prepare joint fluid and muscles safely.`,
      route: '/(app)/train',
      topic: 'workout',
    };
  }

  // 4. Cool-Down & Post-Workout Stretches
  if (/\b(?:cool[- ]?down|stretch after|post[- ]workout stretch)\b/.test(text)) {
    return {
      text: `${greeting}take 3 to 5 minutes of easy walking to bring your heart rate down, followed by gentle static stretches for your hamstrings, hips, and shoulders. Breathe deep and slow.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'workout',
    };
  }

  // 5. Soreness, Recovery & Fatigue
  if (/\b(?:sore|soreness|doms|aching muscles|tired muscles)\b/.test(text)) {
    return {
      text: `${greeting}delayed muscle soreness is normal after physical effort. Prioritize extra water, gentle walking, light stretching, and a solid night of sleep to help muscle repair.`,
      route: '/(app)/health/sleep',
      topic: 'recovery',
    };
  }

  // 6. Pain & Limitation Adaptation (Non-diagnostic safety)
  if (/\b(?:knee pain|joint pain|sharp pain|hurt|injury|injured)\b/.test(text)) {
    return {
      text: `${greeting}please pause any movement that causes pain or joint discomfort. Focus on pain-free gentle mobility, and consult a qualified healthcare provider for persistent or sharp symptoms.`,
      route: '/(app)/safety/urgent-support',
      topic: 'recovery',
    };
  }

  // 7. Today's Fitness / Workout Recommendation
  if (/\b(?:recommend|suggest|what workout|what exercise|workout today|training today)\b/.test(text)) {
    if (context.steps && context.steps < 4000) {
      return {
        text: `${greeting}you're at ${context.steps.toLocaleString()} steps today. A brisk 20-minute walk or a light bodyweight routine would be a great way to energize your body today.`,
        route: '/(app)/train',
        topic: 'workout',
      };
    }
    return {
      text: `${greeting}today is great for balanced movement. Check out our guided workouts in the Train tab for a curated session tailored to your current fitness rhythm.`,
      route: '/(app)/train',
      topic: 'workout',
    };
  }

  // 8. Sleep & Rest Hygiene
  if (/\b(?:sleep|insomnia|rest better|can'?t sleep|bedtime|tired in morning)\b/.test(text)) {
    return {
      text: `${greeting}aim for consistent sleep and wake times, dim screen lights 45 minutes before bed, and keep your bedroom cool. Slow, diaphragmatic breathing also helps quiet a busy mind.`,
      route: '/(app)/health/sleep',
      topic: 'sleep',
    };
  }

  // 9. Hydration
  if (/\b(?:water|hydration|how much water|drink water|thirsty)\b/.test(text)) {
    const status =
      context.waterGlasses && context.waterGlasses > 0
        ? `You have logged ${context.waterGlasses} of ${context.hydrationTarget ?? 8} glasses today.`
        : `Aim for around ${context.hydrationTarget ?? 8} glasses across your day.`;
    return {
      text: `${greeting}hydration supports muscle performance and energy levels. ${status} Keep a water bottle nearby and take steady sips.`,
      route: '/(app)/health/meal-log',
      topic: 'hydration',
    };
  }

  // 10. Nutrition & Fuel
  if (/\b(?:eat|food|nutrition|snack|protein|fuel|pre[- ]workout food)\b/.test(text)) {
    const allergyNote = context.allergies?.length
      ? ` keeping your ${context.allergies.join(', ')} preferences in mind.`
      : '.';
    return {
      text: `${greeting}aim for balanced nourishment with quality proteins, complex carbohydrates, and wholesome fats${allergyNote} A light snack 45 minutes before training keeps energy steady.`,
      route: '/(app)/health/meal-log',
      topic: 'nutrition',
    };
  }

  // 11. Stress, Calm & Breathing
  if (/\b(?:stress|anxious|anxiety|calm down|breathe|overwhelm|meditat)\b/.test(text)) {
    return {
      text: `${greeting}take a slow, deep breath in through your nose for 4 counts, hold for 4, and exhale smoothly for 6. Let me open the Breathing Coach so we can practice together.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'stress',
    };
  }

  // 12. Day Overview / Health Review
  if (/\b(?:how am i doing|summary|progress today|my stats|review my day)\b/.test(text)) {
    const stepText = context.steps ? `${context.steps.toLocaleString()} steps` : 'steps pending';
    const waterText = `${context.waterGlasses ?? 0} glasses of water`;
    return {
      text: `${greeting}here is your day so far: ${stepText} and ${waterText} logged. Keep listening to your body and celebrating every healthy step.`,
      route: '/(app)/(tabs)/progress',
      topic: 'summary',
    };
  }

  // 13. Signal classification fallback via classifier
  const classification = classifyLocalInput({ text: prompt });
  if (classification.signals.includes('fatigue')) {
    return {
      text: `${greeting}I hear that you're feeling tired. Honour your energy with light walking, plenty of water, and an early bedtime tonight.`,
      route: '/(app)/health/sleep',
      topic: 'recovery',
    };
  }
  if (classification.signals.includes('stress')) {
    return {
      text: `${greeting}it sounds like you are carrying some stress. Taking a 5-minute break with our breathing exercises can help reset your nervous system.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'stress',
    };
  }

  // 14. Default warm, grounded coach reply
  return {
    text: `${greeting}as your wellbeing coach, I'm here to support your movement, sleep, hydration, and daily habits. Ask me for exercise form tips, today's workout, or daily stats anytime.`,
    topic: 'general',
  };
}
