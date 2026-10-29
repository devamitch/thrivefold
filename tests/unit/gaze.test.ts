import {
  buildCalibration,
  directionOf,
  eyePursuitDirection,
  fromBlendshapes,
  headMoved,
  median,
  normalize,
  pursuitDirectionH,
  pursuitDirectionOrbit,
} from '../../src/domain/vision/gaze';

const blend = (o: Partial<Record<string, number>>) => ({
  eyeLookInLeft: 0, eyeLookOutLeft: 0, eyeLookUpLeft: 0, eyeLookDownLeft: 0,
  eyeLookInRight: 0, eyeLookOutRight: 0, eyeLookUpRight: 0, eyeLookDownRight: 0, ...o,
}) as Record<string, number>;

describe('gaze (ported from BlinkQuest)', () => {
  it('reads looking right from blendshapes', () => {
    expect(fromBlendshapes(blend({ eyeLookOutRight: 0.6, eyeLookInLeft: 0.6 }))!.x).toBeCloseTo(0.6);
    expect(fromBlendshapes(blend({ eyeLookUpLeft: 0.4, eyeLookUpRight: 0.4 }))!.y).toBeCloseTo(-0.4);
    expect(fromBlendshapes({})).toBeNull();
  });

  const cal = () => {
    const r = buildCalibration(
      { center: { x: 0, y: 0 }, left: { x: -0.3, y: 0 }, right: { x: 0.3, y: 0 }, up: { x: 0, y: -0.2 }, down: { x: 0, y: 0.2 } },
      'blendshapes',
      { yaw: 0, pitch: 0 },
    );
    if (!r.ok) throw new Error('calibration failed');
    return r.calibration;
  };

  it('normalises to the calibrated reach and finds directions', () => {
    const c = cal();
    expect(normalize({ x: 0.3, y: 0 }, c).nx).toBeCloseTo(1);
    expect(directionOf({ x: 0.2, y: 0 }, c)).toBe('right');
    expect(directionOf({ x: -0.2, y: 0.02 }, c)).toBe('left');
    expect(directionOf({ x: 0, y: 0.15 }, c)).toBe('down');
    expect(directionOf({ x: 0.05, y: 0 }, c)).toBe('center');
  });

  it('refuses a calibration without real left/right eye movement', () => {
    const r = buildCalibration(
      { center: { x: 0, y: 0 }, left: { x: -0.01, y: 0 }, right: { x: 0.3, y: 0 }, up: { x: 0, y: -0.2 }, down: { x: 0, y: 0.2 } },
      'blendshapes',
      { yaw: null, pitch: null },
    );
    expect(r).toEqual({ ok: false, weak: ['left'] });
  });

  it('flags head turns', () => {
    const c = cal();
    expect(headMoved({ x: 0, y: 0, source: 'blendshapes', headYawDeg: 20, headPitchDeg: 0, at: 0 }, c)).toBe(true);
    expect(headMoved({ x: 0, y: 0, source: 'blendshapes', headYawDeg: 3, headPitchDeg: 2, at: 0 }, c)).toBe(false);
  });

  it('takes medians', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  describe('pursuit direction helpers for coach voice', () => {
    it('determines horizontal slider chase pursuit direction', () => {
      // 4-second period: 0..1 moving right, 1..3 moving left, 3..4 moving right
      expect(pursuitDirectionH(0)).toBe('right');
      expect(pursuitDirectionH(0.5)).toBe('right');
      expect(pursuitDirectionH(1.0)).toBe('left');
      expect(pursuitDirectionH(2.0)).toBe('left');
      expect(pursuitDirectionH(2.9)).toBe('left');
      expect(pursuitDirectionH(3.0)).toBe('right');
      expect(pursuitDirectionH(3.8)).toBe('right');
      expect(pursuitDirectionH(4.0)).toBe('right');
      expect(pursuitDirectionH(5.0)).toBe('left');
    });

    it('determines orbit follow circular pursuit direction', () => {
      // 6-second period: 0..1.5 down, 1.5..3.0 left, 3.0..4.5 up, 4.5..6.0 right
      expect(pursuitDirectionOrbit(0)).toBe('down');
      expect(pursuitDirectionOrbit(1.0)).toBe('down');
      expect(pursuitDirectionOrbit(1.5)).toBe('left');
      expect(pursuitDirectionOrbit(2.5)).toBe('left');
      expect(pursuitDirectionOrbit(3.0)).toBe('up');
      expect(pursuitDirectionOrbit(4.0)).toBe('up');
      expect(pursuitDirectionOrbit(4.5)).toBe('right');
      expect(pursuitDirectionOrbit(5.5)).toBe('right');
      expect(pursuitDirectionOrbit(6.0)).toBe('down');
    });

    it('determines eye pursuit dot glide direction', () => {
      // 6000ms period: 0..1500 moving right, 1500..4500 moving left, 4500..6000 moving right
      expect(eyePursuitDirection(0)).toBe('right');
      expect(eyePursuitDirection(1000)).toBe('right');
      expect(eyePursuitDirection(1500)).toBe('left');
      expect(eyePursuitDirection(3000)).toBe('left');
      expect(eyePursuitDirection(4499)).toBe('left');
      expect(eyePursuitDirection(4500)).toBe('right');
      expect(eyePursuitDirection(5500)).toBe('right');
      expect(eyePursuitDirection(6000)).toBe('right');
      expect(eyePursuitDirection(7500)).toBe('left');
    });
  });
});
