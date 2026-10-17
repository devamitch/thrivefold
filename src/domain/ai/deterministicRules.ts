import { ProductExperience } from '../../theme/tokens';
import { AiResult } from './types';

export interface HealthCheckInSignal {
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  physicalPainOrLimitation?: string;
  intensityPreference?: 'rest' | 'light' | 'regular';
  experience: ProductExperience;
}

export interface TaskRecommendation {
  taskId: string;
  title: string;
  category: 'movement' | 'breathing' | 'rest' | 'education' | 'reflection';
  durationMinutes: number;
  description: string;
  modifications: string[];
  cautionNotice?: string;
  aiExplanation: AiResult;
}

/**
 * Pure deterministic rule engine ensuring health tracking, task selection and
 * personalization function 100% offline without any API key or heavy model.
 */
export function evaluateDeterministicRoutine(signal: HealthCheckInSignal): TaskRecommendation {
  // 1. Safety & pain red flag: Signpost clinical evaluation, never diagnose
  if (
    signal.physicalPainOrLimitation &&
    signal.physicalPainOrLimitation.toLowerCase().includes('severe')
  ) {
    return {
      taskId: 'rec_rest_and_care',
      title: 'Gentle Rest & Professional Consultation Signpost',
      category: 'rest',
      durationMinutes: 0,
      description: 'Your body is signaling discomfort. Please rest and consider consulting a qualified healthcare professional.',
      modifications: ['Avoid all strenuous lifting or deep squats', 'Apply gentle warmth if soothing'],
      cautionNotice: 'Educational signpost only. Thrivefold does not provide clinical diagnosis or medical treatment.',
      aiExplanation: {
        text: 'Deterministic health safety rule applied: High discomfort reported. All exercise suspended in favor of rest and clinical signposting.',
        confidence: 1.0,
        source: 'local_deterministic',
        limitationsDisclosed: 'Educational guidance based on deterministic safety rules.',
      },
    };
  }

  // 2. High stress / low energy: Breathing or gentle mobility
  if (signal.energy <= 3 || signal.stress >= 8 || signal.intensityPreference === 'rest') {
    return {
      taskId: 'rec_parasympathetic_breath',
      title: '4-7-8 Deep Parasympathetic Breath Reset',
      category: 'breathing',
      durationMinutes: 5,
      description: 'A gentle guided breathing sequence designed to activate your rest-and-digest response.',
      modifications: ['Can be performed lying down with eyes closed', 'Pause whenever comfortable'],
      aiExplanation: {
        text: 'Routine adapted locally: Low energy and high stress signals detected. Preserving nervous system balance through gentle breathwork.',
        confidence: 0.95,
        source: 'local_deterministic',
        limitationsDisclosed: 'Non-diagnostic routine suggestion.',
      },
    };
  }

  // 3. Moderate energy / light preference: Mobility & decompression
  if (signal.energy <= 6 || signal.intensityPreference === 'light') {
    if (signal.experience === 'men_health') {
      return {
        taskId: 'rec_men_desk_mobility',
        title: 'Desk Worker Spine & Hip Decompression',
        category: 'movement',
        durationMinutes: 8,
        description: 'Targeted shoulder rolls, thoracic openers, and gentle hip flexor stretches.',
        modifications: ['Seated variations available', 'No floor space required'],
        aiExplanation: {
          text: 'Selected for Men’s Health: Equipment-free mobility routine to alleviate posture fatigue and work tension.',
          confidence: 0.92,
          source: 'local_deterministic',
          limitationsDisclosed: 'Adaptive exercise guidance.',
        },
      };
    }

    return {
      taskId: 'rec_gentle_pelvic_mobility',
      title: 'Gentle Cat-Cow & Pelvic Rocking',
      category: 'movement',
      durationMinutes: 10,
      description: 'Rhythmic, gentle floor stretches to improve pelvic circulation and relieve lower-back tension.',
      modifications: ['Use a soft yoga mat or bed', 'Keep movements slow and fluid'],
      aiExplanation: {
        text: 'Selected for Gentle Restoration: Low-impact floor flow to ease lower back and pelvic tension.',
        confidence: 0.92,
        source: 'local_deterministic',
        limitationsDisclosed: 'Self-care exercise suggestion.',
      },
    };
  }

  // 4. Regular energy: Progressive wellness session
  if (signal.experience === 'men_health') {
    return {
      taskId: 'rec_men_bodyweight_vitality',
      title: 'Core Stability & Functional Posture Flow',
      category: 'movement',
      durationMinutes: 15,
      description: 'Bodyweight tempo squats, glute bridges, and bird-dog core stabilization.',
      modifications: ['Elevate hands on a bench for easier angles', 'Rest 45s between sets'],
      aiExplanation: {
        text: 'Active energy detected: Building sustainable strength and posture resilience.',
        confidence: 0.9,
        source: 'local_deterministic',
        limitationsDisclosed: 'General wellness training only.',
      },
    };
  }

  return {
    taskId: 'rec_dynamic_harmony_flow',
    title: 'Mindful Whole-Body Energy Flow',
    category: 'movement',
    durationMinutes: 15,
    description: 'A balanced sequence combining standing stretches, deep lunges, and mindful balance holds.',
    modifications: ['Hold onto a chair for balance if needed'],
    aiExplanation: {
      text: 'Optimal energy state detected: Supporting circulation and daily vitality.',
      confidence: 0.9,
      source: 'local_deterministic',
      limitationsDisclosed: 'General wellness exercise program.',
    },
  };
}
