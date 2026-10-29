jest.mock('../../modules/pose-landmarker/food', () => ({ resizeForUpload: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({}));
jest.mock('../../src/services/supabase/supabaseClient', () => ({ supabase: null }));

import { timeFromTiming } from '../../src/services/documents/docReader';

describe('prescription timing to reminder times', () => {
  it.each([
    ['1-0-1', null, ['08:00', '21:00']],
    ['1 - 1 - 1', null, ['08:00', '14:00', '21:00']],
    ['after breakfast', null, ['08:00']],
    ['at bedtime', null, ['21:00']],
    [null, 'BD', ['08:00', '21:00']],
    [null, 'TDS', ['08:00', '14:00', '21:00']],
    ['as needed', null, []],
  ])('%s %s', (timing, freq, out) => {
    expect(timeFromTiming(timing, freq)).toEqual(out);
  });
});
