# Health Document, Prescription & Medicine Safety Architecture

Authoritative specification for medical boundaries, prescription analysis, and drug research in Thrivefold.

---

## 1. Ethical & Regulatory Non-Diagnostic Principles

1. **Not a Medical Device**: Thrivefold is a mindful wellness companion. It never diagnoses medical conditions, never prescribes drugs, and never calculates or modifies dosages.
2. **Prescription Authority**: The physician's written prescription and pharmacist's instructions remain the sole authoritative medical guidance.
3. **Preservation of Uncertainty**: Any OCR-extracted field that is partially obscured, handwritten, or ambiguous must be displayed with an explicit confirmation request.

---

## 2. Medicine Research Architecture (`src/services/ai/medicineResearch.ts`)

### 2.1 Extraction & Categorization
When analyzing medicine labels or prescription records:
- **Extracted Name**: Exact legible string recognized by OCR or input by user.
- **Generic / Class**: Matched against verified educational formulary records (e.g. Paracetamol $\rightarrow$ Acetaminophen).
- **Authoritative Citation**: Source publisher, reference URL, and verification date are attached to every summary.

### 2.2 Pharmacist Clarification Framework
Rather than giving diagnostic claims, Thrive Coach generates structured questions the patient should bring to their pharmacist, such as:
- *"Should I take this dose with meals or on an empty stomach?"*
- *"Can this interact with my other vitamins or supplements?"*
- *"What should I do if I accidentally miss a scheduled dose?"*

---

## 3. High-Risk & Crisis Escalation Pathways

If user input mentions self-harm, severe distress, or emergency symptoms:
1. **Immediate Intervention**: The assistant halts ordinary coaching and immediately displays the crisis response:
   - *Tele-MANAS*: 14416 (Toll-free, 24/7 mental health support in multiple languages).
   - *Emergency*: 112 (National emergency helpline).
2. **Automatic Navigation**: Direct route push to `/(app)/safety/urgent-support`.
3. **No Fabricated Advice**: Under no circumstance does the local model attempt to resolve a medical emergency autonomously.
