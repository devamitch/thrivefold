import { parseMedicineLabel } from '../../src/domain/health/medicineLabel';
import { lookupMedicine } from '../../src/services/ai/medicineResearch';

describe('medicine label & lookup boundaries', () => {
  it('finds the brand name and strength', () => {
    const g = parseMedicineLabel('DOLO 650\nParacetamol Tablets IP 650 mg\nMfd. by Micro Labs Ltd\nExp 04/2027');
    expect(g.name).toBe('Dolo 650');
    expect(g.strength).toBe('650 mg');
  });
  it('returns nothing when the text has no candidate', () => {
    expect(parseMedicineLabel('12/34\n--')).toEqual({ name: null, strength: null });
  });

  it('prevents substring false positive matches (Defect D9)', () => {
    // "at" must never false-match atorvastatin
    expect(lookupMedicine('at')).toBeNull();
    expect(lookupMedicine('i am at the gym')).toBeNull();
    // "in" must never false-match amoxicillin
    expect(lookupMedicine('in')).toBeNull();
    expect(lookupMedicine('walking in the park')).toBeNull();
  });

  it('accurately resolves valid medication queries with boundary checks', () => {
    const p = lookupMedicine('Can I take paracetamol for fever?');
    expect(p).not.toBeNull();
    expect(p?.name).toBe('Paracetamol');

    const ib = lookupMedicine('ibuprofen');
    expect(ib).not.toBeNull();
    expect(ib?.name).toBe('Ibuprofen');
  });
});
