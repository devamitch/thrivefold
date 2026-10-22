import {
  formatLocalDate,
  parseLocalDate,
  generateMonthGrid,
  generateDayAgenda,
  rescheduleCalendarEvent,
  toggleEventStatus,
} from '../../src/domain/calendar/universalCalendarEngine';

describe('Universal Calendar & Life Planner Engine', () => {
  describe('Local Date Formatting & Parsing (Timezone Resilience)', () => {
    it('formats dates consistently without UTC offset drift', () => {
      const date = new Date(2026, 9, 23); // Oct 23, 2026
      expect(formatLocalDate(date)).toBe('2026-10-23');
    });

    it('parses local date strings into local date objects correctly', () => {
      const parsed = parseLocalDate('2026-10-23');
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9); // 0-indexed October
      expect(parsed.getDate()).toBe(23);
    });

    it('handles leap years correctly (e.g., Feb 29, 2024 & Feb 29, 2028)', () => {
      const leapFeb2024 = new Date(2024, 1, 29);
      expect(formatLocalDate(leapFeb2024)).toBe('2024-02-29');

      const nonLeapFeb2025 = new Date(2025, 1, 28);
      expect(formatLocalDate(nonLeapFeb2025)).toBe('2025-02-28');
    });
  });

  describe('Endless Month Matrix Generation', () => {
    it('generates a complete 42-day calendar cell grid for any month', () => {
      const grid = generateMonthGrid(2026, 9); // October 2026
      expect(grid.length).toBe(42);

      // Verify that days in current month are marked correctly
      const octDays = grid.filter((c) => c.isCurrentMonth);
      expect(octDays.length).toBe(31);
    });

    it('supports distant dates across 1900 to 2200 without failure', () => {
      const grid1950 = generateMonthGrid(1950, 0); // Jan 1950
      expect(grid1950.length).toBe(42);

      const grid2150 = generateMonthGrid(2150, 5); // June 2150
      expect(grid2150.length).toBe(42);
    });
  });

  describe('Experience-Specific Agenda Segregation', () => {
    it("ensures Men's Health agenda contains zero menstrual or follicular cards", () => {
      const agenda = generateDayAgenda('2026-10-23', {
        experience: 'men_health',
      });

      expect(agenda.length).toBeGreaterThan(0);
      const hasMenstrual = agenda.some(
        (e) =>
          e.kind === 'period' ||
          e.kind === 'cycle_phase' ||
          e.category === 'reproductive' ||
          e.title.toLowerCase().includes('follicular') ||
          e.title.toLowerCase().includes('cycle')
      );
      expect(hasMenstrual).toBe(false);

      // Verify Men's specific items exist
      const hasMobility = agenda.some((e) => e.title.includes('Mobility'));
      const hasTraining = agenda.some((e) => e.title.includes('Recovery') || e.title.includes('Strength'));
      expect(hasMobility).toBe(true);
      expect(hasTraining).toBe(true);
    });

    it("includes cycle rhythm and predicted period windows for Women's Health", () => {
      const cycleData = {
        lastPeriodDate: '2026-10-01',
        cycleLengthDays: 28,
        periodLengthDays: 5,
        currentPhase: 'follicular' as const,
        estimatedNextPeriodDate: '2026-10-29',
      };

      const agenda = generateDayAgenda('2026-10-23', {
        experience: 'women_health',
        cycleData,
      });

      const hasCyclePhase = agenda.some((e) => e.kind === 'cycle_phase');
      expect(hasCyclePhase).toBe(true);
    });

    it('generates affirming self-care agenda for Pride Wellbeing', () => {
      const agenda = generateDayAgenda('2026-10-23', {
        experience: 'pride_wellbeing',
      });

      const hasGrounding = agenda.some((e) => e.title.includes('Grounding'));
      const hasVault = agenda.some((e) => e.title.includes('Vault Reflection'));
      expect(hasGrounding).toBe(true);
      expect(hasVault).toBe(true);
    });
  });

  describe('Event Status & Rescheduling Mechanics', () => {
    it('toggles completion status with timestamp', () => {
      const agenda = generateDayAgenda('2026-10-23', {
        experience: 'men_health',
      });
      const firstEvent = agenda[0];
      expect(firstEvent.status).toBe('predicted');

      const completed = toggleEventStatus(firstEvent);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();

      const reopened = toggleEventStatus(completed);
      expect(reopened.status).toBe('recorded');
      expect(reopened.completedAt).toBeUndefined();
    });

    it('records provenance when rescheduling an event', () => {
      const agenda = generateDayAgenda('2026-10-23', {
        experience: 'men_health',
      });
      const event = agenda[0];
      const rescheduled = rescheduleCalendarEvent(event, '2026-10-24', '09:00');

      expect(rescheduled.date).toBe('2026-10-24');
      expect(rescheduled.startTime).toBe('09:00');
      expect(rescheduled.metadata?.rescheduledFrom).toBe('2026-10-23');
      expect(rescheduled.metadata?.rescheduledAt).toBeDefined();
    });
  });
});
