/**
 * Medicine and Prescription Educational Research Service.
 *
 * Safety Boundaries & Non-Diagnostic Architecture:
 * - Strict non-diagnostic role: Never prescribes, diagnoses, or alters dosages.
 * - Distinguishes between OCR extracted text, verified pharmacology records, and uncertain interpretation.
 * - Formulates plain-language educational summaries with source citations.
 * - Flags contraindication warning questions for pharmacist/clinician consultation.
 */

export interface MedicineRecord {
  id: string;
  name: string;
  genericName?: string;
  commonUses: string[];
  generalClass: string;
  cautionaryNotes: string[];
  questionsForPharmacist: string[];
  authoritativeSource: {
    publisher: string;
    referenceUrl?: string;
    lastVerifiedDate: string;
  };
}

export interface PrescriptionAnalysisResult {
  rawExtractedText?: string;
  detectedMedicines: {
    extractedName: string;
    matchedRecord?: MedicineRecord;
    confidence: number;
    extractedInstructions?: string;
    isUncertain: boolean;
  }[];
  educationalSummary: string;
  safetyNotice: string;
  disclaimer: string;
  timestamp: string;
}

/**
 * Built-in verified educational formulary knowledge index.
 * Grounded in publicly available OpenFDA & MedlinePlus educational guides.
 */
const VERIFIED_MEDICINE_CATALOG: Record<string, MedicineRecord> = {
  paracetamol: {
    id: 'med_paracetamol',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    commonUses: ['Mild to moderate pain relief', 'Fever reduction'],
    generalClass: 'Analgesic and antipyretic',
    cautionaryNotes: [
      'Do not exceed the daily limit recommended by your physician or on the packaging.',
      'Check other over-the-counter cold medicines to avoid accidental duplicate acetaminophen intake.',
    ],
    questionsForPharmacist: [
      'What is the maximum daily safe dose for my age and weight?',
      'Can I take this alongside my existing supplements or prescription medications?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a681004.html',
      lastVerifiedDate: '2026-01-15',
    },
  },
  ibuprofen: {
    id: 'med_ibuprofen',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    commonUses: ['Inflammation reduction', 'Headache, toothache, or muscle pain relief'],
    generalClass: 'Nonsteroidal anti-inflammatory drug (NSAID)',
    cautionaryNotes: [
      'Commonly recommended to be taken with food or milk to protect stomach lining.',
      'Consult a doctor before taking if you have a history of stomach ulcers, kidney concerns, or asthma.',
    ],
    questionsForPharmacist: [
      'Should I take this with meals?',
      'How many days in a row is it safe to take this before consulting my physician?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-02-10',
    },
  },
  metformin: {
    id: 'med_metformin',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    commonUses: ['Blood glucose management in type 2 diabetes support'],
    generalClass: 'Biguanide antihyperglycemic',
    cautionaryNotes: [
      'Take exactly at the times specified by your doctor, usually with meals.',
      'Avoid excessive alcohol consumption while taking this medication.',
    ],
    questionsForPharmacist: [
      'What should I do if I miss a scheduled dose?',
      'Are there specific foods or times of day optimal for this prescription?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a681005.html',
      lastVerifiedDate: '2026-01-20',
    },
  },
  amoxicillin: {
    id: 'med_amoxicillin',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    commonUses: ['Bacterial infection treatment'],
    generalClass: 'Penicillin-class antibiotic',
    cautionaryNotes: [
      'Complete the entire course prescribed by your doctor even if you feel better early.',
      'Do not take if you have a known allergy to penicillin or cephalosporin antibiotics.',
    ],
    questionsForPharmacist: [
      'Should I finish the full course even if my symptoms disappear?',
      'Can this interact with any oral contraceptives or other treatments?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-03-01',
    },
  },
  atorvastatin: {
    id: 'med_atorvastatin',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    commonUses: ['Lipid and cholesterol management'],
    generalClass: 'HMG-CoA reductase inhibitor (Statin)',
    cautionaryNotes: [
      'Commonly taken once daily, often in the evening.',
      'Avoid large quantities of grapefruit juice while on atorvastatin.',
    ],
    questionsForPharmacist: [
      'What time of day is recommended for my dose?',
      'Are there dietary interactions I should be mindful of?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a600045.html',
      lastVerifiedDate: '2026-01-30',
    },
  },
  cetirizine: {
    id: 'med_cetirizine',
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    commonUses: ['Seasonal allergies, hay fever, and allergic skin hives'],
    generalClass: 'Second-generation antihistamine',
    cautionaryNotes: [
      'May cause mild drowsiness in some individuals; observe how you react before driving.',
    ],
    questionsForPharmacist: [
      'Can I take this during the daytime without drowsiness?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-02-15',
    },
  },
};

