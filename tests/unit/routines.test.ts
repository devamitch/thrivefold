import { parseRoutineRequest, parseTime, routineTimes } from '../../src/domain/routines';

describe('routines', () => {
  it('parses times', () => {
    expect(parseTime('7pm')).toBe('19:00');
    expect(parseTime('7.30 am')).toBe('07:30');
    expect(parseTime('12am')).toBe('00:00');
    expect(parseTime('25')).toBeNull();
  });
  it('expands every-N-hours routines', () => {
    expect(routineTimes({ time: '09:00', everyHours: 3, until: '18:00' })).toEqual(['09:00', '12:00', '15:00', '18:00']);
  });
  it('understands reminder requests', () => {
    expect(parseRoutineRequest('remind me to stretch at 6pm every weekday')).toMatchObject({ kind: 'stretch', time: '18:00', days: [1, 2, 3, 4, 5] });
    expect(parseRoutineRequest('remind me to drink water every 2 hours')).toMatchObject({ kind: 'water', everyHours: 2 });
    expect(parseRoutineRequest('remind me to call mom at 8:15 pm')).toMatchObject({ kind: 'custom', title: 'Call mom', time: '20:15' });
    expect(parseRoutineRequest('how do I sleep better')).toBeNull();
  });
});
