import { parseMedicineLabel } from '../../src/domain/health/medicineLabel';

describe('medicine label', () => {
  it('finds the brand name and strength', () => {
    const g = parseMedicineLabel('DOLO 650\nParacetamol Tablets IP 650 mg\nMfd. by Micro Labs Ltd\nExp 04/2027');
    expect(g.name).toBe('Dolo 650');
    expect(g.strength).toBe('650 mg');
  });
  it('returns nothing when the text has no candidate', () => {
    expect(parseMedicineLabel('12/34\n--')).toEqual({ name: null, strength: null });
  });
});
