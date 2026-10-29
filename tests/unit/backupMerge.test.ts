import { mergeBackup } from '../../src/domain/privacy/backupMerge';

describe('mergeBackup', () => {
  it('fills empty fields and adds missing list items without overwriting', () => {
    const local = { heightCm: 180, weightKg: null, journal: [{ id: 'a', text: 'mine' }], xp: 5, setX: () => undefined };
    const backup = {
      heightCm: 170,
      weightKg: 72,
      journal: [
        { id: 'a', text: 'old copy' },
        { id: 'b', text: 'from backup' },
      ],
      xp: 900,
      setX: 'nope',
    };
    const { patch, changed } = mergeBackup(local, backup);
    expect(patch.heightCm).toBeUndefined();
    expect(patch.weightKg).toBe(72);
    expect(patch.journal).toEqual([
      { id: 'a', text: 'mine' },
      { id: 'b', text: 'from backup' },
    ]);
    expect(patch.xp).toBeUndefined();
    expect(patch.setX).toBeUndefined();
    expect(changed.sort()).toEqual(['journal', 'weightKg']);
  });
});
