import { migrateRootState, ROOT_STORE_VERSION } from '../../src/stores/migrateRootState';

describe('root store migration', () => {
  it('turns crash reporting off for settings saved before consent was opt-in', () => {
    const migrated = migrateRootState({ crashReports: true, xp: 12 }, 4);

    expect(migrated.crashReports).toBe(false);
    expect(migrated.xp).toBe(12);
  });

  it('preserves the choice for stores already on the current version', () => {
    const migrated = migrateRootState({ crashReports: true }, ROOT_STORE_VERSION);

    expect(migrated.crashReports).toBe(true);
  });
});
