/**
 * Emergency Support & Situational Urgency Assessment Engine
 *
 * Implements a layered, deterministic safety engine for Anvay:
 * 1. Deterministic local safety detection (100% offline, zero network requirement)
 * 2. Contextual understanding:
 *    - Personal vs. Third-Party situations ("I want to..." vs "My friend is...")
 *    - Present vs. Past events ("right now" vs "3 years ago")
 *    - Explicit Negations ("I am not suicidal", "I don't want to die")
 *    - Medical Urgency distinction (Chest pain / stroke / anaphylaxis vs panic)
 * 3. Accurate categorization (Suicide, Overdose, Medical, Abuse, Self-Harm, Panic)
 * 4. Country-aware emergency routing via emergencyDirectory
 * 5. Grounding and compassionate de-escalation
 *
 * Adheres strictly to Thrivefold Master Ecosystem Agent Contract & Laws:
 * - Deterministic safety (never delegates emergency decisions to LLM alone)
 * - Safe native dialer / SMS actions (never silently places calls or shares location)
 * - 100% on-device offline capability
 */

import { Linking } from 'react-native';
import {
  getEmergencyContactsForCountry,
  getPrimaryEmergencyContact,
  getPrimaryMentalHealthContact,
  type EmergencyServiceContact,
} from './emergencyDirectory';

export type CrisisSeverity =
  | 'immediate_emergency'
  | 'urgent_care'
  | 'elevated_concern'
  | 'emotional_support'
  | 'none';

export type CrisisCategory =
  | 'suicidal_intent'
  | 'overdose_poisoning'
  | 'medical_emergency'
  | 'abuse_violence'
  | 'self_harm'
  | 'panic_distress'
  | 'general_emotional'
  | 'third_party_concern'
  | 'none';

export type RecommendedAction =
  | 'emergency_dial'
  | 'medical_care'
  | 'crisis_text'
  | 'trusted_contact'
  | 'grounding'
  | 'listen';

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: CrisisSeverity;
  category: CrisisCategory;
  recommendedAction: RecommendedAction;
  deescalationScript: string;
  isThirdParty: boolean;
  isPastEvent: boolean;
  isNegated: boolean;
  primaryActionLabel?: string;
  suggestedResource?: string;
}

// Backward-compatible type export
export type EmergencyContact = EmergencyServiceContact;

// Backward-compatible default list (India + US/UK/EU verified)
export const EMERGENCY_CONTACTS: EmergencyContact[] = getEmergencyContactsForCountry('IN');

/* ── Context Analysis RegExes ──────────────────────────────────────────────────────────── */

