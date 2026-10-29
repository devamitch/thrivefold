import { describeObjects } from '../../src/domain/assist/objects';
import { importantSound } from '../../src/domain/assist/sounds';

jest.mock('../../modules/pose-landmarker/tools', () => ({ MediaPipeTools: null }));

describe('assist', () => {
  it('maps YAMNet labels to alerts above a confidence floor', () => {
    expect(importantSound('Smoke detector, smoke alarm', 0.6)).toBe('Alarm');
    expect(importantSound('Baby cry, infant cry', 0.5)).toBe('Baby crying');
    expect(importantSound('Speech', 0.9)).toBeNull();
    expect(importantSound('Siren', 0.1)).toBeNull();
  });

  it('describes detected objects with where they are', () => {
    expect(
      describeObjects([
        { label: 'cup', score: 0.8, box: [0.1, 0.4, 0.2, 0.6] },
        { label: 'chair', score: 0.7, box: [0.7, 0.3, 0.9, 0.9] },
        { label: 'chair', score: 0.6, box: [0.75, 0.3, 0.95, 0.9] },
      ]),
    ).toBe('I see a cup on the left and 2 chairs on the right.');
    expect(describeObjects([])).toMatch(/can't make out/);
  });
});
