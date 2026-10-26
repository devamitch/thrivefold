/**
 * Emergency Support & Crisis Safety Engine
 *
 * Implements deterministic detection of psychological distress, self-harm signals,
 * and emergency crisis indicators, paired with immediate real-world safety actions
 * (one-tap native dialers, crisis SMS) and on-device therapeutic grounding.
 *
 * Adheres strictly to Thrivefold Health & Safety Rules:
 * - Deterministic crisis detection (never relies on hallucinated LLM decisions)
 * - Immediate real emergency action routing
 * - Works 100% offline on-device
 */

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: 'immediate' | 'high' | 'moderate' | 'none';
  category?: 'suicide' | 'self_harm' | 'overdose' | 'abuse' | 'panic';
  recommendedAction: 'emergency_dial' | 'crisis_text' | 'grounding' | 'listen';
  deescalationScript: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  region: string;
  number: string;
  actionUrl: string;
  type: 'tel' | 'sms' | 'web';
  available: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'us_988',
    name: 'Suicide & Crisis Lifeline',
    region: 'US & Canada',
    number: '988',
    actionUrl: 'tel:988',
    type: 'tel',
    available: '24/7 Free & Confidential',
  },
  {
    id: 'us_text',
    name: 'Crisis Text Line',
    region: 'US, UK & Canada',
    number: 'Text HOME to 741741',
    actionUrl: 'sms:741741?body=HOME',
    type: 'sms',
    available: '24/7 Free Text Support',
  },
  {
    id: 'in_kiran',
    name: 'KIRAN Mental Health Helpline',
    region: 'India',
    number: '1800-599-0019',
    actionUrl: 'tel:18005990019',
    type: 'tel',
    available: '24/7 Toll-Free Support',
  },
  {
    id: 'uk_116123',
    name: 'Samaritans Helpline',
    region: 'United Kingdom',
    number: '116 123',
    actionUrl: 'tel:116123',
    type: 'tel',
    available: '24/7 Free Call',
  },
  {
    id: 'eu_112',
    name: 'European Emergency Number',
    region: 'European Union',
    number: '112',
    actionUrl: 'tel:112',
    type: 'tel',
    available: '24/7 Emergency Dispatch',
  },
];

// High-confidence crisis triggers (normalized lowercase patterns)
const IMMEDIATE_CRISIS_PATTERNS = [
  /kill(ing)?\s+(myself|me)/i,
  /want\s+to\s+die/i,
  /end\s+(my|it)\s+all/i,
  /end\s+my\s+life/i,
  /suicid(e|al)/i,
  /better\s+off\s+dead/i,
  /no\s+reason\s+to\s+live/i,
  /(take|took|swallow|swallowed)\s+all\s+(my\s+)?pills/i,
  /overdos(e|ed|ing)/i,
  /hang(ing)?\s+myself/i,
  /jump(ing)?\s+off/i,
  /shoot(ing)?\s+myself/i,
  /slit(ting)?\s+(my\s+)?wrist/i,
];

const SELF_HARM_PATTERNS = [
  /cut(ting)?\s+myself/i,
  /hurt(ing)?\s+myself/i,
  /burn(ed|ing)?\s+myself/i,
  /punish(ing)?\s+myself/i,
  /self[- ]harm/i,
  /bleed(ing)?\s+out/i,
];

const ACUTE_PANIC_PATTERNS = [
  /can('t|not)\s+breathe/i,
  /panic\s+attack/i,
  /heart\s+racing.*(dying|scared)/i,
  /losing\s+my\s+mind/i,
  /hyperventilat(e|ing)/i,
  /chest\s+tight.*can('t|not)\s+breathe/i,
];

/**
 * Deterministically evaluates text for crisis indicators and returns structured guidance.
 */
export function detectCrisisIntent(text: string): CrisisDetectionResult {
  const input = text.trim();
  if (!input) {
    return {
      isCrisis: false,
      severity: 'none',
      recommendedAction: 'listen',
      deescalationScript: '',
    };
  }

  // 1. Immediate Suicidal / Overdose Danger
  for (const pattern of IMMEDIATE_CRISIS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate',
        category: 'suicide',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "I hear how overwhelming and painful this is right now. You do not have to carry this alone. Please reach out to someone who can keep you safe right now—I've opened the direct emergency lifeline buttons on your screen.",
      };
    }
  }

  // 2. Self-Harm Signals
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'high',
        category: 'self_harm',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "I hear that you are hurting deeply right now. Let's take a pause together. Your life and your body deserve care and protection. Please connect with a caring counselor who is trained to help you through this exact moment.",
      };
    }
  }

  // 3. Acute Panic & Hyperventilation
  for (const pattern of ACUTE_PANIC_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: false,
        severity: 'moderate',
        category: 'panic',
        recommendedAction: 'grounding',
        deescalationScript:
          "You are safe right now in this moment. Your body is experiencing high adrenaline, but this wave will pass. Let's breathe together. Place one hand on your chest and follow the gentle rhythm.",
      };
    }
  }

  return {
    isCrisis: false,
    severity: 'none',
    recommendedAction: 'listen',
    deescalationScript: '',
  };
}

/**
 * Triggers native dialer or SMS client for real-world emergency action.
 */
export async function triggerEmergencyAction(contact: EmergencyContact): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Linking } = require('react-native');
    const supported = await Linking.canOpenURL(contact.actionUrl);
    if (supported) {
      await Linking.openURL(contact.actionUrl);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Local-First Therapeutic Grounding Steps (Zero Network / 100% On-Device).
 */
export const GROUNDING_EXERCISES = {
  box_breathing: {
    title: 'Box Breathing (Sama Vritti)',
    subtitle: 'Calm the autonomic nervous system in 4 rhythmic beats',
    cycles: 4,
    phases: [
      { name: 'Inhale', durationSec: 4, instruction: 'Breathe in slowly through your nose, expanding your belly.' },
      { name: 'Hold', durationSec: 4, instruction: 'Gently hold your breath. Keep your shoulders relaxed.' },
      { name: 'Exhale', durationSec: 4, instruction: 'Release slowly and completely through your mouth.' },
      { name: 'Rest', durationSec: 4, instruction: 'Pause in stillness before the next gentle breath.' },
    ],
  },
  sensory_54321: {
    title: '5-4-3-2-1 Sensory Grounding',
    subtitle: 'Anchor your mind into the physical room right now',
    steps: [
      { count: 5, prompt: 'Notice 5 things you can see around you right now (a color, a shadow, an object).' },
      { count: 4, prompt: 'Notice 4 things you can physically feel (feet on floor, texture of clothing, temperature).' },
      { count: 3, prompt: 'Notice 3 sounds you can hear (a distant hum, your own breath, outside noise).' },
      { count: 2, prompt: 'Notice 2 things you can smell (fresh air, fabric, soap, coffee).' },
      { count: 1, prompt: 'Notice 1 thing you can taste or swallow mindfully (a sip of water).' },
    ],
  },
};
