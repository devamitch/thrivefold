/**
 * Verified Offline Emergency Services Directory
 *
 * Provides country-specific, verified emergency contact numbers across:
 * - General emergency dispatch (Police, Fire, Ambulance)
 * - Mental health & suicide crisis lifelines
 * - Poison control & tox emergency
 * - Domestic violence & personal safety
 * - Child protection
 *
 * Adheres strictly to Thrivefold Safety Laws:
 * - Zero fabricated numbers
 * - Official public health & emergency authority verified
 * - Works 100% offline without network connectivity
 * - Clear jurisdiction awareness
 */

export type EmergencyCategory =
  | 'general_emergency'
  | 'ambulance'
  | 'police'
  | 'fire'
  | 'mental_health_crisis'
  | 'suicide_prevention'
  | 'poison_control'
  | 'domestic_violence'
  | 'child_protection'
  | 'medical_consult';

export interface EmergencyServiceContact {
  id: string;
  countryCode: string;
  countryName: string;
  name: string;
  category: EmergencyCategory;
  number: string;
  actionUrl: string;
  type: 'tel' | 'sms' | 'web';
  hours: string;
  languages: string[];
  coverage: string;
  officialSource: string;
  lastVerified: string;
  isPrimaryEmergency?: boolean;
  isPrimaryMentalHealth?: boolean;
}

