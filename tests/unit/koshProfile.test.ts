import { EMPTY_KOSH, koshCompleteness, mergeKosh, splitList } from '../../src/domain/account/koshProfile';

describe('kosh profile', () => {
  it('splits and de-duplicates lists', () => {
    expect(splitList('Bengali, english ,, English\nHindi')).toEqual(['Bengali', 'english', 'Hindi']);
  });

  it('fills only empty fields from the server and never overwrites this phone', () => {
    const local = { ...EMPTY_KOSH, preferredName: 'Ami', languages: [] };
    const { merged, filled } = mergeKosh(local, { preferredName: 'Server', languages: ['bn'], allergies: ['peanut'] });
    expect(merged.preferredName).toBe('Ami');
    expect(merged.languages).toEqual(['bn']);
    expect(filled.sort()).toEqual(['allergies', 'languages']);
  });

  it('measures completeness', () => {
    expect(koshCompleteness(EMPTY_KOSH, 0)).toBe(0);
    expect(koshCompleteness({ ...EMPTY_KOSH, preferredName: 'A', phone: '+91 1', languages: ['bn'] }, 1)).toBe(50);
  });
});