const NEGATION_PATTERNS = [
  /\b(?:not|never|don't|dont|do not|no longer|stop|stopped|refuse to|haven't|havent)\s+(?:want to die|thinking of suicide|suicidal|going to kill myself|hurting myself|cut myself)\b/i,
  /\b(?:i am not|im not|i'm not)\s+(?:suicidal|in danger|gonna die|trying to hurt myself)\b/i,
  /\bnot\s+an\s+emergency\b/i,
];

const PAST_EVENT_PATTERNS = [
  /\b(?:years? ago|months? ago|weeks? ago|when i was (?:a kid|younger|in high school|in college))\b/i,
  /\b(?:in the past|back in \d{4}|used to (?:cut|harm|overdose|try to die))\b/i,
  /\b(?:recovered from|survived (?:an attempt|a suicide attempt|an overdose))\b/i,
];

const THIRD_PARTY_PATTERNS = [
  /\b(?:my\s+(?:friend|brother|sister|mother|father|mom|dad|cousin|roommate|partner|wife|husband|coworker|daughter|son))\b/i,
  /\b(?:someone\s+(?:i know|else)|he is|she is|they are)\s+(?:saying|talking about|threatening to|planning to)\b/i,
];

/* ── Medical Urgency (Requires Immediate Medical ER / Ambulance, NOT just breathing) ────── */

const MEDICAL_EMERGENCY_PATTERNS = [
  /\b(?:crushing|severe|radiating)\s+(?:chest pain|pressure in (?:my )?chest)\b/i,
  /\bchest pain\s+(?:and|with)\s+(?:shortness of breath|left arm pain|jaw pain|sweating)\b/i,
  /\b(?:cannot|cant|can't)\s+breathe\s+(?:at all|turning blue|lips are blue)\b/i,
  /\b(?:face drooping|arm weakness|slurred speech|stroke signs?)\b/i,
  /\b(?:anaphylaxis|throat (?:is )?(?:closing|swelling|swollen shut)|severe allergic reaction)\b/i,
  /\b(?:vomiting blood|coughing up blood|bleeding uncontrollably|gushing blood)\b/i,
  /\b(?:unconscious|passed out and won't wake|unresponsive)\b/i,
];

/* ── Overdose & Toxic Ingestion ────────────────────────────────────────────────────────── */

const OVERDOSE_PATTERNS = [
  /\b(?:swallowed|took|ingested|drank)\s+(?:all\s+(?:the|my)|a bottle of|handful of|too many)\s+(?:pills|tablets|medication|aspirin|tylenol|paracetamol|sleeping pills)\b/i,
  /\b(?:drank|ingested|swallowed)\s+(?:poison|bleach|cleaner|chemical|detergent|pesticide)\b/i,
  /\b(?:i overdosed|just overdosed|overdosing right now)\b/i,
];

/* ── Immediate Suicidal Intent ─────────────────────────────────────────────────────────── */

const SUICIDAL_INTENT_PATTERNS = [
  /\b(?:kill(?:ing)?\s+(?:myself|me)|want\s+to\s+die|end\s+my\s+life|ending\s+my\s+life|end\s+it\s+all)\b/i,
  /\b(?:suicid(?:e|al)|better\s+off\s+dead|no\s+reason\s+to\s+live)\b/i,
  /\b(?:hang(?:ing)?\s+myself|jump(?:ing)?\s+off|shoot(?:ing)?\s+myself)\b/i,
  /\b(?:goodbye forever|saying my final goodbyes?|writing (?:a|my) suicide note)\b/i,
  /\bready to end it\b/i,
];

/* ── Acute Self-Harm Signals ───────────────────────────────────────────────────────────── */

const SELF_HARM_PATTERNS = [
  /\b(?:cut(?:ting)?\s+myself|bleed(?:ing)?\s+out|burn(?:ed|ing)?\s+myself)\b/i,
  /\b(?:self[- ]harm(?:ing)?|hurt(?:ing)?\s+myself|punish(?:ing)?\s+myself physically)\b/i,
  /\bslit(?:ting)?\s+(?:my\s+)?wrist\b/i,
];

/* ── Abuse, Physical Threat & Imminent Safety ───────────────────────────────────────────── */

const ABUSE_VIOLENCE_PATTERNS = [
  /\b(?:he is hitting me|she is hitting me|someone is attacking me|being assaulted)\b/i,
  /\b(?:he threatened to kill me|threatened with a (?:knife|gun|weapon))\b/i,
  /\b(?:locked in (?:a |the )room|cannot leave safely|afraid for my life)\b/i,
  /\b(?:domestic violence|abusive partner|stalking me|someone breaking in)\b/i,
];

/* ── Acute Panic & Hyperventilation ────────────────────────────────────────────────────── */

const ACUTE_PANIC_PATTERNS = [
  /\b(?:panic\s+attack|hyperventilat(?:e|ing)|having an anxiety attack)\b/i,
  /\b(?:heart\s+racing|heart is pounding)\s+(?:and|im scared|so frightened)\b/i,
  /\b(?:feel like i'm dying|feel detached from reality|derealization|losing my mind)\b/i,
  /\b(?:tightness in chest|shaking uncontrollably)\s+from\s+(?:stress|anxiety|fear)\b/i,
];

/* ── General Emotional Distress ────────────────────────────────────────────────────────── */

const EMOTIONAL_DISTRESS_PATTERNS = [
  /\b(?:overwhelmed|crying all day|so lonely|deeply depressed|hopeless|burned out|empty inside|heartbroken|nobody cares)\b/i,
  /\b(?:can't stop crying|can't do this anymore|feeling lost|anxious all the time)\b/i,
];

/**
 * Deterministically evaluates text for situational urgency, medical safety, and crisis indicators.
 *
 * Uses multi-layered pattern matching with negation, tense, and third-party filtering
 * before assigning any safety category.
 */
export function detectCrisisIntent(text: string, countryCode?: string): CrisisDetectionResult {
  const input = text.trim();
  if (!input) {
    return {
      isCrisis: false,
      severity: 'none',
      category: 'none',
      recommendedAction: 'listen',
      deescalationScript: '',
      isThirdParty: false,
      isPastEvent: false,
      isNegated: false,
    };
  }

  // 1. Check for Contextual Negations ("I am not suicidal")
  const isNegated = NEGATION_PATTERNS.some((pat) => pat.test(input));
  if (isNegated) {
    return {
      isCrisis: false,
      severity: 'emotional_support',
      category: 'general_emotional',
      recommendedAction: 'listen',
      deescalationScript:
        "I hear you, and thank you for being open with me. I'm here to listen to whatever is on your mind without any judgment.",
      isThirdParty: false,
      isPastEvent: false,
      isNegated: true,
    };
  }

  // 2. Check for Past Events ("3 years ago I had a suicide attempt")
  const isPastEvent = PAST_EVENT_PATTERNS.some((pat) => pat.test(input));
  if (isPastEvent) {
    return {
      isCrisis: false,
      severity: 'emotional_support',
      category: 'general_emotional',
      recommendedAction: 'listen',
      deescalationScript:
        "Thank you for sharing that part of your journey with me. Surviving difficult times takes immense strength. How are you feeling in your life today?",
      isThirdParty: false,
      isPastEvent: true,
      isNegated: false,
    };
  }

  // 3. Check for Third-Party Concerns ("My friend is talking about hurting themselves")
  const isThirdParty = THIRD_PARTY_PATTERNS.some((pat) => pat.test(input));
  if (isThirdParty) {
    const hasEmergencyKeywords = SUICIDAL_INTENT_PATTERNS.some((p) => p.test(input)) || OVERDOSE_PATTERNS.some((p) => p.test(input));
    if (hasEmergencyKeywords) {
      return {
        isCrisis: true,
        severity: 'urgent_care',
        category: 'third_party_concern',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "It is frightening when someone you care about is struggling. If they are in immediate danger, please contact local emergency services or a crisis helpline right now so trained responders can help them stay safe.",
        isThirdParty: true,
        isPastEvent: false,
        isNegated: false,
        suggestedResource: 'Crisis Helpline & Emergency Services',
      };
    }
  }

  // 4. Critical Layer: Medical Emergency (Chest pain, Stroke, Anaphylaxis, Severe Hemorrhage)
  for (const pattern of MEDICAL_EMERGENCY_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        category: 'medical_emergency',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "These symptoms may indicate a medical emergency requiring urgent clinical evaluation. Please stop any physical activity and call emergency medical services immediately using the button below.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Ambulance / Emergency',
      };
    }
  }

  // 5. Critical Layer: Overdose or Poisoning Ingestion
  for (const pattern of OVERDOSE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        category: 'overdose_poisoning',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "Taking a large or dangerous amount of substances requires immediate medical assistance. Please call emergency services or Poison Control right away. Do not wait for symptoms to worsen.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Emergency / Poison Control',
      };
    }
  }

  // 6. Critical Layer: Suicidal Intent
  for (const pattern of SUICIDAL_INTENT_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        category: 'suicidal_intent',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "I hear how overwhelming and painful this is right now. You do not have to carry this alone. Please reach out to someone who can keep you safe right now—I've opened the direct emergency lifeline buttons on your screen.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Connect with Crisis Helpline',
      };
    }
  }

  // 7. Critical Layer: Abuse, Physical Violence & Imminent Safety Threats
  for (const pattern of ABUSE_VIOLENCE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        category: 'abuse_violence',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "Your physical safety is the immediate priority. If you are in immediate danger, please dial emergency police services or reach out to a trusted helpline. You deserve to be in a secure place.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Police / Helpline',
      };
    }
  }

  // 8. Elevated Layer: Acute Self-Harm
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'urgent_care',
        category: 'self_harm',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "I hear that you are hurting deeply right now. Let's take a pause together. Your life and your body deserve care and protection. Please connect with a caring counselor who is trained to help you through this exact moment.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Text / Call Counselor',
      };
    }
  }

  // 9. Moderate Layer: Acute Panic & Hyperventilation
  for (const pattern of ACUTE_PANIC_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: false,
        severity: 'elevated_concern',
        category: 'panic_distress',
        recommendedAction: 'grounding',
        deescalationScript:
          "You are safe right now in this moment. Your nervous system is in high alert, but this intense wave will pass. Let's breathe together. Place one hand on your chest and follow the gentle rhythm.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Start Box Breathing',
      };
    }
  }

  // 10. Gentle Layer: General Emotional Distress
  for (const pattern of EMOTIONAL_DISTRESS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: false,
        severity: 'emotional_support',
        category: 'general_emotional',
        recommendedAction: 'listen',
        deescalationScript:
          "I hear how heavy things feel right now. It takes courage to put these feelings into words. Take a slow, gentle breath. What feels like the hardest part of today?",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
      };
    }
  }

  return {
    isCrisis: false,
    severity: 'none',
    category: 'none',
    recommendedAction: 'listen',
    deescalationScript: '',
    isThirdParty: false,
    isPastEvent: false,
    isNegated: false,
  };
}

/**
 * Triggers native dialer or SMS client for real-world emergency action.
 * Always prompts the device's native app, never placing a silent call.
 */
export async function triggerEmergencyAction(contact: EmergencyServiceContact): Promise<boolean> {
  try {
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