export interface SupportedCountryMeta {
  code: string;
  name: string;
  flag: string;
  defaultEmergency: string;
  defaultMentalHealth: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountryMeta[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', defaultEmergency: '112', defaultMentalHealth: '14416' },
  { code: 'US', name: 'United States', flag: '🇺🇸', defaultEmergency: '911', defaultMentalHealth: '988' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', defaultEmergency: '999', defaultMentalHealth: '116 123' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', defaultEmergency: '911', defaultMentalHealth: '988' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', defaultEmergency: '000', defaultMentalHealth: '13 11 14' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', defaultEmergency: '111', defaultMentalHealth: '1737' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺', defaultEmergency: '112', defaultMentalHealth: '116 123' },
  { code: 'GLOBAL', name: 'International', flag: '🌐', defaultEmergency: '112', defaultMentalHealth: 'befrienders.org' },
];

export const VERIFIED_EMERGENCY_DIRECTORY: Record<string, EmergencyServiceContact[]> = {
  IN: [
    {
      id: 'in_112',
      countryCode: 'IN',
      countryName: 'India',
      name: 'All-in-One Emergency Helpline (National Emergency Response)',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7',
      languages: ['Hindi', 'English', 'Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Ministry of Home Affairs (MHA), Government of India (https://112.gov.in)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'in_108',
      countryCode: 'IN',
      countryName: 'India',
      name: 'National Emergency Ambulance Service',
      category: 'ambulance',
      number: '108',
      actionUrl: 'tel:108',
      type: 'tel',
      hours: '24/7',
      languages: ['Hindi', 'English', 'State Regional Languages'],
      coverage: 'Pan-India (23+ States & UTs)',
      officialSource: 'National Health Mission (NHM), MoHFW',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_tele_manas',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Tele-MANAS National Mental Health Helpline',
      category: 'mental_health_crisis',
      number: '14416',
      actionUrl: 'tel:14416',
      type: 'tel',
      hours: '24/7 Toll-Free & Confidential',
      languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Odia', 'Assamese'],
      coverage: 'Pan-India (Operated by NIMHANS Bangalore)',
      officialSource: 'Ministry of Health and Family Welfare (https://telemanas.mohfw.gov.in)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'in_kiran',
      countryCode: 'IN',
      countryName: 'India',
      name: 'KIRAN Mental Health Rehabilitation Helpline',
      category: 'mental_health_crisis',
      number: '1800-599-0019',
      actionUrl: 'tel:18005990019',
      type: 'tel',
      hours: '24/7 Toll-Free',
      languages: ['Hindi', 'English', '13 Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Department of Empowerment of Persons with Disabilities (DEPwD), MoSJE',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_poison',
      countryCode: 'IN',
      countryName: 'India',
      name: 'National Poisons Information Centre (AIIMS New Delhi)',
      category: 'poison_control',
      number: '1800-116-117',
      actionUrl: 'tel:1800116117',
      type: 'tel',
      hours: '24/7 Toll-Free Poison Emergency',
      languages: ['Hindi', 'English'],
      coverage: 'Pan-India',
      officialSource: 'All India Institute of Medical Sciences (AIIMS) Department of Pharmacology',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_women_1091',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Women in Distress Helpline',
      category: 'domestic_violence',
      number: '1091',
      actionUrl: 'tel:1091',
      type: 'tel',
      hours: '24/7 Emergency Police Response',
      languages: ['Hindi', 'English', 'Regional'],
      coverage: 'Pan-India',
      officialSource: 'National Commission for Women (NCW)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_childline_1098',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Childline Emergency Helpline',
      category: 'child_protection',
      number: '1098',
      actionUrl: 'tel:1098',
      type: 'tel',
      hours: '24/7 Toll-Free',
      languages: ['Hindi', 'English', 'Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Ministry of Women and Child Development (MoWCD)',
      lastVerified: '2026-10-31',
    },
  ],

  US: [
    {
      id: 'us_911',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Emergency Services (Police, Fire, EMS)',
      category: 'general_emergency',
      number: '911',
      actionUrl: 'tel:911',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Spanish', 'Language Line translation (240+ languages)'],
      coverage: 'United States nationwide',
      officialSource: 'Federal Communications Commission (FCC) (https://www.fcc.gov)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'us_988',
      countryCode: 'US',
      countryName: 'United States',
      name: '988 Suicide & Crisis Lifeline',
      category: 'mental_health_crisis',
      number: '988',
      actionUrl: 'tel:988',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Spanish', 'ASL via video phone', 'Translation in 240+ languages'],
      coverage: 'United States nationwide',
      officialSource: 'Substance Abuse and Mental Health Services Administration (SAMHSA) (https://988lifeline.org)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'us_text_741741',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Crisis Text Line',
      category: 'mental_health_crisis',
      number: 'Text HOME to 741741',
      actionUrl: 'sms:741741?body=HOME',
      type: 'sms',
      hours: '24/7 Free Text Support',
      languages: ['English', 'Spanish'],
      coverage: 'United States nationwide',
      officialSource: 'Crisis Text Line (https://www.crisistextline.org)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'us_poison',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Poison Help Center',
      category: 'poison_control',
      number: '1-800-222-1222',
      actionUrl: 'tel:18002221222',
      type: 'tel',
      hours: '24/7 Free, Confidential, Expert Medical Help',
      languages: ['English', 'Spanish', 'Translation in 160+ languages'],
      coverage: 'United States nationwide',
      officialSource: "America's Poison Centers (https://www.poisonhelp.org)",
      lastVerified: '2026-10-31',
    },
    {
      id: 'us_the_hotline',
      countryCode: 'US',
      countryName: 'United States',
      name: 'National Domestic Violence Hotline',
      category: 'domestic_violence',
      number: '1-800-799-7233',
      actionUrl: 'tel:18007997233',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Spanish', '200+ languages via translation'],
      coverage: 'United States nationwide',
      officialSource: 'The National Domestic Violence Hotline (https://www.thehotline.org)',
      lastVerified: '2026-10-31',
    },
  ],

  GB: [
    {
      id: 'gb_999',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Emergency Services (Police, Ambulance, Fire, Coastguard)',
      category: 'general_emergency',
      number: '999',
      actionUrl: 'tel:999',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Welsh', 'LanguageLine translation'],
      coverage: 'United Kingdom (England, Scotland, Wales, Northern Ireland)',
      officialSource: 'UK Government & Emergency Services',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'gb_samaritans',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Samaritans Crisis Helpline',
      category: 'mental_health_crisis',
      number: '116 123',
      actionUrl: 'tel:116123',
      type: 'tel',
      hours: '24/7 Free Call from any phone',
      languages: ['English', 'Welsh'],
      coverage: 'United Kingdom and Republic of Ireland',
      officialSource: 'Samaritans UK (https://www.samaritans.org)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'gb_nhs_111',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'NHS 111 Urgent Medical Advice',
      category: 'medical_consult',
      number: '111',
      actionUrl: 'tel:111',
      type: 'tel',
      hours: '24/7 Free Urgent Care Advice',
      languages: ['English', 'Translation available'],
      coverage: 'England, Scotland, Wales, Northern Ireland',
      officialSource: 'National Health Service (NHS) (https://111.nhs.uk)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'gb_shout',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Shout Crisis Text Line',
      category: 'mental_health_crisis',
      number: 'Text SHOUT to 85258',
      actionUrl: 'sms:85258?body=SHOUT',
      type: 'sms',
      hours: '24/7 Free & Confidential Text',
      languages: ['English'],
      coverage: 'United Kingdom nationwide',
      officialSource: 'Mental Health Innovations (https://giveusashout.org)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'gb_refuge',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'National Domestic Abuse Helpline (Refuge)',
      category: 'domestic_violence',
      number: '0808 2000 247',
      actionUrl: 'tel:08082000247',
      type: 'tel',
      hours: '24/7 Freephone',
      languages: ['English', 'Translation in 170+ languages'],
      coverage: 'United Kingdom',
      officialSource: 'Refuge UK (https://www.nationaldahelpline.org.uk)',
      lastVerified: '2026-10-31',
    },
  ],

  CA: [
    {
      id: 'ca_911',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Emergency Services (Police, Fire, Ambulance)',
      category: 'general_emergency',
      number: '911',
      actionUrl: 'tel:911',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'French', 'Translation services'],
      coverage: 'Canada nationwide',
      officialSource: 'Public Safety Canada',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'ca_988',
      countryCode: 'CA',
      countryName: 'Canada',
      name: '988 Suicide Crisis Helpline Canada',
      category: 'mental_health_crisis',
      number: '988',
      actionUrl: 'tel:988',
      type: 'tel',
      hours: '24/7 Toll-Free & Confidential (Call or Text)',
      languages: ['English', 'French'],
      coverage: 'Canada nationwide',
      officialSource: 'Public Health Agency of Canada & CAMH (https://988.ca)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'ca_kids_help',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Kids Help Phone (Youth & Young Adults)',
      category: 'child_protection',
      number: '1-800-668-6868',
      actionUrl: 'tel:18006686868',
      type: 'tel',
      hours: '24/7 Bilingual Support',
      languages: ['English', 'French'],
      coverage: 'Canada nationwide',
      officialSource: 'Kids Help Phone Canada (https://kidshelpphone.ca)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'ca_poison',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Ontario Poison Centre / Canada Poison Helpline',
      category: 'poison_control',
      number: '1-800-268-9017',
      actionUrl: 'tel:18002689017',
      type: 'tel',
      hours: '24/7 Medical Toxicologist Emergency',
      languages: ['English', 'French'],
      coverage: 'Canada',
      officialSource: 'Canadian Association of Poison Control Centres (https://www.ontariopoisoncentre.ca)',
      lastVerified: '2026-10-31',
    },
  ],

  AU: [
    {
      id: 'au_000',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Triple Zero (000) Emergency Services',
      category: 'general_emergency',
      number: '000',
      actionUrl: 'tel:000',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Translating and Interpreting Service (TIS)'],
      coverage: 'Australia nationwide',
      officialSource: 'Australian Government Department of Home Affairs (https://www.triplezero.gov.au)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'au_lifeline',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Lifeline Australia Crisis Support',
      category: 'mental_health_crisis',
      number: '13 11 14',
      actionUrl: 'tel:131114',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Interpreting via 131 450'],
      coverage: 'Australia nationwide',
      officialSource: 'Lifeline Australia (https://www.lifeline.org.au)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'au_beyond_blue',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Beyond Blue Mental Health Support',
      category: 'mental_health_crisis',
      number: '1300 22 4636',
      actionUrl: 'tel:1300224636',
      type: 'tel',
      hours: '24/7 Immediate Mental Health Talk',
      languages: ['English'],
      coverage: 'Australia nationwide',
      officialSource: 'Beyond Blue (https://www.beyondblue.org.au)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'au_poisons',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Poisons Information Centre',
      category: 'poison_control',
      number: '13 11 26',
      actionUrl: 'tel:131126',
      type: 'tel',
      hours: '24/7 Emergency Poison Advice',
      languages: ['English'],
      coverage: 'Australia nationwide',
      officialSource: 'Australian Poisons Information Centres',
      lastVerified: '2026-10-31',
    },
    {
      id: 'au_respect',
      countryCode: 'AU',
      countryName: 'Australia',
      name: '1800RESPECT Domestic Violence Helpline',
      category: 'domestic_violence',
      number: '1800 737 732',
      actionUrl: 'tel:1800737732',
      type: 'tel',
      hours: '24/7 Free National Sexual Assault, Family & Domestic Violence Service',
      languages: ['English', 'Interpreting via 131 450'],
      coverage: 'Australia nationwide',
      officialSource: '1800RESPECT (https://www.1800respect.org.au)',
      lastVerified: '2026-10-31',
    },
  ],

  NZ: [
    {
      id: 'nz_111',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: '111 Emergency Services',
      category: 'general_emergency',
      number: '111',
      actionUrl: 'tel:111',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Māori', 'Language Line translation'],
      coverage: 'New Zealand nationwide',
      officialSource: 'New Zealand Police & Emergency Services (https://www.police.govt.nz/111)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'nz_1737',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: '1737 Need to Talk?',
      category: 'mental_health_crisis',
      number: '1737',
      actionUrl: 'tel:1737',
      type: 'tel',
      hours: '24/7 Free Call or Text',
      languages: ['English', 'Māori'],
      coverage: 'New Zealand nationwide',
      officialSource: 'Health New Zealand Te Whatu Ora (https://1737.org.nz)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'nz_poisons',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: 'National Poisons Centre',
      category: 'poison_control',
      number: '0800 764 766',
      actionUrl: 'tel:0800764766',
      type: 'tel',
      hours: '24/7 Urgent Poison Advice',
      languages: ['English'],
      coverage: 'New Zealand nationwide',
      officialSource: 'University of Otago National Poisons Centre (https://poisons.co.nz)',
      lastVerified: '2026-10-31',
    },
  ],

  EU: [
    {
      id: 'eu_112',
      countryCode: 'EU',
      countryName: 'European Union',
      name: 'European Universal Emergency Number',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7 Free Across All 27 EU Member States',
      languages: ['National Languages of each EU state', 'English'],
      coverage: 'All 27 EU Member States & EEA',
      officialSource: 'European Commission (https://digital-strategy.ec.europa.eu/en/policies/112)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'eu_116123',
      countryCode: 'EU',
      countryName: 'European Union',
      name: 'Emotional Support Helpline (European Harmonised Number)',
      category: 'mental_health_crisis',
      number: '116 123',
      actionUrl: 'tel:116123',
      type: 'tel',
      hours: '24/7 Free Emotional Support',
      languages: ['Local EU languages'],
      coverage: 'Available across most European Union states',
      officialSource: 'European Commission Harmonised Services of Social Value (116 helpline)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
  ],

  GLOBAL: [
    {
      id: 'global_112',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Universal GSM Emergency Number',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7 (Routes to local emergency dispatch on GSM networks worldwide)',
      languages: ['Local languages'],
      coverage: 'Global GSM mobile standard (works in >150 countries)',
      officialSource: 'International Telecommunication Union (ITU)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'global_befrienders',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Befrienders Worldwide Crisis Directory',
      category: 'mental_health_crisis',
      number: 'befrienders.org',
      actionUrl: 'https://www.befrienders.org',
      type: 'web',
      hours: 'Directory of 340+ Emotional Support Centres in 32 Countries',
      languages: ['English', 'Spanish', 'French', 'Multi-language'],
      coverage: 'International',
      officialSource: 'Befrienders Worldwide Volunteer Network',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'global_findahelpline',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Find A Helpline Global Directory',
      category: 'mental_health_crisis',
      number: 'findahelpline.com',
      actionUrl: 'https://findahelpline.com',
      type: 'web',
      hours: 'Free, confidential crisis support search across 130+ countries',
      languages: ['Multi-lingual search'],
      coverage: 'Worldwide',
      officialSource: 'ThroughLine / Find A Helpline',
      lastVerified: '2026-10-31',
    },
  ],
};

/**
 * Returns emergency contacts for a given country code, falling back to international defaults if unknown.
 */
export function getEmergencyContactsForCountry(countryCode?: string | null): EmergencyServiceContact[] {
  const code = (countryCode || 'IN').toUpperCase().trim();
  if (code in VERIFIED_EMERGENCY_DIRECTORY) {
    return VERIFIED_EMERGENCY_DIRECTORY[code];
  }
  return VERIFIED_EMERGENCY_DIRECTORY.GLOBAL;
}

/**
 * Returns the primary emergency dispatch number (e.g. 112, 911, 999, 000) for a given country.
 */
export function getPrimaryEmergencyContact(countryCode?: string | null): EmergencyServiceContact {
  const list = getEmergencyContactsForCountry(countryCode);
  return list.find((c) => c.isPrimaryEmergency) || list[0];
}

/**
 * Returns the primary mental health crisis contact (e.g. 14416, 988, 116 123) for a given country.
 */
export function getPrimaryMentalHealthContact(countryCode?: string | null): EmergencyServiceContact {
  const list = getEmergencyContactsForCountry(countryCode);
  return list.find((c) => c.isPrimaryMentalHealth) || list[0];
}

/**
 * Returns metadata of all supported countries with icons and flags.
 */
export function getSupportedCountries(): SupportedCountryMeta[] {
  return SUPPORTED_COUNTRIES;
}