/**
 * Searches the verified educational medicine catalog.
 * Defect D9 fix: Strict exact and word-boundary matching (\b) prevents false positives
 * (e.g. "at" matching atorvastatin, or "in" matching amoxicillin).
 */
export function lookupMedicine(nameOrQuery: string): MedicineRecord | null {
  const q = nameOrQuery.toLowerCase().trim();
  if (!q || q.length < 3) return null;

  // 1. Exact match on catalog key, brand name, or generic name
  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    if (
      key === q ||
      record.name.toLowerCase() === q ||
      (record.genericName && record.genericName.toLowerCase() === q)
    ) {
      return record;
    }
  }

  // 2. Word-boundary regex matching within user query
  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    const keyRegex = new RegExp(`\\b${key}\\b`, 'i');
    const nameRegex = new RegExp(`\\b${record.name}\\b`, 'i');
    const genRegex = record.genericName ? new RegExp(`\\b${record.genericName}\\b`, 'i') : null;

    if (keyRegex.test(q) || nameRegex.test(q) || (genRegex && genRegex.test(q))) {
      return record;
    }
  }

  return null;
}

/**
 * Fetches authoritative pharmacology evidence from official open APIs (OpenFDA / RxNav).
 * Used when an inquiry references an uncatalogued medicine, avoiding paid cloud calls
 * and preventing SLMs from hallucinating unverified dosages.
 */
export async function fetchAuthoritativeMedicineEvidence(drugName: string): Promise<MedicineRecord | null> {
  const cleanName = drugName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (!cleanName || cleanName.length < 3) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(cleanName)}+openfda.brand_name:${encodeURIComponent(cleanName)}&limit=1`;
    const response = await fetch(fdaUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const result = data.results?.[0];
      if (result) {
        const brand = result.openfda?.brand_name?.[0] || cleanName;
        const generic = result.openfda?.generic_name?.[0] || brand;
        const uses = result.purpose?.[0]
          ? [result.purpose[0].slice(0, 150)]
          : result.indications_and_usage?.[0]
            ? [result.indications_and_usage[0].slice(0, 150)]
            : ['Educational pharmacology reference'];
        const notes = result.warnings?.[0]
          ? [result.warnings[0].slice(0, 180)]
          : ['Verify exact directions with your prescribing clinician or pharmacist.'];

        return {
          id: `openfda_${cleanName}`,
          name: brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase(),
          genericName: generic.charAt(0).toUpperCase() + generic.slice(1).toLowerCase(),
          commonUses: uses,
          generalClass: result.openfda?.pharm_class_cs?.[0] || 'Pharmaceutical Agent',
          cautionaryNotes: notes,
          questionsForPharmacist: [
            'What is the recommended frequency and timing for this medication?',
            'Are there any known interactions with other supplements or foods?',
          ],
          authoritativeSource: {
            publisher: 'U.S. Food & Drug Administration (OpenFDA)',
            referenceUrl: 'https://open.fda.gov/apis/drug/label/',
            lastVerifiedDate: new Date().toISOString().split('T')[0],
          },
        };
      }
    }
  } catch {
    // Network unavailable or timeout; fall back to safe non-diagnostic boundary
  }

  return null;
}

/**
 * Analyzes prescription text extracted via OCR or user transcription with medical boundaries.
 */
export function analyzePrescriptionText(extractedText: string): PrescriptionAnalysisResult {
  const text = extractedText.toLowerCase();
  const detected: PrescriptionAnalysisResult['detectedMedicines'] = [];

  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    if (text.includes(key) || text.includes(record.name.toLowerCase())) {
      detected.push({
        extractedName: record.name,
        matchedRecord: record,
        confidence: 0.95,
        isUncertain: false,
      });
    }
  }

  // If no known matches found in catalog, flag as uncertain extraction
  if (detected.length === 0) {
    detected.push({
      extractedName: extractedText.slice(0, 40).trim(),
      confidence: 0.35,
      isUncertain: true,
    });
  }

  const educationalSummary = detected
    .filter((d) => d.matchedRecord)
    .map(
      (d) =>
        `• ${d.matchedRecord!.name} (${d.matchedRecord!.genericName || d.matchedRecord!.generalClass}): Commonly prescribed for ${d.matchedRecord!.commonUses.join(', ')}. Source: ${d.matchedRecord!.authoritativeSource.publisher}.`
    )
    .join('\n');

  return {
    rawExtractedText: extractedText,
    detectedMedicines: detected,
    educationalSummary:
      educationalSummary ||
      'No familiar medication names could be identified with high confidence from the text.',
    safetyNotice:
      'Always verify exact doses, timing, and brand names directly with your licensed pharmacist or prescribing physician before taking any medication.',
    disclaimer:
      'Thrivefold is an educational wellbeing application, not a medical device or pharmacy. We do not provide clinical diagnosis or dosage recommendations.',
    timestamp: new Date().toISOString(),
  };
}
