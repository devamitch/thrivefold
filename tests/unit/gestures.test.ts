import { gestureIn, initialGestureState, stepGesture } from '../../src/domain/pose/gestures';
import { LM, type Landmark } from '../../src/domain/pose/movement';

const p = (x: number, y: number): Landmark => ({ x, y, z: 0, visibility: 0.95 });
function body(leftUp: boolean, rightUp: boolean): Landmark[] {
  const l = Array.from({ length: 33 }, () => p(0.5, 0.5));
  l[LM.nose] = p(0.5, 0.25);
  l[LM.leftShoulder] = p(0.42, 0.35);
  l[LM.rightShoulder] = p(0.58, 0.35);
  l[LM.leftWrist] = leftUp ? p(0.4, 0.1) : p(0.4, 0.6);
  l[LM.rightWrist] = rightUp ? p(0.6, 0.1) : p(0.6, 0.6);
  return l;
}

test('detects one or both hands above the head', () => {
  expect(gestureIn(body(false, false))).toBeNull();
  expect(gestureIn(body(true, false))).toBe('one_hand');
  expect(gestureIn(body(true, true))).toBe('both_hands');
});

test('fires once after the hold time, then needs a release', () => {
  let s = initialGestureState();
  let fired: string[] = [];
  for (let t = 0; t <= 2000; t += 100) {
    const r = stepGesture(s, body(true, false), t);
    s = r.state;
    if (r.fired) fired.push(r.fired);
  }
  expect(fired).toEqual(['one_hand']);
  s = stepGesture(s, body(false, false), 2100).state;
  fired = [];
  for (let t = 2200; t <= 3600; t += 100) {
    const r = stepGesture(s, body(true, true), t);
    s = r.state;
    if (r.fired) fired.push(r.fired);
  }
  expect(fired).toEqual(['both_hands']);
});

test('a brief raise does not fire', () => {
  let s = initialGestureState();
  let any = false;
  for (let t = 0; t <= 600; t += 100) {
    const r = stepGesture(s, body(true, false), t);
    s = r.state;
    any = any || Boolean(r.fired);
  }
  expect(any).toBe(false);
});
