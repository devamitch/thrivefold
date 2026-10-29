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
 */
export function lookupMedicine(nameOrQuery: string): MedicineRecord | null {
  const q = nameOrQuery.toLowerCase().trim();
  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    if (
      key.includes(q) ||
      q.includes(key) ||
      record.name.toLowerCase().includes(q) ||
      (record.genericName && record.genericName.toLowerCase().includes(q))
    ) {
      return record;
    }
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
