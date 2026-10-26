import {
  idleLine,
  repLine,
  secondsLine,
  setDoneLine,
  setIntroLine,
  gestureIntroSpeech,
  gestureTriggerSpeech,
  humanCoachingEncouragement,
} from '../../src/domain/pose/coachVoice';

test('rep lines: count, praise, halfway, last ones', () => {
  expect(repLine(1, 10, true)).toBe('1');
  expect(repLine(5, 10, true)).toBe('Halfway there.');
  expect(repLine(3, 12, true)).toBe('Good one.');
  expect(repLine(3, 12, false)).toBe('Breathe out as you move.');
  expect(repLine(8, 10, true)).toBe('2 to go.');
  expect(repLine(9, 10, true)).toBe('Last one.');
  expect(repLine(10, 10, true)).toBeNull();
});

test('timed lines only at a few moments', () => {
  expect(secondsLine(20, 30)).toBe('10 seconds left. Stay strong.');
  expect(secondsLine(25, 30)).toBe('Five more seconds.');
  expect(secondsLine(7, 30)).toBeNull();
});

test('set intro and set done are honest and short', () => {
  expect(setIntroLine('Squat', 1, 3, 10, 'reps', 'Chest up.')).toBe(
    'Set 1 of 3. Squat, 10 reps. Chest up.',
  );
  expect(setIntroLine('Plank', 1, 1, 30, 's')).toBe('Plank, 30 seconds.');
  expect(setDoneLine(10, 10, 'reps', 30, 0.9)).toBe('Set done. Great form. Rest 30 seconds.');
  expect(setDoneLine(6, 10, 'reps', 30, null)).toBe('Set done, 6 reps. Rest 30 seconds.');
  expect(idleLine('hold')).toMatch(/hold/);
});

test('gestureIntroSpeech and gestureTriggerSpeech provide natural human coaching feedback', () => {
  const intro = gestureIntroSpeech();
  expect(intro).toMatch(/hands-free/);
  expect(intro).toMatch(/six to ten feet/);

  // One hand video play/pause
  expect(gestureTriggerSpeech('one_hand', { videoPlaying: true })).toMatch(/Pausing/);
  expect(gestureTriggerSpeech('one_hand', { videoPlaying: false })).toMatch(/Resuming/);

  // Both hands finish set / skip rest
  expect(gestureTriggerSpeech('both_hands', { rest: true })).toMatch(/Skipping rest/);
  expect(gestureTriggerSpeech('both_hands', { rest: false })).toMatch(/Set completed/);

  // Cross arms pause
  expect(gestureTriggerSpeech('cross_arms')).toMatch(/Workout paused/);

  // Hands on hips rest
  expect(gestureTriggerSpeech('hands_on_hips')).toMatch(/thirty seconds/);

  // T-pose go back
  expect(gestureTriggerSpeech('t_pose', { itemIdx: 1 })).toMatch(/previous exercise/);
  expect(gestureTriggerSpeech('t_pose', { itemIdx: 0 })).toMatch(/first exercise/);

  // Trainer encouragement
  expect(humanCoachingEncouragement(8, 10)).toBe('Two more, stay strong!');
  expect(humanCoachingEncouragement(9, 10)).toBe('Final rep, finish with full control!');
  expect(humanCoachingEncouragement(5, 10)).toBe('Halfway point! Looking solid, keep that rhythm.');
});
