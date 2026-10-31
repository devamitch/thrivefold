import { format12Hour, parseRoutineRequest, parseTime, routineTimes, to24Hour } from '../../src/domain/routines';

describe('routines', () => {
  it('converts between 12-hour AM/PM and 24-hour formats', () => {
    expect(format12Hour('08:00')).toBe('8:00 AM');
    expect(format12Hour('18:30')).toBe('6:30 PM');
    expect(format12Hour('00:15')).toBe('12:15 AM');
    expect(format12Hour('12:00')).toBe('12:00 PM');
    expect(to24Hour(8, 0, 'AM')).toBe('08:00');
    expect(to24Hour(6, 30, 'PM')).toBe('18:30');
    expect(to24Hour(12, 15, 'AM')).toBe('00:15');
    expect(to24Hour(12, 0, 'PM')).toBe('12:00');
  });

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
